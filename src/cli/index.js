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
 *   prompt-gen "pedido" --model claude    # use model-adapter
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { generatePromptResult } from '../../packages/core/src/index.js';
import { generateForModel, generateForAllModels, getAvailableModels } from '../../src/generator/index.js';

const BANNER = `
╔════════════════════════════════════════════════════════╗
║       prompt-gen — Intelligent Prompt Generator    ║
║  Commands: :quit  :clear  :help  :history            ║
║  Flags:   --style    --detail   --json   -o   --model║
╚════════════════════════════════════════════════════════╝
`;

const HELP = `
Usage:
  prompt-gen "tu pedido"              single-shot
  prompt-gen "pedido" --style technical  --style: technical|concise|detailed
  prompt-gen "pedido" --detail high      --detail: low|medium|high
  prompt-gen "pedido" --json            --json: output as JSON
  prompt-gen "pedido" -o file.txt       --output-file: save to file
  prompt-gen "pedido" --no-assumptions  skip assumptions
  prompt-gen "pedido" --model gemini     --model: gemini|claude|codex|universal

Model-Specific Optimization:
  --model <type>    Use heavy model-adapter algorithm
                   Available: ${getAvailableModels().join(', ')}

Commands:
  :quit       Exit
  :clear      Clear screen
  :help       Show this help
  :history    Show session history
  :models     List available models
  :compare    Generate for all models

Examples:
  prompt-gen "migrate from express to fastify" --style technical
  prompt-gen "debug the login bug" --json -o debug-prompt.txt
  prompt-gen "create a react component" --model claude
  prompt-gen "build an API" --model gemini --json
`;

function parseArgs(args) {
  const result = {
    message: '',
    preferences: {
      detailLevel: 'medium',
      outputStyle: 'concise',
      includeAssumptions: true,
      targetModel: 'universal',
    },
    json: false,
    outputFile: null,
    useModelAdapter: false,
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
    if (arg.startsWith('--model=')) {
      result.preferences.targetModel = arg.replace('--model=', '');
      result.useModelAdapter = true;
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
    if (arg === '-o' || arg === '--output-file' || arg === '--output') {
      return false; // handled by next arg
    }
    if (arg.startsWith('-o=') || arg.startsWith('--output-file=') || arg.startsWith('--output=')) {
      result.outputFile = arg.replace(/^[^=]+=/, '');
      return false;
    }
    return true;
  });

  // Handle -o with next argument
  const oIndex = args.findIndex(arg => arg === '-o' || arg === '--output-file' || arg === '--output');
  if (oIndex !== -1 && oIndex < args.length - 1) {
    result.outputFile = args[oIndex + 1];
  }

  result.message = filtered.join(' ');
  return result;
}

function writeOutput(content, filePath) {
  try {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

function formatOutput(result, style = 'concise') {
  if (style === 'json') {
    return JSON.stringify(result, null, 2);
  }

  let output = '';

  if (style === 'technical' || style === 'detailed') {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                    CLASSIFICATION                            ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    output += `  Intent             : ${result.intent}\n`;
    output += `  Domain             : ${result.domain}\n`;
    output += `  Strategy           : ${result.strategy}\n`;
    output += `  Profile            : ${result.generationProfile}\n`;
    output += `  Confidence         : ${(result.classificationConfidence * 100).toFixed(0)}%\n`;
    output += `  Target Model       : ${result.targetModel || 'universal'}\n`;

    if (result.synthesis?.primaryGoal) {
      output += '\n╔══════════════════════════════════════════════════════════════╗\n';
      output += '║                       SYNTHESIS                               ║\n';
      output += '╚══════════════════════════════════════════════════════════════╝\n';
      output += `  Primary Goal    : ${result.synthesis.primaryGoal}\n`;
      if (result.synthesis.workMode) {
        output += `  Work Mode       : ${result.synthesis.workMode}\n`;
      }
      if (result.synthesis.constraints?.length > 0) {
        output += `  Constraints     : ${result.synthesis.constraints.join(', ')}\n`;
      }
    }
  } else {
    // Concise style
    output += `[${result.intent}] ${result.domain} · ${result.strategy}\n`;
    if (result.synthesis?.primaryGoal) {
      output += `Goal: ${result.synthesis.primaryGoal}\n`;
    }
  }

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                    GENERATED PROMPTS                          ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';

  result.generatedPrompts.forEach((p, i) => {
    output += `\n── ${p.label} (${p.kind}) ──\n`;
    output += p.content + '\n';
  });

  if (result.ambiguity?.level !== 'low' && result.ambiguity?.hints?.length > 0) {
    output += '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║                       HINTS                                   ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n';
    result.ambiguity.hints.forEach(hint => {
      output += `  ⚠️  ${hint}\n`;
    });
  }

  return output;
}

/**
 * Format model-adapter output
 */
function formatModelAdapterOutput(result, modelType) {
  if (!result.optimized) {
    return result.adapted.prompt;
  }

  const { optimized, modelInfo, analysis } = result;

  let output = '';
  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║               MODEL-SPECIFIC ADAPTATION                       ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  output += `  Target Model   : ${optimized.model}\n`;
  output += `  Provider       : ${optimized.provider}\n`;
  output += `  Quality Score  : ${optimized.quality.score}/100 (${optimized.quality.level})\n`;
  output += `  Context Window : ${(modelInfo?.contextWindow / 1000).toLocaleString()}K tokens\n`;
  output += `  Max Output     : ${(modelInfo?.maxOutputTokens / 1024).toFixed(1)}K tokens\n`;

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                 RESPONSE STYLE PREFERENCES                 ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  if (modelInfo?.responseStyle) {
    output += `  Verbosity      : ${modelInfo.responseStyle.verbosity}\n`;
    output += `  Structure      : ${modelInfo.responseStyle.structure}\n`;
    output += `  Reasoning      : ${modelInfo.responseStyle.reasoning}\n`;
    output += `  Code Style     : ${modelInfo.responseStyle.codeStyle}\n`;
  }

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                    GENERATED PROMPT                          ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  output += optimized.prompt + '\n';

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                      STRENGTHS                              ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  if (modelInfo?.strengths) {
    modelInfo.strengths.forEach(s => {
      output += `  ✦ ${s}\n`;
    });
  }

  return output;
}

/**
 * Format multi-model comparison output
 */
function formatAllModelsOutput(result) {
  let output = '';
  const { analysis, models } = result;

  output += '\n╔══════════════════════════════════════════════════════════════╗\n';
  output += '║              ALL MODELS COMPARISON                          ║\n';
  output += '╚══════════════════════════════════════════════════════════════╝\n';
  output += `  Input Analysis: ${analysis.intent} | ${analysis.domain} | ${analysis.strategy}\n`;

  const sortedModels = Object.entries(models)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => (b.quality?.score || 0) - (a.quality?.score || 0));

  sortedModels.forEach((model, i) => {
    output += `\n── ${i + 1}. ${model.model} (${model.provider}) ──\n`;
    output += `   Quality: ${model.quality?.score || '?'}/100 (${model.quality?.level || 'unknown'})\n`;
    output += `   Tokens: ~${Math.round(model.prompt.length / 4).toLocaleString()} input\n`;
    output += `   Preview: ${model.prompt.substring(0, 150).replace(/\n/g, ' ')}...\n`;
  });

  output += '\n═══════════════════════════════════════════════════════════════\n';
  output += 'Use --model <name> to generate full prompt for specific model\n';

  return output;
}

async function singleShot(input) {
  const args = parseArgs(input.split(' '));

  if (!args.message.trim()) {
    console.log('Error: provide a message. Use --help for usage.');
    process.exit(1);
  }

  try {
    let outputContent;

    if (args.useModelAdapter) {
      // Use the heavy model-adapter algorithm
      const modelResult = generateForModel(args.message, args.preferences.targetModel, { fullPrompt: true });
      outputContent = formatModelAdapterOutput(modelResult, args.preferences.targetModel);
    } else {
      // Use original generation
      const result = await generatePromptResult({
        message: args.message,
        preferences: args.preferences,
      });
      const outputStyle = args.json ? 'json' : args.preferences.outputStyle;
      outputContent = formatOutput(result, outputStyle);
    }

    // Handle output
    if (args.outputFile) {
      const success = writeOutput(outputContent, args.outputFile);
      if (success) {
        console.log(`\n✅ Prompt saved to: ${args.outputFile}`);
        console.log(`   (${fs.statSync(args.outputFile).size} bytes)`);
      } else {
        console.error(`\n❌ Error: Could not write to ${args.outputFile}`);
        process.exit(1);
      }
    } else {
      console.log(outputContent);
    }

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
      if (history.length === 0) console.log('  (no history)');
      else history.forEach((h, i) => console.log(`  ${i + 1}. ${h.substring(0, 80)}${h.length > 80 ? '...' : ''}`));
      rl.prompt();
      return;
    }
    if (trimmed === ':models') {
      const models = getAvailableModels();
      console.log('  Available models for --model flag:');
      models.forEach(m => console.log(`    - ${m}`));
      rl.prompt();
      return;
    }
    if (trimmed === ':compare') {
      console.log('  Use: prompt-gen "input" --all-models');
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

// Main entry point
const args = process.argv.slice(2);

if (args.length === 0) {
  interactiveMode();
} else if (args[0] === '--help' || args[0] === '-h' || args[0] === '?') {
  console.log(HELP);
} else if (!args[0].startsWith(':')) {
  singleShot(args.join(' '));
} else {
  interactiveMode();
}