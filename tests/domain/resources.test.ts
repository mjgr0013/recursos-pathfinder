import { describe, it, expect } from 'vitest';
import { ResourceItem } from '../../src/domain/types';
import {
  spendResource,
  restoreResource,
  createResource,
  deleteResource,
  applyLongRest,
  getLimitedTraits,
  updateResourceMaxUses,
  updateResourceUses,
} from '../../src/domain/resources';
import { createDefaultSpellSlots } from '../../src/domain/spells';

describe('Resource Domain Calculations (Pathfinder Rules)', () => {
  const limitedSpell: ResourceItem = {
    id: 'res-1',
    name: 'Proyectil Mágico',
    category: 'spell',
    usageMode: 'limited',
    maxUses: 4,
    availableUses: 3,
    description: 'Dispara 2 proyectiles mágicos',
    sortOrder: 1,
  };

  const unlimitedFeat: ResourceItem = {
    id: 'res-2',
    name: 'Ataque Poderoso',
    category: 'feat_trait',
    usageMode: 'unlimited',
    maxUses: null,
    availableUses: null,
    description: 'Resta a la tirada de ataque para sumar al daño',
    sortOrder: 2,
  };

  it('spends 1 use on a limited resource with available uses', () => {
    const updated = spendResource(limitedSpell);
    expect(updated.availableUses).toBe(2);
  });

  it('does not allow spending below 0 on a limited resource', () => {
    const emptySpell: ResourceItem = { ...limitedSpell, availableUses: 0 };
    const updated = spendResource(emptySpell);
    expect(updated.availableUses).toBe(0);
  });

  it('does not modify unlimited resources when spend is called', () => {
    const updated = spendResource(unlimitedFeat);
    expect(updated.availableUses).toBeNull();
  });

  it('restores 1 use on a limited resource below maximum', () => {
    const updated = restoreResource(limitedSpell);
    expect(updated.availableUses).toBe(4);
  });

  it('does not allow restoring beyond maxUses on a limited resource', () => {
    const fullSpell: ResourceItem = { ...limitedSpell, availableUses: 4 };
    const updated = restoreResource(fullSpell);
    expect(updated.availableUses).toBe(4);
  });

  it('does not modify unlimited resources when restore is called', () => {
    const updated = restoreResource(unlimitedFeat);
    expect(updated.availableUses).toBeNull();
  });

  it('creates limited resource with availableUses initialized to maxUses', () => {
    const created = createResource({
      name: 'Canalizar Energía',
      category: 'feat_trait',
      usageMode: 'limited',
      maxUses: 3,
      description: 'Cura 1d8+1 PG',
    }, 0);

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Canalizar Energía');
    expect(created.maxUses).toBe(3);
    expect(created.availableUses).toBe(3);
  });

  it('creates unlimited resource with null uses', () => {
    const created = createResource({
      name: 'Esquiva',
      category: 'feat_trait',
      usageMode: 'unlimited',
      maxUses: null,
      description: '+1 a CA',
    }, 0);

    expect(created.maxUses).toBeNull();
    expect(created.availableUses).toBeNull();
  });

  it('creates level 0 cantrip spell with usageMode unlimited', () => {
    const cantrip = createResource({
      name: 'Luz',
      category: 'spell',
      usageMode: 'limited', // requested limited, but level 0 overrides to unlimited
      spellLevel: 0,
      maxUses: 4,
      description: 'Crea luz brillante',
    }, 0);

    expect(cantrip.category).toBe('spell');
    expect(cantrip.spellLevel).toBe(0);
    expect(cantrip.usageMode).toBe('unlimited');
    expect(cantrip.maxUses).toBeNull();
    expect(cantrip.availableUses).toBeNull();
  });

  it('creates level 1 spell delegating uses to global spell slots', () => {
    const spell = createResource({
      name: 'Proyectil Mágico',
      category: 'spell',
      usageMode: 'limited',
      spellLevel: 1,
      maxUses: null,
      description: 'Lanza proyectiles de fuerza',
    }, 0);

    expect(spell.category).toBe('spell');
    expect(spell.spellLevel).toBe(1);
    expect(spell.usageMode).toBe('limited');
    expect(spell.maxUses).toBeNull();
    expect(spell.availableUses).toBeNull();
  });

  it('validates and stores external documentation URL', () => {
    const withUrl = createResource({
      name: 'Bola de Fuego',
      category: 'spell',
      usageMode: 'limited',
      spellLevel: 3,
      maxUses: null,
      url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball',
      description: 'Explosión de fuego en área',
    }, 0);

    expect(withUrl.url).toBe('https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball');

    const withInvalidUrl = createResource({
      name: 'Golpe',
      category: 'feat_trait',
      usageMode: 'unlimited',
      maxUses: null,
      url: 'ftp://invalid-protocol.com',
      description: 'Ataque normal',
    }, 1);

    expect(withInvalidUrl.url).toBeUndefined();
  });

  it('deletes a resource from resource array by id', () => {
    const list = [limitedSpell, unlimitedFeat];
    const filtered = deleteResource(list, limitedSpell.id);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(unlimitedFeat.id);
  });

  it('applies long rest restoring all limited resources, setting currentHp to maxHp, and clearing tempHp', () => {
    const initialState = {
      profile: {
        id: 'char-1',
        name: 'Seoni',
        level: 4,
        characterClass: 'Hechicera',
        createdAt: '2026-10-15T00:00:00.000Z',
        updatedAt: '2026-10-15T00:00:00.000Z',
      },
      health: {
        maxHp: 28,
        currentHp: 10,
        tempHp: 6,
      },
      spellSlots: createDefaultSpellSlots(),
      resources: [
        { ...limitedSpell, availableUses: 0 },
        { ...unlimitedFeat },
      ],
    };

    const rested = applyLongRest(initialState);

    // Limited resource should be restored to maxUses
    expect(rested.resources[0].availableUses).toBe(4);
    // Unlimited resource stays null
    expect(rested.resources[1].availableUses).toBeNull();
    // Health is fully restored to maxHp and tempHp is cleared to 0
    expect(rested.health.currentHp).toBe(28);
    expect(rested.health.tempHp).toBe(0);
    expect(rested.health.maxHp).toBe(28);
    // Spell slots are fully restored
    expect(rested.spellSlots[1].available).toBe(rested.spellSlots[1].max);
    // Profile updatedAt was updated
    expect(rested.profile.updatedAt).not.toBe('2026-10-15T00:00:00.000Z');
  });

  describe('getLimitedTraits', () => {
    it('filters only limited traits, excluding spells and unlimited feats', () => {
      const items: ResourceItem[] = [
        limitedSpell, // category: 'spell'
        unlimitedFeat, // usageMode: 'unlimited'
        {
          id: 'res-trait-1',
          name: 'Canalizar Energía',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 5,
          availableUses: 5,
          description: '',
          sortOrder: 3,
        },
      ];

      const filtered = getLimitedTraits(items);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('res-trait-1');
    });
  });

  describe('updateResourceMaxUses', () => {
    it('expands max uses without altering current available uses', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 4,
          availableUses: 2,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceMaxUses(items, 'res-trait-1', 6);
      expect(updated[0].maxUses).toBe(6);
      expect(updated[0].availableUses).toBe(2);
    });

    it('clamps available uses down if new max is smaller', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 5,
          availableUses: 5,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceMaxUses(items, 'res-trait-1', 3);
      expect(updated[0].maxUses).toBe(3);
      expect(updated[0].availableUses).toBe(3);
    });
  });

  describe('updateResourceUses', () => {
    it('updates both available and max uses correctly', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 4,
          availableUses: 2,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceUses(items, 'res-trait-1', 3, 5);
      expect(updated[0].availableUses).toBe(3);
      expect(updated[0].maxUses).toBe(5);
    });

    it('clamps available uses to max if rawAvailable exceeds max', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 3,
          availableUses: 3,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceUses(items, 'res-trait-1', 8, 4);
      expect(updated[0].availableUses).toBe(4);
      expect(updated[0].maxUses).toBe(4);
    });

    it('clamps available uses to 0 if negative', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 3,
          availableUses: 3,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceUses(items, 'res-trait-1', -1, 3);
      expect(updated[0].availableUses).toBe(0);
      expect(updated[0].maxUses).toBe(3);
    });

    it('enforces minimum maxUses of 1', () => {
      const items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 3,
          availableUses: 3,
          description: '',
          sortOrder: 0,
        },
      ];

      const updated = updateResourceUses(items, 'res-trait-1', 0, 0);
      expect(updated[0].maxUses).toBe(1);
      expect(updated[0].availableUses).toBe(0);
    });

    it('allows correcting an accidental spend without long rest', () => {
      let items: ResourceItem[] = [
        {
          id: 'res-trait-1',
          name: 'Canalizar',
          category: 'feat_trait',
          usageMode: 'limited',
          maxUses: 3,
          availableUses: 3,
          description: '',
          sortOrder: 0,
        },
      ];

      // Accidental click on "Usar"
      items = [spendResource(items[0])];
      expect(items[0].availableUses).toBe(2);

      // Rectify using edit modal
      const corrected = updateResourceUses(items, 'res-trait-1', 3, 3);
      expect(corrected[0].availableUses).toBe(3);
      expect(corrected[0].maxUses).toBe(3);
    });
  });
});
