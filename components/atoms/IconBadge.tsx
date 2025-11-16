import React, { forwardRef } from 'react'
import { cn } from '@/utils'

/**
 * Props pour le composant IconBadge
 * Composant de badge avec icône intégrée pour les notifications, statuts et labels
 */
export interface IconBadgeProps {
  /** Icône à afficher (peut être ReactNode pour icônes SVG) */
  icon?: React.ReactNode
  /** Texte du badge */
  label: string
  /** Variante du badge */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium'
  /** Taille du badge */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Icône en position de fin */
  trailing?: boolean
  /** Masquer le texte et afficher uniquement l'icône */
  iconOnly?: boolean
  /** État de chargement */
  loading?: boolean
  /** Désactiver les interactions */
  disabled?: boolean
  /** Classes CSS supplémentaires */
  className?: string
  /** Handler de clic */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Fonction appelée quand le tooltip doit être affiché */
  onShowTooltip?: () => void
  /** Fonction appelée quand le tooltip doit être caché */
  onHideTooltip?: () => void
  /** Accessibilité : ID du élément décrit par ce badge */
  'aria-describedby'?: string
  /** Accessibilité : ID du élément étiquetté par ce badge */
  'aria-labelledby'?: string
  /** Accessibilité : rôle ARIA personnalisé */
  role?: string
  /** Accessibilité : statut ARIA */
  'aria-live'?: 'polite' | 'assertive' | 'off'
}

/**
 * Composant IconBadge - Badge avec icône intégrée
 * 
 * Fonctionnalités :
 * - 8 variantes (default, primary, success, warning, error, info, neutral, premium)
 * - 4 tailles (xs, sm, md, lg)
 * - Support icônes ReactNode et SVG
 * - Mode icône uniquement
 * - Loading state
 * - Accessibilité WCAG 2.1 AA complète
 * - Animations fluides
 * - Focus management
 * 
 * @example
 * ```tsx
 * <IconBadge icon="★" label="Premium" variant="premium" size="md" />
 * <IconBadge icon={<StarIcon />} label="Favori" variant="warning" iconOnly />
 * <IconBadge icon="✓" label="Confirmé" variant="success" onClick={handleClick} />
 * ```
 */
export const IconBadge = forwardRef<HTMLButtonElement | HTMLSpanElement, IconBadgeProps>(
  ({
    icon = '★',
    label,
    variant = 'default',
    size = 'md',
    trailing = false,
    iconOnly = false,
    loading = false,
    disabled = false,
    className,
    onClick,
    onShowTooltip,
    onHideTooltip,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
    role = 'status',
    'aria-live': ariaLive = 'off',
    ...props
  }, ref) => {
    // Déterminer si le composant est cliquable
    const isClickable = !!onClick && !disabled && !loading
    
    // Classes CSS pour les états
    const stateClasses = cn({
      'is-clickable': isClickable,
      'is-disabled': disabled,
      'is-loading': loading,
      'icon-only': iconOnly,
      'has-trailing-icon': trailing
    })

    // Classes CSS pour les variantes
    const variantClasses = cn({
      'tb-badge--default': variant === 'default',
      'tb-badge--primary': variant === 'primary',
      'tb-badge--success': variant === 'success',
      'tb-badge--warning': variant === 'warning',
      'tb-badge--error': variant === 'error',
      'tb-badge--info': variant === 'info',
      'tb-badge--neutral': variant === 'neutral',
      'tb-badge--premium': variant === 'premium'
    })

    // Classes CSS pour les tailles
    const sizeClasses = cn({
      'tb-badge--xs': size === 'xs',
      'tb-badge--sm': size === 'sm',
      'tb-badge--md': size === 'md',
      'tb-badge--lg': size === 'lg'
    })

    // Classes finales
    const finalClasses = cn(
      'tb-badge',
      stateClasses,
      variantClasses,
      sizeClasses,
      className
    )

    // Gestionnaires d'événements
    const handleMouseEnter = () => {
      if (onShowTooltip && !disabled && !loading) {
        onShowTooltip()
      }
    }

    const handleMouseLeave = () => {
      if (onHideTooltip && !disabled && !loading) {
        onHideTooltip()
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement | HTMLSpanElement>) => {
      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        onClick?.(event as any)
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event as any)
      }
    }

    // Attributs ARIA
    const ariaAttributes = {
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-live': ariaLive,
      'aria-disabled': disabled || undefined,
      ...(loading && { 'aria-busy': 'true' })
    }

    // Contenu du badge
    const renderContent = () => (
      <>
        <span 
          className="tb-badge__icon" 
          aria-hidden={iconOnly}
          data-testid="badge-icon"
        >
          {loading ? (
            <svg 
              className="tb-badge__spinner" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <circle 
                className="tb-badge__spinner-circle"
                cx="12" 
                cy="12" 
                r="10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          ) : (
            icon
          )}
        </span>
        {!iconOnly && (
          <span 
            className="tb-badge__label" 
            data-testid="badge-label"
          >
            {label}
          </span>
        )}
      </>
    )

    // Rendu du composant
    if (isClickable) {
      // Props compatibles avec button
      const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
        ...ariaAttributes,
        ...props as any
      };

      return (
        <button
          ref={ref as React.RefObject<HTMLButtonElement>}
          className={finalClasses}
          type="button"
          onClick={(e) => handleClick(e as React.MouseEvent<HTMLButtonElement>)}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={disabled || loading}
          role={role}
          {...buttonProps}
        >
          {trailing ? (
            <>
              {renderContent()}
            </>
          ) : (
            <>
              {renderContent()}
            </>
          )}
        </button>
      )
    }

    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={finalClasses}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={role}
        {...ariaAttributes}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {trailing ? (
          <>
            {renderContent()}
          </>
        ) : (
          <>
            {renderContent()}
          </>
        )}
      </span>
    )
  }
)

// Affichage du nom du composant en mode développement
if (process.env['NODE_ENV'] !== 'production') {
  IconBadge.displayName = 'IconBadge'
}

export default IconBadge