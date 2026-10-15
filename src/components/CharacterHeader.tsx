import React, { useRef, useState } from 'react';
import { CharacterProfile } from '../domain/types';
import { processAvatarImage } from '../storage/avatar-storage';

interface CharacterHeaderProps {
  profile: CharacterProfile;
  onUpdateProfile: (updated: Partial<CharacterProfile>) => void;
}

export const CharacterHeader: React.FC<CharacterHeaderProps> = ({ profile, onUpdateProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<number | ''>(profile.level);
  const [characterClass, setCharacterClass] = useState(profile.characterClass);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setAvatarError(null);
      const dataUrl = await processAvatarImage(file);
      onUpdateProfile({ avatarDataUrl: dataUrl, updatedAt: new Date().toISOString() });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Error al procesar avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanClass = characterClass.trim();
    if (!cleanName || !cleanClass) return;

    const cleanLevel = Math.min(20, Math.max(1, Math.floor(level === '' ? 1 : level)));

    onUpdateProfile({
      name: cleanName.slice(0, 60),
      level: cleanLevel,
      characterClass: cleanClass.slice(0, 60),
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  return (
    <section className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 shadow-md mb-3">
      <div className="flex items-center gap-3">
        {/* Avatar button */}
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 border-2 border-amber-500/80 flex items-center justify-center touch-btn relative focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Cambiar avatar"
            aria-label="Cambiar foto de avatar"
          >
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-amber-300">
                ...
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h2 className="text-lg font-bold text-slate-100 truncate">{profile.name}</h2>
            <button
              type="button"
              onClick={() => {
                setName(profile.name);
                setLevel(profile.level);
                setCharacterClass(profile.characterClass);
                setIsEditing(true);
              }}
              className="text-slate-400 hover:text-amber-400 p-2 touch-btn text-xs font-semibold shrink-0"
              title="Editar datos básicos"
              aria-label="Editar perfil"
            >
              ✏️ Editar
            </button>
          </div>
          <p className="text-xs text-amber-400/90 font-medium truncate">
            {profile.characterClass} • Nivel {profile.level}
          </p>
        </div>
      </div>

      {avatarError && (
        <p className="text-rose-400 text-xs mt-2 text-center">{avatarError}</p>
      )}

      {/* Modal / Overlay de Edición */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-sm p-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-3 border-b border-slate-700 pb-2">
              Editar Datos del Personaje
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del personaje
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 min-h-touch"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Clase
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={characterClass}
                    onChange={(e) => setCharacterClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 min-h-touch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nivel (1-20)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={level}
                    onChange={(e) => setLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 min-h-touch text-center"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-lg touch-btn text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 rounded-lg touch-btn text-sm"
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
