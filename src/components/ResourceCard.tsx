import React, { useState } from 'react';
import { ResourceItem, SpellSlotsMap } from '../domain/types';
import { isValidHttpUrl } from '../domain/resources';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownEditor } from './MarkdownEditor';
import { CharacterVariables, resolveRange } from '../domain/variables';
import { ModalOverlay } from './ModalOverlay';

interface ResourceCardProps {
  resource: ResourceItem;
  spellSlots: SpellSlotsMap;
  characterLevel?: number;
  characterVariables?: CharacterVariables;
  onSpend: (id: string) => void;
  onDelete: (id: string) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestore?: (id: string) => void;
  onRestoreSpellSlot?: (level: number) => void;
  onUpdateResourceDetails?: (id: string, details: { url?: string; description: string; range?: string }) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  spellSlots,
  characterLevel = 1,
  characterVariables,
  onSpend,
  onDelete,
  onSpendSpellSlot,
  onUpdateResourceDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const variables: CharacterVariables = characterVariables ?? {
    nivel_personaje: characterLevel,
    nivel: characterLevel,
    level: characterLevel,
  };

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editUrlVal, setEditUrlVal] = useState(resource.url ?? '');
  const [editRangeVal, setEditRangeVal] = useState(resource.range ?? '');
  const [editDescriptionVal, setEditDescriptionVal] = useState(resource.description ?? '');
  const [urlError, setUrlError] = useState<string | null>(null);

  const isSpell = resource.category === 'spell';
  const isCantrip = isSpell && resource.spellLevel === 0;
  const isLeveledSpell = isSpell && typeof resource.spellLevel === 'number' && resource.spellLevel >= 1;
  const isLimitedFeat = !isSpell && resource.usageMode === 'limited';
  const isUnlimitedFeat = !isSpell && resource.usageMode === 'unlimited';

  const hasCounters = isLeveledSpell || isLimitedFeat;

  let currentAvailable = 0;
  let currentMax = 0;
  let isOutOfUses = false;

  if (isLeveledSpell) {
    const slot = spellSlots[resource.spellLevel!];
    if (slot) {
      currentAvailable = slot.available;
      currentMax = slot.max;
      isOutOfUses = slot.available === 0;
    }
  } else if (isLimitedFeat) {
    currentAvailable = resource.availableUses ?? 0;
    currentMax = resource.maxUses ?? 0;
    isOutOfUses = currentAvailable === 0;
  }

  const handleSpendClick = () => {
    if (isLeveledSpell) {
      onSpendSpellSlot(resource.spellLevel!);
    } else {
      onSpend(resource.id);
    }
  };

  const handleOpenEditDetails = () => {
    setEditUrlVal(resource.url ?? '');
    setEditRangeVal(resource.range ?? '');
    setEditDescriptionVal(resource.description ?? '');
    setUrlError(null);
    setIsEditingDetails(true);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = editUrlVal.trim();
    if (trimmedUrl && !isValidHttpUrl(trimmedUrl)) {
      setUrlError('La URL debe comenzar con http:// o https://');
      return;
    }

    onUpdateResourceDetails?.(resource.id, {
      url: trimmedUrl || undefined,
      description: editDescriptionVal,
      range: editRangeVal.trim() || undefined,
    });
    setIsEditingDetails(false);
    setUrlError(null);
  };

  return (
    <article className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-xl p-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all print:bg-white print:border-slate-300 print:text-slate-900 print:shadow-none print-avoid-break print:p-2.5">
      <div className="flex items-start print:items-center justify-between gap-2">
        {/* Title and Badges */}
        <div className="flex-1 min-w-0 print:flex print:items-center print:gap-1.5 print:flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap mb-1 print:mb-0 print:order-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isSpell
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 print:bg-purple-50 print:border-purple-300 print:text-purple-900'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 print:bg-amber-50 print:border-amber-300 print:text-amber-900'
              }`}
            >
              {isSpell ? '🔮 Conjuro' : '⚔️ Rasgo/Dote'}
            </span>

            {isCantrip && (
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/50 print:bg-slate-100 print:border-slate-300 print:text-slate-800">
                Truco (Nivel 0) • Ilimitado
              </span>
            )}
            {isLeveledSpell && (
              <span className="text-[10px] font-semibold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800/80 print:bg-slate-100 print:border-slate-300 print:text-slate-800">
                Nivel {resource.spellLevel}
              </span>
            )}
            {isLimitedFeat && (
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-800 print:bg-slate-100 print:border-slate-300 print:text-slate-800">
                Usos diarios
              </span>
            )}
            {isUnlimitedFeat && (
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/50 print:bg-slate-100 print:border-slate-300 print:text-slate-800">
                Ilimitado
              </span>
            )}
            {resource.range && (
              <span
                className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-800/80 flex items-center gap-1 shadow-sm print:bg-slate-100 print:border-slate-300 print:text-slate-800"
                title={`Alcance configurado: ${resource.range} • Nivel actual: ${characterLevel}`}
              >
                <span>🎯</span>
                <span>{resolveRange(resource.range, variables)}</span>
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 print:text-slate-900 print:text-xs truncate print:overflow-visible print:whitespace-normal print:order-1">
            {resource.name}
          </h4>
        </div>

        {/* Action Controls: Direct "Lanzar" / "Usar" button on screen, Casillas cuadradas en papel */}
        <div className="flex items-center gap-2 shrink-0">
          {hasCounters && (
            <>
              {/* Contador numérico interactivo en pantalla */}
              <div className="h-7 flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2 print:hidden">
                <span className={`text-sm font-black ${isOutOfUses ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {currentAvailable}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">/{currentMax}</span>
              </div>

              {/* Casillas cuadradas para marcar en papel (solo para rasgos con usos diarios; los conjuros usan los espacios en Recursos Diarios) */}
              {!isSpell && (
                <div className="hidden print:flex items-center gap-1 flex-wrap" aria-label={`Casillas de uso: ${currentMax}`}>
                  {currentMax > 0 &&
                    Array.from({ length: currentMax }).map((_, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 border-2 border-slate-900 rounded-sm inline-block bg-white"
                        aria-hidden="true"
                      />
                    ))}
                </div>
              )}
            </>
          )}

          {/* Dedicated Action Button (Screen only) */}
          {isLeveledSpell && (
            <button
              type="button"
              disabled={isOutOfUses}
              onClick={handleSpendClick}
              className="h-7 px-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1 print:hidden"
              title="Lanzar este conjuro (gasta 1 espacio)"
            >
              <span>✨</span>
              <span>{isOutOfUses ? 'Sin espacios' : 'Lanzar'}</span>
            </button>
          )}

          {isLimitedFeat && (
            <button
              type="button"
              disabled={isOutOfUses}
              onClick={handleSpendClick}
              className="h-7 px-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1 print:hidden"
              title="Usar este rasgo (gasta 1 uso)"
            >
              <svg className="w-3.5 h-3.5 fill-slate-950 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{isOutOfUses ? 'Sin usos' : 'Usar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Description toggle & action bar (Solo en pantalla) */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 print:hidden">
        {/* Alternador de descripción a la izquierda */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="touch-btn text-amber-700 hover:text-amber-800 dark:text-amber-400/90 dark:hover:text-amber-300 font-semibold flex items-center gap-1 py-1 px-1 transition-colors"
        >
          <span>{isExpanded ? '▲ Ver menos' : '▼ Ver más'}</span>
        </button>

        {/* Las 3 acciones alineadas a la derecha con formato unificado y bordes */}
        <div className="flex items-center gap-1.5 ml-auto">
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 touch-btn text-xs text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 rounded-lg border border-slate-300 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
              title="Ver más (reglas oficiales en nueva pestaña)"
              aria-label={`Ver más información oficial sobre ${resource.name}`}
            >
              <span aria-hidden="true">🌐</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleOpenEditDetails}
            className="p-1.5 touch-btn text-xs text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg border border-slate-300 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
            title="Editar detalles del recurso"
            aria-label={`Editar detalles de ${resource.name}`}
          >
            <span>✏️</span>
          </button>

          {showConfirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-slate-900/90 border border-rose-300 dark:border-rose-700/80 rounded-lg p-0.5 shadow-sm">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold px-1">¿Borrar?</span>
              <button
                type="button"
                onClick={() => onDelete(resource.id)}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded touch-btn text-xs"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded touch-btn text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 touch-btn text-xs text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg border border-slate-300 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
              title="Eliminar recurso"
              aria-label={`Eliminar ${resource.name}`}
            >
              <span>🗑️</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded rules drawer (Pantalla cuando se despliega) */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-inner max-h-[350px] overflow-y-auto print:hidden">
          <MarkdownRenderer content={resource.description} variables={variables} />
        </div>
      )}

      {/* Reglas y descripción completas para impresión en papel / PDF (Siempre visible si tiene descripción) */}
      {resource.description ? (
        <div className="hidden print:block mt-2 pt-2 border-t border-slate-300 text-xs print:text-[12px] text-slate-800 print-description">
          <MarkdownRenderer content={resource.description} variables={variables} />
        </div>
      ) : null}

      {/* Modal Editar Detalles (URL y Descripción) */}
      {isEditingDetails && (
        <ModalOverlay
          onClose={() => {
            setIsEditingDetails(false);
            setUrlError(null);
          }}
          backdropClassName="bg-black/60 dark:bg-black/75"
          aria-label="Editar Detalles"
        >
          <div
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-md md:max-w-xl lg:max-w-2xl p-4 md:p-5 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <span>✏️</span> Editar Detalles
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold mb-3 truncate">
              {resource.name}
            </p>

            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL de Documentación Oficial (opcional)
                </label>
                <input
                  type="url"
                  maxLength={500}
                  placeholder="https://aonprd.com/..."
                  value={editUrlVal}
                  onChange={(e) => {
                    setEditUrlVal(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 min-h-touch focus:outline-none focus:border-cyan-500"
                />
                {urlError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">{urlError}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alcance (opcional)
                  </label>
                  <div className="flex items-center gap-1 text-[10px] flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditRangeVal('Toque')}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700/80 active:scale-95 transition-colors"
                    >
                      Toque
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRangeVal('Personal')}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700/80 active:scale-95 transition-colors"
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRangeVal('Corto (25 pies + 5 pies/2 nivel personaje)')}
                      className="px-1.5 py-0.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 rounded border border-cyan-300 dark:border-slate-700/80 active:scale-95 transition-colors"
                      title="25 pies + 5 pies cada 2 niveles"
                    >
                      Corto
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRangeVal('Medio (100 pies + 10 pies/nivel personaje)')}
                      className="px-1.5 py-0.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 rounded border border-cyan-300 dark:border-slate-700/80 active:scale-95 transition-colors"
                      title="100 pies + 10 pies por nivel"
                    >
                      Medio
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRangeVal('Largo (400 pies + 40 pies/nivel personaje)')}
                      className="px-1.5 py-0.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 rounded border border-cyan-300 dark:border-slate-700/80 active:scale-95 transition-colors"
                      title="400 pies + 40 pies por nivel"
                    >
                      Largo
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Ej. corto (25 pies + 5 pies/2 nivel personaje), Toque, 30 pies..."
                  value={editRangeVal}
                  onChange={(e) => setEditRangeVal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 min-h-touch focus:outline-none focus:border-cyan-500"
                />
                {editRangeVal.trim() && (
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-400 mt-1 font-medium flex items-center gap-1">
                    <span>🎯 Calculado con nivel actual ({characterLevel}):</span>
                    <strong>{resolveRange(editRangeVal, variables)}</strong>
                  </p>
                )}
              </div>

              <div>
                <MarkdownEditor
                  id={`edit-resource-${resource.id}-description`}
                  label="Descripción o reglas"
                  placeholder="Detalles de las reglas (soporta Markdown y variables)..."
                  value={editDescriptionVal}
                  onChange={setEditDescriptionVal}
                  rows={4}
                  maxLength={4000}
                  variables={variables}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingDetails(false);
                    setUrlError(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-transparent font-semibold py-2 rounded-lg touch-btn text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg touch-btn text-xs shadow-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </article>
  );
};
