# Quickstart & Verification Guide: Shared Spell Slots by Level & Documentation URL

**Feature**: `002-shared-spell-slots`  
**Date**: 2026-10-15  
**Status**: Ready  

## 1. Comandos de Validación Automatizada

```bash
# 1. Ejecutar tests unitarios de espacios de conjuro y validación
npm run test:run

# 2. Comprobar tipado estricto
npx tsc --noEmit

# 3. Compilar bundle estático para GitHub Pages
npm run build
```

---

## 2. Escenarios de Verificación End-to-End

### Escenario 1: Configuración de Espacios de Conjuro y Consumo Compartido
1. Abrir la aplicación y desplegar el panel "Espacios de Conjuros (1-9)".
2. Fijar los espacios máximos de Nivel 1 en `4` (quedan 4/4 disponibles).
3. Crear un conjuro de Nivel 1: "Proyectil Mágico".
4. Crear otro conjuro de Nivel 1: "Armadura de Mago".
5. En la tarjeta de "Proyectil Mágico", pulsar `-1`:
   - El contador en ambas tarjetas ("Proyectil Mágico" y "Armadura de Mago") pasa inmediatamente a `3/4`.
   - En el panel global de espacios, el nivel 1 muestra `3/4`.

### Escenario 2: Agotamiento de Espacios
1. Gastar los 3 espacios restantes de Nivel 1 hasta alcanzar `0/4`.
2. Verificar que los botones de gasto (-1) de "Proyectil Mágico" y "Armadura de Mago" quedan deshabilitados.
3. En el panel global, pulsar `+1` en Nivel 1:
   - Ambas tarjetas se reactivan mostrando `1/4`.

### Escenario 3: Enlace a Documentación Oficial (URL)
1. Crear un rasgo "Furia Bárbara" con URL `https://aonprd.com/ClassDisplay.aspx?ItemName=Barbarian`.
2. Verificar que en la tarjeta aparece el botón "🌐 Ver reglas oficiales".
3. Pulsar el botón y comprobar que abre la dirección en una nueva pestaña sin bloquear la app.

### Escenario 4: Descanso Largo
1. Con los espacios de Nivel 1 en `1/4` y habiendo consumido recursos de rasgos.
2. Pulsar "🌙 Descanso" y confirmar.
3. Comprobar que los espacios de Nivel 1 vuelven a `4/4` y los PG se restablecen al máximo.

### Escenario 5: Retrocompatibilidad de Importación JSON v1.0.0
1. Importar un archivo JSON exportado previamente en versión 1.0.0.
2. Comprobar que la ficha carga sin errores, los espacios se inicializan correctamente y los conjuros previos se visualizan con normalidad.
