# Prompt Generator MVP

Prompt Generator MVP es una aplicación enfocada en la generación inteligente de prompts técnicos. No funciona como un chat tradicional con IA, sino como un motor que interpreta pedidos, detecta intención, evalúa ambigüedad, identifica estrategia de trabajo y produce prompts más estructurados, útiles y reutilizables.

## Objetivo

El objetivo del proyecto es ayudar a transformar pedidos ambiguos o incompletos en prompts claros, técnicos y orientados a ejecución real, especialmente para tareas como:

- revisión de proyectos existentes
- migración de sistemas
- mejoras de frontend
- auditoría de landings
- implementación de nuevas plataformas
- adaptación de repos y estructuras reales

## Enfoque

El sistema parte de un motor determinístico y modular, capaz de:

- detectar intención del pedido
- identificar dominio técnico
- reconocer contexto de proyecto existente
- evaluar ambigüedad
- decidir una estrategia de generación
- producir variantes de prompt con diferente nivel de síntesis

## Características actuales

- interfaz web tipo chat
- edición del mensaje enviado
- edición del prompt generado
- reutilización de entradas previas
- historial local
- clasificación por intención, dominio y estrategia
- detección de referencias reales como repos, carpetas, APIs o estructuras existentes
- generación de prompts más orientados a ejecución real

## Filosofía del proyecto

El proyecto no busca reemplazar al usuario con una IA conversacional, sino asistirlo en la construcción de prompts mejores, más específicos y menos genéricos, listos para usar en otras herramientas, agentes, modelos o entornos de desarrollo.

## Roadmap general

- fortalecer el motor de análisis semántico
- incorporar más perfiles de generación
- mejorar la variación entre prompts
- añadir versión CLI
- preparar integración futura con VS Code
- agregar capa opcional de mejora con modelos IA
