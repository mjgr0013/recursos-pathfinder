<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 (MINOR Amendment)
- Core Principles Ratified & Amended:
  1. I. Arquitectura 100% Client-Side (GitHub Pages)
  2. II. Persistencia Local, Roster Multi-Personaje y Respaldo Agregado (Offline-First)
  3. III. Enfoque Mobile-First y UX Táctil
  4. IV. Stack Tecnológico Ligero y Tipado Estricto
  5. V. Integridad de Datos y Testing Desacoplado
  6. VI. Dualidad Digital y Ficha Física en Papel (Print-Ready / PDF)
- Added sections:
  - VI. Dualidad Digital y Ficha Física en Papel (Print-Ready / PDF)
- Modified sections:
  - II. Persistencia Local, Roster Multi-Personaje y Respaldo Agregado
  - Restricciones Técnicas y de Rendimiento (Adición de Economía de Impresión)
  - Flujo de Desarrollo y Criterios de Calidad (Adición de Auditoría de Salida Impresa)
- Follow-up TODOs: None
-->

# Recursos Pathfinder Constitution

## Core Principles

### I. Arquitectura 100% Client-Side (GitHub Pages)
- La aplicación DEBE ser completamente estática y ejecutarse exclusivamente en el navegador del cliente sin dependencias de backend, APIs propietarias ni servidores intermedios.
- La configuración del empaquetador (Vite) DEBE fijar rutas relativas (`base: './'`) para garantizar portabilidad inmediata y compatibilidad directa con despliegues en subdirectorios de GitHub Pages.
- **Razón**: Asegura coste cero de infraestructura, disponibilidad garantizada, portabilidad total y despliegues continuos sin requerir mantenimiento de servidores.

### II. Persistencia Local, Roster Multi-Personaje y Respaldo Agregado (Offline-First)
- Todos los datos de personajes y partidas DEBEN persistirse de forma local en el navegador del usuario bajo una arquitectura Offline-First.
- El sistema DEBE soportar un catálogo de personajes (roster multi-personaje) permitiendo alternar, crear, duplicar y eliminar fichas con persistencia aislada y robusta.
- Las imágenes y avatares DEBEN gestionarse de manera eficiente en almacenamiento local (IndexedDB o LocalStorage optimizado con compresión/redimensionado previo mediante Canvas) para no exceder las cuotas de almacenamiento del navegador.
- Toda la estructura de datos DEBE contar con mecanismos deterministas de exportación e importación en formato JSON estandarizado, soportando tanto copias de seguridad individuales como el volcado y restauración íntegro del roster completo.
- **Razón**: Permite juego ininterrumpido en entornos sin cobertura de red o en modo avión durante partidas en vivo, facilitando la gestión de múltiples personajes y garantizando la soberanía absoluta de los datos del usuario.

### III. Enfoque Mobile-First y UX Táctil
- El diseño y maquetación DEBEN priorizar pantallas móviles compactas (a partir de 360px de ancho) con layout responsive adaptado al uso ergonómico con una sola mano durante partidas de rol de mesa.
- Todos los elementos interactivos (botones de incremento/decremento de recursos, selección y gasto de conjuros, contadores de puntos de vida) DEBEN tener un área táctil mínima de 44x44px.
- Las acciones interactivas DEBEN proporcionar respuesta visual inmediata tras el toque del usuario para evitar dobles pulsaciones y confirmar el cambio de estado en la mesa.
- **Razón**: En una sesión presencial de Pathfinder el espacio físico es reducido y el jugador opera desde el móvil; una interfaz táctil clara y ágil evita errores costosos y agiliza los turnos.

### IV. Stack Tecnológico Ligero y Tipado Estricto
- El código DEBE implementarse en TypeScript en modo estricto (`strict: true`), declarando tipos e interfaces explícitos para cada entidad de Pathfinder (personaje, conjuro, rasgo, recurso, espacio de conjuro).
- La interfaz DEBE desarrollarse en React (o Vanilla TS / Preact según se defina en el plan arquitectónico) complementado con Tailwind CSS para utilidades de estilo ligeras.
- Se PROHÍBE terminantemente el uso de librerías externas pesadas cuando las Web APIs nativas resuelvan la tarea (como `FileReader` para subida de archivos, `Canvas` para compresión y eventos táctiles nativos del DOM).
- **Razón**: Minimiza el tamaño del bundle, reduce los tiempos de carga en redes móviles modestas y garantiza un código robusto, predecible y fácil de mantener.

### V. Integridad de Datos y Testing Desacoplado
- Toda función de cálculo matemático y mutación de estado (consumo de usos, control y límites de puntos de vida mínimos/máximos, reseteo de recursos tras descansos cortos/largos, interpolación de variables de nivel) DEBE estar estrictamente desacoplada de la vista en funciones puras.
- Todas las funciones de lógica de negocio y cálculo DEBEN contar con pruebas unitarias exhaustivas automatizadas con Vitest.
- Ninguna regla o función de cálculo se considerará completada sin su correspondiente suite de tests en verde.
- **Razón**: La precisión matemática es vital para la experiencia de juego; separar la lógica de la UI facilita pruebas exhaustivas, rápidas y a prueba de regresiones.

### VI. Dualidad Digital y Ficha Física en Papel (Print-Ready / PDF)
- La aplicación DEBE ofrecer una experiencia de salida impresa de primera clase para aquellos jugadores que prefieren o combinan el uso de fichas en papel físico durante la sesión de juego.
- Todos los componentes y vistas de recursos DEBEN definir reglas específicas de impresión (`@media print` / `print:*`) que transformen la interfaz interactiva en una ficha formal de mesa:
  - Los botones interactivos de acción digital (lanzar conjuros, incrementar o restar usos, abrir modales, buscadores) DEBEN ocultarse en la salida impresa.
  - Los recursos con usos contables (ej. rasgos diarios) DEBEN sustituir sus contadores digitales por casillas cuadradas analógicas para marcar a lápiz.
  - La tipografía en la versión impresa DEBE ser compacta (tamaño base de 12px) y la maquetación debe aprovechar el ancho disponible (evitando sangrías y separadores redundantes) para optimizar el consumo de papel.
  - Todo elemento de contenido (tarjetas de recurso, bloques de salud, tablas de descripción) DEBE evitar cortes huérfanos entre páginas mediante `break-inside: avoid`.
- **Razón**: Respeta la cultura del juego de rol tradicional donde muchos jugadores y directores de juego imprimen sus fichas para anotar con lápiz y dados físicos, asegurando que la herramienta sea tan útil en papel como en la pantalla de un móvil.

## Restricciones Técnicas y de Rendimiento

- **Autonomía Operativa**: Ninguna funcionalidad central puede depender de conectividad a Internet posterior a la descarga de los assets estáticos.
- **Gestión de Cuotas de Memoria**: Las imágenes cargadas por el usuario deben ser procesadas y comprimidas en el cliente antes de su persistencia para mantener el almacenamiento dentro de límites seguros en cualquier navegador móvil.
- **Eficiencia de Bundle**: Se deben priorizar las APIs estándar de la plataforma web frente a paquetes de npm para mantener el bundle final liviano y rápido de procesar en dispositivos móviles de gama baja y media.
- **Economía de Impresión**: Las hojas de estilo de impresión deben neutralizar fondos oscuros pesados a fondos blancos con texto de alto contraste (`#0f172a`), garantizando un consumo eficiente de tinta y tóner.

## Flujo de Desarrollo y Criterios de Calidad

- **Verificación Estricta de Tipos**: Todo cambio debe compilar limpiamente bajo `tsc --noEmit` sin supresiones artificiales (`any`, `@ts-ignore`) ni advertencias de tipo.
- **Validación Automatizada**: Toda modificación en la lógica de cálculo debe ejecutar y pasar la suite de pruebas unitarias en Vitest antes de fusionarse.
- **Auditoría de Usabilidad Móvil**: Las interfaces añadidas o modificadas deben validarse en viewports de 360px de ancho y comprobar que los hitboxes táctiles cumplan con el estándar mínimo de 44x44px.
- **Auditoría de Salida Impresa**: Todo nuevo recurso o componente visible debe comprobar su renderizado en modo impresión (`window.print()` / PDF), asegurando la ocultación de controles interactivos y la correcta presentación de casillas analógicas y textos compactos.

## Governance

- **Autoridad Suprema**: Esta constitución es el estándar normativo de mayor rango del proyecto `Recursos Pathfinder`. Toda especificación (`spec.md`), plan de implementación (`plan.md`) y código fuente debe adherirse estrictamente a sus mandatos.
- **Procedimiento de Enmienda**: Cualquier modificación a los principios o directrices requiere una propuesta formal motivada, detallando justificación, impacto técnico y plan de migración.
- **Política de Versionado Semántico**:
  - **MAJOR**: Cambios incompatibles, eliminación o redefinición sustancial de principios de gobierno (ej. introducir un backend obligatorio o eliminar la persistencia offline).
  - **MINOR**: Incorporación de nuevos principios o ampliación material de las directrices y estándares sin invalidar los existentes.
  - **PATCH**: Correcciones tipográficas, refinamiento de redacción o clarificaciones que no alteren el alcance normativo.
- **Verificación de Cumplimiento**: Todas las revisiones y pull requests deben validar activamente la conformidad con cada uno de los principios antes de su aprobación final.

**Version**: 1.1.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-11-09
