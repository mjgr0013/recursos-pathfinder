import React, { useState, useRef, useEffect } from 'react';
import { ThemeId, AVAILABLE_THEMES } from '../domain/theme';

interface TopBarActionsProps {
  charactersCount: number;
  maxCharacters?: number;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  onToggleTheme?: () => void;
  onOpenRoster: () => void;
  onOpenBackup: () => void;
  onOpenFormulaGuide: () => void;
  onOpenLongRest: () => void;
  onExportPdf?: () => void;
}

export const TopBarActions: React.FC<TopBarActionsProps> = ({
  charactersCount,
  maxCharacters = 5,
  currentTheme = 'light',
  onSelectTheme,
  onToggleTheme,
  onOpenRoster,
  onOpenBackup,
  onOpenFormulaGuide,
  onOpenLongRest,
  onExportPdf,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeConfig =
    AVAILABLE_THEMES.find((t) => t.id === currentTheme) ?? AVAILABLE_THEMES[0];

  // Close menus on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(target)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsThemeDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = (callback: () => void) => {
    callback();
    setIsMenuOpen(false);
  };

  const handleThemeSelect = (themeId: ThemeId) => {
    if (onSelectTheme) {
      onSelectTheme(themeId);
    } else if (onToggleTheme) {
      onToggleTheme();
    }
    setIsThemeDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Theme Selector Dropdown */}
      <div className="relative" ref={themeDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsThemeDropdownOpen((prev) => !prev);
            setIsMenuOpen(false);
          }}
          className={`touch-btn border text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${
            isThemeDropdownOpen
              ? 'bg-slate-100 border-amber-500 text-slate-900 ring-2 ring-amber-400/30 dark:bg-slate-700 dark:border-amber-400 dark:text-slate-100 dark:ring-amber-400/20'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200'
          }`}
          aria-expanded={isThemeDropdownOpen}
          aria-haspopup="true"
          aria-label={`Seleccionar tema visual (actual: ${activeThemeConfig.name})`}
          title={`Tema actual: ${activeThemeConfig.name}. Clic para cambiar`}
        >
          <span className="text-sm">{activeThemeConfig.icon}</span>
          <span className="hidden xs:inline">{activeThemeConfig.name}</span>
          <span
            className={`text-[9px] text-slate-400 transition-transform duration-150 ${
              isThemeDropdownOpen ? 'rotate-180 text-amber-500 dark:text-amber-400' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {/* Theme Dropdown Popover */}
        {isThemeDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-40 backdrop-blur-md dark:bg-slate-900 dark:border-slate-700/90 text-slate-800 dark:text-slate-200"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 mb-0.5">
              🎨 Seleccionar Tema
            </div>

            {AVAILABLE_THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-btn ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300 font-bold border border-amber-300/60 dark:border-amber-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{theme.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{theme.name}</span>
                        {isSelected && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            (activo)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0 ml-1">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Settings Menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            setIsMenuOpen((prev) => !prev);
            setIsThemeDropdownOpen(false);
          }}
          className={`touch-btn border text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${
            isMenuOpen
              ? 'bg-slate-100 border-amber-500 text-slate-900 ring-2 ring-amber-400/30 dark:bg-slate-700 dark:border-amber-400 dark:text-slate-100 dark:ring-amber-400/20'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200'
          }`}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-label="Menú de herramientas y opciones"
          title="Menú de opciones y gestión"
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Menú</span>
          <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 px-1.5 py-0.5 rounded text-[10px] font-black">
            {`${charactersCount}/${maxCharacters}`}
          </span>
          <span
            className={`text-[9px] text-slate-400 transition-transform duration-150 ${
              isMenuOpen ? 'rotate-180 text-amber-500 dark:text-amber-400' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {/* Dropdown Menu Popover */}
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-40 backdrop-blur-md dark:bg-slate-900 dark:border-slate-700/90 text-slate-800 dark:text-slate-200"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Option 1: Characters Roster */}
            <button
              type="button"
              onClick={() => handleAction(onOpenRoster)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base shrink-0">🎭</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Personajes</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Gestionar ranuras y fichas</div>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 px-1.5 py-0.5 rounded text-[10px] font-black shrink-0">
                {`${charactersCount}/${maxCharacters}`}
              </span>
            </button>

            {/* Option 2: Data and Backups */}
            <button
              type="button"
              onClick={() => handleAction(onOpenBackup)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">💾</span>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">Datos y Respaldos</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Exportar o importar ficha JSON</div>
              </div>
            </button>

            {/* Option 3: Formulas & Variables Guide */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFormulaGuide)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">📐</span>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">Guía de Fórmulas</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Variables, funciones y ejemplos</div>
              </div>
            </button>

            {/* Option 4: Export to PDF / Print */}
            <button
              type="button"
              onClick={() => handleAction(onExportPdf ?? (() => window.print()))}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">📄</span>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">Exportar a PDF / Imprimir</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Versión optimizada para papel y fichas</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

            {/* Themes quick selector inside menu */}
            <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tema Visual
            </div>
            <div className="grid grid-cols-3 gap-1 px-1.5 pb-1">
              {AVAILABLE_THEMES.map((t) => (
                <button
                  key={`menu-theme-${t.id}`}
                  type="button"
                  onClick={() => handleThemeSelect(t.id)}
                  className={`touch-btn py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 border transition-all ${
                    currentTheme === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={t.description}
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-[10px]">{t.name}</span>
                </button>
              ))}
            </div>

            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

            {/* Option 5: Long Rest in Menu */}
            <button
              type="button"
              onClick={() => handleAction(onOpenLongRest)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200 text-xs font-medium transition-colors touch-btn"
              role="menuitem"
            >
              <span className="text-base shrink-0">🌙</span>
              <div>
                <div className="font-bold text-indigo-900 dark:text-indigo-100">Descanso Largo</div>
                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-300/70">Restaurar recursos, espacios y PG</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
