/**
 * CourseGrid.test.tsx
 * Tests for CourseGrid component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseGrid, { CourseGridProps, Course } from './CourseGrid';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Avancé',
    description: 'Apprenez React avec hooks et context API',
    instructor: 'Marie Dubois',
    category: 'Développement Web',
    level: 'Intermédiaire',
    duration: 1200, // minutes
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.8,
    students: 1247,
    image: '/images/course-react.jpg',
    tags: ['React', 'JavaScript', 'Frontend'],
    language: 'Français',
    lastUpdated: '2024-01-15',
    isBestseller: true,
    isNew: false,
    isOnSale: true,
    progress: null,
    enrolled: false,
    completed: false,
    certificate: false
  },
  {
    id: '2',
    title: 'UI/UX Design Fondamentaux',
    description: 'Créez des interfaces utilisateur exceptionnelles',
    instructor: 'Pierre Martin',
    category: 'Design',
    level: 'Débutant',
    duration: 800,
    price: 0,
    originalPrice: null,
    rating: 4.6,
    students: 2156,
    image: '/images/course-design.jpg',
    tags: ['UI/UX', 'Figma', 'Design'],
    language: 'Français',
    lastUpdated: '2024-01-10',
    isBestseller: false,
    isNew: true,
    isOnSale: false,
    progress: 65,
    enrolled: true,
    completed: false,
    certificate: false
  },
  {
    id: '3',
    title: 'Python pour la Data Science',
    description: 'Analysez des données avec Python et Pandas',
    instructor: 'Sophie Laurent',
    category: 'Data Science',
    level: 'Avancé',
    duration: 2400,
    price: 199.99,
    originalPrice: null,
    rating: 4.9,
    students: 892,
    image: '/images/course-python.jpg',
    tags: ['Python', 'Pandas', 'Data Science'],
    language: 'Français',
    lastUpdated: '2024-01-20',
    isBestseller: false,
    isNew: false,
    isOnSale: false,
    progress: null,
    enrolled: false,
    completed: false,
    certificate: false
  }
];

const defaultProps: CourseGridProps = {
  courses: mockCourses,
  loading: false,
  error: null,
  viewMode: 'grid',
  sortBy: 'popularity',
  sortOrder: 'desc',
  page: 1,
  totalPages: 5,
  totalItems: 150,
  itemsPerPage: 24,
  onCourseClick: vi.fn(),
  onCourseEnroll: vi.fn(),
  onWishlistToggle: vi.fn(),
  onSortChange: vi.fn(),
  onPageChange: vi.fn(),
  onViewModeChange: vi.fn(),
  onPageSizeChange: vi.fn()
};

const renderComponent = (props: Partial<CourseGridProps> = {}) => {
  return render(<CourseGrid {...defaultProps} {...props} />);
};

describe('CourseGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the course grid container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-grid-container')).toBeInTheDocument();
    });

    test('renders course cards in grid mode', () => {
      renderComponent();
      
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
      expect(screen.getByText('UI/UX Design Fondamentaux')).toBeInTheDocument();
      expect(screen.getByText('Python pour la Data Science')).toBeInTheDocument();
    });

    test('renders course cards in list mode', () => {
      renderComponent({ viewMode: 'list' });
      
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
      expect(screen.getByText('UI/UX Design Fondamentaux')).toBeInTheDocument();
      expect(screen.getByText('Python pour la Data Science')).toBeInTheDocument();
      
      // List mode should have different layout
      const gridContainer = screen.getByTestId('course-grid-container');
      expect(gridContainer).toHaveClass('course-grid--list');
    });

    test('displays loading state when loading is true', () => {
      renderComponent({ loading: true });
      
      expect(screen.getByTestId('course-grid-loading')).toBeInTheDocument();
      expect(screen.queryByText('React Avancé')).not.toBeInTheDocument();
    });

    test('displays error state when error is provided', () => {
      const errorMessage = 'Erreur lors du chargement des cours';
      renderComponent({ error: errorMessage });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('React Avancé')).not.toBeInTheDocument();
    });

    test('displays empty state when no courses are available', () => {
      renderComponent({ courses: [] });
      
      expect(screen.getByText('Aucun cours disponible')).toBeInTheDocument();
      expect(screen.getByText('Essayez de modifier vos filtres ou revenez plus tard')).toBeInTheDocument();
    });
  });

  describe('Course Card Interactions', () => {
    test('calls onCourseClick when course card is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const courseCard = screen.getByText('React Avancé').closest('.course-card');
      await user.click(courseCard!);
      
      expect(defaultProps.onCourseClick).toHaveBeenCalledWith(mockCourses[0]);
    });

    test('calls onCourseEnroll when enroll button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const enrollButtons = screen.getAllByText('S\'inscrire');
      await user.click(enrollButtons[0]);
      
      expect(defaultProps.onCourseEnroll).toHaveBeenCalledWith(mockCourses[0]);
    });

    test('calls onWishlistToggle when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const wishlistButtons = screen.getAllByLabelText('Ajouter aux favoris');
      await user.click(wishlistButtons[0]);
      
      expect(defaultProps.onWishlistToggle).toHaveBeenCalledWith(mockCourses[0]);
    });

    test('shows correct enrollment button state for enrolled courses', () => {
      renderComponent();
      
      // Second course has progress: 65, indicating it's enrolled
      const enrolledCourse = screen.getByText('UI/UX Design Fondamentaux');
      expect(enrolledCourse).toBeInTheDocument();
      
      // Should show "Continuer" instead of "S'inscrire"
      const buttons = screen.getAllByRole('button');
      const continueButton = buttons.find(button => button.textContent === 'Continuer');
      expect(continueButton).toBeTruthy();
    });
  });

  describe('Course Card Content', () => {
    test('displays course title and description', () => {
      renderComponent();
      
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
      expect(screen.getByText('Apprenez React avec hooks et context API')).toBeInTheDocument();
    });

    test('displays course instructor', () => {
      renderComponent();
      
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });

    test('displays course pricing correctly', () => {
      renderComponent();
      
      // Free course
      const freeCourse = screen.getByText('UI/UX Design Fondamentaux');
      expect(freeCourse).toBeInTheDocument();
      
      // Paid course with original price
      const paidCourse = screen.getByText('React Avancé');
      expect(paidCourse).toBeInTheDocument();
    });

    test('displays course rating and student count', () => {
      renderComponent();
      
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('1 247 étudiants')).toBeInTheDocument();
    });

    test('displays course badges and status indicators', () => {
      renderComponent();
      
      expect(screen.getByText('Meilleure vente')).toBeInTheDocument();
      expect(screen.getByText('Nouveau')).toBeInTheDocument();
      expect(screen.getByText('Promotion')).toBeInTheDocument();
    });

    test('displays course progress for enrolled courses', () => {
      renderComponent();
      
      // Second course has 65% progress
      const progressBar = document.querySelector('[data-progress="65"]');
      expect(progressBar).toBeInTheDocument();
    });

    test('displays course tags', () => {
      renderComponent();
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
    });
  });

  describe('View Mode Controls', () => {
    test('renders view mode toggle buttons', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Vue grille')).toBeInTheDocument();
      expect(screen.getByLabelText('Vue liste')).toBeInTheDocument();
    });

    test('changes to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const listButton = screen.getByLabelText('Vue liste');
      await user.click(listButton);
      
      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
    });

    test('changes to grid view when grid button is clicked', async () => {
      const user = userEvent.setup();
      const onViewModeChange = vi.fn();
      
      renderComponent({ viewMode: 'list', onViewModeChange });
      
      const gridButton = screen.getByLabelText('Vue grille');
      await user.click(gridButton);
      
      expect(onViewModeChange).toHaveBeenCalledWith('grid');
    });

    test('highlights active view mode button', () => {
      renderComponent({ viewMode: 'grid' });
      
      const gridButton = screen.getByLabelText('Vue grille');
      expect(gridButton).toHaveClass('course-grid__view-btn--active');
      
      const listButton = screen.getByLabelText('Vue liste');
      expect(listButton).not.toHaveClass('course-grid__view-btn--active');
    });
  });

  describe('Sorting Controls', () => {
    test('renders sort dropdown', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Trier par')).toBeInTheDocument();
    });

    test('calls onSortChange when sort option is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const sortSelect = screen.getByLabelText('Trier par');
      await user.selectOptions(sortSelect, 'price-asc');
      
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('price', 'asc');
    });

    test('displays current sort option', () => {
      renderComponent({ sortBy: 'rating', sortOrder: 'desc' });
      
      expect(screen.getByDisplayValue('rating-desc')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    test('renders pagination controls', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Page 1 sur 5')).toBeInTheDocument();
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

    test('calls onPageChange when page number is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const page3Button = screen.getByText('3');
      await user.click(page3Button);
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
    });

    test('disables navigation buttons on first page', () => {
      renderComponent({ page: 1 });
      
      const prevButton = screen.getByLabelText('Page précédente');
      expect(prevButton).toBeDisabled();
    });

    test('disables navigation buttons on last page', () => {
      renderComponent({ page: 5 });
      
      const nextButton = screen.getByLabelText('Page suivante');
      expect(nextButton).toBeDisabled();
    });

    test('shows correct page count information', () => {
      renderComponent({ totalPages: 5, totalItems: 150, itemsPerPage: 24 });
      
      expect(screen.getByText('Affichage 1-24 sur 150 cours')).toBeInTheDocument();
    });
  });

  describe('Page Size Control', () => {
    test('renders page size selector', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Cours par page')).toBeInTheDocument();
    });

    test('calls onPageSizeChange when page size is changed', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const pageSizeSelect = screen.getByLabelText('Cours par page');
      await user.selectOptions(pageSizeSelect, '48');
      
      expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(48);
    });

    test('displays current page size', () => {
      renderComponent({ itemsPerPage: 48 });
      
      expect(screen.getByDisplayValue('24')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('renders skeleton cards when loading', () => {
      renderComponent({ loading: true });
      
      const skeletonCards = screen.getAllByTestId('course-card-skeleton');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });

    test('disables interactions when loading', () => {
      renderComponent({ loading: true });
      
      const courseCards = screen.queryAllByRole('button');
      courseCards.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('shows loading text when loading', () => {
      renderComponent({ loading: true });
      
      expect(screen.getByText('Chargement des cours...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    test('displays error message when error is provided', () => {
      const errorMessage = 'Erreur lors du chargement des cours';
      renderComponent({ error: errorMessage });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('shows retry button in error state', () => {
      const errorMessage = 'Erreur lors du chargement des cours';
      renderComponent({ error: errorMessage });
      
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    test('calls reload function when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      
      renderComponent({ 
        error: 'Erreur lors du chargement des cours',
        onRetry 
      });
      
      const retryButton = screen.getByText('Réessayer');
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    test('displays empty state when no courses match filters', () => {
      renderComponent({ courses: [] });
      
      expect(screen.getByText('Aucun cours disponible')).toBeInTheDocument();
      expect(screen.getByText('Essayez de modifier vos filtres ou revenez plus tard')).toBeInTheDocument();
    });

    test('displays different empty state when loading fails completely', () => {
      renderComponent({ 
        courses: [],
        error: 'Service indisponible',
        loading: false 
      });
      
      expect(screen.getByText('Service indisponible')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Grille de cours')).toBeInTheDocument();
      expect(screen.getByLabelText('Navigation entre les pages')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstCourseCard = screen.getByText('React Avancé').closest('.course-card');
      
      // Focus the first card
      firstCourseCard?.focus();
      expect(document.activeElement).toBe(firstCourseCard);
      
      // Navigate to next card with arrow key
      await user.keyboard('{ArrowRight}');
      
      // Should move focus to next course card
      expect(document.activeElement).not.toBe(firstCourseCard);
    });

    test('announces course count changes to screen readers', () => {
      renderComponent();
      
      const grid = screen.getByLabelText('Grille de cours');
      expect(grid).toHaveAttribute('aria-label', 'Grille de cours - 3 cours disponibles');
    });
  });

  describe('Responsive Design', () => {
    test('adapts grid columns based on screen size', () => {
      renderComponent();
      
      const grid = screen.getByTestId('course-grid-container');
      
      // Should have responsive classes
      expect(grid).toHaveClass('course-grid--responsive');
    });

    test('shows compact list view on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent({ viewMode: 'list' });
      
      const grid = screen.getByTestId('course-grid-container');
      expect(grid).toHaveClass('course-grid--mobile-compact');
    });

    test('adjusts pagination for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      // Should show simplified pagination on mobile
      expect(screen.getByLabelText('Précédent')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivant')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('optimizes rendering with large datasets', () => {
      const manyCourses = Array.from({ length: 100 }, (_, i) => ({
        ...mockCourses[0],
        id: `${i}`,
        title: `Cours ${i}`
      }));
      
      renderComponent({ courses: manyCourses });
      
      // Should only render visible items
      const courseTitles = screen.getAllByText(/Cours \d+/);
      expect(courseTitles.length).toBeLessThanOrEqual(24); // itemsPerPage
    });

    test('memoizes course cards properly', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same data
      rerender(<CourseGrid {...defaultProps} />);
      
      // Should not re-render cards unnecessarily
      const beforeCount = screen.getAllByText('React Avancé').length;
      expect(beforeCount).toBe(1);
    });
  });

  describe('Integration', () => {
    test('synchronizes with external filter state', () => {
      const { rerender } = renderComponent();
      
      // Simulate external filter change
      const newCourses = [mockCourses[0]]; // Only show first course
      rerender(<CourseGrid {...defaultProps} courses={newCourses} />);
      
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
      expect(screen.queryByText('UI/UX Design Fondamentaux')).not.toBeInTheDocument();
    });

    test('handles real-time course updates', () => {
      const { rerender } = renderComponent();
      
      // Simulate course progress update
      const updatedCourses = [
        { ...mockCourses[1], progress: 75 },
        ...mockCourses.slice(2)
      ];
      
      rerender(<CourseGrid {...defaultProps} courses={updatedCourses} />);
      
      // Should show updated progress
      const progressBar = document.querySelector('[data-progress="75"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very long course titles', () => {
      const longTitleCourse = {
        ...mockCourses[0],
        title: 'Introduction Complète au Développement Web Avancé avec React, TypeScript, Node.js et les Technologies Modernes pour Créer des Applications d\'Entreprise Robustes'
      };
      
      renderComponent({ courses: [longTitleCourse] });
      
      expect(screen.getByText(longTitleCourse.title)).toBeInTheDocument();
    });

    test('handles courses with missing data', () => {
      const incompleteCourse = {
        ...mockCourses[0],
        description: null,
        rating: null,
        students: null,
        price: null
      };
      
      renderComponent({ courses: [incompleteCourse] });
      
      expect(screen.getByText('React Avancé')).toBeInTheDocument();
      // Should handle null values gracefully
      expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    });

    test('handles maximum pagination size', () => {
      renderComponent({ 
        page: 9999,
        totalPages: 1,
        totalItems: 24
      });
      
      expect(screen.getByLabelText('Page 1 sur 1')).toBeInTheDocument();
    });
  });
});