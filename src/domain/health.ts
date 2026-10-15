import { HealthRecord, ConsciousnessState } from './types';

/**
 * Aplica daño entrante a la salud del personaje siguiendo las reglas de Pathfinder:
 * Primero descuenta de los puntos de vida temporales. El remanente se descuenta de los actuales (mínimo 0).
 */
export function applyDamage(health: HealthRecord, rawAmount: number): HealthRecord {
  const amount = Math.max(0, Math.floor(rawAmount));
  if (amount === 0) return health;

  const tempAbsorbed = Math.min(health.tempHp, amount);
  const remainingDamage = amount - tempAbsorbed;
  const newTempHp = health.tempHp - tempAbsorbed;
  const newCurrentHp = Math.max(0, health.currentHp - remainingDamage);

  return {
    ...health,
    tempHp: newTempHp,
    currentHp: newCurrentHp,
  };
}

/**
 * Aplica curación a los puntos de vida actuales, acotada al valor máximo de PG.
 * No afecta a los puntos de vida temporales.
 */
export function applyHealing(health: HealthRecord, rawAmount: number): HealthRecord {
  const amount = Math.max(0, Math.floor(rawAmount));
  if (amount === 0) return health;

  const newCurrentHp = Math.min(health.maxHp, health.currentHp + amount);

  return {
    ...health,
    currentHp: newCurrentHp,
  };
}

/**
 * Establece los puntos de vida temporales (mínimo 0).
 */
export function setTempHp(health: HealthRecord, rawAmount: number): HealthRecord {
  const tempHp = Math.max(0, Math.floor(rawAmount));
  return {
    ...health,
    tempHp,
  };
}

/**
 * Actualiza los puntos de vida máximos (mínimo 1) y acota los actuales si superan el nuevo tope.
 */
export function updateMaxHp(health: HealthRecord, rawMax: number): HealthRecord {
  const maxHp = Math.max(1, Math.floor(rawMax));
  const currentHp = Math.min(maxHp, health.currentHp);

  return {
    ...health,
    maxHp,
    currentHp,
  };
}

/**
 * Retorna el estado de consciencia del personaje basado en los PG actuales.
 */
export function getConsciousnessState(health: HealthRecord): ConsciousnessState {
  if (health.currentHp <= 0) {
    return 'unconscious';
  }
  return 'conscious';
}
