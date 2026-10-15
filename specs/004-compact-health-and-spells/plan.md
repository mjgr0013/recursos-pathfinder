# Implementation Plan: Compact Health Controls & Non-Caster Magic Toggle

**Branch**: `004-compact-health-and-spells` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-compact-health-and-spells/spec.md`

## Summary

Refinar la experiencia de usuario y optimización de pantalla:
1. Eliminar por defecto cualquier espacio de magia si el personaje no tiene conjuros de nivel ≥ 1, y derivar los niveles visibles de forma estricta a partir del conjuro más alto registrado (suprimiendo botones manuales de adición de nivel).
2. Introducir un modo compacto en el monitor de salud (`HealthTracker`) que permita plegar la botonera de daño y curación rápida, dejando visible únicamente los PG actuales y máximos para ahorrar espacio fuera de combate.
3. Preseleccionar automáticamente la categoría en el modal de creación de recursos según la pestaña de filtro activa en la lista.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`) y preferencias de interfaz

**Testing**: Vitest para pruebas unitarias de `getHighestSpellLevel`

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Constraints**: 100% Offline-First; botones con área mínima de 44x44px; cero dependencias pesadas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Operación 100% en el navegador. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | Persistencia reactiva del estado y preferencias. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | Reducción de más del 60% en altura de salud plegada y eliminación de cajas mágicas para no lanzadores. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Tipado declarativo en todas las nuevas funciones de UI y dominio. |
| **V. Integridad de Datos y Testing** | Lógica matemática pura desacoplada en Vitest | **PASS** | `getHighestSpellLevel` cubierto exhaustivamente con pruebas unitarias. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/004-compact-health-and-spells/
├── plan.md              # Plan de implementación técnica
├── research.md          # Investigación y decisiones arquitectónicas
├── data-model.md        # Definición de reglas de dominio
├── quickstart.md        # Guía de verificación end-to-end
├── contracts/           # Contratos de interfaces
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── spells.ts                # Implementar getHighestSpellLevel (retorna 0 si no hay conjuros >= 1)
├── components/
│   ├── HealthTracker.tsx        # Añadir modo compacto plegable con toggle táctil
│   ├── DailyResourcesTracker.tsx # Renderizar magia solo si getHighestSpellLevel > 0; quitar botón manual
│   └── ResourceList.tsx         # Preseleccionar categoría según pestaña activa
├── App.tsx                      # Coordinación de estado
└── tests/
    └── domain/
        └── spells.test.ts       # Pruebas unitarias de getHighestSpellLevel
```

## Complexity Tracking

> **Sin violaciones constitucionales.**
