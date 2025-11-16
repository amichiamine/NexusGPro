import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterModern from './FooterModern';

// Mock icons
jest.mock('@heroicons/react/outline', () => ({
  MailIcon: ({ className }: { className: string }) => (
    <svg data-testid="mail-icon" className={className}>MailIcon</svg>
  ),
  PhoneIcon: ({ className }: { className: string }) => (
    <svg data-testid="phone-icon" className={className}>PhoneIcon</svg>
  ),
  MapPinIcon: ({ className }: { className: string }) => (
    <svg data-testid="map-pin-icon" className={className}>MapPinIcon</svg>
  ),
  ArrowRightIcon: ({ className }: { className: string }) => (
    <svg data-testid="arrow-right-icon" className={className}>ArrowRightIcon</svg>
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
  )
}));

describe('FooterModern Component', () => {
  const defaultProps = {
    company: {
      name: 'NexusG',
      description: 'UI Compiler Toolkit',
      copyright: 'Tous droits réservés'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders with default props', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
      expect(screen.getByText('UI Compiler Toolkit')).toBeInTheDocument();
      expect(screen.getByText('Restez informé')).toBeInTheDocument();
    });

    test('renders with custom company info', () => {
      const customCompany = {
        name: 'TestCompany',
        description: 'Test Description',
        logo: '/test-logo.png',
        copyright: 'Custom Copyright'
      };
      
      render(<FooterModern company={customCompany} />);
      
      expect(screen.getByText('TestCompany')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Custom Copyright')).toBeInTheDocument();
    });

    test('renders newsletter section', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByText('Restez informé')).toBeInTheDocument();
      expect(screen.getByText('Recevez nos dernières actualités et mises à jour.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Votre email')).toBeInTheDocument();
      expect(screen.getByText("S'abonner")).toBeInTheDocument();
    });

    test('renders social links', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByLabelText('Suivez-nous sur Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur LinkedIn')).toBeInTheDocument();
    });

    test('renders navigation sections', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByText('Produit')).toBeInTheDocument();
      expect(screen.getByText('Ressources')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Entreprise')).toBeInTheDocument();
    });

    test('renders contact info', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('contact@nexusg.com')).toBeInTheDocument();
      expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    test('renders copyright section', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByText(/© \d{4} NexusG/)).toBeInTheDocument();
      expect(screen.getByText('Tous droits réservés.')).toBeInTheDocument();
    });
  });

  describe('Variants and Sizes', () => {
    test('applies dark variant', () => {
      render(<FooterModern {...defaultProps} variant="dark" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--dark');
    });

    test('applies light variant', () => {
      render(<FooterModern {...defaultProps} variant="light" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--light');
    });

    test('applies gradient variant', () => {
      render(<FooterModern {...defaultProps} variant="gradient" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--gradient');
    });

    test('applies modern variant', () => {
      render(<FooterModern {...defaultProps} variant="modern" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--modern');
    });

    test('applies small size', () => {
      render(<FooterModern {...defaultProps} size="sm" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--sm');
    });

    test('applies medium size', () => {
      render(<FooterModern {...defaultProps} size="md" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--md');
    });

    test('applies large size', () => {
      render(<FooterModern {...defaultProps} size="lg" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('footer-modern--lg');
    });

    test('applies custom className', () => {
      render(<FooterModern {...defaultProps} className="custom-class" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('custom-class');
    });
  });

  describe('Conditional Rendering', () => {
    test('hides newsletter when disabled', () => {
      render(<FooterModern {...defaultProps} showNewsletter={false} />);
      
      expect(screen.queryByText('Restez informé')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Votre email')).not.toBeInTheDocument();
    });

    test('hides social links when disabled', () => {
      render(<FooterModern {...defaultProps} showSocial={false} />);
      
      expect(screen.queryByLabelText('Suivez-nous sur Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('Suivez-nous')).not.toBeInTheDocument();
    });

    test('hides contact info when disabled', () => {
      render(<FooterModern {...defaultProps} showContact={false} />);
      
      expect(screen.queryByText('Contact')).not.toBeInTheDocument();
      expect(screen.queryByText('contact@nexusg.com')).not.toBeInTheDocument();
    });

    test('hides copyright when disabled', () => {
      render(<FooterModern {...defaultProps} showCopyright={false} />);
      
      expect(screen.queryByText(/© \d{4}/)).not.toBeInTheDocument();
    });

    test('hides newsletter via newsletterConfig', () => {
      render(<FooterModern 
        {...defaultProps} 
        newsletterConfig={{ enabled: false }}
      />);
      
      expect(screen.queryByText('Restez informé')).not.toBeInTheDocument();
    });
  });

  describe('Custom Configurations', () => {
    test('renders custom newsletter config', () => {
      const customNewsletter = {
        enabled: true,
        title: 'Custom Newsletter',
        description: 'Custom Description',
        placeholder: 'Custom Email',
        buttonText: 'Subscribe',
        action: '#custom'
      };
      
      render(<FooterModern 
        {...defaultProps} 
        newsletterConfig={customNewsletter}
      />);
      
      expect(screen.getByText('Custom Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Custom Email')).toBeInTheDocument();
      expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });

    test('renders custom social links', () => {
      const customSocial = [
        { name: 'Custom', href: '#custom', icon: () => <div>CustomIcon</div>, ariaLabel: 'Custom Link' }
      ];
      
      render(<FooterModern 
        {...defaultProps} 
        socialLinks={customSocial}
      />);
      
      expect(screen.getByLabelText('Custom Link')).toBeInTheDocument();
    });

    test('renders custom contact info', () => {
      const customContact = [
        { icon: () => <div>Icon</div>, text: 'Custom Contact', href: '#custom', ariaLabel: 'Custom Contact' }
      ];
      
      render(<FooterModern 
        {...defaultProps} 
        contactInfo={customContact}
      />);
      
      expect(screen.getByText('Custom Contact')).toBeInTheDocument();
    });

    test('renders custom navigation sections', () => {
      const customSections = [
        {
          title: 'Custom Section',
          items: [
            { name: 'Custom Link', href: '#custom', ariaLabel: 'Custom Link' }
          ]
        }
      ];
      
      render(<FooterModern 
        {...defaultProps} 
        sections={customSections}
      />);
      
      expect(screen.getByText('Custom Section')).toBeInTheDocument();
      expect(screen.getByText('Custom Link')).toBeInTheDocument();
    });

    test('renders custom company links', () => {
      const customCompany = {
        ...defaultProps.company,
        links: [
          { name: 'Privacy', href: '#privacy', ariaLabel: 'Privacy Policy' }
        ]
      };
      
      render(<FooterModern company={customCompany} />);
      
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });
  });

  describe('Newsletter Functionality', () => {
    test('handles newsletter email input', () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('handles newsletter form submission', async () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByRole('button', { name: /S'abonner/ });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Merci ! Vous êtes maintenant abonné à notre newsletter.')).toBeInTheDocument();
      });
      
      expect(emailInput).toHaveValue('');
    });

    test('shows success message and hides it after timeout', async () => {
      jest.useFakeTimers();
      
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByRole('button', { name: /S'abonner/ });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Merci ! Vous êtes maintenant abonné à notre newsletter.')).toBeInTheDocument();
      
      jest.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(screen.queryByText('Merci ! Vous êtes maintenant abonné à notre newsletter.')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    test('requires email for form submission', async () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByRole('button', { name: /S'abonner/ });
      
      fireEvent.click(submitButton);
      
      expect(emailInput).toBeRequired();
      expect(emailInput).toBeInvalid();
    });
  });

  describe('Accessibility', () => {
    test('has proper role and aria-label', () => {
      render(<FooterModern {...defaultProps} />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-label', 'Footer de NexusG');
    });

    test('accepts custom aria-label', () => {
      render(<FooterModern {...defaultProps} ariaLabel="Custom Footer Label" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-label', 'Custom Footer Label');
    });

    test('has proper id when provided', () => {
      render(<FooterModern {...defaultProps} id="custom-footer-id" />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'custom-footer-id');
    });

    test('newsletter form has proper labels', () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Adresse email');
      expect(emailInput).toBeInTheDocument();
    });

    test('social links have proper aria-labels', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByLabelText('Suivez-nous sur Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivez-nous sur Twitter')).toBeInTheDocument();
    });

    test('navigation sections have proper structure', () => {
      render(<FooterModern {...defaultProps} />);
      
      const navigation = screen.getByLabelText('Réseaux sociaux');
      expect(navigation).toBeInTheDocument();
    });

    test('legal links have proper navigation label', () => {
      const customCompany = {
        ...defaultProps.company,
        links: [{ name: 'Privacy', href: '#privacy', ariaLabel: 'Privacy Policy' }]
      };
      
      render(<FooterModern company={customCompany} />);
      
      const legalNav = screen.getByLabelText('Liens légaux');
      expect(legalNav).toBeInTheDocument();
    });

    test('contact links have aria-labels', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByLabelText('Envoyer un email')).toBeInTheDocument();
      expect(screen.getByLabelText('Appeler nous')).toBeInTheDocument();
      expect(screen.getByLabelText('Notre localisation')).toBeInTheDocument();
    });

    test('external links have proper attributes', () => {
      render(<FooterModern {...defaultProps} />);
      
      const facebookLink = screen.getByLabelText('Suivez-nous sur Facebook');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('keyboard navigation works for newsletter form', () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByRole('button', { name: /S'abonner/ });
      
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      fireEvent.keyDown(emailInput, { key: 'Enter' });
      // Should handle Enter key in form submission
    });
  });

  describe('Links and Navigation', () => {
    test('renders all navigation links', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByText('Studio')).toBeInTheDocument();
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Exemples')).toBeInTheDocument();
      expect(screen.getByText('Aide')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    test('links have proper hrefs', () => {
      render(<FooterModern {...defaultProps} />);
      
      const studioLink = screen.getByText('Studio').closest('a');
      expect(studioLink).toHaveAttribute('href', '#');
    });

    test('external links open in new tab', () => {
      const customSections = [
        {
          title: 'External',
          items: [
            { name: 'External Link', href: 'https://example.com', external: true }
          ]
        }
      ];
      
      render(<FooterModern 
        {...defaultProps} 
        sections={customSections}
      />);
      
      const externalLink = screen.getByText('External Link').closest('a');
      expect(externalLink).toHaveAttribute('target', '_blank');
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('contact links are properly linked', () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailLink = screen.getByText('contact@nexusg.com').closest('a');
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@nexusg.com');
      
      const phoneLink = screen.getByText('+33 1 23 45 67 89').closest('a');
      expect(phoneLink).toHaveAttribute('href', 'tel:+33123456789');
    });
  });

  describe('Responsive Behavior', () => {
    test('renders correctly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<FooterModern {...defaultProps} />);
      
      // Should render without errors on mobile
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('NexusG')).toBeInTheDocument();
    });

    test('renders correctly on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('renders correctly on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing company name', () => {
      render(<FooterModern company={{ name: '', description: 'Test' }} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('UI Compiler Toolkit')).toBeInTheDocument();
    });

    test('handles empty navigation sections', () => {
      render(<FooterModern {...defaultProps} sections={[]} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('Produit')).not.toBeInTheDocument();
    });

    test('handles missing social links', () => {
      render(<FooterModern {...defaultProps} socialLinks={[]} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.queryByLabelText('Suivez-nous sur Facebook')).not.toBeInTheDocument();
    });

    test('handles missing contact info', () => {
      render(<FooterModern {...defaultProps} contactInfo={[]} />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.queryByText('contact@nexusg.com')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('manages email state correctly', () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('clears email after successful submission', async () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      const submitButton = screen.getByRole('button', { name: /S'abonner/ });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(<FooterModern {...defaultProps} />);
      
      const initialFooter = screen.getByRole('contentinfo');
      
      rerender(<FooterModern {...defaultProps} variant="dark" />);
      
      expect(screen.getByRole('contentinfo')).toBe(initialFooter);
    });

    test('handles rapid state changes', async () => {
      render(<FooterModern {...defaultProps} />);
      
      const emailInput = screen.getByPlaceholderText('Votre email');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } });
      }
      
      expect(emailInput).toHaveValue('test9@example.com');
    });
  });

  describe('Integration', () => {
    test('works with external icon components', () => {
      render(<FooterModern {...defaultProps} />);
      
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    });

    test('handles custom icon components', () => {
      const CustomIcon = ({ className }: { className: string }) => (
        <svg data-testid="custom-icon" className={className}>Custom</svg>
      );
      
      const customContact = [
        { icon: CustomIcon, text: 'Custom Contact', href: '#' }
      ];
      
      render(<FooterModern 
        {...defaultProps} 
        contactInfo={customContact}
      />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});

describe('FooterModern Snapshot Tests', () => {
  test('matches default snapshot', () => {
    const { container } = render(<FooterModern company={{ name: 'Test', description: 'Test' }} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches dark variant snapshot', () => {
    const { container } = render(
      <FooterModern 
        company={{ name: 'Test', description: 'Test' }} 
        variant="dark" 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches gradient variant snapshot', () => {
    const { container } = render(
      <FooterModern 
        company={{ name: 'Test', description: 'Test' }} 
        variant="gradient" 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches minimal config snapshot', () => {
    const { container } = render(
      <FooterModern 
        company={{ name: 'Test', description: 'Test' }} 
        showNewsletter={false}
        showSocial={false}
        showContact={false}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});