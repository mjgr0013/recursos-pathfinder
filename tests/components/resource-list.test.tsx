import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ResourceList } from '../../src/components/ResourceList';
import { ResourceItem, SpellSlotsMap } from '../../src/domain/types';
import { createDefaultSpellSlots } from '../../src/domain/spells';

describe('ResourceList component', () => {
  const defaultSlots: SpellSlotsMap = createDefaultSpellSlots();

  const cantrip: ResourceItem = {
    id: 'res-c1',
    name: 'Rayo de Escarcha (Truco)',
    category: 'spell',
    usageMode: 'unlimited',
    spellLevel: 0,
    maxUses: null,
    availableUses: null,
    description: '',
    sortOrder: 4,
  };

  const spellLvl1: ResourceItem = {
    id: 'res-s1',
    name: 'Proyectil Mágico',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 1,
    maxUses: null,
    availableUses: null,
    description: '',
    sortOrder: 3,
  };

  const spellLvl2: ResourceItem = {
    id: 'res-s2',
    name: 'Rayo Abrasador',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 2,
    maxUses: null,
    availableUses: null,
    description: '',
    sortOrder: 1,
  };

  const spellLvl3: ResourceItem = {
    id: 'res-s3',
    name: 'Bola de Fuego',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 3,
    maxUses: null,
    availableUses: null,
    description: '',
    sortOrder: 0,
  };

  const trait: ResourceItem = {
    id: 'res-t1',
    name: 'Vínculo Arcano',
    category: 'feat_trait',
    usageMode: 'limited',
    spellLevel: null,
    maxUses: 1,
    availableUses: 1,
    description: '',
    sortOrder: 2,
  };

  it('renders spells always sorted by level regardless of their initial array order', () => {
    // Array with spells provided in scrambled order: level 3, level 1, level 0, level 2
    const scrambledResources = [spellLvl3, spellLvl1, cantrip, spellLvl2];

    const html = renderToString(
      <ResourceList
        resources={scrambledResources}
        spellSlots={defaultSlots}
        onSpendResource={vi.fn()}
        onRestoreResource={vi.fn()}
        onDeleteResource={vi.fn()}
        onAddResource={vi.fn()}
        onSpendSpellSlot={vi.fn()}
        onRestoreSpellSlot={vi.fn()}
      />
    );

    // Verify ordering by checking the position index of each spell in the output HTML
    const posCantrip = html.indexOf('Rayo de Escarcha (Truco)');
    const posLvl1 = html.indexOf('Proyectil Mágico');
    const posLvl2 = html.indexOf('Rayo Abrasador');
    const posLvl3 = html.indexOf('Bola de Fuego');

    expect(posCantrip).toBeGreaterThan(-1);
    expect(posLvl1).toBeGreaterThan(-1);
    expect(posLvl2).toBeGreaterThan(-1);
    expect(posLvl3).toBeGreaterThan(-1);

    // Spells must be ordered: level 0 < level 1 < level 2 < level 3
    expect(posCantrip).toBeLessThan(posLvl1);
    expect(posLvl1).toBeLessThan(posLvl2);
    expect(posLvl2).toBeLessThan(posLvl3);
  });

  it('renders cantrips without Lanzar button and leveled spells with Lanzar button', () => {
    const resources = [cantrip, spellLvl1];

    const html = renderToString(
      <ResourceList
        resources={resources}
        spellSlots={defaultSlots}
        onSpendResource={vi.fn()}
        onRestoreResource={vi.fn()}
        onDeleteResource={vi.fn()}
        onAddResource={vi.fn()}
        onSpendSpellSlot={vi.fn()}
        onRestoreSpellSlot={vi.fn()}
      />
    );

    // Truco badge is present
    expect(html).toContain('Truco (Nivel 0) • Ilimitado');

    // Only one "Lanzar" button should be rendered (for Proyectil Mágico, not for Rayo de Escarcha)
    const matches = html.match(/title="Lanzar este conjuro \(gasta 1 espacio\)"/g);
    expect(matches).toHaveLength(1);

    // No cantrip launch button title exists
    expect(html).not.toContain('Lanzar truco a voluntad');
  });

  it('renders all spells sorted by level before traits', () => {
    const mixed = [trait, spellLvl2, cantrip, spellLvl1];

    const html = renderToString(
      <ResourceList
        resources={mixed}
        spellSlots={defaultSlots}
        onSpendResource={vi.fn()}
        onRestoreResource={vi.fn()}
        onDeleteResource={vi.fn()}
        onAddResource={vi.fn()}
        onSpendSpellSlot={vi.fn()}
        onRestoreSpellSlot={vi.fn()}
      />
    );

    const posCantrip = html.indexOf('Rayo de Escarcha (Truco)');
    const posLvl1 = html.indexOf('Proyectil Mágico');
    const posLvl2 = html.indexOf('Rayo Abrasador');
    const posTrait = html.indexOf('Vínculo Arcano');

    expect(posCantrip).toBeLessThan(posLvl1);
    expect(posLvl1).toBeLessThan(posLvl2);
    expect(posLvl2).toBeLessThan(posTrait);
  });
});
