/**
 * Main generator entry point.
 * Combines analysis + building into the public generate() API.
 */

import { analyze } from '../core/analyzer.js';
import { buildPrompts } from './builder.js';

/**
 * Generates one or more technical prompts from a user input string.
 *
 * @param {string} input - Raw user input
 * @returns {{
 *   analysis: object,
 *   prompts: string[]
 * }}
 */
function generate(input) {
  const analysis = analyze(input);
  const prompts = buildPrompts(analysis);
  return { analysis, prompts };
}

export { generate };
