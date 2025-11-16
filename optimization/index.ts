/**
 * Optimisation Index - Export de tous les composants d'optimisation
 * Phase D: Performance & Optimisation - Finalisation
 * 
 * Ce fichier exporte tous les composants créés dans l'Option D :
 * - Phase D.1: Optimisation Code
 * - Phase D.2: Performance Runtime  
 * - Phase D.3: Scalabilité Architecturale
 * - Phase D.4: Qualité Production
 */

export { default as LazyLoadWrapper, usePreloadManager } from './LazyLoadWrapper';
export { default as BundleAnalyzer } from './BundleAnalyzer';
export { default as CodeSplitter, useRoutePreloader, LazyRoute } from './CodeSplitter';
export { default as PerformanceMonitor } from './PerformanceMonitor';
export { default as RenderOptimizer, SmartMemo, VirtualizedList, SuspenseBoundary, RenderProfiler, RenderTrackerProvider } from './RenderOptimizer';
export { default as CacheManager, useCache, CacheProvider, CacheStatsViewer } from './CacheManager';

export * from './LazyLoadWrapper';
export * from './BundleAnalyzer';
export * from './CodeSplitter';
export * from './PerformanceMonitor';
export * from './RenderOptimizer';
export * from './CacheManager';

// Types principaux
export type {
  LazyLoadWrapperProps,
  BundleInfo,
  ModuleInfo,
  DependencyInfo,
  PerformanceMetrics,
  RouteConfig,
  CodeSplitOptions,
  PreloadConfig,
  VirtualScrollItem,
  RenderStats,
  CacheConfig,
  CacheEntry,
  CacheMetrics,
  CacheStats,
  OptimizationConfig
} from './LazyLoadWrapper';

// Configuration par défaut pour l'optimisation
export const OPTIMIZATION_CONFIG = {
  // Lazy Loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
    retryAttempts: 3,
    retryDelay: 1000,
    preload: false
  },

  // Bundle Analysis
  bundleAnalysis: {
    enabled: process.env.NODE_ENV === 'development',
    autoAnalyze: true,
    threshold: 300, // KB
    reportInterval: 5000
  },

  // Code Splitting
  codeSplitting: {
    preloadStrategy: 'lazy',
    retryAttempts: 3,
    priority: 'medium'
  },

  // Performance Monitoring
  performanceMonitoring: {
    enabled: true,
    reportInterval: 5000,
    enableSystemMonitoring: true,
    enableNetworkMonitoring: true,
    alertThresholds: {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      ttfb: { good: 600, poor: 1200 }
    }
  },

  // Rendering Optimization
  renderingOptimization: {
    enableMemoization: true,
    enableVirtualization: true,
    enableSuspenseBoundaries: true,
    enableRenderCounting: process.env.NODE_ENV === 'development',
    virtualScrollThreshold: 100,
    suspenseChunkSize: 20
  },

  // Cache Management
  cacheManagement: {
    maxMemorySize: 50, // MB
    maxStorageSize: 100, // MB
    ttl: 30 * 60 * 1000, // 30 minutes
    compression: true,
    autoCleanup: true,
    storageStrategy: 'hybrid'
  }
};

// Helper functions
export const createOptimizedComponent = <T extends object>(
  Component: React.ComponentType<T>,
  options: {
    enableMemo?: boolean;
    enableVirtual?: boolean;
    enableLazy?: boolean;
    config?: Record<string, any>;
  } = {}
) => {
  const { enableMemo = true, enableVirtual = false, enableLazy = false, config = {} } = options;

  let OptimizedComponent = Component;

  // Appliquer les optimisations dans l'ordre
  if (enableLazy) {
    const { LazyLoadWrapper } = require('./LazyLoadWrapper');
    OptimizedComponent = (props: T) => (
      <LazyLoadWrapper {...config}>
        <Component {...props} />
      </LazyLoadWrapper>
    );
  }

  if (enableMemo) {
    const { SmartMemo } = require('./RenderOptimizer');
    OptimizedComponent = SmartMemo({ component: OptimizedComponent, props: config });
  }

  if (enableVirtual) {
    const { VirtualizedList } = require('./RenderOptimizer');
    OptimizedComponent = (props: T & { items?: any[]; itemHeight?: number }) => {
      const { items = [], itemHeight = 50, ...componentProps } = props;
      
      return (
        <VirtualizedList
          items={items}
          itemHeight={itemHeight}
          containerHeight={400}
          renderItem={(item, index) => <OptimizedComponent {...componentProps} {...item} />}
        />
      );
    };
  }

  OptimizedComponent.displayName = `OptimizedComponent(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

export const getOptimizationRecommendations = () => {
  const metrics = {
    bundleSize: 0,
    loadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  };

  const recommendations = [];

  // Analyse des recommandations basée sur les métriques
  if (metrics.bundleSize > 300) {
    recommendations.push({
      type: 'bundle',
      priority: 'high',
      message: `Bundle size (${metrics.bundleSize}KB) exceeds recommended 300KB limit`,
      action: 'Implement code splitting and lazy loading'
    });
  }

  if (metrics.loadTime > 2000) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: `Load time (${metrics.loadTime}ms) exceeds recommended 2s limit`,
      action: 'Optimize images, enable compression, and reduce bundle size'
    });
  }

  if (metrics.memoryUsage > 80) {
    recommendations.push({
      type: 'memory',
      priority: 'medium',
      message: `Memory usage (${metrics.memoryUsage}%) is high`,
      action: 'Implement proper cleanup and garbage collection'
    });
  }

  if (metrics.cacheHitRate < 70) {
    recommendations.push({
      type: 'cache',
      priority: 'medium',
      message: `Cache hit rate (${metrics.cacheHitRate}%) is below recommended 70%`,
      action: 'Review cache strategy and increase cache size'
    });
  }

  return recommendations;
};

export default {
  // Phase D.1: Optimisation Code
  LazyLoadWrapper,
  BundleAnalyzer,
  CodeSplitter,
  
  // Phase D.2: Performance Runtime
  PerformanceMonitor,
  RenderOptimizer,
  CacheManager,
  
  // Phase D.3: Scalabilité Architecturale
  PluginSystem: require('../plugins/PluginSystem').default,
  
  // Phase D.4: Qualité Production
  MonitoringSystem: require('../monitoring/MonitoringSystem').default,
  
  // Helpers et utilitaires
  createOptimizedComponent,
  getOptimizationRecommendations,
  OPTIMIZATION_CONFIG
};