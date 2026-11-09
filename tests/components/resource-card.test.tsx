import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ResourceCard } from '../../src/components/ResourceCard';
import { ResourceItem, SpellSlotsMap } from '../../src/domain/types';
import { createDefaultSpellSlots } from '../../src/domain/spells';

describe('ResourceCard component', () => {
  const defaultSlots: SpellSlotsMap = createDefaultSpellSlots();

  const cantripSpell: ResourceItem = {
    id: 'res-cantrip-1',
    name: 'Guía Divina (Truco)',
    category: 'spell',
    usageMode: 'unlimited',
    spellLevel: 0,
    maxUses: null,
    availableUses: null,
    description: 'Otorga +1 a una tirada.',
    sortOrder: 0,
  };

  const leveledSpell: ResourceItem = {
    id: 'res-spell-1',
    name: 'Curar Heridas Leves',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 1,
    maxUses: null,
    availableUses: null,
    description: 'Cura 1d8+1 PG.',
    sortOrder: 1,
  };

  const limitedTrait: ResourceItem = {
    id: 'res-trait-1',
    name: 'Canalizar Energía',
    category: 'feat_trait',
    usageMode: 'limited',
    spellLevel: null,
    maxUses: 4,
    availableUses: 3,
    description: 'Sana 2d6 en área.',
    sortOrder: 2,
  };

  const unlimitedTrait: ResourceItem = {
    id: 'res-trait-2',
    name: 'Furia Divina',
    category: 'feat_trait',
    usageMode: 'unlimited',
    spellLevel: null,
    maxUses: null,
    availableUses: null,
    description: '+2 al daño.',
    sortOrder: 3,
  };

  it('renders cantrip (spellLevel 0) with Truco badge and WITHOUT any Lanzar button', () => {
    const html = renderToString(
      <ResourceCard
        resource={cantripSpell}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Should render cantrip badge
    expect(html).toContain('Truco (Nivel 0) • Ilimitado');
    expect(html).toContain('Guía Divina (Truco)');

    // MUST NOT render "Lanzar" button
    expect(html).not.toContain('Lanzar');
    expect(html).not.toContain('Sin espacios');

    // Should not render counters
    expect(html).not.toContain('/3');
  });

  it('renders leveled spell with Nivel badge, slot counters, and Lanzar button', () => {
    const html = renderToString(
      <ResourceCard
        resource={leveledSpell}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Should render spell level badge
    expect(html).toMatch(/Nivel (<!-- -->)?1/);
    expect(html).toContain('Curar Heridas Leves');

    // Should render counters (Level 1 defaults to 3/3 in defaultSlots)
    expect(html).toContain('3');
    expect(html).toMatch(/\/ (<!-- -->)?3|\/(<!-- -->)?3/);

    // MUST render "Lanzar" button
    expect(html).toContain('Lanzar');
    expect(html).toContain('Lanzar este conjuro (gasta 1 espacio)');
  });

  it('renders leveled spell with disabled "Sin espacios" button when slots are 0', () => {
    const emptySlots: SpellSlotsMap = {
      ...defaultSlots,
      1: { level: 1, max: 3, available: 0 },
    };

    const html = renderToString(
      <ResourceCard
        resource={leveledSpell}
        spellSlots={emptySlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    expect(html).toContain('Sin espacios');
    expect(html).toContain('disabled');
  });

  it('renders limited trait with Usos diarios badge, counter, and Usar button', () => {
    const html = renderToString(
      <ResourceCard
        resource={limitedTrait}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    expect(html).toContain('Usos diarios');
    expect(html).toContain('3');
    expect(html).toContain('/4');
    expect(html).toContain('Usar');
  });

  it('renders unlimited trait with Ilimitado badge and WITHOUT any action button', () => {
    const html = renderToString(
      <ResourceCard
        resource={unlimitedTrait}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    expect(html).toContain('Ilimitado');
    expect(html).not.toContain('Usar');
    expect(html).not.toContain('Lanzar');
  });
});
