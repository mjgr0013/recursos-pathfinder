# Feature Specification: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Feature Branch**: `007-edit-traits-and-spells`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Los rasgos y los conjuros no se pueden editar una vez se crean, la url y la descripción de seben de poder editar en un modal. El botón de "Reglas oficiales" quiero hacerlo más pequeño y que diga "Ver más". El div que guarda los conjuros o rasgos en la sección de "Recursos diarios" quiero qoe ocupe el 100%, que no dependa del contenido del div, es este: flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edición de URL y Descripción en Modal (Priority: P1)

Como jugador de Pathfinder que gestiona su ficha de personaje,
quiero poder editar la URL de referencia y la descripción de cualquier rasgo o conjuro existente a través de una ventana modal,
para corregir errores, añadir enlaces a compendios oficiales o ampliar detalles de reglas sin tener que eliminar y volver a crear el recurso desde cero.

**Why this priority**: Actualmente los recursos son inmutables una vez creados en cuanto a sus datos descriptivos y enlaces. Si el usuario comete un error tipográfico o encuentra el enlace oficial a posteriori, debe borrar el recurso y reintroducirlo, perdiendo la configuración de usos y el orden. Poder editar estos campos es una necesidad operativa fundamental.

**Independent Test**: Abrir la tarjeta de cualquier conjuro o rasgo existente, pulsar el botón de edición para abrir el modal, modificar la URL y el texto de la descripción, pulsar "Guardar" y verificar que la tarjeta refleja inmediatamente los nuevos datos y estos persisten tras recargar el navegador.

**Acceptance Scenarios**:

1. **Given** un conjuro o rasgo registrado en la lista de recursos, **When** el usuario pulsa el botón de edición en su tarjeta, **Then** se abre un diálogo modal pre-poblado con la URL y la descripción actuales del recurso.
2. **Given** el modal de edición abierto con cambios en la URL o descripción, **When** el usuario pulsa "Guardar Cambios", **Then** el recurso actualiza sus datos en el estado del personaje, el modal se cierra y los cambios se guardan localmente.
3. **Given** el modal de edición abierto con cambios sin guardar, **When** el usuario pulsa "Cancelar" o cierra el modal, **Then** los cambios se descartan y el recurso conserva sus valores originales sin alteración.
4. **Given** un recurso con una URL existente, **When** el usuario elimina el texto del campo URL en el modal de edición y guarda, **Then** el recurso queda sin URL asociada y el botón de enlace externo deja de mostrarse en su tarjeta.

---

### User Story 2 - Botón de Enlace Externo Compacto con Etiqueta "Ver más" (Priority: P2)

Como jugador en sesión de juego móvil,
quiero que el botón de acceso al compendio oficial sea más compacto y muestre la etiqueta "Ver más",
para que la tarjeta del recurso aproveche mejor el espacio horizontal y no desborde ni compita visualmente con los botones de acción en pantallas pequeñas.

**Why this priority**: En pantallas táctiles móviles, los textos largos como "Reglas Oficiales" ocupan demasiado ancho o fuerzan saltos de línea indeseados en la barra de herramientas de la tarjeta. Cambiar a "Ver más" con un estilo visual más compacto optimiza el layout conservando la claridad y la accesibilidad táctil.

**Independent Test**: Visualizar una tarjeta de recurso que posea una URL configurada y comprobar que el botón muestra "Ver más", tiene un tamaño más compacto y al pulsarse abre el enlace en una pestaña nueva.

**Acceptance Scenarios**:

1. **Given** un recurso que contiene una URL válida, **When** se visualiza su tarjeta en el catálogo, **Then** se muestra un botón compacto con icono de enlace y el texto "Ver más" en lugar de "Reglas Oficiales".
2. **Given** el botón "Ver más", **When** el usuario interactúa con él, **Then** se abre la URL correspondiente en una nueva pestaña del navegador mediante navegación segura (`target="_blank" rel="noopener noreferrer"`).
3. **Given** un recurso sin URL asignada, **When** se visualiza su tarjeta, **Then** el botón "Ver más" no se renderiza.

---

### User Story 3 - Ancho Completo (100%) para Elementos de Recursos Diarios (Priority: P3)

Como jugador consultando el panel superior de "Recursos Diarios",
quiero que cada fila o tarjeta de recurso (espacio de conjuro o rasgo de uso limitado) ocupe siempre el 100% del ancho disponible en su contenedor,
para disfrutar de una interfaz visualmente equilibrada, uniforme y alineada independientemente de si el nombre del recurso es corto o largo.

**Why this priority**: La uniformidad visual en el resumen de recursos diarios agiliza la lectura durante los turnos de combate. Si una caja se encoge o varía su tamaño dependiendo del texto interno, se produce asimetría y distracción.

**Independent Test**: Abrir la sección de "Recursos diarios" con rasgos de diferente longitud de nombre y verificar que todas las cajas de recurso (`flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80`) ocupan el 100% del ancho de su columna/celda.

**Acceptance Scenarios**:

1. **Given** el panel de Recursos Diarios con espacios de magia y/o rasgos diarios activos, **When** se visualizan las filas de recursos, **Then** cada caja de recurso tiene un ancho del 100% (`w-full`) respecto a su contenedor o celda de rejilla.
2. **Given** un rasgo con un nombre muy corto (ej. "Ira") y otro con un nombre largo (ej. "Canalizar Energía Positiva"), **When** se renderizan en el panel de Recursos Diarios, **Then** ambas tarjetas tienen exactamente el mismo ancho total ocupando el 100% de la celda.

---

### Edge Cases

- **URL con formato inválido en la edición**: Si el usuario introduce una cadena que no corresponde a una URL HTTP/HTTPS válida, el modal debe impedir el guardado o marcar el error para asegurar que solo se persistan URLs válidas (o vacías si se desea eliminar el enlace).
- **Descripción vacía**: Si el usuario borra toda la descripción y guarda, el recurso debe aceptarlo válidamente almacenando una cadena vacía, y la tarjeta no debe romper su diseño al expandir o colapsar.
- **Descripción extensa**: Si el texto de la descripción alcanza el límite permitido (hasta 4000 caracteres), el área de texto del modal debe permitir edición cómoda con scroll y la tarjeta debe mostrar el texto sin desbordar el contenedor.
- **Cierre accidental del modal**: Si el usuario pulsa fuera o presiona cancelar, los cambios no confirmados deben descartarse sin mutar el estado global del personaje.
- **Recursos en Recursos Diarios sin magia o sin rasgos**: Si no hay elementos en la sección, se mantiene el mensaje explicativo sin aplicar estilos que rompan el contenedor general.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proporcionar un botón o disparador accesible de edición en la tarjeta de cada recurso (conjuro o rasgo/dote) en el catálogo.
- **FR-002**: Al pulsar el botón de edición, el sistema DEBE abrir un diálogo modal centrado dedicado exclusivamente a la edición del recurso seleccionado.
- **FR-003**: El modal de edición DEBE inicializarse con los datos existentes del recurso: campo de texto para URL y área de texto para descripción.
- **FR-004**: El modal de edición DEBE proporcionar botones visibles para "Guardar Cambios" y "Cancelar".
- **FR-005**: Al confirmar el guardado, el sistema DEBE actualizar la URL y la descripción del recurso en el estado del personaje y persistirlos en el almacenamiento local de forma inmediata.
- **FR-006**: Si se introduce una URL en el modal de edición, el sistema DEBE validar que comience con protocolo `http://` o `https://`. Si no es válida, no debe permitir el guardado y debe alertar al usuario. Si el campo está vacío, debe limpiar la URL del recurso.
- **FR-007**: Si el usuario cancela o cierra el modal, el sistema NO DEBE modificar ni persistir ningún dato del recurso.
- **FR-008**: En la tarjeta de recurso, el botón de enlace externo DEBE mostrar la etiqueta "Ver más" (sustituyendo a "Reglas Oficiales") junto al icono de enlace.
- **FR-009**: El botón "Ver más" DEBE tener un estilo visual más compacto y reducido, manteniendo un área táctil mínima accesible de 44x44px conforme a la constitución del proyecto y abriendo el enlace en una pestaña nueva (`target="_blank" rel="noopener noreferrer"`).
- **FR-010**: En la sección de "Recursos diarios", cada contenedor de fila de recurso (con clases base `flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80`) DEBE extenderse al 100% del ancho disponible (`w-full`), independientemente de la longitud de su contenido textual interior.

### Key Entities *(include if feature involves data)*

- **ResourceItem**: Entidad que representa un conjuro, rasgo o dote.
  - `id`: Identificador único inmutable.
  - `name`: Nombre del recurso (se conserva intacto en esta operación).
  - `category`: Tipo de recurso (`spell` o `feat_trait`, conservado intacto).
  - `usageMode`: Modo de uso (`limited` o `unlimited`, conservado intacto).
  - `spellLevel`: Nivel de conjuro del 0 al 9 si aplica (conservado intacto).
  - `url`: Enlace web opcional a la referencia oficial (campo editable en el modal).
  - `description`: Texto descriptivo con las reglas, tiradas o efectos (campo editable en el modal).
  - `sortOrder`: Orden de visualización en la colección.
- **DailyResourceRow**: Elemento contenedor visual en el panel de recursos diarios para espacios de conjuros y rasgos limitados, que debe presentar un ancho del 100% de manera estricta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden editar y guardar la URL y descripción de cualquier recurso existente en menos de 10 segundos sin tener que recrear el recurso ni perder su estado.
- **SC-002**: El 100% de las ediciones guardadas persisten en el almacenamiento local y se preservan al recargar la aplicación o exportar la ficha en formato JSON.
- **SC-003**: El botón de enlace externo en la tarjeta del recurso muestra la etiqueta "Ver más" y reduce su ancho ocupado en la tarjeta de recurso en al menos un 20% respecto a la versión anterior.
- **SC-004**: En la sección de Recursos Diarios, el 100% de las cajas de recursos ocupan el 100% del ancho disponible en su columna o fila, garantizando un alineamiento simétrico y homogéneo.
- **SC-005**: El 100% de las acciones de cancelación en el modal de edición descartan las modificaciones sin alterar los datos del personaje.

## Assumptions

- La edición de recursos mediante este modal se enfoca específicamente en los campos `url` y `description`, tal como solicitó el usuario, dejando el nombre, tipo, nivel de magia y modo de uso fijos para evitar inconsistencias con los contadores y espacios globales de conjuros ya asignados.
- La validación de URL sigue la regla estándar del proyecto: protocolos válidos `http://` o `https://`, con un límite máximo de 500 caracteres, permitiendo también dejar el campo vacío para retirar un enlace previo.
- La descripción permite hasta 4000 caracteres como en el modal de creación de recursos.
- El botón "Ver más" mantiene el icono del globo terráqueo (`🌐`) como indicador visual intuitivo de enlace externo.
- En la sección de "Recursos diarios", la rejilla responsive (1 columna en móvil estrecho, 2 columnas a partir de breakpoint `sm`) se mantiene, asegurando que cada elemento hijo tenga la clase `w-full` para llenar completamente su cuadrícula.
