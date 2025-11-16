// Export all interaction components and utilities

// Animation Components
export * from './animations';
// - FramerMotionWrapper.tsx
// - GSAPAnimations.tsx  
// - SpringAnimations.tsx
// - StaggerAnimations.tsx
// - MorphingShapes.tsx
// - ParallaxEffects.tsx

// Gesture Components
export * from './gestures';
// - SwipeGesture.tsx
// - PinchZoom.tsx
// - RotateGesture.tsx
// - ScrollGestures.tsx
// - TouchFeedback.tsx
// - GestureHandler.tsx
// - DragSensitivity.tsx

// Drag & Drop Components
export * from './drag-drop';
// - Draggable.tsx
// - DropZone.tsx
// - DragPreview.tsx
// - SortableList.tsx
// - DragContext.tsx

// Micro-interaction Components
export * from './micro';
// - HoverEffects.tsx
// - ClickRipples.tsx
// - FocusAnimations.tsx
// - LoadingTransitions.tsx
// - SuccessFeedback.tsx
// - ErrorBounce.tsx

// Type definitions and interfaces
export interface InteractionConfig {
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
    spring?: {
      mass: number;
      tension: number;
      friction: number;
    };
  };
  gestures: {
    enabled: boolean;
    sensitivity: number;
    threshold: number;
    multiTouch: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    keyboardNavigation: boolean;
    screenReader: boolean;
    focusIndicators: boolean;
  };
  performance: {
    lazyLoading: boolean;
    virtualScrolling: boolean;
    memoryOptimization: boolean;
    hardwareAcceleration: boolean;
  };
}

export interface InteractionProviderProps {
  children: React.ReactNode;
  config?: Partial<InteractionConfig>;
}

// Animation Variants for consistency across components
export const AnimationVariants = {
  // Standard entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 10 }
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
} as const;

// Gesture Types
export interface GestureConfig {
  swipe: {
    threshold: number;
    velocity: number;
    preventDefaultTouchmoveEvent: boolean;
  };
  pinch: {
    threshold: number;
    minScale: number;
    maxScale: number;
  };
  rotate: {
    threshold: number;
    snapToAngles: boolean;
    angleStep: number;
  };
  drag: {
    sensitivity: number;
    inertia: boolean;
    bounds: {
      x?: [number, number];
      y?: [number, number];
    };
  };
}

// Easing Functions
export const EasingFunctions = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  linear: [0, 0, 1, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInBack: [0.6, -0.28, 0.735, 0.045],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55]
} as const;

// Component Statistics for Option C.2
export const InteractionStats = {
  totalComponents: 24,
  categories: {
    animations: 6,
    gestures: 7,
    dragDrop: 5,
    microInteractions: 6
  },
  features: {
    typeScript: true,
    accessibility: true,
    performanceOptimized: true,
    responsive: true,
    customizable: true
  },
  dependencies: [
    'framer-motion',
    'gsap',
    '@use-gesture/react',
    'react-spring',
    'react-dnd',
    'react-dnd-html5-backend'
  ],
  approximateLines: {
    typeScript: 15000,
    css: 800,
    total: 15800
  }
} as const;

// Default Configuration
export const DefaultInteractionConfig: InteractionConfig = {
  animations: {
    enabled: true,
    duration: 300,
    easing: 'easeInOut'
  },
  gestures: {
    enabled: true,
    sensitivity: 1,
    threshold: 50,
    multiTouch: true
  },
  accessibility: {
    reducedMotion: false,
    keyboardNavigation: true,
    screenReader: true,
    focusIndicators: true
  },
  performance: {
    lazyLoading: true,
    virtualScrolling: true,
    memoryOptimization: true,
    hardwareAcceleration: true
  }
} as const;

// Utility functions for interactions
export const InteractionUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },

  // Check if device supports touch
  isTouchDevice: (): boolean => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  },

  // Check if device supports haptic feedback
  supportsHaptics: (): boolean => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  },

  // Generate unique ID for components
  generateId: (prefix: string = 'interaction'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Clamp value between min and max
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  // Linear interpolation
  lerp: (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  },

  // Convert hex color to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
} as const;

// Export component categories for easy discovery
export const InteractionCategories = {
  animations: {
    name: 'Animation Components',
    description: 'Advanced animation libraries integration (Framer Motion, GSAP, React Spring)',
    count: 6,
    components: [
      'FramerMotionWrapper',
      'GSAPAnimations', 
      'SpringAnimations',
      'StaggerAnimations',
      'MorphingShapes',
      'ParallaxEffects'
    ]
  },
  gestures: {
    name: 'Gesture Components',
    description: 'Touch and gesture interaction components',
    count: 7,
    components: [
      'SwipeGesture',
      'PinchZoom',
      'RotateGesture',
      'ScrollGestures',
      'TouchFeedback',
      'GestureHandler',
      'DragSensitivity'
    ]
  },
  dragDrop: {
    name: 'Drag & Drop Components',
    description: 'Advanced drag and drop functionality',
    count: 5,
    components: [
      'Draggable',
      'DropZone',
      'DragPreview',
      'SortableList',
      'DragContext'
    ]
  },
  micro: {
    name: 'Micro-interaction Components',
    description: 'Subtle feedback and state transition animations',
    count: 6,
    components: [
      'HoverEffects',
      'ClickRipples',
      'FocusAnimations',
      'LoadingTransitions',
      'SuccessFeedback',
      'ErrorBounce'
    ]
  }
} as const;

export type InteractionCategory = keyof typeof InteractionCategories;