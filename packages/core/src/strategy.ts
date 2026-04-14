import type { DomainType, IntentType, PromptStrategy } from "../../shared-types/src/index.js";

function textHasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

interface StrategyInput {
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  projectReferences: string[];
}

export function resolvePromptStrategy(input: StrategyInput): PromptStrategy {
  const text = input.normalizedInput.toLowerCase();
  const mentionsMigration = textHasAny(text, [
    /\bmigr\w+/,
    /\bconvert\w+/,
    /\badapt\w+/,
    /\bconect\w+/,
    /\bintegr\w+/,
    /convertir a django/,
    /pasar a django/,
  ]);

  const mentionsExistingStructure = textHasAny(text, [
    /\b(repo|repositorio|carpeta|proyecto|api|tabs?|tablas?|modelos?)\b/,
    /base de datos/,
    /segun la creacion/,
  ]) || input.projectReferences.length > 0;

  if (input.intent === "review_existing_project" && mentionsMigration && mentionsExistingStructure) {
    return "migrate_existing_system";
  }

  if (input.intent === "review_existing_project") {
    return "inspect_and_adapt";
  }

  if (input.intent === "ui_fix") {
    return "ui_fix_existing";
  }

  if (input.intent === "code_generation" || input.domain === "django" || input.domain === "api") {
    return "implement_new";
  }

  return "default";
}
