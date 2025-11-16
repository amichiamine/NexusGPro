import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string | React.ReactNode;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  style?: React.CSSProperties;
}

/**
 * OptimizedImage avec support des formats modernes, placeholders et loading intelligent
 * Optimisé pour les performances avec lazy loading et webp/avif
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  loading = 'lazy',
  priority = false,
  quality = 75,
  formats = ['webp', 'avif', 'jpeg'],
  onLoad,
  onError,
  sizes,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!loading || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (loading === 'lazy' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { 
          rootMargin: '50px',
          threshold: 0.1 
        }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [loading]);

  // Génération de l'URL optimisée
  const generateOptimizedUrl = (originalSrc: string, format: string, quality: number): string => {
    // Support pour les services d'optimisation d'images
    const url = new URL(originalSrc);
    
    // Cloudinary-like transformation
    if (url.hostname.includes('cloudinary.com')) {
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1) {
        const transformIndex = uploadIndex + 1;
        pathParts.splice(transformIndex, 0, `f_${format},q_${quality}`);
        url.pathname = pathParts.join('/');
      }
    }
    // Imgix-like parameters
    else if (url.hostname.includes('imgix.net')) {
      url.searchParams.set('fm', format);
      url.searchParams.set('q', quality.toString());
    }
    // Default query parameters for custom servers
    else {
      url.searchParams.set('format', format);
      url.searchParams.set('quality', quality.toString());
    }

    return url.toString();
  };

  // Générer les sources pour différents formats
  const imageSources = formats.map(format => ({
    format,
    src: generateOptimizedUrl(src, format, quality),
  }));

  // Fallback pour les anciens navigateurs
  const fallbackSrc = src;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        !isLoaded && !isError && "bg-gray-200 dark:bg-gray-700",
        className
      )}
      style={{
        width,
        height,
        ...style
      }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {typeof placeholder === 'string' ? (
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
          ) : placeholder ? (
            placeholder
          ) : (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Erreur de chargement</p>
          </div>
        </div>
      )}

      {/* Image */}
      {isInView && (
        <picture>
          {/* Sources pour les formats modernes */}
          {imageSources.map(({ format, src: formatSrc }) => (
            <source
              key={format}
              srcSet={formatSrc}
              type={`image/${format}`}
              sizes={sizes}
            />
          ))}
          
          {/* Fallback */}
          <img
            ref={imgRef}
            src={fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? undefined : loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </picture>
      )}
    </div>
  );
};

// Composant spécialisé pour les avatars avec fallbacks intelligents
export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'placeholder'> & {
  fallback?: string;
  fallbackText?: string;
}> = ({ fallback, fallbackText, className, ...props }) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
    props.onError?.();
  };

  return (
    <div className={cn("relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700", className)}>
      {!imageError ? (
        <OptimizedImage
          {...props}
          onError={handleError}
          className="rounded-full"
          placeholder={
            <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
          }
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
          {fallback || fallbackText || (props.alt?.[0]?.toUpperCase() || '?')}
        </div>
      )}
    </div>
  );
};

// Composant pour les images responsives avec srcset intelligent
export const ResponsiveImage: React.FC<Omit<OptimizedImageProps, 'sizes' | 'src'> & {
  baseSrc: string;
  breakpoints: { width: number; src: string }[];
}> = ({ baseSrc, breakpoints, ...props }) => {
  const srcSet = breakpoints
    .map(({ width, src }) => `${src} ${width}w`)
    .join(', ');
  
  const defaultSizes = breakpoints
    .sort((a, b) => a.width - b.width)
    .map(({ width }) => `(max-width: ${width}px) ${width}px`)
    .join(', ');

  return (
    <OptimizedImage
      {...props}
      src={baseSrc}
      srcSet={srcSet}
      sizes={defaultSizes}
    />
  );
};

export default OptimizedImage;