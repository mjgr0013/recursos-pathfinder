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

  it('renders description collapsed on screen with toggle button, and includes print description', () => {
    const html = renderToString(
      <ResourceCard
        resource={cantripSpell}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Button should offer to see more (Ver más)
    expect(html).toContain('▼ Ver más');
    expect(html).not.toContain('▲ Ver menos');

    // Interactive screen drawer (with max-h-[350px]) should NOT be rendered in DOM by default
    expect(html).not.toContain('max-h-[350px]');

    // Print drawer should be present with print:block so PDF / paper export includes it
    expect(html).toContain('hidden print:block');
    expect(html).toContain('print-description');
    expect(html).toMatch(/print:text-\[12px\]/);
    expect(html).toContain('Otorga +1 a una tirada');
  });

  it('renders url, pencil, and trash action buttons with unified bordered format aligned to the right alongside Ver más', () => {
    const spellWithUrl: ResourceItem = {
      ...leveledSpell,
      url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Cure%20Light%20Wounds',
    };

    const html = renderToString(
      <ResourceCard
        resource={spellWithUrl}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // All 3 action buttons must be present
    expect(html).toContain('🌐');
    expect(html).toContain('✏️');
    expect(html).toContain('🗑️');

    // All 3 must share bordered button styling
    const borderedButtons = html.match(/border border-slate-700\/80 bg-slate-900\/80/g);
    expect(borderedButtons).not.toBeNull();
    // 3 action buttons (url, pencil, trash)
    expect(borderedButtons?.length).toBeGreaterThanOrEqual(3);

    // "Ver más" description toggle is present in the same action bar
    expect(html).toContain('▼ Ver más');

    // The action bar wrapper aligns toggle and actions using justify-between and ml-auto
    expect(html).toMatch(/class="[^"]*flex items-center justify-between gap-2 text-xs text-slate-400 print:hidden[^"]*"/);
    expect(html).toMatch(/class="[^"]*flex items-center gap-1\.5 ml-auto[^"]*"/);
  });

  it('transforms counters into squares for paper export and hides action buttons in print', () => {
    const html = renderToString(
      <ResourceCard
        resource={limitedTrait}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Digital counter and "Usar" button must have print:hidden
    expect(html).toContain('print:hidden');
    expect(html).toMatch(/Usar/);

    // Paper view must render 4 square checkboxes for tracking (limitedTrait maxUses = 4)
    const squareMatches = html.match(/w-4 h-4 border-2 border-slate-900 rounded-sm/g);
    expect(squareMatches).toHaveLength(4);
  });

  it('does NOT render squares for spells in print, leaving slot tracking to Recursos Diarios', () => {
    const html = renderToString(
      <ResourceCard
        resource={leveledSpell}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Digital counter exists for screen but is hidden in print
    expect(html).toContain('print:hidden');

    // Should NOT render square checkboxes for spells in paper view
    expect(html).not.toContain('Casillas de uso:');
    expect(html).not.toContain('w-4 h-4 border-2 border-slate-900 rounded-sm');
  });

  it('unifies name, level, and range into a single row in print mode', () => {
    const spellWithRange: ResourceItem = {
      ...leveledSpell,
      range: '15m',
    };

    const html = renderToString(
      <ResourceCard
        resource={spellWithRange}
        characterLevel={5}
        spellSlots={defaultSlots}
        onSpend={vi.fn()}
        onDelete={vi.fn()}
        onSpendSpellSlot={vi.fn()}
      />
    );

    // Title and Badges container must be flex in print to unify the line
    expect(html).toMatch(/class="[^"]*print:flex print:items-center print:gap-1\.5[^"]*"/);

    // Title has print:order-1 to come first on the line
    expect(html).toMatch(/class="[^"]*print:order-1[^"]*"/);

    // Badges container has print:order-2 to follow the title on the same line
    expect(html).toMatch(/class="[^"]*print:order-2[^"]*"/);

    // All elements (name, level, range) are rendered together
    expect(html).toContain('Curar Heridas Leves');
    expect(html).toMatch(/Nivel (<!-- -->)?1/);
    expect(html).toContain('15m');
  });
});
