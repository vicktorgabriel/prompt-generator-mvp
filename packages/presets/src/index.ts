import type { PromptPreset } from "../../shared-types/src/index.js";

export const promptPresets: PromptPreset[] = [
  {
    id: "example-landing-react",
    label: "Ejemplo: landing modular React",
    description: "Starter genérico para una landing moderna, modular y escalable.",
    recommendedIntent: "code_generation",
    recommendedDomain: "react",
    isExample: true,
    messageTemplate:
      "Necesito una landing moderna, altamente modular, construida con React, Tailwind CSS y TypeScript. Quiero una estructura clara por secciones, componentes reutilizables, diseño redondeado, buen responsive y base limpia para seguir ampliando.",
  },
  {
    id: "example-frontend-audit",
    label: "Ejemplo: auditoría de landing existente",
    description: "Útil para revisar una landing ya armada y proponer mejoras concretas.",
    recommendedIntent: "review_existing_project",
    recommendedDomain: "frontend",
    isExample: true,
    messageTemplate:
      "Necesito que revises la carpeta 'aurora-site' dentro del repo 'studio-web' y mejores la landing actual. Quiero corregir spacing, botones, header, bordes demasiado rectos y consistencia visual, manteniendo la identidad existente y explicando qué archivos revisarías primero.",
  },
  {
    id: "example-django-migration",
    label: "Ejemplo: migración web a Django",
    description: "Caso genérico para adaptar una plataforma existente a Django usando una API o esquema real como referencia.",
    recommendedIntent: "review_existing_project",
    recommendedDomain: "django",
    isExample: true,
    messageTemplate:
      "Convierte una plataforma web existente a Django sin rehacerla desde cero. Revisa primero la estructura real del proyecto, integra las secciones ya existentes, crea login administrativo y adapta modelos/base de datos según la estructura real definida en 'nova-api'. No inventes módulos genéricos y entrega un plan de migración más implementación archivo por archivo.",
  },
  {
    id: "example-api-backend",
    label: "Ejemplo: API backend",
    description: "Starter técnico para pedir una API mantenible y preparada para crecer.",
    recommendedIntent: "code_generation",
    recommendedDomain: "api",
    isExample: true,
    messageTemplate:
      "Quiero un prompt para crear una API backend con autenticación JWT, estructura mantenible, validaciones, manejo de errores, logging básico y una base preparada para escalar. Necesito pasos, archivos sugeridos y prioridades del MVP.",
  },
  {
    id: "example-refactor",
    label: "Ejemplo: refactor técnico",
    description: "Caso genérico para reorganizar una base existente sin romper compatibilidad.",
    recommendedIntent: "refactor",
    recommendedDomain: "general",
    isExample: true,
    messageTemplate:
      "Necesito revisar un proyecto existente y proponer una refactorización ordenada. Quiero reducir acoplamiento, separar responsabilidades, mantener compatibilidad y tener un plan de cambios por fases con riesgos y prioridades.",
  },
  {
    id: "example-debug",
    label: "Ejemplo: debug de problema",
    description: "Para pedir diagnóstico, causa probable y plan de corrección.",
    recommendedIntent: "debugging",
    recommendedDomain: "general",
    isExample: true,
    messageTemplate:
      "Necesito diagnosticar un problema en un proyecto existente. Quiero identificar causa probable, impacto, archivos a revisar, pasos de corrección y cómo verificar que el problema quedó resuelto.",
  },
];

export function getPresetById(id: string | null | undefined): PromptPreset | null {
  if (!id) return null;
  return promptPresets.find((preset) => preset.id === id) ?? null;
}
