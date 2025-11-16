import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/utils'

export interface Option {
  /**
   * Valeur de l'option
   */
  value: string

  /**
   * Texte affiché pour l'option
   */
  label: string

  /**
   * Description additionnelle
   */
  description?: string

  /**
   * Indique si l'option est désactivée
   */
  disabled?: boolean

  /**
   * Classe CSS personnalisée pour l'option
   */
  className?: string
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Options disponibles dans le select
   */
  options: Option[]

  /**
   * Valeur sélectionnée
   */
  value?: string

  /**
   * Valeur par défaut
   */
  defaultValue?: string

  /**
   * Placeholder affiché quand aucune valeur n'est sélectionnée
   */
  placeholder?: string

  /**
   * Label à afficher au-dessus du select
   */
  label?: string

  /**
   * Description additionnelle
   */
  description?: string

  /**
   * Indique si le select est dans un état de chargement
   */
  loading?: boolean

  /**
   * Indique si le select peut avoir plusieurs sélections
   */
  multiple?: boolean

  /**
   * Nombre de lignes visibles en mode multiple
   */
  rows?: number

  /**
   * Variante visuelle du select
   */
  variant?: 'default' | 'filled' | 'outline' | 'ghost'

  /**
   * Taille du select
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Indique si le select doit prendre toute la largeur disponible
   */
  fullWidth?: boolean

  /**
   * Callback appelé lors du changement de valeur
   */
  onChange?: (value: string | string[], event: React.ChangeEvent<HTMLSelectElement>) => void

  /**
   * Classe CSS personnalisée
   */
  className?: string

  /**
   * Props de l'icône de dropdown
   */
  iconProps?: {
    /**
     * Icône personnalisée à utiliser
     */
    customIcon?: React.ReactNode

    /**
     * Couleur de l'icône
     */
    color?: string

    /**
     * Taille de l'icône
     */
    size?: number
  }
}

/**
 * Composant Select moderne et accessible
 * Supporte les options avec descriptions, états disabled, mode multiple
 * Compatible avec les groupes et les formulaires
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder = 'Sélectionnez une option',
      label,
      description,
      loading = false,
      multiple = false,
      rows = 4,
      variant = 'default',
      size = 'md',
      fullWidth = true,
      onChange,
      disabled = false,
      className,
      iconProps,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const descriptionId = description ? `${selectId}-description` : undefined

    const [isOpen, setIsOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const selectRef = useRef<HTMLDivElement>(null)

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (!disabled && onChange) {
        const newValue = multiple 
          ? Array.from(event.target.selectedOptions, option => option.value)
          : event.target.value
        onChange(newValue, event)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLSelectElement>) => {
      if (disabled) return

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          setIsOpen(!isOpen)
          break
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => Math.min(prev + 1, options.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
          break
      }
    }

    const selectedOption = options.find(option => option.value === value)
    const selectedLabel = selectedOption?.label || placeholder

    const selectClasses = cn(
      // Classes de base
      'ng-select',
      `ng-select--${variant}`,
      `ng-select--${size}`,
      {
        'ng-select--disabled': disabled,
        'ng-select--open': isOpen,
        'ng-select--multiple': multiple,
        'ng-select--loading': loading,
        'ng-select--full-width': fullWidth,
      },
      className
    )

    // Fermer le dropdown lors du clic extérieur
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    return (
      <div className={selectClasses} ref={selectRef}>
        {(label || description) && (
          <div className="ng-select__label-wrapper">
            {label && (
              <label
                htmlFor={selectId}
                className="ng-select__label"
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="ng-select__description"
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div className="ng-select__container">
          <select
            ref={ref}
            id={selectId}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled || loading}
            multiple={multiple}
            size={multiple ? rows : undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 100)}
            aria-expanded={isOpen}
            aria-describedby={descriptionId}
            className="ng-select__element"
            {...props}
          >
            {placeholder && !value && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {options.map((option, index) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={option.className}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Icône de dropdown */}
          <div className="ng-select__icon-wrapper">
            {loading ? (
              <div className="ng-select__spinner" />
            ) : (
              iconProps?.customIcon || (
                <svg
                  className="ng-select__chevron"
                  width={iconProps?.size || 16}
                  height={iconProps?.size || 16}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )
            )}
          </div>
        </div>

        {/* Liste dropdown personnalisée (optionnel) */}
        {isOpen && !multiple && (
          <div className="ng-select__dropdown">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'ng-select__option',
                  {
                    'ng-select__option--selected': option.value === value,
                    'ng-select__option--focused': index === focusedIndex,
                    'ng-select__option--disabled': option.disabled,
                  },
                  option.className
                )}
                onClick={() => {
                  if (!option.disabled && onChange) {
                    onChange(option.value, {} as React.ChangeEvent<HTMLSelectElement>)
                    setIsOpen(false)
                  }
                }}
                disabled={option.disabled}
              >
                <div className="ng-select__option-content">
                  <span className="ng-select__option-label">{option.label}</span>
                  {option.description && (
                    <span className="ng-select__option-description">
                      {option.description}
                    </span>
                  )}
                </div>
                
                {option.value === value && (
                  <svg
                    className="ng-select__check-icon"
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select