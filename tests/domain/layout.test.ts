import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredLayout,
  saveLayout,
  toggleLayout,
  LAYOUT_STORAGE_KEY,
  DEFAULT_LAYOUT,
} from '../../src/domain/layout';

describe('domain/layout', () => {
  let store: Record<string, string>;
  let storage: Storage;

  beforeEach(() => {
    store = {};
    storage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      length: 0,
    };
  });

  it('defaults to the standard layout when nothing is stored', () => {
    expect(DEFAULT_LAYOUT).toBe('standard');
    expect(getStoredLayout(storage)).toBe('standard');
  });

  it('persists and reloads the resources layout', () => {
    saveLayout('resources', storage);
    expect(store[LAYOUT_STORAGE_KEY]).toBe('resources');
    expect(getStoredLayout(storage)).toBe('resources');
  });

  it('falls back to default on invalid stored values', () => {
    store[LAYOUT_STORAGE_KEY] = 'grid-9000';
    expect(getStoredLayout(storage)).toBe('standard');
  });

  it('falls back to default and does not throw when storage fails', () => {
    const broken = {
      ...storage,
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    } as Storage;
    expect(getStoredLayout(broken)).toBe('standard');
    expect(() => saveLayout('resources', broken)).not.toThrow();
  });

  it('toggles between standard and resources', () => {
    expect(toggleLayout('standard')).toBe('resources');
    expect(toggleLayout('resources')).toBe('standard');
  });
});
