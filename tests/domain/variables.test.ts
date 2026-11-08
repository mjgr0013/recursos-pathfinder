import { describe, it, expect } from 'vitest';
import { evaluateSafeMath, interpolateVariables, resolveRange } from '../../src/domain/variables';

describe('Safe Math & Variable Evaluator', () => {
  describe('evaluateSafeMath', () => {
    it('evaluates basic numbers and arithmetic operations', () => {
      expect(evaluateSafeMath('5 + 3', { nivel_personaje: 1 })).toBe(8);
      expect(evaluateSafeMath('10 - 4', { nivel_personaje: 1 })).toBe(6);
      expect(evaluateSafeMath('3 * 4', { nivel_personaje: 1 })).toBe(12);
      expect(evaluateSafeMath('15 / 3', { nivel_personaje: 1 })).toBe(5);
    });

    it('respects operator precedence and parentheses', () => {
      expect(evaluateSafeMath('2 + 3 * 4', { nivel_personaje: 1 })).toBe(14);
      expect(evaluateSafeMath('(2 + 3) * 4', { nivel_personaje: 1 })).toBe(20);
    });

    it('replaces character level variables', () => {
      expect(evaluateSafeMath('nivel_personaje', { nivel_personaje: 5 })).toBe(5);
      expect(evaluateSafeMath('nivel_personaje + 2', { nivel_personaje: 5 })).toBe(7);
      expect(evaluateSafeMath('nivel * 2', { nivel_personaje: 4 })).toBe(8);
      expect(evaluateSafeMath('level - 1', { nivel_personaje: 6 })).toBe(5);
    });

    it('evaluates ataque_base and modificador_lanzador variables and aliases', () => {
      const vars = {
        nivel_personaje: 5,
        ataque_base: 3,
        modificador_lanzador: 4,
      };

      expect(evaluateSafeMath('ataque_base', vars)).toBe(3);
      expect(evaluateSafeMath('bab + 2', vars)).toBe(5);
      expect(evaluateSafeMath('modificador_lanzador', vars)).toBe(4);
      expect(evaluateSafeMath('mod_lanzador + 1', vars)).toBe(5);
      expect(evaluateSafeMath('ataque_base + modificador_lanzador', vars)).toBe(7);
      expect(evaluateSafeMath('10 + 2 + mod_conjuros', vars)).toBe(16);
    });

    it('supports helper functions min, max, floor, ceil, round', () => {
      expect(evaluateSafeMath('floor(nivel_personaje / 2)', { nivel_personaje: 5 })).toBe(2);
      expect(evaluateSafeMath('ceil(nivel_personaje / 2)', { nivel_personaje: 5 })).toBe(3);
      expect(evaluateSafeMath('min(5, nivel_personaje)', { nivel_personaje: 8 })).toBe(5);
      expect(evaluateSafeMath('max(1, nivel_personaje - 3)', { nivel_personaje: 2 })).toBe(1);
      expect(evaluateSafeMath('round(2.6)', { nivel_personaje: 1 })).toBe(3);
    });

    it('safely returns NaN on malformed or malicious inputs', () => {
      expect(Number.isNaN(evaluateSafeMath('', { nivel_personaje: 1 }))).toBe(true);
      expect(Number.isNaN(evaluateSafeMath('alert(1)', { nivel_personaje: 1 }))).toBe(true);
      expect(Number.isNaN(evaluateSafeMath('console.log("x")', { nivel_personaje: 1 }))).toBe(true);
      expect(Number.isNaN(evaluateSafeMath('5 + unknown_var', { nivel_personaje: 1 }))).toBe(true);
    });
  });

  describe('interpolateVariables', () => {
    it('returns empty string for empty input', () => {
      expect(interpolateVariables('', { nivel_personaje: 5 })).toBe('');
    });

    it('replaces braced variable expressions in text', () => {
      const text = 'Tu nivel actual es {nivel_personaje}. Bonificador: +{nivel_personaje + 2}.';
      const result = interpolateVariables(text, { nivel_personaje: 5 });
      expect(result).toBe('Tu nivel actual es 5. Bonificador: +7.');
    });

    it('supports dice expressions with variable quantity via curly braces', () => {
      const text = 'Causa `{nivel_personaje}d8+2` de daño y `{nivel_personaje + 2}d6` en crítico.';
      const result = interpolateVariables(text, { nivel_personaje: 3 });
      expect(result).toBe('Causa `3d8+2` de daño y `5d6` en crítico.');
    });

    it('supports direct variable quantity inside backticks without braces', () => {
      const t1 = 'Causa `nivel_personaje d8 + 2` puntos.';
      expect(interpolateVariables(t1, { nivel_personaje: 5 })).toBe('Causa `5d8 + 2` puntos.');

      const t2 = 'Explosión de `(nivel_personaje + 2)d8` de fuego.';
      expect(interpolateVariables(t2, { nivel_personaje: 5 })).toBe(
        'Explosión de `7d8` de fuego.'
      );
    });

    it('supports dice with variable modifier (e.g. 1d8 + nivel_personaje)', () => {
      const t1 = 'Restaura `1d8 + nivel_personaje` PG.';
      expect(interpolateVariables(t1, { nivel_personaje: 5 })).toBe('Restaura `1d8 + 5` PG.');

      const t2 = 'Restaura `1d8 + nivel_personaje + 2` PG.';
      expect(interpolateVariables(t2, { nivel_personaje: 5 })).toBe('Restaura `1d8 + 7` PG.');

      const t3 = 'Daño reducido en `2d6 - nivel_personaje`.';
      expect(interpolateVariables(t3, { nivel_personaje: 3 })).toBe('Daño reducido en `2d6 - 3`.');
    });

    it('interpolates ataque_base and modificador_lanzador in spell attacks and save DC', () => {
      const spellText = `### Rayo de Energía
- **Ataque de toque**: \`1d20 + ataque_base + modificador_lanzador\` (total: \`+{ataque_base + modificador_lanzador}\`)
- **Salvación**: \`CD {10 + 2 + modificador_lanzador}\` Reflejos mitad
- **Daño**: \`1d8 + mod_lanzador\` de fuerza`;

      const result = interpolateVariables(spellText, {
        nivel_personaje: 5,
        ataque_base: 3,
        modificador_lanzador: 4,
      });

      expect(result).toContain('`1d20 + 7`');
      expect(result).toContain('`+7`');
      expect(result).toContain('`CD 16`');
      expect(result).toContain('`1d8 + 4`');
    });

    it('interpolates variables inside markdown tables and lists', () => {
      const md = `| Nivel | Daño |
| --- | --- |
| Nivel {nivel_personaje} | \`{nivel_personaje}d6\` |
| Siguiente | \`{nivel_personaje + 1}d6\` |`;

      const result = interpolateVariables(md, { nivel_personaje: 5 });
      expect(result).toContain('| Nivel 5 | `5d6` |');
      expect(result).toContain('| Siguiente | `6d6` |');
    });

    it('updates dynamically when level changes from 1 to 7', () => {
      const template = 'Lanza `{nivel_personaje}d8 + 2` o `1d8 + nivel_personaje`.';

      const level1 = interpolateVariables(template, { nivel_personaje: 1 });
      expect(level1).toBe('Lanza `1d8 + 2` o `1d8 + 1`.');

      const level7 = interpolateVariables(template, { nivel_personaje: 7 });
      expect(level7).toBe('Lanza `7d8 + 2` o `1d8 + 7`.');
    });

    it('preserves non-variable curly braces safely', () => {
      const text = 'Configuración: `{"mode": "auto"}` y `[key: value]`.';
      expect(interpolateVariables(text, { nivel_personaje: 5 })).toBe(text);
    });

    it('resolves range formulas dynamically in markdown text', () => {
      const desc = '- **Alcance**: corto (25 pies + 5 pies/2 nivel personaje)';
      expect(interpolateVariables(desc, { nivel_personaje: 1 })).toBe(
        '- **Alcance**: corto (25 pies)'
      );
      expect(interpolateVariables(desc, { nivel_personaje: 5 })).toBe(
        '- **Alcance**: corto (35 pies)'
      );
    });
  });

  describe('resolveRange', () => {
    it('resolves corto (close) range formula: 25 pies + 5 pies / 2 niveles', () => {
      const formula = 'corto (25 pies + 5 pies/2 nivel personaje)';
      expect(resolveRange(formula, { nivel_personaje: 1 })).toBe('corto (25 pies)');
      expect(resolveRange(formula, { nivel_personaje: 2 })).toBe('corto (30 pies)');
      expect(resolveRange(formula, { nivel_personaje: 3 })).toBe('corto (30 pies)');
      expect(resolveRange(formula, { nivel_personaje: 4 })).toBe('corto (35 pies)');
      expect(resolveRange(formula, { nivel_personaje: 5 })).toBe('corto (35 pies)');
      expect(resolveRange(formula, { nivel_personaje: 10 })).toBe('corto (50 pies)');
    });

    it('resolves medio (medium) range formula: 100 pies + 10 pies / nivel', () => {
      const formula = 'medio (100 pies + 10 pies/nivel personaje)';
      expect(resolveRange(formula, { nivel_personaje: 1 })).toBe('medio (110 pies)');
      expect(resolveRange(formula, { nivel_personaje: 5 })).toBe('medio (150 pies)');
      expect(resolveRange(formula, { nivel_personaje: 7 })).toBe('medio (170 pies)');
    });

    it('resolves largo (long) range formula: 400 pies + 40 pies / nivel', () => {
      const formula = 'largo (400 pies + 40 pies/nivel personaje)';
      expect(resolveRange(formula, { nivel_personaje: 1 })).toBe('largo (440 pies)');
      expect(resolveRange(formula, { nivel_personaje: 5 })).toBe('largo (600 pies)');
    });

    it('preserves non-formula fixed ranges', () => {
      expect(resolveRange('Toque', { nivel_personaje: 5 })).toBe('Toque');
      expect(resolveRange('Personal', { nivel_personaje: 5 })).toBe('Personal');
      expect(resolveRange('30 pies', { nivel_personaje: 5 })).toBe('30 pies');
      expect(resolveRange('', { nivel_personaje: 5 })).toBe('');
    });

    it('supports math expressions in curly braces', () => {
      const custom = '{25 + 5 * floor(nivel_personaje / 2)} pies';
      expect(resolveRange(custom, { nivel_personaje: 5 })).toBe('35 pies');
    });
  });
});
