# Data Model & State Transitions: Hide Empty Traits & Flexible Resource Editing

**Feature Branch**: `006-hide-empty-traits`
**Date**: 2026-10-15

## Entities & Value Objects

### 1. SpellSlot (Espacio de Conjuro por Nivel)

Representa la reserva de energía mágica disponible para un nivel de conjuro específico (1 a 9).

| Campo | Tipo | Invariante / Restricción | Descripción |
|---|---|---|---|
| `level` | `number` | Entero entre 1 y 9 | Nivel del espacio de conjuro |
| `max` | `number` | Entero ≥ 0 | Cantidad total máxima configurada de espacios para este nivel |
| `available` | `number` | Entero `0 <= available <= max` | Cantidad de espacios no gastados listos para lanzar |

#### Operación de Dominio: `updateSpellSlotValues`
```typescript
function updateSpellSlotValues(
  slots: SpellSlotsMap,
  level: number,
  rawAvailable: number,
  rawMax: number
): SpellSlotsMap;
```
- **Normalización**:
  - `cleanMax = Math.max(0, Math.floor(rawMax))`
  - `cleanAvailable = Math.max(0, Math.min(cleanMax, Math.floor(rawAvailable)))`
- **Garantía**: `0 <= available <= max` en todo momento.

---

### 2. ResourceItem (Rasgo / Dote Limitado)

Representa una habilidad o rasgo especial de clase/raza con usos diarios finitos.

| Campo | Tipo | Invariante / Restricción | Descripción |
|---|---|---|---|
| `id` | `string` | UUID o identificador único | Identificador del recurso |
| `name` | `string` | Texto no vacío (1..80 caracteres) | Nombre del rasgo |
| `category` | `'feat_trait'` | Categoría fija | Rasgo o dote |
| `usageMode` | `'limited'` | Modo de uso finito | Requiere conteo de usos diarios |
| `maxUses` | `number` | Entero ≥ 1 | Usos máximos asignados por día |
| `availableUses` | `number` | Entero `0 <= availableUses <= maxUses` | Usos restantes en la jornada actual |

#### Operación de Dominio: `updateResourceUses`
```typescript
function updateResourceUses(
  resources: ResourceItem[],
  id: string,
  rawAvailable: number,
  rawMax: number
): ResourceItem[];
```
- **Normalización**:
  - `cleanMax = Math.max(1, Math.floor(rawMax))`
  - `cleanAvailable = Math.max(0, Math.min(cleanMax, Math.floor(rawAvailable)))`
- **Garantía**: `0 <= availableUses <= maxUses` y `maxUses >= 1`.

---

## Matriz de Estados de la Cabecera de Recursos Diarios

La cabecera evalúa de forma determinista la disponibilidad de recursos:

| `hasActiveMagic` (`maxActiveLevel > 0`) | `hasActiveTraits` (`limitedTraits.length > 0`) | Texto Renderizado en Subtítulo |
|---|---|---|
| **TRUE** | **TRUE** | `Magia: {avail}/{max} • Rasgos: {avail}/{max}` |
| **TRUE** | **FALSE** | `Magia: {avail}/{max}` *(sin separadores ni mención a rasgos)* |
| **FALSE** | **TRUE** | `Rasgos: {avail}/{max}` *(sin separadores ni mención a magia)* |
| **FALSE** | **FALSE** | `Sin recursos diarios activos` *(indicador neutral)* |

---

## Flujo de Edición y Rectificación de Recursos

```
[Usuario detecta error de gasto o incremento de nivel]
                 │
                 ▼
         Pulsar Lápiz (✏️)
                 │
                 ▼
    Apertura de Modal de Edición
    ┌───────────────────────────┐
    │ Disponibles / Actuales: N │
    │ Máximos Diarios:        M │
    └───────────────────────────┘
                 │
                 ▼
         Guardar Cambios
                 │
                 ▼
    Validación en Dominio:
    - Asegurar min/max bounds
    - Clamping: 0 <= actual <= max
                 │
                 ▼
  Persistencia Local y Reactividad
  (Actualización simultánea en Cabecera, Panel y Tarjetas)
```
