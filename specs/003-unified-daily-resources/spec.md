# Feature Specification: Unified Daily Resources & Dynamic Spell Slots

**Feature Branch**: `003-unified-daily-resources`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "quiero que los espacios de conjuro aparezcan de forma dinámica, es decir, si tengo conjuros de nivel 5, aparecerá hasta el nivel 5, no como ahora que aparece hasta el 9 por defecto. Los rasgos si que tienen usos distintos a los de los conjuros, así que hay que especificar el máximo de usos. La información de los usos de rasgos disponibles tiene que aparecer junto con los espacios de conjuro, unificando ambas informaciones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización Dinámica de Espacios de Conjuro según Nivel Activo (Priority: P1)

Como jugador lanzador de conjuros en una partida de Pathfinder, quiero que el monitor de espacios de conjuros muestre únicamente los niveles de conjuro que mi personaje realmente utiliza (hasta el nivel máximo de los conjuros que poseo o que he configurado), en lugar de mostrar los 9 niveles por defecto, para ahorrar espacio en la pantalla de mi smartphone y evitar distracciones con niveles superiores que aún no puedo lanzar.

**Why this priority**: La interfaz móvil en partidas de rol en vivo tiene espacio vertical limitado; mostrar 9 niveles cuando un personaje de nivel bajo o medio solo usa niveles 1, 2 o 3 satura la pantalla con cajas vacías e irrelevantes.

**Independent Test**: Puede probarse creando un personaje que solo tenga conjuros de nivel 1 y 2 (o configurando espacios máximos en niveles 1 y 2); verificar que el panel solo renderice las tarjetas de nivel 1 y nivel 2, ocultando los niveles del 3 al 9. Al añadir posteriormente un conjuro de nivel 4, el panel debe expandirse automáticamente para mostrar hasta el nivel 4.

**Acceptance Scenarios**:

1. **Given** un personaje que únicamente tiene conjuros registrados de nivel 1 y nivel 2, **When** el jugador consulta los espacios de conjuro, **Then** el panel muestra de forma dinámica exclusivamente los niveles 1 y 2, sin mostrar cajas vacías para los niveles 3 al 9.
2. **Given** un personaje cuyo conjuro de mayor nivel es de nivel 4, **When** el usuario crea un nuevo conjuro de nivel 5, **Then** la vista de espacios de conjuros se adapta automáticamente para incluir la fila del nivel 5.
3. **Given** un personaje recién creado sin conjuros, **When** el usuario abre la aplicación, **Then** el sistema muestra por defecto como mínimo el nivel 1 y provee un control intuitivo para habilitar o añadir el siguiente nivel de magia según progrese el personaje.
4. **Given** que el usuario reduce o elimina los conjuros de nivel superior sin dejar espacios configurados en ellos, **When** la lista se actualiza, **Then** la vista contrae su rango máximo para ajustarse al nuevo nivel más alto en uso.

---

### User Story 2 - Panel Unificado de Recursos Diarios (Espacios y Rasgos Limitados) (Priority: P2)

Como jugador de rol en mesa, quiero contar con un panel unificado de "Recursos Diarios" que agrupe en un único vistazo tanto mis espacios de conjuros disponibles (por nivel dinámico) como los usos disponibles de mis rasgos y dotes limitados (con sus usos máximos configurados), para tener el control total de todos mis recursos gastables del día en un solo lugar de la pantalla.

**Why this priority**: Durante una partida presencial el jugador no debe navegar entre múltiples pantallas o secciones dispersas para saber si le quedan usos de "Canalizar Energía" o espacios de "Nivel 2"; unificar todos los recursos diarios finitos maximiza la agilidad del turno de combate.

**Independent Test**: Puede probarse configurando 3/3 espacios de conjuro de nivel 1, y dos rasgos: "Canalizar Energía" (4/5 usos) y "Furia Bárbara" (10/12 usos); verificar que ambos tipos de recursos aparezcan juntos en el panel superior unificado con sus contadores respectivos y controles de gasto/recuperación accesibles.

**Acceptance Scenarios**:

1. **Given** un personaje con espacios de magia activos y rasgos con usos limitados, **When** el usuario observa el panel de recursos diarios, **Then** visualiza en un mismo componente cohesivo: la sección de espacios de conjuros (niveles dinámicos) y la lista de contadores de rasgos diarios (disponibles/máximos).
2. **Given** un rasgo configurado en modo "Ilimitado" (pasivo / a voluntad), **When** se renderiza el panel unificado de recursos diarios, **Then** dicho rasgo NO aparece en este panel (al no ser un recurso gastable finito), manteniéndose visible únicamente en el listado general descriptivo.
3. **Given** un rasgo de uso limitado en el panel unificado, **When** el jugador pulsa su botón de gasto (-1), **Then** el contador del rasgo se descuenta de forma inmediata tanto en el panel unificado como en su tarjeta detallada.
4. **Given** un conjuro y un rasgo ambos en 0 usos disponibles, **When** el usuario confirma la acción de "Descanso Largo", **Then** todos los espacios de conjuros dinámicos y todos los rasgos limitados unificados se recargan al 100% de sus valores máximos.

---

### User Story 3 - Edición y Ajuste Rápido de Usos Máximos de Rasgos (Priority: P3)

Como jugador que sube de nivel o adquiere bonificadores (por ejemplo, aumentando su bonificador de Carisma que incrementa sus usos de Canalizar Energía), quiero poder ajustar de forma rápida y accesible el número de usos máximos de cualquier rasgo limitado desde el panel unificado o desde su tarjeta, garantizando que el sistema guarde el cambio sin alterar los usos ya consumidos.

**Why this priority**: Los rasgos de clase en Pathfinder derivan sus usos de características del personaje (ej. 3 + Carisma al día); permitir modificar el máximo fácilmente asegura que la ficha se mantenga al día conforme cambian las estadísticas del personaje.

**Independent Test**: Puede probarse teniendo "Canalizar Energía" con 3 usos disponibles de 4 máximos; se editan los usos máximos a 5, comprobando que ahora muestra 3/5 usos sin resetear los usos consumidos.

**Acceptance Scenarios**:

1. **Given** un rasgo limitado con 2 usos disponibles y 4 máximos, **When** el usuario edita sus usos máximos a 5, **Then** el nuevo valor se almacena y el estado se actualiza a 2/5 usos.
2. **Given** un rasgo limitado con 4 usos disponibles y 4 máximos, **When** el usuario reduce sus usos máximos a 3, **Then** los usos disponibles se ajustan automáticamente a 3/3 para no superar el nuevo tope.
3. **Given** el formulario de creación de un nuevo rasgo de tipo "Rasgo/Dote" con modo "Limitado", **When** el jugador lo configura, **Then** el sistema exige introducir de forma clara el número de usos máximos diarios iniciales (entero >= 1).

---

### Edge Cases

- **Personaje sin conjuros ni magia (ej. Guerrero no lanzador)**: Si el personaje no posee ningún conjuro registrado ni espacios configurados, la subsección de espacios de conjuro debe mostrarse oculta o colapsada limpiamente, mostrando únicamente los rasgos limitados que posea (ej. Segundo Aire, Dotes).
- **Adición de conjuro con nivel superior al actual visible**: Si el panel está mostrando hasta nivel 2 y el usuario añade un conjuro de nivel 5, el panel debe recalcular inmediatamente el nivel máximo activo y desplegar los niveles del 1 al 5 sin requerir recargar la página.
- **Rasgos con 0 usos máximos configurados accidentalmente**: El sistema debe impedir o validar que los usos máximos de un rasgo limitado sean un entero estrictamente mayor o igual a 1.
- **Consumo simultáneo**: Al interactuar rápidamente con botones de gasto de conjuros y rasgos en el panel unificado, la reactividad del estado no debe generar carreras ni perder actualizaciones parciales.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE calcular dinámicamente el nivel máximo de conjuros a mostrar (`maxActiveSpellLevel`), determinado como el valor máximo entre: el nivel más alto de los conjuros registrados por el personaje y el nivel más alto que tenga `maxSlots > 0`.
- **FR-002**: El panel de espacios de conjuros DEBE renderizar únicamente los niveles comprendidos entre el nivel 1 y el nivel máximo activo calculado (`maxActiveSpellLevel`), ocultando por defecto los niveles superiores no utilizados.
- **FR-003**: El sistema DEBE proveer un control táctil accesible para añadir/habilitar el siguiente nivel de conjuro manualmente si el jugador desea preconfigurar espacios antes de registrar conjuros.
- **FR-004**: Si el personaje no posee conjuros ni espacios máximos mayores a 0 en ningún nivel, el sistema DEBE mostrar un estado minimalista o un valor base de nivel 1 con opción rápida de configuración.
- **FR-005**: El sistema DEBE unificar la información de todos los recursos diarios finitos en un panel común de "Recursos Diarios" ubicado en la vista principal.
- **FR-006**: El panel unificado de recursos diarios DEBE mostrar juntos: los espacios de conjuros activos (por nivel dinámico) y todos los recursos de categoría "Rasgo/Dote" configurados en modo "Limitado".
- **FR-007**: Para cada rasgo limitado mostrado en el panel unificado, el sistema DEBE indicar su nombre, sus usos disponibles actuales y sus usos máximos diarios configurados (`availableUses / maxUses`).
- **FR-008**: Los recursos en modo "Ilimitado" (pasivos o a voluntad) NO DEBEN mostrarse en el panel unificado de recursos diarios finitos, manteniéndose exclusivamente en el catálogo general.
- **FR-009**: El panel unificado DEBE proveer botones interactivos táctiles (con área mínima de 44x44px) para gastar (-1) y recuperar (+1) tanto espacios de conjuro como usos de rasgos limitados con respuesta visual inmediata.
- **FR-010**: Al confirmar un "Descanso Largo", el sistema DEBE restaurar simultáneamente al 100% todos los espacios de conjuros dinámicos y todos los usos disponibles de los rasgos limitados unificados.

### Key Entities

- **Panel de Recursos Diarios Unificado (UnifiedDailyResources)**: Componente orquestador que presenta en un único bloque visual los espacios de conjuro por nivel dinámico y la lista de rasgos limitados diarios.
- **Espacio de Conjuro Dinámico (DynamicSpellSlot)**: Representación visual adaptativa de cada nivel de conjuro (1 a N, donde N es el nivel máximo activo).
- **Rasgo Diario Finito (LimitedTraitSummary)**: Resumen interactivo de un rasgo de uso limitado dentro del panel diario (identificador, nombre, disponibles, máximos, botones rápidos de gasto y recuperación).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En personajes de nivel bajo o medio (ej. que solo lanzan conjuros de nivel 1 a 3), el área vertical ocupada por los espacios de conjuros se reduce en al menos un 50% al ocultar los niveles 4 al 9.
- **SC-002**: El jugador puede consultar todos sus recursos diarios disponibles (tanto espacios de magia como usos de dotes/habilidades) en una única pantalla sin necesidad de hacer scroll extenso.
- **SC-003**: Cualquier acción de gasto o recuperación ejecutada desde el panel unificado actualiza el estado y la interfaz en menos de 100 milisegundos.
- **SC-004**: El 100% de los elementos interactivos en el panel unificado cumplen con el estándar ergonómico táctil de al menos 44x44px.
- **SC-005**: Al añadir un conjuro de un nivel no mostrado previamente, el panel se expande dinámicamente de forma automática en 0 recargas de página.

## Assumptions

- **Nivel mínimo de visualización mágica**: Cuando un personaje tiene magia activa, el nivel base mínimo visible es el nivel 1. Si no tiene conjuros ni espacios, la subsección de magia se muestra recogida para dar protagonismo a los rasgos.
- **Exclusión de recursos ilimitados**: Las habilidades pasivas o trucos a voluntad no tienen contador diario que gestionar; excluirlas del panel unificado mantiene limpio el espacio para lo que realmente se agota durante el combate.
