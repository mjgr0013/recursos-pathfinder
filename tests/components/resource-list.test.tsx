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

  it('renders spells grouped by level with headers and counts', () => {
    const list = [cantrip, spellLvl1, spellLvl2, spellLvl3];

    const html = renderToString(
      <ResourceList
        resources={list}
        spellSlots={defaultSlots}
        initialTab="spell"
        onSpendResource={vi.fn()}
        onRestoreResource={vi.fn()}
        onDeleteResource={vi.fn()}
        onAddResource={vi.fn()}
        onSpendSpellSlot={vi.fn()}
        onRestoreSpellSlot={vi.fn()}
      />
    );

    // Group headers for each level should be present
    expect(html).toContain('Trucos (Nivel 0)');
    expect(html).toContain('Nivel 1');
    expect(html).toContain('Nivel 2');
    expect(html).toContain('Nivel 3');

    // Global toggle for all levels
    expect(html).toContain('Niveles de conjuro');
    expect(html).toContain('Plegar todos');

    // Level headers indicate they can be toggled
    expect(html).toContain('▲ Plegar');
  });

  describe('Search functionality (Buscador)', () => {
    const listWithDesc = [
      { ...cantrip, description: 'Rayo gélido que causa frío' },
      { ...spellLvl1, description: 'Misiles arcanos infalibles' },
      { ...spellLvl2, description: 'Chorros de fuego abrasador' },
      { ...spellLvl3, description: 'Explosión flamígera masiva' },
      { ...trait, description: 'Objeto de vínculo arcano para canalizar magia' },
    ];

    it('renders the search input with icon and placeholder', () => {
      const html = renderToString(
        <ResourceList
          resources={listWithDesc}
          spellSlots={defaultSlots}
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      expect(html).toContain('🔍');
      expect(html).toContain('aria-label="Buscar conjuros o rasgos"');
      expect(html).toContain('placeholder="Buscar conjuro o rasgo por nombre o descripción..."');
    });

    it('filters spells by name matching query', () => {
      const html = renderToString(
        <ResourceList
          resources={listWithDesc}
          spellSlots={defaultSlots}
          initialSearchQuery="Fuego"
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      // Matches "Bola de Fuego" (name) and "Rayo Abrasador" (description has "fuego")
      expect(html).toContain('Bola de Fuego');
      expect(html).toContain('Rayo Abrasador');

      // Does not match other unrelated spells
      expect(html).not.toContain('Rayo de Escarcha (Truco)');
      expect(html).not.toContain('Vínculo Arcano');
    });

    it('filters accent-insensitively (e.g. "magico" matches "Proyectil Mágico")', () => {
      const html = renderToString(
        <ResourceList
          resources={listWithDesc}
          spellSlots={defaultSlots}
          initialSearchQuery="magico"
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      expect(html).toContain('Proyectil Mágico');
      expect(html).not.toContain('Bola de Fuego');
    });

    it('filters traits matching query', () => {
      const html = renderToString(
        <ResourceList
          resources={listWithDesc}
          spellSlots={defaultSlots}
          initialSearchQuery="vinculo"
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      expect(html).toContain('Vínculo Arcano');
      expect(html).not.toContain('Bola de Fuego');
      expect(html).not.toContain('Proyectil Mágico');
    });

    it('displays friendly empty state when no elements match the search', () => {
      const html = renderToString(
        <ResourceList
          resources={listWithDesc}
          spellSlots={defaultSlots}
          initialSearchQuery="palabraInexistente123"
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      expect(html).toMatch(/No se encontraron resultados para &quot;(<!-- -->)?palabraInexistente123(<!-- -->)?&quot;/);
      expect(html).toContain('Limpiar búsqueda');
    });
  });

  describe('Print / Paper Export optimizations', () => {
    const sampleResources = [cantrip, spellLvl1, trait];

    it('hides search bar, category tabs, and add button in print mode', () => {
      const html = renderToString(
        <ResourceList
          resources={sampleResources}
          spellSlots={defaultSlots}
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      // Search bar wrapper must have print:hidden
      expect(html).toMatch(/class="[^"]*relative mb-3 print:hidden[^"]*"/);

      // Category tabs & add button must have print:hidden
      expect(html).toMatch(/class="[^"]*print:hidden[^"]*">.*Todos/);

      // Both spells and traits must be rendered in the document
      expect(html).toContain('Rayo de Escarcha (Truco)');
      expect(html).toContain('Proyectil Mágico');
      expect(html).toContain('Vínculo Arcano');
    });

    it('hides spell level separator buttons in print mode and displays clean spells section', () => {
      const multipleLevelSpells = [cantrip, spellLvl1, spellLvl2];

      const html = renderToString(
        <ResourceList
          resources={multipleLevelSpells}
          spellSlots={defaultSlots}
          onSpendResource={vi.fn()}
          onRestoreResource={vi.fn()}
          onDeleteResource={vi.fn()}
          onAddResource={vi.fn()}
          onSpendSpellSlot={vi.fn()}
          onRestoreSpellSlot={vi.fn()}
        />
      );

      // All spell level separator toggle buttons must include print:hidden
      expect(html).toContain('print:hidden');
      const separatorButtons = html.match(/aria-label="[^"]*\(1\), (desplegar|plegar)"/g);
      expect(separatorButtons).not.toBeNull();
      // Level buttons must have class print:hidden
      expect(html).toMatch(/class="[^"]*rounded-xl text-left transition-colors print:hidden[^"]*"/);

      // Spells container should have print:pl-0 to avoid indentation on paper
      expect(html).toMatch(/class="[^"]*print:pl-0[^"]*"/);

      // Header indicates spells count in print mode
      expect(html).toContain('Conjuros (3)');
    });
  });
});
