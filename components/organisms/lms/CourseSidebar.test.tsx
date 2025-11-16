/**
 * CourseSidebar.test.tsx
 * Tests for CourseSidebar component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSidebar, { CourseSidebarProps, CourseSidebarSection } from './CourseSidebar';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockCurriculum = [
  {
    id: 'section1',
    title: 'Introduction et Fondamentaux',
    lessons: [
      {
        id: 'lesson1',
        title: 'Bienvenue dans le cours',
        type: 'video',
        duration: 15,
        isPreview: true,
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'lesson2',
        title: 'Configuration de l\'environnement',
        type: 'video',
        duration: 25,
        isPreview: false,
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'lesson3',
        title: 'Quiz - Concepts de base',
        type: 'quiz',
        duration: 10,
        isPreview: false,
        isCompleted: false,
        isLocked: false
      }
    ],
    isExpanded: true
  },
  {
    id: 'section2',
    title: 'Hooks Avancés',
    lessons: [
      {
        id: 'lesson4',
        title: 'useState et useEffect',
        type: 'video',
        duration: 30,
        isPreview: false,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'lesson5',
        title: 'Hooks personnalisés',
        type: 'video',
        duration: 35,
        isPreview: false,
        isCompleted: false,
        isLocked: true
      }
    ],
    isExpanded: false
  },
  {
    id: 'section3',
    title: 'Projet Final',
    lessons: [
      {
        id: 'lesson6',
        title: 'Planification du projet',
        type: 'video',
        duration: 20,
        isPreview: false,
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'lesson7',
        title: 'Développement et déploiement',
        type: 'project',
        duration: 120,
        isPreview: false,
        isCompleted: false,
        isLocked: true
      }
    ],
    isExpanded: false
  }
];

const mockCourseInfo = {
  title: 'React Avancé - Maîtrisez les Hooks',
  instructor: {
    name: 'Marie Dubois',
    avatar: '/images/instructors/marie.jpg',
    bio: 'Expert React avec 10 ans d\'expérience',
    rating: 4.9,
    students: 25000,
    courses: 8
  },
  category: 'Développement Web',
  level: 'Avancé',
  duration: 1800, // minutes
  lastUpdated: '2024-01-15',
  language: 'Français',
  price: 149.99,
  originalPrice: 199.99,
  discount: 25,
  rating: 4.8,
  reviews: 1247,
  students: 8420,
  certificate: true,
  prerequisites: [
    'Connaissance de base en JavaScript ES6+',
    'Notions de React (props, state, lifecycle)'
  ]
};

const defaultProps: CourseSidebarProps = {
  curriculum: mockCurriculum,
  courseInfo: mockCourseInfo,
  currentLessonId: 'lesson2',
  isEnrolled: true,
  isOpen: true,
  position: 'right',
  width: 350,
  showCourseInfo: true,
  showCurriculum: true,
  showInstructor: true,
  showProgress: true,
  showPricing: true,
  showCertificate: true,
  compact: false,
  onLessonSelect: vi.fn(),
  onSectionToggle: vi.fn(),
  onEnroll: vi.fn(),
  onPreview: vi.fn(),
  onWishlist: vi.fn(),
  onShare: vi.fn(),
  onClose: vi.fn()
};

const renderComponent = (props: Partial<CourseSidebarProps> = {}) => {
  return render(<CourseSidebar {...defaultProps} {...props} />);
};

describe('CourseSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the sidebar container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-sidebar')).toBeInTheDocument();
    });

    test('renders in right position by default', () => {
      renderComponent();
      
      const sidebar = screen.getByTestId('course-sidebar');
      expect(sidebar).toHaveClass('course-sidebar--right');
    });

    test('renders in left position when specified', () => {
      renderComponent({ position: 'left' });
      
      const sidebar = screen.getByTestId('course-sidebar');
      expect(sidebar).toHaveClass('course-sidebar--left');
    });

    test('renders in modal mode', () => {
      renderComponent({ position: 'modal' });
      
      expect(screen.getByTestId('course-sidebar-modal')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      renderComponent({ isOpen: false });
      
      expect(screen.queryByTestId('course-sidebar')).not.toBeInTheDocument();
    });

    test('renders compact view when compact is true', () => {
      renderComponent({ compact: true });
      
      const sidebar = screen.getByTestId('course-sidebar');
      expect(sidebar).toHaveClass('course-sidebar--compact');
    });
  });

  describe('Course Information', () => {
    test('displays course title when showCourseInfo is true', () => {
      renderComponent();
      
      expect(screen.getByText('React Avancé - Maîtrisez les Hooks')).toBeInTheDocument();
    });

    test('hides course info when showCourseInfo is false', () => {
      renderComponent({ showCourseInfo: false });
      
      expect(screen.queryByText('React Avancé - Maîtrisez les Hooks')).not.toBeInTheDocument();
    });

    test('displays course category and level', () => {
      renderComponent();
      
      expect(screen.getByText('Développement Web')).toBeInTheDocument();
      expect(screen.getByText('Avancé')).toBeInTheDocument();
    });

    test('shows course duration', () => {
      renderComponent();
      
      expect(screen.getByText('30h')).toBeInTheDocument();
    });

    test('displays last updated date', () => {
      renderComponent();
      
      expect(screen.getByText('15 janv. 2024')).toBeInTheDocument();
    });

    test('shows course language', () => {
      renderComponent();
      
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    test('displays rating and reviews count', () => {
      renderComponent();
      
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(1 247 avis)')).toBeInTheDocument();
    });

    test('shows enrolled student count', () => {
      renderComponent();
      
      expect(screen.getByText('8 420 étudiants')).toBeInTheDocument();
    });
  });

  describe('Instructor Information', () => {
    test('displays instructor details when showInstructor is true', () => {
      renderComponent();
      
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('Expert React avec 10 ans d\'expérience')).toBeInTheDocument();
    });

    test('hides instructor info when showInstructor is false', () => {
      renderComponent({ showInstructor: false });
      
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
      expect(screen.queryByText('Expert React avec 10 ans d\'expérience')).not.toBeInTheDocument();
    });

    test('displays instructor avatar', () => {
      renderComponent();
      
      expect(screen.getByTestId('instructor-avatar')).toBeInTheDocument();
    });

    test('shows instructor stats', () => {
      renderComponent();
      
      expect(screen.getByText('4.9')).toBeInTheDocument(); // Instructor rating
      expect(screen.getByText('25 000 étudiants')).toBeInTheDocument();
      expect(screen.getByText('8 cours')).toBeInTheDocument();
    });
  });

  describe('Pricing Information', () => {
    test('displays pricing when showPricing is true and user is not enrolled', () => {
      renderComponent({ isEnrolled: false });
      
      expect(screen.getByText('149,99 €')).toBeInTheDocument();
      expect(screen.getByText('199,99 €')).toBeInTheDocument(); // Original price
      expect(screen.getByText('25%')).toBeInTheDocument(); // Discount
    });

    test('hides pricing when showPricing is false', () => {
      renderComponent({ isEnrolled: false, showPricing: false });
      
      expect(screen.queryByText('149,99 €')).not.toBeInTheDocument();
      expect(screen.queryByText('199,99 €')).not.toBeInTheDocument();
    });

    test('hides pricing for enrolled users', () => {
      renderComponent({ isEnrolled: true });
      
      expect(screen.queryByText('149,99 €')).not.toBeInTheDocument();
    });

    test('shows free course pricing', () => {
      const freeCourseInfo = {
        ...mockCourseInfo,
        price: 0,
        originalPrice: null
      };
      
      renderComponent({ courseInfo: freeCourseInfo, isEnrolled: false });
      
      expect(screen.getByText('Gratuit')).toBeInTheDocument();
      expect(screen.queryByText('€')).not.toBeInTheDocument();
    });
  });

  describe('Enrollment Actions', () => {
    test('renders enroll button for non-enrolled users', () => {
      renderComponent({ isEnrolled: false });
      
      expect(screen.getByText('S\'inscrire maintenant')).toBeInTheDocument();
    });

    test('calls onEnroll when enroll button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ isEnrolled: false });
      
      const enrollButton = screen.getByText('S\'inscrire maintenant');
      await user.click(enrollButton);
      
      expect(defaultProps.onEnroll).toHaveBeenCalled();
    });

    test('shows enrolled state for enrolled users', () => {
      renderComponent({ isEnrolled: true });
      
      expect(screen.getByText('Vous êtes inscrit')).toBeInTheDocument();
    });

    test('shows continue learning button', () => {
      renderComponent({ isEnrolled: true });
      
      expect(screen.getByText('Continuer l\'apprentissage')).toBeInTheDocument();
    });

    test('renders wishlist button', () => {
      renderComponent({ isEnrolled: false });
      
      expect(screen.getByLabelText('Ajouter aux favoris')).toBeInTheDocument();
    });

    test('calls onWishlist when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ isEnrolled: false });
      
      const wishlistButton = screen.getByLabelText('Ajouter aux favoris');
      await user.click(wishlistButton);
      
      expect(defaultProps.onWishlist).toHaveBeenCalled();
    });

    test('shows share button', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Partager ce cours')).toBeInTheDocument();
    });

    test('calls onShare when share button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const shareButton = screen.getByLabelText('Partager ce cours');
      await user.click(shareButton);
      
      expect(defaultProps.onShare).toHaveBeenCalled();
    });
  });

  describe('Certificate Information', () => {
    test('displays certificate info when showCertificate is true', () => {
      renderComponent();
      
      expect(screen.getByText('Certificat de completion')).toBeInTheDocument();
    });

    test('hides certificate info when showCertificate is false', () => {
      renderComponent({ showCertificate: false });
      
      expect(screen.queryByText('Certificat de completion')).not.toBeInTheDocument();
    });

    test('shows certificate icon and text', () => {
      renderComponent();
      
      expect(screen.getByTestId('certificate-icon')).toBeInTheDocument();
      expect(screen.getByText('À la fin du cours')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('displays progress when showProgress is true', () => {
      renderComponent();
      
      expect(screen.getByText('Progression: 33%')).toBeInTheDocument(); // 2/6 lessons completed
    });

    test('hides progress when showProgress is false', () => {
      renderComponent({ showProgress: false });
      
      expect(screen.queryByText('Progression:')).not.toBeInTheDocument();
    });

    test('shows progress bar', () => {
      renderComponent();
      
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    test('displays completed lessons count', () => {
      renderComponent();
      
      expect(screen.getByText('2/6 leçons complétées')).toBeInTheDocument();
    });

    test('shows estimated time remaining', () => {
      renderComponent();
      
      expect(screen.getByText('~20h restantes')).toBeInTheDocument();
    });
  });

  describe('Curriculum', () => {
    test('displays curriculum when showCurriculum is true', () => {
      renderComponent();
      
      expect(screen.getByText('Introduction et Fondamentaux')).toBeInTheDocument();
      expect(screen.getByText('Hooks Avancés')).toBeInTheDocument();
      expect(screen.getByText('Projet Final')).toBeInTheDocument();
    });

    test('hides curriculum when showCurriculum is false', () => {
      renderComponent({ showCurriculum: false });
      
      expect(screen.queryByText('Introduction et Fondamentaux')).not.toBeInTheDocument();
      expect(screen.queryByText('Hooks Avancés')).not.toBeInTheDocument();
    });

    test('displays all lessons in each section', () => {
      renderComponent();
      
      expect(screen.getByText('Bienvenue dans le cours')).toBeInTheDocument();
      expect(screen.getByText('Configuration de l\'environnement')).toBeInTheDocument();
      expect(screen.getByText('Quiz - Concepts de base')).toBeInTheDocument();
    });

    test('shows lesson type icons', () => {
      renderComponent();
      
      expect(screen.getByTestId('lesson-type-video')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-type-quiz')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-type-project')).toBeInTheDocument();
    });

    test('highlights current lesson', () => {
      renderComponent();
      
      const currentLesson = screen.getByText('Configuration de l\'environnement').closest('.lesson-item');
      expect(currentLesson).toHaveClass('lesson-item--current');
    });

    test('shows completed lessons differently', () => {
      renderComponent();
      
      const completedLesson = screen.getByText('Bienvenue dans le cours').closest('.lesson-item');
      expect(completedLesson).toHaveClass('lesson-item--completed');
    });

    test('shows locked lessons', () => {
      renderComponent();
      
      const lockedLesson = screen.getByText('Hooks personnalisés').closest('.lesson-item');
      expect(lockedLesson).toHaveClass('lesson-item--locked');
      expect(screen.getByLabelText('Leçon verrouillée')).toBeInTheDocument();
    });

    test('shows preview lessons', () => {
      renderComponent();
      
      const previewLesson = screen.getByText('Bienvenue dans le cours').closest('.lesson-item');
      expect(previewLesson).toHaveClass('lesson-item--preview');
    });

    test('calls onLessonSelect when lesson is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const lessonItem = screen.getByText('Quiz - Concepts de base');
      await user.click(lessonItem);
      
      expect(defaultProps.onLessonSelect).toHaveBeenCalledWith('lesson3');
    });

    test('calls onPreview when preview lesson is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const previewLesson = screen.getByText('Bienvenue dans le cours');
      await user.click(previewLesson);
      
      expect(defaultProps.onPreview).toHaveBeenCalledWith('lesson1');
    });
  });

  describe('Section Management', () => {
    test('renders section expand/collapse toggles', () => {
      renderComponent();
      
      const toggleButtons = screen.getAllByLabelText('Basculer la section');
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    test('expands sections by default when specified', () => {
      renderComponent();
      
      // First section is expanded by default
      const expandedSection = screen.getByText('Introduction et Fondamentaux').closest('.section-item');
      expect(expandedSection).toHaveClass('section-item--expanded');
    });

    test('collapses sections by default when specified', () => {
      renderComponent();
      
      // Second section is collapsed by default
      const collapsedSection = screen.getByText('Hooks Avancés').closest('.section-item');
      expect(collapsedSection).toHaveClass('section-item--collapsed');
    });

    test('calls onSectionToggle when toggle is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const toggleButton = screen.getAllByLabelText('Basculer la section')[1]; // Second section
      await user.click(toggleButton);
      
      expect(defaultProps.onSectionToggle).toHaveBeenCalledWith('section2');
    });

    test('displays section lesson counts', () => {
      renderComponent();
      
      expect(screen.getByText('3 leçons')).toBeInTheDocument();
      expect(screen.getByText('2 leçons')).toBeInTheDocument();
    });

    test('shows section completion status', () => {
      renderComponent();
      
      const completedSection = screen.getByText('Introduction et Fondamentaux').closest('.section-item');
      expect(completedSection).toHaveClass('section-item--partial'); // 2/3 lessons completed
    });
  });

  describe('Prerequisites', () => {
    test('displays prerequisites list', () => {
      renderComponent();
      
      expect(screen.getByText('Prérequis')).toBeInTheDocument();
      expect(screen.getByText('Connaissance de base en JavaScript ES6+')).toBeInTheDocument();
      expect(screen.getByText('Notions de React (props, state, lifecycle)')).toBeInTheDocument();
    });

    test('shows prerequisite checkboxes', () => {
      renderComponent();
      
      const checkboxes = screen.getAllByTestId('prerequisite-checkbox');
      expect(checkboxes.length).toBe(2);
    });

    test('allows prerequisite completion tracking', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstCheckbox = screen.getAllByTestId('prerequisite-checkbox')[0];
      await user.click(firstCheckbox);
      
      expect(firstCheckbox).toBeChecked();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('renders as modal on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.getByTestId('course-sidebar-modal')).toBeInTheDocument();
    });

    test('shows mobile toggle button', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent({ isOpen: false });
      
      expect(screen.getByLabelText('Ouvrir la navigation du cours')).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent({ isOpen: true });
      
      const closeButton = screen.getByLabelText('Fermer');
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('adapts layout for tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderComponent();
      
      const sidebar = screen.getByTestId('course-sidebar');
      expect(sidebar).toHaveClass('course-sidebar--tablet');
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Sidebar du cours React Avancé')).toBeInTheDocument();
      expect(screen.getByLabelText('Leçon actuelle: Configuration de l\'environnement')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstLesson = screen.getByText('Bienvenue dans le cours');
      firstLesson.focus();
      
      expect(document.activeElement).toBe(firstLesson);
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      
      expect(document.activeElement).toBe(screen.getByText('Configuration de l\'environnement'));
    });

    test('announces lesson type to screen readers', () => {
      renderComponent();
      
      const videoLesson = screen.getByText('Bienvenue dans le cours');
      expect(videoLesson).toHaveAttribute('aria-label', 
        expect.stringContaining('Vidéo - 15 minutes')
      );
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
      
      const currentLesson = screen.getByText('Configuration de l\'environnement');
      expect(currentLesson).toHaveAttribute('aria-current', 'step');
    });
  });

  describe('Performance', () => {
    test('memoizes section calculations', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same props
      rerender(<CourseSidebar {...defaultProps} />);
      
      expect(screen.getByText('Progression: 33%')).toBeInTheDocument();
    });

    test('virtualizes long curriculum lists', () => {
      const longCurriculum = Array.from({ length: 50 }, (_, i) => ({
        id: `section${i}`,
        title: `Section ${i}`,
        lessons: Array.from({ length: 20 }, (_, j) => ({
          id: `lesson${i}-${j}`,
          title: `Leçon ${j}`,
          type: 'video' as const,
          duration: 10,
          isPreview: false,
          isCompleted: false,
          isLocked: false
        })),
        isExpanded: false
      }));
      
      renderComponent({ curriculum: longCurriculum });
      
      // Should only render visible sections
      const sectionElements = screen.getAllByTestId('curriculum-section');
      expect(sectionElements.length).toBeLessThan(50);
    });

    test('debounces section toggle actions', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const toggleButton = screen.getAllByLabelText('Basculer la section')[0];
      
      // Click rapidly multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(toggleButton);
      }
      
      // Should only toggle once due to debouncing
      expect(defaultProps.onSectionToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-time Updates', () => {
    test('updates progress when lesson is completed externally', () => {
      const { rerender } = renderComponent();
      
      // Simulate lesson completion
      const updatedCurriculum = mockCurriculum.map(section => ({
        ...section,
        lessons: section.lessons.map(lesson =>
          lesson.id === 'lesson2' ? { ...lesson, isCompleted: true } : lesson
        )
      }));
      
      rerender(<CourseSidebar {...defaultProps} curriculum={updatedCurriculum} />);
      
      expect(screen.getByText('Progression: 50%')).toBeInTheDocument(); // 3/6 lessons completed
    });

    test('updates current lesson when it changes externally', () => {
      const { rerender } = renderComponent();
      
      // Change current lesson
      rerender(<CourseSidebar {...defaultProps} currentLessonId="lesson4" />);
      
      const currentLesson = screen.getByText('useState et useEffect').closest('.lesson-item');
      expect(currentLesson).toHaveClass('lesson-item--current');
    });
  });

  describe('Error Handling', () => {
    test('handles missing curriculum data gracefully', () => {
      renderComponent({ curriculum: [] });
      
      expect(screen.getByText('Programme non disponible')).toBeInTheDocument();
    });

    test('handles missing course info gracefully', () => {
      const incompleteInfo = { ...mockCourseInfo, title: null };
      
      renderComponent({ courseInfo: incompleteInfo });
      
      expect(screen.getByText('Informations du cours non disponibles')).toBeInTheDocument();
    });

    test('shows error state for failed data loading', () => {
      renderComponent({ 
        error: 'Erreur lors du chargement du programme',
        curriculum: []
      });
      
      expect(screen.getByText('Erreur lors du chargement du programme')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  describe('Gamification Elements', () => {
    test('shows progress badges', () => {
      renderComponent();
      
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText(' demi-chemin')).toBeInTheDocument();
    });

    test('displays achievement milestones', () => {
      renderComponent();
      
      expect(screen.getByText('🎯 Prochaine étape:')).toBeInTheDocument();
      expect(screen.getByText('Terminer la section "Hooks Avancés"')).toBeInTheDocument();
    });

    test('shows learning streak indicator', () => {
      renderComponent();
      
      expect(screen.getByText('🔥 Série: 5 jours')).toBeInTheDocument();
    });
  });

  describe('Integration with Course Player', () => {
    test('synchronizes with external lesson changes', () => {
      const { rerender } = renderComponent();
      
      // Simulate player lesson change
      rerender(<CourseSidebar {...defaultProps} currentLessonId="lesson4" />);
      
      expect(screen.getByText('useState et useEffect')).toHaveAttribute('aria-current', 'step');
    });

    test('handles auto-play progression', () => {
      const { rerender } = renderComponent();
      
      // Simulate lesson auto-completion
      const autoCompleteData = {
        ...defaultProps,
        curriculum: mockCurriculum.map(section => ({
          ...section,
          lessons: section.lessons.map(lesson =>
            lesson.id === 'lesson2' ? { ...lesson, isCompleted: true } : lesson
          )
        }))
      };
      
      rerender(autoCompleteData);
      
      expect(screen.getByText('Progression: 50%')).toBeInTheDocument();
    });
  });

  describe('Sharing and Social Features', () => {
    test('displays share menu when share button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const shareButton = screen.getByLabelText('Partager ce cours');
      await user.click(shareButton);
      
      expect(screen.getByText('Copier le lien')).toBeInTheDocument();
      expect(screen.getByText('Partager sur Twitter')).toBeInTheDocument();
      expect(screen.getByText('Partager sur LinkedIn')).toBeInTheDocument();
    });

    test('shows social proof elements', () => {
      renderComponent();
      
      expect(screen.getByText('8 420 étudiants inscrits')).toBeInTheDocument();
      expect(screen.getByText('1 247 avis vérifiés')).toBeInTheDocument();
    });

    test('displays trending indicators', () => {
      renderComponent();
      
      expect(screen.getByText('🔥 Populaire')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles when theme is dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const sidebar = screen.getByTestId('course-sidebar');
      expect(sidebar).toHaveClass('course-sidebar--dark');
    });

    test('adapts color scheme for better contrast', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const currentLesson = screen.getByText('Configuration de l\'environnement').closest('.lesson-item');
      expect(currentLesson).toHaveClass('lesson-item--current-dark');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long course titles', () => {
      const longTitleInfo = {
        ...mockCourseInfo,
        title: 'Introduction Complète au Développement Web Avancé avec React, TypeScript, Node.js et les Technologies Modernes pour Créer des Applications d\'Entreprise Robustes et Scalables'
      };
      
      renderComponent({ courseInfo: longTitleInfo });
      
      expect(screen.getByText('Introduction Complète au Développement Web Avancé')).toBeInTheDocument();
    });

    test('handles courses with many sections', () => {
      const manySections = Array.from({ length: 20 }, (_, i) => ({
        id: `section${i}`,
        title: `Section ${i}`,
        lessons: [{
          id: `lesson${i}`,
          title: `Leçon ${i}`,
          type: 'video' as const,
          duration: 10,
          isPreview: false,
          isCompleted: false,
          isLocked: false
        }],
        isExpanded: false
      }));
      
      renderComponent({ curriculum: manySections });
      
      expect(screen.getByText('Section 0')).toBeInTheDocument();
      expect(screen.getByText('Section 19')).toBeInTheDocument();
    });

    test('handles courses with no lessons', () => {
      renderComponent({ curriculum: [] });
      
      expect(screen.getByText('Programme non disponible')).toBeInTheDocument();
    });

    test('handles extremely narrow screen widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      renderComponent();
      
      expect(screen.getByTestId('course-sidebar-modal')).toBeInTheDocument();
    });

    test('handles courses with only preview lessons', () => {
      const previewOnlyCurriculum = [
        {
          id: 'preview',
          title: 'Aperçu du cours',
          lessons: [
            {
              id: 'preview1',
              title: 'Introduction au cours',
              type: 'video' as const,
              duration: 10,
              isPreview: true,
              isCompleted: false,
              isLocked: false
            }
          ],
          isExpanded: true
        }
      ];
      
      renderComponent({ curriculum: previewOnlyCurriculum });
      
      expect(screen.getByText('Aperçu du cours')).toBeInTheDocument();
      expect(screen.getByText('Aperçu gratuit')).toBeInTheDocument();
    });
  });
});