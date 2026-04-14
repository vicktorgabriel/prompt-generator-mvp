import type { GeneratedPrompt } from "../../shared-types/src/index.js";

export function validatePrompts(prompts: GeneratedPrompt[]): string[] {
  const warnings: string[] = [];

  if (prompts.length === 0) {
    warnings.push("No se generaron prompts todavía.");
    return warnings;
  }

  for (const prompt of prompts) {
    if (prompt.content.trim().length < 120) {
      warnings.push(`El prompt "${prompt.label}" quedó demasiado corto.`);
    }

    if (!prompt.content.includes("Objetivo") && prompt.kind === "master") {
      warnings.push(`El prompt "${prompt.label}" no incluye una sección de objetivo explícita.`);
    }

    if (prompt.label.toLowerCase().includes("migración") || prompt.content.includes("migrate_existing_system")) {
      if (!/inspecciona|revisa primero|estructura real/i.test(prompt.content)) {
        warnings.push(`El prompt "${prompt.label}" parece de migración pero no fuerza una inspección previa de la estructura real.`);
      }
      if (!/no inventes|no rehagas|fuente de verdad/i.test(prompt.content)) {
        warnings.push(`El prompt "${prompt.label}" parece de migración pero no limita suficientemente la invención de módulos o entidades.`);
      }
    }

    if (/React, Tailwind CSS y TypeScript/i.test(prompt.content) && !/modular|componentes|responsive|secciones/i.test(prompt.content)) {
      warnings.push(`El prompt "${prompt.label}" menciona stack moderno de landing pero no enfatiza suficiente modularidad o responsive.`);
    }
  }

  return Array.from(new Set(warnings));
}
