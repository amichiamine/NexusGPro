import React, { useState } from 'react';
import { cn } from '@/utils';
import { PriceTag, PriceTagProps } from './PriceTag';
import './ProductCard.css';

export interface ProductCardProps {
  /** URL de l'image principale du produit */
  imageSrc: string;
  /** URL de l'image secondaire (survol) */
  imageSrcHover?: string;
  /** Texte alternatif pour l'image */
  imageAlt?: string;
  /** Titre du produit */
  title: string;
  /** Description courte du produit */
  description?: string;
  /** Prix actuel du produit */
  price: number;
  /** Prix original (si en promotion) */
  originalPrice?: number;
  /** Note/rating du produit */
  rating?: number;
  /** Nombre d'avis */
  reviewCount?: number;
  /** SKU ou référence du produit */
  sku?: string;
  /** Couleurs disponibles */
  colors?: string[];
  /** Tailles disponibles */
  sizes?: string[];
  /** Stock disponible */
  stock?: number;
  /** Nouvelles arrivées */
  isNew?: boolean;
  /** En promotion */
  isOnSale?: boolean;
  /** Bestseller */
  isBestSeller?: boolean;
  /** Favoris */
  isFavorite?: boolean;
  /** URL de détail du produit */
  productUrl?: string;
  /** URLs d'images pour la galerie */
  galleryImages?: string[];
  /** Tags/catégories */
  tags?: string[];
  /** Actions rapides disponibles */
  quickActions?: {
    /** Ajouter au panier */
    addToCart?: {
      enabled: boolean;
      text?: string;
      onClick?: () => void;
    };
    /** Ajouter aux favoris */
    addToWishlist?: {
      enabled: boolean;
      text?: string;
      onClick?: () => void;
    };
    /** Comparaison */
    compare?: {
      enabled: boolean;
      text?: string;
      onClick?: () => void;
    };
    /** Aperçu rapide */
    quickView?: {
      enabled: boolean;
      text?: string;
      onClick?: () => void;
    };
  };
  /** Configuration des prix */
  priceConfig?: {
    showDiscount?: boolean;
    showSavings?: boolean;
    currency?: string;
    size?: PriceTagProps['size'];
    variant?: PriceTagProps['variant'];
  };
  /** Configuration de l'affichage */
  layout?: 'default' | 'compact' | 'featured' | 'minimal';
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
  /** Callback lors du changement de couleur */
  onColorChange?: (color: string) => void;
  /** Callback lors du changement de taille */
  onSizeChange?: (size: string) => void;
}

/**
 * Composant ProductCard pour afficher les informations d'un produit
 * 
 * Fonctionnalités:
 * - Affichage du produit avec image, titre, prix, rating
 * - Support des images multiples (survol)
 * - Badges (nouveau, promotion, bestseller)
 * - Actions rapides (panier, favoris, comparaison)
 * - Sélection de variantes (couleur, taille)
 * - États de stock et disponibilité
 * - Responsive et accessible
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  imageSrcHover,
  imageAlt = '',
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  sku,
  colors = [],
  sizes = [],
  stock,
  isNew = false,
  isOnSale = false,
  isBestSeller = false,
  isFavorite = false,
  productUrl,
  galleryImages = [],
  tags = [],
  quickActions = {},
  priceConfig = {},
  layout = 'default',
  className = '',
  id,
  disabled = false,
  loading = false,
  onProductClick,
  onColorChange,
  onSizeChange,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Déterminer les images à afficher
  const currentImage = isHovered && imageSrcHover ? imageSrcHover : imageSrc;
  const hasGallery = galleryImages.length > 0;
  const displayImages = hasGallery ? [imageSrc, ...galleryImages] : [imageSrc, imageSrcHover].filter(Boolean);
  const currentDisplayImage = displayImages[currentImageIndex] || imageSrc;

  // Vérifier la disponibilité
  const isOutOfStock = stock === 0;
  const isLowStock = stock && stock <= 5 && stock > 0;
  const hasDiscount = originalPrice && originalPrice > price;

  // Gestionnaires d'événements
  const handleImageNavigation = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    onSizeChange?.(size);
  };

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

  // Classes CSS
  const cardClasses = cn(
    'ng-product-card',
    `ng-product-card--${layout}`,
    {
      'ng-product-card--out-of-stock': isOutOfStock,
      'ng-product-card--low-stock': isLowStock,
      'ng-product-card--hovered': isHovered,
      'ng-product-card--disabled': disabled,
      'ng-product-card--loading': loading,
    },
    className
  );

  // Rendu des badges
  const renderBadges = () => {
    const badges = [];
    
    if (isNew) {
      badges.push(
        <span key="new" className="ng-product-card__badge ng-product-card__badge--new">
          Nouveau
        </span>
      );
    }
    
    if (hasDiscount) {
      const discountPercentage = Math.round(((originalPrice! - price) / originalPrice!) * 100);
      badges.push(
        <span key="sale" className="ng-product-card__badge ng-product-card__badge--sale">
          -{discountPercentage}%
        </span>
      );
    }
    
    if (isBestSeller) {
      badges.push(
        <span key="bestseller" className="ng-product-card__badge ng-product-card__badge--bestseller">
          Bestseller
        </span>
      );
    }
    
    if (isOutOfStock) {
      badges.push(
        <span key="out" className="ng-product-card__badge ng-product-card__badge--out-of-stock">
          Rupture
        </span>
      );
    } else if (isLowStock) {
      badges.push(
        <span key="low" className="ng-product-card__badge ng-product-card__badge--low-stock">
          Plus que {stock}
        </span>
      );
    }

    return badges.length > 0 ? (
      <div className="ng-product-card__badges">
        {badges}
      </div>
    ) : null;
  };

  // Rendu du rating
  const renderRating = () => {
    if (rating === undefined) return null;

    return (
      <div className="ng-product-card__rating" aria-label={`Note de ${rating} sur 5`}>
        <div className="ng-product-card__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`ng-product-card__star ${
                star <= rating ? 'ng-product-card__star--filled' : 'ng-product-card__star--empty'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        {reviewCount && (
          <span className="ng-product-card__review-count">
            ({reviewCount})
          </span>
        )}
      </div>
    );
  };

  // Rendu des couleurs
  const renderColors = () => {
    if (colors.length === 0) return null;

    return (
      <div className="ng-product-card__colors">
        {colors.slice(0, 6).map((color, index) => (
          <button
            key={index}
            type="button"
            className={`ng-product-card__color-swatch ${
              selectedColor === color ? 'ng-product-card__color-swatch--selected' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={handleQuickAction(() => handleColorSelect(color))}
            aria-label={`Sélectionner la couleur ${color}`}
            title={color}
          />
        ))}
        {colors.length > 6 && (
          <span className="ng-product-card__color-count">
            +{colors.length - 6}
          </span>
        )}
      </div>
    );
  };

  // Rendu des tailles
  const renderSizes = () => {
    if (sizes.length === 0) return null;

    return (
      <div className="ng-product-card__sizes">
        {sizes.slice(0, 5).map((size, index) => (
          <button
            key={index}
            type="button"
            className={`ng-product-card__size-option ${
              selectedSize === size ? 'ng-product-card__size-option--selected' : ''
            }`}
            onClick={handleQuickAction(() => handleSizeSelect(size))}
            disabled={isOutOfStock}
            aria-label={`Sélectionner la taille ${size}`}
          >
            {size}
          </button>
        ))}
        {sizes.length > 5 && (
          <span className="ng-product-card__size-count">
            +{sizes.length - 5}
          </span>
        )}
      </div>
    );
  };

  // Rendu des actions rapides
  const renderQuickActions = () => {
    const actions = [];

    if (quickActions.quickView?.enabled) {
      actions.push(
        <button
          key="quick-view"
          type="button"
          className="ng-product-card__quick-action ng-product-card__quick-action--quick-view"
          onClick={handleQuickAction(quickActions.quickView.onClick || (() => {}))}
          aria-label={quickActions.quickView.text || 'Aperçu rapide'}
          title={quickActions.quickView.text || 'Aperçu rapide'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      );
    }

    if (quickActions.addToWishlist?.enabled) {
      actions.push(
        <button
          key="wishlist"
          type="button"
          className={`ng-product-card__quick-action ng-product-card__quick-action--wishlist ${
            isFavorite ? 'ng-product-card__quick-action--active' : ''
          }`}
          onClick={handleQuickAction(quickActions.addToWishlist.onClick || (() => {}))}
          aria-label={quickActions.addToWishlist.text || 'Ajouter aux favoris'}
          title={quickActions.addToWishlist.text || 'Ajouter aux favoris'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      );
    }

    if (quickActions.compare?.enabled) {
      actions.push(
        <button
          key="compare"
          type="button"
          className="ng-product-card__quick-action ng-product-card__quick-action--compare"
          onClick={handleQuickAction(quickActions.compare.onClick || (() => {}))}
          aria-label={quickActions.compare.text || 'Comparer'}
          title={quickActions.compare.text || 'Comparer'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
          </svg>
        </button>
      );
    }

    if (quickActions.addToCart?.enabled && !isOutOfStock) {
      actions.push(
        <button
          key="add-to-cart"
          type="button"
          className="ng-product-card__quick-action ng-product-card__quick-action--add-to-cart"
          onClick={handleQuickAction(quickActions.addToCart.onClick || (() => {}))}
          aria-label={quickActions.addToCart.text || 'Ajouter au panier'}
          title={quickActions.addToCart.text || 'Ajouter au panier'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      );
    }

    return actions.length > 0 ? (
      <div className="ng-product-card__quick-actions">
        {actions}
      </div>
    ) : null;
  };

  // Rendu de l'image avec navigation
  const renderImage = () => (
    <div
      className="ng-product-card__image-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Voir les détails de ${title}`}
    >
      <img
        src={currentDisplayImage}
        alt={imageAlt || title}
        className="ng-product-card__image"
        loading="lazy"
      />
      
      {hasGallery && displayImages.length > 1 && (
        <div className="ng-product-card__image-dots">
          {displayImages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`ng-product-card__image-dot ${
                index === currentImageIndex ? 'ng-product-card__image-dot--active' : ''
              }`}
              onClick={handleQuickAction(() => handleImageNavigation(index))}
              aria-label={`Voir l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {renderBadges()}
      {renderQuickActions()}
    </div>
  );

  // Rendu du contenu
  const renderContent = () => (
    <div className="ng-product-card__content">
      {renderRating()}
      
      <h3 className="ng-product-card__title">
        <button
          type="button"
          className="ng-product-card__title-link"
          onClick={handleProductClick}
          disabled={disabled}
          aria-describedby={sku ? `ng-product-card-sku-${id}` : undefined}
        >
          {title}
        </button>
      </h3>
      
      {description && (
        <p className="ng-product-card__description">
          {description}
        </p>
      )}
      
      {sku && (
        <p className="ng-product-card__sku" id={`ng-product-card-sku-${id}`}>
          Réf: {sku}
        </p>
      )}
      
      {renderColors()}
      {renderSizes()}
      
      <div className="ng-product-card__price-container">
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
        
        {hasDiscount && priceConfig.showSavings && (
          <div className="ng-product-card__savings">
            Économisez {((originalPrice! - price)).toFixed(2)} €
          </div>
        )}
      </div>
      
      {tags.length > 0 && (
        <div className="ng-product-card__tags">
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="ng-product-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {!isOutOfStock && quickActions.addToCart?.enabled && (
        <button
          type="button"
          className="ng-product-card__add-to-cart"
          onClick={handleQuickAction(quickActions.addToCart.onClick || (() => {}))}
          disabled={disabled || loading}
        >
          {loading ? '...' : (quickActions.addToCart.text || 'Ajouter au panier')}
        </button>
      )}
    </div>
  );

  return (
    <article className={cardClasses} id={id}>
      {renderImage()}
      {renderContent()}
    </article>
  );
};

export default ProductCard;