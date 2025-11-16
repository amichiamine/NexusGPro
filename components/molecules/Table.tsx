import React, { forwardRef, useState, useMemo, useRef, useEffect, useCallback } from 'react'
import './Table.css'

// Type definitions
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: string
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom'
  render?: (value: any, record: T, index: number) => React.ReactNode
  onHeaderCell?: (column: TableColumn<T>) => React.ThHTMLAttributes<HTMLTableCellElement>
  headerClassName?: string
  cellClassName?: string
  footer?: (column: TableColumn<T>) => React.ReactNode
}

export interface TableDataSource<T = any> {
  [key: string]: any
  key?: string | number
}

export interface TableSelection {
  mode?: 'single' | 'multiple'
  selectedRowKeys?: (string | number)[]
  maxSelectionLength?: number
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void
  onSelectInvert?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  getCheckboxProps?: (record: T) => { disabled?: boolean; defaultChecked?: boolean }
}

export interface TableFilters<T = any> {
  [key: string]: string | number | boolean | (string | number | boolean)[]
  $and?: TableFilters<T>[]
  $or?: TableFilters<T>[]
  $not?: TableFilters<T>
}

export interface TableSort {
  columnKey?: string
  order?: 'ascend' | 'descend'
  field?: string
}

export interface TablePagination {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  pageSizeOptions?: string[]
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => string
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  position?: ('top' | 'bottom' | 'both')[]
  hideOnSinglePage?: boolean
}

export interface TableVirtualization {
  enabled?: boolean
  rowHeight?: number
  bufferSize?: number
  threshold?: number
}

export interface TableExport {
  enabled?: boolean
  fileName?: string
  types?: ('csv' | 'json' | 'xlsx')[]
  onExport?: (data: T[], columns: TableColumn<T>[]) => void
}

export interface TableRow {
  className?: string
  style?: React.CSSProperties
  onClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onDoubleClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onContextMenu?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onMouseEnter?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onMouseLeave?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
}

export interface TableProps<T = any> {
  // Data
  dataSource?: T[]
  columns?: TableColumn<T>[]
  rowKey?: string | ((record: T, index: number) => string | number)
  
  // Display
  size?: 'compact' | 'comfort' | 'spacious'
  variant?: 'default' | 'bordered' | 'striped' | 'hover'
  loading?: boolean | React.ReactNode
  empty?: boolean | React.ReactNode | (() => React.ReactNode)
  error?: string | React.ReactNode | (() => React.ReactNode)
  
  // Layout
  width?: number | string
  height?: number | string
  scrollX?: number | string
  scrollY?: number | string
  sticky?: boolean
  stickyOffset?: number
  
  // Selection
  selection?: TableSelection<T>
  rowSelection?: TableRow
  
  // Sorting & Filtering
  sort?: TableSort
  filters?: TableFilters<T>
  defaultSort?: TableSort[]
  defaultFilters?: TableFilters<T>
  onSort?: (sort: TableSort, columns: TableColumn<T>[]) => void
  onFilter?: (filters: TableFilters<T>, dataSource: T[]) => void
  
  // Pagination
  pagination?: TablePagination | false
  
  // Virtualization
  virtualization?: TableVirtualization
  
  // Export
  export?: TableExport
  
  // Resizable columns
  resizable?: boolean
  defaultColumnsWidth?: { [key: string]: number }
  
  // Empty states
  showEmpty?: boolean
  emptyText?: string
  
  // Responsive
  responsive?: boolean
  mobileBreakpoint?: number
  
  // Accessibility
  locale?: {
    emptyText?: string
    selectAll?: string
    selectInvert?: string
    selectionAll?: string
    sortTitle?: string
    filterTitle?: string
  }
  
  // Events
  onChange?: (pagination: any, filters: any, sorter: any, extra: any) => void
  onRowClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onRowDoubleClick?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onRowContextMenu?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onRowMouseEnter?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  onRowMouseLeave?: (record: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void
  
  // CSS
  className?: string
  style?: React.CSSProperties
  
  // Additional
  rowClassName?: string | ((record: T, index: number) => string)
  customRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>
  onHeaderRow?: (columns: TableColumn<T>[], index: number) => React.HTMLAttributes<HTMLTableRowElement>
  onHeaderCell?: (column: TableColumn<T>, index: number) => React.ThHTMLAttributes<HTMLTableCellElement>
}

// Helper functions
const getRowKey = <T extends object>(record: T, index: number, rowKey?: string | ((record: T, index: number) => string | number)): string | number => {
  if (typeof rowKey === 'function') {
    return rowKey(record, index)
  }
  if (rowKey && record[rowKey as keyof T] !== undefined) {
    return record[rowKey as keyof T] as string | number
  }
  return index
}

const compareValues = (a: any, b: any, type?: string): number => {
  if (a === b) return 0
  if (a === undefined || a === null) return 1
  if (b === undefined || b === null) return -1

  switch (type) {
    case 'number':
      return Number(a) - Number(b)
    case 'date':
      return new Date(a).getTime() - new Date(b).getTime()
    case 'boolean':
      return Number(a) - Number(b)
    default:
      return String(a).localeCompare(String(b))
  }
}

const filterData = <T extends object>(data: T[], filters: TableFilters<T>): T[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (key.startsWith('$')) return true
      
      const itemValue = (item as any)[key]
      
      if (Array.isArray(value)) {
        return value.some(v => itemValue === v)
      }
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase())
      }
      
      return itemValue === value
    })
  })
}

const sortData = <T extends object>(data: T[], sort: TableSort[]): T[] => {
  if (!sort || sort.length === 0) return data

  return [...data].sort((a, b) => {
    for (const s of sort) {
      const aVal = a[s.field || s.columnKey || ''] as any
      const bVal = b[s.field || s.columnKey || ''] as any
      
      const result = compareValues(aVal, bVal)
      if (result !== 0) {
        return s.order === 'descend' ? -result : result
      }
    }
    return 0
  })
}

const exportData = <T extends object>(data: T[], columns: TableColumn<T>[], type: 'csv' | 'json' | 'xlsx', fileName: string): void => {
  let content: string
  let mimeType: string
  let extension: string

  switch (type) {
    case 'csv':
      const headers = columns.map(col => col.title).join(',')
      const rows = data.map(row => 
        columns.map(col => {
          const value = row[col.dataIndex || col.key] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      ).join('\n')
      content = `${headers}\n${rows}`
      mimeType = 'text/csv'
      extension = 'csv'
      break

    case 'json':
      content = JSON.stringify(data, null, 2)
      mimeType = 'application/json'
      extension = 'json'
      break

    default:
      return
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

const Table = forwardRef<HTMLDivElement, TableProps<any>>(<T extends object>(
  {
    // Data
    dataSource = [],
    columns = [],
    rowKey,
    
    // Display
    size = 'comfort',
    variant = 'default',
    loading = false,
    empty = false,
    error,
    
    // Layout
    width,
    height,
    scrollX,
    scrollY,
    sticky = false,
    stickyOffset = 0,
    
    // Selection
    selection,
    rowSelection,
    
    // Sorting & Filtering
    sort,
    filters,
    defaultSort = [],
    defaultFilters = {},
    onSort,
    onFilter,
    
    // Pagination
    pagination,
    
    // Virtualization
    virtualization,
    
    // Export
    export: exportConfig,
    
    // Resizable columns
    resizable = false,
    defaultColumnsWidth = {},
    
    // Empty states
    showEmpty = true,
    emptyText = 'No data available',
    
    // Responsive
    responsive = true,
    mobileBreakpoint = 768,
    
    // Accessibility
    locale = {},
    
    // Events
    onChange,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    onRowMouseEnter,
    onRowMouseLeave,
    
    // CSS
    className,
    style,
    
    // Additional
    rowClassName,
    customRow,
    onHeaderRow,
    onHeaderCell,
  },
  ref
) => {
  // State management
  const [localSort, setLocalSort] = useState<TableSort[]>(defaultSort)
  const [localFilters, setLocalFilters] = useState<TableFilters>(defaultFilters)
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(selection?.selectedRowKeys || [])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10)
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(defaultColumnsWidth)
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isMobile, setIsMobile] = useState(false)
  const [currentStartIndex, setCurrentStartIndex] = useState(0)
  const [currentEndIndex, setCurrentEndIndex] = useState(0)
  
  // Refs
  const tableRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLTableSectionElement>(null)
  
  // Check responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])
  
  // Handle window resize for virtualization
  useEffect(() => {
    if (!virtualization?.enabled || !tableContainerRef.current) return
    
    const container = tableContainerRef.current
    const containerHeight = container.clientHeight
    const rowHeight = virtualization.rowHeight || 40
    const threshold = virtualization.threshold || 100
    const bufferSize = virtualization.bufferSize || 5
    
    const visibleRows = Math.ceil(containerHeight / rowHeight)
    const totalRows = filteredData.length
    
    setCurrentStartIndex(0)
    setCurrentEndIndex(Math.min(visibleRows + bufferSize, totalRows))
  }, [dataSource, localFilters, localSort, virtualization?.enabled, virtualization?.rowHeight, virtualization?.bufferSize, virtualization?.threshold])
  
  // Processed data
  const processedData = useMemo(() => {
    let result = [...dataSource]
    
    // Apply filters
    if (Object.keys(localFilters).length > 0) {
      result = filterData(result, localFilters)
    }
    
    // Apply sorting
    if (localSort.length > 0) {
      result = sortData(result, localSort)
    }
    
    return result
  }, [dataSource, localFilters, localSort])
  
  // Virtualized data
  const virtualizedData = useMemo(() => {
    if (!virtualization?.enabled) return processedData
    
    const startIndex = currentStartIndex
    const endIndex = currentEndIndex
    const visibleRows = processedData.slice(startIndex, endIndex)
    
    // Add padding rows for smooth scrolling
    const topPadding = Array(startIndex).fill(null)
    const bottomPadding = Array(Math.max(0, processedData.length - endIndex)).fill(null)
    
    return [...topPadding, ...visibleRows, ...bottomPadding]
  }, [processedData, virtualization?.enabled, currentStartIndex, currentEndIndex])
  
  // Get row height for virtualization
  const rowHeight = virtualization?.rowHeight || 40
  
  // Pagination calculations
  const paginatedData = useMemo(() => {
    if (pagination === false) return processedData
    
    const total = processedData.length
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, total)
    
    return processedData.slice(startIndex, endIndex)
  }, [processedData, currentPage, pageSize, pagination])
  
  // Total pages for pagination
  const totalPages = useMemo(() => {
    if (pagination === false) return 1
    return Math.ceil(processedData.length / pageSize)
  }, [processedData.length, pageSize, pagination])
  
  // Handle sorting
  const handleSort = useCallback((columnKey: string, field?: string) => {
    const existingSort = localSort.find(s => s.columnKey === columnKey || s.field === field)
    let newSort: TableSort[]
    
    if (!existingSort) {
      newSort = [...localSort, { columnKey, field, order: 'ascend' }]
    } else if (existingSort.order === 'ascend') {
      newSort = localSort.map(s => 
        s.columnKey === columnKey || s.field === field 
          ? { ...s, order: 'descend' } 
          : s
      )
    } else {
      newSort = localSort.filter(s => s.columnKey !== columnKey && s.field !== field)
    }
    
    setLocalSort(newSort)
    onSort?.(newSort[newSort.length - 1] || {}, columns)
    
    // Call onChange if provided
    onChange?.({}, localFilters, newSort, { currentDataSource: processedData, action: 'sort' })
  }, [localSort, columns, onSort, onChange, localFilters, processedData])
  
  // Handle filtering
  const handleFilter = useCallback((columnKey: string, value: any) => {
    const newFilters = { ...localFilters, [columnKey]: value }
    setLocalFilters(newFilters)
    setCurrentPage(1)
    
    onFilter?.(newFilters, dataSource)
    
    // Call onChange if provided
    onChange?.(newFilters, newFilters, localSort, { currentDataSource: processedData, action: 'filter' })
  }, [localFilters, dataSource, onFilter, onChange, localSort, processedData])
  
  // Handle selection
  const handleSelectionChange = useCallback((selectedKeys: (string | number)[], selectedRows: T[]) => {
    setSelectedRowKeys(selectedKeys)
    selection?.onChange?.(selectedKeys, selectedRows)
  }, [selection])
  
  // Handle pagination
  const handlePageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page)
    if (size && size !== pageSize) {
      setPageSize(size)
      pagination?.onShowSizeChange?.(page, size)
    }
    pagination?.onChange?.(page, size || pageSize)
  }, [pageSize, pagination])
  
  // Handle export
  const handleExport = useCallback((type: 'csv' | 'json' | 'xlsx') => {
    const fileName = exportConfig?.fileName || 'table-data'
    exportData(processedData, columns, type, fileName)
    exportConfig?.onExport?.(processedData, columns)
  }, [processedData, columns, exportConfig])
  
  // Get column sort status
  const getSortStatus = useCallback((columnKey: string, field?: string) => {
    const sort = localSort.find(s => s.columnKey === columnKey || s.field === field)
    return sort?.order || null
  }, [localSort])
  
  // Get column filter status
  const getFilterStatus = useCallback((columnKey: string) => {
    return localFilters[columnKey] || null
  }, [localFilters])
  
  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (!showEmpty) return null
    
    if (empty) {
      if (typeof empty === 'function') {
        return empty()
      }
      return empty
    }
    
    return (
      <div className="tb-table-empty" role="status" aria-live="polite">
        <div className="tb-empty-icon" aria-hidden="true">📭</div>
        <div className="tb-empty-text">{emptyText}</div>
      </div>
    )
  }, [showEmpty, empty, emptyText])
  
  // Render loading state
  const renderLoadingState = useCallback(() => {
    if (!loading) return null
    
    if (typeof loading === 'boolean') {
      return (
        <div className="tb-table-loading" role="status" aria-live="polite">
          <div className="tb-loading-spinner" aria-hidden="true"></div>
          <div className="tb-loading-text">Loading...</div>
        </div>
      )
    }
    
    return loading
  }, [loading])
  
  // Render error state
  const renderErrorState = useCallback(() => {
    if (!error) return null
    
    if (typeof error === 'string') {
      return (
        <div className="tb-table-error" role="alert">
          <div className="tb-error-icon" aria-hidden="true">⚠️</div>
          <div className="tb-error-text">{error}</div>
        </div>
      )
    }
    
    return error
  }, [error])
  
  // Render table header
  const renderTableHeader = useCallback(() => {
    return (
      <thead ref={headerRef} className="tb-table-header">
        <tr {...onHeaderRow?.(columns, 0)}>
          {selection?.mode === 'multiple' && (
            <th className="tb-selection-column">
              <input
                type="checkbox"
                className="tb-select-all"
                checked={selectedRowKeys.length === processedData.length && processedData.length > 0}
                onChange={(e) => {
                  const checked = e.target.checked
                  const newSelectedKeys = checked ? processedData.map((_, index) => getRowKey(_, index, rowKey)) : []
                  handleSelectionChange(newSelectedKeys, checked ? processedData : [])
                }}
                aria-label={locale.selectAll || 'Select all rows'}
              />
            </th>
          )}
          {columns.map((column, index) => (
            <th
              key={column.key}
              className={`tb-header-cell ${column.fixed ? `tb-fixed-${column.fixed}` : ''} ${column.headerClassName || ''}`}
              style={{
                minWidth: columnsWidth[column.key] || column.minWidth || column.width,
                textAlign: column.align || 'left',
                ...(column.maxWidth && { maxWidth: column.maxWidth })
              }}
              {...onHeaderCell?.(column, index)}
            >
              <div className="tb-header-content">
                <span className="tb-header-title">{column.title}</span>
                {column.sortable && (
                  <button
                    className={`tb-sort-button ${getSortStatus(column.key, column.dataIndex) ? `tb-sort-${getSortStatus(column.key, column.dataIndex)}` : ''}`}
                    onClick={() => handleSort(column.key, column.dataIndex)}
                    aria-label={`${locale.sortTitle || 'Sort'}: ${column.title}`}
                    title={locale.sortTitle || 'Sort'}
                  >
                    ↕️
                  </button>
                )}
                {column.filterable && (
                  <button
                    className={`tb-filter-button ${getFilterStatus(column.key) ? 'tb-filter-active' : ''}`}
                    onClick={() => {/* TODO: Show filter dropdown */}}
                    aria-label={`${locale.filterTitle || 'Filter'}: ${column.title}`}
                    title={locale.filterTitle || 'Filter'}
                  >
                    🔍
                  </button>
                )}
              </div>
              {resizable && (
                <div
                  className="tb-resize-handle"
                  onMouseDown={(e) => {
                    setResizingColumn(column.key)
                    setDragOffset(e.clientX)
                    e.preventDefault()
                  }}
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
    )
  }, [columns, selection, selectedRowKeys, processedData, localSort, localFilters, columnsWidth, resizable, locale, rowKey, onHeaderRow, onHeaderCell, handleSort, handleSelectionChange, getSortStatus, getFilterStatus])
  
  // Render table body
  const renderTableBody = useCallback(() => {
    const dataToRender = pagination === false ? (virtualization?.enabled ? virtualizedData : processedData) : paginatedData
    
    return (
      <tbody className="tb-table-body">
        {dataToRender.map((record, index) => {
          if (!record) {
            // Render padding row for virtualization
            return <tr key={`padding-${index}`} style={{ height: rowHeight }} />
          }
          
          const actualIndex = pagination === false ? 
            (virtualization?.enabled ? index - currentStartIndex : index) :
            (currentPage - 1) * pageSize + index
          
          const rowKeyValue = getRowKey(record, actualIndex, rowKey)
          const isSelected = selectedRowKeys.includes(rowKeyValue)
          const isEven = actualIndex % 2 === 0
          
          const rowClassNameValue = typeof rowClassName === 'function' 
            ? rowClassName(record, actualIndex) 
            : rowClassName || ''
          
          const rowProps: React.HTMLAttributes<HTMLTableRowElement> = {
            className: `tb-row ${isSelected ? 'tb-row-selected' : ''} ${isEven ? 'tb-row-even' : 'tb-row-odd'} ${rowClassNameValue || ''}`,
            onClick: (e) => {
              onRowClick?.(record, actualIndex, e)
              rowSelection?.onClick?.(record, actualIndex, e)
            },
            onDoubleClick: (e) => {
              onRowDoubleClick?.(record, actualIndex, e)
              rowSelection?.onDoubleClick?.(record, actualIndex, e)
            },
            onContextMenu: (e) => {
              onRowContextMenu?.(record, actualIndex, e)
              rowSelection?.onContextMenu?.(record, actualIndex, e)
            },
            onMouseEnter: (e) => {
              onRowMouseEnter?.(record, actualIndex, e)
              rowSelection?.onMouseEnter?.(record, actualIndex, e)
            },
            onMouseLeave: (e) => {
              onRowMouseLeave?.(record, actualIndex, e)
              rowSelection?.onMouseLeave?.(record, actualIndex, e)
            },
            ...customRow?.(record, actualIndex),
            ...rowSelection
          }
          
          return (
            <tr key={rowKeyValue} {...rowProps}>
              {selection?.mode && (
                <td className="tb-selection-cell">
                  {selection.mode === 'multiple' ? (
                    <input
                      type="checkbox"
                      className="tb-select-row"
                      checked={isSelected}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const newSelectedKeys = checked 
                          ? [...selectedRowKeys, rowKeyValue]
                          : selectedRowKeys.filter(key => key !== rowKeyValue)
                        const selectedRows = newSelectedKeys.map(key => 
                          processedData.find((item, idx) => getRowKey(item, idx, rowKey) === key)
                        ).filter(Boolean)
                        handleSelectionChange(newSelectedKeys, selectedRows)
                      }}
                      aria-label={`Select row ${actualIndex + 1}`}
                    />
                  ) : (
                    <input
                      type="radio"
                      name="table-selection"
                      className="tb-select-row"
                      checked={isSelected}
                      onChange={() => {
                        const selectedRows = [record]
                        handleSelectionChange([rowKeyValue], selectedRows)
                      }}
                      aria-label={`Select row ${actualIndex + 1}`}
                    />
                  )}
                </td>
              )}
              {columns.map((column) => {
                const value = record[column.dataIndex || column.key]
                const content = column.render ? column.render(value, record, actualIndex) : value
                
                return (
                  <td
                    key={column.key}
                    className={`tb-cell ${column.fixed ? `tb-fixed-${column.fixed}` : ''} ${column.cellClassName || ''}`}
                    style={{
                      textAlign: column.align || 'left',
                      ...(columnsWidth[column.key] && { width: columnsWidth[column.key] })
                    }}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    )
  }, [processedData, paginatedData, virtualizedData, pagination, virtualization, currentStartIndex, currentEndIndex, currentPage, pageSize, rowHeight, selectedRowKeys, selection, columns, columnsWidth, locale, rowClassName, customRow, rowSelection, onRowClick, onRowDoubleClick, onRowContextMenu, onRowMouseEnter, onRowMouseLeave, handleSelectionChange, rowKey])
  
  // Render pagination
  const renderPagination = useCallback(() => {
    if (pagination === false) return null
    
    return (
      <div className="tb-pagination" role="navigation" aria-label="Table pagination">
        <div className="tb-pagination-info">
          {pagination?.showTotal ? pagination.showTotal(processedData.length, [(currentPage - 1) * pageSize + 1, Math.min(currentPage * pageSize, processedData.length)]) : (
            `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, processedData.length)} of ${processedData.length} entries`
          )}
        </div>
        <div className="tb-pagination-controls">
          <button
            className="tb-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            aria-label="Go to first page"
          >
            ⏮️
          </button>
          <button
            className="tb-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Go to previous page"
          >
            ◀️
          </button>
          <span className="tb-pagination-page">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="tb-pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Go to next page"
          >
            ▶️
          </button>
          <button
            className="tb-pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            aria-label="Go to last page"
          >
            ⏭️
          </button>
        </div>
        {pagination?.showSizeChanger && (
          <div className="tb-pagination-size">
            <label htmlFor="page-size">Rows per page:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageChange(1, Number(e.target.value))}
            >
              {pagination.pageSizeOptions?.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    )
  }, [pagination, processedData.length, currentPage, pageSize, totalPages, handlePageChange])
  
  // Handle mouse up for column resizing
  useEffect(() => {
    const handleMouseUp = () => {
      if (resizingColumn) {
        setResizingColumn(null)
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn && dragOffset) {
        const deltaX = e.clientX - dragOffset
        const newWidth = (columnsWidth[resizingColumn] || 0) + deltaX
        setColumnsWidth(prev => ({ ...prev, [resizingColumn]: Math.max(50, newWidth) }))
        setDragOffset(e.clientX)
      }
    }
    
    if (resizingColumn) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
    }
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [resizingColumn, dragOffset, columnsWidth])
  
  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!virtualization?.enabled || !tableContainerRef.current) return
    
    const container = tableContainerRef.current
    const scrollTop = e.currentTarget.scrollTop
    const containerHeight = container.clientHeight
    const rowHeight = virtualization.rowHeight || 40
    const threshold = virtualization.threshold || 100
    const bufferSize = virtualization.bufferSize || 5
    
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight))
    const endIndex = Math.min(processedData.length, startIndex + Math.ceil(containerHeight / rowHeight) + bufferSize)
    
    setCurrentStartIndex(startIndex)
    setCurrentEndIndex(endIndex)
    
    // Update scroll position for proper virtualization
    if (headerRef.current) {
      headerRef.current.style.transform = `translateY(${scrollTop}px)`
    }
  }, [virtualization, processedData.length])
  
  // Main render
  const hasData = processedData.length > 0
  const hasError = !!error
  
  return (
    <div
      ref={ref}
      className={`tb-table-container ${className || ''} tb-size-${size} tb-variant-${variant} ${isMobile ? 'tb-mobile' : 'tb-desktop'} ${sticky ? 'tb-sticky' : ''}`}
      style={{
        width: width || '100%',
        height: height,
        ...style
      }}
    >
      {/* Export controls */}
      {exportConfig?.enabled && (
        <div className="tb-export-controls" role="toolbar" aria-label="Export options">
          <span className="tb-export-label">Export:</span>
          {exportConfig.types?.map(type => (
            <button
              key={type}
              className="tb-export-btn"
              onClick={() => handleExport(type)}
              aria-label={`Export as ${type.toUpperCase()}`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      
      {/* Table wrapper with scrolling */}
      <div
        ref={tableContainerRef}
        className="tb-table-wrapper"
        style={{
          maxWidth: scrollX,
          maxHeight: scrollY,
          overflowX: isMobile ? 'auto' : scrollX ? 'auto' : 'visible',
          overflowY: scrollY ? 'auto' : 'visible'
        }}
        onScroll={handleScroll}
        role="region"
        aria-label="Table data"
        tabIndex={0}
      >
        <table
          className="tb-table"
          style={{
            width: isMobile && scrollX ? scrollX : '100%'
          }}
        >
          {renderTableHeader()}
          {hasData ? renderTableBody() : (
            <tbody>
              <tr>
                <td colSpan={columns.length + (selection?.mode ? 1 : 0)}>
                  {renderEmptyState()}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      
      {/* Loading overlay */}
      {renderLoadingState()}
      
      {/* Error overlay */}
      {hasError && renderErrorState()}
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  )
})

Table.displayName = 'Table'

export default Table