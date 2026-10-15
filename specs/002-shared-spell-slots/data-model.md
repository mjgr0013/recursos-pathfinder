# Data Model: Shared Spell Slots by Level & Documentation URL

**Feature**: `002-shared-spell-slots`  
**Date**: 2026-10-15  
**Status**: Complete  

## Entities & Type Definitions

```typescript
export type ResourceCategory = 'spell' | 'feat_trait';
export type UsageMode = 'limited' | 'unlimited';

/**
 * Representa la capacidad mágica diaria de un nivel específico de conjuro (1 al 9).
 */
export interface SpellSlotLevel {
  level: number;        // Entero 1..9
  max: number;          // Espacios máximos diarios (>= 0, entero)
  available: number;    // Espacios disponibles actuales (0..max, entero)
}

/**
 * Mapa indexado por nivel para los 9 niveles de conjuros en Pathfinder.
 */
export type SpellSlotsMap = Record<number, SpellSlotLevel>;

/**
 * Entidad de recurso actualizada con nivel de conjuro y URL de documentación externa.
 */
export interface ResourceItem {
  id: string;                  // UUID v4
  name: string;                // Nombre (1..80 caracteres)
  category: ResourceCategory;
  usageMode: UsageMode;
  spellLevel?: number | null;  // 0..9 para conjuros (null para rasgos/dotes)
  url?: string;                // URL opcional a compendio oficial (http/https, máx 500 chars)
  maxUses: number | null;      // Para rasgos limitados independientes (null si es conjuro que usa slots o ilimitado)
  availableUses: number | null;// Para rasgos limitados independientes (null si es conjuro que usa slots o ilimitado)
  description: string;         // Descripción de reglas (0..4000 caracteres)
  sortOrder: number;
}

export interface CharacterProfile {
  id: string;
  name: string;
  level: number;
  characterClass: string;
  avatarDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  maxHp: number;
  currentHp: number;
  tempHp: number;
}

/**
 * Estado unificado del personaje incorporando la matriz global de espacios de conjuros.
 */
export interface CharacterState {
  profile: CharacterProfile;
  health: HealthRecord;
  spellSlots: SpellSlotsMap;
  resources: ResourceItem[];
}

/**
 * Respaldo en formato JSON versión 1.1.0 con soporte retrocompatible para 1.0.0.
 */
export interface CharacterBackupPayload {
  schemaVersion: '1.0.0' | '1.1.0';
  exportedAt: string;
  character: CharacterProfile;
  health: HealthRecord;
  spellSlots?: SpellSlotsMap;
  resources: ResourceItem[];
}
```

---

## Validation Rules & Invariants

1. **Espacios de Conjuros (`SpellSlotLevel`)**:
   - `level`: Debe ser un número entero entre 1 y 9.
   - `max`: Debe ser un entero no negativo (`max >= 0`).
   - `available`: Debe ser un entero acotado entre 0 y `max` (`0 <= available <= max`).
   - Si `max` se reduce a un valor inferior al actual `available`, `available` se ajusta inmediatamente a `min(max, available)`.

2. **Conjuros y Nivel (`ResourceItem`)**:
   - Si `category === 'spell'`:
     - `spellLevel` debe ser un entero entre 0 y 9.
     - Si `spellLevel === 0`: `usageMode` es forzosamente `'unlimited'`.
     - Si `spellLevel >= 1`: el conjuro comparte los espacios de `spellSlots[spellLevel]`. Sus campos `maxUses` y `availableUses` son `null`.
   - Si `category === 'feat_trait'`:
     - `spellLevel` debe ser `null` o `undefined`.
     - Puede ser `limited` (con `maxUses` y `availableUses` independientes) o `unlimited`.
   - Campo `url`: Si está presente, debe ser una cadena no vacía que empiece por `http://` o `https://` y no exceda 500 caracteres.

---

## State Transitions & Domain Operations

| Operación | Estado Inicial | Acción / Parámetros | Estado Resultante | Reglas / Invariantes |
|---|---|---|---|---|
| `spendSpellSlot` | `SpellSlotsMap` | `level: number (1..9)` | `SpellSlotsMap` | `newAvailable = max(0, slots[level].available - 1)`. Si era 0, permanece en 0. |
| `restoreSpellSlot` | `SpellSlotsMap` | `level: number (1..9)` | `SpellSlotsMap` | `newAvailable = min(slots[level].max, slots[level].available + 1)`. No supera el máximo. |
| `updateSpellSlotMax` | `SpellSlotsMap` | `level: number, newMax: number` | `SpellSlotsMap` | `slots[level].max = max(0, newMax)`. `slots[level].available = min(slots[level].max, slots[level].available)`. |
| `applyLongRest` | `CharacterState` | Confirmación | `CharacterState` | 1. Para todo nivel 1..9: `slots[lvl].available = slots[lvl].max`<br>2. Para todo rasgo limitado: `availableUses = maxUses`<br>3. `health.currentHp = health.maxHp`<br>4. `health.tempHp = 0` |
| `normalizeBackupPayload` | `unknown` | Payload importado | `CharacterState` | Si es `v1.0.0`, inicializa `spellSlots` por defecto para niveles 1-9 y asigna `spellLevel: 1` a conjuros sin nivel. Si es `v1.1.0`, valida e hidrata. |
