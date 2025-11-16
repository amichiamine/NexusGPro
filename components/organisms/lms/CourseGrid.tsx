import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import CourseCard, { CourseCardProps } from './CourseCard';
import './CourseGrid.css';

export interface CourseData extends CourseCardProps {
  /** Identifiant unique du cours */
  id: string;
  /** Slug URL du cours */
  slug: string;
  /** État d'indexation pour les moteurs de recherche */
  indexed?: boolean;
}

export interface GridLayout {
  columns: {
    xs?: number;    // Mobile (< 480px)
    sm?: number;    // Small (480px+)
    md?: number;    // Medium (768px+)
    lg?: number;    // Large (1024px+)
    xl?: number;    // Extra large (1280px+)
  };
  gap?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  autoFit?: boolean;
  minColumnWidth?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CourseGridProps {
  /** Liste des cours à afficher */
  courses: CourseData[];
  /** Layout de la grille */
  layout?: GridLayout;
  /** Variante d'affichage des cartes */
  cardVariant?: CourseCardProps['variant'];
  /** Taille des cartes */
  cardSize?: CourseCardProps['size'];
  /** Orientation des cartes */
  cardOrientation?: CourseCardProps['orientation'];
  /** Afficher en mode liste au lieu de grille */
  listMode?: boolean;
  /** Activation du scroll infini */
  infiniteScroll?: boolean;
  /** Pagination */
  pagination?: PaginationInfo | boolean;
  /** Callback de changement de page */
  onPageChange?: (page: number) => void;
  /** Callback de scroll infini (charge plus d'éléments) */
  onLoadMore?: () => void;
  /** Chargement en cours */
  loading?: boolean;
  /** Message de chargement */
  loadingMessage?: string;
  /** Nombre d'éléments de skeleton à afficher pendant le chargement */
  loadingSkeletonCount?: number;
  /** État vide */
  empty?: boolean;
  /** Message d'état vide */
  emptyMessage?: string;
  /** Titre de l'état vide */
  emptyTitle?: string;
  /** Action pour l'état vide */
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  /** Message d'erreur */
  error?: string;
  /** Action de retry pour les erreurs */
  onRetry?: () => void;
  /** Afficher les statistiques */
  showStats?: boolean;
  /** Statistiques personnalisées */
  stats?: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageRating: number;
  };
  /** Options de tri */
  sortOptions?: {
    value: string;
    label: string;
    direction?: 'asc' | 'desc';
  }[];
  /** Tri actuellement appliqué */
  currentSort?: string;
  /** Callback de tri */
  onSortChange?: (sortValue: string) => void;
  /** Options de vue */
  viewOptions?: {
    value: string;
    label: string;
    icon: string;
  }[];
  /** Vue actuellement sélectionnée */
  currentView?: string;
  /** Callback de changement de vue */
  onViewChange?: (viewValue: string) => void;
  /** Filtres appliqués */
  appliedFilters?: { [key: string]: any };
  /** Callback de clic sur cours */
  onCourseClick?: (course: CourseData) => void;
  /** Callback de focus sur cours */
  onCourseFocus?: (course: CourseData) => void;
  /** Callback d'inscription */
  onEnroll?: (courseId: string) => void;
  /** Callback d'ajout aux favoris */
  onAddToWishlist?: (courseId: string) => void;
  /** Callback de preview */
  onPreview?: (courseId: string) => void;
  /** Callback de partage */
  onShare?: (courseId: string) => void;
  /** Callback de téléchargement du syllabus */
  onDownloadSyllabus?: (courseId: string) => void;
  /** Hauteur maximale avant scroll (pour mode liste) */
  maxHeight?: string;
  /** Afficher la pagination au-dessus */
  showTopPagination?: boolean;
  /** Afficher la pagination en-dessous */
  showBottomPagination?: boolean;
  /** Classes CSS personnalisées */
  className?: string;
}

export interface CourseGridStates {
  /** Vue actuelle */
  currentView: 'grid' | 'list';
  /** Page actuelle */
  currentPage: number;
  /** Chargement de nouveaux éléments */
  loadingMore: boolean;
  /** Position de scroll */
  scrollPosition: number;
  /** Éléments visibles */
  visibleItems: Set<number>;
  /** Intersection observer pour le scroll infini */
  loadMoreTrigger: HTMLDivElement | null;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  layout = {
    columns: { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
    gap: { xs: '12px', sm: '16px', md: '20px', lg: '24px', xl: '24px' },
    minColumnWidth: '280px'
  },
  cardVariant = 'default',
  cardSize = 'medium',
  cardOrientation = 'vertical',
  listMode = false,
  infiniteScroll = false,
  pagination = false,
  onPageChange,
  onLoadMore,
  loading = false,
  loadingMessage = 'Chargement des cours...',
  loadingSkeletonCount = 8,
  empty = false,
  emptyMessage = 'Aucun cours trouvé',
  emptyTitle = 'Aucun cours disponible',
  emptyAction,
  error,
  onRetry,
  showStats = false,
  stats,
  sortOptions = [],
  currentSort,
  onSortChange,
  viewOptions = [],
  currentView,
  onViewChange,
  appliedFilters,
  onCourseClick,
  onCourseFocus,
  onEnroll,
  onAddToWishlist,
  onPreview,
  onShare,
  onDownloadSyllabus,
  maxHeight = '600px',
  showTopPagination = true,
  showBottomPagination = true,
  className = ''
}) => {
  // État local du composant
  const [states, setStates] = useState<CourseGridStates>({
    currentView: currentView === 'list' ? 'list' : 'grid',
    currentPage: 1,
    loadingMore: false,
    scrollPosition: 0,
    visibleItems: new Set(),
    loadMoreTrigger: null
  });

  // Effets
  useEffect(() => {
    if (currentView !== undefined) {
      setStates(prev => ({
        ...prev,
        currentView: currentView === 'list' ? 'list' : 'grid'
      }));
    }
  }, [currentView]);

  useEffect(() => {
    if (pagination && typeof pagination === 'object') {
      setStates(prev => ({
        ...prev,
        currentPage: pagination.currentPage
      }));
    }
  }, [pagination]);

  // Gestionnaires d'événements
  const handleViewChange = useCallback((viewValue: string) => {
    const newView = viewValue === 'list' ? 'list' : 'grid';
    setStates(prev => ({
      ...prev,
      currentView: newView
    }));

    if (onViewChange) {
      onViewChange(viewValue);
    }
  }, [onViewChange]);

  const handleSortChange = useCallback((sortValue: string) => {
    if (onSortChange) {
      onSortChange(sortValue);
    }
  }, [onSortChange]);

  const handlePageChange = useCallback((page: number) => {
    setStates(prev => ({
      ...prev,
      currentPage: page
    }));

    if (onPageChange) {
      onPageChange(page);
    }

    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onPageChange]);

  const handleLoadMore = useCallback(async () => {
    if (states.loadingMore || !onLoadMore) return;

    setStates(prev => ({
      ...prev,
      loadingMore: true
    }));

    try {
      await onLoadMore();
    } finally {
      setStates(prev => ({
        ...prev,
        loadingMore: false
      }));
    }
  }, [states.loadingMore, onLoadMore]);

  const handleCourseClick = useCallback((courseUrl: string) => {
    const course = courses.find(c => c.courseUrl === courseUrl);
    if (course && onCourseClick) {
      onCourseClick(course);
    }
  }, [courses, onCourseClick]);

  const handleCourseFocus = useCallback((courseUrl: string) => {
    const course = courses.find(c => c.courseUrl === courseUrl);
    if (course && onCourseFocus) {
      onCourseFocus(course);
    }
  }, [courses, onCourseFocus]);

  // Observer pour le scroll infini
  useEffect(() => {
    if (!infiniteScroll || !states.loadMoreTrigger || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !states.loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(states.loadMoreTrigger);

    return () => observer.disconnect();
  }, [infiniteScroll, states.loadMoreTrigger, states.loadingMore, handleLoadMore, onLoadMore]);

  // Configuration de la grille CSS
  const gridStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    if (listMode || states.currentView === 'list') {
      styles.display = 'flex';
      styles.flexDirection = 'column';
      styles.gap = layout.gap?.md || '20px';
    } else if (layout.autoFit) {
      styles.display = 'grid';
      styles.gridTemplateColumns = `repeat(auto-fit, minmax(${layout.minColumnWidth || '280px'}, 1fr))`;
      styles.gap = layout.gap?.md || '20px';
    } else {
      styles.display = 'grid';
      styles.gridTemplateColumns = `
        repeat(${layout.columns.xs || 1}, 1fr)
      `;
      styles.gap = layout.gap?.xs || '12px';
    }

    if (maxHeight) {
      styles.maxHeight = maxHeight;
      styles.overflowY = 'auto';
    }

    return styles;
  }, [layout, listMode, states.currentView, maxHeight]);

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-grid',
    `course-grid--${states.currentView}`,
    {
      'course-grid--list-mode': listMode,
      'course-grid--loading': loading,
      'course-grid--error': error,
      'course-grid--empty': empty,
      'course-grid--infinite': infiniteScroll,
      'course-grid--with-stats': showStats,
    },
    className
  );

  // Fonction de rendu des skeletons
  const renderSkeletons = () => {
    return Array.from({ length: loadingSkeletonCount }, (_, index) => (
      <div key={`skeleton-${index}`} className="course-grid__skeleton">
        <div className="course-grid__skeleton-image" />
        <div className="course-grid__skeleton-content">
          <div className="course-grid__skeleton-title" />
          <div className="course-grid__skeleton-description" />
          <div className="course-grid__skeleton-meta" />
        </div>
      </div>
    ));
  };

  // Fonction de rendu des statistiques
  const renderStats = () => {
    if (!showStats) return null;

    return (
      <div className="course-grid__stats">
        <div className="course-grid__stats-item">
          <span className="course-grid__stats-value">
            {stats?.totalCourses || courses.length}
          </span>
          <span className="course-grid__stats-label">
            Total
          </span>
        </div>
        <div className="course-grid__stats-item">
          <span className="course-grid__stats-value">
            {stats?.completedCourses || 0}
          </span>
          <span className="course-grid__stats-label">
            Terminés
          </span>
        </div>
        <div className="course-grid__stats-item">
          <span className="course-grid__stats-value">
            {stats?.inProgressCourses || 0}
          </span>
          <span className="course-grid__stats-label">
            En cours
          </span>
        </div>
        <div className="course-grid__stats-item">
          <span className="course-grid__stats-value">
            {stats?.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="course-grid__stats-label">
            Note moy.
          </span>
        </div>
      </div>
    );
  };

  // Fonction de rendu de la pagination
  const renderPagination = () => {
    if (!pagination || typeof pagination === 'boolean') return null;

    const paginationInfo = pagination;
    const { currentPage, totalPages, hasNextPage, hasPreviousPage } = paginationInfo;

    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav className="course-grid__pagination" aria-label="Pagination des cours">
        <button
          type="button"
          className="course-grid__pagination-btn"
          disabled={!hasPreviousPage}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Page précédente"
        >
          ‹
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              className="course-grid__pagination-btn"
              onClick={() => handlePageChange(1)}
              aria-label="Première page"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="course-grid__pagination-ellipsis">...</span>
            )}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            type="button"
            className={`course-grid__pagination-btn ${page === currentPage ? 'is-active' : ''}`}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="course-grid__pagination-ellipsis">...</span>
            )}
            <button
              type="button"
              className="course-grid__pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              aria-label="Dernière page"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="course-grid__pagination-btn"
          disabled={!hasNextPage}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Page suivante"
        >
          ›
        </button>
      </nav>
    );
  };

  // Fonction de rendu du trigger de scroll infini
  const renderLoadMoreTrigger = () => {
    if (!infiniteScroll || !onLoadMore) return null;

    return (
      <div
        ref={(el) => setStates(prev => ({ ...prev, loadMoreTrigger: el }))}
        className="course-grid__load-more-trigger"
        aria-hidden="true"
      />
    );
  };

  // État de chargement
  if (loading) {
    return (
      <div className={containerClasses}>
        {showStats && renderStats()}
        
        {showTopPagination && (
          <div className="course-grid__pagination-skeleton" />
        )}

        <div className="course-grid__content" style={gridStyles}>
          {renderSkeletons()}
        </div>

        {showBottomPagination && (
          <div className="course-grid__pagination-skeleton" />
        )}

        <div className="course-grid__loading-message">
          {loadingMessage}
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className={`${containerClasses} course-grid--error`}>
        <div className="course-grid__error">
          <div className="course-grid__error-icon">⚠️</div>
          <div className="course-grid__error-content">
            <h3 className="course-grid__error-title">
              Erreur de chargement
            </h3>
            <p className="course-grid__error-message">
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                className="course-grid__error-retry"
                onClick={onRetry}
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // État vide
  if (empty || courses.length === 0) {
    return (
      <div className={`${containerClasses} course-grid--empty`}>
        <div className="course-grid__empty-state">
          <div className="course-grid__empty-icon">📚</div>
          <h3 className="course-grid__empty-title">
            {emptyTitle}
          </h3>
          <p className="course-grid__empty-message">
            {emptyMessage}
          </p>
          {emptyAction && (
            <button
              type="button"
              className="course-grid__empty-action"
              onClick={emptyAction.onClick}
            >
              {emptyAction.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header avec statistiques et contrôles */}
      {showStats && renderStats()}

      {/* Pagination supérieure */}
      {showTopPagination && renderPagination()}

      {/* Contenu de la grille */}
      <div className="course-grid__content" style={gridStyles}>
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            {...course}
            variant={listMode || states.currentView === 'list' ? 'detailed' : cardVariant}
            size={cardSize}
            orientation={cardOrientation}
            onClick={handleCourseClick}
            onFocus={handleCourseFocus}
            quickActions={{
              ...course.quickActions,
              enroll: course.quickActions?.enroll && onEnroll ? {
                ...course.quickActions.enroll,
                onClick: onEnroll
              } : undefined,
              addToWishlist: course.quickActions?.addToWishlist && onAddToWishlist ? {
                ...course.quickActions.addToWishlist,
                onClick: onAddToWishlist
              } : undefined,
              preview: course.quickActions?.preview && onPreview ? {
                ...course.quickActions.preview,
                onClick: onPreview
              } : undefined,
              share: course.quickActions?.share && onShare ? {
                ...course.quickActions.share,
                onClick: onShare
              } : undefined,
              downloadSyllabus: course.quickActions?.downloadSyllabus && onDownloadSyllabus ? {
                ...course.quickActions.downloadSyllabus,
                onClick: onDownloadSyllabus
              } : undefined
            }}
          />
        ))}

        {/* Trigger pour le scroll infini */}
        {renderLoadMoreTrigger()}
      </div>

      {/* Indicateur de chargement supplémentaire */}
      {infiniteScroll && states.loadingMore && (
        <div className="course-grid__loading-more">
          <div className="course-grid__loading-spinner" />
          <span className="course-grid__loading-more-text">
            Chargement d'autres cours...
          </span>
        </div>
      )}

      {/* Pagination inférieure */}
      {showBottomPagination && renderPagination()}

      {/* Informations de filtrage */}
      {appliedFilters && Object.keys(appliedFilters).length > 0 && (
        <div className="course-grid__filters-info">
          <span className="course-grid__filters-count">
            {courses.length} cours affichés
          </span>
          <button
            type="button"
            className="course-grid__filters-clear"
            onClick={() => {
              // Logique pour nettoyer les filtres
            }}
          >
            Effacer les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;