---
name: debugging
description: Diagnóstico en prompt-generator-mvp. Types, tests, trazado de flujo de generación.
---
# Reproducir: npm run cli "input que falla"
# Web: npm run dev y verificar en navegador
# Trazar: input → normalize → classifier → strategy → profile → generator → templates
# Checks: npm run check
# Errores comunes: TypeError, imports rotos, template no match, CLI crash
# Fix mínimo — no refactorizar de paso
