/**
 * Prompt template fragments.
 * Each fragment is a function that receives the analysis object and returns a string.
 * Templates are combined by the builder based on intent + strategy + profile.
 */

// ─── ROLE PREAMBLES ──────────────────────────────────────────────────────────

const ROLES = {
  frontend: 'You are an experienced frontend engineer specializing in modern JavaScript frameworks.',
  backend: 'You are a senior backend engineer with deep expertise in server-side architecture.',
  database: 'You are a database architect with strong knowledge of relational and non-relational systems.',
  devops: 'You are a DevOps engineer experienced in containerization, CI/CD pipelines, and cloud infrastructure.',
  mobile: 'You are a mobile developer with expertise in cross-platform and native development.',
  ml: 'You are a machine learning engineer with hands-on experience in model development and deployment.',
  api: 'You are an API design expert with deep knowledge of RESTful principles, GraphQL, and contract-first development.',
  fullstack: 'You are a full-stack engineer comfortable across frontend, backend, and infrastructure layers.',
  general: 'You are an expert software engineer.',
};

// ─── INTENT DIRECTIVES ───────────────────────────────────────────────────────

const INTENT_DIRECTIVES = {
  create: (a) => `Build a complete, production-ready implementation for the following requirement, considering edge cases and error handling:`,
  debug: (a) => `Diagnose and resolve the following issue. Trace the likely root cause before suggesting fixes:`,
  refactor: (a) => `Refactor the following code to improve maintainability, readability, and adherence to SOLID principles without changing external behavior:`,
  migrate: (a) => `Migrate the following from its current implementation to the target technology. Preserve existing behavior and document breaking changes:`,
  explain: (a) => `Provide a clear, technical explanation of the following concept, including practical examples:`,
  test: (a) => `Write comprehensive tests for the following, covering happy paths, edge cases, and error scenarios:`,
  document: (a) => `Generate complete, accurate documentation for the following, using appropriate format (JSDoc, OpenAPI, README):`,
  optimize: (a) => `Analyze and optimize the following for performance, resource efficiency, or scalability. Profile first, then optimize with justification:`,
  integrate: (a) => `Implement the integration between the following systems or services, handling authentication, error propagation, and retry logic:`,
  review: (a) => `Conduct a thorough code review of the following. Identify issues with correctness, security, performance, and maintainability:`,
  setup: (a) => `Provide a complete, step-by-step setup guide for the following environment or project. Include prerequisites and common pitfalls:`,
  generate: (a) => `Generate the following artifact with proper typing, validation, and documentation. Ensure it is ready for production use:`,
};

// ─── STRATEGY MODIFIERS ──────────────────────────────────────────────────────

const STRATEGY_MODIFIERS = {
  'step-by-step': `
Structure the response as numbered sequential steps. Each step must be self-contained and actionable.`,
  'code-focused': `
Prioritize working, runnable code over prose. Include inline comments only where non-obvious.`,
  architecture: `
Focus on system design: components, boundaries, data flows, and trade-offs. Include a high-level diagram description.`,
  review: `
Organize feedback by category: correctness, security, performance, readability. Use specific line references.`,
  migration: `
Provide a migration checklist. For each changed piece, show before/after. Flag any breaking changes.`,
  debug: `
Follow this structure: 1) reproduce the error, 2) identify root cause, 3) apply fix, 4) add a regression test.`,
  documentation: `
Use the standard documentation format for the detected language/framework. Include types, params, return values, and examples.`,
  'data-model': `
Design the schema with proper normalization, indexes, and constraints. Include migration SQL or ORM definition.`,
};

// ─── CONTEXT ADAPTATION DIRECTIVE ────────────────────────────────────────────

function contextDirective(context) {
  if (!context.hasExistingContext) return '';

  const refDescriptions = context.refs.map((r) => `${r.type} (${r.raw})`).join(', ');
  return `
IMPORTANT: The user references existing artifacts: ${refDescriptions}.
Adapt to the existing codebase — do NOT invent structure. Inspect what is already there and build on it.`;
}

// ─── AMBIGUITY DIRECTIVE ─────────────────────────────────────────────────────

function ambiguityDirective(ambiguity) {
  if (ambiguity.level === 'low') return '';

  const hintsText = ambiguity.hints.length > 0 ? `\nConsiderations: ${ambiguity.hints.join(' ')}` : '';

  if (ambiguity.level === 'high') {
    return `
The request is underspecified. Generate two prompt variants:
- Variant A: interpret as [most common / narrowest meaning]
- Variant B: interpret as [broader / alternative meaning]
${hintsText}`;
  }

  return `
The request has some ambiguity. State your assumptions before proceeding.${hintsText}`;
}

// ─── DOMAIN CONSTRAINTS ──────────────────────────────────────────────────────

const DOMAIN_CONSTRAINTS = {
  frontend: `Use TypeScript unless specified otherwise. Components must be accessible (WCAG 2.1 AA). Avoid inline styles.`,
  backend: `Apply layered architecture (controller → service → repository). Use async/await. Handle all error paths.`,
  database: `Ensure proper indexing strategy. Avoid N+1 queries. Include rollback logic in migrations.`,
  devops: `Follow the principle of least privilege. All secrets must use environment variables, not hardcoded values.`,
  mobile: `Handle both iOS and Android edge cases. Consider offline state and network error recovery.`,
  ml: `Separate data preparation, training, and inference. Document model inputs/outputs and expected performance.`,
  api: `API must be versioned. Validate all inputs. Return consistent error shapes with appropriate HTTP status codes.`,
  fullstack: `Maintain clear separation between layers. Define data contracts (types/schemas) shared across layers.`,
  general: `Follow language-specific best practices. Prioritize readability and maintainability.`,
};

export {
  ROLES,
  INTENT_DIRECTIVES,
  STRATEGY_MODIFIERS,
  DOMAIN_CONSTRAINTS,
  contextDirective,
  ambiguityDirective,
};
