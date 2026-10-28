# Implementation Plan: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Branch**: `007-edit-traits-and-spells` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-edit-traits-and-spells/spec.md`

## Summary

Esta funcionalidad resuelve tres mejoras ergonómicas y funcionales clave en la gestión de recursos y la interfaz táctil:
1. **Edición de URL y descripción en modal**: Permitir a los jugadores editar en cualquier momento la URL de compendio oficial y el texto explicativo de reglas de cualquier conjuro o rasgo/dote a través de un diálogo modal dedicado, sin tener que eliminar ni recrear el recurso.
2. **Botón "Ver más" compacto**: Reemplazar la etiqueta "Reglas Oficiales" por "Ver más" en el botón de enlace externo de la tarjeta de recurso, reduciendo su tamaño para optimizar el espacio horizontal en pantallas móviles sin perder el área táctil mínima de 44x44px.
3. **Ancho al 100% en filas de Recursos Diarios**: Asegurar que cada caja contenedora de espacios de magia y rasgos limitados en el panel de Recursos Diarios (`flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80`) tenga la clase `w-full` para ocupar el 100% del ancho disponible en su columna de rejilla, evitando asimetrías visuales dependientes de la longitud del texto.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true`)

**Primary Dependencies**: React 18, Tailwind CSS, Vite (`base: './'`)

**Storage**: LocalStorage (`pathfinder_character_v1`)

**Testing**: Vitest (`tests/domain/`)

**Target Platform**: Navegadores web modernos, diseño mobile-first (≥360px), GitHub Pages

**Project Type**: Single Page Application (SPA) 100% estática client-side

**Constraints**: 100% Offline-First; botones con área táctil mínima de 44x44px; cero librerías pesadas externas; funciones puras de dominio desacopladas y testeadas

## Constitution Check

| Principio Constitucional | Requisito / Restricción | Estado | Justificación |
|---|---|---|---|
| **I. Arquitectura 100% Client-Side** | Estático, sin backend, Vite `base: './'` | **PASS** | Todas las operaciones ocurren en el navegador del cliente sin llamadas a APIs ni servidores. |
| **II. Persistencia Local y Assets** | Almacenamiento local, export/import JSON | **PASS** | Las modificaciones en `url` y `description` se persisten inmediatamente en LocalStorage y se exportan/importan de forma transparente en el JSON de backup. |
| **III. Enfoque Mobile-First y UX Táctil** | Viewports ≥360px, áreas táctiles ≥44x44px | **PASS** | El botón "Ver más" optimiza el espacio horizontal en móviles; el botón de edición y los controles del modal cumplen con el estándar táctil de 44x44px. |
| **IV. Stack Ligero y Tipado Estricto** | TypeScript `strict: true`, React + Tailwind | **PASS** | Se utilizan tipos estrictos (`UpdateResourceDetailsInput`), sin dependencias adicionales de terceros. |
| **V. Integridad de Datos y Testing** | Lógica desacoplada en Vitest | **PASS** | La sanitización y mutación inmutable de detalles (`updateResourceDetails`) se implementa como función pura desacoplada con cobertura de pruebas unitarias exhaustivas en Vitest. |

*Resultado*: 5/5 compuertas aprobadas sin excepciones ni advertencias.

## Project Structure

### Documentation (this feature)

```text
specs/007-edit-traits-and-spells/
├── spec.md              # Especificación funcional
├── plan.md              # Este plan de implementación técnica
├── research.md          # Decisiones arquitectónicas y de investigación
├── data-model.md        # Entidades, sanitización y transiciones de estado
├── quickstart.md        # Guía de verificación end-to-end y pruebas
├── contracts/           # Contratos de componentes UI
│   └── ui-contracts.md
└── checklists/
    └── requirements.md  # Checklist de validación de requisitos
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── resources.ts              # Añadir updateResourceDetails y UpdateResourceDetailsInput
│   └── types.ts                  # Verificar / reexportar tipos necesarios si aplica
├── components/
│   ├── DailyResourcesTracker.tsx # Añadir w-full a las filas de magia y rasgos diarios
│   ├── ResourceCard.tsx          # Botón ✏️ de edición, modal de edición de URL/descripción, botón "Ver más" compacto
│   └── ResourceList.tsx          # Propagación del callback onUpdateResourceDetails
└── App.tsx                       # Handler handleUpdateResourceDetails con toast reactivo

tests/
└── domain/
    └── resources.test.ts         # Tests unitarios para updateResourceDetails (URL válida/inválida, longitud, inmutabilidad)
```

## Complexity Tracking

> **Sin violaciones constitucionales.** La solución reutiliza los patrones establecidos de modales, persistencia y funciones puras de dominio sin introducir ninguna nueva librería ni alterar los contratos existentes de backup.
