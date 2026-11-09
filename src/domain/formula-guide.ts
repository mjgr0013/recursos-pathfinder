import { CharacterVariables, interpolateVariables, resolveRange } from './variables';

export interface FormulaVariable {
  name: string;
  aliases: string[];
  label: string;
  description: string;
  source: string;
  exampleSnippet: string;
}

export interface FormulaFunction {
  name: string;
  label: string;
  signature: string;
  description: string;
  example: string;
  explanation: string;
}

export interface FormulaSyntaxRule {
  title: string;
  badge: string;
  syntax: string;
  description: string;
  example: string;
  renderedNote: string;
}

export interface FormulaExample {
  id: string;
  title: string;
  category: 'spells' | 'powers' | 'combat' | 'range';
  categoryLabel: string;
  description: string;
  snippet: string;
  notes?: string;
}

/**
 * Available character variables recognized by the Pathfinder calculation engine.
 */
export const FORMULA_VARIABLES: FormulaVariable[] = [
  {
    name: 'nivel_personaje',
    aliases: ['nivel', 'level'],
    label: 'Nivel del personaje',
    description: 'Nivel actual del personaje (valor entero entre 1 y 20).',
    source: 'Se configura en el encabezado / perfil del personaje.',
    exampleSnippet: '{nivel_personaje}',
  },
  {
    name: 'ataque_base',
    aliases: ['bab', 'base_attack'],
    label: 'Ataque Base (BAB)',
    description: 'Bonificador de Ataque Base del personaje según su clase y nivel.',
    source: 'Se configura en el perfil (campo Ataque Base).',
    exampleSnippet: '`1d20 + ataque_base`',
  },
  {
    name: 'modificador_lanzador',
    aliases: ['mod_lanzador', 'mod_conjuros', 'modificador_conjuros', 'caster_mod'],
    label: 'Modificador de lanzador',
    description:
      'Modificador de la característica clave de conjuros (INT para magos, SAB para clérigos, CAR para hechiceros/paladines).',
    source: 'Se configura en el perfil (campo Modificador de conjuros).',
    exampleSnippet: 'CD {10 + 2 + mod_lanzador}',
  },
];

/**
 * Built-in mathematical helper functions supported in formulas.
 */
export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  {
    name: 'min',
    label: 'Mínimo (Tope máximo)',
    signature: 'min(valor1, valor2, ...)',
    description:
      'Devuelve el menor de los números. Es fundamental en Pathfinder para limitar bonificadores máximos (por ejemplo, en conjuros de nivel bajo).',
    example: 'min(5, nivel_personaje)',
    explanation: 'Devuelve el nivel, pero nunca más de 5 (tope de Curar heridas leves).',
  },
  {
    name: 'max',
    label: 'Máximo (Piso mínimo)',
    signature: 'max(valor1, valor2, ...)',
    description:
      'Devuelve el mayor de los números. Muy útil para asegurar un mínimo de 1 uso o bonificador, aunque el modificador de característica sea negativo.',
    example: 'max(1, 3 + mod_lanzador)',
    explanation: 'Garantiza al menos 1 uso diario incluso con modificador de conjuros bajo.',
  },
  {
    name: 'floor',
    label: 'Redondeo hacia abajo',
    signature: 'floor(expresion)',
    description:
      'Trunca los decimales y redondea al entero inferior. Esencial para progresiones estándar de Pathfinder que avanzan cada 2 niveles.',
    example: 'floor(nivel_personaje / 2)',
    explanation: 'A nivel 1 da 0, a nivel 2 da 1, a nivel 5 da 2, a nivel 6 da 3.',
  },
  {
    name: 'ceil',
    label: 'Redondeo hacia arriba',
    signature: 'ceil(expresion)',
    description:
      'Redondea siempre al entero superior si hay decimales. Muy utilizado para dados de daño que comienzan en 1d6 a nivel 1 y aumentan cada 2 niveles.',
    example: 'ceil(nivel_personaje / 2)',
    explanation: 'A nivel 1 da 1, a nivel 2 da 1, a nivel 3 da 2, a nivel 5 da 3 (ej. Canalizar energía).',
  },
  {
    name: 'round',
    label: 'Redondeo al entero más cercano',
    signature: 'round(expresion)',
    description:
      'Redondea matemáticamente: si la parte decimal es 0.5 o mayor redondea hacia arriba, si es menor hacia abajo.',
    example: 'round(nivel_personaje * 1.5)',
    explanation: 'Calcula proporciones fraccionarias al entero más próximo.',
  },
];

/**
 * Syntax rules for markdown and formula interpolation.
 */
export const FORMULA_SYNTAX_RULES: FormulaSyntaxRule[] = [
  {
    title: 'Interpolación con Llaves',
    badge: '{...}',
    syntax: '{expresión matemática o variable}',
    description:
      'Cualquier texto entre llaves es evaluado matemáticamente y reemplazado por el valor resultante.',
    example: 'Salvación: CD {10 + 3 + mod_lanzador} Voluntad niega.',
    renderedNote: 'Calcula automáticamente el total numérico según las variables del personaje.',
  },
  {
    title: 'Tiradas de Dados en Código',
    badge: '`...`',
    syntax: '`[dados] + [variables]` o `([formula])d[caras]`',
    description:
      'El motor reconoce tiradas de dados en comillas invertidas y sustituye las variables en bonificadores y cantidad de dados.',
    example: '`1d20 + ataque_base + mod_lanzador` o `{min(10, nivel_personaje)}d6`',
    renderedNote: 'Muestra la fórmula de tirada limpia y legible para la mesa de juego.',
  },
  {
    title: 'Fórmulas de Alcance Pathfinder',
    badge: 'Alcance',
    syntax: 'corto (25 pies + 5 pies/2 nivel personaje) | medio (...) | largo (...)',
    description:
      'En el campo de alcance (o descripciones), las fórmulas oficiales de alcance de Pathfinder se resuelven automáticamente según el nivel.',
    example: 'medio (100 pies + 10 pies/nivel personaje)',
    renderedNote: 'A nivel 5 se convierte automáticamente en "medio (150 pies)".',
  },
];

/**
 * Curated reference examples covering classic Pathfinder 1e spells, feats, and powers.
 */
export const FORMULA_REFERENCE_EXAMPLES: FormulaExample[] = [
  {
    id: 'cure-light-wounds',
    title: 'Curar Heridas Leves (Tope de bonificador)',
    category: 'spells',
    categoryLabel: 'Conjuro',
    description: 'Cura 1d8 + 1 punto por nivel de lanzador (máximo +5).',
    snippet: 'Cura `1d8 + {min(5, nivel_personaje)}` puntos de golpe.',
    notes: 'Usa min(5, nivel) para no sobrepasar el límite de las reglas de Pathfinder.',
  },
  {
    id: 'fireball',
    title: 'Bola de Fuego (Dados escalados con límite y CD)',
    category: 'spells',
    categoryLabel: 'Conjuro',
    description: '1d6 puntos de fuego por nivel (máx. 10d6). Salvación: CD 10 + nivel 3 + mod.',
    snippet:
      'Daño: `{min(10, nivel_personaje)}d6` de fuego en área de 20 pies.\nSalvación: CD {10 + 3 + mod_lanzador} Reflejos mitad.',
    notes: 'Escala automáticamente la cantidad de dados hasta un tope de 10d6.',
  },
  {
    id: 'magic-missile',
    title: 'Proyectil Mágico (Progresión cada 2 niveles)',
    category: 'spells',
    categoryLabel: 'Conjuro',
    description: '1 proyectil al nivel 1, más 1 proyectil adicional cada 2 niveles (máx. 5).',
    snippet:
      'Dispara {min(5, 1 + floor((nivel_personaje - 1) / 2))} proyectil(es) de fuerza que causan `1d4 + 1` cada uno.',
    notes: 'Calcula con precisión 1 a nivel 1, 2 al 3, 3 al 5, 4 al 7 y 5 al 9+.',
  },
  {
    id: 'channel-energy',
    title: 'Canalizar Energía (Clérigo)',
    category: 'powers',
    categoryLabel: 'Rasgo / Poder',
    description: '1d6 a nivel 1, aumentando 1d6 cada 2 niveles impares. CD 10 + 1/2 nivel + CAR.',
    snippet:
      'Canaliza `{ceil(nivel_personaje / 2)}d6` de energía positiva/negativa (radio 30 pies).\nSalvación: CD {10 + floor(nivel_personaje / 2) + mod_lanzador} Voluntad mitad.',
    notes: 'ceil() incrementa los dados en niveles 1, 3, 5, 7, etc.',
  },
  {
    id: 'lay-on-hands',
    title: 'Imposición de Manos (Paladín)',
    category: 'powers',
    categoryLabel: 'Rasgo / Poder',
    description: 'Cura 1d6 cada 2 niveles. Usos diarios: 1/2 nivel + CAR (mínimo 1).',
    snippet:
      'Cura `{floor(nivel_personaje / 2)}d6` PG.\nUsos diarios: {max(1, floor(nivel_personaje / 2) + mod_lanzador)} al día.',
    notes: 'Usa max(1, ...) para que siempre se disponga de al menos 1 uso diario.',
  },
  {
    id: 'spell-attack-touch',
    title: 'Ataque de Toque / Rayo a Distancia',
    category: 'combat',
    categoryLabel: 'Combate',
    description: 'Tirada de d20 sumando el ataque base (BAB) y el modificador de lanzador.',
    snippet:
      'Ataque de toque a distancia: `1d20 + ataque_base + mod_lanzador` contra CA de toque.',
    notes: 'Muestra los valores de bonificador ya sumados y listos para tirar.',
  },
  {
    id: 'school-power-uses',
    title: 'Poder de Escuela o Dominio (3 + Modificador)',
    category: 'powers',
    categoryLabel: 'Rasgo / Poder',
    description: 'Habilidad que puede usarse 3 + Modificador de característica al día (mínimo 1).',
    snippet: 'Usos diarios disponibles: {max(1, 3 + mod_lanzador)} veces al día.',
    notes: 'Fórmula clásica de Pathfinder para poderes de dominio de clérigo o escuela de mago.',
  },
  {
    id: 'sneaking-bonus',
    title: 'Bonificador de Clase cada 2 niveles',
    category: 'combat',
    categoryLabel: 'Combate',
    description: 'Aumenta un bonificador pasivo en +1 por cada 2 niveles completos.',
    snippet: 'Otorga un bonificador de +{floor(nivel_personaje / 2)} a las tiradas de salvación.',
    notes: 'floor() asegura que suba en niveles pares (2, 4, 6, 8, etc.).',
  },
  {
    id: 'pathfinder-ranges',
    title: 'Alcances estándar de Pathfinder',
    category: 'range',
    categoryLabel: 'Alcance',
    description: 'Alcances de conjuros oficiales que escalan con el nivel de lanzador.',
    snippet:
      '- Corto: corto (25 pies + 5 pies/2 nivel personaje)\n- Medio: medio (100 pies + 10 pies/nivel personaje)\n- Largo: largo (400 pies + 40 pies/nivel personaje)',
    notes: 'El sistema calcula automáticamente la distancia en pies según el nivel actual.',
  },
];

/**
 * Preview helper to evaluate any formula snippet given the current character variables.
 */
export function previewFormulaSnippet(snippet: string, variables: CharacterVariables): string {
  const interpolated = interpolateVariables(snippet, variables);
  return resolveRange(interpolated, variables);
}
