import React, { useState, useRef, useCallback } from 'react';
import { useSpring, animated, useSpringValue, useSpringTransition } from '@react-spring/web';
import { cn } from '@/utils';

// Types et interfaces
interface SpringAnimationsProps {
  children: React.ReactNode;
  type?: 'scale' | 'rotate' | 'bounce' | 'elastic' | 'spring' | 'magnetic';
  stiffness?: number;
  damping?: number;
  mass?: number;
  tension?: number;
  friction?: number;
  className?: string;
  trigger?: 'hover' | 'click' | 'scroll' | 'load';
}

interface SpringCounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  className?: string;
}

interface SpringButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  spring?: boolean;
  className?: string;
}

// Composant principal d'animations spring
export const SpringAnimations: React.FC<SpringAnimationsProps> = ({
  children,
  type = 'spring',
  stiffness = 300,
  damping = 30,
  mass = 1,
  tension = 170,
  friction = 26,
  className,
  trigger = 'hover'
}) => {
  const [isActive, setIsActive] = useState(false);

  // Configuration des springs selon le type
  const getSpringConfig = useCallback(() => {
    const configs = {
      scale: { tension: 280, friction: 60, mass: 1 },
      rotate: { tension: 145, friction: 14, mass: 1 },
      bounce: { tension: 330, friction: 15, mass: 0.5 },
      elastic: { tension: 120, friction: 8, mass: 2 },
      spring: { tension, friction, mass },
      magnetic: { tension: 210, friction: 20, mass: 0.8 }
    };
    return configs[type];
  }, [type, tension, friction, mass]);

  // Spring animation
  const springProps = useSpring({
    config: getSpringConfig(),
    transform: isActive ? 
      (type === 'scale' ? 'scale(1.1)' : 
       type === 'rotate' ? 'rotate(5deg)' : 
       type === 'bounce' ? 'scale(1.05)' :
       type === 'elastic' ? 'scale(1.08)' :
       type === 'magnetic' ? 'scale(1.1)' :
       'scale(1.05)') : 
      'scale(1)',
    opacity: isActive ? 1 : 0.8,
    boxShadow: isActive ? 
      '0 10px 30px rgba(0, 0, 0, 0.15)' : 
      '0 2px 10px rgba(0, 0, 0, 0.05)',
    ...(type === 'rotate' && { 
      rotate: isActive ? 5 : 0,
      rotateX: isActive ? 10 : 0,
      rotateY: isActive ? 5 : 0
    }),
    ...(type === 'magnetic' && {
      translateY: isActive ? -5 : 0,
      scale: isActive ? 1.05 : 1
    })
  });

  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover') setIsActive(true);
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') setIsActive(false);
  }, [trigger]);

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      setIsActive(!isActive);
    }
  }, [isActive, trigger]);

  return (
    <animated.div
      style={springProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn('cursor-pointer select-none', className)}
    >
      {children}
    </animated.div>
  );
};

// Composant Counter avec spring animation
export const SpringCounter: React.FC<SpringCounterProps> = ({
  from = 0,
  to,
  duration = 2000,
  delay = 0,
  decimals = 0,
  className
}) => {
  const [key, setKey] = useState(0);
  const display = useSpringValue(from);

  React.useEffect(() => {
    display.start({
      to: async (next) => {
        await next(to);
      },
      delay,
      config: {
        duration: duration * 0.8, // Animation plus rapide
        tension: 100,
        friction: 10
      }
    });
  }, [to, from, delay, display]);

  // Formatage du nombre
  const formattedValue = display.to((value) => {
    return value.toFixed(decimals);
  });

  return (
    <animated.span className={cn('font-mono', className)}>
      {formattedValue}
    </animated.span>
  );
};

// Composant Button avec spring animation
export const SpringButton: React.FC<SpringButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  spring = true,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Spring animation pour le bouton
  const buttonSpring = useSpring({
    scale: isPressed ? 0.95 : 1,
    y: isPressed ? 2 : 0,
    boxShadow: isPressed 
      ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    config: spring ? { tension: 400, friction: 10, mass: 0.5 } : { duration: 0 }
  });

  const handleMouseDown = useCallback(() => {
    if (spring) setIsPressed(true);
  }, [spring]);

  const handleMouseUp = useCallback(() => {
    if (spring) setIsPressed(false);
  }, [spring]);

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  // Styles selon la variante
  const getVariantStyles = () => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };
    return variants[variant];
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    return sizes[size];
  };

  const buttonStyles = cn(
    'rounded-lg font-medium transition-colors duration-200',
    getVariantStyles(),
    getSizeStyles(),
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    className
  );

  if (!spring) {
    return (
      <button
        className={buttonStyles}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {children}
      </button>
    );
  }

  return (
    <animated.button
      style={buttonSpring}
      className={buttonStyles}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </animated.button>
  );
};

// Hook personnalisé pour spring animations
export const useSpringAnimation = () => {
  const createSpringValue = useCallback((initial: number) => {
    return useSpringValue(initial);
  }, []);

  const animateValue = useCallback((
    spring: any,
    to: number | Record<string, any>,
    config?: {
      tension?: number;
      friction?: number;
      mass?: number;
      duration?: number;
      delay?: number;
    }
  ) => {
    return spring.start({
      to,
      config: {
        tension: config?.tension || 300,
        friction: config?.friction || 30,
        mass: config?.mass || 1,
        ...(config?.duration && { duration: config.duration })
      },
      delay: config?.delay || 0
    });
  }, []);

  return {
    createSpringValue,
    animateValue
  };
};

// Composant Magnetic Effect
interface MagneticEffectProps {
  children: React.ReactNode;
  strength?: number;
  duration?: number;
  className?: string;
}

export const MagneticEffect: React.FC<MagneticEffectProps> = ({
  children,
  strength = 0.3,
  duration = 0.3,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setMousePosition({ x: deltaX, y: deltaY });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  return (
    <animated.div
      ref={ref}
      style={{
        x: mousePosition.x,
        y: mousePosition.y,
        transition: `transform ${duration}s cubic-bezier(0.23, 1, 0.320, 1)`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </animated.div>
  );
};

// Composant Bounce In
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  trigger?: 'load' | 'scroll';
}

export const BounceIn: React.FC<BounceInProps> = ({
  children,
  delay = 0,
  duration = 1,
  className,
  trigger = 'load'
}) => {
  const spring = useSpring({
    from: {
      opacity: 0,
      scale: 0.3,
      rotate: 0,
      y: 50
    },
    to: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: 0
    },
    delay,
    config: {
      tension: 330,
      friction: 15,
      mass: 0.8
    }
  });

  return (
    <animated.div style={spring} className={className}>
      {children}
    </animated.div>
  );
};

// Composant Spring Transition
interface SpringTransitionProps {
  items: React.ReactNode[];
  config?: {
    tension?: number;
    friction?: number;
    mass?: number;
  };
  className?: string;
}

export const SpringTransition: React.FC<SpringTransitionProps> = ({
  items,
  config = { tension: 170, friction: 26, mass: 1 },
  className
}) => {
  const [index, setIndex] = useState(0);
  const transitions = useSpringTransition(items[index], (item) => item, {
    from: { opacity: 0, transform: 'translate3d(0,40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    config
  });

  return (
    <div className={cn('relative', className)}>
      {transitions((styles, item) => (
        <animated.div
          style={styles}
          className="absolute inset-0"
        >
          {item}
        </animated.div>
      ))}
      <div className="mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            className="w-2 h-2 rounded-full bg-gray-300 mx-1"
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default SpringAnimations;