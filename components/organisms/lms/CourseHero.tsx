import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import CourseCard, { CourseCardProps } from './CourseCard';
import './CourseHero.css';

export interface Instructor {
  /** Identifiant unique */
  id: string;
  /** Nom complet */
  name: string;
  /** Bio courte */
  bio?: string;
  /** URL du profil */
  profileUrl?: string;
  /** Avatar */
  avatar?: string;
  /** Nombre d'étudiants */
  studentCount?: number;
  /** Note moyenne */
  rating?: number;
  /** Nombre de cours */
  courseCount?: number;
  /** Expérience */
  experience?: string;
  /** Spécialités */
  specialties?: string[];
  /** Certifications */
  certifications?: string[];
  /** Réseaux sociaux */
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
}

export interface CourseAchievement {
  /** Type d'achievement */
  type: 'certificate' | 'badge' | 'level' | 'streak';
  /** Nom */
  name: string;
  /** Description */
  description?: string;
  /** Icône */
  icon: string;
  /** Date d'obtention */
  earnedDate?: string;
  /** URL vers le certificat/badge */
  url?: string;
}

export interface CourseHighlight {
  /** Titre du point fort */
  title: string;
  /** Description */
  description: string;
  /** Icône */
  icon: string;
  /** Valeur ou métrique */
  value?: string | number;
}

export interface CourseHeroProps {
  /** Informations de base du cours */
  course: {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // en minutes
    lessons: number;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    studentCount?: number;
    categories: string[];
    tags?: string[];
    isNew?: boolean;
    isPopular?: boolean;
    isFree?: boolean;
    isOnSale?: boolean;
    certificate?: boolean;
    lifetimeAccess?: boolean;
    mobileFriendly?: boolean;
    lastUpdated?: string;
    language?: string;
    subtitles?: string[];
    progress?: number;
    enrollmentStatus?: 'not-enrolled' | 'enrolled' | 'completed' | 'in-progress';
    courseUrl?: string;
  };
  /** Informations de l'instructeur */
  instructor?: Instructor;
  /** Points forts du cours */
  highlights?: CourseHighlight[];
  /** Achievements disponibles */
  achievements?: CourseAchievement[];
  /** Technologies couvertes */
  technologies?: {
    name: string;
    icon?: string;
    proficiency?: 'beginner' | 'intermediate' | 'advanced';
  }[];
  /** Prérequis */
  prerequisites?: string[];
  /** Objectifs d'apprentissage */
  learningObjectives?: string[];
  /** Contenu du cours */
  courseContent?: {
    sections: {
      id: string;
      title: string;
      lessons: number;
      duration: number; // en minutes
      isLocked?: boolean;
      isCompleted?: boolean;
      isAccessible?: boolean;
    }[];
  };
  /** Avis récents */
  recentReviews?: {
    id: string;
    studentName: string;
    studentAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
  }[];
  /** Actions disponibles */
  actions?: {
    /** Inscription au cours */
    enroll?: {
      enabled: boolean;
      label?: string;
      onClick: (courseId: string) => void;
    };
    /** Aperçu gratuit */
    preview?: {
      enabled: boolean;
      label?: string;
      onClick: (courseId: string) => void;
    };
    /** Ajouter aux favoris */
    addToWishlist?: {
      enabled: boolean;
      isActive?: boolean;
      label?: string;
      onClick: (courseId: string) => void;
    };
    /** Partager */
    share?: {
      enabled: boolean;
      label?: string;
      onClick: (courseId: string) => void;
    };
    /** Télécharger le programme */
    downloadSyllabus?: {
      enabled: boolean;
      label?: string;
      onClick: (courseId: string) => void;
    };
  };
  /** Configuration d'affichage */
  display?: {
    /** Mode compact */
    compact?: boolean;
    /** Mode transparent (overlay) */
    transparent?: boolean;
    /** Afficher les détails complets */
    showFullDetails?: boolean;
    /** Masquer certaines sections */
    hideSections?: string[];
    /** Afficher la vidéo de preview */
    showPreviewVideo?: boolean;
    /** URL de la vidéo de preview */
    previewVideoUrl?: string;
  };
  /** Statistiques */
  stats?: {
    /** Temps moyen de completion */
    averageCompletionTime?: number;
    /** Taux de réussite */
    successRate?: number;
    /** Nombre d'evaluations */
    assessmentCount?: number;
  };
  /** Callbacks */
  onInstructorClick?: (instructorId: string) => void;
  onTechnologyClick?: (technologyName: string) => void;
  onPrerequisiteClick?: (prerequisite: string) => void;
  onObjectiveClick?: (objective: string) => void;
  onReviewClick?: (reviewId: string) => void;
  onSectionClick?: (sectionId: string) => void;
  /** Classes CSS */
  className?: string;
}

export interface CourseHeroStates {
  /** Section active */
  activeSection: string;
  /** État d'expansion du contenu */
  contentExpanded: boolean;
  /** État du modal de prévisualisation */
  previewModalOpen: boolean;
  /** État du modal de partage */
  shareModalOpen: boolean;
  /** Favoris animé */
  wishlistAnimated: boolean;
  /** Progression visible */
  showProgress: boolean;
}

const CourseHero: React.FC<CourseHeroProps> = ({
  course,
  instructor,
  highlights = [],
  achievements = [],
  technologies = [],
  prerequisites = [],
  learningObjectives = [],
  courseContent,
  recentReviews = [],
  actions = {},
  display = {},
  stats,
  onInstructorClick,
  onTechnologyClick,
  onPrerequisiteClick,
  onObjectiveClick,
  onReviewClick,
  onSectionClick,
  className = ''
}) => {
  // État local du composant
  const [states, setStates] = useState<CourseHeroStates>({
    activeSection: 'overview',
    contentExpanded: false,
    previewModalOpen: false,
    shareModalOpen: false,
    wishlistAnimated: false,
    showProgress: course.enrollmentStatus !== 'not-enrolled'
  });

  // Effets
  useEffect(() => {
    if (course.enrollmentStatus !== 'not-enrolled') {
      setStates(prev => ({ ...prev, showProgress: true }));
    }
  }, [course.enrollmentStatus]);

  // Gestionnaires d'événements
  const handleAction = useCallback((actionName: keyof typeof actions) => {
    const action = actions[actionName];
    if (action?.onClick && course.id) {
      action.onClick(course.id);
    }
  }, [actions, course.id]);

  const toggleContentExpansion = useCallback(() => {
    setStates(prev => ({
      ...prev,
      contentExpanded: !prev.contentExpanded
    }));
  }, []);

  const openPreviewModal = useCallback(() => {
    setStates(prev => ({ ...prev, previewModalOpen: true }));
  }, []);

  const closePreviewModal = useCallback(() => {
    setStates(prev => ({ ...prev, previewModalOpen: false }));
  }, []);

  const openShareModal = useCallback(() => {
    setStates(prev => ({ ...prev, shareModalOpen: true }));
  }, []);

  const closeShareModal = useCallback(() => {
    setStates(prev => ({ ...prev, shareModalOpen: false }));
  }, []);

  const animateWishlist = useCallback(() => {
    setStates(prev => ({ ...prev, wishlistAnimated: true }));
    setTimeout(() => {
      setStates(prev => ({ ...prev, wishlistAnimated: false }));
    }, 600);
  }, []);

  const handleWishlistClick = useCallback(() => {
    handleAction('addToWishlist');
    if (actions.addToWishlist?.onClick) {
      animateWishlist();
    }
  }, [handleAction, actions.addToWishlist, animateWishlist]);

  // Utilitaires de formatage
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'var(--color-success, #10b981)';
      case 'intermediate':
        return 'var(--color-warning, #f59e0b)';
      case 'advanced':
        return 'var(--color-error, #ef4444)';
      default:
        return 'var(--color-neutral-600, #4b5563)';
    }
  };

  const getLevelLabel = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return level;
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
        return "S'inscrire";
    }
  };

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-hero',
    {
      'course-hero--compact': display.compact,
      'course-hero--transparent': display.transparent,
      'course-hero--full-details': display.showFullDetails,
      'course-hero--expanded': states.contentExpanded,
    },
    className
  );

  // Rendu des badges
  const renderBadges = () => {
    const badges = [];
    if (course.isNew) badges.push({ text: 'Nouveau', class: 'badge--new' });
    if (course.isPopular) badges.push({ text: 'Populaire', class: 'badge--popular' });
    if (course.isFree) badges.push({ text: 'Gratuit', class: 'badge--free' });
    if (course.isOnSale) badges.push({ text: 'Promotion', class: 'badge--sale' });
    if (course.certificate) badges.push({ text: 'Certificat', class: 'badge--certificate' });
    if (course.lifetimeAccess) badges.push({ text: 'Accès à vie', class: 'badge--lifetime' });

    return badges.length > 0 ? (
      <div className="course-hero__badges">
        {badges.map((badge, index) => (
          <span key={index} className={`course-hero__badge ${badge.class}`}>
            {badge.text}
          </span>
        ))}
      </div>
    ) : null;
  };

  // Rendu des statistiques principales
  const renderMainStats = () => (
    <div className="course-hero__stats">
      {course.rating && (
        <div className="course-hero__stat">
          <span className="course-hero__stat-icon">⭐</span>
          <span className="course-hero__stat-value">{course.rating}</span>
          {course.reviewCount && (
            <span className="course-hero__stat-label">
              ({course.reviewCount} avis)
            </span>
          )}
        </div>
      )}
      
      <div className="course-hero__stat">
        <span className="course-hero__stat-icon">⏱️</span>
        <span className="course-hero__stat-value">{formatDuration(course.duration)}</span>
      </div>
      
      <div className="course-hero__stat">
        <span className="course-hero__stat-icon">📚</span>
        <span className="course-hero__stat-value">{course.lessons}</span>
        <span className="course-hero__stat-label">leçons</span>
      </div>
      
      {course.studentCount && (
        <div className="course-hero__stat">
          <span className="course-hero__stat-icon">👥</span>
          <span className="course-hero__stat-value">
            {course.studentCount.toLocaleString()}
          </span>
          <span className="course-hero__stat-label">étudiants</span>
        </div>
      )}
    </div>
  );

  // Rendu de l'instructeur
  const renderInstructor = () => {
    if (!instructor) return null;

    return (
      <div className="course-hero__instructor">
        <h3 className="course-hero__section-title">Instructeur</h3>
        <div className="course-hero__instructor-card">
          {instructor.avatar && (
            <img
              src={instructor.avatar}
              alt={`Avatar de ${instructor.name}`}
              className="course-hero__instructor-avatar"
              onClick={() => onInstructorClick?.(instructor.id)}
            />
          )}
          <div className="course-hero__instructor-info">
            <h4 
              className="course-hero__instructor-name"
              onClick={() => onInstructorClick?.(instructor.id)}
            >
              {instructor.name}
            </h4>
            {instructor.bio && (
              <p className="course-hero__instructor-bio">
                {instructor.bio}
              </p>
            )}
            <div className="course-hero__instructor-stats">
              {instructor.courseCount && (
                <span>{instructor.courseCount} cours</span>
              )}
              {instructor.studentCount && (
                <span>{instructor.studentCount.toLocaleString()} étudiants</span>
              )}
              {instructor.rating && (
                <span>⭐ {instructor.rating}</span>
              )}
            </div>
            {instructor.specialties && instructor.specialties.length > 0 && (
              <div className="course-hero__instructor-specialties">
                {instructor.specialties.slice(0, 3).map((specialty, index) => (
                  <span key={index} className="course-hero__specialty">
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Rendu des technologies
  const renderTechnologies = () => {
    if (technologies.length === 0) return null;

    return (
      <div className="course-hero__technologies">
        <h3 className="course-hero__section-title">Technologies</h3>
        <div className="course-hero__tech-grid">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="course-hero__tech-item"
              onClick={() => onTechnologyClick?.(tech.name)}
            >
              {tech.icon && (
                <img
                  src={tech.icon}
                  alt={tech.name}
                  className="course-hero__tech-icon"
                />
              )}
              <span className="course-hero__tech-name">{tech.name}</span>
              {tech.proficiency && (
                <span className={`course-hero__tech-level course-hero__tech-level--${tech.proficiency}`}>
                  {getLevelLabel(tech.proficiency)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu du contenu du cours
  const renderCourseContent = () => {
    if (!courseContent || display.hideSections?.includes('content')) return null;

    const totalDuration = courseContent.sections.reduce(
      (total, section) => total + section.duration,
      0
    );
    const totalLessons = courseContent.sections.reduce(
      (total, section) => total + section.lessons,
      0
    );

    return (
      <div className="course-hero__content">
        <div className="course-hero__content-header">
          <h3 className="course-hero__section-title">Contenu du cours</h3>
          <div className="course-hero__content-summary">
            <span>{courseContent.sections.length} sections</span>
            <span>•</span>
            <span>{totalLessons} leçons</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)} au total</span>
          </div>
        </div>
        
        <div className="course-hero__sections">
          {courseContent.sections.map((section, index) => (
            <div
              key={section.id}
              className={`course-hero__section ${section.isLocked ? 'is-locked' : ''} ${section.isCompleted ? 'is-completed' : ''}`}
              onClick={() => !section.isLocked && onSectionClick?.(section.id)}
            >
              <div className="course-hero__section-header">
                <span className="course-hero__section-number">
                  {index + 1}
                </span>
                <h4 className="course-hero__section-title">
                  {section.title}
                </h4>
                <div className="course-hero__section-meta">
                  <span>{section.lessons} leçons</span>
                  <span>•</span>
                  <span>{formatDuration(section.duration)}</span>
                  {section.isLocked && <span className="course-hero__section-locked">🔒</span>}
                  {section.isCompleted && <span className="course-hero__section-completed">✅</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!states.contentExpanded && (
          <button
            type="button"
            className="course-hero__content-expand"
            onClick={toggleContentExpansion}
          >
            Voir tout le contenu
          </button>
        )}
      </div>
    );
  };

  return (
    <section className={containerClasses}>
      {/* Image de fond ou hero image */}
      <div className="course-hero__media">
        <img
          src={course.imageSrc}
          alt={course.imageAlt || course.title}
          className="course-hero__image"
        />
        
        {/* Overlay pour mode transparent */}
        {display.transparent && (
          <div className="course-hero__overlay" />
        )}
        
        {/* Badges */}
        {renderBadges()}
        
        {/* Preview button */}
        {actions.preview?.enabled && (
          <button
            type="button"
            className="course-hero__preview-btn"
            onClick={openPreviewModal}
            aria-label="Aperçu du cours"
          >
            ▶️
          </button>
        )}
      </div>

      {/* Contenu principal */}
      <div className="course-hero__content">
        {/* Header avec titre et actions principales */}
        <div className="course-hero__header">
          {/* Catégories */}
          {course.categories.length > 0 && (
            <div className="course-hero__categories">
              {course.categories.map((category, index) => (
                <span key={index} className="course-hero__category">
                  {category}
                </span>
              ))}
            </div>
          )}
          
          {/* Titre */}
          <h1 className="course-hero__title">
            {course.title}
          </h1>
          
          {/* Description */}
          <p className="course-hero__description">
            {course.description}
          </p>
          
          {/* Niveau et autres métadonnées */}
          <div className="course-hero__meta">
            <span
              className="course-hero__level"
              style={{ color: getLevelColor(course.level) }}
            >
              {getLevelLabel(course.level)}
            </span>
            
            {course.language && (
              <span className="course-hero__language">
                🗣️ {course.language}
              </span>
            )}
            
            {course.lastUpdated && (
              <span className="course-hero__last-updated">
                Mis à jour le {formatDate(course.lastUpdated)}
              </span>
            )}
            
            {course.mobileFriendly && (
              <span className="course-hero__mobile-friendly">
                📱 Mobile
              </span>
            )}
          </div>
          
          {/* Statistiques principales */}
          {renderMainStats()}
          
          {/* Barre de progression */}
          {states.showProgress && course.progress !== undefined && (
            <div className="course-hero__progress">
              <div className="course-hero__progress-header">
                <span>Progression</span>
                <span>{course.progress}%</span>
              </div>
              <div className="course-hero__progress-bar">
                <div
                  className="course-hero__progress-fill"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions principales */}
        <div className="course-hero__actions">
          {actions.enroll?.enabled && (
            <button
              type="button"
              className={`course-hero__enroll-btn ${course.enrollmentStatus !== 'not-enrolled' ? 'is-enrolled' : ''}`}
              onClick={() => handleAction('enroll')}
              disabled={course.enrollmentStatus === 'completed'}
            >
              {actions.enroll.label || getEnrollmentStatusLabel(course.enrollmentStatus || 'not-enrolled')}
            </button>
          )}
          
          <div className="course-hero__secondary-actions">
            {actions.addToWishlist?.enabled && (
              <button
                type="button"
                className={`course-hero__wishlist-btn ${actions.addToWishlist.isActive ? 'is-active' : ''} ${states.wishlistAnimated ? 'is-animated' : ''}`}
                onClick={handleWishlistClick}
                aria-label={actions.addToWishlist.label || 'Ajouter aux favoris'}
              >
                ❤️
              </button>
            )}
            
            {actions.share?.enabled && (
              <button
                type="button"
                className="course-hero__share-btn"
                onClick={() => handleAction('share')}
                aria-label={actions.share.label || 'Partager'}
              >
                📤
              </button>
            )}
            
            {actions.downloadSyllabus?.enabled && (
              <button
                type="button"
                className="course-hero__syllabus-btn"
                onClick={() => handleAction('downloadSyllabus')}
                aria-label={actions.downloadSyllabus.label || 'Télécharger le programme'}
              >
                📄
              </button>
            )}
          </div>
        </div>

        {/* Points forts du cours */}
        {highlights.length > 0 && (
          <div className="course-hero__highlights">
            <h3 className="course-hero__section-title">Points forts</h3>
            <div className="course-hero__highlights-grid">
              {highlights.map((highlight, index) => (
                <div key={index} className="course-hero__highlight">
                  <span className="course-hero__highlight-icon" aria-hidden="true">
                    {highlight.icon}
                  </span>
                  <div className="course-hero__highlight-content">
                    <h4 className="course-hero__highlight-title">
                      {highlight.title}
                    </h4>
                    <p className="course-hero__highlight-description">
                      {highlight.description}
                    </p>
                    {highlight.value && (
                      <span className="course-hero__highlight-value">
                        {highlight.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations détaillées */}
        <div className="course-hero__details">
          {instructor && renderInstructor()}
          {technologies.length > 0 && renderTechnologies()}
          {prerequisites.length > 0 && (
            <div className="course-hero__prerequisites">
              <h3 className="course-hero__section-title">Prérequis</h3>
              <ul className="course-hero__prerequisites-list">
                {prerequisites.map((prereq, index) => (
                  <li 
                    key={index}
                    className="course-hero__prerequisite"
                    onClick={() => onPrerequisiteClick?.(prereq)}
                  >
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {learningObjectives.length > 0 && (
            <div className="course-hero__objectives">
              <h3 className="course-hero__section-title">Objectifs d'apprentissage</h3>
              <ul className="course-hero__objectives-list">
                {learningObjectives.map((objective, index) => (
                  <li 
                    key={index}
                    className="course-hero__objective"
                    onClick={() => onObjectiveClick?.(objective)}
                  >
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Contenu du cours */}
        {courseContent && renderCourseContent()}

        {/* Avis récents */}
        {recentReviews.length > 0 && (
          <div className="course-hero__reviews">
            <h3 className="course-hero__section-title">Avis récents</h3>
            <div className="course-hero__reviews-list">
              {recentReviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="course-hero__review"
                  onClick={() => onReviewClick?.(review.id)}
                >
                  <div className="course-hero__review-header">
                    {review.studentAvatar && (
                      <img
                        src={review.studentAvatar}
                        alt={review.studentName}
                        className="course-hero__reviewer-avatar"
                      />
                    )}
                    <div className="course-hero__reviewer-info">
                      <h4 className="course-hero__reviewer-name">
                        {review.studentName}
                      </h4>
                      <div className="course-hero__review-meta">
                        <span className="course-hero__review-rating">
                          ⭐ {review.rating}
                        </span>
                        <span className="course-hero__review-date">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="course-hero__review-comment">
                    {review.comment}
                  </p>
                  {review.helpful > 0 && (
                    <div className="course-hero__review-helpful">
                      Utile ({review.helpful})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="course-hero__achievements">
            <h3 className="course-hero__section-title">Ce que vous obtiendrez</h3>
            <div className="course-hero__achievements-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className="course-hero__achievement">
                  <span className="course-hero__achievement-icon" aria-hidden="true">
                    {achievement.icon}
                  </span>
                  <div className="course-hero__achievement-content">
                    <h4 className="course-hero__achievement-name">
                      {achievement.name}
                    </h4>
                    {achievement.description && (
                      <p className="course-hero__achievement-description">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {states.previewModalOpen && display.showPreviewVideo && (
        <div className="course-hero__modal">
          <div className="course-hero__modal-content">
            <button
              type="button"
              className="course-hero__modal-close"
              onClick={closePreviewModal}
              aria-label="Fermer"
            >
              ✕
            </button>
            {display.previewVideoUrl ? (
              <video
                src={display.previewVideoUrl}
                controls
                className="course-hero__preview-video"
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              <div className="course-hero__preview-placeholder">
                Vidéo de preview non disponible
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseHero;