import React, { forwardRef } from 'react';
import { cn } from '@/utils';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Text label for the breadcrumb item */
  label: string;
  /** URL for the link (if not provided, item is rendered as current page) */
  href?: string;
  /** Icon to display before the label */
  leadingIcon?: React.ReactNode;
  /** Icon to display after the label */
  trailingIcon?: React.ReactNode;
  /** Additional CSS classes for the item */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler for custom navigation logic */
  onClick?: () => void;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Visual style variant */
  variant?: 'default' | 'outlined' | 'filled' | 'minimal' | 'bordered';
  /** Separator between breadcrumb items */
  separator?: 'slash' | 'arrow' | 'chevron' | 'dot' | 'pipe' | 'custom';
  /** Custom separator element (used when separator is 'custom') */
  customSeparator?: React.ReactNode;
  /** Maximum number of items to show (remaining items are collapsed) */
  maxItems?: number;
  /** Size of the breadcrumbs */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show icons for each item */
  showIcons?: boolean;
  /** Whether to show ellipsis for collapsed items */
  showEllipsis?: boolean;
  /** Text for the ellipsis separator */
  ellipsisText?: string;
  /** Whether breadcrumbs are clickable */
  clickable?: boolean;
  /** Whether to show current page as active */
  showCurrentAsActive?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom aria-label for the navigation element */
  'aria-label'?: string;
  /** Custom ID for the navigation element */
  id?: string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      items = [],
      variant = 'default',
      separator = 'slash',
      customSeparator,
      maxItems,
      size = 'md',
      showIcons = false,
      showEllipsis = true,
      ellipsisText = '…',
      clickable = true,
      showCurrentAsActive = true,
      className,
      'aria-label': ariaLabel = 'Breadcrumb',
      id,
      'data-testid': dataTestid,
      ...props
    },
    ref
  ) => {
    // Validation and preprocessing
    const validItems = items.filter(item => item && typeof item.label === 'string' && item.label.trim() !== '');
    
    if (validItems.length === 0) {
      return null;
    }

    // Handle max items and collapsing
    const shouldCollapse = maxItems && validItems.length > maxItems;
    const visibleItems = shouldCollapse
      ? [
          validItems[0],
          ...(showEllipsis ? [{ label: ellipsisText, isEllipsis: true }] : []),
          validItems[validItems.length - 1]
        ]
      : validItems;

    // Determine current page (last item)
    const currentPage = validItems[validItems.length - 1];

    // Get separator component
    const getSeparator = () => {
      if (customSeparator && separator === 'custom') {
        return customSeparator;
      }

      const separatorProps = {
        className: cn(
          'breadcrumb-separator',
          `breadcrumb-separator-${separator}`,
          `breadcrumb-separator-size-${size}`,
          variant !== 'default' && `breadcrumb-separator-${variant}`
        ),
        'aria-hidden': true
      };

      switch (separator) {
        case 'arrow':
          return (
            <span {...separatorProps}>
              →
            </span>
          );
        case 'chevron':
          return (
            <span {...separatorProps}>
              ›
            </span>
          );
        case 'dot':
          return (
            <span {...separatorProps}>
              ·
            </span>
          );
        case 'pipe':
          return (
            <span {...separatorProps}>
              |
            </span>
          );
        case 'slash':
        default:
          return (
            <span {...separatorProps}>
              /
            </span>
          );
      }
    };

    // Render breadcrumb item
    const renderBreadcrumbItem = (item: BreadcrumbItem & { isEllipsis?: boolean }, index: number, totalItems: number) => {
      const isCurrentPage = index === totalItems - 1;
      const isDisabled = item.disabled || !clickable;
      
      const itemClasses = cn(
        'breadcrumb-item',
        `breadcrumb-item-${variant}`,
        `breadcrumb-item-size-${size}`,
        isCurrentPage && showCurrentAsActive && 'breadcrumb-item-current',
        isDisabled && 'breadcrumb-item-disabled',
        item.isEllipsis && 'breadcrumb-item-ellipsis',
        item.className
      );

      // Handle ellipsis
      if (item.isEllipsis) {
        return (
          <li key={`ellipsis-${index}`} className={itemClasses}>
            <span 
              aria-label={`${validItems.length - maxItems! + 1} more items`}
              className="breadcrumb-ellipsis"
            >
              {ellipsisText}
            </span>
          </li>
        );
      }

      // Handle current page
      if (isCurrentPage) {
        const content = (
          <>
            {showIcons && item.leadingIcon && (
              <span className="breadcrumb-icon breadcrumb-icon-leading">
                {item.leadingIcon}
              </span>
            )}
            <span className="breadcrumb-text">{item.label}</span>
            {item.trailingIcon && (
              <span className="breadcrumb-icon breadcrumb-icon-trailing">
                {item.trailingIcon}
              </span>
            )}
          </>
        );

        return (
          <li key={index} className={itemClasses}>
            <span 
              aria-current={showCurrentAsActive ? 'page' : undefined}
              className={cn(
                'breadcrumb-link',
                isDisabled && 'breadcrumb-link-disabled'
              )}
            >
              {content}
            </span>
          </li>
        );
      }

      // Handle regular breadcrumb item
      const content = (
        <>
          {showIcons && item.leadingIcon && (
            <span className="breadcrumb-icon breadcrumb-icon-leading">
              {item.leadingIcon}
            </span>
          )}
          <span className="breadcrumb-text">{item.label}</span>
          {item.trailingIcon && (
            <span className="breadcrumb-icon breadcrumb-icon-trailing">
              {item.trailingIcon}
            </span>
          )}
        </>
      );

      // Handle different navigation methods
      if (isDisabled || !item.href) {
        return (
          <li key={index} className={itemClasses}>
            <span 
              className={cn(
                'breadcrumb-link',
                'breadcrumb-link-disabled'
              )}
              aria-disabled={isDisabled}
            >
              {content}
            </span>
          </li>
        );
      }

      return (
        <li key={index} className={itemClasses}>
          <a
            href={item.href}
            className={cn(
              'breadcrumb-link',
              isDisabled && 'breadcrumb-link-disabled'
            )}
            onClick={item.onClick}
            aria-disabled={isDisabled}
          >
            {content}
          </a>
        </li>
      );
    };

    return (
      <nav
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'breadcrumbs',
          `breadcrumbs-variant-${variant}`,
          `breadcrumbs-size-${size}`,
          shouldCollapse && 'breadcrumbs-collapsible',
          className
        )}
        data-testid={dataTestid}
        {...props}
      >
        <ol className="breadcrumb-list">
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            return (
              <React.Fragment key={`breadcrumb-${index}`}>
                {renderBreadcrumbItem(item, index, visibleItems.length)}
                {!isLast && (
                  <li key={`separator-${index}`} className="breadcrumb-separator-item">
                    {getSeparator()}
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;