import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const cliPath = path.join(repoRoot, 'src', 'cli', 'index.js');

function runCli(args, options = {}) {
  return spawnSync(process.execPath, ['--import', 'tsx', cliPath, ...args], {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1',
    },
  });
}

test('cli: --json outputs valid core result JSON', () => {
  const result = runCli(['crear una landing moderna en React con Tailwind CSS', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);

  assert.equal(parsed.intent, 'code_generation');
  assert.equal(parsed.domain, 'react');
  assert.equal(parsed.generationProfile, 'modern_modular_landing');
  assert.ok(Array.isArray(parsed.generatedPrompts));
  assert.ok(parsed.generatedPrompts.length > 0);
});

test('cli: --style technical works when flag value is separated', () => {
  const result = runCli(['crear una landing moderna en React con Tailwind CSS', '--style', 'technical']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CLASSIFICATION/);
  assert.match(result.stdout, /Confidence\s+:\s+high/);
  assert.match(result.stdout, /SYNTHESIS/);
});

test('cli: --style=technical works when flag value uses equals syntax', () => {
  const result = runCli(['crear una landing moderna en React con Tailwind CSS', '--style=technical']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CLASSIFICATION/);
  assert.match(result.stdout, /GENERATED PROMPTS/);
});

test('cli: writes output file with -o', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'prompt-generator-cli-'));

  try {
    const outputFile = path.join(tempDir, 'prompt.md');
    const result = runCli(['crear una API REST con JWT', '-o', outputFile]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Prompt saved to/);

    const written = await readFile(outputFile, 'utf8');
    assert.match(written, /GENERATED PROMPTS/);
    assert.match(written, /api|backend/i);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('cli: exits with error for invalid style', () => {
  const result = runCli(['crear algo', '--style', 'invalid-style']);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid --style value/);
});
