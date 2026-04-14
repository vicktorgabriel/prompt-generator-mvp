/**
 * prompt-generator library entry point.
 * Exposes the generate() function and the lower-level analyze() for consumers.
 */

import { generate } from './generator/index.js';
import { analyze } from './core/analyzer.js';

export { generate, analyze };
