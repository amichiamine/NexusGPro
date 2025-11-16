import React from 'react';
import { cn } from '@/utils';
import './PriceTag.css';

export interface PriceTagProps {
  /** Prix principal (prix de vente) */
  price: number;
  /** Prix original (barré si en promotion) */
  originalPrice?: number;
  /** Devise */
  currency?: string;
  /** Taille du prix */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Style de prix */
  variant?: 'default' | 'sale' | 'discount' | 'free' | 'compare';
  /** Afficher le pourcentage de réduction */
  showDiscount?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** ID du composant */
  id?: string;
  /** Position d'ancrage pour le positionnement */
  anchor?: 'start' | 'center' | 'end';
  /** Couleur personnalisée */
  color?: string;
  /** Style du texte (normal, bold, light) */
  weight?: 'normal' | 'bold' | 'light';
  /** Afficher le symbole de devise */
  showCurrency?: boolean;
  /** Nombre de décimales à afficher */
  decimals?: number;
  /** Texte alternatif pour l'accessibilité */
  ariaLabel?: string;
  /** État de désactivation */
  disabled?: boolean;
  /** État de chargement */
  loading?: boolean;
  /** Animation du prix */
  animate?: boolean;
  /** Direction de l'animation */
  animationDirection?: 'up' | 'down' | 'bounce';
}

/**
 * Composant PriceTag pour afficher les prix avec gestion des promotions
 * 
 * Fonctionnalités:
 * - Prix principal avec gestion des décimales
 * - Prix barré pour les promotions
 * - Calcul et affichage automatique des réductions
 * - Tailles et variantes prédéfinies
 * - Support des devises personnalisées
 * - Animations et états de chargement
 * - Accessibilité complète
 */
export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  originalPrice,
  currency = '€',
  size = 'md',
  variant = 'default',
  showDiscount = false,
  className = '',
  id,
  anchor = 'start',
  color,
  weight = 'normal',
  showCurrency = true,
  decimals = 2,
  ariaLabel,
  disabled = false,
  loading = false,
  animate = false,
  animationDirection = 'up',
}) => {
  // Calculer la réduction
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const discountAmount = hasDiscount ? originalPrice - price : 0;

  // Formater le prix
  const formatPrice = (value: number) => {
    const formatted = value.toFixed(decimals);
    return showCurrency ? `${formatted} ${currency}` : formatted;
  };

  // Classes CSS dynamiques
  const priceClasses = cn(
    'ng-price-tag',
    `ng-price-tag--${size}`,
    `ng-price-tag--${variant}`,
    `ng-price-tag--${anchor}`,
    `ng-price-tag--${weight}`,
    {
      'ng-price-tag--disabled': disabled,
      'ng-price-tag--loading': loading,
    },
    animate && `ng-price-tag--animate ng-price-tag--animate-${animationDirection}`,
    className
  );

  // Style personnalisé
  const customStyle: React.CSSProperties = {};
  if (color) {
    customStyle.color = color;
  }

  // Texte d'accessibilité
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    const baseLabel = `Prix ${formatPrice(price)}`;
    if (hasDiscount) {
      const discountLabel = `Prix réduit de ${formatPrice(originalPrice)} à ${formatPrice(price)} (${discountPercentage}% de réduction)`;
      return `${baseLabel}. ${discountLabel}`;
    }
    
    return baseLabel;
  };

  // Rendu du prix principal
  const renderMainPrice = () => (
    <span className="ng-price-tag__value" aria-hidden="true">
      {loading ? '...' : formatPrice(price)}
    </span>
  );

  // Rendu du prix original (barré)
  const renderOriginalPrice = () => {
    if (!originalPrice || !hasDiscount) return null;
    
    return (
      <span className="ng-price-tag__original" aria-hidden="true">
        {formatPrice(originalPrice)}
      </span>
    );
  };

  // Rendu de la réduction
  const renderDiscount = () => {
    if (!hasDiscount || (!showDiscount && discountPercentage === 0)) return null;
    
    return (
      <span className="ng-price-tag__discount" aria-label={`Réduction de ${discountPercentage}%`}>
        -{discountPercentage}%
      </span>
    );
  };

  // Rendu du montant de l'économie
  const renderSavings = () => {
    if (!hasDiscount || discountAmount === 0) return null;
    
    return (
      <span className="ng-price-tag__savings" aria-label={`Économisez ${formatPrice(discountAmount)}`}>
        Économisez {formatPrice(discountAmount)}
      </span>
    );
  };

  // Rendu du cas spécial "gratuit"
  if (variant === 'free' || price === 0) {
    return (
      <div
        className={priceClasses}
        id={id}
        style={customStyle}
        aria-label={getAriaLabel()}
        role="text"
      >
        <span className="ng-price-tag__free-text">
          {loading ? '...' : 'Gratuit'}
        </span>
      </div>
    );
  }

  // Rendu avec prix original (promotion)
  if (hasDiscount) {
    return (
      <div
        className={priceClasses}
        id={id}
        style={customStyle}
        aria-label={getAriaLabel()}
        role="text"
      >
        {renderOriginalPrice()}
        {renderMainPrice()}
        {renderDiscount()}
        {renderSavings()}
      </div>
    );
  }

  // Rendu prix normal
  return (
    <div
      className={priceClasses}
      id={id}
      style={customStyle}
      aria-label={getAriaLabel()}
      role="text"
    >
      {renderMainPrice()}
    </div>
  );
};

export default PriceTag;