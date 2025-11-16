import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface DragContextValue {
  isDragging: boolean;
  draggedItem: any;
  dragPosition: { x: number; y: number } | null;
  setIsDragging: (dragging: boolean) => void;
  setDraggedItem: (item: any) => void;
  setDragPosition: (position: { x: number; y: number } | null) => void;
  registerDropZone: (id: string, dropZone: any) => void;
  unregisterDropZone: (id: string) => void;
  getDropZone: (id: string) => any;
  getAllDropZones: () => Record<string, any>;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  onDrop?: (item: any, dropZone: any) => void;
}

interface DragProviderProps {
  children: React.ReactNode;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  onDrop?: (item: any, dropZone: any) => void;
  enableDebug?: boolean;
}

interface DropZoneContextValue {
  id: string;
  accepts: string[];
  onDrop: (item: any, monitor: any) => void;
  onDragEnter?: (item: any) => void;
  onDragLeave?: (item: any) => void;
  onDragOver?: (item: any, monitor: any) => boolean | void;
  canDrop?: (item: any) => boolean;
  disabled?: boolean;
  isActive?: boolean;
}

interface DragProviderContext {
  registerDropZone: (id: string, dropZone: DropZoneContextValue) => void;
  unregisterDropZone: (id: string) => void;
  getDropZone: (id: string) => DropZoneContextValue | null;
  getAllDropZones: () => Record<string, DropZoneContextValue>;
  onDropZoneDrop: (dropZoneId: string, item: any, monitor: any) => void;
  onDropZoneDragEnter: (dropZoneId: string, item: any) => void;
  onDropZoneDragLeave: (dropZoneId: string, item: any) => void;
  onDropZoneDragOver: (dropZoneId: string, item: any, monitor: any) => boolean | void;
}

// Contexte pour la gestion globale du drag & drop
const DragContext = createContext<DragContextValue | null>(null);

// Hook pour utiliser le contexte de drag
export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};

// Provider pour le contexte global de drag & drop
export const DragProvider: React.FC<DragProviderProps> = ({
  children,
  onDragStart,
  onDragEnd,
  onDrop,
  enableDebug = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dropZones, setDropZones] = useState<Record<string, DropZoneContextValue>>({});
  const dragPositionRef = useRef(dragPosition);

  // Mettre à jour la ref quand la position change
  useEffect(() => {
    dragPositionRef.current = dragPosition;
  }, [dragPosition]);

  const registerDropZone = useCallback((id: string, dropZone: DropZoneContextValue) => {
    setDropZones(prev => ({ ...prev, [id]: dropZone }));
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getDropZone = useCallback((id: string) => {
    return dropZones[id] || null;
  }, [dropZones]);

  const getAllDropZones = useCallback(() => {
    return dropZones;
  }, [dropZones]);

  const handleDragStart = useCallback((item: any) => {
    setIsDragging(true);
    setDraggedItem(item);
    onDragStart?.(item);
  }, [onDragStart]);

  const handleDragEnd = useCallback((item: any) => {
    setIsDragging(false);
    setDraggedItem(null);
    setDragPosition(null);
    onDragEnd?.(item);
  }, [onDragEnd]);

  const handleDrop = useCallback((item: any, dropZone: DropZoneContextValue) => {
    onDrop?.(item, dropZone);
  }, [onDrop]);

  const contextValue: DragContextValue = {
    isDragging,
    draggedItem,
    dragPosition,
    setIsDragging,
    setDraggedItem,
    setDragPosition,
    registerDropZone,
    unregisterDropZone,
    getDropZone,
    getAllDropZones,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDrop: handleDrop
  };

  return (
    <DragContext.Provider value={contextValue}>
      {children}
      
      {/* Debug Panel */}
      {enableDebug && (
        <DragDebugPanel />
      )}
    </DragContext.Provider>
  );
};

// Composant pour le panel de debug
const DragDebugPanel: React.FC = () => {
  const { isDragging, draggedItem, dragPosition, getAllDropZones } = useDragContext();
  const [isVisible, setIsVisible] = useState(true);
  const [currentHover, setCurrentHover] = useState<string | null>(null);

  useEffect(() => {
    // Écouter les événements globaux pour le debug
    const handleDragEnter = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const dropZoneId = target.dataset.dropZoneId;
      if (dropZoneId) setCurrentHover(dropZoneId);
    };

    const handleDragLeave = () => {
      setCurrentHover(null);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);

  if (!isVisible) return null;

  const dropZones = getAllDropZones();

  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-xl z-50 max-w-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Drag & Drop Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Is Dragging:</span>
          <span className={cn(
            'font-mono px-2 py-1 rounded',
            isDragging ? 'bg-red-500' : 'bg-gray-600'
          )}>
            {isDragging ? 'YES' : 'NO'}
          </span>
        </div>
        
        {draggedItem && (
          <div className="flex justify-between">
            <span>Item ID:</span>
            <span className="font-mono">{draggedItem.id}</span>
          </div>
        )}
        
        {dragPosition && (
          <div className="flex justify-between">
            <span>Position:</span>
            <span className="font-mono">
              {Math.round(dragPosition.x)}, {Math.round(dragPosition.y)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Drop Zones:</span>
          <span className="font-mono">{Object.keys(dropZones).length}</span>
        </div>
        
        {currentHover && (
          <div className="flex justify-between">
            <span>Current Hover:</span>
            <span className="font-mono text-yellow-300">{currentHover}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="text-xs text-gray-300">
          Drop Zones: {Object.keys(dropZones).join(', ') || 'None'}
        </div>
      </div>
    </motion.div>
  );
};

// Hook pour créer un composant avec contexte DnD intégré
export const useDragDropComponent = (
  config: {
    type?: string;
    item: any;
    disabled?: boolean;
    onDragStart?: (item: any) => void;
    onDragEnd?: (item: any) => void;
    dragPreview?: React.ComponentType<{ item: any; isDragging: boolean }>;
  }
) => {
  const { onDragStart, onDragEnd } = useDragContext();
  const { type = 'default', item, disabled = false, dragPreview: PreviewComponent } = config;

  const [{ isDragging }, drag] = useDrag({
    type,
    item,
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => {
      onDragStart?.(item);
      config.onDragStart?.(item);
    },
    end: () => {
      onDragEnd?.(item);
      config.onDragEnd?.(item);
    }
  });

  const DragPreview = useCallback(() => {
    if (PreviewComponent && isDragging) {
      return <PreviewComponent item={item} isDragging={isDragging} />;
    }
    return null;
  }, [PreviewComponent, item, isDragging]);

  return { isDragging, drag, DragPreview };
};

// Hook pour créer une drop zone avec contexte
export const useDropZone = (
  config: {
    id: string;
    accepts: string[];
    onDrop: (item: any, monitor: any) => void;
    canDrop?: (item: any) => boolean;
    onDragEnter?: (item: any) => void;
    onDragLeave?: (item: any) => void;
    onDragOver?: (item: any, monitor: any) => boolean | void;
    disabled?: boolean;
  }
) => {
  const {
    id,
    accepts,
    onDrop,
    canDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    disabled = false
  } = config;
  
  const { registerDropZone, unregisterDropZone } = useDragContext();

  // Enregistrer la drop zone au montage
  useEffect(() => {
    const dropZone: DropZoneContextValue = {
      id,
      accepts,
      onDrop,
      canDrop,
      onDragEnter,
      onDragLeave,
      onDragOver,
      disabled,
      isActive: true
    };

    registerDropZone(id, dropZone);

    return () => {
      unregisterDropZone(id);
    };
  }, [id, accepts, onDrop, canDrop, onDragEnter, onDragLeave, onDragOver, disabled, registerDropZone, unregisterDropZone]);

  const [{ isOver, canDrop: canDropItem }, dropRef] = useDrop({
    accept: accepts,
    canDrop: (item) => {
      const customCanDrop = canDrop?.(item);
      if (customCanDrop !== undefined) return customCanDrop;
      return !disabled;
    },
    drop: (item, monitor) => {
      if (disabled) return;
      onDrop(item, monitor);
    },
    hover: (item, monitor) => {
      if (disabled) return;
      if (onDragOver) {
        const result = onDragOver(item, monitor);
        if (result === false) {
          // Annuler le hover
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return {
    isOver,
    canDrop: canDropItem,
    dropRef
  };
};

// Composant DragContainer pour gérer le drag global
interface DragContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseMove?: (position: { x: number; y: number }) => void;
}

export const DragContainer: React.FC<DragContainerProps> = ({
  children,
  className,
  style,
  onMouseMove
}) => {
  const { setDragPosition, isDragging, dragPosition } = useDragContext();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const position = { x: e.clientX, y: e.clientY };
      setDragPosition(position);
      onMouseMove?.(position);
    }
  }, [isDragging, setDragPosition, onMouseMove]);

  const handleMouseUp = useCallback(() => {
    setDragPosition(null);
  }, [setDragPosition]);

  return (
    <div
      className={cn('relative', className)}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
      
      {/* Ghost du dragged item */}
      <AnimatePresence>
        {isDragging && dragPosition && (
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-white rounded-lg shadow-xl border p-3 max-w-xs">
              <div className="text-sm font-medium">
                Dragging...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant DropZone avec contexte
interface DropZoneWithContextProps {
  id: string;
  accepts: string[];
  onDrop: (item: any, monitor: any) => void;
  canDrop?: (item: any) => boolean;
  onDragEnter?: (item: any) => void;
  onDragLeave?: (item: any) => void;
  onDragOver?: (item: any, monitor: any) => boolean | void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DropZoneWithContext: React.FC<DropZoneWithContextProps> = ({
  id,
  accepts,
  onDrop,
  canDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  disabled = false,
  children,
  className,
  style
}) => {
  const { isOver, canDrop: canDropItem, dropRef } = useDropZone({
    id,
    accepts,
    onDrop,
    canDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    disabled
  });

  return (
    <div
      ref={dropRef}
      data-drop-zone-id={id}
      className={cn(
        'relative transition-all duration-200',
        isOver && canDropItem && 'ring-2 ring-blue-400 bg-blue-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={style}
    >
      {children}
      
      {/* Indicateur de drop */}
      <AnimatePresence>
        {isOver && canDropItem && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-400 bg-opacity-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                Drop here
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook pour la gestion des zones de drop multiples
export const useMultipleDropZones = (
  zones: Array<{
    id: string;
    accepts: string[];
    onDrop: (item: any, monitor: any) => void;
    canDrop?: (item: any) => boolean;
  }>
) => {
  const dropZoneRefs = useRef<Record<string, any>>({});

  // Créer les refs pour chaque zone
  zones.forEach(zone => {
    if (!dropZoneRefs.current[zone.id]) {
      dropZoneRefs.current[zone.id] = useDropZone({
        id: zone.id,
        accepts: zone.accepts,
        onDrop: zone.onDrop,
        canDrop: zone.canDrop
      });
    }
  });

  return dropZoneRefs.current;
};

// Composant pour afficher les statistiques DnD
interface DragStatsProps {
  className?: string;
}

export const DragStats: React.FC<DragStatsProps> = ({ className }) => {
  const { isDragging, draggedItem, getAllDropZones } = useDragContext();
  const dropZones = getAllDropZones();

  return (
    <div className={cn('bg-white p-4 rounded-lg border shadow-sm', className)}>
      <h3 className="font-semibold mb-3">Drag & Drop Statistics</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Currently Dragging:</span>
          <span className={cn(
            'font-mono px-2 py-1 rounded',
            isDragging ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          )}>
            {isDragging ? 'YES' : 'NO'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Total Drop Zones:</span>
          <span className="font-mono">{Object.keys(dropZones).length}</span>
        </div>
        
        {draggedItem && (
          <div className="flex justify-between">
            <span>Dragged Item ID:</span>
            <span className="font-mono text-blue-600">{draggedItem.id}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <h4 className="font-medium mb-2">Drop Zones List:</h4>
        <div className="space-y-1">
          {Object.keys(dropZones).map(zoneId => (
            <div key={zoneId} className="flex justify-between text-xs">
              <span className="text-gray-600">{zoneId}</span>
              <span className="font-mono">
                {dropZones[zoneId].accepts.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragContext;