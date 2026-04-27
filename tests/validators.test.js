import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateFeedbackRequest,
  validatePreferencesRequest,
  validatePromptRequest,
} from '../dist/packages/validators/src/index.js';

// These tests exercise the TypeScript validator package through the compiled build.

test('validatePromptRequest: accepts and normalizes valid generate requests', () => {
  const result = validatePromptRequest({
    message: '  Crear una API REST con JWT  ',
    contextMessages: [' contexto previo ', '', 'otro contexto'],
    sessionId: ' session-1 ',
    presetId: '',
    preferences: {
      detailLevel: 'high',
      outputStyle: 'technical',
      includeFileStructure: true,
      includeAssumptions: false,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.message, 'Crear una API REST con JWT');
  assert.deepEqual(result.value.contextMessages, ['contexto previo', 'otro contexto']);
  assert.equal(result.value.sessionId, 'session-1');
  assert.equal(result.value.presetId, null);
  assert.equal(result.value.preferences?.detailLevel, 'high');
});

test('validatePromptRequest: rejects missing or invalid generate request fields', () => {
  const result = validatePromptRequest({
    message: '',
    contextMessages: ['ok', 123],
    preferences: {
      detailLevel: 'max',
      outputStyle: 'verbose',
      includeFileStructure: 'yes',
    },
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('message')));
  assert.ok(result.errors.some((error) => error.includes('contextMessages[1]')));
  assert.ok(result.errors.some((error) => error.includes('preferences.detailLevel')));
  assert.ok(result.errors.some((error) => error.includes('preferences.outputStyle')));
  assert.ok(result.errors.some((error) => error.includes('preferences.includeFileStructure')));
});

test('validatePreferencesRequest: accepts partial preference updates', () => {
  const result = validatePreferencesRequest({
    detailLevel: 'low',
    includeAssumptions: true,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    detailLevel: 'low',
    includeAssumptions: true,
  });
});

test('validatePreferencesRequest: rejects invalid preference values', () => {
  const result = validatePreferencesRequest({
    outputStyle: 'longform',
    includeFileStructure: 1,
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('preferences.outputStyle')));
  assert.ok(result.errors.some((error) => error.includes('preferences.includeFileStructure')));
});

test('validateFeedbackRequest: accepts valid feedback', () => {
  const result = validateFeedbackRequest({
    requestId: ' req-1 ',
    value: 'useful',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    requestId: 'req-1',
    value: 'useful',
  });
});

test('validateFeedbackRequest: rejects invalid feedback', () => {
  const result = validateFeedbackRequest({
    requestId: '',
    value: 'great',
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('requestId')));
  assert.ok(result.errors.some((error) => error.includes('value')));
});
