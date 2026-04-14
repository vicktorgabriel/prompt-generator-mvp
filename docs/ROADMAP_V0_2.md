# Roadmap sugerido desde v0.2

## Fase 1 — núcleo sólido

### 1.1. Mejorar clasificación
- sumar más intenciones:
  - `review_existing_project`
  - `ui_fix`
  - luego `frontend_refactor`, `bugfix_existing_project`
- agregar scoring por contexto más fino
- registrar candidatos secundarios de intención y dominio
- mostrar por qué ganó una clasificación y no otra

### 1.2. Mejorar aclaraciones
- distinguir entre:
  - generar directo
  - generar con supuestos
  - pedir 1 o 2 preguntas antes de generar
- priorizar preguntas útiles, no muchas
- separar preguntas obligatorias vs opcionales

### 1.3. Mejorar prompts
- crear plantillas específicas para:
  - revisión de repo existente
  - implementación frontend
  - auditoría de landing
  - refactor de UI
- agregar salida “prompt para Claude / Codex / GPT”
- agregar modo corto / técnico / arquitecto

## Fase 2 — memoria útil

### 2.1. Feedback
- marcar prompt como:
  - útil
  - regular
  - malo
- guardar causa:
  - muy genérico
  - entendió mal el contexto
  - faltó stack
  - demasiado largo

### 2.2. Preferencias
- guardar preferencias del usuario:
  - nivel de detalle
  - tono técnico
  - estructura preferida
  - stacks más frecuentes
- usar esas preferencias al generar

### 2.3. Ranking interno
- medir qué plantillas funcionan mejor por dominio
- priorizar templates con mejor feedback

## Fase 3 — inteligencia opcional

### 3.1. Modo IA opcional
- mantener el motor determinístico como base
- agregar un “enhancer” opcional con IA para:
  - reescribir mejor
  - completar contexto
  - adaptar a otro modelo

### 3.2. Proveedores iniciales
- Ollama local primero
- después LiteLLM como capa unificada
- luego OpenRouter y/o Hugging Face

### 3.3. Router simple
- si la tarea es simple → motor determinístico
- si la tarea es ambigua → sugerir aclaración
- si se pide “mejorar redacción” → modelo rápido
- si se pide “arquitectura compleja” → modelo más fuerte

## Fase 4 — interfaces

### 4.1. UI web
- mejorar historial
- permitir reusar mensajes anteriores
- guardar presets
- agregar filtros por intención/dominio

### 4.2. CLI
- comando tipo:
  - `promptgen "quiero revisar una landing Django"`
- flags:
  - `--mode implementation`
  - `--intent review_existing_project`
  - `--provider ollama`

### 4.3. VS Code
- recién después de estabilizar el core
- webview lateral
- copiar prompt
- insertar en editor
- generar desde selección

## Fase 5 — calidad

### 5.1. Tests
- tests de clasificación
- tests de ambigüedad
- tests por casos reales tuyos

### 5.2. Dataset de casos
- guardar ejemplos buenos y malos
- usar esos casos como regresión
- cada error corregido se vuelve test

### 5.3. Observabilidad
- registrar latencia
- registrar template usado
- registrar confianza
- registrar cuántas veces pidió aclaración

## Prioridad recomendada
1. corregir clasificación y añadir casos reales
2. crear plantillas específicas por tipo de pedido
3. agregar feedback + preferencias
4. agregar tests
5. sumar Ollama
6. después CLI
7. después VS Code
