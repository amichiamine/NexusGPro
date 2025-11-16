import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/utils';

interface VirtualScrollerProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  threshold?: number;
  onEndReached?: () => void;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * VirtualScroller pour rendre de grandes listes avec performance optimale
 * Utilise le scrolling virtuel pour réduire le DOM et améliorer les performances
 */
const VirtualScroller = <T extends any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  threshold = 100,
  onEndReached,
  getItemKey = ((_, index) => index),
}: VirtualScrollerProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width } = entries[0].contentRect;
        setContainerWidth(width);
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Calculate visible range
  const { visibleItems, startIndex, endIndex, totalHeight } = useMemo(() => {
    if (typeof itemHeight === 'function') {
      // Dynamic height calculation
      let totalHeight = 0;
      let startIndex = 0;
      let endIndex = items.length - 1;

      // Find start index
      for (let i = 0; i < items.length; i++) {
        const height = (itemHeight as (index: number) => number)(i);
        if (totalHeight + height > scrollTop - overscan * 100) {
          startIndex = Math.max(0, i - overscan);
          break;
        }
        totalHeight += height;
      }

      // Find end index
      let visibleHeight = 0;
      for (let i = startIndex; i < items.length; i++) {
        const height = (itemHeight as (index: number) => number)(i);
        if (visibleHeight + height > containerHeight + 2 * overscan * 100) {
          endIndex = Math.min(items.length - 1, i + overscan);
          break;
        }
        visibleHeight += height;
        totalHeight += height;
      }

      return {
        visibleItems: items.slice(startIndex, endIndex + 1),
        startIndex,
        endIndex,
        totalHeight: items.reduce((sum, _, i) => sum + (itemHeight as (index: number) => number)(i), 0),
      };
    } else {
      // Fixed height calculation
      const fixedHeight = itemHeight as number;
      const startIndex = Math.max(0, Math.floor(scrollTop / fixedHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / fixedHeight) + overscan
      );

      return {
        visibleItems: items.slice(startIndex, endIndex + 1),
        startIndex,
        endIndex,
        totalHeight: items.length * fixedHeight,
      };
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - threshold;
      
      if (isNearEnd && endIndex === items.length - 1) {
        onEndReached();
      }
    }
  }, [onEndReached, threshold, endIndex, items.length]);

  // Calculate offset for positioning
  const getOffset = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return items.slice(0, index).reduce((sum, _, i) => {
        return sum + (itemHeight as (index: number) => number)(i);
      }, 0);
    } else {
      return index * (itemHeight as number);
    }
  }, [items, itemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, visibleIndex) => {
          const actualIndex = startIndex + visibleIndex;
          const offset = getOffset(actualIndex);
          
          return (
            <div
              key={getItemKey(item, actualIndex)}
              style={{
                position: 'absolute',
                top: offset,
                left: 0,
                right: 0,
                height: typeof itemHeight === 'function' 
                  ? (itemHeight as (index: number) => number)(actualIndex)
                  : itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualScroller;