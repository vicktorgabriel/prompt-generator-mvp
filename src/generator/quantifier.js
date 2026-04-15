/**
 * Prompt Quantifier & Multi-Model Structure Generator
 * Analyzes and generates prompts following best practices from:
 * - Google Gemini (clear structure, explicit constraints, examples)
 * - Anthropic Claude (XML tags, role definition, step-by-step reasoning)
 * - OpenAI Codex/GPT-4 (system/assistant/user roles, few-shot examples)
 * - GitHub Copilot (context-aware, inline comments, specific patterns)
 */

// ─── MODEL-SPECIFIC STRUCTURES ───────────────────────────────────────────────

/**
 * Gemini-style prompt structure
 * Characteristics:
 * - Clear sections with markdown headers
 * - Explicit task definition upfront
 * - Constraints listed as bullet points
 * - Examples in code blocks
 * - Output format specification
 */
const GEMINI_STRUCTURE = {
  template: `## Role
{role}

## Task
{task}

## Context
{context}

## Constraints
{constraints}

## Examples
{examples}

## Output Format
{outputFormat}

## Input
{input}`,

  weights: {
    role: 0.15,
    task: 0.25,
    context: 0.15,
    constraints: 0.20,
    examples: 0.15,
    outputFormat: 0.10,
  },

  guidelines: [
    'Start with clear role definition',
    'State task explicitly in first section',
    'Use bullet points for constraints',
    'Include at least one concrete example',
    'Specify exact output format expected',
    'End with actual input to process',
  ],
};

/**
 * Claude-style prompt structure
 * Characteristics:
 * - XML-like tags for structure
 * - Detailed system instructions
 * - Step-by-step reasoning requests
 * - Explicit thinking process
 * - Comprehensive context sections
 */
const CLAUDE_STRUCTURE = {
  template: `<system>
{role}

Core Principles:
- Think step-by-step before answering
- Consider multiple perspectives
- Acknowledge uncertainties
- Provide reasoned explanations
</system>

<context>
{context}
</context>

<task>
{task}
</task>

<constraints>
{constraints}
</constraints>

<examples>
{examples}
</examples>

<output_requirements>
{outputFormat}
</output_requirements>

<input>
{input}
</input>`,

  weights: {
    role: 0.20,
    context: 0.20,
    task: 0.25,
    constraints: 0.15,
    examples: 0.10,
    outputFormat: 0.10,
  },

  guidelines: [
    'Use XML tags for clear separation',
    'Define core principles in system section',
    'Request step-by-step reasoning explicitly',
    'Separate context from task clearly',
    'Include output requirements section',
    'Encourage acknowledgment of uncertainty',
  ],
};

/**
 * Codex/GPT-4 style prompt structure
 * Characteristics:
 * - System/Assistant/User role separation
 * - Few-shot learning examples
 * - Concise, direct instructions
 * - Code-focused when applicable
 * - Pattern-matching oriented
 */
const CODEX_STRUCTURE = {
  systemMessage: `{role}

Key Capabilities:
- Write clean, production-ready code
- Follow best practices and conventions
- Handle edge cases proactively
- Optimize for readability and maintainability`,

  userTemplate: `## Objective
{task}

## Background
{context}

## Requirements
{constraints}

## Examples
{examples}

## Deliverable
{outputFormat}

## Starting Point
{input}`,

  assistantPriming: `I'll help you with this task. Let me break down the requirements and provide a comprehensive solution.`,

  weights: {
    role: 0.18,
    task: 0.22,
    context: 0.15,
    constraints: 0.20,
    examples: 0.15,
    outputFormat: 0.10,
  },

  guidelines: [
    'Separate system message from user input',
    'Use clear section headers',
    'Include few-shot examples when possible',
    'Be specific about deliverables',
    'Prime with assistant response pattern',
    'Focus on actionable requirements',
  ],
};

/**
 * Universal enhanced structure (hybrid approach)
 * Combines best elements from all models
 */
const UNIVERSAL_STRUCTURE = {
  template: `# SYSTEM INSTRUCTION
{role}

## MISSION
{task}

## SITUATIONAL CONTEXT
{context}

## OPERATIONAL CONSTRAINTS
{constraints}

## REFERENCE EXAMPLES
{examples}

## SUCCESS CRITERIA
{outputFormat}

## EXECUTION INPUT
{input}

---
*Generate response following the structure above. Think systematically and provide complete, production-ready output.*`,

  weights: {
    role: 0.18,
    task: 0.24,
    context: 0.16,
    constraints: 0.18,
    examples: 0.12,
    outputFormat: 0.12,
  },

  guidelines: [
    'Use hierarchical markdown structure',
    'Capitalize section headers for emphasis',
    'Include explicit success criteria',
    'Add meta-instruction at the end',
    'Balance specificity with flexibility',
    'Optimize for clarity and completeness',
  ],
};

// ─── QUANTIFICATION METRICS ──────────────────────────────────────────────────

/**
 * Calculates quality score for a generated prompt
 * @param {string} prompt - The generated prompt text
 * @param {object} metrics - Weights for different quality aspects
 * @returns {{score: number, breakdown: object}}
 */
function quantifyPrompt(prompt, metrics = {}) {
  const defaultMetrics = {
    structureWeight: 0.25,
    clarityWeight: 0.25,
    specificityWeight: 0.20,
    completenessWeight: 0.20,
    formattingWeight: 0.10,
  };

  const weights = { ...defaultMetrics, ...metrics };

  // Structure score (0-100)
  const structureScore = calculateStructureScore(prompt);

  // Clarity score (0-100)
  const clarityScore = calculateClarityScore(prompt);

  // Specificity score (0-100)
  const specificityScore = calculateSpecificityScore(prompt);

  // Completeness score (0-100)
  const completenessScore = calculateCompletenessScore(prompt);

  // Formatting score (0-100)
  const formattingScore = calculateFormattingScore(prompt);

  const overallScore =
    structureScore * weights.structureWeight +
    clarityScore * weights.clarityWeight +
    specificityScore * weights.specificityWeight +
    completenessScore * weights.completenessWeight +
    formattingScore * weights.formattingWeight;

  return {
    score: Math.round(overallScore * 10) / 10,
    breakdown: {
      structure: Math.round(structureScore * 10) / 10,
      clarity: Math.round(clarityScore * 10) / 10,
      specificity: Math.round(specificityScore * 10) / 10,
      completeness: Math.round(completenessScore * 10) / 10,
      formatting: Math.round(formattingScore * 10) / 10,
    },
    level: getQualityLevel(overallScore),
  };
}

function calculateStructureScore(prompt) {
  let score = 0;
  const maxScore = 100;

  // Check for clear sections (headers)
  const headerCount = (prompt.match(/^#{1,6}\s+/gm) || []).length;
  score += Math.min(headerCount * 15, 40);

  // Check for logical organization
  const hasRole = /role|system|you are/i.test(prompt);
  const hasTask = /task|objective|mission|goal/i.test(prompt);
  const hasConstraints = /constraint|requirement|rule|must/i.test(prompt);
  const hasOutput = /output|format|deliverable|result/i.test(prompt);

  score += hasRole ? 15 : 0;
  score += hasTask ? 15 : 0;
  score += hasConstraints ? 15 : 0;
  score += hasOutput ? 15 : 0;

  return Math.min(score, maxScore);
}

function calculateClarityScore(prompt) {
  let score = 100;
  const words = prompt.split(/\s+/).filter(w => w.length > 0);

  // Penalize overly complex sentences
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);

  if (avgSentenceLength > 30) score -= 20;
  else if (avgSentenceLength > 20) score -= 10;

  // Penalize vague language
  const vagueWords = ['maybe', 'perhaps', 'might', 'could', 'some', 'various', 'etc'];
  const vagueCount = vagueWords.filter(w => prompt.toLowerCase().includes(w)).length;
  score -= vagueCount * 5;

  // Reward active voice indicators
  const activeIndicators = ['will', 'must', 'should', 'do', 'create', 'build', 'implement'];
  const activeCount = activeIndicators.filter(w => prompt.toLowerCase().includes(w)).length;
  score += Math.min(activeCount * 3, 15);

  return Math.max(Math.min(score, 100), 0);
}

function calculateSpecificityScore(prompt) {
  let score = 50;

  // Reward specific technical terms
  const techPatterns = [
    /\b(TypeScript|JavaScript|Python|React|Node|API|REST|GraphQL|SQL|NoSQL)\b/i,
    /\b(component|function|module|class|interface|type)\b/i,
    /\b(test|spec|mock|stub|fixture)\b/i,
    /\b(error|exception|validation|authentication|authorization)\b/i,
  ];

  techPatterns.forEach(pattern => {
    if (pattern.test(prompt)) score += 10;
  });

  // Reward numerical specificity
  const numbers = prompt.match(/\d+/g) || [];
  score += Math.min(numbers.length * 5, 20);

  // Reward explicit constraints
  const constraintKeywords = ['must', 'required', 'cannot', 'never', 'always', 'only if'];
  constraintKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) score += 5;
  });

  return Math.min(score, 100);
}

function calculateCompletenessScore(prompt) {
  let baseScore = 40;

  // Check for essential components
  const components = [
    { pattern: /role|act as|you are/i, weight: 10 },
    { pattern: /task|objective|goal|purpose/i, weight: 15 },
    { pattern: /context|background|situation/i, weight: 10 },
    { pattern: /constraint|requirement|limitation/i, weight: 15 },
    { pattern: /example|sample|reference/i, weight: 10 },
    { pattern: /output|format|deliverable|result/i, weight: 10 },
    { pattern: /input|data|information/i, weight: 10 },
    { pattern: /step|process|method|approach/i, weight: 10 },
  ];

  components.forEach(comp => {
    if (comp.pattern.test(prompt)) baseScore += comp.weight;
  });

  return Math.min(baseScore, 100);
}

function calculateFormattingScore(prompt) {
  let score = 50;

  // Reward markdown usage
  const markdownFeatures = [
    { pattern: /^#{1,6}\s+/m, weight: 10 }, // Headers
    { pattern: /^\s*[-*]\s+/m, weight: 8 }, // Lists
    { pattern: /```[\s\S]*?```/, weight: 15 }, // Code blocks
    { pattern: /\*\*[^*]+\*\*/, weight: 5 }, // Bold
    { pattern: /`[^`]+`/, weight: 5 }, // Inline code
    { pattern: />.+$/m, weight: 5 }, // Blockquotes
    { pattern: /^\d+\.\s+/m, weight: 7 }, // Numbered lists
  ];

  markdownFeatures.forEach(feature => {
    if (feature.pattern.test(prompt)) score += feature.weight;
  });

  // Check for whitespace organization
  const blankLines = (prompt.match(/\n\s*\n/g) || []).length;
  if (blankLines >= 3) score += 10;

  return Math.min(score, 100);
}

function getQualityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

// ─── MULTI-MODEL PROMPT GENERATOR ────────────────────────────────────────────

/**
 * Generates prompts in multiple model-specific formats
 * @param {object} analysis - Analysis result from analyzer
 * @param {string[]} models - Array of model types ('gemini', 'claude', 'codex', 'universal')
 * @returns {object} Object with generated prompts for each model
 */
function generateMultiModelPrompts(analysis, models = ['universal']) {
  const results = {};

  const { intent, domain, strategy, ambiguity, context, input } = analysis;

  // Build common components
  const role = buildRoleDefinition(domain, intent);
  const task = buildTaskDefinition(input, intent);
  const ctx = buildContextSection(context, domain);
  const constraints = buildConstraintsSection(domain, strategy);
  const examples = buildExamplesSection(domain, intent);
  const outputFormat = buildOutputFormat(strategy, domain);

  models.forEach(modelType => {
    switch (modelType.toLowerCase()) {
      case 'gemini':
        results.gemini = generateGeminiPrompt({ role, task, context: ctx, constraints, examples, outputFormat, input });
        break;
      case 'claude':
        results.claude = generateClaudePrompt({ role, task, context: ctx, constraints, examples, outputFormat, input });
        break;
      case 'codex':
        results.codex = generateCodexPrompt({ role, task, context: ctx, constraints, examples, outputFormat, input });
        break;
      case 'universal':
      default:
        results.universal = generateUniversalPrompt({ role, task, context: ctx, constraints, examples, outputFormat, input });
        break;
    }
  });

  // Add quantification for each generated prompt
  Object.keys(results).forEach(model => {
    results[`${model}_quality`] = quantifyPrompt(results[model]);
  });

  return results;
}

function buildRoleDefinition(domain, intent) {
  const roleMap = {
    frontend: 'Senior Frontend Engineer specializing in modern JavaScript frameworks, component architecture, and performance optimization.',
    backend: 'Senior Backend Engineer with expertise in distributed systems, API design, and database optimization.',
    fullstack: 'Full-Stack Architect capable of designing and implementing end-to-end solutions across all layers of the stack.',
    devops: 'DevOps Engineer specializing in CI/CD pipelines, infrastructure as code, and cloud-native architectures.',
    database: 'Database Architect with deep knowledge of data modeling, query optimization, and scalability patterns.',
    ml: 'Machine Learning Engineer experienced in model development, training pipelines, and production deployment.',
    mobile: 'Mobile Development Expert specializing in cross-platform frameworks and native performance optimization.',
    api: 'API Design Specialist focused on RESTful architecture, GraphQL schemas, and contract-first development.',
    general: 'Expert Software Engineer with comprehensive knowledge of best practices across multiple domains.',
  };

  return roleMap[domain] || roleMap.general;
}

function buildTaskDefinition(input, intent) {
  const intentPrefixes = {
    create: 'Design and implement',
    debug: 'Analyze, diagnose, and resolve',
    refactor: 'Refactor and improve',
    migrate: 'Migrate and adapt',
    explain: 'Provide comprehensive explanation of',
    test: 'Develop comprehensive tests for',
    document: 'Create detailed documentation for',
    optimize: 'Analyze and optimize',
    integrate: 'Implement integration between',
    review: 'Conduct thorough code review of',
    setup: 'Establish complete setup for',
    generate: 'Generate production-ready',
  };

  const prefix = intentPrefixes[intent] || 'Work on';
  return `${prefix}: ${input.trim()}`;
}

function buildContextSection(context, domain) {
  if (!context.hasExistingContext) {
    return 'Greenfield implementation with no existing codebase constraints.';
  }

  const refDescriptions = context.refs.map(r => 
    `- Existing ${r.type}: ${r.raw}`
  ).join('\n');

  return `Working within existing codebase:\n${refDescriptions}\n\nMust maintain compatibility and follow established patterns.`;
}

function buildConstraintsSection(domain, strategy) {
  const baseConstraints = {
    frontend: [
      'Must be accessible (WCAG 2.1 AA compliance)',
      'Responsive design required',
      'Type-safe implementation (TypeScript preferred)',
      'Performance budget: < 100ms interaction latency',
    ],
    backend: [
      'Layered architecture (controller → service → repository)',
      'Comprehensive error handling',
      'Async/await patterns throughout',
      'Input validation on all endpoints',
    ],
    fullstack: [
      'Clear separation of concerns',
      'Shared type definitions',
      'API versioning strategy',
      'Security best practices (OWASP)',
    ],
    devops: [
      'Infrastructure as code',
      'Zero-downtime deployments',
      'Comprehensive monitoring',
      'Secret management via environment variables',
    ],
    general: [
      'Production-ready quality',
      'Comprehensive error handling',
      'Well-documented code',
      'Follow language/framework conventions',
    ],
  };

  const strategyAdditions = {
    'step-by-step': 'Present solution as numbered sequential steps',
    'code-focused': 'Prioritize working code over explanatory text',
    architecture: 'Include architectural diagrams and trade-off analysis',
    migration: 'Provide before/after comparisons and migration checklist',
    debug: 'Follow: reproduce → diagnose → fix → prevent',
  };

  const constraints = baseConstraints[domain] || baseConstraints.general;
  const strategyNote = strategyAdditions[strategy] || '';

  let result = constraints.map(c => `• ${c}`).join('\n');
  if (strategyNote) result += `\n\n• ${strategyNote}`;

  return result;
}

function buildExamplesSection(domain, intent) {
  const exampleMap = {
    frontend: `Example component structure:
\`\`\`typescript
interface Props { /* typed props */ }
export const Component: React.FC<Props> = ({ }) => {
  // Implementation
}`,
    backend: `Example API endpoint:
\`\`\`typescript
app.get('/resource/:id', async (req, res) => {
  try {
    const result = await service.getById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
    fullstack: `Example data flow:
Client → API Gateway → Service Layer → Repository → Database
                    ↓
              Response Cache`,
  };

  return exampleMap[domain] || 'Refer to industry best practices and established patterns for this domain.';
}

function buildOutputFormat(strategy, domain) {
  const formatMap = {
    'step-by-step': 'Numbered list with clear action items and code snippets for each step',
    'code-focused': 'Complete, runnable code blocks with minimal prose commentary',
    architecture: 'Textual diagram descriptions, component breakdown, and decision records',
    migration: 'Migration checklist, before/after code samples, breaking changes list',
    debug: 'Root cause analysis, fix implementation, prevention strategy, test case',
    default: 'Structured response with clear sections, code examples, and implementation guidance',
  };

  return formatMap[strategy] || formatMap.default;
}

function generateGeminiPrompt(components) {
  return GEMINI_STRUCTURE.template
    .replace('{role}', components.role)
    .replace('{task}', components.task)
    .replace('{context}', components.context)
    .replace('{constraints}', components.constraints)
    .replace('{examples}', components.examples)
    .replace('{outputFormat}', components.outputFormat)
    .replace('{input}', components.input);
}

function generateClaudePrompt(components) {
  return CLAUDE_STRUCTURE.template
    .replace('{role}', components.role)
    .replace('{task}', components.task)
    .replace('{context}', components.context)
    .replace('{constraints}', components.constraints)
    .replace('{examples}', components.examples)
    .replace('{outputFormat}', components.outputFormat)
    .replace('{input}', components.input);
}

function generateCodexPrompt(components) {
  const userPart = CODEX_STRUCTURE.userTemplate
    .replace('{role}', components.role)
    .replace('{task}', components.task)
    .replace('{context}', components.context)
    .replace('{constraints}', components.constraints)
    .replace('{examples}', components.examples)
    .replace('{outputFormat}', components.outputFormat)
    .replace('{input}', components.input);

  return {
    system: CODEX_STRUCTURE.systemMessage.replace('{role}', components.role),
    user: userPart,
    assistant_priming: CODEX_STRUCTURE.assistantPriming,
  };
}

function generateUniversalPrompt(components) {
  return UNIVERSAL_STRUCTURE.template
    .replace('{role}', components.role)
    .replace('{task}', components.task)
    .replace('{context}', components.context)
    .replace('{constraints}', components.constraints)
    .replace('{examples}', components.examples)
    .replace('{outputFormat}', components.outputFormat)
    .replace('{input}', components.input);
}

// ─── ENHANCEMENT UTILITIES ───────────────────────────────────────────────────

/**
 * Amplifies prompt quality by adding missing elements
 * @param {string} prompt - Original prompt
 * @param {object} options - Enhancement options
 * @returns {string} Enhanced prompt
 */
function amplifyPrompt(prompt, options = {}) {
  const defaults = {
    addReasoningSteps: true,
    addQualityCriteria: true,
    addEdgeCaseHandling: true,
    addValidationRules: true,
    increaseSpecificity: true,
  };

  const opts = { ...defaults, ...options };
  let enhanced = prompt;

  if (opts.addReasoningSteps && !/think step|reasoning|break down/i.test(enhanced)) {
    enhanced += '\n\n## Reasoning Process\nThink through this systematically:\n1. Analyze requirements thoroughly\n2. Identify potential edge cases\n3. Design optimal solution\n4. Implement with best practices\n5. Validate against constraints';
  }

  if (opts.addQualityCriteria && !/quality|success criteria|acceptance/i.test(enhanced)) {
    enhanced += '\n\n## Quality Standards\n- Production-ready code with zero warnings\n- Comprehensive error handling\n- Clear documentation\n- Testable architecture\n- Performance-conscious implementation';
  }

  if (opts.addEdgeCaseHandling && !/edge case|corner case|boundary/i.test(enhanced)) {
    enhanced += '\n\n## Edge Case Handling\nExplicitly address:\n- Empty/null inputs\n- Maximum boundary conditions\n- Error states and recovery\n- Concurrent access scenarios\n- Resource limitations';
  }

  if (opts.addValidationRules && !/validat|verify|check/i.test(enhanced)) {
    enhanced += '\n\n## Validation Requirements\n- Input sanitization and validation\n- Type safety enforcement\n- Runtime error checking\n- Output format verification\n- Integration contract validation';
  }

  if (opts.increaseSpecificity) {
    // Replace vague terms with specific ones
    enhanced = enhanced.replace(/\bgood\b/gi, 'production-grade, well-tested');
    enhanced = enhanced.replace(/\bproper\b/gi, 'industry-standard, documented');
    enhanced = enhanced.replace(/\bappropriate\b/gi, 'context-optimal, justified');
    enhanced = enhanced.replace(/\bhandle\b/gi, 'gracefully manage with error recovery');
  }

  return enhanced;
}

/**
 * Reduces basic/low-quality patterns in prompts
 * @param {string} prompt - Original prompt
 * @returns {string} Refined prompt
 */
function reduceBasicQuality(prompt) {
  let refined = prompt;

  // Remove filler phrases
  const fillers = [
    'please ',
    'can you ',
    'could you ',
    'i would like ',
    'i need ',
    'help me ',
    'try to ',
    'maybe ',
    'perhaps ',
  ];

  fillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}`, 'gi');
    refined = refined.replace(regex, '');
  });

  // Replace weak verbs with strong ones
  const verbReplacements = {
    'make': 'construct',
    'do': 'execute',
    'get': 'retrieve',
    'use': 'utilize',
    'fix': 'resolve',
    'change': 'modify',
    'show': 'demonstrate',
  };

  Object.entries(verbReplacements).forEach(([weak, strong]) => {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    refined = refined.replace(regex, strong);
  });

  // Remove hedging language
  const hedges = [
    'if possible',
    'if you can',
    'when appropriate',
    'as needed',
    'where relevant',
  ];

  hedges.forEach(hedge => {
    const regex = new RegExp(`\\s*,?\\s*${hedge}`, 'gi');
    refined = refined.replace(regex, '');
  });

  return refined;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export {
  quantifyPrompt,
  generateMultiModelPrompts,
  amplifyPrompt,
  reduceBasicQuality,
  GEMINI_STRUCTURE,
  CLAUDE_STRUCTURE,
  CODEX_STRUCTURE,
  UNIVERSAL_STRUCTURE,
};
