import React from 'react'
import type { ButtonProps } from '@/types'
import { cn } from '@/utils'

/**
 * Button - Composant bouton moderne avec TypeScript
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  as = 'button',
  href,
  target,
  rel,
  className = '',
  style,
  id,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role,
  ...rest
}) => {
  // Classes CSS générées dynamiquement
  const buttonClasses = cn(
    'ng-button',
    `ng-button--${variant}`,
    `ng-button--${size}`,
    `ng-button--${shape}`,
    { 'ng-button--full-width': fullWidth },
    { 'ng-button--disabled': disabled },
    { 'ng-button--loading': loading },
    className
  )

  // Style du composant
  const buttonStyle: React.CSSProperties = {
    ...style,
    ...(fullWidth && { width: '100%' })
  }

  // Gestionnaires d'événements
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      return
    }
    
    // Support Enter et Space pour l'accessibilité
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(event as any)
    }
    
    onKeyDown?.(event)
  }

  // Props communes
  const commonProps = {
    id,
    className: buttonClasses,
    style: buttonStyle,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    role,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    ...rest
  }

  // Rendu du contenu avec icônes
  const renderContent = () => {
    if (loading) {
      return (
        <span className="ng-button__content">
          <span className="ng-button__spinner" aria-hidden="true" />
          {children && <span className="ng-button__text">{children}</span>}
        </span>
      )
    }

    return (
      <span className="ng-button__content">
        {leftIcon && <span className="ng-button__icon ng-button__icon--left">{leftIcon}</span>}
        {children && <span className="ng-button__text">{children}</span>}
        {rightIcon && <span className="ng-button__icon ng-button__icon--right">{rightIcon}</span>}
      </span>
    )
  }

  // Rendu selon le type (button ou lien)
  if (as === 'a' && href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        {...commonProps}
      >
        {renderContent()}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...commonProps}
    >
      {renderContent()}
    </button>
  )
}

Button.displayName = 'Button'

export default Button