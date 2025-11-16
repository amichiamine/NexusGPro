import React from 'react';
import { cn } from '@/utils';
import './CheckoutSummary.css';

export interface CheckoutSummaryProps {
  /** Articles dans le panier */
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    sku?: string;
  }[];
  /** Sous-total des articles */
  subtotal: number;
  /** Frais de livraison */
  shipping?: number;
  /** Taxes */
  taxes?: number;
  /** Code promo appliqué */
  promoCode?: string;
  /** Réduction du code promo */
  promoDiscount?: number;
  /** Total final */
  total: number;
  /** Devise */
  currency?: string;
  /** Livraison gratuite */
  freeShippingThreshold?: number;
  /** Étape actuelle du checkout */
  currentStep?: 'information' | 'livraison' | 'paiement' | 'confirmation';
  /** Méthode de livraison sélectionnée */
  shippingMethod?: string;
  /** Méthode de paiement sélectionnée */
  paymentMethod?: string;
  /** Bouton d'action principal */
  actionButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  /** Actions secondaires */
  secondaryActions?: {
    text: string;
    onClick: () => void;
    variant?: 'link' | 'button';
  }[];
  /** Callback pour appliquer un code promo */
  onApplyPromoCode?: (code: string) => void;
  /** Callback pour retirer un code promo */
  onRemovePromoCode?: () => void;
  /** Callback pour changer la méthode de livraison */
  onChangeShipping?: () => void;
  /** Callback pour changer la méthode de paiement */
  onChangePayment?: () => void;
  /** Classe CSS personnalisée */
  className?: string;
  /** ID du composant */
  id?: string;
}

/**
 * Composant CheckoutSummary pour afficher le résumé de commande
 * 
 * Fonctionnalités:
 * - Résumé des articles avec quantités et prix
 * - Calcul automatique des totaux (sous-total, livraison, taxes)
 * - Support des codes promo
 * - Affichage de l'étape actuelle du processus
 * - Actions pour modifier livraison/paiement
 * - Validation et recommandations (livraison gratuite)
 */
export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  items,
  subtotal,
  shipping = 0,
  taxes = 0,
  promoCode,
  promoDiscount = 0,
  total,
  currency = '€',
  freeShippingThreshold,
  currentStep = 'information',
  shippingMethod,
  paymentMethod,
  actionButton,
  secondaryActions = [],
  onApplyPromoCode,
  onRemovePromoCode,
  onChangeShipping,
  onChangePayment,
  className = '',
  id,
}) => {
  const [promoCodeInput, setPromoCodeInput] = React.useState('');
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);
  const [promoError, setPromoError] = React.useState('');

  // Calculer la distance pour la livraison gratuite
  const freeShippingDistance = freeShippingThreshold ? Math.max(0, freeShippingThreshold - subtotal) : null;
  const hasFreeShipping = shipping === 0;

  // Étapes du processus
  const steps = [
    { key: 'information', label: 'Informations', completed: false },
    { key: 'livraison', label: 'Livraison', completed: false },
    { key: 'paiement', label: 'Paiement', completed: false },
    { key: 'confirmation', label: 'Confirmation', completed: false },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Gérer l'application d'un code promo
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    setIsApplyingPromo(true);
    setPromoError('');
    
    try {
      await onApplyPromoCode?.(promoCodeInput.trim());
      setPromoCodeInput('');
    } catch (error) {
      setPromoError('Code promo invalide');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Formater le prix
  const formatPrice = (price: number) => `${price.toFixed(2)} ${currency}`;

  // Rendu des étapes
  const renderSteps = () => (
    <div className="ng-checkout-summary__steps">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`ng-checkout-summary__step ${
            index < completedSteps
              ? 'ng-checkout-summary__step--completed'
              : index === completedSteps
              ? 'ng-checkout-summary__step--current'
              : 'ng-checkout-summary__step--pending'
          }`}
        >
          <div className="ng-checkout-summary__step-icon">
            {index < completedSteps ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            ) : (
              <span className="ng-checkout-summary__step-number">{index + 1}</span>
            )}
          </div>
          <span className="ng-checkout-summary__step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );

  // Rendu des articles
  const renderItems = () => (
    <div className="ng-checkout-summary__items">
      <h3 className="ng-checkout-summary__items-title">
        Articles ({items.reduce((sum, item) => sum + item.quantity, 0)})
      </h3>
      <div className="ng-checkout-summary__items-list">
        {items.map((item) => (
          <div key={item.id} className="ng-checkout-summary__item">
            <div className="ng-checkout-summary__item-image">
              {item.image ? (
                <img src={item.image} alt={item.name} loading="lazy" />
              ) : (
                <div className="ng-checkout-summary__item-image-placeholder" />
              )}
            </div>
            <div className="ng-checkout-summary__item-details">
              <h4 className="ng-checkout-summary__item-name">{item.name}</h4>
              {item.sku && (
                <p className="ng-checkout-summary__item-sku">Réf: {item.sku}</p>
              )}
              <div className="ng-checkout-summary__item-meta">
                <span className="ng-checkout-summary__item-quantity">
                  Qté: {item.quantity}
                </span>
                <span className="ng-checkout-summary__item-price">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
            <div className="ng-checkout-summary__item-total">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu des méthodes de livraison et paiement
  const renderMethods = () => (
    <div className="ng-checkout-summary__methods">
      {shippingMethod && (
        <div className="ng-checkout-summary__method">
          <label className="ng-checkout-summary__method-label">Livraison:</label>
          <div className="ng-checkout-summary__method-content">
            <span>{shippingMethod}</span>
            <button
              type="button"
              className="ng-checkout-summary__method-change"
              onClick={onChangeShipping}
              aria-label="Changer la méthode de livraison"
            >
              Modifier
            </button>
          </div>
        </div>
      )}
      
      {paymentMethod && (
        <div className="ng-checkout-summary__method">
          <label className="ng-checkout-summary__method-label">Paiement:</label>
          <div className="ng-checkout-summary__method-content">
            <span>{paymentMethod}</span>
            <button
              type="button"
              className="ng-checkout-summary__method-change"
              onClick={onChangePayment}
              aria-label="Changer la méthode de paiement"
            >
              Modifier
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Rendu du calcul des totaux
  const renderTotals = () => (
    <div className="ng-checkout-summary__totals">
      <div className="ng-checkout-summary__total-line">
        <span>Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      
      {shipping > 0 && (
        <div className="ng-checkout-summary__total-line">
          <span>Livraison</span>
          <span>{formatPrice(shipping)}</span>
        </div>
      )}
      
      {hasFreeShipping && (
        <div className="ng-checkout-summary__total-line ng-checkout-summary__total-line--highlight">
          <span>Livraison</span>
          <span className="ng-checkout-summary__free-shipping">GRATUITE</span>
        </div>
      )}
      
      {taxes > 0 && (
        <div className="ng-checkout-summary__total-line">
          <span>Taxes</span>
          <span>{formatPrice(taxes)}</span>
        </div>
      )}
      
      {promoDiscount > 0 && (
        <div className="ng-checkout-summary__total-line ng-checkout-summary__total-line--discount">
          <span>Code promo ({promoCode})</span>
          <span>-{formatPrice(promoDiscount)}</span>
        </div>
      )}
      
      <div className="ng-checkout-summary__total-line ng-checkout-summary__total-line--final">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );

  // Rendu des codes promo
  const renderPromoCode = () => (
    <div className="ng-checkout-summary__promo-code">
      {!promoCode ? (
        <div className="ng-checkout-summary__promo-input">
          <input
            type="text"
            placeholder="Code promo"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value)}
            className="ng-checkout-summary__promo-input-field"
            disabled={isApplyingPromo}
            aria-label="Code promo"
          />
          <button
            type="button"
            className="ng-checkout-summary__promo-apply"
            onClick={handleApplyPromoCode}
            disabled={!promoCodeInput.trim() || isApplyingPromo}
            aria-label="Appliquer le code promo"
          >
            {isApplyingPromo ? '...' : 'Appliquer'}
          </button>
          {promoError && (
            <p className="ng-checkout-summary__promo-error" role="alert">
              {promoError}
            </p>
          )}
        </div>
      ) : (
        <div className="ng-checkout-summary__promo-applied">
          <span className="ng-checkout-summary__promo-code-text">
            Code appliqué: <strong>{promoCode}</strong>
          </span>
          <button
            type="button"
            className="ng-checkout-summary__promo-remove"
            onClick={onRemovePromoCode}
            aria-label="Retirer le code promo"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );

  // Rendu de la recommandation de livraison gratuite
  const renderFreeShippingRecommendation = () => {
    if (!freeShippingThreshold || hasFreeShipping || !freeShippingDistance) return null;

    return (
      <div className="ng-checkout-summary__free-shipping-promotion">
        <div className="ng-checkout-summary__promotion-content">
          <svg className="ng-checkout-summary__promotion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path>
            <circle cx="12" cy="12" r="3.2"></circle>
            <path d="M9 8h6v2H9z"></path>
          </svg>
          <div className="ng-checkout-summary__promotion-text">
            <p className="ng-checkout-summary__promotion-title">
              Profitez de la livraison gratuite !
            </p>
            <p className="ng-checkout-summary__promotion-message">
              Ajoutez {formatPrice(freeShippingDistance)} pour bénéficier de la livraison gratuite
            </p>
          </div>
        </div>
        <button
          type="button"
          className="ng-checkout-summary__promotion-action"
          onClick={() => onApplyPromoCode?.('FREESHIP')}
          disabled={isApplyingPromo}
        >
          Appliquer
        </button>
      </div>
    );
  };

  return (
    <aside 
      className={cn('ng-checkout-summary', className)}
      id={id}
      role="complementary"
      aria-label="Résumé de commande"
    >
      <div className="ng-checkout-summary__container">
        {/* Étapes du processus */}
        {renderSteps()}
        
        {/* Articles */}
        {renderItems()}
        
        {/* Méthodes de livraison et paiement */}
        {renderMethods()}
        
        {/* Recommandation livraison gratuite */}
        {renderFreeShippingRecommendation()}
        
        {/* Codes promo */}
        {renderPromoCode()}
        
        {/* Totaux */}
        {renderTotals()}
        
        {/* Actions */}
        {(actionButton || secondaryActions.length > 0) && (
          <div className="ng-checkout-summary__actions">
            {actionButton && (
              <button
                type="button"
                className="ng-checkout-summary__primary-action"
                onClick={actionButton.onClick}
                disabled={actionButton.disabled || actionButton.loading}
                aria-busy={actionButton.loading}
              >
                {actionButton.loading && (
                  <svg className="ng-checkout-summary__loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.25"/>
                    <path d="M12 1v6m0 6v6m-6-12h6m-6 6h6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {actionButton.text}
              </button>
            )}
            
            {secondaryActions.map((action, index) => (
              <button
                key={index}
                type="button"
                className={`ng-checkout-summary__secondary-action ng-checkout-summary__secondary-action--${action.variant || 'button'}`}
                onClick={action.onClick}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default CheckoutSummary;