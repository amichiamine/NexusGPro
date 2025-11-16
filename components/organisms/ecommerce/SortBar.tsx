import React, { useState } from 'react';
import { cn } from '@/utils';
import './SortBar.css';

export interface SortOption {
  /** Valeur unique de l'option */
  value: string;
  /** Libellé affiché */
  label: string;
  /** Direction du tri */
  direction: 'asc' | 'desc';
  /** Option désactivée */
  disabled?: boolean;
  /** Icône personnalisée */
  icon?: React.ReactNode;
  /** Nombre de résultats pour cette option */
  count?: number;
}

export interface SortBarProps {
  /** Options de tri disponibles */
  options: SortOption[];
  /** Option de tri actuellement sélectionnée */
  selectedOption: string;
  /** Tri par défaut */
  defaultOption?: string;
  /** Direction par défaut */
  defaultDirection?: 'asc' | 'desc';
  /** Position des contrôles */
  position?: 'top' | 'bottom' | 'floating';
  /** Afficher le nombre de résultats */
  showResultsCount?: boolean;
  /** Nombre total de résultats */
  totalResults?: number;
  /** Résultats filtrés */
  filteredResults?: number;
  /** Afficher la direction de tri */
  showDirectionToggle?: boolean;
  /** Textes personnalisés */
  labels?: {
    /** Libellé du tri */
    sortBy?: string;
    /** Libellé de la direction */
    direction?: string;
    /** Libellé croissant */
    ascending?: string;
    /** Libellé décroissant */
    descending?: string;
    /** Libellé des résultats */
    results?: string;
  };
  /** Options de vue disponibles */
  viewOptions?: {
    /** Afficher les options de vue */
    enabled?: boolean;
    /** Vues disponibles */
    modes?: ('grid' | 'list' | 'masonry')[];
    /** Vue actuelle */
    current?: string;
    /** Callback lors du changement de vue */
    onChange?: (view: string) => void;
  };
  /** Options de filtrage */
  filterOptions?: {
    /** Afficher les filtres rapides */
    enabled?: boolean;
    /** Filtres disponibles */
    filters?: {
      value: string;
      label: string;
      count?: number;
      active?: boolean;
    }[];
    /** Callback lors du changement de filtre */
    onChange?: (filter: string) => void;
    /** Callback pour清除 tous les filtres */
    onClearAll?: () => void;
  };
  /** Callback lors du changement de tri */
  onSortChange?: (option: SortOption) => void;
  /** Callback lors du changement de direction */
  onDirectionChange?: (direction: 'asc' | 'desc') => void;
  /** État de chargement */
  loading?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** ID du composant */
  id?: string;
}

/**
 * Composant SortBar pour trier et filtrer les produits
 * 
 * Fonctionnalités:
 * - Sélection d'options de tri avec icônes
 * - Toggle de direction (croissant/décroissant)
 * - Affichage du nombre de résultats
 * - Options de vue (grille, liste, masonry)
 * - Filtres rapides avec compteurs
 * - Positionnement flexible (top, bottom, floating)
 * - Responsive et accessible
 */
export const SortBar: React.FC<SortBarProps> = ({
  options,
  selectedOption,
  defaultOption,
  defaultDirection = 'asc',
  position = 'top',
  showResultsCount = true,
  totalResults,
  filteredResults,
  showDirectionToggle = true,
  labels = {},
  viewOptions = {},
  filterOptions = {},
  onSortChange,
  onDirectionChange,
  loading = false,
  className = '',
  id,
}) => {
  const [currentDirection, setCurrentDirection] = useState(defaultDirection);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Libellés par défaut
  const defaultLabels = {
    sortBy: 'Trier par',
    direction: 'Direction',
    ascending: 'Croissant',
    descending: 'Décroissant',
    results: 'résultats',
    ...labels,
  };

  // Option sélectionnée
  const selectedSortOption = options.find(opt => opt.value === selectedOption) || options[0];

  // Gérer le changement de tri
  const handleSortChange = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option && onSortChange) {
      onSortChange(option);
    }
  };

  // Gérer le changement de direction
  const handleDirectionChange = (direction: 'asc' | 'desc') => {
    setCurrentDirection(direction);
    onDirectionChange?.(direction);
  };

  // Rendu de l'icône de direction
  const renderDirectionIcon = (direction: 'asc' | 'desc') => (
    <svg
      className={`ng-sort-bar__direction-icon ng-sort-bar__direction-icon--${direction}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d={direction === 'asc' ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'} />
    </svg>
  );

  // Rendu des options de tri
  const renderSortOptions = () => (
    <div className="ng-sort-bar__sort-container">
      <label htmlFor={`${id}-sort`} className="ng-sort-bar__label">
        {defaultLabels.sortBy}:
      </label>
      <div className="ng-sort-bar__select-container">
        <select
          id={`${id}-sort`}
          className="ng-sort-bar__select"
          value={selectedOption}
          onChange={(e) => handleSortChange(e.target.value)}
          disabled={loading}
          aria-label={`${defaultLabels.sortBy} ${selectedSortOption?.label}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.icon && <span className="ng-sort-bar__option-icon">{option.icon}</span>}
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </option>
          ))}
        </select>
        
        {/* Flèche du select */}
        <svg
          className="ng-sort-bar__select-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );

  // Rendu du toggle de direction
  const renderDirectionToggle = () => {
    if (!showDirectionToggle) return null;

    return (
      <div className="ng-sort-bar__direction-container">
        <label className="ng-sort-bar__label">{defaultLabels.direction}:</label>
        <div className="ng-sort-bar__direction-toggle" role="group" aria-label={defaultLabels.direction}>
          <button
            type="button"
            className={`ng-sort-bar__direction-btn ${
              currentDirection === 'asc' ? 'ng-sort-bar__direction-btn--active' : ''
            }`}
            onClick={() => handleDirectionChange('asc')}
            disabled={loading}
            aria-pressed={currentDirection === 'asc'}
            aria-label={`${defaultLabels.ascending} (${selectedSortOption?.label})`}
            title={defaultLabels.ascending}
          >
            {renderDirectionIcon('asc')}
            <span className="ng-sort-bar__direction-text">{defaultLabels.ascending}</span>
          </button>
          
          <button
            type="button"
            className={`ng-sort-bar__direction-btn ${
              currentDirection === 'desc' ? 'ng-sort-bar__direction-btn--active' : ''
            }`}
            onClick={() => handleDirectionChange('desc')}
            disabled={loading}
            aria-pressed={currentDirection === 'desc'}
            aria-label={`${defaultLabels.descending} (${selectedSortOption?.label})`}
            title={defaultLabels.descending}
          >
            {renderDirectionIcon('desc')}
            <span className="ng-sort-bar__direction-text">{defaultLabels.descending}</span>
          </button>
        </div>
      </div>
    );
  };

  // Rendu du nombre de résultats
  const renderResultsCount = () => {
    if (!showResultsCount) return null;

    const results = filteredResults !== undefined ? filteredResults : totalResults;
    if (results === undefined) return null;

    return (
      <div className="ng-sort-bar__results">
        <span className="ng-sort-bar__results-count">
          {loading ? '...' : results} {defaultLabels.results}
        </span>
        {filteredResults !== undefined && totalResults !== undefined && filteredResults !== totalResults && (
          <span className="ng-sort-bar__results-filtered">
            sur {totalResults} total
          </span>
        )}
      </div>
    );
  };

  // Rendu des options de vue
  const renderViewOptions = () => {
    if (!viewOptions.enabled || !viewOptions.modes?.length) return null;

    const currentView = viewOptions.current || 'grid';

    return (
      <div className="ng-sort-bar__view-container">
        <label className="ng-sort-bar__label">Vue:</label>
        <div className="ng-sort-bar__view-options">
          {viewOptions.modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`ng-sort-bar__view-btn ${
                currentView === mode ? 'ng-sort-bar__view-btn--active' : ''
              }`}
              onClick={() => viewOptions.onChange?.(mode)}
              disabled={loading}
              aria-pressed={currentView === mode}
              aria-label={`Vue ${mode}`}
              title={`Vue ${mode}`}
            >
              {mode === 'grid' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              )}
              {mode === 'list' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
              {mode === 'masonry' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="5" />
                  <rect x="14" y="3" width="7" height="9" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des filtres rapides
  const renderFilterOptions = () => {
    if (!filterOptions.enabled || !filterOptions.filters?.length) return null;

    const activeFilters = filterOptions.filters.filter(f => f.active);
    const hasActiveFilters = activeFilters.length > 0;

    return (
      <div className="ng-sort-bar__filters">
        <div className="ng-sort-bar__filters-header">
          <span className="ng-sort-bar__filters-title">Filtres:</span>
          {hasActiveFilters && filterOptions.onClearAll && (
            <button
              type="button"
              className="ng-sort-bar__clear-filters"
              onClick={filterOptions.onClearAll}
              aria-label="Effacer tous les filtres"
            >
              Effacer tout
            </button>
          )}
        </div>
        
        <div className="ng-sort-bar__filter-options">
          {filterOptions.filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`ng-sort-bar__filter-btn ${
                filter.active ? 'ng-sort-bar__filter-btn--active' : ''
              }`}
              onClick={() => filterOptions.onChange?.(filter.value)}
              disabled={loading}
              aria-pressed={filter.active}
              aria-label={`${filter.label} - ${filter.count || 0} résultats`}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="ng-sort-bar__filter-count">{filter.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des options avancées
  const renderAdvancedOptions = () => (
    <div className={`ng-sort-bar__advanced ${showAdvancedOptions ? 'ng-sort-bar__advanced--open' : ''}`}>
      <button
        type="button"
        className="ng-sort-bar__advanced-toggle"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        aria-expanded={showAdvancedOptions}
        aria-controls={`${id}-advanced`}
      >
        Options avancées
        <svg
          className={`ng-sort-bar__advanced-arrow ${showAdvancedOptions ? 'ng-sort-bar__advanced-arrow--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      <div id={`${id}-advanced`} className="ng-sort-bar__advanced-content">
        {renderViewOptions()}
        {renderFilterOptions()}
      </div>
    </div>
  );

  // Classes CSS
  const sortBarClasses = cn(
    'ng-sort-bar',
    `ng-sort-bar--${position}`,
    {
      'ng-sort-bar--loading': loading,
    },
    className
  );

  return (
    <nav className={sortBarClasses} id={id} aria-label="Options de tri et filtrage">
      <div className="ng-sort-bar__container">
        {/* Contrôles principaux */}
        <div className="ng-sort-bar__main">
          {renderResultsCount()}
          {renderSortOptions()}
          {renderDirectionToggle()}
        </div>
        
        {/* Options avancées */}
        {(viewOptions.enabled || filterOptions.enabled) && renderAdvancedOptions()}
      </div>
    </nav>
  );
};

export default SortBar;