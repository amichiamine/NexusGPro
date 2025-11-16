import React, { useState } from 'react';
import { cn } from '@/utils';
import { PriceTag, PriceTagProps } from './PriceTag';
import './ProductGridCard.css';

export interface ProductGridCardProps {
  /** URL de l'image du produit */
  imageSrc: string;
  /** URL de l'image alternative (survol) */
  imageSrcHover?: string;
  /** Texte alternatif pour l'image */
  imageAlt?: string;
  /** Titre du produit */
  title: string;
  /** Prix du produit */
  price: number;
  /** Prix original (si en promotion) */
  originalPrice?: number;
  /** Note du produit */
  rating?: number;
  /** URL de détail du produit */
  productUrl?: string;
  /** Nouvelles arrivées */
  isNew?: boolean;
  /** En promotion */
  isOnSale?: boolean;
  /** Favoris */
  isFavorite?: boolean;
  /** Stock disponible */
  stock?: number;
  /** Configuration du prix */
  priceConfig?: {
    size?: PriceTagProps['size'];
    variant?: PriceTagProps['variant'];
    showDiscount?: boolean;
    currency?: string;
  };
  /** Actions disponibles */
  actions?: {
    /** Ajouter au panier */
    addToCart?: {
      enabled: boolean;
      onClick?: () => void;
    };
    /** Ajouter aux favoris */
    addToWishlist?: {
      enabled: boolean;
      onClick?: () => void;
    };
    /** Aperçu rapide */
    quickView?: {
      enabled: boolean;
      onClick?: () => void;
    };
  };
  /** Classe CSS personnalisée */
  className?: string;
  /** ID du composant */
  id?: string;
  /** État de désactivation */
  disabled?: boolean;
  /** État de chargement */
  loading?: boolean;
  /** Callback lors du clic sur le produit */
  onProductClick?: () => void;
  /** Callback lors du changement de favori */
  onFavoriteToggle?: () => void;
}

/**
 * Composant ProductGridCard pour affichage simplifié en grille
 * 
 * Fonctionnalités:
 * - Affichage compact en grille
 * - Image avec survol
 * - Prix avec gestion des promotions
 * - Badges (nouveau, promotion)
 * - Actions rapides
 * - Note/rating optionnel
 * - Optimisé pour la performance
 */
export const ProductGridCard: React.FC<ProductGridCardProps> = ({
  imageSrc,
  imageSrcHover,
  imageAlt = '',
  title,
  price,
  originalPrice,
  rating,
  productUrl,
  isNew = false,
  isOnSale = false,
  isFavorite = false,
  stock,
  priceConfig = {},
  actions = {},
  className = '',
  id,
  disabled = false,
  loading = false,
  onProductClick,
  onFavoriteToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Déterminer l'image à afficher
  const currentImage = isHovered && imageSrcHover ? imageSrcHover : imageSrc;

  // Vérifier la disponibilité
  const isOutOfStock = stock === 0;
  const hasDiscount = originalPrice && originalPrice > price;

  // Gestionnaires d'événements
  const handleProductClick = () => {
    if (!disabled && !loading) {
      if (productUrl) {
        window.open(productUrl, '_blank');
      }
      onProductClick?.();
    }
  };

  const handleQuickAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  // Classes CSS
  const cardClasses = cn(
    'ng-product-grid-card',
    {
      'ng-product-grid-card--hovered': isHovered,
      'ng-product-grid-card--out-of-stock': isOutOfStock,
      'ng-product-grid-card--disabled': disabled,
      'ng-product-grid-card--loading': loading,
    },
    className
  );

  // Rendu du placeholder de chargement
  const renderLoadingPlaceholder = () => (
    <div className="ng-product-grid-card__image-placeholder">
      <div className="ng-product-grid-card__loading-shimmer" />
    </div>
  );

  // Rendu des badges
  const renderBadges = () => {
    const badges = [];
    
    if (isNew) {
      badges.push(
        <span key="new" className="ng-product-grid-card__badge ng-product-grid-card__badge--new">
          Nouveau
        </span>
      );
    }
    
    if (hasDiscount) {
      const discountPercentage = Math.round(((originalPrice! - price) / originalPrice!) * 100);
      badges.push(
        <span key="sale" className="ng-product-grid-card__badge ng-product-grid-card__badge--sale">
          -{discountPercentage}%
        </span>
      );
    }
    
    if (isOutOfStock) {
      badges.push(
        <span key="out" className="ng-product-grid-card__badge ng-product-grid-card__badge--out-of-stock">
          Rupture
        </span>
      );
    }

    return badges.length > 0 ? (
      <div className="ng-product-grid-card__badges">
        {badges}
      </div>
    ) : null;
  };

  // Rendu du rating
  const renderRating = () => {
    if (!rating) return null;

    return (
      <div className="ng-product-grid-card__rating" aria-label={`Note de ${rating} sur 5`}>
        <div className="ng-product-grid-card__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`ng-product-grid-card__star ${
                star <= rating ? 'ng-product-grid-card__star--filled' : 'ng-product-grid-card__star--empty'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des actions rapides
  const renderActions = () => {
    const actionButtons = [];

    if (actions.quickView?.enabled) {
      actionButtons.push(
        <button
          key="quick-view"
          type="button"
          className="ng-product-grid-card__action-btn"
          onClick={handleQuickAction(actions.quickView.onClick || (() => {}))}
          aria-label="Aperçu rapide"
          title="Aperçu rapide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      );
    }

    if (actions.addToWishlist?.enabled) {
      actionButtons.push(
        <button
          key="wishlist"
          type="button"
          className={`ng-product-grid-card__action-btn ${
            isFavorite ? 'ng-product-grid-card__action-btn--active' : ''
          }`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      );
    }

    if (actions.addToCart?.enabled && !isOutOfStock) {
      actionButtons.push(
        <button
          key="add-to-cart"
          type="button"
          className="ng-product-grid-card__action-btn ng-product-grid-card__action-btn--primary"
          onClick={handleQuickAction(actions.addToCart.onClick || (() => {}))}
          aria-label="Ajouter au panier"
          title="Ajouter au panier"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      );
    }

    return actionButtons.length > 0 ? (
      <div className="ng-product-grid-card__actions">
        {actionButtons}
      </div>
    ) : null;
  };

  // Rendu du contenu
  const renderContent = () => (
    <div className="ng-product-grid-card__content">
      {renderRating()}
      
      <h3 className="ng-product-grid-card__title">
        <button
          type="button"
          className="ng-product-grid-card__title-link"
          onClick={handleProductClick}
          disabled={disabled}
          title={title}
        >
          <span className="ng-product-grid-card__title-text">{title}</span>
        </button>
      </h3>
      
      <div className="ng-product-grid-card__price-container">
        <PriceTag
          price={price}
          originalPrice={originalPrice}
          size={priceConfig.size || 'md'}
          variant={priceConfig.variant || (hasDiscount ? 'sale' : 'default')}
          showDiscount={priceConfig.showDiscount}
          currency={priceConfig.currency}
          disabled={disabled || loading}
          loading={loading}
          ariaLabel={`${title} - ${price} euros`}
        />
      </div>
    </div>
  );

  return (
    <article className={cardClasses} id={id}>
      {/* Image du produit */}
      <div
        className="ng-product-grid-card__image-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleProductClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Voir les détails de ${title}`}
      >
        {loading ? (
          renderLoadingPlaceholder()
        ) : (
          <>
            <img
              src={currentImage}
              alt={imageAlt || title}
              className={`ng-product-grid-card__image ${!imageLoaded ? 'ng-product-grid-card__image--loading' : ''}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && renderLoadingPlaceholder()}
          </>
        )}
        
        {renderBadges()}
        {renderActions()}
      </div>

      {/* Contenu */}
      {renderContent()}
    </article>
  );
};

export default ProductGridCard;