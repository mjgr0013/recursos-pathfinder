import React from 'react';
import { ModalOverlay } from './ModalOverlay';

interface LongRestModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const LongRestModal: React.FC<LongRestModalProps> = ({ isOpen, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose} backdropClassName="bg-black/80" aria-label="Descanso Largo">
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-500/40">
          🌙
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-2">
          ¿Tomar un Descanso Largo?
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Se restaurarán todos los <strong className="text-amber-400">conjuros y rasgos limitados</strong> a su capacidad máxima,
          los <strong className="text-emerald-400">puntos de vida actuales</strong> volverán a su valor máximo y los{' '}
          <strong className="text-cyan-400">PG temporales</strong> se reiniciarán a 0.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl touch-btn text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl touch-btn text-sm shadow-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
