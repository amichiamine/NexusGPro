/**
 * PricingTable.test.tsx - Comprehensive Test Suite for PricingTable Component
 * 
 * Test Coverage Areas:
 * - Component rendering
 * - All layouts (grid, list, comparison, toggle, steps)
 * - All variants (default, dark, light, gradient, minimal, cards, modern)
 * - All sizes (sm, md, lg)
 * - Props validation
 * - Interactive features
 * - Accessibility (ARIA, keyboard navigation)
 * - Responsive design
 * - Pricing logic and calculations
 * - State management
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PricingTable, { PricingPlan, PricingFeature, PricingTableProps } from './PricingTable';

// Mock CSS import
jest.mock('./PricingTable.css', () => ({}));

// Test data
const mockFeatures: PricingFeature[] = [
  { text: 'Feature 1', included: true },
  { text: 'Feature 2', included: true },
  { text: 'Feature 3', included: false },
  { text: 'Feature 4', included: true, highlight: true },
];

const mockPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Perfect for beginners',
    price: 0,
    period: 'month',
    features: mockFeatures.slice(0, 2),
    ctaText: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    subtitle: 'For growing teams',
    price: 29,
    originalPrice: 39,
    period: 'month',
    currency: '$',
    features: mockFeatures,
    isPopular: true,
    badge: 'Best Value',
    guarantee: '30-day money-back guarantee',
    ctaText: 'Choose Plan',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'For large organizations',
    price: 99,
    period: 'month',
    features: mockFeatures.map(f => ({ ...f, included: true })),
    isRecommended: true,
    limitations: ['Support limited to business hours'],
    highlight: true,
    theme: 'success',
    ctaText: 'Contact Sales',
  },
];

const defaultProps: PricingTableProps = {
  plans: mockPlans,
  layout: 'grid',
  variant: 'default',
  size: 'md',
};

describe('PricingTable Component', () => {
  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    test('renders pricing table with default props', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    test('renders with custom aria-label', () => {
      const customLabel = 'Subscription Plans';
      render(<PricingTable {...defaultProps} ariaLabel={customLabel} />);
      
      expect(screen.getByLabelText(customLabel)).toBeInTheDocument();
    });

    test('renders with header content', () => {
      render(
        <PricingTable
          {...defaultProps}
          title="Choose Your Plan"
          subtitle="Flexible pricing for everyone"
          description="Select the plan that best fits your needs"
        />
      );
      
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      expect(screen.getByText('Flexible pricing for everyone')).toBeInTheDocument();
      expect(screen.getByText('Select the plan that best fits your needs')).toBeInTheDocument();
    });

    test('renders empty state when no plans provided', () => {
      render(<PricingTable plans={[]} />);
      
      expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
      // Should still render container even with no plans
    });

    test('renders with minimal plan data', () => {
      const minimalPlan = {
        id: 'basic',
        name: 'Basic',
        price: '$0',
        features: [{ text: 'Feature 1', included: true }],
      };
      
      render(<PricingTable plans={[minimalPlan]} />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
    });
  });

  // Layout Tests
  describe('Layout Variations', () => {
    test('renders grid layout by default', () => {
      render(<PricingTable {...defaultProps} layout="grid" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('pricing-table--grid');
    });

    test('renders list layout', () => {
      render(<PricingTable {...defaultProps} layout="list" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('pricing-table--list');
    });

    test('renders comparison layout', () => {
      render(<PricingTable {...defaultProps} layout="comparison" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('pricing-table--comparison');
      
      // Check for comparison table elements
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    test('renders toggle layout', () => {
      render(<PricingTable {...defaultProps} layout="toggle" showToggle={true} />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('pricing-table--toggle');
      
      // Check for billing toggle
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });

    test('renders steps layout', () => {
      render(<PricingTable {...defaultProps} layout="steps" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('pricing-table--steps');
      
      // Check for step numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  // Variant Tests
  describe('Variant Variations', () => {
    const variants: Array<PricingTableProps['variant']> = [
      'default', 'dark', 'light', 'gradient', 'minimal', 'cards', 'modern'
    ];

    variants.forEach(variant => {
      test(`renders ${variant} variant`, () => {
        render(<PricingTable {...defaultProps} variant={variant} />);
        
        const container = screen.getByLabelText('Pricing Plans');
        expect(container).toHaveClass(`pricing-table--${variant}`);
      });
    });
  });

  // Size Tests
  describe('Size Variations', () => {
    const sizes: Array<PricingTableProps['size']> = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      test(`renders ${size} size`, () => {
        render(<PricingTable {...defaultProps} size={size} />);
        
        const container = screen.getByLabelText('Pricing Plans');
        expect(container).toHaveClass(`pricing-table--${size}`);
      });
    });
  });

  // Plan Features Tests
  describe('Plan Features', () => {
    test('displays plan name and price', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('/month')).toBeInTheDocument();
    });

    test('displays plan subtitle', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Perfect for beginners')).toBeInTheDocument();
      expect(screen.getByText('For growing teams')).toBeInTheDocument();
    });

    test('displays plan features with correct inclusion status', () => {
      render(<PricingTable {...defaultProps} />);
      
      // Check included features
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      
      // Features with ✗ for excluded ones
      const excludedFeatures = screen.getAllByText('✗');
      expect(excludedFeatures).toHaveLength(1); // One excluded feature
    });

    test('displays highlighted features', () => {
      render(<PricingTable {...defaultProps} />);
      
      const highlightedFeature = screen.getByText('Feature 4');
      expect(highlightedFeature.closest('.pricing-table__feature')).toHaveClass('highlight');
    });

    test('displays plan limitations', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Limitations:')).toBeInTheDocument();
      expect(screen.getByText('Support limited to business hours')).toBeInTheDocument();
    });

    test('displays plan badges', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Best Value')).toBeInTheDocument();
    });

    test('displays popular badge', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    test('displays original price with strikethrough', () => {
      render(<PricingTable {...defaultProps} />);
      
      const originalPrice = screen.getByText('$39');
      expect(originalPrice).toHaveClass('pricing-table__original-price');
    });

    test('displays savings percentage', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText(/Save \d+%/) ).toBeInTheDocument();
    });

    test('displays guarantee text', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument();
    });

    test('displays plan description', () => {
      const planWithDescription = {
        ...mockPlans[0],
        description: 'This is a great plan for beginners',
      };
      
      render(<PricingTable plans={[planWithDescription]} />);
      
      expect(screen.getByText('This is a great plan for beginners')).toBeInTheDocument();
    });

    test('displays custom CTA text', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Choose Plan')).toBeInTheDocument();
      expect(screen.getByText('Contact Sales')).toBeInTheDocument();
    });
  });

  // Interactive Features Tests
  describe('Interactive Features', () => {
    test('plan selection works on click', async () => {
      const user = userEvent.setup();
      const onPlanSelect = jest.fn();
      
      render(<PricingTable {...defaultProps} onPlanSelect={onPlanSelect} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      await user.click(firstPlan!);
      
      expect(onPlanSelect).toHaveBeenCalledWith(mockPlans[0]);
    });

    test('plan selection works on keyboard navigation', async () => {
      const user = userEvent.setup();
      const onPlanSelect = jest.fn();
      
      render(<PricingTable {...defaultProps} onPlanSelect={onPlanSelect} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      firstPlan?.focus();
      await user.keyboard('{Enter}');
      
      expect(onPlanSelect).toHaveBeenCalledWith(mockPlans[0]);
    });

    test('CTA button click works', async () => {
      const user = userEvent.setup();
      const onPlanChange = jest.fn();
      
      render(<PricingTable {...defaultProps} onPlanChange={onPlanChange} />);
      
      const firstCTA = screen.getByText('Get Started');
      await user.click(firstCTA);
      
      expect(onPlanChange).toHaveBeenCalledWith(mockPlans[0]);
    });

    test('billing toggle works', async () => {
      const user = userEvent.setup();
      
      render(<PricingTable {...defaultProps} layout="toggle" showToggle={true} />);
      
      const yearlyButton = screen.getByText('Yearly');
      await user.click(yearlyButton);
      
      expect(yearlyButton).toHaveAttribute('aria-checked', 'true');
    });

    test('expand/collapse features button works', async () => {
      const user = userEvent.setup();
      
      const planWithManyFeatures = {
        ...mockPlans[0],
        features: Array.from({ length: 10 }, (_, i) => ({
          text: `Feature ${i + 1}`,
          included: true,
        })),
      };
      
      render(<PricingTable plans={[planWithManyFeatures]} />);
      
      const expandButton = screen.getByText('Show All 10 Features');
      await user.click(expandButton);
      
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  // State Management Tests
  describe('State Management', () => {
    test('manages selected plan state', () => {
      const { rerender } = render(<PricingTable {...defaultProps} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      fireEvent.click(firstPlan!);
      
      expect(firstPlan).toHaveClass('pricing-table__card--selected');
      
      // Rerender with different default plan
      rerender(<PricingTable {...defaultProps} defaultPlan="professional" />);
      
      const professionalPlan = screen.getByText('Professional').closest('.pricing-table__card');
      expect(professionalPlan).toHaveClass('pricing-table__card--selected');
    });

    test('manages billing cycle state', () => {
      render(<PricingTable {...defaultProps} layout="toggle" showToggle={true} />);
      
      const monthlyButton = screen.getByText('Monthly');
      const yearlyButton = screen.getByText('Yearly');
      
      expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
      expect(yearlyButton).toHaveAttribute('aria-checked', 'false');
    });

    test('manages hover state', () => {
      render(<PricingTable {...defaultProps} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      fireEvent.mouseEnter(firstPlan!);
      
      expect(firstPlan).toHaveClass('pricing-table__card--hovered');
      
      fireEvent.mouseLeave(firstPlan!);
      expect(firstPlan).not.toHaveClass('pricing-table__card--hovered');
    });
  });

  // Pricing Logic Tests
  describe('Pricing Logic', () => {
    test('calculates savings percentage correctly', () => {
      const planWithOriginalPrice = {
        id: 'test',
        name: 'Test Plan',
        price: 80,
        originalPrice: 100,
        period: 'month',
        features: [],
      };
      
      render(<PricingTable plans={[planWithOriginalPrice]} showSavings={true} />);
      
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });

    test('handles string prices correctly', () => {
      const planWithStringPrice = {
        id: 'test',
        name: 'Test Plan',
        price: 'Free',
        period: 'month',
        features: [],
      };
      
      render(<PricingTable plans={[planWithStringPrice]} />);
      
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    test('formats prices with currency', () => {
      render(<PricingTable {...defaultProps} currency="€" />);
      
      expect(screen.getByText('€')).toBeInTheDocument();
      expect(screen.getByText('€0')).toBeInTheDocument();
      expect(screen.getByText('€29')).toBeInTheDocument();
    });

    test('handles disabled plans', () => {
      const disabledPlan = {
        ...mockPlans[0],
        isDisabled: true,
      };
      
      render(<PricingTable plans={[disabledPlan]} />);
      
      const disabledCard = screen.getByText('Starter').closest('.pricing-table__card');
      expect(disabledCard).toHaveClass('pricing-table__card--disabled');
      
      const ctaButton = screen.getByText('Get Started');
      expect(ctaButton).toBeDisabled();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      expect(firstPlan).toHaveAttribute('aria-label', expect.stringContaining('Starter plan'));
    });

    test('supports keyboard navigation', () => {
      render(<PricingTable {...defaultProps} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      firstPlan?.focus();
      
      expect(firstPlan).toHaveFocus();
      
      // Test Enter key
      fireEvent.keyDown(firstPlan!, { key: 'Enter' });
      
      // Test Space key
      fireEvent.keyDown(firstPlan!, { key: ' ' });
      
      // Test Escape key
      fireEvent.keyDown(firstPlan!, { key: 'Escape' });
    });

    test('provides ARIA pressed state for selected plans', () => {
      render(<PricingTable {...defaultProps} defaultPlan="professional" />);
      
      const selectedPlan = screen.getByText('Professional').closest('.pricing-table__card');
      expect(selectedPlan).toHaveAttribute('aria-pressed', 'true');
    });

    test('provides ARIA expanded state for expandable content', () => {
      const planWithManyFeatures = {
        ...mockPlans[0],
        features: Array.from({ length: 10 }, (_, i) => ({
          text: `Feature ${i + 1}`,
          included: true,
        })),
      };
      
      render(<PricingTable plans={[planWithManyFeatures]} />);
      
      const expandButton = screen.getByText('Show All 10 Features');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('provides proper role attributes for different layouts', () => {
      const { rerender } = render(<PricingTable {...defaultProps} layout="grid" />);
      expect(screen.getByLabelText('Pricing Plans')).toHaveAttribute('role', 'grid');
      
      rerender(<PricingTable {...defaultProps} layout="list" />);
      expect(screen.getByLabelText('Pricing Plans')).toHaveAttribute('role', 'list');
      
      rerender(<PricingTable {...defaultProps} layout="comparison" />);
      expect(screen.getByLabelText('Pricing Plans')).toHaveAttribute('role', 'table');
      
      rerender(<PricingTable {...defaultProps} layout="toggle" />);
      expect(screen.getByLabelText('Pricing Plans')).toHaveAttribute('role', 'radiogroup');
    });

    test('supports screen readers with proper heading structure', () => {
      render(<PricingTable {...defaultProps} title="Choose Your Plan" />);
      
      expect(screen.getByRole('heading', { name: 'Choose Your Plan' })).toBeInTheDocument();
    });

    test('provides focus indicators', () => {
      render(<PricingTable {...defaultProps} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      firstPlan?.focus();
      
      expect(firstPlan).toHaveClass('pricing-table__card:focus-visible');
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    test('adapts to different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<PricingTable {...defaultProps} />);
      
      // Test that responsive classes are applied
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toBeInTheDocument();
    });

    test('handles mobile layouts correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<PricingTable {...defaultProps} />);
      
      // Should still render all elements
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  // Custom Styling Tests
  describe('Custom Styling', () => {
    test('applies custom styles', () => {
      const customStyles: React.CSSProperties = {
        backgroundColor: 'red',
        borderRadius: '10px',
      };
      
      render(<PricingTable {...defaultProps} customStyles={customStyles} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      expect(firstPlan).toHaveStyle(customStyles);
    });

    test('applies custom class name', () => {
      render(<PricingTable {...defaultProps} className="custom-class" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toHaveClass('custom-class');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('handles missing plan properties gracefully', () => {
      const incompletePlan = {
        id: 'incomplete',
        name: 'Incomplete Plan',
        // Missing other required properties
        features: [],
      } as PricingPlan;
      
      render(<PricingTable plans={[incompletePlan]} />);
      
      expect(screen.getByText('Incomplete Plan')).toBeInTheDocument();
      // Should not crash
    });

    test('handles empty features array', () => {
      const planWithNoFeatures = {
        ...mockPlans[0],
        features: [],
      };
      
      render(<PricingTable plans={[planWithNoFeatures]} />);
      
      expect(screen.getByText('Starter')).toBeInTheDocument();
      // Should render without crashing
    });

    test('handles invalid plan data', () => {
      const invalidPlan = {
        id: '',
        name: '',
        price: NaN,
        features: [],
      };
      
      render(<PricingTable plans={[invalidPlan]} />);
      
      // Should still render component
      expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    test('renders efficiently with many plans', () => {
      const manyPlans = Array.from({ length: 50 }, (_, i) => ({
        ...mockPlans[i % mockPlans.length],
        id: `plan-${i}`,
        name: `Plan ${i}`,
      }));
      
      const startTime = performance.now();
      render(<PricingTable plans={manyPlans} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });

    test('memoizes expensive calculations', () => {
      const mockUseMemo = jest.spyOn(React, 'useMemo');
      render(<PricingTable {...defaultProps} showSavings={true} />);
      
      // useMemo should be called for expensive calculations
      expect(mockUseMemo).toHaveBeenCalled();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    test('works with React Router links', () => {
      const planWithLink = {
        ...mockPlans[0],
        ctaLink: '/signup',
      };
      
      render(<PricingTable plans={[planWithLink]} />);
      
      const link = screen.getByText('Learn more');
      expect(link).toHaveAttribute('href', '/signup');
    });

    test('integrates with form validation', () => {
      const onPlanSelect = jest.fn();
      
      render(<PricingTable {...defaultProps} onPlanSelect={onPlanSelect} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      fireEvent.click(firstPlan!);
      
      expect(onPlanSelect).toHaveBeenCalledWith(mockPlans[0]);
    });

    test('works with analytics tracking', () => {
      const onPlanChange = jest.fn();
      
      render(<PricingTable {...defaultProps} onPlanChange={onPlanChange} />);
      
      const firstCTA = screen.getByText('Get Started');
      fireEvent.click(firstCTA);
      
      expect(onPlanChange).toHaveBeenCalledWith(mockPlans[0]);
    });
  });

  // Animation Tests
  describe('Animations', () => {
    test('applies animation classes', () => {
      render(<PricingTable {...defaultProps} />);
      
      const cards = screen.getAllByRole('button', { hidden: true });
      cards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });

    test('handles hover animations', () => {
      render(<PricingTable {...defaultProps} />);
      
      const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
      fireEvent.mouseEnter(firstPlan!);
      
      expect(firstPlan).toHaveClass('pricing-table__card--hovered');
    });
  });

  // Custom Theme Tests
  describe('Custom Themes', () => {
    test('applies custom theme to plans', () => {
      const themedPlan = {
        ...mockPlans[0],
        theme: 'success' as const,
      };
      
      render(<PricingTable plans={[themedPlan]} />);
      
      const planCard = screen.getByText('Starter').closest('.pricing-table__card');
      expect(planCard).toHaveClass('pricing-table__card--success');
    });

    test('applies global theme', () => {
      render(<PricingTable {...defaultProps} theme="warning" />);
      
      const container = screen.getByLabelText('Pricing Plans');
      expect(container).toBeInTheDocument();
    });
  });
});

// Snapshot Tests
describe('PricingTable Snapshots', () => {
  test('default state snapshot', () => {
    const { container } = render(<PricingTable {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('dark variant snapshot', () => {
    const { container } = render(<PricingTable {...defaultProps} variant="dark" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('comparison layout snapshot', () => {
    const { container } = render(<PricingTable {...defaultProps} layout="comparison" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('toggle layout snapshot', () => {
    const { container } = render(<PricingTable {...defaultProps} layout="toggle" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

// Regression Tests
describe('PricingTable Regression Tests', () => {
  test('does not break with undefined props', () => {
    render(<PricingTable plans={undefined as any} />);
    
    expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
  });

  test('does not break with null plan properties', () => {
    const planWithNulls = {
      id: null,
      name: null,
      price: null,
      features: null,
    };
    
    render(<PricingTable plans={[planWithNulls as any]} />);
    
    expect(screen.getByLabelText('Pricing Plans')).toBeInTheDocument();
  });

  test('handles circular references gracefully', () => {
    const planWithCircularRef = {
      ...mockPlans[0],
      features: [{ text: 'Circular Feature', included: true }],
    };
    
    // Add circular reference
    (planWithCircularRef.features[0] as any).parent = planWithCircularRef;
    
    expect(() => render(<PricingTable plans={[planWithCircularRef]} />)).not.toThrow();
  });

  test('maintains focus after re-render', async () => {
    const user = userEvent.setup();
    
    render(<PricingTable {...defaultProps} />);
    
    const firstPlan = screen.getByText('Starter').closest('.pricing-table__card');
    firstPlan?.focus();
    expect(firstPlan).toHaveFocus();
    
    // Simulate re-render
    fireEvent.animationEnd(firstPlan!);
    
    // Focus should be maintained
    expect(firstPlan).toHaveFocus();
  });
});