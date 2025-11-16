import React, { forwardRef, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import './SearchBox.css'

// Types
export interface SearchFilter {
  id: string
  label: string
  value: string
  category?: string
  color?: string
}

export interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'suggestion' | 'category'
  category?: string
  count?: number
  url?: string
  tags?: string[]
}

export interface SearchHistoryItem {
  query: string
  timestamp: number
  results?: number
}

export interface SearchBoxProps {
  // Core functionality
  value?: string
  onSearch?: (query: string, filters?: SearchFilter[]) => void
  onChange?: (value: string) => void
  onClear?: () => void
  
  // Search features
  debounceMs?: number
  enableRealTime?: boolean
  enableSuggestions?: boolean
  enableFilters?: boolean
  enableHistory?: boolean
  minQueryLength?: number
  
  // Data
  suggestions?: SearchSuggestion[]
  filters?: SearchFilter[]
  recentSearches?: SearchHistoryItem[]
  
  // Configuration
  placeholder?: string
  searchButtonText?: string
  maxSuggestions?: number
  maxHistoryItems?: number
  
  // Styling
  variant?: 'default' | 'outlined' | 'filled' | 'minimal' | 'floating' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical' | 'compact'
  
  // State
  loading?: boolean
  disabled?: boolean
  readOnly?: boolean
  
  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  
  // Refs
  inputRef?: React.RefObject<HTMLInputElement>
  
  // Callbacks
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  onFilterAdd?: (filter: SearchFilter) => void
  onFilterRemove?: (filterId: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
}

const SearchBox = forwardRef<HTMLDivElement, SearchBoxProps>(({
  // Core functionality
  value = '',
  onSearch,
  onChange,
  onClear,
  
  // Search features
  debounceMs = 300,
  enableRealTime = false,
  enableSuggestions = true,
  enableFilters = true,
  enableHistory = true,
  minQueryLength = 2,
  
  // Data
  suggestions = [],
  filters = [],
  recentSearches = [],
  
  // Configuration
  placeholder = 'Search...',
  searchButtonText = 'Search',
  maxSuggestions = 8,
  maxHistoryItems = 5,
  
  // Styling
  variant = 'default',
  size = 'md',
  layout = 'horizontal',
  
  // State
  loading = false,
  disabled = false,
  readOnly = false,
  
  // Accessibility
  'aria-label': ariaLabel = 'Search input',
  'aria-describedby': ariaDescribedBy,
  
  // Refs
  inputRef,
  
  // Callbacks
  onSuggestionSelect,
  onFilterAdd,
  onFilterRemove,
  onFocus,
  onBlur,
  onKeyDown,
}, ref) => {
  // State management
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<SearchFilter[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const inputElementRef = inputRef || useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const searchHistory = useRef<SearchHistoryItem[]>([...recentSearches])
  
  // Update query when value prop changes
  useEffect(() => {
    setQuery(value)
  }, [value])
  
  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim().length >= minQueryLength) {
        setIsSearching(true)
        onSearch?.(searchQuery.trim(), selectedFilters)
        setTimeout(() => setIsSearching(false), 500) // Simulate search delay
      }
    }, debounceMs)
  }, [debounceMs, minQueryLength, onSearch, selectedFilters])
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    
    if (enableRealTime && newValue.trim().length >= minQueryLength) {
      debouncedSearch(newValue)
    }
  }, [onChange, enableRealTime, minQueryLength, debouncedSearch])
  
  // Handle search submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (disabled || readOnly) return
    
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    
    // Add to history
    if (enableHistory) {
      const existingIndex = searchHistory.current.findIndex(item => item.query === trimmedQuery)
      if (existingIndex >= 0) {
        searchHistory.current.splice(existingIndex, 1)
      }
      searchHistory.current.unshift({
        query: trimmedQuery,
        timestamp: Date.now(),
        results: 0 // This would be updated by the parent component
      })
      searchHistory.current = searchHistory.current.slice(0, maxHistoryItems)
    }
    
    onSearch?.(trimmedQuery, selectedFilters)
    setIsOpen(false)
    
    // Focus management
    setTimeout(() => {
      inputElementRef.current?.blur()
    }, 100)
  }, [query, disabled, readOnly, onSearch, selectedFilters, enableHistory, maxHistoryItems])
  
  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('')
    setSelectedFilters([])
    onClear?.()
    setIsOpen(false)
    inputElementRef.current?.focus()
  }, [onClear])
  
  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setIsOpen(false)
    onSuggestionSelect?.(suggestion)
    
    // Add to history
    if (enableHistory && suggestion.type === 'recent') {
      const existingIndex = searchHistory.current.findIndex(item => item.query === suggestion.text)
      if (existingIndex >= 0) {
        searchHistory.current.splice(existingIndex, 1)
      }
      searchHistory.current.unshift({
        query: suggestion.text,
        timestamp: Date.now()
      })
    }
    
    // Trigger search
    setTimeout(() => {
      onSearch?.(suggestion.text, selectedFilters)
    }, 100)
  }, [onSuggestionSelect, onSearch, selectedFilters, enableHistory])
  
  // Handle filter operations
  const handleFilterAdd = useCallback((filter: SearchFilter) => {
    if (!selectedFilters.find(f => f.id === filter.id)) {
      const newFilters = [...selectedFilters, filter]
      setSelectedFilters(newFilters)
      onFilterAdd?.(filter)
    }
  }, [selectedFilters, onFilterAdd])
  
  const handleFilterRemove = useCallback((filterId: string) => {
    const newFilters = selectedFilters.filter(f => f.id !== filterId)
    setSelectedFilters(newFilters)
    onFilterRemove?.(filterId)
  }, [selectedFilters, onFilterRemove])
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled || readOnly) return
    
    const allSuggestions = getAllSuggestions()
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setIsOpen(true)
        setActiveSuggestion(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        )
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setIsOpen(true)
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        )
        break
        
      case 'Enter':
        e.preventDefault()
        if (isOpen && activeSuggestion >= 0 && activeSuggestion < allSuggestions.length) {
          handleSuggestionSelect(allSuggestions[activeSuggestion])
        } else {
          handleSubmit()
        }
        break
        
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveSuggestion(-1)
        inputElementRef.current?.blur()
        break
        
      case 'Tab':
        if (!isOpen) {
          setIsOpen(false)
          setActiveSuggestion(-1)
        }
        break
    }
    
    onKeyDown?.(e)
  }, [disabled, readOnly, isOpen, activeSuggestion, handleSubmit, handleSuggestionSelect, onKeyDown])
  
  // Focus and blur handlers
  const handleFocus = useCallback(() => {
    setIsOpen(true)
    onFocus?.()
  }, [onFocus])
  
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Delay to allow clicks on suggestions
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setActiveSuggestion(-1)
      }
    }, 200)
    onBlur?.()
  }, [onBlur])
  
  // Get all suggestions combining history, filters, and provided suggestions
  const getAllSuggestions = useCallback(() => {
    const allSuggestions: SearchSuggestion[] = []
    
    // Add recent searches
    if (enableHistory && searchHistory.current.length > 0) {
      searchHistory.current.slice(0, maxHistoryItems).forEach((item, index) => {
        allSuggestions.push({
          id: `recent-${index}`,
          text: item.query,
          type: 'recent',
          timestamp: item.timestamp
        })
      })
    }
    
    // Add filters as suggestions
    if (enableFilters && selectedFilters.length === 0) {
      filters.forEach(filter => {
        allSuggestions.push({
          id: `filter-${filter.id}`,
          text: filter.label,
          type: 'category',
          category: filter.category,
          tags: [filter.value]
        })
      })
    }
    
    // Add provided suggestions
    if (enableSuggestions && query.trim().length >= minQueryLength) {
      const filteredSuggestions = suggestions
        .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
        .slice(0, maxSuggestions)
      
      allSuggestions.push(...filteredSuggestions)
    }
    
    return allSuggestions
  }, [enableHistory, enableSuggestions, enableFilters, suggestions, query, selectedFilters, filters, minQueryLength, maxSuggestions, maxHistoryItems])
  
  // Computed classes
  const containerClasses = useMemo(() => cn(
    'searchbox',
    `searchbox--${variant}`,
    `searchbox--${size}`,
    `searchbox--${layout}`,
    {
      'searchbox--open': isOpen,
      'searchbox--loading': loading || isSearching,
      'searchbox--disabled': disabled,
      'searchbox--readonly': readOnly,
      'searchbox--has-filters': selectedFilters.length > 0,
      'searchbox--has-query': query.trim().length > 0
    }
  ), [variant, size, layout, isOpen, loading, isSearching, disabled, readOnly, selectedFilters.length, query])
  
  const allSuggestions = getAllSuggestions()
  
  return (
    <div 
      ref={ref}
      className={containerClasses}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      role="combobox"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <form 
        ref={containerRef}
        className="searchbox__form"
        onSubmit={handleSubmit}
        role="search"
      >
        <div className="searchbox__input-container">
          {/* Search icon */}
          <MagnifyingGlassIcon 
            className="searchbox__icon searchbox__icon--search"
            aria-hidden="true"
          />
          
          {/* Input field */}
          <input
            ref={inputElementRef}
            type="text"
            className="searchbox__input"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete="off"
            role="searchbox"
            aria-expanded={isOpen}
            aria-controls="searchbox-suggestions"
            aria-autocomplete="list"
          />
          
          {/* Loading indicator */}
          {(loading || isSearching) && (
            <div className="searchbox__loading" aria-hidden="true">
              <div className="searchbox__spinner" />
            </div>
          )}
          
          {/* Clear button */}
          {query && (
            <button
              type="button"
              className="searchbox__clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <XMarkIcon aria-hidden="true" />
            </button>
          )}
          
          {/* Filter toggle */}
          {enableFilters && (
            <button
              type="button"
              className="searchbox__filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <ChevronDownIcon 
                className={`searchbox__icon searchbox__icon--chevron ${showFilters ? 'searchbox__icon--chevron--up' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        
        {/* Search button */}
        <button
          type="submit"
          className="searchbox__button"
          disabled={disabled || readOnly || !query.trim()}
          aria-label={`${searchButtonText}: ${query || placeholder}`}
        >
          {searchButtonText}
        </button>
      </form>
      
      {/* Selected filters */}
      {selectedFilters.length > 0 && (
        <div className="searchbox__selected-filters" role="list" aria-label="Active filters">
          {selectedFilters.map(filter => (
            <span 
              key={filter.id}
              className="searchbox__filter-tag"
              style={{ 
                backgroundColor: filter.color,
                color: filter.color ? '#fff' : undefined 
              }}
              role="listitem"
            >
              <TagIcon className="searchbox__filter-icon" aria-hidden="true" />
              {filter.label}
              <button
                type="button"
                className="searchbox__filter-remove"
                onClick={() => handleFilterRemove(filter.id)}
                aria-label={`Remove filter ${filter.label}`}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Filter panel */}
      {showFilters && enableFilters && (
        <div className="searchbox__filter-panel" role="region" aria-label="Search filters">
          {filters.length > 0 ? (
            <div className="searchbox__filter-groups">
              {Object.entries(
                filters.reduce((groups, filter) => {
                  const category = filter.category || 'Other'
                  if (!groups[category]) groups[category] = []
                  groups[category].push(filter)
                  return groups
                }, {} as Record<string, SearchFilter[]>)
              ).map(([category, categoryFilters]) => (
                <div key={category} className="searchbox__filter-group">
                  <h4 className="searchbox__filter-group-title">{category}</h4>
                  <div className="searchbox__filter-options">
                    {categoryFilters.map(filter => (
                      <label 
                        key={filter.id}
                        className="searchbox__filter-option"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(f => f.id === filter.id)}
                          onChange={() => {
                            if (selectedFilters.some(f => f.id === filter.id)) {
                              handleFilterRemove(filter.id)
                            } else {
                              handleFilterAdd(filter)
                            }
                          }}
                          className="searchbox__filter-checkbox"
                        />
                        <span 
                          className="searchbox__filter-color"
                          style={{ backgroundColor: filter.color }}
                          aria-hidden="true"
                        />
                        <span className="searchbox__filter-label">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="searchbox__filter-empty">
              No filters available
            </div>
          )}
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {isOpen && allSuggestions.length > 0 && (
        <div 
          className="searchbox__suggestions"
          id="searchbox-suggestions"
          role="listbox"
          aria-label="Search suggestions"
        >
          {allSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={`searchbox__suggestion ${index === activeSuggestion ? 'searchbox__suggestion--active' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={index === activeSuggestion}
            >
              <div className="searchbox__suggestion-content">
                <div className="searchbox__suggestion-main">
                  {suggestion.type === 'recent' && (
                    <ClockIcon className="searchbox__suggestion-icon" aria-hidden="true" />
                  )}
                  {suggestion.type === 'category' && (
                    <TagIcon className="searchbox__suggestion-icon" aria-hidden="true" />
                  )}
                  {suggestion.type !== 'recent' && suggestion.type !== 'category' && (
                    <MagnifyingGlassIcon className="searchbox__suggestion-icon" aria-hidden="true" />
                  )}
                  <span 
                    className="searchbox__suggestion-text"
                    dangerouslySetInnerHTML={{
                      __html: suggestion.text.replace(
                        new RegExp(`(${query})`, 'gi'),
                        '<mark>$1</mark>'
                      )
                    }}
                  />
                </div>
                <div className="searchbox__suggestion-meta">
                  {suggestion.type === 'popular' && suggestion.count && (
                    <span className="searchbox__suggestion-count">
                      {suggestion.count.toLocaleString()} results
                    </span>
                  )}
                  {suggestion.category && (
                    <span className="searchbox__suggestion-category">
                      {suggestion.category}
                    </span>
                  )}
                  {suggestion.tags && suggestion.tags.length > 0 && (
                    <div className="searchbox__suggestion-tags">
                      {suggestion.tags.map(tag => (
                        <span key={tag} className="searchbox__suggestion-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {isOpen && allSuggestions.length === 0 && query.trim().length >= minQueryLength && (
        <div className="searchbox__empty">
          <MagnifyingGlassIcon className="searchbox__empty-icon" aria-hidden="true" />
          <div className="searchbox__empty-content">
            <p className="searchbox__empty-text">
              No suggestions found for "{query}"
            </p>
            <p className="searchbox__empty-hint">
              Try adjusting your search terms
            </p>
          </div>
        </div>
      )}
    </div>
  )
})

SearchBox.displayName = 'SearchBox'

export default SearchBox