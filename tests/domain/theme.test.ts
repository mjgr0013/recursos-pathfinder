import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredTheme,
  saveTheme,
  applyThemeToDocument,
  toggleTheme,
  AVAILABLE_THEMES,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
} from '../../src/domain/theme';

describe('domain/theme', () => {
  let mockStorageStore: Record<string, string>;
  let mockStorage: Storage;
  let mockDoc: { documentElement: { classList: { add: (c: string) => void; remove: (...c: string[]) => void; contains: (c: string) => boolean }; setAttribute: (k: string, v: string) => void; getAttribute: (k: string) => string | null } };
  let classes: Set<string>;
  let attributes: Map<string, string>;

  beforeEach(() => {
    mockStorageStore = {};
    mockStorage = {
      getItem: (key: string) => mockStorageStore[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorageStore[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorageStore[key];
      },
      clear: () => {
        mockStorageStore = {};
      },
      key: (i: number) => Object.keys(mockStorageStore)[i] ?? null,
      length: 0,
    };

    classes = new Set<string>();
    attributes = new Map<string, string>();

    mockDoc = {
      documentElement: {
        classList: {
          add: (c: string) => classes.add(c),
          remove: (...toRemove: string[]) => {
            toRemove.forEach((c) => classes.delete(c));
          },
          contains: (c: string) => classes.has(c),
        },
        setAttribute: (k: string, v: string) => attributes.set(k, v),
        getAttribute: (k: string) => attributes.get(k) ?? null,
      },
    };
  });

  it('exposes available themes including light, warm, dark, arcane, and forge', () => {
    expect(AVAILABLE_THEMES).toHaveLength(5);
    expect(AVAILABLE_THEMES.map((t) => t.id)).toEqual(['light', 'warm', 'dark', 'arcane', 'forge']);
  });

  it('defaults to light theme when nothing is stored', () => {
    expect(DEFAULT_THEME).toBe('light');
    expect(getStoredTheme(mockStorage)).toBe('light');
  });

  it('retrieves stored themes correctly', () => {
    mockStorage.setItem(THEME_STORAGE_KEY, 'warm');
    expect(getStoredTheme(mockStorage)).toBe('warm');

    mockStorage.setItem(THEME_STORAGE_KEY, 'arcane');
    expect(getStoredTheme(mockStorage)).toBe('arcane');

    mockStorage.setItem(THEME_STORAGE_KEY, 'forge');
    expect(getStoredTheme(mockStorage)).toBe('forge');

    mockStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getStoredTheme(mockStorage)).toBe('dark');
  });

  it('handles invalid stored values by falling back to default', () => {
    mockStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme');
    expect(getStoredTheme(mockStorage)).toBe('light');
  });

  it('persists theme to localStorage', () => {
    saveTheme('arcane', mockStorage);
    expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBe('arcane');

    saveTheme('forge', mockStorage);
    expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBe('forge');

    saveTheme('light', mockStorage);
    expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('cycles theme through light -> warm -> dark -> arcane -> forge -> light', () => {
    expect(toggleTheme('light')).toBe('warm');
    expect(toggleTheme('warm')).toBe('dark');
    expect(toggleTheme('dark')).toBe('arcane');
    expect(toggleTheme('arcane')).toBe('forge');
    expect(toggleTheme('forge')).toBe('light');
  });

  it('applies light theme to document element', () => {
    applyThemeToDocument('light', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('light')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('warm')).toBe(false);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(false);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies warm theme to document element', () => {
    applyThemeToDocument('warm', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('warm')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('light')).toBe(false);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(false);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('warm');
  });

  it('applies dark theme to document element', () => {
    applyThemeToDocument('dark', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('warm')).toBe(false);
    expect(mockDoc.documentElement.classList.contains('light')).toBe(false);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies arcane theme to document element with dark compatibility', () => {
    applyThemeToDocument('arcane', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('arcane')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(true);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('arcane');
  });

  it('applies forge theme to document element with dark compatibility', () => {
    applyThemeToDocument('forge', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('forge')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(true);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('forge');
  });

  it('switches between themes on document element cleanly', () => {
    applyThemeToDocument('dark', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('dark')).toBe(true);

    applyThemeToDocument('arcane', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('arcane')).toBe(true);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('arcane');

    applyThemeToDocument('forge', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('forge')).toBe(true);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('forge');

    applyThemeToDocument('light', mockDoc as unknown as Document);
    expect(mockDoc.documentElement.classList.contains('light')).toBe(true);
    expect(mockDoc.documentElement.classList.contains('arcane')).toBe(false);
    expect(mockDoc.documentElement.classList.contains('forge')).toBe(false);
    expect(mockDoc.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
