import type {
  BuildPromptContext,
  GeneratedPrompt,
  GenerationProfile,
  IntentType,
  PromptStrategy,
} from "../../shared-types/src/index.js";

function lines(items: string[], prefix = "- "): string {
  return items.map((item) => `${prefix}${item}`).join("\n");
}

function numbered(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function resolveRole(intent: IntentType, profile: GenerationProfile, domain: string): string {
  if (profile === "modern_modular_landing") {
    return "Actúa como un frontend lead con criterio de producto, especializado en landings modernas, sistemas de UI modulares y ejecución con React, Tailwind CSS y TypeScript.";
  }

  switch (intent) {
    case "review_existing_project":
      return `Actúa como un senior engineer que audita proyectos reales y propone cambios aplicables en ${domain}.`;
    case "ui_fix":
      return `Actúa como un UI engineer senior enfocado en corregir interfaces existentes en ${domain}.`;
    case "architecture_design":
      return `Actúa como un arquitecto de software senior especializado en ${domain}.`;
    case "debugging":
      return `Actúa como un ingeniero senior de diagnóstico y corrección en ${domain}.`;
    case "refactor":
      return `Actúa como un desarrollador senior enfocado en refactorización y mantenibilidad para ${domain}.`;
    case "documentation":
      return `Actúa como un technical writer senior que documenta sistemas de ${domain}.`;
    case "automation_agent":
      return `Actúa como un ingeniero senior de automatización y agentes orientado a ${domain}.`;
    case "ui_design":
      return `Actúa como un diseñador UI/UX técnico para proyectos de ${domain}.`;
    case "business_content":
      return "Actúa como un estratega senior de contenido y comunicación comercial.";
    case "code_generation":
    default:
      return `Actúa como un desarrollador senior especializado en ${domain}.`;
  }
}

function buildStrategyContract(context: BuildPromptContext): string[] {
  const strategyRules: Record<PromptStrategy, string[]> = {
    default: [
      "No respondas con una plantilla inflada: aterriza el pedido a decisiones concretas.",
      "Evita repetir la consigna original; reinterpretala y usala como base de trabajo.",
    ],
    implement_new: [
      "Propón una solución nueva, pero con estructura realista y modular desde el primer paso.",
      "No agregues complejidad cosmética que no ayude a implementar mejor.",
      "Conserva foco en MVP sólido, extensible y fácil de probar.",
    ],
    inspect_and_adapt: [
      "Inspecciona primero la estructura real del proyecto antes de proponer cambios.",
      "Diferencia con claridad qué se reutiliza, qué se ajusta y qué conviene reemplazar.",
      "Evita rehacer la solución desde cero si la base actual sirve.",
    ],
    ui_fix_existing: [
      "Trabaja sobre una UI real, no sobre una interfaz inventada.",
      "Prioriza layout, spacing, estados interactivos, bordes, jerarquía visual y consistencia de componentes.",
      "No rompas la identidad visual existente salvo que el pedido pida una modernización explícita.",
    ],
    migrate_existing_system: [
      "Trata el problema como migración/adaptación de un sistema existente, no como greenfield genérico.",
      "Usa repo, carpetas, tabs, API, tablas o modelos citados como fuente de verdad antes de definir estructura nueva.",
      "No inventes módulos, tabs, entidades ni relaciones si no salen del análisis real.",
      "Separa diagnóstico, mapeo, plan incremental y ejecución archivo por archivo.",
    ],
  };

  return strategyRules[context.strategy] ?? strategyRules.default;
}

function buildProfileContract(context: BuildPromptContext): string[] {
  switch (context.generationProfile) {
    case "modern_modular_landing":
      return [
        "Empuja la solución hacia una landing altamente modular y nada monolítica.",
        "Usa React, Tailwind CSS y TypeScript si el pedido no fijó otro stack incompatible.",
        "Piensa en sections, shared UI, data/config, types, hooks y composición limpia.",
        "La estética debe sentirse moderna, profesional, redondeada y lista para crecer.",
      ];
    case "existing_frontend_audit":
      return [
        "Haz foco en layout, spacing, textos fuera de lugar, CTA, header, footer, estados hover y consistencia visual.",
        "Si propones una evolución tecnológica, trátala como evolución opcional y no como suposición obligatoria.",
      ];
    case "existing_system_migration":
      return [
        "La prioridad es leer la estructura real y mapearla correctamente antes de codificar.",
        "La respuesta debe sentirse como una migración guiada por evidencia, no como una receta genérica de framework.",
      ];
    default:
      return [];
  }
}

function buildPreferenceContract(context: BuildPromptContext): string[] {
  const items: string[] = [];

  if (context.preferences.detailLevel === "high") {
    items.push("Explica el porqué de las decisiones importantes y no solo el qué.");
  } else if (context.preferences.detailLevel === "low") {
    items.push("Mantén la respuesta compacta y evita relleno innecesario.");
  }

  if (context.preferences.outputStyle === "step_by_step") {
    items.push("Ordena la salida en fases o pasos con prioridades claras.");
  }
  if (context.preferences.outputStyle === "technical") {
    items.push("Usa lenguaje técnico, contratos explícitos y criterios de implementación.");
  }
  if (context.preferences.outputStyle === "concise") {
    items.push("Recorta el contexto accesorio y ve directo a la ejecución.");
  }
  if (context.preferences.includeFileStructure) {
    items.push("Incluye estructura de carpetas o archivos cuando ayude a bajar el plan a tierra.");
  }
  if (!context.preferences.includeAssumptions) {
    items.push("No abras una sección larga de supuestos: limita eso a los casos donde impacta de verdad.");
  }

  return items;
}

function buildResponseFormat(context: BuildPromptContext): string[] {
  if (context.strategy === "migrate_existing_system") {
    return [
      "Lectura técnica del sistema actual y de la fuente real de datos.",
      "Mapa entre estructura existente, panel/tabs y entidades o tablas reales.",
      "Plan incremental de migración por etapas.",
      "Lista de archivos a crear, tocar o retirar.",
      "Implementación o propuesta concreta archivo por archivo.",
      "Riesgos, supuestos y validaciones posteriores.",
    ];
  }

  if (context.generationProfile === "modern_modular_landing") {
    return [
      "Lectura del objetivo y del tono del producto.",
      "Arquitectura modular de la landing.",
      "Estructura de carpetas, components y sections.",
      "Implementación detallada o plan técnico de construcción.",
      "Criterios visuales, responsive y de mantenibilidad.",
    ];
  }

  if (context.strategy === "inspect_and_adapt" || context.strategy === "ui_fix_existing") {
    return [
      "Diagnóstico concreto.",
      "Qué se mantiene, qué se corrige y qué conviene rearmar.",
      "Archivos/componentes a revisar primero.",
      "Cambios o implementación concreta.",
      "Dudas críticas o supuestos restantes.",
    ];
  }

  return [
    "Lectura breve del problema.",
    "Propuesta técnica concreta.",
    "Pasos o estructura recomendada.",
    "Implementación o criterios de ejecución.",
  ];
}

function buildAcceptanceCriteria(context: BuildPromptContext): string[] {
  const items = [...context.synthesis.qualityTargets];

  if (context.generationProfile === "modern_modular_landing") {
    items.push("la solución no debe terminar en un único archivo gigante ni en secciones acopladas entre sí");
    items.push("la UI debe sentirse premium y no como un ejemplo escolar o una maqueta plana");
  }

  if (context.strategy === "migrate_existing_system") {
    items.push("ningún módulo clave debe inventarse por comodidad sin respaldarse en la estructura real");
  }

  if (context.strategy === "ui_fix_existing") {
    items.push("los cambios deben resolver problemas visibles y no solo cambiar nombres o adornos");
  }

  return unique(items);
}

function buildPromptPrelude(context: BuildPromptContext): string {
  const blocks = [
    resolveRole(context.intent, context.generationProfile, context.domain),
    "",
    "Lectura del pedido:",
    `- Síntesis: ${context.synthesis.summary}`,
    `- Objetivo principal: ${context.synthesis.primaryGoal}`,
    `- Modo de trabajo: ${context.synthesis.workMode}`,
    `- Modo de evidencia: ${context.synthesis.evidenceMode}`,
    context.projectReferences.length > 0
      ? `- Referencias detectadas: ${context.projectReferences.join(", ")}`
      : "- Referencias detectadas: no se detectaron nombres concretos.",
    context.synthesis.preferredStack.length > 0
      ? `- Stack objetivo o preferido: ${context.synthesis.preferredStack.join(", ")}`
      : "- Stack objetivo o preferido: decidir según el dominio detectado y el contexto.",
    "",
  ];

  return blocks.join("\n");
}

function buildMasterPrompt(context: BuildPromptContext): string {
  return [
    buildPromptPrelude(context),
    "Mandato operativo:",
    lines([
      ...buildStrategyContract(context),
      ...buildProfileContract(context),
      ...buildPreferenceContract(context),
    ]),
    "",
    "Lo que tenés que hacer:",
    lines(context.synthesis.requestedActions),
    "",
    "Entregables esperados:",
    lines(context.synthesis.requestedDeliverables),
    "",
    "Restricciones y límites:",
    lines(context.synthesis.constraints.length > 0 ? context.synthesis.constraints : ["evitar decisiones genéricas o inventadas sin respaldo en el pedido"]),
    "",
    context.preferences.includeAssumptions
      ? [
          "Supuestos actuales:",
          lines(
            context.assumptions.length > 0
              ? context.assumptions
              : ["si falta un dato crítico, pedilo antes de reestructurar la solución completa"],
          ),
          "",
        ].join("\n")
      : "",
    "Criterios de aceptación:",
    lines(buildAcceptanceCriteria(context)),
    "",
    "Formato de respuesta:",
    numbered(buildResponseFormat(context)),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildImplementationPrompt(context: BuildPromptContext): string {
  const actionPlan = unique([
    ...context.synthesis.requestedActions,
    ...(context.strategy === "migrate_existing_system"
      ? ["explica qué vas a inspeccionar primero y cómo validarás que el mapeo con la fuente real es correcto"]
      : []),
    ...(context.generationProfile === "modern_modular_landing"
      ? ["define el árbol de sections/components y las responsabilidades de cada pieza antes de escribir código"]
      : []),
  ]);

  return [
    resolveRole(context.intent, context.generationProfile, context.domain),
    "",
    "Quiero una salida orientada a ejecución, no una explicación genérica.",
    `Objetivo sintetizado: ${context.synthesis.primaryGoal}.`,
    context.synthesis.preferredStack.length > 0
      ? `Usa como base este stack si no hay conflicto con el pedido: ${context.synthesis.preferredStack.join(", ")}.`
      : "Usa el stack más coherente con el dominio detectado.",
    context.projectReferences.length > 0
      ? `Trabaja usando estas referencias cuando aparezcan en el proyecto real: ${context.projectReferences.join(", ")}.`
      : "Si el pedido habla de proyecto existente, inspecciona primero nombres reales de archivos, rutas o módulos.",
    "",
    "Secuencia de trabajo obligatoria:",
    numbered(actionPlan),
    "",
    "Salida mínima esperada:",
    lines(context.synthesis.requestedDeliverables),
    "",
    "No hagas esto:",
    lines([
      "no repitas la consigna original como relleno",
      "no inventes módulos o entidades genéricas si el pedido habla de una base real",
      "no entregues una solución monolítica si el objetivo pide modularidad o escalabilidad",
      ...(context.generationProfile === "modern_modular_landing"
        ? ["no dejes la UI en un estado plano, rígido o visualmente amateur"]
        : []),
    ]),
    "",
    "Entregá la respuesta con foco en archivos, componentes, etapas y criterios de implementación.",
  ].join("\n");
}

function buildConcisePrompt(context: BuildPromptContext): string {
  const focus = [
    `Resolver esto con criterio: ${context.synthesis.primaryGoal}`,
    `Modo de trabajo: ${context.synthesis.workMode}`,
    context.synthesis.preferredStack.length > 0 ? `Stack preferido: ${context.synthesis.preferredStack.join(", ")}` : "",
    context.projectReferences.length > 0 ? `Referencias reales a respetar: ${context.projectReferences.join(", ")}` : "",
    `Acciones clave: ${context.synthesis.requestedActions.slice(0, 3).join("; ")}`,
    `Entregables clave: ${context.synthesis.requestedDeliverables.slice(0, 3).join("; ")}`,
    context.synthesis.constraints.length > 0 ? `Límites: ${context.synthesis.constraints.slice(0, 3).join("; ")}` : "",
    "Respondé con una propuesta concreta, no con un boilerplate genérico.",
  ].filter(Boolean);

  return [resolveRole(context.intent, context.generationProfile, context.domain), "", ...focus].join("\n");
}

export function generatePromptVariants(context: BuildPromptContext): GeneratedPrompt[] {
  const implementationLabel =
    context.strategy === "migrate_existing_system"
      ? "Brief de migración"
      : context.strategy === "inspect_and_adapt"
        ? "Brief de adaptación"
        : context.strategy === "ui_fix_existing"
          ? "Brief de corrección UI"
          : context.generationProfile === "modern_modular_landing"
            ? "Brief de landing modular"
            : "Brief de ejecución";

  return [
    { id: "master", label: "Prompt analítico", kind: "master", content: buildMasterPrompt(context) },
    { id: "implementation", label: implementationLabel, kind: "implementation", content: buildImplementationPrompt(context) },
    { id: "concise", label: "Prompt compacto", kind: "concise", content: buildConcisePrompt(context) },
  ];
}
