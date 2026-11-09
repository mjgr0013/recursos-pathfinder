import React, { useState, useEffect, useMemo } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { CharacterVariables } from '../domain/variables';
import {
  FORMULA_VARIABLES,
  FORMULA_FUNCTIONS,
  FORMULA_SYNTAX_RULES,
  FORMULA_REFERENCE_EXAMPLES,
  previewFormulaSnippet,
  FormulaExample,
} from '../domain/formula-guide';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables?: CharacterVariables;
  onInsert?: (snippet: string) => void;
}

type GuideTab = 'examples' | 'variables' | 'functions' | 'syntax' | 'sandbox';

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({
  isOpen,
  onClose,
  variables = { nivel_personaje: 1, ataque_base: 0, modificador_lanzador: 0 },
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('examples');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sandboxExpr, setSandboxExpr] = useState(
    'Cura `1d8 + {min(5, nivel_personaje)}` PG (CD {10 + 2 + mod_lanzador})'
  );

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (snippet: string) => {
    if (onInsert) {
      onInsert(snippet);
      onClose();
    }
  };

  const filteredExamples = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FORMULA_REFERENCE_EXAMPLES;
    return FORMULA_REFERENCE_EXAMPLES.filter(
      (ex) =>
        ex.title.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q) ||
        ex.snippet.toLowerCase().includes(q) ||
        ex.categoryLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredFunctions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FORMULA_FUNCTIONS;
    return FORMULA_FUNCTIONS.filter(
      (fn) =>
        fn.name.toLowerCase().includes(q) ||
        fn.label.toLowerCase().includes(q) ||
        fn.description.toLowerCase().includes(q) ||
        fn.example.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredVariables = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FORMULA_VARIABLES;
    return FORMULA_VARIABLES.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const currentLevel = variables.nivel_personaje ?? variables.nivel ?? 1;
  const currentBab = variables.ataque_base ?? variables.bab ?? 0;
  const currentMod =
    variables.modificador_lanzador ?? variables.mod_lanzador ?? variables.caster_mod ?? 0;

  return (
    <ModalOverlay onClose={onClose} aria-label="Guía de Fórmulas y Variables">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📐</span>
              <h2 className="text-base sm:text-lg font-bold text-amber-400">
                Guía de Fórmulas y Variables
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Aprende a usar variables, funciones (min, max, floor...) y tiradas dinámicas para tus
              conjuros y dotes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-btn text-slate-400 hover:text-slate-200 text-lg p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar guía"
          >
            ✕
          </button>
        </div>

        {/* Character stats bar */}
        <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-semibold text-amber-300">Valores de tu personaje:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
              Nivel: <strong>{currentLevel}</strong>
            </span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
              BAB: <strong>{currentBab >= 0 ? `+${currentBab}` : currentBab}</strong>
            </span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-purple-300">
              Mod. Lanzador: <strong>{currentMod >= 0 ? `+${currentMod}` : currentMod}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 overflow-x-auto text-xs font-semibold bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'examples'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>📜</span>
            <span>Ejemplos Pathfinder</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variables')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'variables'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>🏷️</span>
            <span>Variables</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('functions')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'functions'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>⚙️</span>
            <span>Funciones (min, max...)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('syntax')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'syntax'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>🎯</span>
            <span>Sintaxis</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>🧪</span>
            <span>Probador</span>
          </button>
        </div>

        {/* Search input (except in sandbox) */}
        {activeTab !== 'sandbox' && (
          <div className="p-3 bg-slate-950/30 border-b border-slate-800">
            <input
              type="text"
              placeholder="Buscar fórmulas, variables o ejemplos (ej. curar, min, bab, bola de fuego)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB: EXAMPLES */}
          {activeTab === 'examples' && (
            <div className="space-y-3">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="font-semibold">¿Cómo usar estos ejemplos?</p>
                  <p className="text-slate-300 mt-0.5">
                    Copia cualquier fórmula o haz clic en <strong>Insertar</strong> para incluirla en
                    la descripción. Al subir de nivel o cambiar características, las cantidades se
                    recalcularán automáticamente.
                  </p>
                </div>
              </div>

              {filteredExamples.map((ex: FormulaExample) => {
                const currentPreview = previewFormulaSnippet(ex.snippet, variables);
                return (
                  <div
                    key={ex.id}
                    className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5 transition-colors hover:border-slate-600"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-100">{ex.title}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700 text-amber-300 border border-slate-600">
                            {ex.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ex.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(ex.snippet, ex.id)}
                          className="touch-btn text-xs font-semibold px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center gap-1"
                          title="Copiar fórmula al portapapeles"
                        >
                          {copiedId === ex.id ? (
                            <>
                              <span>✅</span>
                              <span className="text-emerald-400">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <span>📋</span>
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        {onInsert && (
                          <button
                            type="button"
                            onClick={() => handleInsert(ex.snippet)}
                            className="touch-btn text-xs font-bold px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm"
                            title="Insertar fórmula en el editor"
                          >
                            <span>📥</span>
                            <span>Insertar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Formula snippet block */}
                    <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-amber-300 whitespace-pre-wrap select-all">
                      {ex.snippet}
                    </div>

                    {/* Dynamic live result preview */}
                    <div className="bg-slate-900/90 rounded-lg p-2 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold shrink-0">🎯 Resultado actual:</span>
                      <span className="text-slate-200 font-medium whitespace-pre-wrap">
                        {currentPreview}
                      </span>
                    </div>

                    {ex.notes && (
                      <p className="text-[10px] text-slate-400 italic">ℹ️ {ex.notes}</p>
                    )}
                  </div>
                );
              })}

              {filteredExamples.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6 italic">
                  No se encontraron ejemplos que coincidan con &quot;{searchQuery}&quot;.
                </p>
              )}
            </div>
          )}

          {/* TAB: VARIABLES */}
          {activeTab === 'variables' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Las siguientes variables toman su valor automáticamente de la ficha del personaje
                activo:
              </p>

              {filteredVariables.map((v) => (
                <div
                  key={v.name}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        {v.name}
                      </code>
                      <span className="text-xs font-semibold text-slate-200">{v.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`{${v.name}}`, v.name)}
                      className="touch-btn text-[11px] font-semibold px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center gap-1"
                    >
                      {copiedId === v.name ? '✅ Copiado' : '📋 Copiar {var}'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">{v.description}</p>
                  <p className="text-[11px] text-slate-400 italic">📍 Origen: {v.source}</p>

                  <div className="flex items-center gap-2 text-xs flex-wrap pt-1">
                    <span className="text-slate-400 text-[11px]">Alias válidos:</span>
                    {v.aliases.map((alias) => (
                      <code
                        key={alias}
                        className="text-[11px] bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 border border-slate-700/60 font-mono"
                      >
                        {alias}
                      </code>
                    ))}
                  </div>

                  <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 font-mono text-xs flex items-center justify-between">
                    <span className="text-slate-400">
                      Ejemplo: <span className="text-amber-300">{v.exampleSnippet}</span>
                    </span>
                    <span className="text-cyan-400">
                      Valor actual:{' '}
                      <strong>{previewFormulaSnippet(v.exampleSnippet, variables)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: FUNCTIONS */}
          {activeTab === 'functions' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Puedes combinar estas funciones matemáticas dentro de llaves <code>{'{...}'}</code>{' '}
                o tiradas de dados:
              </p>

              {filteredFunctions.map((fn) => (
                <div
                  key={fn.name}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        {fn.signature}
                      </code>
                      <span className="text-xs font-semibold text-slate-200">{fn.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`{${fn.example}}`, fn.name)}
                      className="touch-btn text-[11px] font-semibold px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center gap-1"
                    >
                      {copiedId === fn.name ? '✅ Copiado' : '📋 Copiar ejemplo'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">{fn.description}</p>

                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300">{`{${fn.example}}`}</span>
                      <span className="text-cyan-300 font-bold">
                        = {previewFormulaSnippet(`{${fn.example}}`, variables)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">💡 {fn.explanation}</p>
                  </div>
                </div>
              ))}

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 space-y-1 text-xs">
                <h4 className="font-bold text-slate-200">Operadores Aritméticos Básicos</h4>
                <p className="text-slate-400">
                  Soporta suma (<code>+</code>), resta (<code>-</code>), multiplicación (<code>*</code>
                  ) y división (<code>/</code>), además de paréntesis <code>(...)</code> para controlar
                  el orden de operaciones.
                </p>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded mt-1 border border-slate-800">
                  <code>{'{10 + floor(nivel_personaje / 2) + mod_lanzador}'}</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SYNTAX */}
          {activeTab === 'syntax' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                La aplicación reconoce automáticamente 3 tipos de expresiones dinámicas:
              </p>

              {FORMULA_SYNTAX_RULES.map((rule) => (
                <div
                  key={rule.title}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {rule.badge}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100">{rule.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300">{rule.description}</p>

                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 space-y-1 font-mono text-xs">
                    <p className="text-slate-400 text-[11px]">Sintaxis:</p>
                    <p className="text-cyan-300">{rule.syntax}</p>
                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-200 flex items-start justify-between gap-2">
                      <span>Ejemplo: {rule.example}</span>
                      <span className="text-emerald-400 shrink-0">
                        ➔ {previewFormulaSnippet(rule.example, variables)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">💡 {rule.renderedNote}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SANDBOX (INTERACTIVE TESTER) */}
          {activeTab === 'sandbox' && (
            <div className="space-y-3">
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🧪</span>
                  <span>Probador interactivo de fórmulas</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Escribe cualquier combinación de variables, funciones y dados para ver en tiempo
                  real cómo se evaluará con las estadísticas de tu personaje:
                </p>

                <textarea
                  rows={3}
                  value={sandboxExpr}
                  onChange={(e) => setSandboxExpr(e.target.value)}
                  placeholder="Escribe tu fórmula aquí, por ejemplo: Cura 1d8 + {min(5, nivel_personaje)} PG..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />

                <div className="flex gap-1.5 flex-wrap text-[11px]">
                  <span className="text-slate-400 self-center">Prueba rápida:</span>
                  <button
                    type="button"
                    onClick={() => setSandboxExpr('Cura `1d8 + {min(5, nivel_personaje)}` PG')}
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono"
                  >
                    Curación
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSandboxExpr(
                        'Daño: `{min(10, nivel_personaje)}d6` (CD {10 + 3 + mod_lanzador})'
                      )
                    }
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono"
                  >
                    Bola de fuego
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSandboxExpr('Ataque: `1d20 + ataque_base + mod_lanzador`')
                    }
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono"
                  >
                    Ataque toque
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSandboxExpr('Usos: {max(1, 3 + mod_lanzador)}/día')
                    }
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono"
                  >
                    Usos diarios
                  </button>
                </div>

                {/* Real-time result preview */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                  <p className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <span>🎯</span>
                    <span>Resultado evaluado con tu personaje:</span>
                  </p>
                  <div className="text-xs text-slate-100 font-medium whitespace-pre-wrap bg-slate-900 p-2.5 rounded border border-slate-800">
                    {previewFormulaSnippet(sandboxExpr, variables) || (
                      <span className="text-slate-500 italic">Escribe una fórmula para evaluar</span>
                    )}
                  </div>
                </div>

                {/* Copy or insert sandbox result */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(sandboxExpr, 'sandbox')}
                    className="touch-btn text-xs font-semibold px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center gap-1"
                  >
                    {copiedId === 'sandbox' ? '✅ ¡Copiado!' : '📋 Copiar texto'}
                  </button>
                  {onInsert && (
                    <button
                      type="button"
                      onClick={() => handleInsert(sandboxExpr)}
                      className="touch-btn text-xs font-bold px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1"
                    >
                      <span>📥</span>
                      <span>Insertar en editor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="hidden sm:inline">
            Variables: <code>{'{nivel_personaje}'}</code>, <code>{'{ataque_base}'}</code>,{' '}
            <code>{'{modificador_lanzador}'}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="touch-btn ml-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
