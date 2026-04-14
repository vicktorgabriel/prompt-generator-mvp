# Prompt Generator MVP v0.6

MVP de un generador de prompts con interfaz tipo chat, motor determinístico y arquitectura modular.

## Qué trae esta versión

- clasificación de intención y dominio más robusta
- detección de **estrategia de generación** (`implement_new`, `inspect_and_adapt`, `ui_fix_existing`, `migrate_existing_system`)
- detección de **perfil de generación** (`modern_modular_landing`, `existing_frontend_audit`, `existing_system_migration`, `generic`)
- prompts más afinados para **landings modernas altamente modulares**
- preferencia explícita por **React + Tailwind CSS + TypeScript** cuando el pedido apunta a una landing y no fija otro stack
- extracción de referencias reales de carpetas, repos y APIs cuando aparecen en el pedido
- prompts más fuertes para **migraciones** y **proyectos existentes**
- ejemplos rápidos genéricos, sin referencias al contexto personal del usuario
- preferencias persistentes para detalle, estilo de salida, estructura de archivos y supuestos
- feedback rápido útil/regular/malo guardado por generación
- generación de 3 variantes de prompt
- historial local en JSON
- edición inline de mensajes enviados para reusar y regenerar sin reescribir
- edición inline de prompts generados para ajustarlos antes de copiar
- reuso rápido desde el historial reciente
- UI web simple para probar el motor

## Requisitos

- Node.js 20 o superior

## Uso

```bash
npm install
npm run dev
```

Abrí:

```text
http://localhost:4173
```

## Scripts

```bash
npm run dev
npm run start
npm run check
npm run build
```

## Estructura

```text
apps/
  web-chat/
packages/
  core/
  clarification-engine/
  prompt-templates/
  presets/
  shared-types/
  storage/
  validators/
data/
  preferences.json
  history/
    generations.json
    feedback.json
```

## Qué conviene probar en v0.6

- una landing nueva, moderna y modular
- una auditoría de landing existente con foco en spacing, header y botones
- una migración real a Django apoyada en una API existente
- la edición de mensaje/prompt para iterar sin reescribir

## Documentos útiles

- `docs/ROADMAP_V0_6.md`
- `docs/AI_ENHANCER_PLAN.md`
