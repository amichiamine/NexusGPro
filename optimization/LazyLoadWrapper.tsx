/**
 * LazyLoadWrapper - Composant de chargement différé intelligent
 * Phase D.1.1: Optimisation Code - Lazy Loading
 * 
 * Fonctionnalités :
 * - Chargement différé automatique
 * - Intersection Observer natif
 * - Fallback visuel élégant
 * - Retry automatique en cas d'échec
 * - Préchargement intelligent
 */

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

// Types
interface LazyLoadWrapperProps {
  children: React.ReactNode | (() => Promise<React.ReactNode>);
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholderHeight?: number | string;
  retryAttempts?: number;
  retryDelay?: number;
  preload?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface LazyLoadState {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

// Configuration par défaut
const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_ROOT_MARGIN = '50px';
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;

// Composant de fallback par défaut
const DefaultFallback: React.FC<{ placeholderHeight: number | string }> = ({ 
  placeholderHeight = 200 
}) => (
  <div 
    className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse"
    style={{ height: placeholderHeight }}
  >
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Chargement différé...</p>
    </div>
  </div>
);

// Erreur fallback
const ErrorFallback: React.FC<{ 
  error: Error; 
  onRetry: () => void; 
  retryCount: number; 
  maxRetries: number;
}> = ({ error, onRetry, retryCount, maxRetries }) => (
  <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
    <div className="text-center">
      <div className="text-red-500 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-red-700 dark:text-red-300 text-sm mb-2">
        Erreur de chargement
      </p>
      <p className="text-red-500 dark:text-red-400 text-xs mb-3">
        {error.message}
      </p>
      {retryCount < maxRetries && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
        >
          Réessayer ({maxRetries - retryCount} restant)
        </button>
      )}
    </div>
  </div>
);

/**
 * Hook personnalisé pour l'intersection observer
 */
const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

/**
 * LazyLoadWrapper - Composant principal de chargement différé
 */
export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback = <DefaultFallback placeholderHeight={200} />,
  threshold = DEFAULT_THRESHOLD,
  rootMargin = DEFAULT_ROOT_MARGIN,
  placeholderHeight = 200,
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY,
  preload = false,
  onLoad,
  onError,
  className,
  style
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LazyLoadState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    retryCount: 0
  });
  const [component, setComponent] = useState<React.ReactNode>(null);
  const [shouldLoad, setShouldLoad] = useState(preload);

  // Intersection Observer
  const { isIntersecting } = useIntersectionObserver(wrapperRef, {
    threshold,
    rootMargin
  });

  /**
   * Chargement du composant
   */
  const loadComponent = async () => {
    if (state.isLoading || state.isLoaded) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let componentToRender: React.ReactNode;

      if (typeof children === 'function') {
        // Si c'est une fonction de lazy loading
        const result = await children();
        componentToRender = result;
      } else {
        // Si c'est un composant statique
        componentToRender = children;
      }

      setComponent(componentToRender);
      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        isLoading: false, 
        error: null 
      }));
      
      onLoad?.();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erreur inconnue');
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorObj,
        retryCount: prev.retryCount + 1
      }));
      
      onError?.(errorObj);
    }
  };

  /**
   * Retry du chargement
   */
  const retry = async () => {
    if (state.retryCount >= retryAttempts) return;
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    await loadComponent();
  };

  // Effets de chargement
  useEffect(() => {
    if (shouldLoad && !state.isLoaded && !state.isLoading) {
      loadComponent();
    }
  }, [shouldLoad, state.isLoaded, state.isLoading]);

  // Surveillance intersection pour déclenchement automatique
  useEffect(() => {
    if (isIntersecting && !shouldLoad && !state.isLoaded) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad, state.isLoaded]);

  // Préchargement en background si enabled
  useEffect(() => {
    if (preload) {
      // Préchargement agressif - charger dès que possible
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [preload]);

  // Gestion de l'erreur avec retry
  const handleRetry = async () => {
    await retry();
  };

  // Composant d'erreur
  const errorComponent = state.error && state.retryCount >= retryAttempts ? (
    <ErrorFallback 
      error={state.error} 
      onRetry={handleRetry} 
      retryCount={state.retryCount} 
      maxRetries={retryAttempts}
    />
  ) : null;

  return (
    <div 
      ref={wrapperRef}
      className={cn(
        "lazy-load-wrapper",
        state.isLoaded && "loaded",
        state.isLoading && "loading",
        state.error && "error",
        className
      )}
      style={style}
    >
      {!state.isLoaded && !state.error && (
        <div 
          className="lazy-load-placeholder"
          style={{ height: placeholderHeight }}
        >
          {state.isLoading ? (
            <DefaultFallback placeholderHeight={placeholderHeight} />
          ) : (
            <div 
              className="flex items-center justify-center bg-gray-50 dark:bg-gray-900"
              style={{ height: placeholderHeight }}
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Chargement différé...
              </p>
            </div>
          )}
        </div>
      )}

      {state.error && errorComponent}

      {state.isLoaded && component && (
        <div className="lazy-load-content">
          {component}
        </div>
      )}
    </div>
  );
};

/**
 * HOC pour créer des composants lazy automatiquement
 */
export const withLazyLoad = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyLoadWrapperProps, 'children'> = {}
) => {
  const LazyComponent = (props: P) => (
    <LazyLoadWrapper {...options}>
      <Component {...props} />
    </LazyLoadWrapper>
  );

  LazyComponent.displayName = `withLazyLoad(${Component.displayName || Component.name})`;
  
  return LazyComponent;
};

/**
 * PreloadManager - Gestionnaire de préchargement
 */
export class PreloadManager {
  private static instance: PreloadManager;
  private preloadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager();
    }
    return PreloadManager.instance;
  }

  /**
   * Précharge un composant
   */
  async preloadComponent(
    importFunc: () => Promise<{ default: React.ComponentType<any> }>,
    key: string
  ): Promise<void> {
    if (this.preloadedComponents.has(key)) {
      return this.preloadPromises.get(key) || Promise.resolve();
    }

    const promise = importFunc()
      .then(() => {
        this.preloadedComponents.add(key);
        this.preloadPromises.delete(key);
      })
      .catch((error) => {
        this.preloadPromises.delete(key);
        throw error;
      });

    this.preloadPromises.set(key, promise);
    return promise;
  }

  /**
   * Vérifie si un composant est préchargé
   */
  isPreloaded(key: string): boolean {
    return this.preloadedComponents.has(key);
  }

  /**
   * Précharge plusieurs composants
   */
  async preloadMultiple(components: Array<{
    importFunc: () => Promise<{ default: React.ComponentType<any> }>;
    key: string;
  }>): Promise<void> {
    const promises = components.map(({ importFunc, key }) => 
      this.preloadComponent(importFunc, key)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Nettoie le cache de préchargement
   */
  clearCache(): void {
    this.preloadedComponents.clear();
    this.preloadPromises.clear();
  }
}

/**
 * Hook pour utiliser le PreloadManager
 */
export const usePreloadManager = () => {
  const manager = PreloadManager.getInstance();
  return manager;
};

export default LazyLoadWrapper;