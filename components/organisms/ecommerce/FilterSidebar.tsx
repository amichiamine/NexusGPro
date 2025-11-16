import React, { useState } from 'react';
import { cn } from '@/utils';
import './FilterSidebar.css';

export interface FilterOption {
  /** Valeur unique de l'option */
  value: string;
  /** Libellé affiché */
  label: string;
  /** Nombre de résultats pour cette option */
  count?: number;
  /** Option désactivée */
  disabled?: boolean;
}

export interface FilterGroup {
  /** Clé unique du groupe */
  key: string;
  /** Libellé du groupe */
  label: string;
  /** Type de filtre */
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'color';
  /** Options disponibles */
  options?: FilterOption[];
  /** Valeurs sélectionnées */
  values: string[] | number[] | { min: number; max: number };
  /** Plage de valeurs pour les filtres de type range */
  range?: { min: number; max: number; step?: number };
  /** Callback lors du changement */
  onChange: (values: any) => void;
  /** Nombre maximum d'options sélectionnables */
  maxSelections?: number;
  /** Option pour tout sélectionner */
  allowSelectAll?: boolean;
}

export interface FilterSidebarProps {
  /** Groupes de filtres */
  groups: FilterGroup[];
  /** Nombre total de résultats */
  totalResults: number;
  /** Résultats filtrés */
  filteredResults?: number;
  /** Classes CSS personnalisées */
  className?: string;
  /** ID du composant */
  id?: string;
  /** Callback lors du reset de tous les filtres */
  onReset?: () => void;
  /** Callback lors de l'application des filtres */
  onApply?: () => void;
  /** Callback lors de la fermeture (mobile) */
  onClose?: () => void;
  /** État d'ouverture (mobile) */
  isOpen?: boolean;
  /** Position par défaut du filtre range */
  defaultRangePositions?: Record<string, { min: number; max: number }>;
  /** Afficher le bouton d'application (mobile) */
  showApplyButton?: boolean;
  /** Texte du bouton d'application */
  applyButtonText?: string;
  /** Texte du bouton de reset */
  resetButtonText?: string;
}

/**
 * Composant FilterSidebar pour filtrer les produits
 * 
 * Fonctionnalités:
 * - Filtres par checkbox, radio, range, select, couleur
 * - Gestion des compteurs de résultats
 * - Interface responsive avec modal sur mobile
 * - Sélection multiple avec limites
 * - Option "Tout sélectionner"
 * - Persistance des filtres
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  groups,
  totalResults,
  filteredResults,
  className = '',
  id,
  onReset,
  onApply,
  onClose,
  isOpen = false,
  defaultRangePositions = {},
  showApplyButton = false,
  applyButtonText = 'Appliquer les filtres',
  resetButtonText = 'Réinitialiser',
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map(g => g.key)));
  const [rangeValues, setRangeValues] = useState<Record<string, { min: number; max: number }>>(
    defaultRangePositions
  );

  // Basculer l'ouverture d'un groupe de filtres
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Gérer la sélection d'une option
  const handleOptionChange = (
    group: FilterGroup,
    optionValue: string,
    checked: boolean
  ) => {
    if (group.type === 'radio') {
      // Pour les radios, une seule sélection
      group.onChange([optionValue]);
    } else {
      // Pour les checkboxes, sélection multiple
      const currentValues = group.values as string[];
      let newValues: string[];

      if (checked) {
        // Ajouter l'option
        newValues = [...currentValues, optionValue];
        
        // Vérifier la limite de sélection
        if (group.maxSelections && newValues.length > group.maxSelections) {
          return; // Ne pas ajouter si limite atteinte
        }
      } else {
        // Retirer l'option
        newValues = currentValues.filter(v => v !== optionValue);
      }

      group.onChange(newValues);
    }
  };

  // Gérer le changement de valeurs de range
  const handleRangeChange = (
    group: FilterGroup,
    type: 'min' | 'max',
    value: number
  ) => {
    const currentRange = rangeValues[group.key] || { 
      min: group.range?.min || 0, 
      max: group.range?.max || 100 
    };
    
    const newRange = {
      ...currentRange,
      [type]: value,
    };

    // S'assurer que min <= max
    if (newRange.min > newRange.max) {
      if (type === 'min') {
        newRange.max = newRange.min;
      } else {
        newRange.min = newRange.max;
      }
    }

    setRangeValues(prev => ({
      ...prev,
      [group.key]: newRange,
    }));

    group.onChange(newRange);
  };

  // Sélectionner/désélectionner toutes les options
  const handleSelectAll = (group: FilterGroup, selectAll: boolean) => {
    if (!group.options) return;

    if (selectAll) {
      const allValues = group.options
        .filter(opt => !opt.disabled)
        .map(opt => opt.value);
      group.onChange(allValues);
    } else {
      group.onChange([]);
    }
  };

  // Vérifier si une option est sélectionnée
  const isOptionSelected = (group: FilterGroup, optionValue: string) => {
    return (group.values as string[]).includes(optionValue);
  };

  // Vérifier si toutes les options sont sélectionnées
  const areAllOptionsSelected = (group: FilterGroup) => {
    if (!group.options || group.allowSelectAll === false) return false;
    
    const selectableOptions = group.options.filter(opt => !opt.disabled);
    const selectedValues = group.values as string[];
    
    return selectableOptions.length > 0 && 
           selectableOptions.every(opt => selectedValues.includes(opt.value));
  };

  // Vérifier si aucune option n'est sélectionnée
  const areNoOptionsSelected = (group: FilterGroup) => {
    return (group.values as string[]).length === 0;
  };

  // Rendu d'un groupe de filtres checkbox/radio
  const renderCheckboxGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.key);
    const selectedCount = (group.values as string[]).length;

    return (
      <div key={group.key} className="ng-filter-sidebar__group">
        <button
          type="button"
          className="ng-filter-sidebar__group-header"
          onClick={() => toggleGroup(group.key)}
          aria-expanded={isExpanded}
          aria-controls={`ng-filter-sidebar-group-${group.key}`}
        >
          <h3 className="ng-filter-sidebar__group-title">
            {group.label}
            {selectedCount > 0 && (
              <span className="ng-filter-sidebar__selection-count">
                ({selectedCount})
              </span>
            )}
          </h3>
          <svg
            className={`ng-filter-sidebar__group-toggle ${isExpanded ? 'ng-filter-sidebar__group-toggle--expanded' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        
        {isExpanded && group.options && (
          <div
            id={`ng-filter-sidebar-group-${group.key}`}
            className="ng-filter-sidebar__group-content"
          >
            {group.allowSelectAll !== false && (
              <div className="ng-filter-sidebar__select-all">
                <label className="ng-filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    className="ng-filter-sidebar__checkbox"
                    checked={areAllOptionsSelected(group)}
                    indeterminate={!areAllOptionsSelected(group) && !areNoOptionsSelected(group)}
                    onChange={(e) => handleSelectAll(group, e.target.checked)}
                    aria-label={`Tout sélectionner pour ${group.label}`}
                  />
                  <span className="ng-filter-sidebar__checkbox-text">
                    Tout sélectionner
                  </span>
                </label>
              </div>
            )}
            
            <div className="ng-filter-sidebar__options">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className={`ng-filter-sidebar__checkbox-label ${
                    option.disabled ? 'ng-filter-sidebar__checkbox-label--disabled' : ''
                  }`}
                >
                  <input
                    type={group.type === 'radio' ? 'radio' : 'checkbox'}
                    name={group.type === 'radio' ? `radio-${group.key}` : undefined}
                    className="ng-filter-sidebar__checkbox"
                    checked={isOptionSelected(group, option.value)}
                    disabled={option.disabled}
                    onChange={(e) =>
                      handleOptionChange(group, option.value, e.target.checked)
                    }
                    aria-describedby={`ng-filter-sidebar-option-${group.key}-${option.value}`}
                  />
                  <span className="ng-filter-sidebar__checkbox-text">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span
                      id={`ng-filter-sidebar-option-${group.key}-${option.value}`}
                      className="ng-filter-sidebar__option-count"
                    >
                      ({option.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu d'un groupe de filtres de type range
  const renderRangeGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.key);
    const currentRange = rangeValues[group.key] || { 
      min: group.range?.min || 0, 
      max: group.range?.max || 100 
    };
    const step = group.range?.step || 1;

    return (
      <div key={group.key} className="ng-filter-sidebar__group">
        <button
          type="button"
          className="ng-filter-sidebar__group-header"
          onClick={() => toggleGroup(group.key)}
          aria-expanded={isExpanded}
          aria-controls={`ng-filter-sidebar-group-${group.key}`}
        >
          <h3 className="ng-filter-sidebar__group-title">{group.label}</h3>
          <svg
            className={`ng-filter-sidebar__group-toggle ${isExpanded ? 'ng-filter-sidebar__group-toggle--expanded' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        
        {isExpanded && (
          <div
            id={`ng-filter-sidebar-group-${group.key}`}
            className="ng-filter-sidebar__group-content"
          >
            <div className="ng-filter-sidebar__range-inputs">
              <div className="ng-filter-sidebar__range-input">
                <label htmlFor={`${group.key}-min`}>Min:</label>
                <input
                  id={`${group.key}-min`}
                  type="number"
                  min={group.range?.min}
                  max={currentRange.max}
                  step={step}
                  value={currentRange.min}
                  onChange={(e) =>
                    handleRangeChange(group, 'min', parseInt(e.target.value) || group.range?.min || 0)
                  }
                  className="ng-filter-sidebar__number-input"
                />
              </div>
              <div className="ng-filter-sidebar__range-separator">-</div>
              <div className="ng-filter-sidebar__range-input">
                <label htmlFor={`${group.key}-max`}>Max:</label>
                <input
                  id={`${group.key}-max`}
                  type="number"
                  min={currentRange.min}
                  max={group.range?.max}
                  step={step}
                  value={currentRange.max}
                  onChange={(e) =>
                    handleRangeChange(group, 'max', parseInt(e.target.value) || group.range?.max || 100)
                  }
                  className="ng-filter-sidebar__number-input"
                />
              </div>
            </div>
            
            <div className="ng-filter-sidebar__range-slider">
              <input
                type="range"
                min={group.range?.min}
                max={group.range?.max}
                step={step}
                value={currentRange.min}
                onChange={(e) =>
                  handleRangeChange(group, 'min', parseInt(e.target.value))
                }
                className="ng-filter-sidebar__range-slider-input"
                aria-label={`${group.label} minimum`}
              />
              <input
                type="range"
                min={group.range?.min}
                max={group.range?.max}
                step={step}
                value={currentRange.max}
                onChange={(e) =>
                  handleRangeChange(group, 'max', parseInt(e.target.value))
                }
                className="ng-filter-sidebar__range-slider-input"
                aria-label={`${group.label} maximum`}
              />
            </div>
            
            <div className="ng-filter-sidebar__range-values">
              <span>{currentRange.min}</span>
              <span>{currentRange.max}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu d'un groupe de filtres select
  const renderSelectGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.key);

    return (
      <div key={group.key} className="ng-filter-sidebar__group">
        <button
          type="button"
          className="ng-filter-sidebar__group-header"
          onClick={() => toggleGroup(group.key)}
          aria-expanded={isExpanded}
          aria-controls={`ng-filter-sidebar-group-${group.key}`}
        >
          <h3 className="ng-filter-sidebar__group-title">{group.label}</h3>
          <svg
            className={`ng-filter-sidebar__group-toggle ${isExpanded ? 'ng-filter-sidebar__group-toggle--expanded' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        
        {isExpanded && group.options && (
          <div
            id={`ng-filter-sidebar-group-${group.key}`}
            className="ng-filter-sidebar__group-content"
          >
            <select
              className="ng-filter-sidebar__select"
              value={(group.values as string[])[0] || ''}
              onChange={(e) => group.onChange([e.target.value])}
              aria-label={`Sélectionner pour ${group.label}`}
            >
              <option value="">Toutes les options</option>
              {group.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Rendu d'un groupe de filtres couleur
  const renderColorGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.key);

    return (
      <div key={group.key} className="ng-filter-sidebar__group">
        <button
          type="button"
          className="ng-filter-sidebar__group-header"
          onClick={() => toggleGroup(group.key)}
          aria-expanded={isExpanded}
          aria-controls={`ng-filter-sidebar-group-${group.key}`}
        >
          <h3 className="ng-filter-sidebar__group-title">{group.label}</h3>
          <svg
            className={`ng-filter-sidebar__group-toggle ${isExpanded ? 'ng-filter-sidebar__group-toggle--expanded' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        
        {isExpanded && group.options && (
          <div
            id={`ng-filter-sidebar-group-${group.key}`}
            className="ng-filter-sidebar__group-content"
          >
            <div className="ng-filter-sidebar__color-swatches">
              {group.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`ng-filter-sidebar__color-swatch ${
                    isOptionSelected(group, option.value)
                      ? 'ng-filter-sidebar__color-swatch--selected'
                      : ''
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() =>
                    handleOptionChange(
                      group,
                      option.value,
                      !isOptionSelected(group, option.value)
                    )
                  }
                  disabled={option.disabled}
                  aria-label={`${option.label} - ${option.count || 0} résultats`}
                  title={`${option.label} (${option.count || 0})`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendre le groupe approprié selon le type
  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'checkbox':
      case 'radio':
        return renderCheckboxGroup(group);
      case 'range':
        return renderRangeGroup(group);
      case 'select':
        return renderSelectGroup(group);
      case 'color':
        return renderColorGroup(group);
      default:
        return null;
    }
  };

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = groups.reduce((count, group) => {
    if (group.type === 'range') {
      const currentRange = rangeValues[group.key];
      const defaultRange = {
        min: group.range?.min || 0,
        max: group.range?.max || 100
      };
      return count + (currentRange?.min !== defaultRange.min || currentRange?.max !== defaultRange.max ? 1 : 0);
    }
    return count + (group.values as string[]).length;
  }, 0);

  return (
    <aside
      className={cn(
        'ng-filter-sidebar',
        {
          'ng-filter-sidebar--open': isOpen,
        },
        className
      )}
      id={id}
      role="complementary"
      aria-label="Filtres de produits"
    >
      <div className="ng-filter-sidebar__header">
        <h2 className="ng-filter-sidebar__title">
          Filtres
          {activeFiltersCount > 0 && (
            <span className="ng-filter-sidebar__active-count">
              ({activeFiltersCount} actifs)
            </span>
          )}
        </h2>
        
        <div className="ng-filter-sidebar__actions">
          {activeFiltersCount > 0 && onReset && (
            <button
              type="button"
              className="ng-filter-sidebar__reset-btn"
              onClick={onReset}
            >
              {resetButtonText}
            </button>
          )}
          
          {onClose && (
            <button
              type="button"
              className="ng-filter-sidebar__close-btn"
              onClick={onClose}
              aria-label="Fermer les filtres"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="ng-filter-sidebar__content">
        {groups.map(renderFilterGroup)}
      </div>

      {(filteredResults !== undefined || showApplyButton) && (
        <div className="ng-filter-sidebar__footer">
          {filteredResults !== undefined && (
            <div className="ng-filter-sidebar__results-count">
              {filteredResults} résultat{filteredResults !== 1 ? 's' : ''} sur {totalResults}
            </div>
          )}
          
          {showApplyButton && onApply && (
            <button
              type="button"
              className="ng-filter-sidebar__apply-btn"
              onClick={onApply}
            >
              {applyButtonText}
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;