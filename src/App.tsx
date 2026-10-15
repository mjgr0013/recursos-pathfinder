import { useState, useEffect } from 'react';
import { CharacterState, ResourceItem } from './domain/types';
import { loadCharacterState, saveCharacterState, createDefaultCharacterState } from './storage/local-storage';
import { CharacterHeader } from './components/CharacterHeader';
import { HealthTracker } from './components/HealthTracker';
import { DailyResourcesTracker } from './components/DailyResourcesTracker';
import { ResourceList } from './components/ResourceList';
import { LongRestModal } from './components/LongRestModal';
import { BackupModal } from './components/BackupModal';
import {
  spendResource,
  restoreResource,
  deleteResource,
  applyLongRest,
  updateResourceMaxUses,
} from './domain/resources';
import { spendSpellSlot, restoreSpellSlot, updateSpellSlotMax } from './domain/spells';

export default function App() {
  const [characterState, setCharacterState] = useState<CharacterState>(() => loadCharacterState());
  const [isLongRestModalOpen, setIsLongRestModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveCharacterState(characterState);
  }, [characterState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSpendResource = (id: string) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? spendResource(r) : r)),
    }));
  };

  const handleRestoreResource = (id: string) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? restoreResource(r) : r)),
    }));
  };

  const handleDeleteResource = (id: string) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: deleteResource(prev.resources, id),
    }));
    showToast('Recurso eliminado');
  };

  const handleAddResource = (newResource: ResourceItem) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: [...prev.resources, newResource],
    }));
    showToast('Recurso añadido');
  };

  const handleUpdateResourceMaxUses = (id: string, newMax: number) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: updateResourceMaxUses(prev.resources, id, newMax),
    }));
    showToast('Usos máximos actualizados');
  };

  const handleSpendSlot = (level: number) => {
    setCharacterState((prev) => ({
      ...prev,
      spellSlots: spendSpellSlot(prev.spellSlots, level),
    }));
  };

  const handleRestoreSlot = (level: number) => {
    setCharacterState((prev) => ({
      ...prev,
      spellSlots: restoreSpellSlot(prev.spellSlots, level),
    }));
  };

  const handleUpdateMaxSlots = (level: number, newMax: number) => {
    setCharacterState((prev) => ({
      ...prev,
      spellSlots: updateSpellSlotMax(prev.spellSlots, level, newMax),
    }));
    showToast(`Espacios nivel ${level} actualizados`);
  };

  const handleConfirmLongRest = () => {
    setCharacterState((prev) => applyLongRest(prev));
    setIsLongRestModalOpen(false);
    showToast('¡Descanso Largo completado! Recursos, espacios y salud restaurados.');
  };

  const handleImportCharacter = (importedState: CharacterState) => {
    setCharacterState(importedState);
    showToast(`Ficha de "${importedState.profile.name}" cargada`);
  };

  const handleResetCharacter = () => {
    const fresh = createDefaultCharacterState();
    setCharacterState(fresh);
    showToast('Ficha reiniciada');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-3 py-3 max-w-lg mx-auto w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main App Bar */}
      <header className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <h1 className="text-base font-bold tracking-wide text-amber-400 flex items-center gap-1.5">
          <span>⚔️</span> Recursos Pathfinder
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="touch-btn bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            title="Exportar o importar ficha JSON"
          >
            <span>💾</span>
            <span>Datos</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLongRestModalOpen(true)}
            className="touch-btn bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            title="Restaurar todos los recursos diarios y puntos de vida"
          >
            <span>🌙</span>
            <span>Descanso</span>
          </button>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col">
        {/* User Story 1 (Core): Header & Health Tracker */}
        <CharacterHeader
          profile={characterState.profile}
          onUpdateProfile={(updated) =>
            setCharacterState((prev) => ({
              ...prev,
              profile: { ...prev.profile, ...updated },
            }))
          }
        />

        <HealthTracker
          health={characterState.health}
          onUpdateHealth={(newHealth) =>
            setCharacterState((prev) => ({
              ...prev,
              health: newHealth,
            }))
          }
        />

        {/* Feature 003: Unified Daily Resources (Dynamic Spell Slots + Limited Traits) */}
        <DailyResourcesTracker
          spellSlots={characterState.spellSlots}
          resources={characterState.resources}
          onUpdateMaxSlots={handleUpdateMaxSlots}
          onSpendResource={handleSpendResource}
          onRestoreResource={handleRestoreResource}
          onUpdateResourceMaxUses={handleUpdateResourceMaxUses}
        />

        {/* Catalog: Full Spells & Feats Resource List with Rules */}
        <ResourceList
          resources={characterState.resources}
          spellSlots={characterState.spellSlots}
          onSpendResource={handleSpendResource}
          onRestoreResource={handleRestoreResource}
          onDeleteResource={handleDeleteResource}
          onAddResource={handleAddResource}
          onSpendSpellSlot={handleSpendSlot}
          onRestoreSpellSlot={handleRestoreSlot}
          onUpdateResourceMaxUses={handleUpdateResourceMaxUses}
        />
      </main>

      {/* Long Rest Modal */}
      <LongRestModal
        isOpen={isLongRestModalOpen}
        onConfirm={handleConfirmLongRest}
        onClose={() => setIsLongRestModalOpen(false)}
      />

      {/* Backup Export / Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        characterState={characterState}
        onImportCharacter={handleImportCharacter}
        onResetCharacter={handleResetCharacter}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
