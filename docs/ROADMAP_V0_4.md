# Roadmap v0.4

## Estado actual

La base ya cubre:

- clasificación de intención y dominio
- preguntas de aclaración
- presets
- preferencias persistentes
- feedback rápido
- historial reutilizable
- edición de mensajes y prompts

## Prioridad 1 — endurecer el motor con casos reales

Objetivo: mejorar comprensión antes de meter IA.

### Tareas
- agregar una carpeta de casos reales tuyos para test manual
- registrar frases que clasificó bien y mal
- sumar reglas para distinguir mejor:
  - revisión de repo
  - landing/frontend
  - backend/API
  - auditoría técnica
  - rediseño UI vs corrección UI
- detectar con más fuerza nombres de carpetas/repos y pedidos sobre código existente

### Entregable
Motor más confiable con ejemplos tuyos como suite base.

---

## Prioridad 2 — feedback útil para aprendizaje guiado

Objetivo: empezar a adaptar el sistema sin entrenar modelos.

### Tareas
- mostrar historial de feedback guardado
- calcular qué presets y estilos son más usados
- guardar qué combinaciones de preferencias elegís más seguido
- rankear prompts por utilidad percibida

### Entregable
Base de adaptación por uso real.

---

## Prioridad 3 — presets avanzados

Objetivo: hacer el sistema más rápido para tareas repetidas.

### Tareas
- permitir crear presets propios desde la UI
- permitir editar y borrar presets custom
- guardar presets custom en JSON local
- separar presets del sistema vs presets del usuario

### Entregable
Preset manager básico.

---

## Prioridad 4 — preferencias más inteligentes

Objetivo: que el sistema recuerde tu estilo de trabajo.

### Tareas
- agregar perfiles rápidos:
  - técnico
  - paso a paso
  - auditoría
  - frontend visual
  - backend limpio
- detectar sugerencias de perfil según el tipo de pedido
- permitir restaurar valores por defecto

### Entregable
Perfiles de salida reutilizables.

---

## Prioridad 5 — integrar IA opcional

Objetivo: mejorar prompts sin depender siempre de IA.

### Tareas
- agregar proveedor local primero (Ollama)
- usar IA solo para:
  - reescribir
  - expandir
  - condensar
  - generar variantes para distintos modelos
- mantener siempre el prompt base determinístico

### Entregable
Modo híbrido: base por reglas + mejora opcional con IA.

---

## Prioridad 6 — router de modelos

Objetivo: elegir automáticamente el mejor motor según tarea.

### Tareas
- crear capa de providers
- sumar LiteLLM o adaptador propio
- definir reglas simples:
  - local primero
  - cloud si hace falta más calidad
  - fallback si falla el principal

### Entregable
Arquitectura lista para múltiples modelos.

---

## Prioridad 7 — CLI

Objetivo: usar el generador desde terminal.

### Tareas
- comando tipo:
  - `promptgen "tu pedido"`
- soporte para:
  - preset
  - estilo de salida
  - export a markdown
  - copiar al portapapeles

### Entregable
CLI real reutilizando el mismo core.

---

## Prioridad 8 — extensión de VS Code

Objetivo: llevar la misma lógica al editor.

### Tareas
- montar webview
- mostrar presets y preferencias
- insertar prompt en editor
- generar desde selección
- reusar historial

### Entregable
Versión integrada a VS Code sin rehacer el motor.

---

## Orden recomendado para seguir acá

1. endurecer clasificación con ejemplos reales tuyos
2. agregar ranking simple por feedback
3. presets custom
4. perfiles de preferencias
5. Ollama opcional
6. CLI
7. VS Code
