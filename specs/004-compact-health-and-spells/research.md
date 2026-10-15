# Research & Technical Decisions: Compact Health Controls & Non-Caster Magic Toggle

**Feature**: `004-compact-health-and-spells`  
**Date**: 2026-10-15  
**Status**: Resolved  

## Research Topics & Decisions

---

### 1. Espacios de Magia Derivados Estrictamente de los Conjuros Registrados

- **Contexto**: El usuario requiere que de primeras no aparezca nada en los espacios de magia (porque personajes marciales como guerreros no tienen magia) y prohíbe añadir niveles manualmente. Los niveles visibles deben derivarse de forma estricta y exclusiva del conjuro de mayor nivel que el jugador se haya puesto.
- **Decisión**: Rediseñar la función pura de dominio:
  ```typescript
  export function getHighestSpellLevel(resources: ResourceItem[]): number {
    let max = 0;
    for (const res of resources) {
      if (res.category === 'spell' && typeof res.spellLevel === 'number' && res.spellLevel >= 1) {
        if (res.spellLevel > max) {
          max = res.spellLevel;
        }
      }
    }
    return max; // Retorna 0 si no hay conjuros con nivel >= 1
  }
  ```
  - Si retorna `0`, el bloque de magia en `DailyResourcesTracker` se omite por completo (0 filas visibles).
  - Si retorna `N >= 1` (ej. 3), se renderizan exactamente los niveles del `1` al `N`.
  - Se suprime completamente cualquier botón de añadir niveles manualmente (`+ Niv {N+1}`).
- **Razón**: Máxima fidelidad con la regla de negocio del usuario, elimina ruido visual para no lanzadores y simplifica la interfaz.
- **Alternativas consideradas**:
  - *Mantener un toggle manual de "habilitar magia"*: Rechazado por el usuario; la regla es que emerge automáticamente solo cuando hay conjuros registrados.

---

### 2. Modo Compacto Plegable del Monitor de Salud (`HealthTracker`)

- **Contexto**: Fuera de combate, los botones de daño (-1, -5, -10), curación (+1, +5, +10) y campos numéricos ocupan espacio vertical valioso y corren riesgo de pulsaciones accidentales.
- **Decisión**:
  - Estado `isCompact` (booleano) en `HealthTracker` con persistencia en `LocalStorage` (`pathfinder_ui_prefs_v1`).
  - Modo Compacto:
    - Renderiza una barra limpia de estado: `PG: {currentHp} / {maxHp}`, pill de temporales (si > 0), badge de consciencia y barra de vida gráfica en menos de 55px de altura total.
    - Oculta completamente toda la botonera de daño y curación.
    - Botón táctil `▼ Controles` para expandir la botonera completa en un toque.
  - Modo Expandido:
    - Muestra la botonera completa de combate y un botón accesible `▲ Plegar`.
- **Razón**: Reduce el consumo de espacio vertical en más del 60% fuera de combate, dejando los rasgos y habilidades inmediatamente a la vista.

---

### 3. Preselección Contextual de Categoría en el Modal de Creación

- **Contexto**: Al estar filtrando por "Conjuros" o "Rasgos/Dotes", el usuario espera que al pulsar `+ Añadir` el formulario ya tenga seleccionada dicha categoría.
- **Decisión**:
  - En `ResourceList.tsx`, al abrir `setIsModalOpen(true)`:
    - Si `activeTab === 'spell'`, fijar `setCategory('spell')` y `setSpellLevel(1)`.
    - Si `activeTab === 'feat_trait'`, fijar `setCategory('feat_trait')`.
    - Si `activeTab === 'all'`, mantener la última categoría o 'spell'.
- **Razón**: Elimina fricción y clics innecesarios durante la preparación de la ficha.
