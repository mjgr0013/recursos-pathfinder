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
  updateResourceUses,
  updateResourceDetails,
  UpdateResourceDetailsInput,
} from './domain/resources';
import {
  spendSpellSlot,
  restoreSpellSlot,
  updateSpellSlotMax,
  updateSpellSlotValues,
} from './domain/spells';
import { generateRandomCharacter } from './domain/generator';
import { RandomConfirmModal } from './components/RandomConfirmModal';

export default function App() {
  const [characterState, setCharacterState] = useState<CharacterState>(() => loadCharacterState());
  const [isLongRestModalOpen, setIsLongRestModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isRandomConfirmModalOpen, setIsRandomConfirmModalOpen] = useState(false);
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

  const handleUpdateResourceUses = (id: string, newAvailable: number, newMax: number) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: updateResourceUses(prev.resources, id, newAvailable, newMax),
    }));
    showToast('Usos actualizados');
  };

  const handleUpdateResourceDetails = (id: string, details: UpdateResourceDetailsInput) => {
    setCharacterState((prev) => ({
      ...prev,
      resources: updateResourceDetails(prev.resources, id, details),
    }));
    showToast('Detalles actualizados');
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

  const handleUpdateSpellSlotValues = (level: number, newAvailable: number, newMax: number) => {
    setCharacterState((prev) => ({
      ...prev,
      spellSlots: updateSpellSlotValues(prev.spellSlots, level, newAvailable, newMax),
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

  const handleGenerateRandomCharacter = () => {
    const randomState = generateRandomCharacter();
    setCharacterState(randomState);
    showToast(`¡Ficha de "${randomState.profile.name}" (Nv. ${randomState.profile.level}) cargada!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-3 py-3 md:px-6 md:py-5 max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main App Bar */}
      <header className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <h1 className="text-base md:text-lg font-bold tracking-wide text-amber-400 flex items-center gap-1.5">
          <span>⚔️</span> Recursos Pathfinder
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRandomConfirmModalOpen(true)}
            className="touch-btn bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Generar ficha aleatoria completa (para probar todas las funciones)"
          >
            <span>🎲</span>
            <span>Aleatoria</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="touch-btn bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            title="Exportar o importar ficha JSON"
          >
            <span>💾</span>
            <span>Datos</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLongRestModalOpen(true)}
            className="touch-btn bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            title="Restaurar todos los recursos diarios y puntos de vida"
          >
            <span>🌙</span>
            <span>Descanso</span>
          </button>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-6">
        {/* Left Column on Desktop / Top Area on Mobile & Tablet */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-3 lg:sticky lg:top-4 self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          {/* On Tablet portrait (md), CharacterHeader and HealthTracker sit side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
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
          </div>

          <DailyResourcesTracker
            spellSlots={characterState.spellSlots}
            resources={characterState.resources}
            onUpdateMaxSlots={handleUpdateMaxSlots}
            onUpdateSlotValues={handleUpdateSpellSlotValues}
            onSpendResource={handleSpendResource}
            onRestoreResource={handleRestoreResource}
            onUpdateResourceMaxUses={handleUpdateResourceMaxUses}
            onUpdateResourceUses={handleUpdateResourceUses}
          />
        </div>

        {/* Right Column on Desktop / Bottom Area on Mobile & Tablet */}
        <div className="w-full flex-1 min-w-0 mt-3 lg:mt-0">
          <ResourceList
            resources={characterState.resources}
            spellSlots={characterState.spellSlots}
            characterLevel={characterState.profile.level}
            onSpendResource={handleSpendResource}
            onRestoreResource={handleRestoreResource}
            onDeleteResource={handleDeleteResource}
            onAddResource={handleAddResource}
            onSpendSpellSlot={handleSpendSlot}
            onRestoreSpellSlot={handleRestoreSlot}
            onUpdateResourceDetails={handleUpdateResourceDetails}
          />
        </div>
      </main>

      {/* Long Rest Modal */}
      <LongRestModal
        isOpen={isLongRestModalOpen}
        onConfirm={handleConfirmLongRest}
        onClose={() => setIsLongRestModalOpen(false)}
      />

      {/* Random Character Confirmation Modal */}
      <RandomConfirmModal
        isOpen={isRandomConfirmModalOpen}
        onConfirm={handleGenerateRandomCharacter}
        onClose={() => setIsRandomConfirmModalOpen(false)}
      />

      {/* Backup Export / Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        characterState={characterState}
        onImportCharacter={handleImportCharacter}
        onResetCharacter={handleResetCharacter}
        onGenerateRandomCharacter={handleGenerateRandomCharacter}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
