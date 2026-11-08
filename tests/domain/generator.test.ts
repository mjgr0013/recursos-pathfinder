import { describe, it, expect } from 'vitest';
import { generateRandomCharacter } from '../../src/domain/generator';
import { parseMarkdown } from '../../src/domain/markdown';

describe('Random Character Generator', () => {
  it('generates a complete, valid character state with all game components', () => {
    const character = generateRandomCharacter(0);

    expect(character.profile.name).toBeTruthy();
    expect(character.profile.characterClass).toBeTruthy();
    expect(character.profile.level).toBeGreaterThan(0);
    expect(character.profile.avatarDataUrl).toMatch(/^data:image\/svg\+xml/);

    expect(character.health.maxHp).toBeGreaterThan(0);
    expect(character.health.currentHp).toBeGreaterThan(0);
    expect(character.health.tempHp).toBeGreaterThanOrEqual(0);

    // Verify spell slots structure
    for (let lvl = 1; lvl <= 9; lvl++) {
      expect(character.spellSlots[lvl]).toBeDefined();
      expect(character.spellSlots[lvl].level).toBe(lvl);
      expect(character.spellSlots[lvl].max).toBeGreaterThanOrEqual(0);
      expect(character.spellSlots[lvl].available).toBeLessThanOrEqual(character.spellSlots[lvl].max);
    }

    // Verify resources collection
    expect(character.resources.length).toBeGreaterThanOrEqual(4);

    const cantrip = character.resources.find((r) => r.category === 'spell' && r.spellLevel === 0);
    expect(cantrip).toBeDefined();
    expect(cantrip?.usageMode).toBe('unlimited');

    const leveledSpell = character.resources.find(
      (r) => r.category === 'spell' && typeof r.spellLevel === 'number' && r.spellLevel >= 1
    );
    expect(leveledSpell).toBeDefined();

    const limitedTrait = character.resources.find(
      (r) => r.category === 'feat_trait' && r.usageMode === 'limited'
    );
    expect(limitedTrait).toBeDefined();
    expect(limitedTrait?.maxUses).toBeGreaterThan(0);

    const unlimitedTrait = character.resources.find(
      (r) => r.category === 'feat_trait' && r.usageMode === 'unlimited'
    );
    expect(unlimitedTrait).toBeDefined();
  });

  it('generates comprehensive markdown descriptions with all required elements', () => {
    // Generate across all archetypes and test markdown richness
    for (let i = 0; i < 4; i++) {
      const character = generateRandomCharacter(i);

      let foundHeading = false;
      let foundTable = false;
      let foundList = false;
      let foundCodeBlockOrInline = false;
      let foundQuote = false;
      let foundLink = false;

      for (const res of character.resources) {
        const blocks = parseMarkdown(res.description);
        expect(blocks.length).toBeGreaterThan(0);

        if (blocks.some((b) => b.type === 'heading')) foundHeading = true;
        if (blocks.some((b) => b.type === 'table')) foundTable = true;
        if (blocks.some((b) => b.type === 'unordered_list' || b.type === 'ordered_list')) {
          foundList = true;
        }
        if (blocks.some((b) => b.type === 'code_block') || res.description.includes('`')) {
          foundCodeBlockOrInline = true;
        }
        if (blocks.some((b) => b.type === 'blockquote')) foundQuote = true;
        if (res.url && res.url.startsWith('https://')) foundLink = true;
      }

      expect(foundHeading).toBe(true);
      expect(foundTable).toBe(true);
      expect(foundList).toBe(true);
      expect(foundCodeBlockOrInline).toBe(true);
      expect(foundQuote).toBe(true);
      expect(foundLink).toBe(true);
    }
  });

  it('cycles between diverse character archetypes', () => {
    const c1 = generateRandomCharacter(0);
    const c2 = generateRandomCharacter(1);
    const c3 = generateRandomCharacter(2);
    const c4 = generateRandomCharacter(3);

    expect(c1.profile.name).not.toBe(c2.profile.name);
    expect(c2.profile.name).not.toBe(c3.profile.name);
    expect(c3.profile.name).not.toBe(c4.profile.name);
  });
});
