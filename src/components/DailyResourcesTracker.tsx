import React, { useState } from 'react';
import { SpellSlotsMap, ResourceItem } from '../domain/types';
import { getHighestSpellLevel } from '../domain/spells';
import { getLimitedTraits } from '../domain/resources';
import { ModalOverlay } from './ModalOverlay';

interface DailyResourcesTrackerProps {
  spellSlots: SpellSlotsMap;
  resources: ResourceItem[];
  onUpdateMaxSlots?: (level: number, newMax: number) => void;
  onUpdateSlotValues?: (level: number, newAvailable: number, newMax: number) => void;
  onSpendResource?: (id: string) => void;
  onRestoreResource?: (id: string) => void;
  onUpdateResourceMaxUses?: (id: string, newMax: number) => void;
  onUpdateResourceUses?: (id: string, newAvailable: number, newMax: number) => void;
}

export const DailyResourcesTracker: React.FC<DailyResourcesTrackerProps> = ({
  spellSlots,
  resources,
  onUpdateMaxSlots,
  onUpdateSlotValues,
  onUpdateResourceMaxUses,
  onUpdateResourceUses,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Slot editing state
  const [editingSlotLevel, setEditingSlotLevel] = useState<number | null>(null);
  const [editingSlotAvailVal, setEditingSlotAvailVal] = useState<number | ''>(0);
  const [editingSlotMaxVal, setEditingSlotMaxVal] = useState<number | ''>(0);

  // Trait editing state
  const [editingTraitId, setEditingTraitId] = useState<string | null>(null);
  const [editingTraitName, setEditingTraitName] = useState<string>('');
  const [editingTraitAvailVal, setEditingTraitAvailVal] = useState<number | ''>(1);
  const [editingTraitMaxVal, setEditingTraitMaxVal] = useState<number | ''>(1);

  // Derivado ESTRICTAMENTE del conjuro más alto (0 si no tiene conjuros de nivel >= 1)
  const maxActiveLevel = getHighestSpellLevel(resources);
  const activeSpellLevels: number[] = [];
  for (let lvl = 1; lvl <= maxActiveLevel; lvl++) {
    activeSpellLevels.push(lvl);
  }

  const limitedTraits = getLimitedTraits(resources);

  const handleOpenEditSlot = (lvl: number) => {
    setEditingSlotLevel(lvl);
    setEditingSlotAvailVal(spellSlots[lvl]?.available ?? 0);
    setEditingSlotMaxVal(spellSlots[lvl]?.max ?? 0);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlotLevel !== null) {
      const cleanMax = Math.max(0, Math.floor(editingSlotMaxVal === '' ? 0 : editingSlotMaxVal));
      const cleanAvail = Math.max(0, Math.min(cleanMax, Math.floor(editingSlotAvailVal === '' ? 0 : editingSlotAvailVal)));
      if (onUpdateSlotValues) {
        onUpdateSlotValues(editingSlotLevel, cleanAvail, cleanMax);
      } else if (onUpdateMaxSlots) {
        onUpdateMaxSlots(editingSlotLevel, cleanMax);
      }
      setEditingSlotLevel(null);
    }
  };

  const handleOpenEditTrait = (trait: ResourceItem) => {
    setEditingTraitId(trait.id);
    setEditingTraitName(trait.name);
    setEditingTraitAvailVal(trait.availableUses ?? trait.maxUses ?? 1);
    setEditingTraitMaxVal(trait.maxUses ?? 1);
  };

  const handleSaveTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTraitId !== null) {
      const cleanMax = Math.max(1, Math.floor(editingTraitMaxVal === '' ? 1 : editingTraitMaxVal));
      const cleanAvail = Math.max(0, Math.min(cleanMax, Math.floor(editingTraitAvailVal === '' ? 0 : editingTraitAvailVal)));
      if (onUpdateResourceUses) {
        onUpdateResourceUses(editingTraitId, cleanAvail, cleanMax);
      } else if (onUpdateResourceMaxUses) {
        onUpdateResourceMaxUses(editingTraitId, cleanMax);
      }
      setEditingTraitId(null);
    }
  };

  return (
    <section className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 shadow-md">
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
              {maxActiveLevel === 0 && limitedTraits.length === 0 && (
                <>Sin recursos diarios activos</>
              )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {activeSpellLevels.map((lvl) => {
                  const slot = spellSlots[lvl] ?? { level: lvl, max: 0, available: 0 };
                  const isOutOfSlots = slot.max > 0 && slot.available === 0;

                  return (
                    <div
                      key={`slot-dyn-lvl-${lvl}`}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/80"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-purple-300">
                          {lvl}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="text-right">
                          <span
                            className={`text-sm font-extrabold ${
                              isOutOfSlots ? 'text-rose-400' : 'text-slate-100'
                            }`}
                          >
                            {slot.available}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/{slot.max}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditSlot(lvl)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-amber-400 rounded-md text-xs transition-colors shrink-0"
                          title={`Editar espacios nivel ${lvl}`}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {limitedTraits.map((trait) => {
                  const available = trait.availableUses ?? 0;
                  const max = trait.maxUses ?? 0;
                  const isOutOfUses = available === 0;

                  return (
                    <div
                      key={`trait-daily-${trait.id}`}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/80"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span className="text-xs font-bold text-amber-200 truncate" title={trait.name}>
                          {trait.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-sm font-extrabold ${
                              isOutOfUses ? 'text-rose-400' : 'text-slate-100'
                            }`}
                          >
                            {available}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/{max}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditTrait(trait)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-amber-400 rounded-md text-xs transition-colors shrink-0"
                          title={`Editar usos de ${trait.name}`}
                          aria-label={`Editar usos de ${trait.name}`}
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
        </div>
      )}

      {/* Modal Editar Espacios de Conjuro (Disponibles y Máximos) */}
      {editingSlotLevel !== null && (
        <ModalOverlay
          onClose={() => setEditingSlotLevel(null)}
          backdropClassName="bg-black/75"
          aria-label={`Espacios de Magia Nivel ${editingSlotLevel}`}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-100 mb-2">
              Espacios de Magia Nivel {editingSlotLevel}
            </h4>
            <form onSubmit={handleSaveSlot} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Espacios Disponibles (Actuales)
                </label>
                <input
                  type="number"
                  min={0}
                  max={editingSlotMaxVal === '' ? undefined : Math.max(0, editingSlotMaxVal)}
                  value={editingSlotAvailVal}
                  onChange={(e) => setEditingSlotAvailVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Espacios Máximos
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingSlotMaxVal}
                  onChange={(e) => setEditingSlotMaxVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
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
        </ModalOverlay>
      )}

      {/* Modal Editar Usos de Rasgo (Disponibles y Máximos) */}
      {editingTraitId !== null && (
        <ModalOverlay
          onClose={() => setEditingTraitId(null)}
          backdropClassName="bg-black/75"
          aria-label="Editar Usos Diarios"
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-100 mb-1">
              Editar Usos Diarios
            </h4>
            <p className="text-xs text-amber-300 font-semibold mb-3 truncate">
              {editingTraitName}
            </p>
            <form onSubmit={handleSaveTrait} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Usos Disponibles (Actuales)
                </label>
                <input
                  type="number"
                  min={0}
                  max={editingTraitMaxVal === '' ? undefined : Math.max(1, editingTraitMaxVal)}
                  value={editingTraitAvailVal}
                  onChange={(e) => setEditingTraitAvailVal(e.target.value === '' ? '' : Number(e.target.value))}
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
                  value={editingTraitMaxVal}
                  onChange={(e) => setEditingTraitMaxVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
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
        </ModalOverlay>
      )}
    </section>
  );
};
