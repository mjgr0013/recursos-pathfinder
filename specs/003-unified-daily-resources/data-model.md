# Data Model: Unified Daily Resources & Dynamic Spell Slots

**Feature**: `003-unified-daily-resources`  
**Date**: 2026-10-15  
**Status**: Complete  

## Entities & Type Definitions

Se conservan las entidades existentes de `CharacterProfile`, `HealthRecord`, `ResourceItem`, `SpellSlotsMap` y `CharacterState`, extendiendo las operaciones puras de cálculo.

```typescript
export interface SpellSlotLevel {
  level: number;        // Entero 1..9
  max: number;          // Espacios máximos diarios (>= 0)
  available: number;    // Espacios disponibles (0..max)
}

export type SpellSlotsMap = Record<number, SpellSlotLevel>;

export interface ResourceItem {
  id: string;
  name: string;
  category: 'spell' | 'feat_trait';
  usageMode: 'limited' | 'unlimited';
  spellLevel?: number | null;
  url?: string;
  maxUses: number | null;
  availableUses: number | null;
  description: string;
  sortOrder: number;
}
```

---

## Domain Operations & Calculation Invariants

| Operación | Parámetros | Retorno | Invariantes / Reglas |
|---|---|---|---|
| `getMaxActiveSpellLevel` | `spellSlots: SpellSlotsMap, resources: ResourceItem[], manualMax?: number` | `number (0..9)` | Calcula el mayor de:<br>1. Mayor `spellLevel` en `resources` donde `category === 'spell' && spellLevel >= 1`<br>2. Mayor nivel en `spellSlots` donde `max > 0`<br>3. `manualMax ?? 0`<br>Si todos son 0 y no hay nada registrado, retorna 0 (o 1 si hay slots predeterminados). |
| `updateResourceMaxUses` | `resources: ResourceItem[], id: string, newMax: number` | `ResourceItem[]` | Para el recurso indicado:<br>1. `cleanMax = max(1, floor(newMax))`<br>2. `newAvailable = min(cleanMax, availableUses)`<br>Retorna copia inmutable de la lista. |
| `getLimitedTraits` | `resources: ResourceItem[]` | `ResourceItem[]` | Filtra exclusivamente recursos donde `category === 'feat_trait' && usageMode === 'limited'`. |
| `applyLongRest` | `CharacterState` | `CharacterState` | Restaura al 100% todos los espacios de conjuros dinámicos (1..9), todos los `availableUses = maxUses` de los rasgos limitados y la salud al 100% de `maxHp`. |
