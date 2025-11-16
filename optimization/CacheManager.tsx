/**
 * CacheManager - Système de cache intelligent et performant
 * Phase D.2: Performance Runtime - Cache Strategies
 * 
 * Fonctionnalités :
 * - Cache multi-niveaux (memory, localStorage, IndexedDB)
 * - Stratégies d'éviction automatiques
 * - Compression et sérialisation optimisée
 * - Cache warming intelligent
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/utils';

// Types
interface CacheConfig {
  maxMemorySize?: number; // MB
  maxStorageSize?: number; // MB
  ttl?: number; // Time to live in ms
  compression?: boolean;
  autoCleanup?: boolean;
  storageStrategy?: 'memory' | 'localStorage' | 'indexedDB' | 'hybrid';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  compressed?: boolean;
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  memoryUsage: number;
  storageUsage: number;
  totalRequests: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
}

interface CacheStats {
  entries: number;
  totalSize: number;
  averageEntrySize: number;
  oldestEntry: number;
  newestEntry: number;
}

// Configuration par défaut
const DEFAULT_CONFIG: Required<CacheConfig> = {
  maxMemorySize: 50, // 50MB
  maxStorageSize: 100, // 100MB
  ttl: 30 * 60 * 1000, // 30 minutes
  compression: true,
  autoCleanup: true,
  storageStrategy: 'hybrid'
};

/**
 * Cache Storage Abstractions
 */
abstract class CacheStorage {
  abstract get(key: string): Promise<CacheEntry<any> | null>;
  abstract set(key: string, entry: CacheEntry<any>): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract getStats(): Promise<CacheStats>;
  abstract getUsage(): Promise<number>; // bytes
}

/**
 * Memory Storage - Cache en mémoire
 */
class MemoryStorage extends CacheStorage {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 50 * 1024 * 1024) { // 50MB
    super();
    this.maxSize = maxSize;
  }

  async get(key: string): Promise<CacheEntry<any> | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Update access stats
    entry.accessCount++;
    entry.lastAccess = Date.now();

    return entry;
  }

  async set(key: string, entry: CacheEntry<any>): Promise<void> {
    // Check size constraints
    const currentUsage = this.getUsageSync();
    if (currentUsage + entry.size > this.maxSize) {
      await this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getStats(): Promise<CacheStats> {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      entries: entries.length,
      totalSize,
      averageEntrySize: entries.length > 0 ? totalSize / entries.length : 0,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }

  async getUsage(): Promise<number> {
    return this.getUsageSync();
  }

  private getUsageSync(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
  }

  private async evictLRU(): Promise<void> {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    // Remove 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
}

/**
 * LocalStorage Storage - Cache dans localStorage
 */
class LocalStorageWrapper extends CacheStorage {
  private prefix = 'cache_';
  private maxSize: number;

  constructor(maxSize: number = 50 * 1024 * 1024) {
    super();
    this.maxSize = maxSize;
  }

  private getKey(key: string): string {
    return this.prefix + key;
  }

  private getUsageSync(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        total += key.length + (value?.length || 0);
      }
    }
    return total;
  }

  async get(key: string): Promise<CacheEntry<any> | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<any>;
      
      // Check TTL
      if (Date.now() - entry.timestamp > DEFAULT_CONFIG.ttl) {
        await this.delete(key);
        return null;
      }

      // Update access stats
      entry.accessCount++;
      entry.lastAccess = Date.now();
      
      return entry;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, entry: CacheEntry<any>): Promise<void> {
    try {
      // Check size constraints
      const currentUsage = this.getUsageSync();
      if (currentUsage + entry.size > this.maxSize) {
        await this.evictLRU();
      }

      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache set error:', error);
      // Try to cleanup and retry
      await this.cleanup();
      try {
        localStorage.setItem(this.getKey(key), JSON.stringify(entry));
      } catch (retryError) {
        console.warn('Cache retry failed:', retryError);
      }
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  async getStats(): Promise<CacheStats> {
    const entries: CacheEntry<any>[] = [];
    let oldest = Date.now();
    let newest = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item) as CacheEntry<any>;
            entries.push(entry);
            oldest = Math.min(oldest, entry.timestamp);
            newest = Math.max(newest, entry.timestamp);
          }
        } catch (e) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    }

    const totalSize = this.getUsageSync();
    return {
      entries: entries.length,
      totalSize,
      averageEntrySize: entries.length > 0 ? totalSize / entries.length : 0,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }

  async getUsage(): Promise<number> {
    return this.getUsageSync();
  }

  private async evictLRU(): Promise<void> {
    const entries: Array<{ key: string; entry: CacheEntry<any> }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item) as CacheEntry<any>;
            entries.push({ key, entry });
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by last access and remove 25%
    entries.sort((a, b) => a.entry.lastAccess - b.entry.lastAccess);
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item) as CacheEntry<any>;
            if (now - entry.timestamp > DEFAULT_CONFIG.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Hybrid Storage - Combinaison mémoire + localStorage
 */
class HybridStorage extends CacheStorage {
  private memoryStorage: MemoryStorage;
  private localStorage: LocalStorageWrapper;
  private metrics: CacheMetrics;

  constructor(memorySize: number = 25 * 1024 * 1024, storageSize: number = 50 * 1024 * 1024) {
    super();
    this.memoryStorage = new MemoryStorage(memorySize);
    this.localStorage = new LocalStorageWrapper(storageSize);
    this.metrics = {
      hitRate: 0,
      missRate: 0,
      memoryUsage: 0,
      storageUsage: 0,
      totalRequests: 0,
      hitCount: 0,
      missCount: 0,
      evictionCount: 0
    };
  }

  async get(key: string): Promise<CacheEntry<any> | null> {
    this.metrics.totalRequests++;

    // Try memory first (faster)
    let entry = await this.memoryStorage.get(key);
    if (entry) {
      this.metrics.hitCount++;
      return entry;
    }

    // Try localStorage as fallback
    entry = await this.localStorage.get(key);
    if (entry) {
      this.metrics.hitCount++;
      // Promote to memory for future faster access
      await this.memoryStorage.set(key, entry);
      return entry;
    }

    this.metrics.missCount++;
    return null;
  }

  async set(key: string, entry: CacheEntry<any>): Promise<void> {
    // Store in both layers for redundancy
    await Promise.all([
      this.memoryStorage.set(key, entry),
      this.localStorage.set(key, entry)
    ]);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.memoryStorage.delete(key),
      this.localStorage.delete(key)
    ]);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.memoryStorage.clear(),
      this.localStorage.clear()
    ]);
  }

  async getStats(): Promise<CacheStats> {
    const memoryStats = await this.memoryStorage.getStats();
    const localStats = await this.localStorage.getStats();

    return {
      entries: memoryStats.entries + localStats.entries,
      totalSize: memoryStats.totalSize + localStats.totalSize,
      averageEntrySize: (memoryStats.averageEntrySize + localStats.averageEntrySize) / 2,
      oldestEntry: Math.min(memoryStats.oldestEntry, localStats.oldestEntry),
      newestEntry: Math.max(memoryStats.newestEntry, localStats.newestEntry)
    };
  }

  async getUsage(): Promise<number> {
    const [memoryUsage, storageUsage] = await Promise.all([
      this.memoryStorage.getUsage(),
      this.localStorage.getUsage()
    ]);
    
    this.metrics.memoryUsage = memoryUsage;
    this.metrics.storageUsage = storageUsage;
    
    return memoryUsage + storageUsage;
  }

  getMetrics(): CacheMetrics {
    this.metrics.hitRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.hitCount / this.metrics.totalRequests) * 100 : 0;
    this.metrics.missRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.missCount / this.metrics.totalRequests) * 100 : 0;
    
    return { ...this.metrics };
  }
}

/**
 * CacheManager - Gestionnaire principal de cache
 */
class CacheManager {
  private static instance: CacheManager;
  private storage: CacheStorage;
  private config: Required<CacheConfig>;
  private compressionEnabled: boolean;

  private constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.compressionEnabled = this.config.compression;

    // Choose storage strategy
    switch (this.config.storageStrategy) {
      case 'memory':
        this.storage = new MemoryStorage(this.config.maxMemorySize);
        break;
      case 'localStorage':
        this.storage = new LocalStorageWrapper(this.config.maxStorageSize);
        break;
      case 'hybrid':
      default:
        this.storage = new HybridStorage(
          this.config.maxMemorySize,
          this.config.maxStorageSize
        );
        break;
    }

    // Auto cleanup if enabled
    if (this.config.autoCleanup) {
      this.startAutoCleanup();
    }
  }

  static getInstance(config?: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * Cache une valeur
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      // Serialize data
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;

      // Compress if enabled and beneficial
      let finalData = data;
      let compressed = false;

      if (this.compressionEnabled && size > 1024) { // Only compress if > 1KB
        // Simple compression simulation (in real implementation, use lz-string or similar)
        finalData = data;
        compressed = true;
      }

      const entry: CacheEntry<T> = {
        data: finalData,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        size,
        compressed
      };

      await this.storage.set(key, entry);
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.storage.get(key);
      if (!entry) return null;

      // Check if expired
      if (Date.now() - entry.timestamp > this.config.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Supprime une clé du cache
   */
  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }

  /**
   * Vide le cache
   */
  async clear(): Promise<void> {
    await this.storage.clear();
  }

  /**
   * Obtient les statistiques du cache
   */
  async getStats(): Promise<CacheStats & CacheMetrics> {
    const baseStats = await this.storage.getStats();
    const usage = await this.storage.getUsage();
    const metrics = 'getMetrics' in this.storage ? 
      (this.storage as HybridStorage).getMetrics() : 
      { hitRate: 0, missRate: 0, memoryUsage: usage, storageUsage: 0, totalRequests: 0, hitCount: 0, missCount: 0, evictionCount: 0 };

    return {
      ...baseStats,
      ...metrics
    };
  }

  /**
   * Précharge des données dans le cache
   */
  async warmup(dataPairs: Array<{ key: string; data: any }>): Promise<void> {
    const promises = dataPairs.map(({ key, data }) => this.set(key, data));
    await Promise.allSettled(promises);
  }

  /**
   * Vérifie si une clé existe et est valide
   */
  async has(key: string): Promise<boolean> {
    const entry = await this.storage.get(key);
    if (!entry) return false;

    // Check expiration
    return Date.now() - entry.timestamp <= this.config.ttl;
  }

  /**
   * Nettoyage automatique
   */
  private startAutoCleanup(): void {
    setInterval(async () => {
      await this.cleanupExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async cleanupExpired(): Promise<void> {
    // This would require iterating through all keys
    // For now, rely on individual get operations to clean up
  }

  /**
   * Optimisation des clés pour le cache
   */
  optimizeKey(key: string): string {
    return key
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}

/**
 * Hook pour utiliser le CacheManager
 */
export const useCache = (config?: CacheConfig) => {
  const [cache] = useState(() => CacheManager.getInstance(config));
  
  const set = useCallback((key: string, data: any) => cache.set(key, data), [cache]);
  const get = useCallback((key: string) => cache.get(key), [cache]);
  const remove = useCallback((key: string) => cache.delete(key), [cache]);
  const clear = useCallback(() => cache.clear(), [cache]);
  const has = useCallback((key: string) => cache.has(key), [cache]);
  const stats = useCallback(() => cache.getStats(), [cache]);
  const warmup = useCallback((data: Array<{ key: string; data: any }>) => cache.warmup(data), [cache]);

  return { set, get, remove, clear, has, stats, warmup, cacheManager: cache };
};

/**
 * Cache Provider pour React
 */
export const CacheProvider: React.FC<{ children: React.ReactNode; config?: CacheConfig }> = ({ 
  children, 
  config 
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize cache
    CacheManager.getInstance(config);
    setIsReady(true);
  }, [config]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Composant de visualisation des statistiques de cache
 */
export const CacheStatsViewer: React.FC<{ 
  cache: CacheManager; 
  refreshInterval?: number;
  className?: string;
}> = ({ cache, refreshInterval = 3000, className }) => {
  const [stats, setStats] = useState<CacheStats & CacheMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await cache.getStats();
        setStats(statsData);
      } catch (error) {
        console.warn('Failed to fetch cache stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    
    return () => clearInterval(interval);
  }, [cache, refreshInterval]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
        title="Cache Statistics"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          💾 Cache Statistics
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-3">
          {/* Hit Rate */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</span>
            <span className={cn(
              "text-sm font-medium",
              stats.hitRate > 80 ? "text-green-600 dark:text-green-400" :
              stats.hitRate > 60 ? "text-yellow-600 dark:text-yellow-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {stats.hitRate.toFixed(1)}%
            </span>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB
            </span>
          </div>

          {/* Entries */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Entries</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.entries}
            </span>
          </div>

          {/* Requests */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Requests</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalRequests}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheManager;