'use strict';

/**
 * Strategy detection module.
 * Determines the best generation strategy given the user's intent and input phrasing.
 *
 * Strategies:
 *   step-by-step  - Sequential, numbered instructions (tutorials, onboarding, setup)
 *   code-focused  - Produce working code as the main output
 *   architecture  - High-level design, system design, component breakdown
 *   review        - Evaluate and provide improvement suggestions
 *   migration     - Transform codebase / stack from X to Y
 *   debug         - Locate root cause, trace execution, fix error
 *   documentation - Produce written explanation or docs artifact
 *   data-model    - Design or evolve schemas, tables, entities
 */

const STRATEGY_PATTERNS = [
  {
    strategy: 'step-by-step',
    patterns: [
      /\b(step.?by.?step|how\s+to|tutorial|guide|walkthrough|setup|install|configure|from\s+scratch|getting\s+started)\b/i,
    ],
  },
  {
    strategy: 'migration',
    patterns: [
      /\b(migrat|from\s+\w+\s+to\s+\w+|upgrad|port\s+from|replac.+with|convert\s+from)\b/i,
    ],
  },
  {
    strategy: 'debug',
    patterns: [
      /\b(debug|fix|error|bug|crash|exception|not\s+work|broken|fail|stack\s+trace|traceback)\b/i,
    ],
  },
  {
    strategy: 'review',
    patterns: [
      /\b(review|feedback|evaluate|assess|what\s+do\s+you\s+think|check\s+(this|my)|improve\s+(this|my))\b/i,
    ],
  },
  {
    strategy: 'architecture',
    patterns: [
      /\b(architect|design\s+system|system\s+design|structure|how\s+should\s+I|how\s+to\s+organiz|folder\s+structure|project\s+layout|patterns?|best\s+practice)\b/i,
    ],
  },
  {
    strategy: 'documentation',
    patterns: [
      /\b(document|docs?|readme|jsdoc|openapi|swagger|comment|annotate|explain\s+(this|the))\b/i,
    ],
  },
  {
    strategy: 'data-model',
    patterns: [
      /\b(schema|model|entity|table|relation|database\s+design|erd|data\s+model|migration\s+file)\b/i,
    ],
  },
  {
    strategy: 'code-focused',
    patterns: [
      /\b(creat|build|implement|write\s+code|generate|add\s+a|make\s+a|develop)\b/i,
    ],
  },
];

/**
 * Detects the most suitable generation strategy.
 * @param {string} input
 * @param {{ intent: string }} analysis - partial analysis result
 * @returns {{ strategy: string }}
 */
function detectStrategy(input, analysis = {}) {
  const scores = {};

  for (const { strategy, patterns } of STRATEGY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        scores[strategy] = (scores[strategy] || 0) + 1;
      }
    }
  }

  // Intent override: if already detected debug/migrate/review, boost matching strategy
  if (analysis.intent === 'debug') scores['debug'] = (scores['debug'] || 0) + 2;
  if (analysis.intent === 'migrate') scores['migration'] = (scores['migration'] || 0) + 2;
  if (analysis.intent === 'review') scores['review'] = (scores['review'] || 0) + 2;
  if (analysis.intent === 'document') scores['documentation'] = (scores['documentation'] || 0) + 2;
  if (analysis.intent === 'setup') scores['step-by-step'] = (scores['step-by-step'] || 0) + 2;

  if (Object.keys(scores).length === 0) {
    return { strategy: 'code-focused' };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { strategy: sorted[0][0] };
}

module.exports = { detectStrategy, STRATEGY_PATTERNS };
