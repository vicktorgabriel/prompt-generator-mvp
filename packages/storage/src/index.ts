import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

function stringifyJson<T>(data: T): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function createBackupPath(filePath: string): string {
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${filePath}.corrupt-${safeTimestamp}.bak`;
}

async function ensureDirectory(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDirectory(filePath);

  const tempPath = `${filePath}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
  await writeFile(tempPath, stringifyJson(data), "utf8");
  await rename(tempPath, filePath);
}

async function ensureJsonFile<T>(filePath: string, fallback: T): Promise<void> {
  await ensureDirectory(filePath);

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeJsonFile(filePath, fallback);
  }
}

async function backupCorruptJson(filePath: string): Promise<void> {
  try {
    await copyFile(filePath, createBackupPath(filePath));
  } catch {
    // Backup is best-effort. The caller will still restore a valid JSON file.
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureJsonFile(filePath, fallback);

  const raw = await readFile(filePath, "utf8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    await backupCorruptJson(filePath);
    await writeJsonFile(filePath, fallback);
    return fallback;
  }
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
