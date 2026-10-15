# Feature Specification: Pathfinder Character Resource Tracker

**Feature Branch**: `001-character-resource-tracker`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Crear una aplicación web para la gestión de recursos de un personaje de Pathfinder en tiempo real durante una partida. Requisitos principales: 1. Perfil del personaje: Nombre, nivel, clase y foto de avatar con subida de archivo local. 2. Monitor de Puntos de Vida (PG): Puntos de vida actuales, máximos, temporales y control rápido de daño/curación. 3. Rastreador de Rasgos y Conjuros: - Capacidad de crear elementos clasificados como 'Conjuro' o 'Rasgo/Dote'. - Modo de uso: Limitado (con casillas/contador de usos máximos y disponibles) o Ilimitado (pasivo/a voluntad). - Botón rápido para gastar o recuperar usos. - Campo de texto enriquecido o descripción larga para detallar las reglas del efecto. - Opción de 'Descanso largo' para restaurar todos los recursos diarios a su valor máximo. 4. Exportar/Importar ficha de personaje en formato JSON para guardar copias de seguridad."

## Clarifications

### Session 2026-10-15

- Q: ¿Debe la acción de "Descanso Largo" restaurar también los Puntos de Vida actuales al máximo, o debe limitar su efecto a restablecer los conjuros/rasgos y limpiar los PG temporales? → A: Opción B (Restauración total automática: Restaura al 100% todos los recursos diarios limitados, restablece los PG actuales al valor de PG máximos y limpia los PG temporales a 0).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestión de Perfil y Monitor de Salud en Tiempo Real (Priority: P1)

Como jugador de rol en una partida en vivo de Pathfinder, quiero configurar los datos básicos de mi personaje (nombre, clase, nivel, avatar) y monitorear mis puntos de vida (actuales, máximos, temporales) con controles rápidos de daño y curación para mantener el ritmo del combate sin perder tiempo haciendo cálculos manuales.

**Why this priority**: La identidad del personaje y el control de puntos de vida constituyen el núcleo vital (MVP) indispensable para cualquier sesión de rol; sin ellos, el jugador no puede participar activamente en el combate ni registrar su supervivencia.

**Independent Test**: Puede probarse de forma aislada creando un personaje con avatar, nivel y clase, estableciendo 30 PG máximos y 5 PG temporales, aplicando 10 puntos de daño rápido (verificando que se descuenten primero los temporales y luego los actuales) y aplicando curación rápida (verificando que no supere el máximo).

**Acceptance Scenarios**:

1. **Given** un nuevo jugador sin ficha activa, **When** introduce el nombre "Valeros", nivel 3, clase "Guerrero" y selecciona una imagen local como avatar, **Then** la ficha muestra el perfil completo con su avatar visual y datos asociados.
2. **Given** un personaje con 25 PG actuales, 30 PG máximos y 0 PG temporales, **When** el jugador recibe 8 puntos de daño rápido, **Then** los PG actuales se actualizan inmediatamente a 17 PG.
3. **Given** un personaje con 15 PG actuales y 10 PG temporales, **When** el jugador recibe 12 puntos de daño, **Then** los PG temporales se reducen a 0 y los PG actuales se reducen a 13 PG.
4. **Given** un personaje con 20 PG actuales de 30 PG máximos, **When** el jugador aplica una curación de 15 puntos, **Then** los PG actuales alcanzan 30 PG (el máximo) y no se desborda el límite.

---

### User Story 2 - Rastreo Dinámico de Conjuros y Rasgos de Uso Limitado o Ilimitado (Priority: P2)

Como jugador, quiero registrar mis conjuros preparados y rasgos/dotes clasificándolos según su frecuencia de uso (limitados con contador de usos o ilimitados/pasivos), consultando sus reglas detalladas y modificando sus usos disponibles con un solo toque para gestionar mis habilidades con precisión durante los encuentros.

**Why this priority**: La gestión de hechizos por día y habilidades con usos limitados (como Canalizar Energía, Furia o Poderes de Dominio) es la razón de ser de un rastreador de recursos en Pathfinder una vez asegurada la supervivencia básica.

**Independent Test**: Puede probarse de forma independiente registrando un conjuro "Proyectil Mágico" con 3 usos máximos y un rasgo "Ataque Poderoso" marcado como ilimitado; se descuenta 1 uso del conjuro mediante el botón rápido y se valida que el contador pase a 2/3, mientras que el rasgo ilimitado muestra sus reglas sin contador numérico de consumo.

**Acceptance Scenarios**:

1. **Given** un personaje creado, **When** el jugador añade un nuevo elemento clasificado como "Conjuro", titulado "Curar Heridas Leves", de tipo Limitado con 4 usos máximos y descripción de sus reglas, **Then** el recurso aparece listado con 4/4 usos disponibles y acceso a su descripción completa.
2. **Given** un recurso limitado con 3 usos disponibles de 4 máximos, **When** el jugador pulsa el botón rápido de gasto (-1 uso), **Then** el recurso pasa a mostrar inmediatamente 2 usos disponibles.
3. **Given** un recurso limitado con 2 usos disponibles de 4 máximos, **When** el jugador pulsa el botón rápido de recuperación (+1 uso), **Then** el recurso pasa a mostrar inmediatamente 3 usos disponibles sin exceder el máximo de 4.
4. **Given** un jugador que añade una dote pasiva, **When** crea un elemento clasificado como "Rasgo/Dote" configurado como "Ilimitado", **Then** el elemento se visualiza como habilidad permanente a voluntad, sin casillas de consumo diario pero con su descripción de reglas desplegable.

---

### User Story 3 - Descanso Largo para Restauración Masiva de Recursos (Priority: P3)

Como jugador que finaliza una jornada de aventuras dentro de la ficción de la partida, quiero activar la acción de "Descanso Largo" para que todos mis conjuros y rasgos con usos diarios limitados y mis puntos de vida se restablezcan automáticamente a su capacidad máxima sin tener que modificar manualmente cada elemento uno por uno.

**Why this priority**: Reduce la fatiga administrativa entre sesiones o cambios de día dentro de la partida, eliminando errores de conteo y asegurando que la ficha esté lista para la siguiente jornada de aventuras con un único clic.

**Independent Test**: Puede probarse configurando múltiples recursos limitados con diversos niveles de consumo (ej. 0/3, 1/4), PG actuales reducidos (ej. 10/30) y 5 PG temporales, activando la opción de "Descanso Largo", verificando que tras la acción todos los recursos regresen a sus valores máximos (3/3, 4/4), los PG actuales vuelvan a 30 y los temporales a 0.

**Acceptance Scenarios**:

1. **Given** múltiples recursos de tipo "Conjuro" y "Rasgo/Dote" con usos disponibles menores que sus valores máximos, **When** el jugador selecciona y confirma la acción de "Descanso Largo", **Then** todos los recursos de uso limitado restauran sus usos disponibles al 100% de su capacidad máxima.
2. **Given** un personaje con puntos de vida actuales reducidos y puntos de vida temporales activos al finalizar el día, **When** se completa el Descanso Largo, **Then** los puntos de vida actuales se restablecen al 100% de los puntos de vida máximos y los puntos de vida temporales se reinician a 0.
3. **Given** que el jugador pulsa accidentalmente el botón de Descanso Largo durante una partida, **When** aparece el aviso de confirmación y el usuario cancela la acción, **Then** los recursos y puntos de vida mantienen intactos sus valores actuales sin alteración.

---

### User Story 4 - Respaldo, Portabilidad y Recuperación de Ficha (Priority: P4)

Como jugador, quiero exportar la ficha completa de mi personaje en un archivo descargable y poder importarla en cualquier momento o dispositivo para salvaguardar mi progreso contra pérdidas accidentales de datos o para transferir mi personaje entre diferentes dispositivos.

**Why this priority**: Brinda seguridad y soberanía sobre los datos creados por el usuario, permitiendo conservar copias de seguridad de campañas extensas y facilitando el traspaso de fichas entre dispositivos sin depender de servidores externos.

**Independent Test**: Puede probarse creando una ficha con perfil completo, avatar, puntos de vida y 3 recursos, descargando el archivo de respaldo, limpiando los datos de la aplicación y volviendo a importar el archivo para constatar que el 100% de los datos y el avatar se restauran idénticamente.

**Acceptance Scenarios**:

1. **Given** un personaje con datos de perfil, imagen de avatar, registro de PG y lista de recursos configurados, **When** el usuario ejecuta la acción "Exportar Personaje", **Then** el sistema genera y descarga un archivo en formato JSON que contiene el estado completo del personaje.
2. **Given** un archivo de respaldo JSON válido previamente generado, **When** el usuario selecciona dicho archivo a través de la opción "Importar Personaje", **Then** el sistema valida su estructura, restaura todos los datos y actualiza inmediatamente la interfaz con el personaje importado.
3. **Given** un archivo de importación dañado, incompleto o con formato no reconocido, **When** el usuario intenta cargarlo en el sistema, **Then** el sistema rechaza la importación, muestra un mensaje descriptivo del error y conserva el estado previo sin corromper la ficha activa.

---

### Edge Cases

- **Daño masivo superior a los PG totales**: Si un personaje con 10 PG actuales y 5 temporales recibe 25 de daño, los temporales se agotan por completo (0) y los actuales se reducen a 0 (o al valor negativo correspondiente si se configuran reglas de agonía), notificando al usuario que el personaje ha caído inconsciente o en estado crítico.
- **Sobrecuración**: Al aplicar un valor de curación superior a la diferencia entre los PG actuales y máximos, los PG actuales deben topar estrictamente en el valor máximo sin incrementarlo ni convertir el exceso en PG temporales.
- **Límites de pulsación en recursos**: Al intentar gastar un recurso que ya tiene 0 usos disponibles, el botón de gasto debe quedar inactivo o no producir ningún efecto negativo; igualmente, no se puede recuperar usos por encima del valor máximo configurado.
- **Tamaño o formato anómalo de avatar**: Si el usuario sube un archivo no compatible (como un PDF) o una imagen de alta resolución, el sistema debe rechazar formatos no gráficos o procesar y optimizar la imagen para que no sature la memoria disponible del navegador del usuario.
- **Persistencia ante recarga involuntaria**: Si el navegador se cierra o la pestaña se recarga en mitad de un combate, todos los cambios recientes (daño recibido, recursos consumidos, notas añadidas) deben permanecer intactos al reabrir la aplicación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir registrar y actualizar los datos principales de perfil del personaje: Nombre, Nivel (entero positivo mayor o igual a 1) y Clase.
- **FR-002**: El sistema DEBE permitir seleccionar y cargar una imagen gráfica local del dispositivo para utilizarla como avatar visual del personaje.
- **FR-003**: El sistema DEBE gestionar el estado de salud del personaje mediante tres variables numéricas: Puntos de Vida Máximos (mayor a 0), Puntos de Vida Actuales (acotados entre 0 y el valor máximo) y Puntos de Vida Temporales (mayor o igual a 0).
- **FR-004**: El sistema DEBE proveer controles de acción rápida para aplicar daño entrante (descontando primero de los PG temporales y el remanente de los PG actuales) y aplicar curación (aumentando los PG actuales sin rebasar los PG máximos).
- **FR-005**: El sistema DEBE permitir registrar, modificar y eliminar elementos de recursos categorizados como "Conjuro" o "Rasgo/Dote".
- **FR-006**: Cada recurso DEBE configurarse obligatoriamente bajo uno de dos modos de uso: "Limitado" (con definición de usos máximos diarios y usos disponibles en tiempo real) o "Ilimitado" (habilidad pasiva o de uso a voluntad sin límite numérico).
- **FR-007**: Para todo recurso clasificado como "Limitado", el sistema DEBE disponer de controles interactivos directos para gastar (-1 uso) y restaurar (+1 uso) de forma individual.
- **FR-008**: Cada recurso DEBE incluir un campo de descripción detallada o texto enriquecido que permita consultar e ingresar las reglas mecánicas, alcance, duración o condiciones del conjuro o rasgo.
- **FR-009**: El sistema DEBE proporcionar una funcionalidad explícita de "Descanso Largo" que restablezca automáticamente todos los recursos limitados a sus usos máximos configurados, restaure los Puntos de Vida actuales al 100% de los Puntos de Vida máximos y limpie los puntos de vida temporales a 0, requiriendo confirmación del usuario para evitar activaciones accidentales.
- **FR-010**: El sistema DEBE permitir exportar toda la información de la ficha del personaje (perfil, avatar, puntos de vida, conjuros, rasgos y estado de usos) en un archivo descargable con formato estandarizado JSON.
- **FR-011**: El sistema DEBE permitir importar un archivo JSON de respaldo, verificando la validez de su estructura antes de sobrescribir el personaje activo y ofreciendo mensajes claros en caso de archivo corrupto o inválido.
- **FR-012**: El sistema DEBE guardar automáticamente cualquier modificación en el almacenamiento local del dispositivo (Offline-First), garantizando la persistencia total de los datos sin necesidad de conectividad a Internet.

### Key Entities

- **Personaje (Character)**: Representa la entidad principal del jugador. Atributos esenciales: identificador único, nombre, nivel, clase, fecha de última modificación e información de avatar.
- **Registro de Salud (Health Record)**: Modela el estado físico del personaje durante la partida. Atributos: puntos de vida máximos, puntos de vida actuales, puntos de vida temporales y estado de consciencia (consciente, agonizante, caído).
- **Recurso (Resource Item)**: Representa una habilidad, conjuro o rasgo gestionable. Atributos: identificador único, nombre, categoría ("Conjuro" o "Rasgo/Dote"), modo de uso ("Limitado" o "Ilimitado"), usos máximos (si es limitado), usos disponibles actuales (si es limitado) y texto descriptivo con las reglas de aplicación.
- **Archivo de Respaldo (Backup Payload)**: Estructura de intercambio de datos en formato JSON que encapsula la versión del esquema, la entidad Personaje, su Registro de Salud, la colección completa de Recursos y la representación del avatar para su almacenamiento o transferencia externa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los jugadores pueden aplicar daño o curación y ver reflejado el cambio de salud en menos de 2 segundos mediante controles directos de un solo toque.
- **SC-002**: El gasto o recuperación de un uso de conjuro o rasgo se completa en menos de 1 segundo con respuesta táctil y visual inmediata.
- **SC-003**: La ejecución de un Descanso Largo restaura el 100% de los recursos limitados y los puntos de vida actuales a sus valores máximos de forma instantánea y verificable.
- **SC-004**: La exportación y posterior importación de una ficha de personaje mantiene una tasa de integridad de datos del 100% (cero pérdida de atributos, recursos o imágenes de avatar).
- **SC-005**: La interfaz de usuario es 100% funcional y legible en dispositivos móviles a partir de 360px de ancho de pantalla, ofreciendo áreas táctiles cómodas para operar con una sola mano durante la mesa de juego.
- **SC-006**: La aplicación opera al 100% de sus capacidades en modo desconectado (offline) sin depender de servidores o llamadas de red externas.

## Assumptions

- **Reglamento agnóstico a cálculos complejos**: La aplicación actúa como un rastreador ágil en mesa; el jugador o director de juego establece y ajusta libremente los valores máximos de puntos de vida y recursos sin requerir un motor automático completo que calcule bonificadores derivados de reglas complejas de Pathfinder.
- **Almacenamiento en el dispositivo**: Todos los datos residen localmente en el navegador del usuario bajo el principio de privacidad y soberanía de datos, sin necesidad de crear cuentas ni iniciar sesión.
- **Gestión de avatar liviana**: Las imágenes cargadas localmente por el usuario se adaptan para su visualización y persistencia local sin requerir servicios de alojamiento en la nube.
- **Un solo personaje activo por sesión**: El flujo principal está diseñado para la gestión enfocada de un personaje a la vez durante una partida en vivo, utilizando la importación/exportación para alternar entre diferentes personajes si fuera necesario.
