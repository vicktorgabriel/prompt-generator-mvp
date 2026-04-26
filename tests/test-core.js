/**
 * Unit tests for the core semantic engine
 * Run with: node tests/test-core.js
 */

import { detectIntent } from '../src/core/intent.js';
import { detectDomain } from '../src/core/domain.js';
import { detectStrategy } from '../src/core/strategy.js';
import { scoreAmbiguity } from '../src/core/ambiguity.js';
import { detectContextRefs } from '../src/core/context.js';
import { analyze } from '../src/core/analyzer.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function assertContains(actual, expected, message = '') {
  if (!actual.includes(expected)) {
    throw new Error(`${message}\nExpected to contain: ${expected}\nActual: ${actual}`);
  }
}

console.log('\n🧪 Running Core Engine Tests\n');
console.log('─'.repeat(50));

// ============================================
// INTENT DETECTION TESTS
// ============================================

console.log('\n📌 Intent Detection\n');

test('detectIntent: debug intent', () => {
  const { intent, confidence } = detectIntent('fix the login bug in auth.js');
  assertEqual(intent, 'debug');
});

test('detectIntent: migrate intent', () => {
  const { intent, confidence } = detectIntent('migrate from express to fastify');
  assertEqual(intent, 'migrate');
});

test('detectIntent: refactor intent', () => {
  const { intent, confidence } = detectIntent('refactor the user service to use dependency injection');
  assertEqual(intent, 'refactor');
});

test('detectIntent: optimize intent', () => {
  const { intent, confidence } = detectIntent('optimize the database query performance');
  assertEqual(intent, 'optimize');
});

test('detectIntent: test intent', () => {
  const { intent, confidence } = detectIntent('write unit tests for the payment module');
  assertEqual(intent, 'test');
});

test('detectIntent: document intent', () => {
  const { intent, confidence } = detectIntent('add documentation for the API endpoints');
  assertEqual(intent, 'document');
});

test('detectIntent: explain intent', () => {
  const { intent, confidence } = detectIntent('explain how the authentication flow works');
  assertEqual(intent, 'explain');
});

test('detectIntent: review intent', () => {
  const { intent, confidence } = detectIntent('review my code and give feedback');
  assertEqual(intent, 'review');
});

test('detectIntent: integrate intent', () => {
  const { intent, confidence } = detectIntent('integrate stripe payment gateway');
  assertEqual(intent, 'integrate');
});

test('detectIntent: setup intent', () => {
  const { intent, confidence } = detectIntent('set up a new Node.js project');
  assertEqual(intent, 'setup');
});

test('detectIntent: generate intent', () => {
  const { intent, confidence } = detectIntent('generate typescript types for the API response');
  assertEqual(intent, 'generate');
});

test('detectIntent: create intent (fallback)', () => {
  const { intent, confidence } = detectIntent('build a landing page');
  assertEqual(intent, 'create');
});

test('detectIntent: create with higher weight (build keyword)', () => {
  const { intent, confidence } = detectIntent('build a REST API with authentication');
  assertEqual(intent, 'create');
});

test('detectIntent: confidence is between 0 and 1', () => {
  const { confidence } = detectIntent('fix the bug in the database query');
  if (confidence < 0 || confidence > 1) {
    throw new Error(`Confidence should be between 0 and 1, got ${confidence}`);
  }
});

// ============================================
// DOMAIN DETECTION TESTS
// ============================================

console.log('\n🌐 Domain Detection\n');

test('detectDomain: react frontend', () => {
  const { primary, all } = detectDomain('create a react component with hooks');
  assertEqual(primary, 'frontend');
});

test('detectDomain: node backend', () => {
  const { primary, all } = detectDomain('build an express API endpoint');
  assertEqual(primary, 'backend');
});

test('detectDomain: postgres database', () => {
  const { primary, all } = detectDomain('write a SQL query to join users and orders');
  assertEqual(primary, 'database');
});

test('detectDomain: docker devops', () => {
  const { primary, all } = detectDomain('deploy with docker and kubernetes');
  assertEqual(primary, 'devops');
});

test('detectDomain: react native mobile', () => {
  const { primary, all } = detectDomain('build a react native mobile app for iOS');
  assertEqual(primary, 'mobile');
});

test('detectDomain: ML domain', () => {
  const { primary, all } = detectDomain('train a machine learning model with pytorch');
  assertEqual(primary, 'ml');
});

test('detectDomain: Next.js framework', () => {
  const { primary, all } = detectDomain('create a next.js application with API routes');
  assertEqual(primary, 'frontend');
  assertContains(all.join(','), 'frontend');
});

test('detectDomain: Astro framework', () => {
  const { primary, all } = detectDomain('build an astro website with islands architecture');
  assertEqual(primary, 'frontend');
});

test('detectDomain: Rust backend', () => {
  const { primary, all } = detectDomain('create an actix web API in rust');
  assertEqual(primary, 'backend');
});

test('detectDomain: Elixir Phoenix', () => {
  const { primary, all } = detectDomain('build a phoenix framework API in elixir');
  assertEqual(primary, 'backend');
});

test('detectDomain: Supabase database', () => {
  const { primary, all } = detectDomain('set up supabase for authentication');
  assertEqual(primary, 'database');
});

test('detectDomain: LangChain ML', () => {
  const { primary, all } = detectDomain('build a RAG system with langchain');
  assertEqual(primary, 'ml');
});

test('detectDomain: fullstack when 3+ domains', () => {
  const { primary, all } = detectDomain('react frontend with node backend and postgresql database');
  assertEqual(primary, 'fullstack');
});

test('detectDomain: general when no match', () => {
  const { primary, all } = detectDomain('do something generic');
  assertEqual(primary, 'general');
  assertEqual(all, []);
});

// ============================================
// STRATEGY DETECTION TESTS
// ============================================

console.log('\n🎯 Strategy Detection\n');

test('detectStrategy: step-by-step', () => {
  const { strategy } = detectStrategy('how to set up a new project from scratch');
  assertEqual(strategy, 'step-by-step');
});

test('detectStrategy: migration', () => {
  const { strategy } = detectStrategy('migrate from Mongoose to Prisma');
  assertEqual(strategy, 'migration');
});

test('detectStrategy: debug', () => {
  const { strategy } = detectStrategy('debug why the API is returning 500 errors');
  assertEqual(strategy, 'debug');
});

test('detectStrategy: architecture', () => {
  const { strategy } = detectStrategy('what is the best folder structure for this project');
  assertEqual(strategy, 'architecture');
});

test('detectStrategy: documentation', () => {
  const { strategy } = detectStrategy('document the API endpoints with swagger');
  assertEqual(strategy, 'documentation');
});

test('detectStrategy: data-model', () => {
  const { strategy } = detectStrategy('design the database schema for a SaaS app');
  assertEqual(strategy, 'data-model');
});

// ============================================
// AMBIGUITY SCORING TESTS
// ============================================

console.log('\n❓ Ambiguity Scoring\n');

test('scoreAmbiguity: high ambiguity for short input', () => {
  const { score, level } = scoreAmbiguity('fix it');
  if (level !== 'high' && level !== 'medium') {
    throw new Error(`Expected high or medium ambiguity for short input, got ${level}`);
  }
});

test('scoreAmbiguity: low ambiguity for specific input', () => {
  const { score, level } = scoreAmbiguity('write a typescript function that accepts a string parameter and returns a Promise<void>');
  if (level !== 'low') {
    throw new Error(`Expected low ambiguity for specific input, got ${level}`);
  }
});

test('scoreAmbiguity: score is between 0 and 1', () => {
  const { score } = scoreAmbiguity('create a web app');
  if (score < 0 || score > 1) {
    throw new Error(`Score should be between 0 and 1, got ${score}`);
  }
});

test('scoreAmbiguity: hints are provided for ambiguous input', () => {
  const { hints } = scoreAmbiguity('build something cool');
  if (!Array.isArray(hints) || hints.length === 0) {
    throw new Error('Hints should be provided for ambiguous input');
  }
});

test('scoreAmbiguity: no hints for clear input', () => {
  const { hints } = scoreAmbiguity('create an express REST API with JWT authentication');
  if (hints.some(h => h.includes('programming language'))) {
    throw new Error('Should not ask for programming language when already specified');
  }
});

// ============================================
// CONTEXT DETECTION TESTS
// ============================================

console.log('\n📎 Context Detection\n');

test('detectContextRefs: GitHub URL', () => {
  const { refs, hasExistingContext } = detectContextRefs('clone https://github.com/user/repo');
  const hasRepo = refs.some(r => r.type === 'repo');
  if (!hasRepo) throw new Error('Should detect GitHub URL as repo');
});

test('detectContextRefs: folder path', () => {
  const { refs, hasExistingContext } = detectContextRefs('add a component to src/components');
  const hasFolder = refs.some(r => r.type === 'folder');
  if (!hasFolder) throw new Error('Should detect folder path');
});

test('detectContextRefs: file path with extension', () => {
  const { refs, hasExistingContext } = detectContextRefs('fix the bug in src/utils/helper.ts');
  const hasFile = refs.some(r => r.type === 'file');
  if (!hasFile) throw new Error('Should detect file path');
});

test('detectContextRefs: package.json', () => {
  const { refs } = detectContextRefs('update the package.json dependencies');
  const hasFile = refs.some(r => r.type === 'file' && r.raw.includes('package'));
  if (!hasFile) throw new Error('Should detect package.json');
});

test('detectContextRefs: .env file', () => {
  const { refs } = detectContextRefs('add a new environment variable to .env');
  const hasConfig = refs.some(r => r.type === 'config');
  if (!hasConfig) throw new Error('Should detect .env as config');
});

test('detectContextRefs: relative path', () => {
  const { refs } = detectContextRefs('import from ./utils/helpers.js');
  const hasFile = refs.some(r => r.type === 'file');
  if (!hasFile) throw new Error('Should detect relative path');
});

test('detectContextRefs: no context in generic input', () => {
  const { hasExistingContext } = detectContextRefs('create a new website');
  if (hasExistingContext) {
    throw new Error('Should not detect context in generic input');
  }
});

// ============================================
// ANALYZER INTEGRATION TESTS
// ============================================

console.log('\n🔗 Analyzer Integration\n');

test('analyze: full analysis of debug request', () => {
  const result = analyze('debug the 500 error in the /api/users endpoint');

  if (result.intent !== 'debug') throw new Error(`Expected intent 'debug', got '${result.intent}'`);
  if (result.domain !== 'backend') throw new Error(`Expected domain 'backend', got '${result.domain}'`);
  if (result.strategy !== 'debug') throw new Error(`Expected strategy 'debug', got '${result.strategy}'`);
  if (!result.hasOwnProperty('ambiguity')) throw new Error('Should have ambiguity property');
  if (!result.hasOwnProperty('context')) throw new Error('Should have context property');
});

test('analyze: full analysis of migration request', () => {
  const result = analyze('migrate from Mongoose to Prisma in src/models');

  if (result.intent !== 'migrate') throw new Error(`Expected intent 'migrate', got '${result.intent}'`);
  if (result.domain !== 'database') throw new Error(`Expected domain 'database', got '${result.domain}'`);
  if (result.context.hasExistingContext !== true) throw new Error('Should detect existing context');
});

test('analyze: rejects empty input', () => {
  try {
    analyze('');
    throw new Error('Should throw on empty input');
  } catch (err) {
    if (!err.message.includes('non-empty')) {
      throw new Error('Error message should mention non-empty string');
    }
  }
});

test('analyze: rejects non-string input', () => {
  try {
    analyze(123);
    throw new Error('Should throw on non-string input');
  } catch (err) {
    if (!err.message.includes('non-empty')) {
      throw new Error('Error message should mention non-empty string');
    }
  }
});

test('analyze: profile resolution with context', () => {
  const result = analyze('refactor the user controller in src/controllers');

  if (result.profile !== 'backend-adaptation') {
    throw new Error(`Expected profile 'backend-adaptation', got '${result.profile}'`);
  }
});

test('analyze: profile resolution without context', () => {
  const result = analyze('create a new express API');

  if (result.profile !== 'backend') {
    throw new Error(`Expected profile 'backend', got '${result.profile}'`);
  }
});

// ============================================
// EDGE CASES
// ============================================

console.log('\n⚡ Edge Cases\n');

test('detectIntent: handles special characters', () => {
  const { intent } = detectIntent('fix the @#$% bug');
  assertEqual(intent, 'debug');
});

test('detectDomain: handles case insensitivity', () => {
  const { primary } = detectDomain('REACT COMPONENT WITH VITE AND TAILWIND');
  assertEqual(primary, 'frontend');
});

test('detectContextRefs: handles complex file paths', () => {
  const { refs } = detectContextRefs('edit /home/user/project/src/components/Button.tsx:12');
  const hasFile = refs.some(r => r.type === 'file');
  if (!hasFile) throw new Error('Should detect complex file path');
});

test('scoreAmbiguity: handles very long input', () => {
  const longInput = 'create a function that accepts a user object with id, name, email, and role properties. The function should validate each field and return a promise that resolves to the validated user or rejects with an error message if any field is invalid. Use typescript strict mode.';
  const { score, level } = scoreAmbiguity(longInput);
  if (level !== 'low') throw new Error('Long specific input should have low ambiguity');
});

// ============================================
// SUMMARY
// ============================================

console.log('\n' + '─'.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
