import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePromptResult } from "../../../packages/core/src/index.js";
import { promptPresets } from "../../../packages/presets/src/index.js";
import { readHistory, readPreferences, saveFeedback, savePreferences } from "../../../packages/storage/src/index.js";
import type { PromptFeedbackEntry, PromptRequest, UserPreferences } from "../../../packages/shared-types/src/index.js";

const app = express();
const port = Number(process.env.PORT ?? 4173);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "prompt-generator-mvp", version: "0.7.0" });
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
  const body = (req.body ?? {}) as Partial<UserPreferences>;
  const next = await savePreferences(body);
  res.json(next);
});

app.post("/api/feedback", async (req, res) => {
  const body = req.body as Partial<PromptFeedbackEntry>;

  if (!body?.requestId || !body?.value) {
    res.status(400).json({ error: "Faltan requestId o value." });
    return;
  }

  const saved = await saveFeedback({
    requestId: body.requestId,
    value: body.value,
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true, savedCount: saved.length });
});

app.post("/api/generate", async (req, res) => {
  const body = req.body as PromptRequest;

  if (!body?.message || typeof body.message !== "string") {
    res.status(400).json({ error: "Falta el campo message." });
    return;
  }

  try {
    const result = await generatePromptResult({
      message: body.message,
      contextMessages: Array.isArray(body.contextMessages) ? body.contextMessages : [],
      sessionId: body.sessionId,
      presetId: body.presetId ?? null,
      preferences: body.preferences ?? {},
    });

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
