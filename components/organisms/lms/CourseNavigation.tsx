import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import './CourseNavigation.css';

export interface NavigationItem {
  /** Identifiant unique */
  id: string;
  /** Titre de la section */
  title: string;
  /** Type de contenu */
  type: 'section' | 'lesson' | 'quiz' | 'assignment' | 'resource' | 'discussion';
  /** URL ou ancre */
  href?: string;
  /** Durée estimée */
  duration?: number; // en minutes
  /** Statut de completion */
  status?: 'not-started' | 'in-progress' | 'completed' | 'locked';
  /** Priorité d'affichage */
  priority?: number;
  /** Icône */
  icon?: string;
  /** Badge ou label spécial */
  badge?: string;
  /** Description courte */
  description?: string;
  /** Vidéo preview disponible */
  hasPreview?: boolean;
  /** Fichier attaché */
  attachments?: {
    name: string;
    url: string;
    type: 'pdf' | 'video' | 'audio' | 'document' | 'image' | 'archive';
    size?: string;
  }[];
  /** Sous-éléments */
  children?: NavigationItem[];
  /** Métadonnées personnalisées */
  metadata?: {
    [key: string]: any;
  };
}

export interface CourseNavigationProps {
  /** Structure de navigation */
  items: NavigationItem[];
  /** Item actuellement actif */
  activeItem?: string;
  /** Item précédemment consulté */
  previousItem?: string;
  /** Progression globale du cours */
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  /** Mode d'affichage */
  variant?: 'sidebar' | 'top' | 'bottom' | 'floating';
  /** Position pour mode flottant */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Configuration de la sidebar */
  sidebarConfig?: {
    /** Largeur de la sidebar */
    width?: string;
    /** Mode collapsible */
    collapsible?: boolean;
    /** État initial ouvert */
    defaultOpen?: boolean;
    /** Masquer sur mobile */
    hideOnMobile?: boolean;
    /** Animation d'ouverture */
    animate?: boolean;
  };
  /** Configuration de la navigation horizontale */
  horizontalConfig?: {
    /** Afficher les indicateurs de progression */
    showProgress?: boolean;
    /** Afficher la durée */
    showDuration?: boolean;
    /** Afficher les icônes */
    showIcons?: boolean;
    /** Mode scrollable */
    scrollable?: boolean;
    /** Alignement */
    alignment?: 'start' | 'center' | 'end';
  };
  /** Actions disponibles */
  actions?: {
    /** Marquer comme terminé */
    markCompleted?: {
      enabled: boolean;
      onClick: (itemId: string) => void;
    };
    /** Marquer comme en cours */
    markInProgress?: {
      enabled: boolean;
      onClick: (itemId: string) => void;
    };
    /** Ouvrir en nouvelle page */
    openInNewTab?: {
      enabled: boolean;
      onClick: (itemId: string, href: string) => void;
    };
    /** Télécharger les ressources */
    downloadResources?: {
      enabled: boolean;
      onClick: (itemId: string) => void;
    };
    /** Note personnelle */
    addNote?: {
      enabled: boolean;
      onClick: (itemId: string) => void;
    };
  };
  /** Filtres */
  filters?: {
    /** Types à afficher */
    showTypes?: NavigationItem['type'][];
    /** Masquer les éléments terminés */
    hideCompleted?: boolean;
    /** Masquer les éléments verrouillés */
    hideLocked?: boolean;
    /** Rechercher */
    searchQuery?: string;
    /** Filtrer par statut */
    statusFilter?: NavigationItem['status'][];
  };
  /** Callbacks */
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem) => void;
  onProgressUpdate?: (progress: { completed: number; total: number; percentage: number }) => void;
  onToggleSidebar?: (isOpen: boolean) => void;
  /** Classes CSS */
  className?: string;
}

export interface CourseNavigationStates {
  /** Sidebar ouverte (mode sidebar) */
  sidebarOpen: boolean;
  /** Items expandés */
  expandedItems: Set<string>;
  /** Item survolé */
  hoveredItem: string | null;
  /** Filtres actifs */
  activeFilters: {
    search: string;
    types: NavigationItem['type'][];
    status: NavigationItem['status'][];
    hideCompleted: boolean;
    hideLocked: boolean;
  };
  /** Loading state */
  loading: boolean;
  /** Scroll position (navigation horizontale) */
  scrollPosition: number;
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({
  items,
  activeItem,
  previousItem,
  progress,
  variant = 'sidebar',
  position = 'bottom-right',
  sidebarConfig = {},
  horizontalConfig = {},
  actions = {},
  filters = {},
  onItemClick,
  onItemHover,
  onProgressUpdate,
  onToggleSidebar,
  className = ''
}) => {
  // Configuration par défaut
  const defaultSidebarConfig = {
    width: '300px',
    collapsible: true,
    defaultOpen: true,
    hideOnMobile: false,
    animate: true,
    ...sidebarConfig
  };

  const defaultHorizontalConfig = {
    showProgress: true,
    showDuration: true,
    showIcons: true,
    scrollable: true,
    alignment: 'start',
    ...horizontalConfig
  };

  // État local du composant
  const [states, setStates] = useState<CourseNavigationStates>({
    sidebarOpen: defaultSidebarConfig.defaultOpen,
    expandedItems: new Set(),
    hoveredItem: null,
    activeFilters: {
      search: filters.searchQuery || '',
      types: filters.showTypes || [],
      status: filters.statusFilter || [],
      hideCompleted: filters.hideCompleted || false,
      hideLocked: filters.hideLocked || false
    },
    loading: false,
    scrollPosition: 0
  });

  // Effets
  useEffect(() => {
    if (sidebarConfig.defaultOpen !== undefined) {
      setStates(prev => ({
        ...prev,
        sidebarOpen: sidebarConfig.defaultOpen
      }));
    }
  }, [sidebarConfig.defaultOpen]);

  // Gestionnaires d'événements
  const toggleSidebar = useCallback(() => {
    const newOpenState = !states.sidebarOpen;
    setStates(prev => ({
      ...prev,
      sidebarOpen: newOpenState
    }));

    if (onToggleSidebar) {
      onToggleSidebar(newOpenState);
    }
  }, [states.sidebarOpen, onToggleSidebar]);

  const toggleItemExpansion = useCallback((itemId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return {
        ...prev,
        expandedItems: newExpanded
      };
    });
  }, []);

  const handleItemHover = useCallback((item: NavigationItem) => {
    setStates(prev => ({
      ...prev,
      hoveredItem: item.id
    }));

    if (onItemHover) {
      onItemHover(item);
    }
  }, [onItemHover]);

  const handleItemLeave = useCallback(() => {
    setStates(prev => ({
      ...prev,
      hoveredItem: null
    }));
  }, []);

  const handleItemClick = useCallback((item: NavigationItem) => {
    // Vérifier si l'élément est verrouillé
    if (item.status === 'locked') return;

    // Exécuter l'action de l'élément
    if (onItemClick) {
      onItemClick(item);
    }

    // Ouvrir en nouvelle page si configuré
    if (actions.openInNewTab?.enabled && item.href && item.id !== activeItem) {
      actions.openInNewTab.onClick(item.id, item.href);
      return;
    }
  }, [onItemClick, actions.openInNewTab, activeItem]);

  const handleMarkCompleted = useCallback((itemId: string) => {
    if (actions.markCompleted?.onClick) {
      actions.markCompleted.onClick(itemId);
    }
  }, [actions.markCompleted]);

  const handleMarkInProgress = useCallback((itemId: string) => {
    if (actions.markInProgress?.onClick) {
      actions.markInProgress.onClick(itemId);
    }
  }, [actions.markInProgress]);

  const handleDownloadResources = useCallback((itemId: string) => {
    if (actions.downloadResources?.onClick) {
      actions.downloadResources.onClick(itemId);
    }
  }, [actions.downloadResources]);

  const handleAddNote = useCallback((itemId: string) => {
    if (actions.addNote?.onClick) {
      actions.addNote.onClick(itemId);
    }
  }, [actions.addNote]);

  // Utilitaires
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getStatusIcon = (status?: NavigationItem['status']): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '⏳';
      case 'locked':
        return '🔒';
      default:
        return '⭕';
    }
  };

  const getTypeIcon = (type: NavigationItem['type']): string => {
    switch (type) {
      case 'section':
        return '📁';
      case 'lesson':
        return '🎥';
      case 'quiz':
        return '❓';
      case 'assignment':
        return '📝';
      case 'resource':
        return '📎';
      case 'discussion':
        return '💬';
      default:
        return '📄';
    }
  };

  // Filtrage des éléments
  const filteredItems = useMemo(() => {
    const filterRecursive = (items: NavigationItem[]): NavigationItem[] => {
      return items.filter(item => {
        // Filtre par recherche
        if (states.activeFilters.search && 
            !item.title.toLowerCase().includes(states.activeFilters.search.toLowerCase()) &&
            !item.description?.toLowerCase().includes(states.activeFilters.search.toLowerCase())) {
          return false;
        }

        // Filtre par type
        if (states.activeFilters.types.length > 0 && 
            !states.activeFilters.types.includes(item.type)) {
          return false;
        }

        // Filtre par statut
        if (states.activeFilters.status.length > 0 && 
            item.status && !states.activeFilters.status.includes(item.status)) {
          return false;
        }

        // Masquer les éléments terminés
        if (states.activeFilters.hideCompleted && item.status === 'completed') {
          return false;
        }

        // Masquer les éléments verrouillés
        if (states.activeFilters.hideLocked && item.status === 'locked') {
          return false;
        }

        return true;
      }).map(item => ({
        ...item,
        children: item.children ? filterRecursive(item.children) : []
      }));
    };

    return filterRecursive(items);
  }, [items, states.activeFilters]);

  // Calcul de la progression
  const calculatedProgress = useMemo(() => {
    const countItems = (items: NavigationItem[]): { completed: number; total: number } => {
      let completed = 0;
      let total = 0;

      for (const item of items) {
        if (item.type !== 'section') {
          total++;
          if (item.status === 'completed') {
            completed++;
          }
        }

        if (item.children) {
          const childProgress = countItems(item.children);
          completed += childProgress.completed;
          total += childProgress.total;
        }
      }

      return { completed, total };
    };

    const { completed, total } = countItems(filteredItems);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [filteredItems]);

  // Synchroniser la progression avec les props
  useEffect(() => {
    if (onProgressUpdate && 
        (progress?.completed !== calculatedProgress.completed ||
         progress?.total !== calculatedProgress.total ||
         progress?.percentage !== calculatedProgress.percentage)) {
      onProgressUpdate(calculatedProgress);
    }
  }, [calculatedProgress, progress, onProgressUpdate]);

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-navigation',
    `course-navigation--${variant}`,
    `course-navigation--${position}`,
    {
      'course-navigation--collapsed': !defaultSidebarConfig.defaultOpen,
      'course-navigation--open': states.sidebarOpen,
      'course-navigation--loading': states.loading,
    },
    className
  );

  // Composant de rendu d'un élément
  const renderNavigationItem = (item: NavigationItem, level: number = 0): React.ReactNode => {
    const isExpanded = states.expandedItems.has(item.id);
    const isActive = item.id === activeItem;
    const isPrevious = item.id === previousItem;
    const isHovered = states.hoveredItem === item.id;
    const hasChildren = item.children && item.children.length > 0;

    const itemClasses = cn(
      'course-navigation__item',
      `course-navigation__item--${item.type}`,
      `course-navigation__item--level-${level}`,
      {
        'is-active': isActive,
        'is-previous': isPrevious,
        'is-hovered': isHovered,
        'has-children': hasChildren,
        'is-child': level > 0,
      },
      item.status && `is-${item.status}`
    );

    return (
      <div key={item.id} className={itemClasses}>
        <div
          className="course-navigation__item-content"
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => handleItemHover(item)}
          onMouseLeave={handleItemLeave}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {/* Indicateur de statut */}
          <span 
            className="course-navigation__status-icon"
            aria-label={`Statut: ${item.status || 'non commencé'}`}
          >
            {getStatusIcon(item.status)}
          </span>

          {/* Icône du type */}
          {defaultHorizontalConfig.showIcons && (
            <span className="course-navigation__type-icon" aria-hidden="true">
              {item.icon || getTypeIcon(item.type)}
            </span>
          )}

          {/* Titre */}
          <span className="course-navigation__item-title">
            {item.title}
          </span>

          {/* Badge */}
          {item.badge && (
            <span className="course-navigation__item-badge">
              {item.badge}
            </span>
          )}

          {/* Durée */}
          {defaultHorizontalConfig.showDuration && item.duration && (
            <span className="course-navigation__item-duration">
              {formatDuration(item.duration)}
            </span>
          )}

          {/* Aperçu disponible */}
          {item.hasPreview && (
            <span className="course-navigation__preview-indicator" title="Aperçu disponible">
              👁️
            </span>
          )}

          {/* Actions rapides (survol) */}
          {isHovered && (
            <div className="course-navigation__item-actions">
              {actions.markCompleted?.enabled && item.status !== 'completed' && (
                <button
                  type="button"
                  className="course-navigation__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkCompleted(item.id);
                  }}
                  title="Marquer comme terminé"
                >
                  ✅
                </button>
              )}

              {actions.addNote?.enabled && (
                <button
                  type="button"
                  className="course-navigation__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddNote(item.id);
                  }}
                  title="Ajouter une note"
                >
                  📝
                </button>
              )}

              {actions.downloadResources?.enabled && item.attachments && item.attachments.length > 0 && (
                <button
                  type="button"
                  className="course-navigation__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadResources(item.id);
                  }}
                  title="Télécharger les ressources"
                >
                  📥
                </button>
              )}
            </div>
          )}

          {/* Toggle pour les enfants */}
          {hasChildren && (
            <button
              type="button"
              className={`course-navigation__toggle ${isExpanded ? 'is-expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleItemExpansion(item.id);
              }}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Réduire' : 'Développer'} ${item.title}`}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>

        {/* Enfants */}
        {hasChildren && isExpanded && (
          <div className="course-navigation__children">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Rendu selon le mode
  if (variant === 'sidebar') {
    return (
      <>
        {/* Overlay pour mobile */}
        {defaultSidebarConfig.hideOnMobile && states.sidebarOpen && (
          <div 
            className="course-navigation__overlay"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        <aside className={containerClasses}>
          {/* Header de la sidebar */}
          <div className="course-navigation__header">
            <h2 className="course-navigation__title">Navigation du cours</h2>
            
            {defaultSidebarConfig.collapsible && (
              <button
                type="button"
                className="course-navigation__collapse-btn"
                onClick={toggleSidebar}
                aria-label={states.sidebarOpen ? 'Réduire la navigation' : 'Étendre la navigation'}
              >
                {states.sidebarOpen ? '←' : '→'}
              </button>
            )}
          </div>

          {/* Progression globale */}
          {defaultHorizontalConfig.showProgress && (
            <div className="course-navigation__progress">
              <div className="course-navigation__progress-header">
                <span>Progression</span>
                <span>{calculatedProgress.percentage}%</span>
              </div>
              <div className="course-navigation__progress-bar">
                <div
                  className="course-navigation__progress-fill"
                  style={{ width: `${calculatedProgress.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={calculatedProgress.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="course-navigation__progress-stats">
                <span>{calculatedProgress.completed} / {calculatedProgress.total} complétés</span>
              </div>
            </div>
          )}

          {/* Liste des éléments */}
          <nav className="course-navigation__list" role="navigation" aria-label="Navigation du cours">
            {filteredItems.map(item => renderNavigationItem(item))}
          </nav>
        </aside>
      </>
    );
  }

  // Navigation horizontale (top/bottom)
  return (
    <nav 
      className={containerClasses}
      role="navigation" 
      aria-label={`Navigation ${variant === 'top' ? 'supérieure' : 'inférieure'} du cours`}
    >
      {/* Progression */}
      {defaultHorizontalConfig.showProgress && (
        <div className="course-navigation__progress-inline">
          <div className="course-navigation__progress-bar">
            <div
              className="course-navigation__progress-fill"
              style={{ width: `${calculatedProgress.percentage}%` }}
            />
          </div>
          <span className="course-navigation__progress-text">
            {calculatedProgress.percentage}% ({calculatedProgress.completed}/{calculatedProgress.total})
          </span>
        </div>
      )}

      {/* Liste horizontale */}
      <div 
        className={`course-navigation__horizontal-list course-navigation__horizontal-list--${defaultHorizontalConfig.alignment}`}
        style={{
          overflowX: defaultHorizontalConfig.scrollable ? 'auto' : 'visible',
          scrollBehavior: 'smooth'
        }}
      >
        {filteredItems.map(item => (
          <button
            key={item.id}
            type="button"
            className={`course-navigation__horizontal-item ${item.id === activeItem ? 'is-active' : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => handleItemHover(item)}
            onMouseLeave={handleItemLeave}
            disabled={item.status === 'locked'}
            title={`${item.title}${item.duration ? ` (${formatDuration(item.duration)})` : ''}`}
          >
            {defaultHorizontalConfig.showIcons && (
              <span className="course-navigation__type-icon">
                {getStatusIcon(item.status)}
              </span>
            )}
            <span className="course-navigation__item-title">
              {item.title}
            </span>
            {defaultHorizontalConfig.showDuration && item.duration && (
              <span className="course-navigation__item-duration">
                {formatDuration(item.duration)}
              </span>
            )}
            {item.badge && (
              <span className="course-navigation__item-badge">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CourseNavigation;