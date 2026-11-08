/**
 * Safe expression evaluator and variable interpolation for Pathfinder descriptions.
 * Supports character variables:
 * - Nivel del personaje: nivel_personaje, nivel, level
 * - Ataque base: ataque_base, bab, base_attack
 * - Modificador de lanzador: modificador_lanzador, mod_lanzador, mod_conjuros, modificador_conjuros, caster_mod
 * Basic math (+, -, *, /), and helper functions (floor, ceil, round, min, max).
 */

export interface CharacterVariables {
  nivel_personaje?: number;
  nivel?: number;
  level?: number;
  ataque_base?: number;
  bab?: number;
  base_attack?: number;
  modificador_lanzador?: number;
  mod_lanzador?: number;
  mod_conjuros?: number;
  modificador_conjuros?: number;
  caster_mod?: number;
  [key: string]: number | undefined;
}

const VAR_PATTERN =
  /\b(?:nivel_personaje|nivel|level|ataque_base|bab|base_attack|modificador_lanzador|mod_lanzador|mod_conjuros|modificador_conjuros|caster_mod)\b/gi;

export function buildNormalizedVariables(vars: CharacterVariables = {}): Record<string, number> {
  const nivel = vars.nivel_personaje ?? vars.nivel ?? vars.level ?? 1;
  const bab = vars.ataque_base ?? vars.bab ?? vars.base_attack ?? 0;
  const mod =
    vars.modificador_lanzador ??
    vars.mod_lanzador ??
    vars.mod_conjuros ??
    vars.modificador_conjuros ??
    vars.caster_mod ??
    0;

  const result: Record<string, number> = {
    nivel_personaje: nivel,
    nivel,
    level: nivel,
    ataque_base: bab,
    bab,
    base_attack: bab,
    modificador_lanzador: mod,
    mod_lanzador: mod,
    mod_conjuros: mod,
    modificador_conjuros: mod,
    caster_mod: mod,
  };

  for (const [k, v] of Object.entries(vars)) {
    if (typeof v === 'number') {
      result[k.toLowerCase()] = v;
    }
  }

  return result;
}

/**
 * Safely evaluates a basic mathematical expression without eval() or new Function().
 * Returns NaN if expression is malformed or contains unsupported tokens.
 */
export function evaluateSafeMath(expr: string, rawVars: CharacterVariables): number {
  if (!expr || !expr.trim()) return NaN;

  const vars = buildNormalizedVariables(rawVars);

  // Normalize Math.* prefix to plain functions and replace variables with values
  let clean = expr
    .trim()
    .replace(/Math\.(floor|ceil|round|min|max)/gi, '$1')
    .replace(VAR_PATTERN, (match) => {
      const key = match.toLowerCase();
      const val = vars[key] ?? 0;
      return String(val);
    });

  // Tokenize
  const tokenRegex = /\s*([0-9]+(?:\.[0-9]+)?|[a-zA-Z_][a-zA-Z0-9_]*|\+|-|\*|\/|\(|\)|,)\s*/g;
  const tokens: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(clean)) !== null) {
    tokens.push(m[1]);
  }

  // If tokens didn't cover the full cleaned string, invalid characters exist
  const reconstructed = tokens.join('');
  if (reconstructed.length < clean.replace(/\s+/g, '').length) {
    return NaN;
  }

  let pos = 0;

  function peek(): string | undefined {
    return tokens[pos];
  }

  function consume(expected?: string): string {
    const token = tokens[pos];
    if (expected && token !== expected) {
      throw new Error(`Expected ${expected} but got ${token}`);
    }
    pos++;
    return token;
  }

  // Recursive descent parser
  function parseExpr(): number {
    let result = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const next = parseTerm();
      result = op === '+' ? result + next : result - next;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const next = parseFactor();
      result = op === '*' ? result * next : next !== 0 ? result / next : 0;
    }
    return result;
  }

  function parseFactor(): number {
    const token = peek();

    // Unary plus or minus
    if (token === '+') {
      consume('+');
      return parseFactor();
    }
    if (token === '-') {
      consume('-');
      return -parseFactor();
    }

    if (token === '(') {
      consume('(');
      const res = parseExpr();
      consume(')');
      return res;
    }

    if (!token) return NaN;

    // Number literal
    if (/^[0-9]+(?:\.[0-9]+)?$/.test(token)) {
      consume();
      return parseFloat(token);
    }

    // Function calls: min, max, floor, ceil, round
    const fnName = token.toLowerCase();
    if (['floor', 'ceil', 'round', 'min', 'max'].includes(fnName)) {
      consume();
      consume('(');
      const args: number[] = [parseExpr()];
      while (peek() === ',') {
        consume(',');
        args.push(parseExpr());
      }
      consume(')');

      switch (fnName) {
        case 'floor':
          return Math.floor(args[0]);
        case 'ceil':
          return Math.ceil(args[0]);
        case 'round':
          return Math.round(args[0]);
        case 'min':
          return Math.min(...args);
        case 'max':
          return Math.max(...args);
      }
    }

    // Unknown identifier
    consume();
    return NaN;
  }

  try {
    const val = parseExpr();
    if (pos === tokens.length && Number.isFinite(val)) {
      return val;
    }
  } catch {
    return NaN;
  }

  return NaN;
}

/**
 * Evaluates variable expressions inside backtick dice notation.
 * e.g. `1d8 + ataque_base`, `1d20 + ataque_base + modificador_lanzador`, `(nivel_personaje + 2)d8`
 */
function evaluateDiceInner(inner: string, vars: CharacterVariables): string {
  let result = inner;

  // 1. Any `{...}` inside backtick
  result = result.replace(/\{([^{}]+)\}/g, (match, expr) => {
    const num = evaluateSafeMath(expr, vars);
    return Number.isFinite(num) ? String(num) : match;
  });

  // 2. Dice with variable quantity in parentheses: (nivel_personaje + 2)d8 -> 7d8
  result = result.replace(
    new RegExp(`\\(([^)]*?${VAR_PATTERN.source}[^)]*?)\\)\\s*d\\s*([0-9]+)`, 'gi'),
    (match, expr, die) => {
      const num = evaluateSafeMath(expr, vars);
      return Number.isFinite(num) ? `${num}d${die}` : match;
    }
  );

  // 3. Dice with direct variable quantity: nivel_personaje d8, nivel_personaje+2 d8
  result = result.replace(
    new RegExp(`\\b(${VAR_PATTERN.source}(?:\\s*[+\\-*/]\\s*[0-9]+)?)\\s*d\\s*([0-9]+)`, 'gi'),
    (match, expr, die) => {
      const num = evaluateSafeMath(expr, vars);
      return Number.isFinite(num) ? `${num}d${die}` : match;
    }
  );

  // 4. Dice with variable modifier: 1d8 + modificador_lanzador, 1d20 + ataque_base + modificador_lanzador
  result = result.replace(
    /([0-9]+d[0-9]+)\s*([+-])\s*([^`]+)/gi,
    (match, dice, sign, modifierExpr) => {
      if (new RegExp(VAR_PATTERN.source, 'i').test(modifierExpr)) {
        const num = evaluateSafeMath(modifierExpr, vars);
        if (Number.isFinite(num)) {
          if (sign === '+') {
            return num >= 0 ? `${dice} + ${num}` : `${dice} - ${Math.abs(num)}`;
          } else {
            return num >= 0 ? `${dice} - ${num}` : `${dice} + ${Math.abs(num)}`;
          }
        }
      }
      return match;
    }
  );

  // 5. Standalone expression with variable: `+ataque_base` -> `+3`, `ataque_base + modificador_lanzador` -> `7`
  if (new RegExp(VAR_PATTERN.source, 'i').test(result)) {
    const trimmed = result.trim();
    const hasLeadingPlus = trimmed.startsWith('+');
    const cleanExpr = hasLeadingPlus ? trimmed.slice(1) : trimmed;
    const num = evaluateSafeMath(cleanExpr, vars);
    if (Number.isFinite(num)) {
      return hasLeadingPlus ? `+${num}` : String(num);
    }
  }

  return result;
}

/**
 * Resolves a range expression into its computed string value for the given character level.
 * Handles standard Pathfinder formulas:
 * - "corto (25 pies + 5 pies/2 nivel personaje)" -> "corto (35 pies)" (at level 5)
 * - "medio (100 pies + 10 pies/nivel personaje)" -> "medio (150 pies)" (at level 5)
 * - "largo (400 pies + 40 pies/nivel personaje)" -> "largo (600 pies)" (at level 5)
 * - "25 pies + 5 pies/2 niveles" -> "35 pies"
 * - Braced expressions: "{25 + 5 * floor(nivel_personaje / 2)} pies"
 * - Non-formula ranges ("Toque", "Personal", "30 pies") are returned unmodified.
 */
export function resolveRange(
  rawRange: string,
  variables: CharacterVariables = { nivel_personaje: 1 }
): string {
  if (!rawRange || !rawRange.trim()) return '';

  const vars = buildNormalizedVariables(variables);
  const level = vars.nivel_personaje ?? 1;

  // 1. Evaluate any braced expressions {...}
  let result = rawRange.replace(/\{([^{}]+)\}/g, (match, expr) => {
    const num = evaluateSafeMath(expr, vars);
    return Number.isFinite(num) ? String(num) : match;
  });

  // 2. Pattern for Pathfinder range formulas:
  // e.g. "25 pies + 5 pies/2 nivel personaje", "25 pies + 5 pies/2 niveles", "100 pies + 10 pies/nivel", "400 ft + 40 ft / level"
  const rangeFormulaRegex =
    /\b([0-9]+)\s*([a-zA-ZáéíóúÁÉÍÓÚ]+|\bft\b)?\s*\+\s*([0-9]+)\s*([a-zA-ZáéíóúÁÉÍÓÚ]+|\bft\b)?\s*\/\s*(?:([0-9]+)\s*)?(?:niveles|nivel(?:\s+(?:de\s+)?personaje|\s*_personaje)?|levels?|lvls?)\b/gi;

  result = result.replace(
    rangeFormulaRegex,
    (_match, baseStr, unit1, incStr, unit2, divStr) => {
      const base = parseInt(baseStr, 10);
      const inc = parseInt(incStr, 10);
      const div = divStr ? parseInt(divStr, 10) : 1;
      const unit = unit1 || unit2 || 'pies';

      const total = base + inc * Math.floor(level / Math.max(1, div));
      return `${total} ${unit}`;
    }
  );

  return result;
}

/**
 * Replaces variable references in a markdown text with their calculated values.
 * - Braced expressions: `{nivel_personaje}`, `{nivel_personaje + 2}`, `{floor(nivel_personaje / 2)}`
 * - Backtick dice notation: `1d8 + nivel_personaje`, `{nivel_personaje}d8 + 2`, `(nivel_personaje + 2)d6`
 * - Range formulas: "corto (25 pies + 5 pies/2 nivel personaje)" -> "corto (35 pies)"
 */
export function interpolateVariables(
  text: string,
  variables: CharacterVariables = { nivel_personaje: 1 }
): string {
  if (!text) return '';

  const vars = buildNormalizedVariables(variables);

  // Step 1: Interpolate curly braces expressions `{...}` across whole text
  let output = text.replace(/\{([^{}]+)\}/g, (match, expr) => {
    const num = evaluateSafeMath(expr, vars);
    if (Number.isFinite(num)) {
      return String(num);
    }
    return match;
  });

  // Step 2: Interpolate backticks expressions `...`
  output = output.replace(/`([^`]+)`/g, (_match, inner) => {
    const evaluated = evaluateDiceInner(inner, vars);
    return `\`${evaluated}\``;
  });

  // Step 3: Resolve range formulas (e.g. in rules descriptions)
  output = resolveRange(output, vars);

  return output;
}
