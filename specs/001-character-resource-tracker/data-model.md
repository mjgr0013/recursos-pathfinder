# Data Model: Pathfinder Character Resource Tracker

**Feature**: `001-character-resource-tracker`  
**Date**: 2026-10-15  
**Status**: Complete  

## Entities & Type Definitions

```typescript
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
  id: string;               // UUID v4
  name: string;             // Nombre del personaje (1..60 caracteres)
  level: number;            // Nivel del personaje (1..20, entero)
  characterClass: string;   // Clase o multiclase (1..60 caracteres)
  avatarDataUrl?: string;   // Imagen base64 comprimida en WebP/JPEG (opcional)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}

/**
 * Registro numérico del estado vital y puntos de vida (PG).
 */
export interface HealthRecord {
  maxHp: number;            // Puntos de vida máximos (> 0, entero)
  currentHp: number;        // Puntos de vida actuales (0..maxHp, entero)
  tempHp: number;           // Puntos de vida temporales (>= 0, entero)
}

/**
 * Estado derivado de consciencia del personaje basado en currentHp.
 */
export type ConsciousnessState = 'conscious' | 'unconscious' | 'dead';

/**
 * Representa un conjuro, dote, rasgo o habilidad rastreable.
 */
export interface ResourceItem {
  id: string;               // UUID v4
  name: string;             // Nombre del recurso (1..80 caracteres)
  category: ResourceCategory;
  usageMode: UsageMode;
  maxUses: number | null;    // null si usageMode === 'unlimited'; entero > 0 si 'limited'
  availableUses: number | null; // null si 'unlimited'; entero (0..maxUses) si 'limited'
  description: string;      // Reglas, duración, alcance, etc. (0..4000 caracteres)
  sortOrder: number;        // Orden de presentación en la lista
}

/**
 * Estado unificado del personaje en ejecución.
 */
export interface CharacterState {
  profile: CharacterProfile;
  health: HealthRecord;
  resources: ResourceItem[];
}

/**
 * Estructura del archivo de exportación e importación JSON de respaldo.
 */
export interface CharacterBackupPayload {
  schemaVersion: '1.0.0';
  exportedAt: string;       // ISO 8601 timestamp
  character: CharacterProfile;
  health: HealthRecord;
  resources: ResourceItem[];
}
```

---

## Validation Rules & Invariants

1. **Perfil (`CharacterProfile`)**:
   - `name`: No puede ser una cadena vacía ni contener únicamente espacios en blanco. Longitud máxima: 60 caracteres.
   - `level`: Debe ser un número entero entre 1 y 20 (ambos inclusive).
   - `characterClass`: No puede estar vacío. Longitud máxima: 60 caracteres.
   - `avatarDataUrl`: Debe ser un DataURL válido con formato de imagen (`data:image/(webp|jpeg|png);base64,...`) con un tamaño no superior a 250KB tras la compresión.

2. **Salud (`HealthRecord`)**:
   - `maxHp`: Entero estrictamente positivo (`maxHp >= 1`).
   - `currentHp`: Entero acotado entre 0 y `maxHp` (`0 <= currentHp <= maxHp`).
   - `tempHp`: Entero no negativo (`tempHp >= 0`).
   - Invariante de Daño: Todo daño se descuenta primero de `tempHp` hasta llegar a 0; el remanente se descuenta de `currentHp`.
   - Invariante de Curación: La curación solo incrementa `currentHp` y nunca puede exceder `maxHp`. No afecta a `tempHp`.

3. **Recursos (`ResourceItem`)**:
   - `name`: No puede estar vacío. Longitud máxima: 80 caracteres.
   - Si `usageMode === 'limited'`:
     - `maxUses` debe ser un entero `>= 1`.
     - `availableUses` debe ser un entero `>= 0` y `<= maxUses`.
   - Si `usageMode === 'unlimited'`:
     - `maxUses` y `availableUses` deben ser `null`.
   - `description`: Puede contener texto multilínea o formato ligero de reglas, hasta un límite seguro de 4000 caracteres.

---

## State Transitions & Domain Operations

| Operación | Estado Inicial | Acción / Parámetros | Estado Resultante | Reglas / Invariantes |
|---|---|---|---|---|
| `applyDamage` | `HealthRecord` | `amount: number (>= 1)` | `HealthRecord` | 1. `tempAbsorbed = min(tempHp, amount)`<br>2. `rem = amount - tempAbsorbed`<br>3. `newTempHp = tempHp - tempAbsorbed`<br>4. `newCurrentHp = max(0, currentHp - rem)` |
| `applyHealing` | `HealthRecord` | `amount: number (>= 1)` | `HealthRecord` | `newCurrentHp = min(maxHp, currentHp + amount)`. `tempHp` no cambia. |
| `setTempHp` | `HealthRecord` | `amount: number (>= 0)` | `HealthRecord` | `newTempHp = amount`. `currentHp` no cambia. |
| `spendResource` | `ResourceItem` (limited) | Ninguno | `ResourceItem` | `newAvailable = max(0, availableUses - 1)`. Si era 0, permanece en 0. |
| `restoreResource` | `ResourceItem` (limited) | Ninguno | `ResourceItem` | `newAvailable = min(maxUses, availableUses + 1)`. Si estaba al máximo, permanece al máximo. |
| `applyLongRest` | `CharacterState` | Ninguno (tras confirmación) | `CharacterState` | 1. Para todo recurso limitado: `availableUses = maxUses`<br>2. `health.currentHp = health.maxHp`<br>3. `health.tempHp = 0`<br>4. `profile.updatedAt = now()` |
| `importBackup` | Ninguno o actual | `payload: unknown` | `CharacterState` | Valida schema, tipos, rangos numéricos y versionado. Si es válido, reemplaza el estado activo; si es inválido, rechaza con detalle de error. |
