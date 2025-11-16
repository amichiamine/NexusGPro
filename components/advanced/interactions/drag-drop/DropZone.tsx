import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface DropZoneProps {
  children?: React.ReactNode;
  accept?: string | string[];
  onDrop: (item: any, monitor: any) => void;
  onDragEnter?: (item: any) => void;
  onDragLeave?: (item: any) => void;
  onDropHover?: (item: any, monitor: any) => boolean | void;
  canDrop?: (item: any) => boolean;
  isActive?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  maxItems?: number;
  validation?: (item: any) => { valid: boolean; message?: string };
  className?: string;
  style?: React.CSSProperties;
}

interface DropZoneAreaProps {
  title?: string;
  description?: string;
  accept?: string | string[];
  onDrop: (files: File[]) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // en bytes
  acceptTypes?: string[];
  validation?: (file: File) => { valid: boolean; message?: string };
  className?: string;
}

interface DropZoneListProps {
  items: any[];
  accept?: string | string[];
  onDrop: (item: any, index: number) => void;
  onRemove?: (item: any, index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  canDrop?: (item: any) => boolean;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}

interface DropZoneValidationProps {
  rules?: Array<{
    type: 'size' | 'type' | 'count' | 'custom';
    value?: any;
    message?: string;
  }>;
  onValidation?: (result: { valid: boolean; errors: string[] }) => void;
  className?: string;
}

// Composant principal DropZone
export const DropZone: React.FC<DropZoneProps> = ({
  children,
  accept = 'default',
  onDrop,
  onDragEnter,
  onDragLeave,
  onDropHover,
  canDrop,
  isActive = true,
  disabled = false,
  multiple = false,
  maxItems,
  validation,
  className,
  style
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<any[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  // Configuration du drop avec react-dnd
  const [{ isOver, canDrop: canDropItem, drop }, dropRef] = useDrop({
    accept,
    canDrop: (item) => {
      if (disabled) return false;
      
      const customCanDrop = canDrop?.(item);
      if (customCanDrop !== undefined) return customCanDrop;
      
      return isActive;
    },
    drop: (item, monitor) => {
      if (disabled) return;

      // Vérifier le nombre maximum d'items
      if (maxItems && droppedItems.length >= maxItems) {
        setValidationError(`Maximum ${maxItems} items autorisés`);
        return;
      }

      // Validation personnalisée
      let isValid = true;
      let errorMessage = '';

      if (validation) {
        const result = validation(item);
        isValid = result.valid;
        errorMessage = result.message || '';
      }

      if (!isValid) {
        setValidationError(errorMessage || 'Item invalide');
        return;
      }

      setValidationError(null);
      
      const dropResult = monitor.getDropResult();
      onDrop(item, dropResult || monitor);
      
      // Ajouter à la liste si multiple
      if (multiple) {
        setDroppedItems(prev => [...prev, item]);
      }
    },
    hover: (item, monitor) => {
      if (disabled) return;
      
      const canHover = canDrop?.(item) !== false && isActive;
      if (!canHover) return;

      if (onDropHover) {
        const result = onDropHover(item, monitor);
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

  const handleDragEnter = useCallback(() => {
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Vérifier si on quitte vraiment la zone
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX >= rect.right ||
      clientY < rect.top ||
      clientY >= rect.bottom
    ) {
      setIsDragOver(false);
      setValidationError(null);
    }
  }, []);

  const isDropZoneActive = isOver && canDropItem;

  return (
    <motion.div
      ref={(node) => {
        dropRef(node);
        if (elementRef.current !== node) {
          elementRef.current = node;
        }
      }}
      className={cn(
        'relative transition-all duration-200',
        isDropZoneActive && 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50',
        canDropItem && isOver && 'ring-2 ring-green-400 bg-green-50',
        disabled && 'opacity-50 cursor-not-allowed',
        validationError && 'ring-2 ring-red-400',
        className
      )}
      style={style}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      animate={{
        scale: isDropZoneActive ? 1.02 : 1,
        borderColor: validationError 
          ? '#EF4444' 
          : isDropZoneActive 
            ? '#10B981' 
            : '#D1D5DB'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children || (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <p className="text-gray-500">
              Déposez vos fichiers ici
            </p>
            {accept !== 'default' && (
              <p className="text-xs text-gray-400 mt-1">
                Types acceptés: {Array.isArray(accept) ? accept.join(', ') : accept}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Indicateur de drop actif */}
      <AnimatePresence>
        {isDropZoneActive && (
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
                Déposer ici
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Message d'erreur de validation */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            className="absolute top-2 left-2 right-2 bg-red-500 text-white text-sm px-3 py-2 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Compteur d'items */}
      {multiple && maxItems && (
        <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
          {droppedItems.length}/{maxItems}
        </div>
      )}
    </motion.div>
  );
};

// Composant DropZone pour fichiers
export const DropZoneArea: React.FC<DropZoneAreaProps> = ({
  title = 'Glissez-déposez vos fichiers ici',
  description = 'ou cliquez pour sélectionner',
  accept = '*',
  onDrop,
  onDragEnter,
  onDragLeave,
  disabled = false,
  multiple = true,
  maxFiles = 10,
  maxSize, // 10MB par défaut
  acceptTypes = [],
  validation,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultMaxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation de la taille
    const sizeLimit = maxSize || defaultMaxSize;
    if (file.size > sizeLimit) {
      const sizeMB = Math.round(file.size / (1024 * 1024));
      const limitMB = Math.round(sizeLimit / (1024 * 1024));
      errors.push(`Fichier trop volumineux: ${sizeMB}MB (max: ${limitMB}MB)`);
    }

    // Validation du type
    if (acceptTypes.length > 0 && !acceptTypes.some(type => file.type.startsWith(type))) {
      errors.push(`Type de fichier non accepté: ${file.type}`);
    }

    // Validation personnalisée
    if (validation) {
      const customResult = validation(file);
      if (!customResult.valid) {
        errors.push(customResult.message || 'Validation personnalisée échouée');
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    onDragEnter?.();
  }, [onDragEnter]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDragLeave?.();
  }, [onDragLeave]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const allErrors: string[] = [];

    files.forEach((file, index) => {
      const { valid, errors } = validateFile(file);
      
      if (valid) {
        validFiles.push(file);
      } else {
        allErrors.push(`${file.name}: ${errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    // Vérifier le nombre maximum de fichiers
    if (maxFiles && (droppedFiles.length + validFiles.length) > maxFiles) {
      setValidationErrors([`Maximum ${maxFiles} fichiers autorisés`]);
      return;
    }

    setValidationErrors([]);
    
    const allFiles = multiple ? [...droppedFiles, ...validFiles] : validFiles;
    setDroppedFiles(allFiles);
    onDrop(allFiles);
  }, [maxFiles, multiple, onDrop, droppedFiles, validateFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleDrop({
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: { files }
    } as any);
  }, [handleDrop]);

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        animate={{
          borderColor: isDragOver ? '#3B82F6' : '#D1D5DB',
          backgroundColor: isDragOver ? '#EFF6FF' : 'transparent'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={Array.isArray(acceptTypes) ? acceptTypes.join(',') : accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-2">{description}</p>
            
            {acceptTypes.length > 0 && (
              <p className="text-sm text-gray-500">
                Types acceptés: {acceptTypes.join(', ')}
              </p>
            )}
            
            {maxSize && (
              <p className="text-sm text-gray-500">
                Taille max: {Math.round(maxSize / (1024 * 1024))}MB par fichier
              </p>
            )}
          </div>
        </div>

        {/* Indicateur de drop */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="absolute inset-0 border-2 border-blue-400 rounded-lg bg-blue-400 bg-opacity-10"
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
                  Déposer les fichiers
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Erreurs de validation */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h4 className="text-sm font-semibold text-red-800 mb-2">
              Erreurs de validation:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des fichiers déposés */}
      <AnimatePresence>
        {droppedFiles.length > 0 && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h4 className="text-sm font-semibold text-gray-900">
              Fichiers sélectionnés ({droppedFiles.length}):
            </h4>
            {droppedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFiles = droppedFiles.filter((_, i) => i !== index);
                    setDroppedFiles(newFiles);
                    onDrop(newFiles);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant DropZoneList pour liste ordonnée
export const DropZoneList: React.FC<DropZoneListProps> = ({
  items,
  accept = 'default',
  onDrop,
  onRemove,
  onReorder,
  renderItem,
  canDrop,
  disabled = false,
  className,
  itemClassName
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [{ isOver, canDrop: canDropItem }, drop] = useDrop({
    accept,
    canDrop: (item) => {
      if (disabled) return false;
      return canDrop?.(item) !== false;
    },
    drop: (item: any, monitor) => {
      const dropIndex = dragOverIndex;
      if (dropIndex !== null) {
        onDrop(item, dropIndex);
      }
    },
    hover: (item, monitor) => {
      const element = monitor.getClientOffset();
      if (!element) return;

      const items = Array.from(document.querySelectorAll('[data-dropzone-item]'));
      const index = items.findIndex(item => {
        const rect = item.getBoundingClientRect();
        return element.y > rect.top && element.y < rect.bottom;
      });

      setDragOverIndex(index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <div ref={drop} className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <motion.div
          key={`${item.id}-${index}`}
          data-dropzone-item
          className={cn(
            'relative transition-all duration-200',
            dragOverIndex === index && 'ring-2 ring-blue-400 bg-blue-50',
            itemClassName
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          layout
        >
          {renderItem ? renderItem(item, index) : (
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <span className="text-gray-900">{item.content || item.name}</span>
              {onRemove && (
                <button
                  onClick={() => onRemove(item, index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Zone de drop à la fin */}
      {items.length === 0 && (
        <motion.div
          className={cn(
            'p-8 border-2 border-dashed border-gray-300 rounded-lg text-center',
            isOver && canDropItem && 'border-blue-400 bg-blue-50'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-500">Aucun élément. Glissez-déposez ici.</p>
        </motion.div>
      )}
    </div>
  );
};

// Composant de validation
export const DropZoneValidation: React.FC<DropZoneValidationProps> = ({
  rules = [],
  onValidation,
  className
}) => {
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: string[];
  }>({ valid: true, errors: [] });

  const validate = useCallback((item: any) => {
    const errors: string[] = [];

    rules.forEach(rule => {
      switch (rule.type) {
        case 'size':
          if (rule.value && item.size > rule.value) {
            errors.push(rule.message || `Taille maximale: ${rule.value}`);
          }
          break;
        case 'type':
          if (rule.value && !rule.value.includes(item.type)) {
            errors.push(rule.message || `Type non accepté: ${item.type}`);
          }
          break;
        case 'count':
          if (rule.value && item.count > rule.value) {
            errors.push(rule.message || `Nombre maximum: ${rule.value}`);
          }
          break;
        case 'custom':
          // Logique personnalisée à implémenter
          break;
      }
    });

    const result = { valid: errors.length === 0, errors };
    setValidationResults(result);
    onValidation?.(result);

    return result;
  }, [rules, onValidation]);

  return {
    validate,
    results: validationResults
  };
};

// Hook personnalisé pour drop zone
export const useDropZone = (
  config: {
    accept?: string | string[];
    onDrop?: (item: any, monitor: any) => void;
    canDrop?: (item: any) => boolean;
  } = {}
) => {
  const { accept = 'default', onDrop, canDrop } = config;

  const [{ isOver, canDrop: canDropItem, drop }, dropRef] = useDrop({
    accept,
    canDrop,
    drop,
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

export default DropZone;