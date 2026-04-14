# Prompt Generator MVP

Prompt Generator MVP es una aplicación orientada a la generación inteligente de prompts técnicos. No funciona como un chat genérico con IA, sino como un motor que interpreta el pedido del usuario, detecta intención, dominio, ambigüedad y estrategia de generación, para producir prompts más útiles, estructurados y reutilizables.

## Objetivo del proyecto

El objetivo de este proyecto es ayudar a transformar pedidos ambiguos, incompletos o demasiado generales en prompts técnicos más claros, accionables y mejor pensados, listos para ser utilizados en herramientas de IA, asistentes de desarrollo, agentes o flujos de trabajo técnicos.

Está especialmente orientado a casos como:

- revisión de proyectos existentes
- migración o adaptación de sistemas
- mejoras de frontend o landings
- auditoría de interfaces
- generación de prompts para implementación técnica
- análisis de estructuras reales de repositorios o APIs existentes

## Enfoque

Este proyecto no busca reemplazar el criterio del usuario con una conversación automática, sino asistirlo en la construcción de mejores prompts.

El motor actual trabaja sobre una lógica modular y determinística, capaz de:

- detectar intención del pedido
- identificar dominio técnico
- reconocer contexto de proyecto existente
- detectar ambigüedad
- inferir estrategia de generación
- producir distintas variantes de prompt
- permitir edición y reutilización del mensaje o del prompt generado

## Características actuales

- interfaz web local tipo chat
- edición del mensaje enviado
- edición del prompt generado
- reutilización de mensajes anteriores
- historial local
- análisis de intención, dominio, estrategia y perfil
- generación de variantes de prompt
- detección de referencias reales como carpetas, repos, APIs o estructuras existentes
- enfoque en prompts más técnicos y menos genéricos

## Estado actual

Esta versión corresponde a un MVP funcional orientado a experimentación y mejora continua del motor. El proyecto ya permite probar distintos casos de generación, pero todavía está en evolución.

Las siguientes áreas siguen abiertas a mejora:

- mayor variación real entre prompts generados
- mayor profundidad semántica
- clasificación más fina por tipo de tarea
- versión CLI
- integración futura con modelos IA como capa opcional
- futura integración con VS Code

## Tecnologías

- TypeScript
- React
- Vite
- lógica modular propia para análisis y generación

## Requisitos previos

Antes de ejecutar el proyecto, necesitás tener instalado:

- [Node.js](https://nodejs.org/)
- npm

Se recomienda usar una versión reciente de Node.js.

## Qué trae esta versión

- clasificación de intención y dominio más robusta
- detección de **estrategia de generación** (`implement_new`, `inspect_and_adapt`, `ui_fix_existing`, `migrate_existing_system`)
- detección de **perfil de generación** (`modern_modular_landing`, `existing_frontend_audit`, `existing_system_migration`, `generic`)
- prompts más afinados para **landings modernas altamente modulares**
- preferencia explícita por **React + Tailwind CSS + TypeScript** cuando el pedido apunta a una landing y no fija otro stack
- extracción de referencias reales de carpetas, repos y APIs cuando aparecen en el pedido
- prompts más fuertes para **migraciones** y **proyectos existentes**
- ejemplos rápidos genéricos, sin referencias al contexto personal del usuario
- preferencias persistentes para detalle, estilo de salida, estructura de archivos y supuestos
- feedback rápido útil/regular/malo guardado por generación
- generación de 3 variantes de prompt
- historial local en JSON
- edición inline de mensajes enviados para reusar y regenerar sin reescribir
- edición inline de prompts generados para ajustarlos antes de copiar
- reuso rápido desde el historial reciente
- UI web simple para probar el motor

## Requisitos

- Node.js 20 o superior

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/vicktorgabriel/prompt-generator-mvp
cd TU_REPO

npm install
npm run dev
```

Abrí:

```text
http://localhost:4173
```

## Scripts

```bash
npm run dev
npm run start
npm run check
npm run build
```

## Estructura

```text
apps/
  web-chat/
packages/
  core/
  clarification-engine/
  prompt-templates/
  presets/
  shared-types/
  storage/
  validators/
data/
  preferences.json
  history/
    generations.json
    feedback.json
```

## Documentos útiles

- `docs/ROADMAP_V0_7.md`
- `docs/AI_ENHANCER_PLAN.md`

# Contexto del proyecto

Este repositorio contiene un generador inteligente de prompts técnicos.

## Qué es
No es un chat tradicional con IA. Es un motor que recibe texto libre, analiza el pedido y genera prompts más estructurados, útiles y reutilizables.

## Qué intenta resolver
- pedidos ambiguos
- prompts demasiado genéricos
- falta de estructura técnica
- necesidad de adaptar prompts a proyectos reales o existentes

## Principios del proyecto
- no inventar estructura cuando el usuario se refiere a un proyecto real
- no repetir mecánicamente el texto del usuario
- detectar intención, dominio, ambigüedad y estrategia
- producir variantes de prompt más útiles
- mantener arquitectura modular y escalable

## Estado actual
- versión MVP web
- edición y reutilización de mensajes
- edición de prompts generados
- historial local
- enfoque determinístico
- pendiente CLI
- pendiente mejora opcional con IA externa

## Línea futura
- CLI
- mejora semántica del motor
- integración opcional con modelos IA
- futura integración con VS Code
