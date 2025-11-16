import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Import all interactive components
import {
  // Animation Components
  FadeIn, ScaleIn, SlideIn, RotateIn,
  GSAPAnimations, SpringAnimations, StaggerAnimations,
  MorphingShapes, ParallaxEffects,
  
  // Gesture Components  
  SwipeDetector, PinchZoomContainer, RotateContainer,
  MomentumScroll, InertiaScroll, SnapScroll, ParallaxScroll,
  TouchRipple, TouchHighlight, TouchScale, TouchVibrate, TouchSound,
  GestureProvider, AdaptiveDrag, PrecisionDrag, SnapDrag, BoundaryDrag,
  
  // Drag & Drop Components
  DraggableItem, DropZone, CustomPreview, SnapPreview, AnimatedPreview,
  SortableList, DragProvider, DndProvider,
  
  // Micro-interaction Components
  HoverCard, HoverGlow, HoverTilt, HoverZoom, HoverReveal,
  RippleButton, RippleContainer, MaterialRipple,
  FocusRing, FocusGlow, FocusPulse, FocusScale, FocusHighlight,
  SkeletonTransition, ContentLoader, ProgressTransition, StaggerLoad, PageTransition,
  CheckmarkSuccess, ConfettiSuccess, HeartsSuccess, StarsSuccess, SparklesSuccess,
  ShakeError, BounceError, PulseError, FlashError, VibrateError,
  
  // Types and utilities
  InteractionCategory
} from './';

// Demo state management
interface DemoState {
  currentCategory: InteractionCategory | null;
  currentComponent: string | null;
  isPlaying: boolean;
  showControls: boolean;
  reducedMotion: boolean;
}

// Component showcase data
const ComponentShowcase = {
  animations: {
    name: 'Animation Components',
    description: 'Advanced animation libraries integration with Framer Motion, GSAP, and React Spring',
    components: [
      {
        name: 'FramerMotionWrapper',
        variants: ['FadeIn', 'ScaleIn', 'SlideIn', 'RotateIn'],
        description: 'Wrapper for Framer Motion with configurable animation variants'
      },
      {
        name: 'GSAPAnimations',
        variants: ['TimelineSequence', 'ScrollTrigger', 'PathAnimation', 'MorphSVG'],
        description: 'GSAP Timeline component for complex coordinated animations'
      },
      {
        name: 'SpringAnimations',
        variants: ['SpringContainer', 'SpringChain', 'SpringTrail', 'SpringGesture'],
        description: 'React Spring physics-based animations with natural motion'
      },
      {
        name: 'StaggerAnimations',
        variants: ['StaggerContainer', 'StaggerList', 'StaggerGrid', 'StaggerText'],
        description: 'Sequential staggered animations with configurable delays'
      },
      {
        name: 'MorphingShapes',
        variants: ['CircleToSquare', 'PolygonMorph', 'PathMorph', 'FluidMorph'],
        description: 'SVG shape morphing animations with smooth interpolation'
      },
      {
        name: 'ParallaxEffects',
        variants: ['ParallaxContainer', 'ParallaxLayer', 'ParallaxImage', 'ParallaxText'],
        description: 'Parallax scrolling effects for 3D depth perception'
      }
    ]
  },
  gestures: {
    name: 'Gesture Components',
    description: 'Touch and gesture interaction components for mobile and desktop',
    components: [
      {
        name: 'SwipeGesture',
        variants: ['SwipeLeft', 'SwipeRight', 'SwipeUp', 'SwipeDown'],
        description: 'Multi-directional swipe detection with configurable thresholds'
      },
      {
        name: 'PinchZoom',
        variants: ['PinchZoomContainer'],
        description: 'Multi-touch pinch to zoom with min/max constraints'
      },
      {
        name: 'RotateGesture',
        variants: ['RotateContainer'],
        description: 'Two-finger rotation gesture with snap-to-angle support'
      },
      {
        name: 'ScrollGestures',
        variants: ['MomentumScroll', 'InertiaScroll', 'SnapScroll', 'ParallaxScroll'],
        description: 'Physics-based scrolling with momentum and snap points'
      },
      {
        name: 'TouchFeedback',
        variants: ['TouchRipple', 'TouchHighlight', 'TouchScale', 'TouchVibrate', 'TouchSound'],
        description: 'Visual and haptic feedback for touch interactions'
      },
      {
        name: 'GestureHandler',
        variants: ['GestureProvider'],
        description: 'Centralized gesture management and coordination'
      },
      {
        name: 'DragSensitivity',
        variants: ['AdaptiveDrag', 'PrecisionDrag', 'SnapDrag', 'BoundaryDrag'],
        description: 'Configurable drag sensitivity with constraints and snapping'
      }
    ]
  },
  dragDrop: {
    name: 'Drag & Drop Components',
    description: 'Advanced drag and drop functionality with HTML5 backend',
    components: [
      {
        name: 'Draggable',
        variants: ['DraggableItem', 'CloneMode', 'GhostMode'],
        description: 'Draggable items with clone and ghost modes'
      },
      {
        name: 'DropZone',
        variants: ['DropZone', 'DropTarget', 'AcceptRule'],
        description: 'Drop targets with validation and visual feedback'
      },
      {
        name: 'DragPreview',
        variants: ['CustomPreview', 'SnapPreview', 'AnimatedPreview'],
        description: 'Customizable drag preview with positioning'
      },
      {
        name: 'SortableList',
        variants: ['SortableList', 'Vertical', 'Horizontal', 'Grid'],
        description: 'Drag-to-reorder lists with animated sorting'
      },
      {
        name: 'DragContext',
        variants: ['DragProvider', 'DndProvider'],
        description: 'Global drag and drop state management'
      }
    ]
  },
  micro: {
    name: 'Micro-interaction Components',
    description: 'Subtle feedback and state transition animations',
    components: [
      {
        name: 'HoverEffects',
        variants: ['HoverCard', 'HoverGlow', 'HoverTilt', 'HoverZoom', 'HoverReveal'],
        description: 'Sophisticated hover interactions with multiple effects'
      },
      {
        name: 'ClickRipples',
        variants: ['RippleButton', 'RippleContainer', 'MaterialRipple'],
        description: 'Material Design inspired ripple effects'
      },
      {
        name: 'FocusAnimations',
        variants: ['FocusRing', 'FocusGlow', 'FocusPulse', 'FocusScale', 'FocusHighlight'],
        description: 'Accessibility-focused animations for keyboard navigation'
      },
      {
        name: 'LoadingTransitions',
        variants: ['SkeletonTransition', 'ContentLoader', 'ProgressTransition', 'StaggerLoad', 'PageTransition'],
        description: 'Smooth loading state transitions and skeleton screens'
      },
      {
        name: 'SuccessFeedback',
        variants: ['CheckmarkSuccess', 'ConfettiSuccess', 'HeartsSuccess', 'StarsSuccess', 'SparklesSuccess'],
        description: 'Engaging success animations with visual feedback'
      },
      {
        name: 'ErrorBounce',
        variants: ['ShakeError', 'BounceError', 'PulseError', 'FlashError', 'VibrateError'],
        description: 'Attention-grabbing error animations and notifications'
      }
    ]
  }
} as const;

// Individual component demos
const AnimationDemos: React.FC = () => {
  const [currentAnimation, setCurrentAnimation] = useState('fadeIn');
  const [isPlaying, setIsPlaying] = useState(false);

  const AnimationComponent = {
    fadeIn: FadeIn,
    scaleIn: ScaleIn,
    slideIn: SlideIn,
    rotateIn: RotateIn
  }[currentAnimation] || FadeIn;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {Object.keys(AnimationComponent).map((variant) => (
          <button
            key={variant}
            onClick={() => setCurrentAnimation(variant)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentAnimation === variant
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {variant}
          </button>
        ))}
      </div>

      <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <AnimationComponent 
          visible={isPlaying}
          duration={1000}
          className="text-4xl font-bold text-blue-600"
        >
          {currentAnimation}
        </AnimationComponent>
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? 'Stop' : 'Play'} Animation
      </button>
    </div>
  );
};

const GestureDemos: React.FC = () => {
  const [lastGesture, setLastGesture] = useState<string>('No gesture detected');

  return (
    <div className="space-y-6">
      <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden">
        <SwipeDetector
          onSwipeLeft={() => setLastGesture('Swiped Left')}
          onSwipeRight={() => setLastGesture('Swiped Right')}
          onSwipeUp={() => setLastGesture('Swiped Up')}
          onSwipeDown={() => setLastGesture('Swiped Down')}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-gray-600 mb-2">Swipe in any direction</p>
            <p className="text-sm font-medium text-blue-600">{lastGesture}</p>
          </div>
        </SwipeDetector>
      </div>

      <PinchZoomContainer className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
        Pinch to Zoom
      </PinchZoomContainer>
    </div>
  );
};

const DragDropDemos: React.FC = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Draggable Items</h3>
          <DragProvider>
            {items.map((item, index) => (
              <DraggableItem key={index} id={index.toString()}>
                <motion.div 
                  className="p-3 bg-blue-100 rounded-lg cursor-move hover:bg-blue-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05, rotate: 5 }}
                >
                  {item}
                </motion.div>
              </DraggableItem>
            ))}
          </DragProvider>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Drop Zone</h3>
          <DropZone
            accepts={['text']}
            onDrop={(item) => console.log('Dropped:', item)}
            className="min-h-32 border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50"
          >
            <p className="text-green-600 text-center">Drop items here</p>
          </DropZone>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Sortable List</h3>
        <SortableList
          items={items}
          onReorder={setItems}
          className="space-y-2"
          renderItem={(item, index) => (
            <motion.div 
              key={index}
              className="p-3 bg-gray-100 rounded-lg cursor-move"
              layout
            >
              {item}
            </motion.div>
          )}
        />
      </div>
    </div>
  );
};

const MicroInteractionDemos: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Hover Effects</h3>
          <div className="space-y-3">
            <HoverCard className="p-4 bg-white rounded-lg shadow-md">
              <h4 className="font-semibold">Hover Card</h4>
              <p className="text-gray-600 text-sm">Hover to see the effect</p>
            </HoverCard>
            
            <HoverGlow className="p-4 bg-white rounded-lg shadow-md">
              <h4 className="font-semibold">Hover Glow</h4>
              <p className="text-gray-600 text-sm">Beautiful glow effect</p>
            </HoverGlow>
            
            <HoverTilt className="p-4 bg-white rounded-lg shadow-md">
              <h4 className="font-semibold">Hover Tilt</h4>
              <p className="text-gray-600 text-sm">3D tilt perspective</p>
            </HoverTilt>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Click Effects</h3>
          <div className="space-y-3">
            <RippleButton className="px-6 py-3 bg-blue-500 text-white rounded-lg">
              Ripple Button
            </RippleButton>
            
            <TouchRipple className="px-6 py-3 bg-green-500 text-white rounded-lg">
              Touch Ripple
            </TouchRipple>
            
            <MaterialRipple className="px-6 py-3 bg-purple-500 text-white rounded-lg">
              Material Ripple
            </MaterialRipple>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Focus Animations</h3>
          <div className="space-y-3">
            <FocusRing className="block w-full px-4 py-2 border border-gray-300 rounded-lg">
              Focus Ring
            </FocusRing>
            
            <FocusGlow className="block w-full px-4 py-2 border border-gray-300 rounded-lg">
              Focus Glow
            </FocusGlow>
            
            <FocusPulse className="block w-full px-4 py-2 border border-gray-300 rounded-lg">
              Focus Pulse
            </FocusPulse>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Loading States</h3>
          <div className="space-y-3">
            <SkeletonTransition loading={true}>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </SkeletonTransition>
            
            <ContentLoader loading={true}>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </ContentLoader>
            
            <ProgressTransition progress={65} className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: '65%' }}
              ></div>
            </ProgressTransition>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Success Feedback</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowSuccess(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Show Success
            </button>
            <div className="grid grid-cols-2 gap-2">
              <CheckmarkSuccess visible={showSuccess} onComplete={() => setShowSuccess(false)} type="checkmark" />
              <ConfettiSuccess visible={showSuccess} onComplete={() => setShowSuccess(false)} type="confetti" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Error Feedback</h3>
          <button
            onClick={() => setShowError(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Show Error
          </button>
          <ShakeError 
            visible={showError} 
            onDismiss={() => setShowError(false)}
            type="shake"
            message="Something went wrong!"
          />
        </div>
      </div>
    </div>
  );
};

// Main demonstration component
export const InteractiveComponentsDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>({
    currentCategory: null,
    currentComponent: null,
    isPlaying: false,
    showControls: true,
    reducedMotion: false
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['animations']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryDemo = (category: keyof typeof ComponentShowcase) => {
    switch (category) {
      case 'animations':
        return <AnimationDemos />;
      case 'gestures':
        return <GestureDemos />;
      case 'dragDrop':
        return <DragDropDemos />;
      case 'micro':
        return <MicroInteractionDemos />;
      default:
        return <div>Select a component to view demo</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interactive Components Demo
              </h1>
              <p className="mt-2 text-gray-600">
                Explore 24 advanced interactive components across 4 categories
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDemoState(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  demoState.reducedMotion 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {demoState.reducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {demoState.reducedMotion ? 'Animations On' : 'Reduce Motion'}
              </button>
              
              <button
                onClick={() => setDemoState(prev => ({ ...prev, showControls: !prev.showControls }))}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {demoState.showControls ? 'Hide' : 'Show'} Controls
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Component Browser */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Components</h2>
              </div>
              
              <div className="p-4 space-y-2">
                {Object.entries(ComponentShowcase).map(([key, category]) => (
                  <div key={key}>
                    <button
                      onClick={() => toggleCategory(key)}
                      className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.count} components</p>
                      </div>
                      {expandedCategories.has(key) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategories.has(key) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-6 pb-2 space-y-1">
                            {category.components.map((component) => (
                              <button
                                key={component.name}
                                onClick={() => setDemoState(prev => ({
                                  ...prev,
                                  currentCategory: key as InteractionCategory,
                                  currentComponent: component.name
                                }))}
                                className={`w-full text-left p-2 text-sm rounded transition-colors ${
                                  demoState.currentComponent === component.name
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <div className="font-medium">{component.name}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {component.variants.length} variants
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {demoState.currentCategory 
                        ? ComponentShowcase[demoState.currentCategory]?.name 
                        : 'Select a Component'
                      }
                    </h2>
                    {demoState.currentCategory && (
                      <p className="text-gray-600 mt-1">
                        {ComponentShowcase[demoState.currentCategory]?.description}
                      </p>
                    )}
                  </div>
                  
                  {demoState.currentCategory && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDemoState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {demoState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {demoState.isPlaying ? 'Pause' : 'Play'}
                      </button>
                      
                      <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {demoState.currentCategory ? (
                  renderCategoryDemo(demoState.currentCategory)
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Settings className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Welcome to Interactive Components Demo
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Select a component category from the sidebar to see live demonstrations 
                      of our 24 advanced interactive components.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveComponentsDemo;