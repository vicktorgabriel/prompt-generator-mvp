'use strict';

/**
 * prompt-generator library entry point.
 * Exposes the generate() function and the lower-level analyze() for consumers.
 */

const { generate } = require('./generator/index');
const { analyze } = require('./core/analyzer');

module.exports = { generate, analyze };
