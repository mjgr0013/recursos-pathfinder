# Implementation Plan: Cast Button Action & Clean Slot Controls

**Branch**: `005-cast-button-and-clean-slots` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-cast-button-and-clean-slots/spec.md`

## Summary

Optimizar las acciones de combate y la ergonomía de la interfaz:
1. Reemplazar los botones +/- de las tarjetas de conjuros y rasgos por un botón táctil destacado **"Lanzar"** (o "Usar") que ejecute la acción en un solo toque y se deshabilite al agotar recursos.
2. Limpiar las filas de espacios de magia en el panel de recursos diarios eliminando los botones +/- y dejando únicamente el indicador y el botón de edición (✏️).
3. Cerrar automáticamente el modal de datos al confirmar "Crear ficha nueva en blanco", devolviendo al usuario a la página principal.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`)

**Testing**: Vitest

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Constraints**: 100% Offline-First; botones con área mínima de 44x44px; cero dependencias pesadas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Operación 100% en el navegador. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | Persistencia reactiva del estado y reseteo limpio. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | Botón "Lanzar" grande y accesible; eliminación de botones pequeños redundantes. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Tipado estricto en todos los contratos de componentes. |
| **V. Integridad de Datos y Testing** | Lógica desacoplada en Vitest | **PASS** | Gasto de slots y recursos ejecutados mediante funciones puras de dominio. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/005-cast-button-and-clean-slots/
├── plan.md              # Plan de implementación técnica
├── research.md          # Investigación y decisiones arquitectónicas
├── data-model.md        # Definición de flujo de eventos
├── quickstart.md        # Guía de verificación end-to-end
├── contracts/           # Contratos de interfaces
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de requisitos
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ResourceCard.tsx          # Reemplazar +/- por botón táctil "Lanzar" / "Usar"
│   ├── DailyResourcesTracker.tsx # Quitar +/- de las filas de magia, conservar ✏️
│   ├── BackupModal.tsx           # Cerrar modal automáticamente al confirmar reinicio
│   └── ResourceList.tsx          # Pasar handlers a ResourceCard
└── App.tsx                       # Coordinación de estado
```

## Complexity Tracking

> **Sin violaciones constitucionales.**
