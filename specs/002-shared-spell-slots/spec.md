# Feature Specification: Shared Spell Slots by Level & Documentation URL

**Feature Branch**: `002-shared-spell-slots`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "cuanto el recurso es de categoría conjuro, comparte uso máximos diarios con el resto de recursos categoría conjuro del mismo nivel. Es decir, cuando se crea un recurso conjuro se debe especificar el nivel. Se debe de poder establecer en otro lugar, el numero de usos de recurso conjuro de nivel 1,2,3 hasta 9. Y cuando se use un recurso conjuro de nivel 1, debe quitarse de esa cuenta global. También se debe añadir un nuevo campo url en el conjuro/rasgo para enlazarlo con la documentación."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestión Centralizada de Espacios de Conjuro por Nivel (Priority: P1)

Como jugador lanzador de conjuros en Pathfinder (Mago, Clérigo, Hechicero, etc.), quiero configurar en un panel específico mis espacios de conjuro máximos diarios para cada nivel (del 1 al 9) y ver en tiempo real cuántos espacios me quedan disponibles en cada nivel para llevar el cómputo global de mi magia del día.

**Why this priority**: En las reglas de Pathfinder, los conjuros preparados o espontáneos no tienen usos individuales por cada hechizo conocido, sino que comparten una reserva común de espacios de conjuro por nivel. Sin esta cuenta global, el jugador no puede gestionar su magia de acuerdo con las reglas oficiales.

**Independent Test**: Puede probarse configurando en el panel de espacios 4 espacios de nivel 1 y 3 espacios de nivel 2; se descuenta 1 espacio de nivel 1 directamente o a través de cualquier conjuro de nivel 1 y se constata que la reserva global de nivel 1 pase a 3/4, mientras que la de nivel 2 permanezca en 3/3.

**Acceptance Scenarios**:

1. **Given** un personaje con el panel de espacios de conjuro visible, **When** el jugador establece 4 espacios máximos para el nivel 1 y 2 espacios para el nivel 2, **Then** el sistema muestra los contadores de nivel 1 en 4/4 y nivel 2 en 2/2.
2. **Given** una reserva de nivel 1 con 3/4 espacios disponibles, **When** el jugador pulsa el botón rápido de gasto de un espacio en el panel global, **Then** los espacios disponibles pasan inmediatamente a 2/4.
3. **Given** una reserva de nivel 1 con 0/4 espacios disponibles, **When** el jugador intenta gastar otro espacio de nivel 1, **Then** la acción se bloquea impidiendo que el valor sea negativo.
4. **Given** una reserva de nivel 1 con 2/4 espacios disponibles, **When** el jugador pulsa recuperar (+1 espacio), **Then** los disponibles aumentan a 3/4 sin superar los 4 máximos.

---

### User Story 2 - Asignación de Nivel y Consumo Compartido en Conjuros (Priority: P2)

Como jugador, quiero que al crear o editar un recurso clasificado como "Conjuro" sea obligatorio especificar su nivel (1 a 9, o 0 para trucos a voluntad), de modo que al pulsar el botón de gasto de ese conjuro se consuma un espacio de la reserva global de su nivel y todos los demás conjuros de ese mismo nivel reflejen la misma cantidad disponible.

**Why this priority**: Conecta la lista de conjuros conocidos/preparados con la reserva global, permitiendo al jugador lanzar cualquiera de sus conjuros de nivel 1 sabiendo que todos restan de la misma bolsa de usos diarios.

**Independent Test**: Puede probarse creando dos conjuros de nivel 1 ("Proyectil Mágico" y "Manos Ardientes") y configurando 3 espacios globales de nivel 1. Al gastar 1 uso en "Proyectil Mágico", tanto "Proyectil Mágico" como "Manos Ardientes" deben actualizarse inmediatamente mostrando 2/3 disponibles.

**Acceptance Scenarios**:

1. **Given** el formulario de creación de recursos con categoría "Conjuro" seleccionada, **When** el usuario rellena el formulario, **Then** el sistema exige seleccionar el nivel del conjuro (0 a 9) y oculta el campo de usos máximos individuales al estar delegados en la reserva global.
2. **Given** dos conjuros de nivel 1 ("Proyectil Mágico" y "Escudo") y una reserva global de nivel 1 con 3/3 espacios, **When** el jugador pulsa gastar (-1) en "Proyectil Mágico", **Then** la reserva global pasa a 2/3 y ambas tarjetas muestran inmediatamente 2/3 espacios disponibles.
3. **Given** una reserva de nivel 1 con 0 espacios disponibles, **When** el jugador visualiza sus conjuros de nivel 1, **Then** los botones de gasto de todos los conjuros de nivel 1 se muestran deshabilitados para evitar lanzamientos sin espacios.
4. **Given** un conjuro de nivel 0 (truco / cantrip), **When** se crea o visualiza en la lista, **Then** se trata como uso ilimitado (a voluntad) sin consumir espacios de nivel superior.

---

### User Story 3 - Enlace a Documentación Oficial (URL) en Conjuros y Rasgos (Priority: P3)

Como jugador en mesa, quiero registrar un enlace web (URL) opcional en cada conjuro o rasgo/dote para poder abrir en un solo toque la página oficial de reglas (ej. Archives of Nethys o d20pfsrd) cuando surja una duda sobre el alcance o funcionamiento exacto del efecto.

**Why this priority**: Durante las partidas surgen dudas específicas sobre tiradas de salvación, componentes o modificadores de reglas; contar con un enlace directo a la fuente oficial ahorra tiempo de búsqueda en manuales.

**Independent Test**: Puede probarse creando un conjuro con la URL `https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball`; al abrir la tarjeta se visualiza el botón de enlace externo, y al pulsarlo se abre la página web en una nueva pestaña segura del navegador.

**Acceptance Scenarios**:

1. **Given** el formulario de creación/edición de un conjuro o rasgo, **When** el usuario introduce una dirección web válida en el campo "URL de documentación", **Then** el recurso se guarda con el enlace asociado.
2. **Given** una tarjeta de recurso con URL registrada, **When** el usuario pulsa el botón o enlace "Ver documentación oficial", **Then** el navegador abre la URL en una nueva pestaña con los atributos de seguridad adecuados (`target="_blank"` y `rel="noopener noreferrer"`).
3. **Given** una tarjeta de recurso sin URL registrada, **When** se visualiza la tarjeta, **Then** no se muestra ningún botón de enlace roto ni espacio vacío innecesario.

---

### User Story 4 - Restauración en Descanso Largo y Portabilidad en Esquema JSON (Priority: P4)

Como jugador, quiero que la acción de "Descanso Largo" restaure automáticamente todos los espacios globales de conjuros de todos los niveles a su valor máximo, y que la exportación/importación JSON conserve intacta tanto la configuración de espacios como las URLs de los recursos.

**Why this priority**: Asegura la integridad completa de la ficha entre sesiones de juego y tras realizar descansos, garantizando retrocompatibilidad con fichas exportadas anteriormente.

**Independent Test**: Puede probarse gastando espacios de niveles 1, 2 y 3, ejecutando el Descanso Largo y comprobando que todos los niveles vuelvan a su valor máximo. Luego se exporta la ficha a JSON y se importa nuevamente para verificar que la matriz de espacios y las URLs de los recursos se conserven con 100% de precisión.

**Acceptance Scenarios**:

1. **Given** espacios de conjuro consumidos en múltiples niveles (ej. nivel 1 en 1/4 y nivel 2 en 0/3), **When** el usuario confirma el Descanso Largo, **Then** todas las reservas de espacios de conjuros se restablecen al 100% de sus valores máximos (4/4 y 3/3).
2. **Given** un personaje con espacios de conjuro configurados y recursos con URLs de documentación, **When** se exporta la ficha a JSON, **Then** el archivo contiene la estructura completa de espacios por nivel y las URLs asociadas.
3. **Given** un archivo JSON de respaldo de la versión anterior (sin estructura de espacios de conjuro ni URLs), **When** el usuario lo importa en la aplicación, **Then** el sistema lo procesa con éxito, inicializa los espacios de conjuro con valores por defecto limpios y preserva todos los recursos existentes sin errores.

---

### Edge Cases

- **Intento de gasto sin espacios disponibles**: Cuando una reserva global de nivel N tiene 0 espacios disponibles, el botón de gasto de cualquier conjuro de ese nivel debe estar visualmente inactivo y no restar por debajo de 0.
- **Modificación a la baja de espacios máximos**: Si el jugador reduce los espacios máximos de nivel 1 de 4 a 2 mientras tenía 3 disponibles, los disponibles deben ajustarse automáticamente al nuevo máximo (tope en 2).
- **URLs no válidas o mal formateadas**: Si el usuario introduce un texto que no es una URL con protocolo `http://` o `https://`, el sistema debe alertar del formato o sanitizar el campo antes de guardarlo para evitar enlaces rotos o scripts maliciosos.
- **Conjuros sin nivel asignado en fichas antiguas**: Al importar fichas antiguas donde los conjuros no tenían nivel asignado, el sistema debe asignar por defecto nivel 1 (o permitir editarlo fácilmente) sin bloquear la aplicación.
- **Recursos de categoría Rasgo/Dote**: Los rasgos y dotes NO consumen espacios globales de conjuros; continúan utilizando sus contadores individuales de uso diario (limitados) o modo ilimitado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mantener una estructura de datos para los espacios de conjuros ("Spell Slots") que registre para cada nivel de conjuro del 1 al 9: el número de espacios máximos diarios (`maxSlots`) y el número de espacios disponibles actuales (`availableSlots`).
- **FR-002**: El sistema DEBE proporcionar una sección visual intuitiva y táctil para consultar y configurar los espacios de conjuros máximos y disponibles de cada nivel del 1 al 9.
- **FR-003**: Al crear o editar un recurso clasificado como "Conjuro", el sistema DEBE requerir la selección de su nivel de conjuro (entero de 0 a 9).
- **FR-004**: Los conjuros de nivel 1 a 9 DEBEN compartir los espacios diarios disponibles con todos los demás conjuros de su mismo nivel.
- **FR-005**: Al pulsar el botón de gasto rápido (-1 uso) en cualquier conjuro de nivel N (1 a 9), el sistema DEBE descontar 1 espacio de la reserva global de espacios de nivel N, reflejando inmediatamente el cambio en todos los conjuros de dicho nivel.
- **FR-006**: Al pulsar el botón de recuperar uso (+1) en un conjuro de nivel N o en el panel de espacios, el sistema DEBE incrementar en 1 los espacios disponibles de nivel N sin sobrepasar los espacios máximos configurados para dicho nivel.
- **FR-007**: Los conjuros configurados como nivel 0 (trucos/cantrips) DEBEN tratarse como habilidades a voluntad / ilimitadas y NO consumir espacios globales de conjuros.
- **FR-008**: Los recursos clasificados como "Rasgo/Dote" DEBEN conservar su gestión independiente de usos (modo Limitado con contador propio o modo Ilimitado) sin vincularse a la reserva de espacios de conjuros.
- **FR-009**: Cada recurso (Conjuro o Rasgo/Dote) DEBE incluir un campo opcional `url` para almacenar la dirección web a su documentación o compendio oficial de reglas.
- **FR-010**: En la tarjeta de todo recurso que posea una URL válida, el sistema DEBE mostrar un botón de acceso directo que abra dicha dirección en una nueva pestaña segura (`target="_blank" rel="noopener noreferrer"`).
- **FR-011**: La acción de "Descanso Largo" DEBE restaurar el 100% de los espacios disponibles de todos los niveles de conjuro a sus correspondientes espacios máximos diarios.
- **FR-012**: El archivo de exportación e importación JSON DEBE incluir la matriz de espacios de conjuro por nivel y el campo `url` de cada recurso, garantizando retrocompatibilidad con archivos creados en versiones previas.

### Key Entities

- **Espacio de Conjuro por Nivel (SpellSlotLevel)**: Representa la capacidad mágica diaria para un nivel de conjuro concreto. Atributos: `level` (entero 1..9), `maxSlots` (entero >= 0), `availableSlots` (entero 0..maxSlots).
- **Recurso (ResourceItem)**: Actualizado con dos nuevos atributos:
  - `spellLevel`: entero opcional (0..9), obligatorio si la categoría es "Conjuro".
  - `url`: cadena de texto opcional con validación de URL (hasta 500 caracteres).
- **Archivo de Respaldo (BackupPayload)**: Actualizado con el esquema `1.1.0` conteniendo la colección de `spellSlots` y los campos ampliados de los recursos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al consumir un espacio de conjuro en cualquier hechizo de nivel N, el 100% de los conjuros de ese mismo nivel y el panel de espacios actualizan su contador visible en menos de 100 milisegundos.
- **SC-002**: El usuario puede consultar y modificar los espacios máximos de cualquier nivel de conjuro (1 a 9) en menos de 3 toques desde la interfaz móvil.
- **SC-003**: El 100% de los recursos con URL válida abren correctamente la referencia externa en una nueva pestaña sin bloquear la sesión de juego.
- **SC-004**: La ejecución del Descanso Largo restablece el 100% de los espacios de todos los niveles de conjuro de forma instantánea y verificable.
- **SC-005**: La importación de un archivo JSON de la versión anterior (1.0.0) se completa con 0% de errores, inicializando los espacios de conjuros con valores válidos por defecto.
- **SC-006**: Todos los controles táctiles de los espacios de conjuros cumplen con el estándar ergonómico mínimo de 44x44px en viewports desde 360px de ancho.

## Assumptions

- **Conjuros de nivel 0**: En Pathfinder los trucos (orisons/cantrips) no gastan espacios diarios; por tanto, los conjuros asignados a nivel 0 funcionan en modo Ilimitado por defecto.
- **Niveles de conjuro contemplados**: El rango abarca desde el nivel 1 hasta el nivel 9, que es el estándar máximo para lanzadores de conjuros completos en Pathfinder (Mago, Clérigo, Druida, Hechicero).
- **Enlace opcional**: El campo `url` es estrictamente opcional; ningún recurso requiere una URL obligatoria para ser creado o utilizado.
