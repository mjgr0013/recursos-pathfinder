import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ResourceTable } from '../../src/components/ResourceTable';
import { ResourceItem, SpellSlotsMap } from '../../src/domain/types';
import { createDefaultSpellSlots } from '../../src/domain/spells';

describe('ResourceTable component', () => {
  const slots: SpellSlotsMap = createDefaultSpellSlots();
  slots[1] = { ...slots[1], available: 2, max: 3 };
  slots[3] = { ...slots[3], available: 0, max: 2 };

  const base = { maxUses: null, availableUses: null, description: '', sortOrder: 0 } as const;

  const cantrip: ResourceItem = { ...base, id: 'c', name: 'Luz', category: 'spell', usageMode: 'unlimited', spellLevel: 0 };
  const lvl1: ResourceItem = {
    ...base,
    id: 's1',
    name: 'Proyectil Mágico',
    category: 'spell',
    usageMode: 'limited',
    spellLevel: 1,
    range: '{30 + 5 * nivel} pies',
    description: '# Proyectil\n## Corto\n**1d4+1** por nivel {nivel}\n## Resumen\nDardo de fuerza.\n## Detalle\nDESCRIPCION-COMPLETA',
  };
  const lvl3: ResourceItem = { ...base, id: 's3', name: 'Bola de Fuego', category: 'spell', usageMode: 'limited', spellLevel: 3 };
  const limited: ResourceItem = {
    ...base,
    id: 't1',
    name: 'Furia',
    category: 'feat_trait',
    usageMode: 'limited',
    spellLevel: null,
    maxUses: 4,
    availableUses: 1,
  };
  const unlimited: ResourceItem = { ...base, id: 't2', name: 'Visión en la oscuridad', category: 'feat_trait', usageMode: 'unlimited', spellLevel: null };

  const render = (initialDetailId: string | null = null) =>
    renderToString(
      <ResourceTable
        spells={[cantrip, lvl1, lvl3]}
        feats={[limited, unlimited]}
        spellSlots={slots}
        characterLevel={2}
        characterVariables={{ nivel_personaje: 2 }}
        onSpendResource={vi.fn()}
        onRestoreResource={vi.fn()}
        onDeleteResource={vi.fn()}
        onSpendSpellSlot={vi.fn()}
        onRestoreSpellSlot={vi.fn()}
        initialDetailId={initialDetailId}
      />
    );

  const row = (html: string, id: string) => {
    const start = html.indexOf(`data-resource-row="${id}"`);
    return html.slice(start, html.indexOf('</tr>', start));
  };

  it('renders one table per section with the minimal columns', () => {
    const html = render();
    expect(html.match(/<table/g)).toHaveLength(2);
    expect(html).toContain('Conjuros (3)');
    expect(html).toContain('Rasgos y Dotes (2)');
    for (const header of ['Nombre', 'Nivel', 'Tipo', 'Alcance', 'Usos']) {
      expect(html).toContain(`>${header}</th>`);
    }
  });

  it('shows level, resolved range, slot counters and the cast button for leveled spells', () => {
    const r = row(render(), 's1');
    expect(r).toContain('Proyectil Mágico');
    expect(r).toContain('Nivel 1');
    expect(r).toContain('40 pies');
    expect(r).toMatch(/>2<span[^>]*>\/<!-- -->3</);
    expect(r).toContain('✨ Lanzar');
    expect(r).not.toContain('disabled=""');
  });

  it('disables the cast button when no slots are left', () => {
    const r = row(render(), 's3');
    expect(r).toContain('disabled=""');
    expect(r).toContain('text-rose-600');
  });

  it('shows cantrips and unlimited traits as ∞ without an action button', () => {
    for (const id of ['c', 't2']) {
      const r = row(render(), id);
      expect(r).toContain('∞');
      expect(r).not.toContain('Lanzar');
      expect(r).not.toContain('Usar');
      expect(r).toContain('Ver más');
    }
    expect(row(render(), 'c')).toContain('Truco');
    expect(row(render(), 't2')).toContain('Ilimitado');
  });

  it('shows daily uses and the use button for limited traits', () => {
    const r = row(render(), 't1');
    expect(r).toContain('Usos diarios');
    expect(r).toContain('⚡ Usar');
    expect(r).toMatch(/>1<span[^>]*>\/<!-- -->4</);
  });

  it('does not render the detail popup until "Ver más" is pressed', () => {
    const html = render();
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('DESCRIPCION-COMPLETA');
  });

  it('opens the full card with the whole description expanded in the popup', () => {
    const html = render('s1');
    const dialog = html.slice(html.indexOf('role="dialog"'));
    expect(dialog).toContain('<article');
    expect(dialog).toContain('DESCRIPCION-COMPLETA');
    expect(dialog).toContain('▲ Ver menos');
    expect(dialog).toContain('Cerrar detalle');
  });

  it('shows the "## Corto" section in its own column, rendered with markdown and variables', () => {
    const html = render();
    const spellsTable = html.slice(0, html.indexOf('Rasgos y Dotes'));
    expect(spellsTable).toContain('>Corto</th>');

    const r = row(html, 's1');
    expect(r).toContain('resource-short');
    expect(r).toContain('<strong');
    expect(r).toContain('1d4+1');
    expect(r).toContain('por nivel 2');
    expect(r).not.toContain('Dardo de fuerza');
    expect(r).not.toContain('DESCRIPCION-COMPLETA');

    // Los conjuros sin "## Corto" muestran un guion en esa columna
    expect(row(html, 's3')).toContain('—');
  });

  it('omits the Corto column in sections where no resource defines it', () => {
    const html = render();
    const featsTable = html.slice(html.indexOf('Rasgos y Dotes'));
    expect(featsTable).not.toContain('>Corto</th>');
    expect(featsTable).not.toContain('resource-short');
  });
});
