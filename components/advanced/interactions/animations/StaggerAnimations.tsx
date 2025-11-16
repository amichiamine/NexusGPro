import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface StaggerAnimationsProps {
  children: React.ReactNode;
  containerClassName?: string;
  itemClassName?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  ease?: string;
  threshold?: number;
  once?: boolean;
  reverse?: boolean;
}

interface StaggerListProps {
  items: React.ReactNode[];
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'flipIn' | 'rotateIn' | 'bounceIn' | 'elastic';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  itemClassName?: string;
  className?: string;
}

interface StaggerGridProps {
  children: React.ReactNode[];
  columns?: number;
  rows?: number;
  gap?: number;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'flipIn';
  delay?: number;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  itemClassName?: string;
}

interface StaggerCounterProps {
  from?: number;
  to: number;
  count?: number;
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  format?: (value: number) => string;
  className?: string;
}

// Composant principal d'animations en décalage
export const StaggerAnimations: React.FC<StaggerAnimationsProps> = ({
  children,
  containerClassName,
  itemClassName,
  direction = 'up',
  delay = 0,
  staggerDelay = 0.1,
  duration = 0.6,
  ease = 'easeOut',
  threshold = 0.1,
  once = true,
  reverse = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Direction des animations
  const getDirectionOffset = useCallback(() => {
    const offsets = {
      up: { y: 50, x: 0 },
      down: { y: -50, x: 0 },
      left: { y: 0, x: 50 },
      right: { y: 0, x: -50 },
      center: { y: 0, x: 0, scale: 0.8, opacity: 0 }
    };
    return offsets[direction];
  }, [direction]);

  // Observer pour déclencher l'animation
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [threshold, once]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delay,
        staggerChildren: staggerDelay,
        delayChildren: delay,
        when: reverse ? 'afterChildren' : 'beforeChildren'
      }
    }
  };

  const itemVariants = {
    hidden: {
      ...getDirectionOffset(),
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration,
        ease
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={cn('w-full', containerClassName)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn('w-full', itemClassName)}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant de liste avec stagger
export const StaggerList: React.FC<StaggerListProps> = ({
  items,
  animation = 'fadeIn',
  direction = 'up',
  delay = 0,
  staggerDelay = 0.15,
  duration = 0.6,
  itemClassName,
  className
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      scale: animation === 'scaleIn' ? 0.8 : 1,
      rotate: animation === 'rotateIn' ? -45 : 0,
      transformOrigin: animation === 'flipIn' ? 'center center' : undefined
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('space-y-4', className)}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn('w-full', itemClassName)}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant de grille avec stagger
export const StaggerGrid: React.FC<StaggerGridProps> = ({
  children,
  columns = 3,
  rows,
  gap = 16,
  animation = 'fadeIn',
  delay = 0,
  staggerDelay = 0.1,
  direction = 'up',
  className,
  itemClassName
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      scale: animation === 'scaleIn' ? 0.8 : 1,
      rotate: animation === 'flipIn' ? -90 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    ...(rows && { gridTemplateRows: `repeat(${rows}, 1fr)` })
  };

  return (
    <motion.div
      style={gridStyle}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('w-full', className)}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn('w-full', itemClassName)}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant counter avec stagger
export const StaggerCounter: React.FC<StaggerCounterProps> = ({
  from = 0,
  to,
  count = 5,
  duration = 2000,
  delay = 0,
  staggerDelay = 200,
  format = (value) => value.toString(),
  className
}) => {
  const [currentCount, setCurrentCount] = useState(from);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCount = useCallback(async () => {
    const steps = count;
    const stepValue = (to - from) / steps;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setCurrentCount(from + (stepValue * i));
    }
  }, [from, to, count, duration]);

  const digits = Math.max(from, to).toString().split('');
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay / 1000, // Convert to seconds
        delayChildren: delay / 1000
      }
    }
  };

  const digitVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={cn('font-mono text-2xl', className)}
    >
      {digits.map((digit, index) => (
        <motion.span
          key={`${digit}-${index}`}
          variants={digitVariants}
          className="inline-block"
        >
          {digit}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Hook personnalisé pour stagger animations
export const useStaggerAnimation = () => {
  const controls = useAnimation();

  const animateSequentially = useCallback(async (
    elements: HTMLElement[],
    animations: Array<{
      scale?: number;
      x?: number | string;
      y?: number | string;
      rotate?: number;
      opacity?: number;
      duration?: number;
      delay?: number;
    }>
  ) => {
    const sequence = elements.map((element, index) => {
      const animation = animations[index] || {};
      return {
        ...element,
        ...animation,
        delay: animation.delay || index * 0.1
      };
    });

    await controls.start((i) => ({
      scale: sequence[i]?.scale || 1,
      x: sequence[i]?.x || 0,
      y: sequence[i]?.y || 0,
      rotate: sequence[i]?.rotate || 0,
      opacity: sequence[i]?.opacity || 1,
      transition: {
        duration: sequence[i]?.duration || 0.5,
        ease: 'easeOut'
      },
      delay: sequence[i]?.delay || 0
    }));
  }, [controls]);

  return {
    controls,
    animateSequentially
  };
};

// Composant de菜单 avec stagger
interface StaggerMenuProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  }>;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

export const StaggerMenu: React.FC<StaggerMenuProps> = ({
  items,
  direction = 'up',
  delay = 0,
  staggerDelay = 0.1,
  className,
  itemClassName
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
      y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('space-y-2', className)}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ x: 4 }}
          className={cn(
            'flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors',
            itemClassName
          )}
          onClick={item.onClick}
        >
          {item.icon && (
            <span className="text-gray-500">
              {item.icon}
            </span>
          )}
          <span className="text-gray-700 font-medium">
            {item.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant d'apparition progressive
interface FadeInStaggerProps {
  children: React.ReactNode[];
  count: number;
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  itemClassName?: string;
}

export const FadeInStagger: React.FC<FadeInStaggerProps> = ({
  children,
  count,
  duration = 0.6,
  delay = 0,
  staggerDelay = 0.1,
  direction = 'up',
  className,
  itemClassName
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('space-y-4', className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn('w-full', itemClassName)}
        >
          {children[index % children.length]}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggerAnimations;