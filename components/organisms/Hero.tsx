/**
 * Hero Component
 * 
 * A comprehensive hero section component with multiple variants, layouts, and features.
 * Supports background images/videos, animated gradients, CTAs, social proof, and parallax effects.
 * 
 * @version 1.0.0
 * @author MiniMax Agent
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';
import './Hero.css';

// Types
interface CTA {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

interface SocialProof {
  logo?: string;
  text?: string;
  number?: string;
  icon?: React.ReactNode;
}

interface HeroStats {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
}

interface HeroProps {
  /** Main title */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Primary CTA */
  primaryCTA?: CTA | string;
  /** Secondary CTAs */
  secondaryCTAs?: CTA[];
  /** Social proof elements */
  socialProof?: SocialProof[];
  /** Statistics to display */
  stats?: HeroStats[];
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Background video poster */
  backgroundVideoPoster?: string;
  /** Background gradient */
  backgroundGradient?: string;
  /** Component variant */
  variant?: 'default' | 'dark' | 'gradient' | 'image' | 'video' | 'animated';
  /** Layout style */
  layout?: 'centered' | 'left-aligned' | 'split' | 'fullscreen';
  /** Size of the hero */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enable parallax effect */
  parallax?: boolean;
  /** Parallax intensity (0-1) */
  parallaxIntensity?: number;
  /** Enable animations */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Show scroll indicator */
  showScrollIndicator?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Callback when scrolling */
  onScroll?: () => void;
  /** Callback when CTAs are clicked */
  onCTAClick?: (cta: CTA, index: number) => void;
}

// Default values
const defaultPrimaryCTA: CTA = {
  label: 'Start now',
  variant: 'primary',
  size: 'lg'
};

const defaultSecondaryCTAs: CTA[] = [
  {
    label: 'Learn more',
    variant: 'outline',
    size: 'lg'
  }
];

const defaultStats: HeroStats[] = [
  { label: 'Components', value: '52', suffix: '+' },
  { label: 'Ready to use', value: '100', suffix: '%' },
  { label: 'Performance', value: '95', suffix: '%' }
];

// Main Component
const Hero: React.FC<HeroProps> = ({
  title = 'Build faster with NexusG',
  subtitle = 'Components • Themes • Views',
  primaryCTA = defaultPrimaryCTA,
  secondaryCTAs = defaultSecondaryCTAs,
  socialProof = [],
  stats = defaultStats,
  backgroundImage,
  backgroundVideo,
  backgroundVideoPoster,
  backgroundGradient,
  variant = 'default',
  layout = 'centered',
  size = 'md',
  parallax = false,
  parallaxIntensity = 0.5,
  animated = true,
  animationDuration = 1000,
  showScrollIndicator = true,
  className = '',
  style = {},
  onScroll,
  onCTAClick
}) => {
  // State management
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Refs
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Handle scroll for parallax
  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      setScrollY(currentScrollY);
      if (onScroll) {
        onScroll();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, onScroll]);

  // Handle intersection observer for animations
  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 100);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  // Handle video loading
  useEffect(() => {
    if (backgroundVideo && videoRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => setIsVideoLoaded(true);
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [backgroundVideo]);

  // Scroll indicator click handler
  const handleScrollIndicator = () => {
    if (heroRef.current) {
      const nextSection = heroRef.current.nextElementSibling as HTMLElement;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
  };

  // CTA click handlers
  const handleCTAClick = (cta: CTA | string, index: number) => {
    const ctaObj = typeof cta === 'string' ? { label: cta } : cta;
    
    if (ctaObj.onClick) {
      ctaObj.onClick();
    }
    
    if (onCTAClick) {
      onCTAClick(ctaObj, index);
    }
  };

  // Build CSS classes
  const heroClasses = cn(
    'tb-hero',
    `tb-hero--${variant}`,
    `tb-hero--${layout}`,
    `tb-hero--${size}`,
    { 'tb-hero--parallax': parallax },
    { 'tb-hero--animated': animated },
    { 'tb-hero--visible': isVisible },
    className
  );

  // Calculate parallax transform
  const parallaxTransform = parallax 
    ? `translateY(${scrollY * parallaxIntensity}px)`
    : 'none';

  // Format CTA
  const formatCTA = (cta: CTA | string, index: number): CTA => {
    return typeof cta === 'string' 
      ? { label: cta, variant: 'primary', size: 'lg' }
      : { 
          ...defaultPrimaryCTA, 
          ...cta,
          variant: cta.variant || 'primary',
          size: cta.size || 'lg'
        };
  };

  // Render background
  const renderBackground = () => {
    if (backgroundVideo) {
      return (
        <div className="tb-hero__background tb-hero__background--video">
          <video
            ref={videoRef}
            className="tb-hero__video"
            autoPlay
            muted
            loop
            playsInline
            poster={backgroundVideoPoster}
          >
            <source src={backgroundVideo} type="video/mp4" />
            {backgroundImage && (
              <source src={backgroundImage} type="image/jpeg" />
            )}
          </video>
          <div className="tb-hero__video-overlay" />
        </div>
      );
    }

    if (backgroundImage) {
      return (
        <div 
          className="tb-hero__background tb-hero__background--image"
          style={{ 
            transform: parallaxTransform,
            backgroundImage: `url(${backgroundImage})`
          }}
        />
      );
    }

    if (backgroundGradient) {
      return (
        <div 
          className="tb-hero__background tb-hero__background--gradient"
          style={{ background: backgroundGradient }}
        />
      );
    }

    return <div className="tb-hero__background" />;
  };

  // Render social proof
  const renderSocialProof = () => {
    if (socialProof.length === 0) return null;

    return (
      <div className="tb-hero__social-proof">
        {socialProof.map((proof, index) => (
          <div key={index} className="tb-hero__social-proof-item">
            {proof.logo && (
              <img 
                src={proof.logo} 
                alt="" 
                className="tb-hero__social-proof-logo"
              />
            )}
            {proof.text && (
              <span className="tb-hero__social-proof-text">{proof.text}</span>
            )}
            {proof.number && (
              <span className="tb-hero__social-proof-number">{proof.number}</span>
            )}
            {proof.icon && (
              <span className="tb-hero__social-proof-icon">{proof.icon}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render statistics
  const renderStats = () => {
    if (stats.length === 0) return null;

    return (
      <div className="tb-hero__stats">
        {stats.map((stat, index) => (
          <div key={index} className="tb-hero__stat">
            <div className="tb-hero__stat-value">
              {stat.prefix && (
                <span className="tb-hero__stat-prefix">{stat.prefix}</span>
              )}
              <span className="tb-hero__stat-number">{stat.value}</span>
              {stat.suffix && (
                <span className="tb-hero__stat-suffix">{stat.suffix}</span>
              )}
            </div>
            <div className="tb-hero__stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render CTAs
  const renderCTAs = () => {
    const formattedPrimaryCTA = formatCTA(primaryCTA, 0);
    const formattedSecondaryCTAs = secondaryCTAs.map(formatCTA);

    return (
      <div className="tb-hero__ctas">
        {formattedPrimaryCTA && (
          <button
            type="button"
            className={`tb-hero__cta tb-hero__cta--primary tb-hero__cta--${formattedPrimaryCTA.variant} tb-hero__cta--${formattedPrimaryCTA.size}`}
            onClick={() => handleCTAClick(formattedPrimaryCTA, 0)}
          >
            {formattedPrimaryCTA.icon && (
              <span className="tb-hero__cta-icon">{formattedPrimaryCTA.icon}</span>
            )}
            <span className="tb-hero__cta-label">{formattedPrimaryCTA.label}</span>
          </button>
        )}

        {formattedSecondaryCTAs.length > 0 && (
          <div className="tb-hero__cta-group">
            {formattedSecondaryCTAs.map((cta, index) => (
              <button
                key={index}
                type="button"
                className={`tb-hero__cta tb-hero__cta--secondary tb-hero__cta--${cta.variant} tb-hero__cta--${cta.size}`}
                onClick={() => handleCTAClick(cta, index + 1)}
              >
                {cta.icon && (
                  <span className="tb-hero__cta-icon">{cta.icon}</span>
                )}
                <span className="tb-hero__cta-label">{cta.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render scroll indicator
  const renderScrollIndicator = () => {
    if (!showScrollIndicator) return null;

    return (
      <button
        type="button"
        className="tb-hero__scroll-indicator"
        onClick={handleScrollIndicator}
        aria-label="Scroll to next section"
      >
        <svg 
          className="tb-hero__scroll-arrow" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M7 10L12 15L17 10" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };

  // Render content based on layout
  const renderContent = () => {
    switch (layout) {
      case 'split':
        return (
          <div className="tb-hero__container">
            <div className="tb-hero__content">
              <div className="tb-hero__content-left">
                <h1 className="tb-hero__title">{title}</h1>
                <p className="tb-hero__subtitle">{subtitle}</p>
                {renderCTAs()}
                {renderSocialProof()}
              </div>
              <div className="tb-hero__content-right">
                {renderStats()}
              </div>
            </div>
          </div>
        );

      case 'fullscreen':
        return (
          <div className="tb-hero__container">
            <div className="tb-hero__content tb-hero__content--fullscreen">
              <h1 className="tb-hero__title">{title}</h1>
              <p className="tb-hero__subtitle">{subtitle}</p>
              {renderCTAs()}
            </div>
          </div>
        );

      default:
        return (
          <div className="tb-hero__container">
            <div className="tb-hero__content">
              <h1 className="tb-hero__title">{title}</h1>
              <p className="tb-hero__subtitle">{subtitle}</p>
              {renderCTAs()}
              {renderSocialProof()}
              {renderStats()}
            </div>
          </div>
        );
    }
  };

  return (
    <section 
      ref={heroRef}
      className={heroClasses} 
      style={{
        ...style,
        animationDuration: animated ? `${animationDuration}ms` : undefined
      }}
    >
      {renderBackground()}
      <div className="tb-hero__overlay" />
      <div className="tb-hero__content-wrapper">
        {renderContent()}
      </div>
      {renderScrollIndicator()}
    </section>
  );
};

export default Hero;
export type { HeroProps, CTA, SocialProof, HeroStats };