import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DailyResourcesTracker } from '../../src/components/DailyResourcesTracker';
import { SpellSlotsMap, ResourceItem } from '../../src/domain/types';
import { createDefaultSpellSlots } from '../../src/domain/spells';

describe('DailyResourcesTracker component', () => {
  const defaultSlots: SpellSlotsMap = createDefaultSpellSlots();

  const spellLvl1: ResourceItem = {
    id: 'res-s1',
    name: 'Curar Heridas Leves',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 1,
    maxUses: null,
    availableUses: null,
    description: '',
    sortOrder: 0,
  };

  const limitedTrait: ResourceItem = {
    id: 'res-t1',
    name: 'Canalizar Energía',
    category: 'feat_trait',
    usageMode: 'limited',
    spellLevel: null,
    maxUses: 4,
    availableUses: 3,
    description: '',
    sortOrder: 1,
  };

  it('renders spell slot box without words "Nivel" or "espacios", and with compact edit button', () => {
    const html = renderToString(
      <DailyResourcesTracker
        spellSlots={defaultSlots}
        resources={[spellLvl1]}
        onUpdateMaxSlots={vi.fn()}
        onUpdateSlotValues={vi.fn()}
      />
    );

    // Slot box should render the number "1"
    expect(html).toContain('text-xs font-black text-purple-700 dark:text-purple-300">1</span>');

    // Slot box MUST NOT render "Nivel 1"
    expect(html).not.toContain('Nivel 1');

    // Slot box should render compact counter "/3"
    expect(html).toMatch(/\/(<!-- -->)?3<\/span>/);

    // Slot box MUST NOT render the word "espacios"
    expect(html).not.toContain('/ 3 espacios');
    expect(html).not.toContain('/3 espacios');
    expect(html).not.toContain('espacios</span>');

    // Edit button must have compact size w-7 h-7 instead of w-10 h-10
    expect(html).toContain('w-7 h-7');
    expect(html).not.toContain('w-10 h-10');
  });

  it('renders limited trait box without the word "usos", and with compact edit button', () => {
    const html = renderToString(
      <DailyResourcesTracker
        spellSlots={defaultSlots}
        resources={[limitedTrait]}
        onUpdateMaxSlots={vi.fn()}
        onUpdateSlotValues={vi.fn()}
      />
    );

    // Trait name is shown
    expect(html).toContain('Canalizar Energía');

    // Counter is compact "/4"
    expect(html).toMatch(/\/(<!-- -->)?4<\/span>/);

    // Trait box MUST NOT render the word "usos"
    expect(html).not.toContain('/ 4 usos');
    expect(html).not.toContain('/4 usos');
    expect(html).not.toContain('usos</span>');

    // Compact edit button
    expect(html).toContain('w-7 h-7');
    expect(html).not.toContain('w-10 h-10');
  });

  it('renders squares only for spell slots in paper export, hiding traits in print view', () => {
    const html = renderToString(
      <DailyResourcesTracker
        spellSlots={defaultSlots}
        resources={[spellLvl1, limitedTrait]}
        onUpdateMaxSlots={vi.fn()}
        onUpdateSlotValues={vi.fn()}
      />
    );

    // Spell slot level 1 has max: 3 -> exactly 3 squares in print (traits do not render squares in Recursos Diarios)
    const squareMatches = html.match(/w-4 h-4 border-2 border-slate-900 rounded-sm inline-block bg-white/g);
    expect(squareMatches).toHaveLength(3);

    // The limited traits subsection in Recursos Diarios has print:hidden
    expect(html).toMatch(/class="[^"]*print:hidden[^"]*">.*Rasgos y Dotes \(Usos Diarios\)/);
  });
});
