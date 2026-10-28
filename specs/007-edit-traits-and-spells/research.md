# Research & Architectural Decisions: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Feature**: `007-edit-traits-and-spells`
**Date**: 2026-10-28
**Status**: Completed

## 1. Modal de Edición de URL y Descripción en Recursos

### Contexto del Problema
Actualmente, los recursos (`ResourceItem`), tanto conjuros como rasgos y dotes, solo pueden configurarse durante su creación mediante el modal en `ResourceList`. Una vez creados, el usuario únicamente puede modificar sus usos (disponibles y máximos) o eliminarlos. Si el jugador necesita corregir una errata en la descripción, añadir una regla aclaratoria o incluir la URL de Archives of Nethys o d20pfsrd, se ve obligado a borrar el recurso y volver a escribirlo, perdiendo el estado actual de usos y el orden en la lista.

### Decisión
1. **Función pura de dominio**:
   - Añadir en `src/domain/resources.ts` la función:
     ```typescript
     export interface UpdateResourceDetailsInput {
       url?: string;
       description: string;
     }

     export function updateResourceDetails(
       resources: ResourceItem[],
       id: string,
       details: UpdateResourceDetailsInput
     ): ResourceItem[]
     ```
   - La función sanitiza la URL (verificando `isValidHttpUrl`, aplicando `trim()` y truncando a 500 caracteres, o asignando `undefined` si está vacía) y la descripción (truncando a 4000 caracteres y recortando espacios sobrantes).
   - Retorna una nueva lista inmutable con el recurso actualizado, preservando estrictamente `id`, `name`, `category`, `usageMode`, `spellLevel`, `maxUses`, `availableUses` y `sortOrder`.
2. **Componente Modal**:
   - Incorporar en `ResourceCard` un botón de edición con icono `✏️` ("Editar detalles") situado en la barra de acciones de la tarjeta.
   - Al pulsarlo, se abre un diálogo modal accesible (`EditDetailsModal` o modal interno en `ResourceCard`) con:
     - Título indicando el nombre del recurso a editar.
     - Campo de entrada para URL (`type="url"`), con placeholder descriptivo.
     - Área de texto para la descripción (`<textarea rows={4}>`), con contador o límite de 4000 caracteres.
     - Mensaje de validación inmediato si la URL ingresada no es válida.
     - Botones "Guardar Cambios" y "Cancelar".
3. **Flujo de Estado**:
   - `App.tsx` implementa `handleUpdateResourceDetails(id: string, details: UpdateResourceDetailsInput)` que actualiza `characterState.resources` mediante la función de dominio pura y emite un toast de confirmación: `"Detalles actualizados"`.
   - Se propaga el callback hacia `ResourceList` y `ResourceCard`.

### Alternativas Consideradas
- **Edición inline en la propia tarjeta expandida**:
  - *Rechazado*: En pantallas móviles de 360px de ancho, convertir los campos de texto estáticos en inputs y textareas dentro del flujo de la tarjeta distorsiona la vista, confunde el modo lectura con el modo edición y dificulta la cancelación segura sin guardar. El usuario solicitó explícitamente un modal.
- **Permitir editar nombre, categoría o nivel**:
  - *Rechazado*: Modificar la categoría o nivel de conjuro alteraría la vinculación con los espacios globales de conjuros (`spellSlots`) y los contadores de rasgos diarios. Mantener inmutables estos campos asegura la consistencia de los datos.

---

## 2. Botón de Enlace Externo Compacto ("Ver más")

### Contexto del Problema
En `ResourceCard.tsx`, el botón de enlace externo a compendios oficiales mostraba:
```tsx
<a ...>
  <span>🌐</span>
  <span className="hidden xs:inline">Reglas Oficiales</span>
</a>
```
En dispositivos móviles compactos, la etiqueta "Reglas Oficiales" ocupa un espacio horizontal desproporcionado, provocando que la barra de acciones inferior se apretuje o fuerce saltos de línea indeseados en la tarjeta.

### Decisión
- Sustituir la etiqueta textual por `"Ver más"`.
- Aplicar una clase CSS más compacta (`text-[10px] px-1.5 py-0.5 rounded` con área táctil protegida vía clase de utilidad `.touch-btn`).
- Mantener el icono de enlace `🌐` para identificación visual instantánea.
- Configurar atributos de seguridad y accesibilidad: `target="_blank"`, `rel="noopener noreferrer"`, `title="Ver más (reglas oficiales en nueva pestaña)"` y `aria-label="Ver más información sobre {nombre}"`.

### Alternativas Consideradas
- **Mostrar únicamente el icono 🌐 sin texto**:
  - *Rechazado*: Aunque ahorraría aún más espacio, el usuario solicitó específicamente: "El botón de 'Reglas oficiales' quiero hacerlo más pequeño y que diga 'Ver más'". Incluir el texto corto "Ver más" mantiene una asequibilidad clara para jugadores no familiarizados con el icono.

---

## 3. Ocupación al 100% en Filas de "Recursos Diarios"

### Contexto del Problema
En `DailyResourcesTracker.tsx`, las filas individuales para espacios de conjuros y para rasgos con usos diarios tienen la clase:
`flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80`
En CSS Grid (`grid-cols-1 sm:grid-cols-2 gap-2`), si la fila no cuenta con `w-full` explícito o si su contenido interior (como nombres muy cortos como "Ira") no fuerza el ancho, los elementos de flexbox pueden ajustarse al contenido o no distribuirse homogéneamente en ciertos motores de renderizado móvil, luciendo asimétricos frente a filas con textos más largos.

### Decisión
- Modificar explícitamente las clases de ambos elementos en `DailyResourcesTracker.tsx`:
  - En la lista de espacios de conjuros dinámicos:
    ```tsx
    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80"
    ```
  - En la lista de rasgos de uso limitado:
    ```tsx
    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80"
    ```
- Asegurar que el contenedor padre (`grid`) no tenga interferencias de alineación cruzada y que los contenedores hijos internos con texto (`min-w-0 pr-2`) truncen adecuadamente sin comprimir el bloque de contador y botón de edición.

### Alternativas Consideradas
- **Cambiar el layout de grid a flex-column**:
  - *Rechazado*: En pantallas de tablet o escritorio (`sm:`), el diseño de 2 columnas aprovecha óptimamente el espacio disponible. Añadir `w-full` a cada tarjeta resuelve el problema sin alterar la grilla responsive.
