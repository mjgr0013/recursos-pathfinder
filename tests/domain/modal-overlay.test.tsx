import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ModalOverlay, shouldCloseOnBackdropClick } from '../../src/components/ModalOverlay';

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
});
