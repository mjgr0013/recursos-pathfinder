# Feature Specification: Cast Button Action & Clean Slot Controls

**Feature Branch**: `005-cast-button-and-clean-slots`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Hay que quitar los botones de sumar restar espacio de conjuro en los propios conjuros, y dejarlo solamente en la parte de recursos diarios, con el botón de editar, el de sumar y restar se debe quitar. Hay que añadir un botón de \"Lanzar\" dentro de los conjuros y los rasgos para que gaste un uso correspondiente. Además, cuando se clique en Crear ficha nueva en blanco, se debe cerrar el modal y volver a la página."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Botón de Acción "Lanzar" en Conjuros y Rasgos (Priority: P1)

Como jugador durante un combate de Pathfinder, quiero que cada tarjeta de conjuro y cada rasgo limitado cuente con un botón claro y directo de **"Lanzar"** (o "Usar") que consuma un uso de inmediato al pulsarlo, en lugar de botones abstractos de sumar y restar (+/-), para tener una sensación auténtica de juego de rol y ejecutar mis acciones de combate con un solo toque.

**Why this priority**: Los botones de incremento y decremento (+/-) asemejan una calculadora aritmética y provocan errores; un botón dedicado "Lanzar" expresa la acción real del juego y agiliza el turno del jugador.

**Independent Test**: Puede probarse abriendo la lista de conjuros con "Proyectil Mágico" (nivel 1) y 3 espacios de nivel 1 disponibles; pulsar el botón "Lanzar"; verificar que se descuente 1 espacio (quedando 2 disponibles en la reserva) y que la tarjeta ofrezca retroalimentación visual inmediata. Cuando los espacios lleguen a 0, el botón "Lanzar" debe quedar deshabilitado ("Sin espacios").

**Acceptance Scenarios**:

1. **Given** un conjuro de nivel 1 con espacios disponibles en su nivel, **When** el usuario visualiza su tarjeta, **Then** no aparecen botones de sumar ni restar (+/-); en su lugar, se muestra un botón prominente **"Lanzar"** (con área táctil mínima de 44x44px).
2. **Given** un conjuro con espacios disponibles, **When** el usuario pulsa "Lanzar", **Then** el sistema descuenta inmediatamente 1 espacio de la reserva global de ese nivel de conjuro y muestra retroalimentación visual de acción ejecutada.
3. **Given** un conjuro de nivel N cuyos espacios disponibles son 0, **When** se observa la tarjeta, **Then** el botón "Lanzar" se encuentra deshabilitado visualmente, impidiendo el gasto por debajo de 0.
4. **Given** un recurso de categoría "Rasgo / Dote" en modo limitado con usos disponibles (ej. *Canalizar Energía* 4/5), **When** el usuario pulsa su botón de acción ("Lanzar" / "Usar"), **Then** se descuenta 1 uso de dicho rasgo específico (pasando a 3/5).
5. **Given** un conjuro de nivel 0 (truco / cantrip), **When** el usuario pulsa "Lanzar", **Then** se ejecuta la acción sin descontar ningún espacio diario por ser un hechizo a voluntad.

---

### User Story 2 - Simplificación de Espacios de Magia en Recursos Diarios (Priority: P2)

Como jugador que consulta sus recursos diarios, quiero que en la sección de espacios de magia solo se muestre el contador de espacios disponibles y máximos con su botón de edición (✏️), suprimiendo los botones de sumar (+1) y restar (-1), ya que los espacios se consumen naturalmente al pulsar "Lanzar" en los conjuros.

**Why this priority**: Elimina botones redundantes en la pantalla móvil, reduciendo el ruido visual y evitando que el jugador gaste o altere espacios de magia sin asociarlos al conjuro que realmente lanzó.

**Independent Test**: Puede probarse observando el panel de recursos diarios; verificar que para cada nivel de magia solo aparezca la etiqueta de nivel, el contador `disponibles / max` y el botón de edición `✏️` para configurar los espacios máximos, sin mostrar ningún botón de `-1` o `+1`.

**Acceptance Scenarios**:

1. **Given** el panel de recursos diarios con la sección de espacios de magia desplegada, **When** el usuario visualiza los niveles de magia activos, **Then** no se muestran botones de `-1` ni `+1` en las filas de espacios de conjuros.
2. **Given** una fila de nivel de magia en recursos diarios, **When** el usuario pulsa el botón de edición (`✏️`), **Then** puede ajustar el número de espacios máximos asignados a dicho nivel.
3. **Given** que el usuario pulsa el botón "Lanzar" en cualquier conjuro de la lista, **When** se ejecuta el lanzamiento, **Then** el contador del nivel correspondiente en recursos diarios se actualiza instantáneamente reflejando el nuevo saldo disponible.

---

### User Story 3 - Cierre Automático del Modal al Crear Ficha Nueva en Blanco (Priority: P3)

Como jugador que decide reiniciar su ficha o crear un nuevo personaje en blanco, quiero que al confirmar "Crear ficha nueva en blanco" el modal se cierre automáticamente y me devuelva a la página principal, para comenzar a editar de inmediato sin tener que cerrar el modal a mano.

**Why this priority**: Fluidez de navegación directa sin pasos muertos ni clics superfluos.

**Independent Test**: Abrir modal de datos, pulsar "Crear ficha nueva en blanco", confirmar ("Sí, reiniciar"); verificar que el modal se cierre de inmediato y la pantalla principal muestre la ficha en blanco reiniciada con un mensaje flotante de confirmación.

**Acceptance Scenarios**:

1. **Given** el modal de datos abierto, **When** el usuario confirma "Crear ficha nueva en blanco", **Then** el personaje se reinicia, el modal se cierra automáticamente de inmediato y la vista principal queda activa.
2. **Given** el reinicio completado, **When** el usuario vuelve a la página principal, **Then** visualiza un mensaje toast confirmando la operación.

---

### Edge Cases

- **Intento de lanzar conjuro sin espacios de su nivel**: El botón "Lanzar" debe mostrar un estado bloqueado claro (`disabled`, texto indicativo o tooltip) para que el jugador sepa de un vistazo que ha agotado sus espacios de ese nivel sin necesidad de calcular mentalmente.
- **Rasgo limitado agotado (0 usos)**: El botón "Lanzar / Usar" se deshabilita para evitar conteos negativos.
- **Edición de espacios máximos a la baja**: Si en el panel de recursos diarios el jugador reduce los espacios máximos de un nivel por debajo de los disponibles, los disponibles se acotan inmediatamente al nuevo tope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las tarjetas de conjuros individuales (`ResourceCard`) NO DEBEN incluir botones de sumar (`+1`) ni restar (`-1`) espacios.
- **FR-002**: Cada tarjeta de conjuro DEBE incluir un botón interactivo táctil etiquetado como **"Lanzar"** que, al pulsarse, descuente 1 espacio disponible de la reserva global de su nivel correspondiente.
- **FR-003**: Cada tarjeta de rasgo/dote de uso limitado DEBE incluir un botón interactivo táctil etiquetado como **"Lanzar"** (o "Usar") que, al pulsarse, descuente 1 uso disponible de dicho rasgo.
- **FR-004**: El botón "Lanzar" DEBE deshabilitarse automáticamente cuando no queden espacios de ese nivel (para conjuros) o usos disponibles (para rasgos).
- **FR-005**: En la subsección de espacios de magia del panel de recursos diarios, el sistema NO DEBE mostrar botones de sumar (+1) ni restar (-1) en las filas de niveles de conjuro.
- **FR-006**: En la subsección de espacios de magia de recursos diarios, el sistema DEBE mostrar el contador `disponibles / max` y el botón de edición (`✏️`) para configurar los espacios máximos de cada nivel.
- **FR-007**: Los botones de acción "Lanzar" DEBEN cumplir con el estándar ergonómico táctil de al menos 44x44px.
- **FR-008**: Al confirmar "Crear ficha nueva en blanco" en el modal de datos, el modal DEBE cerrarse automáticamente de forma inmediata devolviendo al usuario a la página principal.

### Key Entities

- **Acción de Lanzamiento (CastAction)**: Evento que consume 1 uso o espacio del recurso correspondiente al pulsar "Lanzar".
- **Fila Simplificada de Espacio de Magia (CleanSpellSlotRow)**: Elemento visual que contiene únicamente el nombre del nivel, contador numérico y botón de edición de capacidad máxima.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El lanzamiento de un conjuro o uso de un rasgo se ejecuta en 1 solo toque directo desde su tarjeta mediante el botón "Lanzar".
- **SC-002**: Reducción de al menos 2 elementos interactivos superfluos por tarjeta y por nivel de magia en recursos diarios, limpiando la interfaz móvil.
- **SC-003**: El botón "Lanzar" responde con actualización de estado y feedback visual en menos de 50 milisegundos.
- **SC-004**: El modal de datos se cierra en menos de 100 milisegundos tras confirmar el reinicio de ficha.
- **SC-005**: 100% de los botones táctiles cumplen con el estándar de 44x44px.

## Assumptions

- **Restauración de recursos**: La recuperación masiva de espacios y usos se efectúa a través del botón global de "Descanso Largo", mientras que los ajustes manuales de capacidad se realizan mediante el botón de edición (✏️).
