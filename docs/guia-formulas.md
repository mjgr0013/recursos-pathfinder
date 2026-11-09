# 📐 Guía de Fórmulas y Variables Dinámicas (Pathfinder)

Esta guía explica cómo utilizar el motor de expresiones dinámicas en la aplicación **Recursos Pathfinder**. Permite que las descripciones de conjuros, dotes, rasgos y habilidades se calculen y actualicen automáticamente cada vez que tu personaje sube de nivel o modificas sus características.

---

## 🏷️ 1. Variables Disponibles

El motor reconoce las siguientes variables basadas en los datos de la ficha de tu personaje activo:

| Variable Principal | Alias Disponibles | Descripción | Origen en la Ficha |
| :--- | :--- | :--- | :--- |
| `nivel_personaje` | `nivel`, `level` | Nivel actual del personaje (entero del 1 al 20). | Cabecera / Perfil |
| `ataque_base` | `bab`, `base_attack` | Bonificador de Ataque Base (BAB) de la clase. | Modal Editar Perfil |
| `modificador_lanzador` | `mod_lanzador`, `mod_conjuros`, `modificador_conjuros`, `caster_mod` | Modificador de la característica clave de conjuros (INT / SAB / CAR). | Modal Editar Perfil |

> **Nota**: Las mayúsculas y minúsculas no importan (por ejemplo, `NIVEL_PERSONAJE` y `nivel_personaje` son equivalentes).

---

## ⚙️ 2. Funciones Matemáticas Disponibles

Puedes usar estas funciones dentro de expresiones matemáticas:

### `min(valor1, valor2, ...)` — Mínimo (Tope máximo)
Devuelve el menor número entre los argumentos proporcionados.
- **Uso en Pathfinder**: Establecer topes máximos de dados o bonificadores según el nivel de lanzador.
- **Ejemplo**: `min(5, nivel_personaje)`
  - A nivel 3 devuelve `3`.
  - A nivel 7 devuelve `5` (tope de bonificador).

### `max(valor1, valor2, ...)` — Máximo (Piso mínimo)
Devuelve el mayor número entre los argumentos proporcionados.
- **Uso en Pathfinder**: Garantizar que una habilidad tenga como mínimo 1 uso diario o bonificador, incluso con modificadores de característica nulos o negativos.
- **Ejemplo**: `max(1, 3 + mod_lanzador)`
  - Si el modificador es `+4`, devuelve `7` usos.
  - Si el modificador es `-2`, devuelve `1` uso garantizado.

### `floor(expresion)` — Redondeo hacia abajo
Trunca la parte decimal redondeando hacia el entero inferior.
- **Uso en Pathfinder**: Progresiones estándar que aumentan cada 2 niveles (`nivel / 2`).
- **Ejemplo**: `floor(nivel_personaje / 2)`
  - Nivel 1: `0`
  - Nivel 2 o 3: `1`
  - Nivel 4 o 5: `2`
  - Nivel 6 o 7: `3`

### `ceil(expresion)` — Redondeo hacia arriba
Redondea al entero superior inmediato si existe parte decimal.
- **Uso en Pathfinder**: Dados de daño o curación que comienzan en 1d6 a nivel 1 y suben cada nivel impar (niveles 1, 3, 5, 7, etc.), como *Canalizar energía*.
- **Ejemplo**: `ceil(nivel_personaje / 2)`
  - Nivel 1 o 2: `1` (1d6)
  - Nivel 3 o 4: `2` (2d6)
  - Nivel 5 o 6: `3` (3d6)

### `round(expresion)` — Redondeo al más cercano
Redondea matemáticamente: si la parte fraccionaria es 0.5 o superior redondea hacia arriba, de lo contrario hacia abajo.
- **Ejemplo**: `round(nivel_personaje * 1.5)`

---

## ➕ 3. Operadores Aritméticos

El motor soporta las 4 operaciones básicas con precedencia matemática estándar:
- Suma: `+`
- Resta: `-`
- Multiplicación: `*`
- División: `/` (la división por cero se resuelve de forma segura a 0 sin romper la aplicación)
- Paréntesis: `(...)` para definir el orden de evaluación (ej. `(nivel_personaje + 1) * 2`)

---

## 🎯 4. Sintaxis de Uso

Existen tres formas de utilizar fórmulas dinámicas en las reglas y descripciones:

### A. Interpolación entre llaves: `{...}`
Cualquier expresión dentro de `{...}` se calcula y se sustituye por su resultado numérico final:
- `Salvación: CD {10 + 3 + mod_lanzador}` ➔ Si `mod_lanzador = 4`, produce: `Salvación: CD 17`
- `Bonificador de +{floor(nivel_personaje / 2)}` ➔ A nivel 5, produce: `Bonificador de +2`
- `{min(10, nivel_personaje)}d6` ➔ A nivel 7, produce: `7d6`

### B. Tiradas de dados con comillas invertidas: `` `...` ``
Formatea tiradas al estilo código en Markdown y reemplaza dinámicamente las variables:
- `` `1d20 + ataque_base + mod_lanzador` `` ➔ Si BAB es 3 y Mod es 4, produce: `` `1d20 + 7` ``
- `` `1d8 + {min(5, nivel_personaje)}` `` ➔ A nivel 6, produce: `` `1d8 + 5` ``
- `` `+ataque_base` `` ➔ Si BAB es 5, produce: `` `+5` ``

### C. Fórmulas oficiales de alcance de Pathfinder
En el campo de **Alcance** o en las descripciones, las fórmulas oficiales de alcance se resuelven automáticamente según el nivel de personaje:
- `corto (25 pies + 5 pies/2 nivel personaje)` ➔ A nivel 5: `corto (35 pies)`
- `medio (100 pies + 10 pies/nivel personaje)` ➔ A nivel 5: `medio (150 pies)`
- `largo (400 pies + 40 pies/nivel personaje)` ➔ A nivel 5: `largo (600 pies)`

---

## 📜 5. Ejemplos Prácticos de Referencia (Pathfinder 1e)

Puedes copiar e insertar estos ejemplos directamente en tus dotes, conjuros y rasgos:

### Curar Heridas Leves (Tope de bonificador)
```markdown
Cura `1d8 + {min(5, nivel_personaje)}` puntos de golpe.
```
- *A nivel 1*: `1d8 + 1` PG
- *A nivel 5*: `1d8 + 5` PG
- *A nivel 8*: `1d8 + 5` PG (respeta el límite de +5)

### Bola de Fuego (Dados escalados y CD de Salvación)
```markdown
Daño: `{min(10, nivel_personaje)}d6` de fuego en radio de 20 pies.
Salvación: CD {10 + 3 + mod_lanzador} Reflejos mitad.
```
- *A nivel 7 con Mod +4*: Daño `7d6` de fuego, Salvación: CD 17 Reflejos mitad.
- *A nivel 12 con Mod +5*: Daño `10d6` de fuego (topado a 10d6), Salvación: CD 18 Reflejos mitad.

### Proyectil Mágico (Progresión cada 2 niveles)
```markdown
Dispara {min(5, 1 + floor((nivel_personaje - 1) / 2))} proyectil(es) de fuerza que causan `1d4 + 1` cada uno.
```
- *Nivel 1-2*: 1 proyectil
- *Nivel 3-4*: 2 proyectiles
- *Nivel 5-6*: 3 proyectiles
- *Nivel 7-8*: 4 proyectiles
- *Nivel 9+*: 5 proyectiles

### Canalizar Energía (Clérigo)
```markdown
Canaliza `{ceil(nivel_personaje / 2)}d6` de energía (radio 30 pies).
Salvación: CD {10 + floor(nivel_personaje / 2) + mod_lanzador} Voluntad mitad.
```
- *A nivel 5 con Mod +3*: Canaliza `3d6`. Salvación: CD 15 Voluntad mitad.

### Imposición de Manos (Paladín)
```markdown
Cura `{floor(nivel_personaje / 2)}d6` puntos de golpe.
Usos diarios: {max(1, floor(nivel_personaje / 2) + mod_lanzador)} al día.
```
- *A nivel 4 con Carisma +3*: Cura `2d6`. Usos: 5 al día.

### Poder de Dominio o Escuela (3 + Característica)
```markdown
Usos disponibles: {max(1, 3 + mod_lanzador)} veces al día.
```
- Asegura un mínimo de 1 uso aunque el modificador sea negativo.

### Ataque de Toque a Distancia (Rayos)
```markdown
Ataque de toque a distancia: `1d20 + ataque_base + mod_lanzador` contra CA de toque.
```
- Suma el BAB del personaje y el modificador de la característica en una única tirada limpia.

---

## 🧪 6. Probador Interactivo en la Aplicación

Tanto desde el botón **📐 Fórmulas** en la barra superior como desde el botón **📐 Guía** en el editor de Markdown, puedes:
1. Ver tus valores actuales de nivel, BAB y modificador de lanzador.
2. Explorar las variables, funciones y ejemplos.
3. Probar cualquier fórmula personalizada en el **Probador (Sandbox)** para comprobar el resultado inmediato antes de guardarla.
4. Usar los botones **📋 Copiar** o **📥 Insertar** para incorporar la fórmula a tu ficha con un solo clic.
