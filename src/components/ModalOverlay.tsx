import React, { useRef } from 'react';

export interface ModalOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
  backdropClassName?: string;
  className?: string;
  'aria-label'?: string;
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
  backdropClassName = 'bg-black/80',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const isInsidePointerDown = useRef(false);

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

  return (
    <div
      role="presentation"
      aria-label={ariaLabel}
      style={{ cursor: 'pointer' }}
      className={`fixed inset-0 ${backdropClassName} backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer ${className}`}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
