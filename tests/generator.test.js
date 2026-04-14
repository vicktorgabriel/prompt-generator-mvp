import { test } from 'node:test';
import assert from 'node:assert/strict';

import { generate } from '../src/generator/index.js';

// ─── generate() API ───────────────────────────────────────────────────────────

test('generate: returns analysis and prompts array', () => {
  const result = generate('create a login endpoint with Express and JWT');
  assert.ok(result.analysis);
  assert.ok(Array.isArray(result.prompts));
  assert.ok(result.prompts.length >= 1);
  assert.equal(typeof result.prompts[0], 'string');
});

test('generate: prompt is non-empty string', () => {
  const { prompts } = generate('build a REST API with Node.js and PostgreSQL');
  assert.ok(prompts[0].length > 50);
});

test('generate: prompt does not start by mechanically echoing the user input verbatim', () => {
  const input = 'create a React component for displaying user profiles';
  const { prompts } = generate(input);
  // The prompt should NOT start with the literal user input as the first line
  assert.ok(!prompts[0].trim().startsWith(input));
});

test('generate: prompt includes task section', () => {
  const { prompts } = generate('refactor the authentication middleware');
  assert.ok(prompts[0].includes('## Task'));
});

test('generate: prompt includes constraints section', () => {
  const { prompts } = generate('build a GraphQL API with Node.js');
  assert.ok(prompts[0].includes('## Constraints'));
});

test('generate: high ambiguity input produces two prompt variants', () => {
  const { prompts } = generate('help me with something');
  assert.equal(prompts.length, 2);
});

test('generate: low ambiguity input produces one prompt', () => {
  const { prompts } = generate(
    'write Jest unit tests for the UserService.findById() method in TypeScript covering null and not-found cases'
  );
  assert.equal(prompts.length, 1);
});

test('generate: includes context adaptation directive when folder referenced', () => {
  const { prompts } = generate('refactor src/services/auth.js to use async/await');
  assert.ok(prompts[0].includes('existing artifacts') || prompts[0].includes('Adapt to'));
});

test('generate: includes role preamble', () => {
  const { prompts } = generate('create a React component for a data table');
  const knownRoles = [
    'frontend engineer',
    'backend engineer',
    'database architect',
    'DevOps engineer',
    'mobile developer',
    'machine learning engineer',
    'API design expert',
    'full-stack engineer',
    'expert software engineer',
  ];
  const hasRole = knownRoles.some((r) => prompts[0].includes(r));
  assert.ok(hasRole, `Expected a role preamble in: ${prompts[0].slice(0, 120)}`);
});

test('generate: debug strategy includes debug structure hint', () => {
  const { prompts, analysis } = generate('fix the null pointer exception in the payment service');
  assert.equal(analysis.intent, 'debug');
  // The debug strategy modifier should mention root cause
  assert.ok(prompts[0].toLowerCase().includes('root cause') || prompts[0].toLowerCase().includes('diagnose'));
});

test('generate: migration produces migration checklist hint', () => {
  const { prompts } = generate('migrate the project from Mongoose to Prisma ORM');
  assert.ok(
    prompts[0].toLowerCase().includes('migrat') || prompts[0].toLowerCase().includes('checklist')
  );
});

test('generate: cleans filler phrases from task description', () => {
  const { prompts } = generate('please create a login form with React');
  // "please create a" should be stripped from the task description
  // The task section should NOT start with "Please create a login..."
  const taskIdx = prompts[0].indexOf('## Task');
  assert.ok(taskIdx !== -1);
  const afterTask = prompts[0].slice(taskIdx + 8).trim();
  assert.ok(!afterTask.toLowerCase().startsWith('please'));
});

test('generate: throws on empty string input', () => {
  assert.throws(() => generate(''), /non-empty string/);
});
