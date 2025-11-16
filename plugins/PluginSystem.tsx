/**
 * PluginSystem - Architecture modulaire et extensible
 * Phase D.3: Scalabilité Architecturale - Plugin System
 * 
 * Fonctionnalités :
 * - Architecture de plugins avec lifecycle
 * - Hooks et events system
 * - Plugin registry et discovery
 * - Sandboxing et sécurité
 * - Configuration dynamique
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/utils';

// Types
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  peerDependencies?: Record<string, string>;
  entry?: string;
  permissions?: string[];
  category?: 'core' | 'feature' | 'theme' | 'integration' | 'custom';
  tags?: string[];
}

interface PluginContext {
  id: string;
  name: string;
  version: string;
  api: PluginAPI;
  config: Record<string, any>;
  state: Record<string, any>;
}

interface PluginAPI {
  registerHook: (hookName: string, handler: Function) => void;
  unregisterHook: (hookName: string, handler: Function) => void;
  emitEvent: (eventName: string, data?: any) => void;
  subscribe: (eventName: string, handler: Function) => () => void;
  addComponent: (name: string, component: React.ComponentType<any>) => void;
  getConfig: (key?: string) => any;
  setConfig: (key: string, value: any) => void;
  getState: (key?: string) => any;
  setState: (key: string, value: any) => void;
  fetch: (url: string, options?: RequestInit) => Promise<any>;
  log: (level: 'info' | 'warn' | 'error', message: string, data?: any) => void;
}

interface PluginLifecycle {
  onInstall: (context: PluginContext) => void | Promise<void>;
  onActivate: (context: PluginContext) => void | Promise<void>;
  onDeactivate: (context: PluginContext) => void | Promise<void>;
  onUninstall: (context: PluginContext) => void | Promise<void>;
  onConfigChange: (context: PluginContext, changes: Record<string, any>) => void | Promise<void>;
}

interface Plugin extends PluginLifecycle {
  manifest: PluginManifest;
  component?: React.ComponentType<any>;
  initialize?: (api: PluginAPI) => void | Promise<void>;
}

interface HookDefinition {
  name: string;
  description?: string;
  parameters?: string[];
  returns?: string;
  priority?: number;
}

interface EventPayload {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  plugins?: string[];
}

interface PluginSandbox {
  console: Console;
  fetch: typeof fetch;
  setTimeout: typeof setTimeout;
  setInterval: typeof setInterval;
  clearTimeout: typeof clearTimeout;
  clearInterval: typeof clearInterval;
  location: Location;
  history: History;
  navigator: Navigator;
  plugins: PluginAPI;
}

/**
 * Hook System - Système de hooks pour les plugins
 */
class HookSystem {
  private hooks = new Map<string, Array<{ handler: Function; priority: number }>>();
  private definitions = new Map<string, HookDefinition>();

  registerHook(hookName: string, handler: Function, priority: number = 10): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const hookHandlers = this.hooks.get(hookName)!;
    hookHandlers.push({ handler, priority });

    // Sort by priority (lower number = higher priority)
    hookHandlers.sort((a, b) => a.priority - b.priority);
  }

  unregisterHook(hookName: string, handler: Function): void {
    const hookHandlers = this.hooks.get(hookName);
    if (hookHandlers) {
      const index = hookHandlers.findIndex(h => h.handler === handler);
      if (index !== -1) {
        hookHandlers.splice(index, 1);
      }
    }
  }

  async executeHook<T>(hookName: string, ...args: any[]): Promise<T[]> {
    const hookHandlers = this.hooks.get(hookName);
    if (!hookHandlers) {
      return [];
    }

    const results: T[] = [];
    for (const { handler } of hookHandlers) {
      try {
        const result = await handler(...args);
        results.push(result);
      } catch (error) {
        console.error(`Error in hook "${hookName}":`, error);
      }
    }

    return results;
  }

  async executeHookFirst<T>(hookName: string, ...args: any[]): Promise<T | null> {
    const hookHandlers = this.hooks.get(hookName);
    if (!hookHandlers || hookHandlers.length === 0) {
      return null;
    }

    try {
      const result = await hookHandlers[0].handler(...args);
      return result;
    } catch (error) {
      console.error(`Error in hook "${hookName}":`, error);
      return null;
    }
  }

  registerDefinition(definition: HookDefinition): void {
    this.definitions.set(definition.name, definition);
  }

  getDefinition(hookName: string): HookDefinition | undefined {
    return this.definitions.get(hookName);
  }

  getRegisteredHooks(): string[] {
    return Array.from(this.hooks.keys());
  }
}

/**
 * Event System - Système d'événements pour communication inter-plugin
 */
class EventSystem {
  private listeners = new Map<string, Set<Function>>();
  private eventHistory: EventPayload[] = [];
  private maxHistory = 100;

  subscribe(eventName: string, handler: Function): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  emit(eventName: string, data?: any, source?: string): void {
    const payload: EventPayload = {
      type: eventName,
      data,
      timestamp: Date.now(),
      source: source || 'system'
    };

    // Add to history
    this.eventHistory.push(payload);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data, payload);
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error);
        }
      });
    }
  }

  getEventHistory(): EventPayload[] {
    return [...this.eventHistory];
  }

  getListenersCount(eventName: string): number {
    const handlers = this.listeners.get(eventName);
    return handlers ? handlers.size : 0;
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

/**
 * Plugin Registry - Registre et gestion des plugins
 */
class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private manifests = new Map<string, PluginManifest>();
  private loadingPromises = new Map<string, Promise<Plugin>>();
  private activePlugins = new Set<string>();

  async register(plugin: Plugin): Promise<void> {
    const { id } = plugin.manifest;
    
    if (this.plugins.has(id)) {
      throw new Error(`Plugin with id "${id}" is already registered`);
    }

    this.plugins.set(id, plugin);
    this.manifests.set(id, plugin.manifest);
  }

  async loadFromManifest(manifest: PluginManifest, pluginFactory: () => Promise<Plugin>): Promise<Plugin> {
    const { id } = manifest;

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    const loadPromise = pluginFactory()
      .then(plugin => {
        plugin.manifest = { ...manifest, ...plugin.manifest };
        return this.register(plugin).then(() => plugin);
      })
      .finally(() => {
        this.loadingPromises.delete(id);
      });

    this.loadingPromises.set(id, loadPromise);
    return loadPromise;
  }

  async activate(pluginId: string, context: PluginContext): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (this.activePlugins.has(pluginId)) {
      return; // Already active
    }

    try {
      await plugin.onActivate?.(context);
      this.activePlugins.add(pluginId);
      console.log(`✅ Plugin "${pluginId}" activated`);
    } catch (error) {
      console.error(`❌ Failed to activate plugin "${pluginId}":`, error);
      throw error;
    }
  }

  async deactivate(pluginId: string, context: PluginContext): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.activePlugins.has(pluginId)) {
      return;
    }

    try {
      await plugin.onDeactivate?.(context);
      this.activePlugins.delete(pluginId);
      console.log(`⏸️ Plugin "${pluginId}" deactivated`);
    } catch (error) {
      console.error(`❌ Failed to deactivate plugin "${pluginId}":`, error);
      throw error;
    }
  }

  async uninstall(pluginId: string, context: PluginContext): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    try {
      await plugin.onUninstall?.(context);
      this.plugins.delete(pluginId);
      this.manifests.delete(pluginId);
      this.activePlugins.delete(pluginId);
      console.log(`🗑️ Plugin "${pluginId}" uninstalled`);
    } catch (error) {
      console.error(`❌ Failed to uninstall plugin "${pluginId}":`, error);
      throw error;
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getManifest(pluginId: string): PluginManifest | undefined {
    return this.manifests.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getAllManifests(): PluginManifest[] {
    return Array.from(this.manifests.values());
  }

  getActivePlugins(): string[] {
    return Array.from(this.activePlugins);
  }

  async reload(pluginId: string, context: PluginContext): Promise<void> {
    await this.deactivate(pluginId, context);
    await this.activate(pluginId, context);
  }
}

/**
 * PluginAPI - Interface publique pour les plugins
 */
class PluginAPIImpl implements PluginAPI {
  private hookSystem: HookSystem;
  private eventSystem: EventSystem;
  private pluginId: string;
  private config: Record<string, any>;
  private state: Record<string, any>;
  private componentRegistry = new Map<string, React.ComponentType<any>>();
  private configKeyPrefix: string;

  constructor(
    hookSystem: HookSystem,
    eventSystem: EventSystem,
    pluginId: string,
    initialConfig: Record<string, any> = {}
  ) {
    this.hookSystem = hookSystem;
    this.eventSystem = eventSystem;
    this.pluginId = pluginId;
    this.configKeyPrefix = `plugin.${pluginId}`;
    this.config = initialConfig;
    this.state = {};
  }

  registerHook(hookName: string, handler: Function): void {
    this.hookSystem.registerHook(hookName, handler);
  }

  unregisterHook(hookName: string, handler: Function): void {
    this.hookSystem.unregisterHook(hookName, handler);
  }

  emitEvent(eventName: string, data?: any): void {
    this.eventSystem.emit(eventName, data, this.pluginId);
  }

  subscribe(eventName: string, handler: Function): () => void {
    return this.eventSystem.subscribe(eventName, handler);
  }

  addComponent(name: string, component: React.ComponentType<any>): void {
    this.componentRegistry.set(name, component);
  }

  getConfig(key?: string): any {
    if (!key) return { ...this.config };
    return this.config[key];
  }

  setConfig(key: string, value: any): void {
    this.config[key] = value;
  }

  getState(key?: string): any {
    if (!key) return { ...this.state };
    return this.state[key];
  }

  setState(key: string, value: any): void {
    this.state[key] = value;
  }

  async fetch(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const prefixedMessage = `[${this.pluginId}] ${message}`;
    
    switch (level) {
      case 'info':
        console.info(prefixedMessage, data);
        break;
      case 'warn':
        console.warn(prefixedMessage, data);
        break;
      case 'error':
        console.error(prefixedMessage, data);
        break;
    }
  }

  getComponent(name: string): React.ComponentType<any> | undefined {
    return this.componentRegistry.get(name);
  }

  getAllComponents(): Record<string, React.ComponentType<any>> {
    return Object.fromEntries(this.componentRegistry);
  }
}

/**
 * PluginSandbox - Environnement sécurisé pour les plugins
 */
class PluginSandbox {
  private originalConsole: Console;
  private restrictedConsole: Console;
  private pluginId: string;

  constructor(pluginId: string, api: PluginAPI) {
    this.pluginId = pluginId;
    this.originalConsole = console;
    this.restrictedConsole = {
      ...console,
      log: this.createRestrictedMethod('log'),
      info: this.createRestrictedMethod('info'),
      warn: this.createRestrictedMethod('warn'),
      error: this.createRestrictedMethod('error'),
      debug: this.createRestrictedMethod('debug')
    };
  }

  private createRestrictedMethod(level: keyof Console) {
    return (...args: any[]) => {
      const prefixedArgs = [`[${this.pluginId}]`, ...args];
      (this.originalConsole as any)[level](...prefixedArgs);
    };
  }

  createSandbox(api: PluginAPI): PluginSandbox {
    const sandbox: any = {
      console: this.restrictedConsole,
      fetch: fetch.bind(window),
      setTimeout: setTimeout.bind(window),
      setInterval: setInterval.bind(window),
      clearTimeout: clearTimeout.bind(window),
      clearInterval: clearInterval.bind(window),
      location: Object.freeze({
        ...window.location,
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      }),
      history: Object.freeze({
        ...window.history,
        pushState: window.history.pushState.bind(window),
        replaceState: window.history.replaceState.bind(window),
        back: window.history.back.bind(window),
        forward: window.history.forward.bind(window),
        go: window.history.go.bind(window)
      }),
      navigator: Object.freeze({
        ...window.navigator,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        languages: window.navigator.languages,
        platform: window.navigator.platform
      }),
      plugins: api,
      // Add security restrictions
      eval: undefined,
      Function: undefined,
      XMLHttpRequest: undefined,
      WebSocket: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      document: undefined,
      window: undefined,
      global: undefined
    };

    return sandbox;
  }
}

/**
 * Plugin Manager - Gestionnaire principal du système de plugins
 */
class PluginManager {
  private static instance: PluginManager;
  private registry: PluginRegistry;
  private hookSystem: HookSystem;
  private eventSystem: EventSystem;
  private pluginContexts = new Map<string, PluginContext>();

  private constructor() {
    this.registry = new PluginRegistry();
    this.hookSystem = new HookSystem();
    this.eventSystem = new EventSystem();
    this.initializeCoreHooks();
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  private initializeCoreHooks(): void {
    // Register core hooks
    this.hookSystem.registerDefinition({
      name: 'app.init',
      description: 'Called when the application initializes',
      priority: 1
    });

    this.hookSystem.registerDefinition({
      name: 'app.destroy',
      description: 'Called when the application is destroyed',
      priority: 1
    });

    this.hookSystem.registerDefinition({
      name: 'component.render',
      description: 'Called before component renders',
      parameters: ['component', 'props'],
      returns: 'modifiedProps'
    });

    this.hookSystem.registerDefinition({
      name: 'theme.change',
      description: 'Called when theme changes',
      parameters: ['newTheme', 'oldTheme']
    });

    this.hookSystem.registerDefinition({
      name: 'user.login',
      description: 'Called when user logs in',
      parameters: ['user', 'session']
    });
  }

  async loadPlugin(manifest: PluginManifest, pluginFactory: () => Promise<Plugin>): Promise<Plugin> {
    return this.registry.loadFromManifest(manifest, pluginFactory);
  }

  async installPlugin(plugin: Plugin): Promise<void> {
    const context = this.createContext(plugin.manifest);
    this.pluginContexts.set(plugin.manifest.id, context);

    await plugin.onInstall?.(context);
    console.log(`📦 Plugin "${plugin.manifest.name}" installed`);
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const context = this.pluginContexts.get(pluginId);
    if (!context) {
      throw new Error(`Plugin context for "${pluginId}" not found`);
    }

    await this.registry.activate(pluginId, context);
    
    // Execute app init hook
    await this.hookSystem.executeHook('plugin.enabled', { pluginId, manifest: this.registry.getManifest(pluginId) });
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const context = this.pluginContexts.get(pluginId);
    if (!context) {
      throw new Error(`Plugin context for "${pluginId}" not found`);
    }

    await this.registry.deactivate(pluginId, context);
    
    // Execute app init hook
    await this.hookSystem.executeHook('plugin.disabled', { pluginId, manifest: this.registry.getManifest(pluginId) });
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    const context = this.pluginContexts.get(pluginId);
    if (!context) {
      throw new Error(`Plugin context for "${pluginId}" not found`);
    }

    await this.registry.uninstall(pluginId, context);
    this.pluginContexts.delete(pluginId);
  }

  private createContext(manifest: PluginManifest): PluginContext {
    const api = new PluginAPIImpl(
      this.hookSystem,
      this.eventSystem,
      manifest.id,
      this.loadPluginConfig(manifest.id)
    );

    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      api,
      config: api.getConfig(),
      state: {}
    };
  }

  private loadPluginConfig(pluginId: string): Record<string, any> {
    // Load configuration from localStorage or API
    try {
      const configKey = `nexusg.plugin.${pluginId}.config`;
      const saved = localStorage.getItem(configKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn(`Failed to load config for plugin "${pluginId}":`, error);
      return {};
    }
  }

  // Hook and Event system access
  getHookSystem(): HookSystem {
    return this.hookSystem;
  }

  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  // Global hooks execution
  async executeInitHooks(): Promise<void> {
    await this.hookSystem.executeHook('app.init');
  }

  async executeDestroyHooks(): Promise<void> {
    await this.hookSystem.executeHook('app.destroy');
  }
}

/**
 * React Context for Plugin System
 */
const PluginSystemContext = createContext<{
  pluginManager: PluginManager;
  isLoading: boolean;
  enabledPlugins: string[];
}>({
  pluginManager: PluginManager.getInstance(),
  isLoading: false,
  enabledPlugins: []
});

/**
 * Plugin System Provider
 */
export const PluginSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pluginManager] = useState(() => PluginManager.getInstance());
  const [isLoading, setIsLoading] = useState(true);
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await pluginManager.executeInitHooks();
        setEnabledPlugins(pluginManager.getRegistry().getActivePlugins());
      } catch (error) {
        console.error('Failed to initialize plugin system:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      pluginManager.executeDestroyHooks();
    };
  }, [pluginManager]);

  return (
    <PluginSystemContext.Provider value={{ pluginManager, isLoading, enabledPlugins }}>
      {children}
    </PluginSystemContext.Provider>
  );
};

/**
 * Hook to use Plugin System
 */
export const usePluginSystem = () => {
  const context = useContext(PluginSystemContext);
  if (!context) {
    throw new Error('usePluginSystem must be used within PluginSystemProvider');
  }
  return context;
};

/**
 * Hook to use specific plugin
 */
export const usePlugin = (pluginId: string) => {
  const { pluginManager } = usePluginSystem();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const registry = pluginManager.getRegistry();
    const foundPlugin = registry.getPlugin(pluginId);
    
    if (foundPlugin) {
      setPlugin(foundPlugin);
      setIsActive(registry.getActivePlugins().includes(pluginId));
    }
  }, [pluginId, pluginManager]);

  return { plugin, isActive };
};

/**
 * Hook to execute hooks
 */
export const useHook = () => {
  const { pluginManager } = usePluginSystem();
  const hookSystem = pluginManager.getHookSystem();

  const executeHook = useCallback(async <T>(hookName: string, ...args: any[]): Promise<T[]> => {
    return hookSystem.executeHook<T>(hookName, ...args);
  }, [hookSystem]);

  const executeHookFirst = useCallback(async <T>(hookName: string, ...args: any[]): Promise<T | null> => {
    return hookSystem.executeHookFirst<T>(hookName, ...args);
  }, [hookSystem]);

  return { executeHook, executeHookFirst };
};

/**
 * Component to render plugin components
 */
export const PluginComponent: React.FC<{
  pluginId: string;
  componentName: string;
  props?: Record<string, any>;
}> = ({ pluginId, componentName, props = {} }) => {
  const { plugin } = usePlugin(pluginId);

  if (!plugin) {
    return <div>Plugin "{pluginId}" not found</div>;
  }

  const component = plugin.component || (plugin as any)[componentName];
  
  if (!component) {
    return <div>Component "{componentName}" not found in plugin "{pluginId}"</div>;
  }

  const Component = component;
  return <Component {...props} />;
};

export default PluginManager;