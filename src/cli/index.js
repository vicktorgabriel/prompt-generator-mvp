#!/usr/bin/env node

/**
 * prompt-gen CLI
 * Interactive command-line interface for the prompt generator.
 *
 * Usage:
 *   node src/cli/index.js
 *   prompt-gen                 # interactive mode
 *   prompt-gen "your input"    # single-shot mode
 */

import readline from 'readline';
import { generate } from '../generator/index.js';

const BANNER = `
╔══════════════════════════════════════════════════════╗
║       prompt-gen — Intelligent Prompt Generator      ║
║  Type your task, get structured technical prompts.   ║
║  Commands: :quit  :clear  :help  :history            ║
╚══════════════════════════════════════════════════════╝
`;

const HELP = `
Available commands:
  :quit      Exit the CLI
  :clear     Clear the screen
  :help      Show this help message
  :history   Show previous inputs from this session

Tip: Reference existing files, repos, APIs, or tables in your input
     so the generator can adapt to your actual project context.
`;

/** Format the analysis metadata for display */
function formatAnalysis(analysis) {
  const { intent, intentConfidence, domain, domains, strategy, ambiguity, context, profile } = analysis;

  const ctxRefs = context.refs.length > 0
    ? context.refs.map((r) => `${r.type}:${r.raw}`).join(', ')
    : 'none';

  const lines = [
    `  Intent   : ${intent} (confidence: ${(intentConfidence * 100).toFixed(0)}%)`,
    `  Domain   : ${domain}${domains.length > 1 ? ` [${domains.join(', ')}]` : ''}`,
    `  Strategy : ${strategy}`,
    `  Profile  : ${profile}`,
    `  Ambiguity: ${ambiguity.level} (score: ${ambiguity.score})`,
    `  Context  : ${ctxRefs}`,
  ];

  if (ambiguity.hints.length > 0) {
    lines.push(`  Hints    : ${ambiguity.hints[0]}`);
  }

  return lines.join('\n');
}

/** Print generated prompts with separators */
function printPrompts(prompts) {
  if (prompts.length === 1) {
    console.log('\n── Generated Prompt ─────────────────────────────────────────\n');
    console.log(prompts[0]);
    console.log('\n─────────────────────────────────────────────────────────────\n');
  } else {
    prompts.forEach((p, i) => {
      console.log(`\n── Prompt Variant ${i + 1} ──────────────────────────────────────────\n`);
      console.log(p);
    });
    console.log('\n─────────────────────────────────────────────────────────────\n');
  }
}

/** Process a single user input */
function processInput(input, history) {
  const trimmed = input.trim();

  if (!trimmed) return;

  // CLI commands
  if (trimmed === ':quit') {
    console.log('Goodbye!');
    process.exit(0);
  }
  if (trimmed === ':clear') {
    process.stdout.write('\x1Bc');
    return;
  }
  if (trimmed === ':help') {
    console.log(HELP);
    return;
  }
  if (trimmed === ':history') {
    if (history.length === 0) {
      console.log('  (no history yet)\n');
    } else {
      console.log('\nSession history:');
      history.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
      console.log();
    }
    return;
  }

  history.push(trimmed);

  try {
    const { analysis, prompts } = generate(trimmed);

    console.log('\n── Analysis ─────────────────────────────────────────────────');
    console.log(formatAnalysis(analysis));

    printPrompts(prompts);
  } catch (err) {
    console.error(`\nError: ${err.message}\n`);
  }
}

/** Single-shot mode: process CLI argument directly */
function singleShot(input) {
  try {
    const { analysis, prompts } = generate(input);
    console.log('\n── Analysis ─────────────────────────────────────────────────');
    console.log(formatAnalysis(analysis));
    printPrompts(prompts);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

/** Interactive REPL mode */
function interactiveMode() {
  console.log(BANNER);

  const history = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n> ',
    terminal: true,
  });

  rl.prompt();

  rl.on('line', (line) => {
    processInput(line, history);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length > 0 && !args[0].startsWith(':')) {
  singleShot(args.join(' '));
} else {
  interactiveMode();
}
