import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function withIsolatedStorage(testFn) {
  const originalCwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'prompt-generator-storage-'));

  try {
    process.chdir(tempDir);
    const moduleUrl = new URL('../dist/packages/storage/src/index.js', import.meta.url).href;
    const storage = await import(`${moduleUrl}?case=${Date.now()}-${Math.random()}`);
    await testFn(storage, tempDir);
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
}

test('storage: creates preferences file with defaults when missing', async () => {
  await withIsolatedStorage(async (storage, tempDir) => {
    const preferences = await storage.readPreferences();

    assert.deepEqual(preferences, storage.defaultPreferences);

    const raw = await readFile(path.join(tempDir, 'data', 'preferences.json'), 'utf8');
    assert.deepEqual(JSON.parse(raw), storage.defaultPreferences);
  });
});

test('storage: saves preferences with atomic JSON output', async () => {
  await withIsolatedStorage(async (storage, tempDir) => {
    const preferences = await storage.savePreferences({
      detailLevel: 'high',
      includeAssumptions: false,
    });

    assert.equal(preferences.detailLevel, 'high');
    assert.equal(preferences.includeAssumptions, false);

    const raw = await readFile(path.join(tempDir, 'data', 'preferences.json'), 'utf8');
    assert.equal(JSON.parse(raw).detailLevel, 'high');
    assert.equal(raw.endsWith('\n'), true);
  });
});

test('storage: backs up corrupt JSON and restores fallback data', async () => {
  await withIsolatedStorage(async (storage, tempDir) => {
    const dataDir = path.join(tempDir, 'data');
    await storage.readPreferences();
    await writeFile(path.join(dataDir, 'preferences.json'), '{ broken json', 'utf8');

    const preferences = await storage.readPreferences();
    assert.deepEqual(preferences, storage.defaultPreferences);

    const files = await readdir(dataDir);
    assert.ok(files.some((file) => file.startsWith('preferences.json.corrupt-') && file.endsWith('.bak')));

    const restoredRaw = await readFile(path.join(dataDir, 'preferences.json'), 'utf8');
    assert.deepEqual(JSON.parse(restoredRaw), storage.defaultPreferences);
  });
});

test('storage: keeps generation history capped at 100 entries', async () => {
  await withIsolatedStorage(async (storage) => {
    for (let index = 0; index < 105; index += 1) {
      await storage.saveGeneration({
        requestId: `request-${index}`,
        createdAt: new Date(index).toISOString(),
        inputOriginal: `input ${index}`,
        normalizedInput: `input ${index}`,
        intent: 'code_generation',
        domain: 'general',
        strategy: 'default',
        generationProfile: 'generic',
        projectReferences: [],
        classificationConfidence: 'medium',
        matchedSignals: [],
        ambiguityLevel: 'low',
        needsClarification: false,
        clarificationQuestions: [],
        assumptions: [],
        synthesis: {
          summary: 'summary',
          primaryGoal: 'goal',
          workMode: 'implementation',
          evidenceMode: 'none',
          requestedActions: [],
          requestedDeliverables: [],
          preferredStack: [],
          constraints: [],
          qualityTargets: [],
        },
        generatedPrompts: [],
        suggestedNextInputs: [],
        warnings: [],
        preferencesApplied: storage.defaultPreferences,
      });
    }

    const history = await storage.readHistory(150);
    assert.equal(history.length, 100);
    assert.equal(history[0].requestId, 'request-104');
    assert.equal(history.at(-1).requestId, 'request-5');
  });
});
