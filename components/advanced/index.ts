// ==========================================================================
// NEXUSG LITE - COMPOSANTS AVANCÉS
// Expansion Fonctionnelle - Option C.1
// ==========================================================================

// ==========================================================================
// COMPOSANTS D'ANIMATION
// ==========================================================================
export {
  LoadingSpinner,
  SkeletonLoader,
  TransitionContainer,
  MicroAnimation,
  FadeInOut,
  AnimatedCounter,
  AnimatedProgressBar,
  PulseLoader,
  BounceLoader,
  ScaleInOut,
} from './animations';

export { ProgressCounter, TimeCounter } from './animations/AnimatedCounter';

// ==========================================================================
// COMPOSANTS DE THÈME DYNAMIQUE
// ==========================================================================
export {
  ThemeProvider,
  ThemeToggle,
  ColorCustomizer,
  useTheme,
} from './theme';

export type { Theme, ThemeConfig, ColorPalette } from './theme/ThemeTypes';

// ==========================================================================
// COMPOSANTS DE PERFORMANCE
// ==========================================================================
export {
  VirtualScroller,
  InfiniteScroll,
  LazyLoadWrapper,
  OptimizedImage,
  PerformanceMonitor,
  IntersectionObserver,
  Debounce,
  Throttle,
} from './performance';

export { AvatarImage, ResponsiveImage } from './performance/OptimizedImage';

// ==========================================================================
// UTILITAIRES ET HELPERS
// ==========================================================================

/**
 * Hook pour détecter les préférences utilisateur
 */
export const useUserPreferences = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = React.useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = {
      motion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      dark: window.matchMedia('(prefers-color-scheme: dark)'),
      contrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updatePreferences = () => {
      setPrefersReducedMotion(mediaQuery.motion.matches);
      setPrefersDarkMode(mediaQuery.dark.matches);
      setPrefersHighContrast(mediaQuery.contrast.matches);
    };

    updatePreferences();

    // Listen for changes
    mediaQuery.motion.addEventListener('change', updatePreferences);
    mediaQuery.dark.addEventListener('change', updatePreferences);
    mediaQuery.contrast.addEventListener('change', updatePreferences);

    return () => {
      mediaQuery.motion.removeEventListener('change', updatePreferences);
      mediaQuery.dark.removeEventListener('change', updatePreferences);
      mediaQuery.contrast.removeEventListener('change', updatePreferences);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  };
};

/**
 * Composant Provider principal pour tous les composants avancés
 */
interface AdvancedComponentsProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'auto';
  enableAnimations?: boolean;
  enablePerformance?: boolean;
  enableThemeCustomization?: boolean;
}

export const AdvancedComponentsProvider: React.FC<AdvancedComponentsProviderProps> = ({
  children,
  defaultTheme = 'auto',
  enableAnimations = true,
  enablePerformance = true,
  enableThemeCustomization = true,
}) => {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <div className="advanced-components">
        {/* Les styles CSS sont importés via le fichier CSS principal */}
        {children}
      </div>
    </ThemeProvider>
  );
};

// ==========================================================================
// CONSTANTES ET CONFIGURATIONS
// ==========================================================================

/**
 *Configurations par défaut pour les animations
 */
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeIn: 'cubic-bezier(0.5, 0, 0.75, 0)',
    easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  stagger: {
    small: 50,
    medium: 100,
    large: 200,
  },
} as const;

/**
 *Palettes de couleurs prédéfinies
 */
export const COLOR_PALETTES = {
  sunset: {
    primary: { 50: '#fef7ee', 500: '#f97316', 900: '#9a3412' },
    secondary: { 50: '#fdf2f8', 500: '#ec4899', 900: '#831843' },
  },
  forest: {
    primary: { 50: '#f0fdf4', 500: '#22c55e', 900: '#14532d' },
    secondary: { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' },
  },
  ocean: {
    primary: { 50: '#ecfeff', 500: '#06b6d4', 900: '#164e63' },
    secondary: { 50: '#faf5ff', 500: '#a855f7', 900: '#581c87' },
  },
  monochrome: {
    primary: { 50: '#f9fafb', 500: '#6b7280', 900: '#111827' },
    secondary: { 50: '#f9fafb', 500: '#374151', 900: '#030712' },
  },
} as const;

/**
 *Tailles prédéfinies
 */
export const SIZE_CONFIG = {
  xs: { spinner: 'w-3 h-3', avatar: 'w-6 h-6', spacing: 'p-1' },
  sm: { spinner: 'w-4 h-4', avatar: 'w-8 h-8', spacing: 'p-2' },
  md: { spinner: 'w-6 h-6', avatar: 'w-10 h-10', spacing: 'p-3' },
  lg: { spinner: 'w-8 h-8', avatar: 'w-12 h-12', spacing: 'p-4' },
  xl: { spinner: 'w-12 h-12', avatar: 'w-16 h-16', spacing: 'p-6' },
} as const;

// ==========================================================================
// TYPES UTILITAIRES
// ==========================================================================

/**
 *Type pour les variants de composants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
export type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 *Configuration de performance
 */
export interface PerformanceConfig {
  enableVirtualScrolling?: boolean;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  virtualScrollerThreshold?: number;
  lazyLoadRootMargin?: string;
  imageQuality?: number;
  cacheStrategy?: 'memory' | 'localStorage' | 'sessionStorage';
}

// ==========================================================================
// EXPORT PRINCIPAL
// ==========================================================================

/**
 * Export principal avec tous les composants avancés
 */
export default {
  // Animation Components
  LoadingSpinner,
  SkeletonLoader,
  AnimatedCounter,
  
  // Theme Components
  ThemeProvider,
  ThemeToggle,
  
  // Performance Components
  VirtualScroller,
  OptimizedImage,
  
  // Utils
  useUserPreferences,
  ANIMATION_CONFIG,
  COLOR_PALETTES,
  SIZE_CONFIG,
  
  // Provider
  AdvancedComponentsProvider,
};

// Import React for JSX in provider component
import React from 'react';