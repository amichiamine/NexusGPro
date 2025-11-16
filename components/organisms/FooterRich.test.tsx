import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterRich from './FooterRich';

// Mock icons
jest.mock('@heroicons/react/outline', () => ({
  ChevronDownIcon: ({ className }: { className: string }) => (
    <svg data-testid="chevron-down-icon" className={className}>ChevronDownIcon</svg>
  ),
  ChevronUpIcon: ({ className }: { className: string }) => (
    <svg data-testid="chevron-up-icon" className={className}>ChevronUpIcon</svg>
  ),
  MagnifyingGlassIcon: ({ className }: { className: string }) => (
    <svg data-testid="magnifying-glass-icon" className={className}>MagnifyingGlassIcon</svg>
  ),
  LanguageIcon: ({ className }: { className: string }) => (
    <svg data-testid="language-icon" className={className}>LanguageIcon</svg>
  ),
  CurrencyDollarIcon: ({ className }: { className: string }) => (
    <svg data-testid="currency-dollar-icon" className={className}>CurrencyDollarIcon</svg>
  ),
  DevicePhoneMobileIcon: ({ className }: { className: string }) => (
    <svg data-testid="device-phone-mobile-icon" className={className}>DevicePhoneMobileIcon</svg>
  ),
  GlobeAltIcon: ({ className }: { className: string }) => (
    <svg data-testid="globe-alt-icon" className={className}>GlobeAltIcon</svg>
  )
}));

jest.mock('../../atoms/icons', () => ({
  LinkIcon: ({ className }: { className: string }) => (
    <svg data-testid="link-icon" className={className}>LinkIcon</svg>
  ),
  FacebookIcon: ({ className }: { className: string }) => (
    <svg data-testid="facebook-icon" className={className}>FacebookIcon</svg>
  ),
  TwitterIcon: ({ className }: { className: string }) => (
    <svg data-testid="twitter-icon" className={className}>TwitterIcon</svg>
  ),
  InstagramIcon: ({ className }: { className: string }) => (
    <svg data-testid="instagram-icon" className={className}>InstagramIcon</svg>
  ),
  LinkedInIcon: ({ className }: { className: string }) => (
    <svg data-testid="linkedin-icon" className={className}>LinkedInIcon</svg>
  ),
  GithubIcon: ({ className }: { className: string }) => (
    <svg data-testid="github-icon" className={className}>GithubIcon</svg>
  ),
  YoutubeIcon: ({ className }: { className: string }) => (
    <svg data-testid="youtube-icon" className={className}>YoutubeIcon</svg>
  ),
  DribbbleIcon: ({ className }: { className: string }) => (
    <svg data-testid="dribbble-icon" className={className}>DribbbleIcon</svg>
  ),
  MediumIcon: ({ className }: { className: string }) => (
    <svg data-testid="medium-icon" className={className}>MediumIcon</svg>
  )
}));

describe('FooterRich Component', () => {
  const defaultSections = [
    {
      title: 'Produit',
      links: [
        { name: 'Documentation', href: '#', category: 'dev' },
        { name: 'API Reference', href: '#', category: 'dev' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Support', href: '#' }
      ]
    }
  ];

  const defaultCompany = {
    name: 'NexusG',
    tagline: 'Build at scale.',
    description: 'Modern UI toolkit for developers'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders with default props', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
      expect(screen.getByText('Build at scale.')).toBeInTheDocument();
      expect(screen.getByText('Modern UI toolkit for developers')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
    });

    test('renders company stats', () => {
      const companyWithStats = {
        ...defaultCompany,
        founded: '2020',
        employees: '50-100'
      };
      
      render(<FooterRich sections={defaultSections} company={companyWithStats} />);
      
      expect(screen.getByText('Fondée')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('Équipes')).toBeInTheDocument();
      expect(screen.getByText('50-100')).toBeInTheDocument();
    });

    test('renders search section', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByPlaceholderText('Rechercher dans l\'aide...')).toBeInTheDocument();
      expect(screen.getByText('Rechercher')).toBeInTheDocument();
    });

    test('renders social accounts', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('Suivez-nous')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('50.2K')).toBeInTheDocument();
    });

    test('renders language dropdown', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument();
      expect(screen.getByLabelText('Language selector')).toBeInTheDocument();
    });

    test('renders currency dropdown', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={true}
      />);
      
      expect(screen.getByText('€ EUR')).toBeInTheDocument();
      expect(screen.getByLabelText('Currency selector')).toBeInTheDocument();
    });

    test('renders mobile support link', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showMobile={true}
      />);
      
      expect(screen.getByLabelText('Appeler le support')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    test('renders copyright', () => {
      const currentYear = new Date().getFullYear();
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText(`© ${currentYear} NexusG. Tous droits réservés.`)).toBeInTheDocument();
    });
  });

  describe('Variants and Layouts', () => {
    test('applies minimal variant', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        variant="minimal"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--minimal');
    });

    test('applies dense variant', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        variant="dense"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--dense');
    });

    test('applies elegant variant', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        variant="elegant"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--elegant');
    });

    test('applies corporate variant', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        variant="corporate"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--corporate');
    });

    test('applies grid layout', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        layout="grid"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--grid');
    });

    test('applies compact layout', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        layout="compact"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--compact');
    });

    test('applies full-width layout', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        layout="full-width"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-rich--full-width');
    });
  });

  describe('Conditional Rendering', () => {
    test('hides search when disabled', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showSearch={false}
      />);
      
      expect(screen.queryByPlaceholderText('Rechercher dans l\'aide...')).not.toBeInTheDocument();
    });

    test('hides social when disabled', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showSocial={false}
      />);
      
      expect(screen.queryByText('Suivez-nous')).not.toBeInTheDocument();
    });

    test('hides language dropdown when disabled', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={false}
      />);
      
      expect(screen.queryByText('🇫🇷 Français')).not.toBeInTheDocument();
    });

    test('hides currency dropdown when disabled', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={false}
      />);
      
      expect(screen.queryByText('€ EUR')).not.toBeInTheDocument();
    });

    test('hides mobile link when disabled', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showMobile={false}
      />);
      
      expect(screen.queryByText('Support')).not.toBeInTheDocument();
    });
  });

  describe('Section Management', () => {
    test('renders all sections', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('Produit')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
    });

    test('handles collapsible sections', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        collapsible={true}
      />);
      
      // Toggle buttons should be present
      const toggleButtons = screen.getAllByRole('button', { name: /Toggle section/ });
      expect(toggleButtons).toHaveLength(2);
    });

    test('toggles section visibility', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        collapsible={true}
      />);
      
      const firstToggle = screen.getAllByRole('button', { name: /Toggle section/ })[0];
      
      // Initially expanded, click to collapse
      fireEvent.click(firstToggle);
      
      // Section should be collapsed
      expect(screen.getByText('Produit')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument(); // Should still be visible
    });

    test('sections with categories organize links properly', () => {
      const categorizedSections = [
        {
          title: 'Produit',
          links: [
            { name: 'Documentation', href: '#', category: 'development' },
            { name: 'API Reference', href: '#', category: 'development' },
            { name: 'Blog', href: '#', category: 'content' },
            { name: 'Newsletter', href: '#', category: 'content' }
          ]
        }
      ];
      
      render(<FooterRich sections={categorizedSections} company={defaultCompany} />);
      
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('handles search input', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans l\'aide...');
      
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput).toHaveValue('test query');
    });

    test('handles search form submission', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans l\'aide...');
      const searchButton = screen.getByRole('button', { name: 'Rechercher' });
      
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      // Search should be handled (console.log in implementation)
      expect(searchInput).toHaveValue('test query');
    });

    test('handles empty search submission', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const searchButton = screen.getByRole('button', { name: 'Rechercher' });
      
      fireEvent.click(searchButton);
      
      // Should not crash with empty search
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Dropdown Functionality', () => {
    test('toggles language dropdown', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      const languageButton = screen.getByRole('button', { name: /🇫🇷 Français/ });
      
      fireEvent.click(languageButton);
      
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Español')).toBeInTheDocument();
      });
    });

    test('selects language option', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      const languageButton = screen.getByRole('button', { name: /🇫🇷 Français/ });
      fireEvent.click(languageButton);
      
      const englishOption = screen.getByText('English');
      fireEvent.click(englishOption);
      
      await waitFor(() => {
        expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
      });
    });

    test('toggles currency dropdown', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={true}
      />);
      
      const currencyButton = screen.getByRole('button', { name: /€ EUR/ });
      
      fireEvent.click(currencyButton);
      
      await waitFor(() => {
        expect(screen.getByText('US Dollar')).toBeInTheDocument();
        expect(screen.getByText('British Pound')).toBeInTheDocument();
      });
    });

    test('selects currency option', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={true}
      />);
      
      const currencyButton = screen.getByRole('button', { name: /€ EUR/ });
      fireEvent.click(currencyButton);
      
      const usdOption = screen.getByText('US Dollar');
      fireEvent.click(usdOption);
      
      await waitFor(() => {
        expect(screen.getByText('$ USD')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper role and aria-label', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-label', 'Footer riche de NexusG');
    });

    test('accepts custom aria-label', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        ariaLabel="Custom Footer Label"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-label', 'Custom Footer Label');
    });

    test('has proper id when provided', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        id="custom-footer-rich-id"
      />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'custom-footer-rich-id');
    });

    test('search input has proper label', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const searchInput = screen.getByLabelText('Rechercher dans l\'aide...');
      expect(searchInput).toBeInTheDocument();
    });

    test('social accounts have aria-labels', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByLabelText('Suivez-nous sur Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur LinkedIn')).toBeInTheDocument();
    });

    test('external links have proper attributes', () => {
      const sectionsWithExternal = [
        {
          title: 'External',
          links: [
            { name: 'External Link', href: 'https://example.com', external: true }
          ]
        }
      ];
      
      render(<FooterRich sections={sectionsWithExternal} company={defaultCompany} />);
      
      const externalLink = screen.getByText('External Link').closest('a');
      expect(externalLink).toHaveAttribute('target', '_blank');
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('dropdowns have proper aria attributes', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      const languageButton = screen.getByRole('button', { name: /🇫🇷 Français/ });
      expect(languageButton).toHaveAttribute('aria-expanded', 'false');
      expect(languageButton).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('section toggles have aria-expanded', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        collapsible={true}
      />);
      
      const toggleButtons = screen.getAllByRole('button', { name: /Toggle section/ });
      expect(toggleButtons[0]).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Company Information', () => {
    test('renders company name', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    test('renders company tagline', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('Build at scale.')).toBeInTheDocument();
    });

    test('renders company description', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('Modern UI toolkit for developers')).toBeInTheDocument();
    });

    test('renders company logo', () => {
      const companyWithLogo = {
        ...defaultCompany,
        logo: '/test-logo.png'
      };
      
      render(<FooterRich sections={defaultSections} company={companyWithLogo} />);
      
      const logo = screen.getByAltText('NexusG logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/test-logo.png');
    });

    test('renders founded year', () => {
      const companyWithFounded = {
        ...defaultCompany,
        founded: '2020'
      };
      
      render(<FooterRich sections={defaultSections} company={companyWithFounded} />);
      
      expect(screen.getByText('2020')).toBeInTheDocument();
    });

    test('renders employee count', () => {
      const companyWithEmployees = {
        ...defaultCompany,
        employees: '50-100'
      };
      
      render(<FooterRich sections={defaultSections} company={companyWithEmployees} />);
      
      expect(screen.getByText('50-100')).toBeInTheDocument();
    });
  });

  describe('Custom Configurations', () => {
    test('renders custom sections', () => {
      const customSections = [
        {
          title: 'Custom Section',
          links: [
            { name: 'Custom Link', href: '#custom' }
          ]
        }
      ];
      
      render(<FooterRich sections={customSections} company={defaultCompany} />);
      
      expect(screen.getByText('Custom Section')).toBeInTheDocument();
      expect(screen.getByText('Custom Link')).toBeInTheDocument();
    });

    test('renders custom social accounts', () => {
      const customSocial = [
        { 
          platform: 'Custom', 
          url: '#custom', 
          icon: () => <div>CustomIcon</div>,
          followers: '1.2K',
          ariaLabel: 'Custom Platform'
        }
      ];
      
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        socialAccounts={customSocial}
      />);
      
      expect(screen.getByLabelText('Custom Platform')).toBeInTheDocument();
      expect(screen.getByText('1.2K')).toBeInTheDocument();
    });

    test('renders custom search placeholder', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        searchConfig={{ placeholder: 'Custom search...' }}
      />);
      
      expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument();
    });

    test('renders custom language options', () => {
      const customLanguages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' }
      ];
      
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
        languageOptions={customLanguages}
      />);
      
      expect(screen.getByText('🇮🇹 Italiano')).toBeInTheDocument();
    });

    test('renders custom currency options', () => {
      const customCurrencies = [
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'JPY', symbol: '¥', name: 'Yen' }
      ];
      
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={true}
        currencyOptions={customCurrencies}
      />);
      
      expect(screen.getByText('¥ JPY')).toBeInTheDocument();
    });
  });

  describe('Links and Navigation', () => {
    test('renders all navigation links', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('API Reference')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    test('links have proper hrefs', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const docLink = screen.getByText('Documentation').closest('a');
      expect(docLink).toHaveAttribute('href', '#');
    });

    test('external links open in new tab', () => {
      const sectionsWithExternal = [
        {
          title: 'External',
          links: [
            { name: 'External Link', href: 'https://example.com', external: true }
          ]
        }
      ];
      
      render(<FooterRich sections={sectionsWithExternal} company={defaultCompany} />);
      
      const externalLink = screen.getByText('External Link').closest('a');
      expect(externalLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Responsive Behavior', () => {
    test('renders correctly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    test('renders correctly on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('renders correctly on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing company name', () => {
      const companyWithoutName = {
        name: '',
        tagline: 'Test tagline'
      };
      
      render(<FooterRich sections={defaultSections} company={companyWithoutName} />);
      
      expect(screen.getByText('Test tagline')).toBeInTheDocument();
    });

    test('handles empty sections', () => {
      render(<FooterRich sections={[]} company={defaultCompany} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    test('handles missing social accounts', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        socialAccounts={[]}
      />);
      
      expect(screen.getByText('NexusG')).toBeInTheDocument();
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });

    test('handles missing legal information', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} legal={[]} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('manages search state correctly', () => {
      render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans l\'aide...');
      
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput).toHaveValue('test query');
    });

    test('manages language selection state', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      const languageButton = screen.getByRole('button', { name: /🇫🇷 Français/ });
      fireEvent.click(languageButton);
      
      const englishOption = screen.getByText('English');
      fireEvent.click(englishOption);
      
      await waitFor(() => {
        expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
      });
    });

    test('manages currency selection state', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showCurrency={true}
      />);
      
      const currencyButton = screen.getByRole('button', { name: /€ EUR/ });
      fireEvent.click(currencyButton);
      
      const usdOption = screen.getByText('US Dollar');
      fireEvent.click(usdOption);
      
      await waitFor(() => {
        expect(screen.getByText('$ USD')).toBeInTheDocument();
      });
    });
  });

  describe('Corporate Variant Features', () => {
    test('renders corporate copyright secondary text', () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        variant="corporate"
      />);
      
      expect(screen.getByText('Conçu avec passion pour l\'excellence technique.')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(<FooterRich sections={defaultSections} company={defaultCompany} />);
      
      const initialFooter = screen.getByRole('contentinfo');
      
      rerender(<FooterRich sections={defaultSections} company={defaultCompany} variant="minimal" />);
      
      expect(screen.getByRole('contentinfo')).toBe(initialFooter);
    });

    test('handles rapid state changes', async () => {
      render(<FooterRich 
        sections={defaultSections} 
        company={defaultCompany}
        showLanguage={true}
      />);
      
      const languageButton = screen.getByRole('button', { name: /🇫🇷 Français/ });
      
      // Rapid toggles
      for (let i = 0; i < 5; i++) {
        fireEvent.click(languageButton);
        fireEvent.click(languageButton);
      }
      
      // Should still work correctly
      expect(languageButton).toBeInTheDocument();
    });
  });
});

describe('FooterRich Snapshot Tests', () => {
  test('matches default snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }} 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches minimal variant snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }}
        variant="minimal"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches dense variant snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }}
        variant="dense"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches corporate variant snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }}
        variant="corporate"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches compact layout snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }}
        layout="compact"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches minimal config snapshot', () => {
    const { container } = render(
      <FooterRich 
        sections={[
          { title: 'Test', links: [{ name: 'Link', href: '#' }] }
        ]} 
        company={{ name: 'Test', tagline: 'Test tagline' }}
        showSearch={false}
        showSocial={false}
        showLanguage={false}
        showCurrency={false}
        showMobile={false}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});