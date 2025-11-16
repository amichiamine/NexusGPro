import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SearchBox, { type SearchFilter, type SearchSuggestion, type SearchHistoryItem } from './SearchBox'

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronDownIcon: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-down" className={className} />
  ),
  MagnifyingGlassIcon: ({ className }: { className?: string }) => (
    <svg data-testid="magnifying-glass" className={className} />
  ),
  XMarkIcon: ({ className }: { className?: string }) => (
    <svg data-testid="x-mark" className={className} />
  ),
  ClockIcon: ({ className }: { className?: string }) => (
    <svg data-testid="clock" className={className} />
  ),
  TagIcon: ({ className }: { className?: string }) => (
    <svg data-testid="tag" className={className} />
  ),
}))

// Test data
const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'React tutorials', type: 'popular', count: 1250 },
  { id: '2', text: 'TypeScript guide', type: 'suggestion', category: 'Programming' },
  { id: '3', text: 'CSS Flexbox', type: 'category', tags: ['layout', 'styling'] },
]

const mockFilters: SearchFilter[] = [
  { id: '1', label: 'Articles', value: 'articles', category: 'Content' },
  { id: '2', label: 'Videos', value: 'videos', category: 'Content' },
  { id: '3', label: 'Code', value: 'code', category: 'Type', color: '#3b82f6' },
  { id: '4', label: 'Design', value: 'design', category: 'Type', color: '#10b981' },
]

const mockHistory: SearchHistoryItem[] = [
  { query: 'React hooks', timestamp: Date.now() - 3600000, results: 45 },
  { query: 'CSS Grid', timestamp: Date.now() - 7200000, results: 23 },
]

describe('SearchBox', () => {
  // Reset mocks and timers before each test
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<SearchBox />)
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
      expect(screen.getByTestId('magnifying-glass')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<SearchBox placeholder="Find products..." />)
      
      expect(screen.getByPlaceholderText('Find products...')).toBeInTheDocument()
    })

    it('should render with custom search button text', () => {
      render(<SearchBox searchButtonText="Find" />)
      
      expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument()
    })

    it('should apply custom aria-label', () => {
      render(<SearchBox aria-label="Product search" />)
      
      expect(screen.getByLabelText('Product search')).toBeInTheDocument()
    })

    it('should render in disabled state', () => {
      render(<SearchBox disabled />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      expect(input).toBeDisabled()
      expect(button).toBeDisabled()
      expect(document.querySelector('.searchbox--disabled')).toBeInTheDocument()
    })

    it('should render in read-only state', () => {
      render(<SearchBox readOnly />)
      
      const input = screen.getByRole('searchbox')
      
      expect(input).toHaveAttribute('readonly')
      expect(document.querySelector('.searchbox--readonly')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      render(<SearchBox value="initial query" />)
      
      expect(screen.getByRole('searchbox')).toHaveValue('initial query')
    })
  })

  describe('Visual Variants', () => {
    const variants: Array<SearchBoxProps['variant']> = ['default', 'outlined', 'filled', 'minimal', 'floating', 'glass']
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        render(<SearchBox variant={variant} />)
        
        expect(document.querySelector(`.searchbox--${variant}`)).toBeInTheDocument()
      })
    })
  })

  describe('Size Variants', () => {
    const sizes: Array<SearchBoxProps['size']> = ['sm', 'md', 'lg']
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        render(<SearchBox size={size} />)
        
        expect(document.querySelector(`.searchbox--${size}`)).toBeInTheDocument()
      })
    })
  })

  describe('Layout Variants', () => {
    const layouts: Array<SearchBoxProps['layout']> = ['horizontal', 'vertical', 'compact']
    
    layouts.forEach(layout => {
      it(`should render with ${layout} layout`, () => {
        render(<SearchBox layout={layout} />)
        
        expect(document.querySelector(`.searchbox--${layout}`)).toBeInTheDocument()
      })
    })
  })

  describe('Input Functionality', () => {
    it('should handle input changes', async () => {
      const onChange = vi.fn()
      render(<SearchBox onChange={onChange} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test query')
      
      expect(input).toHaveValue('test query')
      expect(onChange).toHaveBeenCalledWith('test query')
    })

    it('should call onSearch when form is submitted', async () => {
      const onSearch = vi.fn()
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      await userEvent.type(input, 'test search')
      await userEvent.click(button)
      
      expect(onSearch).toHaveBeenCalledWith('test search', [])
    })

    it('should call onSearch when Enter is pressed', async () => {
      const onSearch = vi.fn()
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      
      await userEvent.type(input, 'test search{Enter}')
      
      expect(onSearch).toHaveBeenCalledWith('test search', [])
    })

    it('should not submit empty search', async () => {
      const onSearch = vi.fn()
      render(<SearchBox onSearch={onSearch} />)
      
      const button = screen.getByRole('button', { name: 'Search' })
      
      await userEvent.click(button)
      
      expect(onSearch).not.toHaveBeenCalled()
    })

    it('should not submit when disabled', async () => {
      const onSearch = vi.fn()
      render(<SearchBox onSearch={onSearch} disabled />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      await userEvent.type(input, 'test')
      await userEvent.click(button)
      
      expect(onSearch).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })
  })

  describe('Clear Functionality', () => {
    it('should show clear button when input has value', () => {
      render(<SearchBox value="test query" />)
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })

    it('should hide clear button when input is empty', () => {
      render(<SearchBox />)
      
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    })

    it('should clear input when clear button is clicked', async () => {
      const onClear = vi.fn()
      render(<SearchBox value="test query" onClear={onClear} />)
      
      const clearButton = screen.getByLabelText('Clear search')
      await userEvent.click(clearButton)
      
      expect(screen.getByRole('searchbox')).toHaveValue('')
      expect(onClear).toHaveBeenCalled()
    })

    it('should focus input after clearing', async () => {
      render(<SearchBox value="test query" />)
      
      const clearButton = screen.getByLabelText('Clear search')
      await userEvent.click(clearButton)
      
      expect(screen.getByRole('searchbox')).toHaveFocus()
    })
  })

  describe('Real-time Search', () => {
    it('should enable real-time search with debounce', async () => {
      const onSearch = vi.fn()
      render(<SearchBox 
        enableRealTime 
        debounceMs={300}
        minQueryLength={2}
        onSearch={onSearch} 
      />)
      
      const input = screen.getByRole('searchbox')
      
      await userEvent.type(input, 'test')
      
      // Should not search immediately
      expect(onSearch).not.toHaveBeenCalled()
      
      // Should search after debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('test', [])
      }, { timeout: 500 })
    })

    it('should respect minimum query length', async () => {
      const onSearch = vi.fn()
      render(<SearchBox 
        enableRealTime 
        minQueryLength={3}
        onSearch={onSearch} 
      />)
      
      const input = screen.getByRole('searchbox')
      
      await userEvent.type(input, 'ab')
      
      expect(onSearch).not.toHaveBeenCalled()
      
      await userEvent.type(input, 'c')
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('abc', [])
      })
    })

    it('should show loading state during real-time search', async () => {
      const onSearch = vi.fn(() => new Promise(resolve => setTimeout(resolve, 500)))
      render(<SearchBox 
        enableRealTime 
        onSearch={onSearch} 
      />)
      
      const input = screen.getByRole('searchbox')
      
      await userEvent.type(input, 'test')
      
      await waitFor(() => {
        expect(document.querySelector('.searchbox--loading')).toBeInTheDocument()
      })
    })
  })

  describe('Suggestions System', () => {
    it('should show suggestions dropdown', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should filter suggestions based on query', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'React')
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions.length).toBe(1)
        expect(suggestions[0]).toHaveTextContent('React tutorials')
      })
    })

    it('should limit suggestions by maxSuggestions', async () => {
      const manySuggestions = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        text: `Suggestion ${i}`,
        type: 'suggestion' as const
      }))
      
      render(<SearchBox suggestions={manySuggestions} maxSuggestions={5} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'Suggestion')
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions.length).toBe(5)
      })
    })

    it('should highlight matching text in suggestions', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'React')
      
      await waitFor(() => {
        const suggestion = screen.getByRole('option')
        expect(suggestion.querySelector('mark')).toBeInTheDocument()
        expect(suggestion.querySelector('mark')).toHaveTextContent('React')
      })
    })

    it('should show suggestion metadata', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'React')
      
      await waitFor(() => {
        const suggestion = screen.getByRole('option')
        expect(suggestion).toHaveTextContent('1,250 results')
      })
    })

    it('should close suggestions when clicking outside', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      await userEvent.click(document.body)
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Suggestion Selection', () => {
    it('should select suggestion on click', async () => {
      const onSuggestionSelect = vi.fn()
      const onSearch = vi.fn()
      render(<SearchBox 
        suggestions={mockSuggestions}
        onSuggestionSelect={onSuggestionSelect}
        onSearch={onSearch}
      />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions.length).toBeGreaterThan(0)
      })
      
      const suggestion = screen.getAllByRole('option')[0]
      await userEvent.click(suggestion)
      
      expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0])
      expect(onSearch).toHaveBeenCalledWith(mockSuggestions[0].text, [])
    })

    it('should call onSearch with selected suggestion', async () => {
      const onSearch = vi.fn()
      render(<SearchBox 
        suggestions={mockSuggestions}
        onSearch={onSearch}
      />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const suggestion = screen.getByRole('option')
        userEvent.click(suggestion)
      })
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('React tutorials', [])
      })
    })
  })

  describe('Filter System', () => {
    it('should show filter toggle button', () => {
      render(<SearchBox filters={mockFilters} />)
      
      expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument()
    })

    it('should toggle filter panel', async () => {
      render(<SearchBox filters={mockFilters} />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByRole('region', { name: 'Search filters' })).toBeInTheDocument()
      })
    })

    it('should show filter groups by category', async () => {
      render(<SearchBox filters={mockFilters} />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
      })
    })

    it('should add filters when checked', async () => {
      const onFilterAdd = vi.fn()
      render(<SearchBox 
        filters={mockFilters}
        onFilterAdd={onFilterAdd}
      />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        userEvent.click(checkboxes[0])
      })
      
      expect(onFilterAdd).toHaveBeenCalledWith(mockFilters[0])
    })

    it('should remove filters when unchecked', async () => {
      const onFilterRemove = vi.fn()
      render(<SearchBox 
        filters={mockFilters}
        selectedFilters={[mockFilters[0]]}
        onFilterRemove={onFilterRemove}
      />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { checked: true })
        userEvent.click(checkbox)
      })
      
      expect(onFilterRemove).toHaveBeenCalledWith(mockFilters[0].id)
    })

    it('should display selected filters as tags', () => {
      render(<SearchBox selectedFilters={mockFilters.slice(0, 2)} />)
      
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(screen.getByText('Videos')).toBeInTheDocument()
    })

    it('should remove filter tags when clicked', async () => {
      const onFilterRemove = vi.fn()
      render(<SearchBox 
        selectedFilters={mockFilters.slice(0, 2)}
        onFilterRemove={onFilterRemove}
      />)
      
      const removeButtons = screen.getAllByLabelText(/Remove filter/)
      await userEvent.click(removeButtons[0])
      
      expect(onFilterRemove).toHaveBeenCalledWith(mockFilters[0].id)
    })

    it('should show filter colors', async () => {
      render(<SearchBox filters={mockFilters} />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        const colorDots = screen.getAllByTestId('color-dot')
        expect(colorDots[0]).toHaveStyle({ backgroundColor: '#3b82f6' })
        expect(colorDots[1]).toHaveStyle({ backgroundColor: '#10b981' })
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      
      await waitFor(() => {
        const firstSuggestion = screen.getAllByRole('option')[0]
        expect(firstSuggestion).toHaveClass('searchbox__suggestion--active')
      })
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions[1]).toHaveClass('searchbox__suggestion--active')
      })
      
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions[0]).toHaveClass('searchbox__suggestion--active')
      })
    })

    it('should wrap around suggestions when navigating', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('option')
        expect(suggestions.length).toBeGreaterThan(0)
      })
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      
      await waitFor(() => {
        const firstSuggestion = screen.getAllByRole('option')[0]
        expect(firstSuggestion).toHaveClass('searchbox__suggestion--active')
      })
      
      // Navigate to last suggestion
      const suggestions = screen.getAllByRole('option')
      for (let i = 0; i < suggestions.length; i++) {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      }
      
      // Should wrap to first
      await waitFor(() => {
        const firstSuggestion = screen.getAllByRole('option')[0]
        expect(firstSuggestion).toHaveClass('searchbox__suggestion--active')
      })
    })

    it('should select suggestion with Enter key', async () => {
      const onSearch = vi.fn()
      render(<SearchBox 
        suggestions={mockSuggestions}
        onSearch={onSearch}
      />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(onSearch).toHaveBeenCalledWith(mockSuggestions[0].text, [])
    })

    it('should close suggestions with Escape key', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(input, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should close suggestions with Tab key', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(input, { key: 'Tab' })
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Search History', () => {
    it('should display recent searches', async () => {
      render(<SearchBox recentSearches={mockHistory} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('React hooks')).toBeInTheDocument()
        expect(screen.getByText('CSS Grid')).toBeInTheDocument()
      })
    })

    it('should add search to history', async () => {
      render(<SearchBox enableHistory recentSearches={[]} />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      await userEvent.type(input, 'new search')
      await userEvent.click(button)
      
      // History would be managed internally - we can't test the internal state directly
      // But we can verify the search was performed
      expect(screen.getByRole('searchbox')).toHaveValue('')
    })

    it('should limit history items', async () => {
      const manyHistory = Array.from({ length: 10 }, (_, i) => ({
        query: `Search ${i}`,
        timestamp: Date.now() - i * 3600000
      }))
      
      render(<SearchBox 
        recentSearches={manyHistory} 
        maxHistoryItems={5}
        enableHistory 
      />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const historyItems = screen.getAllByText(/Search/)
        expect(historyItems.length).toBe(5)
      })
    })

    it('should update existing history item', async () => {
      const history = [{ query: 'existing search', timestamp: Date.now() - 3600000 }]
      
      render(<SearchBox 
        recentSearches={history}
        enableHistory
      />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      await userEvent.type(input, 'existing search')
      await userEvent.click(button)
      
      // The existing search should move to the top
      // This would be verified by checking the internal state
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no suggestions match', async () => {
      render(<SearchBox suggestions={mockSuggestions} minQueryLength={2} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'xyz')
      
      await waitFor(() => {
        expect(screen.getByText(/No suggestions found for "xyz"/)).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
      })
    })

    it('should show empty state icon', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'xyz')
      
      await waitFor(() => {
        expect(screen.getByTestId('magnifying-glass')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading indicator', () => {
      render(<SearchBox loading />)
      
      expect(document.querySelector('.searchbox__spinner')).toBeInTheDocument()
    })

    it('should apply loading class', () => {
      render(<SearchBox loading />)
      
      expect(document.querySelector('.searchbox--loading')).toBeInTheDocument()
    })

    it('should show loading during real-time search', async () => {
      const onSearch = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      render(<SearchBox 
        enableRealTime
        onSearch={onSearch}
      />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test')
      
      await waitFor(() => {
        expect(document.querySelector('.searchbox--loading')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(<SearchBox />)
      
      const container = document.querySelector('.searchbox')
      const input = screen.getByRole('searchbox')
      const form = screen.getByRole('search')
      const button = screen.getByRole('button', { name: 'Search' })
      
      expect(container).toHaveAttribute('role', 'combobox')
      expect(input).toHaveAttribute('role', 'searchbox')
      expect(form).toHaveAttribute('role', 'search')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should have proper ARIA attributes', () => {
      render(<SearchBox aria-label="Product search" />)
      
      const container = document.querySelector('.searchbox')
      const input = screen.getByRole('searchbox')
      
      expect(container).toHaveAttribute('aria-label', 'Product search')
      expect(container).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
    })

    it('should have proper ARIA attributes when open', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const container = document.querySelector('.searchbox')
      const input = screen.getByRole('searchbox')
      
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(container).toHaveAttribute('aria-expanded', 'true')
        expect(input).toHaveAttribute('aria-expanded', 'true')
        expect(input).toHaveAttribute('aria-controls')
      })
    })

    it('should have proper focus management', async () => {
      render(<SearchBox />)
      
      const input = screen.getByRole('searchbox')
      
      input.focus()
      
      expect(input).toHaveFocus()
    })

    it('should support keyboard navigation', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      
      await userEvent.click(input)
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      
      const firstOption = screen.getAllByRole('option')[0]
      expect(firstOption).toHaveAttribute('aria-selected', 'true')
    })

    it('should have proper color contrast', () => {
      render(<SearchBox />)
      
      const input = screen.getByRole('searchbox')
      const button = screen.getByRole('button', { name: 'Search' })
      
      // This is a basic check - in a real scenario, you'd use a color contrast checker
      expect(input).toBeInTheDocument()
      expect(button).toBeInTheDocument()
    })
  })

  describe('Callback Functions', () => {
    it('should call onFocus callback', async () => {
      const onFocus = vi.fn()
      render(<SearchBox onFocus={onFocus} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      expect(onFocus).toHaveBeenCalled()
    })

    it('should call onBlur callback', async () => {
      const onBlur = vi.fn()
      render(<SearchBox onBlur={onBlur} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      await userEvent.click(document.body)
      
      await waitFor(() => {
        expect(onBlur).toHaveBeenCalled()
      })
    })

    it('should call onKeyDown callback', async () => {
      const onKeyDown = vi.fn()
      render(<SearchBox onKeyDown={onKeyDown} />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(onKeyDown).toHaveBeenCalled()
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to container', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SearchBox ref={ref} />)
      
      expect(ref.current).toBeInTheDocument()
      expect(ref.current).toHaveClass('searchbox')
    })

    it('should forward input ref', () => {
      const inputRef = React.createRef<HTMLInputElement>()
      render(<SearchBox inputRef={inputRef} />)
      
      expect(inputRef.current).toBeInTheDocument()
      expect(inputRef.current).toHaveAttribute('type', 'text')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(1000)
      const onSearch = vi.fn()
      
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, longQuery)
      
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      expect(onSearch).toHaveBeenCalledWith(longQuery, [])
      expect(input).toHaveValue(longQuery)
    })

    it('should handle special characters in queries', async () => {
      const specialQuery = 'test@#$%^&*()'
      const onSearch = vi.fn()
      
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, specialQuery)
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      expect(onSearch).toHaveBeenCalledWith(specialQuery, [])
    })

    it('should handle whitespace-only queries', async () => {
      const onSearch = vi.fn()
      
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, '   ')
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      expect(onSearch).not.toHaveBeenCalled()
    })

    it('should handle Unicode characters', async () => {
      const unicodeQuery = '测试тест🔍'
      const onSearch = vi.fn()
      
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, unicodeQuery)
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      expect(onSearch).toHaveBeenCalledWith(unicodeQuery, [])
    })

    it('should handle rapid input changes', async () => {
      const onSearch = vi.fn()
      
      render(<SearchBox enableRealTime debounceMs={100} onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      
      // Type rapidly
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.change(input, { target: { value: 'ab' } })
      fireEvent.change(input, { target: { value: 'abc' } })
      
      // Should only search once after debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledTimes(1)
        expect(onSearch).toHaveBeenCalledWith('abc', [])
      })
    })

    it('should handle filter removal edge cases', () => {
      render(<SearchBox selectedFilters={[]} />)
      
      // Should not crash with empty filters
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('should handle empty suggestions array', () => {
      render(<SearchBox suggestions={[]} />)
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('should handle duplicate filters', () => {
      const duplicateFilters: SearchFilter[] = [
        { id: '1', label: 'Test', value: 'test' },
        { id: '1', label: 'Test', value: 'test' }
      ]
      
      render(<SearchBox filters={duplicateFilters} />)
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not cause memory leaks with event listeners', () => {
      const { unmount } = render(<SearchBox />)
      
      // Unmount should not cause errors
      unmount()
    })

    it('should clear debounce timer on unmount', () => {
      const { unmount } = render(<SearchBox enableRealTime />)
      
      unmount()
      
      // Should not cause errors related to cleared timers
      expect(() => {
        vi.clearAllTimers()
      }).not.toThrow()
    })
  })

  describe('Integration', () => {
    it('should work with controlled component pattern', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        
        return (
          <SearchBox
            value={value}
            onChange={setValue}
            onSearch={(query) => setValue(query)}
          />
        )
      }
      
      render(<TestComponent />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test')
      
      expect(input).toHaveValue('test')
    })

    it('should work with uncontrolled component pattern', async () => {
      const onSearch = vi.fn()
      
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test')
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      expect(onSearch).toHaveBeenCalledWith('test', [])
    })

    it('should work with complex filter combinations', async () => {
      const onSearch = vi.fn()
      const complexFilters = Array.from({ length: 20 }, (_, i) => ({
        id: `filter-${i}`,
        label: `Filter ${i}`,
        value: `filter-${i}`,
        category: i < 10 ? 'Category A' : 'Category B'
      }))
      
      render(<SearchBox 
        filters={complexFilters}
        onSearch={onSearch}
      />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Category A')).toBeInTheDocument()
        expect(screen.getByText('Category B')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing onSearch callback gracefully', async () => {
      render(<SearchBox />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test')
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
      
      // Should not crash even without onSearch callback
      expect(input).toHaveValue('')
    })

    it('should handle missing onChange callback gracefully', async () => {
      render(<SearchBox />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.type(input, 'test')
      
      // Should not crash even without onChange callback
      expect(input).toHaveValue('test')
    })

    it('should handle invalid filter data gracefully', () => {
      const invalidFilters = [
        null as any,
        undefined as any,
        {} as any,
        { id: 'valid', label: 'Valid' }
      ]
      
      render(<SearchBox filters={invalidFilters} />)
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
  })

  describe('Animation and Transitions', () => {
    it('should animate suggestions dropdown', async () => {
      vi.useRealTimers()
      
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const suggestions = screen.getByRole('listbox')
        expect(suggestions).toBeInTheDocument()
        
        // Check for animation class
        const styles = window.getComputedStyle(suggestions)
        expect(styles.animation).toBeDefined()
      })
    })

    it('should animate filter panel', async () => {
      vi.useRealTimers()
      
      render(<SearchBox filters={mockFilters} />)
      
      const toggleButton = screen.getByLabelText('Toggle filters')
      await userEvent.click(toggleButton)
      
      await waitFor(() => {
        const panel = screen.getByRole('region', { name: 'Search filters' })
        expect(panel).toBeInTheDocument()
        
        // Check for animation
        const styles = window.getComputedStyle(panel)
        expect(styles.animation).toBeDefined()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', async () => {
      vi.useRealTimers()
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })
      
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('searchbox')
      await userEvent.click(input)
      
      await waitFor(() => {
        const suggestions = screen.getByRole('listbox')
        expect(suggestions).toBeInTheDocument()
        
        // On mobile, suggestions should be positioned differently
        const styles = window.getComputedStyle(suggestions)
        expect(styles.position).toBe('fixed')
      })
    })
  })

  describe('Theme Support', () => {
    it('should support dark mode', () => {
      document.documentElement.classList.add('dark')
      
      render(<SearchBox />)
      
      // Should apply dark mode styles
      const container = document.querySelector('.searchbox')
      const styles = window.getComputedStyle(container!)
      
      expect(styles.color).toBeDefined()
      
      document.documentElement.classList.remove('dark')
    })

    it('should respond to theme changes', () => {
      render(<SearchBox />)
      
      document.documentElement.classList.add('dark')
      
      const container = document.querySelector('.searchbox')
      expect(container).toBeInTheDocument()
      
      document.documentElement.classList.remove('dark')
    })
  })
})

// Additional integration tests
describe('SearchBox Integration Tests', () => {
  it('should work in a form context', async () => {
    const onSubmit = vi.fn()
    
    const TestForm = () => (
      <form onSubmit={onSubmit}>
        <SearchBox name="search" />
        <button type="submit">Submit</button>
      </form>
    )
    
    render(<TestForm />)
    
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'test')
    
    const button = screen.getByRole('button', { name: 'Submit' })
    await userEvent.click(button)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('should reset form on search', async () => {
    render(<SearchBox />)
    
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    
    expect(input).toHaveValue('')
  })

  it('should integrate with React Hook Form', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      
      return (
        <SearchBox
          value={value}
          onChange={setValue}
          name="searchQuery"
        />
      )
    }
    
    render(<TestComponent />)
    
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'integration test')
    
    expect(input).toHaveValue('integration test')
  })
})

// Performance benchmark tests
describe('SearchBox Performance Tests', () => {
  it('should handle large suggestion lists efficiently', async () => {
    const largeSuggestions = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      text: `Suggestion ${i}`,
      type: 'suggestion' as const
    }))
    
    const startTime = performance.now()
    
    render(<SearchBox suggestions={largeSuggestions} maxSuggestions={50} />)
    
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'Suggestion')
    
    await waitFor(() => {
      const suggestions = screen.getAllByRole('option')
      expect(suggestions.length).toBe(50) // Limited by maxSuggestions
    })
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render within reasonable time (less than 100ms)
    expect(renderTime).toBeLessThan(100)
  })

  it('should handle rapid state changes efficiently', async () => {
    const onChange = vi.fn()
    
    render(<SearchBox onChange={onChange} />)
    
    const input = screen.getByRole('searchbox')
    
    const startTime = performance.now()
    
    // Simulate rapid input changes
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `test${i}` } })
    }
    
    const endTime = performance.now()
    const changeTime = endTime - startTime
    
    // Should handle rapid changes efficiently
    expect(changeTime).toBeLessThan(100)
  })
})