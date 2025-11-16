/**
 * CourseNavigation.test.tsx
 * Tests for CourseNavigation component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseNavigation, { CourseNavigationProps } from './CourseNavigation';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockLessons = [
  {
    id: '1',
    title: 'Introduction à React',
    type: 'video',
    duration: 15,
    isCompleted: true,
    isLocked: false,
    description: 'Les bases de React et premiers composants'
  },
  {
    id: '2',
    title: 'Les Hooks fondamentaux',
    type: 'video',
    duration: 25,
    isCompleted: true,
    isLocked: false,
    description: 'useState, useEffect et hooks personnalisés'
  },
  {
    id: '3',
    title: 'Quiz - Hooks de base',
    type: 'quiz',
    duration: 10,
    isCompleted: false,
    isLocked: false,
    description: 'Testez vos connaissances sur les hooks'
  },
  {
    id: '4',
    title: 'Context API avancé',
    type: 'video',
    duration: 30,
    isCompleted: false,
    isLocked: false,
    description: 'Gérer l\'état global avec Context'
  },
  {
    id: '5',
    title: 'Projet pratique - Todo App',
    type: 'project',
    duration: 45,
    isCompleted: false,
    isLocked: true,
    description: 'Créez une application Todo complète'
  }
];

const mockSections = [
  {
    id: 'section1',
    title: 'Fondamentaux',
    lessons: mockLessons.slice(0, 2),
    isExpanded: true
  },
  {
    id: 'section2', 
    title: 'Hooks avancés',
    lessons: mockLessons.slice(2, 4),
    isExpanded: false
  },
  {
    id: 'section3',
    title: 'Projet final',
    lessons: mockLessons.slice(4),
    isExpanded: false
  }
];

const defaultProps: CourseNavigationProps = {
  lessons: mockLessons,
  sections: mockSections,
  currentLessonId: '2',
  mode: 'sidebar',
  isCollapsed: false,
  showProgress: true,
  showDuration: true,
  showStatus: true,
  showSearch: true,
  onLessonSelect: vi.fn(),
  onLessonComplete: vi.fn(),
  onSectionToggle: vi.fn(),
  onExpandAll: vi.fn(),
  onCollapseAll: vi.fn(),
  onSearch: vi.fn(),
  onClose: vi.fn()
};

const renderComponent = (props: Partial<CourseNavigationProps> = {}) => {
  return render(<CourseNavigation {...defaultProps} {...props} />);
};

describe('CourseNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the navigation container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-navigation')).toBeInTheDocument();
    });

    test('renders in sidebar mode by default', () => {
      renderComponent();
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--sidebar');
    });

    test('renders in horizontal mode when specified', () => {
      renderComponent({ mode: 'horizontal' });
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--horizontal');
    });

    test('renders in modal mode when specified', () => {
      renderComponent({ mode: 'modal' });
      
      expect(screen.getByTestId('course-navigation-modal')).toBeInTheDocument();
    });

    test('renders collapsed state', () => {
      renderComponent({ isCollapsed: true });
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--collapsed');
    });
  });

  describe('Sections', () => {
    test('renders all sections', () => {
      renderComponent();
      
      expect(screen.getByText('Fondamentaux')).toBeInTheDocument();
      expect(screen.getByText('Hooks avancés')).toBeInTheDocument();
      expect(screen.getByText('Projet final')).toBeInTheDocument();
    });

    test('renders section expand/collapse toggle', () => {
      renderComponent();
      
      const toggleButtons = screen.getAllByLabelText('Basculer la section');
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    test('expands section when toggle is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const toggleButton = screen.getAllByLabelText('Basculer la section')[1]; // Second section
      await user.click(toggleButton);
      
      expect(defaultProps.onSectionToggle).toHaveBeenCalledWith('section2');
    });

    test('shows expanded state for expanded sections', () => {
      renderComponent();
      
      // First section is expanded by default
      const expandedSection = screen.getByText('Fondamentaux').closest('.course-navigation__section');
      expect(expandedSection).toHaveClass('course-navigation__section--expanded');
    });

    test('shows collapsed state for collapsed sections', () => {
      renderComponent();
      
      // Second section is collapsed by default
      const collapsedSection = screen.getByText('Hooks avancés').closest('.course-navigation__section');
      expect(collapsedSection).toHaveClass('course-navigation__section--collapsed');
    });
  });

  describe('Lessons', () => {
    test('renders all lessons within sections', () => {
      renderComponent();
      
      expect(screen.getByText('Introduction à React')).toBeInTheDocument();
      expect(screen.getByText('Les Hooks fondamentaux')).toBeInTheDocument();
      expect(screen.getByText('Quiz - Hooks de base')).toBeInTheDocument();
    });

    test('displays lesson type icons', () => {
      renderComponent();
      
      expect(screen.getByTestId('lesson-icon-video')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-icon-quiz')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-icon-project')).toBeInTheDocument();
    });

    test('highlights current lesson', () => {
      renderComponent();
      
      const currentLesson = screen.getByText('Les Hooks fondamentaux').closest('.course-navigation__lesson');
      expect(currentLesson).toHaveClass('course-navigation__lesson--current');
    });

    test('shows completed lessons differently', () => {
      renderComponent();
      
      const completedLesson = screen.getByText('Introduction à React').closest('.course-navigation__lesson');
      expect(completedLesson).toHaveClass('course-navigation__lesson--completed');
    });

    test('shows locked lessons', () => {
      renderComponent();
      
      const lockedLesson = screen.getByText('Projet pratique - Todo App').closest('.course-navigation__lesson');
      expect(lockedLesson).toHaveClass('course-navigation__lesson--locked');
      expect(screen.getByLabelText('Leçon verrouillée')).toBeInTheDocument();
    });

    test('calls onLessonSelect when lesson is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const lessonItem = screen.getByText('Les Hooks fondamentaux');
      await user.click(lessonItem);
      
      expect(defaultProps.onLessonSelect).toHaveBeenCalledWith('2');
    });
  });

  describe('Lesson Details', () => {
    test('displays lesson duration when showDuration is true', () => {
      renderComponent();
      
      expect(screen.getByText('15 min')).toBeInTheDocument();
      expect(screen.getByText('25 min')).toBeInTheDocument();
    });

    test('hides duration when showDuration is false', () => {
      renderComponent({ showDuration: false });
      
      expect(screen.queryByText('15 min')).not.toBeInTheDocument();
      expect(screen.queryByText('25 min')).not.toBeInTheDocument();
    });

    test('displays lesson descriptions', () => {
      renderComponent();
      
      expect(screen.getByText('Les bases de React et premiers composants')).toBeInTheDocument();
      expect(screen.getByText('useState, useEffect et hooks personnalisés')).toBeInTheDocument();
    });

    test('shows lesson status indicators', () => {
      renderComponent();
      
      expect(screen.getByTestId('lesson-status-completed')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-status-current')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-status-locked')).toBeInTheDocument();
    });

    test('does not show status when showStatus is false', () => {
      renderComponent({ showStatus: false });
      
      expect(screen.queryByTestId('lesson-status-completed')).not.toBeInTheDocument();
      expect(screen.queryByTestId('lesson-status-current')).not.toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('displays overall progress when showProgress is true', () => {
      renderComponent();
      
      expect(screen.getByText('Progression: 40%')).toBeInTheDocument();
    });

    test('hides progress when showProgress is false', () => {
      renderComponent({ showProgress: false });
      
      expect(screen.queryByText('Progression:')).not.toBeInTheDocument();
    });

    test('displays progress bar', () => {
      renderComponent();
      
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    test('shows section completion status', () => {
      renderComponent();
      
      const completedSection = screen.getByText('Fondamentaux').closest('.course-navigation__section');
      expect(completedSection).toHaveClass('course-navigation__section--completed');
    });
  });

  describe('Search Functionality', () => {
    test('renders search input when showSearch is true', () => {
      renderComponent();
      
      expect(screen.getByPlaceholderText('Rechercher une leçon...')).toBeInTheDocument();
    });

    test('does not render search when showSearch is false', () => {
      renderComponent({ showSearch: false });
      
      expect(screen.queryByPlaceholderText('Rechercher une leçon...')).not.toBeInTheDocument();
    });

    test('calls onSearch when search term is entered', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      
      renderComponent({ onSearch });
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      await user.type(searchInput, 'hooks');
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('hooks');
      });
    });

    test('highlights matching search results', () => {
      const onSearch = vi.fn();
      
      renderComponent({ onSearch });
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      fireEvent.change(searchInput, { target: { value: 'hooks' } });
      
      const highlightedText = screen.getByText('Hooks', { selector: '.course-navigation__highlight' });
      expect(highlightedText).toBeInTheDocument();
    });

    test('shows "no results" message when search returns nothing', () => {
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });
      
      expect(screen.getByText('Aucune leçon trouvée')).toBeInTheDocument();
    });
  });

  describe('Lesson Actions', () => {
    test('shows completion button for incomplete lessons', () => {
      renderComponent();
      
      const incompleteLesson = screen.getByText('Les Hooks fondamentaux').closest('.course-navigation__lesson');
      expect(incompleteLesson).toHaveClass('course-navigation__lesson--actionable');
    });

    test('calls onLessonComplete when completion button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const completeButton = screen.getByLabelText('Marquer comme terminé');
      await user.click(completeButton);
      
      expect(defaultProps.onLessonComplete).toHaveBeenCalledWith('2');
    });

    test('shows completion checkmark for completed lessons', () => {
      renderComponent();
      
      const completedLesson = screen.getByText('Introduction à React').closest('.course-navigation__lesson');
      expect(completedLesson).toHaveClass('course-navigation__lesson--completed');
      expect(screen.getByTestId('completion-checkmark')).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    test('renders expand all button', () => {
      renderComponent();
      
      expect(screen.getByText('Tout développer')).toBeInTheDocument();
    });

    test('renders collapse all button', () => {
      renderComponent();
      
      expect(screen.getByText('Tout réduire')).toBeInTheDocument();
    });

    test('calls onExpandAll when expand all button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const expandAllButton = screen.getByText('Tout développer');
      await user.click(expandAllButton);
      
      expect(defaultProps.onExpandAll).toHaveBeenCalled();
    });

    test('calls onCollapseAll when collapse all button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const collapseAllButton = screen.getByText('Tout réduire');
      await user.click(collapseAllButton);
      
      expect(defaultProps.onCollapseAll).toHaveBeenCalled();
    });
  });

  describe('Mobile Behavior', () => {
    test('shows mobile hamburger menu button', () => {
      renderComponent({ mode: 'modal' });
      
      expect(screen.getByLabelText('Ouvrir la navigation du cours')).toBeInTheDocument();
    });

    test('opens modal when hamburger is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ mode: 'modal' });
      
      const hamburgerButton = screen.getByLabelText('Ouvrir la navigation du cours');
      await user.click(hamburgerButton);
      
      expect(screen.getByTestId('course-navigation-modal')).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ mode: 'modal' });
      
      // Open modal first
      const hamburgerButton = screen.getByLabelText('Ouvrir la navigation du cours');
      await user.click(hamburgerButton);
      
      // Close modal
      const closeButton = screen.getByLabelText('Fermer la navigation');
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('adapts layout for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--mobile');
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Navigation du cours')).toBeInTheDocument();
      expect(screen.getByLabelText('Leçon actuelle: Les Hooks fondamentaux')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstLesson = screen.getByText('Introduction à React');
      firstLesson.focus();
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      
      expect(document.activeElement).toBe(screen.getByText('Les Hooks fondamentaux'));
    });

    test('announces progress updates to screen readers', () => {
      renderComponent();
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '40');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    test('indicates expandable sections properly', () => {
      renderComponent();
      
      const collapsibleSections = screen.getAllByLabelText('Basculer la section');
      collapsibleSections.forEach(section => {
        expect(section).toHaveAttribute('aria-expanded', expect.stringMatching('true|false'));
      });
    });

    test('marks current lesson as active', () => {
      renderComponent();
      
      const currentLesson = screen.getByText('Les Hooks fondamentaux');
      expect(currentLesson).toHaveAttribute('aria-current', 'step');
    });
  });

  describe('Performance', () => {
    test('memoizes section components', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same props
      rerender(<CourseNavigation {...defaultProps} />);
      
      // Should not re-render unnecessarily
      const sectionElements = screen.getAllByTestId('navigation-section');
      expect(sectionElements.length).toBe(3);
    });

    test('virtualizes long lesson lists', () => {
      const manyLessons = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Leçon ${i}`,
        type: 'video' as const,
        duration: 10,
        isCompleted: false,
        isLocked: false,
        description: `Description de la leçon ${i}`
      }));
      
      renderComponent({ lessons: manyLessons });
      
      // Should only render visible items
      const lessonElements = screen.getAllByTestId('navigation-lesson');
      expect(lessonElements.length).toBeLessThan(100);
    });

    test('debounces search input', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      
      renderComponent({ onSearch });
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      await user.type(searchInput, 'h');
      await user.type(searchInput, 'oo');
      
      // Should not have been called yet due to debounce
      expect(onSearch).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('hoo');
      });
    });
  });

  describe('Integration with Course Player', () => {
    test('synchronizes with external lesson changes', () => {
      const { rerender } = renderComponent();
      
      // Simulate lesson completion from external source
      const updatedLessons = mockLessons.map(lesson => 
        lesson.id === '2' ? { ...lesson, isCompleted: true } : lesson
      );
      
      rerender(<CourseNavigation {...defaultProps} lessons={updatedLessons} />);
      
      // Should show updated completion status
      const completedLesson = screen.getByText('Les Hooks fondamentaux').closest('.course-navigation__lesson');
      expect(completedLesson).toHaveClass('course-navigation__lesson--completed');
    });

    test('updates current lesson when it changes externally', () => {
      const { rerender } = renderComponent();
      
      // Change current lesson
      rerender(<CourseNavigation {...defaultProps} currentLessonId="4" />);
      
      const currentLesson = screen.getByText('Context API avancé').closest('.course-navigation__lesson');
      expect(currentLesson).toHaveClass('course-navigation__lesson--current');
    });

    test('handles lesson auto-completion', () => {
      const autoCompleteCallback = vi.fn();
      
      renderComponent({
        onLessonComplete: autoCompleteCallback,
        autoCompleteThreshold: 90 // 90% video watched
      });
      
      // Simulate video watching progress
      const lessonItem = screen.getByText('Les Hooks fondamentaux');
      fireEvent(lessonItem, new Event('lesson-complete'));
      
      expect(autoCompleteCallback).toHaveBeenCalledWith('2');
    });
  });

  describe('Mode Variations', () => {
    test('renders in breadcrumbs mode', () => {
      renderComponent({ mode: 'breadcrumbs' });
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--breadcrumbs');
    });

    test('renders in tabs mode', () => {
      renderComponent({ mode: 'tabs' });
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--tabs');
      
      // Should show as tabs instead of sections
      const tabElements = screen.getAllByTestId('navigation-tab');
      expect(tabElements.length).toBeGreaterThan(0);
    });

    test('renders in dropdown mode', () => {
      renderComponent({ mode: 'dropdown' });
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--dropdown');
    });
  });

  describe('Error Handling', () => {
    test('handles missing lesson data gracefully', () => {
      const lessonsWithNulls = [
        { ...mockLessons[0], title: null },
        { ...mockLessons[1], duration: null }
      ];
      
      renderComponent({ lessons: lessonsWithNulls });
      
      expect(screen.getByText('Leçon sans titre')).toBeInTheDocument();
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });

    test('handles empty lessons array', () => {
      renderComponent({ lessons: [] });
      
      expect(screen.getByText('Aucune leçon disponible')).toBeInTheDocument();
    });

    test('handles malformed section data', () => {
      const invalidSections = [
        { id: 'invalid', title: null, lessons: [], isExpanded: true }
      ];
      
      renderComponent({ sections: invalidSections });
      
      expect(screen.getByText('Section sans titre')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('responds to lesson navigation shortcuts', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Focus on navigation
      const nav = screen.getByTestId('course-navigation');
      nav.focus();
      
      // Use keyboard shortcuts
      await user.keyboard('{Control+ArrowDown}'); // Next lesson
      await user.keyboard('{Control+ArrowUp}');   // Previous lesson
      
      // Should update current lesson (mock implementation)
      expect(document.activeElement).toBe(nav);
    });

    test('supports search shortcuts', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      
      // Focus search with shortcut
      await user.keyboard('{Control+f}');
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles when theme is dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const nav = screen.getByTestId('course-navigation');
      expect(nav).toHaveClass('course-navigation--dark');
    });

    test('adapts color scheme for better contrast', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const currentLesson = screen.getByText('Les Hooks fondamentaux').closest('.course-navigation__lesson');
      expect(currentLesson).toHaveClass('course-navigation__lesson--current-dark');
    });
  });

  describe('Analytics and Tracking', () => {
    test('tracks lesson selection events', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      
      renderComponent({ onAnalyticsEvent });
      
      const lessonItem = screen.getByText('Introduction à React');
      await user.click(lessonItem);
      
      expect(onAnalyticsEvent).toHaveBeenCalledWith('lesson_select', {
        lessonId: '1',
        lessonTitle: 'Introduction à React',
        sectionId: 'section1'
      });
    });

    test('tracks search events', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      
      renderComponent({ onAnalyticsEvent });
      
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      await user.type(searchInput, 'hooks');
      
      await waitFor(() => {
        expect(onAnalyticsEvent).toHaveBeenCalledWith('lesson_search', {
          query: 'hooks',
          results: 2
        });
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles very long lesson titles', () => {
      const longTitleLesson = {
        ...mockLessons[0],
        title: 'Introduction très détaillée aux concepts fondamentaux de React avec une explication approfondie des composants, props, state et lifecycle dans le contexte d\'applications modernes'
      };
      
      renderComponent({ lessons: [longTitleLesson] });
      
      expect(screen.getByText(longTitleLesson.title)).toBeInTheDocument();
      // Should truncate or wrap properly
      const titleElement = screen.getByText(longTitleLesson.title).parentElement;
      expect(titleElement).toHaveClass('course-navigation__lesson-title--truncated');
    });

    test('handles courses with many sections (pagination needed)', () => {
      const manySections = Array.from({ length: 50 }, (_, i) => ({
        id: `section${i}`,
        title: `Section ${i}`,
        lessons: [],
        isExpanded: false
      }));
      
      renderComponent({ sections: manySections });
      
      // Should implement pagination or virtualization
      const sectionElements = screen.getAllByTestId('navigation-section');
      expect(sectionElements.length).toBeLessThan(50);
    });

    test('handles simultaneous search and filtering', () => {
      const searchInput = screen.getByPlaceholderText('Rechercher une leçon...');
      fireEvent.change(searchInput, { target: { value: 'video' } });
      
      // Should only show video lessons
      const videoLessons = screen.getAllByTestId('lesson-icon-video');
      expect(videoLessons.length).toBeGreaterThan(0);
      expect(screen.queryByText('Quiz - Hooks de base')).not.toBeInTheDocument();
    });
  });
});