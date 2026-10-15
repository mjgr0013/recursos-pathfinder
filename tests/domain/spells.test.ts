import { describe, it, expect } from 'vitest';
import {
  createDefaultSpellSlots,
  spendSpellSlot,
  restoreSpellSlot,
  updateSpellSlotMax,
  updateSpellSlotValues,
  resetAllSpellSlots,
  getMaxActiveSpellLevel,
  getHighestSpellLevel,
} from '../../src/domain/spells';
import { ResourceItem } from '../../src/domain/types';

describe('Spell Slots Domain Calculations (Pathfinder Rules)', () => {
  it('creates default spell slots with all 9 levels', () => {
    const slots = createDefaultSpellSlots();
    for (let lvl = 1; lvl <= 9; lvl++) {
      expect(slots[lvl]).toBeDefined();
      expect(slots[lvl].level).toBe(lvl);
    }
    // Level 1 starts with 3 default slots
    expect(slots[1].max).toBe(3);
    expect(slots[1].available).toBe(3);
    // Other levels start at 0
    expect(slots[2].max).toBe(0);
    expect(slots[2].available).toBe(0);
  });

  it('spends 1 slot from the specified level', () => {
    const initial = createDefaultSpellSlots();
    const updated = spendSpellSlot(initial, 1);
    expect(updated[1].available).toBe(2);
    expect(updated[1].max).toBe(3);
    // Other levels unaffected
    expect(updated[2].available).toBe(0);
  });

  it('does not allow spending below 0', () => {
    const initial = createDefaultSpellSlots();
    const drained = spendSpellSlot(spendSpellSlot(spendSpellSlot(spendSpellSlot(initial, 1), 1), 1), 1);
    expect(drained[1].available).toBe(0);
  });

  it('restores 1 slot up to the maximum capacity', () => {
    const initial = createDefaultSpellSlots();
    const spent = spendSpellSlot(initial, 1); // 2/3
    const restored = restoreSpellSlot(spent, 1);
    expect(restored[1].available).toBe(3);

    const overRestored = restoreSpellSlot(restored, 1);
    expect(overRestored[1].available).toBe(3);
  });

  it('updates max slots and clamps available if it exceeds new maximum', () => {
    const initial = createDefaultSpellSlots(); // 3/3
    const expanded = updateSpellSlotMax(initial, 1, 5);
    expect(expanded[1].max).toBe(5);
    expect(expanded[1].available).toBe(3);

    const reduced = updateSpellSlotMax(expanded, 1, 2);
    expect(reduced[1].max).toBe(2);
    expect(reduced[1].available).toBe(2);
  });

  describe('updateSpellSlotValues', () => {
    it('updates both available and max slots correctly', () => {
      const initial = createDefaultSpellSlots(); // 3/3
      const updated = updateSpellSlotValues(initial, 1, 2, 4);
      expect(updated[1].available).toBe(2);
      expect(updated[1].max).toBe(4);
    });

    it('clamps available slots if raw available exceeds max', () => {
      const initial = createDefaultSpellSlots();
      const updated = updateSpellSlotValues(initial, 1, 10, 3);
      expect(updated[1].available).toBe(3);
      expect(updated[1].max).toBe(3);
    });

    it('clamps available slots to minimum 0 if negative', () => {
      const initial = createDefaultSpellSlots();
      const updated = updateSpellSlotValues(initial, 1, -2, 3);
      expect(updated[1].available).toBe(0);
      expect(updated[1].max).toBe(3);
    });

    it('enforces max >= 0 when setting 0 slots', () => {
      const initial = createDefaultSpellSlots();
      const updated = updateSpellSlotValues(initial, 1, 5, 0);
      expect(updated[1].max).toBe(0);
      expect(updated[1].available).toBe(0);
    });

    it('allows correcting an accidental spend without long rest', () => {
      let slots = createDefaultSpellSlots(); // 3/3
      slots = spendSpellSlot(slots, 1); // 2/3 (accidental click)
      expect(slots[1].available).toBe(2);

      const corrected = updateSpellSlotValues(slots, 1, 3, 3);
      expect(corrected[1].available).toBe(3);
      expect(corrected[1].max).toBe(3);
    });
  });

  it('resets all spell slots to their maximum capacity', () => {
    let slots = createDefaultSpellSlots();
    slots = updateSpellSlotMax(slots, 2, 4); // 0/4
    slots = spendSpellSlot(slots, 1); // 2/3
    const reset = resetAllSpellSlots(slots);
    expect(reset[1].available).toBe(3);
    expect(reset[2].available).toBe(4);
  });

  describe('getMaxActiveSpellLevel', () => {
    it('returns 1 by default when character has default level 1 slots and no higher spells', () => {
      const slots = createDefaultSpellSlots();
      expect(getMaxActiveSpellLevel(slots, [])).toBe(1);
    });

    it('returns highest spell level present in resources', () => {
      const slots = createDefaultSpellSlots();
      const resources: ResourceItem[] = [
        {
          id: 'res-1',
          name: 'Bola de Fuego',
          category: 'spell',
          usageMode: 'limited',
          spellLevel: 3,
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 0,
        },
        {
          id: 'res-2',
          name: 'Cono de Frío',
          category: 'spell',
          usageMode: 'limited',
          spellLevel: 5,
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 1,
        },
      ];

      expect(getMaxActiveSpellLevel(slots, resources)).toBe(5);
    });

    it('returns highest configured slot level even if no spells of that level exist yet', () => {
      let slots = createDefaultSpellSlots();
      slots = updateSpellSlotMax(slots, 4, 2); // configured level 4 slots
      expect(getMaxActiveSpellLevel(slots, [])).toBe(4);
    });

    it('respects manualMaxLevel override to pre-enable higher levels', () => {
      const slots = createDefaultSpellSlots();
      expect(getMaxActiveSpellLevel(slots, [], 6)).toBe(6);
    });
  });

  describe('getHighestSpellLevel', () => {
    it('returns 0 when resources array is empty', () => {
      expect(getHighestSpellLevel([])).toBe(0);
    });

    it('returns 0 when character only has level 0 cantrips or non-spell feats', () => {
      const resources: ResourceItem[] = [
        {
          id: 'res-cantrip',
          name: 'Luz',
          category: 'spell',
          usageMode: 'unlimited',
          spellLevel: 0,
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 0,
        },
        {
          id: 'res-feat',
          name: 'Ataque Poderoso',
          category: 'feat_trait',
          usageMode: 'unlimited',
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 1,
        },
      ];
      expect(getHighestSpellLevel(resources)).toBe(0);
    });

    it('returns the exact highest spell level for leveled spells', () => {
      const resources: ResourceItem[] = [
        {
          id: 'res-1',
          name: 'Proyectil Mágico',
          category: 'spell',
          usageMode: 'limited',
          spellLevel: 1,
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 0,
        },
        {
          id: 'res-2',
          name: 'Bola de Fuego',
          category: 'spell',
          usageMode: 'limited',
          spellLevel: 3,
          maxUses: null,
          availableUses: null,
          description: '',
          sortOrder: 1,
        },
      ];
      expect(getHighestSpellLevel(resources)).toBe(3);
    });
  });
});
