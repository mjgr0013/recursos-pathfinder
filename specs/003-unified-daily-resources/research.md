# Research & Technical Decisions: Unified Daily Resources & Dynamic Spell Slots

**Feature**: `003-unified-daily-resources`  
**Date**: 2026-10-15  
**Status**: Resolved  

## Research Topics & Decisions

---

### 1. Cálculo Dinámico del Nivel Máximo de Conjuros

- **Contexto**: Anteriormente se renderizaban estáticamente los 9 niveles de conjuros por defecto, ocupando un espacio vertical excesivo en pantallas móviles.
- **Decisión**: Función pura en dominio `getMaxActiveSpellLevel`:
  ```typescript
  export function getMaxActiveSpellLevel(
    spellSlots: SpellSlotsMap,
    resources: ResourceItem[],
    manualMaxLevel?: number
  ): number
  ```
  - Calcula el nivel máximo entre:
    1. El `spellLevel` más alto de los conjuros registrados (`category === 'spell' && spellLevel >= 1`).
    2. El nivel más alto con espacios configurados (`spellSlots[lvl].max > 0`).
    3. `manualMaxLevel` (si el usuario pulsa "+ Habilitar Nivel siguiente").
  - Si no hay conjuros ni espacios configurados, retorna 0 (o 1 si el personaje es lanzador).
  - Solo se renderizan los niveles `1 <= lvl <= maxActiveLevel`.
- **Razón**: Elimina hasta 7 filas vacías e irrelevantes en personajes de niveles 1 a 4, reduciendo el scroll en smartphones más del 50%.
- **Alternativas consideradas**:
  - *Hardcodear por nivel de personaje*: En Pathfinder depende de si la clase es lanzador completo (mago hasta nivel 9), semi-lanzador (paladín/explorador hasta nivel 4) o no lanzador. El cálculo derivado de los conjuros y slots configurados es universal para cualquier clase o multiclase.

---

### 2. Panel Unificado de Recursos Diarios Finitos (`DailyResourcesTracker`)

- **Contexto**: El usuario solicitaba unificar la visualización de los espacios de conjuros y los usos de rasgos/dotes disponibles en una única ubicación en pantalla.
- **Decisión**: Componente integrado `DailyResourcesTracker` que unifica dos subsecciones:
  1. **Espacios de Magia**: Muestra los niveles activos dinámicos (1 a N) con contadores `disp/max` y botones `-1`/`+1`.
  2. **Rasgos y Dotes (Usos Diarios)**: Filtra y lista únicamente los recursos donde `category === 'feat_trait' && usageMode === 'limited'`, mostrando su nombre, contador `disp/max`, botones táctiles `-1`/`+1` y botón de edición rápida de usos máximos.
- **Razón**: Permite al jugador ver en un solo vistazo toda su "munición" de combate y poderes del día sin tener que desplazarse al final de la página.
- **Alternativas consideradas**:
  - *Mezclar conjuros y rasgos en una única lista desordenada*: Confuso para el jugador, ya que los conjuros consumen espacios compartidos por nivel mientras que los rasgos tienen contadores independientes. Agruparlos bajo el mismo contenedor visual pero claramente categorizados ofrece la mejor ergonomía y claridad mental.

---

### 3. Ajuste Rápido de Usos Máximos de Rasgos Limitados

- **Contexto**: Los rasgos limitados (Canalizar Energía, Imposición de Manos, Furia Bárbara) varían sus usos máximos al subir de nivel o modificar bonificadores.
- **Decisión**:
  - Función de dominio pura: `updateResourceMaxUses(resources: ResourceItem[], id: string, newMax: number): ResourceItem[]`.
  - Invariante: `newMax >= 1`; si `availableUses > newMax`, se acota automáticamente a `newMax`. Si estaba gastado (ej. 2/4), al aumentar a 5 se mantiene en 2/5 sin regalar usos no descansados.
  - Botón de edición táctil rápido (`✏️`) en el panel unificado y en la tarjeta del recurso.
- **Razón**: Respeta la integridad de las reglas de juego y previene inconsistencias matemáticas.
