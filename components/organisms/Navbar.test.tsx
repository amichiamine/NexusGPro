import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import type { NavItem } from './Navbar';

describe('Navbar Component', () => {
  const defaultItems: NavItem[] = [
    { id: '1', label: 'Features', href: '#features' },
    { id: '2', label: 'Pricing', href: '#pricing' },
    { id: '3', label: 'Docs', href: '#docs' },
    { id: '4', label: 'Products', children: [
      { id: '4-1', label: 'Product A', href: '#product-a' },
      { id: '4-2', label: 'Product B', href: '#product-b' },
    ]},
  ];

  const defaultProps = {
    items: defaultItems,
    'data-testid': 'test-navbar',
  };

  beforeEach(() => {
    // Mock scroll event
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'scroll', { value: jest.fn(), writable: true });
    
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as any;
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Navbar {...defaultProps} />);
      
      const navbar = screen.getByTestId('test-navbar');
      expect(navbar).toBeInTheDocument();
      expect(navbar).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('renders with custom aria-label', () => {
      render(<Navbar {...defaultProps} aria-label="Custom navigation" />);
      
      expect(screen.getByLabelText('Custom navigation')).toBeInTheDocument();
    });

    it('renders logo correctly', () => {
      render(<Navbar {...defaultProps} logo="Custom Brand" />);
      
      expect(screen.getByText('Custom Brand')).toBeInTheDocument();
    });

    it('renders logo as custom element', () => {
      const customLogo = <img src="/logo.png" alt="Custom Logo" />;
      render(<Navbar {...defaultProps} logo={customLogo} />);
      
      expect(screen.getByAltText('Custom Logo')).toBeInTheDocument();
    });

    it('renders navigation items correctly', () => {
      render(<Navbar {...defaultProps} />);
      
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('renders CTA button when provided', () => {
      const ctaProps = {
        ...defaultProps,
        cta: { label: 'Get Started' },
      };
      
      render(<Navbar {...ctaProps} />);
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants: Array<NavbarProps['variant']> = ['default', 'dark', 'light', 'transparent', 'gradient'];
    
    variants.forEach(variant => {
      it(`renders with ${variant} variant`, () => {
        render(<Navbar {...defaultProps} variant={variant} />);
        
        const navbar = screen.getByTestId('test-navbar');
        expect(navbar).toHaveClass(`navbar--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: Array<NavbarProps['size']> = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`renders with ${size} size`, () => {
        render(<Navbar {...defaultProps} size={size} />);
        
        const navbar = screen.getByTestId('test-navbar');
        expect(navbar).toHaveClass(`navbar--${size}`);
      });
    });
  });

  describe('Layouts', () => {
    const layouts: Array<NavbarProps['layout']> = ['left', 'center', 'split', 'mega'];
    
    layouts.forEach(layout => {
      it(`renders with ${layout} layout`, () => {
        render(<Navbar {...defaultProps} layout={layout} />);
        
        const navbar = screen.getByTestId('test-navbar');
        expect(navbar).toHaveClass(`navbar--${layout}`);
      });
    });
  });

  describe('Sticky Behavior', () => {
    it('applies sticky class when enabled', () => {
      render(<Navbar {...defaultProps} sticky={true} />);
      
      const navbar = screen.getByTestId('test-navbar');
      expect(navbar).toHaveClass('navbar--sticky');
    });

    it('adds scrolled class on scroll', async () => {
      render(<Navbar {...defaultProps} sticky={true} />);
      
      // Mock scroll event
      Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        const navbar = screen.getByTestId('test-navbar');
        expect(navbar).toHaveClass('navbar--scrolled');
      });
    });
  });

  describe('Dropdown Navigation', () => {
    it('renders dropdown for items with children', () => {
      render(<Navbar {...defaultProps} />);
      
      const productsLink = screen.getByText('Products').closest('button') || screen.getByText('Products');
      expect(productsLink).toBeInTheDocument();
      expect(productsLink).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens dropdown on click', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(document.body);
      expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('handles dropdown navigation clicks', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      render(<Navbar {...defaultProps} onItemClick={onItemClick} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      
      const productA = screen.getByText('Product A');
      await user.click(productA);
      
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: '4-1', label: 'Product A' })
      );
    });

    it('closes dropdown on escape key', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Mega Menu', () => {
    const megaMenuItems: NavItem[] = [
      {
        id: '1',
        label: 'Solutions',
        children: [
          {
            id: '1-1',
            label: 'Category 1',
            children: [
              { id: '1-1-1', label: 'Sub Item 1', href: '#sub1' },
              { id: '1-1-2', label: 'Sub Item 2', href: '#sub2' },
            ],
          },
          {
            id: '1-2',
            label: 'Category 2',
            children: [
              { id: '1-2-1', label: 'Sub Item 3', href: '#sub3' },
              { id: '1-2-2', label: 'Sub Item 4', href: '#sub4' },
            ],
          },
        ],
      },
    ];

    it('renders mega menu for layout mega', () => {
      render(<Navbar items={megaMenuItems} layout="mega" />);
      
      const solutionsButton = screen.getByText('Solutions');
      expect(solutionsButton).toBeInTheDocument();
    });

    it('opens mega menu on hover', async () => {
      const user = userEvent.setup();
      render(<Navbar items={megaMenuItems} layout="mega" />);
      
      const solutionsButton = screen.getByText('Solutions');
      await user.hover(solutionsButton);
      
      // Mega menu should be visible
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('shows mobile toggle button on small screens', () => {
      render(<Navbar {...defaultProps} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      expect(mobileToggle).toBeInTheDocument();
    });

    it('opens mobile menu on toggle click', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      await user.click(mobileToggle);
      
      expect(screen.getByText('Features')).toBeInTheDocument(); // Should be in mobile menu
      expect(screen.getByText('Close mobile menu')).toBeInTheDocument();
    });

    it('closes mobile menu when clicking close button', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      await user.click(mobileToggle);
      
      const closeButton = screen.getByLabelText('Close mobile menu');
      await user.click(closeButton);
      
      expect(screen.queryByText('Features')).not.toBeInTheDocument();
    });

    it('closes mobile menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      await user.click(mobileToggle);
      
      await user.click(document.body);
      expect(screen.queryByText('Features')).not.toBeInTheDocument();
    });

    it('calls onMobileToggle when opened/closed', async () => {
      const user = userEvent.setup();
      const onMobileToggle = jest.fn();
      render(<Navbar {...defaultProps} onMobileToggle={onMobileToggle} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      await user.click(mobileToggle);
      
      expect(onMobileToggle).toHaveBeenCalledWith(true);
      
      await user.click(mobileToggle);
      expect(onMobileToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('Search Functionality', () => {
    it('renders search input when enabled', () => {
      render(
        <Navbar 
          {...defaultProps} 
          search={{ show: true, placeholder: 'Search products...' }} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls search callback on form submission', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <Navbar 
          {...defaultProps} 
          search={{ show: true, onSearch }} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test query');
      
      const searchButton = screen.getByLabelText('Search');
      await user.click(searchButton);
      
      expect(onSearch).toHaveBeenCalledWith('test query');
    });
  });

  describe('User Menu', () => {
    const userProps = {
      ...defaultProps,
      user: {
        name: 'John Doe',
        avatar: '/avatar.jpg',
        menu: [
          { label: 'Profile', href: '#profile' },
          { label: 'Settings', href: '#settings' },
          { label: 'Sign out', onClick: jest.fn() },
        ],
      },
    };

    it('renders user menu when provided', () => {
      render(<Navbar {...userProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('opens user menu on click', async () => {
      const user = userEvent.setup();
      render(<Navbar {...userProps} />);
      
      const userButton = screen.getByText('John Doe').closest('button');
      await user.click(userButton!);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('handles user menu item clicks', async () => {
      const user = userEvent.setup();
      render(<Navbar {...userProps} />);
      
      const userButton = screen.getByText('John Doe').closest('button');
      await user.click(userButton!);
      
      const profileLink = screen.getByText('Profile');
      await user.click(profileLink);
      
      expect(window.location.href).toBe('#profile');
    });

    it('handles menu item onClick callbacks', async () => {
      const user = userEvent.setup();
      render(<Navbar {...userProps} />);
      
      const userButton = screen.getByText('John Doe').closest('button');
      await user.click(userButton!);
      
      const signOutButton = screen.getByText('Sign out');
      await user.click(signOutButton);
      
      expect(userProps.user!.menu![2].onClick).toHaveBeenCalled();
    });
  });

  describe('Language Selector', () => {
    const languageProps = {
      ...defaultProps,
      language: {
        current: 'en',
        options: [
          { code: 'en', label: 'English', flag: '🇺🇸' },
          { code: 'fr', label: 'Français', flag: '🇫🇷' },
          { code: 'es', label: 'Español', flag: '🇪🇸' },
        ],
        onChange: jest.fn(),
      },
    };

    it('renders language selector when provided', () => {
      render(<Navbar {...languageProps} />);
      
      expect(screen.getByLabelText('Change language')).toBeInTheDocument();
    });

    it('cycles through language options on click', async () => {
      const user = userEvent.setup();
      render(<Navbar {...languageProps} />);
      
      const languageButton = screen.getByLabelText('Change language');
      expect(screen.getByText('EN')).toBeInTheDocument();
      
      await user.click(languageButton);
      expect(languageProps.language!.onChange).toHaveBeenCalledWith('fr');
    });
  });

  describe('Theme Toggle', () => {
    it('renders theme toggle button', () => {
      render(<Navbar {...defaultProps} />);
      
      const themeToggle = screen.getByLabelText(/Switch to.*mode/);
      expect(themeToggle).toBeInTheDocument();
    });

    it('cycles through theme options', async () => {
      const user = userEvent.setup();
      const onThemeChange = jest.fn();
      render(<Navbar {...defaultProps} onThemeChange={onThemeChange} />);
      
      const themeToggle = screen.getByLabelText(/Switch to.*mode/);
      await user.click(themeToggle);
      
      expect(onThemeChange).toHaveBeenCalledWith('dark');
      
      await user.click(themeToggle);
      expect(onThemeChange).toHaveBeenCalledWith('auto');
    });

    it('shows different icons for different themes', () => {
      const { rerender } = render(<Navbar {...defaultProps} theme="light" />);
      expect(screen.getByLabelText(/Switch to dark mode/)).toBeInTheDocument();
      
      rerender(<Navbar {...defaultProps} theme="dark" />);
      expect(screen.getByLabelText(/Switch to auto mode/)).toBeInTheDocument();
      
      rerender(<Navbar {...defaultProps} theme="auto" />);
      expect(screen.getByLabelText(/Switch to light mode/)).toBeInTheDocument();
    });
  });

  describe('CTA Button', () => {
    it('renders CTA with default styling', () => {
      const ctaProps = {
        ...defaultProps,
        cta: { label: 'Get Started' },
      };
      
      render(<Navbar {...ctaProps} />);
      
      const ctaButton = screen.getByRole('button', { name: 'Get Started' });
      expect(ctaButton).toHaveClass('navbar-cta--primary', 'navbar-cta--md');
    });

    it('renders CTA with custom variant and size', () => {
      const ctaProps = {
        ...defaultProps,
        cta: { 
          label: 'Contact Us', 
          variant: 'outline', 
          size: 'lg' 
        },
      };
      
      render(<Navbar {...ctaProps} />);
      
      const ctaButton = screen.getByRole('button', { name: 'Contact Us' });
      expect(ctaButton).toHaveClass('navbar-cta--outline', 'navbar-cta--lg');
    });

    it('handles CTA onClick callback', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const ctaProps = {
        ...defaultProps,
        cta: { label: 'Click Me', onClick },
      };
      
      render(<Navbar {...ctaProps} />);
      
      const ctaButton = screen.getByRole('button', { name: 'Click Me' });
      await user.click(ctaButton);
      
      expect(onClick).toHaveBeenCalled();
    });

    it('handles CTA href navigation', () => {
      const ctaProps = {
        ...defaultProps,
        cta: { label: 'Visit Site', href: 'https://example.com' },
      };
      
      render(<Navbar {...ctaProps} />);
      
      const ctaButton = screen.getByRole('button', { name: 'Visit Site' });
      fireEvent.click(ctaButton);
      
      expect(window.location.href).toBe('https://example.com');
    });
  });

  describe('Navigation Item Interactions', () => {
    it('calls onItemClick when navigation item is clicked', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      render(<Navbar {...defaultProps} onItemClick={onItemClick} />);
      
      const featuresLink = screen.getByText('Features');
      await user.click(featuresLink);
      
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', label: 'Features' })
      );
    });

    it('handles external links', async () => {
      const user = userEvent.setup();
      const externalItems: NavItem[] = [
        { id: '1', label: 'External', href: 'https://external.com', external: true },
      ];
      
      render(<Navbar items={externalItems} />);
      
      const externalLink = screen.getByText('External');
      await user.click(externalLink);
      
      // External links open in new tab
      expect(screen.getByText('External')).toHaveAttribute('target', '_blank');
    });

    it('does not allow clicks on disabled items', async () => {
      const user = userEvent.setup();
      const disabledItems: NavItem[] = [
        { id: '1', label: 'Disabled', disabled: true },
      ];
      
      render(<Navbar items={disabledItems} onItemClick={jest.fn()} />);
      
      const disabledLink = screen.getByText('Disabled').closest('button') || screen.getByText('Disabled');
      expect(disabledLink).toBeDisabled();
    });

    it('handles badges on navigation items', () => {
      const itemsWithBadges: NavItem[] = [
        { id: '1', label: 'Features', href: '#features', badge: '3' },
        { id: '2', label: 'News', href: '#news', badge: 'NEW' },
      ];
      
      render(<Navbar items={itemsWithBadges} />);
      
      const badges = screen.getAllByText(/3|NEW/);
      expect(badges).toHaveLength(2);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for dropdowns', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      productsButton!.focus();
      
      await user.keyboard('{Enter}');
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{ArrowDown}');
      const productA = screen.getByText('Product A');
      expect(productA).toHaveFocus();
    });

    it('closes dropdowns with escape key', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Navbar {...defaultProps} />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('provides proper ARIA attributes for dropdowns', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      expect(productsButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar {...defaultProps} />);
      
      // Tab to first nav item
      await user.tab();
      expect(screen.getByText('Features')).toHaveFocus();
      
      // Tab to next item
      await user.tab();
      expect(screen.getByText('Pricing')).toHaveFocus();
    });

    it('has proper focus management', () => {
      render(<Navbar {...defaultProps} />);
      
      const navItems = screen.getAllByRole('link');
      navItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Responsive Design', () => {
    it('hides search on mobile', () => {
      render(
        <Navbar 
          {...defaultProps} 
          search={{ show: true }}
          className="mobile-test"
        />
      );
      
      // Search should be hidden on mobile screens
      const search = screen.getByPlaceholderText('Search...');
      expect(search).toHaveClass('navbar-search');
      // In actual implementation, this would be hidden via CSS media query
    });

    it('shows mobile menu toggle on small screens', () => {
      render(<Navbar {...defaultProps} />);
      
      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      expect(mobileToggle).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Navbar {...defaultProps} className="custom-navbar" />);
      
      expect(screen.getByTestId('test-navbar')).toHaveClass('custom-navbar');
    });

    it('applies inline styles', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<Navbar {...defaultProps} style={customStyle} />);
      
      expect(screen.getByTestId('test-navbar')).toHaveStyle(customStyle);
    });
  });

  describe('Animation', () => {
    it('applies animation classes when enabled', () => {
      render(<Navbar {...defaultProps} animation={true} />);
      
      const navbar = screen.getByTestId('test-navbar');
      expect(navbar).toHaveClass('navbar--animated');
    });

    it('disables animations when disabled', () => {
      render(<Navbar {...defaultProps} animation={false} />);
      
      const navbar = screen.getByTestId('test-navbar');
      expect(navbar).not.toHaveClass('navbar--animated');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<Navbar items={[]} />);
      
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toBeInTheDocument();
      // Should render without navigation items
      expect(screen.queryByText('Features')).not.toBeInTheDocument();
    });

    it('handles deeply nested navigation items', () => {
      const deepItems: NavItem[] = [
        {
          id: '1',
          label: 'Level 1',
          children: [
            {
              id: '1-1',
              label: 'Level 2',
              children: [
                {
                  id: '1-1-1',
                  label: 'Level 3',
                  href: '#level3',
                },
              ],
            },
          ],
        },
      ];
      
      render(<Navbar items={deepItems} />);
      
      expect(screen.getByText('Level 1')).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialItems: NavItem[] = [
        { id: '1', label: 'Features & Pricing <2024>', href: '#special' },
      ];
      
      render(<Navbar items={specialItems} />);
      
      expect(screen.getByText('Features & Pricing <2024>')).toBeInTheDocument();
    });

    it('handles very long navigation labels', () => {
      const longLabelItems: NavItem[] = [
        { id: '1', label: 'This is an extremely long navigation label that might cause wrapping issues', href: '#long' },
      ];
      
      render(<Navbar items={longLabelItems} />);
      
      expect(screen.getByText('This is an extremely long navigation label that might cause wrapping issues')).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility', () => {
    it('supports reduced motion preferences', () => {
      // Mock reduced motion
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
      
      render(<Navbar {...defaultProps} animation={true} />);
      
      const navbar = screen.getByTestId('test-navbar');
      expect(navbar).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works with form submission', () => {
      const onSubmit = jest.fn();
      render(
        <form onSubmit={onSubmit}>
          <Navbar {...defaultProps} />
        </form>
      );
      
      const featuresLink = screen.getByText('Features');
      fireEvent.submit(featuresLink);
      
      expect(onSubmit).toHaveBeenCalled();
    });

    it('works within other components', () => {
      const ParentComponent = () => (
        <div>
          <Navbar {...defaultProps} variant="dark" />
          <main>Main content</main>
        </div>
      );
      
      render(<ParentComponent />);
      
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByTestId('test-navbar')).toHaveClass('navbar--dark');
    });
  });
});

// Additional test suites for specific interactions
describe('Navbar - Complex Interactions', () => {
  const mockItems: NavItem[] = [
    { id: '1', label: 'Home', href: '#home' },
    { id: '2', label: 'Products', children: [
      { id: '2-1', label: 'Product A', href: '#a' },
      { id: '2-2', label: 'Product B', href: '#b' },
    ]},
    { id: '3', label: 'Services', children: [
      { id: '3-1', label: 'Service 1', href: '#s1' },
      { id: '3-2', label: 'Service 2', href: '#s2' },
    ]},
    { id: '4', label: 'Contact', href: '#contact' },
  ];

  describe('Multiple Dropdowns', () => {
    it('handles multiple dropdown menus correctly', async () => {
      const user = userEvent.setup();
      render(<Navbar items={mockItems} />);
      
      const productsButton = screen.getByText('Products').closest('button');
      await user.click(productsButton!);
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Product A')).toBeInTheDocument();
      
      const servicesButton = screen.getByText('Services').closest('button');
      await user.click(servicesButton!);
      expect(servicesButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      
      // First dropdown should be closed when second opens
      expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Dynamic Updates', () => {
    it('updates when items prop changes', () => {
      const { rerender } = render(<Navbar items={mockItems.slice(0, 2)} />);
      expect(screen.getAllByRole('link')).toHaveLength(2);
      
      rerender(<Navbar items={mockItems} />);
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });

    it('handles layout changes', () => {
      const { rerender } = render(<Navbar items={mockItems} layout="left" />);
      expect(screen.getByTestId('navbar')).toHaveClass('navbar--left');
      
      rerender(<Navbar items={mockItems} layout="center" />);
      expect(screen.getByTestId('navbar')).toHaveClass('navbar--center');
    });
  });
});

export {};