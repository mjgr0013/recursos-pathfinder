# Quickstart & Verification Guide: Compact Health Controls & Non-Caster Magic Toggle

**Feature**: `004-compact-health-and-spells`  
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

### Escenario 1: Cero Magia por Defecto en Personajes sin Conjuros
1. Iniciar la aplicación o pulsar "Reiniciar Ficha".
2. Sin conjuros registrados, comprobar el panel de "Recursos Diarios":
   - La sección de espacios de magia NO aparece en absoluto (0 cajas).
   - No hay ningún botón manual para forzar niveles de magia.

### Escenario 2: Desbloqueo Estricto al Registrar un Conjuro
1. Crear un conjuro de Nivel 2: "Invisibilidad".
2. Comprobar que el panel de recursos diarios muestra de inmediato los niveles 1 y 2 (y ninguno más).
3. Crear un conjuro de Nivel 4: "Invisibilidad Mayor".
4. Comprobar que el panel se expande automáticamente hasta Nivel 4.
5. Eliminar el conjuro de Nivel 4:
   - El panel se contrae inmediatamente volviendo a mostrar solo hasta Nivel 2.

### Escenario 3: Plegado del Monitor de Salud
1. En el monitor de salud, pulsar el botón "▲ Plegar".
2. Verificar que se ocultan todos los botones de daño (-1, -5, -10), curación (+1, +5, +10) y la entrada personalizada.
3. Comprobar que los PG actuales y máximos (`24 / 24`) permanecen claramente visibles en un formato ultra-compacto.
4. Pulsar "▼ Controles":
   - La botonera de combate completa reaparece al instante.

### Escenario 4: Preselección Contextual al Añadir Recursos
1. En el catálogo general, pulsar en la pestaña "Conjuros".
2. Pulsar `+ Añadir`:
   - El modal se abre con la categoría "Conjuro" ya seleccionada.
3. Cancelar y pulsar en la pestaña "Rasgos".
4. Pulsar `+ Añadir`:
   - El modal se abre con la categoría "Rasgo / Dote" ya seleccionada.
