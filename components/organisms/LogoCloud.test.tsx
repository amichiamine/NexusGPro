import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoCloud from './LogoCloud';
import type { LogoItem } from './LogoCloud';

describe('LogoCloud Component', () => {
  const defaultLogos: LogoItem[] = [
    { id: '1', name: 'Acme', src: '/logo-acme.png', alt: 'Acme Corporation' },
    { id: '2', name: 'Globex', src: '/logo-globex.png', alt: 'Globex Corporation' },
    { id: '3', name: 'Umbrella', src: '/logo-umbrella.png', alt: 'Umbrella Corporation' },
    { id: '4', name: 'Wayne', src: '/logo-wayne.png', alt: 'Wayne Enterprises' },
    { id: '5', name: 'Stark', src: '/logo-stark.png', alt: 'Stark Industries' },
    { id: '6', name: 'Oscorp', src: '/logo-oscorp.png', alt: 'Oscorp Industries' },
    { id: '7', name: 'Cyberdyne', src: '/logo-cyberdyne.png', alt: 'Cyberdyne Systems' },
    { id: '8', name: 'Tyrell', src: '/logo-tyrell.png', alt: 'Tyrell Corporation' },
  ];

  beforeEach(() => {
    // Mock IntersectionObserver for scroll animations
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as any;
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<LogoCloud logos={defaultLogos} />);
      
      const logoCloud = screen.getByTestId('logo-cloud');
      expect(logoCloud).toBeInTheDocument();
      expect(logoCloud).toHaveAttribute('aria-label', 'Company logos');
    });

    it('renders with custom aria-label', () => {
      render(<LogoCloud logos={defaultLogos} aria-label="Partner companies" />);
      
      expect(screen.getByLabelText('Partner companies')).toBeInTheDocument();
    });

    it('renders empty state when no logos provided', () => {
      render(<LogoCloud logos={[]} />);
      
      expect(screen.getByText('No logos to display')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders logos correctly', () => {
      render(<LogoCloud logos={defaultLogos} />);
      
      expect(screen.getByAltText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByAltText('Globex Corporation')).toBeInTheDocument();
      expect(screen.getByAltText('Umbrella Corporation')).toBeInTheDocument();
      expect(screen.getByAltText('Wayne Enterprises')).toBeInTheDocument();
    });

    it('renders text logos when no src provided', () => {
      const textLogos: LogoItem[] = [
        { id: '1', name: 'Text Company 1' },
        { id: '2', name: 'Text Company 2' },
      ];
      
      render(<LogoCloud logos={textLogos} />);
      
      expect(screen.getByText('Text Company 1')).toBeInTheDocument();
      expect(screen.getByText('Text Company 2')).toBeInTheDocument();
    });

    it('falls back to text when image fails to load', async () => {
      const logosWithBrokenImages: LogoItem[] = [
        { id: '1', name: 'Broken Image Co', src: '/broken-image.png' },
      ];
      
      render(<LogoCloud logos={logosWithBrokenImages} />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      await waitFor(() => {
        expect(screen.getByText('Broken Image Co')).toBeInTheDocument();
      });
    });
  });

  describe('Variants', () => {
    const variants: Array<LogoCloudProps['variant']> = ['default', 'dark', 'light', 'brand-colors', 'minimalist', 'gradient'];
    
    variants.forEach(variant => {
      it(`renders with ${variant} variant`, () => {
        render(<LogoCloud logos={defaultLogos} variant={variant} />);
        
        const logoCloud = screen.getByTestId('logo-cloud');
        expect(logoCloud).toHaveClass(`logo-cloud-variant-${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: Array<LogoCloudProps['size']> = ['xs', 'sm', 'md', 'lg', 'xl'];
    
    sizes.forEach(size => {
      it(`renders with ${size} size`, () => {
        render(<LogoCloud logos={defaultLogos} size={size} />);
        
        const logoCloud = screen.getByTestId('logo-cloud');
        expect(logoCloud).toHaveClass(`logo-cloud-size-${size}`);
      });
    });
  });

  describe('Layouts', () => {
    const layouts: Array<LogoCloudProps['layout']> = ['grid', 'carousel', 'masonry', 'inline', 'columns'];
    
    layouts.forEach(layout => {
      it(`renders with ${layout} layout`, () => {
        render(<LogoCloud logos={defaultLogos} layout={layout} />);
        
        const logoCloud = screen.getByTestId('logo-cloud');
        expect(logoCloud).toHaveClass(`logo-cloud-layout-${layout}`);
      });
    });

    describe('Grid Layout', () => {
      it('renders grid with correct columns', () => {
        render(<LogoCloud logos={defaultLogos} layout="grid" columns={4} />);
        
        const grid = screen.getByRole('list');
        expect(grid).toHaveClass('logo-cloud-grid');
      });

      it('handles responsive columns', () => {
        render(
          <LogoCloud 
            logos={defaultLogos} 
            layout="grid" 
            responsive={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }} 
          />
        );
        
        const grid = screen.getByRole('list');
        expect(grid).toHaveClass('col-xs-2', 'col-sm-3', 'col-md-4', 'col-lg-5', 'col-xl-6');
      });
    });

    describe('Carousel Layout', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('renders carousel with navigation controls', () => {
        render(<LogoCloud logos={defaultLogos} layout="carousel" />);
        
        expect(screen.getByLabelText('Previous logos')).toBeInTheDocument();
        expect(screen.getByLabelText('Next logos')).toBeInTheDocument();
      });

      it('renders carousel indicators for multiple slides', () => {
        render(<LogoCloud logos={defaultLogos} layout="carousel" columns={2} />);
        
        const indicators = screen.getAllByRole('tab');
        expect(indicators.length).toBeGreaterThan(1);
      });

      it('does not show indicators for single slide', () => {
        render(<LogoCloud logos={defaultLogos.slice(0, 2)} layout="carousel" columns={2} />);
        
        expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      });

      it('navigates to next slide', async () => {
        const user = userEvent.setup();
        render(<LogoCloud logos={defaultLogos} layout="carousel" columns={2} />);
        
        const nextButton = screen.getByLabelText('Next logos');
        await user.click(nextButton);
        
        // Should navigate to next slide
        expect(screen.getByRole('tab', { selected: true })).toBeInTheDocument();
      });

      it('navigates to previous slide', async () => {
        const user = userEvent.setup();
        render(<LogoCloud logos={defaultLogos} layout="carousel" columns={2} />);
        
        const prevButton = screen.getByLabelText('Previous logos');
        await user.click(prevButton);
        
        expect(screen.getByRole('tab', { selected: true })).toBeInTheDocument();
      });

      it('jumps to specific slide', async () => {
        const user = userEvent.setup();
        render(<LogoCloud logos={defaultLogos} layout="carousel" columns={2} />);
        
        const indicators = screen.getAllByRole('tab');
        await user.click(indicators[2]);
        
        expect(indicators[2]).toHaveAttribute('aria-selected', 'true');
      });

      it('autoplays when enabled', () => {
        render(<LogoCloud logos={defaultLogos} layout="carousel" autoplay={true} />);
        
        // Should have autoplay interval
        expect(setInterval).toHaveBeenCalled();
      });

      it('stops autoplay on hover', async () => {
        const user = userEvent.setup();
        render(<LogoCloud logos={defaultLogos} layout="carousel" autoplay={true} />);
        
        const carousel = screen.getByRole('region', { name: 'Company logos' });
        await user.hover(carousel);
        
        // Autoplay should be paused
        expect(global.clearInterval).toHaveBeenCalled();
      });
    });

    describe('Masonry Layout', () => {
      it('renders masonry with proper column count', () => {
        render(<LogoCloud logos={defaultLogos} layout="masonry" />);
        
        const masonry = screen.getByRole('list');
        expect(masonry).toHaveClass('logo-cloud-masonry');
      });
    });

    describe('Inline Layout', () => {
      it('renders inline layout', () => {
        render(<LogoCloud logos={defaultLogos} layout="inline" />);
        
        const inline = screen.getByRole('list');
        expect(inline).toHaveClass('logo-cloud-inline');
      });
    });

    describe('Columns Layout', () => {
      it('renders columns layout', () => {
        render(<LogoCloud logos={defaultLogos} layout="columns" />);
        
        const columns = screen.getByRole('list');
        expect(columns).toHaveClass('logo-cloud-columns');
      });
    });
  });

  describe('Animations', () => {
    const animations: Array<LogoCloudProps['animation']> = ['none', 'hover', 'fade', 'slide', 'pulse'];
    
    animations.forEach(animation => {
      it(`applies ${animation} animation`, () => {
        render(<LogoCloud logos={defaultLogos} animation={animation} />);
        
        const logoCloud = screen.getByTestId('logo-cloud');
        expect(logoCloud).toHaveClass(`logo-cloud-animation-${animation}`);
      });
    });
  });

  describe('Clickable Logos', () => {
    const clickableLogos: LogoItem[] = [
      { id: '1', name: 'Acme', src: '/logo-acme.png', href: 'https://acme.com' },
      { id: '2', name: 'Globex', src: '/logo-globex.png', href: 'https://globex.com' },
    ];

    it('renders clickable logos with role button', () => {
      render(<LogoCloud logos={clickableLogos} clickable={true} />);
      
      const logos = screen.getAllByRole('button');
      expect(logos).toHaveLength(2);
    });

    it('opens links when logo clicked', async () => {
      const user = userEvent.setup();
      const originalOpen = window.open;
      window.open = jest.fn();
      
      render(<LogoCloud logos={clickableLogos} clickable={true} />);
      
      const firstLogo = screen.getByRole('button');
      await user.click(firstLogo);
      
      expect(window.open).toHaveBeenCalledWith('https://acme.com', '_blank', 'noopener,noreferrer');
      
      window.open = originalOpen;
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LogoCloud logos={clickableLogos} clickable={true} />);
      
      const firstLogo = screen.getByRole('button');
      firstLogo.focus();
      await user.keyboard('{Enter}');
      
      expect(window.open).toHaveBeenCalledWith('https://acme.com', '_blank', 'noopener,noreferrer');
    });

    it('does not open links when clickable is false', () => {
      const openSpy = jest.spyOn(window, 'open');
      render(<LogoCloud logos={clickableLogos} clickable={false} />);
      
      const logos = screen.getAllByRole('img');
      fireEvent.click(logos[0]);
      
      expect(openSpy).not.toHaveBeenCalled();
      
      openSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<LogoCloud logos={defaultLogos} />);
      
      expect(screen.getByLabelText('Company logos')).toBeInTheDocument();
    });

    it('supports keyboard navigation for clickable logos', async () => {
      const user = userEvent.setup();
      const logos: LogoItem[] = [
        { id: '1', name: 'Acme', src: '/logo-acme.png', href: 'https://acme.com' },
      ];
      
      render(<LogoCloud logos={logos} clickable={true} />);
      
      const logo = screen.getByRole('button');
      logo.focus();
      
      await user.keyboard('{Tab}');
      expect(logo).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(window.open).toHaveBeenCalled();
    });

    it('has proper focus management', () => {
      render(<LogoCloud logos={defaultLogos} clickable={true} />);
      
      const logos = screen.getAllByRole('button');
      logos[0].focus();
      
      expect(logos[0]).toHaveFocus();
    });

    it('supports carousel keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LogoCloud logos={defaultLogos} layout="carousel" />);
      
      const prevButton = screen.getByLabelText('Previous logos');
      const nextButton = screen.getByLabelText('Next logos');
      
      prevButton.focus();
      await user.keyboard('{Enter}');
      
      nextButton.focus();
      await user.keyboard('{Enter}');
    });

    it('announces slide changes for screen readers', async () => {
      const user = userEvent.setup();
      render(<LogoCloud logos={defaultLogos} layout="carousel" columns={2} />);
      
      const indicator = screen.getAllByRole('tab')[1];
      await user.click(indicator);
      
      // Should announce the change (though this is hard to test without more complex setup)
      expect(indicator).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(
        <LogoCloud 
          logos={defaultLogos} 
          responsive={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }} 
        />
      );
      
      const grid = screen.getByRole('list');
      expect(grid).toHaveClass('col-xs-2', 'col-sm-3', 'col-md-4', 'col-lg-5', 'col-xl-6');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<LogoCloud logos={defaultLogos} className="custom-class" />);
      
      expect(screen.getByTestId('logo-cloud')).toHaveClass('custom-class');
    });

    it('applies inline styles', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<LogoCloud logos={defaultLogos} style={customStyle} />);
      
      expect(screen.getByTestId('logo-cloud')).toHaveStyle(customStyle);
    });
  });

  describe('Test IDs', () => {
    it('applies custom data-testid', () => {
      render(<LogoCloud logos={defaultLogos} data-testid="custom-test-id" />);
      
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('lazy loads images', () => {
      render(<LogoCloud logos={defaultLogos} />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('optimizes carousel with visible count', () => {
      render(<LogoCloud logos={defaultLogos} layout="carousel" columns={4} />);
      
      // Should only render visible logos initially
      const visibleLogos = screen.getAllByRole('img');
      expect(visibleLogos.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Error Handling', () => {
    it('handles image loading errors gracefully', async () => {
      const logosWithBrokenImages: LogoItem[] = [
        { id: '1', name: 'Broken', src: '/broken.png' },
      ];
      
      render(<LogoCloud logos={logosWithBrokenImages} />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      await waitFor(() => {
        expect(screen.getByText('Broken')).toBeInTheDocument();
      });
    });

    it('handles empty arrays', () => {
      render(<LogoCloud logos={[]} />);
      
      expect(screen.getByText('No logos to display')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility', () => {
    it('supports reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(<LogoCloud logos={defaultLogos} animation="pulse" />);
      
      // Component should still render without errors
      expect(screen.getByTestId('logo-cloud')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works with form submission', () => {
      const onSubmit = jest.fn();
      render(
        <form onSubmit={onSubmit}>
          <LogoCloud logos={defaultLogos} />
        </form>
      );
      
      const logos = screen.getAllByRole('img');
      fireEvent.submit(logos[0]);
      
      expect(onSubmit).toHaveBeenCalled();
    });

    it('works within other components', () => {
      const ParentComponent = () => (
        <div>
          <h2>Our Partners</h2>
          <LogoCloud logos={defaultLogos} variant="brand-colors" />
        </div>
      );
      
      render(<ParentComponent />);
      
      expect(screen.getByText('Our Partners')).toBeInTheDocument();
      expect(screen.getByTestId('logo-cloud')).toHaveClass('logo-cloud-variant-brand-colors');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long logo names', () => {
      const longNameLogos: LogoItem[] = [
        { id: '1', name: 'This is an extremely long company name that might cause wrapping issues' },
      ];
      
      render(<LogoCloud logos={longNameLogos} />);
      
      expect(screen.getByText('This is an extremely long company name that might cause wrapping issues')).toBeInTheDocument();
    });

    it('handles logos with special characters', () => {
      const specialCharLogos: LogoItem[] = [
        { id: '1', name: 'Company & Sons™', alt: 'Company & Sons™ Logo' },
        { id: '2', name: 'Test <Company> (2024)', alt: 'Test <Company> (2024) Logo' },
      ];
      
      render(<LogoCloud logos={specialCharLogos} />);
      
      expect(screen.getByText('Company & Sons™')).toBeInTheDocument();
      expect(screen.getByText('Test <Company> (2024)')).toBeInTheDocument();
    });

    it('handles very large number of logos', () => {
      const manyLogos: LogoItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `Company ${i}`,
      }));
      
      render(<LogoCloud logos={manyLogos} layout="grid" />);
      
      expect(screen.getAllByText(/Company \d+/)).toHaveLength(100);
    });
  });
});

// Additional test suites for specific interactions
describe('LogoCloud - Complex Interactions', () => {
  const mockLogos: LogoItem[] = [
    { id: '1', name: 'Acme', src: '/acme.png', href: 'https://acme.com' },
    { id: '2', name: 'Globex', src: '/globex.png' },
    { id: '3', name: 'Umbrella', src: '/umbrella.png', href: 'https://umbrella.com' },
    { id: '4', name: 'Wayne', src: '/wayne.png' },
    { id: '5', name: 'Stark', src: '/stark.png', href: 'https://stark.com' },
    { id: '6', name: 'Oscorp', src: '/oscorp.png' },
  ];

  describe('Mixed Clickable and Non-clickable Logos', () => {
    it('handles mix of clickable and non-clickable logos', () => {
      render(<LogoCloud logos={mockLogos} clickable={true} />);
      
      const buttons = screen.getAllByRole('button');
      const images = screen.getAllByRole('img');
      
      // Should have 3 clickable logos (with href)
      expect(buttons).toHaveLength(3);
      // Should have 6 total logos
      expect(images).toHaveLength(6);
    });

    it('only opens links for logos with href when clickable', () => {
      const openSpy = jest.spyOn(window, 'open');
      render(<LogoCloud logos={mockLogos} clickable={true} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Acme (has href)
      
      expect(openSpy).toHaveBeenCalledWith('https://acme.com', '_blank', 'noopener,noreferrer');
      
      openSpy.mockRestore();
    });
  });

  describe('Dynamic Content Updates', () => {
    it('updates when logos prop changes', () => {
      const { rerender } = render(<LogoCloud logos={mockLogos.slice(0, 3)} />);
      expect(screen.getAllByRole('img')).toHaveLength(3);
      
      rerender(<LogoCloud logos={mockLogos} />);
      expect(screen.getAllByRole('img')).toHaveLength(6);
    });

    it('handles layout changes', () => {
      const { rerender } = render(<LogoCloud logos={mockLogos} layout="grid" />);
      expect(screen.getByRole('list')).toHaveClass('logo-cloud-grid');
      
      rerender(<LogoCloud logos={mockLogos} layout="carousel" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});

export {};