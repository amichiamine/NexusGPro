import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import { ProductCard, ProductCardProps } from './ProductCard';
import './ProductGallery.css';

export interface ProductGalleryProps {
  /** Liste des produits à afficher */
  products: (ProductCardProps & { id: string })[];
  /** Nombre de produits par page */
  itemsPerPage?: number;
  /** Nombre de colonnes sur desktop */
  desktopColumns?: number;
  /** Nombre de colonnes sur tablette */
  tabletColumns?: number;
  /** Nombre de colonnes sur mobile */
  mobileColumns?: number;
  /** Espacement entre les éléments */
  gap?: number;
  /** Mode d'affichage */
  viewMode?: 'grid' | 'list' | 'masonry';
  /** Trier par */
  sortBy?: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity';
  /** Filtrer par catégorie */
  categoryFilter?: string;
  /** Gamme de prix */
  priceRange?: { min: number; max: number };
  /** Produits en promotion uniquement */
  saleOnly?: boolean;
  /** Produits en stock uniquement */
  inStockOnly?: boolean;
  /** Afficher les favoris */
  showFavorites?: boolean;
  /** Afficher le chargement */
  loading?: boolean;
  /** Placeholder pendant le chargement */
  loadingPlaceholder?: React.ReactNode;
  /** Message quand aucun produit trouvé */
  emptyMessage?: string;
  /** Fonction de tri personnalisée */
  customSort?: (a: ProductCardProps, b: ProductCardProps) => number;
  /** Fonction de filtrage personnalisée */
  customFilter?: (product: ProductCardProps) => boolean;
  /** Callback lors du clic sur un produit */
  onProductClick?: (product: ProductCardProps) => void;
  /** Callback lors du changement de page */
  onPageChange?: (page: number) => void;
  /** Callback lors du changement de vue */
  onViewModeChange?: (mode: 'grid' | 'list' | 'masonry') => void;
  /** Callback lors du changement de tri */
  onSortChange?: (sortBy: string) => void;
  /** Configuration de la pagination */
  pagination?: {
    enabled?: boolean;
    position?: 'top' | 'bottom' | 'both';
    showPageNumbers?: boolean;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
  };
  /** Configuration de l'infinite scroll */
  infiniteScroll?: {
    enabled?: boolean;
    threshold?: number;
    rootMargin?: string;
  };
  /** Classes CSS personnalisées */
  className?: string;
  /** ID du composant */
  id?: string;
}

/**
 * Composant ProductGallery pour afficher une galerie de produits
 * 
 * Fonctionnalités:
 * - Affichage en grille, liste ou masonry
 * - Tri et filtrage avancés
 * - Pagination et infinite scroll
 * - Responsive avec colonnes configurables
 * - États de chargement et vide
 * - Accessibilité complète
 */
export const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  itemsPerPage = 12,
  desktopColumns = 4,
  tabletColumns = 2,
  mobileColumns = 1,
  gap = 1.5,
  viewMode = 'grid',
  sortBy = 'name',
  categoryFilter,
  priceRange,
  saleOnly = false,
  inStockOnly = false,
  showFavorites = false,
  loading = false,
  loadingPlaceholder,
  emptyMessage = 'Aucun produit trouvé',
  customSort,
  customFilter,
  onProductClick,
  onPageChange,
  onViewModeChange,
  onSortChange,
  pagination = { enabled: true, position: 'bottom' },
  infiniteScroll = { enabled: false },
  className = '',
  id,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    // Filtre par catégorie
    if (categoryFilter && !product.tags?.includes(categoryFilter)) {
      return false;
    }

    // Filtre par gamme de prix
    if (priceRange) {
      if (product.price < priceRange.min || product.price > priceRange.max) {
        return false;
      }
    }

    // Filtre par promotion
    if (saleOnly && !product.isOnSale) {
      return false;
    }

    // Filtre par stock
    if (inStockOnly && (product.stock === 0)) {
      return false;
    }

    // Filtre par favoris
    if (showFavorites && !product.isFavorite) {
      return false;
    }

    // Filtre personnalisé
    if (customFilter && !customFilter(product)) {
      return false;
    }

    return true;
  });

  // Trier les produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Tri personnalisé
    if (customSort) {
      return customSort(a, b);
    }

    switch (currentSortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return b.isNew ? 1 : -1;
      case 'popularity':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'name':
      default:
        return a.title.localeCompare(b.title);
    }
  });

  // Calculer la pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Gérer les changements
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
    
    // Scroll vers le haut
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'masonry') => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleSortChange = (sort: string) => {
    setCurrentSortBy(sort as any);
    setCurrentPage(1);
    onSortChange?.(sort);
  };

  const handleProductClick = (product: ProductCardProps) => {
    onProductClick?.(product);
  };

  // Générer les pages pour la pagination
  const generatePageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Infinite scroll
  useEffect(() => {
    if (!infiniteScroll.enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
        }
      },
      {
        threshold: infiniteScroll.threshold || 0.1,
        rootMargin: infiniteScroll.rootMargin || '100px',
      }
    );

    const sentinel = document.getElementById(`${id}-sentinel`);
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [currentPage, totalPages, infiniteScroll, id]);

  // Classes CSS
  const galleryClasses = cn(
    'ng-product-gallery',
    `ng-product-gallery--${currentViewMode}`,
    `ng-product-gallery--desktop-${desktopColumns}`,
    `ng-product-gallery--tablet-${tabletColumns}`,
    `ng-product-gallery--mobile-${mobileColumns}`,
    {
      'ng-product-gallery--loading': loading,
    },
    className
  );

  // Rendu du placeholder de chargement
  const renderLoadingPlaceholder = () => {
    if (loadingPlaceholder) {
      return loadingPlaceholder;
    }

    return Array.from({ length: itemsPerPage }).map((_, index) => (
      <div key={index} className="ng-product-gallery__loading-item">
        <div className="ng-product-gallery__loading-image" />
        <div className="ng-product-gallery__loading-content">
          <div className="ng-product-gallery__loading-line" />
          <div className="ng-product-gallery__loading-line ng-product-gallery__loading-line--short" />
          <div className="ng-product-gallery__loading-price" />
        </div>
      </div>
    ));
  };

  // Rendu des produits
  const renderProducts = () => {
    if (loading) {
      return renderLoadingPlaceholder();
    }

    if (currentProducts.length === 0) {
      return (
        <div className="ng-product-gallery__empty">
          <div className="ng-product-gallery__empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3 className="ng-product-gallery__empty-title">{emptyMessage}</h3>
          <p className="ng-product-gallery__empty-message">
            Essayez de modifier vos filtres ou votre recherche.
          </p>
        </div>
      );
    }

    return currentProducts.map((product) => (
      <ProductCard
        key={product.id}
        {...product}
        layout={currentViewMode === 'list' ? 'compact' : 'default'}
        onProductClick={() => handleProductClick(product)}
      />
    ));
  };

  // Rendu de la pagination
  const renderPagination = () => {
    if (!pagination.enabled || totalPages <= 1) return null;

    const pageNumbers = generatePageNumbers();

    return (
      <nav className="ng-product-gallery__pagination" aria-label="Pagination des produits">
        {pagination.showFirstLast && (
          <button
            type="button"
            className="ng-product-gallery__pagination-btn"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="Première page"
          >
            «
          </button>
        )}

        {pagination.showPrevNext && (
          <button
            type="button"
            className="ng-product-gallery__pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Page précédente"
          >
            ‹
          </button>
        )}

        {pagination.showPageNumbers && pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`ng-product-gallery__pagination-btn ${
              page === currentPage ? 'ng-product-gallery__pagination-btn--active' : ''
            }`}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {pagination.showPrevNext && (
          <button
            type="button"
            className="ng-product-gallery__pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
          >
            ›
          </button>
        )}

        {pagination.showFirstLast && (
          <button
            type="button"
            className="ng-product-gallery__pagination-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Dernière page"
          >
            »
          </button>
        )}
      </nav>
    );
  };

  // Rendu des contrôles
  const renderControls = () => (
    <div className="ng-product-gallery__controls">
      {/* Nombre de résultats */}
      <div className="ng-product-gallery__results-count">
        {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''} trouvé{sortedProducts.length !== 1 ? 's' : ''}
      </div>

      {/* Contrôles de vue */}
      <div className="ng-product-gallery__view-controls">
        <div className="ng-product-gallery__view-modes">
          <button
            type="button"
            className={`ng-product-gallery__view-btn ${
              currentViewMode === 'grid' ? 'ng-product-gallery__view-btn--active' : ''
            }`}
            onClick={() => handleViewModeChange('grid')}
            aria-label="Vue en grille"
            title="Vue en grille"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          
          <button
            type="button"
            className={`ng-product-gallery__view-btn ${
              currentViewMode === 'list' ? 'ng-product-gallery__view-btn--active' : ''
            }`}
            onClick={() => handleViewModeChange('list')}
            aria-label="Vue en liste"
            title="Vue en liste"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          
          <button
            type="button"
            className={`ng-product-gallery__view-btn ${
              currentViewMode === 'masonry' ? 'ng-product-gallery__view-btn--active' : ''
            }`}
            onClick={() => handleViewModeChange('masonry')}
            aria-label="Vue en mosaïque"
            title="Vue en mosaïque"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="5" />
              <rect x="14" y="3" width="7" height="9" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>

        {/* Tri */}
        <div className="ng-product-gallery__sort">
          <label htmlFor={`${id}-sort`} className="ng-product-gallery__sort-label">
            Trier par:
          </label>
          <select
            id={`${id}-sort`}
            className="ng-product-gallery__sort-select"
            value={currentSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="name">Nom</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Note</option>
            <option value="newest">Nouveautés</option>
            <option value="popularity">Popularité</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <section className={galleryClasses} id={id} ref={galleryRef}>
      {/* Contrôles (en haut) */}
      {(pagination.position === 'top' || pagination.position === 'both') && renderControls()}

      {/* Grille de produits */}
      <div 
        className="ng-product-gallery__grid"
        style={{
          gap: `${gap}rem`,
          gridTemplateColumns: `repeat(${mobileColumns}, 1fr)`,
        }}
      >
        {renderProducts()}
      </div>

      {/* Infinite scroll sentinel */}
      {infiniteScroll.enabled && currentPage < totalPages && (
        <div
          id={`${id}-sentinel`}
          className="ng-product-gallery__sentinel"
          aria-hidden="true"
        />
      )}

      {/* Contrôles (en bas) */}
      {(pagination.position === 'bottom' || pagination.position === 'both') && (
        <div className="ng-product-gallery__bottom-controls">
          {renderPagination()}
        </div>
      )}
    </section>
  );
};

export default ProductGallery;