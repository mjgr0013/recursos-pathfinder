import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FormulaGuideModal } from '../../src/components/FormulaGuideModal';

describe('FormulaGuideModal component', () => {
  const sampleVars = {
    nivel_personaje: 6,
    ataque_base: 4,
    modificador_lanzador: 3,
  };

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <FormulaGuideModal isOpen={false} onClose={vi.fn()} variables={sampleVars} />
    );
    expect(html).toBe('');
  });

  it('renders the modal header, character stats, and tabs when open', () => {
    const html = renderToString(
      <FormulaGuideModal isOpen={true} onClose={vi.fn()} variables={sampleVars} />
    );

    // Modal title & subtitle
    expect(html).toContain('Guía de Fórmulas y Variables');
    expect(html).toContain('Valores de tu personaje:');

    // Stats bar displays current variables
    expect(html).toContain('Nivel: <strong>6</strong>');
    expect(html).toContain('BAB: <strong>+4</strong>');
    expect(html).toContain('Mod. Lanzador: <strong>+3</strong>');

    // Tabs
    expect(html).toContain('Ejemplos Pathfinder');
    expect(html).toContain('Variables');
    expect(html).toContain('Funciones (min, max...)');
    expect(html).toContain('Sintaxis');
    expect(html).toContain('Probador');
  });

  it('renders examples with dynamic previews for the current character', () => {
    const html = renderToString(
      <FormulaGuideModal isOpen={true} onClose={vi.fn()} variables={sampleVars} />
    );

    // Should include classic Pathfinder examples
    expect(html).toContain('Curar Heridas Leves');
    expect(html).toContain('Bola de Fuego');
    expect(html).toContain('Proyectil Mágico');
    expect(html).toContain('Canalizar Energía');

    // Buttons
    expect(html).toContain('Copiar');
  });

  it('renders insert buttons when onInsert callback is provided', () => {
    const html = renderToString(
      <FormulaGuideModal
        isOpen={true}
        onClose={vi.fn()}
        variables={sampleVars}
        onInsert={vi.fn()}
      />
    );

    expect(html).toContain('Insertar');
  });

  it('explains the ## Corto section in the Sintaxis tab with copy and insert actions', () => {
    const html = renderToString(
      <FormulaGuideModal isOpen={true} onClose={vi.fn()} onInsert={vi.fn()} variables={sampleVars} initialTab="syntax" />
    );
    const section = html.slice(html.indexOf('data-guide-section="description-sections"'));
    expect(section).toContain('Sección especial de la descripción');
    expect(section).toContain('## Corto');
    expect(section).not.toContain('## Resumen');
    expect(section).toContain('Modo recursos');
    expect(section).toContain('Ver más');
    expect(section).toContain('Copiar');
    expect(section).toContain('Insertar');
  });

  it('previews Corto both in the table row and in the collapsed card with the current character', () => {
    const html = renderToString(
      <FormulaGuideModal isOpen={true} onClose={vi.fn()} variables={{ nivel_personaje: 7, modificador_lanzador: 4 }} initialTab="syntax" />
    );
    const preview = html.slice(html.indexOf('data-guide-preview="description-sections"'));
    expect(preview).toContain('Modo recursos');
    expect(preview).toContain('card plegada');

    const table = preview.slice(preview.indexOf('data-preview="short"'), preview.indexOf('data-preview="card"'));
    const card = preview.slice(preview.indexOf('data-preview="card"'), preview.indexOf('Es opcional y admite'));
    for (const block of [table, card]) {
      expect(block).toContain('7d6');
      expect(block).toContain('CD 17');
      expect(block).not.toContain('{');
      expect(block).not.toContain('Mecánica');
    }
  });
});
