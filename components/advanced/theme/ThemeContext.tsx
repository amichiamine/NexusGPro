import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, ThemeConfig, ColorPalette, ThemeContextType } from './ThemeTypes';

// Default color palettes
const defaultLightColors: ColorPalette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

const defaultDarkColors: ColorPalette = {
  primary: {
    50: '#3b82f6',
    100: '#2563eb',
    200: '#1d4ed8',
    300: '#1e40af',
    400: '#1e3a8a',
    500: '#1e3a8a',
    600: '#1e3a8a',
    700: '#1e3a8a',
    800: '#1e3a8a',
    900: '#0f172a'
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  success: {
    50: '#14532d',
    100: '#166534',
    200: '#166534',
    300: '#15803d',
    400: '#16a34a',
    500: '#22c55e',
    600: '#4ade80',
    700: '#86efac',
    800: '#bbf7d0',
    900: '#dcfce7'
  },
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#92400e',
    300: '#b45309',
    400: '#d97706',
    500: '#f59e0b',
    600: '#fbbf24',
    700: '#fcd34d',
    800: '#fde68a',
    900: '#fef3c7'
  },
  danger: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#991b1b',
    300: '#b91c1c',
    400: '#dc2626',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
    800: '#fecaca',
    900: '#fee2e2'
  },
  gray: {
    50: '#111827',
    100: '#1f2937',
    200: '#374151',
    300: '#4b5563',
    400: '#6b7280',
    500: '#9ca3af',
    600: '#d1d5db',
    700: '#e5e7eb',
    800: '#f3f4f6',
    900: '#f9fafb'
  }
};

const defaultConfig: ThemeConfig = {
  theme: 'auto',
  colors: defaultLightColors,
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Georgia, serif',
    mono: 'Monaco, Consolas, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook pour utiliser le contexte de thème
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  enablePersistence?: boolean;
}

/**
 * Provider de thème avec support complet du système, persistence et personnalisation
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'auto',
  storageKey = 'nexusg-theme',
  enableSystem = true,
  enablePersistence = true,
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);
  const [colors, setColorsState] = useState<ColorPalette>(defaultLightColors);
  const [customTheme, setCustomThemeState] = useState<ThemeConfig | null>(null);

  // Get system theme preference
  const getSystemTheme = (): Theme => {
    if (!enableSystem) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Determine if dark mode is active
  const getIsDark = (currentTheme: Theme): boolean => {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    return getSystemTheme() === 'dark';
  };

  // Apply theme to document
  const applyTheme = (currentTheme: Theme, currentColors: ColorPalette) => {
    const root = document.documentElement;
    const isDarkMode = getIsDark(currentTheme);
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', currentTheme);
    root.setAttribute('data-mode', isDarkMode ? 'dark' : 'light');

    // Apply CSS custom properties for colors
    Object.entries(currentColors).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, value);
      });
    });

    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentColors.primary[600]);
    }
  };

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const newIsDark = getIsDark(newTheme);
    setIsDark(newIsDark);
    
    if (enablePersistence) {
      localStorage.setItem(storageKey, newTheme);
    }

    // Use appropriate color palette
    const newColors = newTheme === 'dark' ? defaultDarkColors : defaultLightColors;
    setColorsState(newColors);
    applyTheme(newTheme, newColors);
  };

  // Set colors function
  const setColors = (newColors: Partial<ColorPalette>) => {
    const updatedColors = { ...colors, ...newColors };
    setColorsState(updatedColors);
    applyTheme(theme, updatedColors);
  };

  // Set custom theme
  const setCustomTheme = (newTheme: ThemeConfig) => {
    setCustomThemeState(newTheme);
    setTheme(newTheme.theme);
    setColors(newTheme.colors);
  };

  // Reset to default
  const resetTheme = () => {
    setThemeState(defaultTheme);
    setIsDark(getIsDark(defaultTheme));
    setColorsState(defaultLightColors);
    setCustomThemeState(null);
    
    if (enablePersistence) {
      localStorage.removeItem(storageKey);
    }
    
    applyTheme(defaultTheme, defaultLightColors);
  };

  // Initialize theme
  useEffect(() => {
    // Load from localStorage if persistence is enabled
    let initialTheme = defaultTheme;
    if (enablePersistence) {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        initialTheme = savedTheme as Theme;
      }
    }

    // Set initial state
    setThemeState(initialTheme);
    setIsDark(getIsDark(initialTheme));
    
    // Use appropriate colors for initial theme
    const initialColors = initialTheme === 'dark' ? defaultDarkColors : defaultLightColors;
    setColorsState(initialColors);

    // Apply theme
    applyTheme(initialTheme, initialColors);

    // Listen for system theme changes
    if (enableSystem && initialTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newIsDark = getIsDark('auto');
        setIsDark(newIsDark);
        const systemColors = newIsDark ? defaultDarkColors : defaultLightColors;
        setColorsState(systemColors);
        applyTheme('auto', systemColors);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [defaultTheme, storageKey, enableSystem, enablePersistence]);

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme,
    colors,
    setColors,
    customTheme,
    setCustomTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;