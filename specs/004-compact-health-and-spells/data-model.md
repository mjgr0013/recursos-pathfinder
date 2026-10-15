# Data Model: Compact Health Controls & Non-Caster Magic Toggle

**Feature**: `004-compact-health-and-spells`  
**Date**: 2026-10-15  
**Status**: Complete  

## Entities & Type Definitions

Se mantienen las estructuras existentes (`CharacterProfile`, `HealthRecord`, `ResourceItem`, `SpellSlotsMap`, `CharacterState`).

### Funciones de Dominio y Operaciones Puras

```typescript
/**
 * Retorna el nivel más alto de conjuro (1 a 9) presente en los recursos del personaje.
 * Si no posee conjuros con nivel >= 1 (ej. no lanzador, o solo trucos de nivel 0), retorna estrictamente 0.
 */
export function getHighestSpellLevel(resources: ResourceItem[]): number {
  let highest = 0;
  for (const res of resources) {
    if (res.category === 'spell' && typeof res.spellLevel === 'number' && res.spellLevel >= 1) {
      if (res.spellLevel > highest) {
        highest = res.spellLevel;
      }
    }
  }
  return highest;
}
```

---

## Domain Rules & Invariants

| Regla / Invariante | Descripción | Impacto en UI |
|---|---|---|
| **Cero magia por defecto** | Si `getHighestSpellLevel(resources) === 0`, el total de niveles mágicos a renderizar es 0. | El sub-bloque de espacios de magia no renderiza ninguna fila ni caja (se omite por completo). |
| **Derivación estricta** | Si `getHighestSpellLevel(resources) === N` ($N \ge 1$), los niveles visibles son exactamente `[1, ..., N]`. | No se muestran niveles superiores a $N$. |
| **Prohibición de botones manuales** | No existen botones para forzar o habilitar niveles mayores a $N$. | La aparición de espacios depende exclusivamente de que el personaje se ponga un conjuro de ese nivel. |
| **Modo Compacto de Salud** | Cuando `isCompact === true`, solo se muestran `currentHp`, `maxHp`, `tempHp` (si > 0), badge de consciencia y barra gráfica. | Toda la botonera de daño y curación rápida se oculta. |
| **Preselección Contextual** | Al abrir el modal de nuevo recurso, la categoría se inicializa según la pestaña activa en la lista (`spell` o `feat_trait`). | El usuario no tiene que cambiar manualmente el selector si ya está en la pestaña adecuada. |
