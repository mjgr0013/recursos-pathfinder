# Implementation Plan: Hide Empty Traits & Flexible Resource Editing

**Branch**: `006-hide-empty-traits` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-hide-empty-traits/spec.md`

## Summary

Esta funcionalidad consolida una interfaz limpia, coherente y tolerante a fallos en la gestión de recursos diarios:
1. **Ocultación condicional en la cabecera**: La etiqueta y contador de rasgos solo se muestran si existen rasgos limitados activos (`limitedTraits.length > 0`), mostrando únicamente Magia si solo hay magia o un mensaje neutral ("Sin recursos diarios activos") si no hay recursos activos.
2. **Homogeneización visual en recursos diarios**: Eliminar los botones `-1` y `+1` de las filas de rasgos en `DailyResourcesTracker`, dejando únicamente el nombre, contador (`disponibles / máximos usos`) y el botón táctil de lápiz (`✏️`), logrando simetría total con las filas de espacios de magia.
3. **Edición dual de valores disponibles y máximos**: Extender los modales de edición (lápiz `✏️`) tanto para espacios de conjuros como para rasgos limitados, permitiendo editar tanto los valores actuales como los máximos para subsanar errores de pulsación accidental sobre "Usar" o "Lanzar".
4. **Gasto centralizado**: Mantener el gasto de rasgos exclusivamente a través del botón "Usar" en el catálogo de recursos.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`)

**Testing**: Vitest (`tests/domain/`)

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Constraints**: 100% Offline-First; botones con área mínima de 44x44px; cero dependencias pesadas; funciones puras de dominio desacopladas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Operación 100% en el cliente sin servidores. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | Se mantiene el esquema de datos y persistencia existente en LocalStorage. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | Eliminación de botones pequeños +/-; modales de edición amplios con inputs táctiles y botones grandes. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Tipado estricto en funciones de dominio y props de componentes. |
| **V. Integridad de Datos y Testing** | Lógica desacoplada en Vitest | **PASS** | Las funciones de actualización de valores y cálculo de límites (`updateSpellSlotValues`, `updateResourceUses`) son funciones puras con tests unitarios. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/006-hide-empty-traits/
├── spec.md              # Especificación funcional
├── plan.md              # Este plan de implementación técnica
├── research.md          # Decisiones arquitectónicas y de UX
├── data-model.md        # Entidades y transiciones de estado
├── quickstart.md        # Guía de verificación end-to-end
├── contracts/           # Contratos de componentes UI
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de validación de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── spells.ts                 # Añadir updateSpellSlotValues (disponibles + max)
│   └── resources.ts              # Añadir updateResourceUses (disponibles + max)
├── components/
│   ├── DailyResourcesTracker.tsx # Ocultar rasgos vacíos en cabecera, quitar +/- en filas, modal dual de slots y traits
│   ├── ResourceCard.tsx          # Modal dual de edición de rasgos (disponibles + max)
│   ├── ResourceList.tsx          # Propagación de handlers de edición dual
│   └── SpellSlotsTracker.tsx     # Opcional: coherencia de edición si aplica
└── App.tsx                       # Handlers para actualizar slots y recursos con ambos valores

tests/
└── domain/
    ├── spells.test.ts            # Tests para updateSpellSlotValues
    └── resources.test.ts         # Tests para updateResourceUses
```

## Complexity Tracking

> **Sin violaciones constitucionales.** Se eliminan controles redundantes y se simplifica la navegación visual en pantallas móviles compactas.
