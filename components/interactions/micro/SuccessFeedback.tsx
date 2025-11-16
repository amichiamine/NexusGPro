import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Heart, Star, Sparkles } from 'lucide-react';

// Success Feedback Types
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

// Checkmark Success Component
interface CheckmarkSuccessProps extends SuccessFeedbackProps {
  type: 'checkmark';
}

export const CheckmarkSuccess: React.FC<CheckmarkSuccessProps> = ({
  visible,
  onComplete,
  duration = 2000,
  size = 'md',
  color = '#10B981',
  message = 'Success!',
  showMessage = true,
  autoHide = true,
  position = 'center'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (autoHide) {
          setShowContent(false);
          setTimeout(() => onComplete?.(), 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, autoHide, onComplete]);

  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-sm' },
    md: { icon: 'w-12 h-12', text: 'text-base' },
    lg: { icon: 'w-16 h-16', text: 'text-lg' }
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={`fixed ${positionClasses[position]} z-50 flex flex-col items-center gap-2`}
          style={{ zIndex: 9999 }}
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className={`${sizeClasses[size].icon} rounded-full bg-white shadow-lg border-2 border-green-500 flex items-center justify-center`}
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-3/4 h-3/4"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" style={{ color }}>
                  <motion.path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                </svg>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -inset-2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`
              }}
            />
          </div>
          
          {showMessage && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${sizeClasses[size].text} text-white bg-black/80 px-3 py-1 rounded-full font-medium`}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Confetti Success Component
interface ConfettiSuccessProps extends SuccessFeedbackProps {
  type: 'confetti';
}

export const ConfettiSuccess: React.FC<ConfettiSuccessProps> = ({
  visible,
  onComplete,
  duration = 3000,
  size = 'md',
  color = '#10B981',
  message = 'Success!',
  showMessage = true,
  autoHide = true,
  position = 'center'
}) => {
  const [showContent, setShowContent] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (autoHide) {
          setShowContent(false);
          setTimeout(() => onComplete?.(), 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, autoHide, onComplete]);

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex items-center justify-center z-50 ${position === 'top' ? 'items-start pt-20' : position === 'bottom' ? 'items-end pb-20' : ''}`}
          style={{ zIndex: 9999 }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="relative z-10"
          >
            <CheckCircle className={`${size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'} text-green-500`} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`
              }}
            />
          </motion.div>

          {/* Confetti */}
          <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => {
              const angle = (i * 360) / 50;
              const distance = 100 + Math.random() * 100;
              const confettiColor = colors[i % colors.length];
              
              return (
                <motion.div
                  key={i}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: `calc(50vw + ${Math.cos((angle * Math.PI) / 180) * distance}px)`,
                    y: `calc(50vh + ${Math.sin((angle * Math.PI) / 180) * distance}px)`,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 720,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.3 + i * 0.02,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: confettiColor,
                    boxShadow: `0 0 4px ${confettiColor}40`
                  }}
                />
              );
            })}
          </div>

          {/* Success Message */}
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            >
              <p className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} text-white bg-black/80 px-6 py-3 rounded-full font-bold shadow-lg`}>
                {message}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hearts Success Component
interface HeartsSuccessProps extends SuccessFeedbackProps {
  type: 'hearts';
}

export const HeartsSuccess: React.FC<HeartsSuccessProps> = ({
  visible,
  onComplete,
  duration = 2500,
  size = 'md',
  color = '#EF4444',
  message = 'Loved it!',
  showMessage = true,
  autoHide = true,
  position = 'center'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (autoHide) {
          setShowContent(false);
          setTimeout(() => onComplete?.(), 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, autoHide, onComplete]);

  const hearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    delay: i * 0.1,
    size: 8 + Math.random() * 8
  }));

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex items-center justify-center z-50 ${position === 'top' ? 'items-start pt-20' : position === 'bottom' ? 'items-end pb-20' : ''}`}
          style={{ zIndex: 9999 }}
        >
          {/* Floating Hearts */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {hearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{
                  x: heart.x,
                  y: heart.y,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  y: heart.y - 100,
                  scale: [0, 1, 0.8, 1, 0],
                  opacity: [0, 1, 1, 1, 0],
                  rotate: [0, 15, -15, 15, 0]
                }}
                transition={{
                  duration: 2.5,
                  delay: heart.delay,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{ color }}
              >
                <Heart 
                  className="drop-shadow-sm"
                  size={heart.size}
                  fill={heart.color || color}
                />
              </motion.div>
            ))}
          </div>

          {/* Central Heart Burst */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              type: "spring", 
              stiffness: 200,
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 25
              }
            }}
            className="relative z-10"
          >
            <Heart 
              className={`${size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20'} drop-shadow-lg`} 
              fill={color}
              style={{ color }}
            />
            
            {/* Heart Pulse Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                repeat: 2,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`
              }}
            />
          </motion.div>

          {/* Success Message */}
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            >
              <p className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-sm`}>
                {message}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Stars Success Component
interface StarsSuccessProps extends SuccessFeedbackProps {
  type: 'stars';
}

export const StarsSuccess: React.FC<StarsSuccessProps> = ({
  visible,
  onComplete,
  duration = 2800,
  size = 'md',
  color = '#F59E0B',
  message = 'Outstanding!',
  showMessage = true,
  autoHide = true,
  position = 'center'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (autoHide) {
          setShowContent(false);
          setTimeout(() => onComplete?.(), 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, autoHide, onComplete]);

  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 80,
    y: 50 + (Math.random() - 0.5) * 80,
    delay: i * 0.08,
    size: 12 + Math.random() * 12
  }));

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex items-center justify-center z-50 ${position === 'top' ? 'items-start pt-20' : position === 'bottom' ? 'items-end pb-20' : ''}`}
          style={{ zIndex: 9999 }}
        >
          {/* Starfield Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-orange-900/20" />
          
          {/* Central Star Burst */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              duration: 1.2, 
              type: "spring", 
              stiffness: 300,
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 20
              }
            }}
            className="relative z-10"
          >
            <Star 
              className={`${size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20'} drop-shadow-lg`} 
              fill={color}
              style={{ color }}
            />
            
            {/* Star Sparkle Effect */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  rotate: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos((i * 45) * Math.PI / 180) * 60,
                  y: Math.sin((i * 45) * Math.PI / 180) * 60,
                  opacity: [0, 1, 0],
                  rotate: 180
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Star 
                  size={8}
                  fill={color}
                  style={{ color }}
                  className="opacity-80"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                initial={{
                  x: `${star.x}vw`,
                  y: `${star.y}vh`,
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{
                  y: `${star.y - 20}vh`,
                  scale: [0, 1, 1.2, 0],
                  rotate: 360,
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.5,
                  delay: star.delay,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{ color }}
              >
                <Star 
                  size={star.size}
                  fill={star.color || color}
                  className="drop-shadow-sm"
                />
              </motion.div>
            ))}
          </div>

          {/* Success Message */}
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            >
              <p className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} text-white bg-gradient-to-r from-yellow-600/80 to-orange-600/80 px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-sm border border-yellow-400/30`}>
                {message}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Sparkles Success Component
interface SparklesSuccessProps extends SuccessFeedbackProps {
  type: 'sparkles';
}

export const SparklesSuccess: React.FC<SparklesSuccessProps> = ({
  visible,
  onComplete,
  duration = 2200,
  size = 'md',
  color = '#8B5CF6',
  message = 'Magical!',
  showMessage = true,
  autoHide = true,
  position = 'center'
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      const timer = setTimeout(() => {
        if (autoHide) {
          setShowContent(false);
          setTimeout(() => onComplete?.(), 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, autoHide, onComplete]);

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    delay: i * 0.05,
    duration: 1.5 + Math.random() * 1,
    size: 6 + Math.random() * 8
  }));

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex items-center justify-center z-50 ${position === 'top' ? 'items-start pt-20' : position === 'bottom' ? 'items-end pb-20' : ''}`}
          style={{ zIndex: 9999 }}
        >
          {/* Magical Background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`
            }}
          />

          {/* Central Magic Circle */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              type: "spring", 
              stiffness: 200,
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className="relative z-10"
          >
            <div className={`${size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20'} rounded-full border-2 border-dashed flex items-center justify-center`}
                 style={{ borderColor: color }}>
              <Sparkles 
                className={`${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'} drop-shadow-lg`} 
                style={{ color }}
              />
            </div>
            
            {/* Rotating Particles */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 0 
                }}
                animate={{ 
                  x: Math.cos((i * 60) * Math.PI / 180) * 50,
                  y: Math.sin((i * 60) * Math.PI / 180) * 50,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + i * 0.1,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles 
                  size={12}
                  style={{ color }}
                  className="opacity-80"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                initial={{
                  x: sparkle.x,
                  y: sparkle.y,
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{
                  y: sparkle.y - 50,
                  scale: [0, 1, 0],
                  rotate: 180,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: sparkle.duration,
                  delay: sparkle.delay,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{ color }}
              >
                <Sparkles 
                  size={sparkle.size}
                  className="drop-shadow-sm"
                />
              </motion.div>
            ))}
          </div>

          {/* Success Message */}
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            >
              <p className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} text-white bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-sm border border-purple-400/30`}>
                {message}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main SuccessFeedback Component
export const SuccessFeedback: React.FC<SuccessFeedbackProps> = (props) => {
  const { type = 'checkmark', ...otherProps } = props;

  switch (type) {
    case 'checkmark':
      return <CheckmarkSuccess {...props} type="checkmark" />;
    case 'confetti':
      return <ConfettiSuccess {...props} type="confetti" />;
    case 'hearts':
      return <HeartsSuccess {...props} type="hearts" />;
    case 'stars':
      return <StarsSuccess {...props} type="stars" />;
    case 'sparkles':
      return <SparklesSuccess {...props} type="sparkles" />;
    default:
      return <CheckmarkSuccess {...props} type="checkmark" />;
  }
};

export default SuccessFeedback;