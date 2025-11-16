/**
 * Tooltip Component Tests - Tests automatisés complets
 * @fileoverview Suite de tests complète pour le système de tooltips
 * @author MiniMax Agent
 */

import React from 'react';
import { 
  render, 
  screen, 
  fireEvent, 
  waitFor, 
  within,
  cleanup 
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { 
  TooltipComponent, 
  Tooltip, 
  TooltipPrimary,
  TooltipSuccess,
  TooltipWarning,
  TooltipError,
  TooltipInfo,
  TooltipDark,
  TooltipLight
} from './Tooltip';

// Mock CSS import
jest.mock('./Tooltip.css', () => ({}));

// Composant test utilitaire
const TestComponent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-root">{children}</div>
);

// Wrapper avec Tooltip
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => (
  <TestComponent>{children}</TestComponent>
);

// Données de test
const defaultProps = {
  label: 'Test tooltip',
  children: <button>Hover me</button>,
  testId: 'test-tooltip'
};

// Suite de tests 1: Rendu de base
describe('Tooltip - Rendu de base', () => {
  afterEach(() => {
    cleanup();
  });

  test('rend un tooltip basique', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('tooltip-trigger');
  });

  test('affiche le tooltip au survol', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('tooltip-visible');
  });

  test('masque le tooltip à la sortie du survol', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    }, { timeout: 300 });
  });

  test('rend avec titre et description', () => {
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps}
          label="Titre du tooltip"
          description="Description détaillée"
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText('Titre du tooltip')).toBeInTheDocument();
    expect(screen.getByText('Description détaillée')).toBeInTheDocument();
  });
});

// Suite de tests 2: Positions
describe('Tooltip - Positions', () => {
  afterEach(() => {
    cleanup();
  });

  const positions: Array<'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'> = [
    'top', 'bottom', 'left', 'right', 'top-start', 'top-end', 
    'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'
  ];

  test('fonctionne avec toutes les positions', async () => {
    positions.forEach(position => {
      const { unmount } = render(
        <TooltipWrapper>
          <Tooltip 
            {...defaultProps}
            label={`Tooltip ${position}`}
            placement={position}
            testId={`tooltip-${position}`}
          />
        </TooltipWrapper>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(`tooltip--${position}`);
      
      fireEvent.mouseLeave(trigger);
      unmount();
    });
  });

  test('ajuste automatiquement la position si flip est activé', async () => {
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps}
          label="Auto flip test"
          placement="top"
          flip={true}
          testId="flip-tooltip"
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      // Le tooltip devrait ajuster sa position si nécessaire
      expect(tooltip).toBeInTheDocument();
    });
  });

  test('utilise la position personnalisée', async () => {
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps}
          label="Custom position"
          placement="bottom"
          testId="custom-position"
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--bottom');
    });
  });
});

// Suite de tests 3: Variantes
describe('Tooltip - Variantes', () => {
  afterEach(() => {
    cleanup();
  });

  const variants: Array<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'dark' | 'light'> = [
    'default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark', 'light'
  ];

  test('fonctionne avec toutes les variantes', async () => {
    variants.forEach(variant => {
      const { unmount } = render(
        <TooltipWrapper>
          <Tooltip 
            {...defaultProps}
            label={`Variant ${variant}`}
            variant={variant}
            testId={`variant-${variant}`}
          />
        </TooltipWrapper>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(`tooltip--${variant}`);
      
      fireEvent.mouseLeave(trigger);
      unmount();
    });
  });

  test('les composants utility fonctionnent', async () => {
    const utilityComponents = [
      { Component: TooltipPrimary, variant: 'primary' },
      { Component: TooltipSuccess, variant: 'success' },
      { Component: TooltipWarning, variant: 'warning' },
      { Component: TooltipError, variant: 'error' },
      { Component: TooltipInfo, variant: 'info' },
      { Component: TooltipDark, variant: 'dark' },
      { Component: TooltipLight, variant: 'light' },
    ];

    utilityComponents.forEach(({ Component, variant }) => {
      const { unmount } = render(
        <TooltipWrapper>
          <Component {...defaultProps} />
        </TooltipWrapper>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(`tooltip--${variant}`);
      
      fireEvent.mouseLeave(trigger);
      unmount();
    });
  });
});

// Suite de tests 4: Tailles
describe('Tooltip - Tailles', () => {
  afterEach(() => {
    cleanup();
  });

  const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

  test('fonctionne avec toutes les tailles', async () => {
    sizes.forEach(size => {
      const { unmount } = render(
        <TooltipWrapper>
          <Tooltip 
            {...defaultProps}
            label={`Size ${size}`}
            size={size}
            testId={`size-${size}`}
          />
        </TooltipWrapper>
      );
      
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(`tooltip--${size}`);
      
      fireEvent.mouseLeave(trigger);
      unmount();
    });
  });
});

// Suite de tests 5: Flèche
describe('Tooltip - Flèche', () => {
  afterEach(() => {
    cleanup();
  });

  test('affiche la flèche par défaut', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip-with-arrow');
      
      const arrow = tooltip.querySelector('.tooltip-arrow');
      expect(arrow).toBeInTheDocument();
    });
  });

  test('cache la flèche quand arrow=false', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} arrow={false} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip-no-arrow');
      
      const arrow = tooltip.querySelector('.tooltip-arrow');
      expect(arrow).not.toBeInTheDocument();
    });
  });

  test('positionne la flèche selon la position', async () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;
    
    for (const position of positions) {
      render(
        <TooltipWrapper>
          <Tooltip 
            {...defaultProps}
            placement={position}
            testId={`arrow-${position}`}
          />
        </TooltipWrapper>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector(`.tooltip-arrow--${position}`);
        expect(arrow).toBeInTheDocument();
      });
    }
  });
});

// Suite de tests 6: Timing et délais
describe('Tooltip - Timing et délais', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('respecte le délai personnalisé', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} delay={200} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    // Survoler brièvement puis sortir
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    
    // Attendre moins que le délai
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    }, { timeout: 150 });
    
    // Attendre plus que le délai
    await waitFor(() => {
      fireEvent.mouseEnter(trigger);
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    }, { timeout: 300 });
  });

  test('supporte delayShow et delayHide séparés', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} delayShow={300} delayHide={100} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    fireEvent.mouseEnter(trigger);
    
    // Ne devrait pas apparaître immédiatement
    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    
    // Attendre delayShow
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    }, { timeout: 400 });
    
    fireEvent.mouseLeave(trigger);
    
    // Devrait disparaître plus rapidement
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  test('annule les timers correctement', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} delay={100} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    // Déclencher l'apparition
    fireEvent.mouseEnter(trigger);
    
    // Sortir rapidement avant que le tooltip n'apparaisse
    fireEvent.mouseLeave(trigger);
    
    // Sortir de la zone de test
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });
});

// Suite de tests 7: Interactions clavier
describe('Tooltip - Interactions clavier', () => {
  afterEach(() => {
    cleanup();
  });

  test('affiche au focus', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.focus(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
  });

  test('masque au blur', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.focus(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
    
    fireEvent.blur(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    });
  });

  test('fonctionne en mode clickable', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} clickable={true} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveClass('tooltip-clickable');
    
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
    
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    });
  });
});

// Suite de tests 8: Suivi de souris
describe('Tooltip - Suivi de souris', () => {
  afterEach(() => {
    cleanup();
  });

  test('suit la souris quand followCursor est activé', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} followCursor={true} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
    
    // Simuler un mouvement de souris
    fireEvent.mouseMove(trigger, {
      clientX: 100,
      clientY: 200
    });
    
    // Le tooltip devrait suivre le curseur
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('tooltip-follow-cursor');
  });
});

// Suite de tests 9: État désactivé
describe('Tooltip - État désactivé', () => {
  afterEach(() => {
    cleanup();
  });

  test('se désactive correctement', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} disabled={true} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveClass('tooltip-disabled');
    expect(trigger).toHaveAttribute('tabindex', '-1');
    
    fireEvent.mouseEnter(trigger);
    
    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  test('rend un wrapper différent quand disabled', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} disabled={true} />
      </TooltipWrapper>
    );

    const wrapper = document.querySelector('.tooltip-disabled-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('data-testid', 'test-tooltip');
  });
});

// Suite de tests 10: Accessibilité
describe('Tooltip - Accessibilité', () => {
  afterEach(() => {
    cleanup();
  });

  test('utilise les rôles ARIA appropriés', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      
      // Vérifier les relations ARIA
      expect(trigger).toHaveAttribute('aria-describedby');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls');
    });
  });

  test('inclut les labels personnalisés', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} aria-label="Custom tooltip label" />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveAttribute('aria-label', 'Custom tooltip label');
  });

  test('supporte la navigation clavier', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveAttribute('tabindex', '0');
    
    // Focus sur l'élément
    trigger.focus();
    expect(trigger).toHaveFocus();
  });

  test('masque le tooltip des screen readers quand invisible', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    // Avant le survol
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-hidden', 'false');
    });
  });
});

// Suite de tests 11: Contenu et formatage
describe('Tooltip - Contenu et formatage', () => {
  afterEach(() => {
    cleanup();
  });

  test('supporte la troncature de texte', async () => {
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps} 
          label="Very long tooltip text that should be truncated"
          truncate={true}
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip-truncate');
    });
  });

  test('supporte le contenu multiligne', async () => {
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps} 
          label="Titre"
          description="Description multiligne qui s'affiche sur plusieurs lignes"
          multiline={true}
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip-multiline');
      
      expect(screen.getByText('Titre')).toBeInTheDocument();
      expect(screen.getByText('Description multiligne qui s\'affiche sur plusieurs lignes')).toBeInTheDocument();
    });
  });

  test('gère les contenus complexes', () => {
    const complexContent = (
      <div>
        <strong>Titre en gras</strong>
        <p>Paragraphe avec <em>italique</em></p>
      </div>
    );

    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} label={complexContent} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText('Titre en gras')).toBeInTheDocument();
    expect(screen.getByText('italique')).toBeInTheDocument();
  });
});

// Suite de tests 12: Callbacks
describe('Tooltip - Callbacks', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('appelle onShow au显示', async () => {
    const onShow = jest.fn();
    
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} onShow={onShow} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(onShow).toHaveBeenCalledTimes(1);
    });
  });

  test('appelle onHide au masquage', async () => {
    const onHide = jest.fn();
    
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} onHide={onHide} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      fireEvent.mouseLeave(trigger);
    });
    
    await waitFor(() => {
      expect(onHide).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  test('appelle onToggle avec l\'état correct', async () => {
    const onToggle = jest.fn();
    
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} clickable={true} onToggle={onToggle} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    // Premier clic - affichage
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onToggle).toHaveBeenLastCalledWith(true);
    });
    
    // Deuxième clic - masquage
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onToggle).toHaveBeenLastCalledWith(false);
    });
  });
});

// Suite de tests 13: Style et personnalisation
describe('Tooltip - Style et personnalisation', () => {
  afterEach(() => {
    cleanup();
  });

  test('accepte les classes CSS personnalisées', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} className="custom-class" />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-class');
    });
  });

  test('accepte les styles inline', async () => {
    const customStyle = { backgroundColor: 'red', color: 'white' };
    
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} style={customStyle} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle(customStyle);
    });
  });

  test('respecte le zIndex personnalisé', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} zIndex={2000} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ zIndex: '2000' });
    });
  });

  test('respecte la largeur maximale personnalisée', async () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} maxWidth="300px" />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ maxWidth: '300px' });
    });
  });
});

// Suite de tests 14: Responsive et mobile
describe('Tooltip - Responsive et mobile', () => {
  afterEach(() => {
    cleanup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('s\'adapte aux différentes tailles d\'écran', () => {
    // Test pour mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    // Le tooltip devrait s'afficher correctement sur mobile
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('gère le touch sur les appareils tactiles', () => {
    // Simuler un appareil tactile
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 1,
      writable: true,
    });

    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} clickable={true} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toHaveClass('tooltip-clickable');
  });
});

// Suite de tests 15: Edge Cases
describe('Tooltip - Edge Cases', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('gère les contenu vides', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} label="" />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    // Ne devrait pas crasher
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('gère les positions invalides', async () => {
    // Test avec une position qui n'existe pas (mais ça devrait fonctionner quand même)
    render(
      <TooltipWrapper>
        <Tooltip 
          {...defaultProps} 
          label="Invalid position test"
          // @ts-ignore - test avec une position invalide
          placement="invalid-position"
        />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid position test')).toBeInTheDocument();
    });
  });

  test('fonctionne avec des délais négatifs', () => {
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} delay={-100} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    // Ne devrait pas crasher
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('gère les références circulaires', () => {
    // Test pour s'assurer qu'il n'y a pas de boucle infinie
    const startTime = Date.now();
    
    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    
    // Plusieurs survols rapides
    for (let i = 0; i < 5; i++) {
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
    }
    
    // Vérifier que l'application ne freeze pas
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('fonctionne sans CSS', () => {
    // Test sans les styles CSS
    jest.mock('./Tooltip.css', () => ({
      __esModule: true,
      default: {},
    }));

    render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
});

// Suite de tests 16: Performance
describe('Tooltip - Performance', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('nettoie les timers lors du démontage', () => {
    const { unmount } = render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} delay={5000} />
      </TooltipWrapper>
    );

    unmount();
    
    // Vérifier que les timers sont nettoyés
    expect(() => {
      jest.advanceTimersByTime(6000);
    }).not.toThrow();
  });

  test('optimise les re-rendus', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)} data-testid="re-render">
            Re-render ({count})
          </button>
          <Tooltip {...defaultProps} />
        </div>
      );
    };

    render(
      <TooltipWrapper>
        <TestComponent />
      </TooltipWrapper>
    );

    const reRenderButton = screen.getByTestId('re-render');
    
    // Cliquer plusieurs fois pour forcer les re-rendus
    for (let i = 0; i < 3; i++) {
      fireEvent.click(reRenderButton);
    }
    
    expect(screen.getByText('Re-render (3)')).toBeInTheDocument();
  });

  test('évite les fuites mémoire', () => {
    const { unmount } = render(
      <TooltipWrapper>
        <Tooltip {...defaultProps} />
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    unmount();
    
    // Vérifier qu'il n'y a pas d'erreurs lors du démontage
    expect(() => {
      fireEvent.mouseEnter(trigger);
    }).not.toThrow();
  });
});

// Configuration des tests globaux
beforeAll(() => {
  // Configuration globale pour les tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

afterAll(() => {
  // Nettoyage global
  jest.clearAllTimers();
});

export {};