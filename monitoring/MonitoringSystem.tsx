/**
 * MonitoringSystem - Système de monitoring production complet
 * Phase D.4: Qualité Production - Monitoring & Analytics
 * 
 * Fonctionnalités :
 * - Real User Monitoring (RUM)
 * - Error tracking et alerting
 * - Performance analytics
 * - A/B testing framework
 * - Custom events et métriques
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/utils';

// Types
interface PerformanceMetrics {
  vitals: {
    fcp: number | null;
    lcp: number | null;
    cls: number | null;
    fid: number | null;
    ttfb: number | null;
  };
  custom: {
    renderTime: number;
    memoryUsage: number;
    networkRequests: number;
    jsExecutionTime: number;
    bundleSize: number;
    cacheHitRate: number;
  };
  timestamp: number;
}

interface ErrorEvent {
  id: string;
  message: string;
  stack: string;
  source: string;
  line: number;
  column: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
}

interface UserEvent {
  id: string;
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'custom';
  name: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
  category?: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-1
  config?: Record<string, any>;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: number;
  endDate?: number;
  variants: ABTestVariant[];
  targetAudience?: {
    userTypes?: string[];
    percentage?: number;
    conditions?: Record<string, any>;
  };
  metrics: {
    primary: string;
    secondary?: string[];
  };
}

interface AnalyticsConfig {
  endpoint?: string;
  apiKey?: string;
  sampleRate?: number;
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableUserTracking?: boolean;
  enableABTesting?: boolean;
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;
}

interface MonitoringContext {
  userId?: string;
  sessionId: string;
  pageUrl: string;
  referrer?: string;
  timestamp: number;
}

/**
 * Event Queue - File d'attente pour les événements
 */
class EventQueue {
  private queue: Array<{ type: string; data: any; timestamp: number }> = [];
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  add(type: string, data: any): void {
    this.queue.push({
      type,
      data,
      timestamp: Date.now()
    });

    // Auto flush si la file est pleine
    if (this.queue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      if (this.config.endpoint) {
        await this.sendToEndpoint(events);
      } else {
        this.sendToConsole(events);
      }
    } catch (error) {
      // En cas d'échec, remettre les événements dans la file
      this.queue.unshift(...events);
      console.error('Failed to flush events:', error);
    }
  }

  private async sendToEndpoint(events: any[]): Promise<void> {
    const response = await fetch(this.config.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
      },
      body: JSON.stringify(events)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private sendToConsole(events: any[]): void {
    console.group('📊 Analytics Events');
    events.forEach(event => {
      console.log(`[${event.type}]`, event.data);
    });
    console.groupEnd();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = {
      vitals: {
        fcp: null,
        lcp: null,
        cls: null,
        fid: null,
        ttfb: null
      },
      custom: {
        renderTime: 0,
        memoryUsage: 0,
        networkRequests: 0,
        jsExecutionTime: 0,
        bundleSize: 0,
        cacheHitRate: 0
      },
      timestamp: Date.now()
    };

    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Core Web Vitals
    const vitalObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.name) {
          case 'first-contentful-paint':
            this.metrics.vitals.fcp = entry.startTime;
            break;
          case 'largest-contentful-paint':
            this.metrics.vitals.lcp = entry.startTime;
            break;
        }
      }
    });

    const layoutObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.metrics.vitals.cls = (this.metrics.vitals.cls || 0) + (entry as any).value;
        }
      }
    });

    const interactionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'event') {
          this.metrics.vitals.fid = entry.processingStart - entry.startTime;
        }
      }
    });

    try {
      vitalObserver.observe({ entryTypes: ['paint'] });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
      interactionObserver.observe({ entryTypes: ['event'] });

      this.observers.push(vitalObserver, layoutObserver, interactionObserver);
    } catch (e) {
      console.warn('Some Performance Observers not supported');
    }

    // Network monitoring
    this.monitorNetwork();
    
    // Memory monitoring
    this.monitorMemory();
    
    // Calculate TTFB
    this.calculateTTFB();
  }

  private monitorNetwork(): void {
    const networkObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.metrics.custom.networkRequests += entries.length;
      
      // Calculate average response time
      const responseTimes = entries.map(entry => 
        (entry as any).responseEnd - (entry as any).responseStart
      );
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      this.metrics.custom.jsExecutionTime = avgResponseTime;
    });

    try {
      networkObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(networkObserver);
    } catch (e) {
      console.warn('Network monitoring not supported');
    }
  }

  private monitorMemory(): void {
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        this.metrics.custom.memoryUsage = usagePercent;
      }
    };

    updateMemory();
    setInterval(updateMemory, 5000);
  }

  private calculateTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.vitals.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics, timestamp: Date.now() };
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Error Tracker
 */
class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 100;

  constructor(private config: AnalyticsConfig) {
    this.setupGlobalErrorHandler();
  }

  private setupGlobalErrorHandler(): void {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack || '',
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: 'Unhandled Promise Rejection',
        stack: event.reason?.stack || String(event.reason),
        source: 'promise_rejection',
        line: 0,
        column: 0
      });
    });

    // Custom error boundary helper
    (window as any).__nexusgCaptureError = (error: Error, context?: any) => {
      this.captureError({
        message: error.message,
        stack: error.stack || '',
        source: 'custom',
        line: 0,
        column: 0,
        context
      });
    };
  }

  captureError(errorData: Partial<ErrorEvent>): void {
    const error: ErrorEvent = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack || '',
      source: errorData.source || 'unknown',
      line: errorData.line || 0,
      column: errorData.column || 0,
      timestamp: Date.now(),
      severity: this.determineSeverity(errorData.message || ''),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
      context: errorData.context
    };

    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log error
    console.error('🚨 Error captured:', error);

    // Send to endpoint if configured
    if (this.config.endpoint) {
      this.sendErrorToEndpoint(error);
    }
  }

  private determineSeverity(message: string): ErrorEvent['severity'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
      return 'critical';
    }
    if (lowerMessage.includes('warning') || lowerMessage.includes('deprecation')) {
      return 'low';
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'medium';
    }
    
    return 'high'; // Default to high
  }

  private async sendErrorToEndpoint(error: ErrorEvent): Promise<void> {
    try {
      await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          type: 'error',
          data: error
        })
      });
    } catch (e) {
      console.warn('Failed to send error to endpoint:', e);
    }
  }

  private getSessionId(): string {
    return sessionStorage.getItem('nexusg_session_id') || this.generateSessionId();
  }

  private generateSessionId(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('nexusg_session_id', sessionId);
    return sessionId;
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    recentErrors: ErrorEvent[];
  } {
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.errors
      .filter(error => Date.now() - error.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .slice(-10);

    return {
      total: this.errors.length,
      bySeverity,
      recentErrors
    };
  }
}

/**
 * A/B Testing Framework
 */
class ABTestManager {
  private tests = new Map<string, ABTest>();
  private userAssignments = new Map<string, string>();
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.loadUserAssignments();
  }

  private loadUserAssignments(): void {
    const saved = localStorage.getItem('nexusg_ab_assignments');
    if (saved) {
      try {
        this.userAssignments = new Map(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load A/B test assignments');
      }
    }
  }

  private saveUserAssignments(): void {
    localStorage.setItem('nexusg_ab_assignments', JSON.stringify(Array.from(this.userAssignments.entries())));
  }

  registerTest(test: ABTest): void {
    this.tests.set(test.id, test);
  }

  getVariant(testId: string, userId?: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    const userKey = userId || this.getAnonymousUserId();
    const assignmentKey = `${testId}_${userKey}`;

    // Return existing assignment
    if (this.userAssignments.has(assignmentKey)) {
      const variantId = this.userAssignments.get(assignmentKey)!;
      return test.variants.find(v => v.id === variantId) || null;
    }

    // Create new assignment
    const variant = this.assignVariant(test);
    if (variant) {
      this.userAssignments.set(assignmentKey, variant.id);
      this.saveUserAssignments();
    }

    return variant;
  }

  private assignVariant(test: ABTest): ABTestVariant | null {
    // Use weighted random assignment
    const random = Math.random();
    let cumulativeWeight = 0;

    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return test.variants[0] || null;
  }

  private getAnonymousUserId(): string {
    let userId = localStorage.getItem('nexusg_anonymous_user_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('nexusg_anonymous_user_id', userId);
    }
    return userId;
  }

  trackConversion(testId: string, variantId: string, userId?: string): void {
    // Track conversion event
    const event = {
      testId,
      variantId,
      userId: userId || this.getAnonymousUserId(),
      timestamp: Date.now(),
      type: 'conversion'
    };

    if (this.config.endpoint) {
      fetch(this.config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : ''
        },
        body: JSON.stringify({
          type: 'ab_test_conversion',
          data: event
        })
      }).catch(e => console.warn('Failed to track A/B test conversion:', e));
    }
  }

  getTests(): ABTest[] {
    return Array.from(this.tests.values());
  }
}

/**
 * Analytics System - Système principal d'analytics
 */
class AnalyticsSystem {
  private config: AnalyticsConfig;
  private queue: EventQueue;
  private performanceMonitor: PerformanceMonitor;
  private errorTracker: ErrorTracker;
  private abTestManager: ABTestManager;
  private userId?: string;
  private sessionId: string;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = {
      sampleRate: 1.0,
      enableErrorTracking: true,
      enablePerformanceTracking: true,
      enableUserTracking: true,
      enableABTesting: false,
      batchSize: 10,
      flushInterval: 5000,
      maxQueueSize: 1000,
      ...config
    };

    this.queue = new EventQueue(this.config);
    this.performanceMonitor = new PerformanceMonitor();
    this.errorTracker = new ErrorTracker(this.config);
    this.abTestManager = new ABTestManager(this.config);
    
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize(): void {
    // Set user ID if available
    this.userId = this.getStoredUserId();

    // Start periodic flush
    setInterval(() => {
      this.queue.flush();
    }, this.config.flushInterval);

    // Track page view
    this.trackPageView();

    this.isInitialized = true;
  }

  private generateSessionId(): string {
    const stored = sessionStorage.getItem('nexusg_session_id');
    if (stored) return stored;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('nexusg_session_id', sessionId);
    return sessionId;
  }

  private getStoredUserId(): string | undefined {
    try {
      return localStorage.getItem('nexusg_user_id') || undefined;
    } catch (e) {
      return undefined;
    }
  }

  private trackPageView(): void {
    this.track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      timestamp: Date.now()
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('nexusg_user_id', userId);
    this.track('user_identify', { userId });
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;

    const event: UserEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      name: eventName,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: properties || {}
    };

    this.queue.add('user_event', event);
  }

  trackClick(element: string, properties?: Record<string, any>): void {
    this.track('click', {
      element,
      ...properties
    });
  }

  trackConversion(testId: string, variantId: string): void {
    this.abTestManager.trackConversion(testId, variantId, this.userId);
    this.track('conversion', { testId, variantId });
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  getErrorStats() {
    return this.errorTracker.getErrorStats();
  }

  registerABTest(test: ABTest): void {
    this.abTestManager.registerTest(test);
  }

  getABVariant(testId: string): ABTestVariant | null {
    return this.abTestManager.getVariant(testId, this.userId);
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async flush(): Promise<void> {
    await this.queue.flush();
  }

  destroy(): void {
    this.performanceMonitor.destroy();
    this.queue.clear();
  }
}

/**
 * React Context and Provider
 */
const AnalyticsContext = createContext<{
  analytics: AnalyticsSystem | null;
  track: (eventName: string, properties?: Record<string, any>) => void;
  trackClick: (element: string, properties?: Record<string, any>) => void;
  trackConversion: (testId: string, variantId: string) => void;
  getPerformanceMetrics: () => PerformanceMetrics | null;
  getErrorStats: () => any;
  getABVariant: (testId: string) => ABTestVariant | null;
}>({
  analytics: null,
  track: () => {},
  trackClick: () => {},
  trackConversion: () => {},
  getPerformanceMetrics: () => null,
  getErrorStats: () => ({}),
  getABVariant: () => null
});

export const AnalyticsProvider: React.FC<{ 
  children: React.ReactNode; 
  config: AnalyticsConfig 
}> = ({ children, config }) => {
  const [analytics] = useState(() => new AnalyticsSystem(config));

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, [analytics]);

  const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
    analytics.trackClick(element, properties);
  }, [analytics]);

  const trackConversion = useCallback((testId: string, variantId: string) => {
    analytics.trackConversion(testId, variantId);
  }, [analytics]);

  const getPerformanceMetrics = useCallback(() => {
    return analytics.getPerformanceMetrics();
  }, [analytics]);

  const getErrorStats = useCallback(() => {
    return analytics.getErrorStats();
  }, [analytics]);

  const getABVariant = useCallback((testId: string) => {
    return analytics.getABVariant(testId);
  }, [analytics]);

  useEffect(() => {
    return () => {
      analytics.destroy();
    };
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={{
      analytics,
      track,
      trackClick,
      trackConversion,
      getPerformanceMetrics,
      getErrorStats,
      getABVariant
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};

export const useTrack = () => {
  const { track, trackClick } = useAnalytics();
  return { track, trackClick };
};

export const useABTest = (testId: string) => {
  const { getABVariant, trackConversion } = useAnalytics();
  
  const variant = getABVariant(testId);
  const convert = useCallback(() => {
    if (variant) {
      trackConversion(testId, variant.id);
    }
  }, [testId, variant, trackConversion]);

  return { variant, convert };
};

export default AnalyticsSystem;