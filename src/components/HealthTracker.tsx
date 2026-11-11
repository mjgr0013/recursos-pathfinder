import React, { useState } from 'react';
import { HealthRecord } from '../domain/types';
import {
  applyDamage,
  applyHealing,
  setTempHp,
  updateMaxHp,
  getConsciousnessState,
} from '../domain/health';
import { ModalOverlay } from './ModalOverlay';

interface HealthTrackerProps {
  health: HealthRecord;
  onUpdateHealth: (updated: HealthRecord) => void;
}

const UI_PREFS_KEY = 'pathfinder_ui_prefs_v1';

export const HealthTracker: React.FC<HealthTrackerProps> = ({ health, onUpdateHealth }) => {
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(UI_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.isHealthCompact === true;
        }
      }
    } catch {
      // Ignorar error de parsing
    }
    return false;
  });

  const [customValue, setCustomValue] = useState<string>('');
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [editingMaxHp, setEditingMaxHp] = useState<number | ''>(health.maxHp);
  const [isEditingTemp, setIsEditingTemp] = useState(false);
  const [editingTempHp, setEditingTempHp] = useState<number | ''>(health.tempHp);
  const [feedbackEffect, setFeedbackEffect] = useState<'damage' | 'heal' | null>(null);

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(UI_PREFS_KEY);
          const current = raw ? JSON.parse(raw) : {};
          localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ ...current, isHealthCompact: next }));
        }
      } catch {
        // Ignorar error de guardado
      }
      return next;
    });
  };

  const triggerFeedback = (type: 'damage' | 'heal') => {
    setFeedbackEffect(type);
    setTimeout(() => setFeedbackEffect(null), 300);
  };

  const handleDamage = (amount: number) => {
    if (amount <= 0) return;
    triggerFeedback('damage');
    onUpdateHealth(applyDamage(health, amount));
  };

  const handleHeal = (amount: number) => {
    if (amount <= 0) return;
    triggerFeedback('heal');
    onUpdateHealth(applyHealing(health, amount));
  };

  const handleCustomAction = (type: 'damage' | 'heal') => {
    const val = parseInt(customValue, 10);
    if (isNaN(val) || val <= 0) return;
    if (type === 'damage') {
      handleDamage(val);
    } else {
      handleHeal(val);
    }
    setCustomValue('');
  };

  const hpPercent = Math.max(0, Math.min(100, Math.round((health.currentHp / health.maxHp) * 100)));
  const consciousness = getConsciousnessState(health);

  return (
    <section className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm transition-all print:bg-white print:border-slate-300 print:text-slate-900 print:shadow-none">
      {/* VISTA PARA IMPRESIÓN EN PAPEL (Sin botones de sumar/quitar vida y con casilla en blanco para PG actuales) */}
      <div className="hidden print:block space-y-2">
        <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-1.5 print:text-xs">
            <span>❤️</span> Puntos de Golpe (PG)
          </h3>

          <div className="text-xs text-slate-600 font-medium">
            <span>PG Temporales: </span>
            <span className="inline-block w-12 border-b-2 border-slate-400 font-bold text-slate-900 text-center">
              {health.tempHp > 0 ? `+${health.tempHp}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-around py-2.5 bg-slate-50 border border-slate-300 rounded-lg">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">PG Actuales</span>
            <span
              className="inline-block w-16 h-8 border-2 border-slate-400 rounded mt-1 bg-white shadow-none"
              aria-label="Casilla para anotar PG actuales a lápiz"
            />
          </div>
          <div className="text-2xl font-bold text-slate-400">/</div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">PG Máximos</span>
            <span className="text-3xl font-black text-slate-900">{health.maxHp}</span>
          </div>
          <div className="h-10 border-r border-slate-300" />
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Daño / Anotaciones</span>
            <div className="w-24 border-b-2 border-slate-400 mt-4" />
          </div>
        </div>
      </div>

      {/* VISTA INTERACTIVA PARA PANTALLA */}
      <div className="print:hidden">
        {/* Header with Title, Consciousness State, and Compact Toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <span>❤️</span> (PG)
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                consciousness === 'conscious'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-700/60 animate-pulse'
              }`}
            >
              {consciousness === 'conscious' ? 'Consciente' : 'Inconsciente (0 PG)'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleCompact}
            className="touch-btn text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-400 font-bold px-2 shrink-0 flex items-center gap-1 transition-colors"
            aria-label={isCompact ? 'Desplegar controles de combate' : 'Plegar controles de combate'}
          >
            <span>{isCompact ? '▼ Controles' : '▲ Plegar'}</span>
          </button>
        </div>

        {/* VISTA MODO COMPACTO (Solo Vida Actual y Máxima) */}
        {isCompact ? (
          <div
            onClick={toggleCompact}
            className="cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-2.5 transition-all"
            title="Toca para desplegar los controles de combate"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {health.currentHp}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  / {health.maxHp} PG
                </span>
                {health.tempHp > 0 && (
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-700 ml-1">
                    +{health.tempHp} temp
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Toca para abrir daño/cura
              </span>
            </div>

            {/* Mini barra de vida */}
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-300 dark:border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  hpPercent > 50
                    ? 'bg-emerald-500'
                    : hpPercent > 20
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        ) : (
          /* VISTA MODO COMPLETO (Con Botonera de Daño y Curación) */
          <>
            {/* Main HP Display Box */}
            <div
              className={`bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 mb-3 text-center transition-colors duration-150 ${
                feedbackEffect === 'damage'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20'
                  : feedbackEffect === 'heal'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl xs:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {health.currentHp}
                </span>
                <span className="text-xl font-bold text-slate-400">/</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMaxHp(health.maxHp);
                    setIsEditingMax(true);
                  }}
                  className="text-2xl font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 touch-btn p-1 transition-colors"
                  title="Editar PG Máximos"
                >
                  {health.maxHp}
                </button>
              </div>

              {/* Temporary HP Pill */}
              <div className="mt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTempHp(health.tempHp);
                    setIsEditingTemp(true);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 touch-btn transition-colors ${
                    health.tempHp > 0
                      ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-300'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                  }`}
                  title="Puntos de Vida Temporales"
                >
                  <span>🛡️ Temporales:</span>
                  <span className="font-bold text-cyan-800 dark:text-cyan-200">+{health.tempHp}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 mt-3 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    hpPercent > 50
                      ? 'bg-emerald-500'
                      : hpPercent > 20
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="space-y-2">
              {/* Quick Damage (-1, -5, -10) */}
              <div>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400/90 uppercase tracking-wider block mb-1">
                  Aplicar Daño
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map((amt) => (
                    <button
                      key={`dmg-${amt}`}
                      type="button"
                      onClick={() => handleDamage(amt)}
                      className="touch-btn bg-rose-50 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-200 font-bold rounded-lg text-sm shadow-sm transition-colors"
                    >
                      -{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Heal (+1, +5, +10) */}
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400/90 uppercase tracking-wider block mb-1">
                  Aplicar Curación
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map((amt) => (
                    <button
                      key={`heal-${amt}`}
                      type="button"
                      onClick={() => handleHeal(amt)}
                      className="touch-btn bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-200 font-bold rounded-lg text-sm shadow-sm transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Row */}
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  min={1}
                  placeholder="Cant."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 min-h-touch focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={!customValue}
                  onClick={() => handleCustomAction('damage')}
                  className="flex-1 touch-btn bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-700 text-white font-bold rounded-lg text-xs disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-colors"
                >
                  Daño
                </button>
                <button
                  type="button"
                  disabled={!customValue}
                  onClick={() => handleCustomAction('heal')}
                  className="flex-1 touch-btn bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 text-white font-bold rounded-lg text-xs disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-colors"
                >
                  Cura
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Editar PG Máximos */}
      {isEditingMax && (
        <ModalOverlay
          onClose={() => setIsEditingMax(false)}
          backdropClassName="bg-black/60 dark:bg-black/75"
          aria-label="Editar PG Máximos"
        >
          <div
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-2xl cursor-default text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Editar PG Máximos</h4>
            <input
              type="number"
              min={1}
              value={editingMaxHp}
              onChange={(e) => setEditingMaxHp(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-900 dark:text-slate-100 min-h-touch mb-3 focus:outline-none focus:border-amber-500"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingMax(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-transparent font-semibold py-2 rounded-lg touch-btn text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const newMax = Math.max(1, Math.floor(editingMaxHp === '' ? 1 : editingMaxHp));
                  onUpdateHealth(updateMaxHp(health, newMax));
                  setIsEditingMax(false);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg touch-btn text-xs shadow-sm transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Modal Editar PG Temporales */}
      {isEditingTemp && (
        <ModalOverlay
          onClose={() => setIsEditingTemp(false)}
          backdropClassName="bg-black/60 dark:bg-black/75"
          aria-label="Puntos de Vida Temporales"
        >
          <div
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-xs p-4 shadow-2xl cursor-default text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-cyan-800 dark:text-cyan-300 mb-2">Puntos de Vida Temporales</h4>
            <input
              type="number"
              min={0}
              value={editingTempHp}
              onChange={(e) => setEditingTempHp(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-900 dark:text-slate-100 min-h-touch focus:outline-none focus:border-cyan-500"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingTemp(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-transparent font-semibold py-2 rounded-lg touch-btn text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTemp = Math.max(0, Math.floor(editingTempHp === '' ? 0 : editingTempHp));
                  onUpdateHealth(setTempHp(health, newTemp));
                  setIsEditingTemp(false);
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-2 rounded-lg touch-btn text-xs shadow-sm transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </section>
  );
};
