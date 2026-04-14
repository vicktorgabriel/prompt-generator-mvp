# Roadmap v0.5

## Qué mejora esta versión

### 1. Estrategia de generación
Ahora el motor no solo clasifica intención y dominio: también decide **cómo** debe construir el prompt.

Estrategias actuales:
- `implement_new`
- `inspect_and_adapt`
- `ui_fix_existing`
- `migrate_existing_system`
- `default`

Esto permite que un pedido como “convertí esta plataforma a Django según las tablas de una API existente” ya no se transforme en una app genérica inventada.

### 2. Migración de proyectos existentes
Se endureció el motor para detectar mejor:
- carpetas, repos y proyectos reales
- APIs y tablas ya existentes
- pedidos de adaptación y no de reconstrucción
- migraciones a Django con login, panel admin, tabs y base de datos real

### 3. Referencias detectadas
Ahora el motor extrae nombres concretos cuando aparecen en el mensaje, por ejemplo:
- `eleservic`
- `webs`
- `eleservic-api`

Esas referencias se inyectan al prompt generado.

### 4. Prompts más inteligentes
Los prompts ahora fuerzan mejor estas reglas cuando corresponde:
- inspeccionar primero la estructura real
- no inventar entidades, tabs o módulos genéricos
- usar la API/tablas como fuente de verdad
- separar diagnóstico, plan y ejecución
- pedir implementación archivo por archivo

---

## Próximo objetivo sugerido: v0.6

### A. Casos de uso entrenables por reglas
Agregar una carpeta tipo:

```text
knowledge/examples/
```

con archivos JSON o Markdown que guarden:
- input real
- clasificación esperada
- estrategia esperada
- prompt ideal
- feedback

Eso te permitiría endurecer el motor con ejemplos reales tuyos.

### B. Ranking de templates por feedback
Usar el feedback guardado (`useful`, `mixed`, `bad`) para:
- priorizar ciertos estilos
- sugerir mejores presets
- detectar prompts demasiado genéricos

### C. Presets custom editables
Permitir desde la UI:
- crear preset propio
- editar preset existente
- guardar preset por tipo de tarea

### D. Perfiles rápidos
Agregar perfiles como:
- `Arquitecto`
- `Implementador`
- `Refactor`
- `Auditor técnico`
- `Frontend/UI`
- `Migración`

Cada perfil podría ajustar automáticamente:
- tono
- longitud
- estructura
- restricciones

---

## Objetivo v0.7

### Integración opcional con IA local
Primero con Ollama para:
- mejorar redacción del prompt
- expandir contexto
- refinar prompts ya generados
- comparar base determinística vs. mejora IA

Pero **sin reemplazar** el motor determinístico.

---

## Objetivo v0.8

### Router simple de modelos
Cuando ya exista la capa IA:
- usar modo local si hay Ollama
- usar cloud si está configurado
- elegir modelo según tarea
- fallback si un proveedor falla

---

## Meta posterior

### CLI y VS Code
Cuando el núcleo esté estable:
- CLI reutilizando el mismo core
- extensión VS Code con sidebar/webview
- uso del mismo historial, presets y preferencias

---

## Recomendación práctica

Antes de meter IA, conviene hacer esto:
1. cargar 10 a 20 casos reales tuyos
2. probar clasificación y estrategia
3. ajustar reglas con esos casos
4. recién después sumar capa IA opcional

Ese orden te va a dar un motor mucho más confiable.
