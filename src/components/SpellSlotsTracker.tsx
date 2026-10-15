import React, { useState } from 'react';
import { SpellSlotsMap } from '../domain/types';

interface SpellSlotsTrackerProps {
  spellSlots: SpellSlotsMap;
  onSpendSlot: (level: number) => void;
  onRestoreSlot: (level: number) => void;
  onUpdateMaxSlots: (level: number, newMax: number) => void;
}

export const SpellSlotsTracker: React.FC<SpellSlotsTrackerProps> = ({
  spellSlots,
  onSpendSlot,
  onRestoreSlot,
  onUpdateMaxSlots,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editingMaxVal, setEditingMaxVal] = useState<number | ''>(0);

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Total available and max slots across all levels
  const totalAvailable = levels.reduce((sum, lvl) => sum + (spellSlots[lvl]?.available ?? 0), 0);
  const totalMax = levels.reduce((sum, lvl) => sum + (spellSlots[lvl]?.max ?? 0), 0);

  const handleOpenEdit = (lvl: number) => {
    setEditingLevel(lvl);
    setEditingMaxVal(spellSlots[lvl]?.max ?? 0);
  };

  const handleSaveMax = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLevel !== null) {
      const cleanMax = Math.max(0, Math.floor(editingMaxVal === '' ? 0 : editingMaxVal));
      onUpdateMaxSlots(editingLevel, cleanMax);
      setEditingLevel(null);
    }
  };

  return (
    <section className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 shadow-md mb-3">
      {/* Header with expand/collapse */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 touch-btn py-1 text-left flex-1"
        >
          <span className="text-base">🔮</span>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
              Espacios de Conjuros (1-9)
            </h3>
            <p className="text-[11px] text-purple-300 font-semibold">
              Disponibles: {totalAvailable} / {totalMax}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="touch-btn text-xs text-slate-400 hover:text-amber-400 font-bold px-2"
          aria-label={isExpanded ? 'Plegar panel de espacios' : 'Desplegar panel de espacios'}
        >
          {isExpanded ? '▲ Plegar' : '▼ Ver niveles'}
        </button>
      </div>

      {/* Grid of spell levels */}
      {isExpanded && (
        <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {levels.map((lvl) => {
              const slot = spellSlots[lvl] ?? { level: lvl, max: 0, available: 0 };
              const isConfigured = slot.max > 0;
              const isOutOfSlots = isConfigured && slot.available === 0;

              return (
                <div
                  key={`slot-lvl-${lvl}`}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                    isConfigured
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  {/* Level title and max editor button */}
                  <div className="flex items-center gap-1.5 min-w-[72px]">
                    <span className="text-xs font-black text-purple-300">
                      Niv {lvl}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lvl)}
                      className="text-[10px] text-slate-400 hover:text-amber-400 touch-btn p-1"
                      title={`Configurar espacios máximos para nivel ${lvl}`}
                    >
                      ✏️
                    </button>
                  </div>

                  {/* Available / Max Counter */}
                  <div className="px-1 text-center">
                    <span
                      className={`text-sm font-extrabold ${
                        isOutOfSlots ? 'text-rose-400' : isConfigured ? 'text-slate-100' : 'text-slate-500'
                      }`}
                    >
                      {slot.available}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">/{slot.max}</span>
                  </div>

                  {/* Quick -1 and +1 actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={slot.available === 0}
                      onClick={() => onSpendSlot(lvl)}
                      className="touch-btn w-10 h-10 bg-purple-950/90 hover:bg-purple-900 border border-purple-800 text-purple-200 font-black text-xs rounded-md disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                      title={`Gastar 1 espacio de nivel ${lvl}`}
                    >
                      -1
                    </button>

                    <button
                      type="button"
                      disabled={slot.available >= slot.max}
                      onClick={() => onRestoreSlot(lvl)}
                      className="touch-btn w-10 h-10 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 font-black text-xs rounded-md disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                      title={`Recuperar 1 espacio de nivel ${lvl}`}
                    >
                      +1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for editing max slots of a level */}
      {editingLevel !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-2">
              Espacios Máximos Nivel {editingLevel}
            </h4>
            <form onSubmit={handleSaveMax}>
              <input
                type="number"
                min={0}
                value={editingMaxVal}
                onChange={(e) => setEditingMaxVal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch mb-3 focus:outline-none focus:border-purple-400"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="flex-1 bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg touch-btn text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg touch-btn text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
