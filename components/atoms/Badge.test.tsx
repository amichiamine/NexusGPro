import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

/**
 * Tests exhaustifs pour le composant Badge
 * Couverture de tous les props, variantes, tailles et accessibilité
 */
describe('Badge', () => {
  // === TESTS DE RENDU DE BASE ===
  describe('Rendu de base', () => {
    it('rend correctement un badge avec le texte par défaut', () => {
      render(<Badge label="Nouveau" />);
      const badge = screen.getByText('Nouveau');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'badge--primary', 'badge--md');
    });

    it('utilise le label par défaut quand non fourni', () => {
      render(<Badge />);
      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
    });

    it('applique les classes CSS correctement', () => {
      const { container } = render(<Badge label="Test" variant="secondary" size="sm" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('badge', 'badge--secondary', 'badge--sm');
    });

    it('hérite les classes CSS supplémentaires', () => {
      const { container } = render(<Badge label="Test" className="custom-class" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('badge', 'custom-class');
    });
  });

  // === TESTS DES VARIANTES ===
  describe('Variantes visuelles', () => {
    const variants: Array<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost'> = [
      'primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline', 'ghost'
    ];

    variants.forEach(variant => {
      it(`rend correctement avec la variante ${variant}`, () => {
        const { container } = render(<Badge label="Test" variant={variant} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge).toHaveClass(`badge--${variant}`);
      });
    });
  });

  // === TESTS DES TAILLES ===
  describe('Tailles', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg'> = ['xs', 'sm', 'md', 'lg'];

    sizes.forEach(size => {
      it(`rend correctement avec la taille ${size}`, () => {
        const { container } = render(<Badge label="Test" size={size} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge).toHaveClass(`badge--${size}`);
      });
    });
  });

  // === TESTS DES ÉTATS ===
  describe('États', () => {
    it('applique la classe block quand block est true', () => {
      const { container } = render(<Badge label="Test" block />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('badge--block');
    });

    it('n\'applique pas la classe block quand block est false', () => {
      const { container } = render(<Badge label="Test" block={false} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).not.toHaveClass('badge--block');
    });
  });

  // === TESTS DES ICÔNES ===
  describe('Icônes', () => {
    it('rend une icône à gauche', () => {
      const IconLeft = () => <span data-testid="icon-left">←</span>;
      render(<Badge label="Test" iconLeft={<IconLeft />} />);
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
      expect(screen.getByText('←')).toHaveClass('badge__icon', 'badge__icon--left');
    });

    it('rend une icône à droite', () => {
      const IconRight = () => <span data-testid="icon-right">→</span>;
      render(<Badge label="Test" iconRight={<IconRight />} />);
      expect(screen.getByTestId('icon-right')).toBeInTheDocument();
      expect(screen.getByText('→')).toHaveClass('badge', 'badge__icon', 'badge__icon--right');
    });

    it('rend des icônes des deux côtés', () => {
      const IconLeft = () => <span data-testid="icon-left">←</span>;
      const IconRight = () => <span data-testid="icon-right">→</span>;
      render(<Badge label="Test" iconLeft={<IconLeft />} iconRight={<IconRight />} />);
      expect(screen.getByTestId('icon-left')).toBeInTheDocument();
      expect(screen.getByTestId('icon-right')).toBeInTheDocument();
    });
  });

  // === TESTS D'ACCESSIBILITÉ ===
  describe('Accessibilité (WCAG)', () => {
    it('a un rôle status par défaut', () => {
      const { container } = render(<Badge label="Test" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('utilise aria-label personnalisé quand fourni', () => {
      const { container } = render(<Badge label="Test" aria-label="Badge de test" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('aria-label', 'Badge de test');
    });

    it('ajoute aria-hidden quand pas de texte simple', () => {
      const Icon = () => <span>←</span>;
      const { container } = render(<Badge label={<Icon />} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('aria-hidden', 'true');
    });

    it('est focusable avec la navigation clavier', () => {
      const { container } = render(<Badge label="Test" tabIndex={0} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('tabindex', '0');
    });

    it('accepte les autres attributs d\'accessibilité', () => {
      const { container } = render(
        <Badge 
          label="Test" 
          role="button" 
          aria-describedby="description"
          data-testid="badge"
        />
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('role', 'button');
      expect(badge).toHaveAttribute('aria-describedby', 'description');
    });
  });

  // === TESTS DES PROPS ET ÉVÉNEMENTS ===
  describe('Props et événements', () => {
    it('passe les props HTML restantes', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Badge 
          label="Test" 
          onClick={handleClick}
          data-testid="badge"
          title="Badge tooltip"
        />
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });

    it('supporte les clés React', () => {
      const { rerender } = render(<Badge label="Test" key="badge-1" />);
      rerender(<Badge label="Test Updated" key="badge-2" />);
      expect(screen.getByText('Test Updated')).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  // === TESTS DE RENDU CONDITIONNEL ===
  describe('Rendu conditionnel', () => {
    it('rend rien quand label est null', () => {
      const { container } = render(<Badge label={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('rend rien quand label est undefined', () => {
      const { container } = render(<Badge label={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('rend une icône seule', () => {
      const Icon = () => <span data-testid="icon">★</span>;
      render(<Badge iconLeft={<Icon />} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  // === TESTS DE PERFORMANCE ===
  describe('Performance', () => {
    it('re-rend seulement quand les props changent', () => {
      const { rerender } = render(<Badge label="Test" variant="primary" />);
      const badge1 = screen.getByText('Test').closest('.badge');
      
      rerender(<Badge label="Test" variant="primary" />); // Pas de changement
      const badge2 = screen.getByText('Test').closest('.badge');
      
      expect(badge1).toBe(badge2); // Même élément DOM
    });

    it('re-rend quand la variante change', () => {
      const { rerender } = render(<Badge label="Test" variant="primary" />);
      rerender(<Badge label="Test" variant="secondary" />);
      const badge = screen.getByText('Test').closest('.badge');
      expect(badge).toHaveClass('badge--secondary');
    });
  });

  // === TESTS D'INTÉGRATION ===
  describe('Intégration', () => {
    it('fonctionne dans un contexte React.StrictMode', () => {
      const { container } = render(
        <React.StrictMode>
          <Badge label="Test" />
        </React.StrictMode>
      );
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('fonctionne avec d\'autres composants Badge', () => {
      render(
        <div>
          <Badge label="Badge 1" variant="primary" />
          <Badge label="Badge 2" variant="success" />
          <Badge label="Badge 3" variant="warning" />
        </div>
      );
      expect(screen.getByText('Badge 1')).toBeInTheDocument();
      expect(screen.getByText('Badge 2')).toBeInTheDocument();
      expect(screen.getByText('Badge 3')).toBeInTheDocument();
    });
  });

  // === TESTS DE RÉGRESSION ===
  describe('Tests de régression', () => {
    it('ne cause pas de warnings React', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Badge label="Test" />);
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('supporte les propriétés du DOM', () => {
      const { container } = render(
        <Badge 
          label="Test"
          id="test-badge"
          className="test-class"
          style={{ backgroundColor: 'red' }}
        />
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveClass('test-class');
      expect(badge).toHaveStyle({ backgroundColor: 'red' });
    });
  });
});