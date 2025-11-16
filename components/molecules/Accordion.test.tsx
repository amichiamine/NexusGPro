import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Accordion } from './Accordion';

/**
 * Tests exhaustifs pour le composant Accordion
 * Couverture de tous les modes, navigation clavier, accessibilité et état
 */
describe('Accordion', () => {
  const defaultItems = [
    { title: 'Section 1', content: 'Contenu 1' },
    { title: 'Section 2', content: 'Contenu 2' },
    { title: 'Section 3', content: 'Contenu 3' }
  ];

  // === TESTS DE RENDU DE BASE ===
  describe('Rendu de base', () => {
    it('rend correctement un accordion avec des éléments', () => {
      render(<Accordion items={defaultItems} />);
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('rend le contenu des sections fermées masqué par défaut', () => {
      render(<Accordion items={defaultItems} />);
      
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
      expect(screen.queryByText('Contenu 3')).not.toBeVisible();
    });

    it('utilise les items par défaut si none fournis', () => {
      render(<Accordion />);
      
      expect(screen.getByText('Q')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('applique les classes CSS correctement', () => {
      const { container } = render(<Accordion items={defaultItems} type="multiple" />);
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveClass('accordion', 'accordion--multiple');
    });

    it('hérite les classes CSS supplémentaires', () => {
      const { container } = render(<Accordion items={defaultItems} className="custom-accordion" />);
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveClass('accordion', 'custom-accordion');
    });
  });

  // === TESTS DES MODES (SINGLE/MULTIPLE) ===
  describe('Modes single et multiple', () => {
    it('mode single : seul un élément peut être ouvert', () => {
      render(<Accordion items={defaultItems} type="single" />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      fireEvent.click(headers[0]);
      expect(screen.getByText('Contenu 1')).toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
      
      fireEvent.click(headers[1]);
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
      expect(screen.getByText('Contenu 2')).toBeVisible();
    });

    it('mode multiple : plusieurs éléments peuvent être ouverts', () => {
      render(<Accordion items={defaultItems} type="multiple" />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      fireEvent.click(headers[0]);
      fireEvent.click(headers[2]);
      
      expect(screen.getByText('Contenu 1')).toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
      expect(screen.getByText('Contenu 3')).toBeVisible();
    });

    it('respecte allowToggle=false en mode single', () => {
      render(<Accordion items={defaultItems} type="single" allowToggle={false} />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      fireEvent.click(headers[0]);
      expect(screen.getByText('Contenu 1')).toBeVisible();
      
      // Tenter de fermer - ne devrait pas fonctionner
      fireEvent.click(headers[0]);
      expect(screen.getByText('Contenu 1')).toBeVisible();
    });
  });

  // === TESTS DE L'ÉTAT CONTRÔLÉ ===
  describe('État contrôlé', () => {
    it('utilise openItems quand fourni (contrôlé)', () => {
      const { rerender } = render(
        <Accordion items={defaultItems} openItems={[0]} />
      );
      
      expect(screen.getByText('Contenu 1')).toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
      
      rerender(<Accordion items={defaultItems} openItems={[1]} />);
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
      expect(screen.getByText('Contenu 2')).toBeVisible();
    });

    it('appelle onChange avec les nouveaux indices', () => {
      const handleChange = vi.fn();
      render(
        <Accordion items={defaultItems} onChange={handleChange} />
      );
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      fireEvent.click(headers[0]);
      
      expect(handleChange).toHaveBeenCalledWith([0]);
    });

    it('gère correctement l\'état par défaut', () => {
      render(
        <Accordion items={defaultItems} defaultOpen={[1]} />
      );
      
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
      expect(screen.getByText('Contenu 2')).toBeVisible();
      expect(screen.queryByText('Contenu 3')).not.toBeVisible();
    });
  });

  // === TESTS DE NAVIGATION CLAVIER ===
  describe('Navigation clavier', () => {
    it('navigue avec les flèches', () => {
      render(<Accordion items={defaultItems} />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      // Focus sur le premier header
      headers[0].focus();
      expect(document.activeElement).toBe(headers[0]);
      
      // Navigation vers le bas
      fireEvent.keyDown(headers[0], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(headers[1]);
      
      // Navigation vers le haut
      fireEvent.keyDown(headers[1], { key: 'ArrowUp' });
      expect(document.activeElement).toBe(headers[0]);
    });

    it('navigation Home et End', () => {
      render(<Accordion items={defaultItems} />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      // Focus sur le milieu
      headers[1].focus();
      expect(document.activeElement).toBe(headers[1]);
      
      // Aller au début
      fireEvent.keyDown(headers[1], { key: 'Home' });
      expect(document.activeElement).toBe(headers[0]);
      
      // Aller à la fin
      fireEvent.keyDown(headers[0], { key: 'End' });
      expect(document.activeElement).toBe(headers[2]);
    });

    it('ouvre une section avec Entrée ou Espace', () => {
      render(<Accordion items={defaultItems} />);
      
      const firstHeader = screen.getByRole('button', { name: /Section 1/ });
      firstHeader.focus();
      
      fireEvent.keyDown(firstHeader, { key: 'Enter' });
      expect(screen.getByText('Contenu 1')).toBeVisible();
      
      fireEvent.keyDown(firstHeader, { key: ' ' });
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
    });
  });

  // === TESTS D'ACCESSIBILITÉ ===
  describe('Accessibilité (WCAG)', () => {
    it('a les attributs ARIA appropriés', () => {
      render(<Accordion items={defaultItems} />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      const panels = screen.getAllByRole('region');
      
      headers.forEach((header, index) => {
        expect(header).toHaveAttribute('aria-expanded', 'false');
        expect(header).toHaveAttribute('aria-controls');
      });
      
      panels.forEach(panel => {
        expect(panel).toHaveAttribute('aria-labelledby');
        expect(panel).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('met à jour aria-expanded quand ouvert', () => {
      render(<Accordion items={defaultItems} />);
      
      const firstHeader = screen.getByRole('button', { name: /Section 1/ });
      expect(firstHeader).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(firstHeader);
      expect(firstHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('met à jour aria-hidden pour les panels', () => {
      render(<Accordion items={defaultItems} />);
      
      const panels = screen.getAllByRole('region');
      expect(panels[0]).toHaveAttribute('aria-hidden', 'true');
      
      const firstHeader = screen.getByRole('button', { name: /Section 1/ });
      fireEvent.click(firstHeader);
      
      expect(panels[0]).toHaveAttribute('aria-hidden', 'false');
    });

    it('utilise les labels personnalisés', () => {
      const itemsWithLabels = [
        { title: 'Section 1', content: 'Contenu 1', 'aria-label': 'Première section' },
        { title: 'Section 2', content: 'Contenu 2', 'aria-label': 'Deuxième section' }
      ];
      
      render(<Accordion items={itemsWithLabels} />);
      
      expect(screen.getByLabelText('Première section')).toBeInTheDocument();
      expect(screen.getByLabelText('Deuxième section')).toBeInTheDocument();
    });

    it('supporte aria-label et aria-describedby pour l\'accordion', () => {
      const { container } = render(
        <Accordion 
          items={defaultItems} 
          aria-label="Mon accordéon"
          aria-describedby="description"
        />
      );
      
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveAttribute('aria-label', 'Mon accordéon');
      expect(accordion).toHaveAttribute('aria-describedby', 'description');
    });
  });

  // === TESTS DES ÉTATS ===
  describe('États', () => {
    it('désactive correctement l\'accordion', () => {
      render(<Accordion items={defaultItems} disabled />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      
      headers.forEach(header => {
        expect(header).toBeDisabled();
      });
      
      fireEvent.click(headers[0]);
      expect(screen.queryByText('Contenu 1')).not.toBeVisible();
    });

    it('respecte isOpen dans les items', () => {
      const itemsWithOpen = [
        { title: 'Section 1', content: 'Contenu 1', isOpen: true },
        { title: 'Section 2', content: 'Contenu 2', isOpen: false }
      ];
      
      render(<Accordion items={itemsWithOpen} />);
      
      expect(screen.getByText('Contenu 1')).toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
    });

    it('combine isOpen avec defaultOpen', () => {
      const itemsWithOpen = [
        { title: 'Section 1', content: 'Contenu 1', isOpen: true },
        { title: 'Section 2', content: 'Contenu 2', isOpen: false },
        { title: 'Section 3', content: 'Contenu 3', isOpen: false }
      ];
      
      render(<Accordion items={itemsWithOpen} defaultOpen={[2]} />);
      
      expect(screen.getByText('Contenu 1')).toBeVisible();
      expect(screen.queryByText('Contenu 2')).not.toBeVisible();
      expect(screen.getByText('Contenu 3')).toBeVisible();
    });
  });

  // === TESTS DES PROPS ===
  describe('Props', () => {
    it('accepte des IDs personnalisés', () => {
      const itemsWithIds = [
        { id: 'custom-1', title: 'Section 1', content: 'Contenu 1' },
        { id: 'custom-2', title: 'Section 2', content: 'Contenu 2' }
      ];
      
      render(<Accordion items={itemsWithIds} baseId="test-accordion" />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      headers.forEach(header => {
        expect(header.id).toMatch(/test-accordion-item-\d+-header/);
      });
    });

    it('supporte les icônes personnalisées', () => {
      const itemsWithIcons = [
        { 
          title: 'Section 1', 
          content: 'Contenu 1', 
          icon: '🔽'
        },
        { 
          title: 'Section 2', 
          content: 'Contenu 2', 
          icon: '⬇'
        }
      ];
      
      render(<Accordion items={itemsWithIcons} />);
      
      expect(screen.getByText('🔽')).toBeInTheDocument();
      expect(screen.getByText('⬇')).toBeInTheDocument();
    });

    it('passe les props HTML restantes', () => {
      const { container } = render(
        <Accordion 
          items={defaultItems}
          id="test-accordion"
          data-testid="accordion"
          title="Accordéon de test"
        />
      );
      
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveAttribute('id', 'test-accordion');
      expect(accordion).toHaveAttribute('title', 'Accordéon de test');
    });
  });

  // === TESTS DE PERFORMANCE ===
  describe('Performance', () => {
    it('re-rend seulement quand les props changent', () => {
      const { rerender } = render(<Accordion items={defaultItems} type="single" />);
      const firstHeader = screen.getByRole('button', { name: /Section 1/ });
      
      rerender(<Accordion items={defaultItems} type="single" />); // Pas de changement
      expect(document.activeElement).toBe(firstHeader);
    });

    it('re-rend quand openItems change', () => {
      const { rerender } = render(
        <Accordion items={defaultItems} openItems={[]} />
      );
      
      rerender(<Accordion items={defaultItems} openItems={[0]} />);
      expect(screen.getByText('Contenu 1')).toBeVisible();
    });
  });

  // === TESTS D'INTÉGRATION ===
  describe('Intégration', () => {
    it('fonctionne dans un contexte React.StrictMode', () => {
      const { container } = render(
        <React.StrictMode>
          <Accordion items={defaultItems} />
        </React.StrictMode>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('fonctionne avec plusieurs accordions', () => {
      render(
        <div>
          <Accordion items={defaultItems} type="single" />
          <Accordion items={defaultItems} type="multiple" />
        </div>
      );
      
      expect(screen.getAllByText(/Section 1/)).toHaveLength(2);
      expect(screen.getAllByText(/Section 2/)).toHaveLength(2);
    });

    it('accepte le focus initial', () => {
      render(<Accordion items={defaultItems} defaultFocusIndex={1} />);
      
      const headers = screen.getAllByRole('button', { name: /Section/ });
      expect(headers[1]).toHaveFocus();
    });
  });

  // === TESTS DE RÉGRESSION ===
  describe('Tests de régression', () => {
    it('ne cause pas de warnings React', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Accordion items={defaultItems} />);
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('supporte les propriétés du DOM', () => {
      const { container } = render(
        <Accordion 
          items={defaultItems}
          id="test-accordion"
          className="test-class"
          style={{ backgroundColor: 'red' }}
        />
      );
      
      const accordion = container.firstChild as HTMLElement;
      expect(accordion).toHaveAttribute('id', 'test-accordion');
      expect(accordion).toHaveClass('test-class');
      expect(accordion).toHaveStyle({ backgroundColor: 'red' });
    });

    it('gère les arrays vides', () => {
      render(<Accordion items={[]} />);
      // Ne devrait pas crasher
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('gère les contenus React complexes', () => {
      const complexItems = [
        {
          title: 'Section complexe',
          content: (
            <div>
              <p>Paragraphe 1</p>
              <button>Action</button>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          )
        }
      ];
      
      render(<Accordion items={complexItems} />);
      
      const header = screen.getByRole('button', { name: /Section complexe/ });
      fireEvent.click(header);
      
      expect(screen.getByText('Paragraphe 1')).toBeVisible();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('génère des IDs uniques automatiquement', () => {
      const { container } = render(
        <Accordion items={defaultItems} />
      );
      
      const accordion = container.firstChild as HTMLElement;
      expect(accordion.id).toMatch(/^accordion-\w+$/);
    });
  });
});