# UI Contracts: Compact Health Controls & Non-Caster Magic Toggle

**Feature**: `004-compact-health-and-spells`  
**Date**: 2026-10-15  
**Status**: Complete  

## 1. Ergonomic Touch Layout & Hitbox Standards

- **Viewport Base**: Móvil desde 360px (`w-full max-w-lg mx-auto`).
- **Hitboxes Táctiles**: Todos los botones de alternancia (`▲ Plegar`, `▼ Controles`, `+ Añadir`) deben medir al menos `44px × 44px`.

---

## 2. Component Event Contracts

### 2.1 Monitor de Salud Plegable (`HealthTracker`)
- **Estado Interno**: `isCompact` (booleano, por defecto `false` en fichas nuevas o hidratado desde LocalStorage).
- **Modo Compacto (`isCompact === true`)**:
  - Muestra cabecera: Título "❤️ Puntos de Vida", badge de consciencia, y botón accesible `▼ Controles` (≥44x44px).
  - Barra de resumen ultra-compacta: Indicador `currentHp / maxHp` y píldora de temporales `+tempHp` (si > 0).
  - Barra visual de progreso reducida.
  - Oculta completamente: botonera de daño (-1, -5, -10), botonera de curación (+1, +5, +10) e input numérico personalizado.
- **Modo Expandido (`isCompact === false`)**:
  - Muestra la botonera completa de combate y botón `▲ Plegar`.

### 2.2 Panel de Recursos Diarios (`DailyResourcesTracker`)
- **Derivación de Magia**:
  - Llama a `getHighestSpellLevel(resources)`.
  - Si el resultado es `0`: la sección de magia NO se renderiza (0 cajas).
  - Si el resultado es `N >= 1`: renderiza exactamente los niveles del `1` al `N`.
  - Queda suprimido cualquier botón para añadir o habilitar niveles superiores manualmente (`+ Niv {N+1}`).

### 2.3 Preselección Contextual (`ResourceList`)
- **Al abrir el modal `+ Añadir`**:
  - Si la pestaña activa es `'spell'`, preselecciona automáticamente `category: 'spell'` y `spellLevel: 1`.
  - Si la pestaña activa es `'feat_trait'`, preselecciona automáticamente `category: 'feat_trait'`.
  - Si la pestaña activa es `'all'`, preselecciona `'spell'`.
