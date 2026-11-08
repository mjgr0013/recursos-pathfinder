import React from 'react';
import { parseMarkdown, MarkdownBlock, InlineToken } from '../domain/markdown';
import { interpolateVariables, CharacterVariables } from '../domain/variables';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  emptyPlaceholder?: React.ReactNode;
  variables?: CharacterVariables;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  emptyPlaceholder = <span className="italic text-slate-400">Sin descripción registrada.</span>,
  variables,
}) => {
  if (!content || !content.trim()) {
    return <div className={`text-xs text-slate-400 ${className}`}>{emptyPlaceholder}</div>;
  }

  const resolvedContent = variables ? interpolateVariables(content, variables) : content;
  const blocks = parseMarkdown(resolvedContent);

  const renderInline = (tokens: InlineToken[]): React.ReactNode => {
    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'text': {
          // Preserve soft line breaks
          if (token.content.includes('\n')) {
            const parts = token.content.split('\n');
            return parts.map((part, pIdx) => (
              <React.Fragment key={`${idx}-${pIdx}`}>
                {part}
                {pIdx < parts.length - 1 && <br />}
              </React.Fragment>
            ));
          }
          return <React.Fragment key={idx}>{token.content}</React.Fragment>;
        }
        case 'bold':
          return (
            <strong key={idx} className="font-bold text-slate-100">
              {renderInline(token.content)}
            </strong>
          );
        case 'italic':
          return (
            <em key={idx} className="italic text-slate-200">
              {renderInline(token.content)}
            </em>
          );
        case 'bold_italic':
          return (
            <strong key={idx} className="font-bold italic text-slate-100">
              {renderInline(token.content)}
            </strong>
          );
        case 'strikethrough':
          return (
            <del key={idx} className="line-through text-slate-500">
              {renderInline(token.content)}
            </del>
          );
        case 'code':
          return (
            <code
              key={idx}
              className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700/80 font-mono text-[11px] font-semibold"
            >
              {token.content}
            </code>
          );
        case 'link':
          return (
            <a
              key={idx}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5"
            >
              {token.text}
            </a>
          );
      }
    });
  };

  const renderBlock = (block: MarkdownBlock, idx: number): React.ReactNode => {
    switch (block.type) {
      case 'heading': {
        if (block.level === 1) {
          return (
            <h2
              key={idx}
              className="text-sm font-black text-amber-400 mt-2 mb-1 border-b border-slate-700/60 pb-1"
            >
              {renderInline(block.tokens)}
            </h2>
          );
        }
        if (block.level === 2) {
          return (
            <h3 key={idx} className="text-xs font-black text-amber-300 mt-2 mb-1">
              {renderInline(block.tokens)}
            </h3>
          );
        }
        return (
          <h4
            key={idx}
            className="text-[11px] font-bold text-slate-200 mt-1.5 mb-1 uppercase tracking-wide"
          >
            {renderInline(block.tokens)}
          </h4>
        );
      }
      case 'paragraph':
        return (
          <p key={idx} className="my-1.5 leading-relaxed text-xs text-slate-300">
            {renderInline(block.tokens)}
          </p>
        );
      case 'unordered_list':
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 my-1.5 text-xs text-slate-300 pl-1">
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      case 'ordered_list':
        return (
          <ol
            key={idx}
            className="list-decimal list-inside space-y-1 my-1.5 text-xs text-slate-300 pl-1"
          >
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      case 'blockquote':
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-amber-500/70 pl-2.5 py-1 my-1.5 text-xs text-slate-300 italic bg-slate-950/40 rounded-r"
          >
            {renderInline(block.tokens)}
          </blockquote>
        );
      case 'code_block':
        return (
          <pre
            key={idx}
            className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto my-1.5 whitespace-pre"
          >
            <code>{block.content}</code>
          </pre>
        );
      case 'table':
        return (
          <div key={idx} className="overflow-x-auto my-2 rounded border border-slate-700/80">
            <table className="w-full text-left text-[11px] divide-y divide-slate-700/80">
              <thead className="bg-slate-950 text-slate-200 font-bold">
                <tr>
                  {block.headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-2.5 py-1.5">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {block.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 text-slate-300">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'divider':
        return <hr key={idx} className="border-slate-700/70 my-2" />;
    }
  };

  return <div className={`text-xs text-slate-300 ${className}`}>{blocks.map(renderBlock)}</div>;
};
