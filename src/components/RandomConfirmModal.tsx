import React from 'react';

interface RandomConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const RandomConfirmModal: React.FC<RandomConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-amber-500/40">
          🎲
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-2">
          ¿Generar Ficha Aleatoria?
        </h3>

        <div className="p-2.5 bg-rose-950/70 border border-rose-800/80 rounded-xl mb-3 text-left">
          <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
            <span>⚠️</span> Se borrará la ficha actual
          </p>
          <p className="text-[11px] text-rose-200/90 leading-relaxed">
            Esta acción reemplazará por completo el personaje actual, su vida, espacios de magia, conjuros y notas.
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Si deseas conservar tu progreso actual, pulsa <strong>Cancelar</strong> y guárdalo primero mediante el botón <strong>💾 Datos</strong> (Exportar).
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl touch-btn text-sm shadow-md"
          >
            Confirmar y Borrar
          </button>
        </div>
      </div>
    </div>
  );
};
