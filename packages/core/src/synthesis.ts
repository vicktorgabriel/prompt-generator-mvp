import type {
  BuildPromptContext,
  DomainType,
  GenerationProfile,
  IntentType,
  RequestSynthesis,
  UserPreferences,
  PromptStrategy,
} from "../../shared-types/src/index.js";

interface SynthesisInput {
  originalInput: string;
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  strategy: PromptStrategy;
  generationProfile: GenerationProfile;
  projectReferences: string[];
  assumptions: string[];
  preferences: UserPreferences;
}

function has(text: string, regex: RegExp): boolean {
  return regex.test(text);
}

function uniq(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function pushIf(list: string[], condition: boolean, value: string): void {
  if (condition) list.push(value);
}

function resolvePreferredStack(input: SynthesisInput): string[] {
  const text = input.normalizedInput;
  const stack: string[] = [];

  pushIf(stack, has(text, /\bdjango\b/), "Django");
  pushIf(stack, has(text, /\breact\b|\bnext\b|\btsx\b|\bjsx\b/), "React");
  pushIf(stack, has(text, /\btailwind\b/), "Tailwind CSS");
  pushIf(stack, has(text, /\btypescript\b|\bts\b|\btsx\b/), "TypeScript");
  pushIf(stack, has(text, /\bpython\b/), "Python");
  pushIf(stack, has(text, /\bapi\b|\brest\b|\bjwt\b/), "API REST");
  pushIf(stack, has(text, /\bhtml\b/), "HTML");
  pushIf(stack, has(text, /\bcss\b/), "CSS");
  pushIf(stack, has(text, /\bjavascript\b|\bjs\b/), "JavaScript");

  if (input.generationProfile === "modern_modular_landing") {
    pushIf(stack, !stack.includes("React"), "React");
    pushIf(stack, !stack.includes("Tailwind CSS"), "Tailwind CSS");
    pushIf(stack, !stack.includes("TypeScript"), "TypeScript");
  }

  if (input.domain === "django" && !stack.includes("Django")) {
    stack.unshift("Django");
  }

  if (input.domain === "react" && !stack.includes("React")) {
    stack.unshift("React");
  }

  return uniq(stack).slice(0, 6);
}

function resolveRequestedActions(input: SynthesisInput): string[] {
  const text = input.normalizedInput;
  const actions: string[] = [];

  pushIf(actions, has(text, /\brevis\w+|\baudita\w+/), "inspeccionar la base real antes de tocar la solución");
  pushIf(actions, has(text, /\bcorrig\w+|\barregl\w+|\bajust\w+/), "corregir problemas concretos de implementación, layout o interacción");
  pushIf(actions, has(text, /\bmigr\w+|\bconvert\w+|\badapt\w+/), "adaptar o migrar la estructura actual sin reescribir todo desde cero");
  pushIf(actions, has(text, /\bconect\w+|\bintegr\w+|\bunific\w+/), "conectar módulos, tabs o capas que hoy están separadas");
  pushIf(actions, has(text, /\blogin\b|\bauth\w+|\bautentic\w+/), "incorporar autenticación y control de acceso donde corresponda");
  pushIf(actions, has(text, /\bdisen\w+|\bstyle\w+|\bestilos\b|\bui\b|\bux\b/), "elevar la calidad visual manteniendo coherencia y criterio técnico");
  pushIf(actions, has(text, /\bmodular\w+|\bcomponent\w+|\bseccion\w+/), "separar la solución en módulos o componentes reutilizables");
  pushIf(actions, has(text, /\boptim\w+|\bperformance\b/), "dejar una base más limpia, mantenible y optimizada");

  if (input.strategy === "migrate_existing_system") {
    actions.unshift("mapear la estructura actual contra la fuente de verdad de datos o API antes de implementar cambios");
  }

  if (input.generationProfile === "modern_modular_landing") {
    actions.unshift("organizar la landing por secciones y componentes desacoplados listos para escalar");
  }

  if (actions.length === 0) {
    actions.push("resolver el pedido con una propuesta técnica clara y accionable");
  }

  return uniq(actions).slice(0, 6);
}

function resolveDeliverables(input: SynthesisInput): string[] {
  const text = input.normalizedInput;
  const deliverables: string[] = [];

  pushIf(deliverables, has(text, /\blogin\b|\bauth\w+|\bautentic\w+/), "flujo de autenticación con acceso restringido donde corresponda");
  pushIf(deliverables, has(text, /\bpanel\b|\badmin\b/), "panel administrativo o área operativa alineada con el sistema real");
  pushIf(deliverables, has(text, /\btabs?\b/), "tabs o secciones conectadas y coherentes con la navegación existente");
  pushIf(deliverables, has(text, /\btablas?\b|\bmodelos?\b|\bbase de datos\b|\bapi\b/), "mapeo de datos o modelos basado en la estructura real de referencia");
  pushIf(deliverables, has(text, /\blanding\b|\bhero\b|\bcta\b|\bnavbar\b|\bfooter\b/), "landing modular con secciones bien separadas y componentes reutilizables");
  pushIf(deliverables, has(text, /\bboton\w+|\bhover\b|\bestilos\b|\bspacing\b/), "mejoras visuales concretas sobre botones, spacing y estados interactivos");
  pushIf(deliverables, has(text, /\bresponsive\b/), "comportamiento responsive y consistente en distintos tamaños");
  pushIf(deliverables, input.preferences.includeFileStructure, "estructura de archivos o módulos recomendada");

  if (input.strategy === "migrate_existing_system") {
    deliverables.unshift("diagnóstico, plan de migración e implementación incremental archivo por archivo");
  }

  if (deliverables.length === 0) {
    deliverables.push("implementación o plan técnico listo para ejecutar");
  }

  return uniq(deliverables).slice(0, 6);
}

function resolveConstraints(input: SynthesisInput): string[] {
  const text = input.normalizedInput;
  const constraints: string[] = [];

  pushIf(constraints, has(text, /mant(en|e)\w+|consisten\w+|coherenc\w+/), "mantener consistencia con la base visual o estructural existente");
  pushIf(constraints, has(text, /sin romper|sin rehacer|sin destruir|no rehagas/), "evitar reescrituras innecesarias o cambios destructivos");
  pushIf(constraints, has(text, /\bmodular\w+/), "priorizar modularidad real y no una estructura monolítica");
  pushIf(constraints, has(text, /\bresponsive\b/), "cuidar responsive, legibilidad y adaptación a distintos tamaños");
  pushIf(constraints, has(text, /\btipad\w+|\btypescript\b/), "mantener tipos claros y contratos explícitos cuando el stack lo permita");

  if (input.strategy === "migrate_existing_system") {
    constraints.unshift("trabajar sobre evidencia real: proyecto existente, repo, carpetas y fuente de datos antes de inventar módulos");
  }

  if (input.generationProfile === "modern_modular_landing") {
    constraints.unshift("usar una estética moderna, redondeada y profesional, evitando una landing plana o genérica");
  }

  return uniq(constraints).slice(0, 6);
}

function resolveQualityTargets(input: SynthesisInput): string[] {
  const targets: string[] = [];

  pushIf(targets, true, "respuesta accionable y poco genérica");
  pushIf(targets, input.preferences.detailLevel !== "low", "criterio técnico explícito detrás de cada decisión importante");
  pushIf(targets, input.preferences.outputStyle === "step_by_step", "plan secuencial con prioridades claras");
  pushIf(targets, input.preferences.outputStyle === "technical", "énfasis en arquitectura, contratos y tradeoffs");
  pushIf(targets, input.generationProfile === "modern_modular_landing", "modularidad alta, diseño moderno y componentes reutilizables");
  pushIf(targets, input.strategy === "migrate_existing_system", "inspección previa, mapeo fiel y migración incremental");
  pushIf(targets, input.strategy === "ui_fix_existing", "mejoras visuales concretas sin perder la identidad existente");

  return uniq(targets).slice(0, 6);
}

function resolveWorkMode(input: SynthesisInput): string {
  switch (input.strategy) {
    case "migrate_existing_system":
      return "auditoría + mapeo + migración incremental";
    case "inspect_and_adapt":
      return "inspección primero, adaptación después";
    case "ui_fix_existing":
      return "cirugía puntual sobre una UI ya existente";
    case "implement_new":
      return "implementación nueva con estructura lista para crecer";
    default:
      return "resolución técnica guiada por intención y contexto";
  }
}

function resolveEvidenceMode(input: SynthesisInput): string {
  if (input.strategy === "migrate_existing_system" || input.strategy === "inspect_and_adapt" || input.strategy === "ui_fix_existing") {
    return "basarse en evidencia del proyecto existente antes de asumir estructura";
  }

  if (input.generationProfile === "modern_modular_landing") {
    return "usar convenciones modernas de frontend para cerrar vacíos sin volver genérica la solución";
  }

  return "usar el pedido, señales detectadas y buenas prácticas del dominio";
}

function resolveSummary(input: SynthesisInput): string {
  if (input.strategy === "migrate_existing_system") {
    return "El pedido apunta a transformar una plataforma existente sin rehacerla completa, integrando autenticación, panel y persistencia sobre una fuente de datos real ya definida.";
  }

  if (input.strategy === "inspect_and_adapt") {
    return "El pedido parece orientado a revisar un proyecto real, detectar qué partes sirven y aplicar cambios concretos sobre la base existente.";
  }

  if (input.strategy === "ui_fix_existing") {
    return "La consigna prioriza corregir desajustes visuales o funcionales en una interfaz existente sin destruir la identidad que ya tiene.";
  }

  if (input.generationProfile === "modern_modular_landing") {
    return "El pedido busca una landing moderna y profesional, pensada como sistema modular y no como un bloque estático difícil de escalar.";
  }

  if (input.intent === "architecture_design") {
    return "La consigna necesita una respuesta más estratégica que operativa, con foco en estructura, responsabilidades y evolución.";
  }

  return "El pedido necesita una respuesta técnica concreta, con más criterio que relleno y con una salida reutilizable para otra IA o para implementación directa.";
}

function resolvePrimaryGoal(input: SynthesisInput): string {
  if (input.generationProfile === "modern_modular_landing") {
    return "obtener una base de landing moderna, modular, redondeada y lista para escalar con React, Tailwind CSS y TypeScript";
  }

  if (input.strategy === "migrate_existing_system") {
    return "migrar y conectar un sistema existente respetando la estructura real del proyecto y la fuente de verdad de datos";
  }

  if (input.strategy === "inspect_and_adapt") {
    return "inspeccionar primero lo que existe y adaptar solo lo necesario con cambios concretos y verificables";
  }

  if (input.strategy === "ui_fix_existing") {
    return "corregir una UI real con foco en layout, botones, estados y consistencia visual";
  }

  if (input.intent === "debugging") {
    return "aislar la causa del problema y proponer una corrección verificable";
  }

  return "resolver el pedido con una salida técnica clara, específica y reutilizable";
}

export function synthesizeRequest(input: SynthesisInput): RequestSynthesis {
  return {
    summary: resolveSummary(input),
    primaryGoal: resolvePrimaryGoal(input),
    workMode: resolveWorkMode(input),
    evidenceMode: resolveEvidenceMode(input),
    requestedActions: resolveRequestedActions(input),
    requestedDeliverables: resolveDeliverables(input),
    preferredStack: resolvePreferredStack(input),
    constraints: resolveConstraints(input),
    qualityTargets: resolveQualityTargets(input),
  };
}
