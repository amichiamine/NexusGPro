/**
 * Product Page Template - E-commerce Template
 * Complete product showcase page demonstrating NexusG Lite v1.4.0 capabilities
 * 
 * Features demonstrated:
 * - Product gallery and details
 * - Shopping cart integration
 * - Review system
 * - Responsive layout
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React, { useState } from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components
import Navbar from '@/components/molecules/Navbar';
import ProductGallery from '@/components/organisms/ecommerce/ProductGallery';
import PriceTag from '@/components/organisms/ecommerce/PriceTag';
import CartItem from '@/components/organisms/ecommerce/CartItem';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import Badge from '@/components/atoms/Badge';
import Accordion from '@/components/molecules/Accordion';
import Modal from '@/components/molecules/Modal';
import Testimonial from '@/components/molecules/Testimonial';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  features: string[];
  specifications: Record<string, string>;
}

interface ProductPageProps {
  product: Product;
  className?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, className }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    // Add to cart logic
    setIsCartOpen(true);
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation */}
      <Navbar 
        logo="NexusG Store"
        links={[
          { label: 'Shop', href: '/shop' },
          { label: 'Categories', href: '/categories' },
          { label: 'Sale', href: '/sale' }
        ]}
        cta={{ label: 'Cart (0)', href: '#cart' }}
        variant="modern"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="text-sm text-muted-foreground">
            Home / {product.category} / {product.name}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              selectedIndex={selectedImage}
              onImageSelect={setSelectedImage}
              variant="modern"
            />
            
            {/* Thumbnail Navigation */}
            <div className="flex gap-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-20 h-20 border-2 rounded-lg overflow-hidden',
                    selectedImage === index 
                      ? 'border-primary' 
                      : 'border-muted hover:border-muted-foreground'
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <Badge variant="success">In Stock</Badge>
              {product.originalPrice && (
                <Badge variant="destructive">
                  Sale {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={cn(
                    'text-lg',
                    i < product.rating ? 'text-yellow-400' : 'text-muted-foreground'
                  )}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <PriceTag
                price={product.price}
                originalPrice={product.originalPrice}
                currency="$"
                variant="modern"
              />
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1"
                >
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  {isFavorite ? '♥' : '♡'}
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground">
              <div className="mb-2">
                <strong>Category:</strong> {product.category}
              </div>
              <div>
                <strong>Availability:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Product Details</h2>
              <Accordion
                items={[
                  {
                    id: 'description',
                    title: 'Description',
                    content: product.description
                  },
                  {
                    id: 'specifications',
                    title: 'Specifications',
                    content: (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b pb-2">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    id: 'shipping',
                    title: 'Shipping & Returns',
                    content: (
                      <div className="space-y-4">
                        <div>
                          <strong>Free Shipping</strong> on orders over $100
                        </div>
                        <div>
                          <strong>30-day return</strong> policy
                        </div>
                        <div>
                          <strong>Fast delivery</strong> within 2-3 business days
                        </div>
                      </div>
                    )
                  }
                ]}
                variant="modern"
              />
            </Card>
          </div>

          <div>
            {/* Customer Reviews */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={cn(
                      'text-lg',
                      i < product.rating ? 'text-yellow-400' : 'text-muted-foreground'
                    )}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-medium">{product.rating}/5</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>
              
              <Button variant="outline" className="w-full">
                Write a Review
              </Button>
            </Card>

            {/* Featured Review */}
            <Testimonial
              quote="Excellent product! High quality and fast shipping. Would definitely recommend to others."
              author="Emily Johnson"
              role="Verified Customer"
              avatar="👩"
            />
          </div>
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">You Might Also Like</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <h3 className="font-semibold mb-2">Related Product {i + 1}</h3>
                <PriceTag price={49.99} variant="simple" />
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Added to Cart"
      >
        <div className="space-y-4">
          <CartItem
            id={product.id}
            name={product.name}
            price={product.price}
            quantity={quantity}
            image={product.images[0]}
            variant="minimal"
          />
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(false)}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => setIsCartOpen(false)}
              className="flex-1"
            >
              View Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductPage;
