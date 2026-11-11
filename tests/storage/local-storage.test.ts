import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadCharacterRoster,
  saveCharacterRoster,
  isStoredCharacter,
  STORAGE_KEY,
  ROSTER_STORAGE_KEY,
  ACTIVE_ID_STORAGE_KEY,
  CORRUPT_ROSTER_BACKUP_KEY,
} from '../../src/storage/local-storage';
import { createBlankCharacter } from '../../src/domain/roster';

describe('storage/local-storage', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('isStoredCharacter', () => {
    it('acepta un personaje bien formado', () => {
      expect(isStoredCharacter(createBlankCharacter())).toBe(true);
    });

    it.each([
      ['null', null],
      ['sin profile', { health: { maxHp: 1, currentHp: 1, tempHp: 0 }, resources: [] }],
      ['profile sin id', { ...createBlankCharacter(), profile: { name: 'x', level: 1 } }],
      ['health incompleto', { ...createBlankCharacter(), health: { maxHp: 1 } }],
      ['resources no array', { ...createBlankCharacter(), resources: {} }],
      ['recurso inválido', { ...createBlankCharacter(), resources: [null] }],
    ])('rechaza %s', (_label, value) => {
      expect(isStoredCharacter(value)).toBe(false);
    });
  });

  describe('loadCharacterRoster', () => {
    it('descarta entradas dañadas, conserva las válidas y guarda copia del original', () => {
      const good = createBlankCharacter('A');
      const raw = JSON.stringify([{ foo: 'bar' }, good]);
      store[ROSTER_STORAGE_KEY] = raw;
      store[ACTIVE_ID_STORAGE_KEY] = good.profile.id;

      const roster = loadCharacterRoster();

      expect(roster.characters).toHaveLength(1);
      expect(roster.characters[0].profile.id).toBe(good.profile.id);
      expect(roster.activeId).toBe(good.profile.id);
      expect(store[CORRUPT_ROSTER_BACKUP_KEY]).toBe(raw);
    });

    it('con JSON corrupto conserva el original y recurre a la clave heredada', () => {
      const legacy = createBlankCharacter('Legado');
      store[ROSTER_STORAGE_KEY] = '{no es json';
      store[STORAGE_KEY] = JSON.stringify(legacy);

      const roster = loadCharacterRoster();

      expect(store[CORRUPT_ROSTER_BACKUP_KEY]).toBe('{no es json');
      expect(roster.characters).toHaveLength(1);
      expect(roster.characters[0].profile.id).toBe(legacy.profile.id);
    });

    it('no crea copia de seguridad cuando todo es válido', () => {
      const a = createBlankCharacter('A');
      store[ROSTER_STORAGE_KEY] = JSON.stringify([a]);

      loadCharacterRoster();

      expect(store[CORRUPT_ROSTER_BACKUP_KEY]).toBeUndefined();
    });

    it('activa el primer personaje si el id activo guardado no existe', () => {
      const a = createBlankCharacter('A');
      const b = createBlankCharacter('B');
      store[ROSTER_STORAGE_KEY] = JSON.stringify([a, b]);
      store[ACTIVE_ID_STORAGE_KEY] = 'inexistente';

      expect(loadCharacterRoster().activeId).toBe(a.profile.id);
    });
  });

  describe('saveCharacterRoster', () => {
    it('guarda roster e id activo sin escribir la clave heredada', () => {
      const a = createBlankCharacter('A');
      saveCharacterRoster({ characters: [a], activeId: a.profile.id });

      expect(JSON.parse(store[ROSTER_STORAGE_KEY])).toHaveLength(1);
      expect(store[ACTIVE_ID_STORAGE_KEY]).toBe(a.profile.id);
      expect(store[STORAGE_KEY]).toBeUndefined();
    });
  });
});
