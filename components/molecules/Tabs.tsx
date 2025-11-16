import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject
} from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  badge?: number | string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface TabsProps {
  /**
   * Configuration des onglets
   */
  tabs: TabItem[];
  
  /**
   * Onglet actuellement actif (mode controlled)
   */
  activeTab?: string;
  
  /**
   * Onglet par défaut (mode uncontrolled)
   */
  defaultActiveTab?: string;
  
  /**
   * Callback lors du changement d'onglet
   */
  onChange?: (tabId: string, tabData: TabItem) => void;
  
  /**
   * Position des onglets
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Variante visuelle des onglets
   * @default 'underline'
   */
  variant?: 'underline' | 'pills' | 'modern' | 'minimal';
  
  /**
   * Taille des onglets
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  /**
   * Mode compact
   * @default false
   */
  compact?: boolean;
  
  /**
   * Activer la navigation clavier
   * @default true
   */
  keyboardNavigation?: boolean;
  
  /**
   * Animation de transition
   * @default true
   */
  animated?: boolean;
  
  /**
   * Mode responsive (collapse en accordéon sur mobile)
   * @default false
   */
  collapsible?: boolean;
  
  /**
   * Stretch tabs pour remplir l'espace disponible
   * @default false
   */
  stretch?: boolean;
  
  /**
   * Centrer les onglets
   * @default false
   */
  centered?: boolean;
  
  /**
   * Pleine largeur sur mobile
   * @default false
   */
  fullWidthOnMobile?: boolean;
  
  /**
   * Classes CSS additionnelles
   */
  className?: string;
  
  /**
   * Style inline additionnel
   */
  style?: React.CSSProperties;
  
  /**
   * Callback lors de la fermeture d'un onglet (si closable)
   */
  onTabClose?: (tabId: string, tabData: TabItem) => void;
  
  /**
   * Permettre la fermeture des onglets
   * @default false
   */
  closable?: boolean;
  
  /**
   * Callback lors de l'ouverture d'un onglet
   */
  onTabOpen?: (tabId: string, tabData: TabItem) => void;
}

export interface TabsContextType {
  activeTab: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  position: TabsProps['position'];
  variant: TabsProps['variant'];
  size: TabsProps['size'];
  compact: boolean;
  animated: boolean;
  collapsible: boolean;
  stretch: boolean;
  centered: boolean;
  closable: boolean;
  keyboardNavigation: boolean;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

// Composant pour les onglets individuels
const TabButton = forwardRef<HTMLButtonElement, {
  tab: TabItem;
  isActive: boolean;
  index: number;
  tabCount: number;
}>(({ tab, isActive, index, tabCount }, ref) => {
  const {
    onTabSelect,
    onTabClose,
    position,
    variant,
    size,
    compact,
    animated,
    closable,
    keyboardNavigation
  } = useTabsContext();

  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fusionner les refs
  const mergedRef = useCallback((node: HTMLButtonElement) => {
    buttonRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (tab.disabled || tab.loading) {
      e.preventDefault();
      return;
    }
    onTabSelect(tab.id);
  }, [tab.disabled, tab.loading, onTabSelect, tab.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (!keyboardNavigation || tab.disabled || tab.loading) return;

    const currentIndex = index;
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabCount - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tabCount - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        if (position === 'left' || position === 'right') {
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabCount - 1;
        }
        break;
      case 'ArrowDown':
        if (position === 'left' || position === 'right') {
          e.preventDefault();
          nextIndex = currentIndex < tabCount - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabCount - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTabSelect(tab.id);
        break;
    }

    if (nextIndex !== currentIndex) {
      const nextTab = buttonRef.current?.parentElement?.children[nextIndex] as HTMLElement;
      nextTab?.focus();
    }
  }, [keyboardNavigation, tab.disabled, tab.loading, index, tabCount, position, onTabSelect, tab.id]);

  const handleMouseDown = useCallback(() => {
    if (!tab.disabled && !tab.loading) {
      setIsPressed(true);
    }
  }, [tab.disabled, tab.loading]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClose = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (closable && !tab.disabled) {
      onTabClose(tab.id);
    }
  }, [closable, tab.disabled, onTabClose, tab.id]);

  return (
    <button
      ref={mergedRef}
      type="button"
      className={[
        'tabs__tab',
        `tabs__tab--${variant}`,
        `tabs__tab--${size}`,
        isActive && 'tabs__tab--active',
        tab.disabled && 'tabs__tab--disabled',
        tab.loading && 'tabs__tab--loading',
        isPressed && 'tabs__tab--pressed',
        compact && 'tabs__tab--compact',
        animated && 'tabs__tab--animated'
      ].filter(Boolean).join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={tab.disabled || tab.loading}
      aria-selected={isActive}
      aria-controls={`tabs-panel-${tab.id}`}
      aria-describedby={tab.disabled ? `tabs-tab-${tab.id}-disabled` : undefined}
      tabIndex={isActive ? 0 : -1}
      role="tab"
      id={`tabs-tab-${tab.id}`}
      data-testid={`tabs-tab-${tab.id}`}
    >
      {tab.icon && (
        <span className="tabs__tab-icon" aria-hidden="true">
          {tab.icon}
        </span>
      )}
      <span className="tabs__tab-label">
        {tab.label}
      </span>
      {tab.badge && (
        <span 
          className={[
            'tabs__tab-badge',
            tab.badgeColor && `tabs__tab-badge--${tab.badgeColor}`
          ].filter(Boolean).join(' ')}
          aria-label={`Notifications: ${tab.badge}`}
        >
          {tab.badge}
        </span>
      )}
      {tab.loading && (
        <span className="tabs__tab-loading" aria-hidden="true">
          <svg className="tabs__tab-loading-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
      )}
      {closable && !tab.disabled && !tab.loading && (
        <button
          type="button"
          className="tabs__tab-close"
          onClick={handleClose}
          aria-label={`Fermer l'onglet ${tab.label}`}
          tabIndex={-1}
        >
          <svg viewBox="0 0 24 24" className="tabs__tab-close-icon">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {tab.disabled && (
        <span id={`tabs-tab-${tab.id}-disabled`} className="sr-only">
          Cet onglet est désactivé
        </span>
      )}
    </button>
  );
});

TabButton.displayName = 'TabButton';

// Composant pour les panneaux de contenu
const TabPanel = forwardRef<HTMLDivElement, {
  tab: TabItem;
  isActive: boolean;
  index: number;
}>(({ tab, isActive, index }, ref) => {
  return (
    <div
      ref={ref}
      id={`tabs-panel-${tab.id}`}
      className={[
        'tabs__panel',
        isActive && 'tabs__panel--active'
      ].filter(Boolean).join(' ')}
      role="tabpanel"
      aria-labelledby={`tabs-tab-${tab.id}`}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      data-testid={`tabs-panel-${tab.id}`}
    >
      {tab.content}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

// Composant principal Tabs
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({
  tabs,
  activeTab,
  defaultActiveTab,
  onChange,
  position = 'top',
  variant = 'underline',
  size = 'md',
  compact = false,
  keyboardNavigation = true,
  animated = true,
  collapsible = false,
  stretch = false,
  centered = false,
  fullWidthOnMobile = false,
  className = '',
  style,
  onTabClose,
  closable = false,
  onTabOpen
}, ref) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id || ''
  );
  const [expandedMobileTab, setExpandedMobileTab] = useState<string | null>(null);

  // Déterminer l'onglet actif (controlled ou uncontrolled)
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

  // Gestion du changement d'onglet
  const handleTabSelect = useCallback((tabId: string) => {
    const tabData = tabs.find(t => t.id === tabId);
    if (!tabData || tabData.disabled || tabData.loading) return;

    if (activeTab === undefined) {
      setInternalActiveTab(tabId);
    }
    
    onChange?.(tabId, tabData);
    onTabOpen?.(tabId, tabData);

    // Fermer l'accordéon mobile si ouvert
    if (collapsible && expandedMobileTab === tabId) {
      setExpandedMobileTab(null);
    }
  }, [tabs, activeTab, onChange, onTabOpen, collapsible, expandedMobileTab]);

  // Gestion de la fermeture d'onglet
  const handleTabClose = useCallback((tabId: string) => {
    const tabData = tabs.find(t => t.id === tabId);
    if (!tabData) return;

    onTabClose?.(tabId, tabData);

    // Si l'onglet fermé est actif, sélectionner un autre onglet
    if (currentActiveTab === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[0];
        handleTabSelect(nextTab.id);
      } else if (activeTab === undefined) {
        setInternalActiveTab('');
      }
    }
  }, [tabs, currentActiveTab, onTabClose, handleTabSelect, activeTab]);

  // Toggle de l'accordéon mobile
  const handleMobileToggle = useCallback((tabId: string) => {
    setExpandedMobileTab(prev => prev === tabId ? null : tabId);
  }, []);

  // Vérifier les onglets valides
  const validTabs = useMemo(() => {
    return tabs.filter(tab => !tab.disabled);
  }, [tabs]);

  const activeTabData = useMemo(() => {
    return tabs.find(tab => tab.id === currentActiveTab);
  }, [tabs, currentActiveTab]);

  // Context pour les composants enfants
  const contextValue: TabsContextType = {
    activeTab: currentActiveTab,
    onTabSelect: handleTabSelect,
    onTabClose: handleTabClose,
    position,
    variant,
    size,
    compact,
    animated,
    collapsible,
    stretch,
    centered,
    closable,
    keyboardNavigation
  };

  // Classes CSS dynamiques
  const containerClasses = [
    'tabs',
    `tabs--${position}`,
    `tabs--${variant}`,
    `tabs--${size}`,
    compact && 'tabs--compact',
    animated && 'tabs--animated',
    collapsible && 'tabs--collapsible',
    stretch && 'tabs--stretch',
    centered && 'tabs--centered',
    fullWidthOnMobile && 'tabs--full-width-mobile',
    className
  ].filter(Boolean).join(' ');

  // Styles pour la hauteur fixe en mode vertical
  const containerStyle: React.CSSProperties = {
    ...style,
    ...(position === 'left' || position === 'right' ? { minHeight: '400px' } : {})
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={containerClasses}
        style={containerStyle}
        role="tablist"
        aria-label="Navigation par onglets"
        data-testid="tabs-container"
      >
        {collapsible && validTabs.length === 0 ? (
          <div className="tabs__empty">
            Aucun onglet disponible
          </div>
        ) : (
          <>
            {/* Liste des onglets */}
            <div className="tabs__list" role="presentation">
              {validTabs.map((tab, index) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={currentActiveTab === tab.id}
                  index={index}
                  tabCount={validTabs.length}
                />
              ))}
            </div>

            {/* Accordéon mobile */}
            {collapsible && (
              <div className="tabs__accordion" role="presentation">
                {validTabs.map((tab) => (
                  <div key={tab.id} className="tabs__accordion-item">
                    <button
                      type="button"
                      className="tabs__accordion-header"
                      onClick={() => handleMobileToggle(tab.id)}
                      aria-expanded={expandedMobileTab === tab.id}
                      aria-controls={`tabs-accordion-panel-${tab.id}`}
                    >
                      {tab.icon && (
                        <span className="tabs__accordion-icon" aria-hidden="true">
                          {tab.icon}
                        </span>
                      )}
                      <span className="tabs__accordion-label">
                        {tab.label}
                      </span>
                      {tab.badge && (
                        <span className="tabs__accordion-badge">
                          {tab.badge}
                        </span>
                      )}
                      <svg 
                        className={[
                          'tabs__accordion-chevron',
                          expandedMobileTab === tab.id && 'tabs__accordion-chevron--open'
                        ].filter(Boolean).join(' ')}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div
                      id={`tabs-accordion-panel-${tab.id}`}
                      className={[
                        'tabs__accordion-panel',
                        expandedMobileTab === tab.id && 'tabs__accordion-panel--open'
                      ].filter(Boolean).join(' ')}
                    >
                      {tab.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Panneau de contenu principal */}
            {activeTabData && (
              <TabPanel
                tab={activeTabData}
                isActive={currentActiveTab === activeTabData.id}
                index={validTabs.findIndex(t => t.id === currentActiveTab)}
              />
            )}
          </>
        )}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;