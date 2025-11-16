import React, { useState, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface PinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  enablePan?: boolean;
  enableRotate?: boolean;
  className?: string;
  onScaleChange?: (scale: number) => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onTap?: () => void;
}

interface PinchZoomImageProps {
  src: string;
  alt: string;
  minScale?: number;
  maxScale?: number;
  className?: string;
  placeholder?: string;
  onZoomChange?: (isZoomed: boolean) => void;
}

interface PinchZoomContainerProps {
  children: React.ReactNode;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
  onScaleChange?: (scale: number) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  className?: string;
}

interface MultiTouchProps {
  children: React.ReactNode;
  enableMultiTouch?: boolean;
  touchCount?: number;
  onMultiTouchStart?: (count: number) => void;
  onMultiTouchEnd?: (count: number) => void;
  className?: string;
}

// Composant principal PinchZoom
export const PinchZoom: React.FC<PinchZoomProps> = ({
  children,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
  enablePan = true,
  enableRotate = false,
  className,
  onScaleChange,
  onPinchStart,
  onPinchEnd,
  onTap
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Configuration des gestures
  const bind = useGesture({
    onPinch: ({ offset: [d], origin, velocity, touches, direction: [s] }) => {
      const newScale = Math.max(minScale, Math.min(maxScale, d));
      setScale(newScale);
      setIsZoomed(newScale > minScale + 0.1);
      onScaleChange?.(newScale);
      
      if (touches > 1) {
        onPinchStart?.();
      }
    },
    onPinchEnd: ({ touches }) => {
      if (touches === 0) {
        setIsZoomed(scale > minScale + 0.1);
        onPinchEnd?.();
      }
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], touches }) => {
      if (enablePan && (touches === 1 || isZoomed)) {
        setPosition({ x: mx, y: my });
      }
    },
    onDragEnd: () => {
      // Animation de retour si pas zoomé
      if (!isZoomed) {
        setPosition({ x: 0, y: 0 });
      }
    },
    onWheel: ({ delta: [, dy], event }) => {
      event.preventDefault();
      const zoomFactor = dy > 0 ? 0.9 : 1.1;
      const newScale = Math.max(minScale, Math.min(maxScale, scale * zoomFactor));
      setScale(newScale);
      setIsZoomed(newScale > minScale + 0.1);
      onScaleChange?.(newScale);
    },
    onPointerDown: ({ event }) => {
      if ((event as PointerEvent).detail === 1 && !isZoomed) {
        onTap?.();
      }
    }
  }, {
    drag: {
      filterTaps: true,
      bounds: isZoomed ? undefined : { left: 0, right: 0, top: 0, bottom: 0 },
      rubberband: true
    },
    pinch: {
      scaleBounds: { min: minScale, max: maxScale },
      rubberband: true
    },
    wheel: {
      filterEvent: (e) => e.preventDefault()
    }
  });

  const handleDoubleClick = useCallback(() => {
    if (isZoomed) {
      // Réinitialiser
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
      onScaleChange?.(initialScale);
    } else {
      // Zoomer au maximum
      const zoomScale = Math.min(maxScale, minScale + 1);
      setScale(zoomScale);
      setIsZoomed(true);
      onScaleChange?.(zoomScale);
    }
  }, [isZoomed, initialScale, minScale, maxScale, onScaleChange]);

  return (
    <motion.div
      ref={containerRef}
      {...bind()}
      className={cn(
        'relative overflow-hidden cursor-grab active:cursor-grabbing touch-none',
        isZoomed && 'cursor-grabbing',
        className
      )}
      style={{
        touchAction: 'none'
      }}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        style={{
          scale,
          x: position.x,
          y: position.y,
          rotate: rotation,
          transformOrigin: 'center center'
        }}
        className="w-full h-full flex items-center justify-center"
        onDoubleClick={handleDoubleClick}
      >
        {children}
      </motion.div>
      
      {/* Indicateur de zoom */}
      {isZoomed && (
        <motion.div
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {Math.round(scale * 100)}%
        </motion.div>
      )}
      
      {/* Boutons de contrôle */}
      {isZoomed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <button
            onClick={() => {
              const newScale = Math.max(minScale, scale * 0.8);
              setScale(newScale);
              setIsZoomed(newScale > minScale + 0.1);
              onScaleChange?.(newScale);
            }}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 text-gray-700 shadow-lg transition-all"
            disabled={scale <= minScale}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12h14m-7-7v14" />
            </svg>
          </button>
          <button
            onClick={() => {
              const newScale = Math.min(maxScale, scale * 1.25);
              setScale(newScale);
              setIsZoomed(newScale > minScale + 0.1);
              onScaleChange?.(newScale);
            }}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 text-gray-700 shadow-lg transition-all"
            disabled={scale >= maxScale}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5v14m7-7h-14" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Composant Image avec Pinch Zoom
export const PinchZoomImage: React.FC<PinchZoomImageProps> = ({
  src,
  alt,
  minScale = 0.5,
  maxScale = 3,
  className,
  placeholder,
  onZoomChange
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <PinchZoom
      minScale={minScale}
      maxScale={maxScale}
      onScaleChange={(scale) => {
        onZoomChange?.(scale > minScale + 0.1);
      }}
      className={className}
    >
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">{placeholder}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain select-none"
        onLoad={() => setIsLoaded(true)}
        draggable={false}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      />
    </PinchZoom>
  );
};

// Hook personnalisé pour le contrôle du pinch zoom
export const usePinchZoom = (
  options: {
    minScale?: number;
    maxScale?: number;
    onScaleChange?: (scale: number) => void;
  } = {}
) => {
  const { minScale = 0.5, maxScale = 3, onScaleChange } = options;
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const bind = useGesture({
    onPinch: ({ offset: [d] }) => {
      const newScale = Math.max(minScale, Math.min(maxScale, d));
      setScale(newScale);
      setIsZoomed(newScale > minScale + 0.1);
      onScaleChange?.(newScale);
    },
    onDrag: ({ movement: [mx, my], touches }) => {
      if (isZoomed || touches === 1) {
        setPosition({ x: mx, y: my });
      }
    }
  }, {
    pinch: { scaleBounds: { min: minScale, max: maxScale } }
  });

  const zoomIn = useCallback(() => {
    const newScale = Math.min(maxScale, scale * 1.2);
    setScale(newScale);
    setIsZoomed(newScale > minScale + 0.1);
    onScaleChange?.(newScale);
  }, [scale, minScale, maxScale, onScaleChange]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(minScale, scale * 0.8);
    setScale(newScale);
    setIsZoomed(newScale > minScale + 0.1);
    onScaleChange?.(newScale);
  }, [scale, minScale, maxScale, onScaleChange]);

  const reset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
    onScaleChange?.(1);
  }, [onScaleChange]);

  return {
    scale,
    position,
    isZoomed,
    bind,
    zoomIn,
    zoomOut,
    reset
  };
};

// Composant Multi-touch avec détection du nombre de doigts
export const MultiTouch: React.FC<MultiTouchProps> = ({
  children,
  enableMultiTouch = true,
  touchCount = 2,
  onMultiTouchStart,
  onMultiTouchEnd,
  className
}) => {
  const [touches, setTouches] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onPointerDown: ({ touches: newTouches }) => {
      setTouches(newTouches);
      if (newTouches >= touchCount) {
        onMultiTouchStart?.(newTouches);
      }
    },
    onPointerUp: ({ touches: remainingTouches }) => {
      setTouches(remainingTouches);
      if (remainingTouches < touchCount) {
        onMultiTouchEnd?.(remainingTouches);
      }
    }
  });

  return (
    <div
      ref={containerRef}
      {...bind()}
      className={cn(
        'relative touch-none select-none',
        touches >= touchCount && 'ring-4 ring-blue-300 ring-opacity-50',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      {children}
      
      {/* Indicateur du nombre de touches */}
      {touches > 0 && (
        <motion.div
          className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          key={touches}
        >
          {touches} touches
        </motion.div>
      )}
      
      {/* Instruction pour multi-touch */}
      {touches < touchCount && enableMultiTouch && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white bg-opacity-80 px-2 py-1 rounded">
          Utilisez {touchCount} doigts pour déclencher l'action
        </div>
      )}
    </div>
  );
};

// Composant Zoom Controls
interface ZoomControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  disabled = false,
  className
}) => {
  return (
    <motion.div
      className={cn('flex flex-col space-y-2 bg-white rounded-lg shadow-lg p-2', className)}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <button
        onClick={onZoomOut}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom Out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 12h14m-7-7v14" />
        </svg>
      </button>
      
      <button
        onClick={onReset}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset Zoom"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </button>
      
      <button
        onClick={onZoomIn}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom In"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5v14m7-7h-14" />
        </svg>
      </button>
    </motion.div>
  );
};

export default PinchZoom;