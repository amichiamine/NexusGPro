import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Avatar } from './Avatar';

/**
 * Tests exhaustifs pour le composant Avatar
 * Couverture de toutes les props, tailles, gestion d'erreurs et accessibilité
 */
describe('Avatar', () => {
  // === TESTS DE RENDU DE BASE ===
  describe('Rendu de base', () => {
    it('rend correctement un avatar avec des initiales', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByText('JD');
      expect(avatar).toBeInTheDocument();
      expect(avatar.closest('.avatar')).toHaveClass('avatar', 'avatar--md');
    });

    it('utilise le nom par défaut quand non fourni', () => {
      render(<Avatar />);
      const avatar = screen.getByText('NG');
      expect(avatar).toBeInTheDocument();
    });

    it('rend une image quand src est fourni', () => {
      render(<Avatar src="/avatar.jpg" name="Alice Martin" />);
      const img = screen.getByAltText('Avatar de Alice Martin');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/avatar.jpg');
    });

    it('génère les initiales correctement à partir du nom', () => {
      render(<Avatar name="Marie-Claire Dubois" />);
      const avatar = screen.getByText('MD');
      expect(avatar).toBeInTheDocument();
    });

    it('traite les noms avec des espaces multiples', () => {
      render(<Avatar name="Jean   Pierre   Martin" />);
      const avatar = screen.getByText('JP');
      expect(avatar).toBeInTheDocument();
    });

    it('traite les noms vides', () => {
      render(<Avatar name="" />);
      const avatar = screen.getByText('NG');
      expect(avatar).toBeInTheDocument();
    });

    it('traite les noms avec seulement des espaces', () => {
      render(<Avatar name="   " />);
      const avatar = screen.getByText('NG');
      expect(avatar).toBeInTheDocument();
    });
  });

  // === TESTS DES TAILLES ===
  describe('Tailles', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    sizes.forEach(size => {
      it(`rend correctement avec la taille ${size}`, () => {
        const { container } = render(<Avatar name="Test" size={size} />);
        const avatar = container.firstChild as HTMLElement;
        expect(avatar).toHaveClass(`avatar--${size}`);
      });
    });

    it('applique une taille personnalisée', () => {
      const { container } = render(<Avatar name="Test" customSize={80} />);
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveStyle({ width: '80px', height: '80px' });
    });
  });

  // === TESTS DES STATUTS ===
  describe('Statuts', () => {
    const statuses: Array<'online' | 'offline' | 'away' | 'busy'> = ['online', 'offline', 'away', 'busy'];

    statuses.forEach(status => {
      it(`affiche un statut ${status}`, () => {
        const { container } = render(
          <Avatar name="Test" status={status} showStatus />
        );
        const statusElement = container.querySelector('.avatar__status');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveAttribute('aria-label', `Statut: ${status}`);
      });
    });

    it('n\'affiche pas de statut par défaut', () => {
      const { container } = render(<Avatar name="Test" />);
      const statusElement = container.querySelector('.avatar__status');
      expect(statusElement).not.toBeInTheDocument();
    });

    it('n\'affiche pas de statut quand showStatus est false', () => {
      const { container } = render(
        <Avatar name="Test" status="online" showStatus={false} />
      );
      const statusElement = container.querySelector('.avatar__status');
      expect(statusElement).not.toBeInTheDocument();
    });
  });

  // === TESTS DE GESTION D'ERREURS ===
  describe('Gestion d\'erreurs d\'image', () => {
    it('affiche les initiales quand l\'image ne se charge pas', () => {
      const handleError = vi.fn();
      const { container } = render(
        <Avatar 
          src="/nonexistent.jpg" 
          name="Error Test" 
          onImageError={handleError}
        />
      );
      
      const img = screen.getByAltText('Avatar de Error Test');
      fireEvent.error(img);
      
      expect(handleError).toHaveBeenCalled();
      expect(screen.getByText('ET')).toBeInTheDocument();
      expect(container.querySelector('.avatar__image')).not.toBeInTheDocument();
    });

    it('affiche les initiales quand l\'URL est vide', () => {
      render(<Avatar src="" name="Empty URL" />);
      expect(screen.getByText('EU')).toBeInTheDocument();
      expect(screen.queryByAltText(/Avatar/)).not.toBeInTheDocument();
    });

    it('affiche les initiales quand src est null', () => {
      render(<Avatar src={null as any} name="Null Source" />);
      expect(screen.getByText('NS')).toBeInTheDocument();
    });

    it('appelle onImageLoad quand l\'image se charge', () => {
      const handleLoad = vi.fn();
      render(
        <Avatar 
          src="/valid.jpg" 
          name="Load Test"
          onImageLoad={handleLoad}
        />
      );
      
      const img = screen.getByAltText('Avatar de Load Test');
      fireEvent.load(img);
      
      expect(handleLoad).toHaveBeenCalled();
    });
  });

  // === TESTS D'INTERACTIVITÉ ===
  describe('Interactivité', () => {
    it('est clickable avec onClick', () => {
      const handleClick = vi.fn();
      render(<Avatar name="Test" onClick={handleClick} />);
      
      const avatar = screen.getByText('Test').closest('.avatar') as HTMLElement;
      fireEvent.click(avatar);
      
      expect(handleClick).toHaveBeenCalled();
      expect(avatar).toHaveAttribute('type', 'button');
    });

    it('est clickable avec clickable prop', () => {
      render(<Avatar name="Test" clickable />);
      
      const avatar = screen.getByText('Test').closest('.avatar') as HTMLElement;
      expect(avatar.tagName).toBe('BUTTON');
    });

    it('n\'est pas clickable par défaut', () => {
      render(<Avatar name="Test" />);
      
      const avatar = screen.getByText('Test').closest('.avatar');
      expect(avatar?.tagName).toBe('DIV');
    });
  });

  // === TESTS D'ACCESSIBILITÉ ===
  describe('Accessibilité (WCAG)', () => {
    it('a un aria-label approprié pour l\'image', () => {
      render(<Avatar src="/avatar.jpg" name="John Doe" />);
      const img = screen.getByAltText('Avatar de John Doe');
      expect(img).toHaveAttribute('aria-label', 'Avatar de John Doe');
    });

    it('a un aria-label approprié pour les initiales', () => {
      render(<Avatar name="Jane Smith" />);
      const avatar = screen.getByText('JS');
      expect(avatar.closest('.avatar')).toHaveAttribute(
        'aria-label',
        'Avatar avec initiales de Jane Smith'
      );
    });

    it('utilise un aria-label personnalisé', () => {
      render(<Avatar name="Test" aria-label="Utilisateur personnalisé" />);
      const avatar = screen.getByText('Test').closest('.avatar');
      expect(avatar).toHaveAttribute('aria-label', 'Utilisateur personnalisé');
    });

    it('a le rôle button quand clickable', () => {
      render(<Avatar name="Test" clickable />);
      const avatar = screen.getByText('Test').closest('.avatar');
      expect(avatar).toHaveAttribute('role', 'button');
    });

    it('supporte tabIndex personnalisé', () => {
      const { container } = render(<Avatar name="Test" tabIndex={-1} />);
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('tabindex', '-1');
    });
  });

  // === TESTS DE CLASSES CSS ===
  describe('Classes CSS', () => {
    it('applique les classes de base', () => {
      const { container } = render(<Avatar name="Test" />);
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('avatar', 'avatar--md');
    });

    it('applique les classes d\'état', () => {
      const { container } = render(
        <Avatar name="Test" clickable className="custom-class" />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('avatar', 'avatar--clickable', 'custom-class');
    });

    it('applique les classes d\'image', () => {
      const { container } = render(
        <Avatar src="/test.jpg" name="Image Test" />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('avatar--has-image');
    });
  });

  // === TESTS DES PROPS ET ÉVÉNEMENTS ===
  describe('Props et événements', () => {
    it('passe les props HTML restantes', () => {
      const { container } = render(
        <Avatar 
          name="Test"
          id="test-avatar"
          data-testid="avatar"
          title="Avatar tooltip"
        />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('id', 'test-avatar');
      expect(avatar).toHaveAttribute('title', 'Avatar tooltip');
    });

    it('supporte les clés React', () => {
      const { rerender } = render(<Avatar name="Test" key="avatar-1" />);
      rerender(<Avatar name="Updated" key="avatar-2" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  // === TESTS DE PERFORMANCE ===
  describe('Performance', () => {
    it('re-rend seulement quand les props changent', () => {
      const { rerender } = render(<Avatar name="Test" size="md" />);
      const avatar1 = screen.getByText('Test').closest('.avatar');
      
      rerender(<Avatar name="Test" size="md" />); // Pas de changement
      const avatar2 = screen.getByText('Test').closest('.avatar');
      
      expect(avatar1).toBe(avatar2); // Même élément DOM
    });

    it('re-rend quand la source change', () => {
      const { rerender } = render(<Avatar name="Test" src="/old.jpg" />);
      rerender(<Avatar name="Test" src="/new.jpg" />);
      const img = screen.getByAltText('Avatar de Test');
      expect(img).toHaveAttribute('src', '/new.jpg');
    });
  });

  // === TESTS D'INTÉGRATION ===
  describe('Intégration', () => {
    it('fonctionne dans un contexte React.StrictMode', () => {
      const { container } = render(
        <React.StrictMode>
          <Avatar name="Test" />
        </React.StrictMode>
      );
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('fonctionne avec plusieurs avatars', () => {
      render(
        <div>
          <Avatar name="User 1" />
          <Avatar name="User 2" size="lg" />
          <Avatar name="User 3" src="/avatar.jpg" />
        </div>
      );
      expect(screen.getByText('U1')).toBeInTheDocument();
      expect(screen.getByText('U2')).toBeInTheDocument();
      expect(screen.getByAltText(/Avatar de User 3/)).toBeInTheDocument();
    });
  });

  // === TESTS DE RÉGRESSION ===
  describe('Tests de régression', () => {
    it('ne cause pas de warnings React', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Avatar name="Test" />);
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('supporte les propriétés du DOM', () => {
      const { container } = render(
        <Avatar 
          name="Test"
          id="test-avatar"
          className="test-class"
          style={{ backgroundColor: 'red' }}
        />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('id', 'test-avatar');
      expect(avatar).toHaveClass('test-class');
      expect(avatar).toHaveStyle({ backgroundColor: 'red' });
    });

    it('gère correctement les initiales avec caractères spéciaux', () => {
      render(<Avatar name="José María García-López" />);
      const avatar = screen.getByText('JM');
      expect(avatar).toBeInTheDocument();
    });

    it('limite les initiales à 2 caractères', () => {
      render(<Avatar name="Very Long Name Here" />);
      const avatar = screen.getByText('VL');
      expect(avatar).toBeInTheDocument();
    });
  });
});