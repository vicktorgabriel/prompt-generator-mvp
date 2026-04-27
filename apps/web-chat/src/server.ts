import express from "express";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePromptResult } from "../../../packages/core/src/index.js";
import { promptPresets } from "../../../packages/presets/src/index.js";
import { readHistory, readPreferences, saveFeedback, savePreferences } from "../../../packages/storage/src/index.js";
import {
  validateFeedbackRequest,
  validatePreferencesRequest,
  validatePromptRequest,
} from "../../../packages/validators/src/index.js";

const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json") as { name?: string; version?: string };
const packageName = packageJson.name ?? "prompt-generator-mvp";
const packageVersion = packageJson.version ?? "0.0.0";

const app = express();
const port = Number(process.env.PORT ?? 4173);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: packageName, version: packageVersion });
});

app.get("/api/history", async (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const history = await readHistory(limit);
  res.json(history);
});

app.get("/api/presets", (_req, res) => {
  res.json(promptPresets);
});

app.get("/api/preferences", async (_req, res) => {
  const preferences = await readPreferences();
  res.json(preferences);
});

app.post("/api/preferences", async (req, res) => {
  const validation = validatePreferencesRequest(req.body ?? {});

  if (!validation.ok) {
    res.status(400).json({ error: "Preferencias inválidas.", details: validation.errors });
    return;
  }

  const next = await savePreferences(validation.value);
  res.json(next);
});

app.post("/api/feedback", async (req, res) => {
  const validation = validateFeedbackRequest(req.body ?? {});

  if (!validation.ok) {
    res.status(400).json({ error: "Feedback inválido.", details: validation.errors });
    return;
  }

  const saved = await saveFeedback({
    ...validation.value,
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true, savedCount: saved.length });
});

app.post("/api/generate", async (req, res) => {
  const validation = validatePromptRequest(req.body ?? {});

  if (!validation.ok) {
    res.status(400).json({ error: "Pedido inválido.", details: validation.errors });
    return;
  }

  try {
    const result = await generatePromptResult(validation.value);

    res.json(result);
  } catch (error) {
    console.error("Error generando prompt:", error);
    res.status(500).json({
      error: "No se pudo generar el prompt.",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Prompt Generator MVP disponible en http://localhost:${port}`);
});
