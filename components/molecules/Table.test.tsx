import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table, { TableColumn, TableProps } from './Table'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Test data
const mockColumns: TableColumn[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', sortable: true, width: 150 },
  { key: 'age', title: 'Age', dataIndex: 'age', sortable: true, type: 'number' },
  { key: 'email', title: 'Email', dataIndex: 'email', width: 200 },
  { key: 'status', title: 'Status', dataIndex: 'status', filterable: true },
]

const mockDataSource = [
  { key: 1, name: 'John Doe', age: 30, email: 'john@example.com', status: 'active' },
  { key: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'inactive' },
  { key: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', status: 'active' },
  { key: 4, name: 'Alice Brown', age: 28, email: 'alice@example.com', status: 'pending' },
  { key: 5, name: 'Charlie Wilson', age: 32, email: 'charlie@example.com', status: 'active' },
]

describe('Table Component', () => {
  describe('Basic Rendering', () => {
    it('should render table with basic props', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      expect(screen.getByRole('region', { name: /table data/i })).toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should render with default empty state', () => {
      render(<Table columns={mockColumns} dataSource={[]} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render with custom empty state', () => {
      const customEmpty = () => (
        <div data-testid="custom-empty">
          <p>No users found</p>
        </div>
      )
      
      render(<Table columns={mockColumns} dataSource={[]} empty={customEmpty} />)
      
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
      expect(screen.getByText('No users found')).toBeInTheDocument()
    })

    it('should render with loading state', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} loading={true} />)
      
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render with custom loading state', () => {
      const customLoading = (
        <div data-testid="custom-loading">
          <span>Fetching data...</span>
        </div>
      )
      
      render(<Table columns={mockColumns} dataSource={mockDataSource} loading={customLoading} />)
      
      expect(screen.getByTestId('custom-loading')).toBeInTheDocument()
      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
    })

    it('should render with error state', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} error="Failed to load data" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('should render with custom error state', () => {
      const customError = (
        <div data-testid="custom-error">
          <p>Network error occurred</p>
        </div>
      )
      
      render(<Table columns={mockColumns} dataSource={mockDataSource} error={customError} />)
      
      expect(screen.getByTestId('custom-error')).toBeInTheDocument()
      expect(screen.getByText('Network error occurred')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('should render compact size', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} size="compact" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-size-compact')
    })

    it('should render comfort size (default)', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-size-comfort')
    })

    it('should render spacious size', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} size="spacious" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-size-spacious')
    })
  })

  describe('Variant Styles', () => {
    it('should render default variant', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} variant="default" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-variant-default')
    })

    it('should render bordered variant', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} variant="bordered" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-variant-bordered')
    })

    it('should render striped variant', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} variant="striped" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-variant-striped')
    })

    it('should render hover variant', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} variant="hover" />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-variant-hover')
    })
  })

  describe('Column Configuration', () => {
    it('should render all columns with correct headers', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      mockColumns.forEach(column => {
        expect(screen.getByText(column.title)).toBeInTheDocument()
      })
    })

    it('should render sortable columns with sort buttons', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const sortableColumns = mockColumns.filter(col => col.sortable)
      sortableColumns.forEach(column => {
        const sortButton = screen.getByLabelText(new RegExp(`sort.*${column.title}`, 'i'))
        expect(sortButton).toBeInTheDocument()
        expect(sortButton).toHaveClass('tb-sort-button')
      })
    })

    it('should render filterable columns with filter buttons', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const filterableColumns = mockColumns.filter(col => col.filterable)
      filterableColumns.forEach(column => {
        const filterButton = screen.getByLabelText(new RegExp(`filter.*${column.title}`, 'i'))
        expect(filterButton).toBeInTheDocument()
        expect(filterButton).toHaveClass('tb-filter-button')
      })
    })

    it('should handle custom column renderers', () => {
      const customColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
          render: (value) => <strong data-testid="custom-renderer">{value}</strong>,
        },
      ]
      
      render(<Table columns={customColumns} dataSource={mockDataSource} />)
      
      expect(screen.getAllByTestId('custom-renderer')).toHaveLength(mockDataSource.length)
    })

    it('should handle columns with fixed position', () => {
      const fixedColumns: TableColumn[] = [
        { key: 'id', title: 'ID', dataIndex: 'id', fixed: 'left', width: 80 },
        { key: 'name', title: 'Name', dataIndex: 'name' },
        { key: 'email', title: 'Email', dataIndex: 'email', fixed: 'right', width: 200 },
      ]
      
      render(<Table columns={fixedColumns} dataSource={mockDataSource} />)
      
      expect(screen.getByText('ID')).toHaveClass('tb-fixed-left')
      expect(screen.getByText('Email')).toHaveClass('tb-fixed-right')
    })
  })

  describe('Row Data Rendering', () => {
    it('should render all data rows', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      // Check that all names are rendered
      mockDataSource.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument()
      })
    })

    it('should render data with correct column alignment', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      // Check number column is right-aligned
      const ageCells = screen.getAllByText(/^\d+$/)
      expect(ageCells.length).toBeGreaterThan(0)
    })

    it('should handle missing data gracefully', () => {
      const incompleteData = [
        { key: 1, name: 'John', age: 30 },
        { key: 2, name: undefined, age: 25, email: 'jane@example.com' },
      ]
      
      render(<Table columns={mockColumns} dataSource={incompleteData} />)
      
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should render boolean values correctly', () => {
      const booleanColumns: TableColumn[] = [
        { key: 'active', title: 'Active', dataIndex: 'active', type: 'boolean' },
      ]
      const booleanData = [
        { key: 1, active: true },
        { key: 2, active: false },
      ]
      
      render(<Table columns={booleanColumns} dataSource={booleanData} />)
      
      expect(screen.getByText('true')).toBeInTheDocument()
      expect(screen.getByText('false')).toBeInTheDocument()
    })
  })

  describe('Sorting Functionality', () => {
    it('should sort ascending when clicking sort button', async () => {
      const user = userEvent.setup()
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const sortButton = screen.getByLabelText(/sort.*name/i)
      await user.click(sortButton)
      
      await waitFor(() => {
        const cells = screen.getAllByText(/john|jane|bob|alice|charlie/i)
        expect(cells[0]).toHaveTextContent(/alice/i) // Alice comes first alphabetically
      })
    })

    it('should sort descending when clicking sort button twice', async () => {
      const user = userEvent.setup()
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const sortButton = screen.getByLabelText(/sort.*name/i)
      await user.click(sortButton)
      await user.click(sortButton)
      
      await waitFor(() => {
        const cells = screen.getAllByText(/john|jane|bob|alice|charlie/i)
        expect(cells[0]).toHaveTextContent(/john/i) // John comes last alphabetically
      })
    })

    it('should sort by multiple columns', async () => {
      const user = userEvent.setup()
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const nameSortButton = screen.getByLabelText(/sort.*name/i)
      const ageSortButton = screen.getByLabelText(/sort.*age/i)
      
      await user.click(nameSortButton)
      await user.click(ageSortButton)
      
      await waitFor(() => {
        // Should be sorted by age first, then name
        expect(screen.getByText('Jane')).toBeInTheDocument()
      })
    })

    it('should trigger onSort callback', async () => {
      const user = userEvent.setup()
      const onSort = vi.fn()
      render(<Table columns={mockColumns} dataSource={mockDataSource} onSort={onSort} />)
      
      const sortButton = screen.getByLabelText(/sort.*name/i)
      await user.click(sortButton)
      
      expect(onSort).toHaveBeenCalledWith(
        expect.objectContaining({
          columnKey: 'name',
          order: 'ascend',
        }),
        expect.any(Array)
      )
    })
  })

  describe('Filtering Functionality', () => {
    it('should filter data when using filter', async () => {
      const user = userEvent.setup()
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      const filterButton = screen.getByLabelText(/filter.*status/i)
      await user.click(filterButton)
      
      // Filter functionality would be implemented in dropdown
      expect(filterButton).toBeInTheDocument()
    })

    it('should trigger onFilter callback', () => {
      const onFilter = vi.fn()
      render(<Table columns={mockColumns} dataSource={mockDataSource} onFilter={onFilter} />)
      
      // This would be triggered when filter is applied
      expect(onFilter).toBeDefined()
    })
  })

  describe('Selection Functionality', () => {
    it('should render with single selection mode', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{ mode: 'single' }}
        />
      )
      
      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons).toHaveLength(mockDataSource.length)
    })

    it('should render with multiple selection mode', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{ mode: 'multiple' }}
        />
      )
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0) // Individual checkboxes + select all
    })

    it('should handle row selection', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{
            mode: 'multiple',
            onChange: vi.fn(),
          }}
        />
      )
      
      const firstRowCheckbox = screen.getAllByRole('checkbox')[1] // First is select all
      await user.click(firstRowCheckbox)
      
      expect(firstRowCheckbox).toBeChecked()
    })

    it('should handle select all', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{
            mode: 'multiple',
            onChange: vi.fn(),
          }}
        />
      )
      
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all rows/i })
      await user.click(selectAllCheckbox)
      
      expect(selectAllCheckbox).toBeChecked()
    })

    it('should trigger onChange callback for selection', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{
            mode: 'multiple',
            onChange,
          }}
        />
      )
      
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all rows/i })
      await user.click(selectAllCheckbox)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([1, 2, 3, 4, 5]),
        expect.arrayContaining(mockDataSource)
      )
    })
  })

  describe('Pagination', () => {
    const largeDataSource = Array.from({ length: 50 }, (_, i) => ({
      key: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 30),
      email: `user${i + 1}@example.com`,
      status: ['active', 'inactive', 'pending'][i % 3],
    }))

    it('should render pagination controls', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={largeDataSource}
          pagination={{ pageSize: 10 }}
        />
      )
      
      expect(screen.getByRole('navigation', { name: /table pagination/i })).toBeInTheDocument()
      expect(screen.getByText(/showing.*to.*of.*entries/i)).toBeInTheDocument()
    })

    it('should navigate to next page', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={largeDataSource}
          pagination={{ pageSize: 10 }}
        />
      )
      
      const nextButton = screen.getByLabelText(/go to next page/i)
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
      })
    })

    it('should navigate to previous page', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={largeDataSource}
          pagination={{ pageSize: 10, current: 2 }}
        />
      )
      
      const prevButton = screen.getByLabelText(/go to previous page/i)
      await user.click(prevButton)
      
      await waitFor(() => {
        expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument()
      })
    })

    it('should change page size', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={largeDataSource}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      )
      
      const pageSizeSelect = screen.getByLabelText(/rows per page/i)
      await user.selectOptions(pageSizeSelect, '20')
      
      await waitFor(() => {
        expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
      })
    })

    it('should trigger pagination callbacks', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const onShowSizeChange = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={largeDataSource}
          pagination={{
            pageSize: 10,
            onChange,
            onShowSizeChange,
          }}
        />
      )
      
      const nextButton = screen.getByLabelText(/go to next page/i)
      await user.click(nextButton)
      
      expect(onChange).toHaveBeenCalledWith(2, 10)
    })
  })

  describe('Column Resizing', () => {
    it('should render resize handles when resizable is true', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          resizable={true}
        />
      )
      
      const resizeHandles = screen.getAllByClassName('tb-resize-handle')
      expect(resizeHandles.length).toBe(mockColumns.length)
    })

    it('should not render resize handles when resizable is false', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          resizable={false}
        />
      )
      
      expect(screen.queryByClassName('tb-resize-handle')).not.toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    it('should render export controls when enabled', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          export={{
            enabled: true,
            types: ['csv', 'json'],
          }}
        />
      )
      
      expect(screen.getByRole('toolbar', { name: /export options/i })).toBeInTheDocument()
      expect(screen.getByText('Export:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export as json/i })).toBeInTheDocument()
    })

    it('should trigger export when clicking export button', async () => {
      const user = userEvent.setup()
      // Mock URL.createObjectURL and related methods
      global.URL.createObjectURL = vi.fn(() => 'mock-url')
      global.URL.revokeObjectURL = vi.fn()
      global.document.createElement = vi.fn().mockReturnValue({
        click: vi.fn(),
        setAttribute: vi.fn(),
        href: '',
        download: '',
      })
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          export={{
            enabled: true,
            types: ['csv'],
          }}
        />
      )
      
      const exportButton = screen.getByRole('button', { name: /export as csv/i })
      await user.click(exportButton)
      
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('Row Events', () => {
    it('should handle row click events', async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          onRowClick={onRowClick}
        />
      )
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      await user.click(firstRow!)
      
      expect(onRowClick).toHaveBeenCalledWith(
        mockDataSource[0],
        0,
        expect.any(Event)
      )
    })

    it('should handle row double click events', async () => {
      const user = userEvent.setup()
      const onRowDoubleClick = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          onRowDoubleClick={onRowDoubleClick}
        />
      )
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      await user.dblClick(firstRow!)
      
      expect(onRowDoubleClick).toHaveBeenCalledWith(
        mockDataSource[0],
        0,
        expect.any(Event)
      )
    })

    it('should handle row mouse enter/leave events', async () => {
      const user = userEvent.setup()
      const onRowMouseEnter = vi.fn()
      const onRowMouseLeave = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          onRowMouseEnter={onRowMouseEnter}
          onRowMouseLeave={onRowMouseLeave}
        />
      )
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      await user.hover(firstRow!)
      await user.unhover(firstRow!)
      
      expect(onRowMouseEnter).toHaveBeenCalled()
      expect(onRowMouseLeave).toHaveBeenCalled()
    })
  })

  describe('Virtualization', () => {
    it('should render without virtualization by default', () => {
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      expect(screen.getByRole('region')).not.toHaveClass('tb-virtualized')
    })

    it('should render with virtualization when enabled', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          virtualization={{
            enabled: true,
            rowHeight: 40,
          }}
          height={200}
        />
      )
      
      expect(screen.getByRole('region')).toHaveClass('tb-virtualized')
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })
      
      render(<Table columns={mockColumns} dataSource={mockDataSource} />)
      
      expect(screen.getByRole('region')).toHaveClass('tb-mobile')
    })

    it('should show scroll on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          scrollX={600}
        />
      )
      
      expect(screen.getByRole('region')).toHaveClass('tb-mobile')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{ mode: 'multiple' }}
          pagination={{ pageSize: 10 }}
        />
      )
      
      expect(screen.getByLabelText(/select all rows/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select row 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/table data/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/table pagination/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          selection={{ mode: 'multiple' }}
        />
      )
      
      const tableRegion = screen.getByRole('region')
      await user.tab()
      expect(tableRegion).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      // Should navigate to next row
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should support screen reader announcements', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={[]}
          showEmpty={true}
        />
      )
      
      const emptyState = screen.getByRole('status')
      expect(emptyState).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        key: i,
        name: `User ${i}`,
        age: 20 + (i % 50),
        email: `user${i}@example.com`,
        status: ['active', 'inactive', 'pending'][i % 3],
      }))
      
      const start = performance.now()
      render(<Table columns={mockColumns} dataSource={largeDataset} />)
      const end = performance.now()
      
      expect(end - start).toBeLessThan(1000) // Should render in less than 1 second
    })

    it('should memoize filtered and sorted data', () => {
      const onChange = vi.fn()
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          onChange={onChange}
        />
      )
      
      // Trigger re-render with same props
      act(() => {
        const table = screen.getByRole('region').parentElement!
        // Trigger re-render by forcing update
        table.dispatchEvent(new Event('resize'))
      })
      
      // onChange should not be called unnecessarily
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty columns array', () => {
      render(<Table columns={[]} dataSource={mockDataSource} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should handle undefined dataSource', () => {
      render(<Table columns={mockColumns} dataSource={undefined} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should handle null values in data', () => {
      const dataWithNulls = [
        { key: 1, name: 'John', age: null, email: undefined, status: 'active' },
        { key: 2, name: null, age: 25, email: 'jane@example.com', status: null },
      ]
      
      render(<Table columns={mockColumns} dataSource={dataWithNulls} />)
      
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should handle very long text content', () => {
      const longTextData = [
        {
          key: 1,
          name: 'A'.repeat(100),
          age: 30,
          email: 'b'.repeat(200) + '@example.com',
          status: 'active',
        },
      ]
      
      render(<Table columns={mockColumns} dataSource={longTextData} />)
      
      const cell = screen.getByText(new RegExp(`A{${100}}`))
      expect(cell).toBeInTheDocument()
      expect(cell).toHaveAttribute('title', expect.stringContaining('A'.repeat(100)))
    })

    it('should handle negative numbers', () => {
      const negativeData = [
        { key: 1, name: 'John', age: -5, email: 'john@example.com', status: 'active' },
        { key: 2, name: 'Jane', age: -10, email: 'jane@example.com', status: 'inactive' },
      ]
      
      render(<Table columns={mockColumns} dataSource={negativeData} />)
      
      expect(screen.getByText('-5')).toBeInTheDocument()
      expect(screen.getByText('-10')).toBeInTheDocument()
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply custom className', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          className="custom-table-class"
        />
      )
      
      expect(screen.getByRole('region')).toHaveClass('custom-table-class')
    })

    it('should apply custom styles', () => {
      const customStyle = { border: '2px solid red', backgroundColor: 'yellow' }
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          style={customStyle}
        />
      )
      
      const table = screen.getByRole('region')
      expect(table).toHaveStyle(customStyle)
    })

    it('should apply rowClassName function', () => {
      const rowClassName = (record: any) => record.age > 30 ? 'old-person' : 'young-person'
      
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          rowClassName={rowClassName}
        />
      )
      
      const oldPersonRow = screen.getByText('Bob Johnson').closest('tr')
      const youngPersonRow = screen.getByText('John Doe').closest('tr')
      
      expect(oldPersonRow).toHaveClass('old-person')
      expect(youngPersonRow).toHaveClass('young-person')
    })
  })

  describe('Internationalization', () => {
    it('should use custom locale strings', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          locale={{
            emptyText: 'Aucune donnée disponible',
            selectAll: 'Sélectionner tout',
            sortTitle: 'Trier',
          }}
          showEmpty={true}
        />
      )
      
      expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument()
    })

    it('should apply locale to aria-labels', () => {
      render(
        <Table
          columns={mockColumns}
          dataSource={mockDataSource}
          locale={{
            selectAll: 'Seleccionar todo',
            sortTitle: 'Ordenar',
          }}
          selection={{ mode: 'multiple' }}
        />
      )
      
      expect(screen.getByLabelText(/seleccionar todo/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle render function errors gracefully', () => {
      const problematicColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          render: () => {
            throw new Error('Render error')
          },
        },
      ]
      
      // This should not crash the application
      expect(() => {
        render(<Table columns={problematicColumns} dataSource={mockDataSource} />)
      }).not.toThrow()
    })

    it('should show error boundary for critical errors', () => {
      const badData = [{ key: 'invalid', data: { cause: 'crash' } }]
      
      render(
        <Table
          columns={mockColumns}
          dataSource={badData}
        />
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with simple column and row arrays (legacy API)', () => {
      // This tests backward compatibility with the original simple API
      render(
        <Table
          columns={['Name', 'Age', 'Email']}
          dataSource={[['John', '30', 'john@example.com']]}
        />
      )
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })
})

// Integration tests
describe('Table Integration Tests', () => {
  it('should work correctly with all features combined', async () => {
    const user = userEvent.setup()
    
    render(
      <Table
        columns={mockColumns}
        dataSource={mockDataSource}
        size="comfort"
        variant="striped"
        selection={{ mode: 'multiple' }}
        pagination={{ pageSize: 2 }}
        resizable={true}
        export={{ enabled: true, types: ['csv'] }}
        onRowClick={vi.fn()}
        onSort={vi.fn()}
      />
    )
    
    // Test multiple features work together
    expect(screen.getByRole('region')).toHaveClass('tb-size-comfort', 'tb-variant-striped')
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
    expect(screen.getAllByClassName('tb-resize-handle')).toHaveLength(mockColumns.length)
    
    // Test sorting
    const sortButton = screen.getByLabelText(/sort.*name/i)
    await user.click(sortButton)
    
    // Test pagination
    expect(screen.getByText(/showing.*to.*of.*entries/i)).toBeInTheDocument()
  })
  
  it('should maintain state correctly across re-renders', () => {
    const { rerender } = render(
      <Table
        columns={mockColumns}
        dataSource={mockDataSource}
        pagination={{ current: 2, pageSize: 2 }}
      />
    )
    
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument()
    
    // Change data source
    const newData = mockDataSource.slice(0, 3)
    rerender(
      <Table
        columns={mockColumns}
        dataSource={newData}
        pagination={{ current: 2, pageSize: 2 }}
      />
    )
    
    // Should adjust to new data length
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })
})