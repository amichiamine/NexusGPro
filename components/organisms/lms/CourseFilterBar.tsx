import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils';
import './CourseFilterBar.css';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
  icon?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range' | 'level';
  options?: FilterOption[];
  multiple?: boolean;
  expanded?: boolean;
  icon?: string;
}

export interface RangeFilter {
  min: number;
  max: number;
  step: number;
  unit?: string;
  defaultValue?: { min: number; max: number };
}

export interface CourseFilterBarProps {
  /** Groupes de filtres disponibles */
  filterGroups: FilterGroup[];
  /** Filtres de plage (prix, durée, etc.) */
  rangeFilters?: {
    id: string;
    label: string;
    range: RangeFilter;
    currentValue?: { min: number; max: number };
  }[];
  /** Filtres actuellement appliqués */
  appliedFilters?: {
    [groupId: string]: string[] | { min: number; max: number };
  };
  /** Tri des cours */
  sortOptions?: {
    value: string;
    label: string;
    direction?: 'asc' | 'desc';
  }[];
  /** Tri actuellement sélectionné */
  currentSort?: string;
  /** Options de vue */
  viewOptions?: {
    value: string;
    label: string;
    icon: string;
  }[];
  /** Vue actuellement sélectionnée */
  currentView?: string;
  /** Nombre total de cours */
  totalCourses?: number;
  /** Nombre de cours filtrés */
  filteredCourses?: number;
  /** Recherche textuelle */
  searchQuery?: string;
  /** Placeholder pour la recherche */
  searchPlaceholder?: string;
  /** Afficher les filtres sauvegardés */
  showSavedFilters?: boolean;
  /** Filtres sauvegardés */
  savedFilters?: {
    id: string;
    name: string;
    filters: { [groupId: string]: any };
  }[];
  /** Actions des filtres */
  onFilterChange?: (filterId: string, value: any) => void;
  /** Action de tri */
  onSortChange?: (sortValue: string) => void;
  /** Action de changement de vue */
  onViewChange?: (viewValue: string) => void;
  /** Action de recherche */
  onSearch?: (query: string) => void;
  /** Action de réinitialisation des filtres */
  onReset?: () => void;
  /** Action de sauvegarde de filtres */
  onSaveFilter?: (name: string, filters: any) => void;
  /** Action de chargement de filtres sauvegardés */
  onLoadFilter?: (filterId: string) => void;
  /** Action de suppression de filtres sauvegardés */
  onDeleteFilter?: (filterId: string) => void;
  /** Mode compact */
  compact?: boolean;
  /** Mode sidebar (filtres sur le côté) */
  sidebarMode?: boolean;
  /** Afficher les compteurs de résultats */
  showResultsCount?: boolean;
  /** Classes CSS personnalisées */
  className?: string;
}

export interface CourseFilterBarStates {
  /** Filtres expandés */
  expandedGroups: Set<string>;
  /** Mode recherche active */
  searchActive: boolean;
  /** Recherche textuelle */
  searchQuery: string;
  /** Filtres en cours de modification */
  tempFilters: { [groupId: string]: any };
  /** Mode sidebar ouvert (mobile) */
  sidebarOpen: boolean;
  /** Affichage des filtres sauvegardés */
  savedFiltersVisible: boolean;
}

const CourseFilterBar: React.FC<CourseFilterBarProps> = ({
  filterGroups = [],
  rangeFilters = [],
  appliedFilters = {},
  sortOptions = [],
  currentSort,
  viewOptions = [],
  currentView,
  totalCourses,
  filteredCourses,
  searchQuery = '',
  searchPlaceholder = 'Rechercher des cours...',
  showSavedFilters = false,
  savedFilters = [],
  onFilterChange,
  onSortChange,
  onViewChange,
  onSearch,
  onReset,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  compact = false,
  sidebarMode = false,
  showResultsCount = true,
  className = ''
}) => {
  // État local du composant
  const [states, setStates] = useState<CourseFilterBarStates>({
    expandedGroups: new Set(),
    searchActive: false,
    searchQuery: searchQuery,
    tempFilters: { ...appliedFilters },
    sidebarOpen: false,
    savedFiltersVisible: false
  });

  // Gestionnaires d'événements
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedGroups);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return {
        ...prev,
        expandedGroups: newExpanded
      };
    });
  }, []);

  const handleFilterChange = useCallback((groupId: string, value: any) => {
    setStates(prev => ({
      ...prev,
      tempFilters: {
        ...prev.tempFilters,
        [groupId]: value
      }
    }));

    if (onFilterChange) {
      onFilterChange(groupId, value);
    }
  }, [onFilterChange]);

  const handleRangeFilterChange = useCallback((filterId: string, value: { min: number; max: number }) => {
    if (onFilterChange) {
      onFilterChange(filterId, value);
    }
  }, [onFilterChange]);

  const handleSortChange = useCallback((sortValue: string) => {
    if (onSortChange) {
      onSortChange(sortValue);
    }
  }, [onSortChange]);

  const handleViewChange = useCallback((viewValue: string) => {
    if (onViewChange) {
      onViewChange(viewValue);
    }
  }, [onViewChange]);

  const handleSearchChange = useCallback((query: string) => {
    setStates(prev => ({
      ...prev,
      searchQuery: query
    }));

    if (onSearch) {
      onSearch(query);
    }
  }, [onSearch]);

  const handleReset = useCallback(() => {
    setStates(prev => ({
      ...prev,
      tempFilters: {},
      searchQuery: ''
    }));

    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const toggleSidebar = useCallback(() => {
    setStates(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  }, []);

  const toggleSavedFilters = useCallback(() => {
    setStates(prev => ({
      ...prev,
      savedFiltersVisible: !prev.savedFiltersVisible
    }));
  }, []);

  const handleSaveFilter = useCallback((filterName: string) => {
    if (onSaveFilter) {
      onSaveFilter(filterName, states.tempFilters);
    }
  }, [onSaveFilter, states.tempFilters]);

  const handleLoadSavedFilter = useCallback((filterId: string) => {
    if (onLoadFilter) {
      onLoadFilter(filterId);
    }
  }, [onLoadFilter]);

  const handleDeleteSavedFilter = useCallback((filterId: string) => {
    if (onDeleteFilter) {
      onDeleteFilter(filterId);
    }
  }, [onDeleteFilter]);

  // Calculs dérivés
  const hasActiveFilters = useMemo(() => {
    return Object.keys(appliedFilters).length > 0 || 
           states.searchQuery.length > 0 ||
           rangeFilters.some(filter => 
             filter.currentValue && 
             (filter.currentValue.min !== filter.range.defaultValue?.min || 
              filter.currentValue.max !== filter.range.defaultValue?.max)
           );
  }, [appliedFilters, states.searchQuery, rangeFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(appliedFilters).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length;
      } else if (typeof value === 'object' && value !== null) {
        count += Object.keys(value).length;
      }
    });
    return count;
  }, [appliedFilters]);

  // Formatage des compteurs
  const formatCourseCount = (count: number): string => {
    return new Intl.NumberFormat('fr-FR').format(count);
  };

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-filter-bar',
    `course-filter-bar--${compact ? 'compact' : 'normal'}`,
    `course-filter-bar--${sidebarMode ? 'sidebar' : 'top'}`,
    {
      'course-filter-bar--sidebar-open': states.sidebarOpen,
      'course-filter-bar--has-active-filters': hasActiveFilters,
    },
    className
  );

  // Composants internes
  const FilterCheckbox: React.FC<{
    group: FilterGroup;
    value: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ group, value, checked, onChange }) => {
    const option = group.options?.find(opt => opt.value === value);
    
    return (
      <label className="course-filter-bar__checkbox">
        <input
          type={group.multiple ? 'checkbox' : 'radio'}
          name={group.id}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={option?.disabled}
          className="course-filter-bar__checkbox-input"
        />
        <span className="course-filter-bar__checkbox-label">
          {option?.icon && (
            <span className="course-filter-bar__checkbox-icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="course-filter-bar__checkbox-text">
            {option?.label}
          </span>
          {option?.count !== undefined && (
            <span className="course-filter-bar__checkbox-count">
              ({formatCourseCount(option.count)})
            </span>
          )}
        </span>
      </label>
    );
  };

  const FilterSelect: React.FC<{
    group: FilterGroup;
    value: string;
    onChange: (value: string) => void;
  }> = ({ group, value, onChange }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="course-filter-bar__select"
    >
      <option value="">Tous</option>
      {group.options?.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.icon && `${option.icon} `}{option.label}
          {option.count !== undefined && ` (${formatCourseCount(option.count)})`}
        </option>
      ))}
    </select>
  );

  const RangeFilter: React.FC<{
    filter: any;
    value: { min: number; max: number };
    onChange: (value: { min: number; max: number }) => void;
  }> = ({ filter, value, onChange }) => {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        min: Number(e.target.value)
      });
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...value,
        max: Number(e.target.value)
      });
    };

    const formatValue = (val: number) => {
      return filter.range.unit === '%' ? `${val}${filter.range.unit}` : 
             filter.range.unit === 'min' ? `${Math.floor(val / 60)}h ${val % 60}min` :
             `${val}${filter.range.unit}`;
    };

    return (
      <div className="course-filter-bar__range">
        <div className="course-filter-bar__range-inputs">
          <label className="course-filter-bar__range-label">
            <span className="course-filter-bar__range-label-text">Min:</span>
            <input
              type="number"
              min={filter.range.min}
              max={filter.range.max}
              step={filter.range.step}
              value={value.min}
              onChange={handleMinChange}
              className="course-filter-bar__range-input"
            />
          </label>
          <span className="course-filter-bar__range-separator">-</span>
          <label className="course-filter-bar__range-label">
            <span className="course-filter-bar__range-label-text">Max:</span>
            <input
              type="number"
              min={filter.range.min}
              max={filter.range.max}
              step={filter.range.step}
              value={value.max}
              onChange={handleMaxChange}
              className="course-filter-bar__range-input"
            />
          </label>
        </div>
        <div className="course-filter-bar__range-slider">
          <input
            type="range"
            min={filter.range.min}
            max={filter.range.max}
            step={filter.range.step}
            value={value.min}
            onChange={handleMinChange}
            className="course-filter-bar__slider course-filter-bar__slider--min"
          />
          <input
            type="range"
            min={filter.range.min}
            max={filter.range.max}
            step={filter.range.step}
            value={value.max}
            onChange={handleMaxChange}
            className="course-filter-bar__slider course-filter-bar__slider--max"
          />
        </div>
        <div className="course-filter-bar__range-values">
          <span className="course-filter-bar__range-value">
            {formatValue(value.min)}
          </span>
          <span className="course-filter-bar__range-value">
            {formatValue(value.max)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Header avec recherche et contrôles principaux */}
      <div className="course-filter-bar__header">
        {/* Recherche */}
        <div className="course-filter-bar__search">
          <div className="course-filter-bar__search-input-container">
            <input
              type="text"
              value={states.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="course-filter-bar__search-input"
              aria-label="Rechercher des cours"
            />
            <button
              type="button"
              className="course-filter-bar__search-button"
              aria-label="Rechercher"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Compteur de résultats */}
        {showResultsCount && (
          <div className="course-filter-bar__results-count" aria-live="polite">
            {filteredCourses !== undefined ? (
              <span>
                {formatCourseCount(filteredCourses)} cours
                {totalCourses && filteredCourses !== totalCourses && (
                  <span className="course-filter-bar__results-total">
                    {' '}sur {formatCourseCount(totalCourses)}
                  </span>
                )}
              </span>
            ) : (
              totalCourses && (
                <span>
                  {formatCourseCount(totalCourses)} cours
                </span>
              )
            )}
          </div>
        )}

        {/* Tri et vue */}
        {(sortOptions.length > 0 || viewOptions.length > 0) && (
          <div className="course-filter-bar__controls">
            {/* Tri */}
            {sortOptions.length > 0 && (
              <div className="course-filter-bar__sort">
                <label htmlFor="course-sort" className="course-filter-bar__sort-label">
                  Trier par:
                </label>
                <select
                  id="course-sort"
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="course-filter-bar__sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Options de vue */}
            {viewOptions.length > 0 && (
              <div className="course-filter-bar__view-options" role="group" aria-label="Options d'affichage">
                {viewOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`course-filter-bar__view-option ${currentView === option.value ? 'is-active' : ''}`}
                    onClick={() => handleViewChange(option.value)}
                    aria-pressed={currentView === option.value}
                    aria-label={`Affichage ${option.label}`}
                  >
                    <span className="course-filter-bar__view-icon" aria-hidden="true">
                      {option.icon}
                    </span>
                    <span className="course-filter-bar__view-label">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="course-filter-bar__actions">
          {/* Filtres sauvegardés */}
          {showSavedFilters && savedFilters.length > 0 && (
            <div className="course-filter-bar__saved-filters">
              <button
                type="button"
                className="course-filter-bar__saved-filters-toggle"
                onClick={toggleSavedFilters}
                aria-expanded={states.savedFiltersVisible}
                aria-label="Filtres sauvegardés"
              >
                📋 Filtres
                {activeFilterCount > 0 && (
                  <span className="course-filter-bar__filter-count">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {states.savedFiltersVisible && (
                <div className="course-filter-bar__saved-filters-dropdown">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="course-filter-bar__saved-filter">
                      <button
                        type="button"
                        className="course-filter-bar__saved-filter-load"
                        onClick={() => handleLoadSavedFilter(filter.id)}
                      >
                        {filter.name}
                      </button>
                      <button
                        type="button"
                        className="course-filter-bar__saved-filter-delete"
                        onClick={() => handleDeleteSavedFilter(filter.id)}
                        aria-label={`Supprimer le filtre ${filter.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Réinitialisation */}
          {hasActiveFilters && (
            <button
              type="button"
              className="course-filter-bar__reset"
              onClick={handleReset}
              aria-label="Réinitialiser tous les filtres"
            >
              🔄 Réinitialiser
            </button>
          )}

          {/* Mode sidebar (mobile) */}
          {sidebarMode && (
            <button
              type="button"
              className="course-filter-bar__sidebar-toggle"
              onClick={toggleSidebar}
              aria-expanded={states.sidebarOpen}
              aria-label="Ouvrir les filtres"
            >
              🏷️ Filtres
              {activeFilterCount > 0 && (
                <span className="course-filter-bar__filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Contenu des filtres */}
      <div className="course-filter-bar__content">
        {/* Filtres sauvegardés dropdown */}
        {states.savedFiltersVisible && showSavedFilters && savedFilters.length > 0 && (
          <div className="course-filter-bar__saved-filters-panel">
            <h3 className="course-filter-bar__saved-filters-title">
              Filtres sauvegardés
            </h3>
            <div className="course-filter-bar__saved-filters-list">
              {savedFilters.map(filter => (
                <div key={filter.id} className="course-filter-bar__saved-filter-item">
                  <button
                    type="button"
                    className="course-filter-bar__saved-filter-button"
                    onClick={() => handleLoadSavedFilter(filter.id)}
                  >
                    <span className="course-filter-bar__saved-filter-name">
                      {filter.name}
                    </span>
                    <button
                      type="button"
                      className="course-filter-bar__saved-filter-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedFilter(filter.id);
                      }}
                      aria-label={`Supprimer ${filter.name}`}
                    >
                      ✕
                    </button>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres principaux */}
        <div className="course-filter-bar__filters">
          {filterGroups.map(group => {
            const isExpanded = states.expandedGroups.has(group.id);
            const currentValue = states.tempFilters[group.id];
            const hasValue = currentValue && (
              (Array.isArray(currentValue) && currentValue.length > 0) ||
              (typeof currentValue === 'string' && currentValue.length > 0)
            );

            return (
              <div
                key={group.id}
                className={`course-filter-bar__group ${isExpanded ? 'is-expanded' : ''} ${hasValue ? 'has-value' : ''}`}
              >
                <button
                  type="button"
                  className="course-filter-bar__group-header"
                  onClick={() => toggleGroupExpansion(group.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`${group.id}-content`}
                >
                  <span className="course-filter-bar__group-icon" aria-hidden="true">
                    {group.icon}
                  </span>
                  <span className="course-filter-bar__group-title">
                    {group.label}
                  </span>
                  {hasValue && (
                    <span className="course-filter-bar__group-indicator">
                      ✓
                    </span>
                  )}
                  <span className="course-filter-bar__group-toggle" aria-hidden="true">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div
                    id={`${group.id}-content`}
                    className="course-filter-bar__group-content"
                  >
                    {group.type === 'checkbox' && group.options && (
                      <div className="course-filter-bar__checkbox-list">
                        {group.options.map(option => (
                          <FilterCheckbox
                            key={option.value}
                            group={group}
                            value={option.value}
                            checked={currentValue?.includes(option.value) || false}
                            onChange={(checked) => {
                              const current = currentValue || [];
                              const newValue = checked
                                ? [...current, option.value]
                                : current.filter((v: string) => v !== option.value);
                              handleFilterChange(group.id, newValue);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {group.type === 'radio' && group.options && (
                      <div className="course-filter-bar__radio-list">
                        {group.options.map(option => (
                          <FilterCheckbox
                            key={option.value}
                            group={{...group, type: 'radio'}}
                            value={option.value}
                            checked={currentValue === option.value}
                            onChange={(checked) => {
                              if (checked) {
                                handleFilterChange(group.id, option.value);
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {group.type === 'select' && (
                      <FilterSelect
                        group={group}
                        value={currentValue || ''}
                        onChange={(value) => handleFilterChange(group.id, value)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Filtres de plage */}
          {rangeFilters.map(filter => (
            <div key={filter.id} className="course-filter-bar__range-group">
              <div className="course-filter-bar__range-header">
                <span className="course-filter-bar__range-title">
                  {filter.label}
                </span>
              </div>
              <RangeFilter
                filter={filter}
                value={filter.currentValue || filter.range.defaultValue || { 
                  min: filter.range.min, 
                  max: filter.range.max 
                }}
                onChange={(value) => handleRangeFilterChange(filter.id, value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar overlay pour mobile */}
      {sidebarMode && states.sidebarOpen && (
        <div 
          className="course-filter-bar__sidebar-overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CourseFilterBar;