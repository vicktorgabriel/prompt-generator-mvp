# AI Enhancer Plan

## Objetivo
Agregar una capa opcional que mejore los prompts generados por el motor base sin reemplazarlo.

## Filosofía
- Primero se genera un prompt estructurado por reglas.
- Después, si el usuario quiere, un modelo IA puede:
  - reescribir
  - expandir
  - endurecer restricciones
  - convertir estilo
  - generar variantes adicionales

## Flujo recomendado
1. Usuario escribe pedido.
2. Motor base clasifica y genera prompt.
3. El usuario puede activar "Mejorar con IA".
4. Un enhancer reescribe el prompt sin perder el contenido estructural.
5. Se guarda:
   - prompt base
   - prompt mejorado
   - provider/modelo usado
   - tiempo y feedback

## Tareas ideales para IA
### Muy buenas para IA
- mejorar redacción
- hacer un prompt más técnico
- expandir requisitos
- adaptar un prompt a GPT/Claude/Codex
- convertir un prompt breve en uno más completo

### No conviene delegar del todo a IA
- clasificación principal del pedido
- detección de estrategia base
- reglas anti-invención
- decisión de si el proyecto es existente o nuevo

## Providers sugeridos para el futuro
- Ollama local
- OpenRouter
- Hugging Face Inference Providers
- LiteLLM como capa de routing/fallback

## Arquitectura sugerida
packages/
  ai-enhancer/
    src/
      index.ts
      enhancer.ts
      prompt-rewrite.ts
      provider-types.ts
      scoring.ts

  providers/
    src/
      ollama.ts
      openrouter.ts
      huggingface.ts
      registry.ts

  model-router/
    src/
      index.ts
      router.ts
      policies.ts

## Reglas de implementación
- El enhancer nunca debe borrar el prompt base.
- El enhancer debe poder fallar sin romper la generación.
- Toda mejora IA tiene que ser opcional y trazable.
- Guardar qué modelo se usó y qué cambio hizo.
