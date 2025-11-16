import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Pagination from './Pagination'

// Mock ResizeObserver for responsive tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver for infinite scroll tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const createMockPaginationProps = () => ({
  currentPage: 1,
  totalPages: 10,
  onPageChange: vi.fn(),
})

const renderPagination = (props = {}) => {
  const defaultProps = createMockPaginationProps()
  return render(<Pagination {...defaultProps} {...props} />)
}

describe('Pagination Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================

  describe('Basic Rendering', () => {
    it('should render pagination with default props', () => {
      const { container } = renderPagination()
      
      expect(container.querySelector('.nexus-pagination')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination navigation')
    })

    it('should render pagination with custom aria-label', () => {
      renderPagination({ 'aria-label': 'Custom pagination' })
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Custom pagination')
    })

    it('should render all page buttons correctly', () => {
      renderPagination({ totalPages: 5 })
      
      // Should show page numbers 1-5
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render first and last buttons', () => {
      renderPagination()
      
      expect(screen.getByLabelText('« (Page 1)')).toBeInTheDocument()
      expect(screen.getByLabelText('» (Page 10)')).toBeInTheDocument()
    })

    it('should render previous and next buttons', () => {
      renderPagination()
      
      expect(screen.getByLabelText('‹ Page')).toBeInTheDocument()
      expect(screen.getByLabelText('› Page')).toBeInTheDocument()
    })

    it('should render active page indicator', () => {
      renderPagination({ currentPage: 3 })
      
      const page3Button = screen.getByText('3')
      expect(page3Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
      expect(page3Button.closest('.nexus-pagination__button')).toHaveAttribute('aria-current', 'page')
    })

    it('should render ellipsis for large page counts', () => {
      renderPagination({ totalPages: 20 })
      
      // Should show ellipsis for large page counts
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  // ==========================================
  // PROPS TESTS
  // ==========================================

  describe('Props Configuration', () => {
    it('should handle custom currentPage prop', () => {
      renderPagination({ currentPage: 5, totalPages: 10 })
      
      const page5Button = screen.getByText('5')
      expect(page5Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
      expect(page5Button.closest('.nexus-pagination__button')).toHaveAttribute('aria-current', 'page')
    })

    it('should handle custom totalPages prop', () => {
      renderPagination({ totalPages: 25 })
      
      // Should render page numbers up to 25
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByLabelText('» (Page 25)')).toBeInTheDocument()
    })

    it('should handle totalItems prop', () => {
      renderPagination({ 
        currentPage: 3, 
        totalPages: 10, 
        totalItems: 150,
        itemsPerPage: 15 
      })
      
      expect(screen.getByText('Showing 31-45 of 150 items')).toBeInTheDocument()
    })

    it('should handle custom itemsPerPage', () => {
      renderPagination({ 
        itemsPerPage: 25,
        totalItems: 100,
        totalPages: 4
      })
      
      const startItem = (3 - 1) * 25 + 1
      const endItem = Math.min(3 * 25, 100)
      expect(screen.getByText(`Showing ${startItem}-${endItem} of 100 items`)).toBeInTheDocument()
    })

    it('should handle itemsPerPageOptions prop', () => {
      renderPagination({ 
        showItemsPerPage: true,
        itemsPerPageOptions: [10, 20, 50, 100]
      })
      
      const select = screen.getByLabelText('Items per page')
      expect(select).toHaveValue('10')
      
      // Check if custom options are available
      const options = Array.from(select.options).map(option => option.value)
      expect(options).toEqual(['10', '20', '50', '100'])
    })

    it('should handle customLabels prop', () => {
      const customLabels = {
        first: 'First',
        previous: 'Previous',
        next: 'Next',
        last: 'Last',
        of: 'of',
        page: 'Page',
        items: 'items',
        jumpToPage: 'Go to page',
        itemsPerPage: 'Show'
      }
      
      renderPagination({ customLabels })
      
      expect(screen.getByLabelText('First (Page 1)')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous Page')).toBeInTheDocument()
      expect(screen.getByLabelText('Next Page')).toBeInTheDocument()
      expect(screen.getByLabelText('Last (Page 10)')).toBeInTheDocument()
    })

    it('should handle className prop', () => {
      const { container } = renderPagination({ className: 'custom-class' })
      
      expect(container.querySelector('.nexus-pagination')).toHaveClass('custom-class')
    })
  })

  // ==========================================
  // VARIANT TESTS
  // ==========================================

  describe('Variants', () => {
    const variants = ['default', 'bordered', 'filled', 'minimal', 'pills']
    
    variants.forEach(variant => {
      it(`should render ${variant} variant`, () => {
        const { container } = renderPagination({ variant })
        
        expect(container.querySelector('.nexus-pagination')).toHaveClass(`nexus-pagination--${variant}`)
      })
    })

    it('should render bordered variant with proper styling', () => {
      const { container } = renderPagination({ variant: 'bordered' })
      
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      // Bordered variant should have thicker borders
      expect(buttons[0]).toHaveStyle({ borderWidth: '2px' })
    })

    it('should render minimal variant with no borders', () => {
      const { container } = renderPagination({ variant: 'minimal' })
      
      const pageButtons = container.querySelectorAll('.nexus-pagination__button--page')
      expect(pageButtons[1]).toHaveStyle({ border: 'none' })
      expect(pageButtons[1]).toHaveStyle({ background: 'transparent' })
    })

    it('should render pills variant with rounded buttons', () => {
      const { container } = renderPagination({ variant: 'pills' })
      
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      expect(buttons[0]).toHaveStyle({ borderRadius: '9999px' })
    })
  })

  // ==========================================
  // SIZE TESTS
  // ==========================================

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg']
    
    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        const { container } = renderPagination({ size })
        
        expect(container.querySelector('.nexus-pagination')).toHaveClass(`nexus-pagination--${size}`)
      })
    })

    it('should apply sm size styles', () => {
      const { container } = renderPagination({ size: 'sm' })
      
      const button = container.querySelector('.nexus-pagination__button')
      expect(button).toHaveStyle({ minWidth: '2rem' })
      expect(button).toHaveStyle({ height: '2rem' })
    })

    it('should apply lg size styles', () => {
      const { container } = renderPagination({ size: 'lg' })
      
      const button = container.querySelector('.nexus-pagination__button')
      expect(button).toHaveStyle({ minWidth: '3rem' })
      expect(button).toHaveStyle({ height: '3rem' })
    })
  })

  // ==========================================
  // INTERACTION TESTS
  // ==========================================

  describe('Page Navigation', () => {
    it('should call onPageChange when page button is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ onPageChange })
      
      await user.click(screen.getByText('5'))
      
      expect(onPageChange).toHaveBeenCalledWith(5)
    })

    it('should handle first page button click', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ currentPage: 5, onPageChange })
      
      await user.click(screen.getByLabelText('« (Page 1)'))
      
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('should handle last page button click', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ currentPage: 3, onPageChange, totalPages: 10 })
      
      await user.click(screen.getByLabelText('» (Page 10)'))
      
      expect(onPageChange).toHaveBeenCalledWith(10)
    })

    it('should handle previous page button click', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ currentPage: 3, onPageChange })
      
      await user.click(screen.getByLabelText('‹ Page'))
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should handle next page button click', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ currentPage: 3, onPageChange })
      
      await user.click(screen.getByLabelText('› Page'))
      
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('should disable first page button on first page', () => {
      renderPagination({ currentPage: 1 })
      
      expect(screen.getByLabelText('« (Page 1)')).toBeDisabled()
    })

    it('should disable previous page button on first page', () => {
      renderPagination({ currentPage: 1 })
      
      expect(screen.getByLabelText('‹ Page')).toBeDisabled()
    })

    it('should disable last page button on last page', () => {
      renderPagination({ currentPage: 10, totalPages: 10 })
      
      expect(screen.getByLabelText('» (Page 10)')).toBeDisabled()
    })

    it('should disable next page button on last page', () => {
      renderPagination({ currentPage: 10, totalPages: 10 })
      
      expect(screen.getByLabelText('› Page')).toBeDisabled()
    })
  })

  // ==========================================
  // JUMP TO PAGE TESTS
  // ==========================================

  describe('Jump to Page', () => {
    it('should show jump to page input when enabled', () => {
      renderPagination({ showJumpToPage: true })
      
      expect(screen.getByLabelText('Jump to page: Enter page number (1-10)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
    })

    it('should not show jump to page input when disabled', () => {
      renderPagination({ showJumpToPage: false })
      
      expect(screen.queryByLabelText('Jump to page')).not.toBeInTheDocument()
    })

    it('should handle jump to valid page', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ showJumpToPage: true, onPageChange, totalPages: 10 })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      const goButton = screen.getByRole('button', { name: 'Go' })
      
      await user.type(input, '7')
      await user.click(goButton)
      
      expect(onPageChange).toHaveBeenCalledWith(7)
      expect(input).toHaveValue('')
    })

    it('should handle keyboard submission of jump to page', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ showJumpToPage: true, onPageChange, totalPages: 10 })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      
      await user.type(input, '8{enter}')
      
      expect(onPageChange).toHaveBeenCalledWith(8)
      expect(input).toHaveValue('')
    })

    it('should ignore jump to invalid page (too low)', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ showJumpToPage: true, onPageChange, totalPages: 10 })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      const goButton = screen.getByRole('button', { name: 'Go' })
      
      await user.type(input, '0')
      await user.click(goButton)
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should ignore jump to invalid page (too high)', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ showJumpToPage: true, onPageChange, totalPages: 10 })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      const goButton = screen.getByRole('button', { name: 'Go' })
      
      await user.type(input, '15')
      await user.click(goButton)
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should disable go button when input is empty', () => {
      renderPagination({ showJumpToPage: true })
      
      const goButton = screen.getByRole('button', { name: 'Go' })
      expect(goButton).toBeDisabled()
    })

    it('should disable go button when disabled prop is true', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ showJumpToPage: true, onPageChange, disabled: true })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      const goButton = screen.getByRole('button', { name: 'Go' })
      
      await user.type(input, '5')
      
      expect(input).toBeDisabled()
      expect(goButton).toBeDisabled()
    })
  })

  // ==========================================
  // ITEMS PER PAGE TESTS
  // ==========================================

  describe('Items per Page', () => {
    it('should show items per page selector when enabled', () => {
      renderPagination({ showItemsPerPage: true })
      
      expect(screen.getByLabelText('Items per page:')).toBeInTheDocument()
      expect(screen.getByLabelText('Items per page')).toBeInTheDocument()
    })

    it('should not show items per page selector when disabled', () => {
      renderPagination({ showItemsPerPage: false })
      
      expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument()
    })

    it('should call onItemsPerPageChange when selection changes', async () => {
      const user = userEvent.setup()
      const onItemsPerPageChange = vi.fn()
      
      renderPagination({ 
        showItemsPerPage: true, 
        onItemsPerPageChange,
        itemsPerPageOptions: [10, 20, 50]
      })
      
      const select = screen.getByLabelText('Items per page')
      
      await user.selectOptions(select, '20')
      
      expect(onItemsPerPageChange).toHaveBeenCalledWith(20)
    })

    it('should show custom items per page options', () => {
      renderPagination({ 
        showItemsPerPage: true,
        itemsPerPageOptions: [25, 50, 100, 200]
      })
      
      const select = screen.getByLabelText('Items per page')
      const options = Array.from(select.options).map(option => option.textContent)
      
      expect(options).toEqual(['25', '50', '100', '200'])
    })

    it('should maintain current selection', () => {
      renderPagination({ 
        showItemsPerPage: true,
        itemsPerPage: 50
      })
      
      const select = screen.getByLabelText('Items per page')
      expect(select).toHaveValue('50')
    })

    it('should disable selector when disabled prop is true', () => {
      renderPagination({ 
        showItemsPerPage: true,
        disabled: true
      })
      
      const select = screen.getByLabelText('Items per page')
      expect(select).toBeDisabled()
    })
  })

  // ==========================================
  // INFORMATION DISPLAY TESTS
  // ==========================================

  describe('Information Display', () => {
    it('should show total info when enabled and items provided', () => {
      renderPagination({ 
        showTotalInfo: true,
        totalItems: 150,
        itemsPerPage: 15,
        currentPage: 5
      })
      
      const startItem = (5 - 1) * 15 + 1
      const endItem = Math.min(5 * 15, 150)
      
      expect(screen.getByText(`Showing ${startItem}-${endItem} of 150 items`)).toBeInTheDocument()
    })

    it('should not show total info when disabled', () => {
      renderPagination({ 
        showTotalInfo: false,
        totalItems: 150
      })
      
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    })

    it('should not show total info when items are not provided', () => {
      renderPagination({ 
        showTotalInfo: true,
        totalItems: undefined
      })
      
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    })

    it('should calculate info correctly for last page', () => {
      renderPagination({ 
        showTotalInfo: true,
        totalItems: 35,
        itemsPerPage: 10,
        currentPage: 4
      })
      
      expect(screen.getByText('Showing 31-35 of 35 items')).toBeInTheDocument()
    })

    it('should use calculated items when totalItems not provided', () => {
      renderPagination({ 
        showTotalInfo: true,
        itemsPerPage: 10,
        currentPage: 3,
        totalPages: 5
      })
      
      const totalItems = 5 * 10 // totalPages * itemsPerPage
      const startItem = (3 - 1) * 10 + 1
      const endItem = Math.min(3 * 10, totalItems)
      
      expect(screen.getByText(`Showing ${startItem}-${endItem} of ${totalItems} items`)).toBeInTheDocument()
    })
  })

  // ==========================================
  // ELLIPSIS TESTS
  // ==========================================

  describe('Ellipsis Display', () => {
    it('should show ellipsis when totalPages is large', () => {
      renderPagination({ totalPages: 100 })
      
      expect(screen.getAllByText('...').length).toBeGreaterThan(0)
    })

    it('should not show ellipsis when totalPages is small', () => {
      renderPagination({ totalPages: 5 })
      
      expect(screen.queryByText('...')).not.toBeInTheDocument()
    })

    it('should handle custom maxVisiblePages', () => {
      renderPagination({ 
        totalPages: 20, 
        maxVisiblePages: 5 
      })
      
      // Should show ellipsis for large page counts
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('should show all pages when maxVisiblePages is larger than totalPages', () => {
      renderPagination({ 
        totalPages: 5, 
        maxVisiblePages: 10 
      })
      
      expect(screen.queryByText('...')).not.toBeInTheDocument()
    })

    it('should show first page when ellipsis is present', () => {
      renderPagination({ totalPages: 50 })
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should show last page when ellipsis is present', () => {
      renderPagination({ totalPages: 50 })
      
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  // ==========================================
  // KEYBOARD NAVIGATION TESTS
  // ==========================================

  describe('Keyboard Navigation', () => {
    it('should handle left arrow key to go to previous page', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        onPageChange,
        totalPages: 10 
      })
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('should handle right arrow key to go to next page', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        onPageChange,
        totalPages: 10 
      })
      
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      
      expect(onPageChange).toHaveBeenCalledWith(6)
    })

    it('should handle home key to go to first page', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        onPageChange,
        totalPages: 10 
      })
      
      fireEvent.keyDown(document, { key: 'Home' })
      
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('should handle end key to go to last page', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        onPageChange,
        totalPages: 10 
      })
      
      fireEvent.keyDown(document, { key: 'End' })
      
      expect(onPageChange).toHaveBeenCalledWith(10)
    })

    it('should not handle keyboard navigation when disabled', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        onPageChange,
        disabled: true
      })
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should not navigate to invalid pages with keyboard', async () => {
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 1, 
        onPageChange,
        totalPages: 10 
      })
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should prevent default behavior for navigation keys', async () => {
      const preventDefaultMock = vi.fn()
      
      renderPagination({ 
        currentPage: 5, 
        totalPages: 10 
      })
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      event.preventDefault = preventDefaultMock
      
      fireEvent.keyDown(document, event)
      
      expect(preventDefaultMock).toHaveBeenCalled()
    })
  })

  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      renderPagination()
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have proper ARIA label', () => {
      renderPagination()
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination navigation')
    })

    it('should have ARIA current for active page', () => {
      renderPagination({ currentPage: 3 })
      
      const activeButton = screen.getByText('3').closest('.nexus-pagination__button')
      expect(activeButton).toHaveAttribute('aria-current', 'page')
    })

    it('should have proper ARIA label for page buttons', () => {
      renderPagination()
      
      const pageButtons = screen.getAllByRole('button', { name: /Page \d+/ })
      pageButtons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-label', `Page ${index + 1}`)
      })
    })

    it('should have ARIA disabled for disabled buttons', () => {
      renderPagination({ currentPage: 1, totalPages: 10 })
      
      expect(screen.getByLabelText('« (Page 1)')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByLabelText('‹ Page')).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have ARIA disabled for component when disabled', () => {
      renderPagination({ disabled: true })
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have proper label for select elements', () => {
      renderPagination({ showItemsPerPage: true })
      
      const select = screen.getByLabelText('Items per page')
      expect(select).toHaveAttribute('aria-label', 'Items per page')
    })

    it('should have proper label for jump to page input', () => {
      renderPagination({ showJumpToPage: true, totalPages: 10 })
      
      expect(screen.getByLabelText('Jump to page: Enter page number (1-10)')).toBeInTheDocument()
    })

    it('should have live region for info display', () => {
      renderPagination({ 
        showTotalInfo: true,
        totalItems: 150,
        currentPage: 5,
        itemsPerPage: 10
      })
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper focus indicators', () => {
      const { container } = renderPagination()
      
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      expect(buttons[0]).toHaveFocus()
    })
  })

  // ==========================================
  // CONTROLLED/UNCONTROLLED TESTS
  // ==========================================

  describe('Controlled/Uncontrolled', () => {
    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup()
      const { container } = renderPagination({ 
        totalPages: 10,
        defaultPage: 1 
      })
      
      // Find page 5 button and click it
      const page5Button = screen.getByText('5')
      await user.click(page5Button)
      
      // Page 5 should be active
      expect(page5Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })

    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ 
        currentPage: 1,
        totalPages: 10,
        onPageChange
      })
      
      await user.click(screen.getByText('5'))
      
      expect(onPageChange).toHaveBeenCalledWith(5)
    })

    it('should prioritize controlled state over uncontrolled', () => {
      renderPagination({ 
        currentPage: 5,
        totalPages: 10,
        onPageChange: vi.fn()
      })
      
      const page5Button = screen.getByText('5')
      expect(page5Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })

    it('should update internal state when uncontrolled and page changes', async () => {
      const user = userEvent.setup()
      const { rerender } = renderPagination({ 
        totalPages: 10,
        defaultCurrentPage: 1 
      })
      
      await user.click(screen.getByText('3'))
      
      // Component should update to show page 3 as active
      const page3Button = screen.getByText('3')
      expect(page3Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
      
      // Rerender with new page
      rerender(<Pagination totalPages={10} defaultCurrentPage={5} />)
      
      // Page 5 should now be active
      const page5Button = screen.getByText('5')
      expect(page5Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })

    it('should not update internal state when controlled', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      const { rerender } = renderPagination({ 
        currentPage: 1,
        totalPages: 10,
        onPageChange
      })
      
      await user.click(screen.getByText('3'))
      
      // onPageChange should be called but internal state should not change
      expect(onPageChange).toHaveBeenCalledWith(3)
      
      // Page 1 should still be active
      const page1Button = screen.getByText('1')
      expect(page1Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })
  })

  // ==========================================
  // EDGE CASES TESTS
  // ==========================================

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      renderPagination({ totalPages: 1 })
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByLabelText('« (Page 1)')).toBeDisabled()
      expect(screen.getByLabelText('‹ Page')).toBeDisabled()
      expect(screen.getByLabelText('› Page')).toBeDisabled()
      expect(screen.getByLabelText('» (Page 1)')).toBeDisabled()
    })

    it('should handle zero totalPages gracefully', () => {
      renderPagination({ totalPages: 0 })
      
      // Should still render component without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle very large totalPages', () => {
      renderPagination({ totalPages: 1000 })
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('...')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
    })

    it('should handle currentPage greater than totalPages', () => {
      renderPagination({ currentPage: 15, totalPages: 10 })
      
      // Should handle gracefully - page 10 should be active as it's the last page
      const page10Button = screen.getByText('10')
      expect(page10Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })

    it('should handle currentPage less than 1', () => {
      renderPagination({ currentPage: 0, totalPages: 10 })
      
      // Should handle gracefully - page 1 should be active
      const page1Button = screen.getByText('1')
      expect(page1Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--active')
    })

    it('should handle negative items per page', () => {
      renderPagination({ itemsPerPage: -1, totalItems: 100 })
      
      // Should handle gracefully
      expect(screen.getByText('Showing 1-1 of 100 items')).toBeInTheDocument()
    })

    it('should handle items per page larger than total items', () => {
      renderPagination({ itemsPerPage: 200, totalItems: 100, currentPage: 1 })
      
      expect(screen.getByText('Showing 1-100 of 100 items')).toBeInTheDocument()
    })

    it('should handle empty itemsPerPageOptions', () => {
      renderPagination({ 
        showItemsPerPage: true,
        itemsPerPageOptions: []
      })
      
      const select = screen.getByLabelText('Items per page')
      expect(select.options).toHaveLength(0)
    })

    it('should handle showFirstLast prop', () => {
      renderPagination({ showFirstLast: false })
      
      expect(screen.queryByLabelText('« (Page 1)')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('» (Page 10)')).not.toBeInTheDocument()
    })

    it('should handle maxVisiblePages prop', () => {
      renderPagination({ 
        totalPages: 20,
        maxVisiblePages: 3
      })
      
      // Should limit visible pages
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  // ==========================================
  // FORWARD REF TESTS
  // ==========================================

  describe('Forward Ref', () => {
    it('should forward ref to navigation element', () => {
      const ref = React.createRef<HTMLElement>()
      
      render(<Pagination ref={ref} totalPages={10} />)
      
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('NAV')
    })

    it('should provide access to navigation element methods', () => {
      const ref = React.createRef<HTMLElement>()
      
      render(<Pagination ref={ref} totalPages={10} />)
      
      expect(ref.current).toHaveClass('nexus-pagination')
      expect(ref.current).toHaveAttribute('role', 'navigation')
    })

    it('should work with callback refs', () => {
      const refCallback = vi.fn()
      
      render(<Pagination ref={refCallback} totalPages={10} />)
      
      expect(refCallback).toHaveBeenCalled()
      expect(refCallback.mock.calls[0][0]).toBeInstanceOf(HTMLElement)
    })
  })

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('Performance', () => {
    it('should not re-render unnecessarily with same props', async () => {
      const { rerender } = renderPagination({ totalPages: 10 })
      
      const renderSpy = vi.spyOn(Pagination, 'displayName', 'get')
      
      // Rerender with same props
      rerender(<Pagination totalPages={10} />)
      
      // Should not cause unnecessary re-renders
      expect(renderSpy).not.toHaveBeenCalled()
      
      renderSpy.mockRestore()
    })

    it('should handle rapid page changes efficiently', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ onPageChange, totalPages: 100 })
      
      // Rapidly click through pages
      for (let i = 1; i <= 10; i++) {
        await user.click(screen.getByText(i.toString()))
      }
      
      expect(onPageChange).toHaveBeenCalledTimes(10)
    })

    it('should handle large page counts efficiently', () => {
      const start = performance.now()
      
      renderPagination({ totalPages: 1000 })
      
      const end = performance.now()
      expect(end - start).toBeLessThan(100) // Should render within 100ms
    })
  })

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Integration', () => {
    it('should work with form elements', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Pagination 
            showJumpToPage={true}
            showItemsPerPage={true}
            onPageChange={vi.fn()}
            onItemsPerPageChange={vi.fn()}
          />
        </form>
      )
      
      // Should not interfere with form submission
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('should work in table context', () => {
      const tablePagination = (
        <div>
          <table>
            <tbody>
              <tr>
                <td>Data</td>
              </tr>
            </tbody>
          </table>
          <Pagination totalPages={5} />
        </div>
      )
      
      const { container } = render(tablePagination)
      
      expect(container.querySelector('table')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should work in list context', () => {
      render(
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <Pagination totalPages={3} />
        </ul>
      )
      
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle multiple pagination components', () => {
      render(
        <>
          <Pagination totalPages={5} />
          <Pagination totalPages={10} />
        </>
      )
      
      expect(screen.getAllByRole('navigation')).toHaveLength(2)
    })
  })

  // ==========================================
  // VISUAL REGRESSION TESTS
  // ==========================================

  describe('Visual Regression', () => {
    it('should match snapshot', () => {
      const { container } = renderPagination()
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with all features enabled', () => {
      const { container } = render(
        <Pagination
          currentPage={5}
          totalPages={20}
          totalItems={150}
          itemsPerPage={15}
          showItemsPerPage={true}
          showTotalInfo={true}
          showJumpToPage={true}
          variant="bordered"
          size="lg"
          showFirstLast={true}
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match minimal snapshot', () => {
      const { container } = render(
        <Pagination 
          totalPages={3}
          variant="minimal"
          size="sm"
          showTotalInfo={false}
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ==========================================
  // ANIMATION TESTS
  // ==========================================

  describe('Animations', () => {
    it('should handle CSS animations correctly', () => {
      const { container } = renderPagination()
      
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      buttons.forEach(button => {
        expect(button).toHaveStyle({ transition: expect.stringContaining('all') })
      })
    })

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(), // Deprecated
          removeListener: vi.fn(), // Deprecated
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      const { container } = renderPagination()
      
      // Animations should be disabled
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      buttons.forEach(button => {
        expect(button).toHaveStyle({ transition: 'none' })
      })
    })
  })

  // ==========================================
  // LOADING STATES TESTS
  // ==========================================

  describe('Loading States', () => {
    it('should handle disabled state correctly', () => {
      const { container } = renderPagination({ disabled: true })
      
      const buttons = container.querySelectorAll('.nexus-pagination__button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
      
      const select = screen.queryByLabelText('Items per page')
      if (select) {
        expect(select).toBeDisabled()
      }
    })

    it('should show loading indicator during page changes', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      renderPagination({ onPageChange })
      
      const page2Button = screen.getByText('2')
      await user.click(page2Button)
      
      // Button should show loading state
      expect(page2Button.closest('.nexus-pagination__button')).toHaveClass('nexus-pagination__button--loading')
    })
  })

  // ==========================================
  // ERROR BOUNDARY TESTS
  // ==========================================

  describe('Error Handling', () => {
    it('should handle invalid page number gracefully', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderPagination({ 
        showJumpToPage: true, 
        onPageChange,
        totalPages: 10 
      })
      
      const input = screen.getByLabelText('Jump to page: Enter page number (1-10)')
      
      // Try to input invalid number
      await user.type(input, 'abc')
      
      expect(input).toHaveValue('abc')
      
      // Go button should be disabled for invalid input
      expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled()
    })

    it('should handle network errors in page change callbacks', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn().mockRejectedValue(new Error('Network error'))
      
      renderPagination({ onPageChange })
      
      await user.click(screen.getByText('2'))
      
      // Component should handle error gracefully
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })

  // ==========================================
  // COMPATIBILITY TESTS
  // ==========================================

  describe('Browser Compatibility', () => {
    it('should work in older browsers with polyfills', () => {
      // Test basic functionality
      const { container } = renderPagination()
      
      expect(container.querySelector('.nexus-pagination')).toBeInTheDocument()
    })

    it('should handle CSS Grid/Flexbox fallbacks', () => {
      const { container } = renderPagination()
      
      const pagination = container.querySelector('.nexus-pagination__container')
      expect(pagination).toHaveStyle({ display: expect.stringMatching(/flex|grid/) })
    })
  })
})

// ==========================================
// TEST UTILITIES
// ==========================================

export const createTestPagination = (overrides = {}) => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    ...overrides
  }
  
  return {
    props: defaultProps,
    utils: {
      clickPage: async (pageNumber: number) => {
        const user = userEvent.setup()
        await user.click(screen.getByText(pageNumber.toString()))
      },
      clickPrevious: async () => {
        const user = userEvent.setup()
        await user.click(screen.getByLabelText('‹ Page'))
      },
      clickNext: async () => {
        const user = userEvent.setup()
        await user.click(screen.getByLabelText('› Page'))
      },
      clickFirst: async () => {
        const user = userEvent.setup()
        await user.click(screen.getByLabelText('« (Page 1)'))
      },
      clickLast: async () => {
        const user = userEvent.setup()
        await user.click(screen.getByLabelText('» (Page 10)'))
      },
      getActivePage: () => {
        return screen.getByText((content, element) => 
          element?.classList.contains('nexus-pagination__button--active')
        )
      },
      getPageButton: (pageNumber: number) => {
        return screen.getByText(pageNumber.toString())
      }
    }
  }
}

export default createTestPagination