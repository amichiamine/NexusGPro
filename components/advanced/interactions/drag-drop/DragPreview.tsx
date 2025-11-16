import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface DragPreviewProps {
  children: React.ReactNode;
  id: string;
  type?: string;
  preview?: React.ComponentType<{ item: any; isDragging: boolean }>;
  showPreview?: boolean;
  customPreview?: (item: any, isDragging: boolean) => React.ReactNode;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  disabled?: boolean;
  ghost?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface DraggableCardProps {
  title: string;
  description?: string;
  image?: string;
  id: string;
  type?: string;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  disabled?: boolean;
  className?: string;
}

interface DragPreviewContainerProps {
  children: React.ReactNode;
  offset?: { x: number; y: number };
  scale?: number;
  opacity?: number;
  rotation?: number;
  showShadow?: boolean;
  borderRadius?: number;
  className?: string;
}

interface CustomDragPreviewProps {
  item: any;
  isDragging: boolean;
  position: { x: number; y: number };
  offset: { x: number; y: number };
  className?: string;
}

// Composant principal DragPreview
export const DragPreview: React.FC<DragPreviewProps> = ({
  children,
  id,
  type = 'default',
  preview: PreviewComponent,
  showPreview = true,
  customPreview,
  onDragStart,
  onDragEnd,
  disabled = false,
  ghost = false,
  className,
  style
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Configuration du drag avec react-dnd
  const [{ isDragging: reactDndDragging, dragOffset: dndOffset, dragPreview }, drag, dragPreviewRef] = useDrag({
    type,
    item: { id, type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      dragOffset: monitor.getInitialClientOffset(),
      dragPreview: monitor.getPreview()
    }),
    begin: (monitor) => {
      setIsDragging(true);
      const initialOffset = monitor.getInitialClientOffset();
      if (initialOffset) {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
          setDragOffset({
            x: initialOffset.x - rect.left,
            y: initialOffset.y - rect.top
          });
        }
      }
      onDragStart?.({ id, type });
    },
    end: (item, monitor) => {
      setIsDragging(false);
      onDragEnd?.({ id, type });
    },
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        setDragPosition({
          x: clientOffset.x - dragOffset.x,
          y: clientOffset.y - dragOffset.y
        });
      }
    }
  });

  // Rendu du prévisualiseur personnalisé
  const renderCustomPreview = useCallback(() => {
    if (customPreview && isDragging) {
      return customPreview({ id, type }, isDragging);
    }
    return null;
  }, [customPreview, isDragging, id, type]);

  // Combine les refs
  const ref = (node: HTMLElement) => {
    drag(node);
    dragPreviewRef(node);
    if (elementRef.current !== node) {
      elementRef.current = node;
    }
  };

  return (
    <>
      {/* Élément source */}
      <motion.div
        ref={ref}
        className={cn(
          'relative',
          isDragging && ghost && 'opacity-50',
          disabled && 'cursor-not-allowed',
          className
        )}
        style={style}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        animate={{
          scale: isDragging ? 1.05 : 1,
          rotate: isDragging ? 2 : 0,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        {children}
        
        {/* Indicateur de drag */}
        {isDragging && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            ⠠
          </motion.div>
        )}
      </motion.div>

      {/* Prévisualisation personnalisée */}
      <AnimatePresence>
        {isDragging && showPreview && customPreview && (
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
              transform: `translate(-${dragOffset.x}px, -${dragOffset.y}px)`
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {renderCustomPreview()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prévisualisation par défaut */}
      <AnimatePresence>
        {isDragging && showPreview && PreviewComponent && (
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
              transform: `translate(-${dragOffset.x}px, -${dragOffset.y}px)`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <PreviewComponent item={{ id, type }} isDragging={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Composant DraggableCard avec preview
export const DraggableCard: React.FC<DraggableCardProps> = ({
  title,
  description,
  image,
  id,
  type = 'card',
  onDragStart,
  onDragEnd,
  disabled = false,
  className
}) => {
  const renderCustomPreview = useCallback((item: any, isDragging: boolean) => (
    <DragPreviewCard
      title={title}
      description={description}
      image={image}
      isDragging={isDragging}
    />
  ), [title, description, image]);

  return (
    <DragPreview
      id={id}
      type={type}
      customPreview={renderCustomPreview}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      disabled={disabled}
      className={cn('w-full', className)}
    >
      <motion.div
        className="bg-white rounded-lg shadow-md border p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-32 object-cover rounded mb-3"
          />
        )}
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </motion.div>
    </DragPreview>
  );
};

// Composant de carte pour prévisualisation
interface DragPreviewCardProps {
  title: string;
  description?: string;
  image?: string;
  isDragging: boolean;
}

const DragPreviewCard: React.FC<DragPreviewCardProps> = ({
  title,
  description,
  image,
  isDragging
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl border p-3 w-48"
      animate={{
        scale: isDragging ? 1.1 : 1,
        rotate: isDragging ? 5 : 0,
        boxShadow: isDragging 
          ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
          : '0 10px 20px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-20 object-cover rounded mb-2"
        />
      )}
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
      )}
    </motion.div>
  );
};

// Conteneur de prévisualisation
export const DragPreviewContainer: React.FC<DragPreviewContainerProps> = ({
  children,
  offset = { x: 0, y: 0 },
  scale = 1,
  opacity = 0.8,
  rotation = 0,
  showShadow = true,
  borderRadius = 8,
  className
}) => {
  return (
    <motion.div
      className={cn(
        'pointer-events-none bg-white border shadow-lg',
        showShadow && 'shadow-xl',
        className
      )}
      style={{
        borderRadius,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity
      }}
      animate={{
        x: offset.x,
        y: offset.y,
        scale: [scale, scale * 1.05, scale],
        rotate: [rotation, rotation + 2, rotation]
      }}
      transition={{
        x: { type: "spring", stiffness: 200, damping: 20 },
        y: { type: "spring", stiffness: 200, damping: 20 },
        scale: { duration: 0.3, repeat: Infinity, repeatType: "reverse" },
        rotate: { duration: 0.6, repeat: Infinity, repeatType: "reverse" }
      }}
    >
      {children}
    </motion.div>
  );
};

// Prévisualisation personnalisée
export const CustomDragPreview: React.FC<CustomDragPreviewProps> = ({
  item,
  isDragging,
  position,
  offset,
  className
}) => {
  const [isVisible, setIsVisible] = useState(isDragging);

  useEffect(() => {
    setIsVisible(isDragging);
  }, [isDragging]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        'fixed pointer-events-none z-50',
        className
      )}
      style={{
        left: position.x - offset.x,
        top: position.y - offset.y,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {item.content}
    </motion.div>
  );
};

// Composant de liste avec prévisualisation
interface DraggableListWithPreviewProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    type?: string;
  }>;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  className?: string;
  itemClassName?: string;
  showPreview?: boolean;
}

export const DraggableListWithPreview: React.FC<DraggableListWithPreviewProps> = ({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  className,
  itemClassName,
  showPreview = true
}) => {
  const [dragItem, setDragItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <DragPreview
          key={item.id}
          id={item.id}
          type={item.type || 'list-item'}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          showPreview={showPreview}
          className={cn(
            'transition-all',
            dragOverIndex === index && 'ring-2 ring-blue-400',
            itemClassName
          )}
        >
          <motion.div
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
            whileHover={{ x: 4 }}
            layout
          >
            <div className="text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4h4v2h-4V4zm0 14h4v2h-4v-2zM4 10h2v4H4v-4zm14 0h2v4h-2v-4z"/>
              </svg>
            </div>
            <div className="flex-1">
              {item.content}
            </div>
          </motion.div>
        </DragPreview>
      ))}
    </div>
  );
};

// Hook personnalisé pour drag avec preview
export const useDragWithPreview = (
  config: {
    type?: string;
    item: any;
    preview?: React.ComponentType<{ item: any; isDragging: boolean }>;
    onDragStart?: (item: any) => void;
    onDragEnd?: (item: any) => void;
  }
) => {
  const { type = 'default', item, preview: PreviewComponent, onDragStart, onDragEnd } = config;

  const [{ isDragging, dragPreview }, drag] = useDrag({
    type,
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      dragPreview: monitor.getPreview()
    })
  });

  const CustomPreview = useCallback(() => {
    if (PreviewComponent && isDragging) {
      return <PreviewComponent item={item} isDragging={isDragging} />;
    }
    return null;
  }, [PreviewComponent, item, isDragging]);

  return {
    isDragging,
    drag,
    CustomPreview,
    dragPreview
  };
};

// Composant de prévisualisation adaptative
interface AdaptiveDragPreviewProps {
  children: React.ReactNode;
  id: string;
  type?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  previewVariant?: 'minimal' | 'card' | 'full';
  onDragStart?: (item: any) => void;
  onDragEnd?: (item: any) => void;
  disabled?: boolean;
  className?: string;
}

export const AdaptiveDragPreview: React.FC<AdaptiveDragPreviewProps> = ({
  children,
  id,
  type = 'default',
  deviceType = 'auto',
  previewVariant = 'card',
  onDragStart,
  onDragEnd,
  disabled = false,
  className
}) => {
  const [currentDevice, setCurrentDevice] = useState(deviceType);

  // Détecter le device automatiquement
  useEffect(() => {
    if (deviceType !== 'auto') return;

    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setCurrentDevice('mobile');
      else if (width < 1024) setCurrentDevice('tablet');
      else setCurrentDevice('desktop');
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, [deviceType]);

  // Configuration de la prévisualisation selon le device
  const getPreviewConfig = () => {
    const configs = {
      mobile: {
        scale: 0.7,
        opacity: 0.9,
        offset: { x: -30, y: -30 },
        variant: 'minimal'
      },
      tablet: {
        scale: 0.8,
        opacity: 0.85,
        offset: { x: -40, y: -40 },
        variant: 'card'
      },
      desktop: {
        scale: 1,
        opacity: 0.8,
        offset: { x: -50, y: -50 },
        variant: 'full'
      }
    };

    return configs[currentDevice];
  };

  const previewConfig = getPreviewConfig();
  const PreviewComponent = getPreviewComponent(previewVariant);

  const renderCustomPreview = useCallback(() => {
    return (
      <DragPreviewContainer
        offset={previewConfig.offset}
        scale={previewConfig.scale}
        opacity={previewConfig.opacity}
        borderRadius={currentDevice === 'mobile' ? 4 : 8}
        showShadow={currentDevice !== 'mobile'}
      >
        {PreviewComponent ? <PreviewComponent item={{ id, type }} isDragging={true} /> : null}
      </DragPreviewContainer>
    );
  }, [previewConfig, currentDevice, PreviewComponent, id, type]);

  return (
    <DragPreview
      id={id}
      type={type}
      customPreview={renderCustomPreview}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      disabled={disabled}
      className={cn('w-full', className)}
    >
      {children}
    </DragPreview>
  );
};

// Fonction helper pour obtenir le composant de prévisualisation
const getPreviewComponent = (variant: string) => {
  const components = {
    minimal: MinimalPreview,
    card: DragPreviewCard,
    full: FullPreview
  };
  
  return components[variant as keyof typeof components] || DragPreviewCard;
};

// Composants de prévisualisation prédéfinis
const MinimalPreview: React.FC<{ item: any; isDragging: boolean }> = ({ item }) => (
  <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
    {item.id}
  </div>
);

const FullPreview: React.FC<{ item: any; isDragging: boolean }> = ({ item }) => (
  <div className="bg-white border rounded-lg p-4 shadow-xl max-w-sm">
    <h3 className="font-bold text-lg mb-2">Aperçu complet</h3>
    <p className="text-gray-600 mb-2">ID: {item.id}</p>
    <p className="text-gray-600">Type: {item.type}</p>
  </div>
);

export default DragPreview;