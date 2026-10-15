# Quickstart & Verification Guide: Hide Empty Traits & Flexible Resource Editing

**Feature**: `006-hide-empty-traits`
**Date**: 2026-10-15
**Status**: Ready

## 1. Comandos de Validación Automatizada

```bash
# 1. Ejecutar tests unitarios
npm test

# 2. Comprobar tipado estricto
npx tsc --noEmit

# 3. Compilar bundle estático para GitHub Pages
npm run build
```

---

## 2. Escenarios de Verificación End-to-End

### Escenario 1: Ocultación de Rasgos en la Cabecera (Sin Rasgos Limitados)
1. Iniciar la aplicación o abrir una ficha que tenga conjuros pero ningún rasgo con usos limitados.
2. Observar la cabecera del panel de "Recursos Diarios":
   - Muestra únicamente `Magia: X/Y`.
   - **Resultado esperado**: No aparece el separador `•` ni el texto `Rasgos: 0/0`.
3. Si el personaje tampoco tiene conjuros activos:
   - **Resultado esperado**: La cabecera muestra el texto `Sin recursos diarios activos`.

### Escenario 2: Aparición Dinámica de Rasgos al Añadir uno Limitado
1. Pulsar "+ Añadir" en el catálogo y registrar un rasgo limitado "Canalizar Energía" con 3 usos diarios.
2. Observar la cabecera de "Recursos Diarios":
   - **Resultado esperado**: Se actualiza de inmediato para mostrar `Rasgos: 3/3` (o `Magia: X/Y • Rasgos: 3/3` si hay magia activa).
3. Desplegar el panel de "Recursos Diarios":
   - **Resultado esperado**: Aparece la subsección "Rasgos y Dotes (Usos Diarios)" con la fila de "Canalizar Energía".

### Escenario 3: Filas Limpias de Rasgos (Sin botones -1 y +1)
1. Abrir la subsección de rasgos en "Recursos Diarios".
2. Inspeccionar la fila de "Canalizar Energía":
   - Muestra el nombre "Canalizar Energía", el contador `3 / 3 usos` y el botón de lápiz `✏️`.
   - **Resultado esperado**: No existe ningún botón de `-1` ni de `+1`.

### Escenario 4: Rectificación de Gasto Accidental de Conjuro (Edición Dual de Espacio)
1. Pulsar "✨ Lanzar" en un conjuro de Nivel 1 en el catálogo (sus espacios bajan de 3/3 a 2/3).
2. En el panel de Recursos Diarios, pulsar el lápiz `✏️` en la fila del Nivel 1.
3. El modal muestra campos editables para:
   - "Espacios Disponibles" (actualmente 2).
   - "Espacios Máximos" (actualmente 3).
4. Cambiar "Espacios Disponibles" a 3 y pulsar "Guardar".
5. **Resultado esperado**: El contador de Nivel 1 se actualiza a `3 / 3 espacios` tanto en el panel como en la tarjeta del conjuro, rectificando el gasto erróneo sin necesidad de Descanso Largo.

### Escenario 5: Rectificación de Gasto Accidental de Rasgo (Edición Dual de Rasgo)
1. Pulsar "⚡ Usar" en "Canalizar Energía" en el catálogo (sus usos bajan de 3/3 a 2/3).
2. Pulsar el lápiz `✏️` (desde la fila de recursos diarios o desde la tarjeta de catálogo).
3. El modal muestra campos editables para:
   - "Usos Disponibles" (actualmente 2).
   - "Usos Máximos Diarios" (actualmente 3).
4. Cambiar "Usos Disponibles" a 3 y pulsar "Guardar".
5. **Resultado esperado**: El contador se actualiza inmediatamente a `3/3` en toda la interfaz.

### Escenario 6: Deshabilitación al Agotar Recursos
1. Pulsar repetidamente "⚡ Usar" hasta agotar los usos (`0/3`).
2. **Resultado esperado**: El botón "Usar" se deshabilita con la leyenda "Sin usos", y la fila del recurso diario resalta el 0 en rojo manteniendo accesible el botón `✏️`.
