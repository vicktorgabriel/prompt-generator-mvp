import type {
  ClarificationAnalysis,
  ClarificationQuestion,
  DomainType,
  GenerationProfile,
  IntentType,
  PromptStrategy,
} from "../../shared-types/src/index.js";

interface ClarificationInput {
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  strategy: PromptStrategy;
  generationProfile: GenerationProfile;
  projectReferences: string[];
}

function countWords(input: string): number {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function pushQuestion(list: ClarificationQuestion[], id: string, label: string, reason: string): void {
  if (list.some((question) => question.id === id)) {
    return;
  }

  list.push({ id, label, reason });
}

export function analyzeClarification(input: ClarificationInput): ClarificationAnalysis {
  const text = input.normalizedInput.toLowerCase();
  const questions: ClarificationQuestion[] = [];
  const assumptions: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (countWords(text) <= 4) {
    score += 2;
    pushQuestion(
      questions,
      "expand_scope",
      "¿Podés describir un poco más el objetivo principal?",
      "La consigna es demasiado corta y puede interpretarse de varias formas.",
    );
  }

  if (input.domain === "general") {
    score += 2;
    pushQuestion(
      questions,
      "choose_stack",
      "¿Qué stack o tecnología querés usar?",
      "No se detectó una tecnología principal.",
    );
    suggestions.push("Aclarar stack principal: Django, React, HTML/CSS/JS, PyQt, Python, etc.");
  }

  if (text.includes("panel") && !/(web|escritorio|desktop|movil|mobile)/.test(text)) {
    score += 1;
    pushQuestion(
      questions,
      "panel_platform",
      "¿Ese panel es para web, escritorio o móvil?",
      "La palabra “panel” sola no define la plataforma.",
    );
  }

  if (
    (input.intent === "ui_design" || input.intent === "ui_fix") &&
    !/(web|desktop|escritorio|movil|mobile)/.test(text) &&
    input.domain === "general"
  ) {
    score += 1;
    pushQuestion(
      questions,
      "ui_target",
      "¿La interfaz es para web, escritorio o móvil?",
      "El diseño visual cambia bastante según la plataforma.",
    );
  }

  if (input.strategy === "migrate_existing_system") {
    assumptions.push(
      "Se asume que hay que migrar o adaptar un proyecto existente usando la estructura real del repo y no crear una plataforma genérica desde cero.",
    );
    assumptions.push(
      "Se asume que las tablas, modelos o contratos definidos en la API/proyecto de referencia deben tratarse como fuente de verdad antes de tocar la base de datos o los tabs.",
    );

    if (input.projectReferences.length === 0) {
      score += 1;
      pushQuestion(
        questions,
        "project_names",
        "¿Cuáles son los nombres exactos de la carpeta, repo o API de referencia?",
        "Tener nombres exactos mejora el prompt de migración y evita inventar estructuras.",
      );
      suggestions.push("Aclarar nombres reales de carpeta, repo y API si querés que el prompt los use de forma explícita.");
    }

    if (!/(tablas|modelos|schema|esquema|base de datos|api)/.test(text)) {
      score += 1;
      pushQuestion(
        questions,
        "data_source",
        "¿Cuál es la fuente de verdad para la estructura de datos: tablas SQL, modelos de API o ambos?",
        "Hace falta saber de dónde debe leer el esquema real.",
      );
    }

    suggestions.push("Indicar si querés solo plan de migración o implementación completa archivo por archivo.");
  }

  if (input.intent === "review_existing_project") {
    assumptions.push("Se asume que existe un proyecto real que debe revisarse y modificarse, no diseñarse desde cero.");

    if (!/(django|react|html|css|javascript|js|ts|tsx|jsx)/.test(text) && input.domain === "frontend") {
      score += 1;
      pushQuestion(
        questions,
        "project_stack",
        "¿Esa landing está hecha con Django templates, React o HTML/CSS/JS?",
        "El stack ayuda a orientar mejor la implementación sin impedir una primera propuesta.",
      );
      suggestions.push("Aclarar si la landing usa Django templates, React o HTML/CSS/JS puro.");
    }

    if (!/(implement|aplica|cambia|corrige|agrega|modifica|migra|convierte|conecta)/.test(text)) {
      suggestions.push("Podés indicar si querés solo auditoría, propuesta de cambios o implementación directa.");
    }
  }

  if (input.intent === "ui_fix") {
    assumptions.push("Se asume que querés corregir una UI existente manteniendo el estilo general.");
  }

  if (input.generationProfile === "modern_modular_landing") {
    assumptions.push(
      "Si no se especifica otro stack, se prioriza una landing altamente modular construida con React, Tailwind CSS y TypeScript.",
    );
    assumptions.push(
      "La landing debe organizarse por secciones reutilizables, componentes pequeños, estilos consistentes y buena adaptabilidad responsive.",
    );

    if (!/(hero|cta|pricing|faq|testimonios|features|navbar|footer)/.test(text)) {
      suggestions.push("Podés indicar qué secciones querés: hero, features, testimonials, pricing, FAQ, CTA, footer, etc.");
    }

    if (!/(tailwind|typescript|react|tsx)/.test(text)) {
      suggestions.push("Si querés fijar el stack, podés aclarar explícitamente React + Tailwind CSS + TypeScript.");
    }
  }

  if (text.includes("admin") && !/(nativo|personalizado|custom)/.test(text) && input.domain === "django") {
    score += 1;
    pushQuestion(
      questions,
      "admin_type",
      "¿Querés usar el admin nativo de Django o un panel administrativo personalizado?",
      "Eso cambia mucho el prompt técnico y la estructura final.",
    );
  }

  if (input.intent === "automation_agent" && !/(python|typescript|node|mcp)/.test(text)) {
    score += 1;
    pushQuestion(
      questions,
      "agent_runtime",
      "¿Con qué lenguaje o runtime querés construir el agente?",
      "Los patrones de implementación cambian según el entorno.",
    );
  }

  if (input.domain === "django") {
    assumptions.push("Se asume una solución web basada en Django.");
  }
  if (input.domain === "react") {
    assumptions.push("Se asume una solución frontend moderna basada en React.");
  }
  if (input.domain === "frontend") {
    assumptions.push("Se asume foco en frontend, estilos, layout e interacción visual.");
  }
  if (input.domain === "web_app") {
    assumptions.push("Se asume una aplicación o landing web, no una app de escritorio.");
  }
  if (input.domain === "trading") {
    assumptions.push("Se asume un contexto operativo de trading y monitoreo.");
  }
  if (input.domain === "general" && assumptions.length === 0) {
    assumptions.push("Se asume un enfoque agnóstico hasta que definas el stack.");
  }

  let ambiguityLevel: ClarificationAnalysis["ambiguityLevel"] = "low";
  if (score >= 4 || questions.length >= 3) {
    ambiguityLevel = "high";
  } else if (score >= 2 || questions.length >= 1) {
    ambiguityLevel = "medium";
  }

  return {
    ambiguityLevel,
    needsClarification: ambiguityLevel === "high",
    questions,
    assumptions,
    suggestedNextInputs: suggestions,
  };
}
