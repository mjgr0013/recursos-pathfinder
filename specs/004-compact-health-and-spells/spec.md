# Feature Specification: Compact Health Controls & Non-Caster Magic Toggle

**Feature Branch**: `004-compact-health-and-spells`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "de primeras no debe aparecer nada en espacios de magia, porque hay quien no tiene, de hecho se debe de poder ocultar. También quiero que el cuadro de la vida se pueda ocultar, dejando solamente visible la vida actual y máxima, para cuando no haya que interactuar con los botones de sumar y quitar vida."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Espacios de Magia Derivados Estrictamente del Conjuro más Alto (Priority: P1)

Como jugador de Pathfinder, quiero que los espacios de conjuros no muestren absolutamente nada de primeras si no tengo conjuros, y que cuando agregue conjuros se muestren única y estrictamente los niveles hasta el conjuro más alto que me he puesto (sin botones manuales para forzar niveles superiores), de modo que la gestión mágica refleje fielmente mi repertorio real de hechizos.

**Why this priority**: Evita la presencia de casillas mágicas en personajes marciales o niveles de magia ficticios que el personaje aún no conoce; el repertorio de conjuros registrados es la única fuente de verdad para habilitar los niveles de espacios de magia.

**Independent Test**: Puede probarse creando un personaje sin conjuros; verificar que no aparezca ningún espacio de magia (0 filas). Crear un conjuro de nivel 2 ("Invisibilidad"); verificar que inmediatamente aparezcan los niveles 1 y 2, y ninguno más. Si se borra dicho conjuro y solo quedan de nivel 1, la vista se contrae inmediatamente a nivel 1.

**Acceptance Scenarios**:

1. **Given** un personaje recién creado o sin conjuros de nivel >= 1, **When** el usuario consulta la aplicación, **Then** no aparece ningún espacio de magia en pantalla (sección completamente invisible/vacía).
2. **Given** un personaje sin conjuros de nivel superior a 2, **When** se observa la sección de magia, **Then** únicamente se muestran los niveles 1 y 2.
3. **Given** un personaje con conjuros hasta nivel 3, **When** el usuario registra un nuevo conjuro de nivel 5 ("Teletransporte"), **Then** la vista de espacios de conjuros se expande automáticamente hasta el nivel 5.
4. **Given** la interfaz de espacios de magia, **When** el usuario navega por ella, **Then** no existe ningún botón para añadir niveles manualmente; solo la creación de un conjuro de dicho nivel desbloquea los espacios correspondientes.
5. **Given** que el usuario elimina el único conjuro de nivel 5 que poseía, **When** se actualiza la lista, **Then** los espacios se contraen automáticamente al nuevo nivel más alto registrado.

---

### User Story 2 - Modo Compacto y Plegado del Monitor de Salud (Priority: P2)

Como jugador durante fases de exploración, investigación o roleo fuera de combate, quiero poder plegar los controles de daño y curación del monitor de salud para dejar visible únicamente mis puntos de vida actuales y máximos, evitando pulsaciones accidentales de botones y maximizando el espacio útil para consultar mis habilidades.

**Why this priority**: Los botones de combate (-1, -5, -10 daño, +1, +5, +10 curación, entradas numéricas) solo se necesitan durante un encuentro táctico; fuera de combate ocupan un tercio de la pantalla móvil y corren riesgo de toques accidentales.

**Independent Test**: Puede probarse abriendo el monitor de salud con 25/30 PG; pulsar el botón de plegar o la cabecera de salud; verificar que se oculten todos los botones de daño y curación, mostrando únicamente una barra compacta con `25 / 30 PG` y el estado de salud. Al pulsar "Desplegar controles", los botones de combate reaparecen inmediatamente.

**Acceptance Scenarios**:

1. **Given** el monitor de salud con todos sus botones de daño y curación visibles, **When** el usuario pulsa el control de "Plegar controles de combate", **Then** el componente se reduce a un modo compacto que muestra exclusivamente los PG actuales, PG máximos, PG temporales y la barra de estado.
2. **Given** el monitor de salud en modo compacto, **When** el usuario necesita registrar daño en combate y pulsa "Mostrar controles" o toca la tarjeta de salud, **Then** reaparece inmediatamente la botonera completa de daño rápido (-1, -5, -10), curación (+1, +5, +10) y entrada personalizada.
3. **Given** el monitor de salud en modo compacto con puntos de vida temporales activos (ej. +5 PG temporales), **When** se observa la vista compacta, **Then** los PG temporales se indican claramente junto a la vida actual sin ocupar espacio innecesario.
4. **Given** que el usuario recarga la pestaña o vuelve a abrir la aplicación tras plegar la salud, **When** se inicia la app, **Then** el estado de plegado/desplegado se conserva tal como lo dejó el usuario.

---

### User Story 3 - Preselección Contextual de Categoría al Añadir Recursos (Priority: P3)

Como jugador que está consultando la pestaña específica de "Conjuros" o la de "Rasgos", quiero que al pulsar el botón "+ Añadir" el formulario preseleccione automáticamente la categoría correspondiente a la pestaña activa, para no tener que cambiar manualmente el desplegable cada vez que registro un elemento de esa categoría.

**Why this priority**: Acelera la carga masiva y preparación de la ficha de personaje antes de la sesión, eliminando clics innecesarios y previniendo errores de clasificación involuntarios.

**Independent Test**: Puede probarse seleccionando la pestaña "Conjuros" y pulsando "+ Añadir"; verificar que el campo categoría esté preseleccionado en "Conjuro". Cerrar modal, seleccionar la pestaña "Rasgos" y pulsar "+ Añadir"; verificar que el campo categoría esté preseleccionado en "Rasgo / Dote".

**Acceptance Scenarios**:

1. **Given** que el usuario tiene seleccionada la pestaña de filtro "Conjuros", **When** pulsa el botón "+ Añadir", **Then** el modal se abre con la categoría "Conjuro" preseleccionada por defecto.
2. **Given** que el usuario tiene seleccionada la pestaña de filtro "Rasgos", **When** pulsa el botón "+ Añadir", **Then** el modal se abre con la categoría "Rasgo / Dote" preseleccionada por defecto.
3. **Given** que el usuario tiene seleccionada la pestaña "Todos", **When** pulsa el botón "+ Añadir", **Then** el modal se abre con la última categoría utilizada o el valor por defecto.

---

### Edge Cases

- **Personaje que cae a 0 PG mientras la salud está plegada**: Si por alguna razón externa o descanso se alteran los PG a 0, la vista compacta debe mostrar el indicador de inconsciencia en color rojo prominente para alertar al jugador.
- **Transición de personaje no lanzador a lanzador**: Al importar una ficha con conjuros o al crear un conjuro en un personaje que tenía la magia oculta, la sección de magia debe reactivarse de inmediato sin requerir configuración manual compleja.
- **Pantallas ultracompactas (360px)**: El modo compacto de salud debe ocupar menos de 65px de altura total, garantizando que el perfil y los recursos queden visibles simultáneamente en el primer pantallazo sin scroll.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE determinar dinámicamente los niveles de espacios de conjuros a mostrar en base ESTRICTA al conjuro de mayor nivel (`spellLevel >= 1`) presente en la lista de recursos del personaje.
- **FR-002**: Si el personaje no posee ningún conjuro con nivel mayor o igual a 1, la sección de espacios de magia NO DEBE mostrar ningún espacio (0 niveles visibles) y permanecer completamente limpia/oculta.
- **FR-003**: Se PROHÍBE terminantemente incluir controles o botones para añadir/forzar niveles de espacios de magia manualmente; los niveles visibles emergen exclusivamente al añadir conjuros de dicho nivel.
- **FR-004**: Si el conjuro de mayor nivel del personaje es de nivel N (entre 1 y 9), el sistema DEBE mostrar exactamente los niveles del 1 al N, ni uno más ni uno menos.
- **FR-005**: El componente de monitor de salud (`HealthTracker`) DEBE incluir un modo compacto seleccionable por el usuario.
- **FR-006**: En modo compacto, el monitor de salud DEBE mostrar únicamente los puntos de vida actuales, puntos de vida máximos, puntos temporales (si existen), barra gráfica de vida y estado de consciencia, ocultando toda la botonera de daño y curación rápida.
- **FR-007**: El monitor de salud DEBE permitir alternar entre el modo compacto y el modo completo de combate mediante un toque accesible (área táctil >= 44x44px).
- **FR-008**: Las preferencias de visualización (modo compacto de salud y visibilidad de magia) DEBEN guardarse en el almacenamiento local del dispositivo para mantenerse entre sesiones o recargas.
- **FR-009**: Al pulsar el botón "+ Añadir" en la lista de recursos, el modal de creación DEBE preseleccionar automáticamente la categoría según la pestaña de filtro activa ("Conjuro" si la pestaña activa es Conjuros; "Rasgo / Dote" si la pestaña activa es Rasgos).

### Key Entities

- **Modo de Visualización de Salud (HealthDisplayMode)**: Estado booleano o enum (`'compact'` | `'expanded'`) que gobierna la visibilidad de los controles de daño/curación.
- **Preferencia de Magia Activa (MagicVisibilityState)**: Estado booleano que determina si la sección de espacios de magia se muestra o permanece oculta para personajes no lanzadores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para personajes marciales sin magia, la pantalla inicial no muestra ningún espacio o casilla de conjuro, reduciendo la carga cognitiva visual en un 100% respecto a elementos mágicos.
- **SC-002**: El modo compacto de salud reduce la altura del monitor de puntos de vida en más de un 60%, permitiendo ver la vida y los recursos simultáneamente en pantallas de 360px.
- **SC-003**: La conmutación entre modo compacto y modo de combate se produce en menos de 50 milisegundos sin retrasos perceptibles.
- **SC-004**: El 100% de los botones y áreas táctiles de alternancia cumplen con el tamaño mínimo ergonómico de 44x44px.
- **SC-005**: Las preferencias de plegado persisten de forma exacta tras reiniciar o recargar el navegador.

## Assumptions

- **Estado inicial para personajes nuevos**: Todo personaje nuevo inicia con salud en modo completo de combate (para facilitar la configuración inicial de PG máximos) y con magia oculta hasta que se añada un conjuro o se active manualmente.
- **Accesibilidad táctil**: Plegar los controles de daño evita pulsaciones accidentales mientras el móvil está sobre la mesa de juego durante tiradas de dados.
