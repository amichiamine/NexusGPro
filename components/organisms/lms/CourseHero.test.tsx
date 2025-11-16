/**
 * CourseHero.test.tsx
 * Tests for CourseHero component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseHero, { CourseHeroProps } from './CourseHero';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockCourse = {
  id: '1',
  title: 'React Avancé - Maîtrisez les Hooks et le Context',
  description: 'Devenez expert en React avec les hooks avancés, le Context API, et les patterns modernes. Créez des applications React robustes et performantes.',
  instructor: {
    id: '1',
    name: 'Marie Dubois',
    avatar: '/images/instructors/marie.jpg',
    bio: 'Expert React avec 10 ans d\'expérience',
    rating: 4.9,
    students: 25000,
    courses: 8
  },
  category: 'Développement Web',
  level: 'Avancé',
  duration: 1200, // minutes
  price: 149.99,
  originalPrice: 199.99,
  discount: 25,
  rating: 4.8,
  reviews: 1247,
  students: 8420,
  language: 'Français',
  lastUpdated: '2024-01-15',
  image: '/images/course-hero.jpg',
  previewVideo: '/videos/course-preview.mp4',
  thumbnail: '/images/video-thumbnail.jpg',
  tags: ['React', 'JavaScript', 'Hooks', 'Context API'],
  objectives: [
    'Maîtriser les hooks avancés de React',
    'Implémenter le Context API efficacement',
    'Optimiser les performances de vos applications',
    'Gérer l\'état global avec Redux Toolkit'
  ],
  prerequisites: [
    'Connaissance de base en JavaScript ES6+',
    'Notions de React (props, state, lifecycle)',
    'Familiarité avec npm et les outils de build'
  ],
  features: [
    '20+ heures de contenu vidéo',
    '50+ exercices pratiques',
    'Projet final complet',
    'Certificat de completion',
    'Support Q&A permanent'
  ],
  whatYouWillLearn: [
    'Hooks personnalisés et leurs patterns',
    'Advanced Context API avec useReducer',
    'Performance optimization avec React.memo',
    'State management patterns',
    'Testing avec React Testing Library'
  ]
};

const defaultProps: CourseHeroProps = {
  course: mockCourse,
  variant: 'default',
  showVideoPreview: true,
  showInstructor: true,
  showStats: true,
  showPricing: true,
  showEnrollButton: true,
  onEnroll: vi.fn(),
  onPreview: vi.fn(),
  onShare: vi.fn(),
  onWishlist: vi.fn(),
  onAddToCart: vi.fn()
};

const renderComponent = (props: Partial<CourseHeroProps> = {}) => {
  return render(<CourseHero {...defaultProps} {...props} />);
};

describe('CourseHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the course hero container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-hero')).toBeInTheDocument();
    });

    test('renders course title', () => {
      renderComponent();
      
      expect(screen.getByText('React Avancé - Maîtrisez les Hooks et le Context')).toBeInTheDocument();
    });

    test('renders course description', () => {
      renderComponent();
      
      expect(screen.getByText('Devenez expert en React avec les hooks avancés')).toBeInTheDocument();
    });

    test('renders course image/background', () => {
      renderComponent();
      
      const heroImage = screen.getByTestId('course-hero-image');
      expect(heroImage).toBeInTheDocument();
    });

    test('renders in compact variant', () => {
      renderComponent({ variant: 'compact' });
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--compact');
    });

    test('renders in fullscreen variant', () => {
      renderComponent({ variant: 'fullscreen' });
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--fullscreen');
    });
  });

  describe('Course Information', () => {
    test('displays course category and level', () => {
      renderComponent();
      
      expect(screen.getByText('Développement Web')).toBeInTheDocument();
      expect(screen.getByText('Avancé')).toBeInTheDocument();
    });

    test('displays course duration', () => {
      renderComponent();
      
      expect(screen.getByText('20h')).toBeInTheDocument();
    });

    test('displays course language', () => {
      renderComponent();
      
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    test('displays last updated date', () => {
      renderComponent();
      
      expect(screen.getByText('Dernière mise à jour: 15 janv. 2024')).toBeInTheDocument();
    });

    test('displays course tags', () => {
      renderComponent();
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Hooks')).toBeInTheDocument();
    });
  });

  describe('Instructor Information', () => {
    test('renders instructor details when showInstructor is true', () => {
      renderComponent();
      
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Expert React avec 10 ans d\'expérience')).toBeInTheDocument();
    });

    test('does not render instructor when showInstructor is false', () => {
      renderComponent({ showInstructor: false });
      
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    });

    test('displays instructor avatar', () => {
      renderComponent();
      
      const instructorAvatar = screen.getByTestId('instructor-avatar');
      expect(instructorAvatar).toBeInTheDocument();
    });

    test('displays instructor stats', () => {
      renderComponent();
      
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('25 000 étudiants')).toBeInTheDocument();
      expect(screen.getByText('8 cours')).toBeInTheDocument();
    });
  });

  describe('Course Statistics', () => {
    test('displays rating when showStats is true', () => {
      renderComponent();
      
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('1 247 avis')).toBeInTheDocument();
    });

    test('displays student count', () => {
      renderComponent();
      
      expect(screen.getByText('8 420 étudiants')).toBeInTheDocument();
    });

    test('does not render stats when showStats is false', () => {
      renderComponent({ showStats: false });
      
      expect(screen.queryByText('4.8')).not.toBeInTheDocument();
      expect(screen.queryByText('1 247 avis')).not.toBeInTheDocument();
    });

    test('displays star rating visually', () => {
      renderComponent();
      
      const stars = screen.getAllByTestId('star-rating');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe('Pricing Information', () => {
    test('displays current price', () => {
      renderComponent();
      
      expect(screen.getByText('149,99 €')).toBeInTheDocument();
    });

    test('displays original price when provided', () => {
      renderComponent();
      
      expect(screen.getByText('199,99 €')).toBeInTheDocument();
    });

    test('displays discount percentage', () => {
      renderComponent();
      
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    test('shows free course pricing correctly', () => {
      const freeCourse = {
        ...mockCourse,
        price: 0,
        originalPrice: null,
        discount: null
      };
      
      renderComponent({ course: freeCourse });
      
      expect(screen.getByText('Gratuit')).toBeInTheDocument();
      expect(screen.queryByText('€')).not.toBeInTheDocument();
    });

    test('does not render pricing when showPricing is false', () => {
      renderComponent({ showPricing: false });
      
      expect(screen.queryByText('149,99 €')).not.toBeInTheDocument();
      expect(screen.queryByText('Gratuit')).not.toBeInTheDocument();
    });
  });

  describe('Course Content Preview', () => {
    test('renders video preview when showVideoPreview is true', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-video-preview')).toBeInTheDocument();
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
    });

    test('does not render video preview when showVideoPreview is false', () => {
      renderComponent({ showVideoPreview: false });
      
      expect(screen.queryByTestId('course-video-preview')).not.toBeInTheDocument();
    });

    test('calls onPreview when play button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const playButton = screen.getByTestId('play-button');
      await user.click(playButton);
      
      expect(defaultProps.onPreview).toHaveBeenCalled();
    });

    test('displays video thumbnail', () => {
      renderComponent();
      
      const videoThumbnail = screen.getByTestId('video-thumbnail');
      expect(videoThumbnail).toBeInTheDocument();
    });

    test('shows preview duration overlay', () => {
      renderComponent();
      
      expect(screen.getByText('2:34')).toBeInTheDocument(); // Mock preview duration
    });
  });

  describe('Enrollment Actions', () => {
    test('renders enroll button when showEnrollButton is true', () => {
      renderComponent();
      
      expect(screen.getByText('S\'inscrire maintenant')).toBeInTheDocument();
    });

    test('does not render enroll button when showEnrollButton is false', () => {
      renderComponent({ showEnrollButton: false });
      
      expect(screen.queryByText('S\'inscrire maintenant')).not.toBeInTheDocument();
    });

    test('calls onEnroll when enroll button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const enrollButton = screen.getByText('S\'inscrire maintenant');
      await user.click(enrollButton);
      
      expect(defaultProps.onEnroll).toHaveBeenCalledWith(mockCourse);
    });

    test('calls onAddToCart when add to cart button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const addToCartButton = screen.getByText('Ajouter au panier');
      await user.click(addToCartButton);
      
      expect(defaultProps.onAddToCart).toHaveBeenCalledWith(mockCourse);
    });

    test('renders wishlist button', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Ajouter aux favoris')).toBeInTheDocument();
    });

    test('calls onWishlist when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const wishlistButton = screen.getByLabelText('Ajouter aux favoris');
      await user.click(wishlistButton);
      
      expect(defaultProps.onWishlist).toHaveBeenCalledWith(mockCourse);
    });

    test('shows enrolled state correctly', () => {
      const enrolledCourse = {
        ...mockCourse,
        enrolled: true,
        progress: 25
      };
      
      renderComponent({ course: enrolledCourse });
      
      expect(screen.getByText('Continuer le cours')).toBeInTheDocument();
      expect(screen.queryByText('S\'inscrire maintenant')).not.toBeInTheDocument();
    });
  });

  describe('Course Features', () => {
    test('displays course objectives', () => {
      renderComponent();
      
      mockCourse.objectives.forEach(objective => {
        expect(screen.getByText(objective)).toBeInTheDocument();
      });
    });

    test('displays prerequisites', () => {
      renderComponent();
      
      expect(screen.getByText('Prérequis')).toBeInTheDocument();
      expect(screen.getByText('Connaissance de base en JavaScript ES6+')).toBeInTheDocument();
    });

    test('displays course features', () => {
      renderComponent();
      
      expect(screen.getByText('20+ heures de contenu vidéo')).toBeInTheDocument();
      expect(screen.getByText('50+ exercices pratiques')).toBeInTheDocument();
    });

    test('displays learning outcomes', () => {
      renderComponent();
      
      expect(screen.getByText('Ce que vous apprendrez')).toBeInTheDocument();
      expect(screen.getByText('Hooks personnalisés et leurs patterns')).toBeInTheDocument();
    });

    test('collapses expandable sections by default', () => {
      renderComponent();
      
      expect(screen.getByText('Voir plus de détails')).toBeInTheDocument();
      expect(screen.queryByText('Ce que vous apprendrez')).not.toBeInTheDocument();
    });

    test('expands sections when clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const expandButton = screen.getByText('Voir plus de détails');
      await user.click(expandButton);
      
      expect(screen.getByText('Ce que vous apprendrez')).toBeInTheDocument();
      expect(screen.getByText('Réduire')).toBeInTheDocument();
    });
  });

  describe('Social Actions', () => {
    test('renders share button', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Partager ce cours')).toBeInTheDocument();
    });

    test('calls onShare when share button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const shareButton = screen.getByLabelText('Partager ce cours');
      await user.click(shareButton);
      
      expect(defaultProps.onShare).toHaveBeenCalledWith(mockCourse);
    });

    test('displays share menu when clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const shareButton = screen.getByLabelText('Partager ce cours');
      await user.click(shareButton);
      
      expect(screen.getByText('Copier le lien')).toBeInTheDocument();
      expect(screen.getByText('Partager sur Twitter')).toBeInTheDocument();
      expect(screen.getByText('Partager sur LinkedIn')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Navigation', () => {
    test('displays breadcrumb navigation', () => {
      renderComponent();
      
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Développement Web')).toBeInTheDocument();
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
    });

    test('navigates when breadcrumb links are clicked', async () => {
      const user = userEvent.setup();
      const onBreadcrumbClick = vi.fn();
      
      renderComponent({ onBreadcrumbClick });
      
      const categoryLink = screen.getByText('Développement Web');
      await user.click(categoryLink);
      
      expect(onBreadcrumbClick).toHaveBeenCalledWith('category', 'Développement Web');
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--mobile');
    });

    test('hides instructor details on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    });

    test('shows mobile enroll button', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.getByText('S\'inscrire')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Preview vidéo du cours')).toBeInTheDocument();
      expect(screen.getByLabelText('Bouton de lecture')).toBeInTheDocument();
      expect(screen.getByLabelText('S\'inscrire au cours')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const playButton = screen.getByTestId('play-button');
      
      // Focus and activate with keyboard
      playButton.focus();
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onPreview).toHaveBeenCalled();
    });

    test('announces important course information to screen readers', () => {
      renderComponent();
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveAttribute('aria-label', 
        'React Avancé - Maîtrisez les Hooks et le Context - Cours avancé de développement web');
    });

    test('provides alt text for images', () => {
      renderComponent();
      
      const instructorAvatar = screen.getByTestId('instructor-avatar');
      expect(instructorAvatar).toHaveAttribute('alt', 'Photo de Marie Dubois');
    });
  });

  describe('Video Player Integration', () => {
    test('renders video player in preview mode', () => {
      renderComponent({ variant: 'video' });
      
      expect(screen.getByTestId('course-video-player')).toBeInTheDocument();
    });

    test('pauses video when preview is closed', async () => {
      const user = userEvent.setup();
      renderComponent({ variant: 'video' });
      
      const closeButton = screen.getByLabelText('Fermer l\'aperçu');
      await user.click(closeButton);
      
      // Should trigger video pause (mock implementation)
      expect(screen.queryByTestId('course-video-player')).not.toBeInTheDocument();
    });

    test('shows video controls', () => {
      renderComponent({ variant: 'video' });
      
      expect(screen.getByTestId('video-controls')).toBeInTheDocument();
      expect(screen.getByLabelText('Lecture/Pause')).toBeInTheDocument();
      expect(screen.getByLabelText('Volume')).toBeInTheDocument();
      expect(screen.getByLabelText('Plein écran')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('displays progress bar for enrolled courses', () => {
      const enrolledCourse = {
        ...mockCourse,
        enrolled: true,
        progress: 45,
        totalLessons: 20,
        completedLessons: 9
      };
      
      renderComponent({ course: enrolledCourse });
      
      expect(screen.getByText('9/20 leçons')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    test('shows continue learning CTA', () => {
      const enrolledCourse = {
        ...mockCourse,
        enrolled: true,
        progress: 25
      };
      
      renderComponent({ course: enrolledCourse });
      
      expect(screen.getByText('Continuer l\'apprentissage')).toBeInTheDocument();
    });
  });

  describe('Variant Styles', () => {
    test('applies minimal variant styles', () => {
      renderComponent({ variant: 'minimal' });
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--minimal');
    });

    test('applies split layout variant', () => {
      renderComponent({ variant: 'split' });
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--split');
    });

    test('applies fullscreen variant styles', () => {
      renderComponent({ variant: 'fullscreen' });
      
      const hero = screen.getByTestId('course-hero');
      expect(hero).toHaveClass('course-hero--fullscreen');
      
      // Fullscreen should have video player
      expect(screen.getByTestId('course-video-player')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays fallback image when course image fails to load', () => {
      const courseWithInvalidImage = {
        ...mockCourse,
        image: '/invalid/path.jpg'
      };
      
      renderComponent({ course: courseWithInvalidImage });
      
      const heroImage = screen.getByTestId('course-hero-image');
      expect(heroImage).toHaveAttribute('data-fallback', 'true');
    });

    test('handles missing instructor data', () => {
      const courseWithoutInstructor = {
        ...mockCourse,
        instructor: null
      };
      
      renderComponent({ course: courseWithoutInstructor });
      
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    });

    test('handles missing pricing data', () => {
      const courseWithoutPricing = {
        ...mockCourse,
        price: null,
        originalPrice: null
      };
      
      renderComponent({ course: courseWithoutPricing });
      
      expect(screen.queryByText('€')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('lazy loads video preview', () => {
      renderComponent();
      
      // Video should only load when in viewport
      const videoPreview = screen.getByTestId('course-video-preview');
      expect(videoPreview).toHaveAttribute('data-lazy', 'true');
    });

    test('optimizes images with responsive loading', () => {
      renderComponent();
      
      const heroImage = screen.getByTestId('course-hero-image');
      expect(heroImage).toHaveAttribute('data-srcset', expect.stringContaining('webp'));
    });
  });

  describe('SEO and Meta Information', () => {
    test('includes structured data for course', () => {
      renderComponent();
      
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      expect(structuredData).toBeInTheDocument();
      
      const jsonContent = structuredData?.textContent;
      expect(jsonContent).toContain('"@type": "Course"');
      expect(jsonContent).toContain('React Avancé');
    });

    test('includes meta description', () => {
      renderComponent();
      
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toHaveAttribute('content', 
        expect.stringContaining('Devenez expert en React avec les hooks avancés'));
    });
  });
});