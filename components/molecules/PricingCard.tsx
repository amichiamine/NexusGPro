import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export interface PricingFeature {
  name: string
  included: boolean
  highlight?: boolean
  description?: string
  icon?: ReactNode
}

export interface PricingPlan {
  name: string
  price: number
  period?: 'month' | 'year' | 'week' | 'day'
  currency?: string
  description?: string
  badge?: string
  popular?: boolean
  recommended?: boolean
  features: PricingFeature[]
  cta?: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
  }
  limits?: {
    [key: string]: string | number
  }
}

export interface PricingCardProps {
  plan: PricingPlan
  variant?: 'default' | 'bordered' | 'elevated' | 'minimal' | 'glass' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  layout?: 'vertical' | 'horizontal'
  comparisonMode?: boolean
  popularBadge?: boolean
  showCheckmarks?: boolean
  showPricing?: boolean
  showLimits?: boolean
  animateOnHover?: boolean
  customBadge?: ReactNode
  onPlanSelect?: (plan: PricingPlan) => void
  className?: string
  disabled?: boolean
}

export interface PricingCardContextType {
  plan: PricingPlan
  variant: string
  size: string
  layout: string
  comparisonMode: boolean
  showCheckmarks: boolean
  showPricing: boolean
  showLimits: boolean
  animateOnHover: boolean
  disabled: boolean
  onPlanSelect: (plan: PricingPlan) => void
}

const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(({
  plan,
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  comparisonMode = false,
  popularBadge = true,
  showCheckmarks = true,
  showPricing = true,
  showLimits = false,
  animateOnHover = true,
  customBadge,
  onPlanSelect,
  className = '',
  disabled = false
}, ref) => {
  const contextValue: PricingCardContextType = {
    plan,
    variant,
    size,
    layout,
    comparisonMode,
    showCheckmarks,
    showPricing,
    showLimits,
    animateOnHover,
    disabled,
    onPlanSelect: onPlanSelect || (() => {})
  }

  const handlePlanSelect = () => {
    if (disabled) return
    contextValue.onPlanSelect(plan)
    plan.cta?.onClick?.()
  }

  const formatPrice = (price: number, currency: string = '$', period: string = 'month') => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '$' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
    
    const periodMap = {
      month: '/month',
      year: '/year',
      week: '/week',
      day: '/day'
    }
    
    return `${formattedPrice}${periodMap[period as keyof typeof periodMap] || '/month'}`
  }

  const formatLimit = (key: string, value: string | number) => {
    const limitMap: { [key: string]: string } = {
      'users': 'users',
      'projects': 'projects',
      'storage': 'GB',
      'bandwidth': 'GB/month',
      'api_calls': 'API calls/month',
      'support': 'support level'
    }
    
    const unit = limitMap[key] || ''
    return `${value} ${unit}`.trim()
  }

  const cardClasses = cn(
    'nexus-pricing-card',
    `nexus-pricing-card--${variant}`,
    `nexus-pricing-card--${size}`,
    `nexus-pricing-card--${layout}`,
    { 'nexus-pricing-card--comparison': comparisonMode },
    { 'nexus-pricing-card--popular': plan.popular },
    { 'nexus-pricing-card--recommended': plan.recommended },
    { 'nexus-pricing-card--interactive': animateOnHover && !disabled },
    { 'nexus-pricing-card--disabled': disabled },
    className
  )

  return (
    <div
      ref={ref}
      className={cardClasses}
      data-plan-name={plan.name}
      data-plan-price={plan.price}
      aria-label={`${plan.name} pricing plan`}
      role="article"
      tabIndex={disabled ? -1 : 0}
    >
      {/* Header */}
      <div className="nexus-pricing-card__header">
        {popularBadge && (plan.popular || plan.recommended) && (
          <div className="nexus-pricing-card__badge">
            {customBadge || (
              <span className="nexus-pricing-card__badge-text">
                {plan.badge || (plan.popular ? 'Most Popular' : plan.recommended ? 'Recommended' : '')}
              </span>
            )}
          </div>
        )}
        
        <div className="nexus-pricing-card__title-group">
          <h3 className="nexus-pricing-card__title">{plan.name}</h3>
          {plan.description && (
            <p className="nexus-pricing-card__description">{plan.description}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      {showPricing && (
        <div className="nexus-pricing-card__pricing">
          <div className="nexus-pricing-card__price">
            <span className="nexus-pricing-card__currency">
              {plan.currency || '$'}
            </span>
            <span className="nexus-pricing-card__amount">
              {plan.price}
            </span>
            <span className="nexus-pricing-card__period">
              /{plan.period || 'month'}
            </span>
          </div>
          
          {plan.price !== 0 && (
            <div className="nexus-pricing-card__billing-note">
              Billed {plan.period === 'year' ? 'annually' : 'monthly'}
            </div>
          )}
        </div>
      )}

      {/* Features */}
      <div className="nexus-pricing-card__features">
        <ul className="nexus-pricing-card__features-list">
          {plan.features.map((feature, index) => (
            <li 
              key={index}
              className={`nexus-pricing-card__feature ${
                feature.included ? 'included' : 'excluded'
              } ${feature.highlight ? 'highlight' : ''}`}
            >
              {showCheckmarks && (
                <span className="nexus-pricing-card__feature-icon" aria-hidden="true">
                  {feature.included ? '✓' : '✗'}
                </span>
              )}
              <span className="nexus-pricing-card__feature-text">
                {feature.name}
              </span>
              {feature.description && (
                <span className="nexus-pricing-card__feature-description">
                  {feature.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Limits */}
      {showLimits && plan.limits && (
        <div className="nexus-pricing-card__limits">
          <h4 className="nexus-pricing-card__limits-title">Plan Limits</h4>
          <ul className="nexus-pricing-card__limits-list">
            {Object.entries(plan.limits).map(([key, value]) => (
              <li key={key} className="nexus-pricing-card__limit">
                <span className="nexus-pricing-card__limit-key">{key}</span>
                <span className="nexus-pricing-card__limit-value">
                  {formatLimit(key, value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {plan.cta && (
        <div className="nexus-pricing-card__cta">
          <button
            type="button"
            className={`nexus-pricing-card__button nexus-button--${plan.cta.variant || 'primary'} nexus-button--${plan.cta.size || size}`}
            onClick={handlePlanSelect}
            disabled={disabled || !plan.cta.text}
            aria-label={`Choose ${plan.name} plan`}
          >
            {plan.cta.text}
          </button>
          
          {plan.cta.href && !disabled && (
            <a
              href={plan.cta.href}
              className="nexus-pricing-card__link"
              onClick={handlePlanSelect}
              aria-label={`Learn more about ${plan.name} plan`}
            >
              Learn More
            </a>
          )}
        </div>
      )}
    </div>
  )
})

PricingCard.displayName = 'PricingCard'

export default PricingCard