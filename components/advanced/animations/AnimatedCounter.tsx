import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  onComplete?: () => void;
  startOnVisible?: boolean;
  format?: (value: number) => string;
}

/**
 * Composant AnimatedCounter pour les animations de compteur fluides
 * Supporte les décimales, préfixes, suffixes et formatage personnalisé
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className,
  onComplete,
  startOnVisible = true,
  format,
}) => {
  const [count, setCount] = useState(from);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Format number with separator and decimals
  const formatNumber = (num: number): string => {
    const fixed = decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + parts.join('.') + suffix;
  };

  // Custom format function
  const formatValue = format || formatNumber;

  // Intersection Observer for startOnVisible
  useEffect(() => {
    if (!startOnVisible) {
      setHasStarted(true);
      return;
    }

    if (elementRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [startOnVisible, hasStarted]);

  // Animation logic
  useEffect(() => {
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = from;
      const endValue = to;
      const difference = endValue - startValue;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + difference * easeOut;
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasStarted, from, to, duration, delay, onComplete]);

  return (
    <span
      ref={elementRef}
      className={cn("tabular-nums", className)}
    >
      {formatValue(count)}
    </span>
  );
};

// Additional utility components for common counter patterns
export const ProgressCounter: React.FC<{
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
  decimals?: number;
}> = ({ current, total, className, showPercentage = true, decimals = 0 }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn("text-center", className)}>
      <div className="text-2xl font-bold text-primary-600">
        <AnimatedCounter
          from={0}
          to={current}
          decimals={decimals}
          suffix={`/${total}`}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-500">
          <AnimatedCounter
            from={0}
            to={percentage}
            decimals={1}
            suffix="%"
          />
        </div>
      )}
    </div>
  );
};

export const TimeCounter: React.FC<{
  seconds: number;
  format?: 'short' | 'long' | 'clock';
  className?: string;
}> = ({ seconds, format = 'short', className }) => {
  const formatTime = (secs: number): string => {
    switch (format) {
      case 'long':
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const remainingSeconds = secs % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      
      case 'clock':
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      
      default: // short
        if (secs >= 3600) {
          const h = Math.floor(secs / 3600);
          const m = Math.floor((secs % 3600) / 60);
          return `${h}h ${m}m`;
        } else if (secs >= 60) {
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          return `${m}m ${s}s`;
        } else {
          return `${secs}s`;
        }
    }
  };

  return (
    <span className={cn("font-mono", className)}>
      <AnimatedCounter
        from={0}
        to={seconds}
        format={(value) => formatTime(Math.floor(value))}
      />
    </span>
  );
};

export default AnimatedCounter;