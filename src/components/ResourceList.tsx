import React, { useState } from 'react';
import { ResourceItem, ResourceCategory, UsageMode, SpellSlotsMap } from '../domain/types';
import { ResourceCard } from './ResourceCard';
import { createResource } from '../domain/resources';

interface ResourceListProps {
  resources: ResourceItem[];
  spellSlots: SpellSlotsMap;
  onSpendResource: (id: string) => void;
  onRestoreResource: (id: string) => void;
  onDeleteResource: (id: string) => void;
  onAddResource: (newResource: ResourceItem) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onUpdateResourceMaxUses?: (id: string, newMax: number) => void;
  onUpdateResourceUses?: (id: string, newAvailable: number, newMax: number) => void;
}

type FilterTab = 'all' | 'spell' | 'feat_trait';

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  spellSlots,
  onSpendResource,
  onRestoreResource,
  onDeleteResource,
  onAddResource,
  onSpendSpellSlot,
  onRestoreSpellSlot,
  onUpdateResourceMaxUses,
  onUpdateResourceUses,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('spell');
  const [usageMode, setUsageMode] = useState<UsageMode>('limited');
  const [spellLevel, setSpellLevel] = useState<number>(1);
  const [url, setUrl] = useState('');
  const [maxUses, setMaxUses] = useState(3);
  const [description, setDescription] = useState('');

  const filteredResources = resources.filter((res) => {
    if (activeTab === 'all') return true;
    return res.category === activeTab;
  });

  const spellsCount = resources.filter((r) => r.category === 'spell').length;
  const featsCount = resources.filter((r) => r.category === 'feat_trait').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRes = createResource(
      {
        name: name.trim(),
        category,
        usageMode,
        spellLevel: category === 'spell' ? spellLevel : null,
        url: url.trim() || undefined,
        maxUses: usageMode === 'limited' ? maxUses : null,
        description: description.trim(),
      },
      resources.length
    );

    onAddResource(newRes);
    setName('');
    setDescription('');
    setUrl('');
    setMaxUses(3);
    setSpellLevel(1);
    setIsModalOpen(false);
  };

  return (
    <section className="w-full mt-1 mb-4 flex-1 flex flex-col">
      {/* Category Tabs and Add Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 gap-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 touch-btn text-xs font-bold rounded-lg py-2 transition-all ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({resources.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spell')}
            className={`flex-1 touch-btn text-xs font-bold rounded-lg py-2 transition-all ${
              activeTab === 'spell'
                ? 'bg-purple-600 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conjuros ({spellsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feat_trait')}
            className={`flex-1 touch-btn text-xs font-bold rounded-lg py-2 transition-all ${
              activeTab === 'feat_trait'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rasgos ({featsCount})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'spell') {
              setCategory('spell');
              setSpellLevel(1);
            } else if (activeTab === 'feat_trait') {
              setCategory('feat_trait');
            }
            setIsModalOpen(true);
          }}
          className="touch-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-3 rounded-xl shadow-md shrink-0 flex items-center gap-1 active:scale-95"
          title="Añadir nuevo conjuro o rasgo"
        >
          <span>➕</span>
          <span>Añadir</span>
        </button>
      </div>

      {/* Resource Cards Collection */}
      <div className="space-y-2.5 flex-1">
        {filteredResources.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm">
            <p className="text-2xl mb-1">📜</p>
            <p className="font-semibold text-slate-300">No hay elementos registrados</p>
            <p className="text-xs text-slate-500 mt-1">
              Pulsa el botón &quot;+ Añadir&quot; para registrar un conjuro o dote/rasgo.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              spellSlots={spellSlots}
              onSpend={onSpendResource}
              onRestore={onRestoreResource}
              onDelete={onDeleteResource}
              onSpendSpellSlot={onSpendSpellSlot}
              onRestoreSpellSlot={onRestoreSpellSlot}
              onUpdateResourceMaxUses={onUpdateResourceMaxUses}
              onUpdateResourceUses={onUpdateResourceUses}
            />
          ))
        )}
      </div>

      {/* Modal Añadir Recurso */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-sm p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100 mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
              <span>✨</span> Nuevo Conjuro o Rasgo
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del efecto / habilidad *
                </label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Ej. Curar Heridas Leves, Canalizar Energía..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                  >
                    <option value="spell">Conjuro</option>
                    <option value="feat_trait">Rasgo / Dote</option>
                  </select>
                </div>

                {category === 'spell' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nivel de Conjuro
                    </label>
                    <select
                      value={spellLevel}
                      onChange={(e) => setSpellLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 min-h-touch focus:outline-none focus:border-purple-400"
                    >
                      <option value={0}>0 (Truco a voluntad)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                        <option key={`lvl-${lvl}`} value={lvl}>
                          Nivel {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Modo de uso
                    </label>
                    <select
                      value={usageMode}
                      onChange={(e) => setUsageMode(e.target.value as UsageMode)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                    >
                      <option value="limited">Limitado (usos/día)</option>
                      <option value="unlimited">Ilimitado (pasivo)</option>
                    </select>
                  </div>
                )}
              </div>

              {category === 'feat_trait' && usageMode === 'limited' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usos máximos diarios
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-center text-slate-100 min-h-touch focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Documentación Oficial (opcional)
                </label>
                <input
                  type="url"
                  maxLength={500}
                  placeholder="https://aonprd.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 min-h-touch focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción o reglas (alcance, tirada, daño...)
                </label>
                <textarea
                  rows={3}
                  maxLength={4000}
                  placeholder="Detalles de las reglas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-lg touch-btn text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg touch-btn text-sm"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
