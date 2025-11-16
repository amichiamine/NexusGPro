import React, { useState, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface DraggableProps {
  children: React.ReactNode;
  id: string;
  type?: string;
  disabled?: boolean;
  draggable?: boolean;
  preview?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  onDragStart?: (item: { id: string; type: string }) => void;
  onDragEnd?: (item: { id: string; type: string; position?: { x: number; y: number } }) => void;
  onDrag?: (item: { id: string; type: string; delta: { x: number; y: number } }) => void;
  constrainToBounds?: boolean;
  bounds?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

interface DraggableHandleProps {
  children: React.ReactNode;
  className?: string;
}

interface DraggableListProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    type?: string;
    disabled?: boolean;
  }>;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  dragHandle?: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  ghost?: boolean;
  disabled?: boolean;
}

interface DraggableGridProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    type?: string;
    disabled?: boolean;
  }>;
  columns?: number;
  gap?: number;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
}

// Types pour react-dnd
interface DragItem {
  type: string;
  id: string;
  index: number;
}

// Composant principal Draggable
export const Draggable: React.FC<DraggableProps> = ({
  children,
  id,
  type = 'default',
  disabled = false,
  draggable = true,
  preview = true,
  snapToGrid = false,
  gridSize = 10,
  onDragStart,
  onDragEnd,
  onDrag,
  constrainToBounds = false,
  bounds,
  className,
  style
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Configuration du drag avec react-dnd
  const [{ isOver, canDrop, drop }, drag, dragPreview] = useDrop({
    accept: type,
    drop: (item: DragItem, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newX = Math.round((dragOffset.x + delta.x) / gridSize) * gridSize;
        const newY = Math.round((dragOffset.y + delta.y) / gridSize) * gridSize;
        
        setDragOffset({
          x: snapToGrid ? newX : dragOffset.x + delta.x,
          y: snapToGrid ? newY : dragOffset.y + delta.y
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // Configuration du drag avec react-dnd
  const [{ isDragging: reactDndDragging }, dragRef] = useDrag({
    type,
    item: { id, type, index: 0 },
    canDrag: !disabled && draggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      setIsDragging(true);
      onDragStart?.({ id, type });
    },
    end: (item, monitor) => {
      setIsDragging(false);
      const dropResult = monitor.getDropResult();
      
      onDragEnd?.({
        id,
        type,
        position: dropResult ? { x: dragOffset.x, y: dragOffset.y } : undefined
      });
    },
    hover: (item, monitor) => {
      if (monitor.isDragging()) {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          setDragOffset({
            x: snapToGrid 
              ? Math.round((dragOffset.x + delta.x) / gridSize) * gridSize
              : dragOffset.x + delta.x,
            y: snapToGrid 
              ? Math.round((dragOffset.y + delta.y) / gridSize) * gridSize
              : dragOffset.y + delta.y
          });
          
          onDrag?.({
            id,
            type,
            delta: { x: delta.x, y: delta.y }
          });
        }
      }
    }
  });

  // Combine les refs
  const ref = (node: HTMLElement) => {
    dragRef(drag(node));
    dragPreview(node);
    if (elementRef.current !== node) {
      elementRef.current = node;
    }
  };

  // Calcul des contraintes de bounds
  const getConstraints = useCallback(() => {
    if (!constrainToBounds || !elementRef.current) return {};

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement?.getBoundingClientRect();

    if (!parentRect) return {};

    const constraints = {
      left: bounds?.left || 0,
      top: bounds?.top || 0,
      right: bounds?.right || (parentRect.width - rect.width),
      bottom: bounds?.bottom || (parentRect.height - rect.height)
    };

    return constraints;
  }, [constrainToBounds, bounds]);

  const constraints = getConstraints();

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative select-none cursor-grab active:cursor-grabbing',
        isDragging && 'z-50 opacity-50',
        isOver && 'ring-2 ring-blue-400 ring-opacity-50',
        canDrop && 'ring-2 ring-green-400',
        !draggable && 'cursor-default',
        className
      )}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        touchAction: 'none',
        ...style
      }}
      drag
      dragConstraints={constraints}
      dragElastic={0}
      dragMomentum={false}
      whileDrag={{ 
        scale: 1.05,
        rotate: 2,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
      
      {/* Indicateur de drag */}
      {isDragging && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          ⠠
        </motion.div>
      )}
      
      {/* Indicateur de drop zone */}
      {isOver && canDrop && (
        <motion.div
          className="absolute inset-0 border-2 border-green-400 border-dashed rounded-lg bg-green-400 bg-opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
};

// Composant de handle pour drag
export const DraggableHandle: React.FC<DraggableHandleProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        'cursor-grab active:cursor-grabbing select-none',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
};

// Composant de liste draggable
export const DraggableList: React.FC<DraggableListProps> = ({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  dragHandle,
  className,
  itemClassName,
  ghost = true,
  disabled = false
}) => {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex];
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    
    onReorder?.(dragIndex, hoverIndex);
  }, [items, onReorder]);

  const handleDragStart = useCallback((item: any, index: number) => {
    setDragItem({ id: item.id, type: item.type || 'list-item', index });
    onDragStart?.(item);
  }, [onDragStart]);

  const handleDragEnd = useCallback((item: any) => {
    setDragItem(null);
    setDragOverIndex(null);
    onDragEnd?.(item);
  }, [onDragEnd]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <DraggableListItem
          key={item.id}
          item={item}
          index={index}
          onMove={moveItem}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          dragHandle={dragHandle?.(item, index)}
          className={cn(
            'bg-white rounded-lg shadow-sm border transition-all',
            dragItem?.id === item.id && ghost && 'opacity-50',
            dragOverIndex === index && 'ring-2 ring-blue-400 bg-blue-50',
            item.disabled && 'opacity-50 cursor-not-allowed',
            itemClassName
          )}
          disabled={disabled || item.disabled}
        />
      ))}
    </div>
  );
};

// Composant pour chaque item de la liste
interface DraggableListItemProps {
  item: any;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDragStart: (item: any, index: number) => void;
  onDragEnd: (item: any) => void;
  dragHandle?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  item,
  index,
  onMove,
  onDragStart,
  onDragEnd,
  dragHandle,
  className,
  disabled
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'list-item',
    item: { id: item.id, index, type: item.type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      onDragStart(item, index);
    },
    end: () => {
      onDragEnd(item);
    }
  });

  const [, drop] = useDrop({
    accept: 'list-item',
    hover: (dragItem: DragItem) => {
      if (dragItem.index !== index && !disabled) {
        onMove(dragItem.index, index);
        dragItem.index = index;
      }
    }
  });

  const ref = (node: HTMLElement) => {
    drag(drop(node));
    if (itemRef.current !== node) {
      itemRef.current = node;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative',
        isDragging && 'z-50',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center space-x-3">
        {dragHandle || (
          <DraggableHandle className="p-2 text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4h4v2h-4V4zm0 14h4v2h-4v-2zM4 10h2v4H4v-4zm14 0h2v4h-2v-4z"/>
            </svg>
          </DraggableHandle>
        )}
        <div className="flex-1">
          {item.content}
        </div>
      </div>
    </motion.div>
  );
};

// Composant de grille draggable
export const DraggableGrid: React.FC<DraggableGridProps> = ({
  items,
  columns = 3,
  gap = 16,
  onReorder,
  onDragStart,
  onDragEnd,
  className,
  itemClassName,
  disabled = false
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`
  };

  return (
    <div style={gridStyle} className={cn(className)}>
      {items.map((item, index) => (
        <DraggableGridItem
          key={item.id}
          item={item}
          index={index}
          columns={columns}
          onReorder={onReorder}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={cn(
            'bg-white rounded-lg shadow-sm border p-4 transition-all',
            item.disabled && 'opacity-50 cursor-not-allowed',
            itemClassName
          )}
          disabled={disabled || item.disabled}
        />
      ))}
    </div>
  );
};

interface DraggableGridItemProps {
  item: any;
  index: number;
  columns: number;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  className?: string;
  disabled?: boolean;
}

const DraggableGridItem: React.FC<DraggableGridItemProps> = ({
  item,
  index,
  columns,
  onReorder,
  onDragStart,
  onDragEnd,
  className,
  disabled
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'grid-item',
    item: { id: item.id, index, type: item.type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      onDragStart?.(item);
    },
    end: () => {
      onDragEnd?.(item);
    }
  });

  const [, drop] = useDrop({
    accept: 'grid-item',
    hover: (dragItem: DragItem) => {
      if (dragItem.index !== index && !disabled) {
        onReorder?.(dragItem.index, index);
        dragItem.index = index;
      }
    }
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      className={cn(
        'relative',
        isDragging && 'z-50 transform rotate-2 scale-105',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ y: -2 }}
    >
      {item.content}
      
      {/* Indicateur de drag */}
      {isDragging && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
          ↕
        </div>
      )}
    </motion.div>
  );
};

// Hook personnalisé pour drag & drop
export const useDraggable = (config: {
  type?: string;
  id: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  canDrag?: boolean;
} = { id: '' }) => {
  const { type = 'default', id, onDragStart, onDragEnd, canDrag = true } = config;

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, type },
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: onDragStart,
    end: onDragEnd
  });

  return { isDragging, drag };
};

export default Draggable;