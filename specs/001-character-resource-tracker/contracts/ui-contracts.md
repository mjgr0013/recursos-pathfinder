# UI Contracts & Interaction Specifications

**Feature**: `001-character-resource-tracker`  
**Date**: 2026-10-15  
**Status**: Complete  

## 1. Ergonomic & Touch Layout Principles

- **Viewport Base**: Optimizado para pantallas móviles con ancho desde 360px (`w-full max-w-lg mx-auto`).
- **Área Táctil Mínima (Hitbox)**: Todo botón, selector de pestaña o casilla de conteo DEBE contar con una dimensión mínima de `44px × 44px` (`min-h-[44px] min-w-[44px]`).
- **Retroalimentación Táctil**:
  - Estado `active`: Escala rápida (`active:scale-95 duration-75`).
  - Animación de daño/curación: Destello visual temporal (rojo para daño, verde para curación) en el indicador de salud.

---

## 2. Component Event Contracts

### 2.1 Perfil y Avatar (`CharacterHeader`)
- **Eventos**:
  - `onUpdateProfile(name: string, level: number, characterClass: string)`:
    - Validación: `name.trim().length > 0`, `level in [1..20]`, `characterClass.trim().length > 0`.
  - `onAvatarSelected(file: File)`:
    - Validación de tipo MIME: `image/jpeg`, `image/png`, `image/webp`.
    - Procesa en canvas (redimensiona a máximo 300x300, comprime a WebP 82%).
    - Emite `onAvatarProcessed(dataUrl: string)`.

### 2.2 Monitor de Salud (`HealthTracker`)
- **Acciones Rápidas**:
  - `onQuickDamage(amount: number)`:
    - `amount` preestablecido (+1, +5, +10) o entrada numérica personalizada.
    - Ejecuta `applyDamage(health, amount)`.
  - `onQuickHeal(amount: number)`:
    - `amount` preestablecido (+1, +5, +10) o entrada numérica personalizada.
    - Ejecuta `applyHealing(health, amount)`.
  - `onSetTempHp(amount: number)`:
    - Reemplaza `health.tempHp`.
  - `onUpdateMaxHp(newMax: number)`:
    - Actualiza `health.maxHp` (`newMax >= 1`). Ajusta `currentHp` si excede el nuevo máximo.

### 2.3 Gestor de Recursos (`ResourceCard` & `ResourceList`)
- **Filtros de Pestañas**:
  - Pestañas con área táctil grande: `Todos`, `Conjuros`, `Rasgos y Dotes`.
- **Acciones Rápidas por Recurso**:
  - `onSpendUse(resourceId: string)`:
    - Si es de uso limitado y `availableUses > 0`: descuenta 1 uso con respuesta visual inmediata.
    - Si `availableUses === 0`: el botón se encuentra deshabilitado visualmente (`opacity-40 pointer-events-none`).
  - `onRestoreUse(resourceId: string)`:
    - Si es de uso limitado y `availableUses < maxUses`: recupera 1 uso.
    - Si `availableUses === maxUses`: el botón se encuentra deshabilitado.
  - `onToggleExpand(resourceId: string)`:
    - Despliega u oculta la descripción de reglas multilínea del efecto.
  - `onDeleteResource(resourceId: string)`:
    - Solicita confirmación antes de eliminar el recurso de la ficha.

### 2.4 Acciones Globales (`ActionBar`)
- **Descanso Largo (`LongRestButton`)**:
  - Muestra un diálogo de confirmación modal accesible:
    - Mensaje: "¿Confirmar descanso largo? Se restaurarán todos los recursos diarios y se limpiarán los PG temporales."
    - Acciones: `Cancelar` y `Confirmar Descanso`.
  - Al confirmar, emite `onExecuteLongRest()`.
- **Exportación / Importación (`DataManagementModal`)**:
  - `onExportJson()`: Dispara la descarga de archivo `[nombre_personaje]_[timestamp].json`.
  - `onImportJson(file: File)`: Lee el archivo como texto, valida con `validateBackupPayload`, y solicita confirmación de sobrescritura antes de reemplazar el estado activo.
