export type LayoutMode = 'standard' | 'resources';

export const LAYOUT_STORAGE_KEY = 'pathfinder_layout_v1';
export const DEFAULT_LAYOUT: LayoutMode = 'standard';

const VALID_LAYOUTS = new Set<LayoutMode>(['standard', 'resources']);

function resolveStorage(storage?: Storage): Storage | null {
  return storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
}

/**
 * Loads the stored layout mode from localStorage or returns the default ('standard').
 */
export function getStoredLayout(storage?: Storage): LayoutMode {
  const target = resolveStorage(storage);
  if (!target) return DEFAULT_LAYOUT;

  try {
    const raw = target.getItem(LAYOUT_STORAGE_KEY) as LayoutMode | null;
    if (raw && VALID_LAYOUTS.has(raw)) return raw;
  } catch {
    // Return default on storage access failure
  }
  return DEFAULT_LAYOUT;
}

/**
 * Persists the chosen layout mode in localStorage.
 */
export function saveLayout(layout: LayoutMode, storage?: Storage): void {
  const target = resolveStorage(storage);
  if (!target) return;

  try {
    target.setItem(LAYOUT_STORAGE_KEY, layout);
  } catch {
    // Silently ignore storage errors in restricted contexts
  }
}

/**
 * Switches between the standard layout and the resources (wide, multi-column) layout.
 */
export function toggleLayout(current: LayoutMode): LayoutMode {
  return current === 'resources' ? 'standard' : 'resources';
}
