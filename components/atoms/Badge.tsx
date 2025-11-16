import React from 'react';
import { cn } from '@/utils';

export type BadgeVariant = 
  | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  | 'outline' | 'ghost';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Texte affiché dans le badge */
  label: string;
  
  /** Variante visuelle du badge */
  variant?: BadgeVariant;
  
  /** Taille du badge */
  size?: BadgeSize;
  
  /** Badge remplissant la largeur disponible */
  block?: boolean;
  
  /** Badge avec icône à gauche */
  iconLeft?: React.ReactNode;
  
  /** Badge avec icône à droite */
  iconRight?: React.ReactNode;
  
  /** Accessible label pour les lecteurs d'écran */
  'aria-label'?: string;
  
  /** Ajouter un role semantique pour l'accessibilité */
  role?: string;
}

/**
 * Composant Badge moderne et accessible
 * 
 * Un badge est un petit indicateur visuel qui attire l'attention sur un élément
 * ou fournit des informations supplémentaires comme un statut, un compte, ou une notification.
 * 
 * @example
 * ```tsx
 * <Badge label="Nouveau" variant="primary" />
 * <Badge label="Erreur" variant="error" iconLeft={<Icon name="warning" />} />
 * <Badge label="123" variant="success" block />
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft,
  iconRight,
  className,
  'aria-label': ariaLabel,
  role = 'status',
  ...props
}) => {
  const badgeClasses = cn(
    // Classes de base
    'badge',
    // Variantes
    `badge--${variant}`,
    // Tailles
    `badge--${size}`,
    // États
    {
      'badge--block': block,
    },
    className
  );

  const hasAriaLabel = ariaLabel || (typeof label !== 'string' && label);

  return (
    <span
      className={badgeClasses}
      aria-label={hasAriaLabel ? label : ariaLabel}
      role={role}
      aria-hidden={!hasAriaLabel}
      {...props}
    >
      {iconLeft && <span className="badge__icon badge__icon--left">{iconLeft}</span>}
      <span className="badge__text">{label}</span>
      {iconRight && <span className="badge__icon badge__icon--right">{iconRight}</span>}
    </span>
  );
};

// Export par défaut
export default Badge;