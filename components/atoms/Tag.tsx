import React, { forwardRef } from 'react'
import { cx } from '../../utils'

/**
 * Props pour le composant Tag
 * Label léger pour catégorisation, filtrage et identification
 */
export interface TagProps {
  /** Contenu du tag (texte) */
  text: string
  /** Variante du tag */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium' | 'accent'
  /** Taille du tag */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Forme du tag */
  shape?: 'rounded' | 'pill' | 'square'
  /** État filled (plein) ou outline (contour) */
  filled?: boolean
  /** État closable avec icône de suppression */
  closable?: boolean
  /** Handler de clic pour fermeture */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Désactiver les interactions */
  disabled?: boolean
  /** Sélectionnable (pour groupes de tags) */
  selectable?: boolean
  /** État sélectionné */
  selected?: boolean
  /** Handler de sélection */
  onSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** État d{Highlight pour attirer l'attention */
  highlighted?: boolean
  /** Icône avant le texte */
  icon?: React.ReactNode
  /** Icône après le texte (avant close) */
  trailingIcon?: React.ReactNode
  /** Classes CSS supplémentaires */
  className?: string
  /** Handler de clic sur le tag */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => void
  /** URL pour tag cliquable (navigation) */
  href?: string
  /** Accessibilité : ID du élément décrit par ce tag */
  'aria-describedby'?: string
  /** Accessibilité : ID du élément étiquetté par ce tag */
  'aria-labelledby'?: string
  /** Accessibilité : rôle ARIA personnalisé */
  role?: string
  /** Accessibilité : statut de sélection */
  'aria-selected'?: boolean
}

/**
 * Composant Tag - Label léger pour catégorisation
 * 
 * Fonctionnalités :
 * - 9 variantes (default, primary, success, warning, error, info, neutral, premium, accent)
 * - 4 tailles (xs, sm, md, lg)
 * - 3 formes (rounded, pill, square)
 * - États filled/outline
 * - Mode closable avec onClose
 * - Mode selectable avec onSelect
 * - Support icônes (lead/trailing)
 * - Mode cliquable avec href ou onClick
 * - État highlighted
 * - Accessibilité WCAG 2.1 AA complète
 * - Animations fluides
 * 
 * @example
 * ```tsx
 * <Tag text="React" variant="primary" size="sm" />
 * <Tag text="Urgent" variant="warning" closable onClose={handleClose} />
 * <Tag text="TypeScript" icon={<Icon />} selectable selected onSelect={handleSelect} />
 * ```
 */
export const Tag = forwardRef<HTMLButtonElement | HTMLSpanElement, TagProps>(
  ({
    text,
    variant = 'default',
    size = 'md',
    shape = 'rounded',
    filled = true,
    closable = false,
    onClose,
    disabled = false,
    selectable = false,
    selected = false,
    onSelect,
    highlighted = false,
    icon,
    trailingIcon,
    className,
    onClick,
    href,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
    role = 'status',
    'aria-selected': ariaSelected,
    ...props
  }, ref) => {
    // Déterminer si le tag est cliquable
    const isClickable = !!onClick || !!href
    const isInteractive = isClickable || selectable || closable

    // Classes CSS pour les états
    const stateClasses = cx({
      'is-disabled': disabled,
      'is-highlighted': highlighted,
      'is-selected': selected,
      'is-clickable': isClickable,
      'is-selectable': selectable,
      'is-closable': closable,
      'has-icon': !!icon,
      'has-trailing-icon': !!trailingIcon,
      'filled': filled,
      'outline': !filled
    })

    // Classes CSS pour les variantes
    const variantClasses = cx({
      'tb-tag--default': variant === 'default',
      'tb-tag--primary': variant === 'primary',
      'tb-tag--success': variant === 'success',
      'tb-tag--warning': variant === 'warning',
      'tb-tag--error': variant === 'error',
      'tb-tag--info': variant === 'info',
      'tb-tag--neutral': variant === 'neutral',
      'tb-tag--premium': variant === 'premium',
      'tb-tag--accent': variant === 'accent'
    })

    // Classes CSS pour les tailles
    const sizeClasses = cx({
      'tb-tag--xs': size === 'xs',
      'tb-tag--sm': size === 'sm',
      'tb-tag--md': size === 'md',
      'tb-tag--lg': size === 'lg'
    })

    // Classes CSS pour les formes
    const shapeClasses = cx({
      'tb-tag--rounded': shape === 'rounded',
      'tb-tag--pill': shape === 'pill',
      'tb-tag--square': shape === 'square'
    })

    // Classes finales
    const finalClasses = cx(
      'tb-tag',
      stateClasses,
      variantClasses,
      sizeClasses,
      shapeClasses,
      className
    )

    // Gestionnaires d'événements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
      if (!disabled && onClick) {
        onClick(event)
      }
    }

    const handleSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && selectable && onSelect) {
        onSelect(event)
      }
    }

    const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && closable && onClose) {
        event.stopPropagation()
        onClose(event)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement | HTMLSpanElement>) => {
      if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        
        if (onClick) {
          onClick(event as any)
        } else if (selectable && onSelect) {
          onSelect(event as any)
        }
      }
    }

    // Attributs ARIA
    const ariaAttributes = {
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-disabled': disabled ? 'true' : undefined,
      ...(selectable && { 'aria-selected': selected ? 'true' : 'false' }),
      ...(ariaSelected !== undefined && { 'aria-selected': ariaSelected })
    }

    // Contenu du tag
    const renderContent = () => (
      <>
        {icon && (
          <span 
            className="tb-tag__icon tb-tag__icon--leading"
            aria-hidden={true}
            data-testid="tag-icon-leading"
          >
            {icon}
          </span>
        )}
        
        <span 
          className="tb-tag__text"
          data-testid="tag-text"
        >
          {text}
        </span>
        
        {trailingIcon && (
          <span 
            className="tb-tag__icon tb-tag__icon--trailing"
            aria-hidden={true}
            data-testid="tag-icon-trailing"
          >
            {trailingIcon}
          </span>
        )}
        
        {closable && (
          <button
            type="button"
            className="tb-tag__close"
            onClick={handleClose}
            disabled={disabled}
            aria-label={`Supprimer ${text}`}
            data-testid="tag-close"
          >
            <svg 
              className="tb-tag__close-icon" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path 
                d="M6 6L18 18M18 6L6 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </>
    )

    // Rendu du composant
    if (href) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          className={finalClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role={role}
          {...ariaAttributes}
          {...props}
        >
          {renderContent()}
        </a>
      )
    }

    if (isClickable || selectable) {
      return (
        <button
          ref={ref as React.RefObject<HTMLButtonElement>}
          type="button"
          className={finalClasses}
          onClick={handleClick || handleSelect}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          role={selectable ? 'option' : role}
          {...ariaAttributes}
          {...props}
        >
          {renderContent()}
        </button>
      )
    }

    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={finalClasses}
        onKeyDown={handleKeyDown}
        role={role}
        {...ariaAttributes}
        {...props}
      >
        {renderContent()}
      </span>
    )
  }
)

// Affichage du nom du composant en mode développement
if (process.env.NODE_ENV !== 'production') {
  Tag.displayName = 'Tag'
}

export default Tag