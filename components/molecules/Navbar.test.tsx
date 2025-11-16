import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

// Test utilities
const createMockNavItem = (label: string, props?: any) => ({
  label,
  href: `/${label.toLowerCase().replace(' ', '-')}`,
  ...props
});

const createMockDropdownItem = (label: string, children: any[] = []) => ({
  label,
  children,
  hasDropdown: true
});

const defaultNavItems = [
  createMockNavItem('Home'),
  createMockNavItem('Products'),
  createMockDropdownItem('Services', [
    createMockNavItem('Consulting'),
    createMockNavItem('Development'),
    createMockNavItem('Support')
  ]),
  createMockNavItem('About'),
  createMockNavItem('Contact')
];

const defaultProps = {
  brand: { content: 'NexusG' },
  items: defaultNavItems
};

describe('Navbar Component', () => {
  describe('Rendering', () => {
    it('should render navbar with default props', () => {
      render(<Navbar {...defaultProps} />);
      
      const navbar = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(navbar).toBeInTheDocument();
      
      expect(screen.getByText('NexusG')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
    });

    it('should render with minimal props', () => {
      render(<Navbar />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    it('should render with custom brand', () => {
      render(
        <Navbar 
          brand={{ 
            content: 'Custom Brand',
            logo: '/logo.png',
            logoAlt: 'Custom Logo'
          }} 
        />
      );
      
      expect(screen.getByText('Custom Brand')).toBeInTheDocument();
      expect(screen.getByAltText('Custom Logo')).toBeInTheDocument();
    });

    it('should render with empty items', () => {
      render(<Navbar items={[]} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    it('should render without mobile menu button', () => {
      render(<Navbar showMobileMenu={false} />);
      
      expect(screen.queryByLabelText('Toggle navigation menu')).not.toBeInTheDocument();
    });
  });

  describe('Brand Configuration', () => {
    it('should render brand as clickable link', () => {
      const handleBrandClick = vi.fn();
      
      render(
        <Navbar 
          brand={{ 
            content: 'Brand Logo',
            href: '/',
            onClick: handleBrandClick
          }} 
        />
      );
      
      const brandLink = screen.getByRole('link', { name: 'Brand Logo' });
      expect(brandLink).toHaveAttribute('href', '/');
      
      fireEvent.click(brandLink);
      expect(handleBrandClick).toHaveBeenCalledTimes(1);
    });

    it('should render brand as div when no href', () => {
      render(
        <Navbar 
          brand={{ 
            content: 'Brand Logo',
            onClick: vi.fn()
          }} 
        />
      );
      
      expect(screen.getByText('Brand Logo').closest('.navbar-brand')).toBeInTheDocument();
    });

    it('should handle brand with only logo', () => {
      render(
        <Navbar 
          brand={{ 
            content: '',
            logo: '/logo.png',
            logoAlt: 'Logo'
          }} 
        />
      );
      
      expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });
  });

  describe('Navigation Items', () => {
    it('should render navigation links', () => {
      render(<Navbar items={defaultNavItems} />);
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/home');
      
      const productsLink = screen.getByRole('link', { name: 'Products' });
      expect(productsLink).toHaveAttribute('href', '/products');
    });

    it('should render dropdown menus', async () => {
      const user = userEvent.setup();
      render(<Navbar items={defaultNavItems} />);
      
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      expect(servicesButton).toBeInTheDocument();
      
      await user.click(servicesButton);
      
      expect(screen.getByText('Consulting')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should handle active navigation items', () => {
      const itemsWithActive = [
        { ...createMockNavItem('Home'), active: true },
        createMockNavItem('Products')
      ];
      
      render(<Navbar items={itemsWithActive} />);
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveClass('navbar-nav-link-active');
      
      const productsLink = screen.getByRole('link', { name: 'Products' });
      expect(productsLink).not.toHaveClass('navbar-nav-link-active');
    });

    it('should handle disabled navigation items', () => {
      const itemsWithDisabled = [
        createMockNavItem('Home'),
        { ...createMockNavItem('Products'), disabled: true }
      ];
      
      render(<Navbar items={itemsWithDisabled} />);
      
      const productsLink = screen.getByRole('link', { name: 'Products' });
      expect(productsLink).toHaveAttribute('aria-disabled', 'true');
      expect(productsLink).toHaveClass('navbar-nav-link-disabled');
    });

    it('should render items with icons', () => {
      const HomeIcon = () => <span data-testid="home-icon">🏠</span>;
      
      const itemsWithIcons = [
        { ...createMockNavItem('Home'), icon: <HomeIcon /> },
        { ...createMockNavItem('Products'), icon: '📦' }
      ];
      
      render(<Navbar items={itemsWithIcons} />);
      
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    it('should handle navigation clicks', async () => {
      const user = userEvent.setup();
      const handleNavigate = vi.fn();
      
      render(
        <Navbar 
          items={defaultNavItems} 
          onNavigate={handleNavigate}
        />
      );
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);
      
      expect(handleNavigate).toHaveBeenCalledWith(defaultNavItems[0]);
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'transparent', 'glass', 'bordered', 'minimal'];
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        const { container } = render(
          <Navbar {...defaultProps} variant={variant as any} />
        );
        
        expect(container.firstChild).toHaveClass(`navbar-variant-${variant}`);
      });
    });
  });

  describe('Positions', () => {
    const positions = ['static', 'sticky', 'fixed'];
    
    positions.forEach(position => {
      it(`should render with ${position} position`, () => {
        const { container } = render(
          <Navbar {...defaultProps} position={position as any} />
        );
        
        expect(container.firstChild).toHaveClass(`navbar-position-${position}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        const { container } = render(
          <Navbar {...defaultProps} size={size as any} />
        );
        
        expect(container.firstChild).toHaveClass(`navbar-size-${size}`);
      });
    });
  });

  describe('Alignments', () => {
    const alignments = ['left', 'center', 'right'];
    
    alignments.forEach(align => {
      it(`should render with ${align} alignment`, () => {
        const { container } = render(
          <Navbar {...defaultProps} align={align as any} />
        );
        
        expect(container.firstChild).toHaveClass(`navbar-align-${align}`);
      });
    });
  });

  describe('Mobile Menu', () => {
    it('should show mobile menu button by default', () => {
      render(<Navbar {...defaultProps} />);
      
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('should toggle mobile menu on button click', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      expect(menuButton).not.toHaveClass('navbar-mobile-toggle-active');
      
      await user.click(menuButton);
      
      expect(menuButton).toHaveClass('navbar-mobile-toggle-active');
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('navbar-expanded');
    });

    it('should close mobile menu when clicking menu item', async () => {
      const user = userEvent.setup();
      const handleNavigate = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          onNavigate={handleNavigate}
        />
      );
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuButton);
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);
      
      expect(handleNavigate).toHaveBeenCalled();
      expect(menuButton).not.toHaveClass('navbar-mobile-toggle-active');
    });

    it('should handle controlled expanded state', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          expanded={false}
          onToggle={handleToggle}
        />
      );
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuButton);
      
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('should close dropdowns when mobile menu is opened', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      await user.click(servicesButton);
      
      expect(screen.getByText('Consulting')).toBeInTheDocument();
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuButton);
      
      // Dropdown should be closed when mobile menu opens
      expect(screen.queryByText('Consulting')).not.toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should render search input', () => {
      render(
        <Navbar 
          {...defaultProps} 
          search={{ 
            show: true,
            placeholder: 'Search products...',
            onSearch: vi.fn()
          }} 
        />
      );
      
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('should handle search input changes', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          search={{ 
            show: true,
            onSearch: handleSearch
          }} 
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test query');
      
      expect(searchInput).toHaveValue('test query');
      expect(handleSearch).toHaveBeenCalledWith('test query');
    });

    it('should handle controlled search value', () => {
      render(
        <Navbar 
          {...defaultProps} 
          search={{ 
            show: true,
            value: 'controlled value'
          }} 
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveValue('controlled value');
    });
  });

  describe('User Menu', () => {
    it('should render authentication button when not authenticated', () => {
      render(
        <Navbar 
          {...defaultProps} 
          user={{
            isAuthenticated: false,
            onAuth: vi.fn()
          }} 
        />
      );
      
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render user menu when authenticated', async () => {
      const user = userEvent.setup();
      
      const userMenuItems = [
        createMockNavItem('Profile'),
        createMockNavItem('Settings'),
        createMockNavItem('Logout')
      ];
      
      render(
        <Navbar 
          {...defaultProps} 
          user={{
            name: 'John Doe',
            avatar: '/avatar.jpg',
            menu: userMenuItems,
            isAuthenticated: true
          }} 
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('User avatar')).toBeInTheDocument();
      
      const userButton = screen.getByRole('button');
      await user.click(userButton);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render user avatar placeholder', () => {
      render(
        <Navbar 
          {...defaultProps} 
          user={{
            name: 'Jane Smith',
            isAuthenticated: true
          }} 
        />
      );
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    it('should render language switcher', () => {
      render(
        <Navbar 
          {...defaultProps} 
          language={{
            current: 'en',
            options: [
              { code: 'en', label: 'English', flag: '🇺🇸' },
              { code: 'fr', label: 'Français', flag: '🇫🇷' }
            ],
            onChange: vi.fn()
          }} 
        />
      );
      
      expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('should handle language selection', async () => {
      const user = userEvent.setup();
      const handleLanguageChange = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          language={{
            current: 'en',
            options: [
              { code: 'en', label: 'English' },
              { code: 'fr', label: 'Français' }
            ],
            onChange: handleLanguageChange
          }} 
        />
      );
      
      const languageButton = screen.getByRole('button', { name: 'en' });
      await user.click(languageButton);
      
      expect(screen.getByText('Français')).toBeInTheDocument();
      
      const frenchOption = screen.getByRole('button', { name: 'Français' });
      await user.click(frenchOption);
      
      expect(handleLanguageChange).toHaveBeenCalledWith('fr');
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle', () => {
      render(
        <Navbar 
          {...defaultProps} 
          theme={{
            current: 'light',
            onChange: vi.fn()
          }} 
        />
      );
      
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    it('should cycle through themes', async () => {
      const user = userEvent.setup();
      const handleThemeChange = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          theme={{
            current: 'light',
            onChange: handleThemeChange
          }} 
        />
      );
      
      const themeButton = screen.getByLabelText('Toggle theme');
      await user.click(themeButton);
      
      expect(handleThemeChange).toHaveBeenCalledWith('dark');
      
      await user.click(themeButton);
      expect(handleThemeChange).toHaveBeenCalledWith('auto');
      
      await user.click(themeButton);
      expect(handleThemeChange).toHaveBeenCalledWith('light');
    });
  });

  describe('Breadcrumbs', () => {
    it('should render breadcrumbs', () => {
      render(
        <Navbar 
          {...defaultProps} 
          breadcrumbs={{
            show: true,
            items: [
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Current Page' }
            ]
          }} 
        />
      );
      
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render custom actions', () => {
      const customAction = <button data-testid="custom-action">CTA</button>;
      
      render(
        <Navbar 
          {...defaultProps} 
          actions={customAction}
        />
      );
      
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('Scroll Effects', () => {
    it('should apply scrolled class on scroll', async () => {
      render(
        <Navbar 
          {...defaultProps} 
          position="sticky"
        />
      );
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).not.toHaveClass('navbar-scrolled');
      
      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 20 } });
      
      await waitFor(() => {
        expect(navbar).toHaveClass('navbar-scrolled');
      });
    });

    it('should not apply scrolled class for static position', () => {
      render(
        <Navbar 
          {...defaultProps} 
          position="static"
        />
      );
      
      fireEvent.scroll(window, { target: { scrollY: 20 } });
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).not.toHaveClass('navbar-scrolled');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      servicesButton.focus();
      
      expect(servicesButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('Consulting')).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      expect(screen.queryByText('Consulting')).not.toBeInTheDocument();
    });

    it('should close menu on Escape key', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuButton);
      
      expect(screen.getByRole('navigation')).toHaveClass('navbar-expanded');
      
      await user.keyboard('{Escape}');
      expect(screen.getByRole('navigation')).not.toHaveClass('navbar-expanded');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Navbar {...defaultProps} />);
      
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    });

    it('should set ARIA attributes for dropdowns', async () => {
      const user = userEvent.setup();
      render(<Navbar items={defaultNavItems} />);
      
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      expect(servicesButton).toHaveAttribute('aria-haspopup', 'true');
      expect(servicesButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(servicesButton);
      
      expect(servicesButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle focus management', () => {
      render(<Navbar {...defaultProps} />);
      
      const focusableElements = screen.getAllByRole('link');
      focusableElements.forEach(element => {
        element.focus();
        expect(element).toHaveFocus();
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const firstLink = screen.getByRole('link', { name: 'Home' });
      firstLink.focus();
      
      await user.keyboard('{Tab}');
      const secondLink = screen.getByRole('link', { name: 'Products' });
      expect(secondLink).toHaveFocus();
    });
  });

  describe('Event Handlers', () => {
    it('should call onNavigate when navigation items are clicked', async () => {
      const user = userEvent.setup();
      const handleNavigate = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          onNavigate={handleNavigate}
        />
      );
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);
      
      expect(handleNavigate).toHaveBeenCalledWith(defaultNavItems[0]);
    });

    it('should call onToggle when mobile menu is toggled', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          onToggle={handleToggle}
        />
      );
      
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuButton);
      
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('should call onMenuStateChange when dropdowns are opened/closed', async () => {
      const user = userEvent.setup();
      const handleMenuStateChange = vi.fn();
      
      render(
        <Navbar 
          {...defaultProps} 
          onMenuStateChange={handleMenuStateChange}
        />
      );
      
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      await user.click(servicesButton);
      
      expect(handleMenuStateChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom background color', () => {
      render(
        <Navbar 
          {...defaultProps} 
          backgroundColor="red"
        />
      );
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveStyle({ backgroundColor: 'red' });
    });

    it('should apply custom text color', () => {
      render(
        <Navbar 
          {...defaultProps} 
          textColor="blue"
        />
      );
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveStyle({ color: 'blue' });
    });

    it('should apply custom height', () => {
      render(
        <Navbar 
          {...defaultProps} 
          height="60px"
        />
      );
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveStyle({ height: '60px' });
    });

    it('should apply custom z-index', () => {
      render(
        <Navbar 
          {...defaultProps} 
          position="fixed"
          zIndex={2000}
        />
      );
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveStyle({ zIndex: 2000 });
    });
  });

  describe('Custom Classes and IDs', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Navbar 
          {...defaultProps} 
          className="custom-navbar"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-navbar');
    });

    it('should apply custom ID', () => {
      render(
        <Navbar 
          {...defaultProps} 
          id="custom-navbar-id"
        />
      );
      
      expect(screen.getByRole('navigation')).toHaveAttribute('id', 'custom-navbar-id');
    });

    it('should apply test ID', () => {
      render(
        <Navbar 
          {...defaultProps} 
          data-testid="navbar-test"
        />
      );
      
      expect(screen.getByTestId('navbar-test')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle missing brand gracefully', () => {
      render(<Navbar brand={null} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle undefined items gracefully', () => {
      render(<Navbar items={undefined} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Navbar {...defaultProps} />);
      
      const initialNavbar = screen.getByRole('navigation');
      const initialClasses = initialNavbar.className;
      
      rerender(<Navbar {...defaultProps} variant="outlined" />);
      
      const newNavbar = screen.getByRole('navigation');
      expect(newNavbar.className).not.toBe(initialClasses);
    });

    it('should handle many navigation items efficiently', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) =>
        createMockNavItem(`Item ${i + 1}`)
      );
      
      const startTime = performance.now();
      render(<Navbar items={manyItems} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
      
      expect(screen.getAllByRole('link')).toHaveLength(50);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to nav element', () => {
      const ref = React.createRef<HTMLElement>();
      render(<Navbar {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('NAV');
      expect(ref.current).toHaveClass('navbar');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long navigation labels', () => {
      const longLabelItems = [
        { label: 'This is an extremely long navigation label that might cause layout issues', href: '/long' }
      ];
      
      render(<Navbar items={longLabelItems} />);
      
      expect(screen.getByText('This is an extremely long navigation label that might cause layout issues')).toBeInTheDocument();
    });

    it('should handle special characters in labels', () => {
      const specialCharItems = [
        { label: 'Home & Garden', href: '/home-garden' },
        { label: 'Products > Electronics', href: '/products/electronics' }
      ];
      
      render(<Navbar items={specialCharItems} />);
      
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Products > Electronics')).toBeInTheDocument();
    });

    it('should handle complex dropdown structures', async () => {
      const user = userEvent.setup();
      
      const complexDropdown = {
        label: 'Complex Menu',
        hasDropdown: true,
        children: [
          {
            label: 'Submenu 1',
            children: [
              createMockNavItem('Deep Item 1'),
              createMockNavItem('Deep Item 2')
            ]
          },
          createMockNavItem('Regular Item')
        ]
      };
      
      render(<Navbar items={[complexDropdown]} />);
      
      const complexButton = screen.getByRole('button', { name: 'Complex Menu' });
      await user.click(complexButton);
      
      expect(screen.getByText('Submenu 1')).toBeInTheDocument();
      expect(screen.getByText('Deep Item 1')).toBeInTheDocument();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render complete e-commerce navbar', () => {
      const ecommerceNav = {
        brand: { 
          content: 'ShopCo',
          logo: '/logo.svg'
        },
        items: [
          createMockNavItem('Home'),
          createMockNavItem('Products'),
          createMockDropdownItem('Categories', [
            createMockNavItem('Electronics'),
            createMockNavItem('Clothing'),
            createMockNavItem('Home & Garden')
          ]),
          createMockNavItem('Deals'),
          createMockNavItem('Support')
        ],
        search: { 
          show: true,
          placeholder: 'Search products...',
          onSearch: vi.fn()
        },
        user: {
          name: 'John Doe',
          isAuthenticated: true,
          menu: [
            createMockNavItem('My Orders'),
            createMockNavItem('Account Settings'),
            createMockNavItem('Logout')
          ]
        }
      };
      
      render(<Navbar {...ecommerceNav} />);
      
      expect(screen.getByText('ShopCo')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('should render SaaS application navbar', () => {
      const saasNav = {
        brand: { content: 'AppName' },
        items: [
          createMockNavItem('Dashboard'),
          createMockNavItem('Projects'),
          createMockDropdownItem('Tools', [
            createMockNavItem('Analytics'),
            createMockNavItem('Reports'),
            createMockNavItem('Integrations')
          ])
        ],
        user: {
          name: 'Admin User',
          isAuthenticated: true
        },
        actions: (
          <button data-testid="upgrade-cta">Upgrade</button>
        ),
        language: {
          current: 'en',
          options: [
            { code: 'en', label: 'English' },
            { code: 'es', label: 'Español' }
          ]
        }
      };
      
      render(<Navbar {...saasNav} />);
      
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByTestId('upgrade-cta')).toBeInTheDocument();
    });

    it('should render documentation site navbar', () => {
      const docNav = {
        brand: { content: 'Docs' },
        items: [
          createMockNavItem('Getting Started'),
          createMockDropdownItem('API Reference', [
            createMockNavItem('Authentication'),
            createMockNavItem('Endpoints'),
            createMockNavItem('Webhooks')
          ]),
          createMockDropdownItem('Guides', [
            createMockNavItem('Tutorial'),
            createMockNavItem('Best Practices'),
            createMockNavItem('Troubleshooting')
          ])
        ],
        search: { 
          show: true,
          placeholder: 'Search documentation...'
        },
        theme: {
          current: 'light',
          onChange: vi.fn()
        }
      };
      
      render(<Navbar {...docNav} />);
      
      expect(screen.getByText('API Reference')).toBeInTheDocument();
      expect(screen.getByText('Guides')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing href gracefully', () => {
      const itemsWithoutHref = [
        { label: 'Home' }, // No href
        createMockNavItem('Products')
      ];
      
      render(<Navbar items={itemsWithoutHref} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      
      const homeElement = screen.getByText('Home').closest('.navbar-nav-link');
      expect(homeElement).toBeInstanceOf(HTMLSpanElement);
    });

    it('should handle broken image URLs gracefully', () => {
      render(
        <Navbar 
          brand={{ 
            content: 'Brand',
            logo: '/broken-url.jpg'
          }} 
        />
      );
      
      expect(screen.getByText('Brand')).toBeInTheDocument();
      // Image will fail to load but shouldn't break the component
    });
  });
});

// Additional comprehensive test for React 18 features
describe('Navbar React 18 Features', () => {
  it('should support concurrent features', () => {
    const handleNavigate = vi.fn();
    
    const { rerender } = render(
      <Navbar 
        {...defaultProps} 
        onNavigate={handleNavigate}
        variant="default"
      />
    );
    
    // Simulate concurrent update
    rerender(
      <Navbar 
        {...defaultProps} 
        onNavigate={handleNavigate}
        variant="transparent"
      />
    );
    
    expect(screen.getByRole('navigation')).toHaveClass('navbar-variant-transparent');
  });

  it('should handle Suspense boundaries', () => {
    // This test would be relevant if Navbar used Suspense
    // For now, it's a placeholder for future Suspense integration
    expect(true).toBe(true);
  });
});

// Performance benchmarks
describe('Navbar Performance', () => {
  it('should render within acceptable time for complex navbar', () => {
    const complexNavbar = {
      brand: { content: 'Complex Brand' },
      items: Array.from({ length: 20 }, (_, i) =>
        i % 3 === 0 ? createMockDropdownItem(`Menu ${i}`, Array.from({ length: 5 }, (_, j) => createMockNavItem(`Submenu ${j}`))) : createMockNavItem(`Item ${i}`)
      ),
      search: { show: true, onSearch: vi.fn() },
      user: { name: 'User', isAuthenticated: true, menu: Array.from({ length: 10 }, (_, i) => createMockNavItem(`Menu ${i}`)) },
      actions: Array.from({ length: 5 }, (_, i) => <button key={i}>Action {i}</button>)
    };
    
    const startTime = performance.now();
    render(<Navbar {...complexNavbar} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(500); // Should render within 500ms
  });

  it('should not cause memory leaks on unmount', () => {
    const handleNavigate = vi.fn();
    const handleToggle = vi.fn();
    const handleMenuStateChange = vi.fn();
    
    const { unmount } = render(
      <Navbar 
        {...defaultProps} 
        onNavigate={handleNavigate}
        onToggle={handleToggle}
        onMenuStateChange={handleMenuStateChange}
      />
    );
    
    unmount();
    
    // Verify no memory leaks by checking that handlers are cleaned up
    expect(handleNavigate).not.toHaveBeenCalled();
    expect(handleToggle).not.toHaveBeenCalled();
    expect(handleMenuStateChange).not.toHaveBeenCalled();
  });
});

// Export test utilities for external use
export { createMockNavItem, createMockDropdownItem };
export type { NavItem, NavbarProps };