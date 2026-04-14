# Roadmap v0.7

## Qué cambió
- Se agregó una capa de **síntesis del pedido** antes de generar prompts.
- Los prompts ya no repiten la consigna original como bloque principal.
- Las variantes ahora se diferencian más:
  - **Prompt analítico**
  - **Brief de ejecución**
  - **Prompt compacto**
- La UI muestra mejor la lectura del pedido: objetivo, stack, entregables, restricciones y calidad esperada.
- Se pulió la estética para que el entorno se sienta más cercano a una herramienta profesional.

## Núcleo nuevo
### Synthesis engine
Ahora el motor intenta inferir:
- objetivo principal
- modo de trabajo
- modo de evidencia
- acciones pedidas
- entregables esperados
- stack preferido
- restricciones detectadas
- calidad esperada

Eso hace que el prompt se sienta menos repetitivo y menos genérico.

## Qué conviene hacer después desde CLI
1. Crear un comando base tipo:
   - `promptgen "tu pedido"`
2. Agregar flags:
   - `--style technical`
   - `--detail high`
   - `--json`
   - `--no-assumptions`
3. Permitir salida en:
   - texto
   - markdown
   - json
4. Agregar una carpeta `examples/` con casos reales para endurecer el motor.
5. Incorporar tests de regresión con inputs reales y snapshots de salida.
6. Recién después sumar mejora opcional con IA.

## Capa IA sugerida después
Mantener el motor base y sumar una fase opcional:
- `draft -> enhance -> validate`

Orden recomendado:
1. **Ollama** local
2. **OpenRouter** como cloud opcional
3. **LiteLLM** si querés routing/fallbacks

## Próximas mejoras técnicas
- ranking de plantillas según feedback
- ejemplos de dominio cargables desde JSON
- detector más fino de stack real vs stack sugerido
- prompt families por estrategia
- CLI oficial
- exportar prompts a archivo
