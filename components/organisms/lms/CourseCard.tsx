import React, { useState, useCallback } from 'react';
import { cn } from '@/utils';
import { PriceTag, PriceTagProps } from '../ecommerce/PriceTag';
import './CourseCard.css';

export interface CourseCardProps {
  /** URL de l'image principale du cours */
  imageSrc: string;
  /** URL de l'image secondaire (survol) */
  imageSrcHover?: string;
  /** Texte alternatif pour l'image */
  imageAlt?: string;
  /** Titre du cours */
  title: string;
  /** Description courte du cours */
  description?: string;
  /** Prix du cours */
  price: number;
  /** Prix original (si en promotion) */
  originalPrice?: number;
  /** Note/rating du cours */
  rating?: number;
  /** Nombre d'avis */
  reviewCount?: number;
  /** Nom de l'instructeur */
  instructor?: string;
  /** URL du profil de l'instructeur */
  instructorUrl?: string;
  /** Avatar de l'instructeur */
  instructorAvatar?: string;
  /** Durée du cours en minutes */
  duration?: number;
  /** Nombre de leçons */
  lessons?: number;
  /** Niveau de difficulté */
  level?: 'beginner' | 'intermediate' | 'advanced';
  /** Catégories du cours */
  categories?: string[];
  /** Tags du cours */
  tags?: string[];
  /** Langues disponibles */
  languages?: string[];
  /** Sous-titres disponibles */
  subtitles?: string[];
  /** Certificat disponible */
  certificate?: boolean;
  /** Ressources téléchargeables */
  downloadableResources?: boolean;
  /** Accès à vie */
  lifetimeAccess?: boolean;
  /** Mobile friendly */
  mobileFriendly?: boolean;
  /** Nouveauté */
  isNew?: boolean;
  /** Bestseller */
  isBestSeller?: boolean;
  /** Populaire */
  isPopular?: boolean;
  /** Gratuit */
  isFree?: boolean;
  /** En promotion */
  isOnSale?: boolean;
  /** Progression de l'étudiant (0-100) */
  progress?: number;
  /** Statut d'inscription */
  enrollmentStatus?: 'not-enrolled' | 'enrolled' | 'completed' | 'in-progress';
  /** URL de détail du cours */
  courseUrl?: string;
  /** URLs d'images pour la galerie */
  galleryImages?: string[];
  /** Dernière mise à jour */
  lastUpdated?: string;
  /** Nombre d'étudiants inscrits */
  studentCount?: number;
  /** Technologies/outils couverts */
  tools?: string[];
  /** Prérequis du cours */
  prerequisites?: string[];
  /** Objectifs d'apprentissage */
  learningObjectives?: string[];
  /** Actions rapides disponibles */
  quickActions?: {
    /** S'inscrire au cours */
    enroll?: {
      enabled: boolean;
      label?: string;
      onClick?: (courseId: string) => void;
    };
    /** Ajouter aux favoris */
    addToWishlist?: {
      enabled: boolean;
      label?: string;
      isActive?: boolean;
      onClick?: (courseId: string) => void;
    };
    /** Aperçu du cours */
    preview?: {
      enabled: boolean;
      label?: string;
      onClick?: (courseId: string) => void;
    };
    /** Partager le cours */
    share?: {
      enabled: boolean;
      label?: string;
      onClick?: (courseId: string) => void;
    };
    /** Télécharger le programme */
    downloadSyllabus?: {
      enabled: boolean;
      label?: string;
      onClick?: (courseId: string) => void;
    };
  };
  /** Variantes d'affichage */
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  /** Taille du composant */
  size?: 'small' | 'medium' | 'large';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** État de chargement */
  loading?: boolean;
  /** État d'erreur */
  error?: string;
  /** Classes CSS personnalisées */
  className?: string;
  /** Fonction de clic sur la carte */
  onClick?: (courseId: string) => void;
  /** Fonction de focus */
  onFocus?: (courseId: string) => void;
  /** Fonction de blur */
  onBlur?: (courseId: string) => void;
}

export interface CourseCardStates {
  /** Image actuellement affichée */
  currentImage: string;
  /** Image sur survol */
  isHovered: boolean;
  /** État d'expansion pour vue détaillée */
  isExpanded: boolean;
  /** État de chargement des images */
  imageLoading: boolean;
  /** Erreur d'image */
  imageError: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  imageSrc,
  imageSrcHover,
  imageAlt,
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  instructor,
  instructorUrl,
  instructorAvatar,
  duration,
  lessons,
  level,
  categories = [],
  tags = [],
  languages = [],
  subtitles = [],
  certificate = false,
  downloadableResources = false,
  lifetimeAccess = false,
  mobileFriendly = false,
  isNew = false,
  isBestSeller = false,
  isPopular = false,
  isFree = false,
  isOnSale = false,
  progress,
  enrollmentStatus = 'not-enrolled',
  courseUrl,
  galleryImages = [],
  lastUpdated,
  studentCount,
  tools = [],
  prerequisites = [],
  learningObjectives = [],
  quickActions = {},
  variant = 'default',
  size = 'medium',
  orientation = 'vertical',
  loading = false,
  error,
  className = '',
  onClick,
  onFocus,
  onBlur
}) => {
  // État local du composant
  const [states, setStates] = useState<CourseCardStates>({
    currentImage: imageSrc,
    isHovered: false,
    isExpanded: variant === 'detailed',
    imageLoading: false,
    imageError: false
  });

  // Gestionnaires d'événements
  const handleMouseEnter = useCallback(() => {
    if (imageSrcHover && !states.imageError) {
      setStates(prev => ({
        ...prev,
        isHovered: true,
        currentImage: imageSrcHover
      }));
    }
  }, [imageSrcHover, states.imageError]);

  const handleMouseLeave = useCallback(() => {
    setStates(prev => ({
      ...prev,
      isHovered: false,
      currentImage: imageSrc
    }));
  }, [imageSrc]);

  const handleImageLoad = useCallback(() => {
    setStates(prev => ({
      ...prev,
      imageLoading: false,
      imageError: false
    }));
  }, []);

  const handleImageError = useCallback(() => {
    setStates(prev => ({
      ...prev,
      imageLoading: false,
      imageError: true
    }));
  }, []);

  const handleCardClick = useCallback(() => {
    if (onClick && courseUrl) {
      onClick(courseUrl);
    }
  }, [onClick, courseUrl]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const handleFocus = useCallback(() => {
    if (onFocus && courseUrl) {
      onFocus(courseUrl);
    }
  }, [onFocus, courseUrl]);

  const handleBlur = useCallback(() => {
    if (onBlur && courseUrl) {
      onBlur(courseUrl);
    }
  }, [onBlur, courseUrl]);

  // Actions rapides
  const handleQuickAction = useCallback((actionName: string) => {
    const action = (quickActions as any)[actionName];
    if (action?.onClick && courseUrl) {
      action.onClick(courseUrl);
    }
  }, [quickActions, courseUrl]);

  // Formatage des données
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'var(--color-success)';
      case 'intermediate':
        return 'var(--color-warning)';
      case 'advanced':
        return 'var(--color-error)';
      default:
        return 'var(--color-neutral-600)';
    }
  };

  const getEnrollmentStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'var(--color-success)';
      case 'in-progress':
        return 'var(--color-primary)';
      case 'enrolled':
        return 'var(--color-primary)';
      default:
        return 'var(--color-neutral-600)';
    }
  };

  const getEnrollmentStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'enrolled':
        return 'Inscrit';
      default:
        return 'S\'inscrire';
    }
  };

  // Classes CSS dynamiques
  const cardClasses = cn(
    'course-card',
    `course-card--${variant}`,
    `course-card--${size}`,
    `course-card--${orientation}`,
    {
      'course-card--hovered': states.isHovered,
      'course-card--expanded': states.isExpanded,
      'course-card--loading': loading,
      'course-card--error': error,
      'course-card--bestseller': isBestSeller,
      'course-card--popular': isPopular,
      'course-card--new': isNew,
      'course-card--sale': isOnSale,
      'course-card--free': isFree,
    },
    className
  );

  // Construction des badges
  const badges = [];
  if (isNew) badges.push('Nouveau');
  if (isBestSeller) badges.push('Bestseller');
  if (isPopular) badges.push('Populaire');
  if (isFree) badges.push('Gratuit');
  if (isOnSale) badges.push('Promotion');
  if (certificate) badges.push('Certificat');
  if (lifetimeAccess) badges.push('Accès à vie');

  if (loading) {
    return (
      <div className={`${cardClasses} course-card--skeleton`} role="status" aria-label="Chargement du cours">
        <div className="course-card__image-skeleton" />
        <div className="course-card__content">
          <div className="course-card__title-skeleton" />
          <div className="course-card__description-skeleton" />
          <div className="course-card__meta-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClasses} course-card--error`} role="alert">
        <div className="course-card__error">
          <span className="course-card__error-icon">⚠️</span>
          <span className="course-card__error-message">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cardClasses}
      role="article"
      aria-label={title}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image du cours */}
      <div className="course-card__image-container">
        <img
          src={states.currentImage}
          alt={imageAlt || title}
          className="course-card__image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="course-card__badges" aria-label="Badges du cours">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="course-card__badge"
                aria-label={`Badge: ${badge}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Progression pour les cours inscrits */}
        {progress !== undefined && enrollmentStatus !== 'not-enrolled' && (
          <div className="course-card__progress" aria-label={`Progression: ${progress}%`}>
            <div
              className="course-card__progress-bar"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Actions rapides */}
        <div className="course-card__quick-actions" aria-label="Actions rapides">
          {quickActions.addToWishlist?.enabled && (
            <button
              className={`course-card__quick-action ${quickActions.addToWishlist.isActive ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('addToWishlist');
              }}
              aria-label={quickActions.addToWishlist.label || 'Ajouter aux favoris'}
              title={quickActions.addToWishlist.label || 'Ajouter aux favoris'}
            >
              ❤️
            </button>
          )}
          
          {quickActions.preview?.enabled && (
            <button
              className="course-card__quick-action"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('preview');
              }}
              aria-label={quickActions.preview.label || 'Aperçu du cours'}
              title={quickActions.preview.label || 'Aperçu du cours'}
            >
              👁️
            </button>
          )}
          
          {quickActions.share?.enabled && (
            <button
              className="course-card__quick-action"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('share');
              }}
              aria-label={quickActions.share.label || 'Partager'}
              title={quickActions.share.label || 'Partager'}
            >
              📤
            </button>
          )}
        </div>
      </div>

      {/* Contenu du cours */}
      <div className="course-card__content">
        {/* Catégories */}
        {categories.length > 0 && (
          <div className="course-card__categories" aria-label="Catégories">
            {categories.slice(0, 2).map((category, index) => (
              <span key={index} className="course-card__category">
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Titre */}
        <h3 className="course-card__title">
          <a href={courseUrl} className="course-card__title-link">
            {title}
          </a>
        </h3>

        {/* Description */}
        {description && (
          <p className="course-card__description">
            {description}
          </p>
        )}

        {/* Instructeur */}
        {instructor && (
          <div className="course-card__instructor" aria-label="Instructeur">
            {instructorAvatar && (
              <img
                src={instructorAvatar}
                alt={`Avatar de ${instructor}`}
                className="course-card__instructor-avatar"
                loading="lazy"
              />
            )}
            <span className="course-card__instructor-name">
              {instructorUrl ? (
                <a href={instructorUrl} className="course-card__instructor-link">
                  {instructor}
                </a>
              ) : (
                instructor
              )}
            </span>
          </div>
        )}

        {/* Métadonnées */}
        <div className="course-card__meta" aria-label="Métadonnées du cours">
          {/* Note et avis */}
          {rating && (
            <div className="course-card__rating" aria-label={`Note: ${rating}/5`}>
              <span className="course-card__rating-stars" aria-hidden="true">
                ⭐⭐⭐⭐⭐
              </span>
              <span className="course-card__rating-value">{rating}</span>
              {reviewCount && (
                <span className="course-card__review-count">({reviewCount})</span>
              )}
            </div>
          )}

          {/* Niveau */}
          {level && (
            <span
              className="course-card__level"
              style={{ color: getLevelColor(level) }}
              aria-label={`Niveau: ${level}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          )}

          {/* Durée */}
          {duration && (
            <span className="course-card__duration" aria-label={`Durée: ${formatDuration(duration)}`}>
              ⏱️ {formatDuration(duration)}
            </span>
          )}

          {/* Leçons */}
          {lessons && (
            <span className="course-card__lessons" aria-label={`${lessons} leçons`}>
              📚 {lessons} leçons
            </span>
          )}

          {/* Étudiants */}
          {studentCount && (
            <span className="course-card__students" aria-label={`${studentCount} étudiants`}>
              👥 {studentCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Statut d'inscription */}
        {enrollmentStatus !== 'not-enrolled' && (
          <div
            className="course-card__enrollment-status"
            style={{ color: getEnrollmentStatusColor(enrollmentStatus) }}
            aria-label={`Statut: ${getEnrollmentStatusLabel(enrollmentStatus)}`}
          >
            {getEnrollmentStatusLabel(enrollmentStatus)}
          </div>
        )}

        {/* Technologies/outils */}
        {tools.length > 0 && (variant === 'detailed' || variant === 'card') && (
          <div className="course-card__tools" aria-label="Technologies utilisées">
            <span className="course-card__tools-label">Technologies:</span>
            <div className="course-card__tools-list">
              {tools.slice(0, 3).map((tool, index) => (
                <span key={index} className="course-card__tool">
                  {tool}
                </span>
              ))}
              {tools.length > 3 && (
                <span className="course-card__tools-more">
                  +{tools.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Prix et actions */}
        <div className="course-card__footer">
          <div className="course-card__pricing">
            {isFree ? (
              <span className="course-card__price course-card__price--free">
                Gratuit
              </span>
            ) : (
              <PriceTag
                price={price}
                originalPrice={originalPrice}
                size="small"
                showDiscount={isOnSale}
                showSavings={isOnSale}
              />
            )}
          </div>

          <div className="course-card__actions">
            {quickActions.enroll?.enabled && (
              <button
                className={`course-card__enroll-btn ${enrollmentStatus !== 'not-enrolled' ? 'is-enrolled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('enroll');
                }}
                aria-label={quickActions.enroll.label || getEnrollmentStatusLabel(enrollmentStatus)}
                disabled={enrollmentStatus === 'completed'}
              >
                {quickActions.enroll.label || getEnrollmentStatusLabel(enrollmentStatus)}
              </button>
            )}

            {quickActions.downloadSyllabus?.enabled && (
              <button
                className="course-card__syllabus-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('downloadSyllabus');
                }}
                aria-label={quickActions.downloadSyllabus.label || 'Télécharger le programme'}
              >
                📄
              </button>
            )}
          </div>
        </div>

        {/* Expansion pour vue détaillée */}
        {variant === 'detailed' && (
          <div className="course-card__expanded-content">
            {learningObjectives.length > 0 && (
              <div className="course-card__objectives">
                <h4 className="course-card__objectives-title">Objectifs d'apprentissage</h4>
                <ul className="course-card__objectives-list">
                  {learningObjectives.slice(0, 5).map((objective, index) => (
                    <li key={index} className="course-card__objective">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prerequisites.length > 0 && (
              <div className="course-card__prerequisites">
                <h4 className="course-card__prerequisites-title">Prérequis</h4>
                <ul className="course-card__prerequisites-list">
                  {prerequisites.slice(0, 3).map((prereq, index) => (
                    <li key={index} className="course-card__prerequisite">
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lastUpdated && (
              <div className="course-card__last-updated">
                <span className="course-card__last-updated-label">Dernière mise à jour:</span>
                <span className="course-card__last-updated-value">
                  {new Date(lastUpdated).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default CourseCard;