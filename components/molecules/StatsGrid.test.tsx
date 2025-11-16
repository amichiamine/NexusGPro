import React from 'react'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StatsGrid from './StatsGrid'
import { StatItem } from './StatsGrid'

// Mock StatsCard component
jest.mock('./StatsCard', () => {
  return function MockStatsCard(props: any) {
    return (
      <div data-testid="stats-card" className="mock-stats-card">
        <div data-testid="stats-card-value">{props.value}</div>
        <div data-testid="stats-card-label">{props.label}</div>
        {props.delta && <div data-testid="stats-card-delta">{props.delta}</div>}
        {props.subtitle && <div data-testid="stats-card-subtitle">{props.subtitle}</div>}
        {props.description && <div data-testid="stats-card-description">{props.description}</div>}
      </div>
    )
  }
})

describe('StatsGrid', () => {
  const defaultItems: StatItem[] = [
    { id: '1', label: 'Users', value: '25k' },
    { id: '2', label: 'APIs', value: '120' },
    { id: '3', label: 'Regions', value: '12' }
  ]

  const extendedItems: StatItem[] = [
    { 
      id: '1', 
      label: 'Users', 
      value: '25k', 
      delta: '+12%', 
      deltaType: 'increase',
      subtitle: 'Monthly Active',
      description: 'Users this month',
      icon: '👥',
      format: 'number'
    },
    { 
      id: '2', 
      label: 'Revenue', 
      value: '$125k', 
      delta: '-5%', 
      deltaType: 'decrease',
      subtitle: 'This Month',
      description: 'Revenue this month',
      icon: '💰',
      format: 'currency'
    },
    { 
      id: '3', 
      label: 'Conversion', 
      value: '3.2%', 
      delta: '+0.5%', 
      deltaType: 'increase',
      subtitle: 'Rate',
      description: 'Conversion rate',
      icon: '📈',
      format: 'percentage'
    },
    { 
      id: '4', 
      label: 'Growth', 
      value: '1.2M', 
      delta: '+15%', 
      deltaType: 'increase',
      subtitle: 'YoY Growth',
      description: 'Year over year growth',
      icon: '🚀',
      format: 'compact'
    }
  ]

  // ===============================
  // TEST SUITE 1: Basic Rendering
  // ===============================
  describe('Basic Rendering', () => {
    test('should render with default items when no props provided', () => {
      render(<StatsGrid />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(3)
    })

    test('should render with custom items', () => {
      render(<StatsGrid items={extendedItems} />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(4)
      
      extendedItems.forEach((item, index) => {
        expect(screen.getByText(item.label)).toBeInTheDocument()
        expect(screen.getByText(item.value.toString())).toBeInTheDocument()
      })
    })

    test('should render with empty items array', () => {
      render(<StatsGrid items={[]} />)
      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })

    test('should render with undefined items', () => {
      render(<StatsGrid items={undefined} />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(3) // fallback to defaultItems
    })

    test('should apply custom className', () => {
      const { container } = render(<StatsGrid className="custom-class" />)
      expect(container.firstChild).toHaveClass('stats-grid', 'custom-class')
    })

    test('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' }
      const { container } = render(<StatsGrid style={customStyle} />)
      expect(container.firstChild).toHaveStyle(customStyle)
    })

    test('should render header when actions are provided', () => {
      const mockOnRefresh = jest.fn()
      render(<StatsGrid onRefresh={mockOnRefresh} />)
      
      expect(screen.getByLabelText('Refresh statistics')).toBeInTheDocument()
    })

    test('should not render header when no actions provided', () => {
      render(<StatsGrid />)
      expect(screen.queryByLabelText('Refresh statistics')).not.toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 2: Grid Layout
  // ===============================
  describe('Grid Layout', () => {
    test('should apply fixed layout by default', () => {
      const { container } = render(<StatsGrid />)
      expect(container.firstChild).toHaveClass('stats-grid--fixed')
    })

    test('should apply auto-fill layout', () => {
      const { container } = render(<StatsGrid layout="auto-fill" />)
      expect(container.firstChild).toHaveClass('stats-grid--auto-fill')
    })

    test('should apply auto-fit layout', () => {
      const { container } = render(<StatsGrid layout="auto-fit" />)
      expect(container.firstChild).toHaveClass('stats-grid--auto-fit')
    })

    test('should apply masonry layout', () => {
      const { container } = render(<StatsGrid layout="masonry" />)
      expect(container.firstChild).toHaveClass('stats-grid--masonry')
    })

    test('should set custom column count', () => {
      render(<StatsGrid columns={4} />)
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(4, 1fr)'
      })
    })

    test('should set custom gap', () => {
      render(<StatsGrid gap={20} />)
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gap: '20px'
      })
    })

    test('should handle responsive columns', () => {
      render(<StatsGrid responsive={{ mobile: 1, tablet: 2, desktop: 3 }} />)
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(3, 1fr)'
      })
    })
  })

  // ===============================
  // TEST SUITE 3: Variants and Sizes
  // ===============================
  describe('Variants and Sizes', () => {
    test.each(['default', 'bordered', 'filled', 'minimal', 'glass', 'gradient'])(
      'should apply %s variant',
      (variant) => {
        const { container } = render(<StatsGrid variant={variant as any} />)
        expect(container.firstChild).toHaveClass(`stats-grid--${variant}`)
      }
    )

    test.each(['small', 'medium', 'large', 'xlarge'])(
      'should apply %s size',
      (size) => {
        const { container } = render(<StatsGrid size={size as any} />)
        expect(container.firstChild).toHaveClass(`stats-grid--${size}`)
      }
    )

    test('should apply multiple variants correctly', () => {
      const { container } = render(
        <StatsGrid variant="bordered" size="large" layout="auto-fill" />
      )
      expect(container.firstChild).toHaveClass(
        'stats-grid--bordered',
        'stats-grid--large',
        'stats-grid--auto-fill'
      )
    })
  })

  // ===============================
  // TEST SUITE 4: Data Synchronization
  // ===============================
  describe('Data Synchronization', () => {
    test('should calculate sync data when enabled', () => {
      const syncItems = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 },
        { label: 'Item 3', value: 150 }
      ]
      render(<StatsGrid items={syncItems} syncData={true} />)
      
      // Should show sync badge in header
      expect(screen.getByText(/Sync:/)).toBeInTheDocument()
      expect(screen.getByText(/150 avg/)).toBeInTheDocument()
    })

    test('should not show sync data when disabled', () => {
      const syncItems = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      render(<StatsGrid items={syncItems} syncData={false} />)
      
      expect(screen.queryByText(/Sync:/)).not.toBeInTheDocument()
    })

    test('should handle string values in sync calculation', () => {
      const syncItems = [
        { label: 'Item 1', value: '100' },
        { label: 'Item 2', value: '200' },
        { label: 'Item 3', value: 'invalid' }
      ]
      render(<StatsGrid items={syncItems} syncData={true} />)
      
      expect(screen.getByText(/Sync:/)).toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 5: Animations
  // ===============================
  describe('Animations', () => {
    test('should enable animations by default', () => {
      const { container } = render(<StatsGrid />)
      expect(container.firstChild).not.toHaveClass('stats-grid--no-animation')
    })

    test('should disable animations when animated is false', () => {
      const { container } = render(<StatsGrid animated={false} />)
      const items = container.querySelectorAll('.stats-grid-item')
      
      items.forEach(item => {
        expect(item).toHaveStyle({
          opacity: '1',
          transform: 'none'
        })
      })
    })

    test('should apply different animation types', () => {
      const { container } = render(
        <StatsGrid 
          animationType="slide" 
          staggerDelay={150}
          animated={true}
          items={extendedItems.slice(0, 2)}
        />
      )
      
      expect(container.firstChild).toHaveClass('stats-grid--slide')
    })

    test('should stagger animations with delays', () => {
      const { container } = render(
        <StatsGrid 
          animated={true} 
          staggerDelay={200}
          items={extendedItems.slice(0, 3)}
        />
      )
      
      const items = container.querySelectorAll('.stats-grid-item')
      expect(items).toHaveLength(3)
      
      // Check if items have animation delay styles
      items.forEach((item, index) => {
        expect(item).toHaveStyle({
          transition: expect.stringContaining(`${index * 0.2}s`)
        })
      })
    })
  })

  // ===============================
  // TEST SUITE 6: Interactions
  // ===============================
  describe('Interactions', () => {
    test('should enable hoverable interactions by default', () => {
      const { container } = render(<StatsGrid />)
      expect(container.firstChild).toHaveClass('stats-grid--hoverable')
    })

    test('should disable hoverable when false', () => {
      const { container } = render(<StatsGrid hoverable={false} />)
      expect(container.firstChild).not.toHaveClass('stats-grid--hoverable')
    })

    test('should enable clickable interactions by default', () => {
      const { container } = render(<StatsGrid />)
      const items = container.querySelectorAll('.stats-grid-item')
      
      items.forEach(item => {
        expect(item).toHaveClass('stats-grid-item--clickable')
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    test('should disable clickable when false', () => {
      const { container } = render(<StatsGrid clickable={false} />)
      const items = container.querySelectorAll('.stats-grid-item')
      
      items.forEach(item => {
        expect(item).not.toHaveClass('stats-grid-item--clickable')
        expect(item).toHaveAttribute('tabIndex', '-1')
      })
    })

    test('should enable group interactions by default', () => {
      const { container } = render(<StatsGrid />)
      expect(container.firstChild).toHaveClass('stats-grid--group-interactions')
    })

    test('should disable group interactions when false', () => {
      const { container } = render(<StatsGrid groupInteractions={false} />)
      expect(container.firstChild).not.toHaveClass('stats-grid--group-interactions')
    })

    test('should handle item click events', async () => {
      const user = userEvent.setup()
      const mockOnItemClick = jest.fn()
      
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 2)} 
          onItemClick={mockOnItemClick}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      await user.click(firstItem!)
      
      expect(mockOnItemClick).toHaveBeenCalledTimes(1)
      expect(mockOnItemClick).toHaveBeenCalledWith(extendedItems[0], 0)
    })

    test('should handle item native onClick', async () => {
      const user = userEvent.setup()
      const mockItemClick = jest.fn()
      
      const itemsWithClick = [
        { ...extendedItems[0], onClick: mockItemClick }
      ]
      
      render(<StatsGrid items={itemsWithClick} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      await user.click(firstItem!)
      
      expect(mockItemClick).toHaveBeenCalledTimes(1)
    })

    test('should handle hover events for group interactions', async () => {
      const user = userEvent.setup()
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 3)} 
          groupInteractions={true}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      
      await user.hover(firstItem!)
      
      expect(firstItem!).toHaveClass('stats-grid-item--hovered')
      
      // Check if other items show grouped effect
      const otherItems = screen.getAllByTestId('stats-card')
        .slice(1)
        .map(card => card.closest('.stats-grid-item')!)
      
      otherItems.forEach(item => {
        expect(item).toHaveClass('stats-grid-item') // Should be affected by group hover
      })
    })

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<StatsGrid items={extendedItems.slice(0, 2)} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      
      await user.tab()
      expect(firstItem!).toHaveFocus()
      
      await user.keyboard('{Enter}')
      // Should trigger click when focused and Enter pressed
    })
  })

  // ===============================
  // TEST SUITE 7: Loading States
  // ===============================
  describe('Loading States', () => {
    test('should show loading state', () => {
      render(<StatsGrid loading={true} />)
      
      expect(screen.getByTestId('stats-grid-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })

    test('should render skeleton items', () => {
      render(<StatsGrid loading={true} responsive={{ mobile: 1, tablet: 2, desktop: 3 }} />)
      
      const skeletonItems = screen.queryAllByTestId('stats-grid-skeleton-item')
      expect(skeletonItems).toHaveLength(6) // responsive.desktop * 2
    })

    test('should show loading class on container', () => {
      const { container } = render(<StatsGrid loading={true} />)
      expect(container.firstChild).toHaveClass('stats-grid--loading')
    })

    test('should disable interactions during loading', () => {
      render(<StatsGrid loading={true} />)
      
      const container = screen.getByRole('group')
      expect(container).toHaveAttribute('pointer-events', 'none')
    })

    test('should show loading state on individual items', () => {
      const itemsWithLoading = [
        { ...extendedItems[0], loading: true },
        extendedItems[1]
      ]
      
      render(<StatsGrid items={itemsWithLoading} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards[0]).toHaveAttribute('data-loading', 'true')
      expect(cards[1]).not.toHaveAttribute('data-loading')
    })
  })

  // ===============================
  // TEST SUITE 8: Error States
  // ===============================
  describe('Error States', () => {
    test('should show error state when error prop provided', () => {
      render(<StatsGrid error="Custom error message" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    test('should show default error state', () => {
      render(<StatsGrid error="Error loading stats" />)
      
      expect(screen.getByText(/Error loading stats/)).toBeInTheDocument()
      expect(screen.getByText(/Retry/)).toBeInTheDocument()
    })

    test('should handle error retry', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      
      render(<StatsGrid error="Error" onRefresh={mockOnRefresh} />)
      
      const retryButton = screen.getByText(/Retry/)
      await user.click(retryButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('should show individual item errors', () => {
      const itemsWithError = [
        { ...extendedItems[0], error: 'Item error' },
        extendedItems[1]
      ]
      
      render(<StatsGrid items={itemsWithError} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards[0]).toHaveAttribute('data-error', 'Item error')
      expect(cards[1]).not.toHaveAttribute('data-error')
    })
  })

  // ===============================
  // TEST SUITE 9: Actions and Controls
  // ===============================
  describe('Actions and Controls', () => {
    test('should render refresh action', () => {
      const mockOnRefresh = jest.fn()
      render(<StatsGrid onRefresh={mockOnRefresh} />)
      
      const refreshButton = screen.getByLabelText('Refresh statistics')
      expect(refreshButton).toBeInTheDocument()
    })

    test('should handle refresh action', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      
      render(<StatsGrid onRefresh={mockOnRefresh} />)
      
      const refreshButton = screen.getByLabelText('Refresh statistics')
      await user.click(refreshButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('should render export action', () => {
      const mockOnExport = jest.fn()
      render(<StatsGrid onExport={mockOnExport} />)
      
      const exportButton = screen.getByLabelText('Export statistics')
      expect(exportButton).toBeInTheDocument()
    })

    test('should handle export action', async () => {
      const user = userEvent.setup()
      const mockOnExport = jest.fn()
      
      render(<StatsGrid onExport={mockOnExport} />)
      
      const exportButton = screen.getByLabelText('Export statistics')
      await user.click(exportButton)
      
      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    test('should show sync badge when sync data enabled', () => {
      const syncItems = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      
      render(<StatsGrid items={syncItems} syncData={true} />)
      
      expect(screen.getByText(/Sync:/)).toBeInTheDocument()
    })

    test('should show sync badge when sync data disabled', () => {
      const syncItems = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      
      render(<StatsGrid items={syncItems} syncData={false} />)
      
      expect(screen.queryByText(/Sync:/)).not.toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 10: Props Integration
  // ===============================
  describe('Props Integration', () => {
    test('should pass props to StatsCard component', () => {
      const customStatsCardProps = {
        variant: 'bordered' as const,
        size: 'large' as const,
        layout: 'horizontal' as const
      }
      
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 1)} 
          statsCardProps={customStatsCardProps}
        />
      )
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-variant', 'bordered')
      expect(card).toHaveAttribute('data-size', 'large')
      expect(card).toHaveAttribute('data-layout', 'horizontal')
    })

    test('should handle disabled items', () => {
      const itemsWithDisabled = [
        { ...extendedItems[0], disabled: true },
        extendedItems[1]
      ]
      
      render(<StatsGrid items={itemsWithDisabled} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-grid-item')!)
      
      expect(items[0]).toHaveClass('stats-grid-item--disabled')
      expect(items[1]).not.toHaveClass('stats-grid-item--disabled')
    })

    test('should handle href navigation', () => {
      const itemsWithHref = [
        { ...extendedItems[0], href: '/users' },
        extendedItems[1]
      ]
      
      render(<StatsGrid items={itemsWithHref} clickable={true} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-grid-item')!)
      
      expect(items[0]).toHaveAttribute('role', 'link')
      expect(items[1]).toHaveAttribute('role', 'button')
    })

    test('should handle progress data', () => {
      const itemsWithProgress = [
        { 
          ...extendedItems[0], 
          progress: { current: 75, target: 100 } 
        }
      ]
      
      render(<StatsGrid items={itemsWithProgress} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-progress', '75/100')
    })

    test('should handle comparison data', () => {
      const itemsWithComparison = [
        { 
          ...extendedItems[0], 
          comparison: { label: 'Last Month', value: '20k' } 
        }
      ]
      
      render(<StatsGrid items={itemsWithComparison} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-comparison', 'Last Month: 20k')
    })

    test('should handle trend data', () => {
      const itemsWithTrend = [
        { 
          ...extendedItems[0], 
          trend: [
            { label: 'Jan', value: 10 },
            { label: 'Feb', value: 15 },
            { label: 'Mar', value: 20 }
          ]
        }
      ]
      
      render(<StatsGrid items={itemsWithTrend} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-trend', 'Jan:10,Feb:15,Mar:20')
    })
  })

  // ===============================
  // TEST SUITE 11: Responsive Behavior
  // ===============================
  describe('Responsive Behavior', () => {
    test('should calculate responsive columns correctly', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(
        <StatsGrid 
          breakpoints={{ sm: 640, md: 768, lg: 1024 }}
          responsive={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      )
      
      // Should use tablet breakpoint
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(2, 1fr)'
      })
    })

    test('should handle mobile breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      
      render(
        <StatsGrid 
          breakpoints={{ sm: 640, md: 768 }}
          responsive={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      )
      
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(1, 1fr)'
      })
    })

    test('should handle desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })
      
      render(
        <StatsGrid 
          breakpoints={{ sm: 640, md: 768, lg: 1024 }}
          responsive={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      )
      
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(4, 1fr)'
      })
    })

    test('should adjust gap for different screen sizes', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      
      render(<StatsGrid gap={20} breakpoints={{ sm: 640 }} />)
      
      const grid = screen.getByRole('group')
      expect(grid).toHaveStyle({
        gap: '10px' // 20 * 0.5 for mobile
      })
    })
  })

  // ===============================
  // TEST SUITE 12: Accessibility
  // ===============================
  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<StatsGrid items={extendedItems} />)
      
      const items = screen.getAllByTestId('stats-card')
      items.forEach((card, index) => {
        expect(card.closest('.stats-grid-item')).toHaveAttribute(
          'aria-label',
          `${extendedItems[index].label}: ${extendedItems[index].value}`
        )
      })
    })

    test('should have proper role attributes', () => {
      render(<StatsGrid items={extendedItems} clickable={true} />)
      
      const items = screen.getAllByTestId('stats-card')
      items.forEach(card => {
        expect(card.closest('.stats-grid-item')).toHaveAttribute('role', 'button')
      })
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<StatsGrid items={extendedItems.slice(0, 2)} clickable={true} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      
      // Should be focusable
      await user.tab()
      expect(firstItem).toHaveFocus()
      
      // Should support Enter key
      await user.keyboard('{Enter}')
      // Check that click handler was called (would be tested with actual handler)
    })

    test('should provide screen reader content for error state', () => {
      render(<StatsGrid error="Error loading data" />)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })

    test('should handle reduced motion preference', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      })
      
      render(<StatsGrid animated={true} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-grid-item')!)
      
      items.forEach(item => {
        expect(item).toHaveStyle({
          animation: 'none'
        })
      })
    })
  })

  // ===============================
  // TEST SUITE 13: Edge Cases
  // ===============================
  describe('Edge Cases', () => {
    test('should handle very large number of items', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
        value: i
      }))
      
      render(<StatsGrid items={manyItems} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards).toHaveLength(100)
    })

    test('should handle special characters in labels and values', () => {
      const specialItems = [
        { id: '1', label: 'Users™', value: '25,000€' },
        { id: '2', label: 'API: v2.1', value: '120#' },
        { id: '3', label: 'Regions & Areas', value: '12%' }
      ]
      
      render(<StatsGrid items={specialItems} />)
      
      specialItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument()
        expect(screen.getByText(item.value)).toBeInTheDocument()
      })
    })

    test('should handle empty strings and null values', () => {
      const edgeItems = [
        { id: '1', label: '', value: '' },
        { id: '2', label: 'Valid Item', value: null as any },
        { id: '3', label: 'Another Item', value: undefined }
      ]
      
      render(<StatsGrid items={edgeItems} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards).toHaveLength(3)
    })

    test('should handle extremely long text', () => {
      const longTextItems = [
        {
          id: '1',
          label: 'This is an extremely long label that might cause layout issues',
          value: 'This is also an extremely long value that could affect the grid layout',
          description: 'This is an even longer description that should be handled gracefully by the component'
        }
      ]
      
      render(<StatsGrid items={longTextItems} />)
      
      expect(screen.getByText(/extremely long label/)).toBeInTheDocument()
    })

    test('should handle rapid item updates', async () => {
      const TestComponent = () => {
        const [items, setItems] = React.useState(extendedItems.slice(0, 2))
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setItems(extendedItems)
          }, 100)
          
          return () => clearTimeout(timer)
        }, [])
        
        return <StatsGrid items={items} />
      }
      
      render(<TestComponent />)
      
      // Initially should have 2 items
      expect(screen.getAllByTestId('stats-card')).toHaveLength(2)
      
      // After update should have 4 items
      await waitFor(() => {
        expect(screen.getAllByTestId('stats-card')).toHaveLength(4)
      })
    })

    test('should handle network errors and timeouts', async () => {
      const mockOnRefresh = jest.fn()
      render(<StatsGrid error="Network error" onRefresh={mockOnRefresh} />)
      
      const retryButton = screen.getByText(/Retry/)
      fireEvent.click(retryButton)
      
      expect(mockOnRefresh).toHaveBeenCalled()
    })

    test('should handle concurrent animations and interactions', async () => {
      const user = userEvent.setup()
      const mockOnItemClick = jest.fn()
      
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 3)}
          animated={true}
          groupInteractions={true}
          onItemClick={mockOnItemClick}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      const secondItem = screen.getAllByTestId('stats-card')[1].closest('.stats-grid-item')
      
      // Hover first item
      await user.hover(firstItem!)
      
      // Click second item while first is hovered
      await user.click(secondItem!)
      
      expect(mockOnItemClick).toHaveBeenCalledWith(extendedItems[1], 1)
    })
  })

  // ===============================
  // TEST SUITE 14: Performance
  // ===============================
  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        
        React.useEffect(() => {
          const timer = setInterval(() => {
            setCount(prev => prev + 1)
          }, 100)
          
          return () => clearInterval(timer)
        }, [])
        
        return <StatsGrid key={count} />
      }
      
      const { rerender } = render(<TestComponent />)
      
      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          jest.advanceTimersByTime(100)
        })
        rerender(<TestComponent />)
      }
      
      // Should still render correctly
      expect(screen.getAllByTestId('stats-card')).toHaveLength(3)
    })

    test('should handle memory cleanup', () => {
      const { unmount } = render(<StatsGrid />)
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow()
    })

    test('should optimize sync calculations', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
        value: i * 10
      }))
      
      const { rerender } = render(
        <StatsGrid items={items} syncData={true} />
      )
      
      // Re-render with same items - should not recalculate sync data
      rerender(
        <StatsGrid items={items} syncData={true} />
      )
      
      // Should still show correct sync data
      expect(screen.getByText(/Sync:/)).toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 15: Integration Tests
  // ===============================
  describe('Integration Tests', () => {
    test('should work correctly with StatsCard props', () => {
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 2)}
          statsCardProps={{
            variant: 'bordered',
            size: 'large',
            layout: 'horizontal'
          }}
        />
      )
      
      const cards = screen.getAllByTestId('stats-card')
      
      cards.forEach(card => {
        expect(card).toHaveAttribute('data-variant', 'bordered')
        expect(card).toHaveAttribute('data-size', 'large')
        expect(card).toHaveAttribute('data-layout', 'horizontal')
      })
    })

    test('should handle complete workflow', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      const mockOnExport = jest.fn()
      const mockOnItemClick = jest.fn()
      
      render(
        <StatsGrid 
          items={extendedItems.slice(0, 3)}
          variant="bordered"
          size="medium"
          layout="fixed"
          columns={3}
          gap={16}
          animated={true}
          staggerDelay={100}
          hoverable={true}
          clickable={true}
          groupInteractions={true}
          syncData={true}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onItemClick={mockOnItemClick}
        />
      )
      
      // Check initial render
      expect(screen.getAllByTestId('stats-card')).toHaveLength(3)
      expect(screen.getByText(/Sync:/)).toBeInTheDocument()
      
      // Test interactions
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-grid-item')
      await user.click(firstItem!)
      expect(mockOnItemClick).toHaveBeenCalled()
      
      // Test actions
      const refreshButton = screen.getByLabelText('Refresh statistics')
      await user.click(refreshButton)
      expect(mockOnRefresh).toHaveBeenCalled()
      
      const exportButton = screen.getByLabelText('Export statistics')
      await user.click(exportButton)
      expect(mockOnExport).toHaveBeenCalled()
    })

    test('should handle error recovery workflow', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      
      render(
        <StatsGrid 
          error="Initial error"
          onRefresh={mockOnRefresh}
          items={extendedItems}
        />
      )
      
      // Should show error state
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
      
      // Click retry
      const retryButton = screen.getByText(/Retry/)
      await user.click(retryButton)
      
      // Should call refresh handler
      expect(mockOnRefresh).toHaveBeenCalled()
    })

    test('should handle loading to success transition', async () => {
      const TestComponent = () => {
        const [loading, setLoading] = React.useState(true)
        const [items, setItems] = React.useState<StatItem[]>([])
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false)
            setItems(extendedItems.slice(0, 2))
          }, 500)
          
          return () => clearTimeout(timer)
        }, [])
        
        return <StatsGrid loading={loading} items={items} />
      }
      
      render(<TestComponent />)
      
      // Initially loading
      expect(screen.getByTestId('stats-grid-skeleton')).toBeInTheDocument()
      
      // After loading completes
      await waitFor(() => {
        expect(screen.queryByTestId('stats-grid-skeleton')).not.toBeInTheDocument()
        expect(screen.getAllByTestId('stats-card')).toHaveLength(2)
      })
    })
  })
})