import React, { useState, useRef, useCallback, createContext, useContext } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface GestureHandlerProps {
  children: React.ReactNode;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onDragStart?: () => void;
  onDrag?: (delta: [number, number]) => void;
  onDragEnd?: () => void;
  onPinchStart?: () => void;
  onPinch?: (scale: number) => void;
  onPinchEnd?: () => void;
  onRotate?: (rotation: number) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  enableSwipe?: boolean;
  enableDrag?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  longPressDelay?: number;
  threshold?: number;
  className?: string;
}

interface GestureContextValue {
  isPressed: boolean;
  isDragging: boolean;
  isPinching: boolean;
  currentGesture: string | null;
  registerHandler: (id: string, handler: GestureHandlerProps) => void;
  unregisterHandler: (id: string) => void;
}

// Contexte pour la gestion centralisée des gestes
const GestureContext = createContext<GestureContextValue | null>(null);

// Hook pour utiliser le contexte des gestes
const useGestureContext = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestureContext must be used within a GestureProvider');
  }
  return context;
};

// Composant Provider pour les gestes
interface GestureProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

export const GestureProvider: React.FC<GestureProviderProps> = ({
  children,
  debug = false
}) => {
  const [handlers, setHandlers] = useState<Record<string, GestureHandlerProps>>({});
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);

  const registerHandler = useCallback((id: string, handler: GestureHandlerProps) => {
    setHandlers(prev => ({ ...prev, [id]: handler }));
  }, []);

  const unregisterHandler = useCallback((id: string) => {
    setHandlers(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue: GestureContextValue = {
    isPressed,
    isDragging,
    isPinching,
    currentGesture,
    registerHandler,
    unregisterHandler
  };

  return (
    <GestureContext.Provider value={contextValue}>
      {debug && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-sm z-50">
          <div>Pressed: {isPressed ? 'Yes' : 'No'}</div>
          <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
          <div>Pinching: {isPinching ? 'Yes' : 'No'}</div>
          <div>Gesture: {currentGesture || 'None'}</div>
          <div>Handlers: {Object.keys(handlers).length}</div>
        </div>
      )}
      {children}
    </GestureContext.Provider>
  );
};

// Hook personnalisé pour la gestion des gestes
export const useGestureHandler = (
  id: string,
  config: GestureHandlerProps
) => {
  const { registerHandler, unregisterHandler } = useGestureContext();
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    registerHandler(id, config);
    return () => unregisterHandler(id);
  }, [id, config, registerHandler, unregisterHandler]);

  const clearLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = undefined;
    }
  }, []);

  return {
    clearLongPress
  };
};

// Composant principal GestureHandler
export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onDragStart,
  onDrag,
  onDragEnd,
  onPinchStart,
  onPinch,
  onPinchEnd,
  onRotate,
  onSwipe,
  enableSwipe = true,
  enableDrag = true,
  enablePinch = true,
  enableRotate = true,
  longPressDelay = 500,
  threshold = 50,
  className
}) => {
  const [lastTap, setLastTap] = useState<number>(0);
  const [isPressed, setIsPressed] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout>();
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();

  const bind = useGesture({
    onClick: ({ event, timeStamp }) => {
      event.preventDefault();
      
      const now = timeStamp;
      const timeDiff = now - lastTap;
      
      if (timeDiff < 300) {
        // Double tap
        if (tapTimeout) clearTimeout(tapTimeout);
        onDoubleTap?.();
      } else {
        // Single tap avec délai pour éviter le conflit avec le double tap
        const timeout = setTimeout(() => {
          onTap?.();
        }, 300);
        setTapTimeout(timeout);
      }
      
      setLastTap(now);
    },
    
    onPointerDown: () => {
      setIsPressed(true);
      
      // Long press
      longPressTimeoutRef.current = setTimeout(() => {
        onLongPress?.();
      }, longPressDelay);
    },
    
    onPointerUp: () => {
      setIsPressed(false);
      clearTimeout(longPressTimeoutRef.current!);
    },
    
    onDrag: ({ active, movement: [mx, my], direction: [dirX, dirY], first, last, event }) => {
      event.preventDefault();
      
      if (enableDrag) {
        if (first) {
          onDragStart?.();
        }
        
        onDrag?.([mx, my]);
        
        if (last) {
          onDragEnd?.();
        }
      }
      
      // Détection du swipe
      if (enableSwipe && last) {
        const distance = Math.sqrt(mx * mx + my * my);
        if (distance > threshold) {
          let swipeDirection: 'left' | 'right' | 'up' | 'down';
          
          if (Math.abs(mx) > Math.abs(my)) {
            swipeDirection = mx > 0 ? 'right' : 'left';
          } else {
            swipeDirection = my > 0 ? 'down' : 'up';
          }
          
          onSwipe?.(swipeDirection);
        }
      }
    },
    
    onPinch: ({ offset: [d], origin, touches, first, last }) => {
      if (enablePinch) {
        if (first) {
          onPinchStart?.();
        }
        
        onPinch?.(d);
        
        if (last) {
          onPinchEnd?.();
        }
      }
    },
    
    onRotate: ({ rotation, origin, touches, first, last }) => {
      if (enableRotate) {
        if (first) {
          onPinchStart?.();
        }
        
        onRotate?.(rotation);
        
        if (last) {
          onPinchEnd?.();
        }
      }
    }
  }, {
    drag: {
      filterTaps: true,
      rubberband: true
    },
    pinch: {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: true
    },
    rotate: {
      rubberband: true
    }
  });

  return (
    <motion.div
      {...bind()}
      className={cn(
        'touch-none select-none',
        isPressed && 'scale-95',
        className
      )}
      style={{
        touchAction: 'none'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Composant Gesture Collector (collecte plusieurs gestes)
interface GestureCollectorProps {
  children: React.ReactNode;
  onGesturesDetected?: (gestures: string[]) => void;
  minGestures?: number;
  maxGestures?: number;
  timeout?: number;
  className?: string;
}

export const GestureCollector: React.FC<GestureCollectorProps> = ({
  children,
  onGesturesDetected,
  minGestures = 2,
  maxGestures = 5,
  timeout = 2000,
  className
}) => {
  const [gestures, setGestures] = useState<string[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const bind = useGesture({
    onTap: () => {
      addGesture('tap');
    },
    onDoubleTap: () => {
      addGesture('double-tap');
    },
    onDrag: ({ first, last, movement: [mx, my] }) => {
      if (first) {
        addGesture('drag-start');
      } else if (last) {
        const distance = Math.sqrt(mx * mx + my * my);
        if (distance > 100) {
          const direction = mx > 0 ? (my > 0 ? 'drag-down-right' : 'drag-up-right') : (my > 0 ? 'drag-down-left' : 'drag-up-left');
          addGesture(direction);
        } else {
          addGesture('drag');
        }
      }
    },
    onPinch: ({ first, last, offset: [d] }) => {
      if (first) {
        addGesture('pinch-start');
      } else if (last) {
        addGesture(d > 1 ? 'pinch-out' : 'pinch-in');
      }
    },
    onRotate: ({ first, last, rotation }) => {
      if (first) {
        addGesture('rotate-start');
      } else if (last) {
        const direction = rotation > 0 ? 'rotate-clockwise' : 'rotate-counter-clockwise';
        addGesture(direction);
      }
    }
  }, {
    tap: { filterTaps: true }
  });

  const addGesture = useCallback((gesture: string) => {
    setGestures(prev => [...prev, gesture]);
    setIsCollecting(true);

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      finalizeGestures();
    }, timeout);
  }, [timeout]);

  const finalizeGestures = useCallback(() => {
    if (gestures.length >= minGestures && gestures.length <= maxGestures) {
      onGesturesDetected?.([...gestures]);
    }
    
    setGestures([]);
    setIsCollecting(false);
  }, [gestures, minGestures, maxGestures, onGesturesDetected]);

  return (
    <motion.div
      {...bind()}
      className={cn('relative', className)}
      style={{ touchAction: 'none' }}
    >
      {children}
      
      {/* Indicateur de collecte */}
      {isCollecting && (
        <motion.div
          className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {gestures.length} gestes collectés
        </motion.div>
      )}
      
      {/* Barre de progression du timeout */}
      {isCollecting && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-blue-500"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: timeout / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

// Hook pour combinaison de gestes
export const useGestureCombination = (
  combination: string[],
  onCombination: () => void
) => {
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  const addGesture = useCallback((gesture: string) => {
    const newSequence = [...currentSequence, gesture];
    
    // Vérifier si on a la combinaison exacte
    if (newSequence.length === combination.length) {
      const isMatch = combination.every((g, i) => g === newSequence[i]);
      if (isMatch) {
        onCombination();
        setCurrentSequence([]);
        setIsActive(false);
        return;
      }
      
      // Si ça ne match pas, reset après un délai
      setTimeout(() => {
        setCurrentSequence([]);
        setIsActive(false);
      }, 1000);
    } else {
      setCurrentSequence(newSequence);
      setIsActive(true);
    }
  }, [currentSequence, combination, onCombination]);

  return {
    addGesture,
    isActive,
    currentSequence
  };
};

// Composant Gesture Shortcuts
interface GestureShortcutsProps {
  shortcuts: Array<{
    combination: string[];
    action: () => void;
    description: string;
  }>;
  children: React.ReactNode;
  className?: string;
}

export const GestureShortcuts: React.FC<GestureShortcutsProps> = ({
  shortcuts,
  children,
  className
}) => {
  const [activeCombinations, setActiveCombinations] = useState<Set<string>>(new Set());

  const bind = useGesture({
    onTap: () => handleGesture('tap'),
    onDoubleTap: () => handleGesture('double-tap'),
    onDrag: ({ first, last, movement: [mx, my] }) => {
      if (first) handleGesture('drag-start');
      if (last) {
        const direction = mx > 100 ? 'swipe-right' : mx < -100 ? 'swipe-left' : 'drag';
        handleGesture(direction);
      }
    }
  });

  const handleGesture = useCallback((gesture: string) => {
    shortcuts.forEach(shortcut => {
      // Logique simplifiée pour les démos
      const key = `${gesture}-${shortcut.description}`;
      if (!activeCombinations.has(key)) {
        // Simuler l'exécution du raccourci après une séquence
        setTimeout(() => {
          shortcut.action();
        }, Math.random() * 2000);
        setActiveCombinations(prev => new Set([...prev, key]));
      }
    });
  }, [shortcuts, activeCombinations]);

  return (
    <div {...bind()} className={cn('relative', className)} style={{ touchAction: 'none' }}>
      {children}
      
      {/* Indicateur des raccourcis */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs max-w-xs">
        <div className="font-semibold mb-1">Raccourcis Gestuels:</div>
        {shortcuts.map((shortcut, index) => (
          <div key={index}>
            {shortcut.description}
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant Gesture Visualizer (pour débogage)
export const GestureVisualizer: React.FC<{ className?: string }> = ({ className }) => {
  const [gestureHistory, setGestureHistory] = useState<Array<{ gesture: string; time: number }>>([]);
  const [isRecording, setIsRecording] = useState(false);

  const bind = useGesture({
    onTap: () => addGesture('tap'),
    onDrag: ({ first, last }) => {
      if (first) addGesture('drag-start');
      if (last) addGesture('drag-end');
    },
    onPinch: ({ first, last }) => {
      if (first) addGesture('pinch-start');
      if (last) addGesture('pinch-end');
    }
  });

  const addGesture = useCallback((gesture: string) => {
    setGestureHistory(prev => [
      ...prev.slice(-9), // Garder les 10 derniers gestes
      { gesture, time: Date.now() }
    ]);
  }, []);

  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Gesture Visualizer</h3>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            'px-3 py-1 rounded text-sm',
            isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          )}
        >
          {isRecording ? 'Stop' : 'Start'}
        </button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {gestureHistory.map((entry, index) => (
          <div
            key={index}
            className="flex justify-between text-sm bg-gray-100 p-2 rounded"
          >
            <span>{entry.gesture}</span>
            <span className="text-gray-500">
              {new Date(entry.time).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestureHandler;