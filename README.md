# Prompt Generator MVP

> An intelligent prompt engineering tool — not a generic AI chat.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [English](#english)
- [Español](#español)
- [Português](#português)

---

<a name="english"></a>
## 🇬🇧 English

### What is this?

**Prompt Generator MVP** is a deterministic prompt engineering engine. It interprets free-form text requests, analyzes intent, domain, strategy, ambiguity and existing project context, and transforms them into structured, reusable technical prompts.

It is **not** a wrapper around an AI chat API. The core engine is rule-based and deterministic — AI integration is planned as an optional enhancement layer.

### Core Capabilities

| Capability | Description |
|---|---|
| **Intent detection** | Classifies the request type: `code_generation`, `debugging`, `refactor`, `migration`, `ui_design`, `review`, `documentation`, `automation` and more |
| **Domain detection** | Identifies the technical domain: `frontend`, `backend`, `api`, `react`, `python`, `django`, `web_app`, `trading`, `desktop_app` |
| **Strategy inference** | Selects a generation strategy: `implement_new`, `inspect_and_adapt`, `ui_fix_existing`, `migrate_existing_system` |
| **Generation profile** | Resolves the best output profile: `modern_modular_landing`, `existing_frontend_audit`, `existing_system_migration`, `generic` |
| **Ambiguity scoring** | Scores vagueness (`low` / `medium` / `high`) and generates clarification questions when needed |
| **Context reference detection** | Identifies mentions of existing artifacts (repos, folders, APIs, models, tables, components, configs) to prioritize adaptation over invention |
| **Request synthesis** | Extracts goal, work mode, expected deliverables, preferred stack, constraints and quality targets before generating the prompt |
| **Prompt variants** | Produces 3 differentiated variants: analytical prompt, execution brief, and concise prompt |

### Architecture

```
prompt-generator-mvp/
├── apps/
│   └── web-chat/              # Local web interface (Express + HTML/CSS/JS)
│       ├── public/            # Static frontend (app.js, styles.css, index.html)
│       └── src/server.ts      # Express API server
├── packages/
│   ├── core/                  # Semantic engine (TypeScript)
│   │   ├── classifier.ts      # Intent + domain classification
│   │   ├── strategy.ts        # Strategy resolution
│   │   ├── profile.ts         # Generation profile resolver
│   │   ├── synthesis.ts       # Request synthesis (goal, deliverables, stack…)
│   │   ├── generator.ts       # Prompt builder
│   │   └── normalize.ts       # Input normalization
│   ├── shared-types/          # Shared TypeScript types
│   ├── clarification-engine/  # Ambiguity detection and question generation
│   ├── prompt-templates/      # Prompt templates by intent and profile
│   ├── presets/               # Example presets for the web UI
│   ├── validators/            # Input validation
│   └── storage/               # Local JSON history and preferences
├── src/                       # JavaScript semantic engine + CLI
│   ├── core/                  # Intent, domain, strategy, ambiguity, context
│   ├── generator/             # Prompt builder and templates
│   └── cli/                   # Interactive REPL and single-shot CLI
├── tests/                     # Unit tests (Node.js built-in test runner)
├── data/                      # Local history (generations.json, feedback.json)
└── docs/                      # Architecture docs and version roadmaps
```

### Requirements

- **Node.js** 20 or higher
- **npm** (bundled with Node.js)

### Installation

```bash
git clone https://github.com/vicktorgabriel/prompt-generator-mvp
cd prompt-generator-mvp
npm install
```

### Usage

#### Web interface

```bash
npm run dev
```

Open [http://localhost:4173](http://localhost:4173) in your browser.

#### CLI (interactive REPL)

```bash
npm run cli
```

#### CLI (single-shot)

```bash
node src/cli/index.js "migrate from Mongoose to Prisma in src/models/"
```

#### JavaScript API

```js
import { generate, analyze } from './src/index.js';

// Full prompt generation
const { analysis, prompts } = generate('refactor src/controllers/auth.js to async/await');
console.log(prompts[0]);

// Analysis only
const result = analyze('debug the failing query in the users repository');
console.log(result.intent);    // 'debug'
console.log(result.domain);    // 'database'
console.log(result.strategy);  // 'debug'
console.log(result.profile);   // 'database-adaptation'
```

### Available Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run start     # Start production server
npm run build     # Compile TypeScript
npm run check     # Type-check without emitting
npm run cli       # Run the CLI
npm test          # Run unit tests
```

### Design Principles

- **Not a chat** — every generated prompt is a structured technical instruction
- **Adapt, don't invent** — when existing repos, folders, APIs, tables or models are referenced, the prompt explicitly instructs adaptation of the real codebase
- **No mechanical repetition** — filler phrases are removed; the request is reformulated and synthesized
- **True variation** — intent + domain + strategy + context produce meaningfully different outputs
- **Modular architecture** — each module is independent and independently testable

### Roadmap

- [x] Web chat interface with prompt editing and history
- [x] Intent, domain, strategy and profile detection
- [x] Request synthesis engine
- [x] Local JSON history and user preferences
- [x] CLI with interactive REPL and single-shot mode
- [x] 51 unit tests
- [ ] Deeper semantic patterns per domain
- [ ] CLI flags (`--style`, `--detail`, `--json`, `--output-file`)
- [ ] Prompt export to file
- [ ] Optional AI enhancement layer (Ollama → OpenRouter → LiteLLM)
- [ ] VS Code extension

---

<a name="español"></a>
## 🇦🇷 Español

### ¿Qué es este proyecto?

**Prompt Generator MVP** es un motor determinístico de ingeniería de prompts. Interpreta pedidos en texto libre, analiza intención, dominio, estrategia, ambigüedad y contexto de proyecto existente, y los transforma en prompts técnicos estructurados y reutilizables.

**No** es un chat con IA ni un wrapper de API. El motor principal es basado en reglas y determinístico — la integración con IA está planificada como capa opcional de mejora.

### Capacidades principales

| Capacidad | Descripción |
|---|---|
| **Detección de intención** | Clasifica el tipo de pedido: `code_generation`, `debugging`, `refactor`, `migration`, `ui_design`, `review`, `documentation`, `automation` y más |
| **Detección de dominio** | Identifica el dominio técnico: `frontend`, `backend`, `api`, `react`, `python`, `django`, `web_app`, `trading`, `desktop_app` |
| **Inferencia de estrategia** | Selecciona la estrategia de generación: `implement_new`, `inspect_and_adapt`, `ui_fix_existing`, `migrate_existing_system` |
| **Perfil de generación** | Resuelve el perfil óptimo: `modern_modular_landing`, `existing_frontend_audit`, `existing_system_migration`, `generic` |
| **Puntaje de ambigüedad** | Evalúa la vaguedad (`low` / `medium` / `high`) y genera preguntas de clarificación cuando es necesario |
| **Detección de contexto** | Identifica referencias a artefactos existentes (repos, carpetas, APIs, modelos, tablas, componentes, configs) para priorizar adaptación sobre invención |
| **Síntesis del pedido** | Extrae objetivo, modo de trabajo, entregables esperados, stack preferido, restricciones y criterios de calidad antes de generar el prompt |
| **Variantes de prompt** | Produce 3 variantes diferenciadas: prompt analítico, brief de ejecución y prompt compacto |

### Arquitectura

```
prompt-generator-mvp/
├── apps/
│   └── web-chat/              # Interfaz web local (Express + HTML/CSS/JS)
│       ├── public/            # Frontend estático (app.js, styles.css, index.html)
│       └── src/server.ts      # Servidor API Express
├── packages/
│   ├── core/                  # Motor semántico (TypeScript)
│   │   ├── classifier.ts      # Clasificación de intención + dominio
│   │   ├── strategy.ts        # Resolución de estrategia
│   │   ├── profile.ts         # Resolución de perfil de generación
│   │   ├── synthesis.ts       # Síntesis del pedido (objetivo, entregables, stack…)
│   │   ├── generator.ts       # Constructor de prompts
│   │   └── normalize.ts       # Normalización de entrada
│   ├── shared-types/          # Tipos TypeScript compartidos
│   ├── clarification-engine/  # Detección de ambigüedad y generación de preguntas
│   ├── prompt-templates/      # Plantillas de prompts por intención y perfil
│   ├── presets/               # Ejemplos rápidos para la UI web
│   ├── validators/            # Validación de entradas
│   └── storage/               # Historial JSON local y preferencias
├── src/                       # Motor semántico JavaScript + CLI
│   ├── core/                  # Intención, dominio, estrategia, ambigüedad, contexto
│   ├── generator/             # Constructor de prompts y plantillas
│   └── cli/                   # REPL interactivo y modo de ejecución única
├── tests/                     # Tests unitarios (runner nativo de Node.js)
├── data/                      # Historial local (generations.json, feedback.json)
└── docs/                      # Documentación de arquitectura y roadmaps
```

### Requisitos

- **Node.js** 20 o superior
- **npm** (incluido con Node.js)

### Instalación

```bash
git clone https://github.com/vicktorgabriel/prompt-generator-mvp
cd prompt-generator-mvp
npm install
```

### Uso

#### Interfaz web

```bash
npm run dev
```

Abrí [http://localhost:4173](http://localhost:4173) en el navegador.

#### CLI (REPL interactivo)

```bash
npm run cli
```

#### CLI (ejecución única)

```bash
node src/cli/index.js "migrar de Mongoose a Prisma en src/models/"
```

#### API JavaScript

```js
import { generate, analyze } from './src/index.js';

// Generación completa de prompt
const { analysis, prompts } = generate('refactorizar src/controllers/auth.js a async/await');
console.log(prompts[0]);

// Solo el análisis
const result = analyze('debug de la query fallida en el repositorio de usuarios');
console.log(result.intent);    // 'debug'
console.log(result.domain);    // 'database'
console.log(result.strategy);  // 'debug'
console.log(result.profile);   // 'database-adaptation'
```

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con hot reload
npm run start     # Servidor de producción
npm run build     # Compilar TypeScript
npm run check     # Verificación de tipos sin emitir
npm run cli       # Ejecutar la CLI
npm test          # Ejecutar tests unitarios
```

### Principios de diseño

- **No es un chat** — cada prompt generado es una instrucción técnica estructurada
- **Adaptar, no inventar** — cuando se referencian repos, carpetas, APIs, tablas o modelos existentes, el prompt instruye explícitamente a adaptarse al código real
- **Sin repetición mecánica** — las frases de relleno se eliminan; el pedido se reformula y sintetiza
- **Variación real** — intención + dominio + estrategia + contexto producen salidas cualitativamente distintas
- **Arquitectura modular** — cada módulo es independiente y testeable por separado

### Roadmap

- [x] Interfaz web con edición de prompts e historial
- [x] Detección de intención, dominio, estrategia y perfil
- [x] Motor de síntesis del pedido
- [x] Historial JSON local y preferencias de usuario
- [x] CLI con REPL interactivo y modo de ejecución única
- [x] 51 tests unitarios
- [ ] Patrones semánticos más profundos por dominio
- [ ] Flags de CLI (`--style`, `--detail`, `--json`, `--output-file`)
- [ ] Exportación de prompts a archivo
- [ ] Capa opcional de mejora con IA (Ollama → OpenRouter → LiteLLM)
- [ ] Extensión para VS Code

---

<a name="português"></a>
## 🇧🇷 Português

### O que é este projeto?

**Prompt Generator MVP** é um motor determinístico de engenharia de prompts. Ele interpreta pedidos em texto livre, analisa intenção, domínio, estratégia, ambiguidade e contexto de projeto existente, e os transforma em prompts técnicos estruturados e reutilizáveis.

**Não** é um chat com IA nem um wrapper de API. O motor principal é baseado em regras e determinístico — a integração com IA está planejada como uma camada opcional de melhoria.

### Capacidades principais

| Capacidade | Descrição |
|---|---|
| **Detecção de intenção** | Classifica o tipo de pedido: `code_generation`, `debugging`, `refactor`, `migration`, `ui_design`, `review`, `documentation`, `automation` e mais |
| **Detecção de domínio** | Identifica o domínio técnico: `frontend`, `backend`, `api`, `react`, `python`, `django`, `web_app`, `trading`, `desktop_app` |
| **Inferência de estratégia** | Seleciona a estratégia de geração: `implement_new`, `inspect_and_adapt`, `ui_fix_existing`, `migrate_existing_system` |
| **Perfil de geração** | Resolve o perfil ideal: `modern_modular_landing`, `existing_frontend_audit`, `existing_system_migration`, `generic` |
| **Pontuação de ambiguidade** | Avalia a vagueza (`low` / `medium` / `high`) e gera perguntas de esclarecimento quando necessário |
| **Detecção de contexto** | Identifica referências a artefatos existentes (repos, pastas, APIs, modelos, tabelas, componentes, configs) para priorizar adaptação sobre invenção |
| **Síntese do pedido** | Extrai objetivo, modo de trabalho, entregas esperadas, stack preferido, restrições e critérios de qualidade antes de gerar o prompt |
| **Variantes de prompt** | Produz 3 variantes diferenciadas: prompt analítico, brief de execução e prompt compacto |

### Arquitetura

```
prompt-generator-mvp/
├── apps/
│   └── web-chat/              # Interface web local (Express + HTML/CSS/JS)
│       ├── public/            # Frontend estático (app.js, styles.css, index.html)
│       └── src/server.ts      # Servidor API Express
├── packages/
│   ├── core/                  # Motor semântico (TypeScript)
│   │   ├── classifier.ts      # Classificação de intenção + domínio
│   │   ├── strategy.ts        # Resolução de estratégia
│   │   ├── profile.ts         # Resolução de perfil de geração
│   │   ├── synthesis.ts       # Síntese do pedido (objetivo, entregas, stack…)
│   │   ├── generator.ts       # Construtor de prompts
│   │   └── normalize.ts       # Normalização da entrada
│   ├── shared-types/          # Tipos TypeScript compartilhados
│   ├── clarification-engine/  # Detecção de ambiguidade e geração de perguntas
│   ├── prompt-templates/      # Templates de prompts por intenção e perfil
│   ├── presets/               # Exemplos rápidos para a UI web
│   ├── validators/            # Validação de entradas
│   └── storage/               # Histórico JSON local e preferências
├── src/                       # Motor semântico JavaScript + CLI
│   ├── core/                  # Intenção, domínio, estratégia, ambiguidade, contexto
│   ├── generator/             # Construtor de prompts e templates
│   └── cli/                   # REPL interativo e modo de execução única
├── tests/                     # Testes unitários (runner nativo do Node.js)
├── data/                      # Histórico local (generations.json, feedback.json)
└── docs/                      # Documentação de arquitetura e roadmaps
```

### Requisitos

- **Node.js** 20 ou superior
- **npm** (incluso com Node.js)

### Instalação

```bash
git clone https://github.com/vicktorgabriel/prompt-generator-mvp
cd prompt-generator-mvp
npm install
```

### Uso

#### Interface web

```bash
npm run dev
```

Abra [http://localhost:4173](http://localhost:4173) no navegador.

#### CLI (REPL interativo)

```bash
npm run cli
```

#### CLI (execução única)

```bash
node src/cli/index.js "migrar de Mongoose para Prisma em src/models/"
```

#### API JavaScript

```js
import { generate, analyze } from './src/index.js';

// Geração completa de prompt
const { analysis, prompts } = generate('refatorar src/controllers/auth.js para async/await');
console.log(prompts[0]);

// Somente análise
const result = analyze('debug da query com falha no repositório de usuários');
console.log(result.intent);    // 'debug'
console.log(result.domain);    // 'database'
console.log(result.strategy);  // 'debug'
console.log(result.profile);   // 'database-adaptation'
```

### Scripts disponíveis

```bash
npm run dev       # Servidor de desenvolvimento com hot reload
npm run start     # Servidor de produção
npm run build     # Compilar TypeScript
npm run check     # Verificação de tipos sem emitir
npm run cli       # Executar a CLI
npm test          # Executar testes unitários
```

### Princípios de design

- **Não é um chat** — cada prompt gerado é uma instrução técnica estruturada
- **Adaptar, não inventar** — quando repos, pastas, APIs, tabelas ou modelos existentes são referenciados, o prompt instrui explicitamente a adaptar-se ao código real
- **Sem repetição mecânica** — frases genéricas são removidas; o pedido é reformulado e sintetizado
- **Variação real** — intenção + domínio + estratégia + contexto produzem saídas qualitativamente distintas
- **Arquitetura modular** — cada módulo é independente e testável separadamente

### Roadmap

- [x] Interface web com edição de prompts e histórico
- [x] Detecção de intenção, domínio, estratégia e perfil
- [x] Motor de síntese do pedido
- [x] Histórico JSON local e preferências do usuário
- [x] CLI com REPL interativo e modo de execução única
- [x] 51 testes unitários
- [ ] Padrões semânticos mais profundos por domínio
- [ ] Flags de CLI (`--style`, `--detail`, `--json`, `--output-file`)
- [ ] Exportação de prompts para arquivo
- [ ] Camada opcional de melhoria com IA (Ollama → OpenRouter → LiteLLM)
- [ ] Extensão para VS Code

