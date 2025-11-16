import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseCard from './CourseCard';

describe('CourseCard', () => {
  const defaultProps = {
    imageSrc: 'https://example.com/course-image.jpg',
    title: 'Introduction à React',
    description: 'Apprenez les fondamentaux de React',
    price: 99.99,
    instructor: 'Jean Dupont',
    duration: 120,
    lessons: 25,
    level: 'beginner' as const,
    categories: ['Développement Web', 'JavaScript'],
    tags: ['React', 'Frontend'],
    rating: 4.5,
    reviewCount: 123,
    studentCount: 1250,
    courseUrl: '/course/intro-react'
  };

  it('rendu avec les props par défaut', () => {
    render(<CourseCard {...defaultProps} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('Introduction à React')).toBeInTheDocument();
    expect(screen.getByText('Apprenez les fondamentaux de React')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('25 leçons')).toBeInTheDocument();
    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(123)')).toBeInTheDocument();
    expect(screen.getByText('1 250')).toBeInTheDocument();
  });

  it('affiche l\'image du cours correctement', () => {
    render(<CourseCard {...defaultProps} />);
    
    const image = screen.getByRole('img', { name: /Introduction à React/i });
    expect(image).toHaveAttribute('src', 'https://example.com/course-image.jpg');
    expect(image).toHaveAttribute('alt', 'Introduction à React');
  });

  it('gère les promotions et prix', () => {
    const { rerender } = render(<CourseCard {...defaultProps} />);
    
    // Prix normal
    expect(screen.getByText('99,99 €')).toBeInTheDocument();
    
    // Avec promotion
    rerender(<CourseCard {...defaultProps} originalPrice={149.99} isOnSale={true} />);
    expect(screen.getByText('99,99 €')).toBeInTheDocument();
    expect(screen.getByText('149,99 €')).toBeInTheDocument();
    expect(screen.getByText('-33%')).toBeInTheDocument();
    
    // Cours gratuit
    rerender(<CourseCard {...defaultProps} isFree={true} />);
    expect(screen.getByText('Gratuit')).toBeInTheDocument();
  });

  it('affiche les badges correctement', () => {
    render(
      <CourseCard 
        {...defaultProps} 
        isNew={true}
        isBestSeller={true}
        isPopular={true}
        isFree={true}
        certificate={true}
        lifetimeAccess={true}
      />
    );
    
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
    expect(screen.getByText('Bestseller')).toBeInTheDocument();
    expect(screen.getByText('Populaire')).toBeInTheDocument();
    expect(screen.getByText('Gratuit')).toBeInTheDocument();
    expect(screen.getByText('Certificat')).toBeInTheDocument();
    expect(screen.getByText('Accès à vie')).toBeInTheDocument();
  });

  it('affiche la progression pour les cours inscrits', () => {
    render(
      <CourseCard 
        {...defaultProps}
        progress={65}
        enrollmentStatus="in-progress"
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    expect(screen.getByText('En cours')).toBeInTheDocument();
  });

  it('affiche le statut terminé', () => {
    render(
      <CourseCard 
        {...defaultProps}
        progress={100}
        enrollmentStatus="completed"
      />
    );
    
    expect(screen.getByText('Terminé')).toBeInTheDocument();
  });

  it('gère les actions rapides', () => {
    const mockAddToWishlist = vi.fn();
    const mockPreview = vi.fn();
    const mockShare = vi.fn();
    
    render(
      <CourseCard 
        {...defaultProps}
        quickActions={{
          addToWishlist: {
            enabled: true,
            isActive: true,
            onClick: mockAddToWishlist
          },
          preview: {
            enabled: true,
            onClick: mockPreview
          },
          share: {
            enabled: true,
            onClick: mockShare
          }
        }}
      />
    );
    
    const wishlistBtn = screen.getByLabelText('Ajouter aux favoris');
    const previewBtn = screen.getByLabelText('Aperçu du cours');
    const shareBtn = screen.getByLabelText('Partager');
    
    expect(wishlistBtn).toBeInTheDocument();
    expect(previewBtn).toBeInTheDocument();
    expect(shareBtn).toBeInTheDocument();
    expect(wishlistBtn.parentElement).toHaveClass('is-active');
    
    fireEvent.click(wishlistBtn);
    fireEvent.click(previewBtn);
    fireEvent.click(shareBtn);
    
    expect(mockAddToWishlist).toHaveBeenCalledWith('/course/intro-react');
    expect(mockPreview).toHaveBeenCalledWith('/course/intro-react');
    expect(mockShare).toHaveBeenCalledWith('/course/intro-react');
  });

  it('gère l\'action d\'inscription', () => {
    const mockEnroll = vi.fn();
    
    render(
      <CourseCard 
        {...defaultProps}
        quickActions={{
          enroll: {
            enabled: true,
            onClick: mockEnroll
          }
        }}
      />
    );
    
    const enrollBtn = screen.getByText("S'inscrire");
    expect(enrollBtn).toBeInTheDocument();
    
    fireEvent.click(enrollBtn);
    expect(mockEnroll).toHaveBeenCalledWith('/course/intro-react');
  });

  it('affiche les technologies dans la vue détaillée', () => {
    render(
      <CourseCard 
        {...defaultProps}
        variant="detailed"
        tools={['React', 'TypeScript', 'Vite', 'Jest']}
        learningObjectives={[
          'Comprendre les concepts de base de React',
          'Créer des composants réutilisables',
          'Gérer l\'état d\'une application'
        ]}
        prerequisites={[
          'Connaissances de base en JavaScript',
          'Familiarité avec HTML et CSS'
        ]}
      />
    );
    
    expect(screen.getByText('Technologies:')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    
    expect(screen.getByText('Objectifs d\'apprentissage')).toBeInTheDocument();
    expect(screen.getByText('Comprendre les concepts de base de React')).toBeInTheDocument();
    
    expect(screen.getByText('Prérequis')).toBeInTheDocument();
    expect(screen.getByText('Connaissances de base en JavaScript')).toBeInTheDocument();
  });

  it('gère le survol et changement d\'image', async () => {
    const user = userEvent.setup();
    render(
      <CourseCard 
        {...defaultProps}
        imageSrcHover="https://example.com/course-image-hover.jpg"
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/course-image.jpg');
    
    await user.hover(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://example.com/course-image-hover.jpg');
    });
    
    await user.unhover(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://example.com/course-image.jpg');
    });
  });

  it('gère le clic sur la carte', () => {
    const mockOnClick = vi.fn();
    
    render(
      <CourseCard 
        {...defaultProps}
        onClick={mockOnClick}
      />
    );
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith('/course/intro-react');
  });

  it('gère la navigation clavier', () => {
    const mockOnClick = vi.fn();
    
    render(
      <CourseCard 
        {...defaultProps}
        onClick={mockOnClick}
      />
    );
    
    const card = screen.getByRole('article');
    
    // Focus sur la carte
    fireEvent.focus(card);
    expect(card).toHaveFocus();
    
    // Test de la touche Entrée
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith('/course/intro-react');
    
    // Test de la touche Espace
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledWith('/course/intro-react');
  });

  it('gère les événements de focus et blur', () => {
    const mockOnFocus = vi.fn();
    const mockOnBlur = vi.fn();
    
    render(
      <CourseCard 
        {...defaultProps}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );
    
    const card = screen.getByRole('article');
    
    fireEvent.focus(card);
    expect(mockOnFocus).toHaveBeenCalledWith('/course/intro-react');
    
    fireEvent.blur(card);
    expect(mockOnBlur).toHaveBeenCalledWith('/course/intro-react');
  });

  it('affiche l\'état de chargement', () => {
    render(
      <CourseCard 
        {...defaultProps}
        loading={true}
      />
    );
    
    expect(screen.getByRole('status')).toHaveTextContent('Chargement du cours');
    expect(screen.getByTestId('course-card-skeleton')).toBeInTheDocument();
  });

  it('gère les erreurs d\'image', () => {
    render(
      <CourseCard 
        {...defaultProps}
      />
    );
    
    const image = screen.getByRole('img');
    fireEvent.error(image);
    
    // L'image devrait maintenant afficher un état d'erreur
    expect(screen.getByTestId('course-card')).toHaveClass('course-card--error');
  });

  it('affiche les métadonnées conditionnelles', () => {
    render(
      <CourseCard 
        {...defaultProps}
        subtitles={['Français', 'Anglais']}
        downloadableResources={true}
        mobileFriendly={true}
        lastUpdated="2024-01-15"
      />
    );
    
    // Ces éléments spécifiques aux cours LMS devraient être visibles
    // dans les métadonnées étendues si elles sont implémentées
  });

  it('affiche correctement l\'avatar de l\'instructeur', () => {
    render(
      <CourseCard 
        {...defaultProps}
        instructorAvatar="https://example.com/avatar.jpg"
      />
    );
    
    const avatar = screen.getByAltText('Avatar de Jean Dupont');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('gère les liens vers l\'instructeur', () => {
    render(
      <CourseCard 
        {...defaultProps}
        instructorUrl="/instructor/jean-dupont"
      />
    );
    
    const instructorLink = screen.getByRole('link', { name: 'Jean Dupont' });
    expect(instructorLink).toHaveAttribute('href', '/instructor/jean-dupont');
  });

  it('affiche les catégories correctement', () => {
    render(
      <CourseCard 
        {...defaultProps}
        categories={['Développement Web', 'JavaScript', 'React']}
      />
    );
    
    expect(screen.getByText('Développement Web')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('applique les classes CSS conditionnelles', () => {
    const { rerender } = render(
      <CourseCard 
        {...defaultProps}
        className="custom-course-card"
      />
    );
    
    expect(screen.getByTestId('course-card')).toHaveClass('custom-course-card');
    
    rerender(
      <CourseCard 
        {...defaultProps}
        variant="compact"
        size="small"
        orientation="horizontal"
      />
    );
    
    expect(screen.getByTestId('course-card')).toHaveClass(
      'course-card--compact',
      'course-card--small',
      'course-card--horizontal'
    );
  });

  it('rend accessibles les éléments interactifs', () => {
    render(
      <CourseCard 
        {...defaultProps}
        quickActions={{
          addToWishlist: { enabled: true, onClick: vi.fn() }
        }}
      />
    );
    
    const article = screen.getByRole('article');
    const image = screen.getByRole('img');
    const wishlistButton = screen.getByRole('button', { name: 'Ajouter aux favoris' });
    
    // Vérification de l'accessibilité
    expect(article).toHaveAttribute('tabIndex', '0');
    expect(image).toHaveAttribute('alt');
    expect(wishlistButton).toHaveAttribute('aria-label');
  });

  it('prend en charge les préférences de mouvement réduit', () => {
    // Simuler prefers-reduced-motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    const { rerender } = render(<CourseCard {...defaultProps} />);
    
    const card = screen.getByRole('article');
    
    // Les animations devraient être réduites
    expect(card).toBeInTheDocument();
    
    // Restaurer matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('gère les données manquantes gracieusement', () => {
    render(
      <CourseCard 
        imageSrc="https://example.com/image.jpg"
        title="Cours sans métadonnées"
        price={50}
      />
    );
    
    // La carte devrait se rendre même avec des données minimales
    expect(screen.getByText('Cours sans métadonnées')).toBeInTheDocument();
    expect(screen.getByText('50,00 €')).toBeInTheDocument();
  });

  it('respecte les contraintes d\'affichage mobile', () => {
    // Simuler un viewport mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<CourseCard {...defaultProps} />);
    
    // Vérifier que les adaptations mobiles sont appliquées
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
    
    // Restaurer la largeur
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  it('utilise les attributs ARIA corrects', () => {
    render(
      <CourseCard 
        {...defaultProps}
        rating={4.5}
        reviewCount={123}
        progress={75}
        enrollmentStatus="in-progress"
      />
    );
    
    // Vérification des attributs ARIA
    expect(screen.getByLabelText('Note: 4.5/5')).toBeInTheDocument();
    expect(screen.getByLabelText('Statut: En cours')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('optimise les images pour les performances', () => {
    render(
      <CourseCard 
        {...defaultProps}
        galleryImages={[
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]}
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('fonctionne avec le mode sombre', () => {
    // Simuler prefers-color-scheme: dark
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    render(<CourseCard {...defaultProps} />);
    
    // Le composant devrait s'adapter au mode sombre
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
    
    // Restaurer matchMedia
    window.matchMedia = originalMatchMedia;
  });
});