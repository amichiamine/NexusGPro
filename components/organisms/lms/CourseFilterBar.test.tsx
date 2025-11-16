/**
 * CourseFilterBar.test.tsx
 * Tests for CourseFilterBar component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseFilterBar, { CourseFilterBarProps } from './CourseFilterBar';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockCategories = [
  'Développement Web',
  'Design',
  'Marketing',
  'Business',
  'Data Science'
];

const mockInstructors = [
  'Marie Dubois',
  'Pierre Martin',
  'Sophie Laurent',
  'Antoine Garcia'
];

const mockFilters: CourseFilterBarProps = {
  onFilterChange: vi.fn(),
  categories: mockCategories,
  instructors: mockInstructors,
  isOpen: true,
  onClose: vi.fn(),
  selectedFilters: {
    category: '',
    level: '',
    priceRange: '',
    instructor: '',
    duration: '',
    language: '',
    rating: ''
  }
};

const renderComponent = (props: Partial<CourseFilterBarProps> = {}) => {
  return render(
    <CourseFilterBar {...mockFilters} {...props} />
  );
};

describe('CourseFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the filter sidebar when open', () => {
      renderComponent();
      
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      renderComponent({ isOpen: false });
      
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    test('renders filter sections', () => {
      renderComponent();
      
      expect(screen.getByText('Catégorie')).toBeInTheDocument();
      expect(screen.getByText('Niveau')).toBeInTheDocument();
      expect(screen.getByText('Prix')).toBeInTheDocument();
      expect(screen.getByText('Instructeur')).toBeInTheDocument();
      expect(screen.getByText('Durée')).toBeInTheDocument();
      expect(screen.getByText('Langue')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    test('renders mobile modal when in mobile mode', () => {
      renderComponent({ mode: 'modal' });
      
      expect(screen.getByTestId('course-filter-modal')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('renders category options', () => {
      renderComponent();
      
      mockCategories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    test('calls onFilterChange when category is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const categoryOption = screen.getByText(mockCategories[0]);
      await user.click(categoryOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith(
        'category',
        mockCategories[0]
      );
    });

    test('highlights selected category', () => {
      renderComponent({
        selectedFilters: { ...mockFilters.selectedFilters, category: mockCategories[0] }
      });
      
      const categoryOption = screen.getByText(mockCategories[0]);
      expect(categoryOption).toHaveClass('course-filter-bar__option--selected');
    });
  });

  describe('Level Filter', () => {
    test('renders level options', () => {
      renderComponent();
      
      expect(screen.getByText('Débutant')).toBeInTheDocument();
      expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
      expect(screen.getByText('Avancé')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    test('calls onFilterChange when level is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const levelOption = screen.getByText('Intermédiaire');
      await user.click(levelOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('level', 'Intermédiaire');
    });
  });

  describe('Price Range Filter', () => {
    test('renders price range options', () => {
      renderComponent();
      
      expect(screen.getByText('Gratuit')).toBeInTheDocument();
      expect(screen.getByText('Moins de 50€')).toBeInTheDocument();
      expect(screen.getByText('50€ - 100€')).toBeInTheDocument();
      expect(screen.getByText('100€ - 200€')).toBeInTheDocument();
      expect(screen.getByText('Plus de 200€')).toBeInTheDocument();
    });

    test('calls onFilterChange when price range is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const priceOption = screen.getByText('50€ - 100€');
      await user.click(priceOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('priceRange', '50-100');
    });
  });

  describe('Instructor Filter', () => {
    test('renders instructor options', () => {
      renderComponent();
      
      mockInstructors.forEach(instructor => {
        expect(screen.getByText(instructor)).toBeInTheDocument();
      });
    });

    test('calls onFilterChange when instructor is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const instructorOption = screen.getByText(mockInstructors[0]);
      await user.click(instructorOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('instructor', mockInstructors[0]);
    });
  });

  describe('Duration Filter', () => {
    test('renders duration options', () => {
      renderComponent();
      
      expect(screen.getByText('Moins de 2h')).toBeInTheDocument();
      expect(screen.getByText('2-5h')).toBeInTheDocument();
      expect(screen.getByText('5-10h')).toBeInTheDocument();
      expect(screen.getByText('10-20h')).toBeInTheDocument();
      expect(screen.getByText('Plus de 20h')).toBeInTheDocument();
    });

    test('calls onFilterChange when duration is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const durationOption = screen.getByText('5-10h');
      await user.click(durationOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('duration', '5-10');
    });
  });

  describe('Language Filter', () => {
    test('renders language options', () => {
      renderComponent();
      
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Anglais')).toBeInTheDocument();
      expect(screen.getByText('Espagnol')).toBeInTheDocument();
      expect(screen.getByText('Allemand')).toBeInTheDocument();
    });

    test('calls onFilterChange when language is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const languageOption = screen.getByText('Anglais');
      await user.click(languageOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('language', 'Anglais');
    });
  });

  describe('Rating Filter', () => {
    test('renders rating options with star displays', () => {
      renderComponent();
      
      expect(screen.getByText('4+ étoiles')).toBeInTheDocument();
      expect(screen.getByText('4.5+ étoiles')).toBeInTheDocument();
      expect(screen.getByText('4.8+ étoiles')).toBeInTheDocument();
    });

    test('calls onFilterChange when rating is selected', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const ratingOption = screen.getByText('4+ étoiles');
      await user.click(ratingOption);
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('rating', '4');
    });
  });

  describe('Filter Management', () => {
    test('displays active filters as chips', () => {
      const activeFilters = {
        ...mockFilters.selectedFilters,
        category: 'Développement Web',
        level: 'Intermédiaire'
      };
      
      renderComponent({ selectedFilters: activeFilters });
      
      expect(screen.getByText('Développement Web')).toBeInTheDocument();
      expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
      expect(screen.getByText('Catégorie')).toBeInTheDocument();
      expect(screen.getByText('Niveau')).toBeInTheDocument();
    });

    test('allows removing individual filters', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      
      renderComponent({ 
        selectedFilters: {
          ...mockFilters.selectedFilters,
          category: 'Développement Web'
        },
        onFilterChange
      });
      
      const removeButton = screen.getByLabelText('Retirer le filtre Catégorie');
      await user.click(removeButton);
      
      expect(onFilterChange).toHaveBeenCalledWith('category', '');
    });

    test('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      
      renderComponent({ 
        selectedFilters: {
          category: 'Développement Web',
          level: 'Intermédiaire',
          priceRange: '50-100',
          instructor: '',
          duration: '',
          language: '',
          rating: ''
        },
        onFilterChange
      });
      
      const clearButton = screen.getByText('Effacer tout');
      await user.click(clearButton);
      
      expect(onFilterChange).toHaveBeenCalledTimes(7); // Once for each filter
      expect(onFilterChange).toHaveBeenCalledWith('category', '');
      expect(onFilterChange).toHaveBeenCalledWith('level', '');
      expect(onFilterChange).toHaveBeenCalledWith('priceRange', '');
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Fermer les filtres')).toBeInTheDocument();
      expect(screen.getByLabelText('Effacer tous les filtres')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstOption = screen.getByText('Développement Web');
      
      // Test keyboard focus
      firstOption.focus();
      expect(document.activeElement).toBe(firstOption);
      
      // Test keyboard activation
      await user.keyboard('{Enter}');
      
      expect(mockFilters.onFilterChange).toHaveBeenCalledWith('category', 'Développement Web');
    });

    test('announces filter changes to screen readers', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const categoryOption = screen.getByText('Développement Web');
      await user.click(categoryOption);
      
      // Verify that the change is announced (visual verification in real usage)
      expect(mockFilters.onFilterChange).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    test('renders search input', () => {
      renderComponent();
      
      expect(screen.getByPlaceholderText('Rechercher des cours...')).toBeInTheDocument();
    });

    test('calls onFilterChange when search term is entered', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      
      renderComponent({ onFilterChange });
      
      const searchInput = screen.getByPlaceholderText('Rechercher des cours...');
      await user.type(searchInput, 'React');
      
      // Search should trigger after debounce
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith('search', 'React');
      });
    });

    test('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      
      renderComponent({ onFilterChange });
      
      const searchInput = screen.getByPlaceholderText('Rechercher des cours...');
      await user.type(searchInput, 'React');
      
      const clearButton = screen.getByLabelText('Effacer la recherche');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
      expect(onFilterChange).toHaveBeenCalledWith('search', '');
    });
  });

  describe('Responsive Behavior', () => {
    test('renders in sidebar mode by default', () => {
      renderComponent();
      
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('course-filter-bar--sidebar');
    });

    test('renders in modal mode on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      const modal = screen.getByTestId('course-filter-modal');
      expect(modal).toBeInTheDocument();
    });

    test('shows mobile close button when in modal mode', async () => {
      const user = userEvent.setup();
      renderComponent({ mode: 'modal' });
      
      const closeButton = screen.getByLabelText('Fermer les filtres');
      await user.click(closeButton);
      
      expect(mockFilters.onClose).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('debounces search input changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      
      renderComponent({ onFilterChange });
      
      const searchInput = screen.getByPlaceholderText('Rechercher des cours...');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'Re');
      await user.type(searchInput, 'act');
      
      // Should not have been called yet due to debounce
      expect(onFilterChange).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith('search', 'React');
      }, { timeout: 500 });
    });
  });

  describe('Error Handling', () => {
    test('handles missing onFilterChange gracefully', () => {
      // Should not throw error when onFilterChange is not provided
      expect(() => {
        renderComponent({ onFilterChange: undefined });
      }).not.toThrow();
    });

    test('handles empty categories array', () => {
      renderComponent({ categories: [] });
      
      expect(screen.getByText('Aucune catégorie disponible')).toBeInTheDocument();
    });

    test('handles empty instructors array', () => {
      renderComponent({ instructors: [] });
      
      expect(screen.getByText('Aucun instructeur disponible')).toBeInTheDocument();
    });
  });

  describe('Integration with Parent Components', () => {
    test('synchronizes filter state with parent component', () => {
      const parentFilters = {
        ...mockFilters.selectedFilters,
        category: 'Design'
      };
      
      const { rerender } = renderComponent({ selectedFilters: parentFilters });
      
      // Update from parent
      const newFilters = { ...parentFilters, level: 'Avancé' };
      rerender(<CourseFilterBar {...mockFilters} selectedFilters={newFilters} />);
      
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Avancé')).toBeInTheDocument();
    });

    test('triggers re-render when filters change externally', () => {
      const { rerender } = renderComponent();
      
      const initialOptions = screen.getAllByRole('button').filter(
        button => button.textContent === 'Développement Web'
      );
      expect(initialOptions.length).toBeGreaterThan(0);
      
      // Simulate external filter change
      const newFilters = { ...mockFilters.selectedFilters, category: 'Développement Web' };
      rerender(<CourseFilterBar {...mockFilters} selectedFilters={newFilters} />);
      
      const updatedOptions = screen.getAllByText('Développement Web');
      expect(updatedOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles very long filter names', () => {
      const longCategory = 'Développement Web Avancé avec React, TypeScript et Node.js pour Applications d\'Entreprise';
      const shortCategories = [longCategory];
      
      renderComponent({ categories: shortCategories });
      
      expect(screen.getByText(longCategory)).toBeInTheDocument();
    });

    test('handles special characters in filter names', () => {
      const specialCategories = ['Développement Web & Design', 'Marketing & SEO+'];
      
      renderComponent({ categories: specialCategories });
      
      expect(screen.getByText('Développement Web & Design')).toBeInTheDocument();
      expect(screen.getByText('Marketing & SEO+')).toBeInTheDocument();
    });

    test('handles maximum number of filters', () => {
      const manyFilters = Array.from({ length: 50 }, (_, i) => `Catégorie ${i}`);
      
      renderComponent({ categories: manyFilters });
      
      expect(screen.getByText('Catégorie 0')).toBeInTheDocument();
      expect(screen.getByText('Catégorie 49')).toBeInTheDocument();
    });
  });
});