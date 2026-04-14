import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  PromptFeedbackEntry,
  PromptResult,
  UserPreferences,
} from "../../shared-types/src/index.js";

const dataDir = path.resolve(process.cwd(), "data");
const historyDir = path.join(dataDir, "history");
const historyFile = path.join(historyDir, "generations.json");
const feedbackFile = path.join(historyDir, "feedback.json");
const preferencesFile = path.join(dataDir, "preferences.json");

export const defaultPreferences: UserPreferences = {
  detailLevel: "medium",
  outputStyle: "balanced",
  includeFileStructure: true,
  includeAssumptions: true,
};

async function ensureFile(filePath: string, initialContent: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, initialContent, "utf8");
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, JSON.stringify(fallback, null, 2));
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureFile(filePath, JSON.stringify(data, null, 2));
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function saveGeneration(result: PromptResult): Promise<void> {
  const data = await readJsonFile<PromptResult[]>(historyFile, []);
  data.unshift(result);
  await writeJsonFile(historyFile, data.slice(0, 100));
}

export async function readHistory(limit = 20): Promise<PromptResult[]> {
  const data = await readJsonFile<PromptResult[]>(historyFile, []);
  return data.slice(0, limit);
}

export async function readPreferences(): Promise<UserPreferences> {
  const stored = await readJsonFile<Partial<UserPreferences>>(preferencesFile, defaultPreferences);
  return {
    ...defaultPreferences,
    ...stored,
  };
}

export async function savePreferences(input: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await readPreferences();
  const next: UserPreferences = {
    ...current,
    ...input,
  };
  await writeJsonFile(preferencesFile, next);
  return next;
}

export async function saveFeedback(entry: PromptFeedbackEntry): Promise<PromptFeedbackEntry[]> {
  const data = await readJsonFile<PromptFeedbackEntry[]>(feedbackFile, []);
  const filtered = data.filter((item) => item.requestId !== entry.requestId);
  filtered.unshift(entry);
  await writeJsonFile(feedbackFile, filtered.slice(0, 200));
  return filtered;
}

export async function readFeedback(): Promise<PromptFeedbackEntry[]> {
  return readJsonFile<PromptFeedbackEntry[]>(feedbackFile, []);
}
