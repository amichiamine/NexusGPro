import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value'> {
  /**
   * Valeur de progression (0-100)
   */
  value?: number

  /**
   * Valeur minimale
   */
  min?: number

  /**
   * Valeur maximale
   */
  max?: number

  /**
   * Label à afficher à côté ou à l'intérieur de la barre
   */
  label?: string

  /**
   * Description additionnelle
   */
  description?: string

  /**
   * Indique si la progression est indéterminée (chargement)
   */
  indeterminate?: boolean

  /**
   * Variante visuelle de la barre de progression
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'

  /**
   * Taille de la barre de progression
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Style de la barre
   */
  style?: 'linear' | 'circular' | 'stepped' | 'gradient'

  /**
   * Position du texte (si textInside est true)
   */
  labelPosition?: 'inside' | 'outside' | 'top' | 'bottom'

  /**
   * Afficher ou masquer le pourcentage
   */
  showValue?: boolean

  /**
   * Format du pourcentage (ex: '0%', '0.0%', etc.)
   */
  valueFormat?: string

  /**
   * Animation de la barre de progression
   */
  animated?: boolean

  /**
   * Couleur personnalisée (pour les variantes custom)
   */
  color?: string

  /**
   * Couleur de fond personnalisée
   */
  backgroundColor?: string

  /**
   * Hauteur personnalisée (override de size)
   */
  height?: string | number

  /**
   * Largeur personnalisée (override de fullWidth)
   */
  width?: string | number

  /**
   * Indique si la barre doit prendre toute la largeur disponible
   */
  fullWidth?: boolean

  /**
   * Nombre d'étapes pour le mode stepped
   */
  steps?: number

  /**
   * Étape actuelle pour le mode stepped (1-based)
   */
  currentStep?: number

  /**
   * Labels des étapes pour le mode stepped
   */
  stepLabels?: string[]

  /**
   * Callback appelé lors du changement de valeur
   */
  onChange?: (value: number) => void

  /**
   * Classe CSS personnalisée
   */
  className?: string

  /**
   * Props de l'élément track (conteneur)
   */
  trackProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props de l'élément indicator (barre de progression)
   */
  indicatorProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props de l'élément text (texte)
   */
  textProps?: React.HTMLAttributes<HTMLSpanElement>
}

/**
 * Composant Progress moderne et accessible
 * Supporte les modes linéaire, circulaire, par étapes
 * Compatible avec les états animated, indeterminate, custom colors
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      label,
      description,
      indeterminate = false,
      variant = 'default',
      size = 'md',
      style = 'linear',
      labelPosition = 'outside',
      showValue = false,
      valueFormat = '0%',
      animated = false,
      color,
      backgroundColor,
      height,
      width,
      fullWidth = true,
      steps,
      currentStep,
      stepLabels,
      onChange,
      className,
      trackProps,
      indicatorProps,
      textProps,
      ...props
    },
    ref
  ) => {
    // Calcul de la valeur normalisée (0-100)
    const normalizedValue = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
    
    // Classes CSS principales
    const progressClasses = cn(
      'ng-progress',
      `ng-progress--${variant}`,
      `ng-progress--${size}`,
      `ng-progress--${style}`,
      {
        'ng-progress--indeterminate': indeterminate,
        'ng-progress--animated': animated,
        'ng-progress--full-width': fullWidth,
        'ng-progress--text-inside': labelPosition === 'inside',
        'ng-progress--text-outside': labelPosition === 'outside' || labelPosition === 'top' || labelPosition === 'bottom',
        'ng-progress--stepped': style === 'stepped',
      },
      className
    )

    // Styles personnalisés
    const customTrackStyle = {
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(backgroundColor && { backgroundColor }),
    }

    const customIndicatorStyle = {
      ...(color && { backgroundColor: color }),
      ...(width && { width: `${normalizedValue}%` }),
    }

    const formattedValue = typeof valueFormat === 'string' 
      ? valueFormat.replace('0', String(Math.round(value)))
      : valueFormat

    // Gestion du mode circulaire
    if (style === 'circular') {
      const radius = 40
      const circumference = 2 * Math.PI * radius
      const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

      return (
        <div className={progressClasses} ref={ref} {...props}>
          {(label || description) && labelPosition !== 'inside' && (
            <div className="ng-progress__label-wrapper">
              {label && (
                <div className="ng-progress__label">
                  {label}
                  {showValue && (
                    <span className="ng-progress__value">{formattedValue}</span>
                  )}
                </div>
              )}
              {description && (
                <p className="ng-progress__description">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="ng-progress__container" style={customTrackStyle}>
            <svg className="ng-progress__circular" width="100" height="100">
              <circle
                className="ng-progress__track"
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="8"
                fill="transparent"
                {...trackProps}
              />
              <circle
                className={cn('ng-progress__indicator', {
                  'ng-progress__indicator--animated': animated,
                })}
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={customIndicatorStyle}
                {...indicatorProps}
              />
            </svg>
            
            {(labelPosition === 'inside' || (showValue && labelPosition === 'outside')) && (
              <div className={cn(
                'ng-progress__text-wrapper',
                {
                  'ng-progress__text-wrapper--center': labelPosition === 'inside',
                }
              )}>
                {label && labelPosition === 'inside' && (
                  <div className="ng-progress__text ng-progress__text--label">
                    {label}
                  </div>
                )}
                {showValue && (
                  <div className="ng-progress__text ng-progress__text--value">
                    {formattedValue}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Gestion du mode par étapes
    if (style === 'stepped') {
      const stepCount = steps || stepLabels?.length || 5
      const activeSteps = Math.min(currentStep || Math.ceil((normalizedValue / 100) * stepCount), stepCount)

      return (
        <div className={progressClasses} ref={ref} {...props}>
          {(label || description) && labelPosition !== 'inside' && (
            <div className="ng-progress__label-wrapper">
              {label && (
                <div className="ng-progress__label">
                  {label}
                  {showValue && (
                    <span className="ng-progress__value">{formattedValue}</span>
                  )}
                </div>
              )}
              {description && (
                <p className="ng-progress__description">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="ng-progress__container" style={customTrackStyle}>
            <div className="ng-progress__steps">
              {Array.from({ length: stepCount }, (_, index) => {
                const isCompleted = index < activeSteps
                const isActive = index === activeSteps
                const label = stepLabels?.[index] || `${index + 1}`

                return (
                  <div
                    key={index}
                    className={cn(
                      'ng-progress__step',
                      {
                        'ng-progress__step--completed': isCompleted,
                        'ng-progress__step--active': isActive,
                        'ng-progress__step--pending': !isCompleted && !isActive,
                      }
                    )}
                  >
                    <div className="ng-progress__step-circle">
                      {isCompleted ? (
                        <svg className="ng-progress__step-check" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="ng-progress__step-number">{label}</span>
                      )}
                    </div>
                    {stepLabels && labelPosition === 'bottom' && (
                      <div className="ng-progress__step-label">{label}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    // Mode linéaire par défaut
    return (
      <div className={progressClasses} ref={ref} {...props}>
        {(label || description) && labelPosition !== 'inside' && (
          <div className="ng-progress__label-wrapper">
            {label && (
              <div className="ng-progress__label">
                {label}
                {showValue && (
                  <span className="ng-progress__value">{formattedValue}</span>
                )}
              </div>
            )}
            {description && (
              <p className="ng-progress__description">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="ng-progress__container" style={customTrackStyle}>
          <div className="ng-progress__track" {...trackProps}>
            <div
              className={cn(
                'ng-progress__indicator',
                {
                  'ng-progress__indicator--animated': animated,
                }
              )}
              style={customIndicatorStyle}
              {...indicatorProps}
            />
          </div>
          
          {labelPosition === 'inside' && (label || showValue) && (
            <div className="ng-progress__text-wrapper">
              {label && (
                <div className="ng-progress__text ng-progress__text--label">
                  {label}
                </div>
              )}
              {showValue && (
                <div className="ng-progress__text ng-progress__text--value">
                  {formattedValue}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export default Progress