import { useState, useEffect } from 'react';
import { CharacterState, ResourceItem } from './domain/types';
import {
  loadCharacterRoster,
  saveCharacterRoster,
} from './storage/local-storage';
import {
  CharacterRosterState,
  createBlankCharacter,
  addCharacterToRoster,
  switchActiveCharacter,
  deleteCharacterFromRoster,
  updateActiveCharacterInRoster,
  getActiveCharacter,
} from './domain/roster';
import { CharacterHeader } from './components/CharacterHeader';
import { HealthTracker } from './components/HealthTracker';
import { DailyResourcesTracker } from './components/DailyResourcesTracker';
import { ResourceList } from './components/ResourceList';
import { LongRestModal } from './components/LongRestModal';
import { BackupModal } from './components/BackupModal';
import { CharacterRosterModal } from './components/CharacterRosterModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { TopBarActions } from './components/TopBarActions';
import {
  spendResource,
  restoreResource,
  deleteResource,
  applyLongRest,
  updateResourceMaxUses,
  updateResourceUses,
  updateResourceDetails,
  UpdateResourceDetailsInput,
  sortResources,
} from './domain/resources';
import {
  spendSpellSlot,
  restoreSpellSlot,
  updateSpellSlotMax,
  updateSpellSlotValues,
} from './domain/spells';
import { generateRandomCharacter } from './domain/generator';

export default function App() {
  const [roster, setRoster] = useState<CharacterRosterState>(() => loadCharacterRoster());
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isLongRestModalOpen, setIsLongRestModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isFormulaGuideOpen, setIsFormulaGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const characterState = getActiveCharacter(roster);

  const setCharacterState = (updater: CharacterState | ((prev: CharacterState) => CharacterState)) => {
    setRoster((prevRoster) => {
      const currentActive = getActiveCharacter(prevRoster);
      const updated = typeof updater === 'function' ? updater(currentActive) : updater;
      const updatedRoster = updateActiveCharacterInRoster(prevRoster, updated);
      saveCharacterRoster(updatedRoster);
      return updatedRoster;
    });
  };

  useEffect(() => {
    saveCharacterRoster(roster);
  }, [roster]);

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
      resources: sortResources([...prev.resources, newResource]),
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
    setCharacterState({
      ...importedState,
      resources: sortResources(importedState.resources),
    });
    showToast(`Ficha de "${importedState.profile.name}" cargada`);
  };

  const handleResetCharacter = () => {
    const fresh = createBlankCharacter();
    setCharacterState(fresh);
    showToast('Ficha reiniciada');
  };

  const handleSelectCharacter = (id: string) => {
    const res = switchActiveCharacter(roster, id);
    if (res.success) {
      setRoster(res.roster);
      saveCharacterRoster(res.roster);
      const active = getActiveCharacter(res.roster);
      showToast(`Cargado: "${active.profile.name}"`);
    }
  };

  const handleCreateCharacter = () => {
    const blank = createBlankCharacter(roster.characters.length + 1);
    const res = addCharacterToRoster(roster, blank);
    if (res.success) {
      setRoster(res.roster);
      saveCharacterRoster(res.roster);
      showToast('¡Nuevo personaje creado! Puedes personalizarlo.');
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const handleCreateRandomCharacterInRoster = () => {
    const randomChar = generateRandomCharacter();
    const res = addCharacterToRoster(roster, randomChar);
    if (res.success) {
      setRoster(res.roster);
      saveCharacterRoster(res.roster);
      showToast(`¡Personaje "${randomChar.profile.name}" añadido en nueva ranura!`);
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const handleDeleteCharacter = (id: string) => {
    const updated = deleteCharacterFromRoster(roster, id);
    setRoster(updated);
    saveCharacterRoster(updated);
    const active = getActiveCharacter(updated);
    showToast(`Personaje eliminado. Activo: "${active.profile.name}"`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-3 py-3 md:px-6 md:py-5 max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full pb-16 print:min-h-0 print:bg-white print:text-slate-900 print:p-0 print:max-w-none print:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-bounce print:hidden">
          {toastMessage}
        </div>
      )}

      {/* Main App Bar (Solo en pantalla) */}
      <header className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800 print:hidden">
        <h1 className="text-base md:text-lg font-bold tracking-wide text-amber-400 flex items-center gap-1.5">
          <span>⚔️</span> Recursos Pathfinder
        </h1>

        <TopBarActions
          charactersCount={roster.characters.length}
          maxCharacters={5}
          onOpenRoster={() => setIsRosterModalOpen(true)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          onOpenFormulaGuide={() => setIsFormulaGuideOpen(true)}
          onOpenLongRest={() => setIsLongRestModalOpen(true)}
          onExportPdf={() => window.print()}
        />
      </header>

      {/* Print Header: Encabezado formal de la ficha de personaje en papel */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3 w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <h1 className="text-base font-black tracking-wide text-slate-900 uppercase print:text-xs">
              Recursos Pathfinder • Ficha de Personaje
            </h1>
            <p className="text-[10px] text-slate-600 font-medium">
              Puntos de Golpe, Recursos Diarios, Conjuros y Rasgos
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-600 font-bold">
          <span>{characterState.profile.name}</span> • <span>Nivel {characterState.profile.level}</span>
        </div>
      </div>

      <main className="w-full flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-6 print:block print:w-full print:gap-0">
        {/* Left Column on Desktop / Top Area on Mobile & Tablet */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-3 lg:sticky lg:top-4 self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 print:w-full print:static print:max-h-none print:overflow-visible print:p-0 print:gap-3">
          {/* On Tablet portrait (md) and Print, CharacterHeader and HealthTracker sit side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 print:grid-cols-2 print:gap-3">
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
        <div className="w-full flex-1 min-w-0 mt-3 lg:mt-0 print:w-full print:mt-4 print:p-0">
          <ResourceList
            resources={characterState.resources}
            spellSlots={characterState.spellSlots}
            characterLevel={characterState.profile.level}
            characterVariables={{
              nivel_personaje: characterState.profile.level,
              nivel: characterState.profile.level,
              level: characterState.profile.level,
              ataque_base: characterState.profile.baseAttackBonus ?? 0,
              bab: characterState.profile.baseAttackBonus ?? 0,
              base_attack: characterState.profile.baseAttackBonus ?? 0,
              modificador_lanzador: characterState.profile.casterModifier ?? 0,
              mod_lanzador: characterState.profile.casterModifier ?? 0,
              mod_conjuros: characterState.profile.casterModifier ?? 0,
              modificador_conjuros: characterState.profile.casterModifier ?? 0,
              caster_mod: characterState.profile.casterModifier ?? 0,
            }}
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

      {/* Backup Export / Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        characterState={characterState}
        onImportCharacter={handleImportCharacter}
        onResetCharacter={handleResetCharacter}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Character Roster Management Modal */}
      <CharacterRosterModal
        isOpen={isRosterModalOpen}
        roster={roster}
        onSelectCharacter={handleSelectCharacter}
        onCreateCharacter={handleCreateCharacter}
        onCreateRandomCharacter={handleCreateRandomCharacterInRoster}
        onDeleteCharacter={handleDeleteCharacter}
        onClose={() => setIsRosterModalOpen(false)}
      />

      {/* Formula Guide Modal */}
      <FormulaGuideModal
        isOpen={isFormulaGuideOpen}
        variables={{
          nivel_personaje: characterState.profile.level,
          nivel: characterState.profile.level,
          level: characterState.profile.level,
          ataque_base: characterState.profile.baseAttackBonus ?? 0,
          bab: characterState.profile.baseAttackBonus ?? 0,
          base_attack: characterState.profile.baseAttackBonus ?? 0,
          modificador_lanzador: characterState.profile.casterModifier ?? 0,
          mod_lanzador: characterState.profile.casterModifier ?? 0,
          mod_conjuros: characterState.profile.casterModifier ?? 0,
          modificador_conjuros: characterState.profile.casterModifier ?? 0,
          caster_mod: characterState.profile.casterModifier ?? 0,
        }}
        onClose={() => setIsFormulaGuideOpen(false)}
      />
    </div>
  );
}
