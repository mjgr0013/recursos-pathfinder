import { CharacterState } from '../domain/types';
import { createDefaultSpellSlots } from '../domain/spells';
import { CharacterRosterState, MAX_CHARACTERS } from '../domain/roster';

export const STORAGE_KEY = 'pathfinder_character_v1';
export const ROSTER_STORAGE_KEY = 'pathfinder_characters_roster_v1';
export const ACTIVE_ID_STORAGE_KEY = 'pathfinder_active_character_id_v1';
export const CORRUPT_ROSTER_BACKUP_KEY = 'pathfinder_characters_roster_v1_corrupt_backup';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Comprobación estructural mínima de un personaje leído de localStorage.
 * Garantiza los campos de los que depende el renderizado para no romper la app.
 */
export function isStoredCharacter(value: unknown): value is CharacterState {
  if (!isRecord(value)) return false;
  const { profile, health, resources } = value;
  if (!isRecord(profile) || typeof profile.id !== 'string' || !profile.id) return false;
  if (typeof profile.name !== 'string' || typeof profile.level !== 'number') return false;
  if (
    !isRecord(health) ||
    typeof health.maxHp !== 'number' ||
    typeof health.currentHp !== 'number' ||
    typeof health.tempHp !== 'number'
  ) {
    return false;
  }
  if (!Array.isArray(resources)) return false;
  return resources.every((r) => isRecord(r) && typeof r.id === 'string' && typeof r.name === 'string');
}

/**
 * Guarda el contenido original en una clave aparte antes de descartarlo,
 * para que los datos dañados puedan recuperarse manualmente.
 */
function preserveCorruptRoster(raw: string): void {
  try {
    localStorage.setItem(CORRUPT_ROSTER_BACKUP_KEY, raw);
  } catch (error) {
    console.error('No se pudo conservar la copia de la lista de personajes dañada:', error);
  }
}

export function createDefaultCharacterState(): CharacterState {
  const now = new Date().toISOString();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `char-${Date.now()}`;
  return {
    profile: {
      id,
      name: 'Valeros',
      level: 1,
      characterClass: 'Guerrero',
      avatarDataUrl: '',
      createdAt: now,
      updatedAt: now,
    },
    health: {
      maxHp: 12,
      currentHp: 12,
      tempHp: 0,
    },
    spellSlots: createDefaultSpellSlots(),
    resources: [],
  };
}

export function loadCharacterState(): CharacterState {
  if (typeof localStorage === 'undefined') {
    return createDefaultCharacterState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultCharacterState();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredCharacter(parsed)) {
      return createDefaultCharacterState();
    }

    // Ensure spellSlots is present with all 9 levels
    const defaultSlots = createDefaultSpellSlots();
    const spellSlots = {
      ...defaultSlots,
      ...(parsed.spellSlots || {}),
    };

    return {
      ...parsed,
      spellSlots,
    } as CharacterState;
  } catch (error) {
    console.error('Error cargando ficha desde localStorage:', error);
    return createDefaultCharacterState();
  }
}

export function saveCharacterState(state: CharacterState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error guardando ficha en localStorage:', error);
  }
}

export function loadCharacterRoster(): CharacterRosterState {
  if (typeof localStorage === 'undefined') {
    const single = createDefaultCharacterState();
    return { characters: [single], activeId: single.profile.id };
  }

  try {
    const rawRoster = localStorage.getItem(ROSTER_STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_ID_STORAGE_KEY) || '';

    if (rawRoster) {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(rawRoster);
      } catch (error) {
        console.error('La lista de personajes guardada no es JSON válido:', error);
      }

      const validEntries = Array.isArray(parsed) ? parsed.filter(isStoredCharacter) : [];
      if (!Array.isArray(parsed) || validEntries.length < parsed.length) {
        console.warn('Se descartaron personajes dañados; copia original guardada en', CORRUPT_ROSTER_BACKUP_KEY);
        preserveCorruptRoster(rawRoster);
      }

      if (validEntries.length > 0) {
        const defaultSlots = createDefaultSpellSlots();
        const characters: CharacterState[] = validEntries.slice(0, MAX_CHARACTERS).map((c) => ({
          ...c,
          spellSlots: { ...defaultSlots, ...(c.spellSlots || {}) },
        }));

        const validActiveId = characters.some((c) => c.profile.id === activeId)
          ? activeId
          : characters[0].profile.id;

        return {
          characters,
          activeId: validActiveId,
        };
      }
    }

    // Fallback: migrate from single character key
    const single = loadCharacterState();
    const initialRoster: CharacterRosterState = {
      characters: [single],
      activeId: single.profile.id,
    };
    saveCharacterRoster(initialRoster);
    return initialRoster;
  } catch (error) {
    console.error('Error cargando lista de personajes:', error);
    const fallback = createDefaultCharacterState();
    return { characters: [fallback], activeId: fallback.profile.id };
  }
}

export function saveCharacterRoster(roster: CharacterRosterState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const trimmedList = roster.characters.slice(0, MAX_CHARACTERS);
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(trimmedList));
    localStorage.setItem(ACTIVE_ID_STORAGE_KEY, roster.activeId);
  } catch (error) {
    console.error('Error guardando lista de personajes:', error);
  }
}

export function clearCharacterState(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROSTER_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ID_STORAGE_KEY);
  } catch (error) {
    console.error('Error eliminando ficha de localStorage:', error);
  }
}
