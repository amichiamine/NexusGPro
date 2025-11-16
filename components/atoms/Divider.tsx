import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation de la séparation
   */
  orientation?: 'horizontal' | 'vertical'

  /**
   * Épaisseur de la séparation
   */
  thickness?: 'thin' | 'medium' | 'thick' | 'hairline'

  /**
   * Style de la séparation
   */
  variant?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none'

  /**
   * Couleur de la séparation
   */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'

  /**
   * Indique si la séparation doit prendre toute la largeur/hauteur disponible
   */
  fullLength?: boolean

  /**
   * Longueur personnalisée de la séparation
   */
  length?: string | number

  /**
   * Indentation de la séparation (pour horizontal) ou marge (pour vertical)
   */
  indentation?: number

  /**
   * Contenu centré à afficher au milieu de la séparation
   */
  label?: React.ReactNode

  /**
   * Position du label
   */
  labelPosition?: 'start' | 'center' | 'end'

  /**
   * Couleur du label
   */
  labelColor?: 'default' | 'muted' | 'primary' | 'secondary'

  /**
   * Icône à afficher à côté ou à la place du label
   */
  icon?: React.ReactNode

  /**
   * Position de l'icône
   */
  iconPosition?: 'left' | 'right' | 'center'

  /**
   * Style du label
   */
  labelStyle?: 'pill' | 'box' | 'text' | 'none'

  /**
   * Indique si la séparation doit avoir des coins arrondis
   */
  rounded?: boolean

  /**
   * Indique si la séparation doit avoir une ombre subtile
   */
  elevated?: boolean

  /**
   * Direction pour RTL
   */
  direction?: 'ltr' | 'rtl'

  /**
   * Classe CSS personnalisée
   */
  className?: string

  /**
   * Props de l'élément principal
   */
  dividerProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props du label wrapper
   */
  labelWrapperProps?: React.HTMLAttributes<HTMLDivElement>

  /**
   * Props du label
   */
  labelProps?: React.HTMLAttributes<HTMLElement>
}

/**
 * Composant Divider moderne et flexible
 * Supporte les orientations, styles, couleurs, labels et icônes
 * Compatible avec les layouts horizontaux et verticaux
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      thickness = 'medium',
      variant = 'solid',
      color = 'default',
      fullLength = true,
      length,
      indentation = 0,
      label,
      labelPosition = 'center',
      labelColor = 'default',
      icon,
      iconPosition = 'left',
      labelStyle = 'text',
      rounded = false,
      elevated = false,
      direction,
      className,
      dividerProps,
      labelWrapperProps,
      labelProps,
      role = 'separator',
      ...props
    },
    ref
  ) => {
    // Classes CSS principales
    const dividerClasses = cn(
      'ng-divider',
      `ng-divider--${orientation}`,
      `ng-divider--${thickness}`,
      `ng-divider--${variant}`,
      `ng-divider--${color}`,
      {
        'ng-divider--full-length': fullLength,
        'ng-divider--with-label': !!label,
        'ng-divider--with-icon': !!icon,
        'ng-divider--rounded': rounded,
        'ng-divider--elevated': elevated,
        'ng-divider--label-start': labelPosition === 'start',
        'ng-divider--label-center': labelPosition === 'center',
        'ng-divider--label-end': labelPosition === 'end',
        'ng-divider--icon-left': iconPosition === 'left',
        'ng-divider--icon-right': iconPosition === 'right',
        'ng-divider--icon-center': iconPosition === 'center',
        'ng-divider--text-pill': labelStyle === 'pill',
        'ng-divider--text-box': labelStyle === 'box',
        'ng-divider--text-plain': labelStyle === 'text',
      },
      className
    )

    // Style personnalisé
    const dividerStyle: React.CSSProperties = {
      ...(length && {
        width: orientation === 'horizontal' ? (typeof length === 'number' ? `${length}px` : length) : undefined,
        height: orientation === 'vertical' ? (typeof length === 'number' ? `${length}px` : length) : undefined,
      }),
      ...(indentation && {
        marginLeft: orientation === 'horizontal' && direction !== 'rtl' ? `${indentation}px` : undefined,
        marginRight: orientation === 'horizontal' && direction === 'rtl' ? `${indentation}px` : undefined,
        marginTop: orientation === 'vertical' ? `${indentation}px` : undefined,
        marginBottom: orientation === 'vertical' ? `${indentation}px` : undefined,
      }),
    }

    // Élément de séparation principal
    const SeparatorElement = (
      <div
        ref={ref}
        className="ng-divider__line"
        role={role}
        aria-orientation={orientation}
        {...dividerProps}
        style={{ ...dividerStyle, ...dividerProps?.style }}
      />
    )

    // Wrapper avec label/icon
    const LabeledDivider = (
      <div className="ng-divider__labeled">
        {SeparatorElement}
        
        {(label || icon) && (
          <div {...labelWrapperProps} className={cn(
            'ng-divider__label-wrapper',
            `ng-divider__label-wrapper--${labelPosition}`,
            `ng-divider__label-wrapper--${labelStyle}`
          )}>
            {icon && iconPosition === 'left' && (
              <div className="ng-divider__icon ng-divider__icon--left">
                {icon}
              </div>
            )}
            
            {label && (
              <div {...labelProps} className={cn(
                'ng-divider__label',
                `ng-divider__label--${labelColor}`
              )}>
                {label}
              </div>
            )}
            
            {icon && iconPosition === 'right' && (
              <div className="ng-divider__icon ng-divider__icon--right">
                {icon}
              </div>
            )}
          </div>
        )}
        
        {/* Pour une icône centrée seule */}
        {icon && iconPosition === 'center' && !label && (
          <div className="ng-divider__icon-wrapper--center">
            <div className="ng-divider__icon ng-divider__icon--center">
              {icon}
            </div>
          </div>
        )}
      </div>
    )

    return label || icon ? LabeledDivider : SeparatorElement
  }
)

Divider.displayName = 'Divider'

// Divider avec texte centré
export interface TextDividerProps extends Omit<DividerProps, 'label'> {
  text: string
  textColor?: DividerProps['labelColor']
  textStyle?: DividerProps['labelStyle']
}

export const TextDivider = forwardRef<HTMLDivElement, TextDividerProps>(
  ({ text, textColor = 'default', textStyle = 'text', ...props }, ref) => {
    return (
      <Divider
        ref={ref}
        label={text}
        labelColor={textColor}
        labelStyle={textStyle}
        {...props}
      />
    )
  }
)

TextDivider.displayName = 'TextDivider'

// Divider avec icône
export interface IconDividerProps extends Omit<DividerProps, 'icon'> {
  icon: React.ReactNode
  iconColor?: 'default' | 'primary' | 'secondary' | 'muted'
  iconPosition?: DividerProps['iconPosition']
}

export const IconDivider = forwardRef<HTMLDivElement, IconDividerProps>(
  ({ icon, iconColor = 'default', iconPosition = 'center', ...props }, ref) => {
    return (
      <Divider
        ref={ref}
        icon={icon}
        labelPosition={iconPosition === 'center' ? 'center' : undefined}
        {...props}
      />
    )
  }
)

IconDivider.displayName = 'IconDivider'

// Divider avec liste de labels
export interface ListDividerProps extends Omit<DividerProps, 'label'> {
  items: Array<{
    label: string
    icon?: React.ReactNode
    color?: 'default' | 'primary' | 'secondary' | 'muted'
  }>
  separator?: string
  maxItems?: number
}

export const ListDivider = forwardRef<HTMLDivElement, ListDividerProps>(
  ({ items, separator = ' • ', maxItems = 3, ...props }, ref) => {
    const displayItems = items.slice(0, maxItems)
    const remainingCount = items.length - maxItems
    const label = displayItems.map((item, index) => (
      <React.Fragment key={index}>
        {item.icon && <span className="ng-divider__list-icon">{item.icon}</span>}
        <span className={cn(
          'ng-divider__list-item',
          `ng-divider__list-item--${item.color}`
        )}>
          {item.label}
        </span>
        {index < displayItems.length - 1 && (
          <span className="ng-divider__separator">{separator}</span>
        )}
      </React.Fragment>
    )).concat(
      remainingCount > 0 ? [
        <span key="remaining" className="ng-divider__list-remaining">
          +{remainingCount} autres
        </span>
      ] : []
    )

    return (
      <Divider
        ref={ref}
        label={label}
        labelStyle="text"
        {...props}
      />
    )
  }
)

ListDivider.displayName = 'ListDivider'

export default Divider