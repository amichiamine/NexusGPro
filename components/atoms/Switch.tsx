import React, { forwardRef, useId } from 'react'
import { cx } from '../../utils'

/**
 * Props pour le composant Switch
 * Toggle interactif avec état on/off pour activation/désactivation de fonctionnalités
 */
export interface SwitchProps {
  /** État checked/unchecked du switch */
  checked?: boolean
  /** Gestionnaire de changement d'état */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
  /** Label du switch */
  label?: string
  /** Description additionnelle sous le label */
  description?: string
  /** Variante du switch */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'neutral'
  /** Taille du switch */
  size?: 'sm' | 'md' | 'lg'
  /** État disabled */
  disabled?: boolean
  /** State loading */
  loading?: boolean
  /** ID personnalisé pour le switch */
  id?: string
  /** Classes CSS supplémentaires */
  className?: string
  /** Nom du formulaire (pour intégration formulaire) */
  name?: string
  /** Valeur du formulaire */
  value?: string | number
  /** Accessibilité : ID de l'élément qui décrit ce switch */
  'aria-describedby'?: string
  /** Accessibilité : ID de l'élément qui étiquetté ce switch */
  'aria-labelledby'?: string
  /** Placeholder pour les tests */
  'data-testid'?: string
}

/**
 * Composant Switch - Toggle interactif
 * 
 * Fonctionnalités :
 * - 5 variantes (default, primary, success, warning, neutral)
 * - 3 tailles (sm, md, lg)
 * - État disabled et loading
 * - Accessibilité WCAG 2.1 AA complète
 * - Animation fluide avec thumb track
 * - Support des formulaires (name, value)
 * - Integration screen readers
 * - Focus management complet
 * 
 * @example
 * ```tsx
 * <Switch checked={isEnabled} onChange={setIsEnabled} label="Notifications" />
 * <Switch variant="primary" size="lg" label="Mode sombre" />
 * <Switch disabled loading label="Configuration en cours" />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({
    checked = false,
    onChange,
    label = 'Toggle',
    description,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    id,
    className,
    name,
    value,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
    'data-testid': testId,
    ...props
  }, ref) => {
    // Génération d'un ID unique si pas fourni
    const generatedId = useId()
    const switchId = id || `switch-${generatedId}`
    
    // Classes CSS pour les états
    const stateClasses = cx({
      'is-disabled': disabled,
      'is-loading': loading,
      'is-checked': checked
    })

    // Classes CSS pour les variantes
    const variantClasses = cx({
      'tb-switch--default': variant === 'default',
      'tb-switch--primary': variant === 'primary',
      'tb-switch--success': variant === 'success',
      'tb-switch--warning': variant === 'warning',
      'tb-switch--neutral': variant === 'neutral'
    })

    // Classes CSS pour les tailles
    const sizeClasses = cx({
      'tb-switch--sm': size === 'sm',
      'tb-switch--md': size === 'md',
      'tb-switch--lg': size === 'lg'
    })

    // Classes finales
    const finalClasses = cx(
      'tb-switch',
      stateClasses,
      variantClasses,
      sizeClasses,
      className
    )

    // Gestionnaire de changement
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && !loading) {
        onChange?.(event.target.checked, event)
      }
    }

    // Attributs ARIA
    const ariaAttributes = {
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-disabled': disabled || loading ? 'true' : undefined,
      'aria-invalid': props['aria-invalid'] || undefined,
      ...(loading && { 'aria-busy': 'true' })
    }

    // Rendu du contenu de texte
    const renderTextContent = () => (
      <span className="tb-switch__text">
        <span 
          className="tb-switch__label" 
          data-testid={testId ? `${testId}-label` : 'switch-label'}
          id={switchId}
        >
          {label}
        </span>
        {description && (
          <span 
            className="tb-switch__description"
            data-testid={testId ? `${testId}-description` : 'switch-description'}
            id={switchId}
          >
            {description}
          </span>
        )}
      </span>
    )

    // Attributs du input
    const inputProps = {
      id: switchId,
      ref,
      type: 'checkbox',
      checked,
      disabled: disabled || loading,
      name,
      value,
      onChange: handleChange,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      'aria-disabled': disabled || loading ? 'true' : undefined,
      ...ariaAttributes,
      ...props
    }

    return (
      <div 
        className={finalClasses}
        data-testid={testId || 'switch'}
      >
        {/* Input checkbox caché mais accessible */}
        <input
          {...inputProps}
          className="tb-switch__input"
        />

        {/* Visual switch avec track et thumb */}
        <div 
          className="tb-switch__visual"
          role="switch"
          aria-checked={checked}
          aria-labelledby={switchId}
          aria-describedby={ariaDescribedBy}
          tabIndex={disabled || loading ? -1 : 0}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !disabled && !loading) {
              event.preventDefault()
              const changeEvent = {
                target: { checked: !checked }
              } as React.ChangeEvent<HTMLInputElement>
              onChange?.(!checked, changeEvent)
            }
          }}
        >
          <div className="tb-switch__track">
            <div className="tb-switch__thumb">
              {loading && (
                <div className="tb-switch__spinner" aria-hidden="true">
                  <div className="tb-switch__spinner-dots">
                    <span className="tb-switch__spinner-dot" />
                    <span className="tb-switch__spinner-dot" />
                    <span className="tb-switch__spinner-dot" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Texte et description */}
        {label && (
          <div className="tb-switch__content">
            {renderTextContent()}
          </div>
        )}
      </div>
    )
  }
)

// Affichage du nom du composant en mode développement
if (process.env.NODE_ENV !== 'production') {
  Switch.displayName = 'Switch'
}

export default Switch