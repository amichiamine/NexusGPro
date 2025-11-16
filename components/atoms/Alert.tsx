import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'role'> {
  /**
   * Variante de l'alerte (détermine le style visuel)
   */
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'

  /**
   * Taille de l'alerte
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Style d'affichage
   */
  displayStyle?: 'filled' | 'outlined' | 'ghost' | 'subtle'

  /**
   * Icône à afficher à gauche
   */
  icon?: React.ReactNode

  /**
   * Indique si l'alerte doit avoir une icône d'action (fermer)
   */
  dismissible?: boolean

  /**
   * Titre de l'alerte
   */
  title?: string

  /**
   * Message principal de l'alerte
   */
  message?: string

  /**
   * Contenu additionnel ou actions
   */
  children?: React.ReactNode

  /**
   * Callback appelé quand l'alerte est fermée
   */
  onDismiss?: () => void

  /**
   * Indique si l'alerte doit être affichée en mode plein écran
   */
  fullWidth?: boolean

  /**
   * Indique si l'alerte doit avoir des coins arrondis
   */
  rounded?: boolean

  /**
   * Indique si l'alerte doit avoir une ombre
   */
  elevated?: boolean

  /**
   * Animation d'apparition
   */
  animated?: boolean

  /**
   * Position des icônes (gauche, droite, les deux)
   */
  iconPosition?: 'left' | 'right' | 'both'

  /**
   * Indique si l'alerte doit prendre toute la largeur disponible
   */
  maxWidth?: string | number

  /**
   * Couleur personnalisée (override de variant)
   */
  customColor?: string

  /**
   * Direction du contenu (pour RTL)
   */
  direction?: 'ltr' | 'rtl'

  /**
   * Props de l'élément icon principal
   */
  iconProps?: {
    /**
     * Classe CSS personnalisée pour l'icône
     */
    className?: string

    /**
     * Taille de l'icône
     */
    size?: number
  }

  /**
   * Props de l'élément content
   */
  contentProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props de l'élément actions
   */
  actionsProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Classe CSS personnalisée
   */
  className?: string

  /**
   * Attribut ARIA role
   */
  role?: string
}

/**
 * Composant Alert moderne et accessible
 * Supporte les variantes colorées, états dismissible, animations
 * Compatible avec les icônes et actions personnalisées
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      size = 'md',
      displayStyle = 'filled',
      icon,
      dismissible = false,
      title,
      message,
      children,
      onDismiss,
      fullWidth = true,
      rounded = true,
      elevated = false,
      animated = true,
      iconPosition = 'left',
      maxWidth,
      customColor,
      direction,
      iconProps,
      contentProps,
      actionsProps,
      className,
      role = 'alert',
      ...props
    },
    ref
  ) => {
    // Classes CSS principales
    const alertClasses = cn(
      'ng-alert',
      `ng-alert--${variant}`,
      `ng-alert--${size}`,
      `ng-alert--${displayStyle}`,
      {
        'ng-alert--dismissible': dismissible,
        'ng-alert--rounded': rounded,
        'ng-alert--elevated': elevated,
        'ng-alert--animated': animated,
        'ng-alert--full-width': fullWidth,
        'ng-alert--icon-left': iconPosition === 'left',
        'ng-alert--icon-right': iconPosition === 'right',
        'ng-alert--icon-both': iconPosition === 'both',
        'ng-alert--with-title': !!title,
        'ng-alert--with-message': !!message,
        'ng-alert--with-actions': dismissible,
      },
      className
    )

    // Style personnalisé
    const alertStyle = {
      ...(maxWidth && { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }),
      ...(customColor && { borderColor: customColor }),
    }

    // Icônes par défaut selon la variante
    const defaultIcons = {
      info: (
        <svg className="ng-alert__icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="ng-alert__icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="ng-alert__icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      error: (
        <svg className="ng-alert__icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      neutral: (
        <svg className="ng-alert__icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }

    const Icon = icon || defaultIcons[variant]
    const iconClassName = cn('ng-alert__icon', iconProps?.className)

    return (
      <div
        ref={ref}
        className={alertClasses}
        role={role}
        style={alertStyle}
        dir={direction}
        {...props}
      >
        {/* Icône de gauche */}
        {(iconPosition === 'left' || iconPosition === 'both') && (
          <div className="ng-alert__icon-left">
            <div className={iconClassName} style={{ width: iconProps?.size, height: iconProps?.size }}>
              {Icon}
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="ng-alert__content" {...contentProps}>
          {(title || message || children) && (
            <div className="ng-alert__content-wrapper">
              {title && (
                <h3 className="ng-alert__title">
                  {title}
                </h3>
              )}
              
              {message && (
                <p className="ng-alert__message">
                  {message}
                </p>
              )}
              
              {children}
            </div>
          )}
        </div>

        {/* Icône de droite (dismiss) */}
        {dismissible && (
          <div className="ng-alert__icon-right">
            <button
              type="button"
              className="ng-alert__dismiss"
              onClick={onDismiss}
              aria-label="Fermer l'alerte"
            >
              <svg className="ng-alert__dismiss-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

// Alert avec actions (enfants)
export interface AlertWithActionsProps extends AlertProps {
  actions?: React.ReactNode
}

export const AlertWithActions = forwardRef<HTMLDivElement, AlertWithActionsProps>(
  ({ actions, actionsProps, ...props }, ref) => {
    return (
      <Alert
        ref={ref}
        {...props}
        dismissible={false}
        iconPosition="left"
      >
        <div className="ng-alert__actions" {...actionsProps}>
          {actions}
        </div>
      </Alert>
    )
  }
)

AlertWithActions.displayName = 'AlertWithActions'

// Alert avec liste d'erreurs
export interface AlertErrorListProps extends Omit<AlertProps, 'variant' | 'message'> {
  errors: string[]
  title?: string
}

export const AlertErrorList = forwardRef<HTMLDivElement, AlertErrorListProps>(
  ({ errors, title = 'Veuillez corriger les erreurs suivantes :', ...props }, ref) => {
    return (
      <Alert
        ref={ref}
        variant="error"
        title={title}
        iconPosition="left"
        {...props}
      >
        <ul className="ng-alert__error-list">
          {errors.map((error, index) => (
            <li key={index} className="ng-alert__error-item">
              {error}
            </li>
          ))}
        </ul>
      </Alert>
    )
  }
)

AlertErrorList.displayName = 'AlertErrorList'

// Alert de notification avec timeout
export interface AlertNotificationProps extends Omit<AlertProps, 'onDismiss'> {
  duration?: number
  onTimeout?: () => void
  onDismiss?: () => void
}

export const AlertNotification = forwardRef<HTMLDivElement, AlertNotificationProps>(
  ({ duration = 5000, onTimeout, onDismiss, ...props }, ref) => {
    React.useEffect(() => {
      if (duration && onTimeout) {
        const timer = setTimeout(() => {
          onTimeout()
        }, duration)

        return () => clearTimeout(timer)
      }
      return undefined
    }, [duration, onTimeout])

    const handleDismiss = () => {
      if (onDismiss) onDismiss()
      if (onTimeout) onTimeout()
    }

    return (
      <Alert
        ref={ref}
        dismissible={true}
        onDismiss={handleDismiss}
        animated={true}
        elevated={true}
        {...props}
      />
    )
  }
)

AlertNotification.displayName = 'AlertNotification'

export default Alert