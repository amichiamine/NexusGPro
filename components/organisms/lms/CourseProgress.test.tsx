/**
 * CourseProgress.test.tsx
 * Tests for CourseProgress component
 * Part of the LMS (Learning Management System) organisms
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseProgress, { CourseProgressProps } from './CourseProgress';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock data for testing
const mockProgressData = {
  courseId: '1',
  enrolledDate: '2024-01-15T10:00:00Z',
  lastActivity: '2024-01-20T14:30:00Z',
  totalLessons: 25,
  completedLessons: 12,
  totalDuration: 1800, // minutes
  completedDuration: 720, // minutes
  currentLessonId: '13',
  currentLessonProgress: 65, // percentage
  streakDays: 7,
  totalTimeSpent: 1440, // minutes
  averageSessionTime: 45, // minutes
  certificatesEarned: 1,
  badges: [
    {
      id: 'early-bird',
      title: 'Débutant précoce',
      description: 'Complété 5 leçons dans la première semaine',
      icon: 'early-bird',
      earnedDate: '2024-01-22T10:00:00Z',
      rarity: 'common'
    },
    {
      id: 'consistency-7',
      title: 'Série de 7 jours',
      description: '7 jours consécutifs d\'apprentissage',
      icon: 'streak',
      earnedDate: '2024-01-22T10:00:00Z',
      rarity: 'uncommon'
    }
  ],
  achievements: [
    {
      id: 'first-quiz',
      title: 'Premier Quiz',
      description: 'A réussi son premier quiz',
      progress: 100,
      target: 1,
      completed: true
    },
    {
      id: 'watch-master',
      title: 'Master du Visionnage',
      description: 'Regardé 20 heures de cours',
      progress: 12,
      target: 20,
      completed: false
    }
  ],
  milestones: [
    { id: 'milestone-25', title: '25% du cours', target: 0.25, achieved: false },
    { id: 'milestone-50', title: '50% du cours', target: 0.50, achieved: false },
    { id: 'milestone-75', title: '75% du cours', target: 0.75, achieved: false },
    { id: 'milestone-100', title: 'Cours terminé', target: 1.00, achieved: false }
  ]
};

const defaultProps: CourseProgressProps = {
  progressData: mockProgressData,
  variant: 'detailed',
  showTimeSpent: true,
  showStreak: true,
  showBadges: true,
  showAchievements: true,
  showMilestones: true,
  showCertificate: true,
  compactView: false,
  onViewCertificate: vi.fn(),
  onViewLeaderboard: vi.fn(),
  onShareProgress: vi.fn()
};

const renderComponent = (props: Partial<CourseProgressProps> = {}) => {
  return render(<CourseProgress {...defaultProps} {...props} />);
};

describe('CourseProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders the progress container', () => {
      renderComponent();
      
      expect(screen.getByTestId('course-progress')).toBeInTheDocument();
    });

    test('renders in detailed variant by default', () => {
      renderComponent();
      
      const progress = screen.getByTestId('course-progress');
      expect(progress).toHaveClass('course-progress--detailed');
    });

    test('renders in compact variant', () => {
      renderComponent({ variant: 'compact' });
      
      const progress = screen.getByTestId('course-progress');
      expect(progress).toHaveClass('course-progress--compact');
    });

    test('renders in minimal variant', () => {
      renderComponent({ variant: 'minimal' });
      
      const progress = screen.getByTestId('course-progress');
      expect(progress).toHaveClass('course-progress--minimal');
    });

    test('renders compact view when compactView is true', () => {
      renderComponent({ compactView: true });
      
      const progress = screen.getByTestId('course-progress');
      expect(progress).toHaveClass('course-progress--compact-view');
    });
  });

  describe('Overall Progress', () => {
    test('displays overall completion percentage', () => {
      renderComponent();
      
      expect(screen.getByText('48%')).toBeInTheDocument();
    });

    test('displays progress bar', () => {
      renderComponent();
      
      expect(screen.getByTestId('overall-progress-bar')).toBeInTheDocument();
    });

    test('shows completed lessons count', () => {
      renderComponent();
      
      expect(screen.getByText('12 sur 25 leçons')).toBeInTheDocument();
    });

    test('displays completion status text', () => {
      renderComponent();
      
      expect(screen.getByText('En cours')).toBeInTheDocument();
    });

    test('shows time remaining estimate', () => {
      renderComponent();
      
      expect(screen.getByText('18h restantes')).toBeInTheDocument();
    });

    test('displays total course duration', () => {
      renderComponent();
      
      expect(screen.getByText('30h au total')).toBeInTheDocument();
    });
  });

  describe('Current Lesson Progress', () => {
    test('displays current lesson progress', () => {
      renderComponent();
      
      expect(screen.getByText('Leçon actuelle: 65%')).toBeInTheDocument();
    });

    test('shows current lesson progress bar', () => {
      renderComponent();
      
      expect(screen.getByTestId('current-lesson-progress-bar')).toBeInTheDocument();
    });

    test('displays current lesson title', () => {
      renderComponent();
      
      expect(screen.getByText('Leçon en cours')).toBeInTheDocument();
    });

    test('shows time spent in current lesson', () => {
      renderComponent();
      
      expect(screen.getByText('29 min passées')).toBeInTheDocument();
    });

    test('estimates time remaining for current lesson', () => {
      renderComponent();
      
      expect(screen.getByText('16 min restantes')).toBeInTheDocument();
    });
  });

  describe('Time Tracking', () => {
    test('displays total time spent when showTimeSpent is true', () => {
      renderComponent();
      
      expect(screen.getByText('24h passées au total')).toBeInTheDocument();
    });

    test('hides time spent when showTimeSpent is false', () => {
      renderComponent({ showTimeSpent: false });
      
      expect(screen.queryByText('24h passées au total')).not.toBeInTheDocument();
    });

    test('shows average session time', () => {
      renderComponent();
      
      expect(screen.getByText('45 min par session')).toBeInTheDocument();
    });

    test('displays time breakdown by week', () => {
      renderComponent();
      
      expect(screen.getByText('Cette semaine: 8h')).toBeInTheDocument();
      expect(screen.getByText('Semaine dernière: 16h')).toBeInTheDocument();
    });

    test('shows daily learning chart', () => {
      renderComponent();
      
      expect(screen.getByTestId('daily-learning-chart')).toBeInTheDocument();
    });
  });

  describe('Streak Tracking', () => {
    test('displays current streak when showStreak is true', () => {
      renderComponent();
      
      expect(screen.getByText('7 jours consécutifs')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    test('hides streak when showStreak is false', () => {
      renderComponent({ showStreak: false });
      
      expect(screen.queryByText('7 jours consécutifs')).not.toBeInTheDocument();
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });

    test('shows streak history', () => {
      renderComponent();
      
      expect(screen.getByText('Série actuelle: 7 jours')).toBeInTheDocument();
      expect(screen.getByText('Meilleure série: 12 jours')).toBeInTheDocument();
    });

    test('displays streak motivation message', () => {
      renderComponent();
      
      expect(screen.getByText('Excellente régularité !')).toBeInTheDocument();
    });

    test('encourages streak continuation', () => {
      renderComponent();
      
      expect(screen.getByText('Continuez votre streak demain !')).toBeInTheDocument();
    });
  });

  describe('Badges and Achievements', () => {
    test('displays earned badges when showBadges is true', () => {
      renderComponent();
      
      expect(screen.getByText('Débutant précoce')).toBeInTheDocument();
      expect(screen.getByText('Série de 7 jours')).toBeInTheDocument();
    });

    test('hides badges when showBadges is false', () => {
      renderComponent({ showBadges: false });
      
      expect(screen.queryByText('Débutant précoce')).not.toBeInTheDocument();
      expect(screen.queryByText('Série de 7 jours')).not.toBeInTheDocument();
    });

    test('shows badge icons', () => {
      renderComponent();
      
      expect(screen.getByTestId('badge-icon-early-bird')).toBeInTheDocument();
      expect(screen.getByTestId('badge-icon-streak')).toBeInTheDocument();
    });

    test('displays badge descriptions on hover', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const badge = screen.getByTestId('badge-icon-early-bird');
      await user.hover(badge);
      
      expect(screen.getByText('Complété 5 leçons dans la première semaine')).toBeInTheDocument();
    });

    test('shows badge rarity indicators', () => {
      renderComponent();
      
      const commonBadge = screen.getByText('Débutant précoce').closest('.badge');
      expect(commonBadge).toHaveClass('badge--common');
      
      const uncommonBadge = screen.getByText('Série de 7 jours').closest('.badge');
      expect(uncommonBadge).toHaveClass('badge--uncommon');
    });
  });

  describe('Achievement Progress', () => {
    test('displays achievement progress when showAchievements is true', () => {
      renderComponent();
      
      expect(screen.getByText('Premier Quiz')).toBeInTheDocument();
      expect(screen.getByText('Master du Visionnage')).toBeInTheDocument();
    });

    test('hides achievements when showAchievements is false', () => {
      renderComponent({ showAchievements: false });
      
      expect(screen.queryByText('Premier Quiz')).not.toBeInTheDocument();
      expect(screen.queryByText('Master du Visionnage')).not.toBeInTheDocument();
    });

    test('shows achievement progress bars', () => {
      renderComponent();
      
      const progressBars = screen.getAllByTestId('achievement-progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    test('displays completed achievements differently', () => {
      renderComponent();
      
      const completedAchievement = screen.getByText('Premier Quiz').closest('.achievement');
      expect(completedAchievement).toHaveClass('achievement--completed');
      
      const inProgressAchievement = screen.getByText('Master du Visionnage').closest('.achievement');
      expect(inProgressAchievement).toHaveClass('achievement--in-progress');
    });

    test('shows achievement rewards', () => {
      renderComponent();
      
      expect(screen.getByText('🎯 Premier Quiz')).toBeInTheDocument();
      expect(screen.getByText('🏆 Master du Visionnage')).toBeInTheDocument();
    });
  });

  describe('Milestones', () => {
    test('displays milestone progress when showMilestones is true', () => {
      renderComponent();
      
      expect(screen.getByText('25% du cours')).toBeInTheDocument();
      expect(screen.getByText('50% du cours')).toBeInTheDocument();
      expect(screen.getByText('75% du cours')).toBeInTheDocument();
      expect(screen.getByText('Cours terminé')).toBeInTheDocument();
    });

    test('hides milestones when showMilestones is false', () => {
      renderComponent({ showMilestones: false });
      
      expect(screen.queryByText('25% du cours')).not.toBeInTheDocument();
      expect(screen.queryByText('50% du cours')).not.toBeInTheDocument();
    });

    test('shows milestone completion status', () => {
      renderComponent();
      
      // Current progress is 48%, so 25% should be completed
      const completedMilestone = screen.getByText('25% du cours').closest('.milestone');
      expect(completedMilestone).toHaveClass('milestone--achieved');
      
      const upcomingMilestone = screen.getByText('50% du cours').closest('.milestone');
      expect(upcomingMilestone).toHaveClass('milestone--upcoming');
    });

    test('displays milestone timeline', () => {
      renderComponent();
      
      expect(screen.getByTestId('milestone-timeline')).toBeInTheDocument();
    });

    test('shows next milestone target', () => {
      renderComponent();
      
      expect(screen.getByText('Objectif suivant: 50% (il reste 2 leçons)')).toBeInTheDocument();
    });
  });

  describe('Certificate Tracking', () => {
    test('displays certificate status when showCertificate is true', () => {
      renderComponent();
      
      expect(screen.getByText('1 certificat obtenu')).toBeInTheDocument();
    });

    test('hides certificate info when showCertificate is false', () => {
      renderComponent({ showCertificate: false });
      
      expect(screen.queryByText('1 certificat obtenu')).not.toBeInTheDocument();
    });

    test('shows certificate view button', () => {
      renderComponent();
      
      expect(screen.getByText('Voir le certificat')).toBeInTheDocument();
    });

    test('calls onViewCertificate when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const viewButton = screen.getByText('Voir le certificat');
      await user.click(viewButton);
      
      expect(defaultProps.onViewCertificate).toHaveBeenCalled();
    });

    test('shows certificate preview', () => {
      renderComponent();
      
      expect(screen.getByTestId('certificate-preview')).toBeInTheDocument();
    });

    test('displays certificate date', () => {
      renderComponent();
      
      expect(screen.getByText('Obtenu le 22 janv. 2024')).toBeInTheDocument();
    });
  });

  describe('Progress Visualization', () => {
    test('displays circular progress indicator', () => {
      renderComponent();
      
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });

    test('shows progress statistics cards', () => {
      renderComponent();
      
      expect(screen.getByText('Progression globale')).toBeInTheDocument();
      expect(screen.getByText('Temps d\'apprentissage')).toBeInTheDocument();
      expect(screen.getByText('Consistance')).toBeInTheDocument();
    });

    test('displays learning velocity chart', () => {
      renderComponent();
      
      expect(screen.getByTestId('velocity-chart')).toBeInTheDocument();
    });

    test('shows estimated completion date', () => {
      renderComponent();
      
      expect(screen.getByText('Fin estimée: 15 fév. 2024')).toBeInTheDocument();
    });

    test('displays learning pace analysis', () => {
      renderComponent();
      
      expect(screen.getByText('Rythme actuel: Bon')).toBeInTheDocument();
      expect(screen.getByText('2.4 heures/jour')).toBeInTheDocument();
    });
  });

  describe('Social Features', () => {
    test('renders share progress button', () => {
      renderComponent();
      
      expect(screen.getByText('Partager mes progrès')).toBeInTheDocument();
    });

    test('calls onShareProgress when share button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const shareButton = screen.getByText('Partager mes progrès');
      await user.click(shareButton);
      
      expect(defaultProps.onShareProgress).toHaveBeenCalledWith({
        completion: 48,
        streak: 7,
        badges: 2,
        timeSpent: 1440
      });
    });

    test('shows leaderboard link', () => {
      renderComponent();
      
      expect(screen.getByText('Voir le classement')).toBeInTheDocument();
    });

    test('calls onViewLeaderboard when leaderboard link is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const leaderboardLink = screen.getByText('Voir le classement');
      await user.click(leaderboardLink);
      
      expect(defaultProps.onViewLeaderboard).toHaveBeenCalled();
    });
  });

  describe('Progress Insights', () => {
    test('displays learning insights', () => {
      renderComponent();
      
      expect(screen.getByText('Insights d\'apprentissage')).toBeInTheDocument();
    });

    test('shows learning pattern analysis', () => {
      renderComponent();
      
      expect(screen.getByText('Vous préférez apprendre le matin')).toBeInTheDocument();
      expect(screen.getByText('Sessions de 45 min en moyenne')).toBeInTheDocument();
    });

    test('displays improvement suggestions', () => {
      renderComponent();
      
      expect(screen.getByText('💡 Conseil:') ).toBeInTheDocument();
      expect(screen.getByText('Augmentez vos sessions à 1h pour progresser plus vite')).toBeInTheDocument();
    });

    test('shows comparison with average learners', () => {
      renderComponent();
      
      expect(screen.getByText('Vous êtes au-dessus de la moyenne')).toBeInTheDocument();
      expect(screen.getByText('75% des apprenants à ce stade')).toBeInTheDocument();
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
      
      const progress = screen.getByTestId('course-progress');
      expect(progress).toHaveClass('course-progress--mobile');
    });

    test('shows mobile-optimized progress summary', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.getByText('12/25 • 48% • 7j')).toBeInTheDocument();
    });

    test('hides detailed stats on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderComponent();
      
      expect(screen.queryByText('Débutant précoce')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Progression du cours: 48% complété')).toBeInTheDocument();
      expect(screen.getByLabelText('12 leçons sur 25 complétées')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const progressBar = screen.getByTestId('overall-progress-bar');
      progressBar.focus();
      
      expect(document.activeElement).toBe(progressBar);
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      
      expect(document.activeElement).toBe(screen.getByTestId('current-lesson-progress-bar'));
    });

    test('announces progress updates to screen readers', () => {
      renderComponent();
      
      const progressBar = screen.getByTestId('overall-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '48');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    test('provides alternative text for visual elements', () => {
      renderComponent();
      
      const circularProgress = screen.getByTestId('circular-progress');
      expect(circularProgress).toHaveAttribute('aria-label', 'Progression circulaire: 48%');
    });
  });

  describe('Real-time Updates', () => {
    test('updates when progress changes externally', () => {
      const { rerender } = renderComponent();
      
      const updatedData = {
        ...mockProgressData,
        completedLessons: 15,
        currentLessonProgress: 80
      };
      
      rerender(<CourseProgress {...defaultProps} progressData={updatedData} />);
      
      expect(screen.getByText('15 sur 25 leçons')).toBeInTheDocument();
      expect(screen.getByText('Leçon actuelle: 80%')).toBeInTheDocument();
    });

    test('animates progress bar updates', async () => {
      const { rerender } = renderComponent();
      
      const updatedData = { ...mockProgressData, completedLessons: 20 };
      rerender(<CourseProgress {...defaultProps} progressData={updatedData} />);
      
      const progressBar = screen.getByTestId('overall-progress-bar');
      expect(progressBar).toHaveClass('course-progress__bar--animating');
    });
  });

  describe('Data Validation', () => {
    test('handles missing progress data gracefully', () => {
      const incompleteData = {
        ...mockProgressData,
        completedLessons: null,
        totalLessons: null
      };
      
      renderComponent({ progressData: incompleteData });
      
      expect(screen.getByText('Progression inconnue')).toBeInTheDocument();
    });

    test('handles zero total lessons', () => {
      const zeroLessonsData = {
        ...mockProgressData,
        totalLessons: 0,
        completedLessons: 0
      };
      
      renderComponent({ progressData: zeroLessonsData });
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.queryByText('sur')).not.toBeInTheDocument();
    });

    test('handles invalid percentage values', () => {
      const invalidData = {
        ...mockProgressData,
        completedLessons: 30,
        totalLessons: 25 // More completed than total
      };
      
      renderComponent({ progressData: invalidData });
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Cours terminé')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('memoizes progress calculations', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same data
      rerender(<CourseProgress {...defaultProps} />);
      
      // Should not recalculate unnecessarily
      expect(screen.getByText('48%')).toBeInTheDocument();
    });

    test('debounces progress updates', async () => {
      const { rerender } = renderComponent();
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedData = { ...mockProgressData, completedLessons: i };
        rerender(<CourseProgress {...defaultProps} progressData={updatedData} />);
      }
      
      // Should only show final value
      expect(screen.getByText('9 sur 25 leçons')).toBeInTheDocument();
    });
  });

  describe('Gamification Elements', () => {
    test('shows progress motivation messages', () => {
      renderComponent();
      
      expect(screen.getByText('Vous êtes sur la bonne voie !')).toBeInTheDocument();
    });

    test('displays encouragement for streaks', () => {
      renderComponent();
      
      expect(screen.getByText('Continuez sur cette lancée !')).toBeInTheDocument();
    });

    test('shows progress rewards', () => {
      renderComponent();
      
      expect(screen.getByText('Prochaine récompense: Badge "Persévérant"')).toBeInTheDocument();
    });

    test('displays level progression', () => {
      renderComponent();
      
      expect(screen.getByText('Niveau 3 - Développeur')).toBeInTheDocument();
      expect(screen.getByText('800/1000 XP')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    test('displays error when progress data fails to load', () => {
      renderComponent({ 
        progressData: null,
        error: 'Erreur lors du chargement des progrès'
      });
      
      expect(screen.getByText('Erreur lors du chargement des progrès')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    test('shows retry functionality', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      
      renderComponent({ 
        progressData: null,
        error: 'Erreur',
        onRetry 
      });
      
      const retryButton = screen.getByText('Réessayer');
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    test('handles network errors gracefully', () => {
      renderComponent({ 
        isLoading: false,
        error: 'Connexion réseau perdue',
        progressData: null
      });
      
      expect(screen.getByText('Impossible de charger vos progrès')).toBeInTheDocument();
      expect(screen.getByText('Vérifiez votre connexion internet')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very high completion percentages', () => {
      const highCompletionData = {
        ...mockProgressData,
        completedLessons: 24,
        totalLessons: 25,
        currentLessonProgress: 95
      };
      
      renderComponent({ progressData: highCompletionData });
      
      expect(screen.getByText('96%')).toBeInTheDocument();
      expect(screen.getByText('Presque terminé !')).toBeInTheDocument();
    });

    test('handles courses with no time tracking', () => {
      const noTimeData = {
        ...mockProgressData,
        totalTimeSpent: 0,
        averageSessionTime: 0
      };
      
      renderComponent({ progressData: noTimeData });
      
      expect(screen.getByText('Temps d\'apprentissage non disponible')).toBeInTheDocument();
    });

    test('handles users with no achievements', () => {
      const noAchievementsData = {
        ...mockProgressData,
        achievements: [],
        badges: []
      };
      
      renderComponent({ progressData: noAchievementsData });
      
      expect(screen.getByText('Aucun achievement pour le moment')).toBeInTheDocument();
      expect(screen.getByText('Continuez à apprendre pour débloquer des badges !')).toBeInTheDocument();
    });
  });
});