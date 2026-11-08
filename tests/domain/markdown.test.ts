import { describe, it, expect } from 'vitest';
import { parseMarkdown, parseInline, isSafeUrl } from '../../src/domain/markdown';

describe('Markdown Domain Logic', () => {
  describe('isSafeUrl', () => {
    it('allows safe http, https and mailto URLs', () => {
      expect(isSafeUrl('https://aonprd.com/SpellDisplay.aspx?ItemName=Fireball')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
      expect(isSafeUrl('mailto:gm@example.com')).toBe(true);
      expect(isSafeUrl('#seccion')).toBe(true);
      expect(isSafeUrl('/docs/pathfinder')).toBe(true);
    });

    it('rejects unsafe javascript and data protocols', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('//dangerous-domain.com')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
    });
  });

  describe('parseInline', () => {
    it('returns empty array for empty string', () => {
      expect(parseInline('')).toEqual([]);
    });

    it('parses plain text', () => {
      expect(parseInline('Curar heridas leves')).toEqual([
        { type: 'text', content: 'Curar heridas leves' },
      ]);
    });

    it('parses bold text with ** or __', () => {
      const tokens1 = parseInline('Causa **1d8+1** puntos');
      expect(tokens1).toEqual([
        { type: 'text', content: 'Causa ' },
        { type: 'bold', content: [{ type: 'text', content: '1d8+1' }] },
        { type: 'text', content: ' puntos' },
      ]);

      const tokens2 = parseInline('__importante__');
      expect(tokens2).toEqual([
        { type: 'bold', content: [{ type: 'text', content: 'importante' }] },
      ]);
    });

    it('parses italic text with * or _', () => {
      const tokens = parseInline('Efecto *inmediato* al tocar');
      expect(tokens).toEqual([
        { type: 'text', content: 'Efecto ' },
        { type: 'italic', content: [{ type: 'text', content: 'inmediato' }] },
        { type: 'text', content: ' al tocar' },
      ]);
    });

    it('parses bold+italic with *** or ___', () => {
      const tokens = parseInline('***Crítico masivo***');
      expect(tokens).toEqual([
        { type: 'bold_italic', content: [{ type: 'text', content: 'Crítico masivo' }] },
      ]);
    });

    it('parses strikethrough with ~~', () => {
      const tokens = parseInline('~~descartado~~');
      expect(tokens).toEqual([
        { type: 'strikethrough', content: [{ type: 'text', content: 'descartado' }] },
      ]);
    });

    it('parses inline code / dice notation with `', () => {
      const tokens = parseInline('Tirada `1d20 + 7` contra `CD 15`');
      expect(tokens).toEqual([
        { type: 'text', content: 'Tirada ' },
        { type: 'code', content: '1d20 + 7' },
        { type: 'text', content: ' contra ' },
        { type: 'code', content: 'CD 15' },
      ]);
    });

    it('parses links and sanitizes unsafe links', () => {
      const safeTokens = parseInline('Ver [AonPRD](https://aonprd.com)');
      expect(safeTokens).toEqual([
        { type: 'text', content: 'Ver ' },
        { type: 'link', text: 'AonPRD', href: 'https://aonprd.com' },
      ]);

      const wikiTokens = parseInline('Ver [Wiki](https://en.wikipedia.org/wiki/Pathfinder_(game))');
      expect(wikiTokens).toEqual([
        { type: 'text', content: 'Ver ' },
        { type: 'link', text: 'Wiki', href: 'https://en.wikipedia.org/wiki/Pathfinder_(game)' },
      ]);

      const unsafeTokens = parseInline('Click [Malo](javascript:alert(1))');
      expect(unsafeTokens).toEqual([
        { type: 'text', content: 'Click ' },
        { type: 'link', text: 'Malo', href: '#' },
      ]);
    });
  });

  describe('parseMarkdown', () => {
    it('returns empty array for empty or whitespace text', () => {
      expect(parseMarkdown('')).toEqual([]);
      expect(parseMarkdown('   \n  \n')).toEqual([]);
    });

    it('parses headings with correct level', () => {
      const md = '# Título 1\n## Subtítulo 2\n### Nivel 3';
      const blocks = parseMarkdown(md);
      expect(blocks).toEqual([
        {
          type: 'heading',
          level: 1,
          tokens: [{ type: 'text', content: 'Título 1' }],
        },
        {
          type: 'heading',
          level: 2,
          tokens: [{ type: 'text', content: 'Subtítulo 2' }],
        },
        {
          type: 'heading',
          level: 3,
          tokens: [{ type: 'text', content: 'Nivel 3' }],
        },
      ]);
    });

    it('parses unordered lists', () => {
      const md = '- Primer efecto\n- Segundo efecto con **ventaja**\n* Tercer efecto';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('unordered_list');
      if (blocks[0].type === 'unordered_list') {
        expect(blocks[0].items).toHaveLength(3);
        expect(blocks[0].items[1]).toEqual([
          { type: 'text', content: 'Segundo efecto con ' },
          { type: 'bold', content: [{ type: 'text', content: 'ventaja' }] },
        ]);
      }
    });

    it('parses ordered lists', () => {
      const md = '1. Preparar componente\n2. Realizar tirada\n3. Aplicar daño\nTexto siguiente al listado';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('ordered_list');
      if (blocks[0].type === 'ordered_list') {
        expect(blocks[0].items).toHaveLength(3);
        expect(blocks[0].items[0]).toEqual([{ type: 'text', content: 'Preparar componente' }]);
      }
      expect(blocks[1].type).toBe('paragraph');
    });

    it('parses blockquotes', () => {
      const md = '> Un rayo de luz desciende sobre el objetivo.\n> Ignora cobertura parcial.';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('blockquote');
      if (blocks[0].type === 'blockquote') {
        expect(blocks[0].tokens).toEqual([
          {
            type: 'text',
            content: 'Un rayo de luz desciende sobre el objetivo.\nIgnora cobertura parcial.',
          },
        ]);
      }
    });

    it('parses code blocks with language', () => {
      const md = '```json\n{"damage": "2d6+3"}\n```';
      const blocks = parseMarkdown(md);
      expect(blocks).toEqual([
        {
          type: 'code_block',
          language: 'json',
          content: '{"damage": "2d6+3"}',
        },
      ]);
    });

    it('parses divider lines', () => {
      const md = 'Parte 1\n---\nParte 2';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('divider');
      expect(blocks[2].type).toBe('paragraph');
    });

    it('parses markdown tables', () => {
      const md = '| Nivel | Daño |\n| --- | --- |\n| 1 | 1d6 |\n| 5 | 2d6 |';
      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('table');
      if (blocks[0].type === 'table') {
        expect(blocks[0].headers).toHaveLength(2);
        expect(blocks[0].rows).toHaveLength(2);
        expect(blocks[0].rows[0][1]).toEqual([{ type: 'text', content: '1d6' }]);
      }
    });

    it('parses mixed paragraphs and markdown formatting', () => {
      const md = `### Curar Heridas
Canaliza energía positiva.

- **Toque**: Requiere acción estándar.
- **Efecto**: Restaura \`1d8 + nivel\` PG.

> "La luz reconforta a los heridos."`;

      const blocks = parseMarkdown(md);
      expect(blocks).toHaveLength(4);
      expect(blocks[0].type).toBe('heading');
      expect(blocks[1].type).toBe('paragraph');
      expect(blocks[2].type).toBe('unordered_list');
      expect(blocks[3].type).toBe('blockquote');
    });
  });
});
