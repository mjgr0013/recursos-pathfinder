# UI Contracts: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Feature**: `007-edit-traits-and-spells`
**Date**: 2026-10-28
**Status**: Draft

## 1. Estándares Ergonómicos y Hitbox Táctil

- **Área Táctil Mínima**: Conforme al Principio III de la Constitución de Recursos Pathfinder, todo elemento interactivo táctil (botón de editar detalles `✏️`, botón compacto `Ver más`, botones de acción de modal) DEBE contar con un área táctil mínima de `44px × 44px` (mediante clase `.touch-btn`).
- **Adaptabilidad a 360px**: La barra de herramientas de la tarjeta de recurso, el botón "Ver más" y los modales deben acomodarse armónicamente sin provocar scroll horizontal ni desbordamiento de contenido en pantallas compactas de 360px.

---

## 2. Contrato de Componente: `ResourceCard`

### 2.1 Botón de Enlace Externo "Ver más"
- **Renderizado condicional**: Solo se renderiza si `resource.url` está definido y es una cadena no vacía.
- **Estructura HTML**:
  ```tsx
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="touch-btn flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded transition-colors"
    title="Ver más (reglas oficiales en nueva pestaña)"
    aria-label={`Ver más información oficial sobre ${resource.name}`}
  >
    <span aria-hidden="true">🌐</span>
    <span>Ver más</span>
  </a>
  ```
- **Comportamiento**:
  - Al pulsar, abre la URL en una nueva pestaña sin bloquear la vista de la aplicación.
  - La etiqueta `"Ver más"` se muestra de forma compacta y visible.

### 2.2 Botón de Edición de Detalles
- **Ubicación**: En la barra de acciones de la tarjeta (junto a los botones de borrar y expandir reglas).
- **Elemento**:
  ```tsx
  <button
    type="button"
    onClick={() => setIsEditDetailsOpen(true)}
    className="text-slate-400 hover:text-amber-400 p-1 touch-btn"
    title="Editar detalles del recurso"
    aria-label={`Editar detalles de ${resource.name}`}
  >
    <span>✏️</span>
  </button>
  ```

### 2.3 Modal de Edición de Detalles (`EditDetailsModal`)
- **Estado Inicial**:
  - `urlInput`: inicializado con `resource.url || ''`.
  - `descriptionInput`: inicializado con `resource.description || ''`.
  - `urlError`: `null` | `string`.
- **Campos del Formulario**:
  1. **URL de Referencia**:
     - `label`: "URL de Documentación Oficial (opcional)"
     - `type="url"`
     - `maxLength={500}`
     - Placeholder: `"https://aonprd.com/..."`
  2. **Descripción de Reglas**:
     - `label`: "Descripción o reglas"
     - `<textarea rows={4} maxLength={4000}>`
     - Placeholder: `"Detalles de las reglas..."`
- **Acciones**:
  - **Cancelar**: Cierra el modal y restablece los inputs a los valores del recurso.
  - **Guardar**:
    - Si se ingresó una URL no vacía y no es válida (`!isValidHttpUrl(url)`): muestra mensaje de error sin cerrar el modal.
    - Si es válida o está vacía: invoca `onUpdateResourceDetails(resource.id, { url: cleanUrl, description: cleanDescription })` y cierra el modal.

---

## 3. Contrato de Componente: `DailyResourcesTracker`

### 3.1 Filas de Espacios de Magia y Rasgos Diarios
- **Clase del Contenedor**:
  ```tsx
  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80"
  ```
- **Contrato de Ancho**:
  - Tanto los contenedores de espacios de magia por nivel como los de rasgos limitados DEBEN incorporar `w-full`.
  - En la cuadrícula (`grid grid-cols-1 sm:grid-cols-2 gap-2`), cada fila ocupa el 100% del ancho de su respectiva celda, independientemente de la longitud del texto o del nombre del recurso.
  - El contenedor de texto interior debe conservar `min-w-0` y `truncate` para evitar que textos muy largos fuercen un ensanchamiento desproporcionado.

---

## 4. Contrato de Props y Callbacks

### 4.1 `ResourceCardProps`
```typescript
interface ResourceCardProps {
  resource: ResourceItem;
  spellSlots: SpellSlotsMap;
  onSpend: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onUpdateResourceMaxUses?: (id: string, newMax: number) => void;
  onUpdateResourceUses?: (id: string, newAvailable: number, newMax: number) => void;
  onUpdateResourceDetails?: (id: string, details: { url?: string; description: string }) => void;
}
```

### 4.2 `ResourceListProps`
```typescript
interface ResourceListProps {
  resources: ResourceItem[];
  spellSlots: SpellSlotsMap;
  onSpendResource: (id: string) => void;
  onRestoreResource: (id: string) => void;
  onDeleteResource: (id: string) => void;
  onAddResource: (newResource: ResourceItem) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onUpdateResourceMaxUses?: (id: string, newMax: number) => void;
  onUpdateResourceUses?: (id: string, newAvailable: number, newMax: number) => void;
  onUpdateResourceDetails?: (id: string, details: { url?: string; description: string }) => void;
}
```
