import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import PricingCard, { PricingPlan, PricingFeature } from './PricingCard'

// Mock ResizeObserver for responsive tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const createMockPlan = (overrides = {}): PricingPlan => ({
  name: 'Professional',
  price: 29,
  period: 'month',
  currency: '$',
  description: 'Perfect for growing businesses',
  badge: 'Most Popular',
  popular: false,
  recommended: false,
  features: [
    { name: 'Feature A', included: true },
    { name: 'Feature B', included: true },
    { name: 'Feature C', included: false }
  ],
  cta: {
    text: 'Choose Plan',
    href: '/pricing/professional',
    variant: 'primary',
    size: 'md'
  },
  limits: {
    users: '10',
    projects: 'Unlimited',
    storage: '100'
  },
  ...overrides
})

const renderPricingCard = (props = {}) => {
  const defaultProps = {
    plan: createMockPlan(),
    ...props
  }
  return render(<PricingCard {...defaultProps} />)
}

describe('PricingCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================

  describe('Basic Rendering', () => {
    it('should render pricing card with default plan', () => {
      const { container } = renderPricingCard()
      
      expect(container.querySelector('.nexus-pricing-card')).toBeInTheDocument()
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should render plan name', () => {
      renderPricingCard()
      
      expect(screen.getByText('Professional')).toBeInTheDocument()
    })

    it('should render plan price', () => {
      renderPricingCard()
      
      expect(screen.getByText('$29')).toBeInTheDocument()
      expect(screen.getByText('/month')).toBeInTheDocument()
    })

    it('should render plan description', () => {
      renderPricingCard()
      
      expect(screen.getByText('Perfect for growing businesses')).toBeInTheDocument()
    })

    it('should render all features', () => {
      renderPricingCard()
      
      expect(screen.getByText('Feature A')).toBeInTheDocument()
      expect(screen.getByText('Feature B')).toBeInTheDocument()
      expect(screen.getByText('Feature C')).toBeInTheDocument()
    })

    it('should render CTA button', () => {
      renderPricingCard()
      
      expect(screen.getByText('Choose Plan')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Choose Professional plan' })).toBeInTheDocument()
    })

    it('should render limits section', () => {
      renderPricingCard({ showLimits: true })
      
      expect(screen.getByText('Plan Limits')).toBeInTheDocument()
      expect(screen.getByText('10 users')).toBeInTheDocument()
      expect(screen.getByText('Unlimited projects')).toBeInTheDocument()
      expect(screen.getByText('100 GB')).toBeInTheDocument()
    })

    it('should render billing note', () => {
      renderPricingCard()
      
      expect(screen.getByText('Billed monthly')).toBeInTheDocument()
    })

    it('should render billing note for annual plans', () => {
      renderPricingCard({ 
        plan: createMockPlan({ period: 'year' }) 
      })
      
      expect(screen.getByText('Billed annually')).toBeInTheDocument()
    })
  })

  // ==========================================
  // PROPS TESTS
  // ==========================================

  describe('Props Configuration', () => {
    it('should handle custom plan props', () => {
      const customPlan = createMockPlan({
        name: 'Enterprise',
        price: 99,
        period: 'year',
        currency: '€',
        description: 'For large organizations'
      })
      
      render(<PricingCard plan={customPlan} />)
      
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
      expect(screen.getByText('€99')).toBeInTheDocument()
      expect(screen.getByText('/year')).toBeInTheDocument()
      expect(screen.getByText('For large organizations')).toBeInTheDocument()
    })

    it('should handle zero price (free plan)', () => {
      const freePlan = createMockPlan({
        price: 0,
        period: 'month',
        currency: '$'
      })
      
      render(<PricingCard plan={freePlan} />)
      
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.queryByText('Billed')).not.toBeInTheDocument()
    })

    it('should handle plan with custom badge', () => {
      const planWithBadge = createMockPlan({
        badge: 'Limited Time',
        popular: false,
        recommended: false
      })
      
      render(<PricingCard plan={planWithBadge} />)
      
      expect(screen.getByText('Limited Time')).toBeInTheDocument()
    })

    it('should handle plan with popular flag', () => {
      renderPricingCard({ 
        plan: createMockPlan({ popular: true }) 
      })
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass('nexus-pricing-card--popular')
    })

    it('should handle plan with recommended flag', () => {
      renderPricingCard({ 
        plan: createMockPlan({ recommended: true }) 
      })
      
      expect(screen.getByText('Recommended')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass('nexus-pricing-card--recommended')
    })

    it('should handle plan without CTA', () => {
      const planWithoutCTA = createMockPlan({
        cta: undefined
      })
      
      render(<PricingCard plan={planWithoutCTA} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should handle plan without limits', () => {
      const planWithoutLimits = createMockPlan({
        limits: undefined
      })
      
      render(<PricingCard plan={planWithoutLimits} showLimits={true} />)
      
      expect(screen.queryByText('Plan Limits')).not.toBeInTheDocument()
    })

    it('should handle className prop', () => {
      const { container } = renderPricingCard({ className: 'custom-class' })
      
      expect(container.querySelector('.nexus-pricing-card')).toHaveClass('custom-class')
    })
  })

  // ==========================================
  // VARIANT TESTS
  // ==========================================

  describe('Variants', () => {
    const variants = ['default', 'bordered', 'elevated', 'minimal', 'glass', 'gradient']
    
    variants.forEach(variant => {
      it(`should render ${variant} variant`, () => {
        const { container } = renderPricingCard({ variant })
        
        expect(container.querySelector('.nexus-pricing-card')).toHaveClass(`nexus-pricing-card--${variant}`)
      })
    })

    it('should render bordered variant with thicker borders', () => {
      const { container } = renderPricingCard({ variant: 'bordered' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ borderWidth: '2px' })
    })

    it('should render elevated variant with shadow', () => {
      const { container } = renderPricingCard({ variant: 'elevated' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ boxShadow: expect.stringContaining('shadow') })
      expect(card).toHaveStyle({ border: 'none' })
    })

    it('should render minimal variant with transparent background', () => {
      const { container } = renderPricingCard({ variant: 'minimal' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ background: 'transparent' })
    })

    it('should render glass variant with backdrop filter', () => {
      const { container } = renderPricingCard({ variant: 'glass' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ backdropFilter: 'blur(10px)' })
      expect(card).toHaveStyle({ background: 'rgba(255, 255, 255, 0.8)' })
    })

    it('should render gradient variant with background gradient', () => {
      const { container } = renderPricingCard({ variant: 'gradient' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ background: expect.stringContaining('linear-gradient') })
    })
  })

  // ==========================================
  // SIZE TESTS
  // ==========================================

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg']
    
    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        const { container } = renderPricingCard({ size })
        
        expect(container.querySelector('.nexus-pricing-card')).toHaveClass(`nexus-pricing-card--${size}`)
      })
    })

    it('should apply sm size styles', () => {
      const { container } = renderPricingCard({ size: 'sm' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ padding: '1rem' })
      
      const title = container.querySelector('.nexus-pricing-card__title')
      expect(title).toHaveStyle({ fontSize: '1.125rem' })
      
      const amount = container.querySelector('.nexus-pricing-card__amount')
      expect(amount).toHaveStyle({ fontSize: '2rem' })
    })

    it('should apply lg size styles', () => {
      const { container } = renderPricingCard({ size: 'lg' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ padding: '2rem' })
      
      const title = container.querySelector('.nexus-pricing-card__title')
      expect(title).toHaveStyle({ fontSize: '1.5rem' })
      
      const amount = container.querySelector('.nexus-pricing-card__amount')
      expect(amount).toHaveStyle({ fontSize: '3rem' })
    })
  })

  // ==========================================
  // LAYOUT TESTS
  // ==========================================

  describe('Layouts', () => {
    const layouts = ['vertical', 'horizontal']
    
    layouts.forEach(layout => {
      it(`should render ${layout} layout`, () => {
        const { container } = renderPricingCard({ layout })
        
        expect(container.querySelector('.nexus-pricing-card')).toHaveClass(`nexus-pricing-card--${layout}`)
      })
    })

    it('should apply horizontal layout styles', () => {
      const { container } = renderPricingCard({ layout: 'horizontal' })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ flexDirection: 'row' })
      
      const header = container.querySelector('.nexus-pricing-card__header')
      expect(header).toHaveStyle({ width: '30%' })
      
      const pricing = container.querySelector('.nexus-pricing-card__pricing')
      expect(pricing).toHaveStyle({ width: '20%' })
      
      const features = container.querySelector('.nexus-pricing-card__features')
      expect(features).toHaveStyle({ width: '30%' })
      
      const cta = container.querySelector('.nexus-pricing-card__cta')
      expect(cta).toHaveStyle({ width: '20%' })
    })
  })

  // ==========================================
  // FEATURE TESTS
  // ==========================================

  describe('Features', () => {
    it('should render included features with checkmarks', () => {
      renderPricingCard()
      
      const featureItems = screen.getAllByRole('listitem')
      expect(featureItems).toHaveLength(3)
      
      // Features with checkmarks (included)
      const includedFeatures = container => 
        Array.from(container.querySelectorAll('.nexus-pricing-card__feature'))
          .filter(feature => feature.classList.contains('included'))
      
      const { container } = renderPricingCard()
      const included = includedFeatures(container)
      expect(included).toHaveLength(2) // Feature A and B are included
    })

    it('should render excluded features with X marks', () => {
      renderPricingCard()
      
      const featureItems = screen.getAllByRole('listitem')
      const excludedFeatures = featureItems.filter(item => 
        item.classList.contains('nexus-pricing-card__feature') &&
        item.classList.contains('excluded')
      )
      expect(excludedFeatures).toHaveLength(1) // Feature C is excluded
    })

    it('should handle feature with description', () => {
      const planWithFeatureDescription = createMockPlan({
        features: [
          { name: 'Feature A', included: true, description: 'Advanced feature description' }
        ]
      })
      
      render(<PricingCard plan={planWithFeatureDescription} />)
      
      expect(screen.getByText('Advanced feature description')).toBeInTheDocument()
    })

    it('should handle feature with highlight', () => {
      const planWithHighlightedFeature = createMockPlan({
        features: [
          { name: 'Premium Feature', included: true, highlight: true }
        ]
      })
      
      render(<PricingCard plan={planWithHighlightedFeature} />)
      
      const premiumFeature = screen.getByText('Premium Feature').closest('.nexus-pricing-card__feature')
      expect(premiumFeature).toHaveClass('highlight')
    })

    it('should hide checkmarks when showCheckmarks is false', () => {
      const { container } = renderPricingCard({ showCheckmarks: false })
      
      const featureIcons = container.querySelectorAll('.nexus-pricing-card__feature-icon')
      expect(featureIcons).toHaveLength(0)
    })

    it('should show checkmarks when showCheckmarks is true', () => {
      const { container } = renderPricingCard({ showCheckmarks: true })
      
      const featureIcons = container.querySelectorAll('.nexus-pricing-card__feature-icon')
      expect(featureIcons).toHaveLength(3) // One for each feature
    })
  })

  // ==========================================
  // PRICING TESTS
  // ==========================================

  describe('Pricing Display', () => {
    it('should hide pricing when showPricing is false', () => {
      const { container } = renderPricingCard({ showPricing: false })
      
      expect(container.querySelector('.nexus-pricing-card__pricing')).not.toBeInTheDocument()
    })

    it('should show pricing when showPricing is true', () => {
      const { container } = renderPricingCard({ showPricing: true })
      
      expect(container.querySelector('.nexus-pricing-card__pricing')).toBeInTheDocument()
    })

    it('should format price correctly with different currencies', () => {
      const euroPlan = createMockPlan({
        price: 25,
        currency: '€'
      })
      
      render(<PricingCard plan={euroPlan} />)
      
      expect(screen.getByText('€25')).toBeInTheDocument()
    })

    it('should format decimal prices correctly', () => {
      const decimalPlan = createMockPlan({
        price: 19.99
      })
      
      render(<PricingCard plan={decimalPlan} />)
      
      expect(screen.getByText('$19.99')).toBeInTheDocument()
    })

    it('should handle different periods', () => {
      const weeklyPlan = createMockPlan({
        price: 10,
        period: 'week'
      })
      
      render(<PricingCard plan={weeklyPlan} />)
      
      expect(screen.getByText('$10')).toBeInTheDocument()
      expect(screen.getByText('/week')).toBeInTheDocument()
      expect(screen.getByText('Billed weekly')).toBeInTheDocument()
    })
  })

  // ==========================================
  // CTA TESTS
  // ==========================================

  describe('Call to Action', () => {
    it('should render CTA button with correct text', () => {
      renderPricingCard()
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Choose Plan')
    })

    it('should call onClick when CTA is clicked', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} />)
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      await user.click(button)
      
      expect(onPlanSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Professional'
      }))
    })

    it('should call plan CTA onClick when clicked', async () => {
      const user = userEvent.setup()
      const planOnClick = vi.fn()
      
      const planWithOnClick = createMockPlan({
        cta: {
          text: 'Choose Plan',
          onClick: planOnClick
        }
      })
      
      render(<PricingCard plan={planWithOnClick} />)
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      await user.click(button)
      
      expect(planOnClick).toHaveBeenCalled()
    })

    it('should render link when CTA has href', () => {
      renderPricingCard()
      
      expect(screen.getByText('Learn More')).toBeInTheDocument()
    })

    it('should not render link when CTA has no href', () => {
      const planWithoutLink = createMockPlan({
        cta: {
          text: 'Choose Plan'
          // No href
        }
      })
      
      render(<PricingCard plan={planWithoutLink} />)
      
      expect(screen.queryByText('Learn More')).not.toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      renderPricingCard({ disabled: true })
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      expect(button).toBeDisabled()
    })

    it('should handle different button variants', () => {
      const planWithSecondaryCTA = createMockPlan({
        cta: {
          text: 'Choose Plan',
          variant: 'secondary'
        }
      })
      
      render(<PricingCard plan={planWithSecondaryCTA} />)
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      expect(button).toHaveClass('nexus-button--secondary')
    })
  })

  // ==========================================
  // BADGE TESTS
  // ==========================================

  describe('Badges', () => {
    it('should show badge when popular is true', () => {
      renderPricingCard({ 
        plan: createMockPlan({ popular: true }),
        popularBadge: true 
      })
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass('nexus-pricing-card--popular')
    })

    it('should show badge when recommended is true', () => {
      renderPricingCard({ 
        plan: createMockPlan({ recommended: true }),
        popularBadge: true 
      })
      
      expect(screen.getByText('Recommended')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass('nexus-pricing-card--recommended')
    })

    it('should not show badge when popularBadge is false', () => {
      renderPricingCard({ 
        plan: createMockPlan({ popular: true }),
        popularBadge: false 
      })
      
      expect(screen.queryByText('Most Popular')).not.toBeInTheDocument()
    })

    it('should render custom badge', () => {
      const customBadge = <span>Custom Badge</span>
      
      renderPricingCard({ 
        plan: createMockPlan({ popular: true }),
        customBadge 
      })
      
      expect(screen.getByText('Custom Badge')).toBeInTheDocument()
    })

    it('should not show badge when both popular and recommended are false', () => {
      renderPricingCard({ 
        plan: createMockPlan({ popular: false, recommended: false }),
        popularBadge: true 
      })
      
      expect(screen.queryByText('Most Popular')).not.toBeInTheDocument()
      expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    })
  })

  // ==========================================
  // LIMITS TESTS
  // ==========================================

  describe('Plan Limits', () => {
    it('should show limits when showLimits is true and limits exist', () => {
      renderPricingCard({ showLimits: true })
      
      expect(screen.getByText('Plan Limits')).toBeInTheDocument()
      expect(screen.getByText('10 users')).toBeInTheDocument()
      expect(screen.getByText('Unlimited projects')).toBeInTheDocument()
      expect(screen.getByText('100 GB')).toBeInTheDocument()
    })

    it('should not show limits when showLimits is false', () => {
      const { container } = renderPricingCard({ showLimits: false })
      
      expect(container.querySelector('.nexus-pricing-card__limits')).not.toBeInTheDocument()
    })

    it('should not show limits when limits are undefined', () => {
      renderPricingCard({ 
        plan: createMockPlan({ limits: undefined }),
        showLimits: true 
      })
      
      expect(screen.queryByText('Plan Limits')).not.toBeInTheDocument()
    })

    it('should format limits correctly', () => {
      const planWithCustomLimits = createMockPlan({
        limits: {
          users: '5',
          projects: '10',
          storage: '50',
          bandwidth: '1000'
        }
      })
      
      render(<PricingCard plan={planWithCustomLimits} showLimits={true} />)
      
      expect(screen.getByText('5 users')).toBeInTheDocument()
      expect(screen.getByText('10 projects')).toBeInTheDocument()
      expect(screen.getByText('50 GB')).toBeInTheDocument()
      expect(screen.getByText('1000 GB/month')).toBeInTheDocument()
    })
  })

  // ==========================================
  // COMPARISON MODE TESTS
  // ==========================================

  describe('Comparison Mode', () => {
    it('should apply comparison mode styles', () => {
      const { container } = renderPricingCard({ comparisonMode: true })
      
      expect(container.querySelector('.nexus-pricing-card')).toHaveClass('nexus-pricing-card--comparison')
      expect(container.querySelector('.nexus-pricing-card')).toHaveClass('nexus-pricing-card--popular')
    })

    it('should highlight features in comparison mode', () => {
      const { container } = renderPricingCard({ 
        plan: createMockPlan({
          features: [
            { name: 'Feature A', included: true, highlight: true }
          ]
        }),
        comparisonMode: true 
      })
      
      const highlightedFeature = container.querySelector('.nexus-pricing-card__feature--highlight')
      expect(highlightedFeature).toBeInTheDocument()
    })

    it('should limit features container height in comparison mode', () => {
      const { container } = renderPricingCard({ comparisonMode: true })
      
      const features = container.querySelector('.nexus-pricing-card__features')
      expect(features).toHaveStyle({ maxHeight: '400px' })
    })
  })

  // ==========================================
  // INTERACTION TESTS
  // ==========================================

  describe('Interactions', () => {
    it('should handle card hover when interactive', () => {
      const { container } = renderPricingCard({ animateOnHover: true })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveClass('nexus-pricing-card--interactive')
      
      fireEvent.mouseEnter(card)
      // Hover styles would be applied here
      expect(card).toHaveStyle({ transform: 'translateY(-4px)' })
    })

    it('should not be interactive when disabled', () => {
      const { container } = renderPricingCard({ disabled: true, animateOnHover: true })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveClass('nexus-pricing-card--disabled')
      expect(card).not.toHaveClass('nexus-pricing-card--interactive')
    })

    it('should not animate when animateOnHover is false', () => {
      const { container } = renderPricingCard({ animateOnHover: false })
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).not.toHaveClass('nexus-pricing-card--interactive')
    })

    it('should handle card click when interactive', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} />)
      
      const card = screen.getByRole('article')
      await user.click(card)
      
      expect(onPlanSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Professional'
      }))
    })
  })

  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      renderPricingCard()
      
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should have proper ARIA label', () => {
      renderPricingCard()
      
      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Professional pricing plan')
    })

    it('should be focusable when not disabled', () => {
      renderPricingCard()
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should not be focusable when disabled', () => {
      renderPricingCard({ disabled: true })
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('tabindex', '-1')
    })

    it('should have proper button ARIA labels', () => {
      renderPricingCard()
      
      expect(screen.getByRole('button', { name: 'Choose Professional plan' })).toBeInTheDocument()
    })

    it('should have proper link ARIA labels', () => {
      renderPricingCard()
      
      expect(screen.getByRole('link', { name: 'Learn more about Professional plan' })).toBeInTheDocument()
    })

    it('should have focus styles for keyboard navigation', () => {
      const { container } = renderPricingCard()
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ outline: 'none' })
    })
  })

  // ==========================================
  // KEYBOARD NAVIGATION TESTS
  // ==========================================

  describe('Keyboard Navigation', () => {
    it('should handle Enter key on card', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} />)
      
      const card = screen.getByRole('article')
      await user.tab()
      await user.keypress('{Enter}')
      
      expect(onPlanSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Professional'
      }))
    })

    it('should handle Space key on card', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} />)
      
      const card = screen.getByRole('article')
      await user.tab()
      await user.keypress(' ')
      
      expect(onPlanSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Professional'
      }))
    })

    it('should not handle keyboard events when disabled', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} disabled={true} />)
      
      const card = screen.getByRole('article')
      await user.tab()
      await user.keypress('{Enter}')
      
      expect(onPlanSelect).not.toHaveBeenCalled()
    })
  })

  // ==========================================
  // EDGE CASES TESTS
  // ==========================================

  describe('Edge Cases', () => {
    it('should handle plan with no features', () => {
      const planWithNoFeatures = createMockPlan({
        features: []
      })
      
      render(<PricingCard plan={planWithNoFeatures} />)
      
      const featureList = screen.querySelector('.nexus-pricing-card__features-list')
      expect(featureList).toBeInTheDocument()
      expect(featureList?.children).toHaveLength(0)
    })

    it('should handle plan with very high price', () => {
      const expensivePlan = createMockPlan({
        price: 999999
      })
      
      render(<PricingCard plan={expensivePlan} />)
      
      expect(screen.getByText('$999999')).toBeInTheDocument()
    })

    it('should handle plan with negative price', () => {
      const negativePlan = createMockPlan({
        price: -5
      })
      
      render(<PricingCard plan={negativePlan} />)
      
      expect(screen.getByText('$-5')).toBeInTheDocument()
    })

    it('should handle plan with long name', () => {
      const planWithLongName = createMockPlan({
        name: 'Professional Enterprise Solution with Advanced Features'
      })
      
      render(<PricingCard plan={planWithLongName} />)
      
      expect(screen.getByText('Professional Enterprise Solution with Advanced Features')).toBeInTheDocument()
    })

    it('should handle plan with special characters in name', () => {
      const planWithSpecialChars = createMockPlan({
        name: 'Pro™ Plus (Premium)'
      })
      
      render(<PricingCard plan={planWithSpecialChars} />)
      
      expect(screen.getByText('Pro™ Plus (Premium)')).toBeInTheDocument()
    })

    it('should handle plan with emoji in name', () => {
      const planWithEmoji = createMockPlan({
        name: 'Pro 🚀 Enterprise'
      })
      
      render(<PricingCard plan={planWithEmoji} />)
      
      expect(screen.getByText('Pro 🚀 Enterprise')).toBeInTheDocument()
    })
  })

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('Performance', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = renderPricingCard()
      
      const renderSpy = vi.spyOn(PricingCard, 'displayName', 'get')
      
      // Rerender with same props
      rerender(<PricingCard plan={createMockPlan()} />)
      
      // Should not cause unnecessary re-renders
      expect(renderSpy).not.toHaveBeenCalled()
      
      renderSpy.mockRestore()
    })

    it('should handle many features efficiently', () => {
      const planWithManyFeatures = createMockPlan({
        features: Array.from({ length: 100 }, (_, i) => ({
          name: `Feature ${i}`,
          included: i % 2 === 0
        }))
      })
      
      const start = performance.now()
      render(<PricingCard plan={planWithManyFeatures} />)
      const end = performance.now()
      
      expect(end - start).toBeLessThan(100) // Should render within 100ms
    })

    it('should handle rapid clicks efficiently', async () => {
      const user = userEvent.setup()
      const onPlanSelect = vi.fn()
      
      render(<PricingCard plan={createMockPlan()} onPlanSelect={onPlanSelect} />)
      
      const button = screen.getByRole('button', { name: 'Choose Professional plan' })
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button)
      }
      
      expect(onPlanSelect).toHaveBeenCalledTimes(10)
    })
  })

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Integration', () => {
    it('should work with other pricing cards', () => {
      render(
        <>
          <PricingCard plan={createMockPlan()} />
          <PricingCard plan={createMockPlan({ name: 'Enterprise', price: 99 })} />
          <PricingCard plan={createMockPlan({ name: 'Starter', price: 9 })} />
        </>
      )
      
      expect(screen.getAllByRole('article')).toHaveLength(3)
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
      expect(screen.getByText('Starter')).toBeInTheDocument()
    })

    it('should work in form context', () => {
      render(
        <form>
          <PricingCard plan={createMockPlan()} />
        </form>
      )
      
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('should work in grid layout', () => {
      render(
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <PricingCard plan={createMockPlan()} />
          <PricingCard plan={createMockPlan({ name: 'Enterprise' })} />
          <PricingCard plan={createMockPlan({ name: 'Starter' })} />
        </div>
      )
      
      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(3)
    })

    it('should work with custom styling', () => {
      const { container } = render(
        <div className="pricing-container">
          <PricingCard plan={createMockPlan()} className="custom-pricing-card" />
        </div>
      )
      
      const card = container.querySelector('.custom-pricing-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('nexus-pricing-card')
    })
  })

  // ==========================================
  // SNAPSHOT TESTS
  // ==========================================

  describe('Snapshots', () => {
    it('should match default snapshot', () => {
      const { container } = renderPricingCard()
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match popular plan snapshot', () => {
      const { container } = render(
        <PricingCard 
          plan={createMockPlan({ popular: true })}
          variant="elevated"
          size="lg"
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match minimal plan snapshot', () => {
      const { container } = render(
        <PricingCard 
          plan={createMockPlan({ popular: false })}
          variant="minimal"
          size="sm"
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match comparison mode snapshot', () => {
      const { container } = render(
        <PricingCard 
          plan={createMockPlan()}
          comparisonMode={true}
          showLimits={true}
          layout="horizontal"
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ==========================================
  // FORWARD REF TESTS
  // ==========================================

  describe('Forward Ref', () => {
    it('should forward ref to card element', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<PricingCard ref={ref} plan={createMockPlan()} />)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.tagName).toBe('DIV')
    })

    it('should provide access to card element methods', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<PricingCard ref={ref} plan={createMockPlan()} />)
      
      expect(ref.current).toHaveClass('nexus-pricing-card')
      expect(ref.current).toHaveAttribute('role', 'article')
      expect(ref.current).toHaveAttribute('data-plan-name', 'Professional')
      expect(ref.current).toHaveAttribute('data-plan-price', '29')
    })

    it('should work with callback refs', () => {
      const refCallback = vi.fn()
      
      render(<PricingCard ref={refCallback} plan={createMockPlan()} />)
      
      expect(refCallback).toHaveBeenCalled()
      expect(refCallback.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ==========================================
  // ANIMATION TESTS
  // ==========================================

  describe('Animations', () => {
    it('should have fade-in animation on mount', () => {
      const { container } = renderPricingCard()
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ animation: expect.stringContaining('fade-in') })
    })

    it('should have scale-in animation for popular cards', () => {
      const { container } = render(
        <PricingCard plan={createMockPlan({ popular: true })} />
      )
      
      const card = container.querySelector('.nexus-pricing-card--popular')
      expect(card).toHaveStyle({ animation: expect.stringContaining('scale-in') })
    })

    it('should have staggered feature animations', () => {
      const { container } = renderPricingCard()
      
      const features = container.querySelectorAll('.nexus-pricing-card__feature')
      expect(features[0]).toHaveStyle({ animationDelay: '0ms' })
      expect(features[1]).toHaveStyle({ animationDelay: '50ms' })
      expect(features[2]).toHaveStyle({ animationDelay: '100ms' })
    })

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      const { container } = renderPricingCard()
      
      const card = container.querySelector('.nexus-pricing-card')
      expect(card).toHaveStyle({ animation: 'none' })
    })
  })
})

// ==========================================
// TEST UTILITIES
// ==========================================

export const createTestPricingCard = (overrides = {}) => {
  const defaultProps = {
    plan: createMockPlan(),
    ...overrides
  }
  
  return {
    props: defaultProps,
    utils: {
      getPlanName: () => screen.getByText('Professional'),
      getPlanPrice: () => screen.getByText('$29'),
      getCTAText: () => screen.getByText('Choose Plan'),
      getFeatureCount: () => screen.getAllByRole('listitem').length,
      clickCTA: async () => {
        const user = userEvent.setup()
        const button = screen.getByRole('button', { name: 'Choose Professional plan' })
        await user.click(button)
      },
      clickCard: async () => {
        const user = userEvent.setup()
        const card = screen.getByRole('article')
        await user.click(card)
      },
      getCardElement: () => screen.getByRole('article'),
      getFeatureByName: (name: string) => screen.getByText(name),
      isPopular: () => screen.getByRole('article').classList.contains('nexus-pricing-card--popular'),
      isRecommended: () => screen.getByRole('article').classList.contains('nexus-pricing-card--recommended')
    }
  }
}

export default createTestPricingCard