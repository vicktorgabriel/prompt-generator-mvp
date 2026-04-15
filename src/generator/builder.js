/**
 * Prompt builder.
 * Assembles a structured prompt from an analysis object using template fragments.
 * Applies role → directive → strategy → context → constraints → task order.
 * Now includes multi-model generation and quality quantification.
 */

import {
  ROLES,
  INTENT_DIRECTIVES,
  STRATEGY_MODIFIERS,
  DOMAIN_CONSTRAINTS,
  contextDirective,
  ambiguityDirective,
} from './templates.js';

import {
  generateMultiModelPrompts,
  quantifyPrompt,
  amplifyPrompt,
  reduceBasicQuality,
} from './quantifier.js';

/** Minimum word count required before a task description is considered self-sufficient */
const MIN_TASK_WORD_COUNT = 5;

/**
 * Builds one or more prompt strings from an analysis result.
 *
 * Returns an array because high-ambiguity inputs generate multiple variants.
 * Now includes multi-model generation (Gemini, Claude, Codex, Universal) with quality quantification.
 *
 * @param {object} analysis - Result from analyzer.analyze()
 * @param {object} options - Generation options
 * @param {string[]} options.models - Models to generate for ('gemini', 'claude', 'codex', 'universal')
 * @param {boolean} options.amplify - Whether to amplify prompt quality
 * @param {boolean} options.reduceBasic - Whether to reduce basic quality patterns
 * @returns {{prompts: string[], multiModel: object, quality: object}} - Enhanced result with metrics
 */
function buildPrompts(analysis, options = {}) {
  const { 
    models = ['universal'], 
    amplify = true, 
    reduceBasic = true 
  } = options;
  
  const { intent, domain, strategy, ambiguity, context, input, domains } = analysis;

  // Generate multi-model prompts with quantification
  const multiModelResult = generateMultiModelPrompts(analysis, models);
  
  // Resolve role (prefer most specific domain)
  const roleKey = domain === 'fullstack'
    ? 'fullstack'
    : domain === 'general'
      ? 'general'
      : domain;

  const role = ROLES[roleKey] || ROLES.general;

  // Resolve intent directive
  const directiveFn = INTENT_DIRECTIVES[intent] || INTENT_DIRECTIVES.create;
  const directive = directiveFn(analysis);

  // Strategy modifier
  const strategyMod = STRATEGY_MODIFIERS[strategy] || '';

  // Context adaptation directive
  const ctxDirective = contextDirective(context);

  // Domain constraints
  const constraintKey = domain === 'general' ? 'general' : domain;
  const constraints = DOMAIN_CONSTRAINTS[constraintKey] || DOMAIN_CONSTRAINTS.general;

  // Multi-domain supplement (for fullstack or combined domains)
  const multiDomain = domains.length > 1 && domain !== 'fullstack'
    ? `\nThe implementation spans multiple domains: ${domains.join(', ')}. Ensure consistency across all layers.`
    : '';

  // Sanitized task description (don't mechanically repeat the user's text)
  const taskDescription = sanitizeTaskDescription(input, intent, domain);

  // Ambiguity handling
  const ambiguityMod = ambiguityDirective(ambiguity);

  // Build the base prompt
  const parts = [
    role,
    '',
    directive,
    strategyMod.trim() ? strategyMod.trim() : null,
    ctxDirective.trim() ? ctxDirective.trim() : null,
    ambiguityMod.trim() ? ambiguityMod.trim() : null,
    '',
    '## Task',
    taskDescription,
    '',
    '## Constraints',
    constraints,
    multiDomain.trim() ? multiDomain.trim() : null,
  ].filter((p) => p !== null);

  let prompt = parts.join('\n');
  
  // Apply quality enhancements
  if (reduceBasic) {
    prompt = reduceBasicQuality(prompt);
  }
  
  if (amplify) {
    prompt = amplifyPrompt(prompt);
  }

  // Quantify the base prompt
  const baseQuality = quantifyPrompt(prompt);

  // For high ambiguity, return two variants
  if (ambiguity.level === 'high') {
    let alternative = buildAlternativeVariant(analysis, role, constraints);
    if (reduceBasic) alternative = reduceBasicQuality(alternative);
    if (amplify) alternative = amplifyPrompt(alternative);
    
    return {
      prompts: [prompt, alternative],
      multiModel: multiModelResult,
      quality: {
        base: baseQuality,
        alternative: quantifyPrompt(alternative),
        multiModel: models.reduce((acc, model) => {
          acc[model] = multiModelResult[`${model}_quality`];
          return acc;
        }, {}),
      },
    };
  }

  return {
    prompts: [prompt],
    multiModel: multiModelResult,
    quality: {
      base: baseQuality,
      multiModel: models.reduce((acc, model) => {
        acc[model] = multiModelResult[`${model}_quality`];
        return acc;
      }, {}),
    },
  };
}

/**
 * Transforms user input into a structured task description.
 * Avoids mechanical repetition while preserving intent and specifics.
 *
 * @param {string} input
 * @param {string} intent
 * @param {string} domain
 * @returns {string}
 */
function sanitizeTaskDescription(input, intent, domain) {
  // Remove filler phrases that add no technical value
  const fillers = [
    /^(please\s+|can\s+you\s+|could\s+you\s+|i\s+need\s+you\s+to\s+|i\s+want\s+you\s+to\s+|i\s+would\s+like\s+you\s+to\s+|help\s+me\s+)/i,
    /^(write|create|make|generate|produce|give\s+me|show\s+me)\s+(a\s+|an\s+|the\s+)?/i,
  ];

  let cleaned = input.trim();
  for (const filler of fillers) {
    cleaned = cleaned.replace(filler, '');
  }

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // If very short (likely vague), add a structural hint
  if (cleaned.split(/\s+/).length < MIN_TASK_WORD_COUNT) {
    return `${cleaned}\n\n(Provide a complete, production-ready implementation.)`;
  }

  return cleaned;
}

/**
 * Builds an alternative prompt variant for high-ambiguity inputs.
 * Uses a different framing to cover the alternative interpretation.
 *
 * @param {object} analysis
 * @param {string} role
 * @param {string} constraints
 * @returns {string}
 */
function buildAlternativeVariant(analysis, role, constraints) {
  const { input, intent, domain, strategy, context } = analysis;

  const altDirectives = {
    create: 'Provide a minimal, focused implementation — a single function or module — for:',
    debug: 'Propose a defensive approach to prevent the following class of errors entirely:',
    refactor: 'Apply a design pattern to improve the following, and justify the choice:',
    explain: 'Provide an analogy-based explanation suitable for an intermediate developer:',
    default: 'Approach the following from a different angle or architectural perspective:',
  };

  const altDirective = altDirectives[intent] || altDirectives.default;
  const taskDescription = sanitizeTaskDescription(input, intent, domain);

  return [
    role,
    '',
    altDirective,
    '',
    '## Task (Alternative Interpretation)',
    taskDescription,
    '',
    '## Constraints',
    constraints,
  ].join('\n');
}

export { buildPrompts };
