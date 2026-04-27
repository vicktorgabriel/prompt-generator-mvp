import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const fixtures = JSON.parse(
  await readFile(new URL('./fixtures/core-cases.json', import.meta.url), 'utf8'),
);

async function withCore(testFn) {
  const originalCwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'prompt-generator-core-'));

  try {
    process.chdir(tempDir);
    const moduleUrl = new URL('../dist/packages/core/src/index.js', import.meta.url).href;
    const core = await import(`${moduleUrl}?case=${Date.now()}-${Math.random()}`);
    await testFn(core, tempDir);
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
}

test('packages/core: fixture cases classify into expected semantic buckets', async () => {
  await withCore(async ({ classifyInput, normalizeInput, resolvePromptStrategy, resolveGenerationProfile }) => {
    for (const fixture of fixtures) {
      const normalizedInput = normalizeInput(fixture.message, []);
      const classification = classifyInput(normalizedInput);
      const strategy = resolvePromptStrategy({
        normalizedInput,
        intent: classification.intent,
        domain: classification.domain,
        projectReferences: classification.projectReferences,
      });
      const generationProfile = resolveGenerationProfile({
        normalizedInput,
        intent: classification.intent,
        domain: classification.domain,
        strategy,
      });

      if (fixture.expected.intent) {
        assert.equal(classification.intent, fixture.expected.intent, fixture.name);
      }
      if (fixture.expected.domain) {
        assert.equal(classification.domain, fixture.expected.domain, fixture.name);
      }
      if (fixture.expected.strategy) {
        assert.equal(strategy, fixture.expected.strategy, fixture.name);
      }
      if (fixture.expected.generationProfile) {
        assert.equal(generationProfile, fixture.expected.generationProfile, fixture.name);
      }
    }
  });
});

test('packages/core: generatePromptResult returns actionable prompts for concrete requests', async () => {
  await withCore(async ({ generatePromptResult }) => {
    const result = await generatePromptResult({
      message: 'crear una landing moderna en React con Tailwind CSS y TypeScript, hero, navbar, cards y diseño responsive',
      preferences: {
        detailLevel: 'high',
        outputStyle: 'technical',
      },
    });

    assert.equal(result.intent, 'code_generation');
    assert.equal(result.domain, 'react');
    assert.equal(result.strategy, 'implement_new');
    assert.equal(result.generationProfile, 'modern_modular_landing');
    assert.ok(result.generatedPrompts.length >= 1);
    assert.ok(result.generatedPrompts[0].content.includes('Objetivo'));
    assert.ok(result.synthesis.preferredStack.includes('React'));
    assert.ok(result.synthesis.preferredStack.includes('Tailwind CSS'));
    assert.ok(result.synthesis.preferredStack.includes('TypeScript'));
  });
});

test('packages/core: high ambiguity requests ask for clarification and skip prompt generation', async () => {
  await withCore(async ({ generatePromptResult }) => {
    const result = await generatePromptResult({ message: 'ayudame con mi app' });

    assert.equal(result.ambiguityLevel, 'high');
    assert.equal(result.needsClarification, true);
    assert.ok(result.clarificationQuestions.length > 0);
    assert.equal(result.generatedPrompts.length, 0);
  });
});

test('packages/core: migration requests force inspection and adaptation language', async () => {
  await withCore(async ({ generatePromptResult }) => {
    const result = await generatePromptResult({
      message: 'migrar el repo existente de Mongoose a Prisma en src/models sin rehacer todo desde cero',
    });

    assert.equal(result.strategy, 'migrate_existing_system');
    assert.equal(result.generationProfile, 'existing_system_migration');
    assert.ok(result.projectReferences.includes('src/models'));
    assert.ok(result.synthesis.constraints.some((item) => item.includes('evidencia real')));
    assert.ok(result.generatedPrompts.some((prompt) => /inspecciona|revisa primero|estructura real/i.test(prompt.content)));
  });
});
