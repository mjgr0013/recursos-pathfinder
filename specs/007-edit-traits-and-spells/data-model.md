# Data Model & State Transitions: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Feature Branch**: `007-edit-traits-and-spells`
**Date**: 2026-10-28

## Entities & Value Objects

### 1. ResourceItem (Conjuro o Rasgo / Dote)

Representa un recurso del personaje, ya sea un conjuro o un rasgo/dote de clase, con sus metadatos de reglas, referencia web y estado de uso.

| Campo | Tipo | Invariante / Restricción | Estado en Edición de Detalles | Descripción |
|---|---|---|---|---|
| `id` | `string` | UUID o identificador único inmutable | Inmutable | Identificador del recurso |
| `name` | `string` | 1..80 caracteres | Inmutable | Nombre del conjuro o rasgo |
| `category` | `'spell' \| 'feat_trait'` | Categoría fija | Inmutable | Tipo de recurso |
| `usageMode` | `'limited' \| 'unlimited'` | Modo de uso fijo | Inmutable | Con o sin usos finitos |
| `spellLevel` | `number \| null` | Entero entre 0 y 9 para conjuros | Inmutable | Nivel de conjuro |
| `url` | `string \| undefined` | URL con protocolo `http:` o `https:` (≤500 chars) o `undefined` | **Editable** | Enlace web a compendios oficiales |
| `description` | `string` | Texto (0..4000 chars) | **Editable** | Explicación detallada de reglas y efectos |
| `maxUses` | `number \| null` | Entero ≥ 1 o null | Inmutable | Límite diario de usos |
| `availableUses` | `number \| null` | 0 ≤ available ≤ maxUses | Inmutable | Usos disponibles actuales |
| `sortOrder` | `number` | Entero ≥ 0 | Inmutable | Orden de presentación |

---

## Operación de Dominio: `updateResourceDetails`

```typescript
export interface UpdateResourceDetailsInput {
  url?: string;
  description: string;
}

export function updateResourceDetails(
  resources: ResourceItem[],
  id: string,
  details: UpdateResourceDetailsInput
): ResourceItem[];
```

### Reglas de Transformación y Sanitización
1. **URL**:
   - Si `details.url` contiene una cadena no vacía:
     - Se valida mediante `isValidHttpUrl(details.url)`.
     - Si es válida: se limpia con `.trim().slice(0, 500)`.
     - Si no es válida o está vacía: se normaliza a `undefined`.
2. **Descripción**:
   - Se toma el valor recibido, se recorta hasta 4000 caracteres (`.slice(0, 4000)`).
3. **Inmutabilidad**:
   - Devuelve un nuevo arreglo donde el elemento con identificador coincidente se actualiza con los campos limpios de `url` y `description`, conservando intactos todos los demás campos.
   - Si el identificador no existe en la colección, retorna una copia superficial sin alteraciones.

---

## Flujo y Transiciones de Estado

### Ciclo de Edición de Detalles en Modal

```
               [Tarjeta de Catálogo (ResourceCard)]
                                │
                 Pulsar botón de editar (✏️)
                                │
                                ▼
         [Apertura de Modal "Editar Detalles"]
         ┌──────────────────────────────────────┐
         │ URL:         [ input url / vacío ]   │
         │ Descripción: [ textarea reglas... ] │
         └──────────────────────────────────────┘
                     │                     │
           Pulsar "Guardar"        Pulsar "Cancelar"
                     │                     │
                     ▼                     ▼
          [Validación de URL]      [Cierre de Modal]
             ├─ Inválida: error     (Sin cambios en estado)
             └─ Válida o vacía
                     │
                     ▼
         [updateResourceDetails]
                     │
                     ▼
       [Persistencia en LocalStorage]
                     │
                     ▼
     [Actualización Reactiva de la UI]
  - Botón "Ver más" se actualiza u oculta
  - Descripción en vista expandida se refresca
  - Toast de confirmación "Detalles actualizados"
```

---

## Modelo de Renderizado en Fila de "Recursos Diarios"

Para cada elemento hijo en el panel `DailyResourcesTracker`:

| Elemento | Clases Previas | Clases Actualizadas | Efecto Visual |
|---|---|---|---|
| Fila Espacio de Magia | `flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80` | `w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80` | Ocupa el 100% del ancho de su columna de cuadrícula |
| Fila Rasgo Diario | `flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80` | `w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80` | Ocupa el 100% del ancho de su columna de cuadrícula |
