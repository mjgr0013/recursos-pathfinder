# Implementation Plan: Pathfinder Character Resource Tracker

**Branch**: `001-character-resource-tracker` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-character-resource-tracker/spec.md`

## Summary

Desarrollar una aplicación web SPA completamente estática (100% client-side para GitHub Pages) en React, TypeScript (`strict: true`) y Tailwind CSS para la gestión en tiempo real de recursos de personajes de Pathfinder. La arquitectura separa rigurosamente la lógica matemática en funciones de dominio puras (probadas con Vitest) de la capa visual táctil y ergonómica para móviles (≥360px, áreas táctiles ≥44x44px). La persistencia es totalmente offline mediante almacenamiento local (LocalStorage + IndexedDB/Canvas para avatares) y cuenta con respaldo y restauración de datos en formato JSON.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18/19, Tailwind CSS (v3/v4 via PostCSS/Vite), Vite (con `base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`) para estado del personaje + IndexedDB (`character_assets`) para blobs de avatar (con fallback a DataURL comprimido)

**Testing**: Vitest para pruebas unitarias de funciones de cálculo y validación

**Target Platform**: Navegadores web modernos en dispositivos móviles (resoluciones desde 360px en adelante) y escritorio; despliegue estático en GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática en el cliente

**Performance Goals**: Tiempo de respuesta a toques táctiles < 100ms; tiempo de arranque en frío < 1.5s en móvil; consumo de memoria por avatar < 100KB

**Constraints**: 100% Offline-First sin backend; cero dependencias pesadas externas para subida/procesamiento de imágenes; botones con área mínima de 44x44px

**Scale/Scope**: 1 personaje activo por sesión en vivo, soporte para decenas de conjuros/rasgos, importación/exportación JSON instantánea

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` para GitHub Pages | **PASS** | SPA estática distribuida en `dist/`; sin dependencias de red en runtime. |
| **II. Persistencia Local y Assets** | Offline-First, IndexedDB/LocalStorage, compresión de avatares, export/import JSON | **PASS** | Almacenamiento local híbrido y compresión en canvas nativo; export/import validado con JSON schema. |
| **III. Enfoque Mobile-First y UX Táctil** | Diseño desde 360px, uso a una mano, áreas táctiles ≥ 44x44px, feedback visual | **PASS** | Layout en tarjeta móvil única, hitboxes utilitarios de 44x44px en Tailwind, transiciones inmediatas. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind, Web APIs nativas | **PASS** | Tipado declarativo exhaustivo; FileReader y Canvas nativos sin librerías externas superfluas. |
| **V. Integridad de Datos y Testing** | Lógica matemática desacoplada en funciones puras, tests en Vitest | **PASS** | Módulo `src/domain/` aislado de componentes; 100% cubierto por pruebas unitarias automatizadas. |

*Resultado*: 5/5 compuertas aprobadas sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-character-resource-tracker/
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de decisiones técnicas (Phase 0)
├── data-model.md        # Definición de entidades, tipos y máquinas de estado (Phase 1)
├── quickstart.md        # Guía de validación y escenarios de prueba (Phase 1)
├── contracts/           # Contratos de interfaz y esquemas JSON (Phase 1)
│   ├── character-backup.schema.json
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de calidad de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/                      # Lógica de negocio y cálculo matemático pura (agnóstica a UI)
│   ├── types.ts                 # Tipos declarativos e interfaces de entidades Pathfinder
│   ├── health.ts                # Funciones puras de cálculo: daño (temp + actual), curación, límites
│   ├── resources.ts             # Funciones puras: gasto, recuperación y descanso largo
│   └── backup.ts                # Validación del esquema JSON y serialización/deserialización
├── storage/                     # Capa de persistencia local (Offline-First)
│   ├── local-storage.ts         # Persistencia reactiva/síncrona del estado del personaje
│   ├── avatar-storage.ts        # Compresión con Canvas nativo y persistencia en IndexedDB/DataURL
├── components/                  # Componentes de presentación (Mobile-First, Tailwind CSS)
│   ├── CharacterHeader.tsx      # Identidad del personaje, nivel, clase y avatar táctil
│   ├── HealthTracker.tsx        # PG actuales, máximos, temporales y botones de daño/curación
│   ├── ResourceCard.tsx         # Tarjeta de conjuro/rasgo, casillas de uso y descripción desplegable
│   ├── ResourceList.tsx         # Lista filtrable por categorías y modal para añadir recurso
│   ├── LongRestModal.tsx        # Diálogo modal de confirmación para descanso largo
│   └── BackupModal.tsx          # Modal para exportar e importar archivo JSON de respaldo
├── App.tsx                      # Orquestador del estado y layout móvil principal
├── main.tsx                     # Punto de entrada de React en el DOM
└── index.css                    # Directivas de Tailwind CSS y ajustes táctiles globales

tests/
├── domain/                      # Suite de pruebas unitarias automatizadas (Vitest)
│   ├── health.test.ts           # Pruebas de absorción de daño, sobrecuración y límites numéricos
│   ├── resources.test.ts        # Pruebas de gasto/recuperación de usos y descanso largo
│   └── backup.test.ts           # Pruebas de validación del esquema de respaldo JSON
```

**Structure Decision**: Se adopta una arquitectura de proyecto único (Single Project SPA) con estricta separación vertical: la lógica matemática y de reglas reside en `src/domain/` como funciones puras sin dependencias de React ni del DOM, garantizando máxima testeabilidad con Vitest y total cumplimiento de la Constitución.

## Complexity Tracking

> **Sin violaciones constitucionales.** No se requiere registro de excepciones ni complejidad accidental.
