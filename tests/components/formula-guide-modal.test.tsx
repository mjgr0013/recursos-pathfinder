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
});
