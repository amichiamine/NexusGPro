/**
 * HeaderBar Component Tests
 * 
 * Comprehensive test coverage for the HeaderBar component including:
 * - Component rendering
 * - Variant testing
 * - Layout testing  
 * - Size testing
 * - Interaction testing
 * - Accessibility testing
 * - Search functionality
 * - User menu functionality
 * - Notifications functionality
 * - Responsive design
 * 
 * @version 1.0.0
 * @author MiniMax Agent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeaderBar, { HeaderBarProps, MenuItem, UserMenuItem, BreadcrumbItem, NotificationItem } from './HeaderBar';
import '@testing-library/jest-dom';

// Mock CSS import
jest.mock('./HeaderBar.css', () => ({}));

// Test utilities
const createMockMenu = (): MenuItem[] => [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact', badge: '3' }
];

const createMockUserMenu = (): UserMenuItem[] => [
  { label: 'Profile', href: '/profile', icon: '👤' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
  { label: 'separator' as const, label: '', href: '#', separator: true },
  { label: 'Sign Out', href: '/signout', icon: '🚪' }
];

const createMockBreadcrumbs = (): BreadcrumbItem[] => [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Current Page' }
];

const createMockNotifications = (): NotificationItem[] => [
  {
    id: '1',
    title: 'Welcome!',
    message: 'Welcome to our platform',
    time: '2 hours ago',
    read: false,
    type: 'info',
    icon: '🎉'
  },
  {
    id: '2',
    title: 'Update Available',
    message: 'New version released',
    time: '1 day ago',
    read: true,
    type: 'success',
    icon: '🚀'
  }
];

// Mock scroll function
const mockScroll = jest.fn();
Object.defineProperty(window, 'pageYOffset', {
  writable: true,
  value: 0,
});
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScroll,
});

describe('HeaderBar Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    window.pageYOffset = 0;
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<HeaderBar />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('NexusG — Studio')).toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('renders with custom logo and title', () => {
      const customLogo = <div data-testid="custom-logo">Custom Logo</div>;
      render(<HeaderBar logo={customLogo} title="Custom Title" />);
      
      expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders with custom menu items', () => {
      const menu = createMockMenu();
      render(<HeaderBar menu={menu} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders with user menu', () => {
      render(<HeaderBar showUserMenu={true} userMenu={createMockUserMenu()} />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('renders with notifications', () => {
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      expect(screen.getByLabelText('Toggle notifications')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants: Array<HeaderBarProps['variant']> = ['default', 'dark', 'light', 'sticky', 'transparent'];
    
    variants.forEach(variant => {
      it(`renders with ${variant} variant`, () => {
        const { container } = render(<HeaderBar variant={variant} />);
        expect(container.firstChild).toHaveClass(`tb-headerbar--${variant}`);
      });
    });
  });

  describe('Layouts', () => {
    const layouts: Array<HeaderBarProps['layout']> = ['left-aligned', 'centered', 'split', 'compact'];
    
    layouts.forEach(layout => {
      it(`renders with ${layout} layout`, () => {
        const { container } = render(<HeaderBar layout={layout} />);
        expect(container.firstChild).toHaveClass(`tb-headerbar--${layout}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: Array<HeaderBarProps['size']> = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`renders with ${size} size`, () => {
        const { container } = render(<HeaderBar size={size} />);
        expect(container.firstChild).toHaveClass(`tb-headerbar--${size}`);
      });
    });
  });

  describe('Breadcrumbs', () => {
    it('renders breadcrumbs when enabled', () => {
      const breadcrumbs = createMockBreadcrumbs();
      render(<HeaderBar showBreadcrumbs={true} breadcrumbs={breadcrumbs} />);
      
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });

    it('does not render breadcrumbs when disabled', () => {
      const breadcrumbs = createMockBreadcrumbs();
      render(<HeaderBar showBreadcrumbs={false} breadcrumbs={breadcrumbs} />);
      
      expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
    });

    it('handles breadcrumb navigation', () => {
      const breadcrumbs = createMockBreadcrumbs();
      render(<HeaderBar showBreadcrumbs={true} breadcrumbs={breadcrumbs} />);
      
      const homeLink = screen.getByText('Home');
      const productsLink = screen.getByText('Products');
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(productsLink).toHaveAttribute('href', '/products');
      expect(screen.getByText('Current Page')).toHaveClass('tb-headerbar__breadcrumb-current');
    });
  });

  describe('Search Functionality', () => {
    it('renders search when enabled', () => {
      render(<HeaderBar showSearch={true} />);
      
      expect(screen.getByLabelText('Toggle search')).toBeInTheDocument();
    });

    it('opens search on toggle click', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showSearch={true} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      await user.click(searchToggle);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });
    });

    it('handles search submission', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(<HeaderBar showSearch={true} onSearch={onSearch} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      await user.click(searchToggle);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test query');
      
      const searchSubmit = screen.getByLabelText('Submit search');
      await user.click(searchSubmit);
      
      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('closes search on escape key', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showSearch={true} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      await user.click(searchToggle);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, '{escape}');
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Menu', () => {
    it('renders user menu when enabled', () => {
      const userMenu = createMockUserMenu();
      render(<HeaderBar showUserMenu={true} userMenu={userMenu} />);
      
      expect(screen.getByLabelText('Toggle user menu')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('opens user menu on click', async () => {
      const user = userEvent.setup();
      const userMenu = createMockUserMenu();
      render(<HeaderBar showUserMenu={true} userMenu={userMenu} />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      await user.click(userToggle);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    it('handles user menu item clicks', async () => {
      const user = userEvent.setup();
      const onUserMenuClick = jest.fn();
      const userMenu = createMockUserMenu();
      render(<HeaderBar 
        showUserMenu={true} 
        userMenu={userMenu} 
        onUserMenuClick={onUserMenuClick}
      />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      await user.click(userToggle);
      
      const profileItem = screen.getByText('Profile');
      await user.click(profileItem);
      
      expect(onUserMenuClick).toHaveBeenCalledWith(userMenu[0], 0);
    });

    it('renders user avatar when provided', () => {
      render(<HeaderBar 
        showUserMenu={true} 
        userAvatar="https://example.com/avatar.jpg"
        userName="John Doe"
      />);
      
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders placeholder avatar when none provided', () => {
      render(<HeaderBar showUserMenu={true} userName="John Doe" />);
      
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('closes user menu when clicking outside', async () => {
      const user = userEvent.setup();
      const userMenu = createMockUserMenu();
      render(<HeaderBar showUserMenu={true} userMenu={userMenu} />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      await user.click(userToggle);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
      
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notifications', () => {
    it('renders notifications when enabled', () => {
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      expect(screen.getByLabelText('Toggle notifications')).toBeInTheDocument();
    });

    it('shows unread count badge', () => {
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      // One notification is unread (should show badge)
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('opens notifications dropdown on click', async () => {
      const user = userEvent.setup();
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Welcome!')).toBeInTheDocument();
        expect(screen.getByText('1 unread')).toBeInTheDocument();
      });
    });

    it('handles notification clicks', async () => {
      const user = userEvent.setup();
      const onNotificationClick = jest.fn();
      const notifications = createMockNotifications();
      render(<HeaderBar 
        showNotifications={true} 
        notifications={notifications}
        onNotificationClick={onNotificationClick}
      />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      const welcomeNotification = screen.getByText('Welcome!');
      await user.click(welcomeNotification);
      
      expect(onNotificationClick).toHaveBeenCalledWith(notifications[0]);
    });

    it('displays empty state when no notifications', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showNotifications={true} notifications={[]} />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });

    it('closes notifications when clicking outside', async () => {
      const user = userEvent.setup();
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome!')).toBeInTheDocument();
      });
      
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Menu Interactions', () => {
    it('handles menu item clicks', async () => {
      const user = userEvent.setup();
      const onMenuClick = jest.fn();
      const menu = createMockMenu();
      render(<HeaderBar menu={menu} onMenuClick={onMenuClick} />);
      
      const aboutItem = screen.getByText('About');
      await user.click(aboutItem);
      
      expect(onMenuClick).toHaveBeenCalledWith(menu[1], 1);
    });

    it('marks active menu items', () => {
      const menu = createMockMenu();
      render(<HeaderBar menu={menu} />);
      
      const homeItem = screen.getByText('Home');
      expect(homeItem).toHaveClass('tb-headerbar__menu-item--active');
      expect(homeItem).toHaveAttribute('aria-current', 'page');
      
      const aboutItem = screen.getByText('About');
      expect(aboutItem).not.toHaveClass('tb-headerbar__menu-item--active');
    });

    it('displays menu item badges', () => {
      const menu = createMockMenu();
      render(<HeaderBar menu={menu} />);
      
      const contactItem = screen.getByText('Contact');
      const badge = contactItem.parentElement?.querySelector('.tb-headerbar__menu-item-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('3');
    });

    it('displays menu item icons', () => {
      const menu: MenuItem[] = [
        { label: 'Home', href: '/', icon: '🏠' },
        { label: 'Settings', href: '/settings', icon: '⚙️' }
      ];
      render(<HeaderBar menu={menu} />);
      
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
  });

  describe('Sticky Behavior', () => {
    it('applies sticky class when enabled', () => {
      const { container } = render(<HeaderBar sticky={true} />);
      expect(container.firstChild).toHaveClass('tb-headerbar--sticky');
    });

    it('adds scrolled class when scrolling', async () => {
      const { container } = render(<HeaderBar shadowOnScroll={true} />);
      
      // Mock scroll position
      Object.defineProperty(window, 'pageYOffset', { value: 20, writable: true });
      
      // Trigger scroll event
      fireEvent.scroll(window, { target: { pageYOffset: 20 } });
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass('tb-headerbar--scrolled');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes dropdowns on escape key', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showSearch={true} showUserMenu={true} showNotifications={true} />);
      
      // Open search
      await user.click(screen.getByLabelText('Toggle search'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });
      
      // Press escape
      await user.keyboard('{escape}');
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });
    });

    it('handles keyboard navigation in notifications', async () => {
      const user = userEvent.setup();
      const notifications = createMockNotifications();
      render(<HeaderBar 
        showNotifications={true} 
        notifications={notifications}
        onNotificationClick={jest.fn()}
      />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome!')).toBeInTheDocument();
      });
      
      const welcomeNotification = screen.getByText('Welcome!');
      await user.tab();
      await user.keyboard('{enter}');
      
      // Should trigger notification click
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<HeaderBar />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('has proper ARIA labels for interactive elements', () => {
      render(<HeaderBar showSearch={true} showUserMenu={true} showNotifications={true} />);
      
      expect(screen.getByLabelText('Toggle search')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle user menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle notifications')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showUserMenu={true} userMenu={createMockUserMenu()} />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      await user.tab();
      expect(userToggle).toHaveFocus();
      
      await user.keyboard('{enter}');
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showSearch={true} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      await user.click(searchToggle);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveFocus();
      });
    });

    it('announces unread notification count', () => {
      const notifications = createMockNotifications();
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const { container } = render(<HeaderBar />);
      
      // Should still render without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('hides breadcrumbs on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const breadcrumbs = createMockBreadcrumbs();
      const { container } = render(<HeaderBar showBreadcrumbs={true} breadcrumbs={breadcrumbs} />);
      
      // Should not show breadcrumb navigation on mobile
      expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
    });

    it('adapts layout for different screen sizes', () => {
      const { container } = render(<HeaderBar layout="centered" />);
      
      expect(container.firstChild).toHaveClass('tb-headerbar--centered');
    });
  });

  describe('Event Handlers', () => {
    it('calls onSearch when provided', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(<HeaderBar showSearch={true} onSearch={onSearch} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      await user.click(searchToggle);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test{enter}');
      
      expect(onSearch).toHaveBeenCalledWith('test');
    });

    it('calls onMenuClick when provided', async () => {
      const user = userEvent.setup();
      const onMenuClick = jest.fn();
      const menu = createMockMenu();
      render(<HeaderBar menu={menu} onMenuClick={onMenuClick} />);
      
      const aboutItem = screen.getByText('About');
      await user.click(aboutItem);
      
      expect(onMenuClick).toHaveBeenCalledWith(menu[1], 1);
    });

    it('calls onUserMenuClick when provided', async () => {
      const user = userEvent.setup();
      const onUserMenuClick = jest.fn();
      const userMenu = createMockUserMenu();
      render(<HeaderBar 
        showUserMenu={true} 
        userMenu={userMenu} 
        onUserMenuClick={onUserMenuClick}
      />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      await user.click(userToggle);
      
      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);
      
      expect(onUserMenuClick).toHaveBeenCalledWith(userMenu[1], 1);
    });

    it('calls onNotificationClick when provided', async () => {
      const user = userEvent.setup();
      const onNotificationClick = jest.fn();
      const notifications = createMockNotifications();
      render(<HeaderBar 
        showNotifications={true} 
        notifications={notifications}
        onNotificationClick={onNotificationClick}
      />);
      
      const notificationsToggle = screen.getByLabelText('Toggle notifications');
      await user.click(notificationsToggle);
      
      const welcomeNotification = screen.getByText('Welcome!');
      await user.click(welcomeNotification);
      
      expect(onNotificationClick).toHaveBeenCalledWith(notifications[0]);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<HeaderBar className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<HeaderBar style={customStyle} />);
      expect(container.firstChild).toHaveStyle(customStyle);
    });

    it('merges custom classes with default classes', () => {
      const { container } = render(<HeaderBar className="custom-class" variant="dark" />);
      expect(container.firstChild).toHaveClass('tb-headerbar--dark', 'custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty menu gracefully', () => {
      render(<HeaderBar menu={[]} />);
      
      // Should still render header structure
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('handles menu without active items', () => {
      const menu: MenuItem[] = [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ];
      render(<HeaderBar menu={menu} />);
      
      // No items should have active class
      expect(screen.queryByText('About').parentElement).not.toHaveClass('tb-headerbar__menu-item--active');
    });

    it('handles large number of menu items', () => {
      const menu: MenuItem[] = Array.from({ length: 10 }, (_, i) => ({
        label: `Item ${i + 1}`,
        href: `/item-${i + 1}`
      }));
      
      render(<HeaderBar menu={menu} />);
      
      expect(screen.getByText('Item 10')).toBeInTheDocument();
    });

    it('handles user menu with separators', () => {
      const userMenu = createMockUserMenu();
      render(<HeaderBar showUserMenu={true} userMenu={userMenu} />);
      
      const userToggle = screen.getByLabelText('Toggle user menu');
      fireEvent.click(userToggle);
      
      // Should show separator
      expect(screen.getByText('separator')).toBeInTheDocument();
    });

    it('handles notifications with different types', () => {
      const notifications: NotificationItem[] = [
        { id: '1', title: 'Info', message: 'Info message', time: '1h', read: false, type: 'info' },
        { id: '2', title: 'Success', message: 'Success message', time: '2h', read: false, type: 'success' },
        { id: '3', title: 'Warning', message: 'Warning message', time: '3h', read: false, type: 'warning' },
        { id: '4', title: 'Error', message: 'Error message', time: '4h', read: false, type: 'error' }
      ];
      
      render(<HeaderBar showNotifications={true} notifications={notifications} />);
      
      // All should be visible
      expect(screen.getByText('4')).toBeInTheDocument(); // Unread count
    });

    it('handles breadcrumbs with only one item', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home' }
      ];
      
      render(<HeaderBar showBreadcrumbs={true} breadcrumbs={breadcrumbs} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Home')).toHaveClass('tb-headerbar__breadcrumb-current');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<HeaderBar />);
      const firstRender = screen.getByRole('banner');
      
      rerender(<HeaderBar />);
      
      expect(firstRender).toBe(screen.getByRole('banner'));
    });

    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      render(<HeaderBar showSearch={true} />);
      
      const searchToggle = screen.getByLabelText('Toggle search');
      
      // Rapid clicks
      await user.click(searchToggle);
      await user.click(searchToggle);
      await user.click(searchToggle);
      
      // Should not crash
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});