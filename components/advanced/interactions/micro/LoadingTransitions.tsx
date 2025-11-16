import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface LoadingTransitionsProps {
  children: React.ReactNode;
  isLoading: boolean;
  effect?: 'fade' | 'slide' | 'scale' | 'skeleton' | 'shimmer' | 'pulse' | 'blur' | 'wipe';
  duration?: number;
  delay?: number;
  easing?: string;
  fallback?: React.ReactNode;
  minHeight?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

interface SkeletonLoaderProps {
  variant?: 'text' | 'avatar' | 'card' | 'button' | 'image' | 'list' | 'table';
  width?: string | number;
  height?: string | number;
  lines?: number;
  borderRadius?: number;
  className?: string;
  animated?: boolean;
}

interface ProgressiveLoaderProps {
  steps: Array<{
    id: string;
    label: string;
    isComplete?: boolean;
    isActive?: boolean;
    duration?: number;
  }>;
  currentStep?: string;
  onStepComplete?: (stepId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface StaggerLoaderProps {
  items: React.ReactNode[];
  isLoading: boolean;
  staggerDelay?: number;
  effect?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

interface ContentPlaceholderProps {
  content: React.ReactNode;
  placeholder: React.ReactNode;
  isLoading: boolean;
  transition?: 'crossfade' | 'slide' | 'scale' | 'wipe';
  duration?: number;
  className?: string;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  effect?: 'fade' | 'slide' | 'blur' | 'scale';
  color?: string;
  opacity?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Composant principal LoadingTransitions
export const LoadingTransitions: React.FC<LoadingTransitionsProps> = ({
  children,
  isLoading,
  effect = 'fade',
  duration = 300,
  delay = 0,
  easing = 'easeInOut',
  fallback,
  minHeight = 200,
  className,
  style
}) => {
  // Configuration des effets de transition
  const getTransitionConfig = () => {
    const baseTransition = { duration: duration / 1000, ease: easing, delay };
    
    const effects = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 }
      },
      skeleton: {
        initial: { opacity: 0, backgroundColor: '#f3f4f6' },
        animate: { 
          opacity: 1, 
          backgroundColor: isLoading ? '#f3f4f6' : '#ffffff',
          transition: { duration: duration / 1000, ease: easing }
        }
      },
      shimmer: {
        initial: { opacity: 0, backgroundPosition: '-200% 0' },
        animate: { 
          opacity: 1, 
          backgroundPosition: isLoading ? '200% 0' : '0% 0',
          transition: { duration: duration / 1000, ease: easing }
        }
      },
      pulse: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { 
          opacity: 1, 
          scale: isLoading ? 1 : 1,
          transition: { duration: duration / 1000, ease: easing }
        }
      },
      blur: {
        initial: { opacity: 0, filter: 'blur(8px)' },
        animate: { 
          opacity: 1, 
          filter: isLoading ? 'blur(2px)' : 'blur(0px)',
          transition: { duration: duration / 1000, ease: easing }
        }
      },
      wipe: {
        initial: { opacity: 0, x: '-100%' },
        animate: { 
          opacity: 1, 
          x: isLoading ? '0%' : '100%',
          transition: { duration: duration / 1000, ease: easing }
        }
      }
    };

    return { ...baseTransition, ...effects[effect] };
  };

  const transitionConfig = getTransitionConfig();

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ 
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        ...style
      }}
      initial={transitionConfig.initial}
      animate={transitionConfig.animate}
      exit={transitionConfig.exit}
    >
      {/* Contenu principal ou fallback */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="fallback"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: easing }}
          >
            {fallback || <DefaultSkeletonLoader effect={effect} />}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="absolute inset-0"
            initial={transitionConfig.initial}
            animate={transitionConfig.animate}
            exit={transitionConfig.exit}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Composant Skeleton Loader par défaut
const DefaultSkeletonLoader: React.FC<{ effect: string }> = ({ effect }) => {
  const [shimmerPosition, setShimmerPosition] = useState(0);

  useEffect(() => {
    if (effect === 'shimmer') {
      const interval = setInterval(() => {
        setShimmerPosition(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [effect]);

  const shimmerStyle = effect === 'shimmer' ? {
    background: `linear-gradient(90deg, #f3f4f6 ${shimmerPosition}%, #e5e7eb ${shimmerPosition + 20}%, #f3f4f6 ${shimmerPosition + 40}%)`,
    backgroundSize: '200% 100%'
  } : {};

  return (
    <div className="space-y-3 p-4">
      <div 
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={shimmerStyle}
      />
      <div 
        className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"
        style={shimmerStyle}
      />
      <div 
        className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"
        style={shimmerStyle}
      />
    </div>
  );
};

// Composant SkeletonLoader spécialisé
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height = 20,
  lines = 1,
  borderRadius = 4,
  className,
  animated = true
}) => {
  const getVariantStyle = () => {
    const baseStyle = {
      width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      backgroundColor: '#f3f4f6',
      position: 'relative' as const,
      overflow: 'hidden' as const
    };

    const variants = {
      text: { ...baseStyle },
      avatar: { 
        ...baseStyle, 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '50%'
      },
      card: { 
        ...baseStyle, 
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: '120px'
      },
      button: { 
        ...baseStyle, 
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: '40px',
        borderRadius: '8px'
      },
      image: { 
        ...baseStyle, 
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: '200px'
      },
      list: { 
        ...baseStyle, 
        height: `${height}px`,
        marginBottom: '8px'
      },
      table: { 
        ...baseStyle, 
        height: `${height}px`,
        borderRadius: '2px'
      }
    };

    return variants[variant];
  };

  const shimmerAnimation = animated ? {
    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  } : {};

  return (
    <>
      {lines > 1 ? (
        <div className={cn('space-y-2', className)}>
          {Array.from({ length: lines }, (_, index) => (
            <motion.div
              key={index}
              className="bg-gray-200 rounded"
              style={{
                ...getVariantStyle(),
                width: index === lines - 1 && variant === 'text' ? '60%' : getVariantStyle().width,
                ...shimmerAnimation
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          className={cn('bg-gray-200', className)}
          style={{
            ...getVariantStyle(),
            ...shimmerAnimation
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {/* Animation shimmer CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
};

// Composant ProgressiveLoader
export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  steps,
  currentStep,
  onStepComplete,
  orientation = 'horizontal',
  className
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepClick = useCallback((stepId: string) => {
    if (!completedSteps.has(stepId)) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(stepId);
      setCompletedSteps(newCompleted);
      onStepComplete?.(stepId);
    }
  }, [completedSteps, onStepComplete]);

  const isStepCompleted = useCallback((stepId: string) => {
    return completedSteps.has(stepId) || stepId === currentStep;
  }, [completedSteps, currentStep]);

  return (
    <div className={cn(
      'space-y-4',
      orientation === 'horizontal' && 'flex items-center space-x-4',
      className
    )}>
      {steps.map((step, index) => {
        const isCompleted = isStepCompleted(step.id);
        const isActive = step.isActive || step.id === currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            {/* Indicateur de step */}
            <motion.button
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'border-blue-500 text-blue-500 bg-white' 
                    : 'border-gray-300 text-gray-400 bg-white'
              )}
              onClick={() => handleStepClick(step.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCompleted ? '✓' : index + 1}
            </motion.button>
            
            {/* Label du step */}
            <motion.div
              className={cn(
                'ml-3',
                orientation === 'vertical' && 'ml-0 mt-2'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn(
                'text-sm font-medium',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}>
                {step.label}
              </div>
              {step.isComplete && (
                <motion.div
                  className="text-xs text-green-600 mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✓ Terminé
                </motion.div>
              )}
            </motion.div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  orientation === 'vertical' && 'w-0.5 h-8 mx-0 ml-4',
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                )}
                initial={{ scaleX: 0, scaleY: 0 }}
                animate={{ 
                  scaleX: 1, 
                  scaleY: orientation === 'vertical' ? 1 : 1 
                }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Composant StaggerLoader
export const StaggerLoader: React.FC<StaggerLoaderProps> = ({
  items,
  isLoading,
  staggerDelay = 100,
  effect = 'fadeIn',
  direction = 'up',
  className
}) => {
  const getDirectionOffset = () => {
    const offsets = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 }
    };
    return offsets[direction];
  };

  const getEffectVariants = () => {
    const effects = {
      fadeIn: { opacity: 0 },
      slideIn: { opacity: 0, ...getDirectionOffset() },
      scaleIn: { opacity: 0, scale: 0.8 },
      bounceIn: { opacity: 0, scale: 0.8, y: 50 }
    };
    return effects[effect];
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: getEffectVariants(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className={cn('space-y-3', className)}
      variants={containerVariants}
      initial="hidden"
      animate={isLoading ? "hidden" : "visible"}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant ContentPlaceholder
export const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({
  content,
  placeholder,
  isLoading,
  transition = 'crossfade',
  duration = 300,
  className
}) => {
  const getTransitionConfig = () => {
    const baseConfig = { duration: duration / 1000, ease: 'easeInOut' };
    
    const transitions = {
      crossfade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 }
      },
      wipe: {
        initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
        exit: { opacity: 0, clipPath: 'inset(0 0% 0 100%)' }
      }
    };

    return { ...baseConfig, ...transitions[transition] };
  };

  const transitionConfig = getTransitionConfig();

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="placeholder"
            className="absolute inset-0"
            initial={transitionConfig.initial}
            animate={transitionConfig.animate}
            exit={transitionConfig.exit}
          >
            {placeholder}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="absolute inset-0"
            initial={transitionConfig.initial}
            animate={transitionConfig.animate}
            exit={transitionConfig.exit}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant LoadingOverlay
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  effect = 'fade',
  color = '#ffffff',
  opacity = 0.8,
  children,
  className,
  style
}) => {
  const getEffectConfig = () => {
    const configs = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { opacity: 0, y: '-100%' },
        animate: { opacity, y: 0 },
        exit: { opacity: 0, y: '-100%' }
      },
      blur: {
        initial: { opacity: 0, filter: 'blur(10px)' },
        animate: { opacity, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(10px)' }
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      }
    };

    return configs[effect];
  };

  const effectConfig = getEffectConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'absolute inset-0 flex items-center justify-center z-50',
            className
          )}
          style={{
            backgroundColor: color,
            ...style
          }}
          initial={effectConfig.initial}
          animate={effectConfig.animate}
          exit={effectConfig.exit}
        >
          {children || (
            <motion.div
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook personnalisé pour les transitions de loading
export const useLoadingTransitions = (
  initialLoading: boolean = false
) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const stopLoading = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    isTransitioning,
    setIsLoading,
    startLoading,
    stopLoading,
    setLoadingState
  };
};

// Composant de démonstration
interface LoadingTransitionsDemoProps {
  className?: string;
}

export const LoadingTransitionsDemo: React.FC<LoadingTransitionsDemoProps> = ({
  className
}) => {
  const [loadingStates, setLoadingStates] = useState({
    basic: false,
    skeleton: false,
    progressive: false,
    stagger: false
  });

  const { isLoading: basicLoading, startLoading: startBasic, stopLoading: stopBasic } = useLoadingTransitions();
  const { isLoading: skeletonLoading, startLoading: startSkeleton, stopLoading: stopSkeleton } = useLoadingTransitions();

  const toggleLoading = (key: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={cn('max-w-4xl mx-auto space-y-8 p-6', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loading Transitions Demo</h2>
        <p className="text-gray-600">
          Découvrez les différentes transitions et effets de chargement
        </p>
      </div>

      {/* Loading Transitions de base */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Transitions de Base</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {['fade', 'slide', 'scale', 'skeleton'].map((effect) => (
            <button
              key={effect}
              onClick={() => toggleLoading(effect as keyof typeof loadingStates)}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              {effect}
            </button>
          ))}
        </div>
        
        {Object.entries(loadingStates).map(([key, isLoading]) => (
          <LoadingTransitions
            key={key}
            isLoading={isLoading}
            effect={key as any}
            fallback={
              <div className="space-y-2 p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            }
          >
            <div className="p-4">
              <h4 className="font-semibold mb-2">Contenu chargé</h4>
              <p className="text-gray-600">Ce contenu apparaît après le chargement.</p>
            </div>
          </LoadingTransitions>
        ))}
      </div>

      {/* Skeleton Loader spécialisé */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Skeleton Loaders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Text Skeleton</h4>
            <SkeletonLoader variant="text" lines={3} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Card Skeleton</h4>
            <SkeletonLoader variant="card" height={120} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Avatar Skeleton</h4>
            <SkeletonLoader variant="avatar" width={60} height={60} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Button Skeleton</h4>
            <SkeletonLoader variant="button" width={120} height={40} />
          </div>
        </div>
      </div>

      {/* Progressive Loader */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Progressive Loader</h3>
        <ProgressiveLoader
          steps={[
            { id: 'step1', label: 'Connexion à la base de données' },
            { id: 'step2', label: 'Récupération des données' },
            { id: 'step3', label: 'Traitement des informations' },
            { id: 'step4', label: 'Finalisation' }
          ]}
          currentStep="step2"
          orientation="horizontal"
        />
      </div>

      {/* Stagger Loader */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Stagger Loader</h3>
        <StaggerLoader
          items={[
            <div key="1">Premier élément</div>,
            <div key="2">Deuxième élément</div>,
            <div key="3">Troisième élément</div>,
            <div key="4">Quatrième élément</div>
          ]}
          isLoading={skeletonLoading}
          effect="slideIn"
          direction="up"
        />
        <button
          onClick={skeletonLoading ? stopSkeleton : startSkeleton}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          {skeletonLoading ? 'Arrêter' : 'Démarrer'} le Stagger
        </button>
      </div>
    </div>
  );
};

export default LoadingTransitions;