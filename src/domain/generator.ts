import { CharacterState, ResourceItem, SpellSlotsMap } from './types';
import { createDefaultSpellSlots } from './spells';
import { sortResources } from './resources';

function createSvgAvatar(bgColor: string, accentColor: string, symbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="${accentColor}" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#grad)" stroke="#f59e0b" stroke-width="3" />
    <text x="50" y="58" font-size="38" text-anchor="middle" dominant-baseline="central">${symbol}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface ArchetypeTemplate {
  name: string;
  characterClass: string;
  level: number;
  baseAttackBonus?: number;
  casterModifier?: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  avatarBg: string;
  avatarAccent: string;
  avatarSymbol: string;
  slots: Record<number, number>; // level -> max
  resources: Omit<ResourceItem, 'id' | 'sortOrder'>[];
}

const ARCHETYPES: ArchetypeTemplate[] = [
  {
    name: 'Kyra de Sarenrae',
    characterClass: 'Clériga del Sol Radiante',
    level: 5,
    baseAttackBonus: 3,
    casterModifier: 4,
    maxHp: 44,
    currentHp: 38,
    tempHp: 6,
    avatarBg: '#78350f',
    avatarAccent: '#d97706',
    avatarSymbol: '☀️',
    slots: { 1: 4, 2: 3, 3: 2 },
    resources: [
      {
        name: 'Guía Divina (Truco)',
        category: 'spell',
        usageMode: 'unlimited',
        spellLevel: 0,
        range: 'Toque',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Guidance',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+1\` a una tirada · 1 min

## Resumen
Toca a una criatura: obtiene **+1** de competencia a su próxima tirada de ataque, salvación o habilidad.

## Descripción
### Invocación a Sarenrae
Una breve invocación a **Sarenrae** que infunde confianza inmediata en el receptor.

> *"La luz de la Flor del Amanecer nunca abandona a los devotos que buscan la justicia."*

---

### Mecánica de Reglas
- **Tiempo de lanzamiento**: 1 acción estándar
- **Componentes**: V, S
- **Alcance**: Toque
- **Objetivo**: Criatura tocada
- **Duración**: 1 minuto o hasta que se descargue

#### Beneficio en Combate
Otorga un bonificador de competencia de \`+1\` a una única tirada:
1. Tirada de ataque
2. Prueba de salvación
3. Prueba de habilidad

\`\`\`pathfinder
Bonificador: +1 competencia
Descarga: Al realizar la primera tirada afectada
\`\`\`

Consulta más en [Archives of Nethys - Guidance](https://aonprd.com/SpellDisplay.aspx?ItemName=Guidance).`,
      },
      {
        name: 'Curar Heridas Leves',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 1,
        range: 'Toque',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Cure%20Light%20Wounds',
        maxUses: null,
        availableUses: null,
        description: `## Corto
Cura \`1d8 + {min(5, nivel_personaje)}\` PG · Toque

## Resumen
Cura \`1d8 + {min(5, nivel_personaje)}\` PG a una criatura viva. Contra muertos vivientes causa ese daño (Voluntad mitad).

## Descripción
### Curación Sagrada
Canaliza energía positiva al colocar la mano sobre una criatura viva para cerrar sus heridas al instante.

> *"Deja que el calor de la sanación cierre tu carne y renueve tu espíritu."*

---

### Efecto según tu Nivel
- **Curación Actual**: Restaura \`1d8 + {min(5, nivel_personaje)}\` PG (escala hasta +5 con tu nivel {nivel_personaje}).

### Progresión de Curación
Al lanzar este conjuro sobre una criatura viva, restaura una cantidad de **Puntos de Golpe** según la tabla:

| Nivel del Clérigo | Tirada Base | Bonificador Máximo | Total Típico |
| :--- | :--- | :--- | :--- |
| Nivel 1 | \`1d8\` | \`+1\` | 5-9 PG |
| Nivel 3 | \`1d8\` | \`+3\` | 7-11 PG |
| Nivel {nivel_personaje} (Actual) | \`1d8\` | \`+{min(5, nivel_personaje)}\` | \`1d8 + {min(5, nivel_personaje)}\` |

---

### Contra Muertos Vivientes
- Causa daño de energía positiva en lugar de curar.
- Requiere un **ataque de toque cuerpo a cuerpo**.
- Permite tirada de salvación de **Voluntad mitad** (\`CD 15\`).
- La resistencia a conjuros (**RC**) aplica normalmente.`,
      },
      {
        name: 'Arma Espiritual',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 2,
        range: 'medio (100 pies + 10 pies/nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Spiritual%20Weapon',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`1d8 + 1\` fuerza · ataque \`+7\`

## Resumen
Invoca una cimitarra de fuerza que ataca sola cada asalto con \`+7\` e ignora la reducción de daño.

## Descripción
### Cimitarra de Luz Radiante
Manifiesta un arma espectral hecha de pura fuerza divina con la forma de la cimitarra predilecta de Sarenrae.

### Características del Arma
- **Daño**: Causa \`1d8 + 1\` puntos de daño de **fuerza pura**.
- **Crítico**: \`19-20 / x2\`
- **Ataque**: Utiliza el bonificador de ataque base (\`BAB +3\`) + modificador de Sabiduría (\`+4\`) = \`+7\` al impacto.
- **Ignora RD**: Al ser daño de fuerza, no es afectado por reducción de daño común.

> *La cimitarra gira en el aire y golpea de forma autónoma cada asalto mientras mantengas la concentración.*

1. Puede cambiar de objetivo con una acción de movimiento.
2. Golpea criaturas incorpóreas con efectividad del 100%.
3. No ocupa espacio físico ni provoca ataques de oportunidad.`,
      },
      {
        name: 'Plegaria Bendita',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 3,
        range: '40 pies (emanación)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Prayer',
        maxUses: null,
        availableUses: null,
        description: `## Corto
Aliados \`+1\`, enemigos \`-1\` · 40 pies

## Resumen
Aliados en 40 pies ganan **+1** de suerte a ataque, daño, salvaciones y habilidades; los enemigos sufren **-1**. Sin salvación.

## Descripción
### Efecto de Bendición y Maldición de Zona
Una súplica ferviente que favorece a todos los aliados presentes y confunde a los enemigos en un radio de **40 pies**.

#### Aliados bendecidos reciben:
- Bonificador de suerte de \`+1\` en:
  - Tiradas de ataque
  - Tiradas de daño con armas
  - Pruebas de salvación
  - Pruebas de habilidad

#### Enemigos afectados sufren:
- Penalizador de \`-1\` en las mismas categorías.
- Sin tirada de salvación (*afecta de inmediato sin chequeo de Voluntad*).

\`\`\`
Radio: 40 pies centrado en Kyra
Duración: 5 asaltos (1 asalto por nivel de lanzador)
\`\`\``,
      },
      {
        name: 'Canalizar Energía Positiva',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        range: '30 pies (emanación)',
        url: 'https://aonprd.com/ClassDisplay.aspx?ItemName=Cleric',
        maxUses: 6,
        availableUses: 5,
        description: `## Corto
\`{ceil(nivel_personaje / 2)}d6\` · CD {14 + floor(nivel_personaje / 2)}

## Resumen
Emanación de 30 pies que cura \`{ceil(nivel_personaje / 2)}d6\` a los vivos o daña a los muertos vivientes (Voluntad mitad, CD {14 + floor(nivel_personaje / 2)}).

## Descripción
### Habilidad Sobrenatural de Clase
Libera una poderosa ola de energía sagrada en una emanación de **30 pies** centrada en el símbolo sagrado.

### Opciones de Activación
- **Sanar a los Vivos**: Restaura \`{ceil(nivel_personaje / 2)}d6\` PG a todas las criaturas vivas en el área (calculado para nivel {nivel_personaje}).
- **Dañar Muertos Vivientes**: Inflige \`{ceil(nivel_personaje / 2)}d6\` de daño sagrado con salvación de Voluntad para mitad (\`CD 16\`).

| Característica | Detalle |
| :--- | :--- |
| **Potencia actual** | \`{ceil(nivel_personaje / 2)}d6\` (Nivel {nivel_personaje}) |
| **Salvación CD** | \`10 + {floor(nivel_personaje / 2)} (1/2 nivel) + 4 (Car) = CD {14 + floor(nivel_personaje / 2)}\` |
| **Dote asociada** | *Canalización Selectiva* (excluye hasta 4 enemigos al curar) |`,
      },
      {
        name: 'Toque Reparador del Dominio',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        url: 'https://aonprd.com/DomainDisplay.aspx?ItemName=Healing',
        maxUses: 4,
        availableUses: 3,
        description: `## Corto
Quita *Fatigado* · \`+1d4 + 2\` PG

## Resumen
Al tocar a un aliado elimina *Fatigado* o *Estremecido* y suma \`1d4 + 2\` PG a tu curación de ese turno.

## Descripción
### Poder de Dominio de Sanación
Con un simple toque, remueve una aflicción menor de un compañero además de cerrar heridas críticas.

- Elimina la condición de **Fatigado** o **Estremecido**.
- Restaura \`1d4 + 2\` PG adicionales a cualquier conjuro de curación lanzado en el mismo turno.
- Gasta 1 uso diario de este rasgo.`,
      },
      {
        name: 'Aura Solar de Determinación',
        category: 'feat_trait',
        usageMode: 'unlimited',
        spellLevel: null,
        url: 'https://aonprd.com/FeatDisplay.aspx?ItemName=Iron%20Will',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+4\` contra miedo · luz dorada

## Resumen
Pasivo: **+4** en salvaciones contra miedo y tus armas emiten luz como una antorcha.

## Descripción
### Rasgo Pasivo Permanente
La inquebrantable fe en Sarenrae otorga un escudo mental y espiritual inalterable ante el miedo.

- **Inmunidad al Miedo mágico**: Otorga \`+4\` en salvaciones contra efectos de terror o desmoralización.
- **Fuego Purificador**: Toda arma empuñada emite una tenue luz dorada equivalente a una antorcha.
- *Habilidad siempre activa sin límite de usos diarios.*`,
      },
    ],
  },
  {
    name: 'Ezren de Absalom',
    characterClass: 'Mago Evocador Versado',
    level: 7,
    baseAttackBonus: 3,
    casterModifier: 5,
    maxHp: 40,
    currentHp: 34,
    tempHp: 8,
    avatarBg: '#1e1b4b',
    avatarAccent: '#4338ca',
    avatarSymbol: '🧙‍♂️',
    slots: { 1: 4, 2: 4, 3: 3, 4: 2 },
    resources: [
      {
        name: 'Rayo de Escarcha (Truco)',
        category: 'spell',
        usageMode: 'unlimited',
        spellLevel: 0,
        range: 'corto (25 pies + 5 pies/2 nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Ray%20of%20Frost',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`1d3\` frío · toque a distancia \`+6\`

## Resumen
Rayo de toque a distancia (\`+6\`) que causa \`1d3\` de frío. A voluntad.

## Descripción
### Truco de Evocación a Voluntad
Un rayo de energía gélida azul brillante surge de la punta del bastón de Ezren hacia el objetivo.

- **Ataque**: Toque a distancia (\`+6\` al impacto).
- **Daño**: \`1d3\` de daño por frío.
- **Alcance**: corto (25 pies + 5 pies/2 nivel personaje).
- *Ilimitado: no gasta espacios de conjuro.*`,
      },
      {
        name: 'Proyectil Mágico',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 1,
        range: 'medio (100 pies + 10 pies/nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Magic%20Missile',
        maxUses: null,
        availableUses: null,
        description: `## Corto
{min(5, 1 + floor((nivel_personaje - 1) / 2))} × \`1d4 + 1\` fuerza · impacta siempre

## Resumen
Dispara {min(5, 1 + floor((nivel_personaje - 1) / 2))} dardos de fuerza de \`1d4 + 1\` que impactan automáticamente, sin tirada ni salvación.

## Descripción
### Misiles Arcanos Infalibles
Dispara dardos de energía traslúcida que impactan automáticamente sin requerir tirada de ataque ni conceder salvación.

### Desglose por Nivel de Lanzador
A nivel 7 de lanzador, Ezren dispara **4 proyectiles simultáneos**:

| Proyectil | Daño Individual | Tipo |
| :--- | :--- | :--- |
| Dardo 1 | \`1d4 + 1\` | Fuerza |
| Dardo 2 | \`1d4 + 1\` | Fuerza |
| Dardo 3 | \`1d4 + 1\` | Fuerza |
| Dardo 4 | \`1d4 + 1\` | Fuerza |
| **Total Combinado** | \`4d4 + 4\` (~14 PG) | Fuerza Pura |

> *"Ningún escudo mundano detiene el curso del verdadero poder arcano."*`,
      },
      {
        name: 'Rayo Abrasador',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 2,
        range: 'corto (25 pies + 5 pies/2 nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Scorching%20Ray',
        maxUses: null,
        availableUses: null,
        description: `## Corto
2 rayos × \`4d6\` fuego

## Resumen
Dos rayos de toque a distancia (\`+6\`) de \`4d6\` de fuego cada uno, al mismo o distintos objetivos.

## Descripción
### Rayos de Fuego Concentrado
Libera chorros de fuego abrasador capaces de fundir armaduras a distancia media.

- **Número de rayos**: A nivel 7 dispara **2 rayos independientes**.
- **Ataque**: Tirada de toque a distancia (\`+6\` por rayo).
- **Daño**: \`4d6\` de fuego por cada rayo que impacte (\`8d6\` potencial total).
- Pueden dirigirse al mismo objetivo o a objetivos diferentes dentro de un radio de 30 pies.`,
      },
      {
        name: 'Bola de Fuego',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 3,
        range: 'largo (400 pies + 40 pies/nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`{min(10, nivel_personaje)}d6\` fuego · radio 20 pies · Ref mitad

## Resumen
Explosión de \`{min(10, nivel_personaje)}d6\` de fuego en un radio de 20 pies. Reflejos mitad (CD 17).

## Descripción
### El Clásico Destructor de Evocación
Una explosión flamígera con un fogonazo ensordecedor que detona con tremenda potencia.

\`\`\`pathfinder
Área de efecto: Radio de 20 pies
Alcance: largo (400 pies + 40 pies/nivel personaje)
Daño: 7d6 puntos de daño por fuego (1d6 por nivel de mago)
Salvación: Reflejos mitad (CD 17)
\`\`\`

- Enciende materiales combustibles y derrite metales de bajo punto de fusión.
- Puede detonar en el aire para atrapar criaturas voladoras.`,
      },
      {
        name: 'Tormenta de Hielo',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 4,
        range: 'largo (400 pies + 40 pies/nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Ice%20Storm',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`3d6\` contundente + \`2d6\` frío · sin salvación

## Resumen
Granizo en un cilindro de 40 pies: \`3d6\` contundente + \`2d6\` de frío sin salvación, y deja terreno difícil.

## Descripción
### Granizo Devastador y Frío Extremo
Grandes bloques de hielo azotan con violencia un cilindro de **40 pies de radio y 80 pies de alto**.

- **Daño inmediato**:
  - \`3d6\` de daño por impacto contundente.
  - \`2d6\` de daño por frío intenso.
- **Sin Salvación**: El daño se aplica sin tirada de salvación para evitarlo.
- **Terreno difícil**: El suelo cubierto de aguanieve reduce la velocidad a la mitad durante \`7 asaltos\`.`,
      },
      {
        name: 'Dardo de Fuerza de Escuela',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        url: 'https://aonprd.com/SchoolDisplay.aspx?ItemName=Evocation',
        maxUses: 7,
        availableUses: 6,
        description: `## Corto
\`1d4 + {floor(nivel_personaje / 2)}\` fuerza · 30 pies

## Resumen
Acción estándar: proyectil de fuerza que impacta automáticamente por \`1d4 + {floor(nivel_personaje / 2)}\`.

## Descripción
### Poder de Escuela de Evocación
Como acción estándar, lanza un proyectil de fuerza mágica contra un enemigo a 30 pies.

- **Impacto**: Impacta automáticamente como un *proyectil mágico*.
- **Daño**: \`1d4 + 3\` (\`1d4 + 1/2 nivel de mago\`).
- Muy útil para rematar enemigos con pocos puntos de golpe sin gastar espacios de conjuro valiosos.`,
      },
      {
        name: 'Vínculo Arcano (Bastón de Sabio)',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        url: 'https://aonprd.com/ClassDisplay.aspx?ItemName=Wizard',
        maxUses: 1,
        availableUses: 1,
        description: `## Corto
1 conjuro del libro sin preparar

## Resumen
Una vez al día lanza cualquier conjuro de tu libro sin tenerlo preparado ni gastar espacio.

## Descripción
### Objeto Enlazado
Permite lanzar **1 conjuro cualquiera** de su libro de conjuros una vez al día sin haberlo memorizado previamente.

- Debe tener el bastón empuñado con al menos una mano.
- No gasta el espacio de conjuro habitual del nivel escogido.`,
      },
      {
        name: 'Erudición Arcana Universal',
        category: 'feat_trait',
        usageMode: 'unlimited',
        spellLevel: null,
        url: 'https://aonprd.com/FeatDisplay.aspx?ItemName=Spell%20Focus',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+1\` CD evocación · \`+2\` vs RC

## Resumen
Pasivo: **+1** a la CD de tus evocaciones y **+2** para superar la resistencia a conjuros.

## Descripción
### Dote de Especialización Máx
Aumenta la dificultad de resistencia a todos los conjuros de evocación:

- \`+1\` a la CD de salvación de todos los conjuros de Evocación (*Escuela predilecta*).
- \`+2\` a las pruebas de nivel de lanzador para penetrar la resistencia a conjuros (**RC**).`,
      },
    ],
  },
  {
    name: 'Seoni de Varisia',
    characterClass: 'Hechicera de Linaje Dracónico',
    level: 6,
    baseAttackBonus: 3,
    casterModifier: 4,
    maxHp: 42,
    currentHp: 31,
    tempHp: 5,
    avatarBg: '#581c87',
    avatarAccent: '#9333ea',
    avatarSymbol: '🐉',
    slots: { 1: 5, 2: 4, 3: 3 },
    resources: [
      {
        name: 'Chispa Flamígera (Truco)',
        category: 'spell',
        usageMode: 'unlimited',
        spellLevel: 0,
        range: 'corto (25 pies + 5 pies/2 nivel personaje)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Spark',
        maxUses: null,
        availableUses: null,
        description: `## Corto
Prende objetos inflamables

## Resumen
Enciende a distancia un objeto inflamable no protegido. A voluntad.

## Descripción
### Truco Espontáneo
Enciende un fuego diminuto con solo chasquear los dedos.

- **Alcance**: corto (25 pies + 5 pies/2 nivel personaje)
- **Efecto**: Prende fuego a cualquier objeto inflamable no protegido (antorchas, velas, yesca).
- *Lanzamiento a voluntad sin límite de usos.*`,
      },
      {
        name: 'Armadura de Mago Dracónica',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 1,
        range: 'Toque',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Mage%20Armor',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+4\` CA armadura · {nivel_personaje} h

## Resumen
Otorga **+4** de armadura a la CA durante {nivel_personaje} horas; también funciona contra incorpóreos.

## Descripción
### Campo de Fuerza Invisible
Un halo protector con destellos de escamas rojas rodea a Seoni.

- **Bonificador**: \`+4\` de armadura a la Clase de Armadura (**CA**).
- **Duración**: \`6 horas\` (1 hora por nivel).
- Protege eficazmente contra ataques incorpóreos (fantasmas y sombras).`,
      },
      {
        name: 'Imagen Espejada',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 2,
        range: 'Personal',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Mirror%20Image',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`1d4 + {floor(nivel_personaje / 3)}\` copias · {nivel_personaje} min

## Resumen
Crea \`1d4 + {floor(nivel_personaje / 3)}\` dobles ilusorios; cada impacto puede destruir una copia en lugar de dañarte.

## Descripción
### Ilusión Defensiva Avanzada
Crea copias ilusorias que imitan exactamente cada uno de tus movimientos.

- **Número de copias**: Crea \`1d4 + 2\` dobles ilusorios (3 a 6 copias a nivel 6).
- Cada vez que un atacante impacta, tiene altas probabilidades de destruir una copia en lugar de dañar a Seoni.
- Duración: \`6 minutos\`.`,
      },
      {
        name: 'Aliento Flamígero de Dragón',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        range: '30 pies (cono)',
        url: 'https://aonprd.com/BloodlineDisplay.aspx?ItemName=Draconic',
        maxUses: 2,
        availableUses: 2,
        description: `## Corto
Cono 30 pies · \`6d6\` fuego · Ref CD 17

## Resumen
Exhala un cono de fuego de 30 pies que causa \`6d6\` (Reflejos mitad, CD 17).

## Descripción
### Arma de Aliento del Linaje
Exhala un cono de fuego abrasador de **30 pies**.

> *"La sangre de los dragones antiguos corre ardiente por mis venas."*

---

### Progresión de Aliento
| Nivel de Hechicera | Daño de Fuego | Salvación Reflejos |
| :--- | :--- | :--- |
| Nivel 1-5 | \`4d6\` | CD 15 |
| Nivel 6 (Actual) | \`6d6\` | CD 17 |
| Nivel 9 | \`8d6\` | CD 19 |

- **Daño**: Causa \`6d6\` puntos de daño por fuego.
- **Salvación**: Reflejos mitad con \`CD 17\` (\`10 + 3 + Carisma\`).
- Consume 1 uso diario del linaje dracónico.`,
      },
      {
        name: 'Garras de Dragón Carmesí',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        url: 'https://aonprd.com/BloodlineDisplay.aspx?ItemName=Draconic',
        maxUses: 6,
        availableUses: 4,
        description: `## Corto
2 garras \`1d4 + 1\` + \`1d6\` fuego

## Resumen
Durante {nivel_personaje} asaltos obtienes 2 garras de \`1d4 + 1\` más \`1d6\` de fuego.

## Descripción
### Armas Naturales Espontáneas
Las uñas de Seoni se transforman en afiladas garras draconianas rojas.

- Otorga 2 ataques de garra primarios con daño \`1d4 + 1\` más \`1d6\` de fuego por ataque.
- Dura \`1 asalto por nivel\` tras activarse.`,
      },
      {
        name: 'Escamas de Dragón Rojo',
        category: 'feat_trait',
        usageMode: 'unlimited',
        spellLevel: null,
        url: 'https://aonprd.com/BloodlineDisplay.aspx?ItemName=Draconic',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+2\` armadura natural · RF 5

## Resumen
Pasivo: **+2** de armadura natural y resistencia al fuego 5.

## Descripción
### Rasgo Pasivo Fisiológico
La sangre de dragón otorga endurecimiento dérmico y tolerancia al calor:

- **Armadura Natural**: \`+2\` a la CA de armadura natural.
- **Resistencia al Fuego**: Resistencia \`5\` permanente a todo daño ígneo.`,
      },
    ],
  },
  {
    name: 'Valeros el Valiente',
    characterClass: 'Paladín Sagrado de Iomedae',
    level: 5,
    baseAttackBonus: 5,
    casterModifier: 2,
    maxHp: 56,
    currentHp: 48,
    tempHp: 10,
    avatarBg: '#0f172a',
    avatarAccent: '#0284c7',
    avatarSymbol: '🛡️',
    slots: { 1: 2 },
    resources: [
      {
        name: 'Gracia Divina (Conjuro)',
        category: 'spell',
        usageMode: 'limited',
        spellLevel: 1,
        range: '50 pies (emanación)',
        url: 'https://aonprd.com/SpellDisplay.aspx?ItemName=Bless',
        maxUses: null,
        availableUses: null,
        description: `## Corto
\`+1\` moral ataque y vs miedo · 50 pies

## Resumen
Aliados en 50 pies ganan **+1** de moral al ataque y a salvaciones contra miedo.

## Descripción
### Bendición Marcial
Infunde valor sagrado en los corazones de los aliados cercanos.

- Bonificador de moral de \`+1\` a las tiradas de ataque.
- Bonificador de moral de \`+1\` a las salvaciones contra efectos de miedo.
- Radio de emanación: \`50 pies\` centrado en el paladín.`,
      },
      {
        name: 'Imposición de Manos',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        range: 'Toque / Personal',
        url: 'https://aonprd.com/ClassDisplay.aspx?ItemName=Paladin',
        maxUses: 5,
        availableUses: 4,
        description: `## Corto
Cura \`{floor(nivel_personaje / 2)}d6\` PG · quita *Fatigado*

## Resumen
Toque que cura \`{floor(nivel_personaje / 2)}d6\` PG (acción rápida sobre ti) y elimina *Fatigado*. Daña a muertos vivientes.

## Descripción
### Toque Sagrado de Restauración
Canaliza energía sanadora al tocarse a sí mismo (acción rápida) o a un aliado (acción estándar).

> *"¡Por Iomedae, que la luz de la justicia reconforte a los heridos!"*

---

### Modos de Aplicación
| Destinatario | Efecto Primario | Merced Activa |
| :--- | :--- | :--- |
| Aliado / Uno mismo | Restaura \`2d6\` PG | Remueve *Fatigado* |
| Muerto Viviente | Causa \`2d6\` daño sagrado | Sin salvación |

### Parámetros de Curación
- Restaura \`2d6\` PG por cada uso gastado.
- Si se usa contra muertos vivientes: inflige \`2d6\` de daño con toque cuerpo a cuerpo sin salvación.
- A nivel 5 incluye la **Merced**: elimina automáticamente la condición de *Fatigado*.`,
      },
      {
        name: 'Castigo del Mal (Smite Evil)',
        category: 'feat_trait',
        usageMode: 'limited',
        spellLevel: null,
        range: 'A la vista',
        url: 'https://aonprd.com/ClassDisplay.aspx?ItemName=Paladin',
        maxUses: 2,
        availableUses: 2,
        description: `## Corto
\`+3\` ataque · \`+{nivel_personaje}\` daño · \`+3\` CA

## Resumen
Contra un enemigo malvado: **+3** al ataque y a la CA, y \`+{nivel_personaje}\` al daño (el doble contra ajenos, dragones y muertos vivientes malignos).

## Descripción
### Juicio Justo contra el Mal
Designa a una criatura malvada a la vista para descargar la furia de la Espada Heredera.

#### Bonificadores Activos:
1. **Ataque**: Suma el bonificador de Carisma (\`+3\`) a todas las tiradas de ataque.
2. **Daño**: Suma el nivel de paladín (\`+5\` o \`+10\` si es dragón maligno, no-muerto o ajeno maligno) a cada impacto.
3. **Defensa**: Otorga bonificador de desvío de Carisma (\`+3\` a la CA) contra los ataques del objetivo.`,
      },
      {
        name: 'Aura de Valentía Inquebrantable',
        category: 'feat_trait',
        usageMode: 'unlimited',
        spellLevel: null,
        range: '10 pies (aura)',
        url: 'https://aonprd.com/ClassDisplay.aspx?ItemName=Paladin',
        maxUses: null,
        availableUses: null,
        description: `## Corto
Inmune al miedo · aliados \`+4\` (10 pies)

## Resumen
Pasivo: eres inmune al miedo y los aliados a 10 pies ganan **+4** contra miedo.

## Descripción
### Aura Pasiva Protectora
El paladín es completamente inmune a cualquier efecto de miedo (mágico o natural).

- Todos los aliados en un radio de **10 pies** obtienen un bonificador de moral de \`+4\` a sus pruebas de salvación contra el miedo.
- Funciona de manera continua mientras el paladín permanezca consciente.`,
      },
    ],
  },
];

/**
 * Genera una ficha de personaje completa, válida y aleatoria.
 * Garantiza probar y demostrar todas las funcionalidades del sistema:
 * - Puntos de vida actuales, máximos y temporales.
 * - Espacios de conjuros dinámicos por nivel compartido.
 * - Trucos a voluntad (nivel 0).
 * - Conjuros de niveles 1 a 4 con botón "Lanzar".
 * - Rasgos de usos diarios limitados con botón "Usar" de alto contraste.
 * - Rasgos pasivos ilimitados.
 * - Enlaces oficiales a Archives of Nethys.
 * - Descripciones exhaustivas en Markdown (encabezados, tablas, listas, citas, código, tiradas).
 * - Secciones especiales en cada descripción: "## Corto" (columna de la tabla del Modo recursos),
 *   "## Resumen" (visible en la card plegada) y "## Descripción" con el detalle completo.
 */
export function generateRandomCharacter(seedIndex?: number): CharacterState {
  const index =
    typeof seedIndex === 'number'
      ? Math.abs(seedIndex) % ARCHETYPES.length
      : Math.floor(Math.random() * ARCHETYPES.length);

  const tpl = ARCHETYPES[index];
  const now = new Date().toISOString();
  const id = `char-rand-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Spell slots: base default with specific levels overridden
  const baseSlots: SpellSlotsMap = createDefaultSpellSlots();
  for (const [lvlStr, max] of Object.entries(tpl.slots)) {
    const lvl = Number(lvlStr);
    if (lvl >= 1 && lvl <= 9) {
      baseSlots[lvl] = {
        level: lvl,
        max,
        available: max,
      };
    }
  }

  // Build resource items with IDs and sortOrder
  const resources: ResourceItem[] = sortResources(
    tpl.resources.map((item, idx) => ({
      ...item,
      id: `res-${id}-${idx + 1}`,
      sortOrder: idx,
    }))
  );

  return {
    profile: {
      id,
      name: tpl.name,
      level: tpl.level,
      characterClass: tpl.characterClass,
      baseAttackBonus: tpl.baseAttackBonus ?? 0,
      casterModifier: tpl.casterModifier ?? 0,
      avatarDataUrl: createSvgAvatar(tpl.avatarBg, tpl.avatarAccent, tpl.avatarSymbol),
      createdAt: now,
      updatedAt: now,
    },
    health: {
      maxHp: tpl.maxHp,
      currentHp: tpl.currentHp,
      tempHp: tpl.tempHp,
    },
    spellSlots: baseSlots,
    resources,
  };
}
