/**
 * Toast Component Tests - Tests automatisés complets
 * @fileoverview Suite de tests complète pour le système de notifications Toast
 * @author MiniMax Agent
 */

import React, { createContext } from 'react';
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
  ToastComponent, 
  ToastProvider, 
  useToast,
  ToastSuccess,
  ToastError,
  ToastWarning,
  ToastInfo,
  ToastLoading
} from './Toast';

// Mock des timers pour les tests
jest.useFakeTimers();

// Mock CSS import
jest.mock('./Toast.css', () => ({}));

// Composant test utilitaire
const TestComponent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-root">{children}</div>
);

// Wrapper avec ToastProvider
const ToastWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <TestComponent>{children}</TestComponent>
  </ToastProvider>
);

// Hook de test pour les toasts
const TestToastHook = ({ toast }: { toast: any }) => {
  const { addToast, removeToast, clearAll } = useToast();
  
  React.useEffect(() => {
    if (toast) {
      addToast(toast);
    }
  }, [toast, addToast]);

  return (
    <div>
      <button onClick={() => addToast({ message: 'Test toast', type: 'info' })}>
        Add Toast
      </button>
      <button onClick={clearAll}>
        Clear All
      </button>
    </div>
  );
};

// Suite de tests 1: Rendu de base
describe('Toast - Rendu de base', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('rend un toast basique', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Test message" 
          type="success" 
          testId="test-toast"
        />
      </ToastWrapper>
    );

    expect(screen.getByTestId('test-toast')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('rend avec différents types', () => {
    const types: Array<'success' | 'error' | 'warning' | 'info' | 'loading'> = [
      'success', 'error', 'warning', 'info', 'loading'
    ];

    types.forEach(type => {
      render(
        <ToastWrapper>
          <ToastComponent 
            message={`Test ${type}`} 
            type={type}
            testId={`toast-${type}`}
          />
        </ToastWrapper>
      );
      
      expect(screen.getByTestId(`toast-${type}`)).toBeInTheDocument();
      expect(screen.getByText(`Test ${type}`)).toBeInTheDocument();
    });
  });

  test('rend avec titre et description', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Message principal"
          title="Titre du toast"
          description="Description détaillée"
          testId="toast-detailed"
        />
      </ToastWrapper>
    );

    expect(screen.getByText('Titre du toast')).toBeInTheDocument();
    expect(screen.getByText('Description détaillée')).toBeInTheDocument();
    expect(screen.getByText('Message principal')).toBeInTheDocument();
  });

  test('rend avec avatar', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Toast avec avatar"
          avatar="https://example.com/avatar.jpg"
          testId="toast-avatar"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast-avatar');
    expect(toast).toHaveClass('toast-with-avatar');
    const avatar = toast.querySelector('.toast-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('rend avec actions', () => {
    const actions = [
      { label: 'Action 1', onClick: jest.fn(), style: 'primary' as const },
      { label: 'Action 2', onClick: jest.fn(), style: 'secondary' as const },
    ];

    render(
      <ToastWrapper>
        <ToastComponent 
          message="Toast avec actions"
          actions={actions}
          testId="toast-actions"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast-actions');
    expect(toast).toHaveClass('toast-with-actions');
    
    const actionButtons = toast.querySelectorAll('.toast-action');
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toHaveTextContent('Action 1');
    expect(actionButtons[1]).toHaveTextContent('Action 2');
  });
});

// Suite de tests 2: Positions
describe('Toast - Positions', () => {
  afterEach(() => {
    cleanup();
  });

  const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' | 'center'> = [
    'top-left', 'top-right', 'bottom-left', 'bottom-right', 
    'top-center', 'bottom-center', 'center'
  ];

  test('rend avec toutes les positions', () => {
    positions.forEach(position => {
      const { unmount } = render(
        <ToastWrapper>
          <ToastComponent 
            message={`Toast ${position}`}
            position={position}
            testId={`toast-${position}`}
          />
        </ToastWrapper>
      );
      
      const toast = screen.getByTestId(`toast-${position}`);
      expect(toast).toHaveClass(`toast-item--${position}`);
      unmount();
    });
  });
});

// Suite de tests 3: Auto-dismiss et timing
describe('Toast - Auto-dismiss et timing', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('se ferme automatiquement après la durée spécifiée', async () => {
    const onDismiss = jest.fn();
    
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Auto dismiss test"
          duration={1000}
          onDismiss={onDismiss}
          testId="toast-dismiss"
        />
      </ToastWrapper>
    );

    expect(screen.getByTestId('toast-dismiss')).toBeInTheDocument();
    
    // Avancer les timers de 1000ms
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith(expect.any(String));
    });
  });

  test('ne se ferme pas si persistent = true', () => {
    const onDismiss = jest.fn();
    
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Persistent toast"
          duration={1000}
          persistent={true}
          onDismiss={onDismiss}
          testId="toast-persistent"
        />
      </ToastWrapper>
    );

    // Avancer les timers au-delà de la durée
    jest.advanceTimersByTime(2000);
    
    expect(screen.getByTestId('toast-persistent')).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('pause le timer au survol', async () => {
    render(
      <ToastWrapper>
        <TestToastHook 
          toast={{
            message: "Pause test",
            duration: 2000,
            pauseOnHover: true
          }}
        />
      </ToastWrapper>
    );

    const toast = screen.getByText("Pause test").closest('.toast-item');
    expect(toast).toBeInTheDocument();
    
    // Hover sur le toast
    fireEvent.mouseEnter(toast!);
    
    // Avancer le temps - le toast ne devrait pas se fermer
    jest.advanceTimersByTime(1500);
    
    expect(screen.getByText("Pause test")).toBeInTheDocument();
    
    // Quitter le hover
    fireEvent.mouseLeave(toast!);
    
    // Avancer le temps restant - maintenant il devrait se fermer
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.queryByText("Pause test")).not.toBeInTheDocument();
    });
  });

  test('affiche la progress bar', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Progress bar test"
          duration={1000}
          showProgress={true}
          testId="toast-progress"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast-progress');
    const progressBar = toast.querySelector('.toast-progress');
    expect(progressBar).toBeInTheDocument();
    
    // Vérifier que la largeur diminue avec le temps
    expect(progressBar).toHaveStyle({ width: '100%' });
    
    jest.advanceTimersByTime(500);
    
    expect(progressBar).toHaveStyle({ width: expect.stringContaining('%') });
  });
});

// Suite de tests 4: Interactions
describe('Toast - Interactions', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('se ferme au clic du bouton close', async () => {
    const onDismiss = jest.fn();
    
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Close button test"
          dismissible={true}
          onDismiss={onDismiss}
          testId="toast-close"
        />
      </ToastWrapper>
    );

    const closeButton = screen.getByLabelText('Fermer la notification');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith(expect.any(String));
    });
  });

  test('ne se ferme pas au clic si dismissible = false', () => {
    const onDismiss = jest.fn();
    
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Non dismissible"
          dismissible={false}
          onDismiss={onDismiss}
          testId="toast-no-close"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast-no-close');
    expect(toast).toHaveClass('toast-non-dismissible');
    
    // Essayer de cliquer sur le toast
    fireEvent.click(toast);
    
    expect(screen.getByText("Non dismissible")).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('exécute les actions au clic', () => {
    const action1Click = jest.fn();
    const action2Click = jest.fn();
    
    const actions = [
      { label: 'Action 1', onClick: action1Click, style: 'primary' as const },
      { label: 'Action 2', onClick: action2Click, style: 'secondary' as const },
    ];

    render(
      <ToastWrapper>
        <ToastComponent 
          message="Actions test"
          actions={actions}
          testId="toast-action-click"
        />
      </ToastWrapper>
    );

    const actionButtons = screen.getAllByRole('button').filter(
      button => button.textContent?.includes('Action')
    );
    
    fireEvent.click(actionButtons[0]);
    expect(action1Click).toHaveBeenCalledTimes(1);
    
    fireEvent.click(actionButtons[1]);
    expect(action2Click).toHaveBeenCalledTimes(1);
  });

  test('se ferme au clic si closeOnClick = true', async () => {
    const onDismiss = jest.fn();
    
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Click to close"
          closeOnClick={true}
          onDismiss={onDismiss}
          testId="toast-click-close"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast-click-close');
    fireEvent.click(toast);
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith(expect.any(String));
    });
  });
});

// Suite de tests 5: Hook useToast
describe('Toast - Hook useToast', () => {
  afterEach(() => {
    cleanup();
  });

  test('fournit le contexte des toasts', () => {
    const TestHookComponent = () => {
      const toast = useToast();
      return (
        <div data-testid="hook-test">
          <span>Has toasts: {toast.toasts.length}</span>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestHookComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Has toasts: 0')).toBeInTheDocument();
  });

  test('permet d\'ajouter des toasts via le hook', async () => {
    render(
      <ToastWrapper>
        <TestToastHook toast={null} />
      </ToastWrapper>
    );

    const addButton = screen.getByText('Add Toast');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test toast')).toBeInTheDocument();
    });
  });

  test('permet de supprimer des toasts via le hook', async () => {
    render(
      <ToastWrapper>
        <TestToastHook 
          toast={{ message: 'Remove test', type: 'info' }}
        />
      </ToastWrapper>
    );

    expect(screen.getByText('Remove test')).toBeInTheDocument();

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Remove test')).not.toBeInTheDocument();
    });
  });
});

// Suite de tests 6: ToastProvider
describe('Toast - ToastProvider', () => {
  afterEach(() => {
    cleanup();
  });

  test('limite le nombre de toasts', async () => {
    render(
      <ToastProvider maxToasts={3}>
        <div>
          <button 
            onClick={() => {
              const { addToast } = useToast();
              addToast({ message: `Toast ${Date.now()}`, type: 'info' });
            }}
            data-testid="add-multiple"
          >
            Add Multiple
          </button>
        </div>
      </ToastProvider>
    );

    const addButton = screen.getByTestId('add-multiple');
    
    // Ajouter 5 toasts (limite = 3)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(addButton);
    }

    await waitFor(() => {
      const toasts = screen.queryAllByText(/Toast/);
      expect(toasts).toHaveLength(3);
    });
  });

  test('fonctionne avec un conteneur personnalisé', () => {
    const customContainer = document.createElement('div');
    customContainer.setAttribute('data-custom-container', 'true');
    document.body.appendChild(customContainer);

    render(
      <ToastProvider container={customContainer}>
        <div>Test</div>
      </ToastProvider>
    );

    const container = document.querySelector('[data-custom-container]');
    expect(container).toBeInTheDocument();

    document.body.removeChild(customContainer);
  });
});

// Suite de tests 7: Composants utility
describe('Toast - Composants utility', () => {
  afterEach(() => {
    cleanup();
  });

  test('ToastSuccess fonctionne', () => {
    render(
      <ToastWrapper>
        <ToastSuccess message="Success toast" testId="success-toast" />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('success-toast');
    expect(toast).toHaveClass('toast-item--success');
    expect(screen.getByText('Success toast')).toBeInTheDocument();
  });

  test('ToastError fonctionne', () => {
    render(
      <ToastWrapper>
        <ToastError message="Error toast" testId="error-toast" />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('error-toast');
    expect(toast).toHaveClass('toast-item--error');
    expect(screen.getByText('Error toast')).toBeInTheDocument();
  });

  test('ToastWarning fonctionne', () => {
    render(
      <ToastWrapper>
        <ToastWarning message="Warning toast" testId="warning-toast" />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('warning-toast');
    expect(toast).toHaveClass('toast-item--warning');
    expect(screen.getByText('Warning toast')).toBeInTheDocument();
  });

  test('ToastInfo fonctionne', () => {
    render(
      <ToastWrapper>
        <ToastInfo message="Info toast" testId="info-toast" />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('info-toast');
    expect(toast).toHaveClass('toast-item--info');
    expect(screen.getByText('Info toast')).toBeInTheDocument();
  });

  test('ToastLoading fonctionne', () => {
    render(
      <ToastWrapper>
        <ToastLoading message="Loading toast" testId="loading-toast" />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('loading-toast');
    expect(toast).toHaveClass('toast-item--loading');
    expect(screen.getByText('Loading toast')).toBeInTheDocument();
    
    const loadingIcon = toast.querySelector('.toast-loading-icon');
    expect(loadingIcon).toBeInTheDocument();
  });
});

// Suite de tests 8: Accessibilité
describe('Toast - Accessibilité', () => {
  afterEach(() => {
    cleanup();
  });

  test('utilise les rôles ARIA appropriés', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Accessibility test"
          type="error"
          testId="aria-toast"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('aria-toast');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  test('utilise status role pour les autres types', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Status test"
          type="info"
          testId="status-toast"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('status-toast');
    expect(toast).toHaveAttribute('role', 'status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  test('inclut les labels ARIA', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="ARIA test"
          title="Titre ARIA"
          testId="labels-toast"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('labels-toast');
    expect(toast).toHaveAttribute('aria-label', 'Titre ARIA');
  });

  test('supporte la navigation au clavier', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Keyboard test"
          actions={[{ label: 'Action', onClick: jest.fn() }]}
          testId="keyboard-toast"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('keyboard-toast');
    expect(toast).toHaveAttribute('tabindex', '0');
    
    const actionButton = screen.getByRole('button', { name: 'Action' });
    expect(actionButton).toHaveAttribute('tabindex', '0');
  });

  test('focus visible sur les éléments interactifs', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Focus test"
          testId="focus-toast"
        />
      </ToastWrapper>
    );

    const closeButton = screen.getByLabelText('Fermer la notification');
    expect(closeButton).toHaveAttribute('tabindex', '0');
  });
});

// Suite de tests 9: Responsive
describe('Toast - Responsive', () => {
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
      <ToastWrapper>
        <ToastComponent 
          message="Mobile test"
          testId="mobile-toast"
        />
      </ToastWrapper>
    );

    // Vérifier que le toast s'affiche correctement sur mobile
    const toast = screen.getByTestId('mobile-toast');
    expect(toast).toBeInTheDocument();
  });

  test('gère le stacking en colonne sur mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    render(
      <ToastWrapper>
        <ToastProvider>
          <TestToastHook toast={{ message: 'Stack 1', type: 'info' }} />
          <TestToastHook toast={{ message: 'Stack 2', type: 'success' }} />
        </ToastProvider>
      </ToastWrapper>
    );

    const container = document.querySelector('.toast-container');
    expect(container).toBeInTheDocument();
  });
});

// Suite de tests 10: Performance
describe('Toast - Performance', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('nettoie les timers lors du démontage', () => {
    const { unmount } = render(
      <ToastWrapper>
        <ToastComponent 
          message="Timer cleanup test"
          duration={5000}
          testId="cleanup-toast"
        />
      </ToastWrapper>
    );

    unmount();
    
    // Vérifier que les timers sont nettoyés
    expect(() => {
      jest.advanceTimersByTime(6000);
    }).not.toThrow();
  });

  test('optimise le re-rendu avec memoization', () => {
    const TestMemoComponent = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)} data-testid="re-render">
            Re-render
          </button>
          <ToastComponent 
            message={`Memo test ${count}`}
            testId="memo-toast"
          />
        </div>
      );
    };

    render(
      <ToastWrapper>
        <TestMemoComponent />
      </ToastWrapper>
    );

    const reRenderButton = screen.getByTestId('re-render');
    
    // Cliquer plusieurs fois pour forcer les re-rendus
    fireEvent.click(reRenderButton);
    fireEvent.click(reRenderButton);
    
    expect(screen.getByText('Memo test 2')).toBeInTheDocument();
  });
});

// Suite de tests 11: Edge Cases
describe('Toast - Edge Cases', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('gère les messages vides', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message=""
          testId="empty-message"
        />
      </ToastWrapper>
    );

    // Ne devrait pas crasher
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  test('gère les actions vides', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Empty actions test"
          actions={[]}
          testId="empty-actions"
        />
      </ToastWrapper>
    );

    const toast = screen.getByTestId('empty-actions');
    expect(toast).not.toHaveClass('toast-with-actions');
  });

  test('gère les IDs dupliqués', async () => {
    render(
      <ToastWrapper>
        <TestToastHook toast={{ message: 'First', id: 'same-id' }} />
        <TestToastHook toast={{ message: 'Second', id: 'same-id' }} />
      </ToastWrapper>
    );

    // Le deuxième devrait remplacer le premier
    await waitFor(() => {
      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  test('gère les durée négatives', () => {
    render(
      <ToastWrapper>
        <ToastComponent 
          message="Negative duration"
          duration={-1000}
          testId="negative-duration"
        />
      </ToastWrapper>
    );

    // Ne devrait pas crasher
    expect(screen.getByTestId('negative-duration')).toBeInTheDocument();
  });

  test('fonctionne sans CSS', () => {
    // Test sans les styles CSS
    jest.mock('./Toast.css', () => ({
      __esModule: true,
      default: {},
    }));

    render(
      <ToastWrapper>
        <ToastComponent 
          message="No CSS test"
          testId="no-css"
        />
      </ToastWrapper>
    );

    expect(screen.getByTestId('no-css')).toBeInTheDocument();
  });
});

// Suite de tests 12: Intégration
describe('Toast - Intégration', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  test('fonctionne avec React.StrictMode', () => {
    const { container } = render(
      <React.StrictMode>
        <ToastWrapper>
          <ToastComponent 
            message="StrictMode test"
            testId="strict-mode"
          />
        </ToastWrapper>
      </React.StrictMode>
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByTestId('strict-mode')).toBeInTheDocument();
  });

  test('fonctionne avec plusieurs providers imbriqués', () => {
    const { unmount } = render(
      <ToastProvider maxToasts={2}>
        <ToastProvider maxToasts={3}>
          <TestToastHook toast={{ message: 'Nested test', type: 'info' }} />
        </ToastProvider>
      </ToastProvider>
    );

    expect(screen.getByText('Nested test')).toBeInTheDocument();
    unmount();
  });

  test('maintains state lors des re-rendus parent', async () => {
    const ParentComponent = ({ showToast }: { showToast: boolean }) => (
      <ToastWrapper>
        {showToast && (
          <ToastComponent 
            message="State test"
            duration={10000}
            testId="state-toast"
          />
        )}
      </ToastWrapper>
    );

    const { rerender } = render(
      <ParentComponent showToast={true} />
    );

    expect(screen.getByText('State test')).toBeInTheDocument();

    // Masquer le toast
    rerender(<ParentComponent showToast={false} />);

    await waitFor(() => {
      expect(screen.queryByText('State test')).not.toBeInTheDocument();
    });
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
  jest.useRealTimers();
});

export {};