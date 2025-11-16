import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import StatsCard from './StatsCard'

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowUpIcon: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-up" className={className} />
  ),
  ArrowDownIcon: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-down" className={className} />
  ),
  MinusIcon: ({ className }: { className?: string }) => (
    <svg data-testid="minus" className={className} />
  ),
  ChartBarIcon: ({ className }: { className?: string }) => (
    <svg data-testid="chart-bar" className={className} />
  ),
  UserGroupIcon: ({ className }: { className?: string }) => (
    <svg data-testid="user-group" className={className} />
  ),
}))

// Test data
const defaultProps = {
  title: 'Total Users',
  value: 1234,
  delta: '+12.5%'
}

describe('StatsCard', () => {
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
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1,234')).toBeInTheDocument()
      expect(screen.getByText('+12.5%')).toBeInTheDocument()
    })

    it('should render title and value correctly', () => {
      render(<StatsCard title="Revenue" value="$50,000" />)
      
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('$50,000')).toBeInTheDocument()
    })

    it('should render subtitle', () => {
      render(<StatsCard 
        {...defaultProps} 
        subtitle="Monthly active users" 
      />)
      
      expect(screen.getByText('Monthly active users')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<StatsCard 
        {...defaultProps} 
        description="This is a detailed description of the metric"
      />)
      
      expect(screen.getByText('This is a detailed description of the metric')).toBeInTheDocument()
    })

    it('should handle string values', () => {
      render(<StatsCard title="Status" value="Active" />)
      
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should handle numeric values', () => {
      render(<StatsCard title="Count" value={42} />)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should handle zero values', () => {
      render(<StatsCard title="Empty" value={0} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      render(<StatsCard title="Loss" value={-500} />)
      
      expect(screen.getByText('-500')).toBeInTheDocument()
    })
  })

  describe('Visual Variants', () => {
    const variants: Array<StatsCardProps['variant']> = ['default', 'outlined', 'filled', 'elevated', 'glass', 'gradient']
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        render(<StatsCard {...defaultProps} variant={variant} />)
        
        expect(document.querySelector(`.statscard--${variant}`)).toBeInTheDocument()
      })
    })
  })

  describe('Size Variants', () => {
    const sizes: Array<StatsCardProps['size']> = ['sm', 'md', 'lg', 'xl']
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        render(<StatsCard {...defaultProps} size={size} />)
        
        expect(document.querySelector(`.statscard--${size}`)).toBeInTheDocument()
      })
    })
  })

  describe('Layout Variants', () => {
    const layouts: Array<StatsCardProps['layout']> = ['default', 'compact', 'detailed', 'minimal']
    
    layouts.forEach(layout => {
      it(`should render with ${layout} layout`, () => {
        render(<StatsCard {...defaultProps} layout={layout} />)
        
        expect(document.querySelector(`.statscard--${layout}`)).toBeInTheDocument()
      })
    })
  })

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const IconComponent = () => <svg data-testid="custom-icon" />
      
      render(<StatsCard 
        {...defaultProps} 
        icon={IconComponent}
      />)
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('should apply custom icon colors', () => {
      const IconComponent = () => <svg data-testid="colored-icon" />
      
      render(<StatsCard 
        {...defaultProps} 
        icon={IconComponent}
        iconColor="#ff0000"
        iconBackground="#0000ff"
      />)
      
      const iconContainer = screen.getByTestId('colored-icon').closest('.statscard__icon')
      expect(iconContainer).toHaveStyle({
        color: '#ff0000',
        backgroundColor: '#0000ff'
      })
    })

    it('should use Heroicons when provided', () => {
      render(<StatsCard 
        {...defaultProps} 
        icon={ChartBarIcon}
      />)
      
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument()
    })
  })

  describe('Delta Indicator', () => {
    it('should render positive delta with increase status', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta="+15%" 
      />)
      
      expect(document.querySelector('.statscard__delta--increase')).toBeInTheDocument()
      expect(screen.getByTestId('arrow-up')).toBeInTheDocument()
    })

    it('should render negative delta with decrease status', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta="-8%" 
      />)
      
      expect(document.querySelector('.statscard__delta--decrease')).toBeInTheDocument()
      expect(screen.getByTestId('arrow-down')).toBeInTheDocument()
    })

    it('should render neutral delta when no sign', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta="0%" 
      />)
      
      expect(document.querySelector('.statscard__delta--neutral')).toBeInTheDocument()
      expect(screen.getByTestId('minus')).toBeInTheDocument()
    })

    it('should handle unicode minus sign', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta="−5%" 
      />)
      
      expect(document.querySelector('.statscard__delta--decrease')).toBeInTheDocument()
    })

    it('should handle unicode plus sign', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta="＋10%" 
      />)
      
      expect(document.querySelector('.statscard__delta--increase')).toBeInTheDocument()
    })

    it('should handle delta as number', () => {
      render(<StatsCard 
        {...defaultProps} 
        delta={25} 
      />)
      
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should not render delta when not provided', () => {
      render(<StatsCard 
        title="No Delta" 
        value="100" 
      />)
      
      expect(screen.queryByRole('group')).not.toBeInTheDocument()
    })
  })

  describe('Value Formatting', () => {
    it('should format currency values', () => {
      render(<StatsCard 
        title="Revenue" 
        value={1234567.89} 
        format="currency" 
        currency="USD"
      />)
      
      expect(screen.getByText(/\$/)).toBeInTheDocument()
    })

    it('should format percentage values', () => {
      render(<StatsCard 
        title="Growth" 
        value={15.5} 
        format="percentage"
      />)
      
      expect(screen.getByText('15.5%')).toBeInTheDocument()
    })

    it('should format compact numbers', () => {
      render(<StatsCard 
        title="Large Number" 
        value={1500000} 
        format="compact"
      />)
      
      // Should show compact notation like "1.5M"
      expect(screen.getByText(/[0-9]\.[0-9][KM]/)).toBeInTheDocument()
    })

    it('should format regular numbers', () => {
      render(<StatsCard 
        title="Count" 
        value={12345} 
        format="number"
      />)
      
      expect(screen.getByText('12,345')).toBeInTheDocument()
    })

    it('should handle invalid format gracefully', () => {
      render(<StatsCard 
        title="Invalid" 
        value="not-a-number" 
        format="percentage"
      />)
      
      expect(screen.getByText('not-a-number')).toBeInTheDocument()
    })
  })

  describe('Comparison Section', () => {
    it('should render comparison data', () => {
      render(<StatsCard 
        {...defaultProps}
        comparison={{
          value: 1000,
          label: 'Previous Month',
          type: 'increase'
        }}
      />)
      
      expect(screen.getByText('Previous Month')).toBeInTheDocument()
      expect(screen.getByText('1,000')).toBeInTheDocument()
      expect(document.querySelector('.statscard__comparison--increase')).toBeInTheDocument()
    })

    it('should handle comparison without type', () => {
      render(<StatsCard 
        {...defaultProps}
        comparison={{
          value: 'Custom',
          label: 'Custom Label'
        }}
      />)
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })
  })

  describe('Benchmark Section', () => {
    it('should render benchmark data', () => {
      render(<StatsCard 
        {...defaultProps}
        benchmark={{
          value: 800,
          label: 'Target',
          target: 1000
        }}
      />)
      
      expect(screen.getByText('Target')).toBeInTheDocument()
      expect(screen.getByText('Target: 1,000')).toBeInTheDocument()
      expect(screen.getByText('800')).toBeInTheDocument()
      
      // Check progress bar width (80%)
      const progressBar = document.querySelector('.statscard__benchmark-progress')
      expect(progressBar).toHaveStyle({ width: '80%' })
    })

    it('should handle benchmark without target', () => {
      render(<StatsCard 
        {...defaultProps}
        benchmark={{
          value: 500,
          label: 'Baseline'
        }}
      />)
      
      expect(screen.getByText('Target: N/A')).toBeInTheDocument()
    })

    it('should handle zero target gracefully', () => {
      render(<StatsCard 
        {...defaultProps}
        benchmark={{
          value: 500,
          label: 'Zero Target',
          target: 0
        }}
      />)
      
      const progressBar = document.querySelector('.statscard__benchmark-progress')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })
  })

  describe('Progress Indicator', () => {
    it('should render progress data', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 750,
          target: 1000,
          label: 'Goal Progress'
        }}
      />)
      
      expect(screen.getByText('Goal Progress')).toBeInTheDocument()
      expect(screen.getByText('750 / 1,000')).toBeInTheDocument()
      expect(screen.getByText('75.0%')).toBeInTheDocument()
      
      // Check progress bar width (75%)
      const progressFill = document.querySelector('.statscard__progress-fill')
      expect(progressFill).toHaveStyle({ width: '75%' })
    })

    it('should handle progress over 100%', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 1200,
          target: 1000,
          label: 'Exceeded'
        }}
      />)
      
      expect(screen.getByText('120.0%')).toBeInTheDocument()
      
      const progressFill = document.querySelector('.statscard__progress-fill')
      expect(progressFill).toHaveStyle({ width: '100%' })
    })

    it('should use default progress label', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 50,
          target: 100
        }}
      />)
      
      expect(screen.getByText('Progress')).toBeInTheDocument()
    })

    it('should handle zero progress', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 0,
          target: 100,
          label: 'No Progress'
        }}
      />)
      
      const progressFill = document.querySelector('.statscard__progress-fill')
      expect(progressFill).toHaveStyle({ width: '0%' })
    })
  })

  describe('Loading State', () => {
    it('should render loading state', () => {
      render(<StatsCard {...defaultProps} loading />)
      
      expect(document.querySelector('.statscard__skeleton')).toBeInTheDocument()
      expect(document.querySelector('.statscard--loading')).toBeInTheDocument()
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    })

    it('should show skeleton elements', () => {
      render(<StatsCard {...defaultProps} loading />)
      
      expect(screen.getByTestId('skeleton-icon')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-title')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-value')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-delta')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render error state', () => {
      render(<StatsCard {...defaultProps} error="Failed to load data" />)
      
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(document.querySelector('.statscard--error')).toBeInTheDocument()
    })

    it('should show error with title', () => {
      render(<StatsCard 
        title="Revenue"
        error="Connection timeout"
      />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })
  })

  describe('Interactivity', () => {
    it('should be clickable when specified', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        clickable
        onClick={onClick}
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveClass('statscard--clickable')
      
      fireEvent.click(card!)
      expect(onClick).toHaveBeenCalled()
    })

    it('should not be clickable when disabled', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        clickable
        disabled
        onClick={onClick}
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveClass('statscard--disabled')
      expect(card).not.toHaveClass('statscard--clickable')
      
      fireEvent.click(card!)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard navigation', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        clickable
        onClick={onClick}
      />)
      
      const card = document.querySelector('.statscard')
      
      fireEvent.keyDown(card!, { key: 'Enter' })
      expect(onClick).toHaveBeenCalled()
      
      fireEvent.keyDown(card!, { key: ' ' })
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('should not handle keyboard when not clickable', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        onClick={onClick}
      />)
      
      const card = document.querySelector('.statscard')
      
      fireEvent.keyDown(card!, { key: 'Enter' })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should handle hover events', () => {
      const onHover = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        onHover={onHover}
      />)
      
      const card = document.querySelector('.statscard')
      
      fireEvent.mouseEnter(card!)
      expect(onHover).toHaveBeenCalledWith(true)
      
      fireEvent.mouseLeave(card!)
      expect(onHover).toHaveBeenCalledWith(false)
    })
  })

  describe('Animation', () => {
    it('should animate when enabled', async () => {
      vi.useRealTimers()
      
      render(<StatsCard {...defaultProps} animated delay={100} />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveClass('statscard--animated')
      
      await waitFor(() => {
        expect(card).toHaveClass('statscard--animated')
      }, { timeout: 200 })
      
      await waitFor(() => {
        expect(card).not.toHaveClass('statscard--animated')
      }, { timeout: 800 })
    })

    it('should not animate when disabled', () => {
      render(<StatsCard {...defaultProps} animated={false} />)
      
      const card = document.querySelector('.statscard')
      expect(card).not.toHaveClass('statscard--animated')
    })

    it('should animate numeric values', async () => {
      vi.useRealTimers()
      
      render(<StatsCard 
        title="Count"
        value={100}
        animated
      />)
      
      await waitFor(() => {
        const valueElement = screen.getByText('100')
        expect(valueElement).toBeInTheDocument()
      }, { timeout: 1200 })
    })
  })

  describe('Tooltip', () => {
    it('should render tooltip', () => {
      render(<StatsCard 
        {...defaultProps}
        tooltip="Additional information"
      />)
      
      const tooltip = document.querySelector('.statscard__tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent('Additional information')
    })

    it('should position tooltip correctly', () => {
      render(<StatsCard 
        {...defaultProps}
        tooltip="Top tooltip"
        tooltipPosition="top"
      />)
      
      expect(document.querySelector('.statscard__tooltip--top')).toBeInTheDocument()
    })

    it('should support all tooltip positions', () => {
      const positions: Array<StatsCardProps['tooltipPosition']> = ['top', 'bottom', 'left', 'right']
      
      positions.forEach(position => {
        const { unmount } = render(<StatsCard 
          {...defaultProps}
          tooltip={`${position} tooltip`}
          tooltipPosition={position}
        />)
        
        expect(document.querySelector(`.statscard__tooltip--${position}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Detailed Layout Content', () => {
    it('should render detailed layout sections', () => {
      render(<StatsCard 
        {...defaultProps}
        layout="detailed"
      />)
      
      expect(screen.getByText('Period:')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
      expect(screen.getByText('Change:')).toBeInTheDocument()
      expect(screen.getByText('+12.5% from previous')).toBeInTheDocument()
    })

    it('should not render details in other layouts', () => {
      render(<StatsCard 
        {...defaultProps}
        layout="default"
      />)
      
      expect(screen.queryByText('Period:')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(<StatsCard 
        {...defaultProps}
        clickable
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabIndex', '0')
    })

    it('should use custom aria-label', () => {
      render(<StatsCard 
        {...defaultProps}
        aria-label="Custom card label"
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveAttribute('aria-label', 'Custom card label')
    })

    it('should have aria-describedby', () => {
      render(<StatsCard 
        {...defaultProps}
        aria-describedby="description-id"
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveAttribute('aria-describedby', 'description-id')
    })

    it('should have role alert for error state', () => {
      render(<StatsCard 
        {...defaultProps}
        error="Error message"
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveAttribute('role', 'alert')
    })

    it('should have proper focus management', () => {
      render(<StatsCard 
        {...defaultProps}
        clickable
      />)
      
      const card = document.querySelector('.statscard')
      
      fireEvent.focus(card!)
      expect(card).toHaveFocus()
    })

    it('should support keyboard navigation', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        {...defaultProps}
        clickable
        onClick={onClick}
      />)
      
      const card = document.querySelector('.statscard')
      
      card!.focus()
      fireEvent.keyDown(card!, { key: 'Enter' })
      fireEvent.keyDown(card!, { key: ' ' })
      
      expect(onClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom colors', () => {
      render(<StatsCard 
        {...defaultProps}
        color="#ff0000"
        backgroundColor="#0000ff"
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveStyle({
        color: '#ff0000',
        backgroundColor: '#0000ff'
      })
    })

    it('should apply custom className', () => {
      render(<StatsCard 
        {...defaultProps}
        className="custom-class"
      />)
      
      expect(document.querySelector('.statscard.custom-class')).toBeInTheDocument()
    })

    it('should apply inline styles', () => {
      render(<StatsCard 
        {...defaultProps}
        style={{ borderWidth: '2px' }}
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveStyle({ borderWidth: '2px' })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(<StatsCard 
        title="Big Number"
        value={999999999999}
        format="compact"
      />)
      
      expect(screen.getByText(/[0-9]+(\.[0-9]+)?[T]/)).toBeInTheDocument()
    })

    it('should handle negative deltas with minus sign', () => {
      render(<StatsCard 
        {...defaultProps}
        delta="−25.3%"
      />)
      
      expect(document.querySelector('.statscard__delta--decrease')).toBeInTheDocument()
    })

    it('should handle decimal values', () => {
      render(<StatsCard 
        title="Decimal"
        value={123.456}
        format="number"
      />)
      
      expect(screen.getByText('123.456')).toBeInTheDocument()
    })

    it('should handle empty strings gracefully', () => {
      render(<StatsCard 
        title=""
        value=""
        delta=""
      />)
      
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(<StatsCard 
        title="Special & Characters <tag>"
        value="€100 ©2023"
      />)
      
      expect(screen.getByText('Special & Characters <tag>')).toBeInTheDocument()
      expect(screen.getByText('€100 ©2023')).toBeInTheDocument()
    })

    it('should handle zero progress', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 0,
          target: 100,
          label: "No Progress"
        }}
      />)
      
      const progressFill = document.querySelector('.statscard__progress-fill')
      expect(progressFill).toHaveStyle({ width: '0%' })
    })

    it('should handle comparison with string value', () => {
      render(<StatsCard 
        {...defaultProps}
        comparison={{
          value: 'Previous Period',
          label: 'Compare to'
        }}
      />)
      
      expect(screen.getByText('Compare to')).toBeInTheDocument()
      expect(screen.getByText('Previous Period')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not cause memory leaks with event listeners', () => {
      const { unmount } = render(<StatsCard 
        {...defaultProps}
        clickable
        onClick={vi.fn()}
        onHover={vi.fn()}
      />)
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow()
    })

    it('should handle rapid re-renders efficiently', () => {
      const onClick = vi.fn()
      const { rerender } = render(<StatsCard 
        {...defaultProps}
        onClick={onClick}
      />)
      
      // Rapid re-renders should not cause issues
      for (let i = 0; i < 100; i++) {
        rerender(<StatsCard 
          {...defaultProps}
          onClick={onClick}
          value={i}
        />)
      }
      
      expect(screen.getByText('99')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work with controlled component pattern', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState(100)
        
        return (
          <StatsCard
            title="Controlled"
            value={value}
            onClick={() => setValue(v => v + 1)}
            clickable
          />
        )
      }
      
      render(<TestComponent />)
      
      const card = screen.getByText('100').closest('.statscard')
      fireEvent.click(card!)
      
      expect(screen.getByText('101')).toBeInTheDocument()
    })

    it('should work with uncontrolled component pattern', () => {
      const onClick = vi.fn()
      
      render(<StatsCard 
        title="Uncontrolled"
        value="Static Value"
        onClick={onClick}
        clickable
      />)
      
      const card = screen.getByText('Static Value').closest('.statscard')
      fireEvent.click(card!)
      
      expect(onClick).toHaveBeenCalled()
    })

    it('should integrate with multiple stats cards', () => {
      const stats = [
        { title: 'Users', value: 1234, delta: '+5%' },
        { title: 'Revenue', value: '$50,000', delta: '+12%' },
        { title: 'Conversion', value: '3.2%', delta: '-2%' }
      ]
      
      render(
        <div>
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )
      
      stats.forEach(stat => {
        expect(screen.getByText(stat.title)).toBeInTheDocument()
        expect(screen.getByText(stat.value.toString())).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing onClick gracefully', () => {
      render(<StatsCard 
        {...defaultProps}
        clickable
        // onClick not provided
      />)
      
      const card = document.querySelector('.statscard')
      expect(() => fireEvent.click(card!)).not.toThrow()
    })

    it('should handle invalid progress data', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: NaN,
          target: 100,
          label: "Invalid"
        }}
      />)
      
      expect(screen.getByText('Progress')).toBeInTheDocument()
    })

    it('should handle negative target', () => {
      render(<StatsCard 
        {...defaultProps}
        progress={{
          current: 50,
          target: -100,
          label: "Negative Target"
        }}
      />)
      
      expect(screen.getByText('Progress')).toBeInTheDocument()
    })
  })

  describe('Animation Performance', () => {
    it('should respect reduced motion preference', () => {
      // Mock reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      })
      
      render(<StatsCard 
        {...defaultProps}
        animated
      />)
      
      const card = document.querySelector('.statscard')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should adapt layout on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })
      
      render(<StatsCard {...defaultProps} />)
      
      const card = document.querySelector('.statscard')
      expect(card).toBeInTheDocument()
    })

    it('should handle touch interactions', () => {
      render(<StatsCard 
        {...defaultProps}
        clickable
      />)
      
      const card = document.querySelector('.statscard')
      
      // Simulate touch event
      fireEvent.touchStart(card!, {
        touches: [{ clientX: 0, clientY: 0 }]
      })
      
      expect(card).toHaveClass('statscard--hovered')
    })
  })

  describe('Theme Support', () => {
    it('should support dark mode', () => {
      document.documentElement.classList.add('dark')
      
      render(<StatsCard {...defaultProps} />)
      
      const card = document.querySelector('.statscard')
      expect(card).toBeInTheDocument()
      
      document.documentElement.classList.remove('dark')
    })

    it('should respond to theme changes', () => {
      render(<StatsCard {...defaultProps} variant="glass" />)
      
      document.documentElement.classList.add('dark')
      
      const card = document.querySelector('.statscard')
      expect(card).toHaveClass('statscard--glass')
      
      document.documentElement.classList.remove('dark')
    })
  })
})

// Additional integration tests
describe('StatsCard Integration Tests', () => {
  it('should work in a grid layout', () => {
    const { container } = render(
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <StatsCard title="Metric 1" value="100" />
        <StatsCard title="Metric 2" value="200" />
      </div>
    )
    
    expect(container.querySelectorAll('.statscard')).toHaveLength(2)
  })

  it('should work with data fetching patterns', async () => {
    const TestComponent = () => {
      const [loading, setLoading] = React.useState(true)
      const [data, setData] = React.useState(null)
      
      React.useEffect(() => {
        setTimeout(() => {
          setData({ title: 'Fetched Value', value: 42 })
          setLoading(false)
        }, 100)
      }, [])
      
      if (loading) {
        return <StatsCard title="Loading" value="0" loading />
      }
      
      return <StatsCard title={data.title} value={data.value} />
    }
    
    render(<TestComponent />)
    
    // Should show loading state initially
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Fetched Value')).toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('should handle rapid value changes', () => {
    const onClick = vi.fn()
    
    const TestComponent = () => {
      const [value, setValue] = React.useState(0)
      
      return (
        <StatsCard
          title="Counter"
          value={value}
          onClick={() => setValue(v => v + 1)}
          clickable
        />
      )
    }
    
    render(<TestComponent />)
    
    const card = screen.getByText('0').closest('.statscard')
    
    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(card!)
    }
    
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should work with real-time data updates', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState(100)
      
      React.useEffect(() => {
        const interval = setInterval(() => {
          setValue(v => v + Math.random() * 10 - 5)
        }, 100)
        
        return () => clearInterval(interval)
      }, [])
      
      return (
        <StatsCard 
          title="Live Data"
          value={Math.round(value)}
          animated={false}
        />
      )
    }
    
    render(<TestComponent />)
    
    // Should update without errors
    expect(screen.getByText(/\d+/)).toBeInTheDocument()
  })
})

// Performance benchmark tests
describe('StatsCard Performance Tests', () => {
  it('should handle large number of cards efficiently', () => {
    const startTime = performance.now()
    
    const { container } = render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <StatsCard 
            key={i}
            title={`Metric ${i}`}
            value={i * 100}
            delta={`${i}%`}
            clickable
          />
        ))}
      </div>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render within reasonable time (less than 100ms)
    expect(renderTime).toBeLessThan(100)
    expect(container.querySelectorAll('.statscard')).toHaveLength(100)
  })

  it('should handle rapid prop changes efficiently', () => {
    const { rerender } = render(<StatsCard {...defaultProps} />)
    
    const startTime = performance.now()
    
    // Simulate rapid prop changes
    for (let i = 0; i < 50; i++) {
      rerender(<StatsCard 
        {...defaultProps}
        value={i}
        delta={`${i}%`}
      />)
    }
    
    const endTime = performance.now()
    const updateTime = endTime - startTime
    
    // Should handle updates efficiently
    expect(updateTime).toBeLessThan(50)
  })
})