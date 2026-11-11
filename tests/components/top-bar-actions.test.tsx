import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TopBarActions } from '../../src/components/TopBarActions';

describe('TopBarActions component', () => {
  const defaultProps = {
    charactersCount: 3,
    maxCharacters: 5,
    currentTheme: 'light' as const,
    onSelectTheme: vi.fn(),
    onToggleTheme: vi.fn(),
    onOpenRoster: vi.fn(),
    onOpenBackup: vi.fn(),
    onOpenFormulaGuide: vi.fn(),
    onOpenLongRest: vi.fn(),
  };

  it('renders the grouped Menu button with character counter and accessibility attributes', () => {
    const html = renderToString(<TopBarActions {...defaultProps} />);

    // Menu button with character counter
    expect(html).toContain('Menú');
    expect(html).toContain('3/5');
    expect(html).toContain('⚙️');
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('aria-expanded="false"');

    // Outside the menu, standalone buttons like external Descanso should not be rendered
    expect(html).not.toContain('bg-indigo-950/80');

    // Menu container must be hidden in print view
    expect(html).toContain('print:hidden');
  });

  it('reflects different character count dynamically in badge', () => {
    const html = renderToString(<TopBarActions {...defaultProps} charactersCount={1} />);
    expect(html).toContain('1/5');
  });

  it('does not render the theme selector directly on the navigation bar', () => {
    const html = renderToString(<TopBarActions {...defaultProps} />);
    expect(html).not.toContain('Seleccionar tema visual');
    expect(html).toContain('Menú');
  });

  it('renders theme selector options inside the collapsed menu', () => {
    const openMenuHtml = renderToString(<TopBarActions {...defaultProps} initialMenuOpen={true} />);
    expect(openMenuHtml).toContain('Tema Visual');
    expect(openMenuHtml).toContain('☀️');
    expect(openMenuHtml).toContain('Claro');
    expect(openMenuHtml).toContain('📜');
    expect(openMenuHtml).toContain('Cálido');
    expect(openMenuHtml).toContain('🌙');
    expect(openMenuHtml).toContain('Oscuro');
  });

  it('highlights the active theme button inside the collapsed menu', () => {
    const warmMenuHtml = renderToString(
      <TopBarActions {...defaultProps} currentTheme="warm" initialMenuOpen={true} />
    );
    expect(warmMenuHtml).toContain('bg-amber-500');
  });
});
