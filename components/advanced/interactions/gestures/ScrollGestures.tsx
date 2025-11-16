import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface ScrollGesturesProps {
  children: React.ReactNode;
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  threshold?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  momentum?: boolean;
  className?: string;
  disabled?: boolean;
}

interface ScrollIndicatorProps {
  direction: 'up' | 'down' | 'left' | 'right';
  visible: boolean;
  className?: string;
}

interface ScrollMomentumProps {
  children: React.ReactNode;
  velocity?: number;
  friction?: number;
  minVelocity?: number;
  onMomentumEnd?: () => void;
  className?: string;
}

interface ScrollSnapProps {
  children: React.ReactNode;
  snapPoints?: number[];
  snapThreshold?: number;
  onSnap?: (index: number) => void;
  className?: string;
}

interface ScrollTrackerProps {
  onScrollProgress?: (progress: number) => void;
  onScrollPosition?: (position: number) => void;
  onScrollDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  children: React.ReactNode;
  className?: string;
}

// Composant principal ScrollGestures
export const ScrollGestures: React.FC<ScrollGesturesProps> = ({
  children,
  onScrollUp,
  onScrollDown,
  onScrollLeft,
  onScrollRight,
  threshold = 100,
  direction = 'vertical',
  momentum = true,
  className,
  disabled = false
}) => {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onWheel: ({ event, delta: [, dy], velocity: [, vy] }) => {
      if (disabled) return;
      
      event.preventDefault();
      
      const absDy = Math.abs(dy);
      const absVy = Math.abs(vy);
      
      // Déterminer la direction et l'intensité
      let detectedDirection: 'up' | 'down' | 'left' | 'right';
      let trigger = false;
      
      if (direction === 'vertical' || direction === 'both') {
        if (absDy > threshold || absVy > 0.5) {
          trigger = true;
          detectedDirection = dy > 0 ? 'down' : 'up';
        }
      }
      
      if (direction === 'horizontal' || direction === 'both') {
        // Pour horizontal, on utiliserait delta[0] et velocity[0]
        // Simplification pour l'exemple
      }
      
      if (trigger) {
        const now = Date.now();
        const timeDiff = now - lastScrollTime;
        setScrollVelocity(absVy);
        setScrollDirection(detectedDirection);
        setLastScrollTime(now);
        
        // Déclencher les callbacks selon la direction
        switch (detectedDirection) {
          case 'up':
            onScrollUp?.();
            break;
          case 'down':
            onScrollDown?.();
            break;
          case 'left':
            onScrollLeft?.();
            break;
          case 'right':
            onScrollRight?.();
            break;
        }
        
        // Reset direction après un délai
        setTimeout(() => {
          setScrollDirection(null);
          setScrollVelocity(0);
        }, 1000);
      }
    }
  }, {
    wheel: {
      filterEvent: (e) => e.preventDefault(),
      ...(direction !== 'vertical' && { axis: direction })
    }
  });

  return (
    <motion.div
      ref={containerRef}
      {...bind()}
      className={cn(
        'relative overflow-auto',
        momentum && 'scroll-smooth',
        className
      )}
      style={{
        touchAction: disabled ? 'auto' : 'pan-y'
      }}
    >
      {children}
      
      {/* Indicateurs de direction */}
      {scrollDirection && (
        <motion.div
          className={cn(
            'absolute z-10 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold',
            scrollDirection === 'up' && 'top-4 left-1/2 transform -translate-x-1/2',
            scrollDirection === 'down' && 'bottom-4 left-1/2 transform -translate-x-1/2',
            scrollDirection === 'left' && 'left-4 top-1/2 transform -translate-y-1/2',
            scrollDirection === 'right' && 'right-4 top-1/2 transform -translate-y-1/2'
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {scrollDirection === 'up' && '↑'}
              {scrollDirection === 'down' && '↓'}
              {scrollDirection === 'left' && '←'}
              {scrollDirection === 'right' && '→'}
            </motion.div>
            <span>{scrollDirection}</span>
            {scrollVelocity > 0.5 && (
              <span className="text-xs opacity-75">
                {Math.round(scrollVelocity * 100)}%
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Composant Indicateur de Scroll
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  direction,
  visible,
  className
}) => {
  const getArrowIcon = () => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'left':
        return '←';
      case 'right':
        return '→';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute bg-gray-800 bg-opacity-80 text-white rounded-full p-2',
        direction === 'up' && 'top-4 left-1/2 transform -translate-x-1/2',
        direction === 'down' && 'bottom-4 left-1/2 transform -translate-x-1/2',
        direction === 'left' && 'left-4 top-1/2 transform -translate-y-1/2',
        direction === 'right' && 'right-4 top-1/2 transform -translate-y-1/2',
        className
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.5,
        y: [
          0,
          direction === 'down' || direction === 'right' ? 10 : -10,
          0
        ]
      }}
      transition={{
        y: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.3
        }
      }}
    >
      <span className="text-sm">{getArrowIcon()}</span>
    </motion.div>
  );
};

// Composant Momentum Scroll
export const ScrollMomentum: React.FC<ScrollMomentumProps> = ({
  children,
  velocity = 0.5,
  friction = 0.95,
  minVelocity = 0.1,
  onMomentumEnd,
  className
}) => {
  const [isMomentumScrolling, setIsMomentumScrolling] = useState(false);
  const [momentumVelocity, setMomentumVelocity] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const momentumTimeoutRef = useRef<NodeJS.Timeout>();

  const startMomentum = useCallback((initialVelocity: number) => {
    setMomentumVelocity(initialVelocity);
    setIsMomentumScrolling(true);

    const animate = () => {
      if (!scrollRef.current || Math.abs(momentumVelocity) < minVelocity) {
        setIsMomentumScrolling(false);
        onMomentumEnd?.();
        return;
      }

      scrollRef.current.scrollBy({
        top: momentumVelocity,
        behavior: 'auto'
      });

      setMomentumVelocity(prev => prev * friction);
      
      momentumTimeoutRef.current = setTimeout(animate, 16); // ~60fps
    };

    animate();
  }, [friction, minVelocity, momentumVelocity, onMomentumEnd]);

  const bind = useGesture({
    onWheel: ({ velocity: [, vy], event }) => {
      if (Math.abs(vy) > 0.5) {
        event.preventDefault();
        startMomentum(vy * 10); // Amplifier la vitesse
      }
    }
  }, {
    wheel: { filterEvent: (e) => e.preventDefault() }
  });

  useEffect(() => {
    return () => {
      if (momentumTimeoutRef.current) {
        clearTimeout(momentumTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      {...bind()}
      className={cn(
        'overflow-auto scroll-smooth',
        isMomentumScrolling && 'scroll-momentum-active',
        className
      )}
    >
      {children}
    </div>
  );
};

// Hook personnalisé pour le suivi du scroll
export const useScrollTracking = () => {
  const scrollY = useMotionValue(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const scrollProgress = useTransform(scrollY, [0, 1000], [0, 1]);

  useEffect(() => {
    const updateScrollInfo = () => {
      const currentScrollY = window.scrollY;
      
      // Détecter la direction
      if (currentScrollY > lastScrollY.current) {
        scrollDirection.current = 'down';
      } else if (currentScrollY < lastScrollY.current) {
        scrollDirection.current = 'up';
      }
      
      lastScrollY.current = currentScrollY;
      scrollY.set(currentScrollY);
    };

    window.addEventListener('scroll', updateScrollInfo, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollInfo);
  }, [scrollY]);

  return {
    scrollY,
    scrollProgress,
    scrollDirection: scrollDirection.current
  };
};

// Composant Scroll Snap
export const ScrollSnap: React.FC<ScrollSnapProps> = ({
  children,
  snapPoints = [0, 400, 800, 1200],
  snapThreshold = 50,
  onSnap,
  className
}) => {
  const [currentSnap, setCurrentSnap] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const snapToPoint = useCallback((pointIndex: number) => {
    if (!containerRef.current || !snapPoints[pointIndex]) return;
    
    containerRef.current.scrollTo({
      top: snapPoints[pointIndex],
      behavior: 'smooth'
    });
    
    setCurrentSnap(pointIndex);
    onSnap?.(pointIndex);
  }, [snapPoints, onSnap]);

  const bind = useGesture({
    onWheel: ({ event, delta: [, dy] }) => {
      event.preventDefault();
      
      let newSnap = currentSnap;
      if (dy > 0) { // Scroll down
        newSnap = Math.min(currentSnap + 1, snapPoints.length - 1);
      } else { // Scroll up
        newSnap = Math.max(currentSnap - 1, 0);
      }
      
      if (newSnap !== currentSnap) {
        snapToPoint(newSnap);
      }
    }
  }, {
    wheel: { filterEvent: (e) => e.preventDefault() }
  });

  return (
    <div
      ref={containerRef}
      {...bind()}
      className={cn('overflow-auto snap-y snap-mandatory', className)}
    >
      {children}
      
      {/* Indicateurs de snap */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
        {snapPoints.map((_, index) => (
          <button
            key={index}
            onClick={() => snapToPoint(index)}
            className={cn(
              'w-3 h-3 rounded-full border-2 transition-all',
              index === currentSnap 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white border-gray-300 hover:border-blue-300'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Composant de suivi de scroll
export const ScrollTracker: React.FC<ScrollTrackerProps> = ({
  onScrollProgress,
  onScrollPosition,
  onScrollDirection,
  children,
  className
}) => {
  const scrollProgress = useMotionValue(0);
  const scrollPosition = useMotionValue(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  const bind = useGesture({
    onWheel: ({ event, delta: [, dy] }) => {
      // Détecter la direction
      if (dy > 0) {
        scrollDirection.current = 'down';
      } else if (dy < 0) {
        scrollDirection.current = 'up';
      }
      
      // Calculer le progrès (simulation)
      const maxScroll = 1000; // À ajuster selon le contenu
      const currentProgress = Math.max(0, Math.min(1, (lastScrollY.current + dy) / maxScroll));
      
      scrollProgress.set(currentProgress);
      scrollPosition.set(lastScrollY.current + dy);
      
      onScrollProgress?.(currentProgress);
      onScrollPosition?.(lastScrollY.current + dy);
      onScrollDirection?.(scrollDirection.current);
      
      lastScrollY.current += dy;
    }
  }, {
    wheel: { filterEvent: (e) => e.preventDefault() }
  });

  return (
    <div {...bind()} className={cn('overflow-auto', className)}>
      {children}
      
      {/* Barre de progression */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-blue-500 z-50"
        style={{
          scaleX: scrollProgress,
          transformOrigin: '0%'
        }}
      />
      
      {/* Indicateur de position */}
      <motion.div
        className="fixed top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm"
        style={{
          y: scrollPosition.to(y => -y * 0.1) // Effet parallax subtil
        }}
      >
        Position: {Math.round(scrollPosition.get())}px
      </motion.div>
    </div>
  );
};

export default ScrollGestures;