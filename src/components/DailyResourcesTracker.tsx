import React, { useState } from 'react';
import { SpellSlotsMap, ResourceItem } from '../domain/types';
import { getHighestSpellLevel } from '../domain/spells';
import { getLimitedTraits } from '../domain/resources';

interface DailyResourcesTrackerProps {
  spellSlots: SpellSlotsMap;
  resources: ResourceItem[];
  onUpdateMaxSlots: (level: number, newMax: number) => void;
  onSpendResource: (id: string) => void;
  onRestoreResource: (id: string) => void;
  onUpdateResourceMaxUses: (id: string, newMax: number) => void;
}

export const DailyResourcesTracker: React.FC<DailyResourcesTrackerProps> = ({
  spellSlots,
  resources,
  onUpdateMaxSlots,
  onSpendResource,
  onRestoreResource,
  onUpdateResourceMaxUses,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Slot editing state
  const [editingSlotLevel, setEditingSlotLevel] = useState<number | null>(null);
  const [editingSlotMaxVal, setEditingSlotMaxVal] = useState<number>(0);

  // Trait editing state
  const [editingTraitId, setEditingTraitId] = useState<string | null>(null);
  const [editingTraitName, setEditingTraitName] = useState<string>('');
  const [editingTraitMaxVal, setEditingTraitMaxVal] = useState<number>(1);

  // Derivado ESTRICTAMENTE del conjuro más alto (0 si no tiene conjuros de nivel >= 1)
  const maxActiveLevel = getHighestSpellLevel(resources);
  const activeSpellLevels: number[] = [];
  for (let lvl = 1; lvl <= maxActiveLevel; lvl++) {
    activeSpellLevels.push(lvl);
  }

  const limitedTraits = getLimitedTraits(resources);

  // Totales para badge de cabecera
  const totalSlotsAvail = activeSpellLevels.reduce((acc, lvl) => acc + (spellSlots[lvl]?.available ?? 0), 0);
  const totalSlotsMax = activeSpellLevels.reduce((acc, lvl) => acc + (spellSlots[lvl]?.max ?? 0), 0);
  const totalTraitsAvail = limitedTraits.reduce((acc, t) => acc + (t.availableUses ?? 0), 0);
  const totalTraitsMax = limitedTraits.reduce((acc, t) => acc + (t.maxUses ?? 0), 0);

  const handleOpenEditSlot = (lvl: number) => {
    setEditingSlotLevel(lvl);
    setEditingSlotMaxVal(spellSlots[lvl]?.max ?? 0);
  };

  const handleSaveSlotMax = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlotLevel !== null) {
      onUpdateMaxSlots(editingSlotLevel, Math.max(0, Math.floor(editingSlotMaxVal)));
      setEditingSlotLevel(null);
    }
  };

  const handleOpenEditTrait = (trait: ResourceItem) => {
    setEditingTraitId(trait.id);
    setEditingTraitName(trait.name);
    setEditingTraitMaxVal(trait.maxUses ?? 1);
  };

  const handleSaveTraitMax = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTraitId !== null) {
      onUpdateResourceMaxUses(editingTraitId, Math.max(1, Math.floor(editingTraitMaxVal)));
      setEditingTraitId(null);
    }
  };

  return (
    <section className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 shadow-md mb-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 touch-btn py-1 text-left flex-1"
        >
          <span className="text-lg">⚡</span>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              Recursos Diarios
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {maxActiveLevel > 0 && (
                <>
                  Magia: <span className="text-purple-300 font-bold">{totalSlotsAvail}/{totalSlotsMax}</span> •{' '}
                </>
              )}
              Rasgos: <span className="text-amber-300 font-bold">{totalTraitsAvail}/{totalTraitsMax}</span>
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="touch-btn text-xs text-slate-400 hover:text-amber-400 font-bold px-2 shrink-0"
          aria-label={isExpanded ? 'Plegar recursos diarios' : 'Desplegar recursos diarios'}
        >
          {isExpanded ? '▲ Plegar' : '▼ Ver todo'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-4 border-t border-slate-700/60 pt-3">
          {/* Si no hay magia ni rasgos limitados */}
          {maxActiveLevel === 0 && limitedTraits.length === 0 && (
            <div className="p-4 bg-slate-900/40 rounded-lg border border-dashed border-slate-700/70 text-center text-xs text-slate-400">
              <p className="text-base mb-1">🛡️</p>
              <p className="font-semibold text-slate-300">Sin recursos diarios activos</p>
              <p className="text-slate-500 mt-1">
                Añade conjuros o rasgos de uso limitado desde el catálogo inferior para gestionarlos aquí.
              </p>
            </div>
          )}

          {/* Subsección 1: Espacios de Magia (Solo si tiene conjuros de nivel >= 1) */}
          {maxActiveLevel > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🔮</span> Espacios de Magia (Niveles 1 a {maxActiveLevel})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSpellLevels.map((lvl) => {
                  const slot = spellSlots[lvl] ?? { level: lvl, max: 0, available: 0 };
                  const isOutOfSlots = slot.max > 0 && slot.available === 0;

                  return (
                    <div
                      key={`slot-dyn-lvl-${lvl}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-300">
                          Nivel {lvl}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`text-sm font-extrabold ${
                              isOutOfSlots ? 'text-rose-400' : 'text-slate-100'
                            }`}
                          >
                            {slot.available}
                          </span>
                          <span className="text-xs text-slate-500 font-bold"> / {slot.max} espacios</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditSlot(lvl)}
                          className="touch-btn w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 rounded-lg text-xs"
                          title={`Editar espacios máximos nivel ${lvl}`}
                          aria-label={`Editar espacios nivel ${lvl}`}
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subsección 2: Rasgos y Dotes con Usos Diarios */}
          {limitedTraits.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span>⚔️</span> Rasgos y Dotes (Usos Diarios)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {limitedTraits.map((trait) => {
                  const available = trait.availableUses ?? 0;
                  const max = trait.maxUses ?? 0;
                  const isOutOfUses = available === 0;

                  return (
                    <div
                      key={`trait-daily-${trait.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/80"
                    >
                      <div className="flex items-center gap-1 min-w-[80px] max-w-[140px]">
                        <span className="text-xs font-bold text-amber-200 truncate" title={trait.name}>
                          {trait.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditTrait(trait)}
                          className="text-[10px] text-slate-400 hover:text-amber-400 touch-btn p-1 shrink-0"
                          title={`Editar usos máximos de ${trait.name}`}
                        >
                          ✏️
                        </button>
                      </div>

                      <div className="px-1 text-center">
                        <span
                          className={`text-sm font-extrabold ${
                            isOutOfUses ? 'text-rose-400' : 'text-slate-100'
                          }`}
                        >
                          {available}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/{max}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={available === 0}
                          onClick={() => onSpendResource(trait.id)}
                          className="touch-btn w-10 h-10 bg-amber-950/90 hover:bg-amber-900 border border-amber-800 text-amber-200 font-black text-xs rounded-md disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                          title={`Gastar uso de ${trait.name}`}
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          disabled={available >= max}
                          onClick={() => onRestoreResource(trait.id)}
                          className="touch-btn w-10 h-10 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 font-black text-xs rounded-md disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                          title={`Recuperar uso de ${trait.name}`}
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
        </div>
      )}

      {/* Modal Editar Máximo de Espacios */}
      {editingSlotLevel !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-2">
              Espacios Máximos Nivel {editingSlotLevel}
            </h4>
            <form onSubmit={handleSaveSlotMax}>
              <input
                type="number"
                min={0}
                value={editingSlotMaxVal}
                onChange={(e) => setEditingSlotMaxVal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch mb-3 focus:outline-none focus:border-purple-400"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlotLevel(null)}
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

      {/* Modal Editar Máximo de Usos de Rasgo */}
      {editingTraitId !== null && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 mb-1">
              Usos Máximos Diarios
            </h4>
            <p className="text-xs text-amber-300 font-semibold mb-3 truncate">
              {editingTraitName}
            </p>
            <form onSubmit={handleSaveTraitMax}>
              <input
                type="number"
                min={1}
                value={editingTraitMaxVal}
                onChange={(e) => setEditingTraitMaxVal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch mb-3 focus:outline-none focus:border-amber-400"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTraitId(null)}
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
    </section>
  );
};
