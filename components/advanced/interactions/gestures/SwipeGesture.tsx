import React, { useState, useRef, useCallback } from 'react';
import { useDrag, useGesture } from '@use-gesture/react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  className?: string;
  disabled?: boolean;
  preventDefaultTouchmoveEvent?: boolean;
}

interface SwipeableProps {
  children: React.ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

interface SwipeIndicatorProps {
  direction: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

interface SwipeCounterProps {
  initialCount?: number;
  onCountChange?: (count: number, direction: 'left' | 'right') => void;
  threshold?: number;
  className?: string;
}

interface SwipePaginationProps {
  total: number;
  current: number;
  onPageChange: (index: number) => void;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

// Composant principal SwipeGesture
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  direction = 'horizontal',
  className,
  disabled = false,
  preventDefaultTouchmoveEvent = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuration du gesture avec @use-gesture/react
  const bind = useDrag(
    ({ active, movement: [mx, my], direction: [dirX, dirY], velocity: [vx, vy], first, last, event }) => {
      if (disabled) return;

      setIsDragging(active);

      if (first) {
        // Début du drag
        setDragOffset({ x: 0, y: 0 });
      }

      if (active) {
        // Pendant le drag
        setDragOffset({ x: mx, y: my });
      }

      if (last) {
        // Fin du drag - détection du swipe
        const swipeThreshold = Math.max(Math.abs(vx), Math.abs(vy)) * 1000; // Convertir en seuil
        const absX = Math.abs(mx);
        const absY = Math.abs(my);

        if (swipeThreshold > threshold) {
          if (direction === 'horizontal' || direction === 'both') {
            if (absX > absY) {
              if (mx > 0) {
                onSwipeRight?.();
              } else {
                onSwipeLeft?.();
              }
            }
          }

          if (direction === 'vertical' || direction === 'both') {
            if (absY > absX) {
              if (my > 0) {
                onSwipeDown?.();
              } else {
                onSwipeUp?.();
              }
            }
          }
        }

        // Réinitialiser l'offset
        setDragOffset({ x: 0, y: 0 });
      }
    },
    {
      axis: direction === 'both' ? undefined : direction,
      filterTaps: true,
      preventScroll: direction !== 'vertical',
      preventDefault: preventDefaultTouchmoveEvent
    }
  );

  const transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`;

  return (
    <motion.div
      ref={containerRef}
      {...bind()}
      animate={{ x: 0, y: 0 }}
      style={{ 
        transform,
        touchAction: disabled ? 'auto' : 'pan-x'
      }}
      className={cn(
        'touch-none select-none cursor-grab active:cursor-grabbing',
        isDragging && 'z-50',
        className
      )}
      whileDrag={{ scale: 1.05 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }}
    >
      {children}
    </motion.div>
  );
};

// Composant Swipeable simple
export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipe,
  threshold = 50,
  className,
  disabled = false
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const bind = useDrag(({ active, movement: [mx, my], direction: [dirX, dirY], last }) => {
    if (disabled) return;

    setDragOffset({ x: mx, y: my });

    if (last) {
      const absX = Math.abs(mx);
      const absY = Math.abs(my);

      if (Math.max(absX, absY) > threshold) {
        if (absX > absY) {
          onSwipe?.(mx > 0 ? 'right' : 'left');
        } else {
          onSwipe?.(my > 0 ? 'down' : 'up');
        }
      }

      setDragOffset({ x: 0, y: 0 });
    }
  });

  return (
    <motion.div
      {...bind()}
      className={cn('touch-none', className)}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        touchAction: 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

// Composant Indicateur de Swipe
export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  direction,
  className
}) => {
  const getArrowPath = () => {
    switch (direction) {
      case 'left':
        return 'M15.75 19.268L8.232 12l7.518-7.268L14 3l-9 9 9 9 1.75-1.732z';
      case 'right':
        return 'M8.25 19.268L15.778 12 8.25 4.732 10 3l9 9-9 9-1.75-1.732z';
      case 'up':
        return 'M19.268 8.25L12 15.778 4.732 8.25 3 10l9 9 9-9-1.732-1.75z';
      case 'down':
        return 'M19.268 15.75L12 8.232 4.732 15.75 3 14l9-9 9 9-1.732 1.75z';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={cn('flex items-center justify-center', className)}
      animate={{
        x: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
        y: direction === 'up' ? -10 : direction === 'down' ? 10 : 0
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="text-gray-400"
        fill="currentColor"
      >
        <path d={getArrowPath()} />
      </svg>
    </motion.div>
  );
};

// Composant Counter avec Swipe
export const SwipeCounter: React.FC<SwipeCounterProps> = ({
  initialCount = 0,
  onCountChange,
  threshold = 50,
  className
}) => {
  const [count, setCount] = useState(initialCount);
  const [dragOffset, setDragOffset] = useState({ x: 0 });

  const bind = useDrag(({ active, movement: [mx], last }) => {
    setDragOffset({ x: mx });

    if (last) {
      if (Math.abs(mx) > threshold) {
        const newCount = mx > 0 ? count + 1 : count - 1;
        setCount(newCount);
        onCountChange?.(newCount, mx > 0 ? 'right' : 'left');
      }
      setDragOffset({ x: 0 });
    }
  });

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Bouton plus */}
      <SwipeIndicator direction="up" className="text-green-500" />
      
      {/* Display du compteur */}
      <motion.div
        {...bind()}
        className="bg-white rounded-lg shadow-lg p-6 text-2xl font-bold cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${dragOffset.x}px)`,
          touchAction: 'none'
        }}
        whileDrag={{ scale: 1.1 }}
      >
        {count}
      </motion.div>
      
      {/* Bouton moins */}
      <SwipeIndicator direction="down" className="text-red-500" />
      
      {/* Instructions */}
      <p className="text-sm text-gray-500 text-center">
        Glissez à droite pour augmenter<br />
        Glissez à gauche pour diminuer
      </p>
    </div>
  );
};

// Composant Pagination avec Swipe
export const SwipePagination: React.FC<SwipePaginationProps> = ({
  total,
  current,
  onPageChange,
  direction = 'horizontal',
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(current);
  const [dragOffset, setDragOffset] = useState({ 
    x: direction === 'horizontal' ? 0 : 0,
    y: direction === 'vertical' ? 0 : 0
  });

  const bind = useDrag(({ active, movement: [mx, my], last }) => {
    if (direction === 'horizontal') {
      setDragOffset({ x: mx, y: 0 });
    } else {
      setDragOffset({ x: 0, y: my });
    }

    if (last) {
      const threshold = 100;
      
      if (direction === 'horizontal') {
        if (Math.abs(mx) > threshold) {
          const newIndex = mx > 0 
            ? Math.max(0, currentIndex - 1) 
            : Math.min(total - 1, currentIndex + 1);
          setCurrentIndex(newIndex);
          onPageChange(newIndex);
        }
      } else {
        if (Math.abs(my) > threshold) {
          const newIndex = my > 0 
            ? Math.max(0, currentIndex - 1) 
            : Math.min(total - 1, currentIndex + 1);
          setCurrentIndex(newIndex);
          onPageChange(newIndex);
        }
      }

      setDragOffset({ x: 0, y: 0 });
    }
  });

  const transform = direction === 'horizontal' 
    ? `translateX(${dragOffset.x}px)` 
    : `translateY(${dragOffset.y}px)`;

  return (
    <div className={cn(
      'relative overflow-hidden',
      direction === 'horizontal' ? 'h-64' : 'w-64',
      className
    )}>
      <motion.div
        {...bind()}
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row h-full' : 'flex-col w-full'
        )}
        style={{
          transform,
          touchAction: 'none',
          width: `${total * 100}%`,
          height: direction === 'vertical' ? `${total * 100}%` : '100%'
        }}
        animate={{
          x: direction === 'horizontal' ? -currentIndex * (100 / total) : 0,
          y: direction === 'vertical' ? -currentIndex * (100 / total) : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={cn(
              'flex-shrink-0 flex items-center justify-center',
              direction === 'horizontal' ? 'w-full h-full' : 'w-full h-full'
            )}
          >
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Page {index + 1}</h3>
              <p>Contenu de la page {index + 1}</p>
            </div>
          </div>
        ))}
      </motion.div>
      
      {/* Indicateurs */}
      <div className={cn(
        'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2',
        direction === 'vertical' && 'flex-col space-x-0 space-y-2 bottom-1/2 right-4 left-auto top-1/2 transform -translate-y-1/2'
      )}>
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Hook personnalisé pour la gestion des swipes
export const useSwipe = (
  options: {
    threshold?: number;
    direction?: 'horizontal' | 'vertical' | 'both';
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  } = {}
) => {
  const {
    threshold = 50,
    direction = 'horizontal',
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const bind = useDrag(({ active, movement: [mx, my], direction: [dirX, dirY], last }) => {
    if (last) {
      const absX = Math.abs(mx);
      const absY = Math.abs(my);

      if (direction === 'horizontal' || direction === 'both') {
        if (absX > absY && absX > threshold) {
          if (mx > 0) onSwipeRight?.();
          else onSwipeLeft?.();
        }
      }

      if (direction === 'vertical' || direction === 'both') {
        if (absY > absX && absY > threshold) {
          if (my > 0) onSwipeDown?.();
          else onSwipeUp?.();
        }
      }
    }
  }, {
    axis: direction === 'both' ? undefined : direction
  });

  return { bind };
};

export default SwipeGesture;