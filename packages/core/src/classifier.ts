import type {
  ClassificationConfidence,
  ClassificationResult,
  DomainType,
  IntentType,
} from "../../shared-types/src/index.js";

interface AnalysisContext {
  raw: string;
  normalized: string;
  tokens: string[];
  uniqueTokens: Set<string>;
}

const STOP_REFERENCES = new Set([
  "ubicado",
  "dentro",
  "donde",
  "sobre",
  "para",
  "desde",
  "hacia",
  "segun",
  "según",
  "proyecto",
  "repo",
  "repositorio",
  "carpeta",
  "archivo",
  "tab",
  "tabs",
]);

function normalizeForAnalysis(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s./_\-"']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildContext(input: string): AnalysisContext {
  const normalized = normalizeForAnalysis(input);
  const tokens = normalized.match(/[a-z0-9]+/g) ?? [];

  return {
    raw: input,
    normalized,
    tokens,
    uniqueTokens: new Set(tokens),
  };
}

function hasWord(ctx: AnalysisContext, word: string): boolean {
  return ctx.uniqueTokens.has(normalizeForAnalysis(word));
}

function extractStackSignals(ctx: AnalysisContext): { fromStack: string | null; toStack: string | null } {
  const raw = ctx.raw.toLowerCase();
  
  const migrations: Array<[RegExp, string]> = [
    [/(?:monolito|monolith).*?(?:microservices|micro-?services|distributed)/i, "monolith→distributed"],
    [/(?:microservices|micro-?services).*?(?:monolito|monolith)/i, "monolith→distributed"],
    [/rails.*?(?:node|nodejs|nest|express)/i, "rails→node"],
    [/(?:node|nodejs|nest|express).*?rails/i, "rails→node"],
    [/django.*?(?:fastapi|flask)/i, "django→fastapi"],
    [/(?:fastapi|flask).*?django/i, "django→fastapi"],
  ];

  for (const [pattern, signal] of migrations) {
    if (pattern.test(raw)) {
      const [from, to] = signal.split("→");
      return { fromStack: from, toStack: to };
    }
  }
  return { fromStack: null, toStack: null };
}

function hasMigrationPattern(ctx: AnalysisContext): boolean {
  const raw = ctx.raw.toLowerCase();
  const migrationPhrases = [
    "migrar", "migración", "migration", "convertir", "transformar",
    "refactorizar", "descomponer", "microservices", "micro services", "distributed",
    "desacoplar", "estrangular", "strangler", "sacar del monolito", 
  ];
  const migrationWords = ["monolito", "monolith", "acoplado", "tightly", "legacy"];
  const hasPhrase = migrationPhrases.some(p => raw.includes(p));
  const hasWord = migrationWords.some(w => raw.includes(w));
  return hasPhrase || (hasWord && migrationPhrases.some(p => raw.includes(p.split(" ")[0])));
}

function hasAnyWord(ctx: AnalysisContext, words: string[]): boolean {
  return words.some((word) => hasWord(ctx, word));
}

function hasPhrase(ctx: AnalysisContext, phrase: string): boolean {
  const escaped = normalizeForAnalysis(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
  return regex.test(ctx.normalized);
}

function hasAnyPhrase(ctx: AnalysisContext, phrases: string[]): boolean {
  return phrases.some((phrase) => hasPhrase(ctx, phrase));
}

function tokenStartsWithAny(ctx: AnalysisContext, stems: string[]): boolean {
  return ctx.tokens.some((token) => stems.some((stem) => token.startsWith(stem)));
}

function addScore<T extends string>(
  scores: Map<T, number>,
  key: T,
  amount: number,
  reasons: Map<T, string[]>,
  reason: string,
): void {
  scores.set(key, (scores.get(key) ?? 0) + amount);
  const current = reasons.get(key) ?? [];
  if (!current.includes(reason)) {
    current.push(reason);
  }
  reasons.set(key, current);
}

function selectWinner<T extends string>(
  scores: Map<T, number>,
  reasons: Map<T, string[]>,
  fallback: T,
  priority: T[],
): { winner: T; score: number; reasons: string[]; runnerUpScore: number } {
  const entries = Array.from(scores.entries());
  if (entries.length === 0) {
    return { winner: fallback, score: 0, reasons: [], runnerUpScore: 0 };
  }

  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return priority.indexOf(a[0]) - priority.indexOf(b[0]);
  });

  const [winner, score] = entries[0];
  const runnerUpScore = entries[1]?.[1] ?? 0;
  return {
    winner,
    score,
    reasons: reasons.get(winner) ?? [],
    runnerUpScore,
  };
}

function resolveConfidence(topScore: number, runnerUpScore: number): ClassificationConfidence {
  const gap = topScore - runnerUpScore;

  if (topScore >= 8 && gap >= 3) return "high";
  if (topScore >= 4 && gap >= 1) return "medium";
  return "low";
}

function extractProjectReferences(ctx: AnalysisContext): string[] {
  const refs = new Set<string>();

  const quoted = ctx.raw.match(/["']([^"']{2,80})["']/g) ?? [];
  for (const chunk of quoted) {
    const value = chunk.slice(1, -1).trim();
    const normalized = normalizeForAnalysis(value);
    if (value.length >= 2 && !STOP_REFERENCES.has(normalized)) {
      refs.add(value);
    }
  }

  const resourceLikeTokens = ctx.raw.match(/\b[a-zA-Z0-9]+(?:[-_/][a-zA-Z0-9]+)+\b/g) ?? [];
  for (const token of resourceLikeTokens) {
    const normalized = normalizeForAnalysis(token);
    if (!STOP_REFERENCES.has(normalized)) {
      refs.add(token);
    }
  }

  return Array.from(refs).slice(0, 8);
}

function detectIntent(ctx: AnalysisContext): {
  intent: IntentType;
  confidence: ClassificationConfidence;
  reasons: string[];
} {
  const scores = new Map<IntentType, number>();
  const reasons = new Map<IntentType, string[]>();

  const stackSignals = extractStackSignals(ctx);
  const migrationPattern = hasMigrationPattern(ctx);
  const projectContext =
    hasAnyWord(ctx, [
      "repo",
      "repositorio",
      "carpeta",
      "proyecto",
      "codigo",
      "base",
      "tabs",
      "tab",
      "api",
      "tablas",
      "modelos",
      "existente",
      "existentes",
      "actual",
    ]) || extractProjectReferences(ctx).length > 0;

  if (migrationPattern && stackSignals.fromStack) {
    addScore(scores, "architecture_design", 10, reasons, `detecta migración de ${stackSignals.fromStack} a ${stackSignals.toStack}`);
  } else if (migrationPattern && projectContext && !tokenStartsWithAny(ctx, ["refactor", "reorganiz", "limpi"])) {
    addScore(scores, "architecture_design", 8, reasons, "detecta patrón de migración/refactorización con proyecto existente");
  } else if (migrationPattern) {
    addScore(scores, "architecture_design", 6, reasons, "menciona términos de migración o arquitectura");
  }

  const uiSurfaceSignals =
    hasAnyWord(ctx, [
      "landing",
      "hero",
      "navbar",
      "header",
      "footer",
      "boton",
      "botones",
      "card",
      "cards",
      "contenedor",
      "contenedores",
      "layout",
      "spacing",
      "hover",
      "bordes",
      "estilos",
      "estilo",
      "diseno",
      "ui",
      "ux",
      "responsive",
      "cta",
      "tailwind",
      "typescript",
    ]) || hasAnyPhrase(ctx, ["border radius", "border-radius"]);

  const fixActionSignals =
    tokenStartsWithAny(ctx, ["revis", "corrig", "arregl", "ajust", "mejor", "implement", "agreg", "adapt", "tune"]) ||
    hasAnyPhrase(ctx, ["no funcionan", "fuera de lugar", "salidos del lugar"]);

  const migrationSignals =
    tokenStartsWithAny(ctx, ["migr", "convert", "adapt", "conect", "integr", "unific"]) ||
    hasAnyPhrase(ctx, ["convertir a django", "pasar a django", "conecta el resto", "segun la creacion"]);

  const existingDataSignals =
    hasAnyWord(ctx, ["api", "tablas", "tabla", "modelos", "modelo", "schema", "esquema", "base", "datos"]) ||
    hasAnyPhrase(ctx, ["base de datos", "fuente de verdad", "segun las tablas"]);

  const strongCodeTerms =
    hasAnyWord(ctx, [
      "api",
      "endpoint",
      "backend",
      "frontend",
      "django",
      "react",
      "pyqt",
      "python",
      "jwt",
      "rest",
      "login",
      "tailwind",
      "typescript",
      "tsx",
      "componentes",
      "component",
    ]) || hasAnyPhrase(ctx, ["full stack", "fullstack", "django rest"]);

  if (tokenStartsWithAny(ctx, ["debug", "fall", "romp", "traceback"]) || hasWord(ctx, "error")) {
    addScore(scores, "debugging", 7, reasons, "menciona errores o debugging");
  }

  if (tokenStartsWithAny(ctx, ["refactor", "reorganiz", "limpi"]) || hasAnyPhrase(ctx, ["mejora estructura", "limpia el codigo"])) {
    addScore(scores, "refactor", 6, reasons, "menciona refactorización o limpieza estructural");
  }

  if (hasAnyWord(ctx, ["arquitectura", "modular", "modulos", "escalable"]) || hasAnyPhrase(ctx, ["plan tecnico", "estructura del sistema"])) {
    addScore(scores, "architecture_design", 6, reasons, "pide arquitectura o estructura escalable");
  }

  if (hasAnyWord(ctx, ["agente", "mcp", "workflow", "orquestador"]) || hasAnyPhrase(ctx, ["tool calling"])) {
    addScore(scores, "automation_agent", 7, reasons, "menciona agentes, MCP u orquestación");
  }

  if (tokenStartsWithAny(ctx, ["document", "manual"]) || hasAnyWord(ctx, ["readme", "guia"])) {
    addScore(scores, "documentation", 6, reasons, "pide documentación o guía");
  }

  if (projectContext && (uiSurfaceSignals || fixActionSignals || migrationSignals || existingDataSignals)) {
    addScore(scores, "review_existing_project", 9, reasons, "habla de un proyecto existente que debe revisarse o adaptarse");
  }

  if (projectContext && tokenStartsWithAny(ctx, ["refactor", "reorganiz", "limpi"])) {
    addScore(scores, "review_existing_project", 9, reasons, "pide refactorizar o reorganizar archivos de un proyecto existente");
  }

  if (projectContext && migrationSignals && existingDataSignals) {
    addScore(scores, "review_existing_project", 3, reasons, "menciona migración/adaptación apoyada en estructura o tablas ya existentes");
  }

  if (uiSurfaceSignals && fixActionSignals) {
    addScore(scores, "ui_fix", 7, reasons, "describe correcciones visuales o de interacción sobre una UI existente");
  }

  if (hasAnyWord(ctx, ["ui", "ux", "interfaz", "dashboard", "pantalla", "landing", "header", "layout", "hero"]) && !strongCodeTerms) {
    addScore(scores, "ui_design", 4, reasons, "menciona diseño de interfaz o layout");
  }

  if (
    hasAnyWord(ctx, ["copy", "marketing", "publicidad", "anuncio", "post", "correo", "ventas"]) &&
    !strongCodeTerms &&
    !projectContext
  ) {
    addScore(scores, "business_content", 4, reasons, "parece una solicitud de contenido comercial");
  }

  if (strongCodeTerms) {
    addScore(scores, "code_generation", 5, reasons, "menciona stack técnico o generación de código");
  }

  if (strongCodeTerms && uiSurfaceSignals && !projectContext) {
    addScore(scores, "code_generation", 3, reasons, "combina stack técnico con una UI/landing nueva orientada a implementación");
  }

  if (scores.size === 0) {
    addScore(scores, "code_generation", 1, reasons, "se usa fallback de generación general");
  }

  const selected = selectWinner(scores, reasons, "code_generation", [
    "review_existing_project",
    "ui_fix",
    "debugging",
    "refactor",
    "architecture_design",
    "automation_agent",
    "documentation",
    "code_generation",
    "ui_design",
    "business_content",
  ]);

  return {
    intent: selected.winner,
    confidence: resolveConfidence(selected.score, selected.runnerUpScore),
    reasons: selected.reasons,
  };
}

function detectDomain(ctx: AnalysisContext): {
  domain: DomainType;
  confidence: ClassificationConfidence;
  reasons: string[];
} {
  const scores = new Map<DomainType, number>();
  const reasons = new Map<DomainType, string[]>();

  const projectContext = hasAnyWord(ctx, ["repo", "repositorio", "carpeta", "proyecto", "tabs", "tab", "api"]);
  const landingSignals = hasAnyWord(ctx, [
    "landing",
    "hero",
    "navbar",
    "header",
    "footer",
    "cta",
    "responsive",
    "tailwind",
    "typescript",
    "secciones",
    "section",
    "cards",
    "componentes",
  ]);

  const stackSignals = extractStackSignals(ctx);
  if (stackSignals.fromStack === "monolith" || stackSignals.toStack === "distributed") {
    addScore(scores, "architecture", 10, reasons, "detecta migración a arquitectura distribuida/microservices");
  } else if (stackSignals.fromStack === "rails" || stackSignals.toStack?.includes("node")) {
    addScore(scores, "architecture", 9, reasons, "detecta migración de Rails a Node/JS");
  } else if (stackSignals.fromStack === "django" || stackSignals.toStack === "fastapi") {
    addScore(scores, "backend", 8, reasons, "detecta migración de Django a FastAPI/Flask");
  }

  if (hasWord(ctx, "django") || hasAnyPhrase(ctx, ["django rest", "django templates", "admin de django"])) {
    addScore(scores, "django", 9, reasons, "menciona Django o su ecosistema");
  }

  if (hasWord(ctx, "react") || hasAnyWord(ctx, ["nextjs", "next", "jsx", "tsx"])) {
    addScore(scores, "react", 8, reasons, "menciona React/Next o archivos JSX/TSX");
  }

  if (hasAnyWord(ctx, ["tailwind", "typescript"]) && landingSignals) {
    addScore(scores, "react", 4, reasons, "landing moderna con Tailwind/TypeScript apunta a stack React/TS");
  }

  if (hasAnyWord(ctx, ["pyqt", "qt", "pyside"])) {
    addScore(scores, "pyqt", 8, reasons, "menciona PyQt/Qt/PySide");
  }

  if (hasAnyWord(ctx, ["api", "endpoint", "jwt", "rest", "backend"])) {
    addScore(scores, "api", 6, reasons, "menciona API, JWT, REST o backend");
  }

  if (hasAnyWord(ctx, ["trading", "exchange", "autoscan", "pnl"]) || hasWord(ctx, "bot") || hasAnyWord(ctx, ["senal", "senales"])) {
    addScore(scores, "trading", 8, reasons, "menciona trading, exchange o señales");
  }

  if (hasAnyWord(ctx, ["landing", "hero", "navbar", "header", "footer", "boton", "botones", "hover", "css", "html", "frontend", "estilo", "estilos"])) {
    addScore(scores, "frontend", 7, reasons, "menciona elementos propios de frontend/web visual");
  }

  if (hasAnyWord(ctx, ["web", "sitio", "landing", "frontend", "backend", "pagina", "tabs", "panel", "templates"]) || projectContext) {
    addScore(scores, "web_app", 5, reasons, "apunta a un proyecto web existente o una página/sitio");
  }

  if (hasAnyWord(ctx, ["escritorio", "desktop", "local", "locales", "archivos", "filesystem", "mcp"])) {
    addScore(scores, "desktop_app", 6, reasons, "menciona entorno de escritorio/local, archivos locales o MCP");
  }

  if (hasAnyWord(ctx, ["python", "fastapi", "flask"])) {
    addScore(scores, "python", 5, reasons, "menciona Python o frameworks Python");
  }

  if (scores.size === 0) {
    addScore(scores, "general", 1, reasons, "no se detectó un dominio claro");
  }

  const selected = selectWinner(scores, reasons, "general", [
    "architecture",
    "devops",
    "backend",
    "django",
    "react",
    "pyqt",
    "frontend",
    "web_app",
    "api",
    "desktop_app",
    "python",
    "trading",
    "general",
  ]);

  return {
    domain: selected.winner,
    confidence: resolveConfidence(selected.score, selected.runnerUpScore),
    reasons: selected.reasons,
  };
}

function extractKeywords(ctx: AnalysisContext): string[] {
  const candidates = [
    "django",
    "react",
    "tailwind",
    "typescript",
    "pyqt",
    "python",
    "api",
    "jwt",
    "dashboard",
    "trading",
    "login",
    "panel",
    "admin",
    "arquitectura",
    "refactor",
    "landing",
    "hero",
    "header",
    "navbar",
    "botones",
    "repo",
    "carpeta",
    "frontend",
    "estilos",
    "tabs",
    "tablas",
    "migrar",
    "adaptar",
    "responsive",
    "modular",
  ];

  return candidates.filter((keyword) => hasWord(ctx, keyword) || hasPhrase(ctx, keyword));
}

export function classifyInput(normalizedInput: string): ClassificationResult {
  const ctx = buildContext(normalizedInput);
  const intentInfo = detectIntent(ctx);
  const domainInfo = detectDomain(ctx);
  const projectReferences = extractProjectReferences(ctx);

  const confidenceOrder: Record<ClassificationConfidence, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const confidence =
    confidenceOrder[intentInfo.confidence] <= confidenceOrder[domainInfo.confidence]
      ? intentInfo.confidence
      : domainInfo.confidence;

  return {
    intent: intentInfo.intent,
    domain: domainInfo.domain,
    normalizedInput,
    keywords: extractKeywords(ctx),
    confidence,
    matchedSignals: [...intentInfo.reasons, ...domainInfo.reasons],
    projectReferences,
  };
}
