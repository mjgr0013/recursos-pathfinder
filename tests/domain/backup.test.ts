import { describe, it, expect } from 'vitest';
import { CharacterState } from '../../src/domain/types';
import { createDefaultSpellSlots } from '../../src/domain/spells';
import {
  createBackupPayload,
  validateBackupPayload,
} from '../../src/domain/backup';

describe('Backup Domain Validation and Serialization', () => {
  const sampleState: CharacterState = {
    profile: {
      id: 'char-123',
      name: 'Kyra',
      level: 3,
      characterClass: 'Clériga',
      avatarDataUrl: 'data:image/webp;base64,AAAA',
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    health: {
      maxHp: 24,
      currentHp: 20,
      tempHp: 4,
    },
    spellSlots: createDefaultSpellSlots(),
    resources: [
      {
        id: 'res-1',
        name: 'Canalizar Energía',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        url: 'https://aonprd.com/',
        maxUses: 5,
        availableUses: 4,
        description: 'Sana 2d6 en área',
        sortOrder: 0,
      },
    ],
  };

  it('creates valid backup payload with schemaVersion 1.1.0 and timestamp', () => {
    const payload = createBackupPayload(sampleState);
    expect(payload.schemaVersion).toBe('1.1.0');
    expect(payload.exportedAt).toBeDefined();
    expect(payload.character.name).toBe('Kyra');
    expect(payload.health.maxHp).toBe(24);
    expect(payload.resources.length).toBe(1);
    expect(payload.spellSlots).toBeDefined();
    expect(payload.spellSlots![1].max).toBe(3);
  });

  it('validates a correct backup payload successfully', () => {
    const payload = createBackupPayload(sampleState);
    const result = validateBackupPayload(payload);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.payload.character.name).toBe('Kyra');
      expect(result.payload.spellSlots).toBeDefined();
    }
  });

  it('migrates legacy 1.0.0 payload to 1.1.0 filling spellSlots and spellLevel', () => {
    const legacyPayload = {
      schemaVersion: '1.0.0',
      exportedAt: '2026-10-14T10:00:00.000Z',
      character: sampleState.profile,
      health: sampleState.health,
      // No spellSlots
      resources: [
        {
          id: 'res-old',
          name: 'Viejo Conjuro',
          category: 'spell',
          usageMode: 'limited',
          maxUses: 4,
          availableUses: 2,
          description: '',
          sortOrder: 1,
        }
      ],
    };

    const result = validateBackupPayload(legacyPayload);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.payload.schemaVersion).toBe('1.1.0');
      expect(result.payload.spellSlots).toBeDefined();
      expect(result.payload.spellSlots![1].max).toBeGreaterThan(0);
      expect(result.payload.resources[0].spellLevel).toBe(1);
    }
  });

  it('rejects payload with invalid schemaVersion', () => {
    const payload = { ...createBackupPayload(sampleState), schemaVersion: '2.0.0' };
    const result = validateBackupPayload(payload);
    expect(result.isValid).toBe(false);
  });

  it('rejects payload with invalid spellSlots data', () => {
    const invalidSlotsPayload = {
      ...createBackupPayload(sampleState),
      spellSlots: {
        1: { level: 1, max: -5, available: 0 } // invalid max
      }
    };
    const result = validateBackupPayload(invalidSlotsPayload);
    expect(result.isValid).toBe(false);
  });
});
