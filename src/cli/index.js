#!/usr/bin/env node

/**
 * prompt-gen CLI
 * Usage:
 *   prompt-gen "tu pedido"              # single-shot
 *   prompt-gen                         # interactive
 *   prompt-gen "pedido" --style technical --detail high
 */

import readline from 'readline';
import { generatePromptResult } from '../../packages/core/src/index.js';

const BANNER = `
╔════════════════════════════════════════════════════════╗
║       prompt-gen — Intelligent Prompt Generator    ║
║  Commands: :quit  :clear  :help  :history            ║
║  Flags:   --style    --detail   --json              ║
╚════════════════════════════════════════════════════════╝
`;

const HELP = `
Usage:
  prompt-gen "tu pedido"              single-shot
  prompt-gen "pedido" --style technical  --style: technical|concise|detailed
  prompt-gen "pedido" --detail high      --detail: low|medium|high
  prompt-gen "pedido" --json            --json: output as JSON
  prompt-gen "pedido" --no-assumptions  --no-assumptions: skip assumptions

Commands:
  :quit      Exit
  :clear     Clear
  :help      Help
  :history  Show session history
`;

function parseArgs(args) {
  const result = {
    message: '',
    preferences: { detailLevel: 'medium', outputStyle: 'concise', includeAssumptions: true },
    json: false,
  };
  
  const filtered = args.filter(arg => {
    if (arg.startsWith('--style=')) {
      result.preferences.outputStyle = arg.replace('--style=', '');
      return false;
    }
    if (arg.startsWith('--detail=')) {
      result.preferences.detailLevel = arg.replace('--detail=', '');
      return false;
    }
    if (arg === '--json') {
      result.json = true;
      return false;
    }
    if (arg === '--no-assumptions') {
      result.preferences.includeAssumptions = false;
      return false;
    }
    return true;
  });
  
  result.message = filtered.join(' ');
  return result;
}

async function singleShot(input) {
  const args = parseArgs(input.split(' '));
  if (!args.message.trim()) {
    console.log('Error: provide a message');
    process.exit(1);
  }
  
  try {
    const result = await generatePromptResult({
      message: args.message,
      preferences: args.preferences,
    });
    
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    
    console.log('\n── Classification ──────────────────────────────────────────────');
    console.log(`  Intent   : ${result.intent}`);
    console.log(`  Domain   : ${result.domain}`);
    console.log(`  Strategy : ${result.strategy}`);
    console.log(`  Profile  : ${result.generationProfile}`);
    console.log(`  Confidence: ${result.classificationConfidence}`);
    
    if (result.synthesis?.primaryGoal) {
      console.log('\n── Synthesis ────────────────────────────────────────────────');
      console.log(`  Goal: ${result.synthesis.primaryGoal}`);
    }
    
    console.log('\n── Generated Prompts ─────────────────────────────────────────');
    result.generatedPrompts.forEach((p, i) => {
      console.log(`\n### ${p.label} (${p.kind})`);
      console.log(p.content.substring(0, 800) + (p.content.length > 800 ? '\n...' : ''));
    });
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function interactiveMode() {
  console.log(BANNER);
  
  const history = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n> ',
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) { rl.prompt(); return; }
    
    if (trimmed === ':quit') {
      console.log('Goodbye!');
      process.exit(0);
    }
    if (trimmed === ':clear') {
      process.stdout.write('\x1Bc');
      rl.prompt();
      return;
    }
    if (trimmed === ':help') {
      console.log(HELP);
      rl.prompt();
      return;
    }
    if (trimmed === ':history') {
      if (history.length === 0) console.log('  (no history)');
      else history.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
      rl.prompt();
      return;
    }
    
    history.push(trimmed);
    await singleShot(trimmed);
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

const args = process.argv.slice(2);
if (args.length > 0 && !args[0].startsWith(':')) {
  singleShot(args.join(' '));
} else {
  interactiveMode();
}