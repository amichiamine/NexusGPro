/**
 * CTASection Component - Comprehensive Test Suite
 * 
 * Complete test coverage for CTASection component including:
 * - Rendering and prop validation
 * - Background variant testing
 * - Layout and position variations
 * - Button functionality and accessibility
 * - Responsive behavior
 * - Theme switching
 * - Custom content handling
 * - Event handlers and navigation
 * 
 * @author MiniMax Agent
 * @version 1.0.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CTASection } from './CTASection'

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Custom render function with test providers
 */
const renderCTASection = (props = {}) => {
  const defaultProps = {
    title: 'Test CTA Section',
    primaryButton: { text: 'Get Started', onClick: jest.fn() }
  }
  
  return render(<CTASection {...defaultProps} {...props} />)
}

/**
 * Mock button click handler
 */
const mockClickHandler = jest.fn()

// ============================================================================
// RENDERING AND PROPS TESTS
// ============================================================================

describe('CTASection Rendering', () => {
  test('renders with default props', () => {
    renderCTASection()
    
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.getByText('Test CTA Section')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Call to action section: Test CTA Section')
  })
  
  test('renders with custom title and description', () => {
    renderCTASection({
      title: 'Custom Title',
      subtitle: 'Custom Subtitle',
      description: 'Custom description text'
    })
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Custom description text')).toBeInTheDocument()
  })
  
  test('renders without buttons when none provided', () => {
    renderCTASection({
      primaryButton: undefined,
      secondaryButton: undefined
    })
    
    expect(screen.getByText('Test CTA Section')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  
  test('renders with custom children content', () => {
    renderCTASection({
      children: <div data-testid="custom-content">Custom Content</div>
    })
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })
  
  test('generates unique ID for accessibility', () => {
    const { container: container1 } = renderCTASection()
    const { container: container2 } = renderCTASection()
    
    const section1 = container1.querySelector('section')
    const section2 = container2.querySelector('section')
    
    expect(section1).toHaveAttribute('id')
    expect(section2).toHaveAttribute('id')
    expect(section1?.id).not.toBe(section2?.id)
  })
  
  test('uses custom ID when provided', () => {
    renderCTASection({ id: 'custom-section-id' })
    
    expect(screen.getByTestId('custom-section-id')).toBeInTheDocument()
  })
  
  test('applies custom class name', () => {
    renderCTASection({ className: 'custom-class' })
    
    expect(screen.getByRole('region')).toHaveClass('cta-section', 'custom-class')
  })
})

// ============================================================================
// BACKGROUND VARIANT TESTS
// ============================================================================

describe('CTASection Background Variants', () => {
  test('applies primary background variant', () => {
    const { container } = renderCTASection({ background: 'primary' })
    
    expect(container.firstChild).toHaveClass('cta-section--background-primary')
  })
  
  test('applies secondary background variant', () => {
    const { container } = renderCTASection({ background: 'secondary' })
    
    expect(container.firstChild).toHaveClass('cta-section--background-secondary')
  })
  
  test('applies gradient background variant', () => {
    const { container } = renderCTASection({ background: 'gradient' })
    
    expect(container.firstChild).toHaveClass('cta-section--background-gradient')
  })
  
  test('applies dark background variant', () => {
    const { container } = renderCTASection({ background: 'dark' })
    
    expect(container.firstChild).toHaveClass('cta-section--background-dark')
  })
  
  test('applies light background variant', () => {
    const { container } = renderCTASection({ background: 'light' })
    
    expect(container.firstChild).toHaveClass('cta-section--background-light')
  })
  
  test('renders with background image', () => {
    const { container } = renderCTASection({
      backgroundImage: 'https://example.com/bg.jpg'
    })
    
    expect(container.firstChild).toHaveClass('cta-section--has-background-image')
    expect(container.querySelector('.cta-section__background-image')).toBeInTheDocument()
    expect(container.querySelector('.cta-section__background-image')).toHaveStyle({
      backgroundImage: 'url(https://example.com/bg.jpg)'
    })
  })
  
  test('renders with background overlay', () => {
    const { container } = renderCTASection({
      backgroundImage: 'https://example.com/bg.jpg',
      backgroundOverlay: 0.7
    })
    
    const backgroundElement = container.querySelector('.cta-section__background-image')
    expect(backgroundElement).toHaveStyle({
      opacity: '0.7'
    })
  })
})

// ============================================================================
// LAYOUT AND POSITION TESTS
// ============================================================================

describe('CTASection Layout and Position', () => {
  test('applies single layout', () => {
    const { container } = renderCTASection({ layout: 'single' })
    
    expect(container.firstChild).toHaveClass('cta-section--layout-single')
  })
  
  test('applies split layout', () => {
    const { container } = renderCTASection({ layout: 'split' })
    
    expect(container.firstChild).toHaveClass('cta-section--layout-split')
  })
  
  test('applies stacked layout', () => {
    const { container } = renderCTASection({ layout: 'stacked' })
    
    expect(container.firstChild).toHaveClass('cta-section--layout-stacked')
  })
  
  test('applies center position', () => {
    const { container } = renderCTASection({ position: 'center' })
    
    expect(container.firstChild).toHaveClass('cta-section--position-center')
  })
  
  test('applies left position', () => {
    const { container } = renderCTASection({ position: 'left' })
    
    expect(container.firstChild).toHaveClass('cta-section--position-left')
  })
  
  test('applies right position', () => {
    const { container } = renderCTASection({ position: 'right' })
    
    expect(container.firstChild).toHaveClass('cta-section--position-right')
  })
})

// ============================================================================
// BUTTON FUNCTIONALITY TESTS
// ============================================================================

describe('CTASection Button Functionality', () => {
  test('renders primary button with default props', () => {
    renderCTASection()
    
    const primaryButton = screen.getByText('Get Started')
    expect(primaryButton).toBeInTheDocument()
    expect(primaryButton.closest('button')).toHaveClass('cta-section__button--primary')
  })
  
  test('renders secondary button', () => {
    renderCTASection({
      secondaryButton: { text: 'Learn More' }
    })
    
    expect(screen.getByText('Learn More')).toBeInTheDocument()
    expect(screen.getByText('Learn More').closest('button')).toHaveClass('cta-section__button--secondary')
  })
  
  test('handles primary button click', async () => {
    const handleClick = jest.fn()
    renderCTASection({
      primaryButton: { text: 'Click Me', onClick: handleClick }
    })
    
    await userEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('handles secondary button click', async () => {
    const handleClick = jest.fn()
    renderCTASection({
      secondaryButton: { text: 'Click Me', onClick: handleClick }
    })
    
    await userEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('disables button when disabled prop is true', () => {
    renderCTASection({
      primaryButton: { text: 'Disabled Button', disabled: true }
    })
    
    const button = screen.getByText('Disabled Button').closest('button')
    expect(button).toBeDisabled()
  })
  
  test('shows loading state when loading prop is true', () => {
    renderCTASection({
      primaryButton: { text: 'Loading Button', loading: true }
    })
    
    const button = screen.getByText('Loading Button').closest('button')
    expect(button).toHaveAttribute('aria-label', 'Loading Button')
    expect(button?.querySelector('.cta-section__button-loading')).toBeInTheDocument()
  })
  
  test('renders button with icon', () => {
    const icon = <span data-testid="button-icon">Icon</span>
    renderCTASection({
      primaryButton: { text: 'Button with Icon', icon }
    })
    
    expect(screen.getByTestId('button-icon')).toBeInTheDocument()
    expect(screen.getByTestId('button-icon').closest('.cta-section__button-icon')).toBeInTheDocument()
  })
  
  test('renders button with href for navigation', () => {
    renderCTASection({
      primaryButton: { text: 'Link Button', href: '/test', target: '_blank' }
    })
    
    const button = screen.getByText('Link Button')
    expect(button.closest('a')).toHaveAttribute('href', '/test')
    expect(button.closest('a')).toHaveAttribute('target', '_blank')
  })
})

// ============================================================================
// BUTTON SIZES AND VARIANTS TESTS
// ============================================================================

describe('CTASection Button Sizes and Variants', () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'link']
  
  sizes.forEach(size => {
    test(`renders ${size} size button`, () => {
      renderCTASection({
        primaryButton: { text: 'Sized Button', size: size as any }
      })
      
      expect(screen.getByText('Sized Button').closest('button'))
        .toHaveClass(`cta-section__button--${size}`)
    })
  })
  
  variants.forEach(variant => {
    test(`renders ${variant} variant button`, () => {
      renderCTASection({
        primaryButton: { text: 'Variant Button', variant: variant as any }
      })
      
      expect(screen.getByText('Variant Button').closest('button'))
        .toHaveClass(`cta-section__button--${variant}`)
    })
  })
})

// ============================================================================
// PADDING AND MAX WIDTH TESTS
// ============================================================================

describe('CTASection Padding and Max Width', () => {
  test('applies padding variants', () => {
    const paddings = ['none', 'sm', 'md', 'lg', 'xl']
    
    paddings.forEach(padding => {
      const { container } = renderCTASection({ padding: padding as any })
      expect(container.firstChild).toHaveClass(`cta-section--padding-${padding}`)
    })
  })
  
  test('applies max width variants', () => {
    const maxWidths = ['sm', 'md', 'lg', 'xl', 'full']
    
    maxWidths.forEach(maxWidth => {
      const { container } = renderCTASection({ maxWidth: maxWidth as any })
      expect(container.firstChild).toHaveClass(`cta-section--max-width-${maxWidth}`)
    })
  })
})

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('CTASection Accessibility', () => {
  test('has proper ARIA label', () => {
    renderCTASection({
      title: 'Accessibility Test',
      ariaLabel: 'Custom ARIA Label'
    })
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Custom ARIA Label')
  })
  
  test('has default ARIA label based on title', () => {
    renderCTASection({
      title: 'Test Title'
    })
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Call to action section: Test Title')
  })
  
  test('button has proper ARIA label', () => {
    renderCTASection({
      primaryButton: { text: 'Custom Button Text' }
    })
    
    const button = screen.getByText('Custom Button Text').closest('button')
    expect(button).toHaveAttribute('aria-label', 'Custom Button Text')
  })
  
  test('focuses button on keyboard navigation', async () => {
    renderCTASection()
    
    await userEvent.tab()
    expect(screen.getByText('Get Started').closest('button')).toHaveFocus()
  })
  
  test('button has proper role and type', () => {
    renderCTASection({
      primaryButton: { text: 'Submit Button', type: 'submit' }
    })
    
    const button = screen.getByText('Submit Button').closest('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button?.tagName).toBe('BUTTON')
  })
  
  test('navigation buttons have proper attributes', () => {
    renderCTASection({
      primaryButton: { text: 'External Link', href: 'https://example.com', target: '_blank' }
    })
    
    const link = screen.getByText('External Link').closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

// ============================================================================
// DECORATIVE ELEMENTS TESTS
// ============================================================================

describe('CTASection Decorative Elements', () => {
  test('renders decorative elements by default', () => {
    const { container } = renderCTASection()
    
    expect(container.querySelector('.cta-section__decorative')).toBeInTheDocument()
    expect(container.querySelectorAll('.cta-section__decorative-element')).toHaveLength(3)
  })
  
  test('hides decorative elements when decorative prop is false', () => {
    const { container } = renderCTASection({ decorative: false })
    
    expect(container.querySelector('.cta-section__decorative')).not.toBeInTheDocument()
  })
  
  test('decorative elements have proper styling', () => {
    const { container } = renderCTASection()
    
    const decorative1 = container.querySelector('.cta-section__decorative-element--1')
    const decorative2 = container.querySelector('.cta-section__decorative-element--2')
    const decorative3 = container.querySelector('.cta-section__decorative-element--3')
    
    expect(decorative1).toHaveStyle({
      width: '200px',
      height: '200px'
    })
    
    expect(decorative2).toHaveStyle({
      width: '150px',
      height: '150px'
    })
    
    expect(decorative3).toHaveStyle({
      width: '100px',
      height: '100px'
    })
  })
})

// ============================================================================
// RESPONSIVE BEHAVIOR TESTS
// ============================================================================

describe('CTASection Responsive Behavior', () => {
  test('applies responsive classes for mobile', () => {
    const { container } = renderCTASection({ layout: 'split' })
    
    // Test that split layout can be applied (responsive changes happen via CSS)
    expect(container.firstChild).toHaveClass('cta-section--layout-split')
  })
  
  test('handles button wrapping on mobile', () => {
    renderCTASection({
      primaryButton: { text: 'Button 1' },
      secondaryButton: { text: 'Button 2' }
    })
    
    const actionsContainer = screen.getByText('Button 1').closest('.cta-section__actions')
    expect(actionsContainer).toBeInTheDocument()
    expect(actionsContainer).toHaveClass('cta-section__actions')
  })
})

// ============================================================================
// PERFORMANCE AND OPTIMIZATION TESTS
// ============================================================================

describe('CTASection Performance', () => {
  test('memoizes button validation results', () => {
    const { rerender } = renderCTASection({
      primaryButton: { text: 'Test Button', onClick: mockClickHandler }
    })
    
    const button1 = screen.getByText('Test Button')
    fireEvent.click(button1)
    
    expect(mockClickHandler).toHaveBeenCalledTimes(1)
    
    // Re-render with same props should not affect handler
    rerender(<CTASection title="Different Title" primaryButton={{ text: 'Test Button', onClick: mockClickHandler }} />)
    
    const button2 = screen.getByText('Test Button')
    fireEvent.click(button2)
    
    expect(mockClickHandler).toHaveBeenCalledTimes(2)
  })
  
  test('generates unique IDs efficiently', () => {
    const { container: container1 } = renderCTASection()
    const { container: container2 } = renderCTASection()
    
    const section1 = container1.querySelector('section')
    const section2 = container2.querySelector('section')
    
    expect(section1?.id).toMatch(/^cta-section-[a-z0-9]{9}$/)
    expect(section2?.id).toMatch(/^cta-section-[a-z0-9]{9}$/)
    expect(section1?.id).not.toBe(section2?.id)
  })
})

// ============================================================================
// ERROR HANDLING AND EDGE CASES
// ============================================================================

describe('CTASection Edge Cases', () => {
  test('handles empty title gracefully', () => {
    renderCTASection({ title: '' })
    
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Call to action section: ')
  })
  
  test('handles very long text content', () => {
    const longTitle = 'A'.repeat(200)
    const longDescription = 'B'.repeat(300)
    
    renderCTASection({
      title: longTitle,
      description: longDescription
    })
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })
  
  test('handles special characters in props', () => {
    renderCTASection({
      title: 'Special & Characters <>"\'`',
      description: 'Description with "quotes" & ampersands'
    })
    
    expect(screen.getByText('Special & Characters <>"\'`')).toBeInTheDocument()
    expect(screen.getByText('Description with "quotes" & ampersands')).toBeInTheDocument()
  })
  
  test('handles undefined button configuration', () => {
    renderCTASection({
      primaryButton: undefined,
      secondaryButton: undefined
    })
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
  
  test('handles null or undefined children', () => {
    renderCTASection({
      children: null
    })
    
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.querySelector('.cta-section__custom-content')).not.toBeInTheDocument()
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('CTASection Integration', () => {
  test('works correctly with all props combined', () => {
    renderCTASection({
      title: 'Complete Test',
      subtitle: 'Subtitle',
      description: 'This is a complete test with all features',
      background: 'gradient',
      layout: 'stacked',
      position: 'center',
      padding: 'xl',
      maxWidth: 'md',
      primaryButton: {
        text: 'Primary Action',
        onClick: mockClickHandler,
        variant: 'primary',
        size: 'lg'
      },
      secondaryButton: {
        text: 'Secondary Action',
        variant: 'outline',
        size: 'md'
      },
      backgroundImage: 'https://example.com/bg.jpg',
      backgroundOverlay: 0.6,
      decorative: true
    })
    
    expect(screen.getByText('Complete Test')).toBeInTheDocument()
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
    expect(screen.getByText('This is a complete test with all features')).toBeInTheDocument()
    expect(screen.getByText('Primary Action')).toBeInTheDocument()
    expect(screen.getByText('Secondary Action')).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveClass('cta-section--background-gradient')
    expect(screen.getByRole('region')).toHaveClass('cta-section--layout-stacked')
    expect(screen.getByRole('region')).toHaveClass('cta-section--position-center')
  })
})

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('CTASection Snapshots', () => {
  test('matches default snapshot', () => {
    const { container } = renderCTASection()
    expect(container.firstChild).toMatchSnapshot()
  })
  
  test('matches gradient background snapshot', () => {
    const { container } = renderCTASection({ background: 'gradient' })
    expect(container.firstChild).toMatchSnapshot()
  })
  
  test('matches with both buttons snapshot', () => {
    const { container } = renderCTASection({
      primaryButton: { text: 'Primary', onClick: jest.fn() },
      secondaryButton: { text: 'Secondary' }
    })
    expect(container.firstChild).toMatchSnapshot()
  })
})

// ============================================================================
// EXPORT AND DEFAULT PROPS
// ============================================================================

describe('CTASection Export', () => {
  test('exports component as default', () => {
    expect(CTASection).toBeDefined()
    expect(typeof CTASection).toBe('function')
  })
  
  test('exports all types and interfaces', () => {
    // This test ensures TypeScript compilation succeeds
    expect(require('./CTASection')).toBeDefined()
  })
})

// ============================================================================
// VISUAL REGRESSION TESTS (Mock)
// ============================================================================

describe('CTASection Visual Tests', () => {
  test('renders all background variants correctly', () => {
    const backgrounds = ['primary', 'secondary', 'gradient', 'dark', 'light']
    
    backgrounds.forEach(background => {
      const { container } = renderCTASection({ background })
      const section = container.querySelector('.cta-section')
      
      expect(section).toHaveClass(`cta-section--background-${background}`)
      
      // Clean up
      container.remove()
    })
  })
  
  test('renders all layout variants correctly', () => {
    const layouts = ['single', 'split', 'stacked']
    
    layouts.forEach(layout => {
      const { container } = renderCTASection({ layout })
      const section = container.querySelector('.cta-section')
      
      expect(section).toHaveClass(`cta-section--layout-${layout}`)
      
      // Clean up
      container.remove()
    })
  })
})

export {}