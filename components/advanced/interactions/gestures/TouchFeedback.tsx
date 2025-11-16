import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface TouchFeedbackProps {
  children: React.ReactNode;
  type?: 'ripple' | 'pulse' | 'scale' | 'highlight' | 'wave' | 'magnetic';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  duration?: number;
  disabled?: boolean;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  className?: string;
}

interface RippleEffectProps {
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
}

interface TouchRippleProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

interface TouchPulseProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  scale?: number;
  className?: string;
}

interface MagneticEffectProps {
  children: React.ReactNode;
  strength?: number;
  easing?: number;
  disabled?: boolean;
  className?: string;
}

interface TouchScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

// Composant principal TouchFeedback
export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  type = 'ripple',
  color = '#3B82F6',
  size = 'md',
  duration = 600,
  disabled = false,
  onTouchStart,
  onTouchEnd,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Créer un effet ripple
    if (type === 'ripple') {
      const rippleSize = Math.max(rect.width, rect.height) * 0.3;
      const newRipple: RippleEffectProps = {
        x,
        y,
        color,
        size: rippleSize,
        duration
      };

      setRipples(prev => [...prev, newRipple]);

      // Nettoyer le ripple après l'animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r !== newRipple));
      }, duration);
    }

    setIsPressed(true);
    onTouchStart?.();
  }, [disabled, type, color, duration, onTouchStart]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    onTouchEnd?.();
  }, [disabled, onTouchEnd]);

  const getComponent = () => {
    switch (type) {
      case 'pulse':
        return (
          <TouchPulse color={color} duration={duration} className={className}>
            {children}
          </TouchPulse>
        );
      
      case 'scale':
        return (
          <TouchScale duration={duration} disabled={disabled} className={className}>
            {children}
          </TouchScale>
        );
      
      case 'highlight':
        return (
          <div className={cn('relative', className)}>
            <motion.div
              className="absolute inset-0 bg-blue-400 opacity-0"
              animate={{ opacity: isPressed ? 0.3 : 0 }}
              transition={{ duration: duration / 1000 }}
            />
            {children}
          </div>
        );
      
      case 'magnetic':
        return (
          <MagneticEffect className={className}>
            {children}
          </MagneticEffect>
        );
      
      case 'wave':
        return (
          <div className={cn('relative overflow-hidden', className)}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
              animate={{
                opacity: isPressed ? 0.6 : 0,
                x: [-100, 200]
              }}
              transition={{
                duration: duration / 1000,
                ease: 'easeInOut'
              }}
            />
            {children}
          </div>
        );
      
      default: // ripple
        return (
          <div
            ref={elementRef}
            className={cn('relative overflow-hidden', className)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {children}
            <AnimatePresence>
              {ripples.map((ripple, index) => (
                <motion.div
                  key={`${ripple.x}-${ripple.y}-${index}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: ripple.x - ripple.size / 2,
                    top: ripple.y - ripple.size / 2,
                    width: ripple.size,
                    height: ripple.size,
                    backgroundColor: ripple.color,
                    borderRadius: '50%',
                    opacity: 0.6
                  }}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: ripple.duration / 1000,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        );
    }
  };

  if (type === 'pulse' || type === 'scale') {
    return getComponent() as JSX.Element;
  }

  return getComponent() as JSX.Element;
};

// Composant Touch Ripple spécifique
export const TouchRipple: React.FC<TouchRippleProps> = ({
  children,
  color = '#3B82F6',
  duration = 600,
  disabled = false,
  className
}) => {
  return (
    <TouchFeedback
      type="ripple"
      color={color}
      duration={duration}
      disabled={disabled}
      className={className}
    >
      {children}
    </TouchFeedback>
  );
};

// Composant Touch Pulse
export const TouchPulse: React.FC<TouchPulseProps> = ({
  children,
  color = '#3B82F6',
  duration = 400,
  scale = 1.05,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className={cn('relative cursor-pointer select-none', className)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? scale : 1,
        boxShadow: isPressed 
          ? `0 0 20px ${color}40` 
          : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeInOut'
      }}
      style={{
        borderRadius: '50%'
      }}
    >
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: color,
          borderRadius: '50%'
        }}
        animate={{
          scale: isPressed ? [1, scale * 1.5, scale] : 1,
          opacity: isPressed ? [0, 0.3, 0] : 0
        }}
        transition={{
          duration: duration / 1000,
          ease: 'easeInOut'
        }}
      />
      {children}
    </motion.div>
  );
};

// Composant Magnetic Effect
export const MagneticEffect: React.FC<MagneticEffectProps> = ({
  children,
  strength = 0.3,
  easing = 0.25,
  disabled = false,
  className
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setMousePosition({ x: deltaX, y: deltaY });
  }, [strength, disabled]);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={elementRef}
      className={cn('cursor-pointer select-none', className)}
      style={{
        x: mousePosition.x,
        y: mousePosition.y,
        transition: `transform ${easing}s cubic-bezier(0.23, 1, 0.32, 1)`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Composant Touch Scale
export const TouchScale: React.FC<TouchScaleProps> = ({
  children,
  scale = 0.95,
  duration = 150,
  disabled = false,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className={cn('cursor-pointer select-none', className)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? scale : 1,
        y: isPressed ? 1 : 0
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeInOut'
      }}
      style={{
        transformOrigin: 'center'
      }}
    >
      {children}
    </motion.div>
  );
};

// Hook personnalisé pour touch feedback
export const useTouchFeedback = () => {
  const [feedback, setFeedback] = useState({
    type: 'ripple' as TouchFeedbackProps['type'],
    color: '#3B82F6',
    size: 'md' as TouchFeedbackProps['size'],
    duration: 600
  });

  const triggerFeedback = useCallback((
    type: TouchFeedbackProps['type'],
    customColor?: string,
    customDuration?: number
  ) => {
    setFeedback({
      type,
      color: customColor || feedback.color,
      size: feedback.size,
      duration: customDuration || feedback.duration
    });
  }, [feedback]);

  return {
    feedback,
    setFeedback,
    triggerFeedback
  };
};

// Composant Touch Highlight
interface TouchHighlightProps {
  children: React.ReactNode;
  color?: string;
  opacity?: number;
  className?: string;
}

export const TouchHighlight: React.FC<TouchHighlightProps> = ({
  children,
  color = '#3B82F6',
  opacity = 0.1,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: color }}
        animate={{
          opacity: isPressed ? opacity : 0
        }}
        transition={{ duration: 0.2 }}
      />
      <div
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
};

// Composant Touch Wave (onde progressive)
interface TouchWaveProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  className?: string;
}

export const TouchWave: React.FC<TouchWaveProps> = ({
  children,
  color = '#3B82F6',
  speed = 1,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const triggerWave = useCallback(() => {
    setIsPressed(true);
    setWaveKey(prev => prev + 1);
    
    setTimeout(() => {
      setIsPressed(false);
    }, 300);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      
      <AnimatePresence>
        {isPressed && (
          <motion.div
            key={waveKey}
            className="absolute inset-0 pointer-events-none"
            initial={{
              background: `radial-gradient(circle at center, ${color}00 0%, ${color}40 30%, ${color}00 70%)`
            }}
            animate={{
              background: [
                `radial-gradient(circle at center, ${color}00 0%, ${color}40 30%, ${color}00 70%)`,
                `radial-gradient(circle at center, ${color}00 0%, ${color}00 50%, ${color}00 100%)`
              ]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3 / speed,
              ease: 'easeOut'
            }}
          />
        )}
      </AnimatePresence>
      
      <div
        className="absolute inset-0 z-20"
        onMouseDown={triggerWave}
        onTouchStart={triggerWave}
      />
    </div>
  );
};

// Composant Touch Pressure (prévisualise la pression)
interface TouchPressureProps {
  children: React.ReactNode;
  maxPressure?: number;
  onPressureChange?: (pressure: number) => void;
  className?: string;
}

export const TouchPressure: React.FC<TouchPressureProps> = ({
  children,
  maxPressure = 1,
  onPressureChange,
  className
}) => {
  const [pressure, setPressure] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Sur devices compatibles Force Touch
      if ('force' in e) {
        const force = e.force || 0;
        const normalizedPressure = Math.min(force / maxPressure, 1);
        setPressure(normalizedPressure);
        onPressureChange?.(normalizedPressure);
      }
    };

    const handlePointerUp = () => {
      setPressure(0);
      onPressureChange?.(0);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointerleave', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [maxPressure, onPressureChange]);

  return (
    <motion.div
      ref={elementRef}
      className={cn('relative', className)}
      style={{
        transform: `scale(${1 + pressure * 0.1})`
      }}
    >
      {children}
      
      {/* Indicateur de pression */}
      <motion.div
        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: pressure > 0 ? 1 : 0 }}
      >
        {Math.round(pressure * 100)}%
      </motion.div>
    </motion.div>
  );
};

export default TouchFeedback;