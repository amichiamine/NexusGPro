import React, { forwardRef } from 'react';
import { cn } from '@/utils';

/**
 * FeatureCard component props
 */
export interface FeatureCardProps {
  /** Icon to display (emoji, ReactNode, or string) */
  icon?: React.ReactNode;
  /** Title of the feature */
  title: string;
  /** Description text */
  description?: string;
  /** Alternative text for accessibility (when icon is not decorative) */
  iconAlt?: string;
  /** Whether the icon is decorative (for screen readers) */
  decorativeIcon?: boolean;
  /** Visual style variant */
  variant?: 'default' | 'outlined' | 'filled' | 'gradient' | 'glass' | 'minimal';
  /** Size of the card */
  size?: 'sm' | 'md' | 'lg';
  /** Content alignment */
  align?: 'left' | 'center' | 'right';
  /** Icon position relative to title */
  iconPosition?: 'top' | 'left' | 'background';
  /** Icon size */
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Background color */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Text color */
  textColor?: string;
  /** Icon color */
  iconColor?: string;
  /** Whether to show hover effects */
  hoverable?: boolean;
  /** Whether to show animations */
  animated?: boolean;
  /** Elevation level (shadow) */
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Custom padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** CTA button properties */
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
  };
  /** Additional content below description */
  children?: React.ReactNode;
  /** Additional CSS classes for the card */
  className?: string;
  /** Additional CSS classes for the icon container */
  iconClassName?: string;
  /** Additional CSS classes for the title */
  titleClassName?: string;
  /** Additional CSS classes for the description */
  descriptionClassName?: string;
  /** Custom ID for the card */
  id?: string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Click handler for the entire card */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Link properties (alternative to onClick) */
  href?: string;
  /** Target for link (when href is provided) */
  target?: string;
  /** Rel attribute for link security */
  rel?: string;
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      icon = '⚡',
      title,
      description = 'Explain your feature.',
      iconAlt,
      decorativeIcon = true,
      variant = 'default',
      size = 'md',
      align = 'center',
      iconPosition = 'top',
      iconSize = 'md',
      backgroundColor,
      borderColor,
      textColor,
      iconColor,
      hoverable = true,
      animated = true,
      elevation = 'md',
      borderRadius = 'lg',
      padding = 'md',
      cta,
      children,
      className,
      iconClassName,
      titleClassName,
      descriptionClassName,
      id,
      'data-testid': dataTestid,
      onClick,
      onFocus,
      onBlur,
      loading = false,
      disabled = false,
      tabIndex,
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    // Handle clickable states
    const isClickable = !!onClick || !!href;
    const isDisabled = disabled || loading;

    // Combine all classes
    const cardClasses = cn(
      'feature-card',
      `feature-card-variant-${variant}`,
      `feature-card-size-${size}`,
      `feature-card-align-${align}`,
      `feature-card-icon-position-${iconPosition}`,
      `feature-card-icon-size-${iconSize}`,
      `feature-card-elevation-${elevation}`,
      `feature-card-border-radius-${borderRadius}`,
      `feature-card-padding-${padding}`,
      hoverable && 'feature-card-hoverable',
      animated && 'feature-card-animated',
      isClickable && 'feature-card-clickable',
      isDisabled && 'feature-card-disabled',
      loading && 'feature-card-loading',
      className
    );

    // Icon classes
    const iconContainerClasses = cn(
      'feature-card-icon-container',
      `feature-card-icon-container-${iconPosition}`,
      `feature-card-icon-container-size-${iconSize}`,
      iconClassName
    );

    // Title classes
    const titleClasses = cn(
      'feature-card-title',
      `feature-card-title-size-${size}`,
      `feature-card-title-align-${align}`,
      titleClassName
    );

    // Description classes
    const descriptionClasses = cn(
      'feature-card-description',
      `feature-card-description-size-${size}`,
      `feature-card-description-align-${align}`,
      descriptionClassName
    );

    // Custom styles
    const customStyles: React.CSSProperties = {
      ...(backgroundColor && { backgroundColor }),
      ...(borderColor && { borderColor }),
      ...(textColor && { color: textColor }),
    };

    const iconStyles: React.CSSProperties = {
      ...(iconColor && { color: iconColor }),
    };

    // Render icon
    const renderIcon = () => {
      if (loading) {
        return (
          <div className="feature-card-icon-loading">
            <div className="feature-card-spinner" />
          </div>
        );
      }

      return (
        <div
          className={iconContainerClasses}
          style={iconStyles}
          aria-hidden={decorativeIcon}
          aria-label={!decorativeIcon ? iconAlt || 'Feature icon' : undefined}
        >
          {icon}
        </div>
      );
    };

    // Render CTA button
    const renderCTA = () => {
      if (!cta) return null;

      const { label, variant: ctaVariant = 'primary', size: ctaSize = 'sm', icon: ctaIcon } = cta;

      return (
        <div className="feature-card-cta">
          <button
            className={cn(
              'feature-card-cta-button',
              `feature-card-cta-button-${ctaVariant}`,
              `feature-card-cta-button-size-${ctaSize}`
            )}
            onClick={cta.onClick}
            disabled={isDisabled}
            type="button"
          >
            {ctaIcon && (
              <span className="feature-card-cta-icon">
                {ctaIcon}
              </span>
            )}
            <span className="feature-card-cta-label">{label}</span>
          </button>
        </div>
      );
    };

    // Render card content
    const renderContent = () => (
      <>
        {renderIcon()}
        
        <div className="feature-card-content">
          <h3 className={titleClasses}>
            {title}
          </h3>
          
          {description && (
            <p className={descriptionClasses}>
              {description}
            </p>
          )}
          
          {children && (
            <div className="feature-card-children">
              {children}
            </div>
          )}
          
          {renderCTA()}
        </div>
      </>
    );

    // Handle interactive states
    const handleClick = (event: React.MouseEvent) => {
      if (isDisabled) return;
      
      if (href && !onClick) {
        // Let the browser handle the link
        return;
      }
      
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (isDisabled) return;
      
      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
    };

    // Card element
    const cardElement = (
      <div
        ref={ref}
        id={id}
        className={cardClasses}
        style={customStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={isClickable && !isDisabled ? tabIndex ?? 0 : tabIndex}
        role={isClickable ? 'button' : 'article'}
        aria-disabled={isDisabled}
        aria-pressed={isClickable ? undefined : undefined}
        data-testid={dataTestid}
        {...(isClickable && !disabled ? { 'data-interactive': true } : {})}
        {...props}
      >
        {renderContent()}
      </div>
    );

    // Wrap in link if href is provided
    if (href && !onClick) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className="feature-card-link"
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              return;
            }
            onClick?.(event as any);
          }}
        >
          {cardElement}
        </a>
      );
    }

    return cardElement;
  }
);

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;