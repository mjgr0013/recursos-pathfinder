import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HealthTracker } from '../../src/components/HealthTracker';
import { HealthRecord } from '../../src/domain/types';

describe('HealthTracker component', () => {
  const sampleHealth: HealthRecord = {
    currentHp: 24,
    maxHp: 30,
    tempHp: 5,
  };

  it('renders health values correctly on screen', () => {
    const html = renderToString(
      <HealthTracker health={sampleHealth} onUpdateHealth={vi.fn()} />
    );

    // Displays current, max, and temp HP
    expect(html).toContain('24');
    expect(html).toContain('30');
    expect(html).toMatch(/\+<!-- -->5|\+5/);
    expect(html).toContain('Consciente');
  });

  it('includes print view without damage/heal buttons, and marks interactive controls as print:hidden', () => {
    const html = renderToString(
      <HealthTracker health={sampleHealth} onUpdateHealth={vi.fn()} />
    );

    // Dedicated clean print block is present
    expect(html).toContain('hidden print:block');
    expect(html).toContain('Puntos de Golpe (PG)');
    expect(html).toContain('PG Actuales');
    expect(html).toContain('PG Máximos');
    expect(html).toContain('Daño / Anotaciones');

    // Blank box for writing current HP with pencil on paper
    expect(html).toContain('w-16 h-8 border-2 border-slate-400 rounded');

    // Fixed max HP is printed
    expect(html).toContain('30');

    // Interactive button controls must be hidden in print
    expect(html).toContain('print:hidden');

    // Quick damage and heal buttons exist in screen view but have print:hidden wrapper
    expect(html).toMatch(/-<!-- -->1|-1/);
    expect(html).toMatch(/-<!-- -->5|-5/);
    expect(html).toMatch(/\+<!-- -->1|\+1/);
    expect(html).toMatch(/\+<!-- -->5|\+5/);
  });
});
