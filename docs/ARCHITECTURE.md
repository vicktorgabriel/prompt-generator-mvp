# Arquitectura inicial

## Flujo principal

```text
entrada del usuario
→ normalización
→ clasificación de intención
→ detección de dominio
→ análisis de ambigüedad
→ decisión
   - generar directo
   - generar con supuestos
   - pedir aclaración
→ validación
→ persistencia en historial
```

## Módulos

### packages/shared-types
Contratos del sistema.

### packages/core
Orquestación principal y ensamblado del resultado.

### packages/prompt-templates
Templates y variantes de prompt.

### packages/clarification-engine
Preguntas de aclaración, supuestos y sugerencias.

### packages/validators
Chequeos básicos de calidad.

### packages/storage
Historial local.

### apps/web-chat
Interfaz mínima tipo chat para probar el motor.

## Evolución prevista

1. Feedback por generación
2. Ranking de templates
3. Preferencias persistentes
4. Integración con Ollama
5. Router multi-modelo
6. CLI
7. Extensión de VS Code
