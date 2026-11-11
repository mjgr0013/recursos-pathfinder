import React, { useRef, useEffect } from 'react';

export interface ModalOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
  backdropClassName?: string;
  className?: string;
  'aria-label'?: string;
}

let openModalsCount = 0;
let originalBodyOverflow: string | null = null;
let originalDocOverflow: string | null = null;

/**
 * Locks background scrolling on document body and documentElement when a modal opens.
 * Tracks reference count to safely handle stacked or nested modals.
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  openModalsCount++;
  if (openModalsCount === 1) {
    originalBodyOverflow = document.body?.style?.overflow ?? '';
    originalDocOverflow = document.documentElement?.style?.overflow ?? '';
    if (document.body?.style) {
      document.body.style.overflow = 'hidden';
    }
    if (document.documentElement?.style) {
      document.documentElement.style.overflow = 'hidden';
    }
  }
}

/**
 * Restores background scrolling when the last open modal closes.
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  openModalsCount = Math.max(0, openModalsCount - 1);
  if (openModalsCount === 0) {
    if (document.body?.style) {
      document.body.style.overflow = originalBodyOverflow !== null ? originalBodyOverflow : '';
    }
    if (document.documentElement?.style) {
      document.documentElement.style.overflow = originalDocOverflow !== null ? originalDocOverflow : '';
    }
    originalBodyOverflow = null;
    originalDocOverflow = null;
  }
}

/**
 * Returns current count of open modals for testing and verification.
 */
export function getOpenModalsCount(): number {
  return openModalsCount;
}

/**
 * Reset scroll lock state (useful between tests).
 */
export function resetBodyScrollLockForTesting(): void {
  openModalsCount = 0;
  originalBodyOverflow = null;
  originalDocOverflow = null;
  if (typeof document !== 'undefined') {
    if (document.body?.style) document.body.style.overflow = '';
    if (document.documentElement?.style) document.documentElement.style.overflow = '';
  }
}

/**
 * Pure evaluation function for backdrop click dismissal.
 * Returns true only if the event target is the backdrop itself and the pointer interaction
 * did not originate from inside the modal content.
 */
export function shouldCloseOnBackdropClick(
  target: unknown,
  currentTarget: unknown,
  isPointerDownInside: boolean
): boolean {
  return target === currentTarget && !isPointerDownInside;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  onClose,
  children,
  backdropClassName = 'bg-black/60 dark:bg-black/80',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const isInsidePointerDown = useRef(false);

  // Disable background scrolling when modal mounts, restore when unmounts
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  // Listen to Escape key globally to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isInsidePointerDown.current = e.target !== e.currentTarget;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isInsidePointerDown.current = e.target !== e.currentTarget;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldCloseOnBackdropClick(e.target, e.currentTarget, isInsidePointerDown.current)) {
      onClose();
    }
    isInsidePointerDown.current = false;
  };

  // Prevent drag-scrolling the backdrop on mobile devices
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  };

  return (
    <div
      role="presentation"
      aria-label={ariaLabel}
      style={{ cursor: 'pointer' }}
      className={`fixed inset-0 ${backdropClassName} backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer overscroll-contain ${className}`}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onTouchMove={handleTouchMove}
    >
      {children}
    </div>
  );
};
