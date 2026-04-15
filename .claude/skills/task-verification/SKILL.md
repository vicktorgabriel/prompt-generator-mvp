---
name: task-verification
description: Checklist de verificación técnica antes de cerrar una tarea para prompt-generator-mvp.
---

# Task Verification

## Checks
```bash
npm run check     # tsc --noEmit
npm test          # tests unitarios
```

## Por tipo de cambio
- TypeScript core: `npm run check` pasa sin errores
- Motor semántico: tests pasando, tipos correctos
- API pública (`generate`, `analyze`): no romper contratos
- CLI: probar interactivamente con `npm run cli`
- Web: `npm run dev` y verificar en navegador
- Docs: ARCHITECTURE.md actualizado si hubo cambios

## Cierre
1. `npm run check && npm test`
2. Actualizar docs si cambió arquitectura
3. Commit con mensaje claro
