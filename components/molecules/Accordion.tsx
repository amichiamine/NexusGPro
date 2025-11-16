import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn, generateId } from '@/utils';

export type AccordionType = 'single' | 'multiple';

export interface AccordionItem {
  /** Identifiant unique de l'élément */
  id?: string;
  
  /** Titre de l'élément */
  title: string;
  
  /** Contenu de l'élément */
  content: React.ReactNode;
  
  /** État initial ouvert/fermé */
  isOpen?: boolean;
  
  /** Icône à afficher dans l'en-tête */
  icon?: React.ReactNode;
  
  /** Accessible label pour l'élément */
  'aria-label'?: string;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Éléments de l'accordéon */
  items: AccordionItem[];
  
  /** Type d'accordéon : single (un seul ouvert) ou multiple (plusieurs ouverts) */
  type?: AccordionType;
  
  /** Indices des éléments initialement ouverts */
  defaultOpen?: number[];
  
  /** État contrôlé des éléments ouverts */
  openItems?: number[];
  
  /** Callback appelé quand un élément change d'état */
  onChange?: (openIndices: number[]) => void;
  
  /** Désactiver l'accordéon entièrement */
  disabled?: boolean;
  
  /** Indice de l'élément avec focus initial */
  defaultFocusIndex?: number;
  
  /** AllowToggle : permet de fermer l'élément ouvert */
  allowToggle?: boolean;
  
  /** Animation d'ouverture/fermeture */
  animated?: boolean;
  
  /** Classes CSS supplémentaires */
  className?: string;
  
  /** ID de base pour générer des IDs uniques */
  baseId?: string;
  
  /** Titre par défaut pour l'accordéon (accessibilité) */
  'aria-label'?: string;
  
  /** Description pour l'accordéon (accessibilité) */
  'aria-describedby'?: string;
}

/**
 * Composant Accordion moderne et accessible
 * 
 * Un accordéon permet d'organiser du contenu en sections dépliables/contractibles
 * avec une navigation clavier et des attributs ARIA complets.
 * 
 * @example
 * ```tsx
 * <Accordion 
 *   items={[
 *     { title: "Section 1", content: "Contenu 1" },
 *     { title: "Section 2", content: "Contenu 2" }
 *   ]}
 *   type="single"
 * />
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultOpen = [],
  openItems,
  onChange,
  disabled = false,
  defaultFocusIndex = 0,
  allowToggle = true,
  animated = true,
  className,
  baseId,
  'aria-label': ariaLabel = 'Accordéon',
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  // Génération d'un ID unique
  const [accordionId] = useState(() => baseId || `accordion-${generateId()}`);
  
  // Gestion de l'état des éléments ouverts
  const [internalOpenItems, setInternalOpenItems] = useState<number[]>(() => {
    return items.reduce((acc, item, index) => {
      if (item.isOpen) acc.push(index);
      return acc;
    }, [] as number[]).concat(defaultOpen);
  });
  
  // Déterminer si l'accordéon est contrôlé ou non
  const isControlled = openItems !== undefined;
  const openIndices = isControlled ? openItems! : internalOpenItems;
  
  // Gestion des changements d'état
  const handleToggle = useCallback((index: number, event?: React.KeyboardEvent) => {
    if (disabled) return;
    
    let newOpenItems: number[];
    
    if (type === 'single') {
      // Mode single : seul un élément peut être ouvert
      if (allowToggle && openIndices.includes(index)) {
        newOpenItems = [];
      } else {
        newOpenItems = [index];
      }
    } else {
      // Mode multiple : plusieurs éléments peuvent être ouverts
      if (openIndices.includes(index)) {
        if (allowToggle) {
          newOpenItems = openIndices.filter(i => i !== index);
        } else {
          newOpenItems = openIndices; // Ne pas autoriser la fermeture
        }
      } else {
        newOpenItems = [...openIndices, index];
      }
    }
    
    if (!isControlled) {
      setInternalOpenItems(newOpenItems);
    }
    
    onChange?.(newOpenItems);
  }, [disabled, type, allowToggle, openIndices, isControlled, onChange]);
  
  // Navigation clavier
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    
    const headers = Array.from(document.querySelectorAll<HTMLButtonElement>(`#${accordionId} .accordion__header`));
    const currentIndex = headers.findIndex(header => header === event.currentTarget);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % headers.length;
        headers[nextIndex].focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? headers.length - 1 : currentIndex - 1;
        headers[prevIndex].focus();
        break;
        
      case 'Home':
        event.preventDefault();
        headers[0].focus();
        break;
        
      case 'End':
        event.preventDefault();
        headers[headers.length - 1].focus();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleToggle(index);
        break;
        
      default:
        break;
    }
  }, [disabled, handleToggle, accordionId]);
  
  // Classes CSS
  const accordionClasses = cn(
    'accordion',
    {
      'accordion--disabled': disabled,
      'accordion--animated': animated,
      'accordion--single': type === 'single',
      'accordion--multiple': type === 'multiple',
    },
    className
  );
  
  // Accessible properties
  const accordionProps = {
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
  };
  
  return (
    <div
      id={accordionId}
      className={accordionClasses}
      role="region"
      {...accordionProps}
      {...props}
    >
      {items.map((item, index) => {
        const itemId = item.id || `${accordionId}-item-${index}`;
        const headerId = `${itemId}-header`;
        const panelId = `${itemId}-panel`;
        const isOpen = openIndices.includes(index);
        const isExpanded = isOpen;
        
        return (
          <div
            key={itemId}
            className={cn('accordion__item', {
              'accordion__item--open': isOpen,
              'accordion__item--disabled': disabled,
            })}
          >
            <h3 className="accordion__header-container">
              <button
                id={headerId}
                className="accordion__header"
                onClick={(e) => handleToggle(index, e.nativeEvent as any)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={disabled}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                aria-label={item['aria-label'] || `Section ${index + 1}: ${item.title}`}
                type="button"
              >
                <span className="accordion__title">{item.title}</span>
                <span 
                  className={cn('accordion__chevron', {
                    'accordion__chevron--open': isOpen,
                  })}
                  aria-hidden="true"
                >
                  {item.icon || '▼'}
                </span>
              </button>
            </h3>
            
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!isOpen}
              className={cn('accordion__panel', {
                'accordion__panel--open': isOpen,
                'accordion__panel--closed': !isOpen,
              })}
            >
              <div className="accordion__content">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Export par défaut
export default Accordion;