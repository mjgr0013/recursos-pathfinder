import React, { useRef, useState } from 'react';
import { CharacterState } from '../domain/types';
import { createDefaultSpellSlots } from '../domain/spells';
import {
  createBackupPayload,
  validateBackupPayload,
  serializeBackupJson,
} from '../domain/backup';

interface BackupModalProps {
  isOpen: boolean;
  characterState: CharacterState;
  onImportCharacter: (importedState: CharacterState) => void;
  onResetCharacter: () => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  characterState,
  onImportCharacter,
  onResetCharacter,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const payload = createBackupPayload(characterState);
      const jsonString = serializeBackupJson(payload);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const safeName = characterState.profile.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'personaje';
      const timestamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg('Ficha exportada y descargada correctamente.');
      setErrorMsg(null);
    } catch {
      setErrorMsg('Error al exportar la ficha.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo seleccionado.');
    };
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        const result = validateBackupPayload(parsed);

        if (!result.isValid) {
          setErrorMsg(result.error);
          return;
        }

        const confirmOverwrite = window.confirm(
          `¿Deseas restaurar la ficha de "${result.payload.character.name}" (Nivel ${result.payload.character.level})? Esto reemplazará el personaje actual.`
        );

        if (confirmOverwrite) {
          onImportCharacter({
            profile: result.payload.character,
            health: result.payload.health,
            spellSlots: result.payload.spellSlots ?? createDefaultSpellSlots(),
            resources: result.payload.resources,
          });
          setSuccessMsg(`¡Ficha de "${result.payload.character.name}" cargada con éxito!`);
          setTimeout(() => onClose(), 1200);
        }
      } catch {
        setErrorMsg('El archivo no contiene un formato JSON válido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>💾</span> Copias de Seguridad
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 touch-btn p-1 text-lg font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 mb-3 bg-rose-950/70 border border-rose-800/80 rounded-lg text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 mb-3 bg-emerald-950/70 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs">
            {successMsg}
          </div>
        )}

        <div className="space-y-3">
          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full touch-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <span>⬇️</span>
            <span>Exportar Personaje (.JSON)</span>
          </button>

          {/* Import button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full touch-btn bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <span>⬆️</span>
            <span>Importar Personaje (.JSON)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-700/60">
            {isConfirmingReset ? (
              <div className="p-3 bg-slate-900 border border-rose-800/60 rounded-xl text-center space-y-2">
                <p className="text-xs text-rose-300 font-semibold">
                  ¿Reiniciar ficha a valores iniciales en blanco?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(false)}
                    className="flex-1 bg-slate-700 text-slate-300 touch-btn rounded-lg text-xs font-bold py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetCharacter();
                      setIsConfirmingReset(false);
                      onClose();
                    }}
                    className="flex-1 bg-rose-700 hover:bg-rose-600 text-white touch-btn rounded-lg text-xs font-bold py-2 shadow-md"
                  >
                    Sí, reiniciar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="w-full touch-btn text-xs text-slate-400 hover:text-rose-400 py-2 flex items-center justify-center gap-1.5"
              >
                <span>🔄</span>
                <span>Crear ficha nueva en blanco</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
