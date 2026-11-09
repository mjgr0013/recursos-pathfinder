import React, { useState, useMemo } from 'react';
import { ResourceItem, ResourceCategory, UsageMode, SpellSlotsMap } from '../domain/types';
import { ResourceCard } from './ResourceCard';
import { createResource, sortResources } from '../domain/resources';
import { MarkdownEditor } from './MarkdownEditor';
import { CharacterVariables, resolveRange } from '../domain/variables';
import { ModalOverlay } from './ModalOverlay';

interface ResourceListProps {
  resources: ResourceItem[];
  spellSlots: SpellSlotsMap;
  characterLevel?: number;
  characterVariables?: CharacterVariables;
  initialSearchQuery?: string;
  initialTab?: FilterTab;
  onSpendResource: (id: string) => void;
  onRestoreResource: (id: string) => void;
  onDeleteResource: (id: string) => void;
  onAddResource: (newResource: ResourceItem) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onUpdateResourceDetails?: (id: string, details: { url?: string; description: string; range?: string }) => void;
}

type FilterTab = 'all' | 'spell' | 'feat_trait';

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  spellSlots,
  characterLevel = 1,
  characterVariables,
  initialSearchQuery = '',
  initialTab = 'all',
  onSpendResource,
  onRestoreResource,
  onDeleteResource,
  onAddResource,
  onSpendSpellSlot,
  onRestoreSpellSlot,
  onUpdateResourceDetails,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variables: CharacterVariables = characterVariables ?? {
    nivel_personaje: characterLevel,
    nivel: characterLevel,
    level: characterLevel,
  };

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('spell');
  const [usageMode, setUsageMode] = useState<UsageMode>('limited');
  const [spellLevel, setSpellLevel] = useState<number>(1);
  const [range, setRange] = useState('');
  const [url, setUrl] = useState('');
  const [maxUses, setMaxUses] = useState<number | ''>(3);
  const [description, setDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [collapsedLevels, setCollapsedLevels] = useState<Record<number, boolean>>({});

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const sortedResources = useMemo(() => sortResources(resources), [resources]);

  const filteredResources = useMemo(() => {
    let list = activeTab === 'all' ? sortedResources : sortedResources.filter((res) => res.category === activeTab);

    if (searchQuery.trim()) {
      const q = normalizeText(searchQuery.trim());
      list = list.filter((res) => {
        const nameMatches = normalizeText(res.name).includes(q);
        const descMatches = normalizeText(res.description || '').includes(q);
        return nameMatches || descMatches;
      });
    }

    return list;
  }, [sortedResources, activeTab, searchQuery]);

  const spells = useMemo(
    () => filteredResources.filter((r) => r.category === 'spell'),
    [filteredResources]
  );
  const feats = useMemo(
    () => filteredResources.filter((r) => r.category === 'feat_trait'),
    [filteredResources]
  );

  const spellGroups = useMemo(() => {
    const groupsMap = new Map<number, ResourceItem[]>();

    for (const spell of spells) {
      const lvl = typeof spell.spellLevel === 'number' ? spell.spellLevel : 0;
      if (!groupsMap.has(lvl)) {
        groupsMap.set(lvl, []);
      }
      groupsMap.get(lvl)!.push(spell);
    }

    const sortedLevels = Array.from(groupsMap.keys()).sort((a, b) => a - b);

    return sortedLevels.map((lvl) => ({
      level: lvl,
      label: lvl === 0 ? 'Trucos (Nivel 0)' : `Nivel ${lvl}`,
      spells: groupsMap.get(lvl)!,
    }));
  }, [spells]);

  const toggleLevelCollapse = (level: number) => {
    setCollapsedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const allLevelsCollapsed = spellGroups.length > 0 && spellGroups.every((g) => Boolean(collapsedLevels[g.level]));

  const handleToggleAllLevels = () => {
    const nextCollapsed = !allLevelsCollapsed;
    const updated: Record<number, boolean> = {};
    for (const g of spellGroups) {
      updated[g.level] = nextCollapsed;
    }
    setCollapsedLevels(updated);
  };

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
        range: range.trim() || undefined,
        url: url.trim() || undefined,
        maxUses: usageMode === 'limited' ? (maxUses === '' ? 1 : Math.max(1, Math.floor(maxUses))) : null,
        description: description.trim(),
      },
      resources.length
    );

    onAddResource(newRes);
    setName('');
    setDescription('');
    setRange('');
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

      {/* Buscador de Recursos */}
      <div className="relative mb-3">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs sm:text-sm">
          🔍
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'spell'
              ? 'Buscar conjuro por nombre o descripción...'
              : activeTab === 'feat_trait'
              ? 'Buscar rasgo por nombre o descripción...'
              : 'Buscar conjuro o rasgo por nombre o descripción...'
          }
          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-sm"
          aria-label="Buscar conjuros o rasgos"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 text-xs font-bold"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resource Cards Collection */}
      <div className="flex flex-col gap-3 flex-1 w-full">
        {filteredResources.length === 0 ? (
          searchQuery.trim() ? (
            <div className="w-full text-center py-10 px-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm">
              <p className="text-2xl mb-1">🔍</p>
              <p className="font-semibold text-slate-300">
                No se encontraron resultados para &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Prueba con otro término o limpia el buscador.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg touch-btn"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="w-full text-center py-10 px-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm">
              <p className="text-2xl mb-1">📜</p>
              <p className="font-semibold text-slate-300">No hay elementos registrados</p>
              <p className="text-xs text-slate-500 mt-1">
                Pulsa el botón &quot;+ Añadir&quot; para registrar un conjuro o dote/rasgo.
              </p>
            </div>
          )
        ) : activeTab === 'spell' ? (
          <div className="space-y-3">
            {spellGroups.length > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold">Niveles de conjuro ({spellGroups.length})</span>
                <button
                  type="button"
                  onClick={handleToggleAllLevels}
                  className="text-amber-400 hover:text-amber-300 font-semibold touch-btn py-0.5 px-1"
                >
                  {allLevelsCollapsed ? '▲ Desplegar todos' : '▼ Plegar todos'}
                </button>
              </div>
            )}

            {spellGroups.map((group) => {
              const isCollapsed = Boolean(collapsedLevels[group.level]);

              return (
                <div key={`spell-group-lvl-${group.level}`} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleLevelCollapse(group.level)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors"
                    aria-expanded={!isCollapsed}
                    aria-label={`${group.label} (${group.spells.length}), ${isCollapsed ? 'desplegar' : 'plegar'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔮</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded-full">
                        {group.spells.length}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-bold">
                      {isCollapsed ? '▼ Desplegar' : '▲ Plegar'}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="flex flex-col gap-2.5 pl-1 sm:pl-2">
                      {group.spells.map((spell) => (
                        <ResourceCard
                          key={spell.id}
                          resource={spell}
                          spellSlots={spellSlots}
                          characterLevel={characterLevel}
                          characterVariables={variables}
                          onSpend={onSpendResource}
                          onRestore={onRestoreResource}
                          onDelete={onDeleteResource}
                          onSpendSpellSlot={onSpendSpellSlot}
                          onRestoreSpellSlot={onRestoreSpellSlot}
                          onUpdateResourceDetails={onUpdateResourceDetails}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : activeTab === 'feat_trait' ? (
          <div className="flex flex-col gap-2.5">
            {feats.map((feat) => (
              <ResourceCard
                key={feat.id}
                resource={feat}
                spellSlots={spellSlots}
                characterLevel={characterLevel}
                characterVariables={variables}
                onSpend={onSpendResource}
                onRestore={onRestoreResource}
                onDelete={onDeleteResource}
                onSpendSpellSlot={onSpendSpellSlot}
                onRestoreSpellSlot={onRestoreSpellSlot}
                onUpdateResourceDetails={onUpdateResourceDetails}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {spells.length > 0 && (
              <div className="space-y-3">
                {spellGroups.length > 1 && (
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-semibold">Conjuros ({spells.length})</span>
                    <button
                      type="button"
                      onClick={handleToggleAllLevels}
                      className="text-amber-400 hover:text-amber-300 font-semibold touch-btn py-0.5 px-1"
                    >
                      {allLevelsCollapsed ? '▲ Desplegar todos' : '▼ Plegar todos'}
                    </button>
                  </div>
                )}

                {spellGroups.map((group) => {
                  const isCollapsed = Boolean(collapsedLevels[group.level]);

                  return (
                    <div key={`spell-group-lvl-${group.level}`} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleLevelCollapse(group.level)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors"
                        aria-expanded={!isCollapsed}
                        aria-label={`${group.label} (${group.spells.length}), ${isCollapsed ? 'desplegar' : 'plegar'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🔮</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                            {group.label}
                          </span>
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded-full">
                            {group.spells.length}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400 font-bold">
                          {isCollapsed ? '▼ Desplegar' : '▲ Plegar'}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="flex flex-col gap-2.5 pl-1 sm:pl-2">
                          {group.spells.map((spell) => (
                            <ResourceCard
                              key={spell.id}
                              resource={spell}
                              spellSlots={spellSlots}
                              characterLevel={characterLevel}
                              characterVariables={variables}
                              onSpend={onSpendResource}
                              onRestore={onRestoreResource}
                              onDelete={onDeleteResource}
                              onSpendSpellSlot={onSpendSpellSlot}
                              onRestoreSpellSlot={onRestoreSpellSlot}
                              onUpdateResourceDetails={onUpdateResourceDetails}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {feats.length > 0 && (
              <div className="space-y-2">
                {spells.length > 0 && (
                  <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <span>⚔️</span>
                    <span>Rasgos y Dotes ({feats.length})</span>
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  {feats.map((feat) => (
                    <ResourceCard
                      key={feat.id}
                      resource={feat}
                      spellSlots={spellSlots}
                      characterLevel={characterLevel}
                      characterVariables={variables}
                      onSpend={onSpendResource}
                      onRestore={onRestoreResource}
                      onDelete={onDeleteResource}
                      onSpendSpellSlot={onSpendSpellSlot}
                      onRestoreSpellSlot={onRestoreSpellSlot}
                      onUpdateResourceDetails={onUpdateResourceDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Añadir Recurso */}
      {isModalOpen && (
        <ModalOverlay
          onClose={() => setIsModalOpen(false)}
          backdropClassName="bg-black/75"
          aria-label="Nuevo Conjuro o Rasgo"
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md md:max-w-xl lg:max-w-2xl p-4 md:p-5 shadow-xl max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
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
                    onChange={(e) => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))}
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
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Alcance (opcional)
                  </label>
                  <div className="flex items-center gap-1 text-[10px] flex-wrap">
                    <button
                      type="button"
                      onClick={() => setRange('Toque')}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/80 active:scale-95"
                    >
                      Toque
                    </button>
                    <button
                      type="button"
                      onClick={() => setRange('Personal')}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/80 active:scale-95"
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setRange('corto (25 pies + 5 pies/2 nivel personaje)')}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700/80 active:scale-95"
                      title="25 pies + 5 pies cada 2 niveles"
                    >
                      Corto
                    </button>
                    <button
                      type="button"
                      onClick={() => setRange('medio (100 pies + 10 pies/nivel personaje)')}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700/80 active:scale-95"
                      title="100 pies + 10 pies por nivel"
                    >
                      Medio
                    </button>
                    <button
                      type="button"
                      onClick={() => setRange('largo (400 pies + 40 pies/nivel personaje)')}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700/80 active:scale-95"
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
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 min-h-touch focus:outline-none focus:border-cyan-400"
                />
                {range.trim() && (
                  <p className="text-[11px] text-cyan-400 mt-1 font-medium flex items-center gap-1">
                    <span>🎯 Calculado con nivel actual ({characterLevel}):</span>
                    <strong>{resolveRange(range, variables)}</strong>
                  </p>
                )}
              </div>

              <div>
                <MarkdownEditor
                  id="create-resource-description"
                  label="Descripción o reglas (alcance, tirada, daño...)"
                  placeholder="Detalles de las reglas (soporta Markdown y variables)..."
                  value={description}
                  onChange={setDescription}
                  rows={4}
                  maxLength={4000}
                  variables={variables}
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
        </ModalOverlay>
      )}
    </section>
  );
};
