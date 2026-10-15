import { describe, it, expect } from 'vitest';
import { HealthRecord } from '../../src/domain/types';
import {
  applyDamage,
  applyHealing,
  setTempHp,
  updateMaxHp,
  getConsciousnessState,
} from '../../src/domain/health';

describe('Health Domain Calculations (Pathfinder Rules)', () => {
  it('absorbs damage from tempHp first, remainder from currentHp', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 25, tempHp: 5 };
    // 10 damage: absorbs 5 tempHp, remaining 5 damage from 25 currentHp -> 20 currentHp, 0 tempHp
    const result = applyDamage(initial, 10);
    expect(result.tempHp).toBe(0);
    expect(result.currentHp).toBe(20);
    expect(result.maxHp).toBe(30);
  });

  it('absorbs damage completely from tempHp if tempHp >= damage', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 25, tempHp: 10 };
    const result = applyDamage(initial, 6);
    expect(result.tempHp).toBe(4);
    expect(result.currentHp).toBe(25);
  });

  it('clamps currentHp to minimum 0 on massive damage', () => {
    const initial: HealthRecord = { maxHp: 20, currentHp: 10, tempHp: 2 };
    const result = applyDamage(initial, 50);
    expect(result.tempHp).toBe(0);
    expect(result.currentHp).toBe(0);
  });

  it('does not allow negative damage to heal', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 20, tempHp: 0 };
    const result = applyDamage(initial, -5);
    expect(result.currentHp).toBe(20);
  });

  it('heals currentHp without exceeding maxHp', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 20, tempHp: 5 };
    const result = applyHealing(initial, 15);
    expect(result.currentHp).toBe(30);
    // Temp HP is untouched by healing
    expect(result.tempHp).toBe(5);
  });

  it('heals currentHp accurately when below maxHp', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 12, tempHp: 0 };
    const result = applyHealing(initial, 8);
    expect(result.currentHp).toBe(20);
  });

  it('does not allow negative healing to damage', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 20, tempHp: 0 };
    const result = applyHealing(initial, -10);
    expect(result.currentHp).toBe(20);
  });

  it('sets tempHp safely without negative values', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 20, tempHp: 0 };
    const result = setTempHp(initial, 12);
    expect(result.tempHp).toBe(12);
    const resultNeg = setTempHp(initial, -4);
    expect(resultNeg.tempHp).toBe(0);
  });

  it('updates maxHp and adjusts currentHp if it exceeds new maxHp', () => {
    const initial: HealthRecord = { maxHp: 30, currentHp: 28, tempHp: 0 };
    const reduced = updateMaxHp(initial, 20);
    expect(reduced.maxHp).toBe(20);
    expect(reduced.currentHp).toBe(20);

    const expanded = updateMaxHp(initial, 40);
    expect(expanded.maxHp).toBe(40);
    expect(expanded.currentHp).toBe(28);
  });

  it('correctly calculates consciousness state', () => {
    expect(getConsciousnessState({ maxHp: 20, currentHp: 15, tempHp: 0 })).toBe('conscious');
    expect(getConsciousnessState({ maxHp: 20, currentHp: 0, tempHp: 0 })).toBe('unconscious');
  });
});
