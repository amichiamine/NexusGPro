import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils';

/**
 * FAQ item interface
 */
export interface FAQItem {
  /** Question text */
  question: string;
  /** Answer text or ReactNode */
  answer: React.ReactNode;
  /** Additional CSS classes for the item */
  className?: string;
  /** Icon to display with the question */
  questionIcon?: React.ReactNode;
  /** Icon to display with the answer */
  answerIcon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Custom ID for the item */
  id?: string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Click handler for custom logic */
  onClick?: () => void;
}

/**
 * FAQAccordion component props
 */
export interface FAQAccordionProps {
  /** Array of FAQ items */
  items: FAQItem[];
  /** Currently expanded item indices (controlled) */
  expanded?: number[];
  /** Default expanded item indices (uncontrolled) */
  defaultExpanded?: number[];
  /** Whether multiple items can be expanded simultaneously */
  allowMultiple?: boolean;
  /** Visual style variant */
  variant?: 'default' | 'outlined' | 'filled' | 'minimal' | 'bordered';
  /** Size of the accordion */
  size?: 'sm' | 'md' | 'lg';
  /** Position of the expand icon */
  iconPosition?: 'left' | 'right';
  /** Custom expand icon */
  expandIcon?: React.ReactNode;
  /** Custom collapse icon */
  collapseIcon?: React.ReactNode;
  /** Whether to show animations */
  animated?: boolean;
  /** Duration of animations in milliseconds */
  animationDuration?: number;
  /** Whether to allow keyboard navigation */
  keyboardNavigation?: boolean;
  /** Custom aria-label for the accordion */
  'aria-label'?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom ID for the accordion container */
  id?: string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Change handler for expanded items */
  onExpandedChange?: (expandedItems: number[]) => void;
  /** Item click handler */
  onItemClick?: (index: number, item: FAQItem) => void;
}

const FAQAccordion = forwardRef<HTMLDivElement, FAQAccordionProps>(
  (
    {
      items = [],
      expanded: controlledExpanded,
      defaultExpanded = [],
      allowMultiple = false,
      variant = 'default',
      size = 'md',
      iconPosition = 'right',
      expandIcon,
      collapseIcon,
      animated = true,
      animationDuration = 300,
      keyboardNavigation = true,
      'aria-label': ariaLabel = 'Frequently Asked Questions',
      className,
      id,
      'data-testid': dataTestid,
      onExpandedChange,
      onItemClick,
      ...props
    },
    ref
  ) => {
    // State management
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<number[]>(defaultExpanded);
    const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());

    // Use controlled or uncontrolled state
    const isControlled = controlledExpanded !== undefined;
    const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

    // Handle expanded state changes
    const handleExpandedChange = useCallback((newExpanded: number[]) => {
      if (!isControlled) {
        setUncontrolledExpanded(newExpanded);
      }
      onExpandedChange?.(newExpanded);
    }, [isControlled, onExpandedChange]);

    // Toggle item expansion
    const toggleItem = useCallback((index: number, item: FAQItem) => {
      if (item.disabled) return;

      let newExpanded: number[];
      
      if (allowMultiple) {
        // Multiple items can be expanded
        if (expanded.includes(index)) {
          newExpanded = expanded.filter(i => i !== index);
        } else {
          newExpanded = [...expanded, index];
        }
      } else {
        // Only one item can be expanded
        newExpanded = expanded.includes(index) ? [] : [index];
      }

      handleExpandedChange(newExpanded);
      onItemClick?.(index, item);
    }, [expanded, allowMultiple, handleExpandedChange, onItemClick]);

    // Animation handlers
    const handleAnimationStart = useCallback((index: number) => {
      setAnimatingItems(prev => new Set([...prev, index]));
    }, []);

    const handleAnimationEnd = useCallback((index: number) => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, []);

    // Keyboard navigation
    useEffect(() => {
      if (!keyboardNavigation) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const focusableElements = document.querySelectorAll(
          '[data-faq-button]:not([disabled])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(
          document.activeElement as Element
        );

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % focusableElements.length;
            (focusableElements[nextIndex] as HTMLElement)?.focus();
            break;
          case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex === 0 
              ? focusableElements.length - 1 
              : currentIndex - 1;
            (focusableElements[prevIndex] as HTMLElement)?.focus();
            break;
          case 'Home':
            event.preventDefault();
            (focusableElements[0] as HTMLElement)?.focus();
            break;
          case 'End':
            event.preventDefault();
            (focusableElements[focusableElements.length - 1] as HTMLElement)?.focus();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [keyboardNavigation, items]);

    // Get default icons
    const getDefaultExpandIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="faq-icon faq-icon-expand"
        aria-hidden="true"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    const getDefaultCollapseIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="faq-icon faq-icon-collapse"
        aria-hidden="true"
      >
        <path
          d="M6 10L8 8L10 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    // Validation
    const validItems = items.filter(
      (item) => item && typeof item.question === 'string' && item.question.trim() !== ''
    );

    if (validItems.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          'faq-accordion',
          `faq-accordion-variant-${variant}`,
          `faq-accordion-size-${size}`,
          animated && 'faq-accordion-animated',
          className
        )}
        aria-label={ariaLabel}
        data-testid={dataTestid}
        {...props}
      >
        <div className="faq-list">
          {validItems.map((item, index) => {
            const isExpanded = expanded.includes(index);
            const isAnimating = animatingItems.has(index);
            const itemId = item.id || `faq-item-${index}`;
            const buttonId = `${itemId}-button`;
            const contentId = `${itemId}-content`;
            const buttonLabelId = `${buttonId}-label`;

            return (
              <div
                key={index}
                className={cn(
                  'faq-item',
                  `faq-item-variant-${variant}`,
                  `faq-item-size-${size}`,
                  isExpanded && 'faq-item-expanded',
                  item.disabled && 'faq-item-disabled',
                  item.className
                )}
                data-testid={item['data-testid']}
              >
                <div className="faq-question">
                  <button
                    id={buttonId}
                    className={cn(
                      'faq-question-button',
                      `faq-question-button-variant-${variant}`,
                      `faq-question-button-size-${size}`,
                      `faq-question-button-icon-${iconPosition}`,
                      isExpanded && 'faq-question-button-expanded',
                      item.disabled && 'faq-question-button-disabled'
                    )}
                    onClick={() => toggleItem(index, item)}
                    onAnimationStart={() => handleAnimationStart(index)}
                    onAnimationEnd={() => handleAnimationEnd(index)}
                    disabled={item.disabled}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    aria-describedby={buttonLabelId}
                    data-faq-button
                    data-testid={`faq-question-${index}`}
                  >
                    <div className="faq-question-content">
                      {iconPosition === 'left' && (
                        <div className="faq-question-icon-left">
                          {isExpanded ? 
                            (collapseIcon || getDefaultCollapseIcon()) : 
                            (expandIcon || getDefaultExpandIcon())
                          }
                        </div>
                      )}
                      
                      <div className="faq-question-text">
                        {item.questionIcon && (
                          <span className="faq-question-icon">
                            {item.questionIcon}
                          </span>
                        )}
                        <span className="faq-question-label" id={buttonLabelId}>
                          {item.question}
                        </span>
                      </div>

                      {iconPosition === 'right' && (
                        <div className="faq-question-icon-right">
                          {isExpanded ? 
                            (collapseIcon || getDefaultCollapseIcon()) : 
                            (expandIcon || getDefaultExpandIcon())
                          }
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div
                  id={contentId}
                  className={cn(
                    'faq-answer',
                    `faq-answer-variant-${variant}`,
                    `faq-answer-size-${size}`,
                    isExpanded && 'faq-answer-expanded',
                    isAnimating && 'faq-answer-animating'
                  )}
                  style={{
                    animationDuration: animated ? `${animationDuration}ms` : undefined
                  }}
                  role="region"
                  aria-labelledby={buttonId}
                  data-testid={`faq-answer-${index}`}
                >
                  <div className="faq-answer-content">
                    {item.answerIcon && (
                      <span className="faq-answer-icon">
                        {item.answerIcon}
                      </span>
                    )}
                    <div className="faq-answer-text">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

FAQAccordion.displayName = 'FAQAccordion';

export default FAQAccordion;