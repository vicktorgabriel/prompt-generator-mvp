# Roadmap v0.6

## Qué cambió en v0.6
- Se agregó un **perfil de generación** para diferenciar mejor entre:
  - `modern_modular_landing`
  - `existing_frontend_audit`
  - `existing_system_migration`
  - `generic`
- El motor ahora entiende mejor cuando un pedido apunta a una **landing moderna** y, si no se especifica otro stack, prioriza una salida orientada a **React + Tailwind CSS + TypeScript**.
- Se endureció la salida para que una landing no termine en algo monolítico o poco modular.
- Se limpiaron los ejemplos para que ya no usen nombres del usuario: ahora son **genéricos/random**.
- En la UI, los presets pasan a verse como **ejemplos rápidos**.
- La respuesta ahora muestra también el **perfil detectado**, no solo intención, dominio y estrategia.

## Qué conviene probar ahora
1. Pedidos de landing nueva:
   - "Quiero una landing moderna y modular para un producto SaaS"
   - "Armame una landing con hero, features, testimonials y CTA"
2. Pedidos de landing existente:
   - "Revisá esta landing actual y corregí spacing, header y botones"
3. Pedidos de migración real:
   - "Convertí esta plataforma existente a Django usando la API real como fuente de verdad"
4. Casos ambiguos para ver si pregunta o asume bien.

## Prioridades para v0.7
### 1. Mejorar memoria de estilo del usuario
- Guardar qué tipo de prompts preferís:
  - más técnicos
  - más estrictos
  - más modulares
  - más orientados a implementación
- Ajustar automáticamente la salida en base al feedback y al uso.

### 2. Agregar perfiles rápidos de salida
Perfiles como:
- `strict-implementation`
- `repo-audit`
- `landing-builder`
- `migration-hard-mode`
- `frontend-refactor`

### 3. Añadir extracción de constraints
Extraer automáticamente del mensaje cosas como:
- stack deseado
- login
- panel admin
- responsive
- modularidad
- mantener diseño existente
- no inventar entidades

### 4. Agregar AI Enhancer opcional
Primero como capa secundaria, no reemplazando el motor determinístico:
- mejorar redacción
- reforzar requisitos
- expandir prompts
- convertir un prompt base en variantes más técnicas

## Prioridades para v0.8
### Router de modelos opcional
Agregar una capa enchufable para enrutar tareas a:
- modo local
- modo cloud gratis
- modo fallback

### Casos sugeridos
- `rewrite` -> modelo rápido/barato
- `expand` -> modelo más capaz
- `fallback` -> proveedor alternativo si falla uno

## Prioridades para v0.9
### CLI
- `promptgen "quiero una landing modular"`
- output en consola
- exportación a markdown/txt/json

### Base para VS Code
- el núcleo ya debería estar listo para enchufar luego a una extensión
- idealmente con perfil y enhancer desacoplados

## Regla de arquitectura que conviene mantener
- El motor base debe seguir siendo **determinístico y confiable**.
- La IA debe entrar como **capa de mejora opcional**, no como reemplazo del núcleo.
- El sistema debe poder funcionar aunque no haya modelos disponibles.
