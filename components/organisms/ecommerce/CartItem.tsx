import React, { useState } from 'react';
import { cn } from '@/utils';
import './CartItem.css';

export interface CartItemProps {
  /** URL de l'image du produit */
  imageSrc: string;
  /** Texte alternatif pour l'image */
  imageAlt?: string;
  /** Nom du produit */
  title: string;
  /** Description courte du produit */
  description?: string;
  /** Prix actuel du produit */
  price: number;
  /** Prix barré (si en promotion) */
  originalPrice?: number;
  /** SKU ou référence du produit */
  sku?: string;
  /** Quantité actuelle dans le panier */
  quantity: number;
  /** Stock disponible */
  stock?: number;
  /** Variante du produit sélectionnée */
  variant?: string;
  /** Optionnel : URL de détail du produit */
  productUrl?: string;
  /** Optionnel : URL d'image alternative */
  imageSrcSet?: string;
  /** Tailles disponibles */
  availableSizes?: string[];
  /** Couleurs disponibles */
  availableColors?: string[];
  /** État de désactivation */
  disabled?: boolean;
  /** État de chargement */
  loading?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** ID du composant */
  id?: string;
  /** Callback lors du changement de quantité */
  onQuantityChange?: (quantity: number) => void;
  /** Callback lors de la suppression */
  onRemove?: () => void;
  /** Callback lors du clic sur le produit */
  onProductClick?: () => void;
  /** Callback lors du changement de variante */
  onVariantChange?: (variant: string) => void;
  /** Callback lors du clic sur "Ajouter aux favoris" */
  onAddToWishlist?: () => void;
  /** Callback lors de l'ajout au panier */
  onAddToCart?: () => void;
}

/**
 * Composant CartItem pour afficher un élément du panier d'achat
 * 
 * Fonctionnalités:
 * - Affichage du produit avec image, nom, description, prix
 * - Gestion de la quantité avec incrémentation/décrémentation
 * - Support des promotions (prix barré)
 * - Gestion des variantes (taille, couleur)
 * - Actions : suppression, ajout aux favoris
 * - Responsive design et accessibility
 */
export const CartItem: React.FC<CartItemProps> = ({
  imageSrc,
  imageAlt = '',
  title,
  description,
  price,
  originalPrice,
  sku,
  quantity,
  stock,
  variant,
  productUrl,
  imageSrcSet,
  availableSizes,
  availableColors,
  disabled = false,
  loading = false,
  className = '',
  id,
  onQuantityChange,
  onRemove,
  onProductClick,
  onVariantChange,
  onAddToWishlist,
  onAddToCart,
}) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [currentVariant, setCurrentVariant] = useState(variant || '');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  // Calculer le prix total pour cet article
  const totalPrice = currentQuantity * price;

  // Vérifier si l'article est en promotion
  const isOnSale = originalPrice && originalPrice > price;
  const discountPercentage = isOnSale ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0;

  // Gérer le changement de quantité
  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, stock || 999));
    setCurrentQuantity(clampedQuantity);
    onQuantityChange?.(clampedQuantity);
  };

  // Gérer le changement de variante
  const handleVariantChange = (newVariant: string) => {
    setCurrentVariant(newVariant);
    onVariantChange?.(newVariant);
  };

  // Gérer le clic sur l'image/produit
  const handleProductClick = () => {
    if (productUrl && !disabled) {
      window.open(productUrl, '_blank');
    }
    onProductClick?.();
  };

  // Rendre le sélecteur de quantité
  const renderQuantitySelector = () => (
    <div className="ng-cart-item__quantity-selector">
      <button
        type="button"
        className="ng-cart-item__quantity-btn ng-cart-item__quantity-btn--decrease"
        onClick={() => handleQuantityChange(currentQuantity - 1)}
        disabled={disabled || currentQuantity <= 1 || loading}
        aria-label="Diminuer la quantité"
      >
        −
      </button>
      
      <input
        type="number"
        className="ng-cart-item__quantity-input"
        value={currentQuantity}
        min="1"
        max={stock}
        disabled={disabled || loading}
        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
        aria-label={`Quantité pour ${title}`}
      />
      
      <button
        type="button"
        className="ng-cart-item__quantity-btn ng-cart-item__quantity-btn--increase"
        onClick={() => handleQuantityChange(currentQuantity + 1)}
        disabled={disabled || (stock !== undefined && currentQuantity >= stock) || loading}
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  );

  // Rendre les informations de stock
  const renderStockInfo = () => {
    if (stock === undefined) return null;
    
    const isLowStock = stock <= 5;
    const isOutOfStock = stock === 0;
    
    return (
      <div className={`ng-cart-item__stock ${isLowStock ? 'ng-cart-item__stock--low' : ''} ${isOutOfStock ? 'ng-cart-item__stock--out' : ''}`}>
        {isOutOfStock ? 'Rupture de stock' : isLowStock ? `Plus que ${stock} en stock` : `${stock} en stock`}
      </div>
    );
  };

  // Rendre le sélecteur de variantes
  const renderVariantSelector = () => {
    if (!showVariantSelector || (!availableSizes?.length && !availableColors?.length)) {
      return null;
    }

    return (
      <div className="ng-cart-item__variant-selector">
        {availableSizes && availableSizes.length > 0 && (
          <div className="ng-cart-item__variant-group">
            <label className="ng-cart-item__variant-label">Taille:</label>
            <select
              className="ng-cart-item__variant-select"
              value={currentVariant}
              onChange={(e) => handleVariantChange(e.target.value)}
              disabled={disabled || loading}
            >
              <option value="">Choisir une taille</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        {availableColors && availableColors.length > 0 && (
          <div className="ng-cart-item__variant-group">
            <label className="ng-cart-item__variant-label">Couleur:</label>
            <div className="ng-cart-item__color-swatches">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`ng-cart-item__color-swatch ${currentVariant === color ? 'ng-cart-item__color-swatch--active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleVariantChange(color)}
                  disabled={disabled || loading}
                  aria-label={`Couleur ${color}`}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <article 
      className={cn(
        'ng-cart-item',
        {
          'ng-cart-item--disabled': disabled,
          'ng-cart-item--loading': loading,
        },
        className
      )}
      id={id}
    >
      {/* Image du produit */}
      <div className="ng-cart-item__image-container" onClick={handleProductClick} role="button" tabIndex={disabled ? -1 : 0}>
        <img
          src={imageSrc}
          alt={imageAlt || title}
          className={`ng-cart-item__image ${!isImageLoaded ? 'ng-cart-item__image--loading' : ''}`}
          srcSet={imageSrcSet}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />
        {!isImageLoaded && (
          <div className="ng-cart-item__image-placeholder">
            <div className="ng-cart-item__image-placeholder-icon" />
          </div>
        )}
        {isOnSale && (
          <div className="ng-cart-item__sale-badge">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Contenu du produit */}
      <div className="ng-cart-item__content">
        {/* En-tête du produit */}
        <div className="ng-cart-item__header">
          <div className="ng-cart-item__titles">
            <h3 className="ng-cart-item__title">
              <button
                type="button"
                className="ng-cart-item__title-link"
                onClick={handleProductClick}
                disabled={disabled || !productUrl}
                aria-describedby={sku ? `ng-cart-item-sku-${id}` : undefined}
              >
                {title}
              </button>
            </h3>
            {description && (
              <p className="ng-cart-item__description">{description}</p>
            )}
          </div>
          
          {/* SKU */}
          {sku && (
            <div className="ng-cart-item__sku" id={`ng-cart-item-sku-${id}`}>
              Réf: {sku}
            </div>
          )}
        </div>

        {/* Informations de prix */}
        <div className="ng-cart-item__pricing">
          <div className="ng-cart-item__prices">
            <span className="ng-cart-item__current-price">
              {price.toFixed(2)} €
            </span>
            {isOnSale && (
              <span className="ng-cart-item__original-price">
                {originalPrice!.toFixed(2)} €
              </span>
            )}
            {isOnSale && (
              <span className="ng-cart-item__discount">
                Économisez {((originalPrice! - price) * currentQuantity).toFixed(2)} €
              </span>
            )}
          </div>
          
          <div className="ng-cart-item__total-price">
            Total: <strong>{totalPrice.toFixed(2)} €</strong>
          </div>
        </div>

        {/* Variantes */}
        {(availableSizes?.length || availableColors?.length) && (
          <div className="ng-cart-item__variants">
            <button
              type="button"
              className="ng-cart-item__variant-toggle"
              onClick={() => setShowVariantSelector(!showVariantSelector)}
              disabled={disabled || loading}
              aria-expanded={showVariantSelector}
              aria-controls={`ng-cart-item-variants-${id}`}
            >
              Changer les options
            </button>
            <div 
              id={`ng-cart-item-variants-${id}`}
              className="ng-cart-item__variants-content"
            >
              {renderVariantSelector()}
            </div>
          </div>
        )}

        {/* Stock info */}
        {renderStockInfo()}

        {/* Actions */}
        <div className="ng-cart-item__actions">
          {/* Sélecteur de quantité */}
          {renderQuantitySelector()}
          
          {/* Boutons d'action */}
          <div className="ng-cart-item__action-buttons">
            <button
              type="button"
              className="ng-cart-item__action-btn ng-cart-item__action-btn--wishlist"
              onClick={onAddToWishlist}
              disabled={disabled || loading}
              aria-label="Ajouter aux favoris"
            >
              <svg className="ng-cart-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            
            <button
              type="button"
              className="ng-cart-item__action-btn ng-cart-item__action-btn--duplicate"
              onClick={onAddToCart}
              disabled={disabled || loading}
              aria-label="Ajouter au panier"
            >
              <svg className="ng-cart-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
            
            <button
              type="button"
              className="ng-cart-item__action-btn ng-cart-item__action-btn--remove"
              onClick={onRemove}
              disabled={disabled || loading}
              aria-label="Supprimer du panier"
            >
              <svg className="ng-cart-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;