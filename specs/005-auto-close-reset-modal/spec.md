# Feature Specification: Auto-Close Modal on New Character Creation

**Feature Branch**: `005-auto-close-reset-modal`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "cuando se clique en Crear ficha nueva en blanco, se debe cerrar el modal y volver a la página"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cierre Automático del Modal tras Crear Ficha Nueva en Blanco (Priority: P1)

Como jugador de Pathfinder que decide reiniciar su ficha o comenzar a crear un nuevo personaje en blanco, quiero que al pulsar y confirmar la opción de "Crear ficha nueva en blanco" el modal de datos se cierre automáticamente y me devuelva de inmediato a la pantalla principal de la aplicación, para poder empezar a editar el nombre, clase y estadísticas de mi nuevo personaje sin tener que buscar y pulsar manualmente el botón de cerrar (✕).

**Why this priority**: Mejora directamente la fluidez de navegación y la experiencia de usuario, eliminando un paso innecesario y confuso donde el modal permanecía abierto tras haber completado la acción solicitada.

**Independent Test**: Puede probarse abriendo el modal de "Datos / Copias de Seguridad", pulsando "Crear ficha nueva en blanco" y confirmando en el diálogo de confirmación ("Sí, reiniciar"); verificar que el modal se cierre de inmediato, que la pantalla principal muestre la ficha en blanco reiniciada y que aparezca una notificación breve confirmando la operación.

**Acceptance Scenarios**:

1. **Given** el modal de "Datos" abierto con la opción "Crear ficha nueva en blanco" visible, **When** el usuario pulsa en crear ficha nueva y confirma la acción ("Sí, reiniciar"), **Then** el estado de la ficha se restablece a los valores por defecto, el modal se cierra automáticamente y la vista principal queda activa de inmediato.
2. **Given** el usuario que acaba de confirmar el reinicio de la ficha, **When** regresa a la página principal, **Then** visualiza un mensaje flotante (toast) confirmando que la ficha ha sido reiniciada con éxito.
3. **Given** que el usuario pulsa "Crear ficha nueva en blanco" pero luego pulsa "Cancelar" en la confirmación previa, **When** se cancela la acción, **Then** el modal permanece abierto sin reiniciar los datos de la ficha activa.

---

### Edge Cases

- **Pulsaciones rápidas o dobles**: Si el usuario pulsa rápidamente el botón de confirmar, el sistema debe procesar el reinicio una sola vez y cerrar el modal limpiamente sin parpadeos ni errores en el ciclo de vida del componente.
- **Persistencia inmediata**: El estado reiniciado debe guardarse al instante en el almacenamiento local antes o durante el cierre del modal, de modo que si el usuario recarga la página inmediatamente después, la nueva ficha en blanco permanezca intacta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al confirmar la acción de crear una nueva ficha en blanco dentro del modal de datos, el sistema DEBE reiniciar el estado completo del personaje a sus valores iniciales por defecto.
- **FR-002**: Tras ejecutar el reinicio, el modal de datos DEBE cerrarse automáticamente de forma inmediata, devolviendo el foco y la interacción a la página principal.
- **FR-003**: El sistema DEBE mostrar una notificación flotante breve (toast) en la parte superior de la página principal informando al usuario que la ficha ha sido reiniciada con éxito.
- **FR-004**: Si el usuario pulsa "Cancelar" en el cuadro de confirmación de reinicio, el modal DEBE mantenerse abierto y el personaje activo DEBE permanecer inalterado.

### Key Entities

- **Acción de Reinicio (CharacterResetAction)**: Evento desencadenado al confirmar la creación de una ficha en blanco que resetea el estado y dispara el cierre del modal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El modal de datos se cierra en menos de 100 milisegundos tras pulsar la confirmación de reinicio.
- **SC-002**: La página principal refleja la nueva ficha en blanco y la notificación flotante de confirmación de forma inmediata.
- **SC-003**: Cero pasos o clics manuales adicionales requeridos por parte del usuario para volver a la ficha tras reiniciar.

## Assumptions

- **Confirmación previa**: Se conserva la solicitud de confirmación ("¿Reiniciar ficha a valores iniciales en blanco?") para prevenir pérdidas accidentales de personajes antes de ejecutar el reinicio y cierre.
