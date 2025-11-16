import React, { useState, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface RotateGestureProps {
  children: React.ReactNode;
  initialRotation?: number;
  minRotation?: number;
  maxRotation?: number;
  enableRotation?: boolean;
  onRotationChange?: (rotation: number) => void;
  onRotationStart?: () => void;
  onRotationEnd?: () => void;
  snapToSteps?: number;
  className?: string;
}

interface RotatableProps {
  children: React.ReactNode;
  rotation: number;
  onRotationChange?: (rotation: number) => void;
  minRotation?: number;
  maxRotation?: number;
  stepSize?: number;
  className?: string;
}

interface RotationSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  className?: string;
  showIndicator?: boolean;
}

interface RotationKnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
}

// Composant principal RotateGesture
export const RotateGesture: React.FC<RotateGestureProps> = ({
  children,
  initialRotation = 0,
  minRotation = -180,
  maxRotation = 180,
  enableRotation = true,
  onRotationChange,
  onRotationStart,
  onRotationEnd,
  snapToSteps,
  className
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onRotate: ({ rotation: currentRotation, origin, event }) => {
      if (!enableRotation) return;
      
      let newRotation = currentRotation;
      
      // Contraintes de rotation
      if (minRotation !== undefined && newRotation < minRotation) {
        newRotation = minRotation;
      }
      if (maxRotation !== undefined && newRotation > maxRotation) {
        newRotation = maxRotation;
      }
      
      // Snap to steps si configuré
      if (snapToSteps) {
        newRotation = Math.round(newRotation / snapToSteps) * snapToSteps;
      }
      
      setRotation(newRotation);
      onRotationChange?.(newRotation);
    },
    onRotateStart: () => {
      if (enableRotation) {
        onRotationStart?.();
      }
    },
    onRotateEnd: () => {
      if (enableRotation) {
        onRotationEnd?.();
      }
    }
  }, {
    rotate: {
      // Configuration pour le gesture de rotation
      filterEvent: (e) => e.preventDefault(),
      rubberband: true
    }
  });

  return (
    <motion.div
      ref={containerRef}
      {...bind()}
      className={cn(
        'relative touch-none select-none cursor-grab active:cursor-grabbing',
        enableRotation && 'cursor-grab active:cursor-grabbing',
        className
      )}
      style={{
        rotate: rotation,
        touchAction: 'none'
      }}
      whileDrag={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      
      {/* Indicateur de rotation */}
      {enableRotation && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          key={Math.round(rotation)}
        >
          {Math.round(rotation)}°
        </motion.div>
      )}
      
      {/* Guide de rotation */}
      {enableRotation && (
        <div className="absolute -inset-4 border-2 border-dashed border-gray-300 border-opacity-50 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
};

// Hook pour rotation programmatique
export const useRotation = (
  initialValue: number = 0,
  options: {
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
  } = {}
) => {
  const { min, max, step = 1, onChange } = options;
  const [rotation, setRotation] = useState(initialValue);

  const updateRotation = useCallback((newRotation: number) => {
    let value = newRotation;
    
    if (min !== undefined && value < min) value = min;
    if (max !== undefined && value > max) value = max;
    
    setRotation(value);
    onChange?.(value);
  }, [min, max, onChange]);

  const rotateLeft = useCallback(() => {
    updateRotation(rotation - step);
  }, [rotation, step, updateRotation]);

  const rotateRight = useCallback(() => {
    updateRotation(rotation + step);
  }, [rotation, step, updateRotation]);

  const reset = useCallback(() => {
    updateRotation(initialValue);
  }, [initialValue, updateRotation]);

  return {
    rotation,
    updateRotation,
    rotateLeft,
    rotateRight,
    reset,
    setRotation
  };
};

// Composant Rotatable
export const Rotatable: React.FC<RotatableProps> = ({
  children,
  rotation,
  onRotationChange,
  minRotation = -360,
  maxRotation = 360,
  stepSize = 1,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onRotate: ({ rotation: currentRotation }) => {
      let newRotation = currentRotation;
      
      // Contraintes
      if (newRotation < minRotation) newRotation = minRotation;
      if (newRotation > maxRotation) newRotation = maxRotation;
      
      // Snap to step
      newRotation = Math.round(newRotation / stepSize) * stepSize;
      
      onRotationChange?.(newRotation);
    }
  });

  return (
    <motion.div
      ref={containerRef}
      {...bind()}
      className={cn('touch-none select-none cursor-grab active:cursor-grabbing', className)}
      style={{
        rotate: rotation,
        touchAction: 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

// Composant Rotation Slider
export const RotationSlider: React.FC<RotationSliderProps> = ({
  value,
  min = -180,
  max = 180,
  step = 1,
  onChange,
  className,
  showIndicator = true
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  const getRotationColor = (rotation: number) => {
    // Couleur basée sur la rotation (rouge à bleu)
    const normalized = (rotation - min) / (max - min);
    const hue = 240 - (normalized * 240); // 240 (bleu) à 0 (rouge)
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        {/* Indicateur circulaire */}
        {showIndicator && (
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke={getRotationColor(value)}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${((value - min) / (max - min)) * 251.2} 251.2`}
                initial={{ strokeDasharray: '0 251.2' }}
                animate={{ 
                  strokeDasharray: `${((value - min) / (max - min)) * 251.2} 251.2` 
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getRotationColor(value) }}
                animate={{ rotate: value }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Slider */}
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className={cn(
            'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
            'slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4',
            'slider-thumb:rounded-full slider-thumb:bg-blue-500',
            'slider-thumb:cursor-pointer slider-thumb:shadow-lg',
            isDragging && 'slider-thumb:scale-110'
          )}
          style={{
            background: `linear-gradient(to right, ${getRotationColor(value)}, ${getRotationColor(value)})`
          }}
        />
      </div>
      
      {/* Affichage de la valeur */}
      <div className="text-center">
        <span className="text-lg font-semibold">{Math.round(value)}°</span>
      </div>
      
      {/* Labels des limites */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{min}°</span>
        <span>{max}°</span>
      </div>
    </div>
  );
};

// Composant Rotation Knob
export const RotationKnob: React.FC<RotationKnobProps> = ({
  value,
  min = 0,
  max = 100,
  onChange,
  size = 'md',
  className,
  showValue = true
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const normalizedValue = ((value - min) / (max - min)) * 270; // 270 degrees max
  
  const bind = useGesture({
    onDrag: ({ movement: [, my], direction: [, dir], first, last, event }) => {
      event.preventDefault();
      
      if (first) setIsDragging(true);
      if (last) setIsDragging(false);
      
      const sensitivity = 2;
      let newValue = value + (dir * my * sensitivity);
      
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;
      
      onChange?.(newValue);
    }
  }, {
    drag: {
      filterTaps: true,
      axis: 'y'
    }
  });

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div
        ref={knobRef}
        {...bind()}
        className={cn(
          'relative rounded-full border-4 border-gray-300 cursor-grab active:cursor-grabbing',
          'flex items-center justify-center shadow-lg transition-all',
          isDragging && 'scale-105 shadow-xl',
          sizeClasses[size]
        )}
        style={{
          touchAction: 'none',
          background: `conic-gradient(from 0deg, #3b82f6 ${normalizedValue}deg, #e5e7eb ${normalizedValue}deg)`
        }}
      >
        {/* Indicateur central */}
        <div className="w-3 h-3 bg-white rounded-full shadow-md" />
        
        {/* Ligne de direction */}
        <div 
          className="absolute top-0 left-1/2 w-0.5 h-3 bg-gray-600 transform -translate-x-1/2"
          style={{
            rotate: `${normalizedValue - 45}deg`,
            transformOrigin: '50% 100%'
          }}
        />
      </div>
      
      {showValue && (
        <div className="text-center">
          <div className="text-sm font-semibold">{Math.round(value)}</div>
          <div className="text-xs text-gray-500">{min}-{max}</div>
        </div>
      )}
    </div>
  );
};

// Composant Rotation 3D
interface Rotation3DProps {
  children: React.ReactNode;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  enable3D?: boolean;
  perspective?: number;
  className?: string;
}

export const Rotation3D: React.FC<Rotation3DProps> = ({
  children,
  rotationX,
  rotationY,
  rotationZ,
  onRotationChange,
  enable3D = true,
  perspective = 1000,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState({ 
    x: rotationX, 
    y: rotationY, 
    z: rotationZ 
  });

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], first, last, event }) => {
      event.preventDefault();
      
      if (first) {
        setDragStart({ x: mx, y: my });
      }
      
      if (last) {
        const finalRotation = {
          x: rotationX + (my - dragStart.y) * 0.5,
          y: rotationY + (mx - dragStart.x) * 0.5,
          z: rotationZ
        };
        
        setCurrentRotation(finalRotation);
        onRotationChange?.(finalRotation);
      }
    }
  }, {
    drag: {
      filterTaps: true,
      bounds: { left: -180, right: 180, top: -180, bottom: 180 }
    }
  });

  return (
    <div
      ref={containerRef}
      {...bind()}
      className={cn('touch-none select-none cursor-grab active:cursor-grabbing', className)}
      style={{
        touchAction: 'none',
        perspective: enable3D ? perspective : undefined,
        transformStyle: enable3D ? 'preserve-3d' : undefined
      }}
    >
      <motion.div
        style={{
          rotateX: currentRotation.x,
          rotateY: currentRotation.y,
          rotateZ: currentRotation.z,
          transformStyle: enable3D ? 'preserve-3d' : undefined
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
      
      {/* Indicateur 3D */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        X: {Math.round(currentRotation.x)}° Y: {Math.round(currentRotation.y)}° Z: {Math.round(currentRotation.z)}°
      </div>
    </div>
  );
};

export default RotateGesture;