import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../Checkbox'
import '../Checkbox.css'

describe('Checkbox', () => {
  // Tests de rendu de base
  describe('Rendering', () => {
    it('rendu correctement par défaut', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('rendu avec label', () => {
      render(<Checkbox label="Accepter les conditions" />)
      expect(screen.getByText('Accepter les conditions')).toBeInTheDocument()
    })

    it('rendu avec description', () => {
      render(<Checkbox label="Newsletter" description="Recevoir les dernières nouvelles" />)
      expect(screen.getByText('Recevoir les dernières nouvelles')).toBeInTheDocument()
    })

    it('rendu dans un état checked', () => {
      render(<Checkbox checked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('rendu dans un état disabled', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('rendu dans un état indeterminate', () => {
      render(<Checkbox indeterminate />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })
  })

  // Tests des props
  describe('Props', () => {
    it('gère la prop checked correctement', () => {
      render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      const { rerender } = render(<Checkbox checked={true} />)
      expect(checkbox).toBeChecked()
    })

    it('gère la prop value', () => {
      render(<Checkbox value="test-value" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('value', 'test-value')
    })

    it('génère un id unique si non fourni', () => {
      const { container: container1 } = render(<Checkbox />)
      const { container: container2 } = render(<Checkbox />)
      
      const checkbox1 = container1.querySelector('input')
      const checkbox2 = container2.querySelector('input')
      
      expect(checkbox1?.id).toBeTruthy()
      expect(checkbox2?.id).toBeTruthy()
      expect(checkbox1?.id).not.toBe(checkbox2?.id)
    })

    it('utilise l\'id fourni', () => {
      render(<Checkbox id="custom-id" />)
      expect(screen.getByLabelText('checkbox')).toHaveAttribute('id', 'custom-id')
    })

    it('supporte les props HTML standards', () => {
      render(<Checkbox name="test-checkbox" data-testid="test" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'test-checkbox')
    })
  })

  // Tests des interactions
  describe('Interactions', () => {
    it('déclenche onChange lors du clic', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object))
    })

    it('ne déclenche pas onChange quand disabled', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox disabled onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('gère le clic sur le label', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox label="Test label" onChange={handleChange} />)
      const label = screen.getByText('Test label')
      
      await user.click(label)
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object))
    })

    it('utilise space key pour toggle', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.keyboard('{Space}')
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object))
    })

    it('utilise enter key pour toggle', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Checkbox onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object))
    })
  })

  // Tests des variantes et tailles
  describe('Variants & Sizes', () => {
    const variants: Array<CheckboxProps['variant']> = ['default', 'filled', 'outline', 'ghost']
    const sizes: Array<CheckboxProps['size']> = ['sm', 'md', 'lg']

    variants.forEach(variant => {
      it(`rendu correctement avec variante ${variant}`, () => {
        const { container } = render(<Checkbox variant={variant} />)
        const checkbox = container.firstChild as HTMLElement
        expect(checkbox).toHaveClass(`ng-checkbox--${variant}`)
      })
    })

    sizes.forEach(size => {
      it(`rendu correctement avec taille ${size}`, () => {
        const { container } = render(<Checkbox size={size} />)
        const checkbox = container.firstChild as HTMLElement
        expect(checkbox).toHaveClass(`ng-checkbox--${size}`)
      })
    })

    it('supporte labelPosition left', () => {
      const { container } = render(<Checkbox labelPosition="left" label="Test" />)
      const checkbox = container.firstChild as HTMLElement
      expect(checkbox).toHaveClass('ng-checkbox--label-left')
    })
  })

  // Tests d'accessibilité
  describe('Accessibility', () => {
    it('a les attributs ARIA corrects', () => {
      render(<Checkbox checked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('a les attributs ARIA pour état indeterminate', () => {
      render(<Checkbox indeterminate />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('lie la description avec aria-describedby', () => {
      render(<Checkbox label="Test" description="Description" />)
      const checkbox = screen.getByRole('checkbox')
      const description = screen.getByText('Description')
      
      expect(checkbox).toHaveAttribute('aria-describedby', description.id)
    })

    it('lie le label avec htmlFor', () => {
      render(<Checkbox id="test-id" label="Test label" />)
      const label = screen.getByText('Test label')
      const checkbox = screen.getByRole('checkbox')
      
      expect(label).toHaveAttribute('for', 'test-id')
      expect(checkbox).toHaveAttribute('id', 'test-id')
    })

    it('a focus visible', async () => {
      const user = userEvent.setup()
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.tab()
      expect(checkbox).toHaveFocus()
    })
  })

  // Tests d'états visuels
  describe('Visual States', () => {
    it('applique les classes CSS pour état checked', () => {
      const { container } = render(<Checkbox checked />)
      const checkbox = container.firstChild as HTMLElement
      expect(checkbox).toHaveClass('ng-checkbox--checked')
    })

    it('applique les classes CSS pour état indeterminate', () => {
      const { container } = render(<Checkbox indeterminate />)
      const checkbox = container.firstChild as HTMLElement
      expect(checkbox).toHaveClass('ng-checkbox--indeterminate')
    })

    it('applique les classes CSS pour état disabled', () => {
      const { container } = render(<Checkbox disabled />)
      const checkbox = container.firstChild as HTMLElement
      expect(checkbox).toHaveClass('ng-checkbox--disabled')
    })
  })

  // Tests de performance
  describe('Performance', () => {
    it('ne re-rend pas inutile dans un groupe controlled', () => {
      const { rerender } = render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      const initialHTML = checkbox.outerHTML

      rerender(<Checkbox checked={true} />)
      expect(checkbox.outerHTML).toBe(initialHTML)
    })

    it('utilise forwardRef correctement', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })
  })

  // Tests d'intégration
  describe('Integration', () => {
    it('fonctionne dans un groupe checkbox', () => {
      const onChangeGroup = jest.fn()
      
      render(
        <div>
          <Checkbox value="1" onChange={() => {}} label="Option 1" />
          <Checkbox value="2" onChange={() => {}} label="Option 2" />
        </div>
      )
      
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('supporte les formulaires', () => {
      render(
        <form>
          <Checkbox name="options" value="newsletter" label="Newsletter" />
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'options')
      expect(checkbox).toHaveAttribute('value', 'newsletter')
    })
  })

  // Tests de compatibilité
  describe('Compatibility', () => {
    it('supporte les className personnalisés', () => {
      const { container } = render(<Checkbox className="custom-class" />)
      const checkbox = container.firstChild as HTMLElement
      expect(checkbox).toHaveClass('custom-class')
    })

    it('fusionne les classes CSS correctement', () => {
      const { container } = render(
        <Checkbox className="custom-class" size="lg" variant="outline" />
      )
      const checkbox = container.firstChild as HTMLElement
      
      expect(checkbox).toHaveClass('custom-class')
      expect(checkbox).toHaveClass('ng-checkbox--lg')
      expect(checkbox).toHaveClass('ng-checkbox--outline')
    })
  })

  // Tests d'erreur et cas limites
  describe('Edge Cases', () => {
    it('gère les labels vides', () => {
      render(<Checkbox label="" />)
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('gère les descriptions vides', () => {
      render(<Checkbox description="" />)
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('fonctionne sans label ni description', () => {
      const { container } = render(<Checkbox />)
      const content = container.querySelector('.ng-checkbox__content')
      expect(content).not.toBeInTheDocument()
    })

    it('ne crash pas avec onChange undefined', () => {
      render(<Checkbox onChange={undefined} />)
      const checkbox = screen.getByRole('checkbox')
      expect(() => fireEvent.click(checkbox)).not.toThrow()
    })
  })
})