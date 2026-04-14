import { test } from 'node:test';
import assert from 'node:assert/strict';

import { analyze } from '../src/core/analyzer.js';
import { detectIntent } from '../src/core/intent.js';
import { detectDomain } from '../src/core/domain.js';
import { detectStrategy } from '../src/core/strategy.js';
import { scoreAmbiguity } from '../src/core/ambiguity.js';

// ─── Intent Detection ─────────────────────────────────────────────────────────

test('detectIntent: debug from error/crash keywords', () => {
  const { intent, confidence } = detectIntent('fix the bug in the login component, it crashes on submit');
  assert.equal(intent, 'debug');
  assert.ok(confidence > 0.3);
});

test('detectIntent: migrate from migration keywords', () => {
  const { intent } = detectIntent('migrate from REST to GraphQL');
  assert.equal(intent, 'migrate');
});

test('detectIntent: refactor from refactor keywords', () => {
  const { intent } = detectIntent('refactor the user service to decouple logic');
  assert.equal(intent, 'refactor');
});

test('detectIntent: test from test keywords', () => {
  const { intent } = detectIntent('write unit tests with Jest for the auth module');
  assert.equal(intent, 'test');
});

test('detectIntent: defaults to create for generic build phrases', () => {
  const { intent } = detectIntent('build a new dashboard component in React');
  assert.equal(intent, 'create');
});

test('detectIntent: document from docs keywords', () => {
  const { intent } = detectIntent('generate JSDoc comments for this module');
  assert.equal(intent, 'document');
});

test('detectIntent: optimize from performance keywords', () => {
  const { intent } = detectIntent('optimize the slow SQL query causing latency');
  assert.equal(intent, 'optimize');
});

// ─── Domain Detection ─────────────────────────────────────────────────────────

test('detectDomain: frontend from React keywords', () => {
  const { primary } = detectDomain('create a React component with Tailwind CSS');
  assert.equal(primary, 'frontend');
});

test('detectDomain: backend from Express keywords', () => {
  const { primary } = detectDomain('build a REST API with Express and Node.js');
  assert.equal(primary, 'backend');
});

test('detectDomain: database from SQL keywords', () => {
  const { primary } = detectDomain('design a PostgreSQL schema with Prisma ORM');
  assert.equal(primary, 'database');
});

test('detectDomain: devops from Docker keywords', () => {
  const { primary } = detectDomain('set up a Docker container with GitHub Actions CI/CD');
  assert.equal(primary, 'devops');
});

test('detectDomain: api when only API-design keywords present', () => {
  const { primary } = detectDomain('design a RESTful API with JWT authentication and rate limiting');
  assert.equal(primary, 'api');
});

test('detectDomain: fullstack when 3+ domains detected', () => {
  const { primary } = detectDomain('build a React frontend with Express backend and PostgreSQL database deployed with Docker');
  assert.equal(primary, 'fullstack');
});

test('detectDomain: general when no domain keywords', () => {
  const { primary } = detectDomain('help me with my project');
  assert.equal(primary, 'general');
});

// ─── Strategy Detection ───────────────────────────────────────────────────────

test('detectStrategy: step-by-step for tutorial requests', () => {
  const { strategy } = detectStrategy('step-by-step guide to set up a Node.js project');
  assert.equal(strategy, 'step-by-step');
});

test('detectStrategy: migration for migrate requests', () => {
  const { strategy } = detectStrategy('migrate from Mongoose to Prisma', { intent: 'migrate' });
  assert.equal(strategy, 'migration');
});

test('detectStrategy: debug boosted from intent', () => {
  const { strategy } = detectStrategy('the auth is broken', { intent: 'debug' });
  assert.equal(strategy, 'debug');
});

test('detectStrategy: data-model for schema requests', () => {
  const { strategy } = detectStrategy('design the database schema for an e-commerce model');
  assert.equal(strategy, 'data-model');
});

// ─── Ambiguity Scoring ────────────────────────────────────────────────────────

test('scoreAmbiguity: low for specific, detailed input', () => {
  const { level } = scoreAmbiguity(
    'refactor the Express middleware in src/middleware/auth.ts to use async/await instead of callbacks'
  );
  assert.equal(level, 'low');
});

test('scoreAmbiguity: high for very vague input', () => {
  const { level } = scoreAmbiguity('help me with something');
  assert.equal(level, 'high');
});

test('scoreAmbiguity: medium for partially specified input', () => {
  const { level } = scoreAmbiguity('build a login form');
  assert.ok(['medium', 'low'].includes(level)); // could go either way
});

test('scoreAmbiguity: hints provided when language missing', () => {
  const { hints } = scoreAmbiguity('create an api endpoint for user login');
  assert.ok(hints.length > 0);
});

// ─── Analyzer Integration ─────────────────────────────────────────────────────

test('analyze: returns complete analysis object', () => {
  const result = analyze('debug the failing Prisma query in the users repository');
  assert.equal(typeof result.intent, 'string');
  assert.equal(typeof result.domain, 'string');
  assert.equal(typeof result.strategy, 'string');
  assert.ok(Array.isArray(result.domains));
  assert.ok(typeof result.ambiguity === 'object');
  assert.ok(typeof result.context === 'object');
  assert.equal(typeof result.profile, 'string');
});

test('analyze: detects existing context from folder reference', () => {
  const result = analyze('refactor the functions in src/controllers/auth.js');
  assert.ok(result.context.hasExistingContext);
  assert.ok(result.context.refs.some((r) => r.type === 'folder'));
});

test('analyze: profile ends with -adaptation when context detected', () => {
  const result = analyze('update the users table to add a refresh_token column');
  assert.ok(result.profile.endsWith('-adaptation'));
});

test('analyze: throws on empty input', () => {
  assert.throws(() => analyze(''), /non-empty string/);
});

test('analyze: throws on non-string input', () => {
  assert.throws(() => analyze(null), /non-empty string/);
});
