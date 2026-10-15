# Feature Specification: Hide Empty Traits & Flexible Resource Editing

**Feature Branch**: `006-hide-empty-traits`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "la información de los rasgos en los recursos diarios debe desaparecer hasta que se añada alguno, al igual que esta con los conjuros. También los botones de -1 y +1 en los rasgos deben desaparecer, dejando solamente el botón de "Usar". En el resumen de recursos diatios también deben desaparecer los botones de -1 y +1, dejando solamente el lapiz, como en los conjuros. El botón de editar los espacios de rasgos o conjuros debe dejar modificar los máximos y los actuales, por si hay un error al quitar un actual poder subsanarlo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ocultar información de rasgos en la cabecera cuando no hay rasgos con usos diarios (Priority: P1)

Como jugador de Pathfinder que no tiene rasgos o dotes de uso diario limitado (por ejemplo, un personaje que solo usa conjuros, un guerrero sin dotes activas con usos diarios, o un personaje recién creado), quiero que el panel de recursos diarios no muestre el contador ni la etiqueta de "Rasgos: 0/0" mientras no posea ningún rasgo de uso limitado activo, de manera que la cabecera muestre únicamente la información relevante de los recursos que realmente tengo (exactamente igual a cómo se comportan los espacios de conjuro) sin sobrecargar la pantalla móvil con contadores innecesarios a cero.

**Why this priority**: Es la necesidad principal de diseño visual y coherencia. Elimina ruido visual en pantallas móviles pequeñas y garantiza simetría con el comportamiento existente de los espacios de conjuros, los cuales ya se ocultan por completo si el personaje no tiene conjuros activos.

**Independent Test**: Puede probarse creando o seleccionando un personaje que posea conjuros activos pero ningún rasgo con usos diarios limitados. Verificar que en el subtítulo de la cabecera del panel de "Recursos Diarios" únicamente aparece el contador de magia (`Magia: X/Y`), sin mostrar el separador (`•`) ni el texto `Rasgos: 0/0`.

**Acceptance Scenarios**:

1. **Given** un personaje con conjuros activos de nivel 1 o superior y sin ningún rasgo con usos limitados, **When** el usuario visualiza el panel de Recursos Diarios, **Then** el resumen de la cabecera muestra exclusivamente el contador de espacios de magia (`Magia: X/Y`) y oculta totalmente cualquier mención a rasgos.
2. **Given** un personaje sin conjuros de nivel 1 o superior y sin ningún rasgo con usos limitados, **When** el usuario visualiza el panel de Recursos Diarios, **Then** el resumen de la cabecera muestra un mensaje limpio de ausencia de recursos ("Sin recursos diarios activos") en lugar de mostrar contadores a cero (`0/0`).
3. **Given** un personaje con al menos un rasgo limitado activo y sin magia, **When** el usuario visualiza el panel, **Then** el resumen muestra exclusivamente el contador de rasgos (`Rasgos: A/B`), sin separadores ni prefijos residuales.
4. **Given** un personaje con tanto magia activa como rasgos limitados activos, **When** el usuario visualiza el panel, **Then** ambos resúmenes aparecen armoniosamente separados (`Magia: X/Y • Rasgos: A/B`).

---

### User Story 2 - Homogeneización de filas de recursos diarios (Solo Lápiz, sin botones -1/+1) (Priority: P2)

Como jugador que consulta el panel de recursos diarios, quiero que las filas de rasgos y dotes tengan el mismo diseño despejado y limpio que las filas de espacios de conjuro, mostrando el nombre del recurso, su contador numérico y el botón de edición con lápiz, eliminando los botones de "-1" y "+1" del panel unificado.

**Why this priority**: Actualmente las filas de espacios de magia solo muestran el nivel, los espacios disponibles/máximos y el lápiz de edición; en cambio, las filas de rasgos incluían botones de -1 y +1 que sobrecargaban la fila visualmente e introducían inconsistencias de interfaz.

**Independent Test**: Puede probarse abriendo el panel de Recursos Diarios en un personaje con un rasgo limitado activo (ej. "Canalizar Energía"). Verificar que la fila muestra el nombre del rasgo, el contador de usos (`X / Y usos`) y un botón de lápiz (`✏️`) para editar, sin ningún botón de `-1` ni de `+1`. Al pulsar el lápiz se abre el diálogo de edición.

**Acceptance Scenarios**:

1. **Given** un personaje con rasgos limitados mostrados en el panel de Recursos Diarios, **When** el usuario inspecciona cada fila de rasgo, **Then** la fila contiene únicamente el nombre del rasgo, el indicador numérico de usos y el botón de lápiz para editar.
2. **Given** una fila de rasgo en el panel de Recursos Diarios, **When** el usuario busca controles de modificación rápida, **Then** no existen botones de `-1` ni de `+1` en dicha fila.
3. **Given** una fila de rasgo en el panel de Recursos Diarios, **When** el usuario pulsa el botón del lápiz, **Then** se abre el diálogo de edición de valores del rasgo.

---

### User Story 3 - Corrección y ajuste de valores actuales y máximos desde el modal de edición (Priority: P2)

Como jugador de rol en una partida en vivo que acaba de consumir por error un uso de un rasgo o un espacio de conjuro al tocar la pantalla del móvil, quiero poder abrir el diálogo de edición con el lápiz y modificar tanto el valor actual disponible como el valor máximo configurado, de modo que pueda corregir de inmediato el error sin tener que forzar un Descanso Largo ni alterar el resto de mi ficha.

**Why this priority**: Al remover los botones de +1 de la interfaz principal para mantenerla limpia, es imprescindible ofrecer una vía intuitiva y segura de subsanar toques erróneos o rectificar cantidades durante la partida.

**Independent Test**: Puede probarse gastando accidentalmente un uso de un rasgo (quedando en 2/3) o un espacio de conjuro de nivel 1 (quedando en 1/3). Pulsar el botón del lápiz (`✏️`) en dicho recurso; verificar que el formulario contiene campos tanto para el valor actual (disponible) como para el valor máximo. Modificar el actual de 2 a 3 (o de 1 a 2) y guardar; comprobar que el contador del recurso refleja el valor corregido.

**Acceptance Scenarios**:

1. **Given** el modal de edición de espacios de conjuro para un nivel determinado, **When** el usuario lo abre mediante el botón del lápiz, **Then** el formulario presenta campos editables tanto para los espacios actuales disponibles como para los espacios máximos del nivel.
2. **Given** el modal de edición de un rasgo de uso limitado, **When** el usuario lo abre mediante el botón del lápiz (desde el panel de recursos diarios o desde su tarjeta), **Then** el formulario presenta campos editables tanto para los usos actuales disponibles como para los usos máximos diarios.
3. **Given** que el usuario introduce un valor actual superior al máximo en cualquiera de los diálogos de edición, **When** guarda los cambios, **Then** el sistema asegura que el valor actual no exceda el máximo configurado (`actual <= max`).
4. **Given** que el usuario redujo por equivocación un uso al pulsar "Usar" o "Lanzar", **When** abre el diálogo de edición y aumenta el valor actual, **Then** el recurso recupera el uso rectificado inmediatamente tanto en su tarjeta como en el panel de recursos diarios.

---

### User Story 4 - Gasto de recursos centralizado en botones de acción directa en el catálogo (Priority: P3)

Como jugador en mesa que desea activar un rasgo o lanzar un conjuro, quiero que el consumo de usos se realice exclusivamente mediante el botón explícito de acción directa ("Usar" para rasgos y "Lanzar" para conjuros) presente en la tarjeta de cada recurso en el catálogo, sin botones manuales redundantes de -1 y +1 en las tarjetas.

**Why this priority**: Estandariza la experiencia de juego: la acción de interactuar con una habilidad o conjuro tiene un verbo claro ("Lanzar", "Usar") y está agrupada con sus reglas completas en el catálogo.

**Independent Test**: Localizar una tarjeta de rasgo en el catálogo con 3/3 usos. Verificar que solo dispone del botón "Usar" y del lápiz junto al contador. Al pulsar "Usar", el contador disminuye a 2/3. Si llega a 0, el botón se deshabilita visualmente.

**Acceptance Scenarios**:

1. **Given** una tarjeta de rasgo en el catálogo, **When** el usuario la observa, **Then** no presenta botones de `-1` ni de `+1`, disponiendo únicamente del botón "Usar" y del botón de lápiz junto al contador.
2. **Given** una tarjeta de rasgo con usos disponibles mayores que cero, **When** el usuario pulsa "Usar", **Then** se descuenta 1 uso disponible y se actualiza al instante en toda la vista.
3. **Given** una tarjeta de rasgo con 0 usos disponibles, **When** el usuario la consulta, **Then** el botón "Usar" permanece deshabilitado.

---

### Edge Cases

- **Personaje sin ningún recurso diario (sin magia y sin rasgos limitados)**: El subtítulo de la cabecera muestra "Sin recursos diarios activos", sin ningún contador `0/0` ni separadores residuales.
- **Intento de configurar valor actual negativo en el modal de edición**: El sistema valida que los valores actuales no sean inferiores a 0.
- **Intento de configurar valor actual superior al valor máximo**: El valor actual se acota automáticamente al valor máximo establecido (`Math.min(nuevoActual, nuevoMax)`).
- **Intento de configurar máximo inferior a 1 en rasgos**: Los rasgos limitados requieren un máximo diario de al menos 1 uso (`maxUses >= 1`).
- **Configuración de espacios máximos en 0 para un nivel de magia**: Si se configura el máximo en 0 para un nivel de conjuro, sus espacios actuales pasan automáticamente a 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ocultar el texto y contador de rasgos de la cabecera del panel de Recursos Diarios cuando el personaje no disponga de ningún rasgo o dote configurado con usos diarios limitados.
- **FR-002**: El sistema DEBE mostrar la información de rasgos en la cabecera del panel de Recursos Diarios (`Rasgos: [disponibles]/[máximos]`) única y exclusivamente cuando exista al menos un rasgo con usos limitados activo.
- **FR-003**: Cuando coincidan recursos de magia activos y rasgos limitados activos, el sistema DEBE separar ambas secciones en la cabecera mediante un delimitador visual limpio (ej. `•`).
- **FR-004**: Cuando existan solo rasgos limitados o solo magia activa, el sistema DEBE renderizar únicamente dicho contador sin delimitadores huérfanos.
- **FR-005**: Si no existen recursos diarios activos (ni magia ni rasgos limitados), la cabecera DEBE mostrar un texto informativo neutral ("Sin recursos diarios activos") en lugar de contadores vacíos.
- **FR-006**: En las filas de rasgos del panel de Recursos Diarios, el sistema DEBE eliminar los botones de decremento (`-1`) e incremento (`+1`), mostrando exclusivamente el nombre del rasgo, su contador numérico (`disponibles / máximos usos`) y el botón táctil de edición (lápiz `✏️`), con simetría visual respecto a los espacios de magia.
- **FR-007**: El modal de edición de espacios de conjuro (accesible mediante el lápiz `✏️`) DEBE permitir editar tanto los espacios actuales disponibles como los espacios máximos del nivel seleccionado.
- **FR-008**: El modal de edición de rasgos de uso limitado (accesible mediante el lápiz `✏️` tanto en el panel de recursos diarios como en la tarjeta del catálogo) DEBE permitir editar tanto los usos actuales disponibles como los usos máximos diarios del rasgo.
- **FR-009**: Al guardar modificaciones desde el modal de edición de espacios o rasgos, el sistema DEBE validar que el valor actual no sea negativo y no supere el valor máximo configurado (`0 <= actual <= max`).
- **FR-010**: En las tarjetas de rasgos del catálogo de recursos, el sistema NO DEBE presentar botones de `-1` o `+1`, manteniendo exclusivamente el botón de acción directa "Usar" para consumir usos del recurso y el lápiz de edición junto al contador.
- **FR-011**: Al pulsar el botón "Usar" en una tarjeta de rasgo con usos disponibles, el sistema DEBE descontar exactamente 1 uso disponible de forma reactiva en toda la aplicación.
- **FR-012**: Si los usos disponibles de un rasgo llegan a 0, el botón "Usar" DEBE quedar deshabilitado.

### Key Entities

- **Recurso Diario (Rasgo/Dote Limitado)**: Elemento de la ficha de personaje que posee una cantidad finita de usos diarios (`maxUses >= 1`) y un contador de usos disponibles actuales (`availableUses`). Ambos valores son editables de forma combinada en su diálogo de edición.
- **Espacio de Conjuro**: Registro de capacidad mágica por nivel que posee un número máximo de espacios configurados (`max >= 0`) y un número de espacios actualmente disponibles (`available >= 0`). Ambos valores son editables de forma combinada en su diálogo de edición.
- **Diálogo de Edición Unificado**: Modal táctil accesible mediante el icono de lápiz (`✏️`) que permite ajustar simultáneamente tanto la disponibilidad actual como el tope máximo del recurso seleccionado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los estados de personaje sin rasgos limitados ocultan completamente la etiqueta y contadores de rasgos en la cabecera del panel de recursos diarios.
- **SC-002**: El 100% de las filas de rasgos en el panel de Recursos Diarios carecen de botones `-1` y `+1`, ofreciendo paridad visual completa con el bloque de espacios de magia.
- **SC-003**: En el 100% de los diálogos de edición de espacios de conjuros y de rasgos limitados, el usuario puede modificar y guardar con éxito tanto el valor actual disponible como el valor máximo.
- **SC-004**: Los errores de gasto accidental ("Usar" o "Lanzar") pueden subsanarse en menos de 5 segundos utilizando el diálogo de edición con el lápiz.
- **SC-005**: En pantallas móviles de 360px de ancho, las filas de recursos diarios y los formularios de edición se visualizan correctamente sin desbordamientos horizontales.
- **SC-006**: Cero delimitadores visuales inconsistentes (sin `•` al inicio o al final) en la cabecera del panel bajo cualquiera de las cuatro combinaciones posibles de recursos.

## Assumptions

- Se mantiene el modal de "Descanso Largo" para la recuperación simultánea al 100% de todos los recursos tras finalizar una jornada.
- La validación en los formularios de edición acotará el valor actual al nuevo valor máximo si el usuario introduce un número superior.
- Los campos numéricos en los modales de edición conservan áreas táctiles confortables y botones de acción rápida ("Cancelar" y "Guardar").
