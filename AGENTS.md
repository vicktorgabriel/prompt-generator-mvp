# AGENTS.md

## Propósito del repositorio
Este repositorio contiene **Prompt Generator MVP**: un motor determinístico de ingeniería de prompts con interfaz web y CLI.

Stack principal:
- **Runtime**: Node.js 20+ (ES modules)
- **Core engine**: TypeScript (packages/core/) + JavaScript (src/)
- **Web interface**: Express.js + HTML/CSS/JS (apps/web-chat/)
- **CLI**: REPL interactivo y modo single-shot (src/cli/)

## Flujo obligatorio de trabajo
Antes de trabajar en cualquier tarea:

1. Leer `REGLAMENTO.md`.
2. Identificar qué parte del repo se toca (ver estructura abajo).
3. Consultar la documentación relevante en `docs/`.

## Estructura del proyecto

```
prompt-generator-mvp/
├── packages/              # Módulos TypeScript
│   ├── core/              # Motor semántico: classifier, strategy, profile, synthesis, generator
│   ├── shared-types/      # Tipos TypeScript compartidos
│   ├── clarification-engine/  # Detección de ambigüedad y preguntas
│   ├── prompt-templates/  # Plantillas por intención y perfil
│   ├── presets/           # Presets para la UI web
│   ├── validators/        # Validación de entradas
│   └── storage/           # Historial JSON y preferencias
├── src/                   # Motor JavaScript + CLI
│   ├── core/              # Intención, dominio, estrategia, contexto
│   ├── generator/         # Constructor de prompts
│   └── cli/               # REPL y single-shot
├── apps/web-chat/         # Interfaz web (Express + estático)
├── tests/                 # Tests unitarios
├── data/                  # Historial local (generations.json, feedback.json)
└── docs/                  # Arquitectura y roadmaps
```

## Lectura mínima por tipo de tarea

### Si la tarea afecta el motor semántico (clasificación, estrategia, perfiles)
Leer obligatoriamente:
- `docs/ARCHITECTURE.md`
- `packages/core/` — código fuente del módulo afectado

### Si la tarea afecta generación de prompts o plantillas
Leer obligatoriamente:
- `docs/ARCHITECTURE.md`
- `packages/prompt-templates/` — plantillas existentes
- `packages/core/generator.ts` — constructor de prompts

### Si la tarea afecta la interfaz web
Leer obligatoriamente:
- `apps/web-chat/` — servidor Express y estáticos
- `packages/presets/` — presets disponibles

### Si la tarea afecta la CLI
Leer obligatoriamente:
- `src/cli/` — punto de entrada y comandos
- `src/index.js` — API pública

### Si la tarea afecta tipos o validación
Leer obligatoriamente:
- `packages/shared-types/` — definiciones de tipos
- `packages/validators/` — reglas de validación

### Si la tarea afecta almacenamiento o historial
Leer obligatoriamente:
- `packages/storage/` — motor de almacenamiento
- `data/` — estructura de archivos JSON

## Cierre obligatorio de cada tarea
Al finalizar una tarea:

1. Ejecutar chequeos razonables (tests, type-check, lint).
2. Actualizar la documentación si cambió arquitectura o API pública.
3. Registrar decisiones importantes en el commit.

## Chequeos por tipo de cambio

| Tipo de cambio | Chequeo obligatorio |
|---|---|
| TypeScript core | `npm run check` (tsc --noEmit) |
| Cualquier cambio | `npm test` (tests unitarios) |
| Web interface | `npm run dev` — verificar en navegador |
| CLI | `npm run cli` — probar interactivamente |
| Dependencias nuevas | `npm audit` — sin vulnerabilidades críticas |

## Uso de herramientas y asistentes
- Codex debe usar `/.codex` como capa especializada.
- Copilot debe seguir este archivo y `REGLAMENTO.md`.
- Claude puede adaptar sus herramientas, pero debe respetar la misma base documental.
- No duplicar reglamentos entre asistentes.

Skills compartidos disponibles en `/.agents/skills`:
- `caveman`
- `caveman-commit`
- `caveman-review`

## Cierre obligatorio para TODOS los asistentes

1. **Validar** lo tocado (imports, tipos, tests, build)
2. **Actualizar `docs/`** si hubo cambios arquitectónicos
3. **Actualizar `README.md`** si cambió la API pública o las capacidades del proyecto
4. **Commit con mensaje claro** siguiendo el estilo del repo

**CRÍTICO**: Código sin tests o sin type-check NO está terminado. Cambios en API pública sin documentación actualizada dejan ignorancia para próximos cambios.
