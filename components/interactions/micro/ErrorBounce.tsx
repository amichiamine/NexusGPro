import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

// Error Bounce Types
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

// Shake Error Component
interface ShakeErrorProps extends ErrorBounceProps {
  type: 'shake';
}

export const ShakeError: React.FC<ShakeErrorProps> = ({
  visible,
  onDismiss,
  onRetry,
  duration = 3000,
  size = 'md',
  color = '#EF4444',
  message = 'Error occurred!',
  description = 'Something went wrong. Please try again.',
  showRetry = true,
  autoHide = true,
  position = 'center',
  intensity = 'medium'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowContent(false);
          setTimeout(() => onDismiss?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, autoHide, onDismiss]);

  const intensityValues = {
    low: { amplitude: 5, frequency: 8 },
    medium: { amplitude: 10, frequency: 12 },
    high: { amplitude: 20, frequency: 15 }
  };

  const sizeClasses = {
    sm: { container: 'max-w-sm', icon: 'w-6 h-6', title: 'text-sm', desc: 'text-xs' },
    md: { container: 'max-w-md', icon: 'w-8 h-8', title: 'text-base', desc: 'text-sm' },
    lg: { container: 'max-w-lg', icon: 'w-12 h-12', title: 'text-lg', desc: 'text-base' }
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: [0, intensityValues[intensity].amplitude, -intensityValues[intensity].amplitude, intensityValues[intensity].amplitude, 0],
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            x: {
              duration: 0.5 / intensityValues[intensity].frequency,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`fixed ${positionClasses[position]} z-50 ${sizeClasses[size].container}`}
          style={{ zIndex: 9999 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl border-l-4 p-4 relative overflow-hidden"
            style={{ borderLeftColor: color }}
          >
            {/* Background Flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute inset-0 bg-red-500"
            />

            <div className="relative z-10 flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertCircle 
                  className={`${sizeClasses[size].icon} text-red-500`} 
                  style={{ color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`${sizeClasses[size].title} font-semibold text-gray-900 mb-1`}>
                  {message}
                </h3>
                <p className={`${sizeClasses[size].desc} text-gray-600`}>
                  {description}
                </p>
              </div>
              
              <div className="flex-shrink-0 flex gap-2">
                {showRetry && onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Retry"
                  >
                    <RefreshCw 
                      className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-500`} 
                    />
                  </motion.button>
                )}
                
                {onDismiss && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDismiss}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X 
                      className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-500`} 
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Bounce Error Component
interface BounceErrorProps extends ErrorBounceProps {
  type: 'bounce';
}

export const BounceError: React.FC<BounceErrorProps> = ({
  visible,
  onDismiss,
  onRetry,
  duration = 2500,
  size = 'md',
  color = '#F59E0B',
  message = 'Oops! Something went wrong',
  description = 'The operation failed. Please try again.',
  showRetry = true,
  autoHide = true,
  position = 'center',
  intensity = 'medium'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowContent(false);
          setTimeout(() => onDismiss?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, autoHide, onDismiss]);

  const intensityValues = {
    low: { scale: [1, 1.05, 0.95, 1.05, 1] },
    medium: { scale: [1, 1.1, 0.9, 1.1, 1] },
    high: { scale: [1, 1.2, 0.8, 1.2, 1] }
  };

  const sizeClasses = {
    sm: { container: 'max-w-sm', icon: 'w-6 h-6', title: 'text-sm', desc: 'text-xs' },
    md: { container: 'max-w-md', icon: 'w-8 h-8', title: 'text-base', desc: 'text-sm' },
    lg: { container: 'max-w-lg', icon: 'w-12 h-12', title: 'text-lg', desc: 'text-base' }
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            ...intensityValues[intensity]
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            scale: {
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`fixed ${positionClasses[position]} z-50 ${sizeClasses[size].container}`}
          style={{ zIndex: 9999 }}
        >
          <motion.div
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-xl border border-orange-200 p-4 relative overflow-hidden"
          >
            {/* Bouncing Background */}
            <motion.div
              animate={{ 
                scale: [1, 1.02, 0.98, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg"
            />

            <div className="relative z-10 flex items-start gap-3">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <AlertTriangle 
                    className={`${sizeClasses[size].icon} text-orange-500`} 
                    style={{ color }}
                  />
                </motion.div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`${sizeClasses[size].title} font-semibold text-gray-900 mb-1`}>
                  {message}
                </h3>
                <p className={`${sizeClasses[size].desc} text-gray-600`}>
                  {description}
                </p>
              </div>
              
              <div className="flex-shrink-0 flex gap-2">
                {showRetry && onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </motion.button>
                )}
                
                {onDismiss && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDismiss}
                    className="p-1 rounded-md hover:bg-white/50 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X 
                      className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-500`} 
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pulse Error Component
interface PulseErrorProps extends ErrorBounceProps {
  type: 'pulse';
}

export const PulseError: React.FC<PulseErrorProps> = ({
  visible,
  onDismiss,
  onRetry,
  duration = 2000,
  size = 'md',
  color = '#DC2626',
  message = 'Network Error',
  description = 'Unable to connect. Check your connection and try again.',
  showRetry = true,
  autoHide = true,
  position = 'center',
  intensity = 'medium'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowContent(false);
          setTimeout(() => onDismiss?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, autoHide, onDismiss]);

  const sizeClasses = {
    sm: { container: 'max-w-sm', icon: 'w-6 h-6', title: 'text-sm', desc: 'text-xs' },
    md: { container: 'max-w-md', icon: 'w-8 h-8', title: 'text-base', desc: 'text-sm' },
    lg: { container: 'max-w-lg', icon: 'w-12 h-12', title: 'text-lg', desc: 'text-base' }
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed ${positionClasses[position]} z-50 ${sizeClasses[size].container}`}
          style={{ zIndex: 9999 }}
        >
          <div className="bg-red-600 text-white rounded-lg shadow-xl p-4 relative overflow-hidden">
            {/* Pulse Background */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 bg-red-400 rounded-lg"
              />
            ))}

            <div className="relative z-10 flex items-start gap-3">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap 
                    className={`${sizeClasses[size].icon} text-red-100`} 
                  />
                </motion.div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`${sizeClasses[size].title} font-semibold mb-1`}>
                  {message}
                </h3>
                <p className={`${sizeClasses[size].desc} text-red-100`}>
                  {description}
                </p>
              </div>
              
              <div className="flex-shrink-0 flex gap-2">
                {showRetry && onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-400 transition-colors border border-red-400"
                  >
                    Try Again
                  </motion.button>
                )}
                
                {onDismiss && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDismiss}
                    className="p-1 rounded-md hover:bg-red-500 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X 
                      className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-red-100`} 
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Flash Error Component
interface FlashErrorProps extends ErrorBounceProps {
  type: 'flash';
}

export const FlashError: React.FC<FlashErrorProps> = ({
  visible,
  onDismiss,
  onRetry,
  duration = 1500,
  size = 'md',
  color = '#FFFFFF',
  message = 'Error!',
  description = 'Something went wrong.',
  showRetry = false,
  autoHide = true,
  position = 'center',
  intensity = 'medium'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowContent(false);
          setTimeout(() => onDismiss?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, autoHide, onDismiss]);

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1
          }}
          exit={{ opacity: 0 }}
          className={`fixed ${positionClasses[position]} z-50`}
          style={{ zIndex: 9999 }}
        >
          <motion.div
            className="bg-red-600 text-white rounded-lg shadow-xl p-6 text-center min-w-[300px]"
            animate={{
              backgroundColor: ['#DC2626', '#991B1B', '#DC2626', '#7F1D1D', '#DC2626']
            }}
            transition={{
              duration: duration / 1000,
              repeat: 2,
              ease: "easeInOut"
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: 3,
                ease: "easeInOut"
              }}
              className="mb-4"
            >
              <AlertCircle className="w-12 h-12 mx-auto text-white" />
            </motion.div>
            
            <h3 className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} font-bold mb-2`}>
              {message}
            </h3>
            <p className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} text-red-100 mb-4`}>
              {description}
            </p>
            
            {showRetry && onRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className="px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Retry
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Vibrate Error Component
interface VibrateErrorProps extends ErrorBounceProps {
  type: 'vibrate';
}

export const VibrateError: React.FC<VibrateErrorProps> = ({
  visible,
  onDismiss,
  onRetry,
  duration = 1000,
  size = 'md',
  color = '#EF4444',
  message = 'Error detected!',
  description = 'The action could not be completed.',
  showRetry = false,
  autoHide = true,
  position = 'center',
  intensity = 'medium'
}) => {
  const [showContent, setShowContent] = useState(false);
  const vibrationRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      
      // Trigger device vibration if supported
      if ('vibrate' in navigator) {
        const pattern = intensity === 'high' ? [200, 100, 200, 100, 200] : 
                       intensity === 'medium' ? [200, 100, 200] : [200];
        navigator.vibrate(pattern);
      }
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowContent(false);
          setTimeout(() => onDismiss?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, autoHide, onDismiss, intensity]);

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: [0, -5, 5, -5, 5, 0],
            y: [0, 2, -2, 2, -2, 0]
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            repeat: 2,
            ease: "easeInOut"
          }}
          className={`fixed ${positionClasses[position]} z-50 max-w-sm`}
          style={{ zIndex: 9999 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg border-2 border-red-500 p-4"
            animate={{
              borderColor: ['#EF4444', '#DC2626', '#EF4444', '#DC2626', '#EF4444'],
              boxShadow: [
                '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
                '0 8px 25px -5px rgba(239, 68, 68, 0.3)',
                '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
                '0 8px 25px -5px rgba(239, 68, 68, 0.3)',
                '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
              ]
            }}
            transition={{
              duration: 1,
              repeat: 1,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0]
                }}
                transition={{ 
                  duration: 0.3, 
                  repeat: 3,
                  ease: "easeInOut"
                }}
              >
                <AlertCircle 
                  className="w-8 h-8 text-red-500" 
                  style={{ color }}
                />
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {message}
                </h3>
                <p className="text-xs text-gray-600">
                  {description}
                </p>
              </div>
              
              {onDismiss && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDismiss}
                  className="p-1 rounded-md hover:bg-red-50 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main ErrorBounce Component
export const ErrorBounce: React.FC<ErrorBounceProps> = (props) => {
  const { type = 'shake', ...otherProps } = props;

  switch (type) {
    case 'shake':
      return <ShakeError {...props} type="shake" />;
    case 'bounce':
      return <BounceError {...props} type="bounce" />;
    case 'pulse':
      return <PulseError {...props} type="pulse" />;
    case 'flash':
      return <FlashError {...props} type="flash" />;
    case 'vibrate':
      return <VibrateError {...props} type="vibrate" />;
    default:
      return <ShakeError {...props} type="shake" />;
  }
};

export default ErrorBounce;