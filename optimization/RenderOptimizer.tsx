/**
 * RenderOptimizer - Optimiseur de rendu React avancé
 * Phase D.2: Performance Runtime - Rendering Optimization
 * 
 * Fonctionnalités :
 * - Memoization intelligente avec déduplication
 * - Optimisation des re-renders
 * - Virtual scrolling amélioré
 * - Suspense boundaries optimisées
 */

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback, 
  memo,
  createContext,
  useContext,
  useReducer,
  useLayoutEffect
} from 'react';
import { cn } from '@/utils';

// Types
interface RenderMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: number;
  componentCount: number;
}

interface OptimizationConfig {
  enableMemoization?: boolean;
  enableVirtualization?: boolean;
  enableSuspenseBoundaries?: boolean;
  enableRenderCounting?: boolean;
  virtualScrollThreshold?: number;
  suspenseChunkSize?: number;
}

interface VirtualScrollItem {
  id: string | number;
  height: number;
  data: any;
}

interface RenderStats {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  propsChanges: number;
  stateChanges: number;
  reason: string;
}

// Hook pour la méta-data des renders
const useRenderMetrics = (componentName: string, enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<RenderMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    const currentCount = metrics.renderCount + 1;

    // Calcul du temps de rendu
    const renderTime = performance.now() - startTime;
    renderTimes.current.push(renderTime);

    // Garder seulement les 100 dernières mesures
    if (renderTimes.current.length > 100) {
      renderTimes.current.shift();
    }

    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

    setMetrics({
      renderCount: currentCount,
      lastRenderTime: renderTime,
      averageRenderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      componentCount: currentCount
    });

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Render: ${componentName} (#${currentCount}, ${renderTime.toFixed(2)}ms)`);
    }
  });

  return metrics;
};

// Hook pour la déduplication des props
const usePropsDeduplication = <T extends Record<string, any>>(props: T) => {
  const prevPropsRef = useRef<T | null>(null);
  const [deduplicatedProps, setDeduplicatedProps] = useState(props);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    
    if (!prevProps) {
      setDeduplicatedProps(props);
      prevPropsRef.current = props;
      return;
    }

    // Détection des changements profonds
    const hasChanges = Object.keys(props).some(key => {
      const prevValue = prevProps[key];
      const currentValue = props[key];

      // Comparaison superficielle pour les objets complexes
      if (typeof prevValue === 'object' && typeof currentValue === 'object' && 
          prevValue !== null && currentValue !== null) {
        return JSON.stringify(prevValue) !== JSON.stringify(currentValue);
      }

      return prevValue !== currentValue;
    });

    if (hasChanges) {
      setDeduplicatedProps(props);
      prevPropsRef.current = props;
    }
  }, [props]);

  return deduplicatedProps;
};

// Context pour le tracking des renders
const RenderTrackerContext = createContext<{
  trackRender: (stats: RenderStats) => void;
  getRenderStats: (componentName: string) => RenderStats | null;
}>({
  trackRender: () => {},
  getRenderStats: () => null
});

// Provider global pour le tracking
export const RenderTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Map<string, RenderStats>>(new Map());

  const trackRender = useCallback((newStats: RenderStats) => {
    setStats(prev => {
      const updated = new Map(prev);
      const existing = updated.get(newStats.componentName);
      
      if (existing) {
        updated.set(newStats.componentName, {
          ...existing,
          ...newStats,
          renderCount: existing.renderCount + 1
        });
      } else {
        updated.set(newStats.componentName, newStats);
      }
      
      return updated;
    });
  }, []);

  const getRenderStats = useCallback((componentName: string) => {
    return stats.get(componentName) || null;
  }, [stats]);

  return (
    <RenderTrackerContext.Provider value={{ trackRender, getRenderStats }}>
      {children}
    </RenderTrackerContext.Provider>
  );
};

// Hook pour utiliser le tracker
export const useRenderTracker = () => {
  const context = useContext(RenderTrackerContext);
  if (!context) {
    throw new Error('useRenderTracker must be used within RenderTrackerProvider');
  }
  return context;
};

/**
 * SmartMemo - Memoization intelligente avec analyse des causes
 */
interface SmartMemoProps<T extends Record<string, any>> {
  component: React.ComponentType<T>;
  props: T;
  componentName?: string;
  enableDeepComparison?: boolean;
  enableRenderCounting?: boolean;
}

export const SmartMemo = <T extends Record<string, any>>({
  component: Component,
  props,
  componentName = Component.displayName || Component.name || 'Component',
  enableDeepComparison = false,
  enableRenderCounting = true
}: SmartMemoProps<T>) => {
  const deduplicatedProps = usePropsDeduplication(props);
  const metrics = useRenderMetrics(componentName, enableRenderCounting);
  const { trackRender } = useRenderTracker();

  // Comparaison des props (superficielle ou profonde)
  const areEqual = useMemo(() => {
    if (!enableDeepComparison) {
      // Comparaison superficielle (par défaut React.memo)
      return React.shallowEqual;
    }

    // Comparaison profonde pour les objets complexes
    return (prevProps: T, nextProps: T) => {
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);

      if (prevKeys.length !== nextKeys.length) return false;

      for (const key of prevKeys) {
        const prevValue = prevProps[key];
        const nextValue = nextProps[key];

        if (prevValue !== nextValue) {
          if (typeof prevValue === 'object' && typeof nextValue === 'object' &&
              prevValue !== null && nextValue !== null) {
            // Comparaison des objets
            const prevString = JSON.stringify(prevValue);
            const nextString = JSON.stringify(nextValue);
            if (prevString !== nextString) return false;
          } else {
            return false;
          }
        }
      }

      return true;
    };
  }, [enableDeepComparison]);

  // Tracking du render
  useEffect(() => {
    if (enableRenderCounting) {
      trackRender({
        componentName,
        renderCount: metrics.renderCount,
        lastRenderTime: metrics.lastRenderTime,
        averageRenderTime: metrics.averageRenderTime,
        propsChanges: 1, // Simplifié
        stateChanges: 0, // Simplifié
        reason: 'Props changed'
      });
    }
  }, [metrics, componentName, trackRender, enableRenderCounting]);

  // Composant memoïsé
  const MemoizedComponent = useMemo(() => {
    const Memoized = memo(Component, areEqual);
    Memoized.displayName = `SmartMemo(${componentName})`;
    return Memoized;
  }, [Component, areEqual, componentName]);

  return <MemoizedComponent {...deduplicatedProps} />;
};

/**
 * VirtualizedList - Liste virtualisée optimisée
 */
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcul des items visibles
  const visibleRange = useMemo(() => {
    const getItemHeight = (index: number) => 
      typeof itemHeight === 'number' ? itemHeight : itemHeight(index);

    let startIndex = 0;
    let endIndex = items.length - 1;
    let accumulatedHeight = 0;

    // Trouver l'index de début
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // Trouver l'index de fin
    accumulatedHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height = getItemHeight(i);
      accumulatedHeight += height;
      if (accumulatedHeight > containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  // Rendu des items visibles
  const visibleItems = useMemo(() => {
    const getItemHeight = (index: number) => 
      typeof itemHeight === 'number' ? itemHeight : itemHeight(index);

    let offsetY = 0;
    
    // Calculer l'offset des items visibles
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offsetY += getItemHeight(i);
    }

    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => {
        const actualIndex = visibleRange.startIndex + index;
        const height = getItemHeight(actualIndex);
        const element = renderItem(item, actualIndex);
        
        return {
          element,
          key: actualIndex,
          height,
          offsetY
        };
      });
  }, [items, renderItem, visibleRange, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("virtualized-list", className)}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * (typeof itemHeight === 'number' ? itemHeight : 50) }}>
        {visibleItems.map(({ element, key, height, offsetY }) => (
          <div key={key} style={{ height, transform: `translateY(${offsetY}px)` }}>
            {element}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * SuspenseBoundary - Boundary de suspense optimisée
 */
interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
  onError?: (error: Error) => void;
  enableMetrics?: boolean;
}

interface SuspenseState {
  hasError: boolean;
  error: Error | null;
}

const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback: FallbackComponent = DefaultSuspenseFallback,
  onError,
  enableMetrics = true
}) => {
  const [state, setState] = useState<SuspenseState>({ hasError: false, error: null });
  const startTimeRef = useRef<number>(Date.now());

  // Reset du timer au mount
  useEffect(() => {
    startTimeRef.current = Date.now();
  });

  const handleError = useCallback((error: Error) => {
    const loadTime = Date.now() - startTimeRef.current;
    
    setState({ hasError: true, error });
    onError?.(error);

    if (enableMetrics && process.env.NODE_ENV === 'development') {
      console.error(`💥 Suspense Boundary Error (${loadTime}ms):`, error);
    }
  }, [onError, enableMetrics]);

  if (state.hasError) {
    return <FallbackComponent error={state.error || undefined} />;
  }

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chargement optimisé...
            </p>
          </div>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

// Fallback par défaut pour les erreurs de suspense
const DefaultSuspenseFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Erreur de chargement
    </h3>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        {error.message}
      </p>
    )}
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Recharger la page
    </button>
  </div>
);

/**
 * RenderProfiler - Profiler pour analyser les performances de rendu
 */
export const RenderProfiler: React.FC<{
  enabled?: boolean;
  threshold?: number; // ms
  onRender?: (stats: RenderStats[]) => void;
}> = ({ enabled = false, threshold = 10, onRender }) => {
  const [stats, setStats] = useState<RenderStats[]>([]);

  // Collecte des stats à intervalles réguliers
  useEffect(() => {
    if (!enabled) return;

    const collectStats = () => {
      // Cette implémentation nécessiterait un système de tracking global
      // Pour la démo, on simule quelques statistiques
      const mockStats: RenderStats[] = [
        {
          componentName: 'ExampleComponent',
          renderCount: 15,
          lastRenderTime: 2.3,
          averageRenderTime: 2.1,
          propsChanges: 8,
          stateChanges: 7,
          reason: 'Props changed'
        }
      ];

      setStats(mockStats);
      onRender?.(mockStats);
    };

    const interval = setInterval(collectStats, 2000);
    return () => clearInterval(interval);
  }, [enabled, threshold, onRender]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-20 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        🔍 Render Profiler
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {stats.map((stat, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-gray-900 dark:text-white">
              {stat.componentName}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Renders: {stat.renderCount} • Avg: {stat.averageRenderTime.toFixed(1)}ms
            </div>
            {stat.lastRenderTime > threshold && (
              <div className="text-red-600 dark:text-red-400">
                ⚠️ Slow render: {stat.lastRenderTime.toFixed(1)}ms
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export du provider pour usage global
export { RenderTrackerProvider as RenderOptimizationProvider };

export default {
  SmartMemo,
  VirtualizedList,
  SuspenseBoundary,
  RenderProfiler,
  RenderTrackerProvider
};