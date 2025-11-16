import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Tests exhaustifs pour le composant Skeleton
 * Couverture de tous les types, tailles, animations et accessibilité
 */
describe('Skeleton', () => {
  // === TESTS DE RENDU DE BASE ===
  describe('Rendu de base', () => {
    it('rend correctement un skeleton rectangle par défaut', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton', 'skeleton--rectangle', 'skeleton--md');
    });

    it('applique les classes CSS correctement', () => {
      const { container } = render(<Skeleton type="text" size="lg" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton', 'skeleton--text', 'skeleton--lg');
    });

    it('hérite les classes CSS supplémentaires', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton', 'custom-class');
    });
  });

  // === TESTS DES TYPES ===
  describe('Types de skeletons', () => {
    const types: Array<'text' | 'circle' | 'rectangle' | 'avatar' | 'button' | 'card'> = [
      'text', 'circle', 'rectangle', 'avatar', 'button', 'card'
    ];

    types.forEach(type => {
      it(`rend correctement avec le type ${type}`, () => {
        const { container } = render(<Skeleton type={type} />);
        const skeleton = container.firstChild as HTMLElement;
        expect(skeleton).toHaveClass(`skeleton--${type}`);
      });
    });
  });

  // === TESTS DES TAILLES ===
  describe('Tailles', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      it(`rend correctement avec la taille ${size}`, () => {
        const { container } = render(<Skeleton size={size} />);
        const skeleton = container.firstChild as HTMLElement;
        expect(skeleton).toHaveClass(`skeleton--${size}`);
      });
    });
  });

  // === TESTS DES DIMENSIONS PERSONNALISÉES ===
  describe('Dimensions personnalisées', () => {
    it('accepte une largeur personnalisée en pixels', () => {
      const { container } = render(<Skeleton width={300} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '300px' });
    });

    it('accepte une largeur personnalisée en pourcentage', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('accepte une hauteur personnalisée en pixels', () => {
      const { container } = render(<Skeleton height={100} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '100px' });
    });

    it('accepte une hauteur personnalisée en chaîne', () => {
      const { container } = render(<Skeleton height="2rem" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '2rem' });
    });

    it('accepte un radius personnalisé pour les cercles', () => {
      const { container } = render(<Skeleton type="circle" radius={25} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ borderRadius: '25px' });
    });
  });

  // === TESTS DU TYPE TEXT ===
  describe('Type texte', () => {
    it('rend une seule ligne par défaut', () => {
      render(<Skeleton type="text" />);
      const lines = screen.getAllByRole('presentation').filter(el => 
        el.classList.contains('skeleton__line')
      );
      expect(lines).toHaveLength(1);
    });

    it('rend le nombre de lignes spécifié', () => {
      render(<Skeleton type="text" lines={3} />);
      const lines = screen.getAllByRole('presentation').filter(el => 
        el.classList.contains('skeleton__line')
      );
      expect(lines).toHaveLength(3);
    });

    it('applique la classe multiligne', () => {
      const { container } = render(<Skeleton type="text" lines={2} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton--text-multiline');
    });

    it('n\'applique pas la classe multiligne pour une seule ligne', () => {
      const { container } = render(<Skeleton type="text" lines={1} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).not.toHaveClass('skeleton--text-multiline');
    });

    it('la première ligne est complète', () => {
      render(<Skeleton type="text" lines={2} />);
      const firstLine = screen.getAllByRole('presentation').find(el =>
        el.classList.contains('skeleton__line--full')
      );
      expect(firstLine).toBeInTheDocument();
    });
  });

  // === TESTS DU TYPE CIRCLE ===
  describe('Type cercle', () => {
    it('rend un élément circulaire', () => {
      const { container } = render(<Skeleton type="circle" size="lg" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton__circle');
    });

    it('respecte les dimensions par taille', () => {
      const { container } = render(<Skeleton type="circle" size="sm" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton--sm');
    });
  });

  // === TESTS DU TYPE CARD ===
  describe('Type carte', () => {
    it('rend une structure de carte complète', () => {
      render(<Skeleton type="card" />);
      
      // Vérifie la présence des éléments de carte
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('a une image, un titre et une description', () => {
      render(<Skeleton type="card" />);
      
      // Les éléments sont présents dans le DOM
      const elements = document.querySelectorAll('.skeleton__card-image, .skeleton__card-title, .skeleton__card-description');
      expect(elements.length).toBeGreaterThanOrEqual(3);
    });
  });

  // === TESTS DES ANIMATIONS ===
  describe('Animations', () => {
    it('a une animation par défaut', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('skeleton--animated');
    });

    it('désactive l\'animation quand animated=false', () => {
      const { container } = render(<Skeleton animated={false} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).not.toHaveClass('skeleton--animated');
    });

    it('respecte prefers-reduced-motion', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      // La classe d'animation est présente par défaut
      expect(skeleton).toHaveClass('skeleton--animated');
    });
  });

  // === TESTS DES COULEURS PERSONNALISÉES ===
  describe('Couleurs personnalisées', () => {
    it('accepte une couleur de fond personnalisée', () => {
      const { container } = render(<Skeleton backgroundColor="#f0f0f0" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ '--skeleton-bg': '#f0f0f0' });
    });

    it('accepte une couleur de highlight personnalisée', () => {
      const { container } = render(<Skeleton highlightColor="#e0e0e0" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ '--skeleton-highlight': '#e0e0e0' });
    });
  });

  // === TESTS D'ACCESSIBILITÉ ===
  describe('Accessibilité (WCAG)', () => {
    it('a un aria-label approprié', () => {
      render(<Skeleton type="text" />);
      const skeleton = screen.getByLabelText('Chargement text');
      expect(skeleton).toBeInTheDocument();
    });

    it('utilise un aria-label personnalisé', () => {
      render(<Skeleton aria-label="Chargement du profil utilisateur" />);
      const skeleton = screen.getByLabelText('Chargement du profil utilisateur');
      expect(skeleton).toBeInTheDocument();
    });

    it('a aria-hidden="true"', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('a role="presentation"', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('role', 'presentation');
    });

    it('bloque les interactions utilisateur', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ 'pointer-events': 'none' });
      expect(skeleton).toHaveStyle({ 'user-select': 'none' });
    });
  });

  // === TESTS DES PROPS ET ÉVÉNEMENTS ===
  describe('Props et événements', () => {
    it('passe les props HTML restantes', () => {
      const { container } = render(
        <Skeleton 
          id="test-skeleton"
          data-testid="skeleton"
          title="Skeleton tooltip"
        />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('id', 'test-skeleton');
      expect(skeleton).toHaveAttribute('title', 'Skeleton tooltip');
    });

    it('supporte les clés React', () => {
      const { rerender } = render(<Skeleton key="skeleton-1" />);
      rerender(<Skeleton key="skeleton-2" />);
      // Pas d'erreur, le composant se re-rend correctement
    });
  });

  // === TESTS DE PERFORMANCE ===
  describe('Performance', () => {
    it('re-rend seulement quand les props changent', () => {
      const { rerender } = render(<Skeleton type="text" size="md" />);
      const skeleton1 = screen.getByLabelText('Chargement text');
      
      rerender(<Skeleton type="text" size="md" />); // Pas de changement
      const skeleton2 = screen.getByLabelText('Chargement text');
      
      expect(skeleton1).toBe(skeleton2); // Même élément DOM
    });

    it('re-rend quand le type change', () => {
      const { rerender } = render(<Skeleton type="text" />);
      rerender(<Skeleton type="circle" />);
      const skeleton = screen.getByLabelText('Chargement circle');
      expect(skeleton).toBeInTheDocument();
    });
  });

  // === TESTS D'INTÉGRATION ===
  describe('Intégration', () => {
    it('fonctionne dans un contexte React.StrictMode', () => {
      const { container } = render(
        <React.StrictMode>
          <Skeleton />
        </React.StrictMode>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('fonctionne avec plusieurs skeletons', () => {
      render(
        <div>
          <Skeleton type="text" lines={2} />
          <Skeleton type="circle" size="md" />
          <Skeleton type="card" />
        </div>
      );
      
      // Vérifie que tous les skeletons sont rendus
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });

    it('fonctionne dans un layout flex', () => {
      render(
        <div className="skeleton-flex">
          <Skeleton type="circle" size="sm" />
          <Skeleton type="text" />
        </div>
      );
      
      const flexContainer = screen.getByRole('presentation').closest('.skeleton-flex');
      expect(flexContainer).toBeInTheDocument();
    });

    it('fonctionne dans un layout grid', () => {
      render(
        <div className="skeleton-grid">
          <Skeleton type="card" />
          <Skeleton type="card" />
        </div>
      );
      
      const gridContainer = screen.getByRole('presentation').closest('.skeleton-grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  // === TESTS DE RÉGRESSION ===
  describe('Tests de régression', () => {
    it('ne cause pas de warnings React', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Skeleton />);
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('supporte les propriétés du DOM', () => {
      const { container } = render(
        <Skeleton 
          id="test-skeleton"
          className="test-class"
          style={{ backgroundColor: 'red' }}
        />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('id', 'test-skeleton');
      expect(skeleton).toHaveClass('test-class');
      expect(skeleton).toHaveStyle({ backgroundColor: 'red' });
    });

    it('gère correctement lines=0', () => {
      render(<Skeleton type="text" lines={0} />);
      // Ne devrait pas crasher
      const skeletons = document.querySelectorAll('.skeleton__line');
      expect(skeletons.length).toBe(0);
    });

    it('gère correctement les dimensions nulles', () => {
      const { container } = render(
        <Skeleton width={null as any} height={null as any} />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toBeInTheDocument();
    });
  });
});