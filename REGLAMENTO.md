# REGLAMENTO.md

## Propósito
Este reglamento define la forma obligatoria de trabajar dentro del repo `prompt-generator-mvp`.

## Reglas maestras

### 1. Entender antes de modificar
Antes de tocar código, hay que entender:

- qué módulo se está tocando (packages/, src/, apps/)
- si afecta el motor semántico, la generación de prompts, la web o la CLI
- qué tipos y contratos están en juego
- qué documentación hay que leer

No se modifica a ciegas.

### 2. Respetar la arquitectura objetivo
Las decisiones nuevas deben empujar al proyecto hacia:

- Motor semántico determinístico (no AI chat wrapper)
- Módulos independientes y testeables (packages/)
- CLI y web interface como capas consumidoras del core
- Tipos compartidos como fuente de verdad (shared-types)
- Plantillas reutilizables por intención y perfil (prompt-templates)

### 3. No inventar estructura si ya existe una real
Si el repo ya tiene una estructura coherente para una parte del sistema, hay que respetarla.
Si la estructura actual es deficiente, se debe proponer una mejora coherente, no improvisar otra distinta.

### 4. No duplicar lógica
La lógica de clasificación, estrategia y generación no debe estar duplicada entre:
- packages/core/ (TypeScript)
- src/core/ (JavaScript)
- apps/web-chat/ (Express)
- src/cli/ (CLI)

Cada capa debe consumir el core, no reimplementarlo.

### 5. Si una tarea toca arquitectura, leer docs primero
Antes de cambios estructurales, es obligatorio leer:
- `docs/ARCHITECTURE.md`

### 6. Si una tarea toca funcionalidad, entender el PRD
Antes de tocar un módulo funcional, entender su propósito y contratos.

### 7. Hacer cambios pequeños y consistentes
No hacer refactors masivos innecesarios.
No mezclar cambios de UI, tipos y arquitectura en una sola modificación si no hace falta.

### 8. Validar antes de cerrar
Toda tarea debe cerrarse con validación razonable.

Como mínimo:
- revisar imports y rutas
- revisar tipos TypeScript si aplica
- correr `npm run check` (tsc --noEmit)
- correr `npm test`

### 9. Documentar cambios importantes
Si cambió la arquitectura o la API pública:
- actualizar `docs/ARCHITECTURE.md`
- actualizar `README.md` si cambió el uso

### 10. Cambio de tema
Si cambia el foco del trabajo:
- marcar el tema anterior como pausado o activo según corresponda
- activar el nuevo tema
- no seguir mezclando contenido de dos temas distintos

### 11. Reanudar tema anterior
Si se vuelve a un tema:
- usar la documentación ya existente
- actualizarla
- no duplicarla con otro nombre

### 12. Seguridad y claves
Nunca dejar:
- claves hardcodeadas
- secretos en código fuente
- configuraciones sensibles sin documentar

### 13. No es un chat
Cada prompt generado debe ser una instrucción técnica estructurada, no una conversación.
El motor es determinístico, no un wrapper de API de IA.

### 14. Adaptar, no inventar
Cuando se referencian repos, carpetas, APIs o modelos existentes, el prompt debe instruir explícitamente a adaptarse al código real.

### 15. Sin repetición mecánica
Las frases de relleno se eliminan; el pedido se reformula y sintetiza.

## Checklist de cierre de tarea
Antes de dar una tarea por terminada:

- [ ] Se entendió el módulo tocado y su contexto.
- [ ] Se hicieron cambios coherentes con la arquitectura objetivo.
- [ ] Se validó lo tocado (`npm run check`, `npm test`, imports, tipos).
- [ ] Se actualizó `docs/ARCHITECTURE.md` si hubo cambios arquitectónicos.
- [ ] Se actualizó `README.md` si cambió la API pública.
- [ ] Se registró una decisión en el commit si fue importante.
