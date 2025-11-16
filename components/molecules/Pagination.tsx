import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react'
import { cn } from '@/utils'

export interface PaginationProps {
  currentPage?: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  itemsPerPageOptions?: number[]
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  variant?: 'default' | 'bordered' | 'filled' | 'minimal' | 'pills'
  size?: 'sm' | 'md' | 'lg'
  showItemsPerPage?: boolean
  showTotalInfo?: boolean
  showJumpToPage?: boolean
  maxVisiblePages?: number
  showFirstLast?: boolean
  customLabels?: {
    first?: string
    previous?: string
    next?: string
    last?: string
    of?: string
    page?: string
    items?: string
    jumpToPage?: string
    itemsPerPage?: string
  }
  className?: string
  disabled?: boolean
}

export interface PaginationContextType {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  goToPage: (page: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToPreviousPage: () => void
  goToNextPage: () => void
  canGoToFirstPage: boolean
  canGoToPreviousPage: boolean
  canGoToNextPage: boolean
  canGoToLastPage: boolean
}

const Pagination = forwardRef<HTMLElement, PaginationProps>(({
  currentPage = 1,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  onPageChange,
  onItemsPerPageChange,
  variant = 'default',
  size = 'md',
  showItemsPerPage = false,
  showTotalInfo = true,
  showJumpToPage = false,
  maxVisiblePages = 7,
  showFirstLast = true,
  customLabels,
  className = '',
  disabled = false
}, ref) => {
  const [internalPage, setInternalPage] = useState(currentPage)
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(itemsPerPage)
  const [showJumpInput, setShowJumpInput] = useState(false)
  const [jumpPageValue, setJumpPageValue] = useState('')

  const isControlled = currentPage !== 1 || onPageChange !== undefined
  const page = isControlled ? currentPage : internalPage

  const isControlledItemsPerPage = itemsPerPage !== 10 || onItemsPerPageChange !== undefined
  const currentItemsPerPage = isControlledItemsPerPage ? itemsPerPage : internalItemsPerPage

  // Calculate start and end item numbers
  const startItem = (page - 1) * currentItemsPerPage + 1
  const endItem = Math.min(page * currentItemsPerPage, totalItems || totalPages * currentItemsPerPage)

  const contextValue: PaginationContextType = {
    currentPage: page,
    totalPages,
    totalItems: totalItems || totalPages * currentItemsPerPage,
    itemsPerPage: currentItemsPerPage,
    goToPage: useCallback((targetPage: number) => {
      const newPage = Math.max(1, Math.min(targetPage, totalPages))
      if (!isControlled) {
        setInternalPage(newPage)
      }
      onPageChange?.(newPage)
    }, [isControlled, onPageChange, totalPages]),
    goToFirstPage: useCallback(() => {
      contextValue.goToPage(1)
    }, [contextValue]),
    goToLastPage: useCallback(() => {
      contextValue.goToPage(totalPages)
    }, [contextValue, totalPages]),
    goToPreviousPage: useCallback(() => {
      contextValue.goToPage(page - 1)
    }, [contextValue, page]),
    goToNextPage: useCallback(() => {
      contextValue.goToPage(page + 1)
    }, [contextValue, page]),
    canGoToFirstPage: page > 1,
    canGoToPreviousPage: page > 1,
    canGoToNextPage: page < totalPages,
    canGoToLastPage: page < totalPages
  }

  // Generate visible page numbers with ellipsis
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, page - halfVisible)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    // Add first page
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }, [page, totalPages, maxVisiblePages])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (contextValue.canGoToPreviousPage) {
            contextValue.goToPreviousPage()
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          if (contextValue.canGoToNextPage) {
            contextValue.goToNextPage()
          }
          break
        case 'Home':
          event.preventDefault()
          if (contextValue.canGoToFirstPage) {
            contextValue.goToFirstPage()
          }
          break
        case 'End':
          event.preventDefault()
          if (contextValue.canGoToLastPage) {
            contextValue.goToLastPage()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, contextValue])

  const handleJumpToPage = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    const targetPage = parseInt(jumpPageValue, 10)
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
      contextValue.goToPage(targetPage)
      setJumpPageValue('')
      setShowJumpInput(false)
    }
  }, [jumpPageValue, totalPages, contextValue])

  const handleItemsPerPageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value, 10)
    if (!isControlledItemsPerPage) {
      setInternalItemsPerPage(newItemsPerPage)
    }
    onItemsPerPageChange?.(newItemsPerPage)
  }, [isControlledItemsPerPage, onItemsPerPageChange])

  const labels = {
    first: '«',
    previous: '‹',
    next: '›',
    last: '»',
    of: 'of',
    page: 'Page',
    items: 'items',
    jumpToPage: 'Jump to page',
    itemsPerPage: 'Items per page',
    ...customLabels
  }

  const paginationClasses = cn(
    'nexus-pagination',
    `nexus-pagination--${variant}`,
    `nexus-pagination--${size}`,
    className
  )

  return (
    <nav
      ref={ref}
      className={paginationClasses}
      aria-label="Pagination navigation"
      role="navigation"
      aria-disabled={disabled}
    >
      <div className="nexus-pagination__container">
        {/* First/Previous Controls */}
        <div className="nexus-pagination__controls nexus-pagination__controls--start">
          {showFirstLast && (
            <button
              type="button"
              className="nexus-pagination__button nexus-pagination__button--first"
              onClick={contextValue.goToFirstPage}
              disabled={disabled || !contextValue.canGoToFirstPage}
              aria-label={`${labels.first} (${labels.page} 1)`}
              aria-current={page === 1 ? 'page' : undefined}
            >
              {labels.first}
            </button>
          )}
          
          <button
            type="button"
            className="nexus-pagination__button nexus-pagination__button--previous"
            onClick={contextValue.goToPreviousPage}
            disabled={disabled || !contextValue.canGoToPreviousPage}
            aria-label={`${labels.previous} ${labels.page}`}
          >
            {labels.previous}
          </button>
        </div>

        {/* Page Numbers */}
        <div className="nexus-pagination__pages">
          {visiblePages.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="nexus-pagination__ellipsis"
                  aria-hidden="true"
                >
                  ...
                </span>
              )
            }

            const pageNumber = pageNum as number
            const isActive = pageNumber === page
            
            return (
              <button
                key={pageNumber}
                type="button"
                className={`nexus-pagination__button nexus-pagination__button--page ${
                  isActive ? 'nexus-pagination__button--active' : ''
                }`}
                onClick={() => contextValue.goToPage(pageNumber)}
                disabled={disabled}
                aria-label={`${labels.page} ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        {/* Next/Last Controls */}
        <div className="nexus-pagination__controls nexus-pagination__controls--end">
          <button
            type="button"
            className="nexus-pagination__button nexus-pagination__button--next"
            onClick={contextValue.goToNextPage}
            disabled={disabled || !contextValue.canGoToNextPage}
            aria-label={`${labels.next} ${labels.page}`}
          >
            {labels.next}
          </button>
          
          {showFirstLast && (
            <button
              type="button"
              className="nexus-pagination__button nexus-pagination__button--last"
              onClick={contextValue.goToLastPage}
              disabled={disabled || !contextValue.canGoToLastPage}
              aria-label={`${labels.last} (${labels.page} ${totalPages})`}
              aria-current={page === totalPages ? 'page' : undefined}
            >
              {labels.last}
            </button>
          )}
        </div>
      </div>

      {/* Jump to Page */}
      {showJumpToPage && (
        <form
          className="nexus-pagination__jump"
          onSubmit={handleJumpToPage}
          aria-label={labels.jumpToPage}
        >
          <input
            type="number"
            value={jumpPageValue}
            onChange={(e) => setJumpPageValue(e.target.value)}
            placeholder={`1-${totalPages}`}
            min="1"
            max={totalPages}
            disabled={disabled}
            aria-label={`${labels.jumpToPage}: Enter page number (1-${totalPages})`}
          />
          <button
            type="submit"
            disabled={disabled || !jumpPageValue}
            className="nexus-pagination__jump-button"
          >
            Go
          </button>
        </form>
      )}

      {/* Items per Page Selector */}
      {showItemsPerPage && (
        <div className="nexus-pagination__items-per-page">
          <label htmlFor="items-per-page-select" className="nexus-pagination__label">
            {labels.itemsPerPage}:
          </label>
          <select
            id="items-per-page-select"
            value={currentItemsPerPage}
            onChange={handleItemsPerPageChange}
            disabled={disabled}
            className="nexus-pagination__select"
            aria-label={labels.itemsPerPage}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Total Info */}
      {showTotalInfo && totalItems && (
        <div className="nexus-pagination__info" role="status" aria-live="polite">
          Showing {startItem}-{endItem} {labels.of} {totalItems} {labels.items}
        </div>
      )}
    </nav>
  )
})

Pagination.displayName = 'Pagination'

export default Pagination