import { SpellSlotsMap, ResourceItem } from './types';

/**
 * Retorna el nivel más alto de conjuro (1 a 9) presente en los recursos del personaje.
 * Si no posee conjuros con nivel >= 1 (ej. no lanzador, o solo trucos de nivel 0), retorna estrictamente 0.
 */
export function getHighestSpellLevel(resources: ResourceItem[] = []): number {
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

/**
 * Calcula dinámicamente el nivel de conjuros más alto activo a renderizar.
 * Derivado de los conjuros registrados, espacios configurados con max > 0 y manualMaxLevel.
 * Retorna un valor entre 1 y 9.
 */
export function getMaxActiveSpellLevel(
  spellSlots: SpellSlotsMap,
  resources: ResourceItem[] = [],
  manualMaxLevel: number = 0
): number {
  let highest = manualMaxLevel;

  for (const res of resources) {
    if (res.category === 'spell' && typeof res.spellLevel === 'number' && res.spellLevel >= 1) {
      if (res.spellLevel > highest) {
        highest = res.spellLevel;
      }
    }
  }

  for (let lvl = 1; lvl <= 9; lvl++) {
    const slot = spellSlots[lvl];
    if (slot && slot.max > 0) {
      if (lvl > highest) {
        highest = lvl;
      }
    }
  }

  return Math.min(9, Math.max(1, highest));
}

/**
 * Inicializa los 9 niveles de espacios de conjuros de Pathfinder.
 * Nivel 1 inicia con 3 espacios por defecto, los demás en 0.
 */
export function createDefaultSpellSlots(): SpellSlotsMap {
  const map: SpellSlotsMap = {};
  for (let lvl = 1; lvl <= 9; lvl++) {
    map[lvl] = {
      level: lvl,
      max: lvl === 1 ? 3 : 0,
      available: lvl === 1 ? 3 : 0,
    };
  }
  return map;
}

/**
 * Descuenta 1 espacio disponible del nivel indicado (mínimo 0).
 */
export function spendSpellSlot(slots: SpellSlotsMap, level: number): SpellSlotsMap {
  const slot = slots[level];
  if (!slot || slot.available <= 0) return slots;

  return {
    ...slots,
    [level]: {
      ...slot,
      available: Math.max(0, slot.available - 1),
    },
  };
}

/**
 * Recupera 1 espacio disponible del nivel indicado (tope max).
 */
export function restoreSpellSlot(slots: SpellSlotsMap, level: number): SpellSlotsMap {
  const slot = slots[level];
  if (!slot || slot.available >= slot.max) return slots;

  return {
    ...slots,
    [level]: {
      ...slot,
      available: Math.min(slot.max, slot.available + 1),
    },
  };
}

/**
 * Actualiza los espacios máximos de un nivel y acota los disponibles si exceden el nuevo máximo.
 */
export function updateSpellSlotMax(slots: SpellSlotsMap, level: number, rawMax: number): SpellSlotsMap {
  const slot = slots[level];
  if (!slot) return slots;

  const max = Math.max(0, Math.floor(rawMax));
  const available = Math.min(max, slot.available);

  return {
    ...slots,
    [level]: {
      ...slot,
      max,
      available,
    },
  };
}

/**
 * Actualiza tanto los espacios disponibles como los máximos de un nivel,
 * asegurando las invariantes: max >= 0 y 0 <= available <= max.
 */
export function updateSpellSlotValues(
  slots: SpellSlotsMap,
  level: number,
  rawAvailable: number,
  rawMax: number
): SpellSlotsMap {
  const slot = slots[level];
  if (!slot) return slots;

  const max = Math.max(0, Math.floor(rawMax));
  const available = Math.max(0, Math.min(max, Math.floor(rawAvailable)));

  return {
    ...slots,
    [level]: {
      ...slot,
      max,
      available,
    },
  };
}

/**
 * Restablece todos los espacios disponibles de todos los niveles a su capacidad máxima.
 */
export function resetAllSpellSlots(slots: SpellSlotsMap): SpellSlotsMap {
  const updated: SpellSlotsMap = {};
  for (let lvl = 1; lvl <= 9; lvl++) {
    const slot = slots[lvl] ?? { level: lvl, max: 0, available: 0 };
    updated[lvl] = {
      ...slot,
      available: slot.max,
    };
  }
  return updated;
}

/**
 * Compara dos conjuros para determinar su orden:
 * 1. Nivel de conjuro ascendente (0 a 9). Los trucos (nivel 0) van primero.
 * 2. En caso de igual nivel, orden alfabético por nombre.
 * 3. En caso de igual nombre, por sortOrder.
 */
export function compareSpellsByLevel(a: ResourceItem, b: ResourceItem): number {
  const levelA = typeof a.spellLevel === 'number' ? a.spellLevel : 0;
  const levelB = typeof b.spellLevel === 'number' ? b.spellLevel : 0;
  if (levelA !== levelB) {
    return levelA - levelB;
  }
  const nameComp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  if (nameComp !== 0) {
    return nameComp;
  }
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

/**
 * Ordena una lista de conjuros siempre por nivel ascendente (0 a 9) y luego alfabéticamente.
 */
export function sortSpells(spells: ResourceItem[]): ResourceItem[] {
  return [...spells].sort(compareSpellsByLevel);
}
