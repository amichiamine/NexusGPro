import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface FocusAnimationsProps {
  children: React.ReactNode;
  effect?: 'ring' | 'glow' | 'scale' | 'border' | 'shadow' | 'pulse' | 'ripple' | 'shimmer';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  duration?: number;
  disabled?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface FocusableInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  effect?: FocusAnimationsProps['effect'];
  color?: string;
  size?: FocusAnimationsProps['size'];
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  className?: string;
}

interface FocusableButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  effect?: FocusAnimationsProps['effect'];
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface FocusableCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  effect?: FocusAnimationsProps['effect'];
  color?: string;
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}

interface FocusIndicatorProps {
  isFocused: boolean;
  effect?: FocusAnimationsProps['effect'];
  color?: string;
  size?: FocusAnimationsProps['size'];
  className?: string;
}

// Composant principal FocusAnimations
export const FocusAnimations: React.FC<FocusAnimationsProps> = ({
  children,
  effect = 'ring',
  color = '#3B82F6',
  size = 'md',
  duration = 300,
  disabled = false,
  animated = true,
  className,
  style
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Configuration des tailles
  const getSizeConfig = () => {
    const sizes = {
      sm: { ring: 2, glow: 8, scale: 1.01, borderWidth: 1 },
      md: { ring: 3, glow: 12, scale: 1.02, borderWidth: 2 },
      lg: { ring: 4, glow: 16, scale: 1.03, borderWidth: 2 },
      xl: { ring: 6, glow: 20, scale: 1.05, borderWidth: 3 }
    };
    return sizes[size];
  };

  const sizeConfig = getSizeConfig();

  // Gestionnaires d'événements
  const handleFocus = useCallback(() => {
    if (!disabled) setIsFocused(true);
  }, [disabled]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Configuration des effets
  const getEffectConfig = () => {
    if (!animated) return {};

    const configs = {
      ring: {
        boxShadow: isFocused 
          ? `0 0 0 ${sizeConfig.ring}px ${color}40, 0 0 0 ${sizeConfig.ring * 1.5}px ${color}20`
          : '0 0 0 0px transparent',
        transition: { duration: duration / 1000 }
      },
      glow: {
        boxShadow: isFocused 
          ? `0 0 ${sizeConfig.glow}px ${color}60, 0 0 ${sizeConfig.glow * 2}px ${color}30`
          : 'none',
        transition: { duration: duration / 1000 }
      },
      scale: {
        scale: isFocused ? sizeConfig.scale : 1,
        transition: { duration: duration / 1000, type: 'spring', stiffness: 300 }
      },
      border: {
        borderColor: isFocused ? color : '#E5E7EB',
        borderWidth: isFocused ? `${sizeConfig.borderWidth}px` : '1px',
        transition: { duration: duration / 1000 }
      },
      shadow: {
        boxShadow: isFocused 
          ? `0 4px 12px ${color}30, 0 2px 4px ${color}20`
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: { duration: duration / 1000 }
      },
      pulse: {
        scale: isFocused ? [1, sizeConfig.scale, 1] : 1,
        opacity: isFocused ? [1, 0.8, 1] : 1,
        transition: { 
          duration: duration / 1000,
          repeat: isFocused ? Infinity : 0,
          repeatType: 'reverse'
        }
      },
      ripple: {
        '--ripple-color': color,
        transition: { duration: duration / 1000 }
      },
      shimmer: {
        opacity: isFocused ? 1 : 0.8,
        transition: { duration: duration / 1000 }
      }
    };

    return configs[effect];
  };

  const effectConfig = getEffectConfig();

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'relative transition-all duration-300',
        disabled && 'cursor-default',
        className
      )}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={disabled ? -1 : 0}
      animate={effectConfig}
    >
      {children}
      
      {/* Effet shimmer pour shimmer effect */}
      {effect === 'shimmer' && isFocused && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: duration / 1000,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Effet ripple pour ripple effect */}
      {effect === 'ripple' && isFocused && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{
            duration: duration / 1000,
            ease: 'easeOut'
          }}
        />
      )}
      
      {/* Indicateur de focus pour l'accessibilité */}
      {isFocused && (
        <motion.div
          className="absolute -inset-1 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow: `0 0 0 2px ${color}60`
          }}
        />
      )}
    </motion.div>
  );
};

// Composant Input avec animations de focus
export const FocusableInput: React.FC<FocusableInputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  effect = 'ring',
  color = '#3B82F6',
  size = 'md',
  disabled = false,
  required = false,
  error = false,
  success = false,
  className
}) => {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);

  // Configuration des tailles
  const getSizeStyles = () => {
    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
      xl: 'px-6 py-4 text-xl'
    };
    return sizes[size];
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Couleurs selon l'état
  const getBorderColor = () => {
    if (error) return '#EF4444';
    if (success) return '#10B981';
    if (isFocused) return color;
    return '#D1D5DB';
  };

  const inputStyles = cn(
    'w-full border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-0',
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    getSizeStyles(),
    className
  );

  return (
    <FocusAnimations
      effect={effect}
      color={getBorderColor()}
      size={size}
      disabled={disabled}
      className="w-full"
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value !== undefined ? value : inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={inputStyles}
        style={{
          borderColor: getBorderColor()
        }}
      />
    </FocusAnimations>
  );
};

// Composant Button avec animations de focus
export const FocusableButton: React.FC<FocusableButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  onFocus,
  onBlur,
  effect = 'ring',
  color = '#3B82F6',
  disabled = false,
  loading = false,
  className
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Styles selon la variante
  const getVariantStyles = () => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-gray-700 hover:bg-gray-100'
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
    'relative rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    loading && 'cursor-wait',
    getVariantStyles(),
    getSizeStyles(),
    className
  );

  const focusRingColor = variant === 'outline' || variant === 'ghost' ? color : '#3B82F6';

  return (
    <FocusAnimations
      effect={effect}
      color={focusRingColor}
      size={size}
      disabled={disabled || loading}
      className="w-full"
    >
      <button
        type="button"
        onClick={onClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled || loading}
        className={buttonStyles}
        style={{
          '--focus-color': focusRingColor
        } as React.CSSProperties}
      >
        <span className={cn('flex items-center justify-center', loading && 'opacity-0')}>
          {children}
        </span>
        
        {/* Indicateur de chargement */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </button>
    </FocusAnimations>
  );
};

// Composant Card avec animations de focus
export const FocusableCard: React.FC<FocusableCardProps> = ({
  children,
  onClick,
  onFocus,
  onBlur,
  effect = 'shadow',
  color = '#3B82F6',
  hoverable = false,
  clickable = false,
  className
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const cardStyles = cn(
    'bg-white rounded-lg border shadow-sm transition-all duration-300',
    (hoverable || clickable) && 'hover:shadow-md cursor-pointer',
    isFocused && 'ring-2 ring-opacity-50',
    className
  );

  return (
    <FocusAnimations
      effect={effect}
      color={color}
      size="md"
      disabled={!clickable}
      className={cardStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={clickable ? 0 : -1}
    >
      <div className="p-4">
        {children}
      </div>
      
      {/* Indicateur de focus */}
      {isFocused && (
        <motion.div
          className="absolute -inset-1 rounded-lg border-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ borderColor: color }}
        />
      )}
    </FocusAnimations>
  );
};

// Composant indicateur de focus
export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  isFocused,
  effect = 'ring',
  color = '#3B82F6',
  size = 'md',
  className
}) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setShowIndicator(true);
    } else {
      const timer = setTimeout(() => setShowIndicator(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const getIndicatorConfig = () => {
    const sizes = {
      sm: { size: 'w-2 h-2', offset: '-inset-1' },
      md: { size: 'w-3 h-3', offset: '-inset-1' },
      lg: { size: 'w-4 h-4', offset: '-inset-2' },
      xl: { size: 'w-6 h-6', offset: '-inset-2' }
    };
    return sizes[size];
  };

  const indicatorConfig = getIndicatorConfig();
  const duration = 200;

  return (
    <AnimatePresence>
      {showIndicator && isFocused && (
        <motion.div
          className={cn(
            'absolute pointer-events-none rounded-full',
            indicatorConfig.size,
            indicatorConfig.offset,
            className
          )}
          style={{ backgroundColor: color }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ 
            scale: 1, 
            opacity: 0,
            transition: { 
              duration: duration / 1000,
              ease: 'easeOut'
            }
          }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
};

// Hook personnalisé pour les animations de focus
export const useFocusAnimations = (
  options: {
    effect?: FocusAnimationsProps['effect'];
    color?: string;
    duration?: number;
    disabled?: boolean;
  } = {}
) => {
  const { effect = 'ring', color = '#3B82F6', duration = 300, disabled = false } = options;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    if (!disabled) setIsFocused(true);
  }, [disabled]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Configuration de l'animation
  const getAnimationConfig = useCallback(() => {
    const baseConfig = { duration: duration / 1000 };
    
    const effects = {
      ring: {
        boxShadow: isFocused 
          ? `0 0 0 3px ${color}40, 0 0 0 6px ${color}20`
          : '0 0 0 0px transparent'
      },
      glow: {
        boxShadow: isFocused 
          ? `0 0 12px ${color}60, 0 0 24px ${color}30`
          : 'none'
      },
      scale: {
        scale: isFocused ? 1.02 : 1
      },
      pulse: {
        scale: isFocused ? [1, 1.02, 1] : 1,
        opacity: isFocused ? [1, 0.9, 1] : 1,
        transition: {
          duration: duration / 1000,
          repeat: isFocused ? Infinity : 0,
          repeatType: 'reverse'
        }
      }
    };

    return { ...baseConfig, ...effects[effect] };
  }, [effect, color, duration, isFocused]);

  return {
    isFocused,
    setIsFocused,
    animation: getAnimationConfig(),
    handlers: {
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  };
};

// Composant de démonstration
interface FocusAnimationsDemoProps {
  className?: string;
}

export const FocusAnimationsDemo: React.FC<FocusAnimationsDemoProps> = ({ className }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const effects: Array<{
    name: string;
    effect: FocusAnimationsProps['effect'];
  }> = [
    { name: 'Ring', effect: 'ring' },
    { name: 'Glow', effect: 'glow' },
    { name: 'Scale', effect: 'scale' },
    { name: 'Border', effect: 'border' },
    { name: 'Shadow', effect: 'shadow' },
    { name: 'Pulse', effect: 'pulse' }
  ];

  return (
    <div className={cn('max-w-2xl mx-auto space-y-6 p-6', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Focus Animations Demo</h2>
        <p className="text-gray-600">
          Explorez les différents effets d'animation de focus
        </p>
      </div>

      {/* Formulaire de démonstration */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Form avec Focus Animations</h3>
        
        {formData.name && (
          <div className="text-sm text-green-600 mb-2">
            ✓ Name: {formData.name}
          </div>
        )}
        
        <FocusableInput
          placeholder="Votre nom"
          value={formData.name}
          onChange={handleInputChange('name')}
          effect="glow"
          color="#10B981"
          success={formData.name.length > 0}
        />
        
        <FocusableInput
          type="email"
          placeholder="Votre email"
          value={formData.email}
          onChange={handleInputChange('email')}
          effect="ring"
          color="#3B82F6"
          error={formData.email.length > 0 && !formData.email.includes('@')}
          success={formData.email.length > 0 && formData.email.includes('@')}
        />
        
        <FocusableInput
          type="password"
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={handleInputChange('password')}
          effect="shadow"
          color="#F59E0B"
          success={formData.password.length >= 6}
        />
        
        <div className="flex gap-3">
          <FocusableButton
            variant="primary"
            effect="pulse"
            onClick={() => alert('Formulaire envoyé!')}
          >
            Envoyer
          </FocusableButton>
          
          <FocusableButton
            variant="outline"
            effect="shimmer"
            onClick={() => setFormData({ name: '', email: '', password: '' })}
          >
            Réinitialiser
          </FocusableButton>
        </div>
      </div>

      {/* Démonstration des effets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Effets de Focus</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {effects.map(({ name, effect }) => (
            <div key={name} className="text-center">
              <FocusAnimations effect={effect} color="#3B82F6">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <div className="text-sm font-medium text-gray-700">{name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Focus effect
                  </div>
                </div>
              </FocusAnimations>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusAnimations;