'use strict';

/**
 * Ambiguity detection module.
 * Scores how vague or underspecified a user input is (0 = clear, 1 = very ambiguous).
 * High ambiguity triggers multi-variant output or clarification hints.
 */

/** Words and phrases that increase ambiguity */
const VAGUENESS_SIGNALS = [
  /\b(something|somehow|some\s+way|a\s+bit|kind\s+of|sort\s+of|maybe|perhaps|probably|might|could)\b/i,
  /\b(thing|stuff|it|them|they|this|that)\b/i,
  /\b(better|good|nice|cool|fast|simple|easy|clean)\b(?!\s+(performance|code|api|query|component))/i,
  /\b(etc|and\s+so\s+on|and\s+more|and\s+stuff)\b/i,
  /\b(whatever|anything|everything|somewhere)\b/i,
];

/** Markers that decrease ambiguity (concrete specificity) */
const CLARITY_SIGNALS = [
  /\b(using|with|in|via|through|for)\s+(?!something|anything|stuff|things|it|them|this|that)\w+/i,
  /\b(typescript|javascript|python|java|go|rust|php|ruby|c#|kotlin|swift)\b/i,
  /\b(v\d+[\.\d]*|version\s+\d)/i,
  /\b(endpoint|route|table|model|component|function|class|hook|service|module)\b/i,
  /\b(returns?|accepts?|expects?|throws?|emits?)\b/i,
  /\bhttps?:\/\//i,
  /\b(GET|POST|PUT|DELETE|PATCH)\b/,
  /["'`]\w+["'`]/,
];

/**
 * Returns an ambiguity score between 0 (clear) and 1 (very vague).
 * Also provides hints about what is missing.
 * @param {string} input
 * @returns {{ score: number, level: 'low'|'medium'|'high', hints: string[] }}
 */
function scoreAmbiguity(input) {
  let vagueCount = 0;
  let clearCount = 0;

  for (const pattern of VAGUENESS_SIGNALS) {
    if (pattern.test(input)) vagueCount++;
  }

  for (const pattern of CLARITY_SIGNALS) {
    if (pattern.test(input)) clearCount++;
  }

  const wordCount = input.trim().split(/\s+/).length;
  const isShort = wordCount < 8;

  // Base score from vague/clear ratio
  let score = vagueCount / (VAGUENESS_SIGNALS.length + 1);

  // Short inputs are inherently more ambiguous
  if (isShort) score += 0.25;

  // Clear signals reduce ambiguity
  score -= clearCount * 0.08;

  score = Math.max(0, Math.min(1, score));

  const level = score < 0.25 ? 'low' : score < 0.40 ? 'medium' : 'high';

  const hints = buildHints(input, vagueCount, clearCount, isShort);

  return { score: parseFloat(score.toFixed(2)), level, hints };
}

/**
 * Produces hint messages to guide the user toward more specific input.
 */
function buildHints(input, vagueCount, clearCount, isShort) {
  const hints = [];

  if (isShort) {
    hints.push('The request is very short — consider specifying the technology or context.');
  }

  if (vagueCount >= 2) {
    hints.push('Vague terms detected — try replacing general words with specific names or types.');
  }

  if (clearCount === 0) {
    hints.push('No programming language, framework, or version detected.');
  }

  if (!/\b(typescript|javascript|python|java|go|rust|php|ruby|c#|kotlin|swift)\b/i.test(input)) {
    hints.push('Specify the programming language for a more targeted prompt.');
  }

  return hints;
}

module.exports = { scoreAmbiguity };
