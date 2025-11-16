import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils';
import './PricingTable.css';

export interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  subtitle?: string;
  price: string | number;
  originalPrice?: string | number;
  period?: string;
  currency?: string;
  description?: string;
  features: PricingFeature[];
  isPopular?: boolean;
  isRecommended?: boolean;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  isDisabled?: boolean;
  limitations?: string[];
  highlight?: boolean;
  theme?: 'default' | 'success' | 'warning' | 'error';
  icon?: string;
  image?: string;
  guarantee?: string;
  savings?: string;
  discount?: string;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  layout?: 'grid' | 'list' | 'comparison' | 'toggle' | 'steps';
  variant?: 'default' | 'dark' | 'light' | 'gradient' | 'minimal' | 'cards' | 'modern';
  size?: 'sm' | 'md' | 'lg';
  showComparison?: boolean;
  showToggle?: boolean;
  defaultPlan?: string;
  comparisonFeatures?: string[];
  currency?: string;
  onPlanSelect?: (plan: PricingPlan) => void;
  onPlanChange?: (plan: PricingPlan) => void;
  showPopular?: boolean;
  showSavings?: boolean;
  showBadges?: boolean;
  customStyles?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  theme?: 'default' | 'success' | 'warning' | 'error';
}

const PricingTable: React.FC<PricingTableProps> = ({
  plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      period: 'month',
      features: [
        { text: '1 theme', included: true },
        { text: 'Basic support', included: true },
        { text: '5GB storage', included: true },
      ],
    }
  ],
  layout = 'grid',
  variant = 'default',
  size = 'md',
  showComparison = false,
  showToggle = false,
  defaultPlan,
  comparisonFeatures = [],
  currency = '$',
  onPlanSelect,
  onPlanChange,
  showPopular = true,
  showSavings = true,
  showBadges = true,
  customStyles,
  className = '',
  ariaLabel = 'Pricing Plans',
  title,
  subtitle,
  description,
  theme = 'default',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlan || plans[0]?.id || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const handlePlanClick = useCallback((plan: PricingPlan) => {
    if (plan.isDisabled) return;
    setSelectedPlan(plan.id);
    onPlanSelect?.(plan);
  }, [onPlanSelect]);

  const handlePlanChange = useCallback((plan: PricingPlan) => {
    if (plan.isDisabled) return;
    onPlanChange?.(plan);
  }, [onPlanChange]);

  const calculateSavings = useCallback((plan: PricingPlan) => {
    if (!plan.originalPrice || !showSavings) return null;
    const original = typeof plan.originalPrice === 'string' 
      ? parseFloat(plan.originalPrice.replace(/[^0-9.]/g, ''))
      : plan.originalPrice;
    const current = typeof plan.price === 'string'
      ? parseFloat(plan.price.replace(/[^0-9.]/g, ''))
      : plan.price;
    
    if (original && current && original > current) {
      const savings = ((original - current) / original) * 100;
      return Math.round(savings);
    }
    return null;
  }, [showSavings]);

  const formatPrice = useCallback((price: string | number) => {
    if (typeof price === 'number') {
      return `${currency}${price.toLocaleString()}`;
    }
    return price;
  }, [currency]);

  const renderPlanCard = useCallback((plan: PricingPlan, index: number) => {
    const isSelected = selectedPlan === plan.id;
    const isHovered = hoveredCard === plan.id;
    const isExpanded = expandedPlan === plan.id;
    const savings = calculateSavings(plan);

    const cardClasses = cn(
      'pricing-table__card',
      `pricing-table__card--${variant}`,
      `pricing-table__card--${size}`,
      { 'pricing-table__card--selected': isSelected },
      { 'pricing-table__card--hovered': isHovered },
      { 'pricing-table__card--expanded': isExpanded },
      { 'pricing-table__card--popular': plan.isPopular },
      { 'pricing-table__card--recommended': plan.isRecommended },
      { 'pricing-table__card--disabled': plan.isDisabled },
      { 'pricing-table__card--highlight': plan.highlight },
      `pricing-table__card--${plan.theme || theme}`,
      className
    );

    return (
      <div
        key={plan.id}
        className={cardClasses}
        style={customStyles}
        onMouseEnter={() => setHoveredCard(plan.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handlePlanClick(plan)}
        role="button"
        tabIndex={plan.isDisabled ? -1 : 0}
        aria-pressed={isSelected}
        aria-expanded={isExpanded}
        aria-label={`${plan.name} plan - ${formatPrice(plan.price)} per ${plan.period || 'month'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlanClick(plan);
          }
          if (e.key === 'Escape') {
            setExpandedPlan(null);
          }
        }}
      >
        {/* Plan Header */}
        <div className="pricing-table__header">
          {/* Badge */}
          {showBadges && plan.badge && (
            <div className="pricing-table__badge" aria-label={`Badge: ${plan.badge}`}>
              {plan.badge}
            </div>
          )}
          
          {/* Popular Badge */}
          {showPopular && plan.isPopular && (
            <div className="pricing-table__badge pricing-table__badge--popular">
              Most Popular
            </div>
          )}

          {/* Plan Icon */}
          {plan.icon && (
            <div className="pricing-table__icon" aria-hidden="true">
              <img src={plan.icon} alt={`${plan.name} icon`} />
            </div>
          )}

          {/* Plan Image */}
          {plan.image && (
            <div className="pricing-table__image" aria-hidden="true">
              <img src={plan.image} alt={`${plan.name} illustration`} />
            </div>
          )}

          <h3 className="pricing-table__plan-name">{plan.name}</h3>
          
          {plan.subtitle && (
            <p className="pricing-table__plan-subtitle">{plan.subtitle}</p>
          )}
        </div>

        {/* Plan Price */}
        <div className="pricing-table__price-section">
          <div className="pricing-table__price-container">
            <div className="pricing-table__price-wrapper">
              <span className="pricing-table__currency">{currency}</span>
              <span className="pricing-table__price">{formatPrice(plan.price)}</span>
              <span className="pricing-table__period">/{plan.period || 'month'}</span>
            </div>
            
            {/* Original Price */}
            {plan.originalPrice && (
              <div className="pricing-table__original-price">
                {formatPrice(plan.originalPrice)}
              </div>
            )}

            {/* Savings */}
            {savings && (
              <div className="pricing-table__savings" aria-label={`Save ${savings}%`}>
                Save {savings}%
              </div>
            )}

            {/* Discount */}
            {plan.discount && (
              <div className="pricing-table__discount" aria-label={`Discount: ${plan.discount}`}>
                {plan.discount}
              </div>
            )}
          </div>

          {/* Guarantee */}
          {plan.guarantee && (
            <div className="pricing-table__guarantee">{plan.guarantee}</div>
          )}
        </div>

        {/* Plan Description */}
        {plan.description && (
          <p className="pricing-table__description">{plan.description}</p>
        )}

        {/* Plan Features */}
        <div className="pricing-table__features">
          <ul className="pricing-table__features-list">
            {plan.features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
                className={`pricing-table__feature ${
                  feature.included ? 'included' : 'excluded'
                } ${feature.highlight ? 'highlight' : ''}`}
              >
                <span className="pricing-table__feature-icon" aria-hidden="true">
                  {feature.included ? '✓' : '✗'}
                </span>
                <span className="pricing-table__feature-text">{feature.text}</span>
              </li>
            ))}
          </ul>

          {/* Limitations */}
          {plan.limitations && plan.limitations.length > 0 && (
            <div className="pricing-table__limitations">
              <h4>Limitations:</h4>
              <ul>
                {plan.limitations.map((limitation, index) => (
                  <li key={index}>{limitation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Expand/Collapse Button */}
          {plan.features.length > 5 && (
            <button
              className="pricing-table__expand-button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedPlan(isExpanded ? null : plan.id);
              }}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse features' : 'Expand features'}
            >
              {isExpanded ? 'Show Less' : `Show All ${plan.features.length} Features`}
            </button>
          )}
        </div>

        {/* Plan CTA */}
        <div className="pricing-table__cta">
          <button
            className={`pricing-table__button ${
              plan.isPopular ? 'pricing-table__button--primary' : 'pricing-table__button--secondary'
            }`}
            disabled={plan.isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              handlePlanChange(plan);
            }}
          >
            {plan.ctaText || 'Choose Plan'}
          </button>

          {plan.ctaLink && (
            <a
              href={plan.ctaLink}
              className="pricing-table__link"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more
            </a>
          )}
        </div>
      </div>
    );
  }, [
    variant, size, selectedPlan, hoveredCard, expandedPlan, theme,
    showPopular, showSavings, showBadges, formatPrice, calculateSavings,
    handlePlanClick, handlePlanChange, className, customStyles, currency
  ]);

  const renderGridLayout = useCallback(() => (
    <div 
      className={`pricing-table pricing-table--grid pricing-table--${variant} pricing-table--${size}`}
      role="grid"
      aria-label={ariaLabel}
    >
      <div className="pricing-table__grid">
        {plans.map((plan, index) => renderPlanCard(plan, index))}
      </div>
    </div>
  ), [variant, size, ariaLabel, plans, renderPlanCard]);

  const renderListLayout = useCallback(() => (
    <div 
      className={`pricing-table pricing-table--list pricing-table--${variant} pricing-table--${size}`}
      role="list"
      aria-label={ariaLabel}
    >
      <div className="pricing-table__list">
        {plans.map((plan, index) => (
          <div key={plan.id} className="pricing-table__list-item">
            {renderPlanCard(plan, index)}
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, ariaLabel, plans, renderPlanCard]);

  const renderComparisonLayout = useCallback(() => {
    const allFeatures = useMemo(() => {
      const features = new Set<string>();
      plans.forEach(plan => {
        plan.features.forEach(feature => features.add(feature.text));
      });
      return Array.from(features);
    }, [plans]);

    return (
      <div 
        className={`pricing-table pricing-table--comparison pricing-table--${variant} pricing-table--${size}`}
        role="table"
        aria-label={ariaLabel}
      >
        <div className="pricing-table__comparison">
          {/* Features Header */}
          <div className="pricing-table__comparison-row pricing-table__comparison-header">
            <div className="pricing-table__comparison-cell pricing-table__comparison-features">
              Features
            </div>
            {plans.map(plan => (
              <div key={plan.id} className="pricing-table__comparison-cell">
                {plan.name}
              </div>
            ))}
          </div>

          {/* Features Rows */}
          {allFeatures.map((featureText, index) => (
            <div key={index} className="pricing-table__comparison-row">
              <div className="pricing-table__comparison-cell pricing-table__comparison-features">
                {featureText}
              </div>
              {plans.map(plan => {
                const feature = plan.features.find(f => f.text === featureText);
                return (
                  <div key={plan.id} className="pricing-table__comparison-cell">
                    {feature ? (feature.included ? '✓' : '✗') : '-'}
                  </div>
                );
              })}
            </div>
          ))}

          {/* CTA Row */}
          <div className="pricing-table__comparison-row pricing-table__comparison-cta">
            <div className="pricing-table__comparison-cell pricing-table__comparison-features">
              Choose Plan
            </div>
            {plans.map(plan => (
              <div key={plan.id} className="pricing-table__comparison-cell">
                <button
                  className={`pricing-table__button ${
                    plan.isPopular ? 'pricing-table__button--primary' : 'pricing-table__button--secondary'
                  }`}
                  disabled={plan.isDisabled}
                  onClick={() => handlePlanChange(plan)}
                >
                  {plan.ctaText || 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [variant, size, ariaLabel, plans, handlePlanChange]);

  const renderToggleLayout = useCallback(() => (
    <div 
      className={`pricing-table pricing-table--toggle pricing-table--${variant} pricing-table--${size}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {/* Billing Toggle */}
      {showToggle && (
        <div className="pricing-table__billing-toggle">
          <button
            className={`pricing-table__toggle-button ${
              billingCycle === 'monthly' ? 'active' : ''
            }`}
            onClick={() => setBillingCycle('monthly')}
            role="radio"
            aria-checked={billingCycle === 'monthly'}
          >
            Monthly
          </button>
          <button
            className={`pricing-table__toggle-button ${
              billingCycle === 'yearly' ? 'active' : ''
            }`}
            onClick={() => setBillingCycle('yearly')}
            role="radio"
            aria-checked={billingCycle === 'yearly'}
          >
            Yearly
            <span className="pricing-table__toggle-savings">Save 20%</span>
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="pricing-table__grid">
        {plans.map((plan, index) => renderPlanCard(plan, index))}
      </div>
    </div>
  ), [variant, size, ariaLabel, plans, renderPlanCard, showToggle, billingCycle]);

  const renderStepsLayout = useCallback(() => (
    <div 
      className={`pricing-table pricing-table--steps pricing-table--${variant} pricing-table--${size}`}
      role="list"
      aria-label={ariaLabel}
    >
      <div className="pricing-table__steps">
        {plans.map((plan, index) => (
          <div key={plan.id} className="pricing-table__step">
            <div className="pricing-table__step-number">{index + 1}</div>
            <div className="pricing-table__step-content">
              {renderPlanCard(plan, index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, ariaLabel, plans, renderPlanCard]);

  const renderTableHeader = useCallback(() => {
    if (!title && !subtitle && !description) return null;

    return (
      <header className="pricing-table__header-section">
        {title && <h2 className="pricing-table__title">{title}</h2>}
        {subtitle && <h3 className="pricing-table__subtitle">{subtitle}</h3>}
        {description && <p className="pricing-table__description">{description}</p>}
      </header>
    );
  }, [title, subtitle, description]);

  const tableContent = useMemo(() => {
    switch (layout) {
      case 'grid':
        return renderGridLayout();
      case 'list':
        return renderListLayout();
      case 'comparison':
        return renderComparisonLayout();
      case 'toggle':
        return renderToggleLayout();
      case 'steps':
        return renderStepsLayout();
      default:
        return renderGridLayout();
    }
  }, [layout, renderGridLayout, renderListLayout, renderComparisonLayout, renderToggleLayout, renderStepsLayout]);

  return (
    <section className="pricing-table__container" aria-label={ariaLabel}>
      {renderTableHeader()}
      {tableContent}
    </section>
  );
};

export default PricingTable;