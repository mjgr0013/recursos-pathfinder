import React, { useRef, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CharacterVariables } from '../domain/variables';
import { FormulaGuideModal } from './FormulaGuideModal';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  id?: string;
  required?: boolean;
  variables?: CharacterVariables;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label = 'Descripción o reglas',
  placeholder = 'Detalles de las reglas (soporta Markdown y variables)...',
  rows = 4,
  maxLength = 4000,
  className = '',
  id,
  required = false,
  variables,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || defaultPlaceholder;

    const newValue =
      value.substring(0, start) + prefix + textToInsert + suffix + value.substring(end);

    if (newValue.length > maxLength) return;

    onChange(newValue);

    // Keep focus and restore or adjust selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      const newEnd = newStart + textToInsert.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const insertLinePrefix = (linePrefix: string, defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let insertion: string;
    if (selectedText) {
      // Add prefix to every line in selection
      insertion = selectedText
        .split('\n')
        .map((line) => (line.startsWith(linePrefix) ? line : `${linePrefix}${line}`))
        .join('\n');
    } else {
      insertion = `${linePrefix}${defaultPlaceholder}`;
    }

    // Ensure we start on a new line if not already at the start or after a newline
    const needsLeadingNewline = start > 0 && value[start - 1] !== '\n';
    const finalPrefix = needsLeadingNewline ? '\n' : '';
    const toInsert = finalPrefix + insertion;

    const newValue = value.substring(0, start) + toInsert + value.substring(end);
    if (newValue.length > maxLength) return;

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + toInsert.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Header with Label and Tabs */}
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-amber-500 dark:text-amber-400">*</span>}
        </label>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-0.5 text-xs shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeTab === 'write'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            ✏️ Escribir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              activeTab === 'preview'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            👁️ Vista previa
          </button>
        </div>
      </div>

      {activeTab === 'write' ? (
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:border-amber-500 dark:focus-within:border-amber-400 transition-colors shadow-sm">
          {/* Quick Formatting Toolbar */}
          <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => applyFormatting('**', '**', 'negrita')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Negrita (**texto**)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('*', '*', 'cursiva')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 italic font-serif rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Cursiva (*texto*)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('### ', 'Título de sección')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Encabezado (### Título)"
            >
              H
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('- ', 'Elemento')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Lista de viñetas (- Elemento)"
            >
              • Lista
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('1. ', 'Elemento')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Lista numerada (1. Elemento)"
            >
              1.
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('> ', 'Cita o resumen')}
              className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-serif rounded border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Cita (> Texto)"
            >
              &ldquo;&rdquo;
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('`', '`', '1d8+2')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-mono text-[11px] rounded border border-amber-200 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Tirada o Código (`1d8+2`)"
            >
              🎲 `dado`
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('{nivel_personaje}', '', '')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-mono text-[11px] rounded border border-amber-200 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Insertar variable de nivel ({nivel_personaje})"
            >
              {`{nivel}`}
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('{ataque_base}', '', '')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-mono text-[11px] rounded border border-amber-200 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Insertar variable de ataque base ({ataque_base})"
            >
              {`{bab}`}
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('{modificador_lanzador}', '', '')}
              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-800 dark:text-purple-300 font-mono text-[11px] rounded border border-purple-200 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Insertar variable de modificador de conjuros ({modificador_lanzador})"
            >
              {`{mod}`}
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('[', '](https://...)', 'Enlace')}
              className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 text-xs rounded border border-cyan-200 dark:border-slate-700/60 active:scale-95 transition-colors"
              title="Enlace ([texto](url))"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-300 font-bold rounded border border-amber-300 dark:border-amber-500/50 active:scale-95 text-[11px] flex items-center gap-1 ml-auto transition-colors"
              title="Abrir guía de fórmulas, variables y funciones (min, max...)"
            >
              <span>📐</span>
              <span>Guía</span>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-y min-h-[90px]"
            required={required}
          />
        </div>
      ) : (
        /* Preview Tab */
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-950/70 min-h-[120px] max-h-[220px] overflow-y-auto text-slate-900 dark:text-slate-100 shadow-inner">
          {value.trim() ? (
            <MarkdownRenderer content={value} variables={variables} />
          ) : (
            <p className="italic text-xs text-slate-400 dark:text-slate-500 text-center py-6">
              Escribe reglas en la pestaña &quot;✏️ Escribir&quot; para previsualizarlas aquí con formato Markdown y variables dinámicas.
            </p>
          )}
        </div>
      )}

      {/* Footer info: counter & hints */}
      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
            Variables: &apos;{'{nivel_personaje}'}&apos;, &apos;{'{ataque_base}'}&apos;, &apos;{'{modificador_lanzador}'}&apos;
          </span>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 underline font-semibold transition-colors"
          >
            Guía de fórmulas
          </button>
        </div>
        <span className="ml-auto">
          {value.length} / {maxLength}
        </span>
      </div>

      <FormulaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        variables={variables ?? { nivel_personaje: 1, ataque_base: 0, modificador_lanzador: 0 }}
        onInsert={(snippet) => applyFormatting(snippet, '', '')}
      />
    </div>
  );
};
