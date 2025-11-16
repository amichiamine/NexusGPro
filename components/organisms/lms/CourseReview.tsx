import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils';
import './CourseReview.css';

export interface ReviewHelpfulness {
  /** Nombre de votes "utile" */
  helpful: number;
  /** Nombre de votes "pas utile" */
  notHelpful: number;
  /** Décompte des votes */
  totalVotes: number;
  /** Pourcentage d'utilité */
  helpfulnessPercentage: number;
}

export interface ReviewReply {
  /** Identifiant unique de la réponse */
  id: string;
  /** Auteur de la réponse */
  author: {
    name: string;
    avatar?: string;
    role: 'instructor' | 'student' | 'moderator';
  };
  /** Contenu de la réponse */
  content: string;
  /** Date de création */
  createdAt: string;
  /** Dernière modification */
  updatedAt?: string;
  /** État de la réponse */
  status?: 'pending' | 'approved' | 'rejected';
  /** Aide à la modération */
  moderationFlags?: {
    spam: boolean;
    inappropriate: boolean;
    offTopic: boolean;
  };
}

export interface ReviewAttachment {
  /** Nom du fichier */
  name: string;
  /** URL du fichier */
  url: string;
  /** Type de fichier */
  type: 'image' | 'video' | 'document' | 'link';
  /** Taille du fichier */
  size?: string;
  /** Miniature (pour images/vidéos) */
  thumbnail?: string;
}

export interface CourseReview {
  /** Identifiant unique de l'avis */
  id: string;
  /** Auteur de l'avis */
  author: {
    name: string;
    avatar?: string;
    role?: 'student' | 'instructor' | 'alumni';
    verified?: boolean;
    completedCourses?: number;
  };
  /** Note générale (1-5) */
  overallRating: number;
  /** Note pour le contenu */
  contentRating?: number;
  /** Note pour l'instructeur */
  instructorRating?: number;
  /** Note pour le support */
  supportRating?: number;
  /** Note pour la plateforme */
  platformRating?: number;
  /** Titre de l'avis */
  title?: string;
  /** Contenu de l'avis */
  content: string;
  /** Date de l'avis */
  date: string;
  /** Date de mise à jour */
  updatedAt?: string;
  /** Statut de l'avis */
  status?: 'published' | 'pending' | 'flagged' | 'hidden';
  /** Utilité de l'avis */
  helpfulness?: ReviewHelpfulness;
  /** Réponses à l'avis */
  replies?: ReviewReply[];
  /** Pièces jointes */
  attachments?: ReviewAttachment[];
  /** Avantages mentionnés */
  pros?: string[];
  /** Inconvénients mentionnés */
  cons?: string[];
  /** Recommanderiez-vous ce cours */
  recommended?: boolean;
  /** Niveau d'expérience avant le cours */
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  /** Temps investi */
  timeSpent?: number; // en heures
  /** Achèvement du cours */
  completionPercentage?: number;
  /** Utilisation pour */
  useCase?: string;
  /** Certificat obtenu */
  certificateEarned?: boolean;
  /** Aide à la modération */
  moderationFlags?: {
    spam: boolean;
    inappropriate: boolean;
    offTopic: boolean;
    fake: boolean;
  };
  /** Statistiques de modération */
  moderationStatus?: {
    reviewed: boolean;
    reviewedBy?: string;
    reviewDate?: string;
    action?: 'approved' | 'rejected' | 'edited' | 'hidden';
    reason?: string;
  };
}

export interface ReviewFilters {
  /** Filtrer par note */
  rating?: number[];
  /** Filtrer par utilisateur vérifié */
  verifiedOnly?: boolean;
  /** Filtrer par avis avec réponses */
  withReplies?: boolean;
  /** Filtrer par dates */
  dateRange?: {
    start: string;
    end: string;
  };
  /** Filtrer par longueur */
  length?: 'short' | 'medium' | 'long';
  /** Tri */
  sortBy?: 'recent' | 'helpful' | 'rating-high' | 'rating-low' | 'oldest';
  /** Recherche textuelle */
  searchQuery?: string;
}

export interface CourseReviewProps {
  /** Liste des avis */
  reviews: CourseReview[];
  /** Statistiques des avis */
  statistics?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recommendationPercentage: number;
    verifiedReviewPercentage: number;
  };
  /** Filtres actifs */
  filters?: ReviewFilters;
  /** Configuration d'affichage */
  display?: {
    /** Mode compact */
    compact?: boolean;
    /** Afficher les statistiques */
    showStatistics?: boolean;
    /** Afficher les filtres */
    showFilters?: boolean;
    /** Afficher les réponses */
    showReplies?: boolean;
    /** Limiter le nombre d'avis affichés */
    limit?: number;
    /** Afficher les badges */
    showBadges?: boolean;
    /** Afficher les pièces jointes */
    showAttachments?: boolean;
  };
  /** Actions disponibles */
  actions?: {
    /** Voter pour l'utilité */
    voteHelpfulness?: {
      enabled: boolean;
      onVote: (reviewId: string, helpful: boolean) => void;
    };
    /** Signaler un avis */
    reportReview?: {
      enabled: boolean;
      onReport: (reviewId: string, reason: string) => void;
    };
    /** Répondre à un avis */
    replyToReview?: {
      enabled: boolean;
      onReply: (reviewId: string, content: string) => void;
    };
    /** Éditer un avis */
    editReview?: {
      enabled: boolean;
      onEdit: (reviewId: string) => void;
    };
    /** Supprimer un avis */
    deleteReview?: {
      enabled: boolean;
      onDelete: (reviewId: string) => void;
    };
    /** Charger plus d'avis */
    loadMore?: {
      enabled: boolean;
      hasMore: boolean;
      onLoadMore: () => void;
    };
  };
  /** Callbacks */
  onReviewClick?: (review: CourseReview) => void;
  onAuthorClick?: (authorName: string) => void;
  onFilterChange?: (filters: ReviewFilters) => void;
  onReplySubmit?: (reviewId: string, content: string) => void;
  /** Classes CSS */
  className?: string;
}

export interface CourseReviewStates {
  /** Filtres actifs */
  activeFilters: ReviewFilters;
  /** Avis expandés */
  expandedReviews: Set<string>;
  /** Réponses expandées */
  expandedReplies: Set<string>;
  /** Avis en cours de modification */
  editingReviews: Set<string>;
  /** Modal de signalement ouverte */
  reportModalOpen: boolean;
  /** Avis sélectionné pour le signalement */
  reportedReviewId: string | null;
  /** Modal de réponse ouverte */
  replyModalOpen: boolean;
  /** Avis sélectionné pour la réponse */
  replyingReviewId: string | null;
  /** Contenu de réponse temporaire */
  replyContent: string;
  /** Loading state */
  loading: boolean;
  /** Vote en cours */
  voting: Set<string>;
}

const CourseReview: React.FC<CourseReviewProps> = ({
  reviews,
  statistics,
  filters = {},
  display = {},
  actions = {},
  onReviewClick,
  onAuthorClick,
  onFilterChange,
  onReplySubmit,
  className = ''
}) => {
  // Configuration par défaut
  const defaultDisplay = {
    compact: false,
    showStatistics: true,
    showFilters: true,
    showReplies: true,
    limit: 10,
    showBadges: true,
    showAttachments: true,
    ...display
  };

  // État local du composant
  const [states, setStates] = useState<CourseReviewStates>(({
    activeFilters: {
      sortBy: 'recent',
      ...filters
    },
    expandedReviews: new Set(),
    expandedReplies: new Set(),
    editingReviews: new Set(),
    reportModalOpen: false,
    reportedReviewId: null,
    replyModalOpen: false,
    replyingReviewId: null,
    replyContent: '',
    loading: false,
    voting: new Set()
  }));

  // Gestionnaires d'événements
  const toggleReviewExpansion = useCallback((reviewId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedReviews);
      if (newExpanded.has(reviewId)) {
        newExpanded.delete(reviewId);
      } else {
        newExpanded.add(reviewId);
      }
      return {
        ...prev,
        expandedReviews: newExpanded
      };
    });
  }, []);

  const toggleReplyExpansion = useCallback((replyId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedReplies);
      if (newExpanded.has(replyId)) {
        newExpanded.delete(replyId);
      } else {
        newExpanded.add(replyId);
      }
      return {
        ...prev,
        expandedReplies: newExpanded
      };
    });
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<ReviewFilters>) => {
    const updatedFilters = { ...states.activeFilters, ...newFilters };
    setStates(prev => ({
      ...prev,
      activeFilters: updatedFilters
    }));

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  }, [states.activeFilters, onFilterChange]);

  const handleHelpfulnessVote = useCallback((reviewId: string, helpful: boolean) => {
    if (actions.voteHelpfulness?.onVote) {
      setStates(prev => ({
        ...prev,
        voting: new Set([...prev.voting, reviewId])
      }));

      actions.voteHelpfulness.onVote(reviewId, helpful);

      // Simuler la fin du vote après un délai
      setTimeout(() => {
        setStates(prev => {
          const newVoting = new Set(prev.voting);
          newVoting.delete(reviewId);
          return {
            ...prev,
            voting: newVoting
          };
        });
      }, 500);
    }
  }, [actions.voteHelpfulness]);

  const handleReportReview = useCallback((reviewId: string) => {
    setStates(prev => ({
      ...prev,
      reportedReviewId: reviewId,
      reportModalOpen: true
    }));
  }, []);

  const handleReplyToReview = useCallback((reviewId: string) => {
    setStates(prev => ({
      ...prev,
      replyingReviewId: reviewId,
      replyModalOpen: true,
      replyContent: ''
    }));
  }, []);

  const handleReplySubmit = useCallback(() => {
    if (states.replyingReviewId && states.replyContent.trim() && onReplySubmit) {
      onReplySubmit(states.replyingReviewId, states.replyContent.trim());
      setStates(prev => ({
        ...prev,
        replyModalOpen: false,
        replyingReviewId: null,
        replyContent: ''
      }));
    }
  }, [states.replyingReviewId, states.replyContent, onReplySubmit]);

  const closeModals = useCallback(() => {
    setStates(prev => ({
      ...prev,
      reportModalOpen: false,
      replyModalOpen: false,
      reportedReviewId: null,
      replyingReviewId: null,
      replyContent: ''
    }));
  }, []);

  // Utilitaires
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    
    return formatDate(dateString);
  };

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium'): React.ReactNode => {
    const stars = [];
    const starSize = size === 'small' ? '12px' : size === 'medium' ? '16px' : '20px';
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={cn(
            'course-review__star',
            {
              'is-filled': i <= rating,
              'is-empty': i > rating,
            }
          )}
          style={{ fontSize: starSize }}
        >
          ⭐
        </span>
      );
    }
    
    return <div className="course-review__stars">{stars}</div>;
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent'
    };
    return labels[rating as keyof typeof labels] || '';
  };

  // Filtrage et tri des avis
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filtrage par note
    if (states.activeFilters.rating && states.activeFilters.rating.length > 0) {
      filtered = filtered.filter(review => 
        states.activeFilters.rating!.includes(review.overallRating)
      );
    }

    // Filtrer les avis vérifiés
    if (states.activeFilters.verifiedOnly) {
      filtered = filtered.filter(review => review.author.verified);
    }

    // Filtrer les avis avec réponses
    if (states.activeFilters.withReplies) {
      filtered = filtered.filter(review => 
        review.replies && review.replies.length > 0
      );
    }

    // Recherche textuelle
    if (states.activeFilters.searchQuery) {
      const query = states.activeFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.content.toLowerCase().includes(query) ||
        review.title?.toLowerCase().includes(query) ||
        review.author.name.toLowerCase().includes(query)
      );
    }

    // Tri
    switch (states.activeFilters.sortBy) {
      case 'helpful':
        filtered.sort((a, b) => {
          const aHelpful = a.helpfulness?.helpfulnessPercentage || 0;
          const bHelpful = b.helpfulness?.helpfulnessPercentage || 0;
          return bHelpful - aHelpful;
        });
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.overallRating - a.overallRating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.overallRating - b.overallRating);
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    // Limite
    if (defaultDisplay.limit) {
      filtered = filtered.slice(0, defaultDisplay.limit);
    }

    return filtered;
  }, [reviews, states.activeFilters, defaultDisplay.limit]);

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-review',
    {
      'course-review--compact': defaultDisplay.compact,
    },
    className
  );

  // Rendu des statistiques
  const renderStatistics = () => {
    if (!statistics || !defaultDisplay.showStatistics) return null;

    return (
      <div className="course-review__statistics">
        <div className="course-review__statistics-header">
          <h3 className="course-review__statistics-title">
            Avis des étudiants
          </h3>
          <div className="course-review__statistics-summary">
            <div className="course-review__overall-rating">
              <span className="course-review__overall-rating-value">
                {statistics.averageRating.toFixed(1)}
              </span>
              <div className="course-review__overall-rating-stars">
                {renderStars(Math.round(statistics.averageRating), 'large')}
              </div>
              <span className="course-review__overall-rating-count">
                ({statistics.totalReviews} avis)
              </span>
            </div>
          </div>
        </div>

        <div className="course-review__rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = statistics.ratingDistribution[rating as keyof typeof statistics.ratingDistribution];
            const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="course-review__rating-row">
                <span className="course-review__rating-label">{rating} étoile{rating > 1 ? 's' : ''}</span>
                <div className="course-review__rating-bar">
                  <div
                    className="course-review__rating-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="course-review__rating-count">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="course-review__statistics-footer">
          <div className="course-review__recommendation">
            <span className="course-review__recommendation-label">
              {statistics.recommendationPercentage}% recommandent ce cours
            </span>
          </div>
          <div className="course-review__verified-reviews">
            <span className="course-review__verified-label">
              {statistics.verifiedReviewPercentage}% d'avis vérifiés
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des filtres
  const renderFilters = () => {
    if (!defaultDisplay.showFilters) return null;

    return (
      <div className="course-review__filters">
        <div className="course-review__filters-row">
          {/* Tri */}
          <div className="course-review__filter-group">
            <label className="course-review__filter-label">Trier par:</label>
            <select
              value={states.activeFilters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="course-review__filter-select"
            >
              <option value="recent">Plus récents</option>
              <option value="helpful">Plus utiles</option>
              <option value="rating-high">Meilleures notes</option>
              <option value="rating-low">Plus basses notes</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </div>

          {/* Filtre par note */}
          <div className="course-review__filter-group">
            <label className="course-review__filter-label">Note:</label>
            <div className="course-review__rating-filter">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="course-review__rating-checkbox">
                  <input
                    type="checkbox"
                    checked={states.activeFilters.rating?.includes(rating) || false}
                    onChange={(e) => {
                      const currentRatings = states.activeFilters.rating || [];
                      const newRatings = e.target.checked
                        ? [...currentRatings, rating]
                        : currentRatings.filter(r => r !== rating);
                      handleFilterChange({ rating: newRatings.length > 0 ? newRatings : undefined });
                    }}
                  />
                  <span className="course-review__rating-checkbox-label">
                    {rating} ⭐
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtres additionnels */}
          <div className="course-review__filter-group">
            <label className="course-review__filter-checkbox">
              <input
                type="checkbox"
                checked={states.activeFilters.verifiedOnly || false}
                onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked || undefined })}
              />
              <span className="course-review__filter-checkbox-label">
                Avis vérifiés uniquement
              </span>
            </label>
          </div>

          {/* Recherche */}
          <div className="course-review__filter-group">
            <input
              type="text"
              placeholder="Rechercher dans les avis..."
              value={states.activeFilters.searchQuery || ''}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value || undefined })}
              className="course-review__search-input"
            />
          </div>
        </div>
      </div>
    );
  };

  // Rendu d'un avis
  const renderReview = (review: CourseReview): React.ReactNode => {
    const isExpanded = states.expandedReviews.has(review.id);
    const isEditing = states.editingReviews.has(review.id);

    return (
      <article
        key={review.id}
        className={cn(
          'course-review__item',
          {
            'is-expanded': isExpanded,
          }
        )}
      >
        <div className="course-review__header">
          <div className="course-review__author">
            {review.author.avatar && (
              <img
                src={review.author.avatar}
                alt={`Avatar de ${review.author.name}`}
                className="course-review__author-avatar"
              />
            )}
            <div className="course-review__author-info">
              <div className="course-review__author-name">
                <button
                  type="button"
                  className="course-review__author-link"
                  onClick={() => onAuthorClick?.(review.author.name)}
                >
                  {review.author.name}
                </button>
                {review.author.verified && (
                  <span className="course-review__verified-badge" title="Avis vérifié">
                    ✓
                  </span>
                )}
              </div>
              <div className="course-review__author-meta">
                <span className="course-review__review-date">
                  {formatRelativeTime(review.date)}
                </span>
                {review.author.role && (
                  <span className="course-review__author-role">
                    {review.author.role}
                  </span>
                )}
                {review.author.completedCourses && (
                  <span className="course-review__completed-courses">
                    {review.author.completedCourses} cours terminés
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="course-review__rating">
            <div className="course-review__rating-overall">
              {renderStars(review.overallRating)}
              <span className="course-review__rating-label">
                {getRatingLabel(review.overallRating)}
              </span>
            </div>
            {defaultDisplay.showBadges && (
              <div className="course-review__badges">
                {review.recommended !== undefined && (
                  <span className={cn(
                    'course-review__badge',
                    {
                      'is-recommended': review.recommended,
                      'not-recommended': !review.recommended,
                    }
                  )}>
                    {review.recommended ? '👍 Recommande' : '👎 Ne recommande pas'}
                  </span>
                )}
                {review.certificateEarned && (
                  <span className="course-review__badge course-review__badge--certificate">
                    🏆 Certificat obtenu
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {review.title && (
          <h4 className="course-review__title">
            {review.title}
          </h4>
        )}

        <div className="course-review__content">
          <p className="course-review__text">
            {isExpanded ? review.content : 
             review.content.length > 300 ? 
             `${review.content.substring(0, 300)}...` : 
             review.content}
          </p>
          
          {review.content.length > 300 && (
            <button
              type="button"
              className="course-review__expand-btn"
              onClick={() => toggleReviewExpansion(review.id)}
            >
              {isExpanded ? 'Voir moins' : 'Lire la suite'}
            </button>
          )}
        </div>

        {/* Détails supplémentaires */}
        {isExpanded && (
          <div className="course-review__details">
            {/* Notes détaillées */}
            {(review.contentRating || review.instructorRating || review.supportRating || review.platformRating) && (
              <div className="course-review__detailed-ratings">
                {review.contentRating && (
                  <div className="course-review__detailed-rating">
                    <span className="course-review__detailed-rating-label">Contenu:</span>
                    <div className="course-review__detailed-rating-value">
                      {renderStars(review.contentRating, 'small')}
                      <span>{review.contentRating}/5</span>
                    </div>
                  </div>
                )}
                {review.instructorRating && (
                  <div className="course-review__detailed-rating">
                    <span className="course-review__detailed-rating-label">Instructeur:</span>
                    <div className="course-review__detailed-rating-value">
                      {renderStars(review.instructorRating, 'small')}
                      <span>{review.instructorRating}/5</span>
                    </div>
                  </div>
                )}
                {review.supportRating && (
                  <div className="course-review__detailed-rating">
                    <span className="course-review__detailed-rating-label">Support:</span>
                    <div className="course-review__detailed-rating-value">
                      {renderStars(review.supportRating, 'small')}
                      <span>{review.supportRating}/5</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pros et Cons */}
            {(review.pros || review.cons) && (
              <div className="course-review__pros-cons">
                {review.pros && review.pros.length > 0 && (
                  <div className="course-review__pros">
                    <h5 className="course-review__pros-cons-title">👍 Points positifs:</h5>
                    <ul className="course-review__pros-cons-list">
                      {review.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div className="course-review__cons">
                    <h5 className="course-review__pros-cons-title">👎 Points négatifs:</h5>
                    <ul className="course-review__pros-cons-list">
                      {review.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="course-review__additional-info">
              {review.experienceLevel && (
                <div className="course-review__info-item">
                  <span className="course-review__info-label">Niveau d'expérience:</span>
                  <span className="course-review__info-value">
                    {review.experienceLevel === 'beginner' ? 'Débutant' :
                     review.experienceLevel === 'intermediate' ? 'Intermédiaire' :
                     review.experienceLevel === 'advanced' ? 'Avancé' : review.experienceLevel}
                  </span>
                </div>
              )}
              {review.timeSpent && (
                <div className="course-review__info-item">
                  <span className="course-review__info-label">Temps investi:</span>
                  <span className="course-review__info-value">
                    {review.timeSpent} heures
                  </span>
                </div>
              )}
              {review.completionPercentage && (
                <div className="course-review__info-item">
                  <span className="course-review__info-label">Cours terminé à:</span>
                  <span className="course-review__info-value">
                    {review.completionPercentage}%
                  </span>
                </div>
              )}
              {review.useCase && (
                <div className="course-review__info-item">
                  <span className="course-review__info-label">Utilisation:</span>
                  <span className="course-review__info-value">{review.useCase}</span>
                </div>
              )}
            </div>

            {/* Pièces jointes */}
            {defaultDisplay.showAttachments && review.attachments && review.attachments.length > 0 && (
              <div className="course-review__attachments">
                <h5 className="course-review__attachments-title">Pièces jointes:</h5>
                <div className="course-review__attachments-list">
                  {review.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="course-review__attachment"
                    >
                      <span className="course-review__attachment-icon">
                        {attachment.type === 'image' && '🖼️'}
                        {attachment.type === 'video' && '🎥'}
                        {attachment.type === 'document' && '📄'}
                        {attachment.type === 'link' && '🔗'}
                      </span>
                      <span className="course-review__attachment-name">
                        {attachment.name}
                      </span>
                      {attachment.size && (
                        <span className="course-review__attachment-size">
                          {attachment.size}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions et utilité */}
        <div className="course-review__footer">
          {review.helpfulness && (
            <div className="course-review__helpfulness">
              <span className="course-review__helpfulness-text">
                Cet avis est-il utile ?
              </span>
              <div className="course-review__helpfulness-buttons">
                <button
                  type="button"
                  className="course-review__helpfulness-btn course-review__helpfulness-btn--yes"
                  onClick={() => handleHelpfulnessVote(review.id, true)}
                  disabled={states.voting.has(review.id)}
                >
                  👍 Oui ({review.helpfulness.helpful})
                </button>
                <button
                  type="button"
                  className="course-review__helpfulness-btn course-review__helpfulness-btn--no"
                  onClick={() => handleHelpfulnessVote(review.id, false)}
                  disabled={states.voting.has(review.id)}
                >
                  👎 Non ({review.helpfulness.notHelpful})
                </button>
              </div>
              <div className="course-review__helpfulness-percentage">
                {review.helpfulness.helpfulnessPercentage}% find this helpful
              </div>
            </div>
          )}

          <div className="course-review__actions">
            {actions.replyToReview?.enabled && (
              <button
                type="button"
                className="course-review__action-btn"
                onClick={() => handleReplyToReview(review.id)}
              >
                💬 Répondre
              </button>
            )}
            
            {actions.reportReview?.enabled && (
              <button
                type="button"
                className="course-review__action-btn"
                onClick={() => handleReportReview(review.id)}
              >
                🚩 Signaler
              </button>
            )}
          </div>
        </div>

        {/* Réponses */}
        {defaultDisplay.showReplies && review.replies && review.replies.length > 0 && (
          <div className="course-review__replies">
            <h5 className="course-review__replies-title">
              Réponses ({review.replies.length})
            </h5>
            <div className="course-review__replies-list">
              {review.replies.map(reply => (
                <div key={reply.id} className="course-review__reply">
                  <div className="course-review__reply-header">
                    {reply.author.avatar && (
                      <img
                        src={reply.author.avatar}
                        alt={`Avatar de ${reply.author.name}`}
                        className="course-review__reply-author-avatar"
                      />
                    )}
                    <div className="course-review__reply-author-info">
                      <span className="course-review__reply-author-name">
                        {reply.author.name}
                      </span>
                      <span className="course-review__reply-author-role">
                        {reply.author.role === 'instructor' ? 'Instructeur' :
                         reply.author.role === 'moderator' ? 'Modérateur' :
                         reply.author.role === 'student' ? 'Étudiant' : reply.author.role}
                      </span>
                      <span className="course-review__reply-date">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="course-review__reply-content">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Statistiques */}
      {renderStatistics()}

      {/* Filtres */}
      {renderFilters()}

      {/* Liste des avis */}
      <div className="course-review__list">
        {filteredAndSortedReviews.map(renderReview)}
      </div>

      {/* Charger plus */}
      {actions.loadMore?.enabled && actions.loadMore.hasMore && (
        <div className="course-review__load-more">
          <button
            type="button"
            className="course-review__load-more-btn"
            onClick={actions.loadMore.onLoadMore}
            disabled={states.loading}
          >
            {states.loading ? 'Chargement...' : 'Charger plus d\'avis'}
          </button>
        </div>
      )}

      {/* Message si aucun avis */}
      {filteredAndSortedReviews.length === 0 && (
        <div className="course-review__empty">
          <p>Aucun avis trouvé avec les filtres actuels.</p>
        </div>
      )}

      {/* Modal de signalement */}
      {states.reportModalOpen && (
        <div className="course-review__modal">
          <div className="course-review__modal-content">
            <h3>Signaler cet avis</h3>
            <p>Pourquoi souhaitez-vous signaler cet avis ?</p>
            <div className="course-review__report-options">
              <button
                type="button"
                className="course-review__report-option"
                onClick={() => {
                  if (states.reportedReviewId && actions.reportReview?.onReport) {
                    actions.reportReview.onReport(states.reportedReviewId, 'inappropriate');
                  }
                  closeModals();
                }}
              >
                Contenu inapproprié
              </button>
              <button
                type="button"
                className="course-review__report-option"
                onClick={() => {
                  if (states.reportedReviewId && actions.reportReview?.onReport) {
                    actions.reportReview.onReport(states.reportedReviewId, 'spam');
                  }
                  closeModals();
                }}
              >
                Spam
              </button>
              <button
                type="button"
                className="course-review__report-option"
                onClick={() => {
                  if (states.reportedReviewId && actions.reportReview?.onReport) {
                    actions.reportReview.onReport(states.reportedReviewId, 'fake');
                  }
                  closeModals();
                }}
              >
                Faux avis
              </button>
            </div>
            <button
              type="button"
              className="course-review__modal-cancel"
              onClick={closeModals}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {states.replyModalOpen && (
        <div className="course-review__modal">
          <div className="course-review__modal-content">
            <h3>Répondre à cet avis</h3>
            <textarea
              value={states.replyContent}
              onChange={(e) => setStates(prev => ({ ...prev, replyContent: e.target.value }))}
              placeholder="Votre réponse..."
              className="course-review__reply-textarea"
              rows={4}
            />
            <div className="course-review__modal-actions">
              <button
                type="button"
                className="course-review__modal-submit"
                onClick={handleReplySubmit}
                disabled={!states.replyContent.trim()}
              >
                Publier la réponse
              </button>
              <button
                type="button"
                className="course-review__modal-cancel"
                onClick={closeModals}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReview;