import React from 'react';
import { cx } from '../../utils';

export type SkeletonType = 'text' | 'circle' | 'rectangle' | 'avatar' | 'button' | 'card';

export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Type de skeleton à afficher */
  type?: SkeletonType;
  
  /** Taille prédéfinie */
  size?: SkeletonSize;
  
  /** Largeur personnalisée (remplace size si fourni) */
  width?: number | string;
  
  /** Hauteur personnalisée (remplace size si fourni) */
  height?: number | string;
  
  /** Nombre de lignes (pour type='text') */
  lines?: number;
  
  /** Radius personnalisé (pour formes circulaires) */
  radius?: number;
  
  /** Animation active */
  animated?: boolean;
  
  /** Couleur de fond personnalisée */
  backgroundColor?: string;
  
  /** Couleur de highlight personnalisée */
  highlightColor?: string;
  
  /** Accessible label pour les lecteurs d'écran */
  'aria-label'?: string;
  
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant Skeleton moderne et accessible
 * 
 * Un skeleton est un placeholder qui indique qu'un contenu est en cours de chargement,
 * améliorant l'expérience utilisateur pendant les états de chargement.
 * 
 * @example
 * ```tsx
 * <Skeleton type="text" lines={3} />
 * <Skeleton type="circle" size="lg" />
 * <Skeleton type="card" width={300} height={200} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'rectangle',
  size = 'md',
  width,
  height,
  lines = 1,
  radius,
  animated = true,
  backgroundColor,
  highlightColor,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Dimensions par défaut selon le type
  const getDefaultDimensions = () => {
    const sizeMap = {
      xs: { width: 16, height: 16 },
      sm: { width: 24, height: 24 },
      md: { width: 32, height: 32 },
      lg: { width: 48, height: 48 },
      xl: { width: 64, height: 64 },
    };

    switch (type) {
      case 'text':
        return { width: 100, height: 16 };
      case 'circle':
        return sizeMap[size];
      case 'avatar':
        return sizeMap[size];
      case 'button':
        return { width: 100, height: 40 };
      case 'card':
        return { width: 300, height: 200 };
      case 'rectangle':
      default:
        return { width: 200, height: 100 };
    }
  };

  // Classes CSS
  const skeletonClasses = cx(
    'skeleton',
    `skeleton--${type}`,
    `skeleton--${size}`,
    {
      'skeleton--animated': animated,
      'skeleton--text-multiline': type === 'text' && lines > 1,
    },
    className
  );

  // Style inline
  const skeletonStyle: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(radius && type === 'circle' && { borderRadius: `${radius}px` }),
    ...(backgroundColor && { '--skeleton-bg': backgroundColor }),
    ...(highlightColor && { '--skeleton-highlight': highlightColor }),
  };

  // Accessible label
  const accessibleLabel = ariaLabel || `Chargement ${type}`;

  // Rendu du contenu selon le type
  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div className="skeleton__content">
            {Array.from({ length: lines }, (_, index) => (
              <div
                key={index}
                className={cx('skeleton__line', {
                  'skeleton__line--full': index === 0,
                  'skeleton__line--partial': index > 0 && index === lines - 1 && lines > 1,
                })}
                style={{ height: `${height || 16}px` }}
              />
            ))}
          </div>
        );

      case 'circle':
      case 'avatar':
        return (
          <div 
            className="skeleton__circle"
            style={{ 
              width: width || 'auto',
              height: height || 'auto',
              borderRadius: radius || '50%'
            }}
          />
        );

      case 'button':
        return (
          <div 
            className="skeleton__button"
            style={{ 
              width: width || '100px',
              height: height || '40px'
            }}
          />
        );

      case 'card':
        return (
          <div className="skeleton__card">
            <div 
              className="skeleton__card-image"
              style={{ 
                width: width || '100%',
                height: height ? `${(height as number) * 0.6}px` : '120px'
              }}
            />
            <div className="skeleton__card-content">
              <div className="skeleton__card-title" />
              <div className="skeleton__card-description" />
            </div>
          </div>
        );

      case 'rectangle':
      default:
        return (
          <div 
            className="skeleton__rectangle"
            style={{ 
              width: width || '200px',
              height: height || '100px'
            }}
          />
        );
    }
  };

  return (
    <div
      className={skeletonClasses}
      style={skeletonStyle}
      aria-label={accessibleLabel}
      aria-hidden="true"
      role="presentation"
      {...props}
    >
      {renderContent()}
    </div>
  );
};

// Export par défaut
export default Skeleton;