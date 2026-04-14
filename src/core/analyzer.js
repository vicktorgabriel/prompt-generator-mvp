'use strict';

/**
 * Main semantic analyzer.
 * Orchestrates intent, domain, strategy, ambiguity, and context detection
 * into a unified analysis result used by the generator.
 */

const { detectIntent } = require('./intent');
const { detectDomain } = require('./domain');
const { detectStrategy } = require('./strategy');
const { scoreAmbiguity } = require('./ambiguity');
const { detectContextRefs } = require('./context');

/**
 * Analyzes a user input string and returns a structured analysis object.
 *
 * @param {string} input - Raw user input
 * @returns {{
 *   input: string,
 *   intent: string,
 *   intentConfidence: number,
 *   domain: string,
 *   domains: string[],
 *   strategy: string,
 *   ambiguity: { score: number, level: string, hints: string[] },
 *   context: { refs: Array<{ type: string, raw: string }>, hasExistingContext: boolean },
 *   profile: string
 * }}
 */
function analyze(input) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Input must be a non-empty string.');
  }

  const trimmed = input.trim();

  const { intent, confidence: intentConfidence } = detectIntent(trimmed);
  const { primary: domain, all: domains } = detectDomain(trimmed);
  const { strategy } = detectStrategy(trimmed, { intent });
  const ambiguity = scoreAmbiguity(trimmed);
  const context = detectContextRefs(trimmed);

  const profile = resolveProfile(intent, domain, context);

  return {
    input: trimmed,
    intent,
    intentConfidence,
    domain,
    domains,
    strategy,
    ambiguity,
    context,
    profile,
  };
}

/**
 * Resolves a generation profile name based on intent, domain, and context.
 * Profiles drive template selection in the generator.
 *
 * @param {string} intent
 * @param {string} domain
 * @param {{ hasExistingContext: boolean }} context
 * @returns {string}
 */
function resolveProfile(intent, domain, context) {
  if (context.hasExistingContext) {
    // When user references existing artifacts, always adapt rather than invent
    return `${domain}-adaptation`;
  }

  if (domain === 'database') return 'data';
  if (domain === 'devops') return 'devops';
  if (domain === 'mobile') return 'mobile';
  if (domain === 'ml') return 'ml';
  if (domain === 'api') return 'api';
  if (domain === 'backend') return 'backend';
  if (domain === 'frontend') return 'web';
  if (domain === 'fullstack') return 'fullstack';

  return 'general';
}

module.exports = { analyze };
