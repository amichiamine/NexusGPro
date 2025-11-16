import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import './CourseSidebar.css';

export interface SidebarSection {
  /** Identifiant unique */
  id: string;
  /** Titre de la section */
  title: string;
  /** Type de section */
  type: 'progress' | 'info' | 'resources' | 'discussion' | 'tools' | 'navigation';
  /** Contenu */
  content?: {
    /** Texte ou HTML */
    text?: string;
    /** Liste d'éléments */
    items?: Array<{
      id: string;
      label: string;
      value?: string | number;
      icon?: string;
      badge?: string;
      href?: string;
      onClick?: () => void;
      disabled?: boolean;
      active?: boolean;
    }>;
    /** Statut */
    status?: 'completed' | 'in-progress' | 'locked' | 'available';
    /** Progression */
    progress?: number;
    /** URL d'action */
    action?: {
      label: string;
      href?: string;
      onClick?: () => void;
      variant?: 'primary' | 'secondary' | 'outline';
    };
  };
  /** Configuration d'affichage */
  display?: {
    /** Masquer le titre */
    hideTitle?: boolean;
    /** Collapsible */
    collapsible?: boolean;
    /** État initial ouvert */
    defaultOpen?: boolean;
    /** Badge d'état */
    badge?: string;
    /** Icône */
    icon?: string;
    /** Couleur de thème */
    themeColor?: string;
  };
  /** Ordre d'affichage */
  order?: number;
  /** Classes CSS */
  className?: string;
}

export interface SidebarResource {
  /** Identifiant unique */
  id: string;
  /** Nom du fichier */
  name: string;
  /** URL de téléchargement */
  url: string;
  /** Type de fichier */
  type: 'pdf' | 'doc' | 'video' | 'audio' | 'image' | 'archive' | 'link';
  /** Taille du fichier */
  size?: string;
  /** Description */
  description?: string;
  /** Date d'ajout */
  addedDate?: string;
  /** Téléchargements */
  downloadCount?: number;
  /** Accessible sans inscription */
  public?: boolean;
  /** Icône */
  icon?: string;
}

export interface SidebarNote {
  /** Identifiant unique */
  id: string;
  /** Contenu de la note */
  content: string;
  /** Timestamp */
  timestamp: string;
  /** Position dans la vidéo (si applicable) */
  videoTimestamp?: number;
  /** Nom de la leçon */
  lessonTitle?: string;
  /** Privée ou partagée */
  isPrivate?: boolean;
  /** Tags */
  tags?: string[];
}

export interface SidebarBookmark {
  /** Identifiant unique */
  id: string;
  /** Titre du bookmark */
  title: string;
  /** URL ou ancre */
  url?: string;
  /** Position dans la vidéo */
  videoTimestamp?: number;
  /** Chapitre/section */
  chapter?: string;
  /** Description */
  description?: string;
  /** Date de création */
  createdAt: string;
  /** Type */
  type?: 'video' | 'document' | 'link' | 'quiz';
}

export interface CourseSidebarProps {
  /** Sections de la sidebar */
  sections: SidebarSection[];
  /** Ressources disponibles */
  resources?: SidebarResource[];
  /** Notes personnelles */
  notes?: SidebarNote[];
  /** Signets */
  bookmarks?: SidebarBookmark[];
  /** Configuration de la sidebar */
  config?: {
    /** Mode compact */
    compact?: boolean;
    /** Largeur fixe */
    fixedWidth?: boolean;
    /** Largeur personnalisée */
    customWidth?: string;
    /** Mode overlay (mobile) */
    overlay?: boolean;
    /** Position */
    position?: 'left' | 'right';
    /** État initial ouvert */
    defaultOpen?: boolean;
    /** Auto-cacher sur mobile */
    autoHideOnMobile?: boolean;
    /** Animation d'ouverture */
    animated?: boolean;
    /** Masquer en mode plein écran */
    hideOnFullscreen?: boolean;
  };
  /** Actions disponibles */
  actions?: {
    /** Ajouter une note */
    addNote?: {
      enabled: boolean;
      onAdd: (content: string, timestamp?: number) => void;
    };
    /** Ajouter un signet */
    addBookmark?: {
      enabled: boolean;
      onAdd: (title: string, url?: string, timestamp?: number) => void;
    };
    /** Télécharger une ressource */
    downloadResource?: {
      enabled: boolean;
      onDownload: (resourceId: string) => void;
    };
    /** Partager une note */
    shareNote?: {
      enabled: boolean;
      onShare: (noteId: string) => void;
    };
    /** Supprimer un élément */
    deleteItem?: {
      enabled: boolean;
      onDelete: (type: 'note' | 'bookmark', id: string) => void;
    };
    /** Éditer un élément */
    editItem?: {
      enabled: boolean;
      onEdit: (type: 'note' | 'bookmark', id: string) => void;
    };
    /** Basculer le mode plein écran */
    toggleFullscreen?: {
      enabled: boolean;
      onToggle: (isFullscreen: boolean) => void;
    };
  };
  /** État actuel */
  currentState?: {
    /** Leçon actuelle */
    currentLesson?: {
      id: string;
      title: string;
      duration?: number;
      completed?: boolean;
      progress?: number;
    };
    /** Progression du cours */
    courseProgress?: number;
    /** Position dans la vidéo */
    videoTimestamp?: number;
    /** Durée totale de la vidéo */
    videoDuration?: number;
    /** Mode plein écran */
    isFullscreen?: boolean;
    /** Sidebar ouverte */
    isOpen?: boolean;
  };
  /** Callbacks */
  onSectionToggle?: (sectionId: string, isOpen: boolean) => void;
  onResourceClick?: (resource: SidebarResource) => void;
  onNoteClick?: (note: SidebarNote) => void;
  onBookmarkClick?: (bookmark: SidebarBookmark) => void;
  onLessonClick?: (lessonId: string) => void;
  onToggleSidebar?: (isOpen: boolean) => void;
  /** Classes CSS */
  className?: string;
}

export interface CourseSidebarStates {
  /** Sections expandées */
  expandedSections: Set<string>;
  /** Loading states */
  loading: Set<string>;
  /** Sidebar ouverte */
  sidebarOpen: boolean;
  /** Mode plein écran */
  fullscreen: boolean;
  /** Tab active (pour les sections multi-onglets) */
  activeTab: string | null;
  /** Modal ouverts */
  modals: {
    addNote: boolean;
    addBookmark: boolean;
    editNote: boolean;
    editBookmark: boolean;
  };
  /** Éléments en cours d'édition */
  editingItem: {
    type: 'note' | 'bookmark';
    id: string;
  } | null;
  /** Contenu temporaire des modals */
  tempContent: {
    note: string;
    bookmark: string;
    timestamp?: number;
  };
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections = [],
  resources = [],
  notes = [],
  bookmarks = [],
  config = {},
  actions = {},
  currentState = {},
  onSectionToggle,
  onResourceClick,
  onNoteClick,
  onBookmarkClick,
  onLessonClick,
  onToggleSidebar,
  className = ''
}) => {
  // Configuration par défaut
  const defaultConfig = {
    compact: false,
    fixedWidth: true,
    customWidth: '320px',
    overlay: true,
    position: 'right' as const,
    defaultOpen: true,
    autoHideOnMobile: true,
    animated: true,
    hideOnFullscreen: false,
    ...config
  };

  // État local du composant
  const [states, setStates] = useState<CourseSidebarStates>({
    expandedSections: new Set(),
    loading: new Set(),
    sidebarOpen: defaultConfig.defaultOpen,
    fullscreen: false,
    activeTab: null,
    modals: {
      addNote: false,
      addBookmark: false,
      editNote: false,
      editBookmark: false
    },
    editingItem: null,
    tempContent: {
      note: '',
      bookmark: ''
    }
  });

  // Effets
  useEffect(() => {
    if (currentState.isFullscreen !== undefined) {
      setStates(prev => ({
        ...prev,
        fullscreen: currentState.isFullscreen!
      }));
    }
  }, [currentState.isFullscreen]);

  useEffect(() => {
    if (currentState.isOpen !== undefined) {
      setStates(prev => ({
        ...prev,
        sidebarOpen: currentState.isOpen!
      }));
    }
  }, [currentState.isOpen]);

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

  const toggleSection = useCallback((sectionId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedSections);
      const isCurrentlyExpanded = newExpanded.has(sectionId);
      
      if (isCurrentlyExpanded) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }

      return {
        ...prev,
        expandedSections: newExpanded
      };
    });

    if (onSectionToggle) {
      onSectionToggle(sectionId, !states.expandedSections.has(sectionId));
    }
  }, [states.expandedSections, onSectionToggle]);

  const toggleFullscreen = useCallback(() => {
    if (actions.toggleFullscreen?.onToggle) {
      const newFullscreen = !states.fullscreen;
      actions.toggleFullscreen.onToggle(newFullscreen);
      setStates(prev => ({ ...prev, fullscreen: newFullscreen }));
    }
  }, [states.fullscreen, actions.toggleFullscreen]);

  const openModal = useCallback((modalName: keyof typeof states.modals) => {
    setStates(prev => ({
      ...prev,
      modals: { ...prev.modals, [modalName]: true }
    }));
  }, []);

  const closeModals = useCallback(() => {
    setStates(prev => ({
      ...prev,
      modals: {
        addNote: false,
        addBookmark: false,
        editNote: false,
        editBookmark: false
      },
      editingItem: null,
      tempContent: {
        note: '',
        bookmark: ''
      }
    }));
  }, []);

  const handleAddNote = useCallback(() => {
    if (actions.addNote?.onAdd && states.tempContent.note.trim()) {
      actions.addNote.onAdd(states.tempContent.note.trim(), states.tempContent.timestamp);
      closeModals();
    }
  }, [actions.addNote, states.tempContent, closeModals]);

  const handleAddBookmark = useCallback(() => {
    if (actions.addBookmark?.onAdd && states.tempContent.bookmark.trim()) {
      actions.addBookmark.onAdd(states.tempContent.bookmark.trim(), undefined, states.tempContent.timestamp);
      closeModals();
    }
  }, [actions.addBookmark, states.tempContent, closeModals]);

  // Utilitaires
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getResourceIcon = (type: SidebarResource['type']): string => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      case 'archive': return '📦';
      case 'link': return '🔗';
      default: return '📎';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'completed': return 'var(--course-sidebar-success, #10b981)';
      case 'in-progress': return 'var(--course-sidebar-warning, #f59e0b)';
      case 'locked': return 'var(--course-sidebar-muted, #6b7280)';
      default: return 'var(--course-sidebar-accent, #3b82f6)';
    }
  };

  // Filtrage et tri des sections
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });
  }, [sections]);

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-sidebar',
    `course-sidebar--${defaultConfig.position}`,
    {
      'course-sidebar--compact': defaultConfig.compact,
      'course-sidebar--fixed-width': defaultConfig.fixedWidth,
      'course-sidebar--overlay': defaultConfig.overlay,
      'course-sidebar--animated': defaultConfig.animated,
      'course-sidebar--open': states.sidebarOpen,
      'course-sidebar--fullscreen': states.fullscreen,
      'course-sidebar--hidden': currentState.isFullscreen && defaultConfig.hideOnFullscreen,
    },
    className
  );

  // Styles dynamiques
  const sidebarStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    if (defaultConfig.fixedWidth && defaultConfig.customWidth) {
      styles.width = defaultConfig.customWidth;
    }
    
    if (!defaultConfig.animated) {
      styles.transition = 'none';
    }

    return styles;
  }, [defaultConfig]);

  // Rendu du header
  const renderHeader = () => (
    <div className="course-sidebar__header">
      <h2 className="course-sidebar__title">Informations du cours</h2>
      
      <div className="course-sidebar__header-actions">
        {actions.toggleFullscreen?.enabled && (
          <button
            type="button"
            className="course-sidebar__header-action"
            onClick={toggleFullscreen}
            title={states.fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            aria-label="Basculer le plein écran"
          >
            {states.fullscreen ? '🗗' : '🗖'}
          </button>
        )}
        
        <button
          type="button"
          className="course-sidebar__header-action"
          onClick={toggleSidebar}
          title={states.sidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          aria-label="Basculer la sidebar"
        >
          {states.sidebarOpen ? '✕' : defaultConfig.position === 'right' ? '→' : '←'}
        </button>
      </div>
    </div>
  );

  // Rendu d'une section
  const renderSection = (section: SidebarSection) => {
    const isExpanded = states.expandedSections.has(section.id);
    const displayConfig = section.display || {};

    return (
      <div
        key={section.id}
        className={cn(
          'course-sidebar__section',
          `course-sidebar__section--${section.type}`,
          {
            'has-title': !displayConfig.hideTitle,
            'no-title': displayConfig.hideTitle,
          }
        )}
      >
        {!displayConfig.hideTitle && (
          <div className="course-sidebar__section-header">
            <button
              type="button"
              className="course-sidebar__section-title"
              onClick={() => displayConfig.collapsible !== false && toggleSection(section.id)}
              disabled={displayConfig.collapsible === false}
              aria-expanded={displayConfig.collapsible !== false ? isExpanded : undefined}
            >
              <span className="course-sidebar__section-icon" aria-hidden="true">
                {displayConfig.icon || section.display?.icon || '📋'}
              </span>
              <span className="course-sidebar__section-text">
                {section.title}
              </span>
              {displayConfig.badge && (
                <span className="course-sidebar__section-badge">
                  {displayConfig.badge}
                </span>
              )}
              {displayConfig.collapsible !== false && (
                <span className="course-sidebar__section-toggle">
                  {isExpanded ? '−' : '+'}
                </span>
              )}
            </button>
          </div>
        )}

        {(displayConfig.collapsible === false || isExpanded) && (
          <div className="course-sidebar__section-content">
            {section.type === 'progress' && renderProgressSection(section)}
            {section.type === 'info' && renderInfoSection(section)}
            {section.type === 'resources' && renderResourcesSection(section)}
            {section.type === 'discussion' && renderDiscussionSection(section)}
            {section.type === 'tools' && renderToolsSection(section)}
            {section.type === 'navigation' && renderNavigationSection(section)}
          </div>
        )}
      </div>
    );
  };

  // Rendu des sections spécialisées
  const renderProgressSection = (section: SidebarSection) => {
    const progress = section.content?.progress || 0;
    const status = section.content?.status;

    return (
      <div className="course-sidebar__progress">
        <div className="course-sidebar__progress-bar">
          <div
            className="course-sidebar__progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: getStatusColor(status)
            }}
          />
        </div>
        <div className="course-sidebar__progress-text">
          {progress}% complété
          {status && (
            <span className="course-sidebar__progress-status">
              ({status === 'completed' ? 'Terminé' :
                status === 'in-progress' ? 'En cours' :
                status === 'locked' ? 'Verrouillé' : status})
            </span>
          )}
        </div>
        {section.content?.items && (
          <div className="course-sidebar__progress-items">
            {section.content.items.map(item => (
              <div
                key={item.id}
                className={cn(
                  'course-sidebar__progress-item',
                  {
                    'is-active': item.active,
                    'is-disabled': item.disabled,
                  }
                )}
                onClick={!item.disabled ? item.onClick : undefined}
              >
                <span className="course-sidebar__progress-item-icon">
                  {item.icon || '✓'}
                </span>
                <span className="course-sidebar__progress-item-label">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="course-sidebar__progress-item-badge">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInfoSection = (section: SidebarSection) => (
    <div className="course-sidebar__info">
      {section.content?.text && (
        <div className="course-sidebar__info-text">
          {section.content.text}
        </div>
      )}
      {section.content?.items && (
        <div className="course-sidebar__info-items">
          {section.content.items.map(item => (
            <div key={item.id} className="course-sidebar__info-item">
              <span className="course-sidebar__info-label">
                {item.label}:
              </span>
              <span className="course-sidebar__info-value">
                {item.value || item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResourcesSection = (section: SidebarSection) => {
    const displayResources = section.content?.items as SidebarResource[] || resources;

    return (
      <div className="course-sidebar__resources">
        {actions.addNote?.enabled && (
          <button
            type="button"
            className="course-sidebar__add-resource-btn"
            onClick={() => openModal('addNote')}
          >
            + Ajouter une note
          </button>
        )}

        <div className="course-sidebar__resource-list">
          {displayResources.map(resource => (
            <div
              key={resource.id}
              className="course-sidebar__resource-item"
              onClick={() => onResourceClick?.(resource)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onResourceClick?.(resource);
                }
              }}
            >
              <span className="course-sidebar__resource-icon">
                {resource.icon || getResourceIcon(resource.type)}
              </span>
              <div className="course-sidebar__resource-content">
                <div className="course-sidebar__resource-name">
                  {resource.name}
                </div>
                {resource.description && (
                  <div className="course-sidebar__resource-description">
                    {resource.description}
                  </div>
                )}
                <div className="course-sidebar__resource-meta">
                  {resource.size && (
                    <span>{resource.size}</span>
                  )}
                  {resource.downloadCount !== undefined && (
                    <span>{resource.downloadCount} téléchargements</span>
                  )}
                </div>
              </div>
              {actions.downloadResource?.enabled && (
                <button
                  type="button"
                  className="course-sidebar__resource-download"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (actions.downloadResource?.onDownload) {
                      actions.downloadResource.onDownload(resource.id);
                    }
                  }}
                  title="Télécharger"
                >
                  📥
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDiscussionSection = (section: SidebarSection) => (
    <div className="course-sidebar__discussion">
      <p>Section discussion en cours de développement...</p>
      {/* TODO: Implémenter la section discussion */}
    </div>
  );

  const renderToolsSection = (section: SidebarSection) => {
    const toolItems = section.content?.items || [
      { id: 'calculator', label: 'Calculatrice', icon: '🧮', onClick: () => {} },
      { id: 'notes', label: 'Mes notes', icon: '📝', onClick: () => {} },
      { id: 'bookmarks', label: 'Signets', icon: '🔖', onClick: () => {} }
    ];

    return (
      <div className="course-sidebar__tools">
        <div className="course-sidebar__tools-list">
          {toolItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'course-sidebar__tool-item',
                {
                  'is-active': item.active,
                }
              )}
              onClick={item.onClick}
              disabled={item.disabled}
              title={item.label}
            >
              <span className="course-sidebar__tool-icon">
                {item.icon}
              </span>
              <span className="course-sidebar__tool-label">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderNavigationSection = (section: SidebarSection) => {
    const navItems = section.content?.items || [];

    return (
      <div className="course-sidebar__navigation">
        <div className="course-sidebar__nav-list">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'course-sidebar__nav-item',
                {
                  'is-active': item.active,
                  'is-disabled': item.disabled,
                }
              )}
              onClick={!item.disabled ? () => onLessonClick?.(item.id) : undefined}
              disabled={item.disabled}
            >
              <span className="course-sidebar__nav-icon">
                {item.icon || '📄'}
              </span>
              <span className="course-sidebar__nav-label">
                {item.label}
              </span>
              {item.badge && (
                <span className="course-sidebar__nav-badge">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des notes
  const renderNotes = () => {
    if (notes.length === 0) return null;

    return (
      <div className="course-sidebar__section course-sidebar__section--notes">
        <div className="course-sidebar__section-header">
          <h3 className="course-sidebar__section-title">
            Mes notes ({notes.length})
          </h3>
        </div>
        <div className="course-sidebar__notes">
          {notes.map(note => (
            <div
              key={note.id}
              className="course-sidebar__note-item"
              onClick={() => onNoteClick?.(note)}
            >
              <div className="course-sidebar__note-content">
                {note.content}
              </div>
              <div className="course-sidebar__note-meta">
                {note.videoTimestamp !== undefined && (
                  <span className="course-sidebar__note-timestamp">
                    {formatTimestamp(note.videoTimestamp)}
                  </span>
                )}
                <span className="course-sidebar__note-date">
                  {new Date(note.timestamp).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des signets
  const renderBookmarks = () => {
    if (bookmarks.length === 0) return null;

    return (
      <div className="course-sidebar__section course-sidebar__section--bookmarks">
        <div className="course-sidebar__section-header">
          <h3 className="course-sidebar__section-title">
            Signets ({bookmarks.length})
          </h3>
          {actions.addBookmark?.enabled && (
            <button
              type="button"
              className="course-sidebar__add-bookmark-btn"
              onClick={() => openModal('addBookmark')}
              title="Ajouter un signet"
            >
              +
            </button>
          )}
        </div>
        <div className="course-sidebar__bookmarks">
          {bookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              className="course-sidebar__bookmark-item"
              onClick={() => onBookmarkClick?.(bookmark)}
            >
              <div className="course-sidebar__bookmark-content">
                <div className="course-sidebar__bookmark-title">
                  {bookmark.title}
                </div>
                {bookmark.description && (
                  <div className="course-sidebar__bookmark-description">
                    {bookmark.description}
                  </div>
                )}
              </div>
              <div className="course-sidebar__bookmark-meta">
                {bookmark.videoTimestamp !== undefined && (
                  <span className="course-sidebar__bookmark-timestamp">
                    {formatTimestamp(bookmark.videoTimestamp)}
                  </span>
                )}
                <span className="course-sidebar__bookmark-date">
                  {new Date(bookmark.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {defaultConfig.overlay && states.sidebarOpen && (
        <div 
          className="course-sidebar__overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={containerClasses}
        style={sidebarStyles}
        aria-label="Sidebar du cours"
      >
        {renderHeader()}

        <div className="course-sidebar__content">
          {sortedSections.map(renderSection)}
          {renderNotes()}
          {renderBookmarks()}
        </div>
      </aside>

      {/* Modals */}
      {states.modals.addNote && (
        <div className="course-sidebar__modal">
          <div className="course-sidebar__modal-content">
            <h3>Ajouter une note</h3>
            <textarea
              value={states.tempContent.note}
              onChange={(e) => setStates(prev => ({
                ...prev,
                tempContent: { ...prev.tempContent, note: e.target.value }
              }))}
              placeholder="Votre note..."
              className="course-sidebar__modal-textarea"
              rows={4}
            />
            <div className="course-sidebar__modal-actions">
              <button
                type="button"
                className="course-sidebar__modal-submit"
                onClick={handleAddNote}
                disabled={!states.tempContent.note.trim()}
              >
                Ajouter
              </button>
              <button
                type="button"
                className="course-sidebar__modal-cancel"
                onClick={closeModals}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {states.modals.addBookmark && (
        <div className="course-sidebar__modal">
          <div className="course-sidebar__modal-content">
            <h3>Ajouter un signet</h3>
            <input
              type="text"
              value={states.tempContent.bookmark}
              onChange={(e) => setStates(prev => ({
                ...prev,
                tempContent: { ...prev.tempContent, bookmark: e.target.value }
              }))}
              placeholder="Titre du signet..."
              className="course-sidebar__modal-input"
            />
            <div className="course-sidebar__modal-actions">
              <button
                type="button"
                className="course-sidebar__modal-submit"
                onClick={handleAddBookmark}
                disabled={!states.tempContent.bookmark.trim()}
              >
                Ajouter
              </button>
              <button
                type="button"
                className="course-sidebar__modal-cancel"
                onClick={closeModals}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseSidebar;