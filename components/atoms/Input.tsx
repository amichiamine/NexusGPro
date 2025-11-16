import React, { forwardRef, useState } from 'react'
import type { InputProps } from '@/types'
import { cn } from '@/utils'

/**
 * Input - Composant input moderne avec TypeScript
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 *   error={emailError}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  size = 'md',
  variant = 'default',
  error = false,
  helperText,
  leftIcon,
  rightIcon,
  name,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  className = '',
  style,
  id,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  
  // Génération d'un ID unique
  const inputId = id || `ng-input-${Math.random().toString(36).substr(2, 9)}`
  const helperId = helperText ? `${inputId}-helper` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [ariaDescribedby, helperId, errorId].filter(Boolean).join(' ') || undefined

  // Classes CSS générées dynamiquement
  const containerClasses = cn(
    'ng-input-container',
    `ng-input-container--${size}`,
    `ng-input-container--${variant}`,
    { 'ng-input-container--focused': isFocused },
    { 'ng-input-container--disabled': disabled },
    { 'ng-input-container--error': error },
    { 'ng-input-container--with-left-icon': leftIcon },
    { 'ng-input-container--with-right-icon': rightIcon },
    className
  )

  const inputClasses = cn(
    'ng-input',
    `ng-input--${size}`,
    `ng-input--${variant}`,
    { 'ng-input--focused': isFocused },
    { 'ng-input--disabled': disabled },
    { 'ng-input--error': error },
    { 'ng-input--with-left-icon': leftIcon },
    { 'ng-input--with-right-icon': rightIcon }
  )

  // Gestionnaires d'événements
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  // Props de l'input
  const inputProps = {
    ref,
    id: inputId,
    name,
    type,
    value,
    defaultValue,
    placeholder,
    disabled,
    readOnly,
    required,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    pattern,
    className: inputClasses,
    style,
    'data-testid': testId,
    'aria-label': ariaLabel || label,
    'aria-describedby': describedBy,
    'aria-invalid': error || undefined,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown,
    onKeyUp,
    ...rest
  }

  // Rendu du label
  const renderLabel = () => {
    if (!label) return null

    return (
      <label
        htmlFor={inputId}
        className={`ng-input-label ng-input-label--${size}`}
      >
        {label}
        {required && <span className="ng-input-label__required" aria-label="required">*</span>}
      </label>
    )
  }

  // Rendu du texte d'aide ou d'erreur
  const renderHelperText = () => {
    if (!helperText && !error) return null

    return (
      <div
        id={helperId}
        className={`ng-input-helper ng-input-helper--${size} ng-input-helper--${error ? 'error' : 'default'}`}
        role={error ? 'alert' : undefined}
        aria-live={error ? 'polite' : undefined}
      >
        {helperText || error}
      </div>
    )
  }

  return (
    <div className={containerClasses} style={style}>
      {renderLabel()}
      
      <div className="ng-input-wrapper">
        {leftIcon && (
          <div className={`ng-input-icon ng-input-icon--left ng-input-icon--${size}`}>
            {leftIcon}
          </div>
        )}
        
        <input {...inputProps} />
        
        {rightIcon && (
          <div className={`ng-input-icon ng-input-icon--right ng-input-icon--${size}`}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {renderHelperText()}
    </div>
  )
})

Input.displayName = 'Input'

export default Input