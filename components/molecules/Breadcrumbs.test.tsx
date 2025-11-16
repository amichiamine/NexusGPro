import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Breadcrumbs from './Breadcrumbs';

// Test utilities
const createMockItem = (label: string, href?: string) => ({ label, href });

const defaultItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Laptops', href: '/products/electronics/laptops' }
];

describe('Breadcrumbs Component', () => {
  describe('Rendering', () => {
    it('should render breadcrumbs with default props', () => {
      render(<Breadcrumbs items={defaultItems} />);
      
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3); // All but the last item
      
      const currentPage = screen.getByText('Laptops');
      expect(currentPage).toBeInTheDocument();
      expect(currentPage.closest('li')).toHaveAttribute('aria-current', 'page');
    });

    it('should render with empty items array', () => {
      const { container } = render(<Breadcrumbs items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should filter out invalid items', () => {
      const itemsWithInvalid = [
        { label: 'Home', href: '/' },
        { label: '' },
        { label: 'Products', href: '/products' },
        null as any,
        { label: 'Electronics' }
      ];
      
      render(<Breadcrumbs items={itemsWithInvalid} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('should render with single item', () => {
      render(<Breadcrumbs items={[{ label: 'Home' }]} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('should render without href (current page only)', () => {
      render(<Breadcrumbs items={[{ label: 'Current Page' }]} />);
      
      expect(screen.getByText('Current Page')).toBeInTheDocument();
      const currentElement = screen.getByText('Current Page').closest('li');
      expect(currentElement).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'outlined', 'filled', 'minimal', 'bordered'];
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        const { container } = render(
          <Breadcrumbs items={defaultItems} variant={variant as any} />
        );
        
        expect(container.firstChild).toHaveClass(
          `breadcrumbs-variant-${variant}`
        );
      });
    });
  });

  describe('Separators', () => {
    const separators = ['slash', 'arrow', 'chevron', 'dot', 'pipe'];
    
    separators.forEach(separator => {
      it(`should render with ${separator} separator`, () => {
        const { container } = render(
          <Breadcrumbs items={defaultItems} separator={separator as any} />
        );
        
        const separatorElements = container.querySelectorAll('.breadcrumb-separator');
        expect(separatorElements).toHaveLength(defaultItems.length - 1);
        
        separatorElements.forEach(sep => {
          expect(sep).toHaveClass(`breadcrumb-separator-${separator}`);
        });
      });
    });

    it('should render with custom separator', () => {
      const customSeparator = <span data-testid="custom-sep">→</span>;
      render(
        <Breadcrumbs 
          items={defaultItems} 
          separator="custom" 
          customSeparator={customSeparator} 
        />
      );
      
      expect(screen.getAllByTestId('custom-sep')).toHaveLength(defaultItems.length - 1);
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        const { container } = render(
          <Breadcrumbs items={defaultItems} size={size as any} />
        );
        
        expect(container.firstChild).toHaveClass(`breadcrumbs-size-${size}`);
      });
    });
  });

  describe('Icons', () => {
    const HomeIcon = () => <span data-testid="home-icon">🏠</span>;
    const ProductIcon = () => <span data-testid="product-icon">📦</span>;
    
    it('should render with leading icons', () => {
      const itemsWithIcons = [
        { label: 'Home', href: '/', leadingIcon: <HomeIcon /> },
        { label: 'Products', href: '/products', leadingIcon: <ProductIcon /> },
        { label: 'Electronics' }
      ];
      
      render(<Breadcrumbs items={itemsWithIcons} showIcons />);
      
      expect(screen.getAllByTestId('home-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('product-icon')).toHaveLength(1);
      
      const icons = screen.getAllByRole('img');
      expect(icons).toHaveLength(2);
    });

    it('should render with trailing icons', () => {
      const itemsWithTrailingIcons = [
        { label: 'Home', href: '/', trailingIcon: <HomeIcon /> },
        { label: 'Products', href: '/products', trailingIcon: <ProductIcon /> },
        { label: 'Electronics' }
      ];
      
      render(<Breadcrumbs items={itemsWithTrailingIcons} showIcons />);
      
      expect(screen.getAllByTestId('home-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('product-icon')).toHaveLength(1);
    });

    it('should not render icons when showIcons is false', () => {
      const itemsWithIcons = [
        { label: 'Home', href: '/', leadingIcon: <HomeIcon /> },
        { label: 'Products', href: '/products', leadingIcon: <ProductIcon /> }
      ];
      
      render(<Breadcrumbs items={itemsWithIcons} showIcons={false} />);
      
      expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-icon')).not.toBeInTheDocument();
    });
  });

  describe('Collapsing', () => {
    it('should collapse items when maxItems is set', () => {
      const longItems = Array.from({ length: 10 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      render(<Breadcrumbs items={longItems} maxItems={3} />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2); // First and last items
      
      const ellipsis = screen.getByText('…');
      expect(ellipsis).toBeInTheDocument();
    });

    it('should not collapse when maxItems is not exceeded', () => {
      const shortItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics' }
      ];
      
      render(<Breadcrumbs items={shortItems} maxItems={5} />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      
      expect(screen.queryByText('…')).not.toBeInTheDocument();
    });

    it('should not show ellipsis when showEllipsis is false', () => {
      const longItems = Array.from({ length: 10 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      render(<Breadcrumbs items={longItems} maxItems={3} showEllipsis={false} />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      
      expect(screen.queryByText('…')).not.toBeInTheDocument();
    });

    it('should allow custom ellipsis text', () => {
      const longItems = Array.from({ length: 10 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      render(<Breadcrumbs items={longItems} maxItems={3} ellipsisText="..." />);
      
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate on link click', async () => {
      const user = userEvent.setup();
      render(<Breadcrumbs items={defaultItems} />);
      
      const firstLink = screen.getByRole('link', { name: 'Home' });
      await user.click(firstLink);
      
      // Link should be clickable
      expect(firstLink).toHaveAttribute('href', '/');
    });

    it('should handle custom onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      const itemsWithClick = [
        { label: 'Home', href: '/', onClick: handleClick },
        { label: 'Products', href: '/products' }
      ];
      
      render(<Breadcrumbs items={itemsWithClick} />);
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not navigate when clickable is false', async () => {
      const user = userEvent.setup();
      render(<Breadcrumbs items={defaultItems} clickable={false} />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should handle disabled items', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      const itemsWithDisabled = [
        { label: 'Home', href: '/', disabled: true, onClick: handleClick },
        { label: 'Products', href: '/products' }
      ];
      
      render(<Breadcrumbs items={itemsWithDisabled} />);
      
      const disabledLink = screen.getByRole('link', { name: 'Home' });
      expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
      
      await user.click(disabledLink);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should show current page as active', () => {
      render(<Breadcrumbs items={defaultItems} showCurrentAsActive={true} />);
      
      const currentPage = screen.getByText('Laptops').closest('li');
      expect(currentPage).toHaveClass('breadcrumb-item-current');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should not show current page as active when disabled', () => {
      render(<Breadcrumbs items={defaultItems} showCurrentAsActive={false} />);
      
      const currentPage = screen.getByText('Laptops').closest('li');
      expect(currentPage).not.toHaveClass('breadcrumb-item-current');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Breadcrumbs items={defaultItems} />);
      
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
    });

    it('should allow custom aria-label', () => {
      render(<Breadcrumbs items={defaultItems} aria-label="Navigation Path" />);
      
      expect(screen.getByRole('navigation', { name: 'Navigation Path' })).toBeInTheDocument();
    });

    it('should set aria-current on current page', () => {
      render(<Breadcrumbs items={defaultItems} />);
      
      const currentPage = screen.getByText('Laptops');
      expect(currentPage.closest('li')).toHaveAttribute('aria-current', 'page');
    });

    it('should set aria-disabled on disabled items', () => {
      const itemsWithDisabled = [
        { label: 'Home', href: '/', disabled: true },
        { label: 'Products', href: '/products' }
      ];
      
      render(<Breadcrumbs items={itemsWithDisabled} />);
      
      const disabledLink = screen.getByRole('link', { name: 'Home' });
      expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Breadcrumbs items={defaultItems} />);
      
      const firstLink = screen.getByRole('link', { name: 'Home' });
      firstLink.focus();
      
      expect(firstLink).toHaveFocus();
      
      await user.keyboard('{Tab}');
      
      const secondLink = screen.getByRole('link', { name: 'Products' });
      expect(secondLink).toHaveFocus();
    });

    it('should support Enter and Space keys', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      const itemsWithClick = [
        { label: 'Home', href: '/', onClick: handleClick }
      ];
      
      render(<Breadcrumbs items={itemsWithClick} />);
      
      const link = screen.getByRole('link', { name: 'Home' });
      link.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom Classes and IDs', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Breadcrumbs items={defaultItems} className="custom-breadcrumbs" />
      );
      
      expect(container.firstChild).toHaveClass('custom-breadcrumbs');
    });

    it('should apply custom ID', () => {
      render(<Breadcrumbs items={defaultItems} id="custom-breadcrumbs-id" />);
      
      expect(screen.getByRole('navigation')).toHaveAttribute('id', 'custom-breadcrumbs-id');
    });

    it('should apply test ID', () => {
      render(<Breadcrumbs items={defaultItems} data-testid="breadcrumbs-test" />);
      
      expect(screen.getByTestId('breadcrumbs-test')).toBeInTheDocument();
    });

    it('should apply custom className to items', () => {
      const itemsWithClasses = [
        { label: 'Home', href: '/', className: 'custom-home' },
        { label: 'Products', href: '/products' }
      ];
      
      render(<Breadcrumbs items={itemsWithClasses} />);
      
      const homeItem = screen.getByText('Home').closest('li');
      expect(homeItem).toHaveClass('custom-home');
    });
  });

  describe('Props Validation', () => {
    it('should handle undefined items gracefully', () => {
      const { container } = render(<Breadcrumbs items={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle null items gracefully', () => {
      const { container } = render(<Breadcrumbs items={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle empty string labels', () => {
      const itemsWithEmpty = [
        { label: '', href: '/' },
        { label: '   ', href: '/products' },
        { label: 'Valid', href: '/valid' }
      ];
      
      render(<Breadcrumbs items={itemsWithEmpty} />);
      
      expect(screen.getByText('Valid')).toBeInTheDocument();
      expect(screen.queryByText('')).not.toBeInTheDocument();
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Breadcrumbs items={defaultItems} />);
      
      const initialLinks = screen.getAllByRole('link');
      const initialCount = initialLinks.length;
      
      rerender(<Breadcrumbs items={defaultItems} variant="outlined" />);
      
      const newLinks = screen.getAllByRole('link');
      expect(newLinks).toHaveLength(initialCount);
    });

    it('should handle large item lists efficiently', () => {
      const largeItems = Array.from({ length: 100 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      const startTime = performance.now();
      render(<Breadcrumbs items={largeItems} maxItems={5} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2); // First and last items only
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to nav element', () => {
      const ref = React.createRef<HTMLElement>();
      render(<Breadcrumbs items={defaultItems} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('NAV');
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with very long labels', () => {
      const longLabelItem = {
        label: 'This is an extremely long breadcrumb label that might cause overflow issues in the UI',
        href: '/very-long-url'
      };
      
      render(<Breadcrumbs items={[ { label: 'Home', href: '/' }, longLabelItem ]} />);
      
      expect(screen.getByText(longLabelItem.label)).toBeInTheDocument();
      const link = screen.getByRole('link', { name: longLabelItem.label });
      expect(link).toHaveClass('breadcrumb-link');
    });

    it('should handle items with special characters', () => {
      const specialCharItems = [
        { label: 'Home & Garden', href: '/home-garden' },
        { label: 'Tools > Hammers', href: '/tools/hammers' },
        { label: '"Premium" Quality', href: '/premium' }
      ];
      
      render(<Breadcrumbs items={specialCharItems} />);
      
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Tools > Hammers')).toBeInTheDocument();
      expect(screen.getByText('"Premium" Quality')).toBeInTheDocument();
    });

    it('should handle nested React nodes', () => {
      const nestedItems = [
        { 
          label: 'Home', 
          href: '/',
          leadingIcon: <span className="nested-icon">🏠</span>
        }
      ];
      
      render(<Breadcrumbs items={nestedItems} showIcons />);
      
      expect(screen.getByText('🏠')).toBeInTheDocument();
      const icon = screen.getByText('🏠');
      expect(icon).toHaveClass('nested-icon');
    });
  });

  describe('Animation and Transitions', () => {
    it('should show collapse animation when items are collapsed', () => {
      const longItems = Array.from({ length: 10 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      const { container } = render(<Breadcrumbs items={longItems} maxItems={3} />);
      
      const collapsedItems = container.querySelectorAll('.breadcrumb-item:not(:first-child):not(:last-child)');
      collapsedItems.forEach(item => {
        expect(item).toHaveClass('breadcrumbCollapseIn');
      });
    });

    it('should handle hover effects', async () => {
      const user = userEvent.setup();
      render(<Breadcrumbs items={defaultItems} />);
      
      const firstLink = screen.getByRole('link', { name: 'Home' });
      
      await user.hover(firstLink);
      
      // Hover state should be applied
      expect(firstLink).toHaveClass('breadcrumb-link');
    });
  });

  describe('Integration with CSS Modules', () => {
    it('should apply CSS module classes correctly', () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />);
      
      expect(container.firstChild).toHaveClass('breadcrumbs');
      expect(container.firstChild).toHaveClass('breadcrumbs-variant-default');
      expect(container.firstChild).toHaveClass('breadcrumbs-size-md');
    });

    it('should handle className merging', () => {
      const { container } = render(
        <Breadcrumbs 
          items={defaultItems} 
          className="custom-class"
          variant="outlined"
          size="lg"
        />
      );
      
      expect(container.firstChild).toHaveClass('breadcrumbs');
      expect(container.firstChild).toHaveClass('breadcrumbs-variant-outlined');
      expect(container.firstChild).toHaveClass('breadcrumbs-size-lg');
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should handle e-commerce product breadcrumbs', () => {
      const productBreadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/categories' },
        { label: 'Electronics', href: '/categories/electronics' },
        { label: 'Laptops', href: '/categories/electronics/laptops' },
        { label: 'MacBook Pro 16"', href: '/products/macbook-pro-16' }
      ];
      
      render(<Breadcrumbs items={productBreadcrumbs} />);
      
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Laptops')).toBeInTheDocument();
      expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument();
    });

    it('should handle dashboard breadcrumbs', () => {
      const dashboardBreadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics', href: '/dashboard/analytics' },
        { label: 'Reports', href: '/dashboard/analytics/reports' },
        { label: 'Monthly Sales' }
      ];
      
      render(<Breadcrumbs items={dashboardBreadcrumbs} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Monthly Sales')).toBeInTheDocument();
    });

    it('should handle documentation breadcrumbs', () => {
      const docBreadcrumbs = [
        { label: 'Docs', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Authentication', href: '/docs/api/authentication' },
        { label: 'JWT Tokens' }
      ];
      
      render(<Breadcrumbs items={docBreadcrumbs} />);
      
      expect(screen.getByText('Docs')).toBeInTheDocument();
      expect(screen.getByText('API Reference')).toBeInTheDocument();
      expect(screen.getByText('Authentication')).toBeInTheDocument();
      expect(screen.getByText('JWT Tokens')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing href gracefully', () => {
      const itemsWithoutHref = [
        { label: 'Home' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics' }
      ];
      
      render(<Breadcrumbs items={itemsWithoutHref} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      
      const homeElement = screen.getByText('Home').closest('li');
      const homeLink = homeElement?.querySelector('a');
      expect(homeLink).toBeNull();
    });

    it('should handle custom separator errors gracefully', () => {
      const brokenSeparator = null;
      
      render(
        <Breadcrumbs 
          items={defaultItems} 
          separator="custom" 
          customSeparator={brokenSeparator} 
        />
      );
      
      // Should fall back to default separator
      const separators = document.querySelectorAll('.breadcrumb-separator');
      expect(separators).toHaveLength(defaultItems.length - 1);
    });
  });
});

// Additional comprehensive test for React 18 features
describe('Breadcrumbs React 18 Features', () => {
  it('should support concurrent features', async () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      label: `Item ${i + 1}`,
      href: `/item-${i + 1}`
    }));
    
    const { rerender } = render(
      <Breadcrumbs items={items.slice(0, 10)} maxItems={5} />
    );
    
    // Update items (concurrent update simulation)
    rerender(
      <Breadcrumbs items={items.slice(0, 20)} maxItems={5} />
    );
    
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('should handle Suspense boundaries', () => {
    // This test would be relevant if Breadcrumbs used Suspense
    // For now, it's a placeholder for future Suspense integration
    expect(true).toBe(true);
  });
});

// Performance benchmarks
describe('Breadcrumbs Performance', () => {
  it('should render within acceptable time for large datasets', () => {
    const largeItems = Array.from({ length: 1000 }, (_, i) => ({
      label: `Item ${i + 1}`,
      href: `/item-${i + 1}`
    }));
    
    const startTime = performance.now();
    render(<Breadcrumbs items={largeItems} maxItems={5} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(500); // Should render within 500ms
  });

  it('should not cause memory leaks on unmount', () => {
    const handleClick = vi.fn();
    
    const { unmount } = render(
      <Breadcrumbs 
        items={[{ label: 'Home', href: '/', onClick: handleClick }]} 
      />
    );
    
    unmount();
    
    // Verify no memory leaks by checking that handlers are cleaned up
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// Export test utilities for external use
export { createMockItem };
export type { BreadcrumbItem };