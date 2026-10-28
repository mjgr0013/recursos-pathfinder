# Quickstart & Verification Guide: Edición de Rasgos y Conjuros, Botón Ver Más y Ancho Completo en Recursos Diarios

**Feature**: `007-edit-traits-and-spells`
**Date**: 2026-10-28
**Status**: Ready

## 1. Comandos de Validación Automatizada

```bash
# 1. Ejecutar tests unitarios (incluyendo la nueva suite de updateResourceDetails)
npm test

# 2. Comprobar tipado estricto
npx tsc --noEmit

# 3. Compilar bundle para producción / GitHub Pages
npm run build
```

---

## 2. Escenarios de Verificación End-to-End

### Escenario 1: Apertura del Modal de Edición de Detalles
1. En el catálogo inferior ("Recursos"), localizar cualquier conjuro o rasgo registrado (por ejemplo, "Curar Heridas Leves" o "Ataque Poderoso").
2. En la barra de acciones de la tarjeta (junto al botón de borrado), pulsar el botón de edición `✏️`.
3. **Resultado esperado**: Se abre el modal "Editar detalles" mostrando el campo de URL y el área de texto con la descripción actual del recurso precargados.

### Escenario 2: Modificación de URL y Descripción con Guardado Exitoso
1. En el modal abierto, introducir una nueva URL válida (ej. `https://aonprd.com/SpellDisplay.aspx?ItemName=Cure%20Light%20Wounds`).
2. Añadir texto complementario en la descripción (ej. `"Cura 1d8+1 PG por nivel de lanzador (máx +5)."`).
3. Pulsar "Guardar Cambios".
4. **Resultado esperado**:
   - El modal se cierra.
   - Aparece un toast indicando `"Detalles actualizados"`.
   - La tarjeta refleja la descripción actualizada al desplegar "▼ Ver descripción".
   - Aparece el botón de enlace externo compacto con el texto `"Ver más"`.

### Escenario 3: Verificación del Botón "Ver más"
1. Localizar una tarjeta con URL configurada.
2. Observar el botón de enlace externo:
   - Presenta el icono `🌐` seguido del texto `"Ver más"` (no `"Reglas Oficiales"`).
   - Su diseño es más compacto y no satura la barra de acciones.
3. Hacer clic en el botón.
4. **Resultado esperado**: Se abre la URL correspondiente en una pestaña nueva del navegador en modo seguro.

### Escenario 4: Eliminación de la URL
1. Pulsar el botón `✏️` en una tarjeta que tenga URL.
2. Borrar todo el contenido del campo de URL dejando el campo vacío.
3. Pulsar "Guardar Cambios".
4. **Resultado esperado**: El modal se cierra y el botón `"Ver más"` desaparece de la tarjeta del recurso.

### Escenario 5: Cancelación de Edición
1. Pulsar el botón `✏️` en cualquier tarjeta.
2. Modificar la descripción escribiendo texto arbitrario.
3. Pulsar "Cancelar" o el botón de cerrar.
4. **Resultado esperado**: El modal se cierra y la descripción original del recurso no sufre ningún cambio.

### Escenario 6: Validación de Formato de URL Inválida
1. Pulsar el botón `✏️` en cualquier tarjeta.
2. Introducir un texto que no sea una URL válida (ej. `"esto no es una url"` o `"ftp://archivo"`).
3. Intentar pulsar "Guardar Cambios".
4. **Resultado esperado**: Se muestra una indicación de error de URL inválida y el formulario no guarda ni cierra el modal hasta que se introduzca una URL `http(s)` válida o se deje en blanco.

### Escenario 7: Ancho Completo (100%) en Recursos Diarios
1. Desplegar el panel de "Recursos Diarios".
2. Asegurar que haya al menos un espacio de conjuro (ej. Nivel 1) y al menos un rasgo con nombre muy corto (ej. "Ira") y otro con nombre largo (ej. "Canalizar Energía Positiva").
3. Inspeccionar visualmente las filas de recursos:
   - Ambas filas se extienden al 100% del ancho disponible en su columna de rejilla (`w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80`).
   - El contenedor del rasgo de nombre corto no se encoge ni depende de su contenido textual, alineándose perfectamente con las demás tarjetas.

### Escenario 8: Persistencia Local y Copia de Seguridad
1. Recargar la página en el navegador (F5 / Cmd+R).
2. **Resultado esperado**: Todos los cambios de URL y descripción editados persisten intactos en LocalStorage.
3. Abrir el modal de Datos (💾 Datos) y pulsar "Descargar Backup".
4. **Resultado esperado**: El archivo JSON descargado contiene los nuevos valores de `url` y `description` en la colección `resources`.
