import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils';
import './LogoCloud.css';

export interface LogoItem {
  id: string;
  name: string;
  src?: string;
  alt?: string;
  href?: string;
  width?: number;
  height?: number;
  color?: string;
}

export interface LogoCloudProps {
  /** Array of logo items to display */
  logos: LogoItem[];
  
  /** Visual variant of the component */
  variant?: 'default' | 'dark' | 'light' | 'brand-colors' | 'minimalist' | 'gradient';
  
  /** Layout style for logo arrangement */
  layout?: 'grid' | 'carousel' | 'masonry' | 'inline' | 'columns';
  
  /** Size of logos and spacing */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Number of columns for grid layouts */
  columns?: 2 | 3 | 4 | 5 | 6;
  
  /** Animation style for interactions */
  animation?: 'none' | 'hover' | 'fade' | 'slide' | 'pulse';
  
  /** Whether logos should be clickable links */
  clickable?: boolean;
  
  /** Custom CSS class for additional styling */
  className?: string;
  
  /** Inline styles for advanced customization */
  style?: React.CSSProperties;
  
  /** Carousel autoplay settings */
  autoplay?: boolean;
  autoplaySpeed?: number;
  
  /** Responsive behavior */
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /** Accessibility label */
  'aria-label'?: string;
  
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * LogoCloud component for displaying collections of logos
 * 
 * Supports multiple variants, layouts, sizes, and animation styles.
 * Includes accessibility features and responsive design.
 */
const LogoCloud: React.FC<LogoCloudProps> = ({
  logos = [],
  variant = 'default',
  layout = 'grid',
  size = 'md',
  columns = 4,
  animation = 'hover',
  clickable = false,
  className = '',
  style = {},
  autoplay = false,
  autoplaySpeed = 3000,
  responsive = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
  'aria-label': ariaLabel = 'Company logos',
  'data-testid': testId = 'logo-cloud',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Handle carousel autoplay
  useEffect(() => {
    if (layout === 'carousel' && autoplay && logos.length > 0) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(logos.length / columns)));
      }, autoplaySpeed);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [layout, autoplay, autoplaySpeed, logos.length, columns]);

  // Handle mouse events for hover animations
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (layout === 'carousel' && autoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(logos.length / columns)));
      }, autoplaySpeed);
    }
  }, [layout, autoplay, autoplaySpeed, logos.length, columns]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, logo: LogoItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (logo.href) {
        window.open(logo.href, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // Handle logo click
  const handleLogoClick = useCallback((logo: LogoItem, event: React.MouseEvent) => {
    event.preventDefault();
    if (clickable && logo.href) {
      window.open(logo.href, '_blank', 'noopener,noreferrer');
    }
  }, [clickable]);

  // Navigation functions for carousel
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(logos.length / columns)));
  }, [logos.length, columns]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, Math.ceil(logos.length / columns))) % Math.max(1, Math.ceil(logos.length / columns)));
  }, [logos.length, columns]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Generate responsive column classes
  const getResponsiveColumns = () => {
    const baseCols = `col-${columns}`;
    const responsiveCols = Object.entries(responsive)
      .map(([breakpoint, colCount]) => `col-${breakpoint}-${colCount}`)
      .join(' ');
    return `${baseCols} ${responsiveCols}`;
  };

  // Generate animation classes
  const getAnimationClasses = () => {
    if (animation === 'none') return '';
    const baseAnimation = `logo-cloud-animation-${animation}`;
    const hoverClass = isHovered && animation === 'hover' ? 'logo-cloud-hovered' : '';
    return `${baseAnimation} ${hoverClass}`.trim();
  };

  // Generate size classes
  const getSizeClasses = () => {
    return `logo-cloud-size-${size}`;
  };

  // Generate variant classes
  const getVariantClasses = () => {
    return `logo-cloud-variant-${variant}`;
  };

  // Generate layout classes
  const getLayoutClasses = () => {
    return `logo-cloud-layout-${layout}`;
  };

  // Render logo item
  const renderLogo = (logo: LogoItem, index: number) => {
    const logoContent = (
      <div
        key={logo.id || index}
        className="logo-cloud-item"
        style={{
          width: logo.width,
          height: logo.height,
          color: logo.color,
        }}
        role={clickable ? 'button' : 'img'}
        tabIndex={clickable ? 0 : -1}
        aria-label={logo.alt || logo.name}
        onClick={(e) => handleLogoClick(logo, e)}
        onKeyDown={(e) => handleKeyDown(e, logo)}
      >
        {logo.src ? (
          <img
            src={logo.src}
            alt={logo.alt || logo.name}
            className="logo-cloud-image"
            width={logo.width}
            height={logo.height}
            loading="lazy"
            onError={(e) => {
              // Fallback to text if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const textElement = target.nextElementSibling as HTMLElement;
              if (textElement) {
                textElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <span 
          className="logo-cloud-text"
          style={{ display: logo.src ? 'none' : 'flex' }}
        >
          {logo.name}
        </span>
      </div>
    );

    if (clickable && logo.href) {
      return (
        <a
          key={logo.id || index}
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="logo-cloud-link"
          onClick={(e) => e.preventDefault()} // Prevent default, handled in component
        >
          {logoContent}
        </a>
      );
    }

    return logoContent;
  };

  // Render grid layout
  const renderGrid = () => {
    return (
      <div 
        className={`logo-cloud-grid ${getResponsiveColumns()}`}
        role="list"
        aria-label={ariaLabel}
      >
        {logos.map((logo, index) => (
          <div key={logo.id || index} className="logo-cloud-grid-item" role="listitem">
            {renderLogo(logo, index)}
          </div>
        ))}
      </div>
    );
  };

  // Render carousel layout
  const renderCarousel = () => {
    const totalSlides = Math.max(1, Math.ceil(logos.length / columns));
    const visibleLogos = logos.slice(currentSlide * columns, (currentSlide + 1) * columns);

    return (
      <div className="logo-cloud-carousel" role="region" aria-label={ariaLabel}>
        <div 
          ref={carouselRef}
          className="logo-cloud-carousel-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="logo-cloud-carousel-track">
            {visibleLogos.map((logo, index) => (
              <div key={`${currentSlide}-${index}`} className="logo-cloud-carousel-item">
                {renderLogo(logo, currentSlide * columns + index)}
              </div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                className="logo-cloud-carousel-prev"
                onClick={prevSlide}
                aria-label="Previous logos"
                tabIndex={0}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                </svg>
              </button>
              <button
                type="button"
                className="logo-cloud-carousel-next"
                onClick={nextSlide}
                aria-label="Next logos"
                tabIndex={0}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Slide indicators */}
        {totalSlides > 1 && (
          <div className="logo-cloud-carousel-indicators" role="tablist" aria-label="Logo slides">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`logo-cloud-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render masonry layout
  const renderMasonry = () => {
    return (
      <div className="logo-cloud-masonry" role="list" aria-label={ariaLabel}>
        {logos.map((logo, index) => (
          <div key={logo.id || index} className="logo-cloud-masonry-item" role="listitem">
            {renderLogo(logo, index)}
          </div>
        ))}
      </div>
    );
  };

  // Render inline layout
  const renderInline = () => {
    return (
      <div className="logo-cloud-inline" role="list" aria-label={ariaLabel}>
        {logos.map((logo, index) => (
          <div key={logo.id || index} className="logo-cloud-inline-item" role="listitem">
            {renderLogo(logo, index)}
          </div>
        ))}
      </div>
    );
  };

  // Render columns layout
  const renderColumns = () => {
    const columnsArray = Array.from({ length: columns }, (_, colIndex) =>
      logos.filter((_, logoIndex) => logoIndex % columns === colIndex)
    );

    return (
      <div className="logo-cloud-columns" role="list" aria-label={ariaLabel}>
        {columnsArray.map((columnLogos, colIndex) => (
          <div key={colIndex} className="logo-cloud-column" role="list">
            {columnLogos.map((logo, logoIndex) => (
              <div key={`${colIndex}-${logoIndex}`} className="logo-cloud-column-item" role="listitem">
                {renderLogo(logo, colIndex * columns + logoIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Render appropriate layout
  const renderLayout = () => {
    switch (layout) {
      case 'carousel':
        return renderCarousel();
      case 'masonry':
        return renderMasonry();
      case 'inline':
        return renderInline();
      case 'columns':
        return renderColumns();
      case 'grid':
      default:
        return renderGrid();
    }
  };

  // Early return for empty logos
  if (logos.length === 0) {
    return (
      <div 
        className={`logo-cloud ${getSizeClasses()} ${getVariantClasses()} ${getLayoutClasses()} ${getAnimationClasses()} ${className}`}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        role="status"
        {...props}
      >
        <div className="logo-cloud-empty">
          <span className="logo-cloud-empty-text">No logos to display</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`logo-cloud ${getSizeClasses()} ${getVariantClasses()} ${getLayoutClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
      data-testid={testId}
      aria-label={ariaLabel}
      role="region"
      {...props}
    >
      {renderLayout()}
    </div>
  );
};

export default LogoCloud;