/**
 * Main generator entry point.
 * Combines analysis + building into the public generate() API.
 * Now returns enhanced result with multi-model prompts and quality metrics.
 * Includes the heavy model-adapter algorithm for model-specific optimization.
 */

import { analyze } from '../core/analyzer.js';
import { buildPrompts } from './builder.js';
import {
  adaptPromptForModel,
  generateOptimizedPrompt,
  getAvailableModels,
  getModelProfile,
} from './model-adapter.js';

/**
 * Generates one or more technical prompts from a user input string.
 *
 * @param {string} input - Raw user input
 * @param {object} options - Generation options
 * @param {string[]} options.models - Models to generate for ('gemini', 'claude', 'codex', 'universal')
 * @param {boolean} options.amplify - Whether to amplify prompt quality
 * @param {boolean} options.reduceBasic - Whether to reduce basic quality patterns
 * @returns {{
 *   analysis: object,
 *   prompts: string[],
 *   multiModel?: object,
 *   quality?: object,
 *   modelAdapter?: object
 * }}
 */
function generate(input, options = {}) {
  const analysis = analyze(input);
  const result = buildPrompts(analysis, options);

  // Handle both old array return and new object return
  if (Array.isArray(result)) {
    return { analysis, prompts: result };
  }

  return {
    analysis,
    prompts: result.prompts,
    multiModel: result.multiModel,
    quality: result.quality,
  };
}

/**
 * Generates prompts using the heavy model-adapter algorithm.
 * This applies deterministic rules based on empirical knowledge of each model.
 *
 * @param {string} input - Raw user input
 * @param {string} modelType - Target model ('claude', 'gemini', 'codex', 'universal')
 * @param {object} options - Optional configuration
 * @returns {{ analysis: object, adapted: object, optimized?: object }}
 */
function generateForModel(input, modelType, options = {}) {
  const analysis = analyze(input);

  // Apply heavy algorithm adaptation
  const adapted = adaptPromptForModel(analysis, modelType);

  // Generate full optimized prompt if requested
  const optimized = options.fullPrompt
    ? generateOptimizedPrompt(analysis, modelType)
    : null;

  return {
    analysis,
    adapted,
    optimized,
    modelInfo: getModelProfile(modelType),
  };
}

/**
 * Generates prompts for all available models.
 * Useful for comparing output quality across different target models.
 *
 * @param {string} input - Raw user input
 * @returns {{ analysis: object, models: object }}
 */
function generateForAllModels(input) {
  const analysis = analyze(input);
  const models = getAvailableModels();

  const results = {};
  for (const modelType of models) {
    results[modelType] = generateOptimizedPrompt(analysis, modelType);
  }

  return {
    analysis,
    models: results,
  };
}

export { generate, generateForModel, generateForAllModels, getAvailableModels };