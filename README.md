# prompt-generator

Generador inteligente de prompts con análisis semántico, detección de intención/dominio/estrategia y salida adaptada al contexto real del usuario.

> **Este sistema NO es un chat tradicional con IA.** Su función es interpretar la entrada del usuario y transformarla en prompts técnicos más claros, estructurados y útiles.

---

## Características principales

- **Detección de intención**: `create`, `debug`, `refactor`, `migrate`, `explain`, `test`, `document`, `optimize`, `integrate`, `review`, `setup`, `generate`
- **Detección de dominio**: `frontend`, `backend`, `database`, `devops`, `mobile`, `ml`, `api`, `fullstack`
- **Detección de estrategia**: `step-by-step`, `code-focused`, `architecture`, `review`, `migration`, `debug`, `documentation`, `data-model`
- **Análisis de ambigüedad**: puntaje 0–1 con nivel `low / medium / high`, con sugerencias de aclaración
- **Detección de contexto existente**: refs a repos, carpetas (`src/`), APIs, modelos, tablas, componentes, funciones, configuraciones
- **Perfiles de generación**: cada combinación intención+dominio+contexto produce una salida diferente y específica
- **Sin repetición mecánica**: el texto del usuario se transforma, no se repite al inicio del prompt
- **Variantes múltiples**: entradas de alta ambigüedad generan dos prompts con interpretaciones alternativas
- **Adaptación sobre invención**: cuando se detectan artefactos existentes (tablas, repos, rutas), el prompt instruye explícitamente a adaptar, no inventar

---

## Arquitectura

```
src/
├── index.js              # API de librería: generate(), analyze()
├── core/
│   ├── analyzer.js       # Orquestador del análisis semántico
│   ├── intent.js         # Detección de intención
│   ├── domain.js         # Detección de dominio técnico
│   ├── strategy.js       # Detección de estrategia de generación
│   ├── ambiguity.js      # Puntaje y nivel de ambigüedad
│   └── context.js        # Detección de referencias a artefactos existentes
├── generator/
│   ├── index.js          # Punto de entrada: generate()
│   ├── builder.js        # Ensamblador de prompts
│   └── templates.js      # Fragmentos de roles, directivas, modificadores
└── cli/
    └── index.js          # Interfaz de línea de comandos (REPL + modo único)
tests/
├── analyzer.test.js      # Tests del motor semántico
├── generator.test.js     # Tests del generador de prompts
└── context.test.js       # Tests del detector de contexto
```

---

## Instalación

```bash
# Requiere Node.js >= 18
npm install
```

---

## Uso

### CLI interactivo

```bash
node src/cli/index.js
# o tras npm link:
prompt-gen
```

### Modo de un solo prompt

```bash
node src/cli/index.js "migrate from Mongoose to Prisma in src/models/"
```

### Como librería

```js
const { generate, analyze } = require('./src/index');

// Generar prompt completo
const { analysis, prompts } = generate('refactor src/controllers/auth.js to use async/await');
console.log(prompts[0]);

// Solo el análisis
const analysis = analyze('debug the failing query in the users repository');
console.log(analysis.intent);    // 'debug'
console.log(analysis.domain);    // 'database'
console.log(analysis.strategy);  // 'debug'
console.log(analysis.profile);   // 'database-adaptation'
```

---

## Comandos CLI

| Comando    | Descripción                        |
|------------|------------------------------------|
| `:quit`    | Salir                              |
| `:clear`   | Limpiar pantalla                   |
| `:help`    | Mostrar ayuda                      |
| `:history` | Ver entradas de la sesión actual   |

---

## Ejemplos de prompts generados

### Entrada con contexto existente

```
> migrate from Mongoose to Prisma in the existing project at src/models/
```

```
You are a database architect with strong knowledge of relational and non-relational systems.

Migrate the following from its current implementation to the target technology.
Preserve existing behavior and document breaking changes:
Provide a migration checklist. For each changed piece, show before/after. Flag any breaking changes.

IMPORTANT: The user references existing artifacts: folder (src/).
Adapt to the existing codebase — do NOT invent structure. Inspect what is already there and build on it.

## Task
Migrate from Mongoose to Prisma in the existing project at src/models/

## Constraints
Ensure proper indexing strategy. Avoid N+1 queries. Include rollback logic in migrations.
```

### Entrada ambigua → dos variantes

```
> help me with something
```

Genera **Prompt Variant 1** (interpretación más común) y **Prompt Variant 2** (interpretación alternativa), con sugerencias de aclaración.

---

## Tests

```bash
npm test
```

---

## Criterios de diseño

- **No tratar el sistema como un chat simple**: cada prompt es una instrucción técnica estructurada
- **No inventar estructura**: cuando el usuario menciona repos, carpetas, APIs, modelos o tablas existentes, el prompt instruye a adaptarse
- **No repetir mecánicamente el texto del usuario**: los fillers (`please create a`, `help me with`) son eliminados; la tarea se reformula
- **Variar realmente la salida**: intención + dominio + estrategia + contexto producen combinaciones distintas
- **Arquitectura modular**: cada módulo (`intent`, `domain`, `strategy`, `ambiguity`, `context`) es independiente y extensible

---

## Líneas de evolución

- [ ] Mejora del motor semántico con más patrones por dominio
- [ ] Perfiles de generación más finos (por framework específico)
- [ ] Historial persistente y reutilización de prompts
- [ ] CLI con modo `--interactive` y `--output-file`
- [ ] Integración opcional con modelos IA como capa de refinamiento
- [ ] Extensión VS Code
