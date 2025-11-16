import React, { useState } from 'react';
import { cn } from '@/utils';
import { useTheme } from './ThemeContext';
import { Theme } from './ThemeTypes';

interface ThemeToggleProps {
  variant?: 'icon' | 'text' | 'button' | 'dropdown';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
  enableSystem?: boolean;
  persistence?: boolean;
}

/**
 * Composant ThemeToggle pour basculer entre les modes Light/Dark/Auto
 * Support complet des variantes et de l'accessibilité
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'md',
  showLabels = true,
  className,
  enableSystem = true,
  persistence = true,
}) => {
  const { theme, isDark, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sizeClasses = {
    xs: 'p-1 text-xs',
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Available theme options
  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Clair', icon: '☀️' },
    { value: 'dark', label: 'Sombre', icon: '🌙' },
    ...(enableSystem ? [{ value: 'auto', label: 'Auto', icon: '🖥️' }] : [])
  ];

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (variant === 'dropdown') {
      setIsDropdownOpen(false);
    }
  };

  // Get current theme option
  const currentThemeOption = themeOptions.find(option => option.value === theme) || themeOptions[0];

  const toggleVariants = {
    icon: (
      <button
        onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
        className={cn(
          "rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
          sizeClasses[size],
          className
        )}
        aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
        title={`Actuel: ${currentThemeOption.label} - Cliquer pour changer`}
      >
        <div className="relative w-6 h-6">
          {/* Sun icon */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}>
            <svg className={cn("w-full h-full", iconSizes[size])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          
          {/* Moon icon */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}>
            <svg className={cn("w-full h-full", iconSizes[size])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </div>
      </button>
    ),

    text: (
      <div className={cn("flex items-center space-x-2", className)}>
        <button
          onClick={() => handleThemeChange('light')}
          disabled={theme === 'light'}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-all duration-200",
            theme === 'light' 
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
            sizeClasses[size]
          )}
        >
          ☀️ Clair
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          disabled={theme === 'dark'}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-all duration-200",
            theme === 'dark' 
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
            sizeClasses[size]
          )}
        >
          🌙 Sombre
        </button>
        {enableSystem && (
          <button
            onClick={() => handleThemeChange('auto')}
            disabled={theme === 'auto'}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-all duration-200",
              theme === 'auto' 
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              sizeClasses[size]
            )}
          >
            🖥️ Auto
          </button>
        )}
      </div>
    ),

    button: (
      <button
        onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
          "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          sizeClasses[size],
          className
        )}
        aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
      >
        <div className="relative w-5 h-5">
          {/* Sun icon */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          
          {/* Moon icon */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </div>
        {showLabels && (
          <span className="text-sm">
            {isDark ? 'Mode Sombre' : 'Mode Clair'}
          </span>
        )}
      </button>
    ),

    dropdown: (
      <div className={cn("relative inline-block text-left", className)}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
            "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
            "min-w-[120px] justify-between",
            sizeClasses[size]
          )}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          aria-label="Sélectionner un thème"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentThemeOption.icon}</span>
            {showLabels && (
              <span className="text-sm">{currentThemeOption.label}</span>
            )}
          </div>
          <svg 
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isDropdownOpen ? "rotate-180" : "rotate-0"
            )}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150",
                    theme === option.value
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                    theme === option.value && "border-r-2 border-primary-500"
                  )}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {theme === option.value && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variant === 'dropdown' && isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant, isDropdownOpen]);

  return toggleVariants[variant];
};

export default ThemeToggle;