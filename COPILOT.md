# COPILOT

## Entrada obligatoria
1. Leer `AGENTS.md`.
2. Leer `REGLAMENTO.md`.
3. Identificar si la tarea toca `packages/`, `src/` o `apps/web-chat/`.
4. Consultar `docs/ARCHITECTURE.md` si hay cambios estructurales.

## Regla de base documental
- Mantener una sola fuente de verdad: `AGENTS.md`, `REGLAMENTO.md`, `docs/`.
- No duplicar reglas entre asistentes.

## Catálogo de asistentes
- Codex: `/.codex/agents` y `/.codex/skills`.
- Claude: `/.claude/agents` y `/.claude/skills`.
- Copilot: usa la misma base documental y no crea estructura aparte.

## Skills compartidos (`/.agents/skills`)
- `caveman`
- `caveman-commit`
- `caveman-review`
- `typescript-advanced-types`
- `frontend-design`

## Cierre obligatorio
1. Validar lo tocado (`npm run check`, `npm test`)
2. Actualizar `docs/ARCHITECTURE.md` si cambió arquitectura
3. Actualizar `README.md` si cambió API pública
4. Commit con mensaje claro

**CRÍTICO**: Sin tests o type-check NO está terminada. Sin documentación actualizada se pierde contexto para próximos cambios.
