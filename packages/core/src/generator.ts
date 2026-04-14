import { randomUUID } from "node:crypto";
import { analyzeClarification } from "../../clarification-engine/src/index.js";
import { getPresetById } from "../../presets/src/index.js";
import { generatePromptVariants } from "../../prompt-templates/src/index.js";
import { defaultPreferences, readPreferences, saveGeneration } from "../../storage/src/index.js";
import type { BuildPromptContext, PromptRequest, PromptResult } from "../../shared-types/src/index.js";
import { validatePrompts } from "../../validators/src/index.js";
import { classifyInput } from "./classifier.js";
import { normalizeInput } from "./normalize.js";
import { resolveGenerationProfile } from "./profile.js";
import { synthesizeRequest } from "./synthesis.js";
import { resolvePromptStrategy } from "./strategy.js";

export async function generatePromptResult(request: PromptRequest): Promise<PromptResult> {
  const normalizedInput = normalizeInput(request.message, request.contextMessages);
  const classification = classifyInput(normalizedInput);
  const strategy = resolvePromptStrategy({
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    projectReferences: classification.projectReferences,
  });
  const generationProfile = resolveGenerationProfile({
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    strategy,
  });

  const clarification = analyzeClarification({
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    strategy,
    generationProfile,
    projectReferences: classification.projectReferences,
  });

  const storedPreferences = await readPreferences();
  const preferences = {
    ...defaultPreferences,
    ...storedPreferences,
    ...(request.preferences ?? {}),
  };
  const preset = getPresetById(request.presetId);

  const synthesis = synthesizeRequest({
    originalInput: request.message.trim(),
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    strategy,
    generationProfile,
    projectReferences: classification.projectReferences,
    assumptions: clarification.assumptions,
    preferences,
  });

  const context: BuildPromptContext = {
    originalInput: request.message.trim(),
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    strategy,
    generationProfile,
    projectReferences: classification.projectReferences,
    assumptions: clarification.assumptions,
    synthesis,
    keywords: classification.keywords,
    matchedSignals: classification.matchedSignals,
    classificationConfidence: classification.confidence,
    preferences,
    preset,
  };

  const generatedPrompts =
    clarification.needsClarification && clarification.ambiguityLevel === "high"
      ? []
      : generatePromptVariants(context);

  const warnings = validatePrompts(generatedPrompts);

  const result: PromptResult = {
    requestId: randomUUID(),
    createdAt: new Date().toISOString(),
    inputOriginal: request.message.trim(),
    normalizedInput,
    intent: classification.intent,
    domain: classification.domain,
    strategy,
    generationProfile,
    projectReferences: classification.projectReferences,
    classificationConfidence: classification.confidence,
    matchedSignals: classification.matchedSignals,
    ambiguityLevel: clarification.ambiguityLevel,
    needsClarification: clarification.needsClarification,
    clarificationQuestions: clarification.questions,
    assumptions: clarification.assumptions,
    synthesis,
    generatedPrompts,
    suggestedNextInputs: clarification.suggestedNextInputs,
    warnings,
    presetId: request.presetId ?? null,
    preferencesApplied: preferences,
  };

  await saveGeneration(result);
  return result;
}
