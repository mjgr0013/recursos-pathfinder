# Quickstart & Verification Guide: Cast Button Action & Clean Slot Controls

**Feature**: `005-cast-button-and-clean-slots`  
**Date**: 2026-10-15  
**Status**: Ready  

## 1. Comandos de Validación Automatizada

```bash
# 1. Ejecutar tests unitarios
npm run test:run

# 2. Comprobar tipado estricto
npx tsc --noEmit

# 3. Compilar bundle estático para GitHub Pages
npm run build
```

---

## 2. Escenarios de Verificación End-to-End

### Escenario 1: Lanzar Conjuro desde la Tarjeta
1. Crear un conjuro de Nivel 1 ("Proyectil Mágico") y configurar 3 espacios de Nivel 1 en recursos diarios.
2. Observar la tarjeta de "Proyectil Mágico":
   - Muestra el botón "✨ Lanzar" y el contador `3/3`. No hay botones `+1` ni `-1`.
3. Pulsar "✨ Lanzar":
   - El contador pasa inmediatamente a `2/3` en la tarjeta y en recursos diarios.
4. Pulsar dos veces más hasta alcanzar `0/3`:
   - El botón pasa a estar deshabilitado con el texto "Sin espacios".

### Escenario 2: Botón "Lanzar / Usar" en Rasgos Limitados
1. Crear un rasgo limitado "Canalizar Energía" con 4 usos diarios.
2. Observar su tarjeta:
   - Muestra el botón "⚡ Usar" (o "Lanzar") y el contador `4/4`.
3. Pulsar el botón:
   - Se descuenta 1 uso pasando a `3/4` al instante.

### Escenario 3: Filas de Espacios Limpias en Recursos Diarios
1. Abrir la sección de "Espacios de Magia" en el panel de recursos diarios.
2. Verificar que cada nivel muestra únicamente:
   - `Niv 1`, `3/3` y el botón `✏️`.
   - No hay ningún botón de `-1` ni `+1`.

### Escenario 4: Cierre Automático al Crear Ficha Nueva
1. Abrir el modal de datos (💾 Datos).
2. Pulsar "Crear ficha nueva en blanco".
3. En la confirmación, pulsar "Sí, reiniciar".
4. Verificar que el modal se cierra automáticamente de inmediato (<100ms) y la página principal muestra la ficha reiniciada con la notificación toast.
