#!/usr/bin/env node

/**
 * prompt-gen CLI
 * Usage:
 *   prompt-gen "tu pedido"              single-shot
 *   prompt-gen                         # interactive
 *   prompt-gen "pedido" --style technical
 *   prompt-gen "pedido" --detail high
 *   prompt-gen "pedido" --json
 *   prompt-gen "pedido" -o output.txt
 *   prompt-gen "pedido" --output-file my-prompt.txt
 *   prompt-gen "pedido" --model claude
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { generatePromptResult } from '../../packages/core/src/index.js';
import { generateForModel, getAvailableModels } from '../generator/index.js';

const STYLE_ALIASES = {
  detailed: 'technical',
  technical: 'technical',
  concise: 'concise',
  balanced: 'balanced',
  step_by_step: 'step_by_step',
  'step-by-step': 'step_by_step',
};

const DETAIL_LEVELS = new Set(['low', 'medium', 'high']);

const BANNER = `
╔════════════════════════════════════════════════════════╗
║       prompt-gen — Intelligent Prompt Generator       ║
║  Commands: :quit  :clear  :help  :history            ║
║  Flags:   --style    --detail   --json   -o   --model║
╚════════════════════════════════════════════════════════╝
`;

const HELP = `
Usage:
  prompt-gen "tu pedido"                    single-shot
  prompt-gen "pedido" --style technical    --style: technical|concise|balanced|step_by_step
  prompt-gen "pedido" --detail high        --detail: low|medium|high
  prompt-gen "pedido" --json               output as JSON
  prompt-gen "pedido" -o file.txt          save to file
  prompt-gen "pedido" --no-assumptions     skip assumptions
  prompt-gen "pedido" --model gemini       --model: gemini|claude|codex|universal

Model-Specific Optimization:
  --model <type>    Use model-adapter algorithm
                   Available: ${getAvailableModels().join(', ')}

Commands:
  :quit       Exit
  :clear      Clear screen
  :help       Show this help
  :history    Show session history
  :models     List available models

Examples:
  prompt-gen "migrate from express to fastify" --style technical
  prompt-gen "debug the login bug" --json -o debug-prompt.txt
  prompt-gen "create a react component" --model claude
  prompt-gen "build an API" --model gemini --json
`;

function consumeValue(args, index, flagName) {
  const next = args[index + 1];
  if (!next || next.startsWith('-')) {
    throw new Error(`Missing value for ${flagName}`);
  }
  return next;
}

function normalizeStyle(value) {
  const normalized = String(value).trim().toLowerCase();
  const mapped = STYLE_ALIASES[normalized];

  if (!mapped) {
    throw new Error(`Invalid --style value: ${value}`);
  }

  return mapped;
}

function normalizeDetail(value) {
  const normalized = String(value).trim().toLowerCase();

  if (!DETAIL_LEVELS.has(normalized)) {
    throw new Error(`Invalid --detail value: ${value}`);
  }

  return normalized;
}

function parseArgs(argv) {
  const result = {
    messageParts: [],
    preferences: {
      detailLevel: 'medium',
      outputStyle: 'concise',
      includeFileStructure: true,
      includeAssumptions: true,
      targetModel: 'universal',
    },
    json: false,
    outputFile: null,
    useModelAdapter: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--json') {
      result.json = true;
      continue;
    }

    if (arg === '--no-assumptions') {
      result.preferences.includeAssumptions = false;
      continue;
    }

    if (arg === '--style') {
      const value = consumeValue(argv, index, '--style');
      result.preferences.outputStyle = normalizeStyle(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--style=')) {
      result.preferences.outputStyle = normalizeStyle(arg.slice('--style='.length));
      continue;
    }

    if (arg === '--detail') {
      const value = consumeValue(argv, index, '--detail');
      result.preferences.detailLevel = normalizeDetail(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--detail=')) {
      result.preferences.detailLevel = normalizeDetail(arg.slice('--detail='.length));
      continue;
    }

    if (arg === '--model') {
      const value = consumeValue(argv, index, '--model');
      result.preferences.targetModel = value;
      result.useModelAdapter = true;
      index += 1;
      continue;
    }

    if (arg.startsWith('--model=')) {
      result.preferences.targetModel = arg.slice('--model='.length);
      result.useModelAdapter = true;
      continue;
    }

    if (arg === '-o' || arg === '--output-file' || arg === '--output') {
      result.outputFile = consumeValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('-o=')) {
      result.outputFile = arg.slice('-o='.length);
      continue;
    }

    if (arg.startsWith('--output-file=')) {
      result.outputFile = arg.slice('--output-file='.length);
      continue;
    }

    if (arg.startsWith('--output=')) {
      result.outputFile = arg.slice('--output='.length);
      continue;
    }

    result.messageParts.push(arg);
  }

  return {
    ...result,
    message: result.messageParts.join(' ').trim(),
  };
}

function writeOutput(content, filePath) {
  try {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function formatConfidence(value) {
  if (typeof value === 'number') {
    return `${(value * 100).toFixed(0)}%`;
  }

  return value || 'n/a';
}

function formatOutput(result, style = 'concise') {
  if (style === 'json') {
    return JSON.stringify(result, null, 2);
  }

  let output = '';

  if (style === 'technical' || style === 'step_by_step') {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                    CLASSIFICATION                            ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    output += `  Intent             : ${result.intent}\n`;
    output += `  Domain             : ${result.domain}\n`;
    output += `  Strategy           : ${result.strategy}\n`;
    output += `  Profile            : ${result.generationProfile}\n`;
    output += `  Confidence         : ${formatConfidence(result.classificationConfidence)}\n`;

    if (result.synthesis?.primaryGoal) {
      output += '\n╔══════════════════════════════════════════════════════════════╗\n';
      output += '║                       SYNTHESIS                              ║\n';
      output += '╚══════════════════════════════════════════════════════════════╝\n';
      output += `  Primary Goal    : ${result.synthesis.primaryGoal}\n`;
      output += `  Work Mode       : ${result.synthesis.workMode || 'n/a'}\n`;
      output += `  Evidence Mode   : ${result.synthesis.evidenceMode || 'n/a'}\n`;
      if (result.synthesis.constraints?.length > 0) {
        output += `  Constraints     : ${result.synthesis.constraints.join(', ')}\n`;
      }
    }
  } else {
    output += `[${result.intent}] ${result.domain} · ${result.strategy}\n`;
    if (result.synthesis?.primaryGoal) {
      output += `Goal: ${result.synthesis.primaryGoal}\n`;
    }
  }

  if (result.needsClarification && result.clarificationQuestions?.length > 0) {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                 CLARIFICATION NEEDED                         ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    result.clarificationQuestions.forEach((question) => {
      output += `  ? ${question.label}\n`;
    });
  }

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                    GENERATED PROMPTS                         ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';

  if (!result.generatedPrompts?.length) {
    output += '\n(no prompts generated)\n';
  } else {
    result.generatedPrompts.forEach((prompt) => {
      output += `\n── ${prompt.label} (${prompt.kind}) ──\n`;
      output += `${prompt.content}\n`;
    });
  }

  if (result.suggestedNextInputs?.length > 0) {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                    SUGGESTED NEXT INPUTS                     ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    result.suggestedNextInputs.forEach((suggestion) => {
      output += `  → ${suggestion}\n`;
    });
  }

  return output;
}

function formatModelAdapterOutput(result) {
  if (!result.optimized) {
    return result.adapted.prompt;
  }

  const { optimized, modelInfo } = result;

  let output = '';
  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║               MODEL-SPECIFIC ADAPTATION                      ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  output += `  Target Model   : ${optimized.model}\n`;
  output += `  Provider       : ${optimized.provider}\n`;
  output += `  Quality Score  : ${optimized.quality.score}/100 (${optimized.quality.level})\n`;

  if (modelInfo?.contextWindow) {
    output += `  Context Window : ${(modelInfo.contextWindow / 1000).toLocaleString()}K tokens\n`;
  }
  if (modelInfo?.maxOutputTokens) {
    output += `  Max Output     : ${(modelInfo.maxOutputTokens / 1024).toFixed(1)}K tokens\n`;
  }

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                    GENERATED PROMPT                         ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  output += `${optimized.prompt}\n`;

  if (modelInfo?.strengths?.length) {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                      STRENGTHS                              ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    modelInfo.strengths.forEach((strength) => {
      output += `  ✦ ${strength}\n`;
    });
  }

  return output;
}

async function singleShot(argv) {
  const args = parseArgs(Array.isArray(argv) ? argv : String(argv).split(' '));

  if (!args.message) {
    throw new Error('Provide a message. Use --help for usage.');
  }

  let outputContent;

  if (args.useModelAdapter) {
    const modelResult = generateForModel(args.message, args.preferences.targetModel, { fullPrompt: true });
    outputContent = formatModelAdapterOutput(modelResult);
  } else {
    const result = await generatePromptResult({
      message: args.message,
      preferences: args.preferences,
    });
    const outputStyle = args.json ? 'json' : args.preferences.outputStyle;
    outputContent = formatOutput(result, outputStyle);
  }

  if (args.outputFile) {
    const success = writeOutput(outputContent, args.outputFile);
    if (!success) {
      throw new Error(`Could not write to ${args.outputFile}`);
    }
    console.log(`\n✅ Prompt saved to: ${args.outputFile}`);
    console.log(`   (${fs.statSync(args.outputFile).size} bytes)`);
  } else {
    console.log(outputContent);
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
    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed === ':quit' || trimmed === ':q' || trimmed === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }
    if (trimmed === ':clear' || trimmed === ':c') {
      process.stdout.write('\x1Bc');
      rl.prompt();
      return;
    }
    if (trimmed === ':help' || trimmed === ':h' || trimmed === '?') {
      console.log(HELP);
      rl.prompt();
      return;
    }
    if (trimmed === ':history' || trimmed === ':hist') {
      if (history.length === 0) {
        console.log('  (no history)');
      } else {
        history.forEach((item, index) => console.log(`  ${index + 1}. ${item.substring(0, 80)}${item.length > 80 ? '...' : ''}`));
      }
      rl.prompt();
      return;
    }
    if (trimmed === ':models') {
      const models = getAvailableModels();
      console.log('  Available models for --model flag:');
      models.forEach((model) => console.log(`    - ${model}`));
      rl.prompt();
      return;
    }

    history.push(trimmed);
    try {
      await singleShot([trimmed]);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

const args = process.argv.slice(2);

if (args.length === 0) {
  interactiveMode();
} else if (args[0] === '--help' || args[0] === '-h' || args[0] === '?') {
  console.log(HELP);
} else if (!args[0].startsWith(':')) {
  singleShot(args).catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
} else {
  interactiveMode();
}
