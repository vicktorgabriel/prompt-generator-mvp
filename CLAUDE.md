---
name: prompt-generator-project
description: Adaptador Claude para repo prompt-generator-mvp. Motor determinístico de ingeniería de prompts con interfaz web y CLI. Node.js/TypeScript.
---

# CLAUDE.md

## Entrada obligatoria
1. Leer `REGLAMENTO.md`
2. Identificar qué módulo se toca: `packages/`, `src/`, `apps/web-chat/`
3. Consultar `docs/ARCHITECTURE.md` si hay cambios estructurales

## Agentes (.claude/agents/)
| Agente | Función |
|--------|---------|
| `prompt-engineer` | Diseño y optimización de prompts, plantillas, patrones |
| `builder` | Implementación de features del motor semántico y generador |
| `debugger` | Diagnóstico de errores en clasificación, generación, CLI |
| `reviewer` | Revisión de código, tipos, tests, seguridad |
| `planner` | Planificación por fases y riesgo técnico |
| `frontend-developer` | Interfaz web (apps/web-chat/) y UX |
| `code-reviewer` | Revisión técnica integral antes de integrar |
| `closer` | Verificación + documentación (OBLIGATORIO) |

## Skills (.claude/skills/) — adaptados al proyecto
Skills relevantes para el stack actual:
- `typescript-advanced-types` (desde .agents/skills/)
- `verification`
- `project-memory`
- `task-planning`
- `task-verification`
- `code-review`
- `compress`
- `caveman`
- `caveman-commit`
- `caveman-review`

## Skills compartidos (`/.agents/skills`)
- `caveman`
- `caveman-commit`
- `caveman-review`
- `typescript-advanced-types`
- `frontend-design`
- `webapp-testing`

## Entorno
- Node.js 20+ con ES modules
- TypeScript para packages/
- JavaScript para src/ (motor legacy + CLI)
- Express.js para apps/web-chat/
- Docker NO se usa en este proyecto

## CIERRE OBLIGATORIO

### Paso 1: Validar
```bash
# Desde la raíz del repo
npm run check     # tsc --noEmit
npm test          # tests unitarios
```

### Paso 2: Documentar cambios
- Si cambió arquitectura → actualizar `docs/ARCHITECTURE.md`
- Si cambió API pública → actualizar `README.md`
- Si fue decisión importante → registrar en el commit message

### Paso 3: Commit + Push
```bash
git add -A && git commit -m "feat|fix|refactor: descripción clara" && git push
```

**REGLA CRÍTICA**:
- Código sin tests o sin type-check NO se da por terminado.
- Cambios en API pública sin documentación actualizada crean deuda técnica.
- Cada commit debe reflejar el estilo convencional del repo (feat:, fix:, etc.).
