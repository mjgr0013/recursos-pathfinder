# Implementation Plan: Unified Daily Resources & Dynamic Spell Slots

**Branch**: `003-unified-daily-resources` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-unified-daily-resources/spec.md`

## Summary

Optimizar y unificar la experiencia de gestión de recursos diarios:
1. Reemplazar la visualización estática de 9 niveles de conjuros por un cálculo dinámico (`getMaxActiveSpellLevel`) que solo muestre hasta el nivel más alto activo en uso.
2. Unificar en un componente común (`DailyResourcesTracker`) los espacios de conjuros y todos los rasgos/dotes con usos limitados diarios finitos, excluyendo los rasgos ilimitados.
3. Permitir la edición rápida de usos máximos para rasgos diarios y mantener la restauración al 100% durante el Descanso Largo.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`)

**Testing**: Vitest para pruebas unitarias de funciones de cálculo de nivel dinámico y actualización de usos máximos de rasgos

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Performance Goals**: Reducción del scroll en móviles en >50%; tiempos de respuesta < 100ms

**Constraints**: 100% Offline-First; botones con área mínima de 44x44px; cero dependencias pesadas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Operación 100% en el navegador sin llamadas remotas. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | Sincronización continua en LocalStorage y esquema v1.1.0 compatible. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | Compactación de niveles vacíos y botones de acción ergonómicos. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Tipado declarativo en todas las nuevas funciones de dominio. |
| **V. Integridad de Datos y Testing** | Lógica matemática pura desacoplada en Vitest | **PASS** | Cálculo dinámico y mutación de máximos testeados en `spells.test.ts` y `resources.test.ts`. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-unified-daily-resources/
├── plan.md              # Plan de implementación técnica
├── research.md          # Investigación y decisiones arquitectónicas
├── data-model.md        # Definición de operaciones de dominio
├── quickstart.md        # Guía de verificación end-to-end
├── contracts/           # Contratos de interfaces
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/                      # Lógica de dominio pura
│   ├── spells.ts                # Añadir getMaxActiveSpellLevel
│   ├── resources.ts             # Añadir updateResourceMaxUses, getLimitedTraits
│   ├── types.ts                 # Tipos existentes
│   └── backup.ts                # Esquema de respaldo
├── components/
│   ├── DailyResourcesTracker.tsx # Componente unificado: magia dinámica + rasgos diarios
│   ├── ResourceCard.tsx         # Tarjeta de catálogo con enlace a reglas
│   ├── ResourceList.tsx         # Catálogo general con filtros
│   ├── CharacterHeader.tsx      # Cabecera de perfil
│   ├── HealthTracker.tsx        # Monitor de PG
│   └── BackupModal.tsx          # Exportación/importación
├── App.tsx                      # Sustituir SpellSlotsTracker por DailyResourcesTracker
└── main.tsx                     # Bootstrap

tests/
├── domain/
│   ├── spells.test.ts           # Pruebas de cálculo de nivel dinámico
│   ├── resources.test.ts        # Pruebas de actualización de usos máximos de rasgos
│   └── backup.test.ts           # Pruebas de esquema de respaldo
```

## Complexity Tracking

> **Sin violaciones constitucionales.**
