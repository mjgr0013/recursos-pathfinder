import React, { useState } from 'react';
import { ResourceItem, SpellSlotsMap } from '../domain/types';
import { getResourceUsage } from '../domain/resources';
import { CharacterVariables, resolveRange } from '../domain/variables';
import { extractShort } from '../domain/markdown';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResourceCard } from './ResourceCard';
import { ModalOverlay } from './ModalOverlay';

interface ResourceTableProps {
  spells: ResourceItem[];
  feats: ResourceItem[];
  spellSlots: SpellSlotsMap;
  characterLevel: number;
  characterVariables: CharacterVariables;
  onSpendResource: (id: string) => void;
  onRestoreResource: (id: string) => void;
  onDeleteResource: (id: string) => void;
  onSpendSpellSlot: (level: number) => void;
  onRestoreSpellSlot: (level: number) => void;
  onUpdateResourceDetails?: (id: string, details: { url?: string; description: string; range?: string }) => void;
  /** Solo para tests: abre directamente el popup de detalle de este recurso. */
  initialDetailId?: string | null;
}

/**
 * Vista compacta del Modo recursos: una fila por conjuro/rasgo con la información mínima
 * (nombre, nivel/tipo, alcance, usos y acción). "Ver más" abre la card completa en un popup.
 * Solo pantalla: en papel se imprimen las cards de la vista estándar.
 */
export const ResourceTable: React.FC<ResourceTableProps> = ({
  spells,
  feats,
  spellSlots,
  characterLevel,
  characterVariables,
  onSpendResource,
  onRestoreResource,
  onDeleteResource,
  onSpendSpellSlot,
  onRestoreSpellSlot,
  onUpdateResourceDetails,
  initialDetailId = null,
}) => {
  const [detailId, setDetailId] = useState<string | null>(initialDetailId);

  // Se busca por id en cada render para que el popup refleje los usos/espacios actualizados
  // y se cierre solo si el recurso se elimina desde dentro.
  const detailResource = detailId ? [...spells, ...feats].find((r) => r.id === detailId) ?? null : null;

  const handleDelete = (id: string) => {
    onDeleteResource(id);
    setDetailId(null);
  };

  const renderSection = (title: string, icon: string, items: ResourceItem[], typeHeader: string) => {
    if (items.length === 0) return null;

    // La columna "Corto" solo aparece si algún recurso de la sección tiene una sección "## Corto".
    const shortTexts = new Map(items.map((r) => [r.id, extractShort(r.description ?? '')]));
    const hasShortColumn = [...shortTexts.values()].some(Boolean);

    return (
      <section aria-label={title} className="w-full">
        <h3 className="flex items-center gap-2 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <span aria-hidden="true">{icon}</span>
          <span>{`${title} (${items.length})`}</span>
        </h3>

        <div className="w-full overflow-x-auto bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-xl shadow-sm">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-3 py-2 font-bold">Nombre</th>
                {hasShortColumn && (
                  <th scope="col" className="px-2 py-2 font-bold">Corto</th>
                )}
                <th scope="col" className="px-2 py-2 font-bold whitespace-nowrap">{typeHeader}</th>
                <th scope="col" className="px-2 py-2 font-bold">Alcance</th>
                <th scope="col" className="px-2 py-2 font-bold text-center">Usos</th>
                <th scope="col" className="px-2 py-2 font-bold text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {items.map((resource) => {
                const usage = getResourceUsage(resource, spellSlots);
                const hasCounter = usage.kind !== 'unlimited';
                const isSpellSlot = usage.kind === 'spell_slot';
                const range = resource.range ? resolveRange(resource.range, characterVariables) : '';

                return (
                  <tr
                    key={resource.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    data-resource-row={resource.id}
                  >
                    <td className="px-3 py-1 font-bold text-sm text-slate-900 dark:text-slate-100">{resource.name}</td>
                    {hasShortColumn && (
                      <td className="px-2 py-1 text-slate-700 dark:text-slate-300 resource-short">
                        {shortTexts.get(resource.id) ? (
                          <MarkdownRenderer content={shortTexts.get(resource.id)!} variables={characterVariables} />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-2 py-1 whitespace-nowrap text-slate-600 dark:text-slate-300">{usage.label}</td>
                    <td className="px-2 py-1 text-cyan-800 dark:text-cyan-300">{range || <span className="text-slate-400">—</span>}</td>
                    <td className="px-2 py-1 text-center whitespace-nowrap">
                      {hasCounter ? (
                        <span className={`font-black ${usage.isOutOfUses ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {usage.available}
                          <span className="text-slate-400 dark:text-slate-500 font-bold">/{usage.max}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold" title="Uso ilimitado">∞</span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasCounter && (
                          <button
                            type="button"
                            disabled={usage.isOutOfUses}
                            onClick={() =>
                              isSpellSlot ? onSpendSpellSlot(resource.spellLevel!) : onSpendResource(resource.id)
                            }
                            className={`touch-btn px-2.5 font-bold text-xs rounded-lg shadow-sm disabled:opacity-40 disabled:pointer-events-none ${
                              isSpellSlot
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                            aria-label={`${isSpellSlot ? 'Lanzar' : 'Usar'} ${resource.name}`}
                          >
                            {isSpellSlot ? '✨ Lanzar' : '⚡ Usar'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailId(resource.id)}
                          className="touch-btn px-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-400 whitespace-nowrap"
                          aria-label={`Ver más sobre ${resource.name}`}
                        >
                          Ver más
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderSection('Conjuros', '🔮', spells, 'Nivel')}
      {renderSection('Rasgos y Dotes', '⚔️', feats, 'Tipo')}

      {detailResource && (
        <ModalOverlay onClose={() => setDetailId(null)} aria-label={`Detalle de ${detailResource.name}`}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={detailResource.name}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto cursor-default flex flex-col gap-2"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="touch-btn text-sm font-bold rounded-full bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow"
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>
            <ResourceCard
              key={detailResource.id}
              resource={detailResource}
              spellSlots={spellSlots}
              characterLevel={characterLevel}
              characterVariables={characterVariables}
              onSpend={onSpendResource}
              onRestore={onRestoreResource}
              onDelete={handleDelete}
              onSpendSpellSlot={onSpendSpellSlot}
              onRestoreSpellSlot={onRestoreSpellSlot}
              onUpdateResourceDetails={onUpdateResourceDetails}
              defaultExpanded
            />
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
