# Roadmap v0.3

## Estado actual

La v0.3 ya resuelve cuatro puntos importantes:

- mejor clasificación para pedidos de revisión de repos y frontend
- historial reciente reutilizable
- edición de mensajes enviados sin volver a escribir todo
- edición de prompts generados antes de copiarlos o reutilizarlos

## Prioridad 1 — endurecer el motor con casos reales

Objetivo: mejorar la precisión usando tus pedidos reales.

### Tareas

- crear una carpeta `data/fixtures/real_cases/`
- guardar ejemplos reales tuyos con:
  - input original
  - intención esperada
  - dominio esperado
  - nivel de ambigüedad esperado
- agregar al menos 30 casos reales
- revisar falsos positivos por palabras ambiguas
- ajustar pesos del clasificador con base en esos casos

### Entregable

- suite de casos de prueba reales
- tabla de errores frecuentes
- reglas nuevas documentadas

---

## Prioridad 2 — presets y modos de salida

Objetivo: que el generador entregue prompts más útiles según el uso.

### Presets sugeridos

- revisión de proyecto existente
- auditoría visual/frontend
- implementación paso a paso
- arquitectura técnica
- refactor seguro
- prompt para Claude
- prompt para Codex
- prompt para GPT

### Entregable

- selector de preset
- plantillas separadas por preset
- salida más adaptada a cada caso

---

## Prioridad 3 — feedback y memoria de preferencias

Objetivo: que el sistema aprenda del uso sin meter IA todavía.

### Tareas

- agregar botones:
  - útil
  - regular
  - malo
- guardar feedback por generación
- guardar preferencias como:
  - nivel de detalle
  - formato favorito
  - dominio frecuente
  - tipo de prompt más usado
- usar esas preferencias para mejorar defaults

### Entregable

- archivo `data/preferences/user-profile.json`
- score por template
- adaptación básica del motor

---

## Prioridad 4 — exportación y guardado local

Objetivo: que el usuario use el prompt fuera de la app con más facilidad.

### Tareas

- exportar prompt a `.md`
- exportar prompt a `.txt`
- guardar variantes editadas localmente
- permitir duplicar un prompt como nueva versión

### Entregable

- gestor simple de prompts guardados
- historial de revisiones básico

---

## Prioridad 5 — capa opcional de IA local

Objetivo: mejorar prompts sin depender del motor determinístico.

### Tareas

- crear `packages/providers/provider-ollama/`
- agregar un modo:
  - base
  - mejorado con IA
- usar Ollama solo para:
  - reescritura
  - clarificación de pedidos vagos
  - expansión de restricciones
  - conversión entre estilos de prompt

### Entregable

- integración local opcional
- fallback limpio al motor base

---

## Prioridad 6 — CLI

Objetivo: usar el generador fuera de la UI web.

### Tareas

- crear `apps/cli/`
- permitir uso tipo:

```bash
promptgen "quiero revisar una landing Django y corregir el header"
```

- flags sugeridos:
  - `--preset`
  - `--format`
  - `--concise`
  - `--json`

### Entregable

- CLI funcional reutilizando el mismo core

---

## Prioridad 7 — integración futura con VS Code

Objetivo: llevar el mismo motor a una extensión sin rehacer la lógica.

### Tareas

- encapsular mejor el `PromptService`
- desacoplar totalmente UI y core
- definir comandos para:
  - generar desde texto libre
  - generar desde selección
  - reusar prompt guardado
  - abrir historial
- luego crear webview o panel lateral

### Entregable

- base lista para empaquetar como extensión

---

## Orden recomendado de trabajo

1. casos reales y pruebas del clasificador
2. presets
3. feedback y preferencias
4. exportación/guardado local
5. Ollama opcional
6. CLI
7. VS Code

---

## Criterio de avance

No pasar a la siguiente etapa hasta que la actual quede usable.

Primero tiene que ser:
- preciso
- cómodo de corregir
- fácil de reutilizar

Después recién:
- inteligente
- adaptativo
- multi modelo
