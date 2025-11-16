import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export interface CheckboxProps {
  /**
   * Indique si la case à cocher est cochée
   */
  checked?: boolean

  /**
   * Valeur lorsque la case est cochée (pour les formulaires)
   */
  value?: string

  /**
   * Label à afficher à côté de la checkbox
   */
  label?: string

  /**
   * Description additionnelle
   */
  description?: string

  /**
   * Indique si la checkbox est dans un état intermédiaire (pour les groupes avec sélection partielle)
   */
  indeterminate?: boolean

  /**
   * Variante visuelle de la checkbox
   */
  variant?: 'default' | 'filled' | 'outline' | 'ghost'

  /**
   * Taille de la checkbox
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Position du label par rapport à la checkbox
   */
  labelPosition?: 'right' | 'left'

  /**
   * Callback appelé lors du changement d'état
   */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void

  /**
   * Classe CSS personnalisée
   */
  className?: string

  /**
   * Props de l'élément input sous-jacent
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>

  /**
   * Props de l'élément label
   */
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>

  /**
   * Props de l'élément description
   */
  descriptionProps?: React.HTMLAttributes<HTMLParagraphElement>

  /**
   * Props additionnelles pour l'élément input
   */
  id?: string
  name?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  autoComplete?: string
  form?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
}

/**
 * Composant Checkbox accessible et moderne
 * Supporte les états checked, unchecked, indeterminate
 * Compatible avec les groupes et les formulaires
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      value = 'on',
      label,
      description,
      indeterminate = false,
      variant = 'default',
      size = 'md',
      labelPosition = 'right',
      onChange,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const descriptionId = description ? `${checkboxId}-description` : undefined

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(event.target.checked, event)
      }
    }

    const checkboxClasses = cn(
      // Classes de base
      'ng-checkbox',
      `ng-checkbox--${variant}`,
      `ng-checkbox--${size}`,
      {
        'ng-checkbox--disabled': disabled,
        'ng-checkbox--checked': checked,
        'ng-checkbox--indeterminate': indeterminate,
        'ng-checkbox--label-left': labelPosition === 'left',
      },
      className
    )

    return (
      <div className={checkboxClasses}>
        <div className="ng-checkbox__input-wrapper">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-describedby={descriptionId}
            className="ng-checkbox__input"
            {...props}
          />
          
          <div className="ng-checkbox__box">
            {/* État unchecked */}
            <svg
              className="ng-checkbox__icon ng-checkbox__icon--unchecked"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="11"
                height="11"
                rx="2.5"
                fill="currentColor"
              />
            </svg>

            {/* État checked */}
            <svg
              className="ng-checkbox__icon ng-checkbox__icon--checked"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="11"
                height="11"
                rx="2.5"
                fill="currentColor"
              />
              <path
                d="M3.5 6L5 7.5L8.5 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* État indeterminate */}
            <svg
              className="ng-checkbox__icon ng-checkbox__icon--indeterminate"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="11"
                height="11"
                rx="2.5"
                fill="currentColor"
              />
              <rect
                x="3"
                y="5.5"
                width="6"
                height="1"
                rx="0.5"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {(label || description) && (
          <div className="ng-checkbox__content">
            {label && (
              <label
                htmlFor={checkboxId}
                className="ng-checkbox__label"
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="ng-checkbox__description"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox