import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

/**
 * Navigation item interface
 */
export interface NavItem {
  /** Text label for the navigation item */
  label: string;
  /** URL for the link */
  href?: string;
  /** Icon to display with the item */
  icon?: React.ReactNode;
  /** Whether the item is active/current */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Target attribute for links (e.g., '_blank') */
  target?: string;
  /** Rel attribute for link security */
  rel?: string;
  /** Additional CSS classes for the item */
  className?: string;
  /** Click handler for custom navigation logic */
  onClick?: () => void;
  /** Sub-navigation items for dropdown */
  children?: NavItem[];
  /** Whether to show dropdown arrow */
  hasDropdown?: boolean;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * Navbar component props
 */
export interface NavbarProps {
  /** Brand/logo configuration */
  brand?: {
    /** Brand text or ReactNode */
    content: React.ReactNode;
    /** Brand URL (optional) */
    href?: string;
    /** Brand image URL */
    logo?: string;
    /** Alt text for logo */
    logoAlt?: string;
    /** Brand click handler */
    onClick?: () => void;
  };
  /** Navigation items */
  items?: NavItem[];
  /** Position of the navbar */
  position?: 'static' | 'sticky' | 'fixed';
  /** Visual style variant */
  variant?: 'default' | 'transparent' | 'glass' | 'bordered' | 'minimal';
  /** Size of the navbar */
  size?: 'sm' | 'md' | 'lg';
  /** Alignment of navigation items */
  align?: 'left' | 'center' | 'right';
  /** Whether to show mobile menu button */
  showMobileMenu?: boolean;
  /** Mobile menu breakpoint */
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  /** Whether navbar is expanded (mobile) */
  expanded?: boolean;
  /** Default expanded state (uncontrolled) */
  defaultExpanded?: boolean;
  /** Search configuration */
  search?: {
    /** Placeholder text */
    placeholder?: string;
    /** Search handler */
    onSearch?: (query: string) => void;
    /** Show search input */
    show?: boolean;
    /** Search input value (controlled) */
    value?: string;
    /** Default search value (uncontrolled) */
    defaultValue?: string;
  };
  /** User menu configuration */
  user?: {
    /** User name */
    name?: string;
    /** User avatar/image */
    avatar?: string;
    /** User menu items */
    menu?: NavItem[];
    /** Login/logout handler */
    onAuth?: () => void;
    /** Auth state */
    isAuthenticated?: boolean;
  };
  /** Additional actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Height of navbar */
  height?: string;
  /** Whether to show shadows */
  shadow?: boolean;
  /** Whether to show border */
  bordered?: boolean;
  /** Z-index for fixed/sticky positioning */
  zIndex?: number;
  /** Whether to collapse on mobile */
  collapsible?: boolean;
  /** Custom padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Language switcher configuration */
  language?: {
    /** Current language */
    current?: string;
    /** Available languages */
    options?: { code: string; label: string; flag?: string }[];
    /** Language change handler */
    onChange?: (language: string) => void;
  };
  /** Theme toggle configuration */
  theme?: {
    /** Current theme */
    current?: 'light' | 'dark' | 'auto';
    /** Theme change handler */
    onChange?: (theme: 'light' | 'dark' | 'auto') => void;
  };
  /** Breadcrumbs configuration */
  breadcrumbs?: {
    /** Breadcrumb items */
    items: { label: string; href?: string }[];
    /** Whether to show breadcrumbs */
    show?: boolean;
  };
  /** Custom container element */
  as?: React.ElementType;
  /** Additional CSS classes */
  className?: string;
  /** Custom ID for the navbar */
  id?: string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Mobile menu toggle handler */
  onToggle?: (expanded: boolean) => void;
  /** Menu state change handler */
  onMenuStateChange?: (open: boolean) => void;
  /** Navigation change handler */
  onNavigate?: (item: NavItem) => void;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      brand = { content: 'NexusG' },
      items = [],
      position = 'static',
      variant = 'default',
      size = 'md',
      align = 'left',
      showMobileMenu = true,
      mobileBreakpoint = 'md',
      expanded: controlledExpanded,
      defaultExpanded = false,
      search,
      user,
      actions,
      backgroundColor,
      textColor,
      height,
      shadow = false,
      bordered = false,
      zIndex,
      collapsible = true,
      padding = 'md',
      language,
      theme,
      breadcrumbs,
      as: Component = 'nav',
      className,
      id,
      'data-testid': dataTestid,
      onToggle,
      onMenuStateChange,
      onNavigate,
      ...props
    },
    ref
  ) => {
    // State management
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    // Use controlled or uncontrolled state
    const isControlled = controlledExpanded !== undefined;
    const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

    // Handle expanded state changes
    const handleToggle = (newExpanded: boolean) => {
      if (!isControlled) {
        setUncontrolledExpanded(newExpanded);
      }
      onToggle?.(newExpanded);
    };

    // Handle scroll effect for sticky/fixed navbar
    useEffect(() => {
      const handleScroll = () => {
        if (position === 'sticky' || position === 'fixed') {
          setScrolled(window.scrollY > 10);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [position]);

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.navbar-dropdown')) {
          setActiveDropdown(null);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setActiveDropdown(null);
          if (expanded) {
            handleToggle(false);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [expanded]);

    // Handle dropdown toggle
    const handleDropdownToggle = (itemLabel: string) => {
      setActiveDropdown(activeDropdown === itemLabel ? null : itemLabel);
      onMenuStateChange?.(activeDropdown !== itemLabel);
    };

    // Handle navigation
    const handleNavigate = (item: NavItem) => {
      onNavigate?.(item);
      setActiveDropdown(null);
      if (expanded) {
        handleToggle(false);
      }
    };

    // Combine all classes
    const navbarClasses = cn(
      'navbar',
      `navbar-position-${position}`,
      `navbar-variant-${variant}`,
      `navbar-size-${size}`,
      `navbar-align-${align}`,
      `navbar-mobile-breakpoint-${mobileBreakpoint}`,
      scrolled && 'navbar-scrolled',
      expanded && 'navbar-expanded',
      shadow && 'navbar-shadow',
      bordered && 'navbar-bordered',
      collapsible && 'navbar-collapsible',
      className
    );

    // Custom styles
    const navbarStyles: React.CSSProperties = {
      ...(backgroundColor && { backgroundColor }),
      ...(textColor && { color: textColor }),
      ...(height && { height }),
      ...(zIndex && { zIndex }),
    };

    // Render brand
    const renderBrand = () => {
      if (!brand) return null;

      const brandContent = brand.logo ? (
        <img 
          src={brand.logo} 
          alt={brand.logoAlt || 'Brand logo'} 
          className="navbar-brand-logo"
        />
      ) : (
        brand.content
      );

      if (brand.href) {
        return (
          <a 
            href={brand.href}
            className="navbar-brand-link"
            onClick={brand.onClick}
          >
            {brandContent}
          </a>
        );
      }

      return (
        <div 
          className="navbar-brand"
          onClick={brand.onClick}
        >
          {brandContent}
        </div>
      );
    };

    // Render navigation items
    const renderNavItems = () => {
      if (!items.length) return null;

      return (
        <ul className="navbar-nav">
          {items.map((item, index) => (
            <li key={index} className="navbar-nav-item">
              {item.children && item.children.length > 0 ? (
                <div className="navbar-dropdown">
                  <button
                    className={cn(
                      'navbar-dropdown-toggle',
                      activeDropdown === item.label && 'navbar-dropdown-toggle-active'
                    )}
                    onClick={() => handleDropdownToggle(item.label)}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup="true"
                    data-testid={item['data-testid']}
                  >
                    {item.icon && (
                      <span className="navbar-nav-icon">
                        {item.icon}
                      </span>
                    )}
                    <span className="navbar-nav-label">{item.label}</span>
                    {item.hasDropdown && (
                      <svg
                        className="navbar-dropdown-arrow"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  
                  {activeDropdown === item.label && (
                    <div className="navbar-dropdown-menu">
                      {item.children.map((child, childIndex) => (
                        <a
                          key={childIndex}
                          href={child.href}
                          className="navbar-dropdown-item"
                          onClick={() => handleNavigate(child)}
                        >
                          {child.icon && (
                            <span className="navbar-dropdown-icon">
                              {child.icon}
                            </span>
                          )}
                          <span className="navbar-dropdown-label">{child.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={item.href}
                  className={cn(
                    'navbar-nav-link',
                    item.active && 'navbar-nav-link-active',
                    item.disabled && 'navbar-nav-link-disabled'
                  )}
                  onClick={() => handleNavigate(item)}
                  target={item.target}
                  rel={item.rel}
                  aria-disabled={item.disabled}
                  data-testid={item['data-testid']}
                >
                  {item.icon && (
                    <span className="navbar-nav-icon">
                      {item.icon}
                    </span>
                  )}
                  <span className="navbar-nav-label">{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      );
    };

    // Render search
    const renderSearch = () => {
      if (!search?.show) return null;

      const [searchValue, setSearchValue] = useState(search.value || search.defaultValue || '');

      const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchValue(newValue);
        search.onSearch?.(newValue);
      };

      return (
        <div className="navbar-search">
          <input
            type="search"
            placeholder={search.placeholder || 'Search...'}
            value={searchValue}
            onChange={handleSearchChange}
            className="navbar-search-input"
          />
          <svg
            className="navbar-search-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M11 11L15 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="7"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      );
    };

    // Render user menu
    const renderUser = () => {
      if (!user) return null;

      if (!user.isAuthenticated) {
        return (
          <button
            className="navbar-auth-button"
            onClick={user.onAuth}
          >
            Login
          </button>
        );
      }

      return (
        <div className="navbar-user">
          <button
            className="navbar-user-button"
            onClick={() => handleDropdownToggle('user')}
            aria-expanded={activeDropdown === 'user'}
            aria-haspopup="true"
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name || 'User avatar'} 
                className="navbar-user-avatar"
              />
            ) : (
              <div className="navbar-user-avatar-placeholder">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            {user.name && (
              <span className="navbar-user-name">{user.name}</span>
            )}
          </button>

          {activeDropdown === 'user' && (
            <div className="navbar-user-menu">
              {user.menu?.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="navbar-user-menu-item"
                  onClick={() => handleNavigate(item)}
                >
                  {item.icon && (
                    <span className="navbar-user-menu-icon">
                      {item.icon}
                    </span>
                  )}
                  <span className="navbar-user-menu-label">{item.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    };

    // Render language switcher
    const renderLanguage = () => {
      if (!language?.options?.length) return null;

      return (
        <div className="navbar-language">
          <button
            className="navbar-language-button"
            onClick={() => handleDropdownToggle('language')}
            aria-expanded={activeDropdown === 'language'}
            aria-haspopup="true"
          >
            {language.current || language.options[0]?.code}
          </button>

          {activeDropdown === 'language' && (
            <div className="navbar-language-menu">
              {language.options.map((option) => (
                <button
                  key={option.code}
                  className="navbar-language-option"
                  onClick={() => {
                    language.onChange?.(option.code);
                    setActiveDropdown(null);
                  }}
                >
                  {option.flag && (
                    <span className="navbar-language-flag">{option.flag}</span>
                  )}
                  <span className="navbar-language-label">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    };

    // Render theme toggle
    const renderTheme = () => {
      if (!theme) return null;

      return (
        <button
          className="navbar-theme-toggle"
          onClick={() => {
            const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
            const currentIndex = themes.indexOf(theme.current || 'auto');
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            theme.onChange?.(nextTheme);
          }}
          aria-label="Toggle theme"
        >
          {theme.current === 'dark' ? '🌙' : theme.current === 'light' ? '☀️' : '🌓'}
        </button>
      );
    };

    // Render breadcrumbs
    const renderBreadcrumbs = () => {
      if (!breadcrumbs?.show || !breadcrumbs.items?.length) return null;

      return (
        <nav className="navbar-breadcrumbs" aria-label="Breadcrumb">
          <ol className="navbar-breadcrumbs-list">
            {breadcrumbs.items.map((item, index) => (
              <li key={index} className="navbar-breadcrumbs-item">
                {item.href ? (
                  <a href={item.href} className="navbar-breadcrumbs-link">
                    {item.label}
                  </a>
                ) : (
                  <span className="navbar-breadcrumbs-current">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      );
    };

    // Render actions
    const renderActions = () => {
      if (!actions) return null;

      return (
        <div className="navbar-actions">
          {actions}
        </div>
      );
    };

    // Render mobile menu button
    const renderMobileMenuButton = () => {
      if (!showMobileMenu) return null;

      return (
        <button
          className={cn(
            'navbar-mobile-toggle',
            expanded && 'navbar-mobile-toggle-active'
          )}
          onClick={() => handleToggle(!expanded)}
          aria-expanded={expanded}
          aria-label="Toggle navigation menu"
          aria-controls="navbar-menu"
        >
          <span className="navbar-mobile-toggle-line" />
          <span className="navbar-mobile-toggle-line" />
          <span className="navbar-mobile-toggle-line" />
        </button>
      );
    };

    return (
      <Component
        ref={ref}
        id={id}
        className={navbarClasses}
        style={navbarStyles}
        data-testid={dataTestid}
        role="navigation"
        aria-label="Main navigation"
        {...props}
      >
        <div className="navbar-container">
          {renderBrand()}
          
          <div className="navbar-content">
            {renderNavItems()}
            {renderSearch()}
          </div>
          
          <div className="navbar-right">
            {renderLanguage()}
            {renderTheme()}
            {renderUser()}
            {renderActions()}
            {renderMobileMenuButton()}
          </div>
        </div>

        {expanded && (
          <div className="navbar-mobile-menu" id="navbar-menu">
            {renderBreadcrumbs()}
            {renderNavItems()}
            {renderSearch()}
          </div>
        )}
      </Component>
    );
  }
);

Navbar.displayName = 'Navbar';

export default Navbar;