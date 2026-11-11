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

  it('renders theme dropdown selector with light, warm, and dark indications', () => {
    const lightHtml = renderToString(<TopBarActions {...defaultProps} currentTheme="light" />);
    expect(lightHtml).toContain('☀️');
    expect(lightHtml).toContain('Claro');
    expect(lightHtml).toContain('Seleccionar tema visual');

    const warmHtml = renderToString(<TopBarActions {...defaultProps} currentTheme="warm" />);
    expect(warmHtml).toContain('📜');
    expect(warmHtml).toContain('Cálido');

    const darkHtml = renderToString(<TopBarActions {...defaultProps} currentTheme="dark" />);
    expect(darkHtml).toContain('🌙');
    expect(darkHtml).toContain('Oscuro');
  });

  it('has accessible popup dropdown attributes on theme selector', () => {
    const html = renderToString(<TopBarActions {...defaultProps} />);
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('aria-expanded="false"');
  });
});
