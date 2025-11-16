/**
 * CTASection Component - Modern Call-to-Action Section
 * 
 * A flexible and accessible call-to-action component with multiple variants,
 * positioning options, and comprehensive button configurations.
 * 
 * Features:
 * - 5 background variants: primary, secondary, gradient, dark, light
 * - 3 layout options: single, split, stacked
 * - 3 position modes: center, left, right
 * - Primary and secondary buttons with full customization
 * - Responsive design with mobile-first approach
 * - WCAG 2.1 AA accessibility compliance
 * - CSS Variables theming system
 * - Smooth animations and transitions
 * 
 * @author MiniMax Agent
 * @version 1.0.0
 */

import React from 'react'
import { useMemo } from 'react'
import { cn } from '@/utils'
import './CTASection.css'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * Button configuration interface
 */
export interface ButtonConfig {
  /** Button text content */
  text: string
  /** Click handler function */
  onClick?: () => void
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Icon to display */
  icon?: React.ReactNode
  /** Whether button is disabled */
  disabled?: boolean
  /** Whether button is loading */
  loading?: boolean
  /** Custom CSS class name */
  className?: string
  /** Button URL for navigation */
  href?: string
  /** Link target */
  target?: string
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
}

/**
 * CTASection main props interface
 */
export interface CTASectionProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Detailed description text */
  description?: string
  /** Primary action button configuration */
  primaryButton?: ButtonConfig
  /** Secondary action button configuration */
  secondaryButton?: ButtonConfig
  /** Background variant style */
  background?: 'primary' | 'secondary' | 'gradient' | 'dark' | 'light'
  /** Layout arrangement */
  layout?: 'single' | 'split' | 'stacked'
  /** Content positioning */
  position?: 'center' | 'left' | 'right'
  /** Maximum container width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Custom CSS class name */
  className?: string
  /** Section ID for anchor navigation */
  id?: string
  /** Whether to show decorative elements */
  decorative?: boolean
  /** Custom padding values */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Background image URL */
  backgroundImage?: string
  /** Background image overlay opacity */
  backgroundOverlay?: number
  /** ARIA label for screen readers */
  ariaLabel?: string
  /** Custom content nodes */
  children?: React.ReactNode
}

/**
 * Default button configurations
 */
const DEFAULT_PRIMARY_BUTTON: ButtonConfig = {
  text: 'Get Started',
  variant: 'primary',
  size: 'lg'
}

const DEFAULT_SECONDARY_BUTTON: ButtonConfig = {
  text: 'Learn More',
  variant: 'outline',
  size: 'lg'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique section ID
 */
const generateSectionId = (): string => {
  return `cta-section-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate button configuration
 */
const validateButtonConfig = (button: ButtonConfig | undefined): ButtonConfig | undefined => {
  if (!button) return undefined
  
  return {
    text: button.text || '',
    onClick: button.onClick,
    variant: button.variant || 'primary',
    size: button.size || 'md',
    icon: button.icon,
    disabled: button.disabled || false,
    loading: button.loading || false,
    className: button.className,
    href: button.href,
    target: button.target,
    type: button.type || 'button'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modern CTASection Component
 * 
 * A highly customizable call-to-action section with comprehensive
 * styling options, accessibility features, and responsive design.
 */
export const CTASection: React.FC<CTASectionProps> = ({
  title = 'Ready to take the next step?',
  subtitle,
  description,
  primaryButton = DEFAULT_PRIMARY_BUTTON,
  secondaryButton,
  background = 'primary',
  layout = 'single',
  position = 'center',
  maxWidth = 'lg',
  className = '',
  id,
  decorative = true,
  padding = 'lg',
  backgroundImage,
  backgroundOverlay = 0.5,
  ariaLabel,
  children
}) => {
  // Generate unique ID for accessibility
  const sectionId = useMemo(() => id || generateSectionId(), [id])
  
  // Validate and process button configurations
  const validatedPrimaryButton = useMemo(() => 
    validateButtonConfig(primaryButton), [primaryButton]
  )
  
  const validatedSecondaryButton = useMemo(() => 
    validateButtonConfig(secondaryButton), [secondaryButton]
  )
  
  // Compute CSS classes
  const sectionClasses = useMemo(() => cn(
    'cta-section',
    `cta-section--background-${background}`,
    `cta-section--layout-${layout}`,
    `cta-section--position-${position}`,
    `cta-section--max-width-${maxWidth}`,
    `cta-section--padding-${padding}`,
    { 'cta-section--has-background-image': !!backgroundImage },
    className
  ), [background, layout, position, maxWidth, padding, backgroundImage, className])
  
  // ARIA label for accessibility
  const ariaLabelValue = ariaLabel || `Call to action section: ${title}`
  
  return (
    <section
      id={sectionId}
      className={sectionClasses}
      aria-label={ariaLabelValue}
      role="region"
    >
      {/* Background Image Layer */}
      {backgroundImage && (
        <div 
          className="cta-section__background-image"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundOverlay
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Decorative Elements */}
      {decorative && (
        <div className="cta-section__decorative" aria-hidden="true">
          <div className="cta-section__decorative-element cta-section__decorative-element--1" />
          <div className="cta-section__decorative-element cta-section__decorative-element--2" />
          <div className="cta-section__decorative-element cta-section__decorative-element--3" />
        </div>
      )}
      
      {/* Content Container */}
      <div className="cta-section__container">
        <div className="cta-section__content">
          
          {/* Header Content */}
          <div className="cta-section__header">
            {subtitle && (
              <p className="cta-section__subtitle" aria-label="Section subtitle">
                {subtitle}
              </p>
            )}
            
            <h2 className="cta-section__title">
              {title}
            </h2>
            
            {description && (
              <p className="cta-section__description">
                {description}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          {(validatedPrimaryButton || validatedSecondaryButton) && (
            <div className="cta-section__actions">
              {validatedPrimaryButton && (
                <button
                  className={`cta-section__button cta-section__button--primary cta-section__button--${validatedPrimaryButton.size} ${validatedPrimaryButton.className || ''}`}
                  onClick={validatedPrimaryButton.onClick}
                  disabled={validatedPrimaryButton.disabled}
                  aria-label={validatedPrimaryButton.text}
                  type={validatedPrimaryButton.type}
                  {...(validatedPrimaryButton.href && {
                    href: validatedPrimaryButton.href,
                    target: validatedPrimaryButton.target
                  })}
                >
                  {validatedPrimaryButton.icon && (
                    <span className="cta-section__button-icon">
                      {validatedPrimaryButton.icon}
                    </span>
                  )}
                  {validatedPrimaryButton.loading ? (
                    <span className="cta-section__button-loading" aria-label="Loading">
                      <svg className="cta-section__spinner" viewBox="0 0 24 24">
                        <circle
                          className="cta-section__spinner-circle"
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    validatedPrimaryButton.text
                  )}
                </button>
              )}
              
              {validatedSecondaryButton && (
                <button
                  className={`cta-section__button cta-section__button--secondary cta-section__button--${validatedSecondaryButton.size} ${validatedSecondaryButton.className || ''}`}
                  onClick={validatedSecondaryButton.onClick}
                  disabled={validatedSecondaryButton.disabled}
                  aria-label={validatedSecondaryButton.text}
                  type={validatedSecondaryButton.type}
                  {...(validatedSecondaryButton.href && {
                    href: validatedSecondaryButton.href,
                    target: validatedSecondaryButton.target
                  })}
                >
                  {validatedSecondaryButton.icon && (
                    <span className="cta-section__button-icon">
                      {validatedSecondaryButton.icon}
                    </span>
                  )}
                  {validatedSecondaryButton.loading ? (
                    <span className="cta-section__button-loading" aria-label="Loading">
                      <svg className="cta-section__spinner" viewBox="0 0 24 24">
                        <circle
                          className="cta-section__spinner-circle"
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    validatedSecondaryButton.text
                  )}
                </button>
              )}
            </div>
          )}
          
          {/* Custom Children Content */}
          {children && (
            <div className="cta-section__custom-content">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CTASection