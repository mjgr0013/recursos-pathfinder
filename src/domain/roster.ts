import { CharacterState } from './types';
import { createDefaultSpellSlots } from './spells';

export const MAX_CHARACTERS = 5;

export interface CharacterRosterState {
  characters: CharacterState[];
  activeId: string;
}

/**
 * Creates a clean default blank character state with unique ID.
 */
export function createBlankCharacter(nameSuffix?: number | string): CharacterState {
  const now = new Date().toISOString();
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `char-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const name = nameSuffix ? `Nuevo Héroe (${nameSuffix})` : 'Nuevo Héroe';

  return {
    profile: {
      id,
      name,
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

/**
 * Adds a new character to the roster, up to the maximum limit of 5.
 * Automatically activates the newly added character upon success.
 */
export function addCharacterToRoster(
  roster: CharacterRosterState,
  newCharacter: CharacterState
): { success: boolean; roster: CharacterRosterState; error?: string } {
  if (roster.characters.length >= MAX_CHARACTERS) {
    return {
      success: false,
      roster,
      error: `Has alcanzado el límite máximo de ${MAX_CHARACTERS} personajes guardados. Borra uno antes de añadir otro.`,
    };
  }

  // Ensure unique ID in roster
  let characterToAdd = newCharacter;
  if (roster.characters.some((c) => c.profile.id === newCharacter.profile.id)) {
    const freshId = `char-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    characterToAdd = {
      ...newCharacter,
      profile: {
        ...newCharacter.profile,
        id: freshId,
      },
    };
  }

  const updatedCharacters = [...roster.characters, characterToAdd];

  return {
    success: true,
    roster: {
      characters: updatedCharacters,
      activeId: characterToAdd.profile.id,
    },
  };
}

/**
 * Switches the active character to the target ID if it exists in the roster.
 */
export function switchActiveCharacter(
  roster: CharacterRosterState,
  targetId: string
): { success: boolean; roster: CharacterRosterState } {
  const exists = roster.characters.some((c) => c.profile.id === targetId);
  if (!exists) {
    return { success: false, roster };
  }

  return {
    success: true,
    roster: {
      ...roster,
      activeId: targetId,
    },
  };
}

/**
 * Deletes a character from the roster by ID.
 * If the roster becomes empty, automatically creates a new default character.
 * If the deleted character was active, sets activeId to the next available character.
 */
export function deleteCharacterFromRoster(
  roster: CharacterRosterState,
  idToDelete: string
): CharacterRosterState {
  const remaining = roster.characters.filter((c) => c.profile.id !== idToDelete);

  if (remaining.length === 0) {
    const blank = createBlankCharacter();
    return {
      characters: [blank],
      activeId: blank.profile.id,
    };
  }

  const isDeletingActive = roster.activeId === idToDelete;
  const newActiveId = isDeletingActive ? remaining[0].profile.id : roster.activeId;

  return {
    characters: remaining,
    activeId: newActiveId,
  };
}

/**
 * Updates the state of the active character in the roster.
 */
export function updateActiveCharacterInRoster(
  roster: CharacterRosterState,
  updatedState: CharacterState
): CharacterRosterState {
  const targetId = updatedState.profile.id || roster.activeId;
  let found = false;

  const characters = roster.characters.map((c) => {
    if (c.profile.id === targetId) {
      found = true;
      return updatedState;
    }
    return c;
  });

  if (!found) {
    // If not found and roster has room, append
    if (characters.length < MAX_CHARACTERS) {
      characters.push(updatedState);
    } else {
      // Replace the currently active one
      const idx = characters.findIndex((c) => c.profile.id === roster.activeId);
      if (idx !== -1) {
        characters[idx] = updatedState;
      }
    }
  }

  return {
    characters,
    activeId: updatedState.profile.id,
  };
}

/**
 * Replaces the active character's data in place (reset or backup import).
 * The replacement keeps the active slot's id, so it never adds a new roster entry
 * nor collides with another character that shares the incoming id.
 */
export function replaceActiveCharacter(
  roster: CharacterRosterState,
  replacement: CharacterState
): CharacterRosterState {
  const activeId = getActiveCharacter(roster).profile.id;
  const next: CharacterState = {
    ...replacement,
    profile: { ...replacement.profile, id: activeId, updatedAt: new Date().toISOString() },
  };

  if (!roster.characters.some((c) => c.profile.id === activeId)) {
    return { characters: [next], activeId };
  }

  return {
    characters: roster.characters.map((c) => (c.profile.id === activeId ? next : c)),
    activeId,
  };
}

/**
 * Returns the currently active character from the roster.
 */
export function getActiveCharacter(roster: CharacterRosterState): CharacterState {
  const active = roster.characters.find((c) => c.profile.id === roster.activeId);
  return active || roster.characters[0] || createBlankCharacter();
}
