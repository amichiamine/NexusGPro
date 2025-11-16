import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface HoverEffectsProps {
  children: React.ReactNode;
  effect?: 'lift' | 'glow' | 'tilt' | 'magnetic' | 'scale' | 'rotate' | 'shimmer' | 'ripple' | 'border';
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

interface TiltEffectProps {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  className?: string;
  disabled?: boolean;
}

interface MagneticEffectProps {
  children: React.ReactNode;
  strength?: number;
  distance?: number;
  className?: string;
  disabled?: boolean;
}

interface ShimmerEffectProps {
  children: React.ReactNode;
  color?: string;
  width?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  intensity?: number;
  blur?: number;
  className?: string;
}

interface LiftEffectProps {
  children: React.ReactNode;
  liftDistance?: number;
  shadowSize?: number;
  shadowBlur?: number;
  shadowColor?: string;
  scale?: number;
  className?: string;
}

// Composant principal HoverEffects
export const HoverEffects: React.FC<HoverEffectsProps> = ({
  children,
  effect = 'lift',
  intensity = 'medium',
  duration = 300,
  delay = 0,
  className,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Configuration des intensités
  const getIntensityValues = () => {
    const intensities = {
      subtle: { transform: 1.02, shadow: 0.1, scale: 1.01 },
      medium: { transform: 1.05, shadow: 0.2, scale: 1.02 },
      strong: { transform: 1.08, shadow: 0.3, scale: 1.05 }
    };
    return intensities[intensity];
  };

  const intensityValues = getIntensityValues();

  // Configuration des effets
  const getEffectConfig = () => {
    const configs = {
      lift: {
        y: isHovered ? -intensityValues.transform * 8 : 0,
        scale: isHovered ? intensityValues.scale : 1,
        transition: { duration: duration / 1000, delay }
      },
      glow: {
        boxShadow: isHovered 
          ? `0 0 ${intensityValues.shadow * 30}px ${intensityValues.shadow * 15}px rgba(59, 130, 246, 0.5)` 
          : 'none',
        transition: { duration: duration / 1000, delay }
      },
      tilt: {
        rotateX: isHovered ? intensityValues.transform * 5 : 0,
        rotateY: isHovered ? intensityValues.transform * 5 : 0,
        scale: isHovered ? intensityValues.scale : 1,
        transition: { duration: duration / 1000, delay }
      },
      magnetic: {
        scale: isHovered ? intensityValues.scale : 1,
        transition: { duration: duration / 1000, delay }
      },
      scale: {
        scale: isHovered ? intensityValues.transform : 1,
        transition: { duration: duration / 1000, delay }
      },
      rotate: {
        rotate: isHovered ? intensityValues.transform * 5 : 0,
        scale: isHovered ? intensityValues.scale : 1,
        transition: { duration: duration / 1000, delay }
      },
      shimmer: {
        opacity: 1,
        transition: { duration: duration / 1000, delay }
      },
      ripple: {
        scale: 1.1,
        opacity: 0.3,
        transition: { duration: duration / 1000, delay }
      },
      border: {
        borderColor: isHovered ? '#3B82F6' : '#E5E7EB',
        borderWidth: isHovered ? '2px' : '1px',
        transition: { duration: duration / 1000, delay }
      }
    };

    return configs[effect];
  };

  const effectConfig = getEffectConfig();

  // Gestionnaires d'événements
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      className={cn(
        'relative transition-all duration-300',
        disabled && 'cursor-default',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={!disabled ? { ...effectConfig } : {}}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      
      {/* Effet shimmer pour l'effet shimmer */}
      {effect === 'shimmer' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          animate={{
            x: isHovered ? ['0%', '100%'] : '0%',
            opacity: isHovered ? [0, 0.6, 0] : 0
          }}
          transition={{
            duration: duration / 1000,
            delay,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Effet ripple pour l'effet ripple */}
      {effect === 'ripple' && (
        <motion.div
          className="absolute inset-0 bg-blue-400 opacity-0 rounded-full"
          animate={{
            scale: isHovered ? [0, 2] : 0,
            opacity: isHovered ? [0.3, 0] : 0
          }}
          transition={{
            duration: duration / 1000,
            delay,
            ease: 'easeOut'
          }}
        />
      )}
    </motion.div>
  );
};

// Composant TiltEffect
export const TiltEffect: React.FC<TiltEffectProps> = ({
  children,
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
  className,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(y, springConfig);
  const rotateY = useSpring(x, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const percentageX = mouseX / (rect.width / 2);
    const percentageY = mouseY / (rect.height / 2);
    
    const rotationX = (percentageY * -maxTilt).toFixed(2);
    const rotationY = (percentageX * maxTilt).toFixed(2);

    x.set(parseFloat(rotationY));
    y.set(parseFloat(rotationX));

    setMousePosition({ x: mouseX, y: mouseY });
  }, [disabled, maxTilt, x, y]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'relative transition-all duration-300',
        disabled && 'cursor-default',
        className
      )}
      style={{
        perspective,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? scale : 1
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? scale : 1,
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </motion.div>
      
      {/* Indicateur de mouvement */}
      {isHovered && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
            scale: [1, 1.2, 1]
          }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            y: { type: "spring", stiffness: 300, damping: 30 },
            scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
          }}
        />
      )}
    </motion.div>
  );
};

// Composant MagneticEffect
export const MagneticEffect: React.FC<MagneticEffectProps> = ({
  children,
  strength = 0.3,
  distance = 100,
  className,
  disabled = false
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);

    // Calculer la distance pour détecter le hover
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    setIsHovered(distanceFromCenter < distance);
  }, [strength, distance, disabled, x, y]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'relative transition-all duration-300',
        disabled && 'cursor-default',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: isHovered ? x : 0,
        y: isHovered ? y : 0,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
      
      {/* Indicateur de champ magnétique */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 border-opacity-30 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`
          }}
        />
      )}
    </motion.div>
  );
};

// Composant ShimmerEffect
export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  color = '#ffffff',
  width = 200,
  duration = 1.5,
  delay = 0,
  className
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`
        }}
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration,
          delay,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 2
        }}
      />
    </div>
  );
};

// Composant GlowEffect
export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = '#3B82F6',
  size = 20,
  intensity = 0.5,
  blur = 10,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        boxShadow: isHovered 
          ? `0 0 ${size}px ${blur}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` 
          : 'none'
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
      
      {/* Effet de lueur personnalisée */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// Composant LiftEffect
export const LiftEffect: React.FC<LiftEffectProps> = ({
  children,
  liftDistance = 8,
  shadowSize = 20,
  shadowBlur = 25,
  shadowColor = 'rgba(0, 0, 0, 0.15)',
  scale = 1.02,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        y: isHovered ? -liftDistance : 0,
        scale: isHovered ? scale : 1,
        boxShadow: isHovered 
          ? `0 ${liftDistance}px ${shadowBlur}px ${shadowSize}px ${shadowColor}` 
          : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17,
        boxShadow: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Hook personnalisé pour les effets de hover
export const useHoverEffects = (
  effect: 'lift' | 'glow' | 'tilt' | 'magnetic' | 'scale' | 'rotate' = 'lift',
  options: {
    intensity?: 'subtle' | 'medium' | 'strong';
    disabled?: boolean;
  } = {}
) => {
  const { intensity = 'medium', disabled = false } = options;

  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Configuration de l'animation selon l'effet
  const getAnimation = useCallback(() => {
    const baseAnimation = {
      transition: { duration: 0.3, ease: 'easeInOut' }
    };

    const intensityMultipliers = {
      subtle: 0.5,
      medium: 1,
      strong: 1.5
    };

    const multiplier = intensityMultipliers[intensity];

    const effects = {
      lift: { y: isHovered ? -8 * multiplier : 0, scale: isHovered ? 1 + (0.02 * multiplier) : 1 },
      glow: { 
        boxShadow: isHovered 
          ? `0 0 ${20 * multiplier}px ${10 * multiplier}px rgba(59, 130, 246, 0.5)` 
          : 'none' 
      },
      tilt: { 
        rotateX: isHovered ? 5 * multiplier : 0, 
        rotateY: isHovered ? 5 * multiplier : 0,
        scale: isHovered ? 1 + (0.02 * multiplier) : 1 
      },
      magnetic: { scale: isHovered ? 1 + (0.05 * multiplier) : 1 },
      scale: { scale: isHovered ? 1 + (0.08 * multiplier) : 1 },
      rotate: { 
        rotate: isHovered ? 5 * multiplier : 0,
        scale: isHovered ? 1 + (0.02 * multiplier) : 1 
      }
    };

    return { ...baseAnimation, ...effects[effect] };
  }, [effect, intensity, isHovered]);

  return {
    isHovered,
    animation: getAnimation(),
    eventHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Composant de prévisualisation des effets
interface HoverEffectsPreviewProps {
  className?: string;
}

export const HoverEffectsPreview: React.FC<HoverEffectsPreviewProps> = ({ className }) => {
  const effects: Array<{
    name: string;
    component: React.ComponentType<any>;
  }> = [
    { name: 'Lift', component: HoverEffects },
    { name: 'Tilt', component: TiltEffect },
    { name: 'Magnetic', component: MagneticEffect },
    { name: 'Glow', component: GlowEffect },
    { name: 'Lift (Advanced)', component: LiftEffect }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4 p-4', className)}>
      {effects.map(({ name, component: Component }) => (
        <div key={name} className="text-center">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">{name}</h4>
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <Component>
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                H
              </div>
            </Component>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HoverEffects;