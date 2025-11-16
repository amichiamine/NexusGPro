/**
 * PerformanceMonitor - Surveillance des performances en temps réel
 * Phase D.2: Performance Runtime - Monitoring
 * 
 * Fonctionnalités :
 * - Monitoring des Core Web Vitals
 * - PerformanceObserver avancé
 * - Métriques runtime personnalisées
 * - Alertes automatiques sur dégradations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils';

// Types
interface PerformanceData {
  vitals: {
    fcp: number | null; // First Contentful Paint
    lcp: number | null; // Largest Contentful Paint
    cls: number | null; // Cumulative Layout Shift
    fid: number | null; // First Input Delay
    ttfb: number | null; // Time to First Byte
  };
  custom: {
    renderTime: number;
    memoryUsage: number;
    networkRequests: number;
    jsExecutionTime: number;
  };
  system: {
    cpuUsage: number;
    memoryPressure: 'none' | 'moderate' | 'critical';
    connectionType: string;
    devicePixelRatio: number;
  };
}

interface PerformanceThresholds {
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  cls: { good: number; poor: number };
  fid: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

interface MonitoringConfig {
  enabled?: boolean;
  reportInterval?: number;
  alertThresholds?: Partial<PerformanceThresholds>;
  customMetrics?: string[];
  enableSystemMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: keyof PerformanceData['vitals'] | 'memory' | 'render';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

// Configuration par défaut
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  ttfb: { good: 600, poor: 1200 }
};

// Hook pour mesurer les Core Web Vitals
const useCoreWebVitals = (enabled: boolean) => {
  const [vitals, setVitals] = useState<PerformanceData['vitals']>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null
  });

  const [layoutShifts, setLayoutShifts] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Mesure First Contentful Paint et Largest Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setVitals(prev => ({ ...prev, fcp: entry.startTime }));
        }
        if (entry.name === 'largest-contentful-paint') {
          setVitals(prev => ({ ...prev, lcp: entry.startTime }));
        }
      }
    });

    // Mesure Cumulative Layout Shift
    const layoutObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const value = (entry as any).value || 0;
          setLayoutShifts(prev => [...prev, value]);
          
          // Calcul du CLS en temps réel
          const currentCLS = layoutShifts.reduce((sum, shift) => sum + shift, 0) + value;
          setVitals(prev => ({ ...prev, cls: currentCLS }));
        }
      }
    });

    // Mesure First Input Delay
    const interactionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'event') {
          const fid = entry.processingStart - entry.startTime;
          setVitals(prev => ({ ...prev, fid }));
        }
      }
    });

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
      interactionObserver.observe({ entryTypes: ['event'] });
    } catch (e) {
      console.warn('Performance Observer not fully supported');
    }

    // Mesure Time to First Byte (simplifiée)
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
      setVitals(prev => ({ ...prev, ttfb }));
    }

    return () => {
      paintObserver.disconnect();
      layoutObserver.disconnect();
      interactionObserver.disconnect();
    };
  }, [enabled, layoutShifts]);

  return vitals;
};

// Hook pour les métriques système
const useSystemMetrics = (enabled: boolean) => {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    connectionType: 'unknown',
    devicePixelRatio: window.devicePixelRatio
  });

  useEffect(() => {
    if (!enabled) return;

    // Mémoire (si supportée)
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        setMetrics(prev => ({ ...prev, memoryUsage: usage }));
      }
    };

    // Type de connexion
    const connection = (navigator as any).connection;
    if (connection) {
      setMetrics(prev => ({
        ...prev,
        connectionType: connection.effectiveType || 'unknown'
      }));
    }

    // Mise à jour périodique
    const interval = setInterval(updateMemory, 2000);
    updateMemory(); // Initial

    return () => clearInterval(interval);
  }, [enabled]);

  return metrics;
};

// Hook pour le monitoring réseau
const useNetworkMonitoring = (enabled: boolean) => {
  const [networkData, setNetworkData] = useState({
    requestCount: 0,
    totalTransferSize: 0,
    averageResponseTime: 0
  });

  const responseTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Observer pour les requêtes réseau
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'resource' && entry.initiatorType !== 'img') {
          setNetworkData(prev => ({
            ...prev,
            requestCount: prev.requestCount + 1,
            totalTransferSize: prev.totalTransferSize + (entry as any).transferSize
          }));

          // Temps de réponse
          const responseTime = (entry as any).responseEnd - (entry as any).responseStart;
          responseTimes.current.push(responseTime);
          
          if (responseTimes.current.length > 100) {
            responseTimes.current.shift(); // Garder seulement les 100 dernières
          }

          const avgResponseTime = responseTimes.current.reduce((sum, time) => sum + time, 0) / responseTimes.current.length;
          setNetworkData(prev => ({ ...prev, averageResponseTime: avgResponseTime }));
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource Observer not supported');
    }

    return () => observer.disconnect();
  }, [enabled]);

  return networkData;
};

// Hook pour la détection de dégradations
const usePerformanceAlerts = (
  data: PerformanceData, 
  thresholds: Partial<PerformanceThresholds>
) => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const checkThreshold = useCallback((
    metric: keyof PerformanceData['vitals'], 
    value: number | null,
    threshold: { good: number; poor: number }
  ) => {
    if (value === null) return;

    const existingAlert = alerts.find(alert => alert.metric === metric);
    
    if (value > threshold.poor && !existingAlert) {
      const newAlert: PerformanceAlert = {
        id: `${metric}-${Date.now()}`,
        type: 'error',
        metric,
        message: `${metric.toUpperCase()} critique: ${value.toFixed(0)}${metric === 'cls' ? '' : 'ms'}`,
        value,
        threshold: threshold.poor,
        timestamp: Date.now()
      };
      setAlerts(prev => [...prev, newAlert]);
    } else if (value > threshold.good && value <= threshold.poor && !existingAlert) {
      const newAlert: PerformanceAlert = {
        id: `${metric}-${Date.now()}`,
        type: 'warning',
        metric,
        message: `${metric.toUpperCase()} à surveiller: ${value.toFixed(0)}${metric === 'cls' ? '' : 'ms'}`,
        value,
        threshold: threshold.good,
        timestamp: Date.now()
      };
      setAlerts(prev => [...prev, newAlert]);
    }
  }, [alerts]);

  useEffect(() => {
    const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    
    Object.entries(data.vitals).forEach(([metric, value]) => {
      if (value !== null && finalThresholds[metric as keyof PerformanceThresholds]) {
        checkThreshold(
          metric as keyof PerformanceData['vitals'],
          value,
          finalThresholds[metric as keyof PerformanceThresholds]
        );
      }
    });
  }, [data, thresholds, checkThreshold]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return { alerts, clearAlert };
};

// Composant de visualisation des métriques
const MetricsVisualizer: React.FC<{ data: PerformanceData }> = ({ data }) => {
  const getScore = (value: number | null, threshold: { good: number; poor: number }) => {
    if (value === null) return 'unknown';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'needs-improvement': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const formatValue = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A';
    return `${value.toFixed(0)}${unit}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Core Web Vitals */}
      {Object.entries(data.vitals).map(([metric, value]) => {
        const threshold = DEFAULT_THRESHOLDS[metric as keyof PerformanceThresholds];
        const score = getScore(value, threshold);
        
        return (
          <div key={metric} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {metric.toUpperCase()}
              </h3>
              <span className={cn("text-sm font-medium", getScoreColor(score))}>
                {score === 'good' ? '✅' : score === 'needs-improvement' ? '⚠️' : '❌'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value, metric === 'cls' ? '' : 'ms')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cible: ≤ {threshold.good}{metric === 'cls' ? '' : 'ms'}
            </div>
          </div>
        );
      })}

      {/* Métriques système */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mémoire</h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.system.memoryUsage.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Utilisation JS Heap
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Réseau</h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.custom.networkRequests}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Requêtes actives
        </div>
      </div>
    </div>
  );
};

// Composant principal
interface PerformanceMonitorProps extends MonitoringConfig {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  reportInterval = 5000,
  alertThresholds,
  customMetrics = [],
  enableSystemMonitoring = true,
  enableNetworkMonitoring = true,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<PerformanceData>({
    vitals: { fcp: null, lcp: null, cls: null, fid: null, ttfb: null },
    custom: { renderTime: 0, memoryUsage: 0, networkRequests: 0, jsExecutionTime: 0 },
    system: { cpuUsage: 0, memoryPressure: 'none', connectionType: 'unknown', devicePixelRatio: 1 }
  });

  const vitals = useCoreWebVitals(enabled);
  const systemMetrics = useSystemMetrics(enableSystemMonitoring && enabled);
  const networkData = useNetworkMonitoring(enableNetworkMonitoring && enabled);
  const { alerts, clearAlert } = usePerformanceAlerts(
    { 
      vitals, 
      custom: { ...data.custom, ...networkData, ...systemMetrics },
      system: { ...data.system, ...systemMetrics }
    },
    alertThresholds
  );

  // Mise à jour des données
  useEffect(() => {
    const updateData = () => {
      setData({
        vitals,
        custom: {
          renderTime: performance.now() % 1000, // Simulation
          memoryUsage: systemMetrics.memoryUsage,
          networkRequests: networkData.requestCount,
          jsExecutionTime: networkData.averageResponseTime
        },
        system: {
          cpuUsage: systemMetrics.cpuUsage || 0,
          memoryPressure: systemMetrics.memoryUsage > 80 ? 'critical' : 
                         systemMetrics.memoryUsage > 60 ? 'moderate' : 'none',
          connectionType: systemMetrics.connectionType,
          devicePixelRatio: systemMetrics.devicePixelRatio
        }
      });
    };

    const interval = setInterval(updateData, reportInterval);
    updateData(); // Initial

    return () => clearInterval(interval);
  }, [vitals, systemMetrics, networkData, reportInterval]);

  if (!enabled) return null;

  return (
    <div className={cn("performance-monitor", className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105",
          alerts.length > 0 ? "bg-red-600 hover:bg-red-700 text-white" : 
                            "bg-gray-800 hover:bg-gray-900 text-white"
        )}
        title="Performance Monitor"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        {alerts.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Monitoring Panel */}
      {isVisible && (
        <div className="fixed top-4 left-4 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                📊 Performance Monitor
              </h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                  {enabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Alertes actives */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">🚨 Alertes Actives</h4>
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      alert.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          alert.type === 'error' ? 'text-red-800 dark:text-red-200' :
                          alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-blue-800 dark:text-blue-200'
                        )}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => clearAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Métriques de performance */}
            <MetricsVisualizer data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;