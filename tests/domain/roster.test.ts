import { describe, it, expect } from 'vitest';
import {
  MAX_CHARACTERS,
  createBlankCharacter,
  addCharacterToRoster,
  switchActiveCharacter,
  deleteCharacterFromRoster,
  updateActiveCharacterInRoster,
  getActiveCharacter,
  CharacterRosterState,
} from '../../src/domain/roster';

describe('Character Roster Domain Logic', () => {
  it('creates a clean blank character state', () => {
    const blank = createBlankCharacter(1);
    expect(blank.profile.name).toBe('Nuevo Héroe (1)');
    expect(blank.profile.level).toBe(1);
    expect(blank.profile.characterClass).toBe('Guerrero');
    expect(blank.health.maxHp).toBe(12);
    expect(blank.health.currentHp).toBe(12);
    expect(blank.resources).toEqual([]);
  });

  it('allows adding characters up to the maximum limit of 5', () => {
    const char1 = createBlankCharacter('1');
    let roster: CharacterRosterState = {
      characters: [char1],
      activeId: char1.profile.id,
    };

    // Add 2nd, 3rd, 4th, 5th
    for (let i = 2; i <= MAX_CHARACTERS; i++) {
      const char = createBlankCharacter(String(i));
      const result = addCharacterToRoster(roster, char);
      expect(result.success).toBe(true);
      expect(result.roster.characters.length).toBe(i);
      expect(result.roster.activeId).toBe(result.roster.characters[i - 1].profile.id);
      roster = result.roster;
    }

    expect(roster.characters.length).toBe(5);

    // Attempt to add 6th character -> must fail
    const char6 = createBlankCharacter('6');
    const overLimitResult = addCharacterToRoster(roster, char6);
    expect(overLimitResult.success).toBe(false);
    expect(overLimitResult.error).toContain('límite máximo de 5');
    expect(overLimitResult.roster.characters.length).toBe(5);
  });

  it('switches active character successfully when target exists', () => {
    const c1 = createBlankCharacter('A');
    const c2 = createBlankCharacter('B');
    const roster: CharacterRosterState = {
      characters: [c1, c2],
      activeId: c1.profile.id,
    };

    const res = switchActiveCharacter(roster, c2.profile.id);
    expect(res.success).toBe(true);
    expect(res.roster.activeId).toBe(c2.profile.id);
  });

  it('fails to switch active character when target does not exist', () => {
    const c1 = createBlankCharacter('A');
    const roster: CharacterRosterState = {
      characters: [c1],
      activeId: c1.profile.id,
    };

    const res = switchActiveCharacter(roster, 'non-existent-id');
    expect(res.success).toBe(false);
    expect(res.roster.activeId).toBe(c1.profile.id);
  });

  it('deletes an inactive character without changing activeId', () => {
    const c1 = createBlankCharacter('A');
    const c2 = createBlankCharacter('B');
    const roster: CharacterRosterState = {
      characters: [c1, c2],
      activeId: c1.profile.id,
    };

    const updated = deleteCharacterFromRoster(roster, c2.profile.id);
    expect(updated.characters.length).toBe(1);
    expect(updated.characters[0].profile.id).toBe(c1.profile.id);
    expect(updated.activeId).toBe(c1.profile.id);
  });

  it('deletes active character and updates activeId to the remaining character', () => {
    const c1 = createBlankCharacter('A');
    const c2 = createBlankCharacter('B');
    const roster: CharacterRosterState = {
      characters: [c1, c2],
      activeId: c1.profile.id,
    };

    const updated = deleteCharacterFromRoster(roster, c1.profile.id);
    expect(updated.characters.length).toBe(1);
    expect(updated.characters[0].profile.id).toBe(c2.profile.id);
    expect(updated.activeId).toBe(c2.profile.id);
  });

  it('creates a fresh blank character when deleting the last remaining character', () => {
    const c1 = createBlankCharacter('Solo');
    const roster: CharacterRosterState = {
      characters: [c1],
      activeId: c1.profile.id,
    };

    const updated = deleteCharacterFromRoster(roster, c1.profile.id);
    expect(updated.characters.length).toBe(1);
    expect(updated.characters[0].profile.id).not.toBe(c1.profile.id);
    expect(updated.activeId).toBe(updated.characters[0].profile.id);
  });

  it('updates the active character state in the roster', () => {
    const c1 = createBlankCharacter('A');
    const roster: CharacterRosterState = {
      characters: [c1],
      activeId: c1.profile.id,
    };

    const modified = {
      ...c1,
      profile: { ...c1.profile, name: 'Valeros Legendario', level: 10 },
      health: { ...c1.health, currentHp: 5 },
    };

    const updated = updateActiveCharacterInRoster(roster, modified);
    expect(updated.characters[0].profile.name).toBe('Valeros Legendario');
    expect(updated.characters[0].profile.level).toBe(10);
    expect(updated.characters[0].health.currentHp).toBe(5);

    const active = getActiveCharacter(updated);
    expect(active.profile.name).toBe('Valeros Legendario');
  });
});
