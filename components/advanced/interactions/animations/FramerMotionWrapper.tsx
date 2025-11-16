import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface FramerMotionWrapperProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'flipIn';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  loop?: boolean;
}

interface MotionElementProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variants?: any;
  custom?: any;
}

// Composant principal - Wrapper Framer Motion
export const FramerMotionWrapper: React.FC<FramerMotionWrapperProps> = ({
  children,
  animation = 'fadeIn',
  direction = 'up',
  duration = 0.6,
  delay = 0,
  className,
  threshold = 0.1,
  once = true,
  loop = false
}) => {
  // Animation variants
  const animationVariants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    slideIn: {
      hidden: { 
        opacity: 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0
      },
      visible: { 
        y: 0,
        x: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -180, scale: 0.5 },
      visible: { 
        opacity: 1, 
        rotate: 0,
        scale: 1,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    bounceIn: {
      hidden: { opacity: 0, scale: 0.3 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
          type: 'spring',
          stiffness: 400,
          damping: 10
        }
      }
    },
    flipIn: {
      hidden: { 
        opacity: 0, 
        rotateY: -90,
        scale: 0.5
      },
      visible: { 
        opacity: 1, 
        rotateY: 0,
        scale: 1,
        transition: { 
          duration, 
          delay, 
          ease: 'easeOut' 
        }
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ 
        threshold, 
        once,
        margin: '-50px 0px'
      }}
      variants={animationVariants[animation]}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
};

// Motion Element - Composant flexible pour animations
export const MotionElement: React.FC<MotionElementProps & { 
  motion?: boolean;
  whileHover?: any;
  whileTap?: any;
  whileFocus?: any;
  drag?: boolean | string;
}> = ({
  as = 'div',
  variants,
  custom,
  motion: useMotion = false,
  whileHover,
  whileTap,
  whileFocus,
  drag = false,
  className,
  children,
  ...props
}) => {
  const MotionTag = useMotion ? motion[as as keyof typeof motion] : as;
  
  if (useMotion) {
    return (
      <MotionTag
        variants={variants}
        custom={custom}
        whileHover={whileHover}
        whileTap={whileTap}
        whileFocus={whileFocus}
        drag={drag}
        className={className}
        {...(props as any)}
      >
        {children}
      </MotionTag>
    );
  }
  
  return React.createElement(as, { className, ...props }, children);
};

// Composant AnimatePresence pour animations d'entrée/sortie
interface AnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'wait' | 'popLayout';
  initial?: boolean;
}

export const MotionPresence: React.FC<AnimatePresenceProps & { 
  enter?: any;
  exit?: any;
  mode?: 'wait' | 'popLayout';
}> = ({
  children,
  enter,
  exit,
  mode = 'wait',
  initial = true
}) => {
  return (
    <AnimatePresence mode={mode} initial={initial}>
      <motion.div
        initial={enter?.initial}
        animate={enter?.animate}
        exit={exit?.exit}
        transition={enter?.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Hook pour animations de scroll
export const useScrollAnimation = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const rotate = useTransform(scrollY, [0, 300], [0, 360]);
  
  return { scrollY, scrollYProgress, scale, opacity, rotate };
};

// Hook pour animations spring
export const useSpringAnimation = (value: number) => {
  const spring = useSpring(value, {
    stiffness: 300,
    damping: 30,
    mass: 0.4
  });
  return spring;
};

// Hook pour valeurs motion
export const useMotionValueHook = (initialValue: number = 0) => {
  const x = useMotionValue(initialValue);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  const next = () => setDirection('next');
  const prev = () => setDirection('prev');
  
  return { x, direction, next, prev };
};

// Composant Parallax simple
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxWrapper: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1], [0, speed * 100]);
  
  return (
    <motion.div
      style={{ y }}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
};

// Hook useInView personnalisé
export const useInViewAnimation = (threshold: number = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: threshold });
  
  return { ref, inView };
};

export default FramerMotionWrapper;