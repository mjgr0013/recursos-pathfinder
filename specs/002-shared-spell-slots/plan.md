# Implementation Plan: Shared Spell Slots by Level & Documentation URL

**Branch**: `002-shared-spell-slots` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-shared-spell-slots/spec.md`

## Summary

Evolucionar el gestor de recursos de Pathfinder para dar soporte nativo al sistema de magia oficial:
1. Implementar espacios de conjuro compartidos por nivel (niveles 1 al 9) administrados desde un panel global (`SpellSlotsTracker`) y vinculados al consumo en las tarjetas individuales de conjuros.
2. Incorporar el campo opcional `url` en conjuros y rasgos con apertura segura (`noopener,noreferrer`) hacia compendios externos.
3. Actualizar la lógica de dominio puro (`src/domain/spells.ts`, `src/domain/resources.ts`, `src/domain/backup.ts`) probada al 100% con Vitest y con migración transparente para archivos JSON v1.0.0.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`) con migración de esquema v1.0.0 -> v1.1.0

**Testing**: Vitest para pruebas unitarias de funciones de cálculo de espacios, mutaciones y validación de esquemas

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Performance Goals**: Sincronización reactiva del consumo de slots en menos de 100ms; cero latencia de red

**Constraints**: 100% Offline-First; botones con área mínima de 44x44px; cero dependencias pesadas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Operación completa en el navegador, sin llamadas externas obligatorias. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | `SpellSlotsMap` persistido en LocalStorage y versionado en backup v1.1.0. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | Controles ergonómicos de espacios de conjuro adaptados al uso en smartphone. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Nuevos tipos e interfaces declarativos en `src/domain/types.ts`. |
| **V. Integridad de Datos y Testing** | Lógica matemática pura desacoplada en Vitest | **PASS** | Módulo de espacios de conjuro probado unitariamente sin acoplamiento a React. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/002-shared-spell-slots/
├── plan.md              # Plan de implementación técnica
├── research.md          # Investigación y decisiones arquitectónicas
├── data-model.md        # Definición de tipos y entidades
├── quickstart.md        # Guía de verificación end-to-end
├── contracts/           # Contratos de interfaces y esquemas
│   ├── character-backup-v1.1.schema.json
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/                      # Lógica de dominio pura
│   ├── types.ts                 # Tipos actualizados con SpellSlotLevel, SpellSlotsMap y url
│   ├── spells.ts                # Operaciones puras: spendSpellSlot, restoreSpellSlot, updateMaxSlots
│   ├── health.ts                # Lógica de salud existente
│   ├── resources.ts             # Adaptación de recursos para asociar conjuros a spellSlots
│   └── backup.ts                # Validador y migrador v1.0.0 a v1.1.0
├── storage/
│   ├── local-storage.ts         # Adaptación de carga por defecto con spellSlots inicializados
│   └── avatar-storage.ts        # Procesador de avatar
├── components/
│   ├── SpellSlotsTracker.tsx    # Panel táctil de gestión de espacios de nivel 1 al 9
│   ├── ResourceCard.tsx         # Tarjeta actualizada con contador de nivel y enlace URL
│   ├── ResourceList.tsx         # Modal de conjuro con selector de nivel y campo URL
│   ├── CharacterHeader.tsx      # Cabecera de perfil
│   ├── HealthTracker.tsx        # Monitor de PG
│   ├── LongRestModal.tsx        # Modal de descanso largo
│   └── BackupModal.tsx          # Exportación/importación v1.1.0
├── App.tsx                      # Orquestador del estado y vistas
├── main.tsx                     # Bootstrap
└── index.css                    # Estilos Tailwind

tests/
├── domain/
│   ├── spells.test.ts           # Pruebas unitarias para cálculo y mutación de spell slots
│   ├── health.test.ts           # Pruebas existentes
│   ├── resources.test.ts        # Pruebas de recursos actualizadas
│   └── backup.test.ts           # Pruebas de esquema v1.1.0 y migración desde v1.0.0
```

## Complexity Tracking

> **Sin violaciones constitucionales.**
