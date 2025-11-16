/**
 * CourseStats.test.tsx
 * Tests for CourseStats component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseStats, { CourseStatsProps, CourseAnalytics, StudentData } from './CourseStats';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockCourseAnalytics: CourseAnalytics = {
  totalEnrollments: 2847,
  activeStudents: 1234,
  completionRate: 73.5,
  averageProgress: 68.2,
  totalRevenue: 427050.99,
  averageRating: 4.7,
  totalRatings: 1247,
  bounceRate: 18.3,
  averageTimeToComplete: 42.5, // hours
  certificatesIssued: 2091,
  totalRevenueThisMonth: 89450.75,
  enrollmentTrend: 15.8
};

const mockStudentsData: StudentData[] = [
  {
    id: 'student1',
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    enrolledDate: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-25T14:30:00Z',
    progress: 85,
    completionRate: 85,
    totalTimeSpent: 1450, // minutes
    averageSessionTime: 45,
    quizScore: 92,
    assignmentsSubmitted: 8,
    certificatesEarned: 1,
    status: 'active'
  },
  {
    id: 'student2',
    name: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    enrolledDate: '2024-01-10T09:15:00Z',
    lastActivity: '2024-01-24T16:45:00Z',
    progress: 100,
    completionRate: 100,
    totalTimeSpent: 2380,
    averageSessionTime: 52,
    quizScore: 88,
    assignmentsSubmitted: 10,
    certificatesEarned: 1,
    status: 'completed'
  },
  {
    id: 'student3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    enrolledDate: '2024-01-20T11:30:00Z',
    lastActivity: '2024-01-22T10:15:00Z',
    progress: 15,
    completionRate: 15,
    totalTimeSpent: 125,
    averageSessionTime: 25,
    quizScore: 45,
    assignmentsSubmitted: 1,
    certificatesEarned: 0,
    status: 'inactive'
  },
  {
    id: 'student4',
    name: 'Antoine Garcia',
    email: 'antoine.garcia@email.com',
    enrolledDate: '2024-01-05T08:00:00Z',
    lastActivity: '2024-01-18T13:20:00Z',
    progress: 45,
    completionRate: 45,
    totalTimeSpent: 780,
    averageSessionTime: 35,
    quizScore: 72,
    assignmentsSubmitted: 4,
    certificatesEarned: 0,
    status: 'dropped'
  }
];

const defaultProps: CourseStatsProps = {
  courseId: 'react-advanced',
  courseTitle: 'React Avancé - Maîtrisez les Hooks',
  analytics: mockCourseAnalytics,
  studentsData: mockStudentsData,
  instructorId: 'instructor1',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  },
  showDetailed: true,
  showRevenue: true,
  showStudentData: true,
  onStudentClick: vi.fn(),
  onExportData: vi.fn()
};

const renderComponent = (props: Partial<CourseStatsProps> = {}) => {
  return render(<CourseStats {...defaultProps} {...props} />);
};

describe('CourseStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the stats container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-stats')).toBeInTheDocument();
    });

    test('displays course title and subtitle', () => {
      renderComponent();
      
      expect(screen.getByText('React Avancé - Maîtrisez les Hooks - Statistiques')).toBeInTheDocument();
      expect(screen.getByText('Analytics et données d\'apprentissage')).toBeInTheDocument();
    });

    test('renders export button', () => {
      renderComponent();
      
      expect(screen.getByText('Exporter')).toBeInTheDocument();
    });

    test('shows loading state when loading is true', () => {
      renderComponent({ isLoading: true });
      
      expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
    });
  });

  describe('Overview Cards', () => {
    test('displays enrollment metrics', () => {
      renderComponent();
      
      expect(screen.getByText('2 847')).toBeInTheDocument();
      expect(screen.getByText('Inscriptions')).toBeInTheDocument();
      expect(screen.getByText('+15.8% ce mois')).toBeInTheDocument();
    });

    test('displays completion rate', () => {
      renderComponent();
      
      expect(screen.getByText('74%')).toBeInTheDocument();
      expect(screen.getByText('Taux de réussite')).toBeInTheDocument();
      expect(screen.getByText('2 091 certificats émis')).toBeInTheDocument();
    });

    test('displays active students count', () => {
      renderComponent();
      
      expect(screen.getByText('1 234')).toBeInTheDocument();
      expect(screen.getByText('Étudiants actifs')).toBeInTheDocument();
      expect(screen.getByText('43% du total')).toBeInTheDocument();
    });

    test('displays average rating', () => {
      renderComponent();
      
      expect(screen.getByText('4.7/5')).toBeInTheDocument();
      expect(screen.getByText('Note moyenne')).toBeInTheDocument();
      expect(screen.getByText('1 247 avis')).toBeInTheDocument();
    });

    test('displays revenue when showRevenue is true', () => {
      renderComponent({ showRevenue: true });
      
      expect(screen.getByText('427 050,99 €')).toBeInTheDocument();
      expect(screen.getByText('Revenus')).toBeInTheDocument();
      expect(screen.getByText('89 450,75 € ce mois')).toBeInTheDocument();
    });

    test('hides revenue when showRevenue is false', () => {
      renderComponent({ showRevenue: false });
      
      expect(screen.queryByText('427 050,99 €')).not.toBeInTheDocument();
      expect(screen.queryByText('Revenus')).not.toBeInTheDocument();
    });

    test('displays average completion time', () => {
      renderComponent();
      
      expect(screen.getByText('42h 30m')).toBeInTheDocument();
      expect(screen.getByText('Temps moyen')).toBeInTheDocument();
      expect(screen.getByText('Pour terminer')).toBeInTheDocument();
    });

    test('shows positive/negative trends correctly', () => {
      const negativeTrend = {
        ...mockCourseAnalytics,
        enrollmentTrend: -5.2,
        bounceRate: 22.1
      };
      
      renderComponent({ analytics: negativeTrend });
      
      expect(screen.getByText('-5.2% ce mois')).toBeInTheDocument();
      expect(screen.getByText('-5.2% ce mois')).toHaveClass('course-stats__overview-change--negative');
    });
  });

  describe('Export Functionality', () => {
    test('opens export menu when export button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const exportButton = screen.getByText('Exporter');
      await user.click(exportButton);
      
      expect(screen.getByText('Télécharger CSV')).toBeInTheDocument();
      expect(screen.getByText('Télécharger PDF')).toBeInTheDocument();
      expect(screen.getByText('Télécharger Excel')).toBeInTheDocument();
    });

    test('calls onExportData when export option is clicked', async () => {
      const user = userEvent.setup();
      const onExportData = vi.fn();
      
      renderComponent({ onExportData });
      
      const exportButton = screen.getByText('Exporter');
      await user.click(exportButton);
      
      const csvOption = screen.getByText('Télécharger CSV');
      await user.click(csvOption);
      
      expect(onExportData).toHaveBeenCalledWith('csv');
    });

    test('shows loading state during export', async () => {
      const user = userEvent.setup();
      const onExportData = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      renderComponent({ onExportData });
      
      const exportButton = screen.getByText('Exporter');
      await user.click(exportButton);
      
      const csvOption = screen.getByText('Télécharger CSV');
      await user.click(csvOption);
      
      // Should disable button during export
      expect(exportButton).toBeDisabled();
    });

    test('closes export menu after successful export', async () => {
      const user = userEvent.setup();
      const onExportData = vi.fn();
      
      renderComponent({ onExportData });
      
      const exportButton = screen.getByText('Exporter');
      await user.click(exportButton);
      
      const csvOption = screen.getByText('Télécharger CSV');
      await user.click(csvOption);
      
      await waitFor(() => {
        expect(screen.queryByText('Télécharger CSV')).not.toBeInTheDocument();
      });
    });
  });

  describe('Detailed Analytics', () => {
    test('displays detailed analytics when showDetailed is true', () => {
      renderComponent();
      
      expect(screen.getByText('Analytics détaillées')).toBeInTheDocument();
    });

    test('hides detailed analytics when showDetailed is false', () => {
      renderComponent({ showDetailed: false });
      
      expect(screen.queryByText('Analytics détaillées')).not.toBeInTheDocument();
    });

    test('renders metric selector', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Sélectionner la métrique')).toBeInTheDocument();
      expect(screen.getByText('Inscriptions')).toBeInTheDocument();
      expect(screen.getByText('Achèvement')).toBeInTheDocument();
      expect(screen.getByText('Engagement')).toBeInTheDocument();
    });

    test('renders timeframe selector', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Sélectionner la période')).toBeInTheDocument();
      expect(screen.getByText('Jour')).toBeInTheDocument();
      expect(screen.getByText('Semaine')).toBeInTheDocument();
      expect(screen.getByText('Mois')).toBeInTheDocument();
      expect(screen.getByText('Année')).toBeInTheDocument();
    });

    test('displays chart placeholder', () => {
      renderComponent();
      
      expect(screen.getByText('Graphique Inscriptions - Mois')).toBeInTheDocument();
      expect(screen.getByText('[Graphique intégré ici - Inscriptions pour Mois]')).toBeInTheDocument();
    });
  });

  describe('Student Data Table', () => {
    test('displays student data when showStudentData is true', () => {
      renderComponent();
      
      expect(screen.getByText('Données des étudiants')).toBeInTheDocument();
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
      expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
      expect(screen.getByText('Antoine Garcia')).toBeInTheDocument();
    });

    test('hides student data when showStudentData is false', () => {
      renderComponent({ showStudentData: false });
      
      expect(screen.queryByText('Données des étudiants')).not.toBeInTheDocument();
      expect(screen.queryByText('Marie Dupont')).not.toBeInTheDocument();
    });

    test('displays student email addresses', () => {
      renderComponent();
      
      expect(screen.getByText('marie.dupont@email.com')).toBeInTheDocument();
      expect(screen.getByText('pierre.martin@email.com')).toBeInTheDocument();
    });

    test('shows enrollment dates', () => {
      renderComponent();
      
      expect(screen.getByText('15 janv. 2024')).toBeInTheDocument();
      expect(screen.getByText('10 janv. 2024')).toBeInTheDocument();
    });

    test('displays last activity dates', () => {
      renderComponent();
      
      expect(screen.getByText('25 janv. 2024')).toBeInTheDocument();
      expect(screen.getByText('24 janv. 2024')).toBeInTheDocument();
    });

    test('shows student progress', () => {
      renderComponent();
      
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    test('displays time spent information', () => {
      renderComponent();
      
      expect(screen.getByText('24h 10m')).toBeInTheDocument(); // 1450 minutes
      expect(screen.getByText('avg: 45m')).toBeInTheDocument();
    });

    test('shows student status badges', () => {
      renderComponent();
      
      expect(screen.getByText('Actif')).toBeInTheDocument();
      expect(screen.getByText('Terminé')).toBeInTheDocument();
      expect(screen.getByText('Inactif')).toBeInTheDocument();
      expect(screen.getByText('Abandonné')).toBeInTheDocument();
    });

    test('displays certificate counts', () => {
      renderComponent();
      
      expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Marie has 1
      expect(screen.getAllByText('1')[1]).toBeInTheDocument(); // Pierre has 1
    });

    test('shows progress color coding', () => {
      renderComponent();
      
      const highProgress = screen.getByText('85%').closest('.course-stats__progress-cell');
      expect(highProgress).toHaveClass('course-stats__progress--high');
      
      const mediumProgress = screen.getByText('45%').closest('.course-stats__progress-cell');
      expect(mediumProgress).toHaveClass('course-stats__progress--medium');
      
      const lowProgress = screen.getByText('15%').closest('.course-stats__progress-cell');
      expect(lowProgress).toHaveClass('course-stats__progress--low');
    });
  });

  describe('Filtering and Sorting', () => {
    test('renders status filter', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Filtrer par statut')).toBeInTheDocument();
      expect(screen.getByText('Tous les statuts')).toBeInTheDocument();
      expect(screen.getByText('Actifs')).toBeInTheDocument();
      expect(screen.getByText('Terminés')).toBeInTheDocument();
      expect(screen.getByText('Inactifs')).toBeInTheDocument();
      expect(screen.getByText('Abandonnés')).toBeInTheDocument();
    });

    test('filters students by status', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const statusFilter = screen.getByLabelText('Filtrer par statut');
      await user.selectOptions(statusFilter, 'active');
      
      // Should only show active students
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
      expect(screen.queryByText('Pierre Martin')).not.toBeInTheDocument();
      expect(screen.queryByText('Sophie Laurent')).not.toBeInTheDocument();
    });

    test('renders sort controls', () => {
      renderComponent();
      
      expect(screen.getByText('Nom')).toBeInTheDocument();
      expect(screen.getByText('Progression')).toBeInTheDocument();
      expect(screen.getByText('Dernière activité')).toBeInTheDocument();
    });

    test('sorts students by name', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const nameSortButton = screen.getByText('Nom');
      await user.click(nameSortButton);
      
      // Should sort alphabetically
      const studentCells = screen.getAllByTestId('student-name');
      expect(studentCells[0]).toHaveTextContent('Antoine Garcia');
      expect(studentCells[1]).toHaveTextContent('Marie Dupont');
    });

    test('sorts students by progress', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const progressSortButton = screen.getByText('Progression');
      await user.click(progressSortButton);
      
      // Should sort by progress percentage
      const progressCells = screen.getAllByTestId('student-progress-text');
      expect(progressCells[0]).toHaveTextContent('100%');
      expect(progressCells[1]).toHaveTextContent('85%');
    });

    test('toggles sort order when same column is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const progressSortButton = screen.getByText('Progression');
      await user.click(progressSortButton); // Descending
      await user.click(progressSortButton); // Ascending
      
      // Should reverse the order
      const progressCells = screen.getAllByTestId('student-progress-text');
      expect(progressCells[0]).toHaveTextContent('15%'); // Lowest first
      expect(progressCells[3]).toHaveTextContent('100%'); // Highest last
    });
  });

  describe('Pagination', () => {
    test('displays pagination when there are many students', () => {
      const manyStudents = Array.from({ length: 50 }, (_, i) => ({
        id: `student${i}`,
        name: `Student ${i}`,
        email: `student${i}@email.com`,
        enrolledDate: '2024-01-15T10:00:00Z',
        lastActivity: '2024-01-25T14:30:00Z',
        progress: 50,
        completionRate: 50,
        totalTimeSpent: 500,
        averageSessionTime: 25,
        quizScore: 75,
        assignmentsSubmitted: 5,
        certificatesEarned: 0,
        status: 'active' as const
      }));
      
      renderComponent({ studentsData: manyStudents });
      
      expect(screen.getByLabelText('Page 1 sur 5')).toBeInTheDocument();
    });

    test('calls onPageChange when page button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const nextButton = screen.getByLabelText('Page suivante');
      await user.click(nextButton);
      
      // Should change to page 2 (if we had many students)
      expect(screen.getByLabelText('Page 1 sur 1')).toBeInTheDocument(); // Just 4 students
    });
  });

  describe('Student Interactions', () => {
    test('calls onStudentClick when student row is clicked', async () => {
      const user = userEvent.setup();
      const onStudentClick = vi.fn();
      
      renderComponent({ onStudentClick });
      
      const studentRow = screen.getByText('Marie Dupont').closest('.course-stats__table-row');
      await user.click(studentRow!);
      
      expect(onStudentClick).toHaveBeenCalledWith(mockStudentsData[0]);
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const firstStudent = screen.getByText('Marie Dupont');
      firstStudent.focus();
      
      expect(document.activeElement).toBe(firstStudent.closest('.course-stats__table-row'));
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      
      expect(document.activeElement).toBe(screen.getByText('Pierre Martin').closest('.course-stats__table-row'));
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts layout for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      const stats = screen.getByTestId('course-stats');
      expect(stats).toHaveClass('course-stats--mobile');
    });

    test('shows mobile-optimized overview cards', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      // Should stack cards vertically on mobile
      const overviewCards = screen.getAllByTestId('overview-card-mobile');
      expect(overviewCards.length).toBeGreaterThan(0);
    });

    test('hides detailed table on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('shows mobile summary instead of table', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.getByText('Marie Dupont: 85%')).toBeInTheDocument();
      expect(screen.getByText('Pierre Martin: 100%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Options d\'export')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner la métrique')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner la période')).toBeInTheDocument();
    });

    test('supports keyboard navigation in table', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const table = screen.getByRole('table');
      table.focus();
      
      expect(document.activeElement).toBe(table);
      
      // Navigate with arrow keys within table
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowDown}');
      
      expect(document.activeElement).toBe(screen.getByText('Pierre Martin').closest('.course-stats__table-row'));
    });

    test('announces data changes to screen readers', () => {
      renderComponent();
      
      const exportButton = screen.getByText('Exporter');
      expect(exportButton).toHaveAttribute('aria-label', 
        'Options d\'export - Disponible en CSV, PDF, Excel'
      );
    });

    test('provides alternative text for visual elements', () => {
      renderComponent();
      
      const progressBars = screen.getAllByTestId('progress-bar');
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('aria-label', expect.stringContaining('Progression'));
      });
    });
  });

  describe('Data Validation', () => {
    test('handles missing analytics data gracefully', () => {
      const incompleteAnalytics = {
        ...mockCourseAnalytics,
        totalEnrollments: null,
        averageRating: null
      };
      
      renderComponent({ analytics: incompleteAnalytics });
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test('handles empty students array', () => {
      renderComponent({ studentsData: [] });
      
      expect(screen.getByText('Aucun étudiant trouvé')).toBeInTheDocument();
    });

    test('handles invalid progress percentages', () => {
      const invalidStudents = [
        {
          ...mockStudentsData[0],
          progress: 150, // Over 100%
          completionRate: -10 // Negative
        }
      ];
      
      renderComponent({ studentsData: invalidStudents });
      
      // Should clamp values appropriately
      expect(screen.getByText('100%')).toBeInTheDocument(); // Clamped from 150%
      expect(screen.getByText('0%')).toBeInTheDocument(); // Clamped from -10%
    });

    test('handles zero values correctly', () => {
      const zeroAnalytics = {
        ...mockCourseAnalytics,
        totalEnrollments: 0,
        totalRevenue: 0,
        certificatesIssued: 0
      };
      
      renderComponent({ analytics: zeroAnalytics });
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0 certificats émis')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    test('updates when analytics change externally', () => {
      const { rerender } = renderComponent();
      
      const updatedAnalytics = {
        ...mockCourseAnalytics,
        totalEnrollments: 3000,
        activeStudents: 1400,
        completionRate: 75.2
      };
      
      rerender(<CourseStats {...defaultProps} analytics={updatedAnalytics} />);
      
      expect(screen.getByText('3 000')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    test('updates when students data changes', () => {
      const { rerender } = renderComponent();
      
      const updatedStudents = mockStudentsData.map(student =>
        student.id === 'student1' ? { ...student, progress: 90 } : student
      );
      
      rerender(<CourseStats {...defaultProps} studentsData={updatedStudents} />);
      
      expect(screen.getByText('90%')).toBeInTheDocument(); // Updated progress
    });

    test('animates metric updates', async () => {
      const { rerender } = renderComponent();
      
      const updatedAnalytics = {
        ...mockCourseAnalytics,
        totalEnrollments: 3000
      };
      
      rerender(<CourseStats {...defaultProps} analytics={updatedAnalytics} />);
      
      const enrollmentCard = screen.getByText('3 000').closest('.course-stats__overview-card');
      expect(enrollmentCard).toHaveClass('course-stats__overview-card--updating');
    });
  });

  describe('Performance', () => {
    test('memoizes calculations', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same data
      rerender(<CourseStats {...defaultProps} />);
      
      expect(screen.getByText('2 847')).toBeInTheDocument();
    });

    test('virtualizes large student lists', () => {
      const manyStudents = Array.from({ length: 1000 }, (_, i) => ({
        id: `student${i}`,
        name: `Student ${i}`,
        email: `student${i}@email.com`,
        enrolledDate: '2024-01-15T10:00:00Z',
        lastActivity: '2024-01-25T14:30:00Z',
        progress: 50,
        completionRate: 50,
        totalTimeSpent: 500,
        averageSessionTime: 25,
        quizScore: 75,
        assignmentsSubmitted: 5,
        certificatesEarned: 0,
        status: 'active' as const
      }));
      
      renderComponent({ studentsData: manyStudents });
      
      // Should only render visible rows
      const tableRows = screen.getAllByTestId('student-table-row');
      expect(tableRows.length).toBeLessThan(100); // Virtualization limit
    });
  });

  describe('Error Handling', () => {
    test('displays error message when data fails to load', () => {
      renderComponent({ 
        error: 'Erreur lors du chargement des statistiques',
        analytics: null
      });
      
      expect(screen.getByText('Erreur lors du chargement des statistiques')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    test('shows retry functionality', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      
      renderComponent({ 
        error: 'Erreur réseau',
        onRetry 
      });
      
      const retryButton = screen.getByText('Réessayer');
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    test('handles network timeouts gracefully', () => {
      renderComponent({ 
        isLoading: false,
        error: 'Timeout de connexion',
        analytics: null
      });
      
      expect(screen.getByText('La connexion a pris trop de temps')).toBeInTheDocument();
      expect(screen.getByText('Vérifiez votre connexion internet')).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    test('tracks export actions', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      
      renderComponent({ onAnalyticsEvent });
      
      const exportButton = screen.getByText('Exporter');
      await user.click(exportButton);
      
      const csvOption = screen.getByText('Télécharger CSV');
      await user.click(csvOption);
      
      expect(onAnalyticsEvent).toHaveBeenCalledWith('stats_export', {
        format: 'csv',
        courseId: 'react-advanced',
        timestamp: expect.any(Number)
      });
    });

    test('tracks filter interactions', async () => {
      const user = userEvent.setup();
      const onAnalyticsEvent = vi.fn();
      
      renderComponent({ onAnalyticsEvent });
      
      const statusFilter = screen.getByLabelText('Filtrer par statut');
      await user.selectOptions(statusFilter, 'active');
      
      expect(onAnalyticsEvent).toHaveBeenCalledWith('student_filter', {
        filterType: 'status',
        filterValue: 'active',
        resultCount: 1,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles when theme is dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const stats = screen.getByTestId('course-stats');
      expect(stats).toHaveClass('course-stats--dark');
    });

    test('adapts color scheme for better contrast', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      renderComponent();
      
      const overviewCard = screen.getByText('2 847').closest('.course-stats__overview-card');
      expect(overviewCard).toHaveClass('course-stats__overview-card--dark');
    });
  });

  describe('Edge Cases', () => {
    test('handles extremely large numbers', () => {
      const hugeNumbers = {
        ...mockCourseAnalytics,
        totalEnrollments: 999999999,
        totalRevenue: 999999999999.99
      };
      
      renderComponent({ analytics: hugeNumbers });
      
      expect(screen.getByText('999 999 999')).toBeInTheDocument();
      expect(screen.getByText('999 999 999 999,99 €')).toBeInTheDocument();
    });

    test('handles courses with no students', () => {
      renderComponent({ studentsData: [] });
      
      expect(screen.getByText('Données des étudiants')).toBeInTheDocument();
      expect(screen.getByText('Aucun étudiant trouvé')).toBeInTheDocument();
    });

    test('handles students with missing data', () => {
      const incompleteStudents = [
        {
          id: 'incomplete1',
          name: 'Incomplete Student',
          email: 'incomplete@email.com',
          enrolledDate: '2024-01-15T10:00:00Z',
          lastActivity: '2024-01-25T14:30:00Z',
          progress: null,
          completionRate: null,
          totalTimeSpent: null,
          averageSessionTime: null,
          quizScore: null,
          assignmentsSubmitted: null,
          certificatesEarned: null,
          status: 'active' as const
        }
      ];
      
      renderComponent({ studentsData: incompleteStudents });
      
      expect(screen.getByText('Incomplete Student')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test('handles very long student names', () => {
      const longNameStudent = {
        ...mockStudentsData[0],
        name: 'Marie-Françoise-Isabelle Élisabeth de la Rochefoucauld-Montbeliard'
      };
      
      renderComponent({ studentsData: [longNameStudent] });
      
      expect(screen.getByText('Marie-Françoise-Isabelle Élisabeth de la Rochefoucauld-Montbeliard')).toBeInTheDocument();
      // Should truncate if necessary
      const nameElement = screen.getByText('Marie-Françoise-Isabelle Élisabeth de la Rochefoucauld-Montbeliard').parentElement;
      expect(nameElement).toHaveClass('course-stats__student-name--truncated');
    });

    test('handles date range filtering', () => {
      renderComponent({ 
        dateRange: {
          start: new Date('2024-01-15'),
          end: new Date('2024-01-31')
        }
      });
      
      expect(screen.getByText('Période: 15 janv. 2024 - 31 janv. 2024')).toBeInTheDocument();
    });
  });

  describe('Integration with Course Management', () => {
    test('synchronizes with course updates', () => {
      const { rerender } = renderComponent();
      
      // Simulate course title change
      rerender(<CourseStats {...defaultProps} courseTitle="React Expert - Hooks Avancés" />);
      
      expect(screen.getByText('React Expert - Hooks Avancés - Statistiques')).toBeInTheDocument();
    });

    test('handles instructor changes', () => {
      const { rerender } = renderComponent();
      
      rerender(<CourseStats {...defaultProps} instructorId="instructor2" />);
      
      // Should update analytics based on new instructor
      expect(screen.getByText('2 847')).toBeInTheDocument();
    });
  });
});