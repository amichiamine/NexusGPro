import React, {
  forwardRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  ReactNode,
  RefObject
} from 'react';
import './Testimonial.css';

export interface TestimonialData {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  image?: string;
  logo?: string;
  rating?: number; // 0-5 étoiles
  date?: string;
  verified?: boolean;
  location?: string;
  social?: {
    platform: string;
    url: string;
  };
}

export interface TestimonialProps {
  /**
   * Données du témoignage
   */
  testimonial: TestimonialData;
  
  /**
   * Variante du témoignage
   * @default 'simple'
   */
  variant?: 'simple' | 'with-avatar' | 'with-image' | 'with-rating' | 'with-logo' | 'featured';
  
  /**
   * Layout du témoignage
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal' | 'grid';
  
  /**
   * Taille du témoignage
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Position du contenu
   * @default 'center'
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Activer les animations
   * @default true
   */
  animated?: boolean;
  
  /**
   * Mode compact
   * @default false
   */
  compact?: boolean;
  
  /**
   * Afficher le cadre/bordure
   * @default true
   */
  bordered?: boolean;
  
  /**
   * Style de la citation
   */
  quoteStyle?: 'quote-marks' | 'quote-blocks' | 'clean' | 'decorative';
  
  /**
   * Maximum de lignes pour la citation
   * @default 4
   */
  maxQuoteLines?: number;
  
  /**
   * Classes CSS additionnelles
   */
  className?: string;
  
  /**
   * Style inline additionnel
   */
  style?: React.CSSProperties;
  
  /**
   * Callback lors du clic sur le témoignage
   */
  onClick?: (testimonial: TestimonialData) => void;
  
  /**
   * Callback lors du survol
   */
  onHover?: (testimonial: TestimonialData) => void;
  
  /**
   * Callback lors de la sortie du survol
   */
  onLeave?: (testimonial: TestimonialData) => void;
}

// Composant pour les étoiles de notation
const StarRating = forwardRef<HTMLDivElement, {
  rating?: number;
  maxRating?: number;
  size?: TestimonialProps['size'];
  interactive?: boolean;
  onChange?: (rating: number) => void;
}>(({ rating = 0, maxRating = 5, size = 'md', interactive = false, onChange }, ref) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = useCallback((starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1);
    }
  }, [interactive, onChange]);

  const handleMouseEnter = useCallback((starIndex: number) => {
    if (interactive) {
      setHoveredRating(starIndex + 1);
    }
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      setHoveredRating(0);
    }
  }, [interactive]);

  const displayRating = interactive ? (hoveredRating || rating) : rating;

  const starSizes = {
    xs: '14px',
    sm: '16px', 
    md: '18px',
    lg: '20px',
    xl: '24px'
  };

  return (
    <div
      ref={ref}
      className={[
        'testimonial__rating',
        interactive && 'testimonial__rating--interactive',
        `testimonial__rating--${size}`
      ].filter(Boolean).join(' ')}
      aria-label={`Note: ${rating} sur ${maxRating} étoiles`}
      role="img"
    >
      {Array.from({ length: maxRating }, (_, index) => (
        <button
          key={index}
          type="button"
          className={[
            'testimonial__star',
            index < displayRating && 'testimonial__star--filled',
            interactive && 'testimonial__star--clickable'
          ].filter(Boolean).join(' ')}
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          disabled={!interactive}
          aria-label={`${index + 1} étoile${index > 0 ? 's' : ''}`}
        >
          <svg
            className="testimonial__star-icon"
            width={starSizes[size]}
            height={starSizes[size]}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
              fillOpacity={index < displayRating ? 1 : 0.2}
            />
          </svg>
        </button>
      ))}
    </div>
  );
});

StarRating.displayName = 'StarRating';

// Composant principal Testimonial
export const Testimonial = forwardRef<HTMLDivElement, TestimonialProps>(({
  testimonial,
  variant = 'simple',
  layout = 'vertical',
  size = 'md',
  align = 'center',
  animated = true,
  compact = false,
  bordered = true,
  quoteStyle = 'quote-marks',
  maxQuoteLines = 4,
  className = '',
  style,
  onClick,
  onHover,
  onLeave
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calcul des classes CSS dynamiques
  const containerClasses = [
    'testimonial',
    `testimonial--${variant}`,
    `testimonial--${layout}`,
    `testimonial--${size}`,
    `testimonial--align-${align}`,
    compact && 'testimonial--compact',
    bordered && 'testimonial--bordered',
    animated && 'testimonial--animated',
    isHovered && 'testimonial--hovered',
    className
  ].filter(Boolean).join(' ');

  // Gestion des événements
  const handleClick = useCallback(() => {
    onClick?.(testimonial);
  }, [onClick, testimonial]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover?.(testimonial);
  }, [onHover, testimonial]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onLeave?.(testimonial);
  }, [onLeave, testimonial]);

  // Styles pour le texte de la citation
  const quoteTextStyle = useMemo(() => ({
    display: '-webkit-box',
    WebkitLineClamp: maxQuoteLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  }), [maxQuoteLines]);

  // Rendu du contenu de l'auteur
  const renderAuthorContent = () => {
    const authorParts = [];

    // Avatar/Image
    {(variant === 'with-avatar' || variant === 'featured') && (testimonial.avatar || testimonial.image) && (
      <div className="testimonial__avatar">
        <img
          src={testimonial.avatar || testimonial.image}
          alt={`Photo de profil de ${testimonial.author}`}
          className="testimonial__avatar-image"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    )}

    // Informations de l'auteur
    <div className="testimonial__author-info">
      <div className="testimonial__author-name">
        {testimonial.author}
        {testimonial.verified && (
          <span className="testimonial__verified" aria-label="Témoignage vérifié">
            <svg viewBox="0 0 24 24" className="testimonial__verified-icon">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor" />
            </svg>
          </span>
        )}
      </div>
      
      {(testimonial.role || testimonial.company) && (
        <div className="testimonial__author-role">
          {testimonial.role && testimonial.company ? 
            `${testimonial.role} chez ${testimonial.company}` :
            testimonial.role || testimonial.company
          }
        </div>
      )}
      
      {testimonial.location && (
        <div className="testimonial__author-location">
          {testimonial.location}
        </div>
      )}
      
      {testimonial.date && (
        <div className="testimonial__date">
          {new Date(testimonial.date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
          })}
        </div>
      )}
    </div>

    return authorParts;
  };

  // Rendu du logo
  const renderLogo = () => {
    if (variant === 'with-logo' && testimonial.logo) {
      return (
        <div className="testimonial__logo">
          <img
            src={testimonial.logo}
            alt={`Logo de ${testimonial.company || 'l\'entreprise'}`}
            className="testimonial__logo-image"
          />
        </div>
      );
    }
    return null;
  };

  // Rendu de la notation
  const renderRating = () => {
    if (variant === 'with-rating' || (variant === 'featured' && testimonial.rating)) {
      return (
        <div className="testimonial__rating-container">
          <StarRating 
            rating={testimonial.rating || 0} 
            size={size}
          />
          {testimonial.rating && (
            <span className="testimonial__rating-text">
              {testimonial.rating.toFixed(1)}/5
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Rendu des liens sociaux
  const renderSocial = () => {
    if (testimonial.social?.url) {
      return (
        <a
          href={testimonial.social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="testimonial__social"
          aria-label={`Voir le profil de ${testimonial.author} sur ${testimonial.social.platform}`}
        >
          <svg viewBox="0 0 24 24" className="testimonial__social-icon">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="currentColor"/>
          </svg>
          {testimonial.social.platform}
        </a>
      );
    }
    return null;
  };

  return (
    <blockquote
      ref={ref}
      className={containerClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      tabIndex={onClick ? 0 : -1}
      role="article"
      aria-labelledby={`testimonial-quote-${testimonial.id}`}
      aria-describedby={`testimonial-author-${testimonial.id}`}
      data-testid="testimonial-container"
    >
      {/* Header avec logo et notation */}
      <div className="testimonial__header">
        {renderLogo()}
        {renderRating()}
      </div>

      {/* Contenu principal */}
      <div className="testimonial__content">
        {/* Icône decorative pour certaines variantes */}
        {(quoteStyle === 'decorative' || variant === 'featured') && (
          <div className="testimonial__quote-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="testimonial__quote-icon-svg">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
        )}

        {/* Citation */}
        <p 
          id={`testimonial-quote-${testimonial.id}`}
          className="testimonial__quote"
          style={quoteTextStyle}
        >
          {quoteStyle === 'quote-marks' && '"'}
          {testimonial.quote}
          {quoteStyle === 'quote-marks' && '"'}
        </p>
      </div>

      {/* Footer avec informations de l'auteur */}
      <footer className="testimonial__footer">
        <div className="testimonial__author">
          {(variant === 'with-avatar' || variant === 'featured') && (testimonial.avatar || testimonial.image) && (
            <div className="testimonial__avatar">
              <img
                src={testimonial.avatar || testimonial.image}
                alt={`Photo de profil de ${testimonial.author}`}
                className="testimonial__avatar-image"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          )}
          
          <div className="testimonial__author-info">
            <div id={`testimonial-author-${testimonial.id}`} className="testimonial__author-name">
              {testimonial.author}
              {testimonial.verified && (
                <span className="testimonial__verified" aria-label="Témoignage vérifié">
                  <svg viewBox="0 0 24 24" className="testimonial__verified-icon">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </div>
            
            {(testimonial.role || testimonial.company) && (
              <div className="testimonial__author-role">
                {testimonial.role && testimonial.company ? 
                  `${testimonial.role} chez ${testimonial.company}` :
                  testimonial.role || testimonial.company
                }
              </div>
            )}
            
            {testimonial.location && (
              <div className="testimonial__author-location">
                {testimonial.location}
              </div>
            )}
            
            {testimonial.date && (
              <div className="testimonial__date">
                {new Date(testimonial.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long'
                })}
              </div>
            )}
          </div>
        </div>
        
        {renderSocial()}
      </footer>
    </blockquote>
  );
});

Testimonial.displayName = 'Testimonial';

export default Testimonial;