import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

interface InfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  endMessage?: React.ReactNode;
  loader?: React.ReactNode;
}

/**
 * Composant InfiniteScroll avec IntersectionObserver pour le chargement automatique
 */
const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loadMore,
  hasMore,
  isLoading,
  children,
  className,
  rootMargin = '100px',
  threshold = 0.1,
  endMessage,
  loader,
}) => {
  const [isNearEnd, setIsNearEnd] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsNearEnd(isIntersecting);
        
        if (isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [loadMore, hasMore, isLoading, rootMargin, threshold]);

  return (
    <div className={cn("relative", className)}>
      {children}
      
      {/* Sentinel element pour détecter la fin */}
      <div
        ref={sentinelRef}
        className="h-1 w-full"
        style={{ visibility: hasMore ? 'visible' : 'hidden' }}
      />
      
      {/* Loader spinner */}
      {isLoading && (
        <div className="flex justify-center py-4">
          {loader || (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          )}
        </div>
      )}
      
      {/* End message */}
      {!hasMore && endMessage && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          {endMessage}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;