# Research & Technical Decisions: Pathfinder Character Resource Tracker

**Feature**: `001-character-resource-tracker`  
**Date**: 2026-10-15  
**Status**: Resolved  

## Research Topics & Decisions

---

### 1. Client-Side Persistence Architecture (Offline-First)

- **Context**: The application must be 100% client-side (hosted on GitHub Pages) and function completely offline. It needs to persist character stats, resource lists, and an avatar image.
- **Decision**: Hybrid Web Storage Architecture:
  - **LocalStorage**: Stores the character JSON metadata, health state, and resource collection under a single key (`pathfinder_character_v1`). LocalStorage provides synchronous, instant hydration on app mount and atomic saves.
  - **IndexedDB**: Stores avatar image blobs/DataURLs in an object store (`character_assets`) to prevent exceeding LocalStorage's typical 5MB quota limit.
  - **Fallback**: If IndexedDB fails or is disabled in private browsing, compressed thumbnail DataURLs (<100KB) can be stored inline in LocalStorage.
- **Rationale**: Keeps application state hydration immediate and synchronous while keeping heavy binary data separate in IndexedDB, completely complying with Constitution Principles I & II.
- **Alternatives Considered**:
  - *IndexedDB only*: Requires asynchronous database opening before first render, adding loading spinners and potential flicker.
  - *LocalStorage only with raw Base64 avatars*: Raw high-res images quickly hit the 5MB browser quota and throw `QuotaExceededError`.

---

### 2. Client-Side Avatar Processing & Compression (Native Web APIs)

- **Context**: Users upload avatar pictures from mobile phones or desktops which can easily be 5MB–20MB. Constitution Principle IV prohibits heavy external libraries (e.g., `browser-image-compression`, `pica`).
- **Decision**: Native HTML5 `FileReader` + `<canvas>` 2D context pipeline:
  1. Read file with `FileReader.readAsDataURL()`.
  2. Load into an `Image` object.
  3. Scale down proportionally to a maximum bounding box of 300x300 pixels (standard mobile avatar resolution).
  4. Draw onto an offscreen canvas and export via `canvas.toDataURL('image/webp', 0.82)` (with `image/jpeg` fallback if WebP is unsupported).
  5. The resulting compressed asset is ~20KB–50KB.
- **Rationale**: Completely dependency-free, instant execution, zero bundle size overhead, compliant with Constitution Principles II & IV.
- **Alternatives Considered**:
  - *Third-party npm packages (`compressorjs`, `browser-image-compression`)*: Adds unnecessary bundle weight and external maintenance risk.
  - *No client-side downscaling*: Severe memory exhaustion and browser storage quota failures.

---

### 3. Pure Mathematical Health & Resource Calculation Engine

- **Context**: Combat in Pathfinder requires calculating damage, temporary HP absorption, overhealing caps, and resource usage. Constitution Principle V mandates decoupling math calculations into pure functions tested via Vitest.
- **Decision**: Immutable Pure Functions in a dedicated domain module (`src/domain/health.ts` and `src/domain/resources.ts`):
  - `applyDamage(health: HealthRecord, amount: number): HealthRecord`:
    - First subtracts from `tempHp`: `absorbed = min(health.tempHp, amount)`.
    - Remaining damage `rem = amount - absorbed` is subtracted from `currentHp`: `max(0, health.currentHp - rem)`.
  - `applyHealing(health: HealthRecord, amount: number): HealthRecord`:
    - Increases `currentHp` bounded strictly: `min(health.maxHp, health.currentHp + amount)`. Does not modify `tempHp`.
  - `spendResource(resource: ResourceItem): ResourceItem`:
    - For limited resources, `availableUses = max(0, resource.availableUses - 1)`. No-op for unlimited resources.
  - `restoreResource(resource: ResourceItem): ResourceItem`:
    - For limited resources, `availableUses = min(resource.maxUses, resource.availableUses + 1)`.
  - `applyLongRest(characterState: CharacterState): CharacterState`:
    - Resets all limited resources to `maxUses`.
    - Resets `tempHp` to 0.
- **Rationale**: Eliminates side effects, makes state updates 100% predictable, and enables exhaustive, deterministic testing in Vitest without mocking UI or DOM.
- **Alternatives Considered**:
  - *In-component state mutators*: Tightly couples math with React rendering, violating Constitution Principle V.

---

### 4. Character Backup File Format & Schema Validation

- **Context**: The application must export and import character data as JSON. Imported files might be corrupt, edited manually, or from future/past versions.
- **Decision**: Self-describing Versioned JSON with Native Lightweight Schema Validator:
  - Top-level metadata: `schemaVersion: "1.0.0"`, `exportedAt: ISOString`.
  - Pure validation function `validateBackupPayload(data: unknown): ValidationResult` checking:
    - Presence and types of `character`, `health`, and `resources`.
    - Bounds checking: `currentHp <= maxHp`, `level >= 1`, valid enums (`limited` | `unlimited`, `spell` | `feat_trait`).
    - Avatar inclusion as embedded compressed DataURL for self-contained portability.
- **Rationale**: No heavy validation dependencies (e.g. `ajv` or `joi`) needed. Simple, readable, fast, and completely portable across devices.
- **Alternatives Considered**:
  - *JSON Schema validator libraries (`ajv`)*: Adds 50KB+ to the client bundle for a straightforward data shape. Native TS type guards and runtime checkers are lighter and zero-dependency.

---

### 5. Mobile-First Ergonomics & Touch Target Standards

- **Context**: Constitution Principle III requires mobile-first design (≥360px) and touch targets ≥44x44px with immediate visual feedback for live tabletop gaming.
- **Decision**: Tailwind CSS utility design tokens:
  - Interactive buttons (damage, heal, spend, recover, long rest) use `min-h-[44px] min-w-[44px]` with flex centering.
  - Touch feedback using CSS active states: `active:scale-95 transition-transform duration-75` and haptic/visual color flashes.
  - Single-column card layout on mobile (`w-full max-w-md mx-auto p-3`) with collapsible description drawers to avoid cluttering screen real estate during combat encounters.
- **Rationale**: Ensures fingers can tap counters reliably without accidental mis-clicks during intense game sessions.
- **Alternatives Considered**:
  - *Standard desktop table layout*: Unusable on 360px smartphone screens, requires constant horizontal pinching and scrolling.

---

### 6. Build & Bundling Setup (GitHub Pages Compatibility)

- **Context**: Constitution Principle I requires Vite configuration with relative base (`base: './'`) for flawless deployment to GitHub Pages subdirectories.
- **Decision**: Standard Vite + React + TypeScript configuration:
  - `vite.config.ts` sets `base: './'`.
  - Output to `dist/` containing solely static HTML, JS, CSS, and favicon.
  - Zero server runtime.
- **Rationale**: Can be served by any static host (GitHub Pages, Netlify, local file preview, offline browser).
