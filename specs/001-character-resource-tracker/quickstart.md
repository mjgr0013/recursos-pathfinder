# Quickstart & Verification Guide: Pathfinder Character Resource Tracker

**Feature**: `001-character-resource-tracker`  
**Date**: 2026-10-15  
**Status**: Ready  

Este documento describe la configuración inicial, comandos de ejecución y los escenarios de prueba manuales y automatizados para verificar la funcionalidad completa de la aplicación.

---

## 1. Requisitos Previos y Entorno

- **Node.js**: v18.0.0 o superior
- **Navegador**: Cualquier navegador moderno con soporte para Web APIs nativas (`FileReader`, `<canvas>`, `LocalStorage`, `IndexedDB`)
- **Resolución de Prueba**: Emulador móvil de Chrome DevTools configurado a **360px** de ancho (ej. Moto G Power o Samsung Galaxy S8/S20).

---

## 2. Configuración y Ejecución del Proyecto

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Ejecutar la suite de pruebas unitarias automatizadas (Vitest)
npm run test:run

# 3. Iniciar el servidor local de desarrollo
npm run dev

# 4. Compilar la versión de producción estática para GitHub Pages
npm run build
```

---

## 3. Escenarios de Validación End-to-End

### Escenario 1: Creación de Perfil y Carga de Avatar Local
1. Abrir la aplicación en el navegador (`http://localhost:5173`).
2. Introducir Nombre: `Seoni`, Nivel: `4`, Clase: `Hechicera`.
3. Seleccionar una imagen de prueba JPEG/PNG desde el selector de archivos local.
4. **Resultado Esperado**:
   - El avatar se procesa inmediatamente y se visualiza redimensionado sin retraso.
   - El perfil persiste tras recargar la página (`F5`).

### Escenario 2: Monitor de Salud, Daño Rápido y Curación
1. Configurar PG Máximos en `28` y PG Temporales en `6` (PG Actuales inician en 28).
2. Pulsar botón de Daño Rápido `-10`:
   - Se descuentan primero los `6` PG temporales (pasan a `0`).
   - El remanente de `4` se descuenta de los PG actuales (pasan de `28` a `24`).
3. Pulsar botón de Curación Rápida `+10`:
   - Los PG actuales aumentan a `28` (tope máximo; no se desborda a 34).
4. **Resultado Esperado**:
   - Cálculos exactos según reglas de Pathfinder, tiempo de respuesta visual < 100ms.

### Escenario 3: Gestión de Conjuros y Rasgos
1. Crear recurso clasificado como `Conjuro`: "Rayo Abrasador", modo `Limitado`, 3 usos máximos, descripción: "Ataque de toque a distancia que inflige 4d6 de fuego".
2. Crear recurso clasificado como `Rasgo/Dote`: "Esquiva", modo `Ilimitado`, descripción: "+1 de esquiva a la CA".
3. En la tarjeta de "Rayo Abrasador", pulsar el botón de gasto (-1 uso):
   - El contador cambia de `3/3` a `2/3`.
4. En la tarjeta de "Esquiva", verificar que no tiene botón de gasto y su texto de reglas se despliega limpiamente.
5. **Resultado Esperado**:
   - Modos limitado e ilimitado visualizados adecuadamente; áreas táctiles cómodas de al menos 44x44px.

### Escenario 4: Descanso Largo
1. Con los recursos del Escenario 3 gastados (2/3) y habiendo asignado 5 PG temporales.
2. Pulsar el botón "Descanso Largo".
3. Aparece el modal de confirmación; pulsar "Confirmar Descanso".
4. **Resultado Esperado**:
   - "Rayo Abrasador" vuelve a `3/3`.
   - Los PG temporales vuelven a `0`.
   - Se muestra una notificación breve de éxito.

### Escenario 5: Exportación e Importación JSON
1. Pulsar "Exportar Ficha".
2. Comprobar que se descarga el archivo `[nombre]_[timestamp].json` con la estructura especificada en [character-backup.schema.json](./contracts/character-backup.schema.json).
3. Modificar datos o limpiar el almacenamiento del navegador.
4. Pulsar "Importar Ficha" y seleccionar el archivo descargado.
5. **Resultado Esperado**:
   - El personaje se restaura con su avatar, salud y recursos exactos.
