/**
 * CodeSplitter - Système de code splitting avancé
 * Phase D.1.1: Optimisation Code - Code Splitting
 * 
 * Fonctionnalités :
 * - Splitting intelligent par routes et fonctionnalités
 * - Preloading stratégique
 * - Vendor chunks optimisés
 * - Dynamic imports avec fallbacks
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils';

// Types
interface RouteConfig {
  path: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  preload?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  chunkName?: string;
}

interface CodeSplitOptions {
  preloadStrategy?: 'eager' | 'lazy' | 'on-hover' | 'on-viewport';
  retryAttempts?: number;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

interface PreloadConfig {
  strategy: 'background' | 'critical-path' | 'predicted';
  maxPreloadSize?: number; // KB
  concurrency?: number;
}

// Configuration par défaut
const DEFAULT_OPTIONS: Required<CodeSplitOptions> = {
  preloadStrategy: 'lazy',
  retryAttempts: 3,
  fallback: null,
  onLoad: () => {},
  onError: () => {},
  priority: 'medium'
};

const PRELOAD_STRATEGIES = {
  eager: 'immediate',
  lazy: 'on-demand',
  'on-hover': 'hover',
  'on-viewport': 'intersection'
} as const;

/**
 * RoutePreloader - Gestionnaire de préchargement intelligent
 */
class RoutePreloader {
  private static instance: RoutePreloader;
  private preloadedRoutes = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private preloadQueue: Array<{ route: string; config: RouteConfig; priority: number }> = [];

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader();
    }
    return RoutePreloader.instance;
  }

  /**
   * Précharge une route avec stratégie intelligente
   */
  async preloadRoute(
    config: RouteConfig, 
    strategy: PreloadConfig['strategy'] = 'background'
  ): Promise<void> {
    const routeKey = config.chunkName || config.path;
    
    if (this.preloadedRoutes.has(routeKey)) {
      return this.loadingPromises.get(routeKey) || Promise.resolve();
    }

    // Calcul de la priorité basée sur la stratégie
    let priority = 5;
    switch (strategy) {
      case 'critical-path': priority = 1; break;
      case 'predicted': priority = 3; break;
      default: priority = 5; break;
    }

    // Ajout à la file de préchargement
    this.preloadQueue.push({ route: routeKey, config, priority });
    
    // Traitement de la file (priorité)
    this.preloadQueue.sort((a, b) => a.priority - b.priority);
    
    // Démarrage du préchargement
    return this.processPreloadQueue();
  }

  /**
   * Traite la file de préchargement avec concurrence limitée
   */
  private async processPreloadQueue(): Promise<void> {
    const MAX_CONCURRENT = 3;
    const processing: Promise<void>[] = [];

    while (this.preloadQueue.length > 0 && processing.length < MAX_CONCURRENT) {
      const item = this.preloadQueue.shift()!;
      
      if (!this.preloadedRoutes.has(item.route)) {
        const promise = this.loadRouteChunk(item.config, item.route)
          .finally(() => {
            // Suppression de la promise de la map une fois résolue
            setTimeout(() => this.loadingPromises.delete(item.route), 1000);
          });
        
        this.loadingPromises.set(item.route, promise);
        processing.push(promise);
      }
    }

    if (processing.length > 0) {
      await Promise.allSettled(processing);
      
      // Continuation avec les éléments suivants si la file n'est pas vide
      if (this.preloadQueue.length > 0) {
        await this.processPreloadQueue();
      }
    }
  }

  /**
   * Charge effectivement un chunk de route
   */
  private async loadRouteChunk(config: RouteConfig, routeKey: string): Promise<void> {
    try {
      const startTime = performance.now();
      
      await config.component();
      
      const loadTime = performance.now() - startTime;
      this.preloadedRoutes.add(routeKey);
      
      // Analytics du préchargement
      console.log(`✅ Route préchargée: ${routeKey} (${loadTime.toFixed(0)}ms)`);
      
    } catch (error) {
      console.error(`❌ Échec préchargement route: ${routeKey}`, error);
      this.loadingPromises.delete(routeKey);
      throw error;
    }
  }

  /**
   * Vérifie si une route est préchargée
   */
  isPreloaded(routeKey: string): boolean {
    return this.preloadedRoutes.has(routeKey);
  }

  /**
   * Nettoie le cache de préchargement
   */
  clearCache(): void {
    this.preloadedRoutes.clear();
    this.loadingPromises.clear();
    this.preloadQueue = [];
  }

  /**
   * Obtient les statistiques de préchargement
   */
  getStats(): { preloaded: number; loading: number; queued: number } {
    return {
      preloaded: this.preloadedRoutes.size,
      loading: this.loadingPromises.size,
      queued: this.preloadQueue.length
    };
  }
}

/**
 * Hook pour utiliser le RoutePreloader
 */
export const useRoutePreloader = () => {
  const preloader = RoutePreloader.getInstance();
  
  const preloadRoute = useCallback((config: RouteConfig, strategy: PreloadConfig['strategy'] = 'background') => {
    return preloader.preloadRoute(config, strategy);
  }, [preloader]);

  const isPreloaded = useCallback((routeKey: string) => {
    return preloader.isPreloaded(routeKey);
  }, [preloader]);

  const getStats = useCallback(() => {
    return preloader.getStats();
  }, [preloader]);

  return { preloadRoute, isPreloaded, getStats, clearCache: () => preloader.clearCache() };
};

/**
 * LazyRoute - Composant de route avec lazy loading intelligent
 */
interface LazyRouteProps {
  config: RouteConfig;
  options?: CodeSplitOptions;
  children?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  config, 
  options = {},
  children 
}) => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  const { preloadRoute } = useRoutePreloader();

  /**
   * Chargement de la route
   */
  const loadRoute = useCallback(async () => {
    if (isLoaded || Component) return;

    try {
      // Préchargement si configuré
      if (config.preload) {
        await preloadRoute(config, 'background');
      }

      // Chargement du composant
      const module = await config.component();
      const LoadedComponent = module.default;
      
      setComponent(() => LoadedComponent);
      setIsLoaded(true);
      setError(null);
      
      finalOptions.onLoad();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erreur de chargement');
      setError(errorObj);
      finalOptions.onError(errorObj);
    }
  }, [config, Component, isLoaded, finalOptions, preloadRoute]);

  /**
   * Stratégies de préchargement
   */
  useEffect(() => {
    switch (finalOptions.preloadStrategy) {
      case 'eager':
        // Chargement immédiat
        loadRoute();
        break;
        
      case 'on-hover':
        // Préchargement au survol (implementer si nécessaire)
        break;
        
      case 'on-viewport':
        // Préchargement quand la route devient visible
        const observer = new IntersectionObserver((entries) => {
          if (entries[0]?.isIntersecting) {
            loadRoute();
            observer.disconnect();
          }
        });
        
        // Observer du parent ou de la fenêtre entière
        observer.observe(document.body);
        return () => observer.disconnect();
        
      default:
        // lazy: chargement à la demande (quand composant render)
        break;
    }
  }, [finalOptions.preloadStrategy, loadRoute]);

  // Chargement à la demande si pas encore chargé
  useEffect(() => {
    if (!isLoaded && !Component && finalOptions.preloadStrategy === 'lazy') {
      loadRoute();
    }
  }, [loadRoute, isLoaded, Component, finalOptions.preloadStrategy]);

  // Retry en cas d'erreur
  const handleRetry = useCallback(async () => {
    setError(null);
    await loadRoute();
  }, [loadRoute]);

  // Fallback pour erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Fallback pendant le chargement
  if (!Component) {
    return finalOptions.fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement de la route...
          </p>
        </div>
      </div>
    );
  }

  // Rendu du composant chargé
  return (
    <Suspense fallback={finalOptions.fallback || <div>Chargement...</div>}>
      <Component>
        {children}
      </Component>
    </Suspense>
  );
};

/**
 * VendorSplitter - Séparateur de dépendances vendors
 */
interface VendorSplitConfig {
  react?: boolean;
  vendorLibraries?: string[];
  criticalVendor?: string[];
}

const createVendorSplit = (config: VendorSplitConfig = {}) => {
  const {
    react = true,
    vendorLibraries = ['react', 'react-dom'],
    criticalVendor = ['react', 'react-dom']
  } = config;

  // Séparation des vendors critiques
  const splitCriticalVendor = criticalVendor.length > 0 ? (
    <script dangerouslySetInnerHTML={{
      __html: `
        // Preload des vendors critiques
        ${criticalVendor.map(lib => `
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = '/static/js/${lib}.chunk.js';
          link.as = 'script';
          document.head.appendChild(link);
        `).join('')}
      `
    }} />
  ) : null;

  // Chunk vendor standard
  const standardVendorChunk = vendorLibraries
    .filter(lib => !criticalVendor.includes(lib))
    .map(lib => ({
      name: lib,
      import: () => import(`../vendor/${lib}`)
    }));

  return {
    criticalVendor: splitCriticalVendor,
    standardChunks: standardVendorChunk,
    config
  };
};

/**
 * PreloadManager - Gestionnaire de préchargement global
 */
export class CodeSplitManager {
  private static instance: CodeSplitManager;
  private preloader = RoutePreloader.getInstance();

  static getInstance(): CodeSplitManager {
    if (!CodeSplitManager.instance) {
      CodeSplitManager.instance = new CodeSplitManager();
    }
    return CodeSplitManager.instance;
  }

  /**
   * Précharge plusieurs routes selon une stratégie
   */
  async preloadRoutes(
    routes: RouteConfig[], 
    strategy: PreloadConfig['strategy'] = 'background'
  ): Promise<void> {
    const promises = routes.map(route => 
      this.preloader.preloadRoute(route, strategy)
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Préchargement prédictif basé sur l'historique
   */
  async predictivePreload(currentPath: string): Promise<void> {
    // Logique simple : précharger les routes voisines
    const neighboringRoutes = [
      `${currentPath}/settings`,
      `${currentPath}/profile`,
      `${currentPath}/dashboard`
    ];

    // En production, ceci viendrait d'une API d'analytics
    const frequentlyVisited = ['/dashboard', '/settings', '/profile'];
    
    const routesToPreload = frequentlyVisited
      .filter(path => path !== currentPath)
      .map(path => ({
        path,
        component: () => import(`../pages${path}`),
        priority: 'high' as const
      }));

    await this.preloadRoutes(routesToPreload, 'predicted');
  }

  /**
   * Obtient les métriques de performance
   */
  getMetrics() {
    const stats = this.preloader.getStats();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      ...stats,
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      firstPaint: navigation ? navigation.responseEnd - navigation.requestStart : 0
    };
  }
}

/**
 * Hook pour utiliser le CodeSplitManager
 */
export const useCodeSplitManager = () => {
  const manager = CodeSplitManager.getInstance();
  
  return {
    preloadRoutes: (routes: RouteConfig[], strategy?: PreloadConfig['strategy']) => 
      manager.preloadRoutes(routes, strategy),
    predictivePreload: (currentPath: string) => 
      manager.predictivePreload(currentPath),
    getMetrics: () => manager.getMetrics()
  };
};

export default CodeSplitManager;