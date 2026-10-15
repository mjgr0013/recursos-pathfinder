# Quickstart & Verification Guide: Unified Daily Resources & Dynamic Spell Slots

**Feature**: `003-unified-daily-resources`  
**Date**: 2026-10-15  
**Status**: Ready  

## 1. Comandos de Validación Automatizada

```bash
# 1. Ejecutar tests unitarios de nivel dinámico y ajuste de rasgos
npm run test:run

# 2. Comprobar tipado estricto
npx tsc --noEmit

# 3. Compilar bundle estático para GitHub Pages
npm run build
```

---

## 2. Escenarios de Verificación End-to-End

### Escenario 1: Espacios de Conjuro Dinámicos
1. Abrir la aplicación con un personaje que únicamente tiene conjuros de Nivel 1 y Nivel 2.
2. Comprobar que el bloque de espacios de magia solo muestra las tarjetas de Nivel 1 y Nivel 2 (ocultando los niveles 3 al 9).
3. Añadir un conjuro de Nivel 5: "Cono de Frío".
4. Verificar que el panel se expande automáticamente mostrando los niveles del 1 al 5 sin requerir recargar la página.

### Escenario 2: Panel Unificado de Recursos Diarios
1. Crear un rasgo limitado "Canalizar Energía" con 4 usos máximos diarios.
2. Observar el panel superior de "Recursos Diarios":
   - Muestra tanto la sección de Espacios de Magia como la sección de "Rasgos y Dotes".
   - "Canalizar Energía" aparece en el panel con `4/4` usos.
3. Crear una dote pasiva ilimitada "Soltura con las Armas".
4. Verificar que "Soltura con las Armas" NO satura el panel diario (aparece solo en la lista general).

### Escenario 3: Consumo Rápido y Edición de Máximos de Rasgo
1. En el panel unificado, pulsar `-1` en "Canalizar Energía":
   - El contador pasa a `3/4` inmediatamente.
2. Pulsar el botón de editar `✏️` de "Canalizar Energía" y fijar los usos máximos en `6`:
   - El contador pasa a `3/6` sin modificar los usos ya consumidos.

### Escenario 4: Descanso Largo Unificado
1. Con los espacios de magia en `1/3` y "Canalizar Energía" en `3/6`.
2. Pulsar "🌙 Descanso" y confirmar.
3. Verificar que tanto los espacios de magia como "Canalizar Energía" se recargan al 100% (`3/3` y `6/6`).
