import React, { useState, useCallback } from 'react';
import { cn } from '@/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Source de l'image (URL ou base64) */
  src?: string;
  
  /** Nom pour générer les initiales et l'attribut alt */
  name?: string;
  
  /** Taille prédéfinie du composant */
  size?: AvatarSize;
  
  /** Taille personnalisée en pixels (remplace size si fourni) */
  customSize?: number;
  
  /** Statut de l'utilisateur (détermine la couleur du statut) */
  status?: AvatarStatus;
  
  /** Afficher l'indicateur de statut */
  showStatus?: boolean;
  
  /** Accessible label pour les lecteurs d'écran */
  'aria-label'?: string;
  
  /** Classes CSS supplémentaires */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Erreur de chargement d'image */
  onImageError?: () => void;
  
  /** Image chargée avec succès */
  onImageLoad?: () => void;
  
  /** Si true, rend l'avatar comme bouton focusable */
  clickable?: boolean;
}

/**
 * Composant Avatar moderne et accessible
 * 
 * Un avatar représente un utilisateur ou une entité avec une image ou des initiales,
 * incluant la gestion d'erreurs d'image et les indicateurs de statut.
 * 
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" name="John Doe" size="lg" status="online" />
 * <Avatar name="Alice Martin" size="md" />
 * <Avatar name="CN" customSize={64} clickable onClick={() => {}} />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'NexusG',
  size = 'md',
  customSize,
  status,
  showStatus = false,
  className,
  onClick,
  onImageError,
  onImageLoad,
  clickable = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calcul des initiales depuis le nom
  const getInitials = useCallback((userName: string): string => {
    if (!userName || typeof userName !== 'string') return 'NG';
    
    return userName
      .split(' ')
      .filter(part => part.trim().length > 0)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, []);

  // Gestion des erreurs d'image
  const handleImageError = useCallback(() => {
    setImageError(true);
    onImageError?.();
  }, [onImageError]);

  // Gestion du chargement d'image
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    onImageLoad?.();
  }, [onImageLoad]);

  // Classes CSS
  const avatarClasses = cn(
    'avatar',
    `avatar--${size}`,
    {
      'avatar--clickable': clickable || onClick,
      'avatar--has-image': src && !imageError,
      'avatar--loading': src && !imageLoaded && !imageError,
      'avatar--error': imageError,
    },
    className
  );

  // Calcul de la taille
  const avatarStyle = customSize 
    ? { width: `${customSize}px`, height: `${customSize}px` }
    : undefined;

  // Accessible label
  const accessibleLabel = ariaLabel || (src && !imageError 
    ? `Avatar de ${name}` 
    : `Avatar avec initiales de ${name}`);

  // Couleur du statut
  const getStatusColor = (userStatus?: AvatarStatus): string => {
    switch (userStatus) {
      case 'online': return 'var(--success-500)';
      case 'away': return 'var(--warning-500)';
      case 'busy': return 'var(--error-500)';
      case 'offline': return 'var(--gray-400)';
      default: return 'var(--gray-400)';
    }
  };

  // Contenu de l'avatar
  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={accessibleLabel}
          className="avatar__image"
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      );
    }

    return (
      <span className="avatar__initials" aria-label={accessibleLabel}>
        {getInitials(name)}
      </span>
    );
  };

  if (clickable || onClick) {
    // Créer des props spécifiques pour le bouton
    const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
      className: avatarClasses,
      style: avatarStyle,
      onClick: onClick,
      'aria-label': accessibleLabel,
      role: 'button',
      type: 'button',
      ...props as any
    };
    
    return (
      <button {...buttonProps}>
        {renderContent()}
        
        {showStatus && status && (
          <span
            className="avatar__status"
            style={{ backgroundColor: getStatusColor(status) }}
            aria-label={`Statut: ${status}`}
          />
        )}
      </button>
    );
  }

  return (
    <div
      className={avatarClasses}
      style={avatarStyle}
      aria-label={accessibleLabel}
      {...props}
    >
      {renderContent()}
      
      {showStatus && status && (
        <span
          className="avatar__status"
          style={{ backgroundColor: getStatusColor(status) }}
          aria-label={`Statut: ${status}`}
        />
      )}
    </div>
  );
};

// Export par défaut
export default Avatar;