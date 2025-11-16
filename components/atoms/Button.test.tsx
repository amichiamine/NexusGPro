import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render correctly with default props', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('ng-button', 'ng-button--default', 'ng-button--md', 'ng-button--rounded')
    })

    it('should render custom label', () => {
      render(<Button label="Custom Label">Click me</Button>)
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument()
    })

    it('should render children when both children and label are provided', () => {
      render(<Button label="Label">Children</Button>)
      expect(screen.getByText('Children')).toBeInTheDocument()
      expect(screen.getByText('Children')).toHaveTextContent('Children')
    })

    it('should render as link when as="a" and href provided', () => {
      render(<Button as="a" href="https://example.com">Link Button</Button>)
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('should render left and right icons', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>} rightIcon={<span data-testid="right-icon">→</span>}>
          Icon Button
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render loading state', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('ng-button--loading')
      expect(screen.getByTestId('ng-button-spinner')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'] as const)(
      'should render %s variant',
      (variant) => {
        render(<Button variant={variant}>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(`ng-button--${variant}`)
      }
    )
  })

  describe('Sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'should render %s size',
      (size) => {
        render(<Button size={size}>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(`ng-button--${size}`)
      }
    )
  })

  describe('Shapes', () => {
    it.each(['square', 'rounded', 'pill'] as const)(
      'should render %s shape',
      (shape) => {
        render(<Button shape={shape}>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(`ng-button--${shape}`)
      }
    )
  })

  describe('States', () => {
    it('should render disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('ng-button--disabled')
    })

    it('should render full width', () => {
      render(<Button fullWidth>Full Width Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('ng-button--full-width')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} loading>Loading</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should trigger click on Enter key', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger click on Space key', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom aria label">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom aria label')
    })

    it('should have aria-describedby when provided', () => {
      render(
        <>
          <div id="description">Button description</div>
          <Button aria-describedby="description">Button</Button>
        </>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('should set aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should set aria-disabled when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have proper role when as="a"', () => {
      render(<Button as="a" href="#">Link Button</Button>)
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should apply custom style', () => {
      const customStyle = { color: 'red' }
      render(<Button style={customStyle}>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveStyle(customStyle)
    })

    it('should apply custom ID', () => {
      render(<Button id="custom-id">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'custom-id')
    })

    it('should apply data-testid', () => {
      render(<Button data-testid="button-test">Button</Button>)
      expect(screen.getByTestId('button-test')).toBeInTheDocument()
    })
  })

  describe('Link Button', () => {
    it('should render with correct target and rel attributes', () => {
      render(
        <Button as="a" href="https://example.com" target="_blank" rel="noopener noreferrer">
          External Link
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should call onClick when link is clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button as="a" href="https://example.com" onClick={handleClick}>
          Link
        </Button>
      )
      
      await user.click(screen.getByRole('link'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button as="a" href="https://example.com" onClick={handleClick} disabled>
          Disabled Link
        </Button>
      )
      
      await user.click(screen.getByRole('link'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('TypeScript Props', () => {
    it('should work with all prop types', () => {
      // Test que TypeScript accepte tous les types de props
      const { container } = render(
        <Button
          variant="primary"
          size="lg"
          shape="pill"
          disabled={false}
          loading={false}
          fullWidth={false}
          type="submit"
          as="button"
          onClick={() => {}}
        >
          Test Button
        </Button>
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})