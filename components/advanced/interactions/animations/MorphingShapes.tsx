import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface MorphingShapesProps {
  initialShape?: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'octagon' | 'custom';
  targetShape?: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'octagon' | 'custom';
  size?: number;
  colors?: [string, string];
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  loop?: boolean;
  autoMorph?: boolean;
  customPath?: string;
  className?: string;
  onMorphComplete?: () => void;
}

interface ShapeSequenceProps {
  shapes: Array<{
    shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'octagon' | 'custom';
    duration?: number;
    color?: string;
  }>;
  size?: number;
  strokeWidth?: number;
  loop?: boolean;
  className?: string;
}

interface AnimatedBlobProps {
  path?: string;
  colors?: [string, string];
  duration?: number;
  complexity?: number;
  size?: number;
  className?: string;
}

// Générateur de chemins SVG pour les formes
const shapePaths = {
  circle: (size: number) => {
    const r = size / 2 - 10;
    return `M ${size / 2},5 A ${r},${r} 0 1,1 ${size / 2 - 1},${size / 2} A ${r},${r} 0 1,1 ${size / 2},5`;
  },
  square: (size: number) => {
    const padding = 10;
    return `M ${padding},${padding} L ${size - padding},${padding} L ${size - padding},${size - padding} L ${padding},${size - padding} Z`;
  },
  triangle: (size: number) => {
    const center = size / 2;
    const height = (size - 20) * 0.866; // Hauteur d'un triangle équilatéral
    return `M ${center},${10} L ${size - 10},${size - 10} L ${10},${size - 10} Z`;
  },
  star: (size: number) => {
    const center = size / 2;
    const outerRadius = (size - 20) / 2;
    const innerRadius = outerRadius * 0.4;
    let path = '';
    
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = center + radius * Math.cos(angle - Math.PI / 2);
      const y = center + radius * Math.sin(angle - Math.PI / 2);
      
      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    }
    
    return path + ' Z';
  },
  heart: (size: number) => {
    const center = size / 2;
    return `M ${center},${size * 0.85} C ${size * 0.2},${size * 0.6} ${size * 0.05},${size * 0.35} ${size * 0.25},${size * 0.2} C ${size * 0.35},${size * 0.15} ${size * 0.45},${size * 0.2} ${center},${size * 0.3} C ${size * 0.55},${size * 0.2} ${size * 0.65},${size * 0.15} ${size * 0.75},${size * 0.2} C ${size * 0.95},${size * 0.35} ${center},${size * 0.6} ${center},${size * 0.85} Z`;
  },
  diamond: (size: number) => {
    const center = size / 2;
    const half = (size - 20) / 2;
    return `M ${center},${10} L ${size - 10},${center} L ${center},${size - 10} L ${10},${center} Z`;
  },
  hexagon: (size: number) => {
    const center = size / 2;
    const radius = (size - 20) / 2;
    let path = '';
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    }
    
    return path + ' Z';
  },
  octagon: (size: number) => {
    const center = size / 2;
    const radius = (size - 20) / 2;
    const sides = 8;
    let path = '';
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    }
    
    return path + ' Z';
  }
};

// Composant principal de morphing de formes
export const MorphingShapes: React.FC<MorphingShapesProps> = ({
  initialShape = 'circle',
  targetShape = 'star',
  size = 200,
  colors = ['#3B82F6', '#8B5CF6'],
  strokeWidth = 2,
  duration = 2,
  delay = 0,
  loop = false,
  autoMorph = false,
  customPath,
  className,
  onMorphComplete
}) => {
  const [currentShape, setCurrentShape] = useState(initialShape);
  const [isMorphing, setIsMorphing] = useState(false);
  const [path, setPath] = useState('');
  const controls = useAnimation();

  // Générer le chemin pour une forme donnée
  const generatePath = useCallback((shape: string) => {
    if (shape === 'custom' && customPath) {
      return customPath;
    }
    
    const pathGenerator = shapePaths[shape as keyof typeof shapePaths];
    return pathGenerator ? pathGenerator(size) : shapePaths.circle(size);
  }, [size, customPath]);

  // Animation de morphing
  const morphShape = useCallback(async () => {
    setIsMorphing(true);
    
    try {
      await controls.start({
        opacity: 0,
        scale: 0.8,
        transition: { duration: duration * 0.2, ease: 'easeInOut' }
      });
      
      setCurrentShape(targetShape);
      setPath(generatePath(targetShape));
      
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: duration * 0.8, ease: 'easeInOut' }
      });
      
      setIsMorphing(false);
      if (onMorphComplete) onMorphComplete();
      
    } catch (error) {
      console.error('Erreur lors du morphing:', error);
      setIsMorphing(false);
    }
  }, [targetShape, controls, duration, generatePath, onMorphComplete]);

  // Effet pour initialiser la forme
  useEffect(() => {
    setPath(generatePath(initialShape));
  }, [initialShape, generatePath]);

  // Auto-morphing en boucle
  useEffect(() => {
    if (!autoMorph) return;
    
    const interval = setInterval(() => {
      morphShape();
    }, (duration + 2) * 1000); // Ajouter 2 secondes de pause

    return () => clearInterval(interval);
  }, [autoMorph, duration, morphShape]);

  // Animation initiale
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1, ease: 'easeOut' }
    });
  }, [controls]);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={controls}
        className="overflow-visible"
      >
        <motion.path
          d={path}
          fill={isMorphing ? colors[1] : colors[0]}
          stroke={colors[1]}
          strokeWidth={strokeWidth}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: duration, 
            ease: 'easeInOut',
            pathLength: { duration: 1 }
          }}
        />
      </motion.svg>
    </div>
  );
};

// Composant de séquence de formes
export const ShapeSequence: React.FC<ShapeSequenceProps> = ({
  shapes,
  size = 200,
  strokeWidth = 2,
  loop = false,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  const controls = useAnimation();

  const generatePath = useCallback((shape: string) => {
    const pathGenerator = shapePaths[shape as keyof typeof shapePaths];
    return pathGenerator ? pathGenerator(size) : shapePaths.circle(size);
  }, [size]);

  const nextShape = useCallback(async () => {
    const currentShapeData = shapes[currentIndex];
    const nextIndex = (currentIndex + 1) % shapes.length;
    const nextShapeData = shapes[nextIndex];

    try {
      await controls.start({
        opacity: 0.3,
        scale: 0.9,
        transition: { duration: 0.3 }
      });

      setCurrentPath(generatePath(nextShapeData.shape));
      
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, delay: currentShapeData.duration || 0.8 }
      });

      setCurrentIndex(nextIndex);
    } catch (error) {
      console.error('Erreur lors du changement de forme:', error);
    }
  }, [currentIndex, shapes, controls, generatePath]);

  useEffect(() => {
    setCurrentPath(generatePath(shapes[0].shape));
  }, [shapes, generatePath]);

  useEffect(() => {
    if (!loop && currentIndex === shapes.length - 1) return;
    
    const interval = setInterval(() => {
      nextShape();
    }, (shapes[currentIndex].duration || 2) * 1000);

    return () => clearInterval(interval);
  }, [currentIndex, shapes, loop, nextShape]);

  return (
    <motion.div
      animate={controls}
      className={cn('flex items-center justify-center', className)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <motion.path
          d={currentPath}
          fill={shapes[currentIndex].color || '#3B82F6'}
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
      </svg>
    </motion.div>
  );
};

// Composant Animated Blob (forme organique)
export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  path,
  colors = ['#6366F1', '#8B5CF6'],
  duration = 4,
  complexity = 6,
  size = 200,
  className
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const controls = useAnimation();

  // Générer un chemin de blob organique
  const generateBlobPath = useCallback(() => {
    const center = size / 2;
    const baseRadius = (size - 20) / 2;
    let path = '';
    
    for (let i = 0; i < complexity; i++) {
      const angle = (i * 2 * Math.PI) / complexity;
      const variation = Math.random() * 0.3 + 0.7; // Facteur de variation
      const radius = baseRadius * variation;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      if (i === 0) {
        path += `M ${x},${y}`;
      } else {
        const prevAngle = ((i - 1) * 2 * Math.PI) / complexity;
        const prevX = center + baseRadius * Math.random() * Math.cos(prevAngle);
        const prevY = center + baseRadius * Math.random() * Math.sin(prevAngle);
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        
        path += ` Q ${cpX},${cpY} ${x},${y}`;
      }
    }
    
    path += ' Z';
    return path;
  }, [size, complexity]);

  useEffect(() => {
    setCurrentPath(path || generateBlobPath());
  }, [path, generateBlobPath]);

  // Animation continue du blob
  useEffect(() => {
    const animate = async () => {
      try {
        await controls.start({
          opacity: 0.8,
          scale: 0.95,
          transition: { duration: duration / 2 }
        });
        
        setCurrentPath(generateBlobPath());
        
        await controls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: duration / 2 }
        });
      } catch (error) {
        console.error('Erreur animation blob:', error);
      }
    };

    const interval = setInterval(animate, duration * 1000);
    return () => clearInterval(interval);
  }, [duration, generateBlobPath, controls]);

  return (
    <motion.div
      animate={controls}
      className={cn('flex items-center justify-center', className)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <motion.path
          d={currentPath}
          fill={colors[0]}
          stroke={colors[1]}
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </svg>
    </motion.div>
  );
};

// Hook pour morphing programmatique
export const useMorphingControls = () => {
  const [currentShape, setCurrentShape] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  const morphTo = useCallback(async (
    shape: string,
    duration: number = 2,
    onComplete?: () => void
  ) => {
    setIsAnimating(true);
    setCurrentShape(shape);
    
    // Simulation d'animation
    setTimeout(() => {
      setIsAnimating(false);
      if (onComplete) onComplete();
    }, duration * 1000);
  }, []);

  const generateRandomShape = useCallback(() => {
    const shapes = Object.keys(shapePaths);
    return shapes[Math.floor(Math.random() * shapes.length)];
  }, []);

  return {
    currentShape,
    isAnimating,
    morphTo,
    generateRandomShape
  };
};

export default MorphingShapes;