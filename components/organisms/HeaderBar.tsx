/**
 * HeaderBar Component
 * 
 * A sophisticated navigation header component with multiple variants, layouts, and features.
 * Supports search, user menu, notifications, breadcrumbs, and responsive design.
 * 
 * @version 1.0.0
 * @author MiniMax Agent
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';
import './HeaderBar.css';

// Types
interface MenuItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface UserMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  separator?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export interface HeaderBarProps {
  /** Logo component or text */
  logo?: React.ReactNode;
  /** Main title */
  title?: string;
  /** Navigation menu items */
  menu?: MenuItem[];
  /** User menu items */
  userMenu?: UserMenuItem[];
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Notification items */
  notifications?: NotificationItem[];
  /** Component variant */
  variant?: 'default' | 'dark' | 'light' | 'sticky' | 'transparent';
  /** Layout style */
  layout?: 'left-aligned' | 'centered' | 'split' | 'compact';
  /** Size of the header */
  size?: 'sm' | 'md' | 'lg';
  /** Show search bar */
  showSearch?: boolean;
  /** Show user menu */
  showUserMenu?: boolean;
  /** Show notifications */
  showNotifications?: boolean;
  /** Show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Enable sticky behavior */
  sticky?: boolean;
  /** Enable shadow on scroll */
  shadowOnScroll?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** User avatar URL */
  userAvatar?: string;
  /** User name */
  userName?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Callback when menu item is clicked */
  onMenuClick?: (item: MenuItem, index: number) => void;
  /** Callback when user menu item is clicked */
  onUserMenuClick?: (item: UserMenuItem, index: number) => void;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: NotificationItem) => void;
  /** Additional CSS class names */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// Default menu items
const defaultMenu: MenuItem[] = [
  { label: 'Docs', href: '#docs' },
  { label: 'Blog', href: '#blog' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
];

// Default user menu
const defaultUserMenu: UserMenuItem[] = [
  { label: 'Profile', href: '#profile', icon: '👤' },
  { label: 'Settings', href: '#settings', icon: '⚙️' },
  { label: 'Help', href: '#help', icon: '❓' },
  { label: 'separator' as const, label: '', href: '#', separator: true },
  { label: 'Sign Out', href: '#signout', icon: '🚪' }
];

// Main Component
const HeaderBar: React.FC<HeaderBarProps> = ({
  logo = <strong>NexusG</strong>,
  title = 'Studio',
  menu = defaultMenu,
  userMenu = defaultUserMenu,
  breadcrumbs = [],
  notifications = [],
  variant = 'default',
  layout = 'left-aligned',
  size = 'md',
  showSearch = false,
  showUserMenu = false,
  showNotifications = false,
  showBreadcrumbs = false,
  sticky = false,
  shadowOnScroll = false,
  searchPlaceholder = 'Search...',
  userAvatar,
  userName = 'User',
  onSearch,
  onMenuClick,
  onUserMenuClick,
  onNotificationClick,
  className = '',
  style = {}
}) => {
  // State management
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(shadowOnScroll ? scrollTop > 10 : false);
    };

    if (shadowOnScroll || sticky) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [shadowOnScroll, sticky]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
    setIsSearchOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  // Menu click handlers
  const handleMenuClick = (item: MenuItem, index: number) => {
    if (onMenuClick) {
      onMenuClick(item, index);
    }
  };

  const handleUserMenuClick = (item: UserMenuItem, index: number) => {
    if (!item.separator && onUserMenuClick) {
      onUserMenuClick(item, index);
    }
    setIsUserMenuOpen(false);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Build CSS classes
  const headerBarClasses = cn(
    'tb-headerbar',
    `tb-headerbar--${variant}`,
    `tb-headerbar--${layout}`,
    `tb-headerbar--${size}`,
    { 'tb-headerbar--sticky': sticky },
    { 'tb-headerbar--scrolled': isScrolled },
    { 'tb-headerbar--open': (isSearchOpen || isUserMenuOpen || isNotificationsOpen) },
    className
  );

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <nav className="tb-headerbar__breadcrumbs" aria-label="Breadcrumb">
        <ol className="tb-headerbar__breadcrumb-list">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="tb-headerbar__breadcrumb-item">
              {item.href ? (
                <a href={item.href} className="tb-headerbar__breadcrumb-link">
                  {item.label}
                </a>
              ) : (
                <span className="tb-headerbar__breadcrumb-current">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="tb-headerbar__breadcrumb-separator">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Render search
  const renderSearch = () => {
    if (!showSearch) return null;

    return (
      <div className="tb-headerbar__search">
        <button
          type="button"
          className="tb-headerbar__search-toggle"
          onClick={handleSearchToggle}
          aria-label="Toggle search"
          aria-expanded={isSearchOpen}
        >
          🔍
        </button>
        {isSearchOpen && (
          <div className="tb-headerbar__search-container">
            <form onSubmit={handleSearchSubmit} className="tb-headerbar__search-form">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="tb-headerbar__search-input"
                aria-label="Search"
              />
              <button type="submit" className="tb-headerbar__search-submit" aria-label="Submit search">
                Search
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Render notifications
  const renderNotifications = () => {
    if (!showNotifications) return null;

    return (
      <div className="tb-headerbar__notifications" ref={notificationsRef}>
        <button
          type="button"
          className="tb-headerbar__notifications-toggle"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          aria-label="Toggle notifications"
          aria-expanded={isNotificationsOpen}
        >
          🔔
          {unreadCount > 0 && (
            <span className="tb-headerbar__notifications-badge">{unreadCount}</span>
          )}
        </button>
        {isNotificationsOpen && (
          <div className="tb-headerbar__notifications-dropdown">
            <div className="tb-headerbar__notifications-header">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <span className="tb-headerbar__notifications-count">{unreadCount} unread</span>
              )}
            </div>
            <div className="tb-headerbar__notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`tb-headerbar__notification-item ${!notification.read ? 'tb-headerbar__notification-item--unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotificationClick(notification);
                      }
                    }}
                  >
                    <div className="tb-headerbar__notification-icon">
                      {notification.icon || '📢'}
                    </div>
                    <div className="tb-headerbar__notification-content">
                      <div className="tb-headerbar__notification-title">{notification.title}</div>
                      <div className="tb-headerbar__notification-message">{notification.message}</div>
                      <div className="tb-headerbar__notification-time">{notification.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="tb-headerbar__notifications-empty">No notifications</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render user menu
  const renderUserMenu = () => {
    if (!showUserMenu) return null;

    return (
      <div className="tb-headerbar__user" ref={userMenuRef}>
        <button
          type="button"
          className="tb-headerbar__user-toggle"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          aria-label="Toggle user menu"
          aria-expanded={isUserMenuOpen}
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="tb-headerbar__user-avatar" />
          ) : (
            <div className="tb-headerbar__user-avatar-placeholder">👤</div>
          )}
          <span className="tb-headerbar__user-name">{userName}</span>
        </button>
        {isUserMenuOpen && (
          <div className="tb-headerbar__user-dropdown">
            {userMenu.map((item, index) => (
              <div key={index}>
                {item.separator ? (
                  <div className="tb-headerbar__user-separator" />
                ) : (
                  <button
                    type="button"
                    className="tb-headerbar__user-item"
                    onClick={() => handleUserMenuClick(item, index)}
                  >
                    <span className="tb-headerbar__user-item-icon">{item.icon}</span>
                    <span className="tb-headerbar__user-item-label">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={headerBarClasses} style={style}>
      <div className="tb-headerbar__container">
        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Main Header */}
        <div className="tb-headerbar__main">
          {/* Left Section */}
          <div className="tb-headerbar__left">
            <div className="tb-headerbar__brand">
              {logo}
              {title && <span className="tb-headerbar__title"> — {title}</span>}
            </div>
          </div>

          {/* Center Section (for centered layout) */}
          {layout === 'centered' && (
            <nav className="tb-headerbar__nav tb-headerbar__nav--center">
              {menu.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`tb-headerbar__menu-item ${item.active ? 'tb-headerbar__menu-item--active' : ''}`}
                  onClick={() => handleMenuClick(item, index)}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && <span className="tb-headerbar__menu-item-icon">{item.icon}</span>}
                  <span className="tb-headerbar__menu-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="tb-headerbar__menu-item-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="tb-headerbar__right">
            {/* Search */}
            {renderSearch()}

            {/* Navigation Menu */}
            {layout !== 'centered' && (
              <nav className="tb-headerbar__nav">
                {menu.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`tb-headerbar__menu-item ${item.active ? 'tb-headerbar__menu-item--active' : ''}`}
                    onClick={() => handleMenuClick(item, index)}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    {item.icon && <span className="tb-headerbar__menu-item-icon">{item.icon}</span>}
                    <span className="tb-headerbar__menu-item-label">{item.label}</span>
                    {item.badge && (
                      <span className="tb-headerbar__menu-item-badge">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>
            )}

            {/* Notifications */}
            {renderNotifications()}

            {/* User Menu */}
            {renderUserMenu()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
export type { HeaderBarProps, MenuItem, UserMenuItem, BreadcrumbItem, NotificationItem };