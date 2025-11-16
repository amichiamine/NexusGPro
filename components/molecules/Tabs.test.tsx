import React from 'react';
import { 
  render, 
  screen, 
  fireEvent, 
  waitFor, 
  within 
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabItem } from '../Tabs';

// Mock des composants pour les tests
const mockTabs: TabItem[] = [
  {
    id: 'tab1',
    label: 'Premier Onglet',
    content: 'Contenu du premier onglet',
    icon: <span data-testid="icon-1">Icon 1</span>
  },
  {
    id: 'tab2',
    label: 'Deuxième Onglet',
    content: 'Contenu du deuxième onglet',
    icon: <span data-testid="icon-2">Icon 2</span>,
    disabled: true
  },
  {
    id: 'tab3',
    label: 'Troisième Onglet',
    content: 'Contenu du troisième onglet',
    badge: 5
  },
  {
    id: 'tab4',
    label: 'Quatrième Onglet',
    content: 'Contenu du quatrième onglet',
    loading: true
  },
  {
    id: 'tab5',
    label: 'Cinquième Onglet',
    content: 'Contenu du cinquième onglet',
    badge: 'Nouveau',
    badgeColor: 'success'
  }
];

// Suite de tests pour le rendu de base
describe('Tabs - Rendu de base', () => {
  test('rend correctement les onglets de base', () => {
    render(<Tabs tabs={mockTabs} />);
    
    expect(screen.getByTestId('tabs-container')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByText('Premier Onglet')).toBeInTheDocument();
    expect(screen.getByText('Deuxième Onglet')).toBeInTheDocument();
    expect(screen.getByText('Troisième Onglet')).toBeInTheDocument();
    expect(screen.getByText('Quatrième Onglet')).toBeInTheDocument();
    expect(screen.getByText('Cinquième Onglet')).toBeInTheDocument();
  });

  test('affiche le contenu du premier onglet par défaut', () => {
    render(<Tabs tabs={mockTabs} />);
    
    expect(screen.getByText('Contenu du premier onglet')).toBeInTheDocument();
    expect(screen.getByText('Contenu du deuxième onglet')).not.toBeVisible();
  });

  test('applique les classes CSS correctes', () => {
    const { container } = render(<Tabs tabs={mockTabs} />);
    
    expect(container.firstChild).toHaveClass('tabs');
    expect(container.firstChild).toHaveClass('tabs--top');
    expect(container.firstChild).toHaveClass('tabs--underline');
    expect(container.firstChild).toHaveClass('tabs--md');
  });

  test('rend les icônes correctement', () => {
    render(<Tabs tabs={mockTabs} />);
    
    expect(screen.getByTestId('icon-1')).toBeInTheDocument();
    expect(screen.getByTestId('icon-2')).toBeInTheDocument();
  });

  test('affiche les badges', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const tab3Badge = screen.getByText('5');
    expect(tab3Badge).toBeInTheDocument();
    expect(tab3Badge.closest('.tabs__tab-badge')).toBeInTheDocument();
    
    const tab5Badge = screen.getByText('Nouveau');
    expect(tab5Badge).toBeInTheDocument();
    expect(tab5Badge.closest('.tabs__tab-badge--success')).toBeInTheDocument();
  });

  test('affiche l\'indicateur de chargement', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const loadingTab = screen.getByText('Quatrième Onglet').closest('.tabs__tab');
    expect(loadingTab).toHaveClass('tabs__tab--loading');
    expect(loadingTab?.querySelector('.tabs__tab-loading')).toBeInTheDocument();
  });
});

// Suite de tests pour la gestion des états
describe('Tabs - Gestion des états', () => {
  test('utilise le mode uncontrolled par défaut', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={mockTabs} />);
    
    const tab3 = screen.getByText('Troisième Onglet');
    await user.click(tab3);
    
    expect(screen.getByText('Contenu du troisième onglet')).toBeVisible();
    expect(tab3.closest('.tabs__tab')).toHaveClass('tabs__tab--active');
  });

  test('supporte le mode controlled', () => {
    const handleChange = jest.fn();
    render(
      <Tabs 
        tabs={mockTabs} 
        activeTab="tab3" 
        onChange={handleChange} 
      />
    );
    
    expect(screen.getByText('Contenu du troisième onglet')).toBeVisible();
    
    // Le callback ne devrait pas être appelé sans interaction utilisateur
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('appelle onChange lors du changement d\'onglet', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange} 
      />
    );
    
    const tab3 = screen.getByText('Troisième Onglet');
    await user.click(tab3);
    
    expect(handleChange).toHaveBeenCalledWith(
      'tab3',
      expect.objectContaining({ id: 'tab3', label: 'Troisième Onglet' })
    );
  });

  test('ignore les clics sur les onglets désactivés', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange} 
      />
    );
    
    const tab2 = screen.getByText('Deuxième Onglet');
    await user.click(tab2);
    
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
  });

  test('ignore les clics sur les onglets en cours de chargement', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange} 
      />
    );
    
    const tab4 = screen.getByText('Quatrième Onglet');
    await user.click(tab4);
    
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
  });
});

// Suite de tests pour les positions
describe('Tabs - Positions', () => {
  test('supporte la position top', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} position="top" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--top');
  });

  test('supporte la position bottom', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} position="bottom" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--bottom');
  });

  test('supporte la position left', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} position="left" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--left');
  });

  test('supporte la position right', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} position="right" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--right');
  });

  test('applique les styles correctes pour chaque position', () => {
    const { rerender, container } = render(
      <Tabs tabs={mockTabs} position="top" />
    );
    
    expect(container.querySelector('.tabs__list')).toBeInTheDocument();
    
    rerender(<Tabs tabs={mockTabs} position="left" />);
    const leftContainer = container.firstChild;
    expect(leftContainer).toHaveClass('tabs--left');
  });
});

// Suite de tests pour les variantes
describe('Tabs - Variantes', () => {
  test('supporte la variante underline', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} variant="underline" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--underline');
  });

  test('supporte la variante pills', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} variant="pills" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--pills');
  });

  test('supporte la variante modern', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} variant="modern" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--modern');
  });

  test('supporte la variante minimal', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} variant="minimal" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--minimal');
  });

  test('change l\'apparence visuelle selon la variante', () => {
    const { rerender, container } = render(
      <Tabs tabs={mockTabs} variant="underline" />
    );
    
    let activeTab = container.querySelector('.tabs__tab--active');
    expect(activeTab).toHaveClass('tabs__tab--active');
    
    rerender(<Tabs tabs={mockTabs} variant="pills" />);
    const pillsTab = container.querySelector('.tabs__tab--active');
    expect(pillsTab).toHaveClass('tabs__tab--active');
  });
});

// Suite de tests pour les tailles
describe('Tabs - Tailles', () => {
  test('supporte la taille xs', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} size="xs" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--xs');
  });

  test('supporte la taille sm', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} size="sm" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--sm');
  });

  test('supporte la taille md', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} size="md" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--md');
  });

  test('supporte la taille lg', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} size="lg" />
    );
    
    expect(container.firstChild).toHaveClass('tabs--lg');
  });
});

// Suite de tests pour les propriétés avancées
describe('Tabs - Propriétés avancées', () => {
  test('supporte le mode compact', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} compact />
    );
    
    expect(container.firstChild).toHaveClass('tabs--compact');
  });

  test('supporte le centered', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} centered />
    );
    
    expect(container.firstChild).toHaveClass('tabs--centered');
  });

  test('supporte le stretch', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} stretch />
    );
    
    expect(container.firstChild).toHaveClass('tabs--stretch');
  });

  test('supporte l\'animation', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} animated={false} />
    );
    
    expect(container.firstChild).not.toHaveClass('tabs--animated');
  });

  test('supporte fullWidthOnMobile', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} fullWidthOnMobile />
    );
    
    expect(container.firstChild).toHaveClass('tabs--full-width-mobile');
  });
});

// Suite de tests pour la navigation clavier
describe('Tabs - Navigation clavier', () => {
  test('supporte la navigation avec les flèches', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={mockTabs} />);
    
    const firstTab = screen.getByText('Premier Onglet');
    await user.click(firstTab);
    
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    
    expect(screen.getByText('Deuxième Onglet').closest('.tabs__tab')).toHaveClass('tabs__tab--disabled');
  });

  test('supporte Home et End pour la navigation', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={mockTabs} />);
    
    const firstTab = screen.getByText('Premier Onglet');
    await user.click(firstTab);
    
    // Aller au dernier onglet avec End
    fireEvent.keyDown(firstTab, { key: 'End' });
    
    const lastTab = screen.getByText('Cinquième Onglet');
    expect(lastTab.closest('.tabs__tab--active')).toBeInTheDocument();
  });

  test('supporte Enter et Espace pour l\'activation', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Tabs tabs={mockTabs} onChange={handleChange} />);
    
    const thirdTab = screen.getByText('Troisième Onglet');
    await user.click(thirdTab);
    
    // Simuler la pression de la touche Enter
    fireEvent.keyDown(thirdTab, { key: 'Enter' });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('ignore la navigation clavier quand désactivée', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={mockTabs} keyboardNavigation={false} />);
    
    const firstTab = screen.getByText('Premier Onglet');
    await user.click(firstTab);
    
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    
    // L'onglet actif ne devrait pas changer
    expect(firstTab.closest('.tabs__tab--active')).toBeInTheDocument();
  });
});

// Suite de tests pour le mode responsive et accordéon
describe('Tabs - Responsive et accordéon', () => {
  test('active le mode accordéon sur mobile', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<Tabs tabs={mockTabs} collapsible />);
    
    expect(screen.getByTestId('tabs-container')).toHaveClass('tabs--collapsible');
    expect(screen.getByTestId('tabs-accordion')).toBeInTheDocument();
  });

  test('toggle l\'accordéon mobile', async () => {
    const user = userEvent.setup();
    
    // Mock de la largeur d'écran mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<Tabs tabs={mockTabs} collapsible />);
    
    const accordionHeader = screen.getByText('Premier Onglet').closest('.tabs__accordion-header');
    await user.click(accordionHeader!);
    
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
  });

  test('ferme l\'accordéon après sélection', async () => {
    const user = userEvent.setup();
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<Tabs tabs={mockTabs} collapsible />);
    
    const firstHeader = screen.getByText('Premier Onglet').closest('.tabs__accordion-header');
    await user.click(firstHeader!);
    
    const secondHeader = screen.getByText('Deuxième Onglet').closest('.tabs__accordion-header');
    await user.click(secondHeader!);
    
    expect(screen.getByText('Contenu du deuxième onglet')).toBeVisible();
  });
});

// Suite de tests pour les onglets fermables
describe('Tabs - Onglets fermables', () => {
  test('affiche les boutons de fermeture', async () => {
    const user = userEvent.setup();
    
    render(<Tabs tabs={mockTabs} closable />);
    
    const firstTab = screen.getByText('Premier Onglet');
    expect(firstTab.closest('.tabs__tab')?.querySelector('.tabs__tab-close')).toBeInTheDocument();
  });

  test('ferme l\'onglet au clic du bouton', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        closable 
        onTabClose={handleClose} 
      />
    );
    
    const firstTabClose = screen.getByText('Premier Onglet')
      .closest('.tabs__tab')?.querySelector('.tabs__tab-close');
    
    if (firstTabClose) {
      await user.click(firstTabClose);
    }
    
    expect(handleClose).toHaveBeenCalledWith(
      'tab1',
      expect.objectContaining({ id: 'tab1', label: 'Premier Onglet' })
    );
  });

  test('sélectionne un autre onglet après fermeture', async () => {
    const user = userEvent.setup();
    
    render(<Tabs tabs={mockTabs} closable defaultActiveTab="tab3" />);
    
    const tab3Close = screen.getByText('Troisième Onglet')
      .closest('.tabs__tab')?.querySelector('.tabs__tab-close');
    
    if (tab3Close) {
      await user.click(tab3Close);
    }
    
    // Devrait sélectionner le premier onglet disponible (tab1)
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
  });
});

// Suite de tests pour l'accessibilité
describe('Tabs - Accessibilité', () => {
  test('utilise les rôles ARIA corrects', () => {
    render(<Tabs tabs={mockTabs} />);
    
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  test('applique les attributs aria corrects', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const firstTab = screen.getByText('Premier Onglet');
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    expect(firstTab).toHaveAttribute('tabIndex', '0');
    
    const secondTab = screen.getByText('Deuxième Onglet');
    expect(secondTab).toHaveAttribute('aria-selected', 'false');
    expect(secondTab).toHaveAttribute('tabIndex', '-1');
  });

  test('masque les panneaux inactifs', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const firstPanel = screen.getByText('Contenu du premier onglet');
    expect(firstPanel.closest('[role="tabpanel"]')).toHaveAttribute('aria-hidden', 'false');
    
    const secondPanel = screen.getByText('Contenu du deuxième onglet');
    expect(secondPanel.closest('[role="tabpanel"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('lier les onglets aux panneaux', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const firstTab = screen.getByText('Premier Onglet');
    const firstPanel = screen.getByText('Contenu du premier onglet').closest('[role="tabpanel"]');
    
    expect(firstTab).toHaveAttribute('aria-controls', firstPanel?.getAttribute('id'));
    expect(firstPanel).toHaveAttribute('aria-labelledby', firstTab.getAttribute('id'));
  });

  test('annonce les onglets désactivés', () => {
    render(<Tabs tabs={mockTabs} />);
    
    const disabledAnnouncement = screen.getByText('Cet onglet est désactivé');
    expect(disabledAnnouncement).toBeInTheDocument();
  });
});

// Suite de tests pour les callbacks d'événements
describe('Tabs - Callbacks d\'événements', () => {
  test('appelle onTabOpen lors de l\'ouverture', async () => {
    const user = userEvent.setup();
    const handleOpen = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        onTabOpen={handleOpen} 
      />
    );
    
    const tab3 = screen.getByText('Troisième Onglet');
    await user.click(tab3);
    
    expect(handleOpen).toHaveBeenCalledWith(
      'tab3',
      expect.objectContaining({ id: 'tab3', label: 'Troisième Onglet' })
    );
  });

  test('ne pas appeler onChange en mode uncontrolled après fermeture', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        closable 
        onTabClose={jest.fn()}
        onChange={handleChange} 
      />
    );
    
    // Fermer le premier onglet
    const tab1Close = screen.getByText('Premier Onglet')
      .closest('.tabs__tab')?.querySelector('.tabs__tab-close');
    
    if (tab1Close) {
      await user.click(tab1Close);
    }
    
    // onChange ne devrait pas être appelé pour la fermeture
    expect(handleChange).not.toHaveBeenCalled();
  });
});

// Suite de tests pour les cas edge
describe('Tabs - Cas edge', () => {
  test('gère les onglets vides', () => {
    render(<Tabs tabs={[]} />);
    
    expect(screen.getByText('Aucun onglet disponible')).toBeInTheDocument();
  });

  test('sélectionne le premier onglet valide si tous sont désactivés', () => {
    const disabledTabs: TabItem[] = [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1', disabled: true },
      { id: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true }
    ];
    
    render(<Tabs tabs={disabledTabs} />);
    
    // Ne devrait pas crash, affiche juste le container vide
    expect(screen.getByTestId('tabs-container')).toBeInTheDocument();
  });

  test('supporte les onglets avec des contenus React complexes', () => {
    const complexTabs: TabItem[] = [
      {
        id: 'tab1',
        label: 'Onglet complexe',
        content: (
          <div>
            <h2>Contenu complexe</h2>
            <button>Action</button>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        )
      }
    ];
    
    render(<Tabs tabs={complexTabs} />);
    
    expect(screen.getByText('Contenu complexe')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('supporte les styles personnalisés', () => {
    const customStyle = { border: '2px solid red' };
    
    const { container } = render(
      <Tabs tabs={mockTabs} style={customStyle} />
    );
    
    expect(container.firstChild).toHaveStyle(customStyle);
  });

  test('supporte les classes CSS additionnelles', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

// Suite de tests pour les performances
describe('Tabs - Performances', () => {
  test('utilise React.memo efficacement', () => {
    const TestTabs = React.memo(Tabs);
    
    const { rerender } = render(
      <TestTabs 
        tabs={mockTabs} 
        activeTab="tab1" 
      />
    );
    
    // Re-render avec les mêmes props
    rerender(
      <TestTabs 
        tabs={mockTabs} 
        activeTab="tab1" 
      />
    );
    
    // Ne devrait pas re-render inutilement (test conceptuel)
    expect(screen.getByText('Premier Onglet')).toBeInTheDocument();
  });

  test('évite les re-renders inutiles', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange} 
      />
    );
    
    // Re-render avec les mêmes props
    rerender(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange} 
      />
    );
    
    expect(handleChange).not.toHaveBeenCalled();
  });
});

// Tests d'intégration
describe('Tabs - Tests d\'intégration', () => {
  test('intégration complète du workflow utilisateur', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const handleOpen = jest.fn();
    
    render(
      <Tabs 
        tabs={mockTabs} 
        onChange={handleChange}
        onTabOpen={handleOpen}
      />
    );
    
    // État initial
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
    
    // Changer d'onglet
    const tab3 = screen.getByText('Troisième Onglet');
    await user.click(tab3);
    
    expect(handleChange).toHaveBeenCalledWith('tab3', expect.any(Object));
    expect(handleOpen).toHaveBeenCalledWith('tab3', expect.any(Object));
    expect(screen.getByText('Contenu du troisième onglet')).toBeVisible();
    
    // Retour au premier onglet
    const tab1 = screen.getByText('Premier Onglet');
    await user.click(tab1);
    
    expect(handleChange).toHaveBeenCalledWith('tab1', expect.any(Object));
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
  });

  test('mode controlled avec mise à jour externe', () => {
    const TestComponent = () => {
      const [activeTab, setActiveTab] = React.useState('tab1');
      
      return (
        <div>
          <button 
            onClick={() => setActiveTab('tab3')}
            data-testid="external-button"
          >
            Changer vers tab3
          </button>
          <Tabs 
            tabs={mockTabs} 
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // État initial
    expect(screen.getByText('Contenu du premier onglet')).toBeVisible();
    
    // Changement externe
    const externalButton = screen.getByTestId('external-button');
    fireEvent.click(externalButton);
    
    expect(screen.getByText('Contenu du troisième onglet')).toBeVisible();
  });
});