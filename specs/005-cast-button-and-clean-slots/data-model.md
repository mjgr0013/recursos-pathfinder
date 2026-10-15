# Data Model: Cast Button Action & Clean Slot Controls

**Feature**: `005-cast-button-and-clean-slots`  
**Date**: 2026-10-15  
**Status**: Complete  

## Entities & Type Definitions

Se conservan las entidades existentes de dominio (`ResourceItem`, `SpellSlotsMap`, `CharacterState`).

### Flujo de Acciones de Usuario (Event Contracts)

| Elemento UI | Evento | Comportamiento |
|---|---|---|
| `ResourceCard` (Conjuro nivel N) | `onCast()` | Llama a `onSpendSpellSlot(spellLevel)`. Descuenta 1 espacio de `spellSlots[N]`. Si `available === 0`, el botón permanece deshabilitado. |
| `ResourceCard` (Rasgo limitado) | `onCast()` | Llama a `onSpend(resource.id)`. Descuenta 1 uso del rasgo. Si `availableUses === 0`, el botón permanece deshabilitado. |
| `ResourceCard` (Truco nivel 0) | `onCast()` | Emite feedback visual sin descontar espacios ni usos. |
| `DailyResourcesTracker` (Fila de nivel N) | Visualización | Muestra `Niv {lvl}`, `{available} / {max}` y botón `✏️`. No incluye botones `-1` ni `+1`. |
| `BackupModal` (Confirmar reinicio) | `onConfirmReset()` | Invoca `onResetCharacter()` e inmediatamente después `onClose()`. |
