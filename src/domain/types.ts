/**
 * Categoría del recurso dentro del sistema de reglas de Pathfinder.
 */
export type ResourceCategory = 'spell' | 'feat_trait';

/**
 * Modo de gestión de uso del recurso:
 * - 'limited': cuenta con usos diarios máximos y disponibles.
 * - 'unlimited': pasivo o a voluntad, sin casillas de consumo.
 */
export type UsageMode = 'limited' | 'unlimited';

/**
 * Representa los datos principales de identidad del personaje.
 */
export interface CharacterProfile {
  id: string;
  name: string;
  level: number;
  characterClass: string;
  avatarDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registro numérico del estado vital y puntos de vida (PG).
 */
export interface HealthRecord {
  maxHp: number;
  currentHp: number;
  tempHp: number;
}

/**
 * Estado derivado de consciencia del personaje basado en currentHp.
 */
export type ConsciousnessState = 'conscious' | 'unconscious' | 'dead';

/**
 * Representa la capacidad mágica diaria de un nivel específico de conjuro (1 al 9).
 */
export interface SpellSlotLevel {
  level: number;
  max: number;
  available: number;
}

/**
 * Registro de los 9 niveles de conjuros disponibles en Pathfinder.
 */
export type SpellSlotsMap = Record<number, SpellSlotLevel>;

/**
 * Representa un conjuro, dote, rasgo o habilidad rastreable.
 */
export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  usageMode: UsageMode;
  spellLevel?: number | null;
  url?: string;
  maxUses: number | null;
  availableUses: number | null;
  description: string;
  sortOrder: number;
}

/**
 * Estado unificado del personaje en ejecución.
 */
export interface CharacterState {
  profile: CharacterProfile;
  health: HealthRecord;
  spellSlots: SpellSlotsMap;
  resources: ResourceItem[];
}

/**
 * Estructura del archivo de exportación e importación JSON de respaldo.
 */
export interface CharacterBackupPayload {
  schemaVersion: '1.0.0' | '1.1.0';
  exportedAt: string;
  character: CharacterProfile;
  health: HealthRecord;
  spellSlots?: SpellSlotsMap;
  resources: ResourceItem[];
}
