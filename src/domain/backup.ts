import {
  CharacterState,
  CharacterBackupPayload,
  CharacterProfile,
  HealthRecord,
  ResourceItem,
  SpellSlotsMap,
  SpellSlotLevel,
} from './types';
import { createDefaultSpellSlots } from './spells';
import { isValidHttpUrl } from './resources';

/**
 * Genera el payload de respaldo normalizado con schemaVersion 1.1.0 y marca temporal ISO.
 */
export function createBackupPayload(state: CharacterState): CharacterBackupPayload {
  return {
    schemaVersion: '1.1.0',
    exportedAt: new Date().toISOString(),
    character: { ...state.profile },
    health: { ...state.health },
    spellSlots: JSON.parse(JSON.stringify(state.spellSlots)),
    resources: state.resources.map((r) => ({ ...r })),
  };
}

export type ValidationResult =
  | { isValid: true; payload: CharacterBackupPayload }
  | { isValid: false; error: string };

/**
 * Valida la integridad estructural y de rangos del JSON importado con tipado estricto.
 * Soporta retrocompatibilidad migrando esquema 1.0.0 a 1.1.0.
 */
export function validateBackupPayload(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'El archivo no contiene un objeto JSON válido.' };
  }

  const payload = data as Partial<CharacterBackupPayload>;

  if (payload.schemaVersion !== '1.0.0' && payload.schemaVersion !== '1.1.0') {
    return {
      isValid: false,
      error: `Versión de esquema no compatible: ${payload.schemaVersion || 'desconocida'}. Se requiere '1.0.0' o '1.1.0'.`,
    };
  }

  if (!payload.exportedAt || typeof payload.exportedAt !== 'string') {
    return { isValid: false, error: 'Falta la marca temporal exportedAt válida.' };
  }

  // Validate Character Profile
  const char = payload.character;
  if (!char || typeof char !== 'object') {
    return { isValid: false, error: 'Faltan los datos del personaje (character).' };
  }
  if (!char.name || typeof char.name !== 'string' || char.name.trim().length === 0 || char.name.length > 60) {
    return { isValid: false, error: 'El nombre del personaje debe tener entre 1 y 60 caracteres.' };
  }
  if (typeof char.level !== 'number' || char.level < 1 || char.level > 20 || !Number.isInteger(char.level)) {
    return { isValid: false, error: 'El nivel del personaje debe ser un número entero entre 1 y 20.' };
  }
  if (!char.characterClass || typeof char.characterClass !== 'string' || char.characterClass.trim().length === 0 || char.characterClass.length > 60) {
    return { isValid: false, error: 'La clase del personaje debe tener entre 1 y 60 caracteres.' };
  }

  // Validate Health Record
  const health = payload.health;
  if (!health || typeof health !== 'object') {
    return { isValid: false, error: 'Faltan los datos de salud (health).' };
  }
  if (typeof health.maxHp !== 'number' || health.maxHp < 1 || !Number.isInteger(health.maxHp)) {
    return { isValid: false, error: 'Los PG máximos deben ser un entero mayor o igual a 1.' };
  }
  if (typeof health.currentHp !== 'number' || health.currentHp < 0 || health.currentHp > health.maxHp || !Number.isInteger(health.currentHp)) {
    return { isValid: false, error: 'Los PG actuales deben estar comprendidos entre 0 y el valor de PG máximos.' };
  }
  if (typeof health.tempHp !== 'number' || health.tempHp < 0 || !Number.isInteger(health.tempHp)) {
    return { isValid: false, error: 'Los PG temporales deben ser un entero mayor o igual a 0.' };
  }

  // Handle Spell Slots (Migration if missing)
  let spellSlots: SpellSlotsMap;
  if (payload.schemaVersion === '1.0.0' || !payload.spellSlots) {
    spellSlots = createDefaultSpellSlots();
  } else {
    spellSlots = payload.spellSlots;
    // Validate custom spell slots
    for (let i = 1; i <= 9; i++) {
      const slot = spellSlots[i] as Partial<SpellSlotLevel> | undefined;
      if (slot) {
        if (typeof slot.max !== 'number' || slot.max < 0 || !Number.isInteger(slot.max)) {
          return { isValid: false, error: `Los espacios máximos de nivel ${i} son inválidos.` };
        }
        if (typeof slot.available !== 'number' || slot.available < 0 || slot.available > slot.max || !Number.isInteger(slot.available)) {
          return { isValid: false, error: `Los espacios disponibles de nivel ${i} son inválidos.` };
        }
      }
    }
  }

  // Validate Resources Array
  if (!Array.isArray(payload.resources)) {
    return { isValid: false, error: 'La colección de recursos debe ser una lista (array).' };
  }

  const normalizedResources: ResourceItem[] = [];

  for (let i = 0; i < payload.resources.length; i++) {
    const res = payload.resources[i] as any; // Type as any for robust runtime check
    if (!res || typeof res !== 'object') {
      return { isValid: false, error: `El recurso en la posición ${i} es inválido.` };
    }
    if (!res.name || typeof res.name !== 'string' || res.name.trim().length === 0 || res.name.length > 80) {
      return { isValid: false, error: `El recurso en la posición ${i} tiene un nombre inválido.` };
    }
    if (res.category !== 'spell' && res.category !== 'feat_trait') {
      return { isValid: false, error: `Categoría inválida en el recurso ${res.name}. Debe ser 'spell' o 'feat_trait'.` };
    }
    if (res.usageMode !== 'limited' && res.usageMode !== 'unlimited') {
      return { isValid: false, error: `Modo de uso inválido en el recurso ${res.name}. Debe ser 'limited' o 'unlimited'.` };
    }

    if (res.url !== undefined && res.url !== null && typeof res.url !== 'string') {
      return { isValid: false, error: `La URL en ${res.name} debe ser texto.` };
    }

    let maxUses = res.maxUses;
    let availableUses = res.availableUses;
    let spellLevel = res.spellLevel;

    // Migrate v1.0.0 spells to v1.1.0 (assign spellLevel 1 if missing)
    if (payload.schemaVersion === '1.0.0' && res.category === 'spell') {
      spellLevel = 1;
      maxUses = null;
      availableUses = null;
    }

    if (res.category === 'spell') {
      if (spellLevel !== undefined && spellLevel !== null) {
        if (typeof spellLevel !== 'number' || spellLevel < 0 || spellLevel > 9 || !Number.isInteger(spellLevel)) {
          return { isValid: false, error: `El nivel de conjuro en ${res.name} debe ser entre 0 y 9.` };
        }
      }
    }

    if (res.usageMode === 'limited' && res.category !== 'spell') {
      if (typeof maxUses !== 'number' || maxUses < 1 || !Number.isInteger(maxUses)) {
        return { isValid: false, error: `Los usos máximos en ${res.name} deben ser un entero >= 1.` };
      }
      if (typeof availableUses !== 'number' || availableUses < 0 || availableUses > maxUses || !Number.isInteger(availableUses)) {
        return { isValid: false, error: `Los usos disponibles en ${res.name} deben estar entre 0 y sus usos máximos.` };
      }
    }

    normalizedResources.push({
      id: res.id,
      name: res.name,
      category: res.category,
      usageMode: res.usageMode,
      spellLevel: spellLevel ?? null,
      url: isValidHttpUrl(res.url) ? res.url : undefined,
      maxUses: maxUses ?? null,
      availableUses: availableUses ?? null,
      description: res.description || '',
      sortOrder: res.sortOrder || 0,
    });
  }

  return {
    isValid: true,
    payload: {
      schemaVersion: '1.1.0',
      exportedAt: payload.exportedAt,
      character: char as CharacterProfile,
      health: health as HealthRecord,
      spellSlots,
      resources: normalizedResources,
    },
  };
}

/**
 * Convierte el payload a JSON formateado legible.
 */
export function serializeBackupJson(payload: CharacterBackupPayload): string {
  return JSON.stringify(payload, null, 2);
}
