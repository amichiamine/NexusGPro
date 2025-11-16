import React, { useState, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface SortableListProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    type?: string;
    disabled?: boolean;
  }>;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any, index: number) => void;
  onDragEnd?: (item: any, index: number) => void;
  onItemClick?: (item: any, index: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  dragHandle?: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  animated?: boolean;
  dropIndicator?: boolean;
  disabled?: boolean;
  vertical?: boolean;
}

interface SortableGridProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    type?: string;
    disabled?: boolean;
  }>;
  columns?: number;
  gap?: number;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any, index: number) => void;
  onDragEnd?: (item: any, index: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  animated?: boolean;
  disabled?: boolean;
}

interface SortableTreeProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    children?: SortableTreeProps['items'];
    type?: string;
    disabled?: boolean;
  }>;
  onReorder: (itemId: string, newParentId?: string, newIndex?: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  animated?: boolean;
  disabled?: boolean;
  collapsible?: boolean;
}

interface SortableKanbanProps {
  columns: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      content: React.ReactNode;
      type?: string;
    }>;
  }>;
  onReorder: (itemId: string, fromColumn: string, toColumn: string, toIndex: number) => void;
  onDragStart?: (item: any, columnId: string) => void;
  onDragEnd?: (item: any, columnId: string) => void;
  renderItem?: (item: any, columnId: string, index: number) => React.ReactNode;
  renderColumnHeader?: (column: any) => React.ReactNode;
  className?: string;
  columnClassName?: string;
  itemClassName?: string;
  animated?: boolean;
  disabled?: boolean;
}

interface SortableListItemProps {
  item: any;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDragStart: (item: any, index: number) => void;
  onDragEnd: (item: any, index: number) => void;
  onItemClick?: (item: any, index: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  dragHandle?: (item: any, index: number) => React.ReactNode;
  animated?: boolean;
  dropIndicator?: boolean;
  className?: string;
  disabled?: boolean;
  vertical?: boolean;
}

// Types pour react-dnd
interface DragItem {
  id: string;
  index: number;
  type: string;
}

// Composant principal SortableList
export const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  onItemClick,
  renderItem,
  dragHandle,
  className,
  itemClassName,
  animated = true,
  dropIndicator = true,
  disabled = false,
  vertical = true
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    
    const draggedItem = items[dragIndex];
    const newItems = [...items];
    
    // Retirer l'élément draggé
    newItems.splice(dragIndex, 1);
    
    // L'insérer à la nouvelle position
    newItems.splice(hoverIndex, 0, draggedItem);
    
    // Notifier le parent
    onReorder(dragIndex, hoverIndex);
  }, [items, onReorder]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <SortableListItem
          key={item.id}
          item={item}
          index={index}
          onMove={moveItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onItemClick={onItemClick}
          renderItem={renderItem}
          dragHandle={dragHandle}
          animated={animated}
          dropIndicator={dropIndicator}
          className={cn(
            'bg-white rounded-lg border shadow-sm hover:shadow-md transition-all',
            dragItem?.id === item.id && 'opacity-50',
            dragOverIndex === index && 'ring-2 ring-blue-400',
            item.disabled && 'opacity-50 cursor-not-allowed',
            itemClassName
          )}
          disabled={disabled || item.disabled}
          vertical={vertical}
        />
      ))}
    </div>
  );
};

// Composant pour chaque item de la liste
const SortableListItem: React.FC<SortableListItemProps> = ({
  item,
  index,
  onMove,
  onDragStart,
  onDragEnd,
  onItemClick,
  renderItem,
  dragHandle,
  animated = true,
  dropIndicator = true,
  className,
  disabled = false,
  vertical = true
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Configuration du drag
  const [{ isDragging }, drag] = useDrag({
    type: 'sortable-item',
    item: { id: item.id, index, type: item.type || 'default' },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      onDragStart?.(item, index);
    },
    end: () => {
      onDragEnd?.(item, index);
    }
  });

  // Configuration du drop
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'sortable-item',
    canDrop: (dragItem: DragItem) => {
      return dragItem.index !== index && !disabled;
    },
    drop: (dragItem: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        onMove(dragItem.index, index);
      }
    },
    hover: (dragItem: DragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      
      if (dragItem.index !== index && !disabled) {
        const hoverBoundingRect = itemRef.current?.getBoundingClientRect();
        const hoverMiddleY = hoverBoundingRect 
          ? (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
          : 0;
        
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset 
          ? clientOffset.y - hoverBoundingRect.top 
          : 0;

        if (dragItem.index < index && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragItem.index > index && hoverClientY > hoverMiddleY) {
          return;
        }

        onMove(dragItem.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  // Combine les refs
  const ref = (node: HTMLElement) => {
    drag(drop(node));
    if (itemRef.current !== node) {
      itemRef.current = node;
    }
  };

  // Animation conditionnelle
  const ItemComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    layout: true,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  } : {};

  return (
    <ItemComponent
      ref={ref}
      className={cn(
        'relative transition-all duration-200',
        isDragging && 'z-50',
        isOver && canDrop && 'ring-2 ring-blue-400 ring-opacity-50',
        className
      )}
      style={{ touchAction: 'none' }}
      {...animationProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !disabled && onItemClick?.(item, index)}
    >
      <div className="flex items-center space-x-3">
        {/* Drag Handle */}
        {(dragHandle?.(item, index) || (
          <motion.div
            className={cn(
              'cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600',
              disabled && 'cursor-not-allowed'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4h4v2h-4V4zm0 14h4v2h-4v-2zM4 10h2v4H4v-4zm14 0h2v4h-2v-4z"/>
            </svg>
          </motion.div>
        ))}
        
        {/* Contenu de l'item */}
        <div className="flex-1">
          {renderItem ? renderItem(item, index) : (
            <div className="py-2">
              {item.content}
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de drop */}
      {dropIndicator && isOver && canDrop && (
        <motion.div
          className="absolute -bottom-1 left-4 right-4 h-0.5 bg-blue-500 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Indicateur de hover */}
      <AnimatePresence>
        {isHovered && !isDragging && (
          <motion.div
            className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Indicateur de dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute -inset-1 bg-blue-400 bg-opacity-20 rounded-lg border-2 border-blue-400 border-dashed pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </ItemComponent>
  );
};

// Composant SortableGrid
export const SortableGrid: React.FC<SortableGridProps> = ({
  items,
  columns = 3,
  gap = 16,
  onReorder,
  onDragStart,
  onDragEnd,
  renderItem,
  className,
  itemClassName,
  animated = true,
  disabled = false
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`
  };

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    
    const draggedItem = items[dragIndex];
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    onReorder(dragIndex, hoverIndex);
  }, [items, onReorder]);

  return (
    <div style={gridStyle} className={cn(className)}>
      {items.map((item, index) => (
        <SortableGridItem
          key={item.id}
          item={item}
          index={index}
          columns={columns}
          gap={gap}
          onMove={moveItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          renderItem={renderItem}
          animated={animated}
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

interface SortableGridItemProps {
  item: any;
  index: number;
  columns: number;
  gap: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDragStart: (item: any, index: number) => void;
  onDragEnd: (item: any, index: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  animated?: boolean;
  className?: string;
  disabled?: boolean;
}

const SortableGridItem: React.FC<SortableGridItemProps> = ({
  item,
  index,
  columns,
  gap,
  onMove,
  onDragStart,
  onDragEnd,
  renderItem,
  animated = true,
  className,
  disabled
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'sortable-grid',
    item: { id: item.id, index, type: item.type || 'default' },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => onDragStart?.(item, index),
    end: () => onDragEnd?.(item, index)
  });

  return (
    <motion.div
      ref={drag}
      className={cn(
        'relative',
        isDragging && 'z-50 transform rotate-2 scale-105',
        className
      )}
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      whileHover={{ y: -2, scale: isDragging ? 1.05 : 1.02 }}
      transition={animated ? { type: "spring", stiffness: 300, damping: 30 } : {}}
    >
      {renderItem ? renderItem(item, index) : item.content}
      
      {/* Indicateur de drag */}
      {isDragging && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
          ⠠
        </div>
      )}
    </motion.div>
  );
};

// Composant SortableTree (structure hiérarchique)
export const SortableTree: React.FC<SortableTreeProps> = ({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  renderItem,
  className,
  itemClassName,
  animated = true,
  disabled = false,
  collapsible = true
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <SortableTreeItem
          key={item.id}
          item={item}
          index={index}
          level={0}
          expandedNodes={expandedNodes}
          onToggleNode={toggleNode}
          onReorder={onReorder}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          renderItem={renderItem}
          animated={animated}
          collapsible={collapsible}
          className={cn(itemClassName)}
          disabled={disabled || item.disabled}
        />
      ))}
    </div>
  );
};

interface SortableTreeItemProps {
  item: any;
  index: number;
  level: number;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onReorder: (itemId: string, newParentId?: string, newIndex?: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  animated?: boolean;
  collapsible?: boolean;
  className?: string;
  disabled?: boolean;
}

const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  item,
  index,
  level,
  expandedNodes,
  onToggleNode,
  onReorder,
  onDragStart,
  onDragEnd,
  renderItem,
  animated = true,
  collapsible = true,
  className,
  disabled
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.id);

  const [{ isDragging }, drag] = useDrag({
    type: 'sortable-tree',
    item: { id: item.id, index, type: item.type || 'default', level },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => onDragStart?.(item),
    end: () => onDragEnd?.(item)
  });

  return (
    <div>
      <motion.div
        ref={drag}
        className={cn(
          'relative flex items-center space-x-2 p-2 rounded-lg border transition-all',
          isDragging && 'z-50 opacity-50',
          className
        )}
        style={{ marginLeft: level * 24 }}
        initial={animated ? { opacity: 0, x: -20 } : {}}
        animate={animated ? { opacity: 1, x: 0 } : {}}
      >
        {/* Toggle pour les enfants */}
        {hasChildren && collapsible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(item.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M6 4L10 8H6V4Z" />
            </motion.svg>
          </button>
        )}
        
        {/* Drag handle */}
        <div className="cursor-grab active:cursor-grabbing text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4h4v2h-4V4zm0 14h4v2h-4v-2zM4 10h2v4H4v-4zm14 0h2v4h-2v-4z"/>
          </svg>
        </div>
        
        {/* Contenu */}
        <div className="flex-1">
          {renderItem ? renderItem(item, index) : item.content}
        </div>
      </motion.div>
      
      {/* Enfants */}
      {hasChildren && collapsible && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {item.children.map((child: any, childIndex: number) => (
                <SortableTreeItem
                  key={child.id}
                  item={child}
                  index={childIndex}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  onToggleNode={onToggleNode}
                  onReorder={onReorder}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  renderItem={renderItem}
                  animated={animated}
                  collapsible={collapsible}
                  className={className}
                  disabled={disabled || child.disabled}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Hook personnalisé pour listes triables
export const useSortableList = (initialItems: any[] = []) => {
  const [items, setItems] = useState(initialItems);
  const [isDragging, setIsDragging] = useState(false);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);

  const reorderItems = useCallback((startIndex: number, endIndex: number) => {
    setItems(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const addItem = useCallback((item: any, index?: number) => {
    setItems(prev => {
      const newItems = [...prev];
      if (index !== undefined) {
        newItems.splice(index, 0, item);
      } else {
        newItems.push(item);
      }
      return newItems;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, newItem: any) => {
    setItems(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);

  return {
    items,
    setItems,
    isDragging,
    setIsDragging,
    moveItem,
    reorderItems,
    addItem,
    removeItem,
    updateItem
  };
};

export default SortableList;