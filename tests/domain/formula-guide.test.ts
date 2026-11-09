import { describe, it, expect } from 'vitest';
import {
  FORMULA_VARIABLES,
  FORMULA_FUNCTIONS,
  FORMULA_SYNTAX_RULES,
  FORMULA_REFERENCE_EXAMPLES,
  previewFormulaSnippet,
} from '../../src/domain/formula-guide';

describe('Formula Guide Domain Definitions', () => {
  const sampleVars = {
    nivel_personaje: 5,
    ataque_base: 3,
    modificador_lanzador: 4,
  };

  it('defines all required variables with aliases and explanations', () => {
    const varNames = FORMULA_VARIABLES.map((v) => v.name);
    expect(varNames).toContain('nivel_personaje');
    expect(varNames).toContain('ataque_base');
    expect(varNames).toContain('modificador_lanzador');

    const nivelVar = FORMULA_VARIABLES.find((v) => v.name === 'nivel_personaje')!;
    expect(nivelVar.aliases).toContain('nivel');
    expect(nivelVar.aliases).toContain('level');

    const babVar = FORMULA_VARIABLES.find((v) => v.name === 'ataque_base')!;
    expect(babVar.aliases).toContain('bab');

    const modVar = FORMULA_VARIABLES.find((v) => v.name === 'modificador_lanzador')!;
    expect(modVar.aliases).toContain('mod_lanzador');
    expect(modVar.aliases).toContain('mod_conjuros');
  });

  it('defines all supported mathematical functions: min, max, floor, ceil, round', () => {
    const fnNames = FORMULA_FUNCTIONS.map((f) => f.name);
    expect(fnNames).toEqual(['min', 'max', 'floor', 'ceil', 'round']);

    FORMULA_FUNCTIONS.forEach((fn) => {
      expect(fn.signature).toBeTruthy();
      expect(fn.description).toBeTruthy();
      expect(fn.example).toBeTruthy();
      expect(fn.explanation).toBeTruthy();
    });
  });

  it('defines syntax rules for braces, backticks, and range expressions', () => {
    expect(FORMULA_SYNTAX_RULES.length).toBeGreaterThanOrEqual(3);
    const badges = FORMULA_SYNTAX_RULES.map((r) => r.badge);
    expect(badges).toContain('{...}');
    expect(badges).toContain('`...`');
    expect(badges).toContain('Alcance');
  });

  it('evaluates all reference examples without NaN using previewFormulaSnippet', () => {
    expect(FORMULA_REFERENCE_EXAMPLES.length).toBeGreaterThanOrEqual(8);

    FORMULA_REFERENCE_EXAMPLES.forEach((example) => {
      const output = previewFormulaSnippet(example.snippet, sampleVars);
      expect(output).toBeTruthy();
      expect(output).not.toContain('NaN');
    });
  });

  it('produces expected dynamic outputs for specific Pathfinder reference examples', () => {
    // Cure light wounds at level 5 -> capped at +5
    const cure = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'cure-light-wounds')!;
    expect(previewFormulaSnippet(cure.snippet, sampleVars)).toContain('1d8 + 5');

    // Fireball at level 5 -> 5d6, DC 10 + 3 + 4 = 17
    const fireball = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'fireball')!;
    const fireballRes = previewFormulaSnippet(fireball.snippet, sampleVars);
    expect(fireballRes).toContain('`5d6`');
    expect(fireballRes).toContain('CD 17');

    // Magic missile at level 5 -> 3 missiles
    const missile = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'magic-missile')!;
    expect(previewFormulaSnippet(missile.snippet, sampleVars)).toContain('3 proyectil(es)');

    // Channel energy at level 5 -> 3d6, DC 10 + 2 + 4 = 16
    const channel = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'channel-energy')!;
    const channelRes = previewFormulaSnippet(channel.snippet, sampleVars);
    expect(channelRes).toContain('`3d6`');
    expect(channelRes).toContain('CD 16');

    // Lay on hands at level 5, mod 4 -> 2d6, 2 + 4 = 6 uses
    const loh = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'lay-on-hands')!;
    const lohRes = previewFormulaSnippet(loh.snippet, sampleVars);
    expect(lohRes).toContain('`2d6`');
    expect(lohRes).toContain('6 al día');

    // Spell attack touch at BAB 3, mod 4 -> 1d20 + 7
    const touch = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'spell-attack-touch')!;
    expect(previewFormulaSnippet(touch.snippet, sampleVars)).toContain('`1d20 + 7`');

    // Pathfinder ranges at level 5
    const ranges = FORMULA_REFERENCE_EXAMPLES.find((e) => e.id === 'pathfinder-ranges')!;
    const rangesRes = previewFormulaSnippet(ranges.snippet, sampleVars);
    expect(rangesRes).toContain('corto (35 pies)');
    expect(rangesRes).toContain('medio (150 pies)');
    expect(rangesRes).toContain('largo (600 pies)');
  });
});
