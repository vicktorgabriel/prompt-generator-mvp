import type { DomainType, GenerationProfile, IntentType, PromptStrategy } from "../../shared-types/src/index.js";

interface ResolveProfileInput {
  normalizedInput: string;
  intent: IntentType;
  domain: DomainType;
  strategy: PromptStrategy;
}

export function resolveGenerationProfile(input: ResolveProfileInput): GenerationProfile {
  const text = input.normalizedInput.toLowerCase();

  const landingSignals = /(landing|hero|cta|navbar|header|footer|cards|secciones|section|responsive|animaciones|tailwind|typescript|react)/.test(
    text,
  );

  if (input.strategy === "migrate_existing_system") {
    return "existing_system_migration";
  }

  if (input.strategy === "inspect_and_adapt" || input.strategy === "ui_fix_existing") {
    return "existing_frontend_audit";
  }

  if (landingSignals && (input.domain === "react" || input.domain === "frontend" || input.domain === "web_app")) {
    return "modern_modular_landing";
  }

  return "generic";
}
