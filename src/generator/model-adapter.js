/**
 * Model Adapter - Heavy Algorithm for Model-Specific Prompt Adaptation
 *
 * This module contains deep knowledge about each AI model's:
 * - Context window limits
 * - Token budgets and optimization strategies
 * - Response style preferences
 * - Strengths and weaknesses
 * - Instruction formats that work best
 * - Edge case handling capabilities
 *
 * The adapter uses PATTERN MATCHING and HEURISTICS based on empirical
 * knowledge of what works for each model. NO AI is used - purely deterministic rules.
 */

// ─── MODEL PROFILES ────────────────────────────────────────────────────────────

/**
 * Deep model profiles with empirical characteristics
 * Each profile includes:
 * - Context window limits
 * - Token budget allocation
 * - Response style preferences
 * - Good/bad instruction patterns
 * - Adaptation rules specific to the model
 */
const MODEL_PROFILES = {
  // ─── ANTHROPIC CLAUDE ──────────────────────────────────────────────────────
  claude: {
    name: 'Claude',
    provider: 'Anthropic',

    // Context constraints
    contextWindow: 200000,
    optimalInputTokens: 15000,
    maxOutputTokens: 4096,

    // Budget strategy
    reserveTokens: 5000,
    useCompression: false,

    // Response characteristics
    responseStyle: {
      verbosity: 'high',
      structure: 'conversational-xml',
      reasoning: 'think-step-by-step',
      formality: 'professional-adaptable',
      codeStyle: 'clean-annotated',
    },

    // Strengths
    strengths: [
      'Long context understanding',
      'Nuanced reasoning and analysis',
      'Handling ambiguous requirements',
      'Creative problem-solving',
      'Writing natural, flowing text',
      'Code explanation and teaching',
      'Acknowledging uncertainty',
    ],

    // Weaknesses
    weaknesses: [
      'Can be overly verbose',
      'Sometimes over-thinks simple tasks',
      'Code may be less optimized than GPT-4',
      'XML tags add overhead',
    ],

    // What instructions work best
    instructionPatterns: {
      good: [
        /act as an? .+ expert/i,
        /you are an? .+ specialist/i,
        /think step by step/i,
        /explain your reasoning/i,
        /consider (multiple|several) (approaches|perspectives)/i,
        /acknowledge when/i,
        /be thorough but concise/i,
      ],
      bad: [
        /just do it/i,
        /don't explain/i,
        /no preamble/i,
        /as concisely as possible/i,
      ],
    },

    // How to adapt prompts - array of functions that modify the prompt
    adaptationRules: [
      // 1. Add explicit reasoning request for explain/debug
      (prompt, analysis) => {
        if (analysis.intent === 'explain' || analysis.intent === 'debug') {
          return prompt + '\n\nExplain your reasoning step by step before providing the answer.';
        }
        return prompt;
      },

      // 2. Use XML-like structure for complex tasks
      (prompt, analysis) => {
        if (analysis.strategy === 'architecture' || analysis.strategy === 'data-model') {
          return `<task>\n${prompt}\n</task>\n\nConsider: structure, trade-offs, alternatives, and implementation implications.`;
        }
        return prompt;
      },

      // 3. Handle code with annotations
      (prompt, analysis) => {
        if (analysis.domain === 'frontend' || analysis.domain === 'backend') {
          if (!prompt.includes('include comments')) {
            return prompt + '\n\nInclude inline comments explaining non-obvious logic.';
          }
        }
        return prompt;
      },

      // 4. Acknowledge uncertainty when ambiguity is high
      (prompt, analysis) => {
        if (analysis.ambiguity && analysis.ambiguity.level === 'high') {
          return prompt + '\n\nIf any information is missing or ambiguous, state your assumptions explicitly.';
        }
        return prompt;
      },
    ],

    // Token budget allocation (percentage of available tokens)
    budgetAllocation: {
      role: 0.08,
      task: 0.20,
      context: 0.15,
      constraints: 0.12,
      examples: 0.10,
      outputFormat: 0.08,
      reasoningSpace: 0.15,
      buffer: 0.12,
    },
  },

  // ─── GOOGLE GEMINI ─────────────────────────────────────────────────────────
  gemini: {
    name: 'Gemini',
    provider: 'Google',

    contextWindow: 1000000,
    optimalInputTokens: 30000,
    maxOutputTokens: 8192,

    reserveTokens: 3000,
    useCompression: true,

    responseStyle: {
      verbosity: 'medium',
      structure: 'markdown-headers',
      reasoning: 'direct-conclusion',
      formality: 'technical-professional',
      codeStyle: 'modern-concise',
    },

    strengths: [
      'Massive context window',
      'Multimodal (text, code, images)',
      'Fast processing',
      'Code generation quality',
      'Handling very long inputs',
      'Google ecosystem integration',
      'Cost-effective',
    ],

    weaknesses: [
      'Can be overly brief',
      'Less nuanced than Claude',
      'Sometimes misses edge cases',
      'Code comments can be sparse',
    ],

    instructionPatterns: {
      good: [
        /provide (a )?complete/im,
        /include (all |specific )?(requirements|constraints)/i,
        /use (modern|current) (best practices|standards)/i,
        /consider (performance|security|scalability)/i,
        /handle (edge cases|errors|exceptions)/i,
        /return .+ (in |as )/i,
      ],
      bad: [
        /think step by step/i,
        /explain your reasoning/i,
        /provide as much detail as possible/i,
      ],
    },

    adaptationRules: [
      // 1. Be explicit about output format
      (prompt) => {
        return prompt + '\n\n**Output Format**: Clearly structure your response with headers and bullet points where appropriate.';
      },

      // 2. Request complete implementation
      (prompt, analysis) => {
        if (analysis.intent === 'create' || analysis.intent === 'generate') {
          return prompt + '\n\nProvide a complete, production-ready implementation. Include all necessary imports, error handling, and type definitions.';
        }
        return prompt;
      },

      // 3. Add performance/security considerations
      (prompt, analysis) => {
        if (analysis.intent === 'optimize' || analysis.intent === 'integrate') {
          return prompt + '\n\nConsider: performance implications, security concerns, scalability, and error handling.';
        }
        return prompt;
      },

      // 4. Request examples for complex tasks
      (prompt, analysis) => {
        if (analysis.strategy === 'step-by-step' || analysis.intent === 'setup') {
          return prompt + '\n\nInclude concrete examples for each step.';
        }
        return prompt;
      },
    ],

    budgetAllocation: {
      role: 0.06,
      task: 0.28,
      context: 0.12,
      constraints: 0.18,
      examples: 0.08,
      outputFormat: 0.12,
      reasoningSpace: 0.06,
      buffer: 0.10,
    },
  },

  // ─── OPENAI GPT-4 / CODEX ──────────────────────────────────────────────────
  codex: {
    name: 'GPT-4 / Codex',
    provider: 'OpenAI',

    contextWindow: 128000,
    optimalInputTokens: 20000,
    maxOutputTokens: 4096,

    reserveTokens: 4000,
    useCompression: false,

    responseStyle: {
      verbosity: 'medium-high',
      structure: 'markdown-structured',
      reasoning: 'chain-of-thought',
      formality: 'technical-detailed',
      codeStyle: 'optimized-efficient',
    },

    strengths: [
      'Best code quality overall',
      'Strong reasoning capabilities',
      'Good at following complex instructions',
      'Excellent with few-shot examples',
      'Code optimization and refactoring',
      'Understanding implicit requirements',
      'Consistent output quality',
    ],

    weaknesses: [
      'Expensive',
      'Can be slower',
      'May over-complicate simple solutions',
      'Context window limits for very large codebases',
    ],

    instructionPatterns: {
      good: [
        /write (clean|optimized|efficient) code/i,
        /follow (best practices|SOLID)/i,
        /use (modern|idiomatic) .+ (code|style)/i,
        /handle (edge cases|errors|boundary conditions)/i,
        /include (type annotations|interfaces)/i,
        /optimize for (readability|performance)/i,
        /here is (an example|some context)/i,
      ],
      bad: [
        /just code it/i,
        /don't explain/i,
        /no comments needed/i,
      ],
    },

    adaptationRules: [
      // 1. Request structured code
      (prompt, analysis) => {
        if (analysis.domain !== 'general') {
          return prompt + '\n\nStructure code with clear sections, use type annotations where applicable, and include docstrings for functions.';
        }
        return prompt;
      },

      // 2. Add few-shot examples for complex tasks
      (prompt, analysis) => {
        if (analysis.intent === 'create' || analysis.intent === 'generate') {
          return prompt + '\n\nGenerate the code following this pattern:\n```\n// 1. Type definitions\n// 2. Helper functions\n// 3. Main logic\n// 4. Exports\n```';
        }
        return prompt;
      },

      // 3. Request SOLID principles
      (prompt, analysis) => {
        if (analysis.intent === 'refactor' || analysis.intent === 'create') {
          return prompt + '\n\nApply SOLID principles. Ensure single responsibility, open/closed, and dependency injection where appropriate.';
        }
        return prompt;
      },

      // 4. Request error handling explicitly
      (prompt, analysis) => {
        if (analysis.domain === 'backend' || analysis.domain === 'api') {
          return prompt + '\n\nInclude comprehensive error handling, input validation, and appropriate HTTP status codes.';
        }
        return prompt;
      },
    ],

    budgetAllocation: {
      role: 0.08,
      task: 0.24,
      context: 0.14,
      constraints: 0.16,
      examples: 0.12,
      outputFormat: 0.10,
      reasoningSpace: 0.08,
      buffer: 0.08,
    },
  },

  // ─── UNIVERSAL (HYBRID) ────────────────────────────────────────────────────
  universal: {
    name: 'Universal',
    provider: 'Hybrid',

    contextWindow: 100000,
    optimalInputTokens: 12000,
    maxOutputTokens: 2048,

    reserveTokens: 2000,
    useCompression: false,

    responseStyle: {
      verbosity: 'medium',
      structure: 'markdown-adaptive',
      reasoning: 'balanced',
      formality: 'professional',
      codeStyle: 'readable-maintainable',
    },

    strengths: [
      'Works everywhere',
      'Balanced performance',
      'No provider dependency',
      'Good for prototyping',
      'Reasonable quality',
    ],

    weaknesses: [
      'Not optimized for any specific model',
      'May underperform specialized prompts',
      'Generic recommendations',
    ],

    instructionPatterns: {
      good: [
        /provide a .+ (solution|implementation)/i,
        /use (standard|common) (patterns|practices)/i,
        /include (basic|essential) (error handling|validation)/i,
      ],
      bad: [],
    },

    adaptationRules: [
      // 1. Be explicit but not overly detailed
      (prompt) => {
        return prompt + '\n\nProvide a complete, balanced solution that works well across different contexts.';
      },

      // 2. Prioritize clarity
      (prompt) => {
        return prompt + '\n\nFocus on clarity and maintainability over optimization.';
      },

      // 3. Standard constraints
      (prompt) => {
        return prompt + '\n\nInclude basic error handling, input validation, and standard type definitions.';
      },
    ],

    budgetAllocation: {
      role: 0.10,
      task: 0.25,
      context: 0.12,
      constraints: 0.18,
      examples: 0.08,
      outputFormat: 0.12,
      reasoningSpace: 0.05,
      buffer: 0.10,
    },
  },
};

// ─── ADAPTATION ENGINE ────────────────────────────────────────────────────────

/**
 * Main adaptation function
 * Takes analysis + target model and returns optimized prompt
 *
 * @param {object} analysis - Analysis result from analyzer
 * @param {string} modelType - Target model ('claude', 'gemini', 'codex', 'universal')
 * @returns {{ prompt: string, model: string, provider: string, budget: object, quality: object }}
 */
function adaptPromptForModel(analysis, modelType) {
  const model = MODEL_PROFILES[modelType?.toLowerCase()] || MODEL_PROFILES.universal;

  const adaptedPrompt = applyAdaptationRules(analysis, model);

  return {
    prompt: adaptedPrompt,
    model: model.name,
    provider: model.provider,
    budget: calculateBudget(analysis, model),
    quality: {
      score: estimatePromptQuality(adaptedPrompt, modelType),
      level: getQualityLevel(estimatePromptQuality(adaptedPrompt, modelType)),
    },
  };
}

/**
 * Applies model-specific adaptation rules
 * @param {object} analysis - Analysis result
 * @param {object} model - Model profile
 * @returns {string} - Adapted prompt
 */
function applyAdaptationRules(analysis, model) {
  const { intent, domain, strategy, ambiguity, context, input } = analysis;

  let adaptedPrompt = input;

  // Apply each adaptation rule in order
  for (const rule of model.adaptationRules) {
    adaptedPrompt = rule(adaptedPrompt, analysis);
  }

  return adaptedPrompt;
}

/**
 * Calculates token budget for the model
 * @param {object} analysis - Analysis result
 * @param {object} model - Model profile
 * @returns {object} - Token budget breakdown
 */
function calculateBudget(analysis, model) {
  const totalBudget = model.optimalInputTokens;
  const allocation = model.budgetAllocation;

  return {
    total: totalBudget,
    role: Math.round(totalBudget * allocation.role),
    task: Math.round(totalBudget * allocation.task),
    context: Math.round(totalBudget * allocation.context),
    constraints: Math.round(totalBudget * allocation.constraints),
    examples: Math.round(totalBudget * allocation.examples),
    outputFormat: Math.round(totalBudget * allocation.outputFormat),
    buffer: Math.round(totalBudget * allocation.buffer),
  };
}

/**
 * Generates a prompt specifically optimized for a model
 * @param {object} analysis - Analysis result
 * @param {string} modelType - Target model type
 * @returns {{ prompt: string, model: string, provider: string, quality: object }}
 */
function generateOptimizedPrompt(analysis, modelType) {
  const model = MODEL_PROFILES[modelType?.toLowerCase()];
  if (!model) {
    throw new Error(`Unknown model type: ${modelType}`);
  }

  const adaptedInput = applyAdaptationRules(analysis, model);

  // Build role
  const role = buildModelRole(analysis.domain, analysis.intent, modelType);

  // Build task
  const task = buildModelTask(analysis.input, analysis.intent);

  // Build context
  const ctx = buildModelContext(analysis.context, analysis.domain);

  // Build constraints
  const constraints = buildModelConstraints(analysis.domain, analysis.strategy);

  // Build output format
  const outputFormat = buildModelOutputFormat(analysis.strategy, analysis.domain);

  // Build the complete prompt
  const prompt = buildPromptFromComponents({
    role,
    task,
    context: ctx,
    constraints,
    examples: '',
    outputFormat,
    input: adaptedInput,
  }, modelType);

  return {
    prompt,
    model: model.name,
    provider: model.provider,
    quality: {
      score: estimatePromptQuality(prompt, modelType),
      level: getQualityLevel(estimatePromptQuality(prompt, modelType)),
    },
  };
}

/**
 * Builds role definition optimized for model
 */
function buildModelRole(domain, intent, modelType) {
  const roles = {
    claude: {
      frontend: 'You are a senior frontend engineer with deep expertise in modern JavaScript frameworks, component architecture, accessibility (WCAG 2.1 AA), and performance optimization.',
      backend: 'You are a senior backend engineer with deep expertise in distributed systems, API design, database optimization, and microservices architecture.',
      database: 'You are a database architect with expert knowledge of SQL, NoSQL, query optimization, indexing strategies, and data modeling patterns.',
      devops: 'You are a DevOps engineer with expertise in CI/CD pipelines, infrastructure as code, containerization, and cloud-native deployment.',
      ml: 'You are a machine learning engineer with experience in model development, training pipelines, MLOps, and production deployment.',
      mobile: 'You are a mobile development expert specializing in cross-platform frameworks, native performance, and offline-first architecture.',
      api: 'You are an API design specialist focused on RESTful architecture, GraphQL schemas, OpenAPI specifications, and contract-first development.',
      fullstack: 'You are a full-stack architect capable of designing and implementing end-to-end solutions across frontend, backend, and infrastructure.',
      general: 'You are an expert software engineer with comprehensive knowledge of best practices, design patterns, and production-ready implementation.',
    },
    gemini: {
      frontend: 'Senior Frontend Engineer specializing in React, Vue, Angular, component design, performance optimization, and modern CSS.',
      backend: 'Senior Backend Engineer with expertise in Node.js, Python, Java, distributed systems, API design, and database optimization.',
      database: 'Database Architect with deep knowledge of SQL, NoSQL, query optimization, data modeling, and scalability patterns.',
      devops: 'DevOps Engineer specializing in Docker, Kubernetes, CI/CD, cloud infrastructure, and automation.',
      ml: 'Machine Learning Engineer experienced in model development, training pipelines, and production deployment.',
      mobile: 'Mobile Development Expert in React Native, Flutter, cross-platform development, and native optimization.',
      api: 'API Design Specialist focused on RESTful services, GraphQL, and contract-first development.',
      fullstack: 'Full-Stack Architect capable of end-to-end solution design and implementation.',
      general: 'Expert Software Engineer.',
    },
    codex: {
      frontend: 'Expert frontend engineer writing clean, optimized TypeScript/JavaScript with modern frameworks, accessibility, and performance best practices.',
      backend: 'Expert backend engineer writing production-ready code with proper error handling, typing, and layered architecture.',
      database: 'Expert database engineer designing schemas, queries, and optimizations for SQL and NoSQL systems.',
      devops: 'DevOps engineer automating infrastructure with Terraform, Docker, Kubernetes, and CI/CD pipelines.',
      ml: 'ML engineer implementing model training, inference pipelines, and production deployment.',
      mobile: 'Mobile engineer building performant cross-platform applications.',
      api: 'API engineer designing and implementing RESTful services and GraphQL APIs.',
      fullstack: 'Full-stack engineer implementing complete solutions.',
      general: 'Expert software engineer.',
    },
    universal: {
      frontend: 'Senior Frontend Engineer',
      backend: 'Senior Backend Engineer',
      database: 'Database Architect',
      devops: 'DevOps Engineer',
      ml: 'Machine Learning Engineer',
      mobile: 'Mobile Development Expert',
      api: 'API Design Specialist',
      fullstack: 'Full-Stack Architect',
      general: 'Software Engineer',
    },
  };

  return roles[modelType]?.[domain] || roles[modelType]?.general || roles.universal.general;
}

/**
 * Builds task definition optimized for model
 */
function buildModelTask(input, intent) {
  const prefixes = {
    create: 'Design and implement a complete, production-ready solution for',
    debug: 'Diagnose and resolve the following issue. Trace the root cause and provide a fix with explanation for',
    refactor: 'Refactor and improve the following code. Apply SOLID principles and design patterns for',
    migrate: 'Migrate the following to the target technology. Preserve behavior and document changes for',
    explain: 'Provide a clear, technical explanation of',
    test: 'Write comprehensive tests covering happy paths, edge cases, and error scenarios for',
    document: 'Generate complete documentation using appropriate format (JSDoc, OpenAPI, README) for',
    optimize: 'Analyze and optimize for performance and efficiency. Profile first, then optimize for',
    integrate: 'Implement integration between systems. Handle authentication, errors, and retries for',
    review: 'Conduct a thorough code review. Identify issues with correctness, security, and performance in',
    setup: 'Provide a complete setup guide with prerequisites and common pitfalls for',
    generate: 'Generate a production-ready artifact with proper typing and validation for',
  };

  const prefix = prefixes[intent] || 'Provide a solution for';
  return `${prefix}: ${input}`;
}

/**
 * Builds context section optimized for model
 */
function buildModelContext(context, domain) {
  if (!context?.hasExistingContext) {
    return 'No existing project context referenced.';
  }

  const refs = context.refs?.map(r => `${r.type}: ${r.raw}`).join(', ') || '';
  return `The user references existing artifacts: ${refs}. Adapt to the existing codebase structure.`;
}

/**
 * Builds constraints section optimized for model
 */
function buildModelConstraints(domain, strategy) {
  const constraints = {
    frontend: 'Use TypeScript. Components must be accessible (WCAG 2.1 AA). No inline styles. Include prop types or TypeScript interfaces.',
    backend: 'Apply layered architecture (controller → service → repository). Use async/await. Handle all error paths with proper logging.',
    database: 'Ensure proper indexing. Avoid N+1 queries. Include rollback logic in migrations. Use transactions where appropriate.',
    devops: 'Follow principle of least privilege. All secrets via environment variables. Use infrastructure as code.',
    ml: 'Separate data preparation, training, and inference. Document model inputs/outputs and expected performance metrics.',
    mobile: 'Handle iOS and Android edge cases. Consider offline state and network error recovery. Test on multiple device sizes.',
    api: 'API must be versioned. Validate all inputs. Return consistent error shapes with appropriate HTTP status codes.',
    fullstack: 'Maintain clear layer separation. Define shared data contracts (types/schemas) used across all layers.',
    general: 'Follow language-specific best practices. Prioritize readability, maintainability, and proper error handling.',
  };

  const base = constraints[domain] || constraints.general;

  const strategyAddons = {
    'step-by-step': 'Structure the response as numbered sequential steps.',
    'code-focused': 'Prioritize working code over prose. Include inline comments only where non-obvious.',
    architecture: 'Focus on component design, boundaries, data flows, and trade-offs.',
    debug: 'Follow: 1) reproduce error, 2) identify root cause, 3) apply fix, 4) add regression test.',
    migration: 'Provide migration checklist with before/after for each change.',
  };

  const strategyAddon = strategyAddons[strategy] || '';

  return [base, strategyAddon].filter(Boolean).join('\n');
}

/**
 * Builds output format section optimized for model
 */
function buildModelOutputFormat(strategy, domain) {
  const baseFormats = {
    create: 'Deliver production-ready code with type definitions, error handling, and documentation comments.',
    debug: 'Structure response as: 1) Root Cause, 2) Fix Applied, 3) Verification Steps.',
    refactor: 'Show before/after comparisons. Explain the design patterns applied and why.',
    migrate: 'Provide migration steps, any breaking changes, and rollback procedures.',
    explain: 'Use clear sections with examples. Include diagrams or code snippets where helpful.',
    test: 'Include unit tests, integration tests if applicable, and test coverage report.',
    document: 'Format as proper documentation: overview, usage, API reference, examples.',
    optimize: 'Show performance metrics before and after. Explain the optimization strategy.',
    integrate: 'Include setup instructions, authentication flow, error handling, and retry logic.',
    review: 'Organize feedback by category: correctness, security, performance, readability.',
    setup: 'Step-by-step guide with numbered steps, prerequisites, and expected outcomes.',
    generate: 'Produce complete, runnable artifact ready for integration.',
  };

  const format = baseFormats[strategy] || 'Provide a well-structured response with clear sections.';

  return `${format}\n\nUse markdown formatting with headers, code blocks, and bullet points where appropriate.`;
}

/**
 * Builds prompt from components using model-specific structure
 */
function buildPromptFromComponents(components, modelType) {
  const structures = {
    claude: {
      template: `<system>\n{role}\n\nCore Principles:\n- Think step-by-step before answering\n- Consider multiple perspectives\n- Acknowledge uncertainties\n- Provide reasoned explanations\n</system>\n\n<context>\n{context}\n</context>\n\n<task>\n{task}\n</task>\n\n<constraints>\n{constraints}\n</constraints>\n\n<examples>\n{examples}\n</examples>\n\n<output_requirements>\n{outputFormat}\n</output_requirements>\n\n<input>\n{input}\n</input>`,
    },
    gemini: {
      template: `## Role\n{role}\n\n## Task\n{task}\n\n## Context\n{context}\n\n## Constraints\n{constraints}\n\n## Examples\n{examples}\n\n## Output Format\n{outputFormat}\n\n## Input\n{input}`,
    },
    codex: {
      template: `SYSTEM:\n{role}\n\nKey Capabilities:\n- Write clean, production-ready code\n- Follow best practices and conventions\n- Handle edge cases proactively\n- Optimize for readability and maintainability\n\nUSER:\n## Objective\n{task}\n\n## Background\n{context}\n\n## Requirements\n{constraints}\n\n## Examples\n{examples}\n\n## Deliverable\n{outputFormat}\n\n## Starting Point\n{input}`,
    },
    universal: {
      template: `# SYSTEM INSTRUCTION\n{role}\n\n## MISSION\n{task}\n\n## SITUATIONAL CONTEXT\n{context}\n\n## OPERATIONAL CONSTRAINTS\n{constraints}\n\n## REFERENCE EXAMPLES\n{examples}\n\n## SUCCESS CRITERIA\n{outputFormat}\n\n## EXECUTION INPUT\n{input}\n\n---\n*Generate response following the structure above.*`,
    },
  };

  const structure = structures[modelType?.toLowerCase()] || structures.universal;

  return structure.template
    .replace('{role}', components.role || '')
    .replace('{task}', components.task || '')
    .replace('{context}', components.context || '')
    .replace('{constraints}', components.constraints || '')
    .replace('{examples}', components.examples || '')
    .replace('{outputFormat}', components.outputFormat || '')
    .replace('{input}', components.input || '');
}

/**
 * Estimates prompt quality for a model
 * @param {string} prompt - Generated prompt
 * @param {string} modelType - Model type
 * @returns {number} - Quality score 0-100
 */
function estimatePromptQuality(prompt, modelType) {
  const model = MODEL_PROFILES[modelType?.toLowerCase()];
  if (!model) return 70;

  let score = 60;

  // Check for good instruction patterns
  const goodPatterns = model.instructionPatterns?.good || [];
  for (const pattern of goodPatterns) {
    if (pattern.test(prompt)) score += 5;
    if (score >= 95) break;
  }

  // Check for bad instruction patterns
  const badPatterns = model.instructionPatterns?.bad || [];
  for (const pattern of badPatterns) {
    if (pattern.test(prompt)) score -= 15;
  }

  // Structure bonus
  if (prompt.includes('#') || prompt.includes('##')) score += 5;
  if (prompt.includes('```')) score += 5;

  return Math.max(Math.min(score, 100), 0);
}

/**
 * Gets quality level string
 */
function getQualityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Gets available model types
 * @returns {string[]} - List of model type names
 */
function getAvailableModels() {
  return Object.keys(MODEL_PROFILES);
}

/**
 * Gets model profile by type
 * @param {string} modelType - Model type
 * @returns {object|null} - Model profile or null
 */
function getModelProfile(modelType) {
  return MODEL_PROFILES[modelType?.toLowerCase()] || null;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export {
  MODEL_PROFILES,
  adaptPromptForModel,
  generateOptimizedPrompt,
  applyAdaptationRules,
  calculateBudget,
  estimatePromptQuality,
  getQualityLevel,
  getAvailableModels,
  getModelProfile,
};