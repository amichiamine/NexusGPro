import React, { useEffect, useCallback, useRef, useState } from 'react';
import { cn, generateId } from '@/utils';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ModalPosition = 'center' | 'top' | 'bottom';

export interface ModalProps {
  /** État ouvert/fermé du modal */
  open: boolean;
  
  /** Callback appelé quand le modal se ferme */
  onClose: () => void;
  
  /** Titre du modal */
  title?: string;
  
  /** Contenu du modal */
  children: React.ReactNode;
  
  /** Taille prédéfinie du modal */
  size?: ModalSize;
  
  /** Position du modal sur l'écran */
  position?: ModalPosition;
  
  /** Indique si l'overlay est visible */
  showOverlay?: boolean;
  
  /** Indique si on peut fermer en cliquant sur l'overlay */
  closeOnOverlay?: boolean;
  
  /** Indique si on peut fermer avec la touche Escape */
  closeOnEscape?: boolean;
  
  /** Indique si le focus est trap dans le modal */
  trapFocus?: boolean;
  
  /** Indique si l'animation est activée */
  animated?: boolean;
  
  /** Indique si le modal est plein écran sur mobile */
  fullScreenMobile?: boolean;
  
  /** Classes CSS supplémentaires pour l'overlay */
  overlayClassName?: string;
  
  /** Classes CSS supplémentaires pour le panel */
  panelClassName?: string;
  
  /** Classes CSS supplémentaires pour le header */
  headerClassName?: string;
  
  /** Classes CSS supplémentaires pour le body */
  bodyClassName?: string;
  
  /** Accessible label pour le modal */
  'aria-label'?: string;
  
  /** Accessible description pour le modal */
  'aria-describedby'?: string;
  
  /** Indice du focus initial (0 = premier élément focusable) */
  initialFocusIndex?: number;
  
  /** Éléments à ignorer pour le focus management */
  ignoreFocusSelectors?: string[];
  
  /** Indique si le modal bloque l'interaction avec le reste de la page */
  blocking?: boolean;
  
  /** z-index personnalisé */
  zIndex?: number;
  
  /** Largeur maximale personnalisée */
  maxWidth?: string | number;
  
  /** Hauteur maximale personnalisée */
  maxHeight?: string | number;
  
  /** Custom render du header */
  header?: React.ReactNode;
  
  /** Custom render du footer */
  footer?: React.ReactNode;
  
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant Modal moderne et accessible
 * 
 * Un modal est une fenêtre superposée qui bloque l'interaction avec le reste de l'application
 * jusqu'à ce qu'elle soit fermée. Il gère automatiquement le focus et les interactions clavier.
 * 
 * @example
 * ```tsx
 * <Modal 
 *   open={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   size="md"
 * >
 *   Êtes-vous sûr de vouloir supprimer cet élément ?
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title = 'Modal',
  children,
  size = 'md',
  position = 'center',
  showOverlay = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  trapFocus = true,
  animated = true,
  fullScreenMobile = true,
  overlayClassName,
  panelClassName,
  headerClassName,
  bodyClassName,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  initialFocusIndex = 0,
  ignoreFocusSelectors = ['[data-ignore-focus="true"]'],
  blocking = true,
  zIndex,
  maxWidth,
  maxHeight,
  header,
  footer,
  className,
  ...props
}) => {
  // Refs pour la gestion du focus
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // État pour l'animation
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Sauvegarde de l'élément actif avant l'ouverture
  useEffect(() => {
    if (open && !isVisible) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      setIsVisible(true);
      
      if (animated) {
        setIsAnimating(true);
        timeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }
    } else if (!open && isVisible) {
      setIsAnimating(true);
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        
        // Restaurer le focus
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      }, 200);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open, animated, isVisible]);
  
  // Gestion des événements clavier
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!open || isAnimating) return;
    
    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          onClose();
        }
        break;
        
      case 'Tab':
        if (trapFocus) {
          event.preventDefault();
          handleFocusTrap(event);
        }
        break;
    }
  }, [open, isAnimating, closeOnEscape, trapFocus, onClose]);
  
  // Gestion du focus trap
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not([data-ignore-focus="true"])'
    );
    
    const elements = Array.from(focusableElements).filter((el) => {
      const element = el as HTMLElement;
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        element.tabIndex >= 0 &&
        !element.hasAttribute('disabled') &&
        !element.hasAttribute('aria-hidden')
      );
    }) as HTMLElement[];
    
    if (elements.length === 0) return;
    
    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab (focus vers l'arrière)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (focus vers l'avant)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);
  
  // Gestion des clics sur l'overlay
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlay) {
      onClose();
    }
  }, [closeOnOverlay, onClose]);
  
  // Ajout des event listeners
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = blocking ? 'hidden' : '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown, blocking]);
  
  // Focus initial
  useEffect(() => {
    if (open && modalRef.current && !isAnimating) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]):not([data-ignore-focus="true"])'
      );
      
      if (focusableElements.length > 0) {
        const element = focusableElements[initialFocusIndex] as HTMLElement;
        element?.focus();
      } else {
        modalRef.current.focus();
      }
    }
  }, [open, isAnimating, initialFocusIndex]);
  
  // Gestion des styles
  const modalStyle: React.CSSProperties = {
    zIndex: zIndex || 9999,
    ...(maxWidth && { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }),
    ...(maxHeight && { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }),
  };
  
  // Classes CSS
  const modalClasses = cn(
    'modal',
    {
      'modal--open': open,
      'modal--visible': isVisible,
      'modal--animating': isAnimating,
      'modal--animated': animated,
      'modal--full-screen-mobile': fullScreenMobile,
      [`modal--${size}`]: true,
      [`modal--${position}`]: true,
    },
    className
  );
  
  const overlayClasses = cn(
    'modal__overlay',
    {
      'modal__overlay--visible': showOverlay,
      'modal__overlay--animated': animated,
    },
    overlayClassName
  );
  
  const panelClasses = cn(
    'modal__panel',
    {
      [`modal__panel--${size}`]: true,
      [`modal__panel--${position}`]: true,
      'modal__panel--animated': animated,
    },
    panelClassName
  );
  
  if (!isVisible) return null;
  
  return (
    <div
      ref={modalRef}
      className={modalClasses}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${generateId()}-title` : undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      style={modalStyle}
      tabIndex={-1}
      {...props}
    >
      {showOverlay && (
        <div
          className={overlayClasses}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      <div className={panelClasses} role="document">
        {(title || header) && (
          <div className={cn('modal__header', headerClassName)}>
            {header || (
              <h2 id={`${generateId()}-title`} className="modal__title">
                {title}
              </h2>
            )}
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Fermer le modal"
              type="button"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className={cn('modal__body', bodyClassName)}>
          {children}
        </div>
        
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Export par défaut
export default Modal;