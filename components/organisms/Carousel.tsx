/**
 * Carousel Component - Modern Carousel/Slider Component
 * 
 * A fully-featured, accessible carousel component with comprehensive
 * navigation controls, auto-play, touch support, and multiple layouts.
 * 
 * Features:
 * - Auto-play with configurable interval
 * - Touch/swipe gesture support
 * - Navigation arrows and indicator dots
 * - Pause on hover functionality
 * - 5 layout variants: default, modern, minimal, cards, showcase
 * - 5 size options: xs, sm, md, lg, xl
 * - Responsive design with mobile optimization
 * - WCAG 2.1 AA accessibility compliance
 * - CSS Variables theming system
 * - Smooth animations and transitions
 * - Keyboard navigation support
 * - Custom content support
 * 
 * @author MiniMax Agent
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '@/utils'
import './Carousel.css'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * Individual slide interface
 */
export interface CarouselSlide {
  /** Unique slide identifier */
  id?: string
  /** Slide title */
  title: string
  /** Slide description text */
  description?: string
  /** Background image URL */
  image?: string
  /** Custom content to display */
  content?: React.ReactNode
  /** Slide button configuration */
  button?: {
    /** Button text */
    text: string
    /** Click handler */
    onClick: () => void
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    /** Button size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /** Button URL */
    href?: string
    /** Link target */
    target?: string
  }
  /** Custom CSS class name for slide */
  className?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
}

/**
 * Carousel main props interface
 */
export interface CarouselProps {
  /** Array of slides to display */
  slides: CarouselSlide[]
  /** Auto-play interval in milliseconds */
  interval?: number
  /** Whether to enable auto-play */
  autoPlay?: boolean
  /** Whether to pause auto-play on hover */
  pauseOnHover?: boolean
  /** Whether to show navigation arrows */
  showArrows?: boolean
  /** Whether to show indicator dots */
  showDots?: boolean
  /** Layout variant style */
  layout?: 'default' | 'modern' | 'minimal' | 'cards' | 'showcase'
  /** Carousel size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Maximum width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Current active slide index (controlled mode) */
  currentIndex?: number
  /** On change callback when slide changes */
  onSlideChange?: (index: number) => void
  /** Custom CSS class name */
  className?: string
  /** Carousel container ID */
  id?: string
  /** Whether to enable infinite loop */
  infinite?: boolean
  /** Transition animation speed */
  transitionSpeed?: number
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Whether to show progress bar */
  showProgress?: boolean
  /** Whether to enable touch/swipe gestures */
  touchEnabled?: boolean
  /** Custom navigation component */
  customNavigation?: React.ReactNode
  /** Custom indicators component */
  customIndicators?: React.ReactNode
}

// ============================================================================
// HOOKS AND UTILITIES
// ============================================================================

/**
 * Custom hook for carousel functionality
 */
const useCarousel = ({
  slides,
  interval = 4000,
  autoPlay = true,
  pauseOnHover = true,
  infinite = true,
  currentIndex,
  onSlideChange,
  transitionSpeed = 300
}: Omit<CarouselProps, 'className' | 'id' | 'ariaLabel'>) => {
  const [internalIndex, setInternalIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState<'prev' | 'next'>('next')
  const intervalRef = useRef<NodeJS.Timeout>()
  
  // Use controlled or internal index
  const activeIndex = currentIndex !== undefined ? currentIndex : internalIndex
  
  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !isPlaying || isPaused || slides.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }
    
    intervalRef.current = setInterval(() => {
      if (infinite) {
        setInternalIndex(prev => (prev + 1) % slides.length)
        setDirection('next')
      }
    }, interval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, isPlaying, isPaused, interval, slides.length, infinite])
  
  // Handle slide change
  const goToSlide = useCallback((index: number) => {
    if (index === activeIndex) return
    
    setDirection(index > activeIndex ? 'next' : 'prev')
    
    if (currentIndex === undefined) {
      setInternalIndex(index)
    }
    
    onSlideChange?.(index)
  }, [activeIndex, currentIndex, onSlideChange])
  
  // Navigation functions
  const nextSlide = useCallback(() => {
    const nextIndex = infinite 
      ? (activeIndex + 1) % slides.length 
      : Math.min(activeIndex + 1, slides.length - 1)
    
    if (!infinite && activeIndex === slides.length - 1) return
    
    goToSlide(nextIndex)
  }, [activeIndex, slides.length, infinite, goToSlide])
  
  const prevSlide = useCallback(() => {
    const prevIndex = infinite 
      ? (activeIndex - 1 + slides.length) % slides.length 
      : Math.max(activeIndex - 1, 0)
    
    if (!infinite && activeIndex === 0) return
    
    goToSlide(prevIndex)
  }, [activeIndex, slides.length, infinite, goToSlide])
  
  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true)
    }
  }, [pauseOnHover])
  
  const handleMouseLeave = useCallback(() => {
    setIsPaused(false)
  }, [])
  
  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        prevSlide()
        break
      case 'ArrowRight':
        event.preventDefault()
        nextSlide()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        setIsPlaying(!isPlaying)
        break
    }
  }, [prevSlide, nextSlide, isPlaying])
  
  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50
  })
  
  return {
    activeIndex,
    isPlaying,
    isPaused,
    direction,
    goToSlide,
    nextSlide,
    prevSlide,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyDown,
    swipeHandlers,
    canGoPrev: !infinite ? activeIndex > 0 : slides.length > 1,
    canGoNext: !infinite ? activeIndex < slides.length - 1 : slides.length > 1
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique slide ID
 */
const generateSlideId = (index: number): string => {
  return `carousel-slide-${index}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate progress percentage
 */
const calculateProgress = (current: number, total: number): number => {
  return total > 1 ? ((current + 1) / total) * 100 : 100
}

/**
 * Validate slide configuration
 */
const validateSlide = (slide: CarouselSlide): CarouselSlide => {
  return {
    id: slide.id || generateSlideId(0),
    title: slide.title || '',
    description: slide.description,
    image: slide.image,
    content: slide.content,
    button: slide.button ? {
      text: slide.button.text || '',
      onClick: slide.button.onClick,
      variant: slide.button.variant || 'primary',
      size: slide.button.size || 'md',
      href: slide.button.href,
      target: slide.button.target
    } : undefined,
    className: slide.className,
    ariaLabel: slide.ariaLabel || slide.title
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modern Carousel Component
 * 
 * A highly customizable carousel/slider component with comprehensive
 * navigation, accessibility features, and responsive design.
 */
export const Carousel: React.FC<CarouselProps> = ({
  slides,
  interval = 4000,
  autoPlay = true,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
  layout = 'default',
  size = 'md',
  maxWidth = 'lg',
  currentIndex,
  onSlideChange,
  className = '',
  id,
  infinite = true,
  transitionSpeed = 300,
  ariaLabel,
  showProgress = false,
  touchEnabled = true,
  customNavigation,
  customIndicators,
  children
}) => {
  // Validate and process slides
  const processedSlides = useMemo(() => 
    slides.map((slide, index) => ({
      ...validateSlide(slide),
      id: slide.id || generateSlideId(index)
    }))
  , [slides])
  
  // Use carousel hook
  const {
    activeIndex,
    isPlaying,
    direction,
    goToSlide,
    nextSlide,
    prevSlide,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyDown,
    swipeHandlers,
    canGoPrev,
    canGoNext
  } = useCarousel({
    slides: processedSlides,
    interval,
    autoPlay,
    pauseOnHover,
    infinite,
    currentIndex,
    onSlideChange,
    transitionSpeed
  })
  
  // Generate unique IDs
  const carouselId = useMemo(() => id || `carousel-${Math.random().toString(36).substr(2, 9)}`, [id])
  const slidesRegionId = useMemo(() => `${carouselId}-slides`, [carouselId])
  const navPrevId = useMemo(() => `${carouselId}-prev`, [carouselId])
  const navNextId = useMemo(() => `${carouselId}-next`, [carouselId])
  const dotsId = useMemo(() => `${carouselId}-dots`, [carouselId])
  
  // Compute CSS classes
  const containerClasses = useMemo(() => cn(
    'carousel',
    `carousel--layout-${layout}`,
    `carousel--size-${size}`,
    `carousel--max-width-${maxWidth}`,
    { 'carousel--paused': !isPlaying },
    { 'carousel--no-infinite': !infinite },
    { 'carousel--show-progress': showProgress },
    className
  ), [layout, size, maxWidth, isPlaying, infinite, showProgress, className])
  
  // ARIA label
  const ariaLabelValue = ariaLabel || `Carousel with ${processedSlides.length} slides`
  
  // Current slide for display
  const currentSlide = processedSlides[activeIndex] || processedSlides[0]
  
  // Progress calculation
  const progress = calculateProgress(activeIndex, processedSlides.length)
  
  return (
    <div
      {...(touchEnabled ? swipeHandlers : {})}
      id={carouselId}
      className={containerClasses}
      role="region"
      aria-label={ariaLabelValue}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Screen reader live region */}
      <div
        className="carousel__sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        Slide {activeIndex + 1} of {processedSlides.length}: {currentSlide?.title}
      </div>
      
      {/* Carousel container */}
      <div className="carousel__container">
        
        {/* Slides container */}
        <div 
          className="carousel__slides"
          id={slidesRegionId}
          role="tablist"
          aria-label="Carousel slides"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {processedSlides.map((slide, index) => (
            <div
              key={slide.id}
              id={`${slidesRegionId}-slide-${index}`}
              className={`carousel__slide ${
                index === activeIndex ? 'carousel__slide--active' : 'carousel__slide--inactive'
              } ${slide.className || ''}`}
              role="tabpanel"
              aria-labelledby={`${slidesRegionId}-tab-${index}`}
              aria-hidden={index !== activeIndex}
            >
              {/* Slide content */}
              <div className="carousel__slide-content">
                
                {/* Background image */}
                {slide.image && (
                  <div 
                    className="carousel__slide-background"
                    style={{ backgroundImage: `url(${slide.image})` }}
                    aria-hidden="true"
                  />
                )}
                
                {/* Slide text content */}
                <div className="carousel__slide-text">
                  <h2 className="carousel__slide-title">
                    {slide.title}
                  </h2>
                  
                  {slide.description && (
                    <p className="carousel__slide-description">
                      {slide.description}
                    </p>
                  )}
                  
                  {/* Custom content */}
                  {slide.content && (
                    <div className="carousel__slide-custom">
                      {slide.content}
                    </div>
                  )}
                  
                  {/* Slide button */}
                  {slide.button && (
                    <div className="carousel__slide-button">
                      <button
                        className={`carousel__button carousel__button--${slide.button.variant} carousel__button--${slide.button.size}`}
                        onClick={slide.button.onClick}
                        {...(slide.button.href && {
                          href: slide.button.href,
                          target: slide.button.target
                        })}
                        aria-label={slide.button.text}
                      >
                        {slide.button.text}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Custom children content */}
                {children && index === activeIndex && (
                  <div className="carousel__slide-children">
                    {children}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        {showArrows && (
          <div className="carousel__navigation">
            {customNavigation || (
              <>
                <button
                  id={navPrevId}
                  className="carousel__nav carousel__nav--prev"
                  onClick={prevSlide}
                  disabled={!canGoPrev}
                  aria-label="Previous slide"
                  aria-controls={slidesRegionId}
                >
                  <svg className="carousel__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button
                  id={navNextId}
                  className="carousel__nav carousel__nav--next"
                  onClick={nextSlide}
                  disabled={!canGoNext}
                  aria-label="Next slide"
                  aria-controls={slidesRegionId}
                >
                  <svg className="carousel__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Indicator dots */}
        {showDots && processedSlides.length > 1 && (
          <div 
            id={dotsId}
            className="carousel__dots"
            role="tablist"
            aria-label="Slide indicators"
          >
            {customIndicators || (
              processedSlides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel__dot ${index === activeIndex ? 'carousel__dot--active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-controls={`${slidesRegionId}-slide-${index}`}
                  role="tab"
                  aria-selected={index === activeIndex}
                >
                  <span className="carousel__dot-inner" />
                </button>
              ))
            )}
          </div>
        )}
        
        {/* Progress bar */}
        {showProgress && processedSlides.length > 1 && (
          <div className="carousel__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="carousel__progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
        
        {/* Play/Pause controls */}
        {autoPlay && (
          <button
            className={`carousel__control ${isPlaying ? 'carousel__control--playing' : 'carousel__control--paused'}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <svg className="carousel__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="4" width="4" height="16" strokeLinecap="round" strokeWidth="2"/>
                <rect x="14" y="4" width="4" height="16" strokeLinecap="round" strokeWidth="2"/>
              </svg>
            ) : (
              <svg className="carousel__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 5v14l11-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Carousel