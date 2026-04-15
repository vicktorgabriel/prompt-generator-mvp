/**
 * Main generator entry point.
 * Combines analysis + building into the public generate() API.
 * Now returns enhanced result with multi-model prompts and quality metrics.
 */

import { analyze } from '../core/analyzer.js';
import { buildPrompts } from './builder.js';

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
 *   quality?: object
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

export { generate };
