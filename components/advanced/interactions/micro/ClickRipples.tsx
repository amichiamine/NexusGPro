import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface ClickRipplesProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  disabled?: boolean;
  centered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface RippleEffectProps {
  x: number;
  y: number;
  color: string;
  duration: number;
  size: number;
}

interface MultiRippleProps {
  children: React.ReactNode;
  colors?: string[];
  duration?: number;
  delay?: number;
  disabled?: boolean;
  maxRipples?: number;
  className?: string;
}

interface RippleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  duration?: number;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

interface RippleInputProps {
  placeholder?: string;
  color?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Composant principal ClickRipples
export const ClickRipples: React.FC<ClickRipplesProps> = ({
  children,
  color = '#ffffff',
  duration = 600,
  disabled = false,
  centered = false,
  className,
  style
}) => {
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const createRipple = useCallback((x: number, y: number) => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const distanceFromCenter = centered ? size / 2 : 0;
    
    const ripple: RippleEffectProps = {
      x: centered ? rect.width / 2 : x - rect.left,
      y: centered ? rect.height / 2 : y - rect.top,
      color,
      duration,
      size: size * 2
    };

    setRipples(prev => [...prev, ripple]);

    // Nettoyer le ripple après l'animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r !== ripple));
    }, duration);
  }, [color, duration, disabled, centered]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    createRipple(e.clientX, e.clientY);
  }, [createRipple, disabled]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    createRipple(touch.clientX, touch.clientY);
  }, [createRipple, disabled]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'relative overflow-hidden select-none',
        disabled ? 'cursor-default' : 'cursor-pointer',
        className
      )}
      style={style}
      onClick={handleClick}
      onTouchStart={handleTouch}
    >
      {children}
      
      {/* Rendu des ripples */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple, index) => (
            <motion.div
              key={`${ripple.x}-${ripple.y}-${index}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: ripple.color,
                opacity: 0.3
              }}
              initial={{ 
                scale: 0, 
                opacity: 0.6,
                borderRadius: '50%'
              }}
              animate={{ 
                scale: 2, 
                opacity: 0,
                transition: { duration: ripple.duration / 1000, ease: 'easeOut' }
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Composant MultiRipple (plusieurs ripples simultanées)
export const MultiRipple: React.FC<MultiRippleProps> = ({
  children,
  colors = ['#ffffff', '#3B82F6', '#10B981', '#F59E0B'],
  duration = 800,
  delay = 100,
  disabled = false,
  maxRipples = 3,
  className
}) => {
  const [ripples, setRipples] = useState<Array<RippleEffectProps & { id: string }>>([]);

  const createMultiRipple = useCallback((x: number, y: number) => {
    if (disabled) return;

    const element = document.elementFromPoint(x, y)?.closest('.multi-ripple');
    if (!element) return;

    const rect = (element as HTMLElement).getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    const newRipples = colors.slice(0, maxRipples).map((color, index) => ({
      id: `${x}-${y}-${index}-${Date.now()}`,
      x: rect.width / 2 + (index - 1) * 20, // Décalage horizontal
      y: rect.height / 2 + (index - 1) * 20, // Décalage vertical
      color,
      duration: duration + (index * delay),
      size: size * (1 + index * 0.5) // Taille croissante
    }));

    setRipples(prev => [...prev, ...newRipples]);

    // Nettoyer après la dernière ripple
    setTimeout(() => {
      setRipples(prev => prev.filter(r => !newRipples.find(nr => nr.id === r.id)));
    }, duration + (maxRipples - 1) * delay);
  }, [colors, duration, delay, disabled, maxRipples]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    createMultiRipple(e.clientX, e.clientY);
  }, [createMultiRipple]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    createMultiRipple(touch.clientX, touch.clientY);
  }, [createMultiRipple]);

  return (
    <div
      className={cn(
        'multi-ripple relative overflow-hidden select-none',
        disabled ? 'cursor-default' : 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onTouchStart={handleTouch}
    >
      {children}
      
      {/* Rendu des ripples multiples */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: ripple.color,
                opacity: 0.4
              }}
              initial={{ 
                scale: 0, 
                opacity: 0.8,
                borderRadius: '50%'
              }}
              animate={{ 
                scale: 3, 
                opacity: 0,
                transition: { 
                  duration: ripple.duration / 1000, 
                  ease: 'easeOut',
                  delay: colors.indexOf(ripple.color) * delay / 1000
                }
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Composant RippleButton avec styles
export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  color = '#ffffff',
  duration = 600,
  disabled = false,
  onClick,
  className
}) => {
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);

  const createRipple = useCallback((x: number, y: number) => {
    const button = document.querySelector('.ripple-button') as HTMLElement;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    const ripple: RippleEffectProps = {
      x: x - rect.left,
      y: y - rect.top,
      color,
      duration,
      size
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r !== ripple));
    }, duration);
  }, [color, duration]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    createRipple(e.clientX, e.clientY);
    onClick?.();
  }, [createRipple, disabled, onClick]);

  // Styles selon la variante
  const getVariantStyles = () => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md',
      ghost: 'text-gray-700 hover:bg-gray-100 shadow-md'
    };
    return variants[variant];
  };

  // Styles selon la taille
  const getSizeStyles = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };
    return sizes[size];
  };

  const buttonStyles = cn(
    'ripple-button relative overflow-hidden select-none transition-all duration-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    getVariantStyles(),
    getSizeStyles(),
    className
  );

  return (
    <div
      className={buttonStyles}
      onClick={handleClick}
    >
      {children}
      
      {/* Rendu des ripples */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple, index) => (
            <motion.div
              key={`${ripple.x}-${ripple.y}-${index}`}
              className="absolute rounded-full"
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: ripple.color
              }}
              initial={{ 
                scale: 0, 
                opacity: 0.6 
              }}
              animate={{ 
                scale: 2, 
                opacity: 0,
                transition: { duration: ripple.duration / 1000, ease: 'easeOut' }
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Composant RippleInput
export const RippleInput: React.FC<RippleInputProps> = ({
  placeholder = 'Enter text...',
  color = '#3B82F6',
  duration = 400,
  disabled = false,
  className,
  style
}) => {
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const createRipple = useCallback((x: number, y: number) => {
    const input = document.querySelector('.ripple-input') as HTMLElement;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    
    const ripple: RippleEffectProps = {
      x: x - rect.left,
      y: y - rect.top,
      color,
      duration,
      size
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r !== ripple));
    }, duration);
  }, [color, duration]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    createRipple(e.clientX, e.clientY);
  }, [createRipple, disabled]);

  return (
    <div className="relative">
      <input
        type="text"
        className={cn(
          'ripple-input w-full px-4 py-3 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          isFocused ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={style}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
      />
      
      {/* Effet de focus */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isFocused 
            ? `0 0 0 2px ${color}40`
            : '0 0 0 0px transparent'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Rendu des ripples */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple, index) => (
            <motion.div
              key={`${ripple.x}-${ripple.y}-${index}`}
              className="absolute rounded-full"
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: color
              }}
              initial={{ 
                scale: 0, 
                opacity: 0.3 
              }}
              animate={{ 
                scale: 1.5, 
                opacity: 0,
                transition: { duration: ripple.duration / 1000, ease: 'easeOut' }
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hook personnalisé pour les ripples
export const useRipples = (
  options: {
    color?: string;
    duration?: number;
    disabled?: boolean;
    centered?: boolean;
  } = {}
) => {
  const { color = '#ffffff', duration = 600, disabled = false, centered = false } = options;
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);

  const createRipple = useCallback((x: number, y: number, customColor?: string, customDuration?: number) => {
    if (disabled) return;

    const ripple: RippleEffectProps = {
      x: centered ? 0 : x,
      y: centered ? 0 : y,
      color: customColor || color,
      duration: customDuration || duration,
      size: 200 // Taille fixe pour le hook
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r !== ripple));
    }, ripple.duration);
  }, [color, duration, disabled, centered]);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    createRipple,
    clearRipples
  };
};

// Composant de démonstration des ripples
interface RipplesDemoProps {
  className?: string;
}

export const RipplesDemo: React.FC<RipplesDemoProps> = ({ className }) => {
  const [rippleCount, setRippleCount] = useState(0);

  const demoButtons = [
    { text: 'Primary', variant: 'primary' as const, color: '#ffffff' },
    { text: 'Secondary', variant: 'secondary' as const, color: '#ffffff' },
    { text: 'Outline', variant: 'outline' as const, color: '#3B82F6' },
    { text: 'Ghost', variant: 'ghost' as const, color: '#3B82F6' }
  ];

  const handleRippleButtonClick = () => {
    setRippleCount(prev => prev + 1);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Click Ripples Demo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Clicks: {rippleCount}
        </p>
      </div>
      
      {/* Boutons avec effets de ripple */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoButtons.map((button) => (
          <RippleButton
            key={button.text}
            variant={button.variant}
            onClick={handleRippleButtonClick}
            color={button.color}
          >
            {button.text}
          </RippleButton>
        ))}
      </div>
      
      {/* Input avec ripple */}
      <div className="max-w-md mx-auto">
        <RippleInput 
          placeholder="Input with ripple effect"
          onChange={() => {}}
        />
      </div>
      
      {/* Démonstration de multi-ripples */}
      <div className="text-center">
        <MultiRipple className="inline-block">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Multi Ripple Effect
          </button>
        </MultiRipple>
      </div>
    </div>
  );
};

export default ClickRipples;