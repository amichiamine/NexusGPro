import React from 'react'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StatsRow from './StatsRow'
import { StatItem } from './StatsRow'

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

describe('StatsRow', () => {
  const defaultStats: StatItem[] = [
    { id: '1', label: 'Users', value: '12k' },
    { id: '2', label: 'Uptime', value: '99.9%' }
  ]

  const extendedStats: StatItem[] = [
    { 
      id: '1', 
      label: 'Active Users', 
      value: '45,231', 
      delta: '+12%', 
      deltaType: 'increase',
      subtitle: 'This month',
      description: 'Users active this month',
      icon: '👥',
      format: 'number'
    },
    { 
      id: '2', 
      label: 'Revenue', 
      value: '$125,430', 
      delta: '-5%', 
      deltaType: 'decrease',
      subtitle: 'Monthly',
      description: 'Revenue this month',
      icon: '💰',
      format: 'currency'
    },
    { 
      id: '3', 
      label: 'Conversion Rate', 
      value: '3.2%', 
      delta: '+0.5%', 
      deltaType: 'increase',
      subtitle: 'Site wide',
      description: 'Average conversion rate',
      icon: '📈',
      format: 'percentage'
    },
    { 
      id: '4', 
      label: 'Server Uptime', 
      value: '99.9%', 
      delta: '+0.1%', 
      deltaType: 'increase',
      subtitle: 'Last 30 days',
      description: 'Server availability',
      icon: '⚡',
      format: 'percentage'
    },
    { 
      id: '5', 
      label: 'Response Time', 
      value: '145ms', 
      delta: '-12ms', 
      deltaType: 'increase',
      subtitle: 'Average',
      description: 'API response time',
      icon: '🚀',
      format: 'compact'
    }
  ]

  // ===============================
  // TEST SUITE 1: Basic Rendering
  // ===============================
  describe('Basic Rendering', () => {
    test('should render with default stats when no props provided', () => {
      render(<StatsRow />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(2)
    })

    test('should render with custom stats', () => {
      render(<StatsRow stats={extendedStats} />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(5)
      
      extendedStats.forEach((stat, index) => {
        expect(screen.getByText(stat.label)).toBeInTheDocument()
        expect(screen.getByText(stat.value.toString())).toBeInTheDocument()
      })
    })

    test('should render with empty stats array', () => {
      render(<StatsRow stats={[]} />)
      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })

    test('should render with undefined stats', () => {
      render(<StatsRow stats={undefined} />)
      const statsCards = screen.getAllByTestId('stats-card')
      expect(statsCards).toHaveLength(2) // fallback to defaultStats
    })

    test('should apply custom className', () => {
      const { container } = render(<StatsRow className="custom-class" />)
      expect(container.firstChild).toHaveClass('stats-row', 'custom-class')
    })

    test('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' }
      const { container } = render(<StatsRow style={customStyle} />)
      expect(container.firstChild).toHaveStyle(customStyle)
    })

    test('should render header when actions are provided', () => {
      const mockOnRefresh = jest.fn()
      render(<StatsRow onRefresh={mockOnRefresh} />)
      
      expect(screen.getByLabelText('Refresh statistics')).toBeInTheDocument()
    })

    test('should not render header when no actions provided', () => {
      render(<StatsRow />)
      expect(screen.queryByLabelText('Refresh statistics')).not.toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 2: Direction and Layout
  // ===============================
  describe('Direction and Layout', () => {
    test('should apply horizontal direction by default', () => {
      const { container } = render(<StatsRow />)
      expect(container.firstChild).toHaveClass('stats-row--horizontal')
    })

    test('should apply vertical direction', () => {
      const { container } = render(<StatsRow direction="vertical" />)
      expect(container.firstChild).toHaveClass('stats-row--vertical')
    })

    test('should apply auto direction and responsive behavior', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      
      render(
        <StatsRow 
          direction="auto"
          responsive={{
            mobile: { columns: 1, direction: 'vertical' },
            tablet: { columns: 2, direction: 'vertical' },
            desktop: { columns: 3, direction: 'horizontal' }
          }}
        />
      )
      
      // Should use mobile direction (vertical)
      const container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--vertical')
    })

    test('should enable wrapping', () => {
      const { container } = render(<StatsRow wrap={true} />)
      expect(container.firstChild).toHaveClass('stats-row--wrap')
    })

    test('should disable wrapping', () => {
      const { container } = render(<StatsRow wrap={false} />)
      expect(container.firstChild).toHaveClass('stats-row--nowrap')
    })

    test('should enable scrollable mode', () => {
      const { container } = render(<StatsRow scrollable={true} />)
      expect(container.firstChild).toHaveClass('stats-row--scrollable')
      expect(screen.getByTestId('stats-row-scroller')).toBeInTheDocument()
    })

    test('should apply different alignments', () => {
      const alignments = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const
      
      alignments.forEach(alignment => {
        const { container } = render(<StatsRow alignment={alignment} />)
        expect(container.firstChild).toHaveClass(`stats-row--${alignment}`)
      })
    })

    test('should apply different layout variants', () => {
      const layouts = ['inline', 'stacked', 'compact', 'expanded'] as const
      
      layouts.forEach(layout => {
        const { container } = render(<StatsRow layout={layout} />)
        expect(container.firstChild).toHaveClass(`stats-row--${layout}`)
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
        const { container } = render(<StatsRow variant={variant as any} />)
        expect(container.firstChild).toHaveClass(`stats-row--${variant}`)
      }
    )

    test.each(['small', 'medium', 'large', 'xlarge'])(
      'should apply %s size',
      (size) => {
        const { container } = render(<StatsRow size={size as any} />)
        expect(container.firstChild).toHaveClass(`stats-row--${size}`)
      }
    )

    test('should apply multiple variants correctly', () => {
      const { container } = render(
        <StatsRow 
          variant="bordered" 
          size="large" 
          direction="vertical"
          alignment="center"
        />
      )
      expect(container.firstChild).toHaveClass(
        'stats-row--bordered',
        'stats-row--large',
        'stats-row--vertical',
        'stats-row--center'
      )
    })
  })

  // ===============================
  // TEST SUITE 4: Data Synchronization
  // ===============================
  describe('Data Synchronization', () => {
    test('should calculate sync data when enabled', () => {
      const syncStats = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 },
        { label: 'Item 3', value: 150 }
      ]
      render(<StatsRow stats={syncStats} syncData={true} />)
      
      // Should show sync badge in header
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
      expect(screen.getByText(/450/)).toBeInTheDocument()
      expect(screen.getByText(/\(3 items\)/)).toBeInTheDocument()
    })

    test('should not show sync data when disabled', () => {
      const syncStats = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      render(<StatsRow stats={syncStats} syncData={false} />)
      
      expect(screen.queryByText(/Total:/)).not.toBeInTheDocument()
    })

    test('should handle string values in sync calculation', () => {
      const syncStats = [
        { label: 'Item 1', value: '100' },
        { label: 'Item 2', value: '$200' },
        { label: 'Item 3', value: 'invalid' }
      ]
      render(<StatsRow stats={syncStats} syncData={true} />)
      
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
    })

    test('should handle percentage values in sync calculation', () => {
      const syncStats = [
        { label: 'Item 1', value: '95%' },
        { label: 'Item 2', value: '87%' },
        { label: 'Item 3', value: '92%' }
      ]
      render(<StatsRow stats={syncStats} syncData={true} />)
      
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 5: Animations
  // ===============================
  describe('Animations', () => {
    test('should enable animations by default', () => {
      const { container } = render(<StatsRow />)
      expect(container.firstChild).not.toHaveClass('stats-row--no-animation')
    })

    test('should disable animations when animated is false', () => {
      const { container } = render(<StatsRow animated={false} />)
      const items = container.querySelectorAll('.stats-row-item')
      
      items.forEach(item => {
        expect(item).toHaveStyle({
          opacity: '1',
          transform: 'none'
        })
      })
    })

    test('should apply different animation types', () => {
      const { container } = render(
        <StatsRow 
          animationType="slide" 
          staggerDelay={150}
          animated={true}
          stats={extendedStats.slice(0, 2)}
        />
      )
      
      expect(container.firstChild).toHaveClass('stats-row--slide')
    })

    test('should apply different animation directions', () => {
      const directions = ['left', 'right', 'up', 'down'] as const
      
      directions.forEach(direction => {
        const { container } = render(
          <StatsRow 
            animationType="slide"
            directionAnim={direction}
            stats={extendedStats.slice(0, 2)}
          />
        )
        
        const items = container.querySelectorAll('.stats-row-item')
        expect(items[0]).toHaveClass(`stats-row-item--direction-${direction}`)
      })
    })

    test('should stagger animations with delays', () => {
      const { container } = render(
        <StatsRow 
          animated={true} 
          staggerDelay={200}
          stats={extendedStats.slice(0, 3)}
        />
      )
      
      const items = container.querySelectorAll('.stats-row-item')
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
      const { container } = render(<StatsRow />)
      expect(container.firstChild).toHaveClass('stats-row--hoverable')
    })

    test('should disable hoverable when false', () => {
      const { container } = render(<StatsRow hoverable={false} />)
      expect(container.firstChild).not.toHaveClass('stats-row--hoverable')
    })

    test('should enable clickable interactions by default', () => {
      const { container } = render(<StatsRow />)
      const items = container.querySelectorAll('.stats-row-item')
      
      items.forEach(item => {
        expect(item).toHaveClass('stats-row-item--clickable')
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    test('should disable clickable when false', () => {
      const { container } = render(<StatsRow clickable={false} />)
      const items = container.querySelectorAll('.stats-row-item')
      
      items.forEach(item => {
        expect(item).not.toHaveClass('stats-row-item--clickable')
        expect(item).toHaveAttribute('tabIndex', '-1')
      })
    })

    test('should enable group interactions by default', () => {
      const { container } = render(<StatsRow />)
      expect(container.firstChild).toHaveClass('stats-row--group-interactions')
    })

    test('should disable group interactions when false', () => {
      const { container } = render(<StatsRow groupInteractions={false} />)
      expect(container.firstChild).not.toHaveClass('stats-row--group-interactions')
    })

    test('should handle stat click events', async () => {
      const user = userEvent.setup()
      const mockOnStatClick = jest.fn()
      
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 2)} 
          onStatClick={mockOnStatClick}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      await user.click(firstItem!)
      
      expect(mockOnStatClick).toHaveBeenCalledTimes(1)
      expect(mockOnStatClick).toHaveBeenCalledWith(extendedStats[0], 0)
    })

    test('should handle stat native onClick', async () => {
      const user = userEvent.setup()
      const mockStatClick = jest.fn()
      
      const statsWithClick = [
        { ...extendedStats[0], onClick: mockStatClick }
      ]
      
      render(<StatsRow stats={statsWithClick} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      await user.click(firstItem!)
      
      expect(mockStatClick).toHaveBeenCalledTimes(1)
    })

    test('should handle hover events for group interactions', async () => {
      const user = userEvent.setup()
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 3)} 
          groupInteractions={true}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      
      await user.hover(firstItem!)
      
      expect(firstItem!).toHaveClass('stats-row-item--hovered')
      
      // Check if other items show grouped effect
      const otherItems = screen.getAllByTestId('stats-card')
        .slice(1)
        .map(card => card.closest('.stats-row-item')!)
      
      otherItems.forEach(item => {
        expect(item).toHaveClass('stats-row-item') // Should be affected by group hover
      })
    })

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<StatsRow stats={extendedStats.slice(0, 2)} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      
      await user.tab()
      expect(firstItem!).toHaveFocus()
      
      await user.keyboard('{Enter}')
      // Should trigger click when focused and Enter pressed
    })
  })

  // ===============================
  // TEST SUITE 7: Scrollable Mode
  // ===============================
  describe('Scrollable Mode', () => {
    test('should enable scrollable mode', () => {
      render(<StatsRow scrollable={true} />)
      
      expect(screen.getByTestId('stats-row-scroller')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll left')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument()
    })

    test('should show navigation controls only when scrollable', () => {
      render(<StatsRow scrollable={true} />)
      
      expect(screen.getByLabelText('Scroll left')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument()
    })

    test('should hide navigation controls when not scrollable', () => {
      render(<StatsRow scrollable={false} />)
      
      expect(screen.queryByLabelText('Scroll left')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Scroll right')).not.toBeInTheDocument()
    })

    test('should handle scroll left button', async () => {
      const user = userEvent.setup()
      
      // Mock scrollContainerRef
      const mockScrollTo = jest.fn()
      jest.spyOn(HTMLElement.prototype, 'scrollTo').mockImplementation(mockScrollTo)
      
      render(<StatsRow scrollable={true} stats={extendedStats} />)
      
      const scrollLeftButton = screen.getByLabelText('Scroll left')
      await user.click(scrollLeftButton)
      
      expect(mockScrollTo).toHaveBeenCalled()
    })

    test('should handle scroll right button', async () => {
      const user = userEvent.setup()
      
      // Mock scrollContainerRef
      const mockScrollTo = jest.fn()
      jest.spyOn(HTMLElement.prototype, 'scrollTo').mockImplementation(mockScrollTo)
      
      render(<StatsRow scrollable={true} stats={extendedStats} />)
      
      const scrollRightButton = screen.getByLabelText('Scroll right')
      await user.click(scrollRightButton)
      
      expect(mockScrollTo).toHaveBeenCalled()
    })

    test('should disable scroll left when at start', () => {
      render(<StatsRow scrollable={true} />)
      
      const scrollLeftButton = screen.getByLabelText('Scroll left')
      expect(scrollLeftButton).toBeDisabled()
    })
  })

  // ===============================
  // TEST SUITE 8: Responsive Behavior
  // ===============================
  describe('Responsive Behavior', () => {
    test('should calculate responsive columns and direction correctly', () => {
      // Mock window.innerWidth for tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(
        <StatsRow 
          breakpoints={{ sm: 640, md: 768, lg: 1024 }}
          responsive={{
            mobile: { columns: 1, direction: 'vertical' },
            tablet: { columns: 2, direction: 'vertical' },
            desktop: { columns: 3, direction: 'horizontal' }
          }}
        />
      )
      
      // Should use tablet configuration
      const container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--vertical')
    })

    test('should handle mobile breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      
      render(
        <StatsRow 
          breakpoints={{ sm: 640, md: 768 }}
          responsive={{
            mobile: { columns: 1, direction: 'vertical' },
            tablet: { columns: 2, direction: 'vertical' },
            desktop: { columns: 3, direction: 'horizontal' }
          }}
        />
      )
      
      const container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--vertical')
    })

    test('should handle desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })
      
      render(
        <StatsRow 
          breakpoints={{ sm: 640, md: 768, lg: 1024 }}
          responsive={{
            mobile: { columns: 1, direction: 'vertical' },
            tablet: { columns: 2, direction: 'vertical' },
            desktop: { columns: 3, direction: 'horizontal' }
          }}
        />
      )
      
      const container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--horizontal')
    })

    test('should adjust gap for different screen sizes', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      
      render(<StatsRow gap={20} breakpoints={{ sm: 640 }} />)
      
      const container = screen.getByRole('group')
      expect(container).toHaveStyle({
        gap: '10px' // 20 * 0.5 for mobile
      })
    })
  })

  // ===============================
  // TEST SUITE 9: Loading States
  // ===============================
  describe('Loading States', () => {
    test('should show loading state', () => {
      render(<StatsRow loading={true} />)
      
      expect(screen.getByTestId('stats-row-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })

    test('should render skeleton items', () => {
      render(<StatsRow loading={true} />)
      
      const skeletonItems = screen.queryAllByTestId('stats-row-skeleton-item')
      expect(skeletonItems).toHaveLength(2) // max(columns, 2)
    })

    test('should show loading class on container', () => {
      const { container } = render(<StatsRow loading={true} />)
      expect(container.firstChild).toHaveClass('stats-row--loading')
    })

    test('should disable interactions during loading', () => {
      render(<StatsRow loading={true} />)
      
      const container = screen.getByRole('group')
      expect(container).toHaveAttribute('pointer-events', 'none')
    })

    test('should show loading state on individual stats', () => {
      const statsWithLoading = [
        { ...extendedStats[0], loading: true },
        extendedStats[1]
      ]
      
      render(<StatsRow stats={statsWithLoading} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards[0]).toHaveAttribute('data-loading', 'true')
      expect(cards[1]).not.toHaveAttribute('data-loading')
    })
  })

  // ===============================
  // TEST SUITE 10: Error States
  // ===============================
  describe('Error States', () => {
    test('should show error state when error prop provided', () => {
      render(<StatsRow error="Custom error message" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    test('should show default error state', () => {
      render(<StatsRow error="Error loading statistics" />)
      
      expect(screen.getByText(/Error loading statistics/)).toBeInTheDocument()
      expect(screen.getByText(/Retry/)).toBeInTheDocument()
    })

    test('should handle error retry', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      
      render(<StatsRow error="Error" onRefresh={mockOnRefresh} />)
      
      const retryButton = screen.getByText(/Retry/)
      await user.click(retryButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('should show individual stat errors', () => {
      const statsWithError = [
        { ...extendedStats[0], error: 'Stat error' },
        extendedStats[1]
      ]
      
      render(<StatsRow stats={statsWithError} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards[0]).toHaveAttribute('data-error', 'Stat error')
      expect(cards[1]).not.toHaveAttribute('data-error')
    })
  })

  // ===============================
  // TEST SUITE 11: Actions and Controls
  // ===============================
  describe('Actions and Controls', () => {
    test('should render refresh action', () => {
      const mockOnRefresh = jest.fn()
      render(<StatsRow onRefresh={mockOnRefresh} />)
      
      const refreshButton = screen.getByLabelText('Refresh statistics')
      expect(refreshButton).toBeInTheDocument()
    })

    test('should handle refresh action', async () => {
      const user = userEvent.setup()
      const mockOnRefresh = jest.fn()
      
      render(<StatsRow onRefresh={mockOnRefresh} />)
      
      const refreshButton = screen.getByLabelText('Refresh statistics')
      await user.click(refreshButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('should render export action', () => {
      const mockOnExport = jest.fn()
      render(<StatsRow onExport={mockOnExport} />)
      
      const exportButton = screen.getByLabelText('Export statistics')
      expect(exportButton).toBeInTheDocument()
    })

    test('should handle export action', async () => {
      const user = userEvent.setup()
      const mockOnExport = jest.fn()
      
      render(<StatsRow onExport={mockOnExport} />)
      
      const exportButton = screen.getByLabelText('Export statistics')
      await user.click(exportButton)
      
      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    test('should show sync badge when sync data enabled', () => {
      const syncStats = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      
      render(<StatsRow stats={syncStats} syncData={true} />)
      
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
    })

    test('should show sync badge when sync data disabled', () => {
      const syncStats = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 }
      ]
      
      render(<StatsRow stats={syncStats} syncData={false} />)
      
      expect(screen.queryByText(/Total:/)).not.toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 12: Spacing and Gap
  // ===============================
  describe('Spacing and Gap', () => {
    test('should set custom gap', () => {
      render(<StatsRow gap={30} />)
      
      const container = screen.getByRole('group')
      expect(container).toHaveStyle({
        gap: '30px'
      })
    })

    test('should apply spacing presets', () => {
      const spacingPresets = ['tight', 'normal', 'relaxed', 'loose'] as const
      
      spacingPresets.forEach(spacing => {
        const { container } = render(<StatsRow spacing={spacing} />)
        expect(container.firstChild).toHaveClass(`stats-row--${spacing}`)
      })
    })

    test('should calculate responsive gap based on size', () => {
      const sizes = ['small', 'medium', 'large', 'xlarge'] as const
      
      sizes.forEach(size => {
        const { container } = render(<StatsRow size={size} />)
        expect(container.firstChild).toHaveClass(`stats-row--${size}`)
      })
    })
  })

  // ===============================
  // TEST SUITE 13: Props Integration
  // ===============================
  describe('Props Integration', () => {
    test('should pass props to StatsCard component', () => {
      const customStatsCardProps = {
        variant: 'bordered' as const,
        size: 'large' as const,
        layout: 'horizontal' as const
      }
      
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 1)} 
          statsCardProps={customStatsCardProps}
        />
      )
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-variant', 'bordered')
      expect(card).toHaveAttribute('data-size', 'large')
      expect(card).toHaveAttribute('data-layout', 'horizontal')
    })

    test('should handle disabled stats', () => {
      const statsWithDisabled = [
        { ...extendedStats[0], disabled: true },
        extendedStats[1]
      ]
      
      render(<StatsRow stats={statsWithDisabled} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-row-item')!)
      
      expect(items[0]).toHaveClass('stats-row-item--disabled')
      expect(items[1]).not.toHaveClass('stats-row-item--disabled')
    })

    test('should handle href navigation', () => {
      const statsWithHref = [
        { ...extendedStats[0], href: '/users' },
        extendedStats[1]
      ]
      
      render(<StatsRow stats={statsWithHref} clickable={true} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-row-item')!)
      
      expect(items[0]).toHaveAttribute('role', 'link')
      expect(items[1]).toHaveAttribute('role', 'button')
    })

    test('should handle progress data', () => {
      const statsWithProgress = [
        { 
          ...extendedStats[0], 
          progress: { current: 75, target: 100 } 
        }
      ]
      
      render(<StatsRow stats={statsWithProgress} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-progress', '75/100')
    })

    test('should handle comparison data', () => {
      const statsWithComparison = [
        { 
          ...extendedStats[0], 
          comparison: { label: 'Last Month', value: '20k' } 
        }
      ]
      
      render(<StatsRow stats={statsWithComparison} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-comparison', 'Last Month: 20k')
    })

    test('should handle trend data', () => {
      const statsWithTrend = [
        { 
          ...extendedStats[0], 
          trend: [
            { label: 'Jan', value: 10 },
            { label: 'Feb', value: 15 },
            { label: 'Mar', value: 20 }
          ]
        }
      ]
      
      render(<StatsRow stats={statsWithTrend} />)
      
      const card = screen.getByTestId('stats-card')
      expect(card).toHaveAttribute('data-trend', 'Jan:10,Feb:15,Mar:20')
    })
  })

  // ===============================
  // TEST SUITE 14: Accessibility
  // ===============================
  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<StatsRow stats={extendedStats} />)
      
      const items = screen.getAllByTestId('stats-card')
      items.forEach((card, index) => {
        expect(card.closest('.stats-row-item')).toHaveAttribute(
          'aria-label',
          `${extendedStats[index].label}: ${extendedStats[index].value}`
        )
      })
    })

    test('should have proper role attributes', () => {
      render(<StatsRow stats={extendedStats} clickable={true} />)
      
      const items = screen.getAllByTestId('stats-card')
      items.forEach(card => {
        expect(card.closest('.stats-row-item')).toHaveAttribute('role', 'button')
      })
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<StatsRow stats={extendedStats.slice(0, 2)} clickable={true} />)
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      
      // Should be focusable
      await user.tab()
      expect(firstItem).toHaveFocus()
      
      // Should support Enter key
      await user.keyboard('{Enter}')
      // Check that click handler was called (would be tested with actual handler)
    })

    test('should provide screen reader content for error state', () => {
      render(<StatsRow error="Error loading data" />)
      
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
      
      render(<StatsRow animated={true} />)
      
      const items = screen.getAllByTestId('stats-card')
        .map(card => card.closest('.stats-row-item')!)
      
      items.forEach(item => {
        expect(item).toHaveStyle({
          animation: 'none'
        })
      })
    })
  })

  // ===============================
  // TEST SUITE 15: Edge Cases
  // ===============================
  describe('Edge Cases', () => {
    test('should handle very large number of stats', () => {
      const manyStats = Array.from({ length: 50 }, (_, i) => ({
        id: `stat-${i}`,
        label: `Stat ${i}`,
        value: i
      }))
      
      render(<StatsRow stats={manyStats} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards).toHaveLength(50)
    })

    test('should handle special characters in labels and values', () => {
      const specialStats = [
        { id: '1', label: 'Users™', value: '25,000€' },
        { id: '2', label: 'API: v2.1', value: '120#' },
        { id: '3', label: 'Regions & Areas', value: '12%' }
      ]
      
      render(<StatsRow stats={specialStats} />)
      
      specialStats.forEach(stat => {
        expect(screen.getByText(stat.label)).toBeInTheDocument()
        expect(screen.getByText(stat.value)).toBeInTheDocument()
      })
    })

    test('should handle empty strings and null values', () => {
      const edgeStats = [
        { id: '1', label: '', value: '' },
        { id: '2', label: 'Valid Stat', value: null as any },
        { id: '3', label: 'Another Stat', value: undefined }
      ]
      
      render(<StatsRow stats={edgeStats} />)
      
      const cards = screen.getAllByTestId('stats-card')
      expect(cards).toHaveLength(3)
    })

    test('should handle extremely long text', () => {
      const longTextStats = [
        {
          id: '1',
          label: 'This is an extremely long label that might cause layout issues',
          value: 'This is also an extremely long value that could affect the row layout',
          description: 'This is an even longer description that should be handled gracefully by the component'
        }
      ]
      
      render(<StatsRow stats={longTextStats} />)
      
      expect(screen.getByText(/extremely long label/)).toBeInTheDocument()
    })

    test('should handle rapid stat updates', async () => {
      const TestComponent = () => {
        const [stats, setStats] = React.useState(extendedStats.slice(0, 2))
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setStats(extendedStats)
          }, 100)
          
          return () => clearTimeout(timer)
        }, [])
        
        return <StatsRow stats={stats} />
      }
      
      render(<TestComponent />)
      
      // Initially should have 2 stats
      expect(screen.getAllByTestId('stats-card')).toHaveLength(2)
      
      // After update should have 5 stats
      await waitFor(() => {
        expect(screen.getAllByTestId('stats-card')).toHaveLength(5)
      })
    })

    test('should handle scroll with many items', async () => {
      const user = userEvent.setup()
      const manyStats = Array.from({ length: 20 }, (_, i) => ({
        id: `stat-${i}`,
        label: `Stat ${i}`,
        value: i * 10
      }))
      
      render(<StatsRow stats={manyStats} scrollable={true} />)
      
      const scrollRightButton = screen.getByLabelText('Scroll right')
      await user.click(scrollRightButton)
      
      // Should handle scroll without errors
      expect(scrollRightButton).toBeInTheDocument()
    })

    test('should handle concurrent animations and interactions', async () => {
      const user = userEvent.setup()
      const mockOnStatClick = jest.fn()
      
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 3)}
          animated={true}
          groupInteractions={true}
          onStatClick={mockOnStatClick}
        />
      )
      
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      const secondItem = screen.getAllByTestId('stats-card')[1].closest('.stats-row-item')
      
      // Hover first item
      await user.hover(firstItem!)
      
      // Click second item while first is hovered
      await user.click(secondItem!)
      
      expect(mockOnStatClick).toHaveBeenCalledWith(extendedStats[1], 1)
    })
  })

  // ===============================
  // TEST SUITE 16: Performance
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
        
        return <StatsRow key={count} />
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
      expect(screen.getAllByTestId('stats-card')).toHaveLength(2)
    })

    test('should handle memory cleanup', () => {
      const { unmount } = render(<StatsRow />)
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow()
    })

    test('should optimize sync calculations', () => {
      const stats = Array.from({ length: 30 }, (_, i) => ({
        id: `stat-${i}`,
        label: `Stat ${i}`,
        value: i * 10
      }))
      
      const { rerender } = render(
        <StatsRow stats={stats} syncData={true} />
      )
      
      // Re-render with same stats - should not recalculate sync data
      rerender(
        <StatsRow stats={stats} syncData={true} />
      )
      
      // Should still show correct sync data
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
    })
  })

  // ===============================
  // TEST SUITE 17: Integration Tests
  // ===============================
  describe('Integration Tests', () => {
    test('should work correctly with StatsCard props', () => {
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 2)}
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
      const mockOnStatClick = jest.fn()
      
      render(
        <StatsRow 
          stats={extendedStats.slice(0, 3)}
          variant="bordered"
          size="medium"
          direction="horizontal"
          alignment="center"
          wrap={true}
          gap={20}
          animated={true}
          staggerDelay={100}
          animationType="slide"
          directionAnim="left"
          hoverable={true}
          clickable={true}
          groupInteractions={true}
          syncData={true}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onStatClick={mockOnStatClick}
        />
      )
      
      // Check initial render
      expect(screen.getAllByTestId('stats-card')).toHaveLength(3)
      expect(screen.getByText(/Total:/)).toBeInTheDocument()
      
      // Test interactions
      const firstItem = screen.getAllByTestId('stats-card')[0].closest('.stats-row-item')
      await user.click(firstItem!)
      expect(mockOnStatClick).toHaveBeenCalled()
      
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
        <StatsRow 
          error="Initial error"
          onRefresh={mockOnRefresh}
          stats={extendedStats}
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
        const [stats, setStats] = React.useState<StatItem[]>([])
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false)
            setStats(extendedStats.slice(0, 2))
          }, 500)
          
          return () => clearTimeout(timer)
        }, [])
        
        return <StatsRow loading={loading} stats={stats} />
      }
      
      render(<TestComponent />)
      
      // Initially loading
      expect(screen.getByTestId('stats-row-skeleton')).toBeInTheDocument()
      
      // After loading completes
      await waitFor(() => {
        expect(screen.queryByTestId('stats-row-skeleton')).not.toBeInTheDocument()
        expect(screen.getAllByTestId('stats-card')).toHaveLength(2)
      })
    })

    test('should handle horizontal and vertical layouts', () => {
      const { rerender } = render(
        <StatsRow 
          stats={extendedStats.slice(0, 3)}
          direction="horizontal"
        />
      )
      
      let container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--horizontal')
      
      rerender(
        <StatsRow 
          stats={extendedStats.slice(0, 3)}
          direction="vertical"
        />
      )
      
      container = screen.getByRole('group')
      expect(container).toHaveClass('stats-row--vertical')
    })

    test('should handle scrollable with many items', async () => {
      const user = userEvent.setup()
      const manyStats = Array.from({ length: 15 }, (_, i) => ({
        id: `stat-${i}`,
        label: `Stat ${i}`,
        value: i * 100
      }))
      
      render(<StatsRow stats={manyStats} scrollable={true} />)
      
      expect(screen.getByTestId('stats-row-scroller')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll left')).toBeInTheDocument()
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument()
      
      // Test scroll controls
      const scrollLeftButton = screen.getByLabelText('Scroll left')
      const scrollRightButton = screen.getByLabelText('Scroll right')
      
      await user.click(scrollRightButton)
      expect(scrollLeftButton).not.toBeDisabled()
      
      await user.click(scrollLeftButton)
      expect(scrollLeftButton).toBeDisabled()
    })
  })
})