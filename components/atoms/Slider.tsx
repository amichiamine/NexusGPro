import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/utils'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'min' | 'max' | 'value' | 'step' | 'onChange'> {
  /**
   * Valeur minimale
   */
  min?: number

  /**
   * Valeur maximale
   */
  max?: number

  /**
   * Valeur actuelle
   */
  value?: number

  /**
   * Valeur par défaut
   */
  defaultValue?: number

  /**
   * Pas de progression
   */
  step?: number

  /**
   * Indique si le slider doit afficher des marques (ticks)
   */
  showMarks?: boolean

  /**
   * Marques personnalisées
   */
  marks?: Array<{ value: number; label?: string; disabled?: boolean }>

  /**
   * Indique si plusieurs valeurs peuvent être sélectionnées
   */
  range?: boolean

  /**
   * Valeurs en mode range (min, max)
   */
  valueRange?: [number, number]

  /**
   * Indique si le tooltip doit être affiché
   */
  showTooltip?: boolean

  /**
   * Position du tooltip
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'

  /**
   * Format du tooltip (ex: '{value}%')
   */
  tooltipFormat?: string

  /**
   * Variante visuelle
   */
  variant?: 'default' | 'filled' | 'minimal' | 'gradient'

  /**
   * Taille du slider
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Indique si le slider doit prendre toute la largeur
   */
  fullWidth?: boolean

  /**
   * Couleur personnalisée
   */
  color?: string

  /**
   * Couleur de la partie inactive
   */
  inactiveColor?: string

  /**
   * Indique si le slider est vertical
   */
  vertical?: boolean

  /**
   * Hauteur personnalisée (pour vertical)
   */
  height?: string | number

  /**
   * Indique si le slider doit afficher les valeurs (min, max)
   */
  showValue?: boolean

  /**
   * Callback appelé lors du changement de valeur
   */
  onChange?: (value: number | [number, number], event: React.ChangeEvent<HTMLInputElement>) => void

  /**
   * Callback appelé lors de la fin de l'interaction
   */
  onChangeComplete?: (value: number | [number, number]) => void

  /**
   * Label à afficher au-dessus du slider
   */
  label?: string

  /**
   * Description additionnelle
   */
  description?: string

  /**
   * Indique si le slider est désactivé
   */
  disabled?: boolean

  /**
   * Indique si les valeurs sont en mode inversé (inverser min/max)
   */
  inverted?: boolean

  /**
   * Classes CSS personnalisées
   */
  className?: string

  /**
   * Props du container principal
   */
  containerProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props du track
   */
  trackProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props du thumb
   */
  thumbProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props du tooltip
   */
  tooltipProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props des marques
   */
  marksProps?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * Composant Slider moderne et accessible
 * Supporte les valeurs uniques et ranges, tooltips, marques
 * Compatible avec les orientations horizontales et verticales
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      value,
      defaultValue = 0,
      step = 1,
      showMarks = false,
      marks,
      range = false,
      valueRange,
      showTooltip = false,
      tooltipPosition = 'top',
      tooltipFormat = '{value}',
      variant = 'default',
      size = 'md',
      fullWidth = true,
      color,
      inactiveColor,
      vertical = false,
      height,
      showValue = false,
      onChange,
      onChangeComplete,
      label,
      description,
      disabled = false,
      inverted = false,
      className,
      containerProps,
      trackProps,
      thumbProps,
      tooltipProps,
      marksProps,
      id,
      ...props
    },
    ref
  ) => {
    const sliderId = id || `slider-${Math.random().toString(36).substr(2, 9)}`
    const descriptionId = description ? `${sliderId}-description` : undefined

    const [internalValue, setInternalValue] = useState(range ? (valueRange || [min, (min + max) / 2]) : (value || defaultValue))
    const [isDragging, setIsDragging] = useState(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const sliderRef = useRef<HTMLDivElement>(null)

    const currentValue = range ? (valueRange || internalValue as [number, number]) : (value ?? internalValue as number)
    const normalizedMin = inverted ? max : min
    const normalizedMax = inverted ? min : max
    const normalizedStep = Math.abs(step)

    // Calcul de la position en pourcentage
    const getPosition = (val: number) => {
      const position = ((val - normalizedMin) / (normalizedMax - normalizedMin)) * 100
      return Math.max(0, Math.min(100, position))
    }

    // Calcul de la valeur depuis la position
    const getValueFromPosition = (position: number) => {
      const percentage = position / 100
      const val = normalizedMin + (normalizedMax - normalizedMin) * percentage
      // Arrondir au step le plus proche
      return Math.round(val / normalizedStep) * normalizedStep
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const newValue = range 
        ? getValueFromPosition(parseFloat(event.target.value))
        : getValueFromPosition(parseFloat(event.target.value))

      if (!range) {
        setInternalValue(newValue)
      }
      
      setTooltipVisible(true)
      setIsDragging(true)

      if (onChange) {
        const emitValue = range ? [currentValue[0], newValue] : newValue
        onChange(emitValue as number | [number, number], event)
      }
    }

    const handleChangeComplete = () => {
      setIsDragging(false)
      if (onChangeComplete) {
        const emitValue = range ? (valueRange || internalValue as [number, number]) : (value ?? internalValue as number)
        onChangeComplete(emitValue)
      }
    }

    const formattedTooltip = tooltipFormat.replace('{value}', String(currentValue))
    const currentPosition = range ? getPosition(currentValue[1]) : getPosition(currentValue as number)

    // Classes CSS principales
    const sliderClasses = cn(
      'ng-slider',
      `ng-slider--${variant}`,
      `ng-slider--${size}`,
      {
        'ng-slider--disabled': disabled,
        'ng-slider--range': range,
        'ng-slider--vertical': vertical,
        'ng-slider--full-width': fullWidth,
        'ng-slider--with-marks': showMarks,
        'ng-slider--with-tooltip': showTooltip,
        'ng-slider--inverted': inverted,
      },
      className
    )

    return (
      <div 
        className={sliderClasses} 
        ref={sliderRef}
        role="group"
        aria-label={label}
        aria-describedby={descriptionId}
        {...containerProps}
      >
        {(label || description) && (
          <div className="ng-slider__label-wrapper">
            {label && (
              <label htmlFor={sliderId} className="ng-slider__label">
                {label}
                {showValue && (
                  <span className="ng-slider__value">
                    {range 
                      ? `${currentValue[0]} - ${currentValue[1]}`
                      : `${currentValue} / ${max}`
                    }
                  </span>
                )}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="ng-slider__description">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="ng-slider__container">
          {/* Track principal */}
          <div 
            className="ng-slider__track"
            style={{
              height: vertical ? (typeof height === 'number' ? `${height}px` : height) : undefined,
              background: inactiveColor ? inactiveColor : undefined,
            }}
            {...trackProps}
          >
            {/* Partie active */}
            <div 
              className="ng-slider__track-active"
              style={{
                width: `${currentPosition}%`,
                background: color || undefined,
              }}
            />

            {/* Marks/Ticks */}
            {showMarks && (
              <div className="ng-slider__marks" {...marksProps}>
                {(marks || Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)).map((mark, index) => {
                  const markValue = typeof mark === 'number' ? mark : mark.value
                  const markLabel = typeof mark === 'object' ? mark.label : undefined
                  const markDisabled = typeof mark === 'object' ? mark.disabled : false
                  const position = getPosition(markValue)

                  return (
                    <div
                      key={index}
                      className={cn(
                        'ng-slider__mark',
                        {
                          'ng-slider__mark--disabled': markDisabled,
                          'ng-slider__mark--active': range 
                            ? markValue >= (currentValue as [number, number])[0] && markValue <= (currentValue as [number, number])[1]
                            : markValue <= (currentValue as number),
                        }
                      )}
                      style={{ left: `${position}%` }}
                    >
                      <div className="ng-slider__mark-line" />
                      {markLabel && (
                        <div className="ng-slider__mark-label">
                          {markLabel}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Input caché pour l'accessibilité */}
            <input
              ref={ref}
              id={sliderId}
              type="range"
              min={normalizedMin}
              max={normalizedMax}
              step={normalizedStep}
              value={currentValue as number}
              disabled={disabled}
              onChange={handleChange}
              onMouseUp={handleChangeComplete}
              onTouchEnd={handleChangeComplete}
              className="ng-slider__input"
              {...props}
            />

            {/* Thumb */}
            <div 
              className="ng-slider__thumb"
              style={{ left: `${currentPosition}%` }}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => !isDragging && setTooltipVisible(false)}
              {...thumbProps}
            >
              {/* Tooltip */}
              {showTooltip && tooltipVisible && (
                <div 
                  className={cn(
                    'ng-slider__tooltip',
                    `ng-slider__tooltip--${tooltipPosition}`
                  )}
                  {...tooltipProps}
                >
                  {formattedTooltip}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Slider.displayName = 'Slider'

// Slider avec valeurs pré-définies
export interface DiscreteSliderProps extends Omit<SliderProps, 'step' | 'showMarks'> {
  /**
   * Liste des valeurs autorisées
   */
  values: number[]
  /**
   * Afficher toutes les valeurs comme marques
   */
  showAllMarks?: boolean
}

export const DiscreteSlider = forwardRef<HTMLInputElement, DiscreteSliderProps>(
  ({ values, showAllMarks = true, ...props }, ref) => {
    const step = Math.min(...values.slice(1).map((val, i) => Math.abs(val - values[i])))

    return (
      <Slider
        ref={ref}
        min={Math.min(...values)}
        max={Math.max(...values)}
        step={step}
        marks={showAllMarks ? values.map(val => ({ value: val, label: String(val) })) : true}
        showMarks={true}
        {...props}
      />
    )
  }
)

DiscreteSlider.displayName = 'DiscreteSlider'

// Slider en mode prix avec formatage
export interface PriceSliderProps extends Omit<SliderProps, 'tooltipFormat'> {
  currency?: string
  locale?: string
}

export const PriceSlider = forwardRef<HTMLInputElement, PriceSliderProps>(
  ({ currency = '€', locale = 'fr-FR', ...props }, ref) => {
    const formatPrice = (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.replace('', 'EUR') // Simplification
      }).format(value)
    }

    return (
      <Slider
        ref={ref}
        tooltipFormat="{value}"
        showTooltip={true}
        {...props}
        // Note: Dans une vraie implémentation, on formatterait la valeur ici
      />
    )
  }
)

PriceSlider.displayName = 'PriceSlider'

export default Slider