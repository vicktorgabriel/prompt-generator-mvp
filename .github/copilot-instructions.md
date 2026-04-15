# Instrucciones para Copilot

Usar este repositorio siguiendo la misma base documental compartida con otros asistentes.

## Orden de lectura
1. Leer `AGENTS.md`
2. Leer `REGLAMENTO.md`
3. Leer `docs/ARCHITECTURE.md` según la tarea

## Reglas mínimas
- No duplicar reglamentos.
- No inventar estructura si ya existe una base real.
- Validar antes de cerrar (`npm run check`, `npm test`).
- Actualizar documentación si cambió arquitectura o API pública.

## Skills compartidos disponibles
En este repo existe un catálogo compartido en `/.agents/skills`.

Incluye:
- `caveman`
- `caveman-commit`
- `caveman-review`
- `typescript-advanced-types`
- `frontend-design`

## Cierre obligatorio de TODA tarea
1. **Validar** lo tocado (`npm run check`, `npm test`)
2. **Actualizar `docs/ARCHITECTURE.md`** si hubo cambios arquitectónicos
3. **Actualizar `README.md`** si cambió la API pública
4. **Commit + Push**

**CRÍTICO**: Código sin tests o sin type-check NO está terminado. Cambios en API pública sin documentación actualizada crean deuda técnica para próximos cambios.
