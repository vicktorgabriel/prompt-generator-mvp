/**
 * Intent detection module.
 * Identifies the primary action the user wants to perform.
 *
 * Supported intents:
 *   create    - build something new
 *   debug     - find or fix a bug/error
 *   refactor  - improve existing code structure
 *   migrate   - move from one tech/version to another
 *   explain   - understand how something works
 *   test      - write or improve tests
 *   document  - write documentation
 *   optimize  - improve performance or resource use
 *   integrate - connect systems, APIs, or services
 *   review    - evaluate existing code or design
 *   setup     - configure a project or environment
 *   generate  - produce boilerplate, schemas, types, mocks
 */

const INTENT_PATTERNS = [
  {
    intent: 'debug',
    patterns: [
      /\b(debug|fix|error|bug|crash|fail|broken|not\s+work|doesn'?t\s+work|issue|problem|exception|undefined|null\s+pointer|stack\s+trace|traceback)\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'migrate',
    patterns: [
      /\b(migrat\w*|upgrad\w*|convert|port\s+from|move\s+from|transition\s+from|replac\w*\s+with)\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'refactor',
    patterns: [
      /\b(refactor|restructur|rewrite|reorganiz|clean\s+up|improve\s+code|simplif|decouple|split\s+into|extract)\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'optimize',
    patterns: [
      /\b(optim|perform|speed\s+up|slow|latency|memory\s+leak|cache|bottleneck|profil|throughput|scalab)\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'test',
    patterns: [
      /\b(test|spec|unit\s+test|integration\s+test|e2e|mock|stub|coverage|jest|vitest|cypress|supertest|assert)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'document',
    patterns: [
      /\b(document|docs?|readme|jsdoc|swagger|openapi|comment|annotate|describe\s+the\s+api)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'explain',
    patterns: [
      /\b(explain|how\s+does|what\s+is|understand|show\s+me\s+how|walk\s+through|break\s+down|describe)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'review',
    patterns: [
      /\b(review|feedback|evaluate|assess|analyse|analyze|critique|check\s+my|look\s+at\s+this|what\s+do\s+you\s+think)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'integrate',
    patterns: [
      /\b(integrat|connect|plug\s+in|webhook|sync\s+with|consume\s+api|call\s+api|link\s+to|auth.+with|oauth|third.?party)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'setup',
    patterns: [
      /\b(setup|set\s+up|scaffold|bootstrap|initializ|config|install|environment|boilerplate|starter|template)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'generate',
    patterns: [
      /\b(generat|creat.+schema|creat.+type|creat.+model|creat.+migration|mock\s+data|seed|scaffold|boilerplate)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'create',
    patterns: [
      /\b(creat|build|make|add|implement|develop|write|design|new\s+feature|new\s+component|new\s+endpoint)\b/i,
    ],
    weight: 2,
  },
];

/**
 * Detects the primary intent from a user input string.
 * @param {string} input
 * @returns {{ intent: string, confidence: number }}
 */
function detectIntent(input) {
  const scores = {};

  for (const { intent, patterns, weight } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        scores[intent] = (scores[intent] || 0) + weight;
      }
    }
  }

  if (Object.keys(scores).length === 0) {
    return { intent: 'create', confidence: 0.3 };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0][1];
  const maxPossible = 6;
  const confidence = Math.min(topScore / maxPossible, 1);

  return { intent: sorted[0][0], confidence: parseFloat(confidence.toFixed(2)) };
}

export { detectIntent, INTENT_PATTERNS };
