/**
 * Tooltip Component - Système d'informations contextuelles moderne
 * @fileoverview Composant tooltip avec positions multiples, flip automatique, animations et accessibilité WCAG 2.1 AA
 * @author MiniMax Agent
 */

import React, { 
  forwardRef, 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  useId 
} from 'react';
import './Tooltip.css';

// Types et interfaces
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
export type TooltipVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'dark' | 'light';
export type TooltipSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface TooltipProps {
  children: React.ReactNode;
  label: string;
  description?: string;
  placement?: TooltipPlacement;
  variant?: TooltipVariant;
  size?: TooltipSize;
  disabled?: boolean;
  delay?: number;
  distance?: number;
  arrow?: boolean;
  clickable?: boolean;
  followCursor?: boolean;
  flip?: boolean;
  autoPlacement?: boolean;
  offsetSkidding?: number;
  offsetDistance?: number;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  maxWidth?: string | number;
  truncate?: boolean;
  multiline?: boolean;
  delayShow?: number;
  delayHide?: number;
  onShow?: () => void;
  onHide?: () => void;
  onToggle?: (isVisible: boolean) => void;
  'aria-label'?: string;
  'data-testid'?: string;
  id?: string;
}

// Interface pour les positions calculées
interface PositionData {
  x: number;
  y: number;
  placement: TooltipPlacement;
  arrowX?: number;
  arrowY?: number;
}

// Hook personnalisé pour la gestion du tooltip
const useTooltip = ({
  triggerRef,
  contentRef,
  isVisible,
  setIsVisible,
  placement,
  distance,
  flip,
  offsetSkidding,
  offsetDistance,
  followCursor,
  delayShow = 100,
  delayHide = 100,
  onShow,
  onHide,
  onToggle
}: {
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  placement: TooltipPlacement;
  distance: number;
  flip: boolean;
  offsetSkidding: number;
  offsetDistance: number;
  followCursor: boolean;
  delayShow?: number;
  delayHide?: number;
  onShow?: () => void;
  onHide?: () => void;
  onToggle?: (isVisible: boolean) => void;
}) => {
  const [position, setPosition] = useState<PositionData | null>(null);
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculer la position du tooltip
  const calculatePosition = useCallback((triggerRect: DOMRect, contentRect: DOMRect): PositionData => {
    const placements = flip ? [placement, 'top', 'bottom', 'left', 'right'] : [placement];
    
    for (const currentPlacement of placements) {
      let x = 0;
      let y = 0;
      let arrowX = 0;
      let arrowY = 0;

      switch (currentPlacement) {
        case 'top':
          x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + offsetSkidding;
          y = triggerRect.top - contentRect.height - distance;
          arrowX = triggerRect.left + (triggerRect.width / 2) - 8;
          arrowY = triggerRect.top - 8;
          break;
        
        case 'bottom':
          x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + offsetSkidding;
          y = triggerRect.bottom + distance;
          arrowX = triggerRect.left + (triggerRect.width / 2) - 8;
          arrowY = triggerRect.bottom + distance;
          break;
        
        case 'left':
          x = triggerRect.left - contentRect.width - distance;
          y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + offsetSkidding;
          arrowX = triggerRect.left - 8;
          arrowY = triggerRect.top + (triggerRect.height / 2) - 8;
          break;
        
        case 'right':
          x = triggerRect.right + distance;
          y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + offsetSkidding;
          arrowX = triggerRect.right + distance;
          arrowY = triggerRect.top + (triggerRect.height / 2) - 8;
          break;
        
        case 'top-start':
          x = triggerRect.left + offsetSkidding;
          y = triggerRect.top - contentRect.height - distance;
          arrowX = triggerRect.left + 16 + offsetSkidding;
          arrowY = triggerRect.top - 8;
          break;
        
        case 'top-end':
          x = triggerRect.right - contentRect.width + offsetSkidding;
          y = triggerRect.top - contentRect.height - distance;
          arrowX = triggerRect.right - 16 + offsetSkidding;
          arrowY = triggerRect.top - 8;
          break;
        
        case 'bottom-start':
          x = triggerRect.left + offsetSkidding;
          y = triggerRect.bottom + distance;
          arrowX = triggerRect.left + 16 + offsetSkidding;
          arrowY = triggerRect.bottom + distance;
          break;
        
        case 'bottom-end':
          x = triggerRect.right - contentRect.width + offsetSkidding;
          y = triggerRect.bottom + distance;
          arrowX = triggerRect.right - 16 + offsetSkidding;
          arrowY = triggerRect.bottom + distance;
          break;
        
        case 'left-start':
          x = triggerRect.left - contentRect.width - distance;
          y = triggerRect.top + offsetSkidding;
          arrowX = triggerRect.left - 8;
          arrowY = triggerRect.top + 16 + offsetSkidding;
          break;
        
        case 'left-end':
          x = triggerRect.left - contentRect.width - distance;
          y = triggerRect.bottom - contentRect.height + offsetSkidding;
          arrowX = triggerRect.left - 8;
          arrowY = triggerRect.bottom - 16 + offsetSkidding;
          break;
        
        case 'right-start':
          x = triggerRect.right + distance;
          y = triggerRect.top + offsetSkidding;
          arrowX = triggerRect.right + distance;
          arrowY = triggerRect.top + 16 + offsetSkidding;
          break;
        
        case 'right-end':
          x = triggerRect.right + distance;
          y = triggerRect.bottom - contentRect.height + offsetSkidding;
          arrowX = triggerRect.right + distance;
          arrowY = triggerRect.bottom - 16 + offsetSkidding;
          break;
      }

      // Vérifier si le tooltip reste dans les limites de la fenêtre
      const isInBounds = 
        x >= 0 && 
        x + contentRect.width <= window.innerWidth &&
        y >= 0 && 
        y + contentRect.height <= window.innerHeight;

      if (isInBounds || placements.length === 1) {
        return {
          x,
          y,
          placement: currentPlacement,
          arrowX,
          arrowY
        };
      }
    }

    // Fallback : utiliser la position originale même si elle déborde
    const x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + offsetSkidding;
    const y = triggerRect.top - contentRect.height - distance;
    const arrowX = triggerRect.left + (triggerRect.width / 2) - 8;
    const arrowY = triggerRect.top - 8;

    return { x, y, placement, arrowX, arrowY };
  }, [placement, distance, offsetSkidding, flip]);

  // Mettre à jour la position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    const newPosition = calculatePosition(triggerRect, contentRect);
    setPosition(newPosition);
    setActualPlacement(newPosition.placement);
  }, [triggerRef, contentRef, calculatePosition]);

  // Gestionnaires d'événements
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = setTimeout(() => {
      setIsVisible(true);
      onShow?.();
      onToggle?.(true);
      
      // Mettre à jour la position après l'affichage
      setTimeout(updatePosition, 0);
    }, delayShow);
  }, [setIsVisible, delayShow, onShow, onToggle, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      onHide?.();
      onToggle?.(false);
    }, delayHide);
  }, [setIsVisible, delayHide, onHide, onToggle]);

  const handleClick = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
    }
    
    setIsVisible(!isVisible);
    const newState = !isVisible;
    onToggle?.(newState);
    onShow?.();
    onHide?.();

    if (newState) {
      setTimeout(updatePosition, 0);
    }
  }, [isVisible, setIsVisible, onShow, onHide, onToggle, updatePosition]);

  // Gestion du suivi de souris
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (followCursor) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (isVisible && triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        let x = e.clientX + offsetDistance;
        let y = e.clientY + offsetDistance;
        let arrowX = e.clientX + offsetDistance;
        let arrowY = e.clientY + offsetDistance;

        // Ajuster selon la position
        switch (placement) {
          case 'top':
            y = e.clientY - contentRect.height - distance;
            arrowY = e.clientY - distance;
            break;
          case 'bottom':
            y = e.clientY + distance;
            arrowY = e.clientY + distance;
            break;
          case 'left':
            x = e.clientX - contentRect.width - distance;
            arrowX = e.clientX - distance;
            break;
          case 'right':
            x = e.clientX + distance;
            arrowX = e.clientX + distance;
            break;
        }

        setPosition({
          x: Math.max(0, Math.min(x, window.innerWidth - contentRect.width)),
          y: Math.max(0, Math.min(y, window.innerHeight - contentRect.height)),
          placement,
          arrowX,
          arrowY
        });
      }
    }
  }, [followCursor, isVisible, placement, distance, offsetDistance, triggerRef, contentRef]);

  // Effets
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  // Écouter les événements de fenêtre
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, updatePosition]);

  // Nettoyage des timers
  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return {
    position,
    actualPlacement,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleMouseMove,
    updatePosition
  };
};

// Composant Tooltip principal
const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(({
  children,
  label,
  description,
  placement = 'top',
  variant = 'default',
  size = 'md',
  disabled = false,
  delay = 100,
  distance = 8,
  arrow = true,
  clickable = false,
  followCursor = false,
  flip = true,
  autoPlacement = false,
  offsetSkidding = 0,
  offsetDistance = 0,
  className = '',
  style,
  zIndex = 1000,
  maxWidth = '200px',
  truncate = false,
  multiline = false,
  delayShow,
  delayHide,
  onShow,
  onHide,
  onToggle,
  'aria-label': ariaLabel,
  'data-testid': testId,
  id,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const tooltipId = id || `tooltip-${generatedId}`;

  // Utiliser le delay global si delayShow/delayHide ne sont pas spécifiés
  const actualDelayShow = delayShow !== undefined ? delayShow : delay;
  const actualDelayHide = delayHide !== undefined ? delayHide : delay;

  // Hook de gestion du tooltip
  const {
    position,
    actualPlacement,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleMouseMove
  } = useTooltip({
    triggerRef,
    contentRef,
    isVisible,
    setIsVisible,
    placement,
    distance,
    flip,
    offsetSkidding,
    offsetDistance,
    followCursor,
    delayShow: actualDelayShow,
    delayHide: actualDelayHide,
    onShow,
    onHide,
    onToggle
  });

  // Props d'accessibilité pour le trigger
  const triggerProps = {
    ref: triggerRef,
    'aria-describedby': isVisible ? tooltipId : undefined,
    'aria-expanded': isVisible,
    'aria-controls': tooltipId,
    ...(!disabled && {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleMouseEnter,
      onBlur: handleMouseLeave,
      ...(clickable && { onClick: handleClick }),
      ...(followCursor && { onMouseMove: handleMouseMove }),
      tabIndex: disabled ? -1 : 0
    }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    className: `tooltip-trigger ${disabled ? 'tooltip-disabled' : ''}`,
    'data-testid': testId ? `${testId}-trigger` : undefined
  };

  // Props d'accessibilité pour le contenu
  const contentProps = {
    ref: contentRef,
    id: tooltipId,
    role: 'tooltip',
    'aria-hidden': !isVisible,
    style: {
      position: 'fixed',
      left: position?.x,
      top: position?.y,
      zIndex,
      maxWidth,
      ...style
    }
  };

  // Calculer les classes CSS
  const tooltipClasses = useMemo(() => [
    'tooltip',
    `tooltip--${variant}`,
    `tooltip--${size}`,
    `tooltip--${actualPlacement}`,
    isVisible ? 'tooltip-visible' : 'tooltip-hidden',
    arrow ? 'tooltip-with-arrow' : 'tooltip-no-arrow',
    clickable ? 'tooltip-clickable' : '',
    followCursor ? 'tooltip-follow-cursor' : '',
    disabled ? 'tooltip-disabled' : '',
    truncate ? 'tooltip-truncate' : '',
    multiline ? 'tooltip-multiline' : '',
    className
  ].filter(Boolean).join(' '), [variant, size, actualPlacement, isVisible, arrow, clickable, followCursor, disabled, truncate, multiline, className]);

  if (disabled) {
    // Rendre seulement les enfants si disabled
    return (
      <span 
        {...props}
        className="tooltip-disabled-wrapper"
        data-testid={testId}
        ref={ref}
      >
        {children}
      </span>
    );
  }

  return (
    <span {...props} {...triggerProps} ref={ref}>
      {children}
      
      {isVisible && position && (
        <div {...contentProps} className={tooltipClasses}>
          <div className="tooltip-content">
            <div className="tooltip-label">{label}</div>
            {description && (
              <div className="tooltip-description">{description}</div>
            )}
          </div>
          
          {arrow && (
            <div 
              className={`tooltip-arrow tooltip-arrow--${actualPlacement}`}
              style={{
                ...(actualPlacement.includes('top') && { left: position.arrowX }),
                ...(actualPlacement.includes('bottom') && { left: position.arrowX }),
                ...(actualPlacement.includes('left') && { top: position.arrowY }),
                ...(actualPlacement.includes('right') && { top: position.arrowY })
              }}
            />
          )}
        </div>
      )}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';

// Composants utility pour des cas d'usage courants
export const TooltipPrimary = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="primary" />
);

export const TooltipSuccess = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="success" />
);

export const TooltipWarning = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="warning" />
);

export const TooltipError = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="error" />
);

export const TooltipInfo = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="info" />
);

export const TooltipDark = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="dark" />
);

export const TooltipLight = (props: Omit<TooltipProps, 'variant'>) => (
  <Tooltip {...props} variant="light" />
);

export default Tooltip;
