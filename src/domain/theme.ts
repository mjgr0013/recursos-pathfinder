export type ThemeId = 'light' | 'warm' | 'dark' | 'arcane' | 'forge' | 'grove';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  /** Activa también la clase `dark` para reutilizar las variantes oscuras de Tailwind. */
  isDark: boolean;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Claro',
    icon: '☀️',
    description: 'Tema claro con alto contraste y fondos limpios',
    isDark: false,
  },
  {
    id: 'warm',
    name: 'Cálido',
    icon: '📜',
    description: 'Tono pergamino cálido, intermedio y suave para la vista',
    isDark: false,
  },
  {
    id: 'dark',
    name: 'Oscuro',
    icon: '🌙',
    description: 'Tema oscuro original para baja luminosidad',
    isDark: true,
  },
  {
    id: 'arcane',
    name: 'Arcano Rúnico',
    icon: '🔮',
    description: 'Obsidiana violeta, amatista mística y maná cian',
    isDark: true,
  },
  {
    id: 'forge',
    name: 'Forja Enana',
    icon: '🌋',
    description: 'Basalto, acero forjado, bronce y brasas de magma',
    isDark: true,
  },
  {
    id: 'grove',
    name: 'Bosque Druídico',
    icon: '🌿',
    description: 'Claro luminoso de salvia, musgo vivo y bayas silvestres',
    isDark: false,
  },
];

export const THEME_STORAGE_KEY = 'pathfinder_theme_v1';
export const DEFAULT_THEME: ThemeId = 'light';

const VALID_THEMES = new Set<ThemeId>(AVAILABLE_THEMES.map((t) => t.id));

/**
 * Loads the stored theme identifier from localStorage or returns default ('light').
 */
export function getStoredTheme(storage?: Storage): ThemeId {
  const targetStorage = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!targetStorage) return DEFAULT_THEME;

  try {
    const raw = targetStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (raw && VALID_THEMES.has(raw)) {
      return raw;
    }
  } catch {
    // Return default on storage access failure
  }
  return DEFAULT_THEME;
}

/**
 * Persists the chosen theme identifier in localStorage.
 */
export function saveTheme(theme: ThemeId, storage?: Storage): void {
  const targetStorage = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!targetStorage) return;

  try {
    targetStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silently ignore storage errors in restricted contexts
  }
}

/**
 * Applies the theme class and data-theme attribute to the root documentElement.
 */
export function applyThemeToDocument(theme: ThemeId, doc?: Document): void {
  const targetDoc = doc ?? (typeof document !== 'undefined' ? document : null);
  if (!targetDoc?.documentElement) return;

  const root = targetDoc.documentElement;
  root.classList.remove('dark', ...AVAILABLE_THEMES.map((t) => t.id));
  root.classList.add(theme);

  // Los temas oscuros reutilizan las variantes dark: de Tailwind como base de contraste
  if (AVAILABLE_THEMES.find((t) => t.id === theme)?.isDark) {
    root.classList.add('dark');
  }

  root.setAttribute('data-theme', theme);
}

/**
 * Cycles to the next available theme, in AVAILABLE_THEMES order, wrapping to the first.
 */
export function getNextTheme(current: ThemeId): ThemeId {
  const currentIndex = AVAILABLE_THEMES.findIndex((t) => t.id === current);
  if (currentIndex === -1 || currentIndex === AVAILABLE_THEMES.length - 1) {
    return AVAILABLE_THEMES[0].id;
  }
  return AVAILABLE_THEMES[currentIndex + 1].id;
}

export const toggleTheme = getNextTheme;
