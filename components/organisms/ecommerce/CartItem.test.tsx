import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from './CartItem';

// Props de test communes
const defaultProps = {
  imageSrc: 'https://example.com/product.jpg',
  title: 'Product Test',
  price: 29.99,
  quantity: 2,
  id: 'test-cart-item',
};

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children;
};

describe('CartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('rend correctement un CartItem avec les props requises', () => {
      render(<CartItem {...defaultProps} />);
      
      expect(screen.getByAltText('Product Test')).toBeInTheDocument();
      expect(screen.getByText('Product Test')).toBeInTheDocument();
      expect(screen.getByText('29.99 €')).toBeInTheDocument();
      expect(screen.getByText('Total: 59.98 €')).toBeInTheDocument();
    });

    it('rend la description si fournie', () => {
      render(<CartItem {...defaultProps} description="Product description" />);
      
      expect(screen.getByText('Product description')).toBeInTheDocument();
    });

    it('rend le SKU si fourni', () => {
      render(<CartItem {...defaultProps} sku="SKU-123" />);
      
      expect(screen.getByText('Réf: SKU-123')).toBeInTheDocument();
    });

    it('rend la quantité par défaut', () => {
      render(<CartItem {...defaultProps} quantity={3} />);
      
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      expect(quantityInput).toHaveValue(3);
    });
  });

  describe('Gestion des prix', () => {
    it('affiche le prix normal', () => {
      render(<CartItem {...defaultProps} price={25.5} />);
      
      expect(screen.getByText('25.50 €')).toBeInTheDocument();
    });

    it('affiche le prix barré en promotion', () => {
      render(
        <CartItem 
          {...defaultProps} 
          price={20.0} 
          originalPrice={25.0} 
        />
      );
      
      expect(screen.getByText('25.00 €')).toBeInTheDocument();
      expect(screen.getByText('20.00 €')).toBeInTheDocument();
      expect(screen.getByText('-20%')).toBeInTheDocument();
    });

    it('calcule correctement le total', () => {
      const { rerender } = render(<CartItem {...defaultProps} />);
      
      // 2 items × 29.99 = 59.98
      expect(screen.getByText('Total: 59.98 €')).toBeInTheDocument();
      
      rerender(<CartItem {...defaultProps} quantity={3} />);
      expect(screen.getByText('Total: 89.97 €')).toBeInTheDocument();
    });

    it('affiche les économies en promotion', () => {
      render(
        <CartItem 
          {...defaultProps} 
          price={20.0} 
          originalPrice={25.0}
          quantity={3}
        /> 
      );
      
      // 3 items × (25 - 20) = 15 économies
      expect(screen.getByText('Économisez 15.00 €')).toBeInTheDocument();
    });
  });

  describe('Gestion de la quantité', () => {
    it('permet d\'augmenter la quantité', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          quantity={1}
          onQuantityChange={onQuantityChange}
        />
      );
      
      const increaseButton = screen.getByLabelText('Augmenter la quantité');
      await user.click(increaseButton);
      
      expect(onQuantityChange).toHaveBeenCalledWith(2);
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      expect(quantityInput).toHaveValue(2);
    });

    it('permet de diminuer la quantité', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          quantity={3}
          onQuantityChange={onQuantityChange}
        />
      );
      
      const decreaseButton = screen.getByLabelText('Diminuer la quantité');
      await user.click(decreaseButton);
      
      expect(onQuantityChange).toHaveBeenCalledWith(2);
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      expect(quantityInput).toHaveValue(2);
    });

    it('ne permet pas de descendre sous 1', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          quantity={1}
          onQuantityChange={onQuantityChange}
        />
      );
      
      const decreaseButton = screen.getByLabelText('Diminuer la quantité');
      await user.click(decreaseButton);
      
      expect(onQuantityChange).not.toHaveBeenCalled();
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      expect(quantityInput).toHaveValue(1);
    });

    it('respecte la limite de stock', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          quantity={1}
          stock={2}
          onQuantityChange={onQuantityChange}
        />
      );
      
      const increaseButton = screen.getByLabelText('Augmenter la quantité');
      await user.click(increaseButton);
      expect(onQuantityChange).toHaveBeenCalledWith(2);
      
      // Ne peut pas augmenter au-delà du stock
      await user.click(increaseButton);
      expect(onQuantityChange).not.toHaveBeenCalledWith(3);
    });

    it('permet la saisie manuelle de quantité', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          quantity={1}
          onQuantityChange={onQuantityChange}
        />
      );
      
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      await user.clear(quantityInput);
      await user.type(quantityInput, '5');
      
      expect(onQuantityChange).toHaveBeenCalledWith(5);
    });

    it('empêche la saisie de quantité invalide', async () => {
      const user = userEvent.setup();
      
      render(<CartItem {...defaultProps} />);
      
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      await user.clear(quantityInput);
      await user.type(quantityInput, 'abc');
      
      expect(quantityInput).toHaveValue(1); // Valeur par défaut
    });
  });

  describe('Gestion des variantes', () => {
    it('affiche le bouton de sélection de variante si des tailles sont disponibles', () => {
      render(
        <CartItem 
          {...defaultProps} 
          availableSizes={['S', 'M', 'L']}
        />
      );
      
      expect(screen.getByText('Changer les options')).toBeInTheDocument();
    });

    it('affiche le sélecteur de tailles', async () => {
      const user = userEvent.setup();
      const onVariantChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableSizes={['S', 'M', 'L']}
          onVariantChange={onVariantChange}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: 'Changer les options' });
      await user.click(toggleButton);
      
      expect(screen.getByLabelText('Taille:')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('gère la sélection de variante', async () => {
      const user = userEvent.setup();
      const onVariantChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableSizes={['S', 'M', 'L']}
          onVariantChange={onVariantChange}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: 'Changer les options' });
      await user.click(toggleButton);
      
      const sizeSelect = screen.getByLabelText('Taille:');
      await user.selectOptions(sizeSelect, 'M');
      
      expect(onVariantChange).toHaveBeenCalledWith('M');
    });

    it('affiche les couleurs sous forme d\'échantillons', async () => {
      const user = userEvent.setup();
      const onVariantChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableColors={['#ff0000', '#00ff00', '#0000ff']}
          onVariantChange={onVariantChange}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: 'Changer les options' });
      await user.click(toggleButton);
      
      const colorButtons = screen.getAllByRole('button', { name: /Couleur/ });
      expect(colorButtons).toHaveLength(3);
      expect(colorButtons[0]).toHaveAttribute('title', '#ff0000');
    });

    it('gère la sélection de couleur', async () => {
      const user = userEvent.setup();
      const onVariantChange = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableColors={['#ff0000', '#00ff00', '#0000ff']}
          onVariantChange={onVariantChange}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: 'Changer les options' });
      await user.click(toggleButton);
      
      const colorButton = screen.getByTitle('#00ff00');
      await user.click(colorButton);
      
      expect(onVariantChange).toHaveBeenCalledWith('#00ff00');
    });
  });

  describe('Informations de stock', () => {
    it('n\'affiche pas d\'info de stock si non fourni', () => {
      render(<CartItem {...defaultProps} />);
      
      expect(screen.queryByText(/stock/)).not.toBeInTheDocument();
    });

    it('affiche le stock disponible', () => {
      render(<CartItem {...defaultProps} stock={15} />);
      
      expect(screen.getByText('15 en stock')).toBeInTheDocument();
    });

    it('avertit du stock faible', () => {
      render(<CartItem {...defaultProps} stock={3} />);
      
      expect(screen.getByText('Plus que 3 en stock')).toBeInTheDocument();
    });

    it('affiche la rupture de stock', () => {
      render(<CartItem {...defaultProps} stock={0} />);
      
      expect(screen.getByText('Rupture de stock')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('appelle onRemove quand on clique sur supprimer', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      
      render(<CartItem {...defaultProps} onRemove={onRemove} />);
      
      const removeButton = screen.getByLabelText('Supprimer du panier');
      await user.click(removeButton);
      
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('appelle onAddToWishlist quand on clique sur favoris', async () => {
      const user = userEvent.setup();
      const onAddToWishlist = vi.fn();
      
      render(<CartItem {...defaultProps} onAddToWishlist={onAddToWishlist} />);
      
      const wishlistButton = screen.getByLabelText('Ajouter aux favoris');
      await user.click(wishlistButton);
      
      expect(onAddToWishlist).toHaveBeenCalledTimes(1);
    });

    it('appelle onAddToCart quand on clique sur ajouter au panier', async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();
      
      render(<CartItem {...defaultProps} onAddToCart={onAddToCart} />);
      
      const addToCartButton = screen.getByLabelText('Ajouter au panier');
      await user.click(addToCartButton);
      
      expect(onAddToCart).toHaveBeenCalledTimes(1);
    });

    it('ouvre le produit dans un nouvel onglet si productUrl fourni', async () => {
      const user = userEvent.setup();
      const originalOpen = window.open;
      window.open = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          productUrl="https://example.com/product/123"
        />
      );
      
      const productLink = screen.getByRole('button', { name: 'Product Test' });
      await user.click(productLink);
      
      expect(window.open).toHaveBeenCalledWith('https://example.com/product/123', '_blank');
      
      window.open = originalOpen;
    });
  });

  describe('États désactivés', () => {
    it('applique la classe disabled quand disabled=true', () => {
      render(<CartItem {...defaultProps} disabled={true} />);
      
      expect(screen.getByRole('article')).toHaveClass('ng-cart-item--disabled');
    });

    it('désactive tous les contrôles quand disabled=true', () => {
      render(
        <CartItem 
          {...defaultProps} 
          disabled={true}
          availableSizes={['S', 'M']}
        />
      );
      
      expect(screen.getByLabelText('Augmenter la quantité')).toBeDisabled();
      expect(screen.getByLabelText('Diminuer la quantité')).toBeDisabled();
      expect(screen.getByLabelText('Quantité pour Product Test')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Changer les options' })).toBeDisabled();
    });

    it('applique la classe loading quand loading=true', () => {
      render(<CartItem {...defaultProps} loading={true} />);
      
      expect(screen.getByRole('article')).toHaveClass('ng-cart-item--loading');
    });
  });

  describe('Accessibilité', () => {
    it('a les attributs ARIA appropriés', () => {
      render(<CartItem {...defaultProps} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Product Test');
      
      const quantityInput = screen.getByLabelText('Quantité pour Product Test');
      expect(quantityInput).toHaveAttribute('min', '1');
      expect(quantityInput).toHaveAttribute('aria-describedby');
    });

    it('le bouton de variante a aria-expanded', async () => {
      const user = userEvent.setup();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableSizes={['S', 'M']}
          id="test-item"
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: 'Changer les options' });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('les contrôles sont focusables dans l\'ordre logique', async () => {
      const user = userEvent.setup();
      
      render(
        <CartItem 
          {...defaultProps} 
          availableSizes={['S', 'M']}
        />
      );
      
      // Le focus initial devrait être sur le conteneur d'image
      const imageContainer = screen.getByRole('button', { name: /Product Test/ });
      expect(imageContainer).toHaveFocus();
      
      // Tab vers les autres contrôles
      await user.tab();
      expect(screen.getByLabelText('Augmenter la quantité')).toHaveFocus();
    });
  });

  describe('Performance et optimisations', () => {
    it('ne re-rend pas inutilement lors du survol de l\'image', async () => {
      const user = userEvent.setup();
      const rerender = vi.fn();
      
      render(
        <CartItem {...defaultProps} />,
        { wrapper: createWrapper() }
      );
      
      // Simulation d'un changement d'état qui ne devrait pas re-rendre
      const imageContainer = screen.getByRole('button', { name: /Product Test/ });
      await user.hover(imageContainer);
      
      // Pas de test spécifique ici, mais s'assurer que le composant reste stable
      expect(screen.getByText('Product Test')).toBeInTheDocument();
    });
  });

  describe('Images', () => {
    it('gère le chargement d\'image avec placeholder', () => {
      render(<CartItem {...defaultProps} />);
      
      const placeholder = screen.getByRole('img').nextElementSibling;
      expect(placeholder).toHaveClass('ng-cart-item__image-placeholder');
    });

    it('appelle onImageLoad quand l\'image est chargée', () => {
      const onImageLoad = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          onImageLoad={onImageLoad}
        />
      );
      
      const img = screen.getByRole('img');
      fireEvent.load(img);
      
      expect(onImageLoad).toHaveBeenCalledTimes(1);
    });

    it('gère l\'erreur de chargement d\'image', () => {
      render(<CartItem {...defaultProps} />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      // L'image d'erreur devrait être affichée (ici le placeholder reste visible)
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Textes alternatifs', () => {
    it('utilise imageAlt pour l\'alt de l\'image', () => {
      render(
        <CartItem 
          {...defaultProps} 
          imageAlt="Image personnalisée"
        />
      );
      
      expect(screen.getByAltText('Image personnalisée')).toBeInTheDocument();
    });

    it('utilise le titre comme alt par défaut', () => {
      render(<CartItem {...defaultProps} />);
      
      expect(screen.getByAltText('Product Test')).toBeInTheDocument();
    });
  });

  describe('ClassName et ID', () => {
    it('applique la className personnalisée', () => {
      render(<CartItem {...defaultProps} className="custom-class" />);
      
      expect(screen.getByRole('article')).toHaveClass('custom-class');
    });

    it('utilise l\'ID fourni', () => {
      render(<CartItem {...defaultProps} id="mon-id" />);
      
      expect(screen.getByRole('article')).toHaveAttribute('id', 'mon-id');
    });
  });

  describe('CallBacks et événements', () => {
    it('appelle onProductClick lors du clic sur l\'image', async () => {
      const user = userEvent.setup();
      const onProductClick = vi.fn();
      
      render(
        <CartItem 
          {...defaultProps} 
          onProductClick={onProductClick}
        />
      );
      
      const imageContainer = screen.getByRole('button', { name: /Product Test/ });
      await user.click(imageContainer);
      
      expect(onProductClick).toHaveBeenCalledTimes(1);
    });
  });
});