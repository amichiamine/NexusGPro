import React, { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/outline';
import {
  LinkIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
  GithubIcon,
  YoutubeIcon,
  DribbbleIcon,
  MediumIcon
} from '../../atoms/icons';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
  category?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface SocialAccount {
  platform: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  followers?: string;
  ariaLabel: string;
}

interface LegalInfo {
  title: string;
  links: FooterLink[];
}

interface FooterRichProps {
  variant?: 'default' | 'minimal' | 'dense' | 'elegant' | 'corporate';
  layout?: 'columns' | 'grid' | 'compact' | 'full-width';
  showSearch?: boolean;
  showSocial?: boolean;
  showLanguage?: boolean;
  showCurrency?: boolean;
  showMobile?: boolean;
  collapsible?: boolean;
  sections: FooterSection[];
  socialAccounts?: SocialAccount[];
  legal?: LegalInfo[];
  company: {
    name: string;
    tagline: string;
    description?: string;
    logo?: string;
    founded?: string;
    employees?: string;
  };
  searchConfig?: {
    placeholder?: string;
    action?: string;
  };
  languageOptions?: Array<{
    code: string;
    name: string;
    flag: string;
  }>;
  currencyOptions?: Array<{
    code: string;
    symbol: string;
    name: string;
  }>;
  className?: string;
  ariaLabel?: string;
  id?: string;
}

const FooterRich: React.FC<FooterRichProps> = ({
  variant = 'default',
  layout = 'columns',
  showSearch = true,
  showSocial = true,
  showLanguage = false,
  showCurrency = false,
  showMobile = false,
  collapsible = true,
  sections = [
    {
      title: 'Produit',
      links: [
        { name: 'Documentation', href: '#', category: 'dev' },
        { name: 'API Reference', href: '#', category: 'dev' },
        { name: 'Changelog', href: '#', category: 'dev' },
        { name: 'Roadmap', href: '#', category: 'dev' },
        { name: 'Templates', href: '#', category: 'resources' },
        { name: 'Showcase', href: '#', category: 'resources' },
        { name: 'Blog', href: '#', category: 'content' },
        { name: 'Newsletter', href: '#', category: 'content' },
        { name: 'Podcast', href: '#', category: 'content' }
      ],
      collapsible: true
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Community Forum', href: '#' },
        { name: 'Contact Support', href: '#' },
        { name: 'System Status', href: '#' },
        { name: 'Report Issue', href: '#' },
        { name: 'Feature Request', href: '#' }
      ],
      collapsible: true
    },
    {
      title: 'Légal',
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'Data Processing', href: '#' },
        { name: 'Compliance', href: '#' },
        { name: 'Security', href: '#' }
      ],
      collapsible: true
    },
    {
      title: 'Entreprise',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Press Kit', href: '#' },
        { name: 'Investors', href: '#' },
        { name: 'Partners', href: '#' },
        { name: 'Sustainability', href: '#' }
      ],
      collapsible: true
    }
  ],
  socialAccounts = [
    { platform: 'Twitter', url: '#', icon: TwitterIcon, followers: '50.2K', ariaLabel: 'Suivez-nous sur Twitter' },
    { platform: 'LinkedIn', url: '#', icon: LinkedInIcon, followers: '25.1K', ariaLabel: 'Suivez-nous sur LinkedIn' },
    { platform: 'GitHub', url: '#', icon: GithubIcon, followers: '12.8K', ariaLabel: 'Suivez-nous sur GitHub' },
    { platform: 'YouTube', url: '#', icon: YoutubeIcon, followers: '8.5K', ariaLabel: 'Suivez-nous sur YouTube' },
    { platform: 'Instagram', url: '#', icon: InstagramIcon, followers: '15.3K', ariaLabel: 'Suivez-nous sur Instagram' },
    { platform: 'Medium', url: '#', icon: MediumIcon, followers: '5.2K', ariaLabel: 'Suivez-nous sur Medium' }
  ],
  legal = [
    {
      title: 'Données & Confidentialité',
      links: [
        { name: 'Politique de Confidentialité', href: '#' },
        { name: 'Conditions d\'Utilisation', href: '#' },
        { name: 'Politique des Cookies', href: '#' },
        { name: 'RGPD', href: '#' }
      ]
    }
  ],
  company,
  searchConfig = {
    placeholder: 'Rechercher dans l\'aide...',
    action: '#'
  },
  languageOptions = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ],
  currencyOptions = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ],
  className = '',
  ariaLabel,
  id
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<Record<string, boolean>>({});
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Initialize collapsible states
  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    sections.forEach(section => {
      if (collapsible) {
        initialStates[section.title] = section.defaultOpen ?? true;
      }
    });
    setMobileMenuOpen(initialStates);
  }, [sections, collapsible]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchConfig.action) {
      // Handle search logic
      console.log('Searching for:', searchQuery);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setMobileMenuOpen(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const groupLinksByCategory = (links: FooterLink[]) => {
    const categories: Record<string, FooterLink[]> = {};
    links.forEach(link => {
      const category = link.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(link);
    });
    return categories;
  };

  const componentClass = `footer-rich footer-rich--${variant} footer-rich--${layout}${className ? ` ${className}` : ''}`;
  
  return (
    <footer 
      className={componentClass}
      aria-label={ariaLabel || `Footer riche de ${company.name}`}
      id={id}
      role="contentinfo"
    >
      <div className="footer-rich__container">
        {/* Top Section with Search and Quick Actions */}
        <div className="footer-rich__top">
          <div className="footer-rich__brand">
            <div className="footer-rich__logo">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="footer-rich__logo-img"
                />
              ) : (
                <div className="footer-rich__logo-text">
                  <strong>{company.name}</strong>
                </div>
              )}
            </div>
            <p className="footer-rich__tagline">{company.tagline}</p>
            {company.description && (
              <p className="footer-rich__description">{company.description}</p>
            )}
            
            {/* Company Stats */}
            {(company.founded || company.employees) && (
              <div className="footer-rich__stats">
                {company.founded && (
                  <div className="footer-rich__stat">
                    <span className="footer-rich__stat-label">Fondée</span>
                    <span className="footer-rich__stat-value">{company.founded}</span>
                  </div>
                )}
                {company.employees && (
                  <div className="footer-rich__stat">
                    <span className="footer-rich__stat-label">Équipes</span>
                    <span className="footer-rich__stat-value">{company.employees}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="footer-rich__search">
              <form onSubmit={handleSearch} className="footer-rich__search-form">
                <label htmlFor="footer-search" className="sr-only">
                  {searchConfig.placeholder}
                </label>
                <div className="footer-rich__search-input-wrapper">
                  <MagnifyingGlassIcon className="footer-rich__search-icon" />
                  <input
                    id="footer-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchConfig.placeholder}
                    className="footer-rich__search-input"
                  />
                </div>
                <button type="submit" className="footer-rich__search-button">
                  Rechercher
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Main Navigation Sections */}
        <div className="footer-rich__sections">
          {sections.map((section, index) => (
            <div 
              key={section.title || index} 
              className={`footer-rich__section footer-rich__section--${variant}`}
            >
              <div className="footer-rich__section-header">
                <h3 className="footer-rich__section-title">
                  {section.icon && (
                    <section.icon 
                      className="footer-rich__section-icon"
                      aria-hidden="true"
                    />
                  )}
                  {section.title}
                </h3>
                {collapsible && (
                  <button
                    className="footer-rich__section-toggle"
                    onClick={() => toggleSection(section.title)}
                    aria-expanded={mobileMenuOpen[section.title] || false}
                    aria-controls={`section-${index}`}
                  >
                    {mobileMenuOpen[section.title] ? (
                      <ChevronUpIcon className="footer-rich__section-toggle-icon" />
                    ) : (
                      <ChevronDownIcon className="footer-rich__section-toggle-icon" />
                    )}
                  </button>
                )}
              </div>
              
              <div 
                id={`section-${index}`}
                className={`footer-rich__section-content ${
                  collapsible ? (mobileMenuOpen[section.title] ? 'footer-rich__section-content--open' : 'footer-rich__section-content--collapsed') : ''
                }`}
              >
                {groupLinksByCategory(section.links).length > 1 ? (
                  /* Multi-category layout */
                  Object.entries(groupLinksByCategory(section.links)).map(([category, categoryLinks]) => (
                    <div key={category} className="footer-rich__category">
                      <h4 className="footer-rich__category-title">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h4>
                      <ul className="footer-rich__category-links">
                        {categoryLinks.map((link, linkIndex) => (
                          <li key={link.name || linkIndex}>
                            <a
                              href={link.href}
                              className="footer-rich__link"
                              target={link.external ? '_blank' : '_self'}
                              rel={link.external ? 'noopener noreferrer' : undefined}
                              aria-label={link.ariaLabel || link.name}
                            >
                              {link.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  /* Single category layout */
                  <ul className="footer-rich__links">
                    {section.links.map((link, linkIndex) => (
                      <li key={link.name || linkIndex}>
                        <a
                          href={link.href}
                          className="footer-rich__link"
                          target={link.external ? '_blank' : '_self'}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          aria-label={link.ariaLabel || link.name}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section with Social, Language, Currency */}
        <div className="footer-rich__bottom">
          <div className="footer-rich__bottom-left">
            {/* Social Accounts */}
            {showSocial && socialAccounts.length > 0 && (
              <div className="footer-rich__social">
                <h4 className="footer-rich__social-title">Suivez-nous</h4>
                <div className="footer-rich__social-grid">
                  {socialAccounts.map((account, index) => (
                    <a
                      key={account.platform || index}
                      href={account.url}
                      className="footer-rich__social-account"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={account.ariaLabel}
                      title={`${account.platform} - ${account.followers || 'Follow'}`}
                    >
                      <account.icon 
                        className="footer-rich__social-icon"
                        aria-hidden="true"
                      />
                      <div className="footer-rich__social-info">
                        <span className="footer-rich__social-name">{account.platform}</span>
                        {account.followers && (
                          <span className="footer-rich__social-followers">{account.followers}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="footer-rich__actions">
              {showLanguage && (
                <div className="footer-rich__dropdown">
                  <button
                    className="footer-rich__dropdown-trigger"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    aria-expanded={isLanguageDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <LanguageIcon className="footer-rich__dropdown-icon" />
                    <span className="footer-rich__dropdown-text">
                      {selectedLanguage.flag} {selectedLanguage.name}
                    </span>
                    <ChevronDownIcon className="footer-rich__dropdown-arrow" />
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <div className="footer-rich__dropdown-menu" role="listbox">
                      {languageOptions.map((lang) => (
                        <button
                          key={lang.code}
                          className={`footer-rich__dropdown-option ${selectedLanguage.code === lang.code ? 'footer-rich__dropdown-option--selected' : ''}`}
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setIsLanguageDropdownOpen(false);
                          }}
                          role="option"
                          aria-selected={selectedLanguage.code === lang.code}
                        >
                          <span className="footer-rich__dropdown-flag">{lang.flag}</span>
                          <span className="footer-rich__dropdown-name">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showCurrency && (
                <div className="footer-rich__dropdown">
                  <button
                    className="footer-rich__dropdown-trigger"
                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    aria-expanded={isCurrencyDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <CurrencyDollarIcon className="footer-rich__dropdown-icon" />
                    <span className="footer-rich__dropdown-text">
                      {selectedCurrency.symbol} {selectedCurrency.code}
                    </span>
                    <ChevronDownIcon className="footer-rich__dropdown-arrow" />
                  </button>
                  
                  {isCurrencyDropdownOpen && (
                    <div className="footer-rich__dropdown-menu" role="listbox">
                      {currencyOptions.map((currency) => (
                        <button
                          key={currency.code}
                          className={`footer-rich__dropdown-option ${selectedCurrency.code === currency.code ? 'footer-rich__dropdown-option--selected' : ''}`}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          role="option"
                          aria-selected={selectedCurrency.code === currency.code}
                        >
                          <span className="footer-rich__dropdown-symbol">{currency.symbol}</span>
                          <span className="footer-rich__dropdown-name">{currency.name}</span>
                          <span className="footer-rich__dropdown-code">{currency.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showMobile && (
                <a
                  href="tel:+33123456789"
                  className="footer-rich__mobile-link"
                  aria-label="Appeler le support"
                >
                  <DevicePhoneMobileIcon className="footer-rich__mobile-icon" />
                  <span className="footer-rich__mobile-text">Support</span>
                </a>
              )}
            </div>
          </div>

          <div className="footer-rich__bottom-right">
            {/* Legal Information */}
            {legal.map((legalSection, index) => (
              <div key={legalSection.title || index} className="footer-rich__legal">
                <h4 className="footer-rich__legal-title">{legalSection.title}</h4>
                <ul className="footer-rich__legal-links">
                  {legalSection.links.map((link, linkIndex) => (
                    <li key={link.name || linkIndex}>
                      <a
                        href={link.href}
                        className="footer-rich__legal-link"
                        aria-label={link.ariaLabel || link.name}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Copyright */}
            <div className="footer-rich__copyright">
              <p>© {new Date().getFullYear()} {company.name}. Tous droits réservés.</p>
              {variant === 'corporate' && (
                <p className="footer-rich__copyright-secondary">
                  Conçu avec passion pour l'excellence technique.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterRich;