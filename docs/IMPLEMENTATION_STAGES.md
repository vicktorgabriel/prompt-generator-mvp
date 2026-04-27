# Plan de implementación por etapas

Este documento ordena las mejoras detectadas para `prompt-generator-mvp` en fases pequeñas, verificables y reversibles.

## Estado inicial observado

- La app web usa el motor TypeScript de `packages/core`.
- La CLI y varios tests actuales usan el motor JavaScript de `src`.
- `package.json` declara `0.7.0`, pero el README menciona `v0.9`.
- `/api/health` devuelve la versión hardcodeada.
- El frontend está concentrado en `apps/web-chat/public/app.js`.
- Hay renderizado con `innerHTML` usando datos dinámicos.
- El storage JSON funciona, pero no tiene escritura atómica ni recuperación ante JSON corrupto.
- Los endpoints validan parcialmente las entradas.

## Tools MCP recomendadas antes de empezar

Para trabajar completo desde ChatGPT conviene exponer estas herramientas:

```text
list_files(path)
read_file(path)
write_file(path, content, mode)
search(query, path, limit)
run_command(command, cwd)
git_status(cwd)
git_diff(cwd)
git_diff_file(path, cwd)
```

Opcionales útiles:

```text
patch_file(path, unifiedDiff)
read_json(path)
write_json(path, data)
create_branch(cwd, name)
```

## Política de trabajo

- Una etapa por vez.
- Antes de escribir cambios grandes, revisar archivos afectados.
- Después de cada etapa, ejecutar validaciones.
- No mezclar refactors con cambios funcionales grandes.
- Mantener compatibilidad con la UI y la CLI mientras se migra el motor.

## Etapa 1 — Consistencia y seguridad base

Objetivo: corregir inconsistencias y endurecer la base sin cambiar arquitectura profunda.

### Cambios

1. Definir una única versión del proyecto.
2. Alinear:
   - `package.json`
   - `README.md`
   - `apps/web-chat/src/server.ts` (`/api/health`)
   - roadmaps/docs relevantes
3. Evitar versión hardcodeada en `/api/health` o centralizarla.
4. Agregar validadores HTTP para:
   - `PromptRequest`
   - `UserPreferences`
   - `PromptFeedbackEntry`
5. Limitar tamaños y tipos de entrada:
   - `message`: string no vacía, máximo recomendado 8000 caracteres
   - `contextMessages`: array de strings, máximo 10
   - `presetId`: string o null
   - `preferences`: enums controlados
6. Mejorar storage JSON:
   - escritura atómica con archivo temporal + rename
   - fallback si el JSON está corrupto
   - backup del archivo corrupto antes de regenerarlo

### Archivos probables

```text
package.json
README.md
apps/web-chat/src/server.ts
packages/validators/src/index.ts
packages/storage/src/index.ts
packages/shared-types/src/index.ts
```

### Validación esperada

```bash
npm run check
npm test
npm run build
```

### Criterios de aceptación

- La versión coincide en todos lados.
- `/api/health` responde versión alineada.
- Entradas inválidas devuelven 400 claro.
- JSON corrupto no rompe el servidor.
- Tests actuales siguen pasando.

## Etapa 2 — Tests del motor real TypeScript

Objetivo: cubrir el motor que realmente usa la web.

### Cambios

1. Crear tests para `packages/core`.
2. Crear fixtures de prompts reales.
3. Cubrir:
   - clasificación de intención
   - clasificación de dominio
   - estrategia
   - perfil de generación
   - síntesis
   - aclaraciones por ambigüedad
   - generación de variantes
4. Agregar snapshots textuales simples o fixtures esperados para evitar regresiones.

### Archivos probables

```text
tests/packages/core.test.js
tests/fixtures/prompt-cases.json
packages/core/src/classifier.ts
packages/core/src/generator.ts
packages/core/src/synthesis.ts
```

### Casos mínimos

```text
- migración Mongoose a Prisma
- bug de login con JWT
- mejora de landing React/Tailwind
- repo existente con ruta src/services/auth.js
- pedido ambiguo: "ayudame con mi app"
- MCP/agente/workflow
```

### Validación esperada

```bash
npm test
npm run check
```

### Criterios de aceptación

- Hay tests directos sobre `packages/core`.
- Los casos reales producen intención/dominio/estrategia esperados.
- Los prompts generados no quedan vacíos ni genéricos.
- La web sigue usando el mismo motor.

## Etapa 3 — Motor único para web y CLI

Objetivo: eliminar la divergencia entre `src` y `packages/core`.

### Cambios

1. Hacer que la CLI use `packages/core`.
2. Mantener wrapper compatible si todavía se importa `generate()` desde `src/index.js`.
3. Decidir destino de `src/core` y `src/generator`:
   - compatibilidad temporal
   - o deprecación documentada
4. Actualizar tests antiguos para apuntar al motor TypeScript o al wrapper nuevo.
5. Documentar la arquitectura final.

### Archivos probables

```text
src/cli/index.js
src/index.js
tests/*.test.js
packages/core/src/index.ts
docs/ARCHITECTURE.md
README.md
```

### Validación esperada

```bash
npm run cli -- "crear un endpoint de login con Express y JWT" --json
npm test
npm run check
npm run build
```

### Criterios de aceptación

- Web y CLI usan la misma lógica semántica.
- No hay resultados contradictorios entre CLI y web para el mismo input.
- Tests cubren el motor usado en producción local.
- La API pública queda documentada.

## Etapa 4 — Seguridad del frontend y renderizado seguro

Objetivo: reducir riesgo de XSS y preparar modularización.

### Cambios

1. Reemplazar interpolaciones dinámicas en `innerHTML` por `textContent`.
2. Crear helpers DOM seguros.
3. Reservar `innerHTML` solo para HTML estático sin datos de usuario.
4. Revisar renderizado de:
   - síntesis
   - summary grid
   - preferencias
   - historial
   - errores
   - prompts generados

### Archivos probables

```text
apps/web-chat/public/app.js
apps/web-chat/public/index.html
```

### Validación esperada

```bash
npm run dev
```

Pruebas manuales:

```text
- generar prompt normal
- generar prompt con texto que contenga HTML
- reutilizar historial
- editar prompt generado
- guardar feedback
```

### Criterios de aceptación

- Un input con `<script>` se muestra como texto, no se ejecuta.
- La UI mantiene la misma funcionalidad.
- No se rompe historial, preferencias ni feedback.

## Etapa 5 — Modularización del frontend

Objetivo: dividir `app.js` en módulos mantenibles.

### Estructura propuesta

```text
apps/web-chat/public/js/
├── api.js
├── dom.js
├── state.js
├── renderMessages.js
├── renderPrompts.js
├── renderHistory.js
├── preferences.js
├── presets.js
└── main.js
```

### Cambios

1. Extraer llamadas HTTP a `api.js`.
2. Extraer helpers DOM a `dom.js`.
3. Extraer estado global a `state.js`.
4. Separar renderizado de mensajes, prompts, historial y presets.
5. Actualizar `index.html` para cargar `main.js` como module.

### Validación esperada

```bash
npm run dev
```

Pruebas manuales iguales a la etapa 4.

### Criterios de aceptación

- `app.js` deja de concentrar toda la lógica.
- Los módulos tienen responsabilidades claras.
- No cambia la experiencia del usuario.

## Etapa 6 — UX y producto

Objetivo: mejorar utilidad real sin cambiar la base semántica.

### Mejoras sugeridas

1. Búsqueda/filtro de historial.
2. Exportar prompts desde la UI como Markdown/JSON.
3. Comparar variantes lado a lado.
4. Mostrar puntaje de calidad por prompt.
5. Permitir copiar solo secciones del prompt.
6. Usar feedback para ordenar templates o recomendaciones.

### Archivos probables

```text
apps/web-chat/public/*.js
apps/web-chat/public/styles.css
packages/storage/src/index.ts
packages/shared-types/src/index.ts
```

### Criterios de aceptación

- Las mejoras son visibles y útiles para uso diario.
- No se mezclan con refactors internos.

## Etapa 7 — Capa opcional de IA

Objetivo: sumar IA como mejora opcional, sin reemplazar el motor determinístico.

### Diseño recomendado

```text
draft determinístico → enhance opcional → validate → resultado final
```

### Orden sugerido

1. Ollama local.
2. OpenRouter opcional.
3. LiteLLM si hace falta routing/fallbacks.

### Reglas

- El motor determinístico sigue siendo el fallback principal.
- La IA no debe inventar contexto de repo.
- La IA debe recibir instrucciones y límites claros.
- El resultado mejorado pasa por validadores.

### Criterios de aceptación

- Si la IA falla, el prompt determinístico sigue funcionando.
- Se puede activar/desactivar por preferencia o variable de entorno.
- Hay logs/metadata de si se usó enhancer.

## Orden recomendado de ejecución

```text
1. Etapa 1 — Consistencia y seguridad base
2. Etapa 2 — Tests del motor real TypeScript
3. Etapa 3 — Motor único para web y CLI
4. Etapa 4 — Seguridad del frontend
5. Etapa 5 — Modularización del frontend
6. Etapa 6 — UX/producto
7. Etapa 7 — IA opcional
```

## Primer bloque de trabajo sugerido

Cuando estén disponibles `run_command`, `git_status` y `git_diff`, empezar con:

```text
Etapa 1A:
- leer package.json, README.md y server.ts
- centralizar versión
- actualizar /api/health
- correr npm run check
- revisar git diff
```

Luego:

```text
Etapa 1B:
- agregar validadores HTTP
- conectar validadores al server
- agregar tests mínimos si corresponde
- correr npm test y npm run check
```

Luego:

```text
Etapa 1C:
- mejorar storage JSON con escritura atómica
- agregar recuperación ante JSON corrupto
- correr npm test y npm run check
```
