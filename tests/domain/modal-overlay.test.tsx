import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  ModalOverlay,
  shouldCloseOnBackdropClick,
  lockBodyScroll,
  unlockBodyScroll,
  getOpenModalsCount,
  resetBodyScrollLockForTesting,
} from '../../src/components/ModalOverlay';

describe('ModalOverlay logic & shouldCloseOnBackdropClick', () => {
  it('should return true when click is on the backdrop and pointer down did not start inside', () => {
    const backdropElement = { id: 'backdrop' };
    const result = shouldCloseOnBackdropClick(backdropElement, backdropElement, false);
    expect(result).toBe(true);
  });

  it('should return false when click target is different from currentTarget (e.g. clicking inside modal content)', () => {
    const backdropElement = { id: 'backdrop' };
    const innerCardElement = { id: 'card' };
    const result = shouldCloseOnBackdropClick(innerCardElement, backdropElement, false);
    expect(result).toBe(false);
  });

  it('should return false when pointer down originated inside the modal (e.g. dragging/selecting text)', () => {
    const backdropElement = { id: 'backdrop' };
    const result = shouldCloseOnBackdropClick(backdropElement, backdropElement, true);
    expect(result).toBe(false);
  });

  it('should return false when target or currentTarget is null or undefined', () => {
    expect(shouldCloseOnBackdropClick(null, { id: 'backdrop' }, false)).toBe(false);
    expect(shouldCloseOnBackdropClick({ id: 'card' }, null, false)).toBe(false);
    expect(shouldCloseOnBackdropClick(null, null, true)).toBe(false);
  });

  it('should render ModalOverlay markup correctly with children and accessibility attributes', () => {
    const onClose = vi.fn();
    const html = renderToString(
      <ModalOverlay onClose={onClose} backdropClassName="bg-black/75" aria-label="Modal de prueba">
        <div data-testid="modal-content">Contenido del Modal</div>
      </ModalOverlay>
    );

    expect(html).toContain('fixed inset-0 bg-black/75 backdrop-blur-sm z-50');
    expect(html).toContain('cursor:pointer');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('aria-label="Modal de prueba"');
    expect(html).toContain('Contenido del Modal');
  });

  it('defaults to bg-black/80 when no backdropClassName is provided', () => {
    const onClose = vi.fn();
    const html = renderToString(
      <ModalOverlay onClose={onClose}>
        <div>Contenido</div>
      </ModalOverlay>
    );

    expect(html).toContain('bg-black/80');
  });

  it('allows custom className to be appended', () => {
    const onClose = vi.fn();
    const html = renderToString(
      <ModalOverlay onClose={onClose} className="custom-overlay-class">
        <div>Contenido</div>
      </ModalOverlay>
    );

    expect(html).toContain('custom-overlay-class');
  });

  describe('Background Scroll Locking', () => {
    let mockBodyStyle: { overflow: string };
    let mockDocElementStyle: { overflow: string };

    beforeEach(() => {
      resetBodyScrollLockForTesting();

      mockBodyStyle = { overflow: 'auto' };
      mockDocElementStyle = { overflow: 'visible' };

      // Ensure mock document environment
      vi.stubGlobal('document', {
        body: { style: mockBodyStyle },
        documentElement: { style: mockDocElementStyle },
      });
    });

    afterEach(() => {
      resetBodyScrollLockForTesting();
      vi.unstubAllGlobals();
    });

    it('locks body and documentElement scroll to hidden on first modal open', () => {
      expect(getOpenModalsCount()).toBe(0);

      lockBodyScroll();

      expect(getOpenModalsCount()).toBe(1);
      expect(mockBodyStyle.overflow).toBe('hidden');
      expect(mockDocElementStyle.overflow).toBe('hidden');
    });

    it('keeps scroll locked when multiple modals are opened (stacked modals)', () => {
      lockBodyScroll(); // First modal
      lockBodyScroll(); // Nested modal

      expect(getOpenModalsCount()).toBe(2);
      expect(mockBodyStyle.overflow).toBe('hidden');
      expect(mockDocElementStyle.overflow).toBe('hidden');

      unlockBodyScroll(); // Close nested modal
      expect(getOpenModalsCount()).toBe(1);
      // Still hidden because 1 modal is still open!
      expect(mockBodyStyle.overflow).toBe('hidden');
      expect(mockDocElementStyle.overflow).toBe('hidden');

      unlockBodyScroll(); // Close first modal
      expect(getOpenModalsCount()).toBe(0);
      // Now restored to original values!
      expect(mockBodyStyle.overflow).toBe('auto');
      expect(mockDocElementStyle.overflow).toBe('visible');
    });

    it('does not decrement below 0 if unlockBodyScroll is called extra times', () => {
      unlockBodyScroll();
      expect(getOpenModalsCount()).toBe(0);
    });
  });
});
