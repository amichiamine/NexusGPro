import React, { forwardRef, useState, useEffect, useMemo } from 'react'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import './StatsCard.css'

// Types
export interface StatsCardProps {
  // Core data
  title: string
  value: string | number
  delta?: string | number
  subtitle?: string
  description?: string
  
  // Visual elements
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  iconBackground?: string
  
  // Comparisons and benchmarks
  comparison?: {
    value: string | number
    label: string
    type?: 'increase' | 'decrease' | 'neutral'
  }
  benchmark?: {
    value: string | number
    label: string
    target?: string | number
  }
  
  // Formatting
  format?: 'number' | 'currency' | 'percentage' | 'compact'
  currency?: string
  locale?: string
  
  // Layout and styling
  layout?: 'default' | 'compact' | 'detailed' | 'minimal'
  variant?: 'default' | 'outlined' | 'filled' | 'elevated' | 'glass' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  // States
  loading?: boolean
  error?: string
  disabled?: boolean
  
  // Interactivity
  clickable?: boolean
  onClick?: () => void
  onHover?: (hovered: boolean) => void
  
  // Customization
  color?: string
  backgroundColor?: string
  className?: string
  style?: React.CSSProperties
  
  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  
  // Ref
  ref?: React.RefObject<HTMLDivElement>
  
  // Animation
  animated?: boolean
  delay?: number
  
  // Tooltip
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  
  // Progress indicator
  progress?: {
    current: number
    target: number
    label?: string
  }
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(({
  // Core data
  title,
  value,
  delta,
  subtitle,
  description,
  
  // Visual elements
  icon: Icon,
  iconColor,
  iconBackground,
  
  // Comparisons and benchmarks
  comparison,
  benchmark,
  
  // Formatting
  format = 'number',
  currency = 'USD',
  locale = 'en-US',
  
  // Layout and styling
  layout = 'default',
  variant = 'default',
  size = 'md',
  
  // States
  loading = false,
  error,
  disabled = false,
  
  // Interactivity
  clickable = false,
  onClick,
  onHover,
  
  // Customization
  color,
  backgroundColor,
  className,
  style,
  
  // Accessibility
  'aria-label': ariaLabel = `Statistics card for ${title}`,
  'aria-describedby': ariaDescribedBy,
  
  // Animation
  animated = true,
  delay = 0,
  
  // Tooltip
  tooltip,
  tooltipPosition = 'top',
  
  // Progress indicator
  progress,
}, ref) => {
  // State management
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  // Animation trigger
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [animated, delay])
  
  // Animate numeric values
  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 1000 // 1 second
      const steps = 60 // 60 FPS
      const increment = value / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setAnimatedValue(value)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [isVisible, value])
  
  // Format value based on format prop
  const formatValue = useMemo(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, ''))
    
    if (isNaN(numValue)) return value.toString()
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          notation: 'compact',
          compactDisplay: 'short'
        }).format(numValue)
        
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(numValue / 100)
        
      case 'compact':
        return new Intl.NumberFormat(locale, {
          notation: 'compact',
          compactDisplay: 'short'
        }).format(numValue)
        
      case 'number':
      default:
        return new Intl.NumberFormat(locale).format(numValue)
    }
  }, [value, format, currency, locale])
  
  // Determine delta status
  const getDeltaStatus = () => {
    if (!delta) return null
    
    const deltaStr = delta.toString()
    const isNegative = deltaStr.startsWith('-') || deltaStr.includes('−')
    const isPositive = deltaStr.startsWith('+') || deltaStr.includes('+')
    
    if (isNegative) return 'decrease'
    if (isPositive) return 'increase'
    return 'neutral'
  }
  
  const deltaStatus = getDeltaStatus()
  
  // Get icon for comparison type
  const getComparisonIcon = (type?: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <ArrowUpIcon className="statscard__delta-icon" />
      case 'decrease':
        return <ArrowDownIcon className="statscard__delta-icon" />
      default:
        return <MinusIcon className="statscard__delta-icon" />
    }
  }
  
  // Handle interactions
  const handleClick = () => {
    if (!disabled && clickable && onClick) {
      onClick()
    }
  }
  
  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(false)
  }
  
  // Compute progress percentage
  const progressPercentage = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0
  
  // Computed classes
  const containerClasses = useMemo(() => cn(
    'statscard',
    `statscard--${layout}`,
    `statscard--${variant}`,
    `statscard--${size}`,
    {
      'statscard--loading': loading,
      'statscard--error': !!error,
      'statscard--disabled': disabled,
      'statscard--clickable': clickable && !disabled,
      'statscard--hovered': isHovered,
      'statscard--animated': animated && isVisible,
      [`statscard--delta-${deltaStatus}`]: deltaStatus,
      [`statscard--comparison-${comparison?.type}`]: comparison?.type,
    }
  ), [layout, variant, size, loading, error, disabled, clickable, isHovered, animated, isVisible, deltaStatus, comparison?.type])
  
  // Inline styles
  const containerStyle = {
    ...style,
    ...(color && { color }),
    ...(backgroundColor && { backgroundColor })
  }
  
  // Loading skeleton
  if (loading) {
    return (
      <div 
        ref={ref}
        className={containerClasses}
        style={containerStyle}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <div className="statscard__skeleton">
          <div className="statscard__skeleton-icon" />
          <div className="statscard__skeleton-content">
            <div className="statscard__skeleton-title" />
            <div className="statscard__skeleton-value" />
            <div className="statscard__skeleton-delta" />
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div 
        ref={ref}
        className={containerClasses}
        style={containerStyle}
        role="alert"
        aria-label={`Error in ${title} statistics`}
      >
        <div className="statscard__error">
          <p className="statscard__error-text">{error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={ref}
      className={cn(containerClasses, className)}
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      onKeyDown={clickable && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Tooltip */}
      {tooltip && (
        <div 
          className={`statscard__tooltip statscard__tooltip--${tooltipPosition}`}
          role="tooltip"
        >
          {tooltip}
        </div>
      )}
      
      <div className="statscard__header">
        {/* Icon */}
        {Icon && (
          <div 
            className="statscard__icon"
            style={{
              color: iconColor,
              backgroundColor: iconBackground
            }}
            aria-hidden="true"
          >
            <Icon />
          </div>
        )}
        
        {/* Title and subtitle */}
        <div className="statscard__header-content">
          <h3 className="statscard__title">{title}</h3>
          {subtitle && <p className="statscard__subtitle">{subtitle}</p>}
        </div>
      </div>
      
      {/* Main value */}
      <div className="statscard__main">
        <div className="statscard__value">
          {typeof value === 'number' && animated ? animatedValue.toLocaleString() : formatValue}
        </div>
        
        {/* Delta indicator */}
        {delta && (
          <div className={`statscard__delta statscard__delta--${deltaStatus}`}>
            {getComparisonIcon(deltaStatus)}
            <span className="statscard__delta-text">{delta}</span>
          </div>
        )}
      </div>
      
      {/* Comparison */}
      {comparison && (
        <div className="statscard__comparison">
          <span className="statscard__comparison-label">{comparison.label}</span>
          <span className="statscard__comparison-value">
            {typeof comparison.value === 'number' 
              ? comparison.value.toLocaleString() 
              : comparison.value
            }
          </span>
        </div>
      )}
      
      {/* Benchmark */}
      {benchmark && (
        <div className="statscard__benchmark">
          <div className="statscard__benchmark-header">
            <span className="statscard__benchmark-label">{benchmark.label}</span>
            <span className="statscard__benchmark-target">
              Target: {benchmark.target?.toLocaleString() || 'N/A'}
            </span>
          </div>
          <div className="statscard__benchmark-bar">
            <div 
              className="statscard__benchmark-progress"
              style={{ width: `${Math.min((benchmark.value as number / (benchmark.target as number || 1)) * 100, 100)}%` }}
            />
          </div>
          <div className="statscard__benchmark-value">
            {typeof benchmark.value === 'number' 
              ? benchmark.value.toLocaleString() 
              : benchmark.value
            }
          </div>
        </div>
      )}
      
      {/* Progress indicator */}
      {progress && (
        <div className="statscard__progress">
          <div className="statscard__progress-header">
            <span className="statscard__progress-label">{progress.label || 'Progress'}</span>
            <span className="statscard__progress-value">
              {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
            </span>
          </div>
          <div className="statscard__progress-bar">
            <div 
              className="statscard__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="statscard__progress-percentage">
            {progressPercentage.toFixed(1)}%
          </div>
        </div>
      )}
      
      {/* Description */}
      {description && (
        <p className="statscard__description">{description}</p>
      )}
      
      {/* Layout variations content */}
      {layout === 'detailed' && (
        <div className="statscard__details">
          <div className="statscard__detail-item">
            <span className="statscard__detail-label">Period:</span>
            <span className="statscard__detail-value">Last 30 days</span>
          </div>
          <div className="statscard__detail-item">
            <span className="statscard__detail-label">Change:</span>
            <span className="statscard__detail-value">+12.5% from previous</span>
          </div>
        </div>
      )}
      
      {/* Interactive indicator */}
      {clickable && !disabled && (
        <div className="statscard__interaction-indicator" aria-hidden="true">
          Click to view details
        </div>
      )}
    </div>
  )
})

StatsCard.displayName = 'StatsCard'

export default StatsCard