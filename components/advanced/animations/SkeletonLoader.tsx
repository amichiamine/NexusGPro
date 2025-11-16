import React from 'react';
import { cn } from '@/utils';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'list' | 'avatar';
  width?: string | number;
  height?: string | number;
  lines?: number;
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
  rounded?: boolean;
}

/**
 * Composant SkeletonLoader avancé avec variantes multiples et animations fluides
 * Optimisé pour différents types de contenu avec performance améliorée
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 3,
  avatarSize = 'md',
  className,
  animate = true,
  rounded = false,
}) => {
  const avatarSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const baseClasses = cn(
    "bg-gradient-to-r",
    "from-gray-200",
    "via-gray-300", 
    "to-gray-200",
    "bg-[length:200%_100%]",
    animate && "animate-[shimmer_1.5s_ease-in-out_infinite]",
    rounded && "rounded-full",
    className
  );

  const customStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const skeletonVariants = {
    text: (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              index === lines - 1 && "w-3/4" // Last line shorter
            )}
            style={{
              ...customStyle,
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    ),

    rectangular: (
      <div
        className={cn(baseClasses, !rounded && "rounded")}
        style={customStyle}
      />
    ),

    circular: (
      <div
        className={cn(
          baseClasses,
          "rounded-full",
          avatarSizes[avatarSize]
        )}
        style={customStyle}
      />
    ),

    card: (
      <div className="space-y-4">
        {/* Image placeholder */}
        <div
          className={cn(
            baseClasses,
            "w-full",
            "aspect-video",
            !rounded && "rounded-lg"
          )}
        />
        
        {/* Title placeholder */}
        <div
          className={cn(
            baseClasses,
            "h-6",
            "w-3/4",
            !rounded && "rounded"
          )}
        />
        
        {/* Subtitle placeholders */}
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              "h-4",
              index === 1 ? "w-1/2" : "w-full"
            )}
            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
          />
        ))}
      </div>
    ),

    list: (
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="flex items-center space-x-3">
            {/* Avatar placeholder */}
            <div
              className={cn(
                baseClasses,
                "rounded-full",
                avatarSizes[avatarSize]
              )}
            />
            
            {/* Content placeholders */}
            <div className="flex-1 space-y-2">
              <div
                className={cn(
                  baseClasses,
                  "h-4",
                  "w-2/3",
                  `w-${Math.floor(60 - index * 10)}`
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
              <div
                className={cn(
                  baseClasses,
                  "h-3",
                  "w-1/2"
                )}
                style={{ animationDelay: `${index * 0.1 + 0.05}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),

    avatar: (
      <div className={cn(
        "flex items-center space-x-4",
        className
      )}>
        <div
          className={cn(
            baseClasses,
            "rounded-full",
            avatarSizes[avatarSize]
          )}
        />
        <div className="flex-1 space-y-2">
          <div
            className={cn(
              baseClasses,
              "h-4",
              "w-2/3",
              !rounded && "rounded"
            )}
          />
          <div
            className={cn(
              baseClasses,
              "h-3",
              "w-1/2",
              !rounded && "rounded"
            )}
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      </div>
    )
  };

  return skeletonVariants[variant];
};

// Add CSS animation to the document if not exists
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-shimmer-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default SkeletonLoader;