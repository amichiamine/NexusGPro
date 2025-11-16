import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils';
import './Navbar.css';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface NavbarProps {
  /** Logo or brand element */
  logo?: React.ReactNode | string;
  
  /** Navigation items */
  items?: NavItem[];
  
  /** Call-to-action button configuration */
  cta?: {
    label: string;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
  };
  
  /** Visual variant of the component */
  variant?: 'default' | 'dark' | 'light' | 'transparent' | 'gradient';
  
  /** Size of the navbar */
  size?: 'sm' | 'md' | 'lg';
  
  /** Layout style */
  layout?: 'left' | 'center' | 'split' | 'mega';
  
  /** Navigation behavior */
  sticky?: boolean;
  mobile?: boolean;
  collapsed?: boolean;
  
  /** Animation settings */
  animation?: boolean;
  duration?: number;
  
  /** Mobile menu settings */
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  mobileOverlay?: boolean;
  mobilePosition?: 'left' | 'right' | 'top' | 'bottom';
  
  /** Search functionality */
  search?: {
    placeholder?: string;
    onSearch?: (query: string) => void;
    show?: boolean;
  };
  
  /** User menu */
  user?: {
    avatar?: string;
    name?: string;
    menu?: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: React.ReactNode;
    }>;
  };
  
  /** Language switcher */
  language?: {
    current: string;
    options: Array<{
      code: string;
      label: string;
      flag?: string;
    }>;
    onChange?: (code: string) => void;
  };
  
  /** Theme switcher */
  theme?: 'light' | 'dark' | 'auto';
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void;
  
  /** Event handlers */
  onItemClick?: (item: NavItem) => void;
  onMobileToggle?: (isOpen: boolean) => void;
  
  /** Custom styling */
  className?: string;
  style?: React.CSSProperties;
  
  /** Accessibility */
  'aria-label'?: string;
  
  /** Testing */
  'data-testid'?: string;
}

/**
 * Navbar component for main navigation
 * 
 * Supports multiple variants, layouts, mobile menu, search, user menu,
 * theme switching, and accessibility features.
 */
const Navbar: React.FC<NavbarProps> = ({
  logo = 'NexusG',
  items = [],
  cta,
  variant = 'default',
  size = 'md',
  layout = 'left',
  sticky = false,
  mobile = true,
  collapsed = false,
  animation = true,
  duration = 300,
  mobileBreakpoint = 'md',
  mobileOverlay = true,
  mobilePosition = 'left',
  search,
  user,
  language,
  theme = 'auto',
  onThemeChange,
  onItemClick,
  onMobileToggle,
  className = '',
  style = {},
  'aria-label': ariaLabel = 'Main navigation',
  'data-testid': testId = 'navbar',
  ...props
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (sticky) {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        setActiveDropdown(null);
        setActiveMegaMenu(null);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileOpen;
    setIsMobileOpen(newState);
    onMobileToggle?.(newState);
  }, [isMobileOpen, onMobileToggle]);

  // Handle navigation item click
  const handleItemClick = useCallback((item: NavItem, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (item.disabled) return;

    if (item.children && item.children.length > 0) {
      setActiveDropdown(activeDropdown === item.id ? null : item.id);
      setActiveMegaMenu(null);
    } else {
      if (item.href) {
        if (item.external) {
          window.open(item.href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = item.href;
        }
      }
      onItemClick?.(item);
      setIsMobileOpen(false);
      setActiveDropdown(null);
      setActiveMegaMenu(null);
    }
  }, [activeDropdown, onItemClick]);

  // Handle mega menu toggle
  const toggleMegaMenu = useCallback((itemId: string) => {
    setActiveMegaMenu(activeMegaMenu === itemId ? null : itemId);
    setActiveDropdown(null);
  }, [activeMegaMenu]);

  // Handle search
  const handleSearch = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (search?.onSearch && searchQuery.trim()) {
      search.onSearch(searchQuery.trim());
    }
  }, [search, searchQuery]);

  // Handle theme change
  const handleThemeChange = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    onThemeChange?.(nextTheme);
  }, [theme, onThemeChange]);

  // Handle language change
  const handleLanguageChange = useCallback((code: string) => {
    language?.onChange?.(code);
    setUserMenuOpen(false);
  }, [language]);

  // Render logo
  const renderLogo = () => {
    if (typeof logo === 'string') {
      return (
        <a href="/" className="navbar-logo" aria-label="Home">
          {logo}
        </a>
      );
    }
    return (
      <div className="navbar-logo-custom">
        {logo}
      </div>
    );
  };

  // Render navigation items
  const renderNavItem = (item: NavItem, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeDropdown === item.id || activeMegaMenu === item.id;
    
    return (
      <li key={item.id} className="navbar-item">
        {hasChildren ? (
          <>
            <button
              type="button"
              className={`navbar-link navbar-link--dropdown ${isActive ? 'navbar-link--active' : ''} ${item.disabled ? 'navbar-link--disabled' : ''}`}
              onClick={(e) => handleItemClick(item, e)}
              disabled={item.disabled}
              aria-expanded={isActive}
              aria-haspopup="true"
            >
              {item.icon && <span className="navbar-icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && (
                <span className="navbar-badge">{item.badge}</span>
              )}
              <svg className="navbar-dropdown-arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {activeDropdown === item.id && (
              <div className={`navbar-dropdown ${isMobile ? 'navbar-dropdown--mobile' : ''}`}>
                <div className="navbar-dropdown-content">
                  {item.children!.map((child) => (
                    <a
                      key={child.id}
                      href={child.href || '#'}
                      className={`navbar-dropdown-item ${child.disabled ? 'navbar-dropdown-item--disabled' : ''}`}
                      onClick={(e) => handleItemClick(child, e)}
                    >
                      {child.icon && <span className="navbar-icon">{child.icon}</span>}
                      <span>{child.label}</span>
                      {child.badge && (
                        <span className="navbar-badge">{child.badge}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <a
            href={item.href || '#'}
            className={`navbar-link ${item.disabled ? 'navbar-link--disabled' : ''}`}
            onClick={(e) => handleItemClick(item, e)}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
          >
            {item.icon && <span className="navbar-icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="navbar-badge">{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  // Render mega menu
  const renderMegaMenu = (item: NavItem) => {
    if (activeMegaMenu !== item.id) return null;

    return (
      <div className="navbar-mega-menu">
        <div className="navbar-mega-menu-content">
          <div className="navbar-mega-menu-grid">
            {item.children!.map((category) => (
              <div key={category.id} className="navbar-mega-menu-section">
                <h4 className="navbar-mega-menu-title">{category.label}</h4>
                {category.children?.map((subItem) => (
                  <a
                    key={subItem.id}
                    href={subItem.href || '#'}
                    className="navbar-mega-menu-link"
                    onClick={(e) => handleItemClick(subItem, e)}
                  >
                    {subItem.icon && <span className="navbar-icon">{subItem.icon}</span>}
                    <div className="navbar-mega-menu-text">
                      <span>{subItem.label}</span>
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render search
  const renderSearch = () => {
    if (!search?.show) return null;

    return (
      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder={search.placeholder || 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="navbar-search-input"
          aria-label="Search"
        />
        <button type="submit" className="navbar-search-button" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="7"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </form>
    );
  };

  // Render user menu
  const renderUserMenu = () => {
    if (!user) return null;

    return (
      <div className="navbar-user">
        <button
          type="button"
          className="navbar-user-button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-expanded={userMenuOpen}
          aria-haspopup="menu"
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="navbar-user-avatar" />
          ) : (
            <div className="navbar-user-avatar navbar-user-avatar--placeholder">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
          )}
          {user.name && <span className="navbar-user-name">{user.name}</span>}
          <svg className="navbar-user-arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </button>

        {userMenuOpen && user.menu && (
          <div className="navbar-user-menu">
            {user.menu.map((menuItem, index) => (
              <button
                key={index}
                type="button"
                className="navbar-user-menu-item"
                onClick={() => {
                  if (menuItem.onClick) {
                    menuItem.onClick();
                  } else if (menuItem.href) {
                    window.location.href = menuItem.href;
                  }
                  setUserMenuOpen(false);
                }}
              >
                {menuItem.icon && <span className="navbar-icon">{menuItem.icon}</span>}
                <span>{menuItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render language selector
  const renderLanguageSelector = () => {
    if (!language) return null;

    return (
      <div className="navbar-language">
        <button
          type="button"
          className="navbar-language-button"
          onClick={() => {
            const currentIndex = language.options.findIndex(opt => opt.code === language.current);
            const nextIndex = (currentIndex + 1) % language.options.length;
            handleLanguageChange(language.options[nextIndex].code);
          }}
          aria-label="Change language"
        >
          {language.options.find(opt => opt.code === language.current)?.flag || '🌐'}
          <span className="navbar-language-code">{language.current.toUpperCase()}</span>
        </button>
      </div>
    );
  };

  // Render theme toggle
  const renderThemeToggle = () => {
    return (
      <button
        type="button"
        className="navbar-theme-toggle"
        onClick={handleThemeChange}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light'} mode`}
      >
        {theme === 'light' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        )}
        {theme === 'dark' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
          </svg>
        )}
        {theme === 'auto' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
          </svg>
        )}
      </button>
    );
  };

  // Render CTA button
  const renderCTA = () => {
    if (!cta) return null;

    return (
      <button
        type="button"
        className={`navbar-cta navbar-cta--${cta.variant || 'primary'} navbar-cta--${cta.size || 'md'}`}
        onClick={() => {
          if (cta.onClick) {
            cta.onClick();
          } else if (cta.href) {
            window.location.href = cta.href;
          }
        }}
      >
        {cta.label}
      </button>
    );
  };

  // Render mobile menu
  const renderMobileMenu = () => {
    if (!mobile) return null;

    return (
      <>
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18"/>
            )}
          </svg>
        </button>

        {isMobileOpen && (
          <div className={`navbar-mobile ${mobileOverlay ? 'navbar-mobile--overlay' : ''} navbar-mobile--${mobilePosition}`}>
            <div ref={mobileMenuRef} className="navbar-mobile-content">
              <div className="navbar-mobile-header">
                {renderLogo()}
                <button
                  type="button"
                  className="navbar-mobile-close"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close mobile menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <nav className="navbar-mobile-nav" aria-label="Mobile navigation">
                <ul className="navbar-mobile-list">
                  {items.map((item) => renderNavItem(item, true))}
                </ul>
              </nav>

              {search?.show && (
                <div className="navbar-mobile-search">
                  {renderSearch()}
                </div>
              )}

              <div className="navbar-mobile-actions">
                {renderThemeToggle()}
                {renderLanguageSelector()}
                {renderUserMenu()}
                {renderCTA()}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Generate CSS classes
  const getNavbarClasses = () => {
    return cn(
      'navbar',
      variant && `navbar--${variant}`,
      size && `navbar--${size}`,
      layout && `navbar--${layout}`,
      { 'navbar--sticky': sticky },
      { 'navbar--scrolled': isScrolled },
      { 'navbar--collapsed': collapsed },
      { 'navbar--animated': animation },
      className
    );
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className={getNavbarClasses()}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        {...props}
      >
        <div className="navbar-container">
          {/* Logo/Brand */}
          <div className="navbar-brand">
            {renderLogo()}
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-desktop">
            <nav className="navbar-nav" aria-label="Primary navigation">
              <ul className="navbar-list">
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderNavItem(item)}
                    {layout === 'mega' && renderMegaMenu(item)}
                  </React.Fragment>
                ))}
              </ul>
            </nav>

            {/* Right side utilities */}
            <div className="navbar-actions">
              {renderSearch()}
              {renderThemeToggle()}
              {renderLanguageSelector()}
              {renderUserMenu()}
              {renderCTA()}
            </div>
          </div>

          {/* Mobile Menu */}
          {renderMobileMenu()}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileOpen && mobileOverlay && (
        <div
          className="navbar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;