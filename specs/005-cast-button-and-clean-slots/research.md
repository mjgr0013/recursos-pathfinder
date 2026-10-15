# Research & Technical Decisions: Cast Button Action & Clean Slot Controls

**Feature**: `005-cast-button-and-clean-slots`  
**Date**: 2026-10-15  
**Status**: Resolved  

## Research Topics & Decisions

---

### 1. Botón Táctil de Acción "Lanzar" en Tarjetas de Recursos

- **Contexto**: Las tarjetas de conjuros y rasgos tenían controles aritméticos tipo calculadora (-1 / +1) que no representaban fielmente la acción de combate ni prevenían pulsaciones erróneas.
- **Decisión**:
  - Eliminar los botones `+1` y `-1` en `ResourceCard`.
  - Incorporar un botón de acción principal **"Lanzar"** (o "Usar"):
    - Para conjuros de nivel N: botón con estilo temático púrpura/índigo (`bg-purple-600 hover:bg-purple-500`) de al menos 44x44px. Al pulsar, descuenta 1 espacio de `spellSlots[N]`. Si `available === 0`, el botón se deshabilita con texto `Sin espacios`.
    - Para rasgos limitados: botón con estilo ámbar (`bg-amber-600 hover:bg-amber-500`) que descuenta 1 uso del rasgo. Si `available === 0`, se deshabilita con texto `Sin usos`.
    - Para trucos / cantrips (nivel 0): botón `Lanzar (A voluntad)` sin coste de espacios.
  - La tarjeta sigue mostrando de forma clara el saldo restante (`disp / máx`) junto al botón.
- **Razón**: Transforma la experiencia de usuario en una auténtica ficha táctica de rol de un solo toque y elimina errores operativos durante el combate.

---

### 2. Simplificación de Espacios de Magia en Recursos Diarios

- **Contexto**: El usuario solicitó quitar los botones de sumar y restar de las filas de espacios de magia en recursos diarios, conservando únicamente el contador y el botón de edición (✏️).
- **Decisión**:
  - En `DailyResourcesTracker.tsx`:
    - En cada fila de nivel de conjuro, suprimir los botones de `-1` y `+1`.
    - Conservar la etiqueta de nivel (`Niv {lvl}`), el contador numérico de disponibilidad (`{slot.available} / {slot.max}`) y el botón de edición `✏️` para ajustar la capacidad diaria.
    - Los espacios se consumen en la lista de conjuros pulsando "Lanzar" en cada hechizo.
- **Razón**: Elimina redundancias en la vista móvil y asegura que el gasto de espacios siempre esté asociado al hechizo específico que se está ejecutando.

---

### 3. Cierre Automático del Modal al Reiniciar Ficha

- **Contexto**: Al confirmar "Crear ficha nueva en blanco", el modal permanecía abierto con un mensaje, requiriendo pulsar la cruz (✕) manualmente para volver a la página.
- **Decisión**:
  - En `BackupModal.tsx`, al pulsar "Sí, reiniciar":
    - Invocar `onResetCharacter()`.
    - Invocar `onClose()` de forma inmediata.
    - El toast de confirmación en `App.tsx` notifica al usuario en la pantalla principal.
- **Razón**: Navegación fluida y directa sin clics adicionales.
