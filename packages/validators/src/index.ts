import type {
  FeedbackValue,
  GeneratedPrompt,
  PromptRequest,
  UserPreferences,
} from "../../shared-types/src/index.js";

const MAX_MESSAGE_LENGTH = 8_000;
const MAX_CONTEXT_MESSAGES = 10;
const MAX_CONTEXT_MESSAGE_LENGTH = 4_000;
const MAX_ID_LENGTH = 120;

const detailLevels = new Set<UserPreferences["detailLevel"]>(["low", "medium", "high"]);
const outputStyles = new Set<UserPreferences["outputStyle"]>([
  "balanced",
  "step_by_step",
  "technical",
  "concise",
]);
const feedbackValues = new Set<FeedbackValue>(["useful", "mixed", "bad"]);

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export interface FeedbackRequest {
  requestId: string;
  value: FeedbackValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(
  input: Record<string, unknown>,
  key: string,
  errors: string[],
  options: { maxLength: number; allowEmpty?: boolean } = { maxLength: MAX_ID_LENGTH },
): string | undefined {
  const value = input[key];
  if (value === undefined || value === null) return undefined;

  if (typeof value !== "string") {
    errors.push(`El campo ${key} debe ser texto.`);
    return undefined;
  }

  const trimmed = value.trim();
  if (!options.allowEmpty && trimmed.length === 0) {
    errors.push(`El campo ${key} no puede estar vacío.`);
    return undefined;
  }

  if (trimmed.length > options.maxLength) {
    errors.push(`El campo ${key} no puede superar ${options.maxLength} caracteres.`);
    return undefined;
  }

  return trimmed;
}

function validatePreferencesObject(input: unknown, errors: string[]): Partial<UserPreferences> {
  if (input === undefined || input === null) return {};

  if (!isRecord(input)) {
    errors.push("El campo preferences debe ser un objeto.");
    return {};
  }

  const preferences: Partial<UserPreferences> = {};

  if (input.detailLevel !== undefined) {
    if (typeof input.detailLevel !== "string" || !detailLevels.has(input.detailLevel as UserPreferences["detailLevel"])) {
      errors.push("preferences.detailLevel debe ser uno de: low, medium, high.");
    } else {
      preferences.detailLevel = input.detailLevel as UserPreferences["detailLevel"];
    }
  }

  if (input.outputStyle !== undefined) {
    if (typeof input.outputStyle !== "string" || !outputStyles.has(input.outputStyle as UserPreferences["outputStyle"])) {
      errors.push("preferences.outputStyle debe ser uno de: balanced, step_by_step, technical, concise.");
    } else {
      preferences.outputStyle = input.outputStyle as UserPreferences["outputStyle"];
    }
  }

  if (input.includeFileStructure !== undefined) {
    if (typeof input.includeFileStructure !== "boolean") {
      errors.push("preferences.includeFileStructure debe ser booleano.");
    } else {
      preferences.includeFileStructure = input.includeFileStructure;
    }
  }

  if (input.includeAssumptions !== undefined) {
    if (typeof input.includeAssumptions !== "boolean") {
      errors.push("preferences.includeAssumptions debe ser booleano.");
    } else {
      preferences.includeAssumptions = input.includeAssumptions;
    }
  }

  return preferences;
}

export function validatePromptRequest(input: unknown): ValidationResult<PromptRequest> {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["El body debe ser un objeto JSON."] };
  }

  const message = readOptionalString(input, "message", errors, {
    maxLength: MAX_MESSAGE_LENGTH,
  });

  let contextMessages: string[] = [];
  if (input.contextMessages !== undefined) {
    if (!Array.isArray(input.contextMessages)) {
      errors.push("contextMessages debe ser un array de textos.");
    } else if (input.contextMessages.length > MAX_CONTEXT_MESSAGES) {
      errors.push(`contextMessages no puede tener más de ${MAX_CONTEXT_MESSAGES} elementos.`);
    } else {
      contextMessages = input.contextMessages.flatMap((item, index) => {
        if (typeof item !== "string") {
          errors.push(`contextMessages[${index}] debe ser texto.`);
          return [];
        }

        const trimmed = item.trim();
        if (trimmed.length === 0) return [];

        if (trimmed.length > MAX_CONTEXT_MESSAGE_LENGTH) {
          errors.push(`contextMessages[${index}] no puede superar ${MAX_CONTEXT_MESSAGE_LENGTH} caracteres.`);
          return [];
        }

        return [trimmed];
      });
    }
  }

  const sessionId = readOptionalString(input, "sessionId", errors, {
    maxLength: MAX_ID_LENGTH,
  });

  let presetId: string | null = null;
  if (input.presetId !== undefined && input.presetId !== null) {
    const value = readOptionalString(input, "presetId", errors, {
      maxLength: MAX_ID_LENGTH,
      allowEmpty: true,
    });
    presetId = value && value.length > 0 ? value : null;
  }

  const preferences = validatePreferencesObject(input.preferences, errors);

  if (errors.length > 0 || !message) {
    if (!message && !errors.some((error) => error.includes("message"))) {
      errors.push("El campo message es obligatorio.");
    }
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      message,
      contextMessages,
      sessionId,
      presetId,
      preferences,
    },
  };
}

export function validatePreferencesRequest(input: unknown): ValidationResult<Partial<UserPreferences>> {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["El body debe ser un objeto JSON."] };
  }

  const preferences = validatePreferencesObject(input, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: preferences };
}

export function validateFeedbackRequest(input: unknown): ValidationResult<FeedbackRequest> {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["El body debe ser un objeto JSON."] };
  }

  const requestId = readOptionalString(input, "requestId", errors, {
    maxLength: MAX_ID_LENGTH,
  });

  const value = input.value;
  let feedbackValue: FeedbackValue | undefined;
  if (typeof value !== "string" || !feedbackValues.has(value as FeedbackValue)) {
    errors.push("El campo value debe ser uno de: useful, mixed, bad.");
  } else {
    feedbackValue = value as FeedbackValue;
  }

  if (errors.length > 0 || !requestId || !feedbackValue) {
    return { ok: false, errors };
  }

  return { ok: true, value: { requestId, value: feedbackValue } };
}

export function validatePrompts(prompts: GeneratedPrompt[]): string[] {
  const warnings: string[] = [];

  if (prompts.length === 0) {
    warnings.push("No se generaron prompts todavía.");
    return warnings;
  }

  for (const prompt of prompts) {
    if (prompt.content.trim().length < 120) {
      warnings.push(`El prompt "${prompt.label}" quedó demasiado corto.`);
    }

    if (!prompt.content.includes("Objetivo") && prompt.kind === "master") {
      warnings.push(`El prompt "${prompt.label}" no incluye una sección de objetivo explícita.`);
    }

    if (prompt.label.toLowerCase().includes("migración") || prompt.content.includes("migrate_existing_system")) {
      if (!/inspecciona|revisa primero|estructura real/i.test(prompt.content)) {
        warnings.push(`El prompt "${prompt.label}" parece de migración pero no fuerza una inspección previa de la estructura real.`);
      }
      if (!/no inventes|no rehagas|fuente de verdad/i.test(prompt.content)) {
        warnings.push(`El prompt "${prompt.label}" parece de migración pero no limita suficientemente la invención de módulos o entidades.`);
      }
    }

    if (/React, Tailwind CSS y TypeScript/i.test(prompt.content) && !/modular|componentes|responsive|secciones/i.test(prompt.content)) {
      warnings.push(`El prompt "${prompt.label}" menciona stack moderno de landing pero no enfatiza suficiente modularidad o responsive.`);
    }
  }

  return Array.from(new Set(warnings));
}
