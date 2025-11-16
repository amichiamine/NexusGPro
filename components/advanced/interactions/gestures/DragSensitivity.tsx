import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface DragSensitivityProps {
  children: React.ReactNode;
  sensitivity?: number;
  minSensitivity?: number;
  maxSensitivity?: number;
  adaptToSpeed?: boolean;
  adaptToDistance?: boolean;
  adaptToContent?: boolean;
  onSensitivityChange?: (sensitivity: number) => void;
  onDragStart?: () => void;
  onDragEnd?: (finalSensitivity: number) => void;
  className?: string;
}

interface AdaptiveSensitivityProps {
  children: React.ReactNode;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  touchAccuracy?: 'low' | 'medium' | 'high';
  contentWeight?: 'light' | 'medium' | 'heavy';
  onSensitivityCalculated?: (sensitivity: number) => void;
  className?: string;
}

interface SensitivityMeterProps {
  value: number;
  min?: number;
  max?: number;
  showLabels?: boolean;
  className?: string;
}

interface DragZoneProps {
  children: React.ReactNode;
  zones: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    sensitivity: number;
    onEnter?: () => void;
    onExit?: () => void;
    onDrag?: (sensitivity: number) => void;
  }>;
  className?: string;
}

// Composant principal DragSensitivity
export const DragSensitivity: React.FC<DragSensitivityProps> = ({
  children,
  sensitivity = 1,
  minSensitivity = 0.1,
  maxSensitivity = 5,
  adaptToSpeed = true,
  adaptToDistance = true,
  adaptToContent = true,
  onSensitivityChange,
  onDragStart,
  onDragEnd,
  className
}) => {
  const [currentSensitivity, setCurrentSensitivity] = useState(sensitivity);
  const [dragMetrics, setDragMetrics] = useState({
    speed: 0,
    distance: 0,
    duration: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Calcul de la sensibilité adaptative
  const calculateAdaptiveSensitivity = useCallback((
    baseSensitivity: number,
    speed: number,
    distance: number,
    contentWeight: string
  ) => {
    let adaptiveSensitivity = baseSensitivity;

    // Adaptation à la vitesse
    if (adaptToSpeed) {
      const speedFactor = Math.min(speed / 1000, 2); // Facteur maximum de 2x
      adaptiveSensitivity *= 1 + (speedFactor * 0.5);
    }

    // Adaptation à la distance
    if (adaptToDistance) {
      const distanceFactor = Math.min(distance / 200, 1.5); // Facteur maximum de 1.5x
      adaptiveSensitivity *= 1 + (distanceFactor * 0.3);
    }

    // Adaptation au contenu
    if (adaptToContent) {
      const contentFactors = {
        light: 0.8,
        medium: 1.0,
        heavy: 1.3
      };
      adaptiveSensitivity *= contentFactors[contentWeight as keyof typeof contentFactors] || 1;
    }

    // Contraintes
    return Math.max(minSensitivity, Math.min(maxSensitivity, adaptiveSensitivity));
  }, [minSensitivity, maxSensitivity, adaptToSpeed, adaptToDistance, adaptToContent]);

  const bind = useGesture({
    onDragStart: ({ event, xy: [x, y] }) => {
      dragStartRef.current = { x, y, time: Date.now() };
      setIsDragging(true);
      onDragStart?.();
    },
    
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], touches, event }) => {
      event.preventDefault();
      
      if (touches === 1) { // Seulement pour un seul doigt
        const now = Date.now();
        const duration = now - dragStartRef.current.time;
        const distance = Math.sqrt(mx * mx + my * my);
        const speed = distance / duration;
        
        setDragMetrics({ speed, distance, duration });
        
        // Calculer la sensibilité adaptative
        const adaptiveSensitivity = calculateAdaptiveSensitivity(
          sensitivity,
          speed,
          distance,
          'medium'
        );
        
        setCurrentSensitivity(adaptiveSensitivity);
        onSensitivityChange?.(adaptiveSensitivity);
      }
    },
    
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      setIsDragging(false);
      
      const finalSensitivity = currentSensitivity;
      onDragEnd?.(finalSensitivity);
    }
  }, {
    drag: {
      filterTaps: true,
      rubberband: true
    }
  });

  return (
    <motion.div
      {...bind()}
      className={cn(
        'relative touch-none select-none',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        touchAction: 'none'
      }}
    >
      {children}
      
      {/* Indicateur de sensibilité */}
      <motion.div
        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isDragging ? 1 : 0,
          scale: isDragging ? 1 : 0.8
        }}
        key={Math.round(currentSensitivity * 100)}
      >
        <div className="text-center">
          <div>Sensibilité</div>
          <div className="font-bold">{currentSensitivity.toFixed(2)}x</div>
        </div>
      </motion.div>
      
      {/* Métriques de drag */}
      {isDragging && (
        <motion.div
          className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>Vitesse: {(dragMetrics.speed * 1000).toFixed(1)} px/s</div>
          <div>Distance: {dragMetrics.distance.toFixed(0)} px</div>
          <div>Durée: {dragMetrics.duration} ms</div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Composant de sensibilité adaptative par device
export const AdaptiveSensitivity: React.FC<AdaptiveSensitivityProps> = ({
  children,
  deviceType = 'auto',
  touchAccuracy = 'medium',
  contentWeight = 'medium',
  onSensitivityCalculated,
  className
}) => {
  const [calculatedSensitivity, setCalculatedSensitivity] = useState(1);

  // Détecter le type de device
  useEffect(() => {
    let detectedDeviceType = deviceType;
    
    if (deviceType === 'auto') {
      const width = window.innerWidth;
      if (width < 768) {
        detectedDeviceType = 'mobile';
      } else if (width < 1024) {
        detectedDeviceType = 'tablet';
      } else {
        detectedDeviceType = 'desktop';
      }
    }

    // Calculer la sensibilité basée sur le device
    const deviceFactors = {
      mobile: {
        sensitivity: 1.2,
        touchAccuracy: { low: 1.5, medium: 1.2, high: 1.0 }
      },
      tablet: {
        sensitivity: 1.0,
        touchAccuracy: { low: 1.3, medium: 1.0, high: 0.8 }
      },
      desktop: {
        sensitivity: 0.8,
        touchAccuracy: { low: 1.0, medium: 0.8, high: 0.6 }
      }
    };

    const baseSensitivity = deviceFactors[detectedDeviceType].sensitivity;
    const accuracyFactor = deviceFactors[detectedDeviceType].touchAccuracy[touchAccuracy];
    const contentFactors = { light: 1.2, medium: 1.0, heavy: 0.8 };

    const finalSensitivity = baseSensitivity * accuracyFactor * contentFactors[contentWeight];
    
    setCalculatedSensitivity(finalSensitivity);
    onSensitivityCalculated?.(finalSensitivity);
  }, [deviceType, touchAccuracy, contentWeight, onSensitivityCalculated]);

  return (
    <div className={cn('relative', className)}>
      {children}
      
      {/* Badge device info */}
      <motion.div
        className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div>{deviceType}</div>
        <div>Acc: {touchAccuracy}</div>
        <div>Cont: {contentWeight}</div>
      </motion.div>
    </div>
  );
};

// Composant de mesure de sensibilité
export const SensitivityMeter: React.FC<SensitivityMeterProps> = ({
  value,
  min = 0.1,
  max = 5,
  showLabels = true,
  className
}) => {
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  const getColor = () => {
    if (value < 0.5) return '#10B981'; // Vert
    if (value < 1.5) return '#3B82F6'; // Bleu
    if (value < 3) return '#F59E0B';   // Orange
    return '#EF4444';                  // Rouge
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Sensibilité</span>
        <span className="text-sm text-gray-500">{value.toFixed(2)}x</span>
      </div>
      
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getColor() }}
            initial={{ width: 0 }}
            animate={{ width: `${normalizedValue * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {showLabels && (
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{min}x</span>
            <span>{(min + max) / 2}x</span>
            <span>{max}x</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook personnalisé pour le contrôle de sensibilité
export const useDragSensitivity = (
  initialSensitivity: number = 1,
  options: {
    adaptive?: boolean;
    deviceAware?: boolean;
    contentAware?: boolean;
  } = {}
) => {
  const [sensitivity, setSensitivity] = useState(initialSensitivity);
  const [isAdaptive, setIsAdaptive] = useState(options.adaptive || false);

  // Adaptation automatique basée sur le contexte
  const adaptSensitivity = useCallback((
    context: {
      deviceType?: string;
      contentWeight?: string;
      userPreferences?: any;
    }
  ) => {
    if (!options.adaptive) return sensitivity;

    let adaptedSensitivity = sensitivity;

    // Adaptation device
    if (options.deviceAware && context.deviceType) {
      const deviceFactors = {
        mobile: 1.2,
        tablet: 1.0,
        desktop: 0.8
      };
      adaptedSensitivity *= deviceFactors[context.deviceType as keyof typeof deviceFactors] || 1;
    }

    // Adaptation contenu
    if (options.contentAware && context.contentWeight) {
      const contentFactors = {
        light: 1.3,
        medium: 1.0,
        heavy: 0.7
      };
      adaptedSensitivity *= contentFactors[context.contentWeight as keyof typeof contentFactors] || 1;
    }

    return Math.max(0.1, Math.min(5, adaptedSensitivity));
  }, [sensitivity, options.adaptive, options.deviceAware, options.contentAware]);

  return {
    sensitivity,
    setSensitivity,
    isAdaptive,
    setIsAdaptive,
    adaptSensitivity
  };
};

// Composant de zones de sensibilité
export const DragZone: React.FC<DragZoneProps> = ({
  children,
  zones,
  className
}) => {
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState(1);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], touches }) => {
      if (touches > 1) return;

      // Vérifier dans quelle zone on se trouve
      const zone = zones.find(z => 
        mx >= z.x && mx <= z.x + z.width &&
        my >= z.y && my <= z.y + z.height
      );

      if (zone) {
        if (currentZone !== zone.id) {
          if (currentZone) {
            const prevZone = zones.find(z => z.id === currentZone);
            prevZone?.onExit?.();
          }
          setCurrentZone(zone.id);
          setSensitivity(zone.sensitivity);
          zone.onEnter?.();
          zone.onDrag?.(zone.sensitivity);
        }
      } else if (currentZone) {
        const prevZone = zones.find(z => z.id === currentZone);
        prevZone?.onExit?.();
        setCurrentZone(null);
        setSensitivity(1);
      }
    }
  });

  return (
    <div {...bind()} className={cn('relative touch-none', className)} style={{ touchAction: 'none' }}>
      {children}
      
      {/* Visualisation des zones */}
      <svg className="absolute inset-0 pointer-events-none">
        {zones.map(zone => (
          <rect
            key={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            fill={currentZone === zone.id ? `${zone.sensitivity > 1 ? '#EF4444' : '#10B981'}40` : '#00000020'}
            stroke={currentZone === zone.id ? `${zone.sensitivity > 1 ? '#EF4444' : '#10B981'}` : '#00000040'}
            strokeWidth="1"
            strokeDasharray={currentZone === zone.id ? 'none' : '5,5'}
          />
        ))}
      </svg>
      
      {/* Indicateur de zone active */}
      {currentZone && (
        <motion.div
          className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div>Zone: {currentZone}</div>
          <div>Sensibilité: {sensitivity.toFixed(2)}x</div>
        </motion.div>
      )}
    </div>
  );
};

// Composant de calibration de sensibilité
interface SensitivityCalibrationProps {
  onCalibrationComplete?: (calibratedSensitivity: number) => void;
  className?: string;
}

export const SensitivityCalibration: React.FC<SensitivityCalibrationProps> = ({
  onCalibrationComplete,
  className
}) => {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [currentTest, setCurrentTest] = useState(0);

  const calibrationSteps = [
    { description: 'Déplacez votre doigt lentement', duration: 2000 },
    { description: 'Déplacez votre doigt rapidement', duration: 1500 },
    { description: 'Déplacez sur une longue distance', duration: 2500 },
    { description: 'Déplacez sur une courte distance', duration: 1000 }
  ];

  const bind = useGesture({
    onDrag: ({ first, movement: [mx, my] }) => {
      if (first) {
        setCurrentTest(step);
      }
    },
    onDragEnd: ({ movement: [mx, my] }) => {
      const distance = Math.sqrt(mx * mx + my * my);
      const duration = calibrationSteps[step].duration;
      const speed = distance / duration;
      
      setResults(prev => [...prev, speed]);
      
      if (step < calibrationSteps.length - 1) {
        setStep(prev => prev + 1);
      } else {
        // Calculer la sensibilité finale
        const avgSpeed = results.reduce((a, b) => a + b, 0) / results.length;
        const calibratedSensitivity = Math.max(0.1, Math.min(5, 2 / avgSpeed));
        onCalibrationComplete?.(calibratedSensitivity);
      }
    }
  });

  return (
    <motion.div
      {...bind()}
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Calibration de la Sensibilité</h2>
        
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-lg mb-4">
            {calibrationSteps[step]?.description}
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Étape {step + 1} sur {calibrationSteps.length}
          </div>
          
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full mx-auto flex items-center justify-center">
            <div className="text-gray-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Glissez dans le cercle pour chaque test
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DragSensitivity;