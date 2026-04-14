const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const historyList = document.getElementById("historyList");
const statusPill = document.getElementById("statusPill");
const sendButton = document.getElementById("sendButton");
const composerHint = document.getElementById("composerHint");
const editorMode = document.getElementById("editorMode");
const presetList = document.getElementById("presetList");
const activePresetLabel = document.getElementById("activePresetLabel");
const preferenceForm = document.getElementById("preferenceForm");
const detailLevelSelect = document.getElementById("detailLevel");
const outputStyleSelect = document.getElementById("outputStyle");
const includeFileStructureCheckbox = document.getElementById("includeFileStructure");
const includeAssumptionsCheckbox = document.getElementById("includeAssumptions");
const clearPresetButton = document.getElementById("clearPresetButton");

const userTemplate = document.getElementById("userMessageTemplate");
const assistantTemplate = document.getElementById("assistantMessageTemplate");
const promptCardTemplate = document.getElementById("promptCardTemplate");

const userMessages = [];
let draftMode = { type: "new", sourceId: null };
let localMessageCounter = 0;
let currentPresetId = null;
let currentPreferences = {
  detailLevel: "medium",
  outputStyle: "balanced",
  includeFileStructure: true,
  includeAssumptions: true,
};
let presetMap = new Map();

function setStatus(text) {
  statusPill.textContent = text;
}

function generateMessageId() {
  localMessageCounter += 1;
  return `msg_${Date.now()}_${localMessageCounter}`;
}

function focusComposer() {
  messageInput.focus();
  messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
}

function updatePresetStatus() {
  if (!currentPresetId || !presetMap.has(currentPresetId)) {
    activePresetLabel.textContent = "Sin ejemplo activo";
    return;
  }

  const preset = presetMap.get(currentPresetId);
  activePresetLabel.textContent = `Ejemplo activo: ${preset.label}`;
}

function setComposerMode(mode) {
  draftMode = mode;

  if (mode.type === "edit-user") {
    editorMode.hidden = false;
    editorMode.textContent = "Editando un mensaje enviado. Podés ajustar el texto y regenerar sin volver a escribir todo.";
    sendButton.textContent = "Regenerar";
    composerHint.textContent = "El mensaje editado se conserva y se vuelve a usar como base para una nueva generación.";
    setStatus("Modo edición");
    return;
  }

  if (mode.type === "reuse-history") {
    editorMode.hidden = false;
    editorMode.textContent = "Reutilizando una entrada del historial. Ajustala antes de generar si hace falta.";
    sendButton.textContent = "Generar desde historial";
    composerHint.textContent = "Podés tocar cualquier historial reciente para traerlo al editor y modificarlo.";
    setStatus("Historial cargado");
    return;
  }

  if (mode.type === "prompt-edit") {
    editorMode.hidden = false;
    editorMode.textContent = "Editando un prompt generado. Los cambios se guardan en la tarjeta para copiarlo o reutilizarlo.";
    sendButton.textContent = "Enviar";
    composerHint.textContent = "Podés editar prompts generados y también reutilizar mensajes anteriores.";
    setStatus("Edición de prompt");
    return;
  }

  editorMode.hidden = true;
  editorMode.textContent = "";
  sendButton.textContent = "Enviar";
  composerHint.textContent = "Tip: cuanto más claro sea el objetivo, mejor será el prompt.";
  setStatus("Listo");
}

function loadMessageIntoComposer(text, mode = { type: "edit-user", sourceId: null }) {
  messageInput.value = text;
  setComposerMode(mode);
  focusComposer();
}

function createMessageActionButton(label, onClick, variant = "ghost") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `message-action ${variant}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createInlineEditor({ initialValue, onSave, onCancel, saveLabel = "Guardar" }) {
  const wrapper = document.createElement("div");
  wrapper.className = "inline-editor";

  const textarea = document.createElement("textarea");
  textarea.className = "inline-editor-textarea";
  textarea.value = initialValue;
  textarea.rows = Math.max(4, Math.min(12, initialValue.split("\n").length + 1));

  const actions = document.createElement("div");
  actions.className = "inline-editor-actions";

  const cancelButton = createMessageActionButton("Cancelar", onCancel, "ghost");
  const saveButton = createMessageActionButton(saveLabel, () => onSave(textarea.value.trim()), "primary");

  actions.append(cancelButton, saveButton);
  wrapper.append(textarea, actions);
  return { wrapper, textarea };
}

function addUserMessage(text) {
  const fragment = userTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".message");
  const body = fragment.querySelector(".message-body");
  const actions = fragment.querySelector(".message-actions");
  const textElement = document.createElement("p");
  const messageId = generateMessageId();

  textElement.className = "user-message-text";
  textElement.textContent = text;
  body.appendChild(textElement);

  function startEditingInline() {
    const currentText = textElement.textContent || "";
    const { wrapper, textarea } = createInlineEditor({
      initialValue: currentText,
      onSave: (newValue) => {
        if (!newValue) {
          textarea.focus();
          return;
        }
        textElement.textContent = newValue;
        body.replaceChild(textElement, wrapper);
        loadMessageIntoComposer(newValue, { type: "edit-user", sourceId: messageId });
      },
      onCancel: () => {
        body.replaceChild(textElement, wrapper);
        setStatus("Edición cancelada");
      },
      saveLabel: "Guardar y cargar",
    });

    body.replaceChild(wrapper, textElement);
    textarea.focus();
  }

  actions.append(
    createMessageActionButton("Editar", startEditingInline),
    createMessageActionButton("Reusar", () => loadMessageIntoComposer(textElement.textContent || "", { type: "edit-user", sourceId: messageId })),
  );

  article.dataset.messageId = messageId;
  article.dataset.messageText = text;
  messages.appendChild(fragment);
  messages.scrollTop = messages.scrollHeight;
  return { id: messageId, text };
}


function createSynthesisBlock(synthesis) {
  if (!synthesis) return null;

  const section = document.createElement("section");
  section.className = "info-block synthesis-block";
  section.innerHTML = `
    <h3>Lectura del pedido</h3>
    <p class="synthesis-summary">${synthesis.summary || "Sin síntesis disponible."}</p>
    <div class="summary-grid compact-grid">
      <div class="summary-item"><label>Objetivo</label><strong>${synthesis.primaryGoal || "n/a"}</strong></div>
      <div class="summary-item"><label>Modo de trabajo</label><strong>${synthesis.workMode || "n/a"}</strong></div>
      <div class="summary-item"><label>Modo de evidencia</label><strong>${synthesis.evidenceMode || "n/a"}</strong></div>
      <div class="summary-item"><label>Stack</label><strong>${(synthesis.preferredStack || []).join(", ") || "abierto"}</strong></div>
    </div>
  `;

  const blocks = [
    ["Acciones inferidas", synthesis.requestedActions],
    ["Entregables inferidos", synthesis.requestedDeliverables],
    ["Restricciones detectadas", synthesis.constraints],
    ["Calidad esperada", synthesis.qualityTargets],
  ];

  for (const [title, items] of blocks) {
    if (!items || items.length === 0) continue;
    const block = document.createElement("div");
    block.className = "synthesis-list";
    const h4 = document.createElement("h4");
    h4.textContent = title;
    const ul = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    block.append(h4, ul);
    section.appendChild(block);
  }

  return section;
}

function createSummaryGrid(result) {
  const grid = document.createElement("div");
  grid.className = "summary-grid";

  const items = [
    ["Intención", result.intent],
    ["Dominio", result.domain],
    ["Estrategia", result.strategy || "default"],
    ["Confianza", result.classificationConfidence || "n/a"],
    ["Ambigüedad", result.ambiguityLevel],
    ["Prompts", String(result.generatedPrompts.length)],
    ["Perfil", result.generationProfile || "generic"],
    ["Ejemplo", result.presetId ? (presetMap.get(result.presetId)?.label || result.presetId) : "ninguno"],
  ];

  for (const [label, value] of items) {
    const item = document.createElement("div");
    item.className = "summary-item";
    item.innerHTML = `<label>${label}</label><strong>${value}</strong>`;
    grid.appendChild(item);
  }

  return grid;
}

function createListBlock(title, items, tone = "warning") {
  if (!items || items.length === 0) {
    return null;
  }

  const section = document.createElement("section");
  section.className = "info-block";

  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);

  const badge = document.createElement("span");
  badge.className = `badge ${tone}`;
  badge.textContent = `${items.length} elemento(s)`;
  section.appendChild(badge);

  const list = document.createElement("ul");
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = typeof item === "string" ? item : `${item.label} — ${item.reason}`;
    list.appendChild(li);
  }

  section.appendChild(list);
  return section;
}

function createPreferencesBlock(preferences) {
  const section = document.createElement("section");
  section.className = "info-block";
  section.innerHTML = `
    <h3>Preferencias aplicadas</h3>
    <div class="summary-grid compact-grid">
      <div class="summary-item"><label>Detalle</label><strong>${preferences.detailLevel}</strong></div>
      <div class="summary-item"><label>Estilo de salida</label><strong>${preferences.outputStyle}</strong></div>
      <div class="summary-item"><label>Estructura de archivos</label><strong>${preferences.includeFileStructure ? "sí" : "no"}</strong></div>
      <div class="summary-item"><label>Supuestos</label><strong>${preferences.includeAssumptions ? "sí" : "no"}</strong></div>
    </div>
  `;
  return section;
}

function createFeedbackBar(result) {
  const wrapper = document.createElement("div");
  wrapper.className = "feedback-bar";

  const label = document.createElement("span");
  label.className = "feedback-label";
  label.textContent = "Feedback rápido:";

  const savedState = document.createElement("span");
  savedState.className = "feedback-saved";

  async function sendFeedback(value) {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: result.requestId, value }),
      });
      savedState.textContent = `Guardado: ${value}`;
      setStatus("Feedback guardado");
    } catch {
      savedState.textContent = "No se pudo guardar el feedback";
      setStatus("Error guardando feedback");
    }
  }

  wrapper.append(
    label,
    createMessageActionButton("Útil", () => sendFeedback("useful"), "ghost"),
    createMessageActionButton("Regular", () => sendFeedback("mixed"), "ghost"),
    createMessageActionButton("Malo", () => sendFeedback("bad"), "ghost"),
    savedState,
  );

  return wrapper;
}

function createPromptCard(prompt) {
  const fragment = promptCardTemplate.content.cloneNode(true);
  const title = fragment.querySelector("h3");
  const kind = fragment.querySelector(".prompt-kind");
  const promptBody = fragment.querySelector(".prompt-body");
  const copyButton = fragment.querySelector(".copy-button");
  const editButton = fragment.querySelector(".edit-prompt-button");
  const loadButton = fragment.querySelector(".load-prompt-button");

  let currentPromptText = prompt.content;
  let editorWrapper = null;
  let promptPre = document.createElement("pre");
  promptPre.textContent = currentPromptText;
  promptBody.appendChild(promptPre);

  title.textContent = prompt.label;
  kind.textContent = `Tipo: ${prompt.kind}`;

  async function copyCurrentPrompt() {
    await navigator.clipboard.writeText(currentPromptText);
    const original = copyButton.textContent;
    copyButton.textContent = "Copiado";
    setTimeout(() => {
      copyButton.textContent = original;
    }, 1200);
  }

  function closeEditor() {
    if (!editorWrapper) return;
    promptBody.replaceChild(promptPre, editorWrapper);
    editorWrapper = null;
    editButton.textContent = "Editar prompt";
    setComposerMode({ type: "new", sourceId: null });
  }

  function openEditor() {
    if (editorWrapper) {
      closeEditor();
      return;
    }

    const { wrapper, textarea } = createInlineEditor({
      initialValue: currentPromptText,
      onSave: (newValue) => {
        if (!newValue) {
          textarea.focus();
          return;
        }
        currentPromptText = newValue;
        promptPre.textContent = currentPromptText;
        closeEditor();
        setStatus("Prompt actualizado");
      },
      onCancel: closeEditor,
      saveLabel: "Guardar prompt",
    });

    editorWrapper = wrapper;
    promptBody.replaceChild(editorWrapper, promptPre);
    textarea.focus();
    editButton.textContent = "Cerrar editor";
    setComposerMode({ type: "prompt-edit", sourceId: prompt.id });
  }

  copyButton.addEventListener("click", copyCurrentPrompt);
  editButton.addEventListener("click", openEditor);
  loadButton.addEventListener("click", () => {
    loadMessageIntoComposer(currentPromptText, { type: "prompt-edit", sourceId: prompt.id });
  });

  return fragment;
}

function addAssistantMessage(result) {
  const fragment = assistantTemplate.content.cloneNode(true);
  const body = fragment.querySelector(".message-body");

  const synthesisBlock = createSynthesisBlock(result.synthesis);
  if (synthesisBlock) body.appendChild(synthesisBlock);
  body.appendChild(createSummaryGrid(result));
  if (result.preferencesApplied) {
    body.appendChild(createPreferencesBlock(result.preferencesApplied));
  }

  if (result.needsClarification) {
    const badge = document.createElement("span");
    badge.className = "badge danger";
    badge.textContent = "Hace falta aclaración antes de generar";
    body.appendChild(badge);
  } else if (result.ambiguityLevel === "medium") {
    const badge = document.createElement("span");
    badge.className = "badge warning";
    badge.textContent = "Generado con ambigüedad media";
    body.appendChild(badge);
  } else {
    const badge = document.createElement("span");
    badge.className = "badge success";
    badge.textContent = "Generación directa";
    body.appendChild(badge);
  }

  const signals = createListBlock("Señales usadas para clasificar", result.matchedSignals, "success");
  if (signals) body.appendChild(signals);

  const clarifications = createListBlock(
    "Preguntas de aclaración",
    result.clarificationQuestions,
    result.needsClarification ? "danger" : "warning",
  );
  if (clarifications) body.appendChild(clarifications);

  const references = createListBlock("Referencias detectadas", result.projectReferences, "success");
  if (references) body.appendChild(references);

  const assumptions = createListBlock("Supuestos", result.assumptions, "success");
  if (assumptions) body.appendChild(assumptions);

  const suggestions = createListBlock("Sugerencias para refinar", result.suggestedNextInputs, "warning");
  if (suggestions) body.appendChild(suggestions);

  if (result.generatedPrompts.length > 0) {
    const promptsWrapper = document.createElement("div");
    promptsWrapper.className = "info-block";
    promptsWrapper.innerHTML = "<h3>Prompts generados</h3>";
    for (const prompt of result.generatedPrompts) {
      promptsWrapper.appendChild(createPromptCard(prompt));
    }
    body.appendChild(promptsWrapper);
  }

  if (result.warnings.length > 0) {
    const warnings = createListBlock("Advertencias del validador", result.warnings, "warning");
    if (warnings) body.appendChild(warnings);
  }

  if (result.requestId) {
    body.appendChild(createFeedbackBar(result));
  }

  messages.appendChild(fragment);
  messages.scrollTop = messages.scrollHeight;
}

function buildHistoryItem(item) {
  const card = document.createElement("article");
  card.className = "history-item";

  const title = document.createElement("strong");
  title.textContent = item.inputOriginal;

  const meta = document.createElement("span");
  meta.textContent = `${item.intent} · ${item.domain} · ${item.ambiguityLevel}`;

  const actions = document.createElement("div");
  actions.className = "history-actions";

  const reuseButton = createMessageActionButton(
    "Reusar",
    () => loadMessageIntoComposer(item.inputOriginal, { type: "reuse-history", sourceId: item.requestId || null }),
    "ghost",
  );

  actions.appendChild(reuseButton);
  card.append(title, meta, actions);
  card.addEventListener("dblclick", () => {
    loadMessageIntoComposer(item.inputOriginal, { type: "reuse-history", sourceId: item.requestId || null });
  });
  return card;
}

async function loadHistory() {
  try {
    const response = await fetch("/api/history?limit=8");
    const history = await response.json();

    if (!Array.isArray(history) || history.length === 0) {
      historyList.innerHTML = '<p class="muted">Todavía no hay historial guardado.</p>';
      return;
    }

    historyList.innerHTML = "";
    for (const item of history) {
      historyList.appendChild(buildHistoryItem(item));
    }
  } catch {
    historyList.innerHTML = '<p class="muted">No se pudo cargar el historial.</p>';
  }
}

function renderPresets(presets) {
  presetMap = new Map(presets.map((preset) => [preset.id, preset]));
  presetList.innerHTML = "";

  for (const preset of presets) {
    const card = document.createElement("article");
    card.className = `preset-item ${currentPresetId === preset.id ? "active" : ""}`;

    const title = document.createElement("strong");
    title.textContent = preset.label;

    const description = document.createElement("p");
    description.textContent = preset.description;

    const actions = document.createElement("div");
    actions.className = "history-actions";

    actions.appendChild(
      createMessageActionButton("Activar", () => {
        currentPresetId = preset.id;
        updatePresetStatus();
        if (!messageInput.value.trim()) {
          loadMessageIntoComposer(preset.messageTemplate, { type: "reuse-history", sourceId: preset.id });
        }
        renderPresets(presets);
      }, currentPresetId === preset.id ? "primary" : "ghost"),
      createMessageActionButton("Cargar ejemplo", () => {
        currentPresetId = preset.id;
        updatePresetStatus();
        loadMessageIntoComposer(preset.messageTemplate, { type: "reuse-history", sourceId: preset.id });
        renderPresets(presets);
      }),
    );

    card.append(title, description, actions);
    presetList.appendChild(card);
  }

  updatePresetStatus();
}

function applyPreferencesToForm(preferences) {
  currentPreferences = { ...currentPreferences, ...preferences };
  detailLevelSelect.value = currentPreferences.detailLevel;
  outputStyleSelect.value = currentPreferences.outputStyle;
  includeFileStructureCheckbox.checked = Boolean(currentPreferences.includeFileStructure);
  includeAssumptionsCheckbox.checked = Boolean(currentPreferences.includeAssumptions);
}

async function loadPreferences() {
  try {
    const response = await fetch("/api/preferences");
    const preferences = await response.json();
    applyPreferencesToForm(preferences);
  } catch {
    setStatus("No se pudieron cargar preferencias");
  }
}

async function savePreferences() {
  const next = {
    detailLevel: detailLevelSelect.value,
    outputStyle: outputStyleSelect.value,
    includeFileStructure: includeFileStructureCheckbox.checked,
    includeAssumptions: includeAssumptionsCheckbox.checked,
  };

  currentPreferences = next;

  try {
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    const saved = await response.json();
    applyPreferencesToForm(saved);
    setStatus("Preferencias guardadas");
  } catch {
    setStatus("No se pudieron guardar preferencias");
  }
}

async function loadPresets() {
  try {
    const response = await fetch("/api/presets");
    const presets = await response.json();
    if (Array.isArray(presets)) {
      renderPresets(presets);
    }
  } catch {
    presetList.innerHTML = '<p class="muted">No se pudieron cargar los ejemplos.</p>';
  }
}

preferenceForm.addEventListener("change", savePreferences);
clearPresetButton.addEventListener("click", () => {
  currentPresetId = null;
  updatePresetStatus();
  loadPresets();
  setStatus("Ejemplo limpiado");
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  const previousMode = draftMode.type;
  const userMessage = addUserMessage(message);
  const contextMessages = userMessages.slice(-3);
  setStatus("Generando...");
  messageInput.value = "";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        contextMessages,
        presetId: currentPresetId,
        preferences: currentPreferences,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo generar el prompt.");
    }

    userMessages.push(message);
    addAssistantMessage(result);
    await loadHistory();
    setComposerMode({ type: "new", sourceId: null });
    setStatus(previousMode === "edit-user" ? "Regenerado" : previousMode === "reuse-history" ? "Generado desde historial" : "Listo");
  } catch (error) {
    addAssistantMessage({
      requestId: null,
      intent: "error",
      domain: "error",
      strategy: "default",
      generationProfile: "generic",
      classificationConfidence: "low",
      matchedSignals: [],
      ambiguityLevel: "high",
      generatedPrompts: [],
      clarificationQuestions: [],
      assumptions: [],
      synthesis: {
        summary: "No se pudo interpretar el pedido porque falló la generación.",
        primaryGoal: "resolver el error y volver a intentar",
        workMode: "recuperación",
        evidenceMode: "sin datos",
        requestedActions: [],
        requestedDeliverables: [],
        preferredStack: [],
        constraints: [],
        qualityTargets: [],
      },
      suggestedNextInputs: [],
      warnings: [error.message || "Error inesperado."],
      needsClarification: false,
      preferencesApplied: currentPreferences,
      presetId: currentPresetId,
      projectReferences: [],
    });
    setStatus("Error");
  }

  const article = messages.querySelector(`[data-message-id="${userMessage.id}"]`);
  if (article) {
    article.dataset.messageText = message;
  }
});

await loadPreferences();
await loadPresets();
await loadHistory();
setComposerMode({ type: "new", sourceId: null });
