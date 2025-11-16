// Export all micro-interaction components
export { HoverEffects, HoverCard, HoverGlow, HoverTilt, HoverZoom, HoverReveal } from './HoverEffects';
export { ClickRipples, RippleButton, RippleContainer, MaterialRipple } from './ClickRipples';
export { FocusAnimations, FocusRing, FocusGlow, FocusPulse, FocusScale, FocusHighlight } from './FocusAnimations';
export { LoadingTransitions, SkeletonTransition, ContentLoader, ProgressTransition, StaggerLoad, PageTransition } from './LoadingTransitions';
export { SuccessFeedback, CheckmarkSuccess, ConfettiSuccess, HeartsSuccess, StarsSuccess, SparklesSuccess } from './SuccessFeedback';
export { ErrorBounce, ShakeError, BounceError, PulseError, FlashError, VibrateError } from './ErrorBounce';

// Type definitions for micro-interactions
export interface HoverEffectProps {
  children: React.ReactNode;
  effect?: 'glow' | 'tilt' | 'zoom' | 'reveal';
  intensity?: 'low' | 'medium' | 'high';
  disabled?: boolean;
  className?: string;
}

export interface ClickRippleProps {
  children: React.ReactNode;
  color?: string;
  speed?: 'slow' | 'medium' | 'fast';
  centered?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FocusAnimationProps {
  children: React.ReactNode;
  type?: 'ring' | 'glow' | 'pulse' | 'scale' | 'highlight';
  color?: string;
  disabled?: boolean;
  className?: string;
}

export interface LoadingTransitionProps {
  children: React.ReactNode;
  type?: 'skeleton' | 'loader' | 'progress' | 'stagger' | 'page';
  loading?: boolean;
  duration?: number;
  className?: string;
}

export interface SuccessFeedbackProps {
  visible: boolean;
  onComplete?: () => void;
  type?: 'checkmark' | 'confetti' | 'hearts' | 'stars' | 'sparkles';
  duration?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
  showMessage?: boolean;
  autoHide?: boolean;
  position?: 'center' | 'top' | 'bottom';
}

export interface ErrorBounceProps {
  visible: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: 'shake' | 'bounce' | 'pulse' | 'flash' | 'vibrate';
  duration?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
  description?: string;
  showRetry?: boolean;
  autoHide?: boolean;
  position?: 'center' | 'top' | 'bottom';
  intensity?: 'low' | 'medium' | 'high';
}

// Component categories for easy importing
export const MicroInteractionCategories = {
  hover: {
    name: 'Hover Effects',
    components: ['HoverCard', 'HoverGlow', 'HoverTilt', 'HoverZoom', 'HoverReveal'],
    description: 'Interactive hover animations for enhanced user experience'
  },
  click: {
    name: 'Click Ripples',
    components: ['RippleButton', 'RippleContainer', 'MaterialRipple'],
    description: 'Material Design inspired ripple effects for touch feedback'
  },
  focus: {
    name: 'Focus Animations',
    components: ['FocusRing', 'FocusGlow', 'FocusPulse', 'FocusScale', 'FocusHighlight'],
    description: 'Accessibility-focused animations for keyboard navigation'
  },
  loading: {
    name: 'Loading Transitions',
    components: ['SkeletonTransition', 'ContentLoader', 'ProgressTransition', 'StaggerLoad', 'PageTransition'],
    description: 'Smooth loading state transitions and skeleton screens'
  },
  success: {
    name: 'Success Feedback',
    components: ['CheckmarkSuccess', 'ConfettiSuccess', 'HeartsSuccess', 'StarsSuccess', 'SparklesSuccess'],
    description: 'Engaging success animations with visual feedback'
  },
  error: {
    name: 'Error Feedback',
    components: ['ShakeError', 'BounceError', 'PulseError', 'FlashError', 'VibrateError'],
    description: 'Attention-grabbing error animations and notifications'
  }
} as const;

export type MicroInteractionCategory = keyof typeof MicroInteractionCategories;