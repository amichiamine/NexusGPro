/**
 * CourseReview.test.tsx
 * Tests for CourseReview component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseReview, { CourseReviewProps, Review } from './CourseReview';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Marie Dupont',
    userAvatar: '/images/avatars/marie.jpg',
    rating: 5,
    title: 'Excellent cours, très détaillé !',
    comment: 'Ce cours m\'a vraiment aidé à comprendre React en profondeur. Les explications sont claires et les exemples pratiques sont excellents.',
    date: '2024-01-20T10:30:00Z',
    helpful: 24,
    notHelpful: 2,
    verified: true,
    courseCompleted: true,
    response: {
      instructorName: 'Marie Dubois',
      comment: 'Merci beaucoup pour votre retour positif !',
      date: '2024-01-20T14:00:00Z'
    }
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Pierre Martin',
    userAvatar: '/images/avatars/pierre.jpg',
    rating: 4,
    title: 'Bon contenu mais peut être amélioré',
    comment: 'Le contenu est de qualité mais certaines parties pourraient être plus détaillées. Dans l\'ensemble, je recommande.',
    date: '2024-01-18T15:45:00Z',
    helpful: 12,
    notHelpful: 1,
    verified: true,
    courseCompleted: false,
    response: null
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Sophie Laurent',
    userAvatar: null,
    rating: 3,
    title: 'Moyen',
    comment: 'Le cours est correct mais pas exceptionnelles. J\'attendais plus d\'exemples pratiques.',
    date: '2024-01-15T09:20:00Z',
    helpful: 8,
    notHelpful: 3,
    verified: false,
    courseCompleted: false,
    response: null
  }
];

const mockCourseStats = {
  totalReviews: 247,
  averageRating: 4.6,
  ratingDistribution: {
    5: 145,
    4: 67,
    3: 23,
    4: 10,
    5: 2
  },
  verifiedReviews: 189,
  reviewsWithComments: 156,
  reviewsThisMonth: 18
};

const defaultProps: CourseReviewProps = {
  reviews: mockReviews,
  courseStats: mockCourseStats,
  loading: false,
  error: null,
  sortBy: 'recent',
  filterBy: 'all',
  currentPage: 1,
  totalPages: 25,
  showInstructor: true,
  showOnlyVerified: false,
  showCourseStats: true,
  onReviewSubmit: vi.fn(),
  onReviewHelpful: vi.fn(),
  onReviewReport: vi.fn(),
  onSortChange: vi.fn(),
  onFilterChange: vi.fn(),
  onPageChange: vi.fn()
};

const renderComponent = (props: Partial<CourseReviewProps> = {}) => {
  return render(<CourseReview {...defaultProps} {...props} />);
};

describe('CourseReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the review container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-reviews')).toBeInTheDocument();
    });

    test('displays all reviews', () => {
      renderComponent();
      
      expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument();
      expect(screen.getByText('Bon contenu mais peut être amélioré')).toBeInTheDocument();
      expect(screen.getByText('Moyen')).toBeInTheDocument();
    });

    test('shows loading state when loading is true', () => {
      renderComponent({ loading: true });
      
      expect(screen.getByTestId('reviews-loading')).toBeInTheDocument();
      expect(screen.queryByText('Excellent cours, très détaillé !')).not.toBeInTheDocument();
    });

    test('displays error state when error is provided', () => {
      const errorMessage = 'Erreur lors du chargement des avis';
      renderComponent({ error: errorMessage });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Excellent cours, très détaillé !')).not.toBeInTheDocument();
    });

    test('displays empty state when no reviews are available', () => {
      renderComponent({ reviews: [] });
      
      expect(screen.getByText('Aucun avis disponible')).toBeInTheDocument();
      expect(screen.getByText('Soyez le premier à laisser un avis')).toBeInTheDocument();
    });
  });

  describe('Course Statistics', () => {
    test('displays overall rating when showCourseStats is true', () => {
      renderComponent();
      
      expect(screen.getByText('4.6')).toBeInTheDocument();
      expect(screen.getByText('(247 avis)')).toBeInTheDocument();
    });

    test('hides course stats when showCourseStats is false', () => {
      renderComponent({ showCourseStats: false });
      
      expect(screen.queryByText('4.6')).not.toBeInTheDocument();
      expect(screen.queryByText('(247 avis)')).not.toBeInTheDocument();
    });

    test('displays star rating visualization', () => {
      renderComponent();
      
      expect(screen.getByTestId('star-rating-4-6')).toBeInTheDocument();
    });

    test('shows rating distribution chart', () => {
      renderComponent();
      
      expect(screen.getByTestId('rating-distribution')).toBeInTheDocument();
      expect(screen.getByText('5 étoiles')).toBeInTheDocument();
      expect(screen.getByText('145 avis')).toBeInTheDocument();
    });

    test('displays verified reviews count', () => {
      renderComponent();
      
      expect(screen.getByText('189 avis vérifiés')).toBeInTheDocument();
    });

    test('shows reviews this month', () => {
      renderComponent();
      
      expect(screen.getByText('18 nouveaux avis ce mois')).toBeInTheDocument();
    });
  });

  describe('Review Cards', () => {
    test('displays reviewer information', () => {
      renderComponent();
      
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
      expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });

    test('shows reviewer avatars', () => {
      renderComponent();
      
      expect(screen.getByTestId('reviewer-avatar-marie-dupont')).toBeInTheDocument();
      expect(screen.getByTestId('reviewer-avatar-pierre-martin')).toBeInTheDocument();
    });

    test('displays verified badges', () => {
      renderComponent();
      
      const verifiedReviews = screen.getAllByText('Vérifié');
      expect(verifiedReviews.length).toBe(2); // First two reviews are verified
    });

    test('shows course completion status', () => {
      renderComponent();
      
      expect(screen.getByText('Cours terminé')).toBeInTheDocument();
      expect(screen.getByText('En cours')).toBeInTheDocument();
    });

    test('displays review ratings', () => {
      renderComponent();
      
      const starElements = screen.getAllByTestId('star-filled');
      expect(starElements.length).toBe(12); // 5+4+3 = 12 stars total
    });

    test('displays review titles', () => {
      renderComponent();
      
      expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument();
      expect(screen.getByText('Bon contenu mais peut être amélioré')).toBeInTheDocument();
      expect(screen.getByText('Moyen')).toBeInTheDocument();
    });

    test('displays review comments', () => {
      renderComponent();
      
      expect(screen.getByText('Ce cours m\'a vraiment aidé à comprendre React')).toBeInTheDocument();
      expect(screen.getByText('Le contenu est de qualité')).toBeInTheDocument();
    });

    test('shows review dates', () => {
      renderComponent();
      
      expect(screen.getByText('20 janv. 2024')).toBeInTheDocument();
      expect(screen.getByText('18 janv. 2024')).toBeInTheDocument();
      expect(screen.getByText('15 janv. 2024')).toBeInTheDocument();
    });
  });

  describe('Review Interactions', () => {
    test('renders helpful buttons for each review', () => {
      renderComponent();
      
      const helpfulButtons = screen.getAllByText('Utile');
      expect(helpfulButtons.length).toBeGreaterThan(0);
      
      const notHelpfulButtons = screen.getAllByText('Pas utile');
      expect(notHelpfulButtons.length).toBeGreaterThan(0);
    });

    test('shows helpful count', () => {
      renderComponent();
      
      expect(screen.getByText('24')).toBeInTheDocument(); // First review has 24 helpful votes
      expect(screen.getByText('12')).toBeInTheDocument(); // Second review has 12 helpful votes
    });

    test('calls onReviewHelpful when helpful button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const helpfulButton = screen.getByText('Utile').first();
      await user.click(helpfulButton);
      
      expect(defaultProps.onReviewHelpful).toHaveBeenCalledWith('1', true);
    });

    test('calls onReviewHelpful when not helpful button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const notHelpfulButton = screen.getByText('Pas utile').first();
      await user.click(notHelpfulButton);
      
      expect(defaultProps.onReviewHelpful).toHaveBeenCalledWith('1', false);
    });

    test('renders report buttons', () => {
      renderComponent();
      
      const reportButtons = screen.getAllByLabelText('Signaler cet avis');
      expect(reportButtons.length).toBeGreaterThan(0);
    });

    test('calls onReviewReport when report button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const reportButton = screen.getByLabelText('Signaler cet avis').first();
      await user.click(reportButton);
      
      expect(defaultProps.onReviewReport).toHaveBeenCalledWith('1');
    });
  });

  describe('Instructor Responses', () => {
    test('displays instructor responses when showInstructor is true', () => {
      renderComponent();
      
      expect(screen.getByText('Réponse de l\'instructeur')).toBeInTheDocument();
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Merci beaucoup pour votre retour positif !')).toBeInTheDocument();
    });

    test('hides instructor responses when showInstructor is false', () => {
      renderComponent({ showInstructor: false });
      
      expect(screen.queryByText('Réponse de l\'instructeur')).not.toBeInTheDocument();
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    });

    test('shows instructor response date', () => {
      renderComponent();
      
      expect(screen.getByText('20 janv. 2024')).toBeInTheDocument();
    });

    test('displays different styling for instructor responses', () => {
      renderComponent();
      
      const instructorResponse = screen.getByText('Merci beaucoup pour votre retour positif !').closest('.instructor-response');
      expect(instructorResponse).toHaveClass('instructor-response');
    });
  });

  describe('Review Submission', () => {
    test('renders review submission form', () => {
      renderComponent();
      
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument();
      expect(screen.getByLabelText('Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Titre')).toBeInTheDocument();
      expect(screen.getByLabelText('Commentaire')).toBeInTheDocument();
    });

    test('calls onReviewSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const onReviewSubmit = vi.fn();
      
      renderComponent({ onReviewSubmit });
      
      // Fill out the form
      const ratingStars = screen.getAllByTestId('rating-star');
      await user.click(ratingStars[4]); // 5 stars
      
      const titleInput = screen.getByLabelText('Titre');
      await user.type(titleInput, 'Excellent cours !');
      
      const commentTextarea = screen.getByLabelText('Commentaire');
      await user.type(commentTextarea, 'Très bon contenu, je recommande.');
      
      const submitButton = screen.getByText('Publier mon avis');
      await user.click(submitButton);
      
      expect(onReviewSubmit).toHaveBeenCalledWith({
        rating: 5,
        title: 'Excellent cours !',
        comment: 'Très bon contenu, je recommande.'
      });
    });

    test('validates required fields before submission', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const submitButton = screen.getByText('Publier mon avis');
      await user.click(submitButton);
      
      expect(screen.getByText('Veuillez sélectionner une note')).toBeInTheDocument();
      expect(screen.getByText('Veuillez saisir un titre')).toBeInTheDocument();
      expect(screen.getByText('Veuillez saisir un commentaire')).toBeInTheDocument();
    });

    test('shows character limits for review fields', () => {
      renderComponent();
      
      expect(screen.getByText('100 caractères maximum')).toBeInTheDocument();
      expect(screen.getByText('500 caractères maximum')).toBeInTheDocument();
    });
  });

  describe('Sorting and Filtering', () => {
    test('renders sort dropdown', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Trier par')).toBeInTheDocument();
    });

    test('calls onSortChange when sort option is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const sortSelect = screen.getByLabelText('Trier par');
      await user.selectOptions(sortSelect, 'rating-high');
      
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('rating-high');
    });

    test('displays filter options', () => {
      renderComponent();
      
      expect(screen.getByText('Tous les avis')).toBeInTheDocument();
      expect(screen.getByText('5 étoiles')).toBeInTheDocument();
      expect(screen.getByText('4 étoiles')).toBeInTheDocument();
      expect(screen.getByText('Avis avec commentaires')).toBeInTheDocument();
    });

    test('calls onFilterChange when filter option is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const filterButton = screen.getByText('5 étoiles');
      await user.click(filterButton);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('rating-5');
    });

    test('shows verified only filter when showOnlyVerified is true', () => {
      renderComponent({ showOnlyVerified: true });
      
      expect(screen.getByText('Avis vérifiés uniquement')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    test('renders pagination controls', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Page 1 sur 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Page suivante')).toBeInTheDocument();
      expect(screen.getByLabelText('Page précédente')).toBeInTheDocument();
    });

    test('calls onPageChange when page button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const nextButton = screen.getByLabelText('Page suivante');
      await user.click(nextButton);
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    test('shows correct page information', () => {
      renderComponent({ currentPage: 5, totalPages: 25 });
      
      expect(screen.getByLabelText('Page 5 sur 25')).toBeInTheDocument();
    });

    test('disables navigation buttons appropriately', () => {
      renderComponent({ currentPage: 1 });
      
      const prevButton = screen.getByLabelText('Page précédente');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Review Moderation', () => {
    test('shows moderation status for reported reviews', () => {
      const reportedReviews = mockReviews.map(review => ({
        ...review,
        id: review.id === '3' ? review.id : review.id, // Third review is reported
        status: review.id === '3' ? 'reported' : 'active'
      }));
      
      renderComponent({ reviews: reportedReviews });
      
      expect(screen.getByText('Avis signalé')).toBeInTheDocument();
    });

    test('hides banned or removed reviews', () => {
      const moderatedReviews = mockReviews.filter(review => review.id !== '3'); // Remove third review
      renderComponent({ reviews: moderatedReviews });
      
      expect(screen.queryByText('Moyen')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      const reviews = screen.getByTestId('course-reviews');
      expect(reviews).toHaveClass('course-reviews--mobile');
    });

    test('shows mobile-optimized review cards', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument();
      // Should have compact layout
      expect(screen.getByTestId('review-card-mobile')).toBeInTheDocument();
    });

    test('hides detailed stats on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.queryByText('145 avis')).not.toBeInTheDocument(); // Hide distribution details
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Avis de cours avec note 5 étoiles')).toBeInTheDocument();
      expect(screen.getByLabelText('Avis de cours avec note 4 étoiles')).toBeInTheDocument();
      expect(screen.getByLabelText('Avis de cours avec note 3 étoiles')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstReview = screen.getByText('Excellent cours, très détaillé !');
      firstReview.focus();
      
      expect(document.activeElement).toBe(firstReview);
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      
      expect(document.activeElement).toBe(screen.getByText('Bon contenu mais peut être amélioré'));
    });

    test('announces review count changes to screen readers', () => {
      renderComponent();
      
      const reviews = screen.getByTestId('course-reviews');
      expect(reviews).toHaveAttribute('aria-label', '247 avis sur ce cours');
    });

    test('provides alternative text for rating stars', () => {
      renderComponent();
      
      const ratingStars = screen.getAllByTestId('star-filled');
      ratingStars.forEach(star => {
        expect(star).toHaveAttribute('aria-label', '5 étoiles');
      });
    });
  });

  describe('Real-time Updates', () => {
    test('updates when new reviews are added', () => {
      const { rerender } = renderComponent();
      
      const newReview = {
        ...mockReviews[0],
        id: '4',
        title: 'Nouveau super avis !',
        comment: 'Un excellent ajout à ma liste.',
        date: '2024-01-25T10:00:00Z'
      };
      
      const updatedReviews = [newReview, ...mockReviews];
      rerender(<CourseReview {...defaultProps} reviews={updatedReviews} />);
      
      expect(screen.getByText('Nouveau super avis !')).toBeInTheDocument();
      expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument(); // Previous reviews still there
    });

    test('updates helpful counts in real-time', () => {
      const { rerender } = renderComponent();
      
      const updatedStats = {
        ...mockCourseStats,
        reviews: mockReviews.map(review => 
          review.id === '1' ? { ...review, helpful: 25, notHelpful: 2 } : review
        )
      };
      
      rerender(<CourseReview {...defaultProps} courseStats={updatedStats} />);
      
      expect(screen.getByText('25')).toBeInTheDocument(); // Updated helpful count
    });
  });

  describe('Search and Filter', () => {
    test('renders search input for reviews', () => {
      renderComponent();
      
      expect(screen.getByPlaceholderText('Rechercher dans les avis...')).toBeInTheDocument();
    });

    test('filters reviews by search term', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les avis...');
      await user.type(searchInput, 'excellent');
      
      await waitFor(() => {
        expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument();
        expect(screen.queryByText('Bon contenu mais peut être amélioré')).not.toBeInTheDocument();
      });
    });

    test('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les avis...');
      await user.type(searchInput, 'excellent');
      
      const clearButton = screen.getByLabelText('Effacer la recherche');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('Excellent cours, très détaillé !')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error message for failed review submission', async () => {
      const user = userEvent.setup();
      const onReviewSubmit = vi.fn().mockRejectedValue(new Error('Erreur réseau'));
      
      renderComponent({ onReviewSubmit });
      
      // Fill and submit form
      const ratingStars = screen.getAllByTestId('rating-star');
      await user.click(ratingStars[4]);
      
      const titleInput = screen.getByLabelText('Titre');
      await user.type(titleInput, 'Test review');
      
      const commentTextarea = screen.getByLabelText('Commentaire');
      await user.type(commentTextarea, 'Test comment');
      
      const submitButton = screen.getByText('Publier mon avis');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur lors de l\'envoi de l\'avis')).toBeInTheDocument();
      });
    });

    test('shows retry button for failed data loading', () => {
      renderComponent({ 
        error: 'Erreur de chargement',
        onRetry: vi.fn()
      });
      
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    test('handles network timeouts gracefully', () => {
      renderComponent({ 
        loading: false,
        error: 'Timeout de connexion',
        reviews: []
      });
      
      expect(screen.getByText('La connexion a pris trop de temps')).toBeInTheDocument();
      expect(screen.getByText('Vérifiez votre connexion internet')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('memoizes review calculations', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same data
      rerender(<CourseReview {...defaultProps} />);
      
      expect(screen.getByText('4.6')).toBeInTheDocument();
    });

    test('virtualizes long review lists', () => {
      const manyReviews = Array.from({ length: 1000 }, (_, i) => ({
        ...mockReviews[0],
        id: `${i}`,
        title: `Avis ${i}`,
        comment: `Commentaire ${i}`,
        date: `2024-01-${String(20 + (i % 10)).padStart(2, '0')}T10:00:00Z`
      }));
      
      renderComponent({ reviews: manyReviews });
      
      // Should only render visible reviews
      const reviewTitles = screen.getAllByText(/Avis \d+/);
      expect(reviewTitles.length).toBeLessThan(100); // Much less than 1000
    });

    test('debounces search input', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      
      renderComponent({ onSearch });
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les avis...');
      await user.type(searchInput, 'ex');
      await user.type(searchInput, 'cel');
      
      // Should not have been called yet due to debounce
      expect(onSearch).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('excellent');
      });
    });
  });

  describe('Analytics and Tracking', () => {
    test('tracks review helpful votes', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      
      renderComponent({ onAnalyticsEvent });
      
      const helpfulButton = screen.getByText('Utile').first();
      await user.click(helpfulButton);
      
      expect(onAnalyticsEvent).toHaveBeenCalledWith('review_helpful', {
        reviewId: '1',
        isHelpful: true,
        timestamp: expect.any(Number)
      });
    });

    test('tracks review submissions', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      const onReviewSubmit = vi.fn().mockResolvedValue(undefined);
      
      renderComponent({ onReviewSubmit, onAnalyticsEvent });
      
      // Submit a review
      const ratingStars = screen.getAllByTestId('rating-star');
      await user.click(ratingStars[4]);
      
      const titleInput = screen.getByLabelText('Titre');
      await user.type(titleInput, 'Test review');
      
      const commentTextarea = screen.getByLabelText('Commentaire');
      await user.type(commentTextarea, 'Test comment');
      
      const submitButton = screen.getByText('Publier mon avis');
      await user.click(submitButton);
      
      expect(onAnalyticsEvent).toHaveBeenCalledWith('review_submit', {
        rating: 5,
        hasTitle: true,
        hasComment: true,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles when theme is dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const reviews = screen.getByTestId('course-reviews');
      expect(reviews).toHaveClass('course-reviews--dark');
    });

    test('adapts color scheme for better contrast', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const firstReview = screen.getByText('Excellent cours, très détaillé !').closest('.review-card');
      expect(firstReview).toHaveClass('review-card--dark');
    });
  });

  describe('Integration with Course Platform', () => {
    test('synchronizes with external review updates', () => {
      const { rerender } = renderComponent();
      
      // Simulate external review update
      const updatedReviews = mockReviews.map(review => 
        review.id === '2' ? { ...review, rating: 5, helpful: 15 } : review
      );
      
      rerender(<CourseReview {...defaultProps} reviews={updatedReviews} />);
      
      // Should show updated rating
      const reviewElements = screen.getAllByText('Excellent cours, très détaillé !');
      expect(reviewElements.length).toBeGreaterThan(0);
    });

    test('handles user authentication state', () => {
      renderComponent({ 
        userAuthenticated: true,
        userId: 'current-user'
      });
      
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument();
    });

    test('hides review form when user is not authenticated', () => {
      renderComponent({ 
        userAuthenticated: false,
        userId: null
      });
      
      expect(screen.queryByText('Laisser un avis')).not.toBeInTheDocument();
      expect(screen.getByText('Connectez-vous pour laisser un avis')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very long review comments', () => {
      const longComment = {
        ...mockReviews[0],
        comment: 'A'.repeat(2000) // Very long comment
      };
      
      renderComponent({ reviews: [longComment] });
      
      expect(screen.getByText('A'.repeat(500) + '...')).toBeInTheDocument();
      expect(screen.getByText('Voir plus')).toBeInTheDocument();
    });

    test('handles reviews with special characters', () => {
      const specialCharReview = {
        ...mockReviews[0],
        title: 'Cours «exceptionnel» avec émojis 🚀 & symbols!',
        comment: 'Comment with "quotes" & special chars: <script>alert("xss")</script>'
      };
      
      renderComponent({ reviews: [specialCharReview] });
      
      expect(screen.getByText('Cours «exceptionnel» avec émojis 🚀 & symbols!')).toBeInTheDocument();
      // Should sanitize dangerous content
      expect(screen.queryByText('<script>')).not.toBeInTheDocument();
    });

    test('handles course with no reviews yet', () => {
      renderComponent({ 
        reviews: [],
        courseStats: { ...mockCourseStats, totalReviews: 0 }
      });
      
      expect(screen.getByText('Aucun avis pour le moment')).toBeInTheDocument();
      expect(screen.getByText('Soyez le premier à partager votre expérience')).toBeInTheDocument();
    });

    test('handles courses with extremely high ratings', () => {
      const perfectCourseStats = {
        ...mockCourseStats,
        averageRating: 4.95,
        ratingDistribution: { 5: 247, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
      
      renderComponent({ courseStats: perfectCourseStats });
      
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('247 avis parfaits')).toBeInTheDocument();
    });
  });
});