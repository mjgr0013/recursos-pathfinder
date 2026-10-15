import React, { useState } from 'react';
import { ResourceItem, SpellSlotsMap } from '../domain/types';

interface ResourceCardProps {
  resource: ResourceItem;
  spellSlots: SpellSlotsMap;
  onSpend: (id: string) => void;
  onDelete: (id: string) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestore?: (id: string) => void;
  onRestoreSpellSlot?: (level: number) => void;
  onUpdateResourceMaxUses?: (id: string, newMax: number) => void;
  onUpdateResourceUses?: (id: string, newAvailable: number, newMax: number) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  spellSlots,
  onSpend,
  onDelete,
  onSpendSpellSlot,
  onUpdateResourceMaxUses,
  onUpdateResourceUses,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [editingAvailVal, setEditingAvailVal] = useState<number | ''>(resource.availableUses ?? resource.maxUses ?? 1);
  const [editingMaxVal, setEditingMaxVal] = useState<number | ''>(resource.maxUses ?? 1);

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

  return (
    <article className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        {/* Title and Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isSpell
                  ? 'bg-purple-950 text-purple-300 border border-purple-700/60'
                  : 'bg-amber-950 text-amber-300 border border-amber-700/60'
              }`}
            >
              {isSpell ? '🔮 Conjuro' : '⚔️ Rasgo/Dote'}
            </span>

            {isCantrip && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                Truco (Nivel 0) • Ilimitado
              </span>
            )}
            {isLeveledSpell && (
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/80">
                Nivel {resource.spellLevel}
              </span>
            )}
            {isLimitedFeat && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
                Usos diarios
              </span>
            )}
            {isUnlimitedFeat && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                Ilimitado
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-100 truncate">{resource.name}</h4>
        </div>

        {/* Action Controls: Direct "Lanzar" / "Usar" button */}
        <div className="flex items-center gap-2 shrink-0">
          {hasCounters && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1">
              <span className={`text-sm font-black ${isOutOfUses ? 'text-rose-400' : 'text-slate-100'}`}>
                {currentAvailable}
              </span>
              <span className="text-xs text-slate-400 font-bold">/{currentMax}</span>
              {isLimitedFeat && (onUpdateResourceUses || onUpdateResourceMaxUses) && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAvailVal(resource.availableUses ?? resource.maxUses ?? 1);
                    setEditingMaxVal(resource.maxUses ?? 1);
                    setIsEditingMax(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-400 p-0.5 touch-btn ml-0.5"
                  title="Editar usos"
                >
                  ✏️
                </button>
              )}
            </div>
          )}

          {/* Dedicated Action Button */}
          {isLeveledSpell && (
            <button
              type="button"
              disabled={isOutOfUses}
              onClick={handleSpendClick}
              className="touch-btn min-h-[44px] px-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black text-xs rounded-lg shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1.5"
              title="Lanzar este conjuro (gasta 1 espacio)"
            >
              <span>✨</span>
              <span>{isOutOfUses ? 'Sin espacios' : 'Lanzar'}</span>
            </button>
          )}

          {isCantrip && (
            <button
              type="button"
              onClick={handleSpendClick}
              className="touch-btn min-h-[44px] px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-black text-xs rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              title="Lanzar truco a voluntad"
            >
              <span>✨</span>
              <span>Lanzar</span>
            </button>
          )}

          {isLimitedFeat && (
            <button
              type="button"
              disabled={isOutOfUses}
              onClick={handleSpendClick}
              className="touch-btn min-h-[44px] px-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1.5"
              title="Usar este rasgo (gasta 1 uso)"
            >
              <span>⚡</span>
              <span>{isOutOfUses ? 'Sin usos' : 'Usar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Description toggle & action bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="touch-btn text-amber-400/90 hover:text-amber-300 font-semibold flex items-center gap-1 py-1 px-1"
        >
          <span>{isExpanded ? '▲ Ocultar reglas' : '▼ Ver descripción'}</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-md transition-colors"
              title="Ver reglas oficiales"
            >
              <span>🌐</span>
              <span className="hidden xs:inline">Reglas Oficiales</span>
            </a>
          )}

          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-rose-400 font-semibold mr-1">¿Borrar?</span>
              <button
                type="button"
                onClick={() => onDelete(resource.id)}
                className="px-3 py-1.5 bg-rose-700 text-white font-bold rounded-md touch-btn text-xs"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-md touch-btn text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="text-slate-400 hover:text-rose-400 p-1 touch-btn"
              title="Eliminar recurso"
              aria-label={`Eliminar ${resource.name}`}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Expanded rules drawer */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-slate-900/90 rounded-lg border border-slate-700/60 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
          {resource.description.trim() ? resource.description : <span className="italic text-slate-400">Sin descripción registrada.</span>}
        </div>
      )}

      {/* Modal Editar Usos (Disponibles y Máximos) */}
      {isEditingMax && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-1">
              Editar Usos Diarios
            </h4>
            <p className="text-xs text-amber-300 font-semibold mb-3 truncate">
              {resource.name}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanMax = Math.max(1, Math.floor(editingMaxVal === '' ? 1 : editingMaxVal));
                const cleanAvail = Math.max(0, Math.min(cleanMax, Math.floor(editingAvailVal === '' ? 0 : editingAvailVal)));
                if (onUpdateResourceUses) {
                  onUpdateResourceUses(resource.id, cleanAvail, cleanMax);
                } else if (onUpdateResourceMaxUses) {
                  onUpdateResourceMaxUses(resource.id, cleanMax);
                }
                setIsEditingMax(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Usos Disponibles (Actuales)
                </label>
                <input
                  type="number"
                  min={0}
                  max={editingMaxVal === '' ? undefined : Math.max(1, editingMaxVal)}
                  value={editingAvailVal}
                  onChange={(e) => setEditingAvailVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Usos Máximos Diarios
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingMaxVal}
                  onChange={(e) => setEditingMaxVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingMax(false)}
                  className="flex-1 bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg touch-btn text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg touch-btn text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};
