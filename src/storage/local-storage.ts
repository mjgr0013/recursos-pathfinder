import { CharacterState } from '../domain/types';
import { createDefaultSpellSlots } from '../domain/spells';

export const STORAGE_KEY = 'pathfinder_character_v1';

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
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.profile || !parsed.health || !Array.isArray(parsed.resources)) {
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

export function clearCharacterState(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error eliminando ficha de localStorage:', error);
  }
}
