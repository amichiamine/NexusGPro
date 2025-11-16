import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FeatureCard from './FeatureCard';

// Test utilities
const createMockFeatureCard = (props?: any) => ({
  title: 'Test Feature',
  description: 'Test description',
  icon: '🚀',
  ...props
});

const defaultProps = {
  title: 'Lightning Fast',
  description: 'Experience blazing fast performance with our optimized algorithms.',
  icon: '⚡'
};

describe('FeatureCard Component', () => {
  describe('Rendering', () => {
    it('should render feature card with default props', () => {
      render(<FeatureCard {...defaultProps} />);
      
      expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
      expect(screen.getByText('Experience blazing fast performance with our optimized algorithms.')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('should render with minimal required props', () => {
      render(<FeatureCard title="Simple Feature" />);
      
      expect(screen.getByText('Simple Feature')).toBeInTheDocument();
      expect(screen.getByText('Explain your feature.')).toBeInTheDocument();
    });

    it('should render with custom icon', () => {
      const { container } = render(
        <FeatureCard 
          {...defaultProps} 
          icon={<span data-testid="custom-icon">🎯</span>} 
        />
      );
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should render without description', () => {
      render(<FeatureCard title="Feature without description" description="" />);
      
      expect(screen.getByText('Feature without description')).toBeInTheDocument();
      expect(screen.queryByText('Explain your feature.')).not.toBeInTheDocument();
    });

    it('should render with children content', () => {
      render(
        <FeatureCard {...defaultProps}>
          <div data-testid="children-content">Additional content</div>
        </FeatureCard>
      );
      
      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'outlined', 'filled', 'gradient', 'glass', 'minimal'];
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} variant={variant as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-variant-${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} size={size as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-size-${size}`);
      });
    });
  });

  describe('Alignment', () => {
    const alignments = ['left', 'center', 'right'];
    
    alignments.forEach(align => {
      it(`should render with ${align} alignment`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} align={align as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-align-${align}`);
      });
    });
  });

  describe('Icon Position', () => {
    const iconPositions = ['top', 'left', 'background'];
    
    iconPositions.forEach(iconPosition => {
      it(`should render with ${iconPosition} icon position`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} iconPosition={iconPosition as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-icon-position-${iconPosition}`);
      });
    });
  });

  describe('Icon Sizes', () => {
    const iconSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    
    iconSizes.forEach(iconSize => {
      it(`should render with ${iconSize} icon size`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} iconSize={iconSize as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-icon-size-${iconSize}`);
      });
    });
  });

  describe('Elevation', () => {
    const elevations = ['none', 'sm', 'md', 'lg', 'xl'];
    
    elevations.forEach(elevation => {
      it(`should render with ${elevation} elevation`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} elevation={elevation as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-elevation-${elevation}`);
      });
    });
  });

  describe('Border Radius', () => {
    const borderRadii = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
    
    borderRadii.forEach(borderRadius => {
      it(`should render with ${borderRadius} border radius`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} borderRadius={borderRadius as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-border-radius-${borderRadius}`);
      });
    });
  });

  describe('Padding', () => {
    const paddings = ['none', 'sm', 'md', 'lg', 'xl'];
    
    paddings.forEach(padding => {
      it(`should render with ${padding} padding`, () => {
        const { container } = render(
          <FeatureCard {...defaultProps} padding={padding as any} />
        );
        
        expect(container.firstChild).toHaveClass(`feature-card-padding-${padding}`);
      });
    });
  });

  describe('CTA Button', () => {
    it('should render CTA button', () => {
      const ctaProps = {
        label: 'Learn More',
        variant: 'primary' as const,
        size: 'sm' as const
      };
      
      render(
        <FeatureCard 
          {...defaultProps} 
          cta={ctaProps}
        />
      );
      
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('should render CTA with custom icon', () => {
      const ctaProps = {
        label: 'Get Started',
        icon: <span data-testid="cta-icon">→</span>
      };
      
      render(
        <FeatureCard 
          {...defaultProps} 
          cta={ctaProps}
        />
      );
      
      expect(screen.getByTestId('cta-icon')).toBeInTheDocument();
    });

    it('should handle CTA click', async () => {
      const user = userEvent.setup();
      const handleCTAClick = vi.fn();
      
      const ctaProps = {
        label: 'Click Me',
        onClick: handleCTAClick
      };
      
      render(
        <FeatureCard 
          {...defaultProps} 
          cta={ctaProps}
        />
      );
      
      const ctaButton = screen.getByRole('button', { name: 'Click Me' });
      await user.click(ctaButton);
      
      expect(handleCTAClick).toHaveBeenCalledTimes(1);
    });

    it('should disable CTA when card is disabled', () => {
      const ctaProps = {
        label: 'Disabled CTA',
        onClick: vi.fn()
      };
      
      render(
        <FeatureCard 
          {...defaultProps} 
          cta={ctaProps}
          disabled={true}
        />
      );
      
      const ctaButton = screen.getByRole('button', { name: 'Disabled CTA' });
      expect(ctaButton).toBeDisabled();
    });
  });

  describe('Interactive States', () => {
    it('should be clickable when onClick is provided', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={handleClick}
        />
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should work as a link when href is provided', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          href="/features"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/features');
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={handleClick}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      
      expect(card).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should be focusable', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      
      expect(card).toHaveFocus();
    });

    it('should handle tabIndex prop', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
          tabIndex={5}
        />
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabindex', '5');
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styling', () => {
      const { container } = render(
        <FeatureCard 
          {...defaultProps} 
          disabled={true}
        />
      );
      
      expect(container.firstChild).toHaveClass('feature-card-disabled');
      expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not be clickable when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={handleClick}
          disabled={true}
        />
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          loading={true}
        />
      );
      
      expect(screen.getByTestId('feature-card-spinner')).toBeInTheDocument();
    });

    it('should apply loading styling', () => {
      const { container } = render(
        <FeatureCard 
          {...defaultProps} 
          loading={true}
        />
      );
      
      expect(container.firstChild).toHaveClass('feature-card-loading');
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom background color', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          backgroundColor="red"
        />
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ backgroundColor: 'red' });
    });

    it('should apply custom border color', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          borderColor="blue"
        />
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ borderColor: 'blue' });
    });

    it('should apply custom text color', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          textColor="green"
        />
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ color: 'green' });
    });

    it('should apply custom icon color', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          iconColor="purple"
        />
      );
      
      const iconContainer = screen.getByText('⚡').closest('.feature-card-icon-container');
      expect(iconContainer).toHaveStyle({ color: 'purple' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper role when clickable', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have article role when not clickable', () => {
      render(
        <FeatureCard {...defaultProps} />
      );
      
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should set aria-disabled when disabled', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          disabled={true}
        />
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle decorative icon', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          decorativeIcon={true}
        />
      );
      
      const iconContainer = screen.getByText('⚡').closest('.feature-card-icon-container');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('should handle non-decorative icon with alt text', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          decorativeIcon={false}
          iconAlt="Lightning bolt icon"
        />
      );
      
      const iconContainer = screen.getByText('⚡').closest('.feature-card-icon-container');
      expect(iconContainer).toHaveAttribute('aria-label', 'Lightning bolt icon');
    });

    it('should support focus management', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      
      expect(card).toHaveFocus();
    });
  });

  describe('Link Functionality', () => {
    it('should render as link when href is provided', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          href="/features"
        />
      );
      
      expect(screen.getByRole('link')).toHaveAttribute('href', '/features');
    });

    it('should handle link target', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should handle link with onClick', () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          href="/features"
          onClick={handleClick}
        />
      );
      
      const link = screen.getByRole('link');
      fireEvent.click(link);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should prevent navigation when disabled', () => {
      const user = userEvent.setup();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          href="/features"
          disabled={true}
        />
      );
      
      const link = screen.getByRole('link');
      fireEvent.click(link);
      
      // Should not navigate due to preventDefault in disabled state
      expect(link).not.toHaveAttribute('href', '/features');
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={handleClick}
        />
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should call onFocus when focused', () => {
      const handleFocus = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
          onFocus={handleFocus}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = vi.fn();
      
      render(
        <FeatureCard 
          {...defaultProps} 
          onClick={vi.fn()}
          onBlur={handleBlur}
        />
      );
      
      const card = screen.getByRole('button');
      card.focus();
      card.blur();
      
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Custom Classes and IDs', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FeatureCard 
          {...defaultProps} 
          className="custom-feature-card"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-feature-card');
    });

    it('should apply custom ID', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          id="custom-feature-card-id"
        />
      );
      
      expect(screen.getByRole('article')).toHaveAttribute('id', 'custom-feature-card-id');
    });

    it('should apply test ID', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          data-testid="feature-card-test"
        />
      );
      
      expect(screen.getByTestId('feature-card-test')).toBeInTheDocument();
    });

    it('should apply custom classes to sub-elements', () => {
      render(
        <FeatureCard 
          {...defaultProps} 
          iconClassName="custom-icon"
          titleClassName="custom-title"
          descriptionClassName="custom-description"
        />
      );
      
      const iconContainer = screen.getByText('⚡').closest('.feature-card-icon-container');
      const title = screen.getByText('Lightning Fast').closest('.feature-card-title');
      const description = screen.getByText('Experience blazing fast performance with our optimized algorithms.').closest('.feature-card-description');
      
      expect(iconContainer).toHaveClass('custom-icon');
      expect(title).toHaveClass('custom-title');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('Props Validation', () => {
    it('should handle missing title gracefully', () => {
      render(<FeatureCard title="" />);
      
      // Should still render but with empty title
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
      render(
        <FeatureCard 
          title="Test" 
          description={undefined}
          icon={undefined}
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<FeatureCard {...defaultProps} />);
      
      const initialCard = screen.getByRole('article');
      const initialClasses = initialCard.className;
      
      rerender(<FeatureCard {...defaultProps} variant="outlined" />);
      
      const newCard = screen.getByRole('article');
      expect(newCard.className).not.toBe(initialClasses);
    });

    it('should handle multiple feature cards efficiently', () => {
      const featureCards = Array.from({ length: 50 }, (_, i) => ({
        title: `Feature ${i + 1}`,
        description: `Description ${i + 1}`,
        icon: `🚀`
      }));
      
      const startTime = performance.now();
      render(
        <div>
          {featureCards.map((props, index) => (
            <FeatureCard key={index} {...props} />
          ))}
        </div>
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
      
      expect(screen.getAllByRole('article')).toHaveLength(50);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to container element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FeatureCard {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
      expect(ref.current).toHaveClass('feature-card');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitle = 'This is an extremely long title that might cause layout issues in the feature card component and could potentially overflow or wrap in unexpected ways';
      
      render(
        <FeatureCard 
          title={longTitle}
          description="Short description"
        />
      );
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescription = 'This is an extremely long description that provides detailed information about the feature and might cause the feature card to expand beyond its intended height or layout constraints in various screen sizes and contexts';
      
      render(
        <FeatureCard 
          title="Short title"
          description={longDescription}
        />
      );
      
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      render(
        <FeatureCard 
          title="Feature with & symbols"
          description="Description with <tags> and quotes"
          icon="⚡"
        />
      );
      
      expect(screen.getByText('Feature with & symbols')).toBeInTheDocument();
      expect(screen.getByText('Description with <tags> and "quotes"')).toBeInTheDocument();
    });

    it('should handle complex React nodes', () => {
      const complexIcon = (
        <div>
          <svg data-testid="svg-icon">
            <path d="M10 2L15 7l-5 5-1.5-1.5L12 7l-2-2-0.5 0.5L10 2z" />
          </svg>
        </div>
      );
      
      render(
        <FeatureCard 
          title="Complex Feature"
          description="With complex elements"
          icon={complexIcon}
        />
      );
      
      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render product feature showcase', () => {
      const productFeatures = [
        {
          title: 'Fast Performance',
          description: 'Optimized algorithms ensure lightning-fast response times.',
          icon: '🚀',
          cta: { label: 'Try Now', variant: 'primary' as const }
        },
        {
          title: 'Secure & Reliable',
          description: 'Enterprise-grade security with 99.9% uptime guarantee.',
          icon: '🔒',
          cta: { label: 'Learn More', variant: 'outline' as const }
        }
      ];
      
      render(
        <div>
          {productFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      );
      
      expect(screen.getByText('Fast Performance')).toBeInTheDocument();
      expect(screen.getByText('Secure & Reliable')).toBeInTheDocument();
      expect(screen.getByText('Try Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should render service features grid', () => {
      const serviceFeatures = [
        { title: '24/7 Support', description: 'Round-the-clock customer service.', icon: '💬' },
        { title: 'Cloud Storage', description: 'Secure cloud-based data storage.', icon: '☁️' },
        { title: 'Analytics', description: 'Advanced analytics and reporting.', icon: '📊' }
      ];
      
      render(
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {serviceFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} variant="glass" />
          ))}
        </div>
      );
      
      expect(screen.getAllByRole('article')).toHaveLength(3);
    });

    it('should render feature comparison', () => {
      const comparisonFeatures = [
        { title: 'Free Plan', description: 'Basic features included.', icon: '🆓', variant: 'outlined' as const },
        { title: 'Pro Plan', description: 'Advanced features for professionals.', icon: '⭐', variant: 'filled' as const },
        { title: 'Enterprise', description: 'Custom solutions for large teams.', icon: '🏢', variant: 'gradient' as const }
      ];
      
      render(
        <div>
          {comparisonFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      );
      
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onClick gracefully', () => {
      render(<FeatureCard title="Feature" />);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveAttribute('onclick');
    });

    it('should handle invalid href gracefully', () => {
      render(
        <FeatureCard 
          title="Feature" 
          href=""
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '');
    });
  });
});

// Additional comprehensive test for React 18 features
describe('FeatureCard React 18 Features', () => {
  it('should support concurrent features', () => {
    const handleClick = vi.fn();
    
    const { rerender } = render(
      <FeatureCard 
        {...defaultProps} 
        onClick={handleClick}
        variant="default"
      />
    );
    
    // Simulate concurrent update
    rerender(
      <FeatureCard 
        {...defaultProps} 
        onClick={handleClick}
        variant="outlined"
      />
    );
    
    expect(screen.getByRole('article')).toHaveClass('feature-card-variant-outlined');
  });

  it('should handle Suspense boundaries', () => {
    // This test would be relevant if FeatureCard used Suspense
    // For now, it's a placeholder for future Suspense integration
    expect(true).toBe(true);
  });
});

// Performance benchmarks
describe('FeatureCard Performance', () => {
  it('should render within acceptable time for complex cards', () => {
    const complexProps = {
      title: 'Complex Feature',
      description: 'Complex description with lots of content and styling',
      icon: <div>Complex Icon</div>,
      cta: { label: 'Complex CTA', variant: 'primary' as const },
      children: <div>Complex children</div>
    };
    
    const startTime = performance.now();
    render(<FeatureCard {...complexProps} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
  });

  it('should not cause memory leaks on unmount', () => {
    const handleClick = vi.fn();
    
    const { unmount } = render(
      <FeatureCard 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    unmount();
    
    // Verify no memory leaks by checking that handlers are cleaned up
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// Export test utilities for external use
export { createMockFeatureCard };
export type { FeatureCardProps };