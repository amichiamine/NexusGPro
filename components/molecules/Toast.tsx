/**
 * Toast Component - Système de notifications temporaires moderne
 * @fileoverview Composant de notifications avec positions multiples, stacking automatique, progress bar et accessibilité WCAG 2.1 AA
 * @author MiniMax Agent
 */

import React, { 
  forwardRef, 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useId 
} from 'react';
import './Toast.css';

// Types et interfaces
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' | 'center';

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  position?: ToastPosition;
  duration?: number;
  dismissible?: boolean;
  showProgress?: boolean;
  actions?: ToastAction[];
  icon?: React.ReactNode;
  avatar?: string;
  title?: string;
  description?: string;
  persistent?: boolean;
  onDismiss?: (id: string) => void;
  onAction?: (action: ToastAction, id: string) => void;
}

export interface ToastProps extends Omit<Toast, 'id' | 'onDismiss' | 'onAction'> {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string | number;
  zIndex?: number;
  container?: HTMLElement | null;
  stackDirection?: 'vertical' | 'horizontal';
  stackLimit?: number;
  autoClose?: boolean;
  pauseOnHover?: boolean;
  closeOnClick?: boolean;
  role?: 'alert' | 'status' | 'log';
  'aria-label'?: string;
  testId?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

// Hook pour le contexte des toasts
const ToastContext = React.createContext<ToastContextType | null>(null);

// Hook personnalisé pour la gestion des toasts
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Provider pour le contexte des toasts
export const ToastProvider = ({ children, maxToasts = 5, container }: {
  children: React.ReactNode;
  maxToasts?: number;
  container?: HTMLElement | null;
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const containerRef = useRef(container || document.body);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = (++toastIdRef.current).toString();
    const newToast: Toast = {
      id,
      position: 'top-right',
      duration: 5000,
      dismissible: true,
      showProgress: true,
      persistent: false,
      ...toast,
    };

    setToasts(prev => {
      // Limiter le nombre de toasts et gérer le stacking
      const filteredToasts = prev.filter(t => t.id !== id);
      const finalToasts = [newToast, ...filteredToasts].slice(0, maxToasts);
      return finalToasts;
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearAll,
    updateToast,
  }), [toasts, addToast, removeToast, clearAll, updateToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Composant conteneur pour afficher tous les toasts
const ToastContainer = () => {
  const { toasts } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Grouper les toasts par position
  const groupedToasts = useMemo(() => {
    const groups: Record<ToastPosition, Toast[]> = {
      'top-left': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-right': [],
      'top-center': [],
      'bottom-center': [],
      'center': [],
    };

    toasts.forEach(toast => {
      const position = toast.position || 'top-right';
      groups[position].push(toast);
    });

    return groups;
  }, [toasts]);

  return (
    <div 
      ref={containerRef}
      className="toast-container"
      aria-live="polite"
      aria-label="Notifications"
    >
      {Object.entries(groupedToasts).map(([position, positionToasts]) => 
        positionToasts.length > 0 && (
          <ToastGroup 
            key={position}
            position={position as ToastPosition} 
            toasts={positionToasts}
          />
        )
      )}
    </div>
  );
};

// Composant groupe pour un ensemble de toasts à une position donnée
const ToastGroup = ({ position, toasts }: { position: ToastPosition; toasts: Toast[] }) => {
  return (
    <div 
      className={`toast-group toast-group--${position}`}
      role="group"
      aria-label={`Notifications ${position.replace('-', ' ')}`}
    >
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id}
          toast={toast}
          index={index}
          total={toasts.length}
        />
      ))}
    </div>
  );
};

// Composant Toast individuel
const ToastItem = forwardRef<HTMLDivElement, {
  toast: Toast;
  index: number;
  total: number;
}>(({ toast, index, total }, ref) => {
  const { removeToast, updateToast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  
  const generatedId = useId();
  const toastId = toast.id;

  // Calculer la position dans le stacking
  const stackIndex = total - index;

  // Auto-dismiss logique
  useEffect(() => {
    if (!toast.duration || toast.persistent || isPaused) return;

    const startTime = Date.now();
    const duration = toast.duration;

    intervalRef.current = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);

      if (remaining <= 0) {
        handleDismiss();
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [toast.duration, toast.persistent, isPaused, isVisible]);

  // Gestionnaire de fermeture
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    
    setTimeout(() => {
      setIsVisible(false);
      removeToast(toastId);
      toast.onDismiss?.(toastId);
    }, 300); // Durée de l'animation de sortie
  }, [removeToast, toastId, toast.onDismiss]);

  // Gestionnaire des actions
  const handleAction = useCallback((action: ToastAction) => {
    action.onClick();
    toast.onAction?.(action, toastId);
  }, [toast, toastId]);

  // Gestionnaires des interactions
  const handleMouseEnter = useCallback(() => {
    if (toast.pauseOnHover !== false) {
      setIsPaused(true);
    }
  }, [toast.pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleClick = useCallback(() => {
    if (toast.closeOnClick) {
      handleDismiss();
    }
  }, [toast.closeOnClick, handleDismiss]);

  // Calculer la classe CSS dynamique
  const toastClasses = useMemo(() => [
    'toast-item',
    `toast-item--${toast.type}`,
    `toast-item--${toast.position || 'top-right'}`,
    isExiting ? 'toast-exit' : 'toast-enter',
    !toast.dismissible ? 'toast-non-dismissible' : '',
    toast.showProgress ? 'toast-with-progress' : '',
    toast.persistent ? 'toast-persistent' : '',
    toast.avatar ? 'toast-with-avatar' : '',
    toast.actions && toast.actions.length > 0 ? 'toast-with-actions' : '',
  ].filter(Boolean).join(' '), [toast.type, toast.position, isExiting, toast.dismissible, toast.showProgress, toast.persistent, toast.avatar, toast.actions]);

  // Props d'accessibilité
  const accessibilityProps = {
    role: toast.type === 'error' ? 'alert' : 'status' as const,
    'aria-live': toast.type === 'error' ? 'assertive' : 'polite',
    'aria-label': toast.title || `Notification ${toast.type}`,
    'aria-describedby': `toast-desc-${generatedId}`,
    tabIndex: 0,
  };

  if (!isVisible) return null;

  return (
    <div
      ref={(node) => {
        toastRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={toastClasses}
      style={{
        '--toast-stack-index': stackIndex,
        '--toast-progress': progress,
        zIndex: toast.zIndex || 1000 + stackIndex,
      } as React.CSSProperties}
      {...accessibilityProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-testid={toast.testId || `toast-${toast.type}`}
    >
      {/* Progress Bar */}
      {toast.showProgress && !toast.persistent && (
        <div 
          className="toast-progress"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Temps restant"
        />
      )}

      {/* Contenu du toast */}
      <div className="toast-content">
        {/* Icône/Avatar */}
        <div className="toast-icon">
          {toast.avatar ? (
            <img 
              src={toast.avatar} 
              alt="" 
              className="toast-avatar"
              loading="lazy"
            />
          ) : (
            toast.icon || <ToastIcon type={toast.type} />
          )}
        </div>

        {/* Texte du toast */}
        <div className="toast-text">
          {toast.title && (
            <div className="toast-title" id={`toast-title-${generatedId}`}>
              {toast.title}
            </div>
          )}
          
          {toast.description && (
            <div className="toast-description" id={`toast-desc-${generatedId}`}>
              {toast.description}
            </div>
          )}
          
          {!toast.description && (
            <div className="toast-message">
              {toast.message}
            </div>
          )}
        </div>

        {/* Actions */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="toast-actions">
            {toast.actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                className={`toast-action toast-action--${action.style || 'secondary'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(action);
                }}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Bouton de fermeture */}
        {toast.dismissible && (
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            type="button"
            aria-label="Fermer la notification"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Animation overlay */}
      <div className="toast-overlay" />
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

// Composant icône pour les différents types de toast
const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconProps = {
    width: 20,
    height: 20,
    fill: 'currentColor',
    viewBox: '0 0 24 24' as const,
  };

  switch (type) {
    case 'success':
      return (
        <svg {...iconProps}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    
    case 'error':
      return (
        <svg {...iconProps}>
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
        </svg>
      );
    
    case 'warning':
      return (
        <svg {...iconProps}>
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      );
    
    case 'info':
      return (
        <svg {...iconProps}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      );
    
    case 'loading':
      return (
        <svg {...iconProps} className="toast-loading-icon">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      );
    
    default:
      return null;
  }
};

// Composant Toast principal
const ToastComponent = forwardRef<HTMLDivElement, ToastProps>(({
  id,
  message,
  type = 'info',
  position = 'top-right',
  duration = 5000,
  dismissible = true,
  showProgress = true,
  actions,
  icon,
  avatar,
  title,
  description,
  persistent = false,
  className = '',
  style,
  maxWidth = '400px',
  zIndex = 1000,
  container,
  stackDirection = 'vertical',
  stackLimit = 5,
  autoClose = true,
  pauseOnHover = true,
  closeOnClick = false,
  role = 'status',
  'aria-label': ariaLabel,
  testId,
  ...props
}, ref) => {
  const { addToast } = useToast();
  const [toastId, setToastId] = useState<string>('');

  // Générer un ID si none fourni
  useEffect(() => {
    if (!toastId) {
      const newId = addToast({
        message,
        type,
        position,
        duration,
        dismissible,
        showProgress,
        actions,
        icon,
        avatar,
        title,
        description,
        persistent,
        testId,
      });
      setToastId(newId);
    }
  }, [addToast, message, type, position, duration, dismissible, showProgress, actions, icon, avatar, title, description, persistent, testId, toastId]);

  // Auto-fermeture si demandé
  useEffect(() => {
    if (autoClose && duration && !persistent) {
      const timer = setTimeout(() => {
        // Cette logique sera gérée par le ToastItem
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, persistent]);

  return (
    <div
      ref={ref}
      className={`toast-standalone ${className}`}
      style={{
        maxWidth,
        zIndex,
        ...style,
      }}
      role={role}
      aria-label={ariaLabel || title || message}
      data-testid={testId}
      {...props}
    >
      {/* Ce composant ne rend rien directement - il utilise le système de contexte */}
    </div>
  );
});

ToastComponent.displayName = 'Toast';

// Composants utility pour des cas d'usage courants
export const ToastSuccess = (props: Omit<ToastProps, 'type'>) => (
  <ToastComponent {...props} type="success" />
);

export const ToastError = (props: Omit<ToastProps, 'type'>) => (
  <ToastComponent {...props} type="error" />
);

export const ToastWarning = (props: Omit<ToastProps, 'type'>) => (
  <ToastComponent {...props} type="warning" />
);

export const ToastInfo = (props: Omit<ToastProps, 'type'>) => (
  <ToastComponent {...props} type="info" />
);

export const ToastLoading = (props: Omit<ToastProps, 'type'>) => (
  <ToastComponent {...props} type="loading" />
);

export default ToastComponent;
