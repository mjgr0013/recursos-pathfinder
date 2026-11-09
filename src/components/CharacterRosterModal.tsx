import React, { useState } from 'react';
import { CharacterRosterState, MAX_CHARACTERS } from '../domain/roster';
import { ModalOverlay } from './ModalOverlay';

interface CharacterRosterModalProps {
  isOpen: boolean;
  roster: CharacterRosterState;
  onSelectCharacter: (id: string) => void;
  onCreateCharacter: () => void;
  onCreateRandomCharacter: () => void;
  onDeleteCharacter: (id: string) => void;
  onClose: () => void;
}

export const CharacterRosterModal: React.FC<CharacterRosterModalProps> = ({
  isOpen,
  roster,
  onSelectCharacter,
  onCreateCharacter,
  onCreateRandomCharacter,
  onDeleteCharacter,
  onClose,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const count = roster.characters.length;
  const isFull = count >= MAX_CHARACTERS;

  return (
    <ModalOverlay onClose={onClose} backdropClassName="bg-black/80" aria-label="Personajes Guardados">
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md md:max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎭</span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Personajes Guardados
              </h3>
              <p className="text-xs text-slate-400">
                {count} de {MAX_CHARACTERS} ranuras ocupadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 5-slot dots indicator */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-lg">
              {[0, 1, 2, 3, 4].map((slotIdx) => (
                <div
                  key={slotIdx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    slotIdx < count ? 'bg-amber-400 shadow-sm' : 'bg-slate-700'
                  }`}
                  title={slotIdx < count ? `Ranura ${slotIdx + 1} ocupada` : `Ranura ${slotIdx + 1} libre`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg touch-btn text-sm font-bold"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Character List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {roster.characters.map((character) => {
            const isActive = character.profile.id === roster.activeId;
            const isConfirmingDelete = confirmDeleteId === character.profile.id;

            const spellsCount = character.resources.filter((r) => r.category === 'spell').length;
            const featsCount = character.resources.filter((r) => r.category === 'feat_trait').length;

            return (
              <div
                key={character.profile.id}
                className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                  isActive
                    ? 'bg-slate-800/90 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar & Basic Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {character.profile.avatarDataUrl ? (
                      <img
                        src={character.profile.avatarDataUrl}
                        alt={character.profile.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0 bg-slate-800"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 text-slate-400 font-bold shadow-sm">
                        {character.profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-100 truncate">
                          {character.profile.name}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                            ⭐ Activo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-amber-400/90 font-medium truncate">
                        {character.profile.characterClass} • Nivel {character.profile.level}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span className="text-emerald-400 font-semibold">
                          ❤️ {character.health.currentHp}/{character.health.maxHp} PG
                          {character.health.tempHp > 0 && ` (+${character.health.tempHp} temp)`}
                        </span>
                        <span>•</span>
                        <span>🔮 {spellsCount}</span>
                        <span>•</span>
                        <span>⚔️ {featsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCharacter(character.profile.id);
                          onClose();
                        }}
                        className="touch-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                        title={`Cargar a ${character.profile.name}`}
                      >
                        <span>📥</span>
                        <span>Cargar</span>
                      </button>
                    )}

                    {/* Delete button with confirmation */}
                    {!isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(character.profile.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg touch-btn text-xs active:scale-95 transition-colors"
                        title="Borrar este personaje"
                      >
                        🗑️
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Inline Confirmation when deleting */}
                {isConfirmingDelete && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-800/80 rounded-lg text-center space-y-1.5">
                    <p className="text-xs font-semibold text-rose-200">
                      ¿Borrar a <strong className="text-white">{character.profile.name}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 touch-btn rounded text-xs py-1.5 font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCharacter(character.profile.id);
                          setConfirmDeleteId(null);
                        }}
                        className="flex-1 bg-rose-700 hover:bg-rose-600 text-white touch-btn rounded text-xs py-1.5 font-bold shadow-md"
                      >
                        Sí, borrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-slate-700/80 bg-slate-900/60 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isFull}
              onClick={() => {
                onCreateCharacter();
                onClose();
              }}
              className="touch-btn bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none text-slate-100 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title={isFull ? 'Límite de 5 personajes alcanzado' : 'Crear nueva ficha en blanco'}
            >
              <span>➕</span>
              <span>Crear Personaje Nuevo</span>
            </button>

            <button
              type="button"
              disabled={isFull}
              onClick={() => {
                onCreateRandomCharacter();
                onClose();
              }}
              className="touch-btn bg-purple-950/80 hover:bg-purple-900 disabled:opacity-40 disabled:pointer-events-none border border-purple-700/80 text-purple-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title={isFull ? 'Límite de 5 personajes alcanzado' : 'Generar personaje aleatorio en una nueva ranura'}
            >
              <span>🎲</span>
              <span>Nuevo Aleatorio</span>
            </button>
          </div>

          {isFull && (
            <p className="text-[11px] text-amber-400/90 text-center font-medium">
              ⚠️ Has alcanzado el límite máximo de 5 personajes. Borra uno si deseas crear o generar otro.
            </p>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
