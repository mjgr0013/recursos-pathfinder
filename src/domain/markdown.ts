export type InlineToken =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: InlineToken[] }
  | { type: 'italic'; content: InlineToken[] }
  | { type: 'bold_italic'; content: InlineToken[] }
  | { type: 'strikethrough'; content: InlineToken[] }
  | { type: 'code'; content: string }
  | { type: 'link'; text: string; href: string };

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; tokens: InlineToken[] }
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'unordered_list'; items: InlineToken[][] }
  | { type: 'ordered_list'; items: InlineToken[][] }
  | { type: 'blockquote'; tokens: InlineToken[] }
  | { type: 'code_block'; language?: string; content: string }
  | { type: 'table'; headers: InlineToken[][]; rows: InlineToken[][][] }
  | { type: 'divider' };

/**
 * Validates whether a URL is safe to render in an <a> href attribute.
 * Protects against XSS attacks like javascript: or data: URIs.
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return true;
  }
  // Allow safe anchor links and relative paths
  if (trimmed.startsWith('#') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    return true;
  }
  return false;
}

/**
 * Parses inline markdown tokens: bold, italic, bold+italic, strikethrough, inline code, and links.
 */
export function parseInline(text: string): InlineToken[] {
  if (!text) return [];

  const tokens: InlineToken[] = [];
  let remaining = text;

  // Regex matches in priority order
  // 1: code `...`
  // 2: link [...](...) - allows balanced single parentheses in URL (e.g. Wikipedia links or functions)
  // 3: bold_italic ***...*** or ___...___
  // 4: bold **...** or __...__
  // 5: italic *...* or _..._
  // 6: strikethrough ~~...~~
  const pattern =
    /(`([^`]+)`)|(\[([^\]]+)\]\(((?:[^()\s]|\([^\s()]*\))+)\))|(\*\*\*([^*]+)\*\*\*|___([^_]+)___)|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*]+)\*|_([^_]+)_)|(~~([^~]+)~~)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      tokens.push({ type: 'text', content: remaining });
      break;
    }

    if (match.index > 0) {
      tokens.push({ type: 'text', content: remaining.slice(0, match.index) });
    }

    const matchedFull = match[0];
    remaining = remaining.slice(match.index + matchedFull.length);

    if (match[1]) {
      // Code `...`
      tokens.push({ type: 'code', content: match[2] });
    } else if (match[3]) {
      // Link [text](url)
      const linkText = match[4];
      const rawHref = match[5];
      const href = isSafeUrl(rawHref) ? rawHref : '#';
      tokens.push({ type: 'link', text: linkText, href });
    } else if (match[6]) {
      // Bold + Italic ***...*** or ___...___
      const inner = match[7] || match[8];
      tokens.push({ type: 'bold_italic', content: parseInline(inner) });
    } else if (match[9]) {
      // Bold **...** or __...__
      const inner = match[10] || match[11];
      tokens.push({ type: 'bold', content: parseInline(inner) });
    } else if (match[12]) {
      // Italic *...* or _..._
      const inner = match[13] || match[14];
      tokens.push({ type: 'italic', content: parseInline(inner) });
    } else if (match[15]) {
      // Strikethrough ~~...~~
      const inner = match[16];
      tokens.push({ type: 'strikethrough', content: parseInline(inner) });
    }
  }

  return tokens;
}

/**
 * Parses multiline markdown text into structured blocks.
 */
export function parseMarkdown(text: string): MarkdownBlock[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];

  let i = 0;
  let paragraphAccumulator: string[] = [];

  const flushParagraph = () => {
    if (paragraphAccumulator.length > 0) {
      const content = paragraphAccumulator.join('\n');
      blocks.push({
        type: 'paragraph',
        tokens: parseInline(content),
      });
      paragraphAccumulator = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code blocks: ```language ... ```
    if (trimmed.startsWith('```')) {
      flushParagraph();
      const language = trimmed.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push({
        type: 'code_block',
        language,
        content: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Empty lines
    if (!trimmed) {
      flushParagraph();
      i++;
      continue;
    }

    // 3. Horizontal rule / divider
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // 4. Headings: # Heading 1 ... ###### Heading 6
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        type: 'heading',
        level,
        tokens: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    // 5. Blockquote: > quote
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const qLine = lines[i].trim();
        quoteLines.push(qLine.replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        tokens: parseInline(quoteLines.join('\n')),
      });
      continue;
    }

    // 6. Tables: starts and ends with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      const isDivider = /^\|(?:\s*:?-+:?\s*\|)+$/.test(nextTrimmed);
      if (isDivider) {
        flushParagraph();
        const rawHeaders = trimmed
          .slice(1, -1)
          .split('|')
          .map((h) => parseInline(h.trim()));
        i += 2; // skip header and divider

        const rows: InlineToken[][][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          const rowLine = lines[i].trim();
          const cells = rowLine
            .slice(1, -1)
            .split('|')
            .map((c) => parseInline(c.trim()));
          rows.push(cells);
          i++;
        }

        blocks.push({
          type: 'table',
          headers: rawHeaders,
          rows,
        });
        continue;
      }
    }

    // 7. Unordered list: - or * or +
    const uListMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (uListMatch) {
      flushParagraph();
      const items: InlineToken[][] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^[-*+]\s+(.*)$/);
        if (itemMatch) {
          items.push(parseInline(itemMatch[1]));
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: 'unordered_list',
        items,
      });
      continue;
    }

    // 8. Ordered list: 1. 2. 3.
    const oListMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (oListMatch) {
      flushParagraph();
      const items: InlineToken[][] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^\d+\.\s+(.*)$/);
        if (itemMatch) {
          items.push(parseInline(itemMatch[1]));
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: 'ordered_list',
        items,
      });
      continue;
    }

    // 9. Otherwise, regular paragraph text
    paragraphAccumulator.push(line);
    i++;
  }

  flushParagraph();
  return blocks;
}
