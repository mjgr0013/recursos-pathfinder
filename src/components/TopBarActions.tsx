import React, { useState, useRef, useEffect } from 'react';

interface TopBarActionsProps {
  charactersCount: number;
  maxCharacters?: number;
  onOpenRoster: () => void;
  onOpenBackup: () => void;
  onOpenFormulaGuide: () => void;
  onOpenLongRest: () => void;
  onExportPdf?: () => void;
}

export const TopBarActions: React.FC<TopBarActionsProps> = ({
  charactersCount,
  maxCharacters = 5,
  onOpenRoster,
  onOpenBackup,
  onOpenFormulaGuide,
  onOpenLongRest,
  onExportPdf,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleAction = (callback: () => void) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative print:hidden" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className={`touch-btn border text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${
          isMenuOpen
            ? 'bg-slate-700 border-amber-400 text-slate-100 ring-2 ring-amber-400/20'
            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
        }`}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="Menú de herramientas y opciones"
        title="Menú de opciones y gestión"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Menú</span>
        <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-black border border-amber-500/40">
          {`${charactersCount}/${maxCharacters}`}
        </span>
        <span
          className={`text-[9px] text-slate-400 transition-transform duration-150 ${
            isMenuOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu Popover */}
      {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-40 backdrop-blur-md"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Option 1: Characters Roster */}
            <button
              type="button"
              onClick={() => handleAction(onOpenRoster)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base shrink-0">🎭</span>
                <div>
                  <div className="font-bold text-slate-100">Personajes</div>
                  <div className="text-[10px] text-slate-400">Gestionar ranuras y fichas</div>
                </div>
              </div>
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-black border border-amber-500/40 shrink-0">
                {`${charactersCount}/${maxCharacters}`}
              </span>
            </button>

            {/* Option 2: Data and Backups */}
            <button
              type="button"
              onClick={() => handleAction(onOpenBackup)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">💾</span>
              <div>
                <div className="font-bold text-slate-100">Datos y Respaldos</div>
                <div className="text-[10px] text-slate-400">Exportar o importar ficha JSON</div>
              </div>
            </button>

            {/* Option 3: Formulas & Variables Guide */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFormulaGuide)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">📐</span>
              <div>
                <div className="font-bold text-slate-100">Guía de Fórmulas</div>
                <div className="text-[10px] text-slate-400">Variables, funciones y ejemplos</div>
              </div>
            </button>

            {/* Option 4: Export to PDF / Print */}
            <button
              type="button"
              onClick={() => handleAction(onExportPdf ?? (() => window.print()))}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">📄</span>
              <div>
                <div className="font-bold text-slate-100">Exportar a PDF / Imprimir</div>
                <div className="text-[10px] text-slate-400">Versión optimizada para papel y fichas</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-800" />

            {/* Option 5: Long Rest in Menu */}
            <button
              type="button"
              onClick={() => handleAction(onOpenLongRest)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-indigo-950/70 text-indigo-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">🌙</span>
              <div>
                <div className="font-bold text-indigo-100">Descanso Largo</div>
                <div className="text-[10px] text-indigo-300/70">Restaurar recursos, espacios y PG</div>
              </div>
            </button>
          </div>
        )}
    </div>
  );
};
