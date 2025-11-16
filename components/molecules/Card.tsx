import React from 'react'
import type { CardProps } from '@/types'
import { cn } from '@/utils'

/**
 * Card - Composant carte moderne avec TypeScript
 * 
 * @example
 * ```tsx
 * <Card variant="default" padding="md" shadow="md">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = true,
  border = true,
  rounded = true,
  interactive = false,
  hoverable = false,
  actions,
  header,
  footer,
  className = '',
  style,
  id,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role = 'region',
  ...rest
}) => {
  // Classes CSS générées dynamiquement
  const cardClasses = cn(
    'ng-card',
    `ng-card--${variant}`,
    `ng-card--${padding}`,
    { 'ng-card--shadow': shadow },
    { 'ng-card--border': border },
    { 'ng-card--rounded': rounded },
    { 'ng-card--interactive': interactive },
    { 'ng-card--hoverable': hoverable },
    className
  )

  // Génération de l'ID unique pour la région accessible
  const cardId = id || `ng-card-${Math.random().toString(36).substr(2, 9)}`

  // Props communes
  const cardProps = {
    id: cardId,
    className: cardClasses,
    style,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    role,
    ...rest
  }

  // Rendu du contenu
  const renderContent = () => (
    <>
      {header && <div className="ng-card__header">{header}</div>}
      <div className="ng-card__body">{children}</div>
      {footer && <div className="ng-card__footer">{footer}</div>}
      {actions && <div className="ng-card__actions">{actions}</div>}
    </>
  )

  return (
    <article {...cardProps}>
      {renderContent()}
    </article>
  )
}

Card.displayName = 'Card'

export default Card