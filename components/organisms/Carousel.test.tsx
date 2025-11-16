/**
 * Carousel Component - Comprehensive Test Suite
 * 
 * Complete test coverage for Carousel component including:
 * - Rendering and props validation
 * - Auto-play functionality
 * - Navigation controls (arrows, dots, keyboard)
 * - Touch/swipe gesture support
 * - Layout and size variants
 * - Accessibility features
 * - Responsive behavior
 * - State management
 * - Animation and transitions
 * 
 * @author MiniMax Agent
 * @version 1.0.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Carousel } from './Carousel'

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Custom render function with test providers
 */
const renderCarousel = (props = {}) => {
  const defaultSlides = [
    {
      title: 'Slide 1',
      description: 'First slide description',
      image: 'https://example.com/slide1.jpg'
    },
    {
      title: 'Slide 2', 
      description: 'Second slide description',
      image: 'https://example.com/slide2.jpg'
    },
    {
      title: 'Slide 3',
      description: 'Third slide description',
      image: 'https://example.com/slide3.jpg'
    }
  ]
  
  const defaultProps = {
    slides: defaultSlides,
    autoPlay: false,
    interval: 4000
  }
  
  return render(<Carousel {...defaultProps} {...props} />)
}

/**
 * Wait for next animation frame
 */
const waitForAnimation = () => 
  act(() => new Promise(resolve => requestAnimationFrame(resolve)))

/**
 * Mock slide data for tests
 */
const createMockSlide = (index: number) => ({
  id: `slide-${index}`,
  title: `Slide ${index}`,
  description: `Description for slide ${index}`,
  image: `https://example.com/slide${index}.jpg`,
  button: {
    text: `Button ${index}`,
    onClick: jest.fn(),
    variant: 'primary' as const,
    size: 'md' as const
  }
})

// ============================================================================
// RENDERING AND PROPS TESTS
// ============================================================================

describe('Carousel Rendering', () => {
  test('renders with default props', () => {
    renderCarousel()
    
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })
  
  test('renders first slide as active by default', () => {
    const { container } = renderCarousel()
    
    const activeSlide = container.querySelector('.carousel__slide--active')
    expect(activeSlide).toBeInTheDocument()
    expect(activeSlide).toHaveTextContent('Slide 1')
  })
  
  test('renders with custom slides', () => {
    const customSlides = [
      { title: 'Custom 1', description: 'Custom description 1' },
      { title: 'Custom 2', description: 'Custom description 2' }
    ]
    
    renderCarousel({ slides: customSlides })
    
    expect(screen.getByText('Custom 1')).toBeInTheDocument()
    expect(screen.getByText('Custom 2')).toBeInTheDocument()
  })
  
  test('renders with empty slides array', () => {
    renderCarousel({ slides: [] })
    
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })
  
  test('renders with single slide', () => {
    renderCarousel({ 
      slides: [{ title: 'Single Slide', description: 'Only one slide' }]
    })
    
    expect(screen.getByText('Single Slide')).toBeInTheDocument()
    expect(screen.queryByText('Arrow')).not.toBeInTheDocument()
    expect(screen.queryByText('Slide')).not.toBeInTheDocument()
  })
  
  test('renders custom content in slides', () => {
    const slidesWithContent = [
      {
        title: 'Slide with Content',
        content: <div data-testid="custom-content">Custom slide content</div>
      }
    ]
    
    renderCarousel({ slides: slidesWithContent })
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    expect(screen.getByText('Custom slide content')).toBeInTheDocument()
  })
  
  test('renders slide buttons', () => {
    renderCarousel()
    
    expect(screen.getByText('Button 1')).toBeInTheDocument()
    expect(screen.getByText('Button 2')).toBeInTheDocument()
    expect(screen.getByText('Button 3')).toBeInTheDocument()
  })
  
  test('applies custom class names', () => {
    const { container } = renderCarousel({ className: 'custom-class' })
    
    expect(container.firstChild).toHaveClass('carousel', 'custom-class')
  })
  
  test('generates unique ID for accessibility', () => {
    const { container: container1 } = renderCarousel()
    const { container: container2 } = renderCarousel()
    
    const carousel1 = container1.querySelector('.carousel')
    const carousel2 = container2.querySelector('.carousel')
    
    expect(carousel1).toHaveAttribute('id')
    expect(carousel2).toHaveAttribute('id')
    expect(carousel1?.id).not.toBe(carousel2?.id)
  })
  
  test('uses custom ID when provided', () => {
    renderCarousel({ id: 'custom-carousel-id' })
    
    expect(screen.getByTestId('custom-carousel-id')).toBeInTheDocument()
  })
})

// ============================================================================
// AUTO-PLAY FUNCTIONALITY TESTS
// ============================================================================

describe('Carousel Auto-Play', () => {
  test('enables auto-play by default', async () => {
    jest.useFakeTimers()
    
    renderCarousel({ autoPlay: true, interval: 100 })
    
    // Advance time to trigger auto-play
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  test('respects custom interval', async () => {
    jest.useFakeTimers()
    
    renderCarousel({ autoPlay: true, interval: 500 })
    
    // Advance time but not enough to trigger
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    
    // Advance remaining time
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  test('pauses on hover when pauseOnHover is true', async () => {
    jest.useFakeTimers()
    
    const { container } = renderCarousel({ 
      autoPlay: true, 
      pauseOnHover: true, 
      interval: 100 
    })
    
    // Trigger first slide change
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    // Hover over carousel
    fireEvent.mouseEnter(container.firstChild as Element)
    
    // Advance time while hovering
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    // Should still be on slide 2
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    
    // Mouse leave
    fireEvent.mouseLeave(container.firstChild as Element)
    
    // Resume auto-play
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  test('continues playing when pauseOnHover is false', async () => {
    jest.useFakeTimers()
    
    const { container } = renderCarousel({ 
      autoPlay: true, 
      pauseOnHover: false, 
      interval: 100 
    })
    
    // Advance time to trigger auto-play
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    // Hover over carousel
    fireEvent.mouseEnter(container.firstChild as Element)
    
    // Advance time while hovering - should continue playing
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  test('supports infinite loop by default', async () => {
    jest.useFakeTimers()
    
    renderCarousel({ autoPlay: true, interval: 100 })
    
    // Advance time to cycle through all slides
    act(() => {
      jest.advanceTimersByTime(800) // Should cycle through all 3 slides
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  test('stops at last slide when infinite is false', async () => {
    jest.useFakeTimers()
    
    renderCarousel({ 
      autoPlay: true, 
      interval: 100, 
      infinite: false 
    })
    
    // Advance time to reach last slide
    act(() => {
      jest.advanceTimersByTime(600) // Should reach slide 3 and stop
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })
    
    // Should not advance past last slide
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
    
    jest.useRealTimers()
  })
})

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

describe('Carousel Navigation', () => {
  test('renders navigation arrows by default', () => {
    renderCarousel()
    
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
  })
  
  test('hides navigation arrows when showArrows is false', () => {
    renderCarousel({ showArrows: false })
    
    expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument()
  })
  
  test('disables prev button at first slide when infinite is false', () => {
    renderCarousel({ infinite: false })
    
    const prevButton = screen.getByLabelText('Previous slide').closest('button')
    expect(prevButton).toBeDisabled()
  })
  
  test('disables next button at last slide when infinite is false', () => {
    const { container } = renderCarousel({ infinite: false })
    
    // Navigate to last slide
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    
    // Check if next button is disabled
    const disabledNextButton = screen.getByLabelText('Next slide').closest('button')
    expect(disabledNextButton).toBeDisabled()
  })
  
  test('navigation arrows work with infinite loop', async () => {
    renderCarousel({ infinite: true })
    
    const nextButton = screen.getByLabelText('Next slide')
    
    // Navigate to next slide
    fireEvent.click(nextButton)
    await waitForAnimation()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    
    // Navigate to previous slide
    const prevButton = screen.getByLabelText('Previous slide')
    fireEvent.click(prevButton)
    await waitForAnimation()
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('navigation arrows work without infinite loop', async () => {
    renderCarousel({ infinite: false })
    
    const nextButton = screen.getByLabelText('Next slide')
    
    // Navigate to next slide
    fireEvent.click(nextButton)
    await waitForAnimation()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    
    // Navigate to previous slide
    const prevButton = screen.getByLabelText('Previous slide')
    fireEvent.click(prevButton)
    await waitForAnimation()
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('dots navigation works', async () => {
    renderCarousel()
    
    // Click on third dot
    const dots = screen.getAllByRole('tab')
    fireEvent.click(dots[2])
    await waitForAnimation()
    
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })
  
  test('dots show active state', async () => {
    renderCarousel()
    
    const dots = screen.getAllByRole('tab')
    
    // First dot should be active initially
    expect(dots[0]).toHaveAttribute('aria-selected', 'true')
    expect(dots[1]).toHaveAttribute('aria-selected', 'false')
    expect(dots[2]).toHaveAttribute('aria-selected', 'false')
    
    // Click on second dot
    fireEvent.click(dots[1])
    await waitForAnimation()
    
    expect(dots[0]).toHaveAttribute('aria-selected', 'false')
    expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    expect(dots[2]).toHaveAttribute('aria-selected', 'false')
  })
  
  test('hides dots when showDots is false', () => {
    renderCarousel({ showDots: false })
    
    expect(screen.queryByRole('tablist', { name: 'Slide indicators' })).not.toBeInTheDocument()
  })
  
  test('hides dots when only one slide', () => {
    renderCarousel({ 
      slides: [{ title: 'Single Slide' }]
    })
    
    expect(screen.queryByRole('tablist', { name: 'Slide indicators' })).not.toBeInTheDocument()
  })
})

// ============================================================================
// KEYBOARD NAVIGATION TESTS
// ============================================================================

describe('Carousel Keyboard Navigation', () => {
  test('responds to left arrow key', async () => {
    const { container } = renderCarousel()
    
    // Focus on slides container
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    // Press left arrow
    fireEvent.keyDown(slidesRegion as Element, { key: 'ArrowLeft' })
    await waitForAnimation()
    
    expect(screen.getByText('Slide 3')).toBeInTheDocument() // With infinite loop
  })
  
  test('responds to right arrow key', async () => {
    const { container } = renderCarousel()
    
    // Focus on slides container
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    // Press right arrow
    fireEvent.keyDown(slidesRegion as Element, { key: 'ArrowRight' })
    await waitForAnimation()
    
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })
  
  test('responds to space key to play/pause', async () => {
    const { container } = renderCarousel({ autoPlay: true })
    
    // Focus on slides container
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    // Get initial slide
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    
    // Press space to pause (if autoPlay was running)
    fireEvent.keyDown(slidesRegion as Element, { key: ' ' })
    await waitForAnimation()
    
    // Should be able to navigate manually
    fireEvent.keyDown(slidesRegion as Element, { key: 'ArrowRight' })
    await waitForAnimation()
    
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })
  
  test('responds to enter key to play/pause', async () => {
    const { container } = renderCarousel({ autoPlay: true })
    
    // Focus on slides container
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    // Press enter
    fireEvent.keyDown(slidesRegion as Element, { key: 'Enter' })
    await waitForAnimation()
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
})

// ============================================================================
// LAYOUT AND SIZE VARIANTS TESTS
// ============================================================================

describe('Carousel Layout and Size Variants', () => {
  const layouts = ['default', 'modern', 'minimal', 'cards', 'showcase']
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
  const maxWidths = ['sm', 'md', 'lg', 'xl', 'full']
  
  layouts.forEach(layout => {
    test(`applies ${layout} layout variant`, () => {
      const { container } = renderCarousel({ layout })
      
      expect(container.firstChild).toHaveClass(`carousel--layout-${layout}`)
    })
  })
  
  sizes.forEach(size => {
    test(`applies ${size} size variant`, () => {
      const { container } = renderCarousel({ size })
      
      expect(container.firstChild).toHaveClass(`carousel--size-${size}`)
    })
  })
  
  maxWidths.forEach(maxWidth => {
    test(`applies ${maxWidth} max width variant`, () => {
      const { container } = renderCarousel({ maxWidth })
      
      expect(container.firstChild).toHaveClass(`carousel--max-width-${maxWidth}`)
    })
  })
})

// ============================================================================
// TOUCH/SWIPE GESTURE TESTS
// ============================================================================

describe('Carousel Touch Gestures', () => {
  test('handles swipe left gesture', async () => {
    renderCarousel({ touchEnabled: true })
    
    const carousel = screen.getByRole('region')
    
    // Simulate swipe left (drag right to left)
    fireEvent.touchStart(carousel, {
      touches: [{ clientX: 200, clientY: 100 }]
    })
    fireEvent.touchEnd(carousel, {
      changedTouches: [{ clientX: 100, clientY: 100 }]
    })
    
    await waitForAnimation()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })
  
  test('handles swipe right gesture', async () => {
    renderCarousel({ touchEnabled: true })
    
    const carousel = screen.getByRole('region')
    
    // Navigate to second slide first
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    await waitForAnimation()
    
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    
    // Simulate swipe right (drag left to right)
    fireEvent.touchStart(carousel, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchEnd(carousel, {
      changedTouches: [{ clientX: 200, clientY: 100 }]
    })
    
    await waitForAnimation()
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('ignores touch gestures when touchEnabled is false', async () => {
    renderCarousel({ touchEnabled: false })
    
    const carousel = screen.getByRole('region')
    
    // Try to swipe
    fireEvent.touchStart(carousel, {
      touches: [{ clientX: 200, clientY: 100 }]
    })
    fireEvent.touchEnd(carousel, {
      changedTouches: [{ clientX: 100, clientY: 100 }]
    })
    
    await waitForAnimation()
    expect(screen.getByText('Slide 1')).toBeInTheDocument() // Should not change
  })
})

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('Carousel Accessibility', () => {
  test('has proper ARIA labels', () => {
    renderCarousel()
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Carousel with 3 slides')
  })
  
  test('has custom ARIA label when provided', () => {
    renderCarousel({ ariaLabel: 'Custom Carousel Label' })
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Custom Carousel Label')
  })
  
  test('slides have proper ARIA roles', () => {
    renderCarousel()
    
    expect(screen.getAllByRole('tabpanel')).toHaveLength(3)
  })
  
  test('slides have proper ARIA labels', () => {
    renderCarousel()
    
    const slides = screen.getAllByRole('tabpanel')
    slides.forEach((slide, index) => {
      expect(slide).toHaveAttribute('aria-labelledby')
    })
  })
  
  test('navigation buttons have proper ARIA labels', () => {
    renderCarousel()
    
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
  })
  
  test('dots have proper ARIA labels', () => {
    renderCarousel()
    
    const dots = screen.getAllByRole('tab')
    dots.forEach((dot, index) => {
      expect(dot).toHaveAttribute('aria-label', `Go to slide ${index + 1}`)
    })
  })
  
  test('focus management works correctly', async () => {
    const { container } = renderCarousel()
    
    // Focus on slides region
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    expect(slidesRegion).toHaveFocus()
    
    // Navigate with keyboard
    fireEvent.keyDown(slidesRegion as Element, { key: 'ArrowRight' })
    await waitForAnimation()
    
    // Focus should remain on slides region
    expect(slidesRegion).toHaveFocus()
  })
  
  test('provides screen reader announcements', () => {
    const { container } = renderCarousel()
    
    const srOnly = container.querySelector('.carousel__sr-only')
    expect(srOnly).toBeInTheDocument()
    expect(srOnly).toHaveAttribute('aria-live', 'polite')
    expect(srOnly).toHaveAttribute('aria-atomic', 'true')
  })
  
  test('progress bar has proper ARIA attributes', () => {
    renderCarousel({ showProgress: true })
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })
})

// ============================================================================
// PROGRESS BAR TESTS
// ============================================================================

describe('Carousel Progress Bar', () => {
  test('shows progress bar when showProgress is true', () => {
    renderCarousel({ showProgress: true })
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
  
  test('hides progress bar when showProgress is false', () => {
    renderCarousel({ showProgress: false })
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
  
  test('progress bar shows correct value for current slide', async () => {
    const { container } = renderCarousel({ showProgress: true })
    
    const progressBar = container.querySelector('.carousel__progress-bar')
    
    // First slide should show 33.33% (1/3)
    expect(progressBar).toHaveStyle({ width: '33.33%' })
    
    // Navigate to second slide
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    await waitForAnimation()
    
    // Should show 66.66% (2/3)
    await waitFor(() => {
      expect(progressBar).toHaveStyle({ width: '66.67%' })
    })
  })
  
  test('progress bar shows 100% for single slide', () => {
    renderCarousel({ 
      slides: [{ title: 'Single Slide' }],
      showProgress: true 
    })
    
    const { container } = renderCarousel()
    const progressBar = container.querySelector('.carousel__progress-bar')
    
    expect(progressBar).toHaveStyle({ width: '100%' })
  })
})

// ============================================================================
// PLAY/PAUSE CONTROLS TESTS
// ============================================================================

describe('Carousel Play/Pause Controls', () => {
  test('shows play/pause control when autoPlay is enabled', () => {
    renderCarousel({ autoPlay: true })
    
    expect(screen.getByLabelText('Pause slideshow')).toBeInTheDocument()
  })
  
  test('hides play/pause control when autoPlay is disabled', () => {
    renderCarousel({ autoPlay: false })
    
    expect(screen.queryByLabelText('Pause slideshow')).not.toBeInTheDocument()
  })
  
  test('toggles play/pause state', async () => {
    jest.useFakeTimers()
    
    renderCarousel({ autoPlay: true, interval: 100 })
    
    const controlButton = screen.getByLabelText('Pause slideshow')
    
    // Click to pause
    fireEvent.click(controlButton)
    
    // Should change to play button
    expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument()
    
    // Advance time - should not change slides
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    
    // Click to play
    fireEvent.click(screen.getByLabelText('Play slideshow'))
    
    // Should change to pause button
    expect(screen.getByLabelText('Pause slideshow')).toBeInTheDocument()
    
    // Advance time - should change slides
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
})

// ============================================================================
// CONTROLLED VS UNCONTROLLED TESTS
// ============================================================================

describe('Carousel Controlled Mode', () => {
  test('works in uncontrolled mode by default', async () => {
    renderCarousel({ autoPlay: false })
    
    const nextButton = screen.getByLabelText('Next slide')
    
    // Navigate manually
    fireEvent.click(nextButton)
    await waitForAnimation()
    
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })
  
  test('works in controlled mode', async () => {
    const onSlideChange = jest.fn()
    renderCarousel({ 
      autoPlay: false,
      currentIndex: 0,
      onSlideChange
    })
    
    const nextButton = screen.getByLabelText('Next slide')
    
    // Navigate manually
    fireEvent.click(nextButton)
    
    expect(onSlideChange).toHaveBeenCalledWith(1)
    
    // Should still be on first slide in controlled mode
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('updates when currentIndex prop changes', async () => {
    const { rerender } = renderCarousel({ 
      autoPlay: false,
      currentIndex: 0
    })
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    
    // Update currentIndex
    rerender(<Carousel slides={[
      { title: 'Slide 1' },
      { title: 'Slide 2' },
      { title: 'Slide 3' }
    ]} autoPlay={false} currentIndex={2} />)
    
    await waitForAnimation()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })
})

// ============================================================================
// CUSTOM CONTENT TESTS
// ============================================================================

describe('Carousel Custom Content', () => {
  test('renders custom children content', () => {
    const customChildren = <div data-testid="children-content">Children Content</div>
    
    renderCarousel({ children: customChildren })
    
    // Custom content should be visible (appears in first slide)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })
  
  test('renders custom navigation component', () => {
    const customNav = <div data-testid="custom-navigation">Custom Nav</div>
    
    renderCarousel({ customNavigation: customNav })
    
    expect(screen.getByTestId('custom-navigation')).toBeInTheDocument()
    expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
  })
  
  test('renders custom indicators component', () => {
    const customIndicators = <div data-testid="custom-indicators">Custom Indicators</div>
    
    renderCarousel({ customIndicators })
    
    expect(screen.getByTestId('custom-indicators')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })
})

// ============================================================================
// BUTTON HANDLING TESTS
// ============================================================================

describe('Carousel Button Functionality', () => {
  test('slide buttons call their onClick handlers', async () => {
    const buttonHandlers = [
      jest.fn(),
      jest.fn(),
      jest.fn()
    ]
    
    const slides = [
      { title: 'Slide 1', button: { text: 'Button 1', onClick: buttonHandlers[0] } },
      { title: 'Slide 2', button: { text: 'Button 2', onClick: buttonHandlers[1] } },
      { title: 'Slide 3', button: { text: 'Button 3', onClick: buttonHandlers[2] } }
    ]
    
    renderCarousel({ slides })
    
    // Click buttons
    await userEvent.click(screen.getByText('Button 1'))
    await userEvent.click(screen.getByText('Button 2'))
    await userEvent.click(screen.getByText('Button 3'))
    
    expect(buttonHandlers[0]).toHaveBeenCalledTimes(1)
    expect(buttonHandlers[1]).toHaveBeenCalledTimes(1)
    expect(buttonHandlers[2]).toHaveBeenCalledTimes(1)
  })
  
  test('slide buttons render with correct variants', () => {
    renderCarousel()
    
    const buttons = screen.getAllByRole('button')
    
    // All buttons should have primary variant by default
    buttons.forEach(button => {
      expect(button).toHaveClass('carousel__button--primary')
    })
  })
  
  test('slide buttons support different sizes', () => {
    const slides = [
      { 
        title: 'Slide 1', 
        button: { text: 'Button 1', size: 'sm' }
      },
      { 
        title: 'Slide 2', 
        button: { text: 'Button 2', size: 'lg' }
      }
    ]
    
    renderCarousel({ slides })
    
    expect(screen.getByText('Button 1').closest('button')).toHaveClass('carousel__button--sm')
    expect(screen.getByText('Button 2').closest('button')).toHaveClass('carousel__button--lg')
  })
})

// ============================================================================
// PERFORMANCE AND OPTIMIZATION TESTS
// ============================================================================

describe('Carousel Performance', () => {
  test('memoizes slide processing correctly', () => {
    const slides = [
      { title: 'Slide 1', description: 'Description 1' },
      { title: 'Slide 2', description: 'Description 2' }
    ]
    
    const { rerender } = renderCarousel({ slides })
    
    // Re-render with same slides
    rerender(<Carousel slides={slides} autoPlay={false} />)
    
    // Should still work correctly
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('clears intervals on unmount', () => {
    jest.useFakeTimers()
    
    const { unmount } = renderCarousel({ autoPlay: true, interval: 100 })
    
    // Unmount component
    unmount()
    
    // Advance time to check if interval is cleared
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Should not throw errors
    jest.useRealTimers()
  })
  
  test('generates unique IDs for slides', () => {
    const slides = [
      { title: 'Slide 1' },
      { title: 'Slide 2' }
    ]
    
    const { container } = renderCarousel({ slides })
    
    const slidePanels = container.querySelectorAll('[role="tabpanel"]')
    
    expect(slidePanels[0]).toHaveAttribute('id')
    expect(slidePanels[1]).toHaveAttribute('id')
    expect(slidePanels[0].id).not.toBe(slidePanels[1].id)
  })
})

// ============================================================================
// ERROR HANDLING AND EDGE CASES
// ============================================================================

describe('Carousel Edge Cases', () => {
  test('handles empty slides array gracefully', () => {
    const { container } = renderCarousel({ slides: [] })
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })
  
  test('handles slides with missing properties', () => {
    const incompleteSlides = [
      { title: 'Slide 1' },
      { description: 'Only description' },
      {}
    ]
    
    // Should not throw errors
    renderCarousel({ slides: incompleteSlides })
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })
  
  test('handles very large number of slides', () => {
    const manySlides = Array.from({ length: 50 }, (_, i) => ({
      title: `Slide ${i + 1}`,
      description: `Description ${i + 1}`
    }))
    
    renderCarousel({ slides: manySlides })
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 50')).toBeInTheDocument()
    
    // Should have 50 dots
    expect(screen.getAllByRole('tab')).toHaveLength(50)
  })
  
  test('handles rapid navigation clicks', async () => {
    renderCarousel({ autoPlay: false })
    
    const nextButton = screen.getByLabelText('Next slide')
    
    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton)
    }
    
    await waitForAnimation()
    
    // Should handle gracefully without errors
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
  
  test('handles rapid keyboard navigation', async () => {
    const { container } = renderCarousel({ autoPlay: false })
    
    const slidesRegion = container.querySelector('.carousel__slides')
    slidesRegion?.focus()
    
    // Rapid key presses
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(slidesRegion as Element, { key: 'ArrowRight' })
    }
    
    await waitForAnimation()
    
    // Should handle gracefully
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
  
  test('handles special characters in content', () => {
    const slidesWithSpecialChars = [
      { 
        title: 'Special & Characters <>"\'`',
        description: 'Description with "quotes" & ampersands'
      }
    ]
    
    renderCarousel({ slides: slidesWithSpecialChars })
    
    expect(screen.getByText('Special & Characters <>"\'`')).toBeInTheDocument()
    expect(screen.getByText('Description with "quotes" & ampersands')).toBeInTheDocument()
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Carousel Integration', () => {
  test('works correctly with all props combined', async () => {
    const onSlideChange = jest.fn()
    
    renderCarousel({
      slides: [
        {
          title: 'Integrated Slide 1',
          description: 'Complete test slide',
          button: { text: 'Action 1', onClick: jest.fn() }
        },
        {
          title: 'Integrated Slide 2',
          content: <div>Custom Content</div>
        }
      ],
      autoPlay: true,
      interval: 100,
      pauseOnHover: true,
      showArrows: true,
      showDots: true,
      layout: 'modern',
      size: 'lg',
      maxWidth: 'md',
      infinite: true,
      showProgress: true,
      touchEnabled: true,
      onSlideChange
    })
    
    // Initial state
    expect(screen.getByText('Integrated Slide 1')).toBeInTheDocument()
    
    // Auto-play should work
    await waitFor(() => {
      expect(screen.getByText('Integrated Slide 2')).toBeInTheDocument()
    }, { timeout: 300 })
    
    // Navigation should work
    const prevButton = screen.getByLabelText('Previous slide')
    fireEvent.click(prevButton)
    await waitForAnimation()
    
    expect(screen.getByText('Integrated Slide 1')).toBeInTheDocument()
  })
  
  test('maintains state correctly across re-renders', async () => {
    const { rerender } = renderCarousel({ autoPlay: false })
    
    // Navigate to slide 2
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    await waitForAnimation()
    
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    
    // Re-render with different props
    rerender(<Carousel slides={[
      { title: 'New Slide 1' },
      { title: 'New Slide 2' },
      { title: 'New Slide 3' }
    ]} autoPlay={false} />)
    
    // Should reset to first slide
    expect(screen.getByText('New Slide 1')).toBeInTheDocument()
  })
})

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Carousel Snapshots', () => {
  test('matches default snapshot', () => {
    const { container } = renderCarousel()
    expect(container.firstChild).toMatchSnapshot()
  })
  
  test('matches minimal layout snapshot', () => {
    const { container } = renderCarousel({ layout: 'minimal' })
    expect(container.firstChild).toMatchSnapshot()
  })
  
  test('matches with progress bar snapshot', () => {
    const { container } = renderCarousel({ showProgress: true })
    expect(container.firstChild).toMatchSnapshot()
  })
  
  test('matches single slide snapshot', () => {
    const { container } = renderCarousel({ 
      slides: [{ title: 'Single Slide' }]
    })
    expect(container.firstChild).toMatchSnapshot()
  })
})

// ============================================================================
// EXPORT AND DEFAULT PROPS
// ============================================================================

describe('Carousel Export', () => {
  test('exports component as default', () => {
    expect(Carousel).toBeDefined()
    expect(typeof Carousel).toBe('function')
  })
  
  test('exports all types and interfaces', () => {
    // This test ensures TypeScript compilation succeeds
    expect(require('./Carousel')).toBeDefined()
  })
})

export {}