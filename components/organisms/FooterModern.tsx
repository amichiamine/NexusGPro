import React, { useState } from 'react';
import { MailIcon, PhoneIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/outline';
import {
  LinkIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
  GithubIcon,
  YoutubeIcon
} from '../../atoms/icons';

interface NavigationItem {
  name: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
}

interface ContactInfo {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  href?: string;
  ariaLabel?: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  ariaLabel: string;
}

interface NewsletterConfig {
  enabled: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  action?: string;
}

interface FooterSection {
  title: string;
  items: NavigationItem[];
}

interface FooterModernProps {
  variant?: 'default' | 'dark' | 'light' | 'gradient' | 'modern';
  size?: 'sm' | 'md' | 'lg';
  showNewsletter?: boolean;
  showSocial?: boolean;
  showContact?: boolean;
  showCopyright?: boolean;
  newsletterConfig?: NewsletterConfig;
  socialLinks?: SocialLink[];
  contactInfo?: ContactInfo[];
  sections?: FooterSection[];
  company: {
    name: string;
    description: string;
    logo?: string;
    copyright?: string;
    links?: NavigationItem[];
  };
  className?: string;
  ariaLabel?: string;
  id?: string;
}

const FooterModern: React.FC<FooterModernProps> = ({
  variant = 'default',
  size = 'md',
  showNewsletter = true,
  showSocial = true,
  showContact = true,
  showCopyright = true,
  newsletterConfig = {
    enabled: true,
    title: 'Restez informé',
    description: 'Recevez nos dernières actualités et mises à jour.',
    placeholder: 'Votre email',
    buttonText: 'S\'abonner',
    action: '#'
  },
  socialLinks = [
    { name: 'Facebook', href: '#', icon: FacebookIcon, ariaLabel: 'Suivez-nous sur Facebook' },
    { name: 'Twitter', href: '#', icon: TwitterIcon, ariaLabel: 'Suivez-nous sur Twitter' },
    { name: 'Instagram', href: '#', icon: InstagramIcon, ariaLabel: 'Suivez-nous sur Instagram' },
    { name: 'LinkedIn', href: '#', icon: LinkedInIcon, ariaLabel: 'Suivez-nous sur LinkedIn' },
    { name: 'GitHub', href: '#', icon: GithubIcon, ariaLabel: 'Suivez-nous sur GitHub' },
    { name: 'YouTube', href: '#', icon: YoutubeIcon, ariaLabel: 'Suivez-nous sur YouTube' }
  ],
  contactInfo = [
    { icon: MailIcon, text: 'contact@nexusg.com', href: 'mailto:contact@nexusg.com', ariaLabel: 'Envoyer un email' },
    { icon: PhoneIcon, text: '+33 1 23 45 67 89', href: 'tel:+33123456789', ariaLabel: 'Appeler nous' },
    { icon: MapPinIcon, text: 'Paris, France', href: '#', ariaLabel: 'Notre localisation' }
  ],
  sections = [
    {
      title: 'Produit',
      items: [
        { name: 'Studio', href: '#', ariaLabel: 'Découvrir Studio' },
        { name: 'Workshop', href: '#', ariaLabel: 'Découvrir Workshop' },
        { name: 'API', href: '#', ariaLabel: 'Documentation API' },
        { name: 'Intégrations', href: '#', ariaLabel: 'Voir les intégrations' }
      ]
    },
    {
      title: 'Ressources',
      items: [
        { name: 'Documentation', href: '#', ariaLabel: 'Consulter la documentation' },
        { name: 'Exemples', href: '#', ariaLabel: 'Voir les exemples' },
        { name: 'Tutoriels', href: '#', ariaLabel: 'Accès aux tutoriels' },
        { name: 'Blog', href: '#', ariaLabel: 'Lire le blog' }
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Aide', href: '#', ariaLabel: 'Centre d\'aide' },
        { name: 'Contact', href: '#', ariaLabel: 'Nous contacter' },
        { name: 'Commercial', href: '#', ariaLabel: 'Contact commercial' },
        { name: 'Statut', href: '#', ariaLabel: 'Statut du service' }
      ]
    },
    {
      title: 'Entreprise',
      items: [
        { name: 'À propos', href: '#', ariaLabel: 'En savoir plus sur nous' },
        { name: 'Carrières', href: '#', ariaLabel: 'Nos offres d\'emploi' },
        { name: 'Presse', href: '#', ariaLabel: 'Espace presse' },
        { name: 'Partenaires', href: '#', ariaLabel: 'Nos partenaires' }
      ]
    }
  ],
  company,
  className = '',
  ariaLabel,
  id
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && newsletterConfig.action) {
      // Newsletter subscription logic
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const componentClass = `footer-modern footer-modern--${variant} footer-modern--${size}${className ? ` ${className}` : ''}`;
  
  return (
    <footer 
      className={componentClass}
      aria-label={ariaLabel || `Footer de ${company.name}`}
      id={id}
      role="contentinfo"
    >
      <div className="footer-modern__container">
        {/* Newsletter Section */}
        {newsletterConfig.enabled && showNewsletter && (
          <div className="footer-modern__newsletter">
            <div className="footer-modern__newsletter-content">
              <div className="footer-modern__newsletter-text">
                <h3 className="footer-modern__newsletter-title">
                  {newsletterConfig.title || 'Restez informé'}
                </h3>
                <p className="footer-modern__newsletter-description">
                  {newsletterConfig.description || 'Recevez nos dernières actualités et mises à jour.'}
                </p>
              </div>
              <form 
                className="footer-modern__newsletter-form" 
                onSubmit={handleNewsletterSubmit}
                aria-labelledby="newsletter-heading"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletterConfig.placeholder || 'Votre email'}
                  className="footer-modern__newsletter-input"
                  required
                  aria-required="true"
                />
                <button
                  type="submit"
                  className="footer-modern__newsletter-button"
                  aria-describedby="newsletter-heading"
                >
                  <span className="footer-modern__newsletter-button-text">
                    {newsletterConfig.buttonText || 'S\'abonner'}
                  </span>
                  <ArrowRightIcon className="footer-modern__newsletter-button-icon" />
                </button>
              </form>
              {isSubscribed && (
                <div className="footer-modern__newsletter-success" role="alert">
                  Merci ! Vous êtes maintenant abonné à notre newsletter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="footer-modern__content">
          {/* Company Info */}
          <div className="footer-modern__company">
            <div className="footer-modern__company-logo">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="footer-modern__company-logo-img"
                />
              ) : (
                <div className="footer-modern__company-logo-text">
                  <strong>{company.name}</strong>
                </div>
              )}
            </div>
            <p className="footer-modern__company-description">
              {company.description}
            </p>
            
            {/* Social Links */}
            {showSocial && socialLinks.length > 0 && (
              <div className="footer-modern__social">
                <h4 className="footer-modern__social-title">Suivez-nous</h4>
                <nav aria-label="Réseaux sociaux">
                  <ul className="footer-modern__social-list">
                    {socialLinks.map((social, index) => (
                      <li key={social.name || index}>
                        <a
                          href={social.href}
                          className="footer-modern__social-link"
                          target={social.name && social.name !== 'email' ? '_blank' : '_self'}
                          rel={social.name && social.name !== 'email' ? 'noopener noreferrer' : undefined}
                          aria-label={social.ariaLabel}
                          title={social.name}
                        >
                          <social.icon 
                            className="footer-modern__social-icon"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          <div className="footer-modern__sections">
            {sections.map((section, index) => (
              <div key={section.title || index} className="footer-modern__section">
                <h4 className="footer-modern__section-title">{section.title}</h4>
                <ul className="footer-modern__section-list">
                  {section.items.map((item, itemIndex) => (
                    <li key={item.name || itemIndex}>
                      <a
                        href={item.href}
                        className="footer-modern__section-link"
                        target={item.external ? '_blank' : '_self'}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        aria-label={item.ariaLabel || item.name}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          {showContact && contactInfo.length > 0 && (
            <div className="footer-modern__contact">
              <h4 className="footer-modern__contact-title">Contact</h4>
              <ul className="footer-modern__contact-list">
                {contactInfo.map((info, index) => (
                  <li key={index} className="footer-modern__contact-item">
                    <a
                      href={info.href || '#'}
                      className="footer-modern__contact-link"
                      aria-label={info.ariaLabel || info.text}
                    >
                      <info.icon 
                        className="footer-modern__contact-icon"
                        aria-hidden="true"
                      />
                      <span className="footer-modern__contact-text">{info.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        {showCopyright && (
          <div className="footer-modern__bottom">
            <div className="footer-modern__bottom-content">
              <p className="footer-modern__copyright">
                © {new Date().getFullYear()} {company.name}. {company.copyright || 'Tous droits réservés.'}
              </p>
              
              {/* Company Links */}
              {company.links && company.links.length > 0 && (
                <nav aria-label="Liens légaux">
                  <ul className="footer-modern__legal-links">
                    {company.links.map((link, index) => (
                      <li key={link.name || index}>
                        <a
                          href={link.href}
                          className="footer-modern__legal-link"
                          target={link.external ? '_blank' : '_self'}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          aria-label={link.ariaLabel || link.name}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default FooterModern;