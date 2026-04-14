'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { detectContextRefs } = require('../src/core/context');

// ─── Context Reference Detection ─────────────────────────────────────────────

test('detectContextRefs: detects GitHub repo URL', () => {
  const { refs, hasExistingContext } = detectContextRefs(
    'add a feature to https://github.com/vicktorgabriel/prompt-generator'
  );
  assert.ok(hasExistingContext);
  assert.ok(refs.some((r) => r.type === 'repo'));
});

test('detectContextRefs: detects "this repo" reference', () => {
  const { refs } = detectContextRefs('refactor this repo to use TypeScript');
  assert.ok(refs.some((r) => r.type === 'repo'));
});

test('detectContextRefs: detects folder path reference', () => {
  const { refs } = detectContextRefs('update the logic in src/controllers/user.js');
  assert.ok(refs.some((r) => r.type === 'folder'));
});

test('detectContextRefs: detects API URL reference', () => {
  const { refs } = detectContextRefs('integrate with https://api.example.com/api/v1/users');
  assert.ok(refs.some((r) => r.type === 'api'));
});

test('detectContextRefs: detects existing table reference', () => {
  const { refs } = detectContextRefs('add a new column to the users table');
  assert.ok(refs.some((r) => r.type === 'table'));
});

test('detectContextRefs: detects model reference', () => {
  const { refs } = detectContextRefs('extend the User model to include a refresh token field');
  assert.ok(refs.some((r) => r.type === 'model'));
});

test('detectContextRefs: detects config file reference', () => {
  const { refs } = detectContextRefs('update the jest.config to add coverage thresholds');
  assert.ok(refs.some((r) => r.type === 'config'));
});

test('detectContextRefs: detects React component reference', () => {
  const { refs } = detectContextRefs('fix the bug in the <UserCard /> component');
  assert.ok(refs.some((r) => r.type === 'component'));
});

test('detectContextRefs: returns no refs for generic input', () => {
  const { refs, hasExistingContext } = detectContextRefs('build a login page');
  assert.equal(hasExistingContext, false);
  assert.equal(refs.length, 0);
});

test('detectContextRefs: detects multiple context types simultaneously', () => {
  const { refs } = detectContextRefs(
    'in the users table, update the User model using src/models/user.js'
  );
  const types = refs.map((r) => r.type);
  assert.ok(types.includes('table') || types.includes('model') || types.includes('folder'));
  assert.ok(refs.length >= 2);
});

test('detectContextRefs: detects .env config reference', () => {
  const { refs } = detectContextRefs('make sure the .env file has the correct database URL');
  assert.ok(refs.some((r) => r.type === 'config'));
});
