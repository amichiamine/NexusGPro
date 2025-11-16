import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import './CourseProgress.css';

export interface ProgressMilestone {
  /** Identifiant unique */
  id: string;
  /** Titre du milestone */
  title: string;
  /** Description */
  description?: string;
  /** Pourcentage requis pour atteindre ce milestone */
  threshold: number; // 0-100
  /** Date d'atteinte */
  reachedDate?: string;
  /** Récompense associée */
  reward?: {
    type: 'badge' | 'certificate' | 'points' | 'unlock';
    title: string;
    description?: string;
    icon: string;
    value?: string | number;
  };
  /** Métadonnées */
  metadata?: {
    [key: string]: any;
  };
}

export interface ProgressStat {
  /** Nom de la statistique */
  label: string;
  /** Valeur actuelle */
  current: number;
  /** Valeur cible */
  target?: number;
  /** Unité de mesure */
  unit?: string;
  /** Icône */
  icon?: string;
  /** Couleur */
  color?: string;
  /** Progression en pourcentage */
  percentage?: number;
}

export interface LearningObjective {
  /** Identifiant unique */
  id: string;
  /** Objectif */
  objective: string;
  /** Statut */
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  /** Niveau de maîtrise (0-100) */
  masteryLevel?: number;
  /** Progression (0-100) */
  progress?: number;
  /** Date de completion */
  completedDate?: string;
  /** Métriques de performance */
  metrics?: {
    attempts: number;
    bestScore: number;
    averageScore: number;
    timeSpent: number; // en minutes
  };
}

export interface Achievement {
  /** Identifiant unique */
  id: string;
  /** Nom de l'achievement */
  name: string;
  /** Description */
  description: string;
  /** Type */
  type: 'streak' | 'completion' | 'score' | 'time' | 'milestone' | 'special';
  /** Condition d'atteinte */
  condition: string;
  /** Valeur atteinte */
  value?: string | number;
  /** Date d'obtention */
  earnedDate?: string;
  /** Rareté */
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Points de mérite */
  meritPoints?: number;
  /** Icône */
  icon: string;
  /** Couleur de l'icône */
  iconColor?: string;
}

export interface CourseProgressProps {
  /** Progression globale */
  globalProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  /** Statistiques de progression */
  stats?: ProgressStat[];
  /** Milestones */
  milestones?: ProgressMilestone[];
  /** Objectifs d'apprentissage */
  learningObjectives?: LearningObjective[];
  /** Achievements */
  achievements?: Achievement[];
  /** Temps total passé */
  timeSpent?: {
    total: number; // en minutes
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  /** Activité récente */
  recentActivity?: {
    id: string;
    type: 'lesson_completed' | 'quiz_passed' | 'assignment_submitted' | 'milestone_reached';
    title: string;
    date: string;
    details?: any;
  }[];
  /** Série de jours consécutifs */
  streak?: {
    current: number;
    longest: number;
    lastActivityDate: string;
  };
  /** Configuration d'affichage */
  display?: {
    /** Mode compact */
    compact?: boolean;
    /** Mode dashboard */
    dashboard?: boolean;
    /** Afficher les détails complets */
    showFullDetails?: boolean;
    /** Sections à afficher */
    sections?: string[];
    /** Format de la date */
    dateFormat?: string;
    /** Fuseau horaire */
    timezone?: string;
  };
  /** Configuration des animations */
  animation?: {
    /** Activer les animations */
    enabled?: boolean;
    /** Durée des animations */
    duration?: number;
    /** Type d'animation */
    type?: 'fade' | 'slide' | 'bounce' | 'none';
  };
  /** Actions disponibles */
  actions?: {
    /** Exporter le progrès */
    exportProgress?: {
      enabled: boolean;
      formats: ('pdf' | 'json' | 'csv')[];
      onClick: () => void;
    };
    /** Partager les progrès */
    shareProgress?: {
      enabled: boolean;
      onClick: () => void;
    };
    /** Réinitialiser les progrès */
    resetProgress?: {
      enabled: boolean;
      onClick: () => void;
    };
    /** Voir les détails d'un achievement */
    viewAchievement?: {
      enabled: boolean;
      onClick: (achievementId: string) => void;
    };
  };
  /** Callbacks */
  onMilestoneClick?: (milestone: ProgressMilestone) => void;
  onAchievementClick?: (achievement: Achievement) => void;
  onObjectiveClick?: (objective: LearningObjective) => void;
  onStatClick?: (stat: ProgressStat) => void;
  /** Classes CSS */
  className?: string;
}

export interface CourseProgressStates {
  /** Animation en cours */
  animating: boolean;
  /** Expanded sections */
  expandedSections: Set<string>;
  /** Selected timeframe */
  selectedTimeframe: 'today' | 'week' | 'month' | 'all';
  /** Show achievements */
  showAchievements: boolean;
  /** Loading state */
  loading: boolean;
  /** Achievement detail modal */
  achievementModalOpen: boolean;
  /** Selected achievement */
  selectedAchievement: Achievement | null;
}

const CourseProgress: React.FC<CourseProgressProps> = ({
  globalProgress,
  stats = [],
  milestones = [],
  learningObjectives = [],
  achievements = [],
  timeSpent,
  recentActivity = [],
  streak,
  display = {},
  animation = {},
  actions = {},
  onMilestoneClick,
  onAchievementClick,
  onObjectiveClick,
  onStatClick,
  className = ''
}) => {
  // Configuration par défaut
  const defaultDisplay = {
    compact: false,
    dashboard: false,
    showFullDetails: false,
    sections: ['overview', 'objectives', 'achievements', 'activity'],
    dateFormat: 'fr-FR',
    timezone: 'Europe/Paris',
    ...display
  };

  const defaultAnimation = {
    enabled: true,
    duration: 500,
    type: 'fade' as const,
    ...animation
  };

  // État local du composant
  const [states, setStates] = useState<CourseProgressStates>({
    animating: false,
    expandedSections: new Set(),
    selectedTimeframe: 'all',
    showAchievements: true,
    loading: false,
    achievementModalOpen: false,
    selectedAchievement: null
  });

  // Effets
  useEffect(() => {
    if (defaultAnimation.enabled) {
      setStates(prev => ({ ...prev, animating: true }));
      const timer = setTimeout(() => {
        setStates(prev => ({ ...prev, animating: false }));
      }, defaultAnimation.duration);
      return () => clearTimeout(timer);
    }
  }, [globalProgress.percentage, defaultAnimation.enabled, defaultAnimation.duration]);

  // Gestionnaires d'événements
  const toggleSection = useCallback((sectionId: string) => {
    setStates(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return {
        ...prev,
        expandedSections: newExpanded
      };
    });
  }, []);

  const handleTimeframeChange = useCallback((timeframe: 'today' | 'week' | 'month' | 'all') => {
    setStates(prev => ({ ...prev, selectedTimeframe: timeframe }));
  }, []);

  const openAchievementModal = useCallback((achievement: Achievement) => {
    setStates(prev => ({
      ...prev,
      selectedAchievement: achievement,
      achievementModalOpen: true
    }));

    if (onAchievementClick) {
      onAchievementClick(achievement);
    }
  }, [onAchievementClick]);

  const closeAchievementModal = useCallback(() => {
    setStates(prev => ({
      ...prev,
      selectedAchievement: null,
      achievementModalOpen: false
    }));
  }, []);

  // Utilitaires de formatage
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(defaultDisplay.dateFormat);
  };

  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    
    return formatDate(dateString);
  };

  const getRarityColor = (rarity?: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common':
        return 'var(--color-neutral-500, #6b7280)';
      case 'uncommon':
        return 'var(--color-success, #10b981)';
      case 'rare':
        return 'var(--color-info, #06b6d4)';
      case 'epic':
        return 'var(--color-warning, #f59e0b)';
      case 'legendary':
        return 'var(--color-error, #ef4444)';
      default:
        return 'var(--color-primary-500, #3b82f6)';
    }
  };

  const getStatusColor = (status: LearningObjective['status']): string => {
    switch (status) {
      case 'completed':
        return 'var(--color-success, #10b981)';
      case 'mastered':
        return 'var(--color-success-dark, #059669)';
      case 'in-progress':
        return 'var(--color-warning, #f59e0b)';
      default:
        return 'var(--color-neutral-400, #9ca3af)';
    }
  };

  const getStatusLabel = (status: LearningObjective['status']): string => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'mastered':
        return 'Maîtrisé';
      case 'in-progress':
        return 'En cours';
      default:
        return 'Non commencé';
    }
  };

  // Calculs dérivés
  const completedMilestones = useMemo(() => {
    return milestones.filter(m => m.reachedDate);
  }, [milestones]);

  const earnedAchievements = useMemo(() => {
    return achievements.filter(a => a.earnedDate);
  }, [achievements]);

  const completedObjectives = useMemo(() => {
    return learningObjectives.filter(o => o.status === 'completed' || o.status === 'mastered');
  }, [learningObjectives]);

  const nextMilestone = useMemo(() => {
    return milestones
      .filter(m => !m.reachedDate)
      .sort((a, b) => a.threshold - b.threshold)[0];
  }, [milestones]);

  // Classes CSS dynamiques
  const containerClasses = cn(
    'course-progress',
    {
      'course-progress--compact': defaultDisplay.compact,
      'course-progress--dashboard': defaultDisplay.dashboard,
      'course-progress--animating': states.animating,
    },
    className
  );

  // Rendu de la progression globale
  const renderGlobalProgress = () => (
    <div className="course-progress__global">
      <div className="course-progress__global-header">
        <h2 className="course-progress__global-title">
          Progression Globale
        </h2>
        <div className="course-progress__global-percentage">
          {globalProgress.percentage}%
        </div>
      </div>
      
      <div className="course-progress__global-bar">
        <div
          className="course-progress__global-fill"
          style={{ width: `${globalProgress.percentage}%` }}
          role="progressbar"
          aria-valuenow={globalProgress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      
      <div className="course-progress__global-stats">
        <span className="course-progress__global-count">
          {globalProgress.completed} / {globalProgress.total} éléments complétés
        </span>
        {nextMilestone && (
          <span className="course-progress__global-next">
            Prochain milestone: {nextMilestone.threshold}% ({nextMilestone.title})
          </span>
        )}
      </div>
    </div>
  );

  // Rendu des statistiques
  const renderStats = () => {
    if (stats.length === 0) return null;

    return (
      <div className="course-progress__stats">
        <h3 className="course-progress__section-title">Statistiques</h3>
        <div className="course-progress__stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="course-progress__stat-card"
              onClick={() => onStatClick?.(stat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStatClick?.(stat);
                }
              }}
            >
              <div className="course-progress__stat-header">
                <div className="course-progress__stat-icon">
                  {stat.icon}
                </div>
                <div className="course-progress__stat-info">
                  <h4 className="course-progress__stat-label">
                    {stat.label}
                  </h4>
                  <div className="course-progress__stat-value">
                    {stat.current}
                    {stat.unit && ` ${stat.unit}`}
                    {stat.target && ` / ${stat.target}${stat.unit ? ` ${stat.unit}` : ''}`}
                  </div>
                </div>
              </div>
              {stat.percentage !== undefined && (
                <div className="course-progress__stat-progress">
                  <div
                    className="course-progress__stat-progress-fill"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color || 'var(--color-primary-500, #3b82f6)'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des milestones
  const renderMilestones = () => {
    if (milestones.length === 0) return null;

    return (
      <div className="course-progress__milestones">
        <h3 className="course-progress__section-title">
          Milestones ({completedMilestones.length}/{milestones.length})
        </h3>
        <div className="course-progress__milestones-timeline">
          {milestones.map((milestone, index) => {
            const isReached = !!milestone.reachedDate;
            const isNext = nextMilestone?.id === milestone.id;
            const isExpanded = states.expandedSections.has(`milestone-${milestone.id}`);

            return (
              <div
                key={milestone.id}
                className={`course-progress__milestone ${isReached ? 'is-reached' : ''} ${isNext ? 'is-next' : ''}`}
              >
                <div className="course-progress__milestone-marker">
                  <div className={`course-progress__milestone-dot ${isReached ? 'is-completed' : ''}`}>
                    {milestone.reward && (
                      <span className="course-progress__milestone-reward-icon">
                        {milestone.reward.icon}
                      </span>
                    )}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="course-progress__milestone-line" />
                  )}
                </div>
                
                <div className="course-progress__milestone-content">
                  <div className="course-progress__milestone-header">
                    <h4 className="course-progress__milestone-title">
                      {milestone.title}
                    </h4>
                    <div className="course-progress__milestone-threshold">
                      {milestone.threshold}%
                    </div>
                  </div>
                  
                  {milestone.description && (
                    <p className="course-progress__milestone-description">
                      {milestone.description}
                    </p>
                  )}
                  
                  {isReached && milestone.reachedDate && (
                    <div className="course-progress__milestone-reached">
                      <span className="course-progress__milestone-date">
                        {formatDate(milestone.reachedDate)}
                      </span>
                      {milestone.reward && (
                        <div className="course-progress__milestone-reward">
                          <span className="course-progress__milestone-reward-type">
                            {milestone.reward.type}:
                          </span>
                          <strong>{milestone.reward.title}</strong>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isReached && isNext && (
                    <div className="course-progress__milestone-next">
                      Prochain objectif
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Rendu des objectifs d'apprentissage
  const renderLearningObjectives = () => {
    if (learningObjectives.length === 0) return null;

    return (
      <div className="course-progress__objectives">
        <h3 className="course-progress__section-title">
          Objectifs d'Apprentissage ({completedObjectives.length}/{learningObjectives.length})
        </h3>
        <div className="course-progress__objectives-list">
          {learningObjectives.map((objective) => {
            const isExpanded = states.expandedSections.has(`objective-${objective.id}`);
            
            return (
              <div
                key={objective.id}
                className={`course-progress__objective ${objective.status}`}
              >
                <div className="course-progress__objective-header">
                  <div className="course-progress__objective-status">
                    <span
                      className="course-progress__objective-status-indicator"
                      style={{ backgroundColor: getStatusColor(objective.status) }}
                    />
                    <span className="course-progress__objective-status-text">
                      {getStatusLabel(objective.status)}
                    </span>
                  </div>
                  
                  <div className="course-progress__objective-progress">
                    {objective.progress !== undefined && (
                      <div className="course-progress__objective-progress-bar">
                        <div
                          className="course-progress__objective-progress-fill"
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {objective.masteryLevel !== undefined && (
                      <div className="course-progress__objective-mastery">
                        Maîtrise: {objective.masteryLevel}%
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className={`course-progress__objective-toggle ${isExpanded ? 'is-expanded' : ''}`}
                    onClick={() => toggleSection(`objective-${objective.id}`)}
                    aria-expanded={isExpanded}
                    aria-label="Voir les détails de l'objectif"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>
                
                <h4 className="course-progress__objective-title">
                  {objective.objective}
                </h4>
                
                {isExpanded && objective.metrics && (
                  <div className="course-progress__objective-details">
                    <div className="course-progress__objective-metrics">
                      <div className="course-progress__objective-metric">
                        <span className="course-progress__objective-metric-label">Tentatives:</span>
                        <span className="course-progress__objective-metric-value">
                          {objective.metrics.attempts}
                        </span>
                      </div>
                      <div className="course-progress__objective-metric">
                        <span className="course-progress__objective-metric-label">Meilleur score:</span>
                        <span className="course-progress__objective-metric-value">
                          {objective.metrics.bestScore}%
                        </span>
                      </div>
                      <div className="course-progress__objective-metric">
                        <span className="course-progress__objective-metric-label">Score moyen:</span>
                        <span className="course-progress__objective-metric-value">
                          {objective.metrics.averageScore}%
                        </span>
                      </div>
                      <div className="course-progress__objective-metric">
                        <span className="course-progress__objective-metric-label">Temps passé:</span>
                        <span className="course-progress__objective-metric-value">
                          {formatTime(objective.metrics.timeSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Rendu des achievements
  const renderAchievements = () => {
    if (achievements.length === 0) return null;

    return (
      <div className="course-progress__achievements">
        <h3 className="course-progress__section-title">
          Achievements ({earnedAchievements.length}/{achievements.length})
        </h3>
        <div className="course-progress__achievements-grid">
          {achievements.map((achievement) => {
            const isEarned = !!achievement.earnedDate;
            
            return (
              <div
                key={achievement.id}
                className={`course-progress__achievement ${isEarned ? 'is-earned' : ''} ${achievement.rarity || 'common'}`}
                onClick={() => isEarned && openAchievementModal(achievement)}
                role="button"
                tabIndex={isEarned ? 0 : -1}
                onKeyDown={(e) => {
                  if (isEarned && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    openAchievementModal(achievement);
                  }
                }}
              >
                <div className="course-progress__achievement-icon">
                  <span
                    style={{ 
                      color: isEarned ? (achievement.iconColor || getRarityColor(achievement.rarity)) : 'var(--color-neutral-300, #d1d5db)'
                    }}
                  >
                    {achievement.icon}
                  </span>
                </div>
                <div className="course-progress__achievement-info">
                  <h4 className="course-progress__achievement-name">
                    {achievement.name}
                  </h4>
                  <p className="course-progress__achievement-description">
                    {achievement.description}
                  </p>
                  {isEarned && achievement.earnedDate && (
                    <div className="course-progress__achievement-date">
                      {formatDate(achievement.earnedDate)}
                    </div>
                  )}
                  {!isEarned && (
                    <div className="course-progress__achievement-condition">
                      {achievement.condition}
                    </div>
                  )}
                </div>
                {achievement.meritPoints && (
                  <div className="course-progress__achievement-points">
                    +{achievement.meritPoints}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Rendu du temps passé
  const renderTimeSpent = () => {
    if (!timeSpent) return null;

    return (
      <div className="course-progress__time-spent">
        <h3 className="course-progress__section-title">Temps Passé</h3>
        <div className="course-progress__time-spent-grid">
          <div className="course-progress__time-spent-card">
            <div className="course-progress__time-spent-value">
              {formatTime(timeSpent.total)}
            </div>
            <div className="course-progress__time-spent-label">
              Total
            </div>
          </div>
          <div className="course-progress__time-spent-card">
            <div className="course-progress__time-spent-value">
              {formatTime(timeSpent.today)}
            </div>
            <div className="course-progress__time-spent-label">
              Aujourd'hui
            </div>
          </div>
          <div className="course-progress__time-spent-card">
            <div className="course-progress__time-spent-value">
              {formatTime(timeSpent.thisWeek)}
            </div>
            <div className="course-progress__time-spent-label">
              Cette semaine
            </div>
          </div>
          <div className="course-progress__time-spent-card">
            <div className="course-progress__time-spent-value">
              {formatTime(timeSpent.thisMonth)}
            </div>
            <div className="course-progress__time-spent-label">
              Ce mois
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu de l'activité récente
  const renderRecentActivity = () => {
    if (recentActivity.length === 0) return null;

    return (
      <div className="course-progress__activity">
        <h3 className="course-progress__section-title">Activité Récente</h3>
        <div className="course-progress__activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="course-progress__activity-item">
              <div className="course-progress__activity-icon">
                {activity.type === 'lesson_completed' && '✅'}
                {activity.type === 'quiz_passed' && '🎯'}
                {activity.type === 'assignment_submitted' && '📝'}
                {activity.type === 'milestone_reached' && '🏆'}
              </div>
              <div className="course-progress__activity-content">
                <h4 className="course-progress__activity-title">
                  {activity.title}
                </h4>
                <div className="course-progress__activity-date">
                  {formatRelativeTime(activity.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu de la série (streak)
  const renderStreak = () => {
    if (!streak) return null;

    return (
      <div className="course-progress__streak">
        <h3 className="course-progress__section-title">Série</h3>
        <div className="course-progress__streak-stats">
          <div className="course-progress__streak-current">
            <div className="course-progress__streak-value">
              {streak.current}
            </div>
            <div className="course-progress__streak-label">
              Jours consécutifs
            </div>
          </div>
          <div className="course-progress__streak-longest">
            <div className="course-progress__streak-value">
              {streak.longest}
            </div>
            <div className="course-progress__streak-label">
              Record
            </div>
          </div>
        </div>
        <div className="course-progress__streak-status">
          Dernière activité: {formatRelativeTime(streak.lastActivityDate)}
        </div>
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Progression globale */}
      {defaultDisplay.sections.includes('overview') && renderGlobalProgress()}

      {/* Sections selon la configuration */}
      {defaultDisplay.showFullDetails && (
        <>
          {/* Statistiques */}
          {defaultDisplay.sections.includes('stats') && renderStats()}

          {/* Milestones */}
          {defaultDisplay.sections.includes('milestones') && renderMilestones()}

          {/* Objectifs d'apprentissage */}
          {defaultDisplay.sections.includes('objectives') && renderLearningObjectives()}

          {/* Achievements */}
          {defaultDisplay.sections.includes('achievements') && renderAchievements()}

          {/* Temps passé */}
          {defaultDisplay.sections.includes('time') && renderTimeSpent()}

          {/* Série */}
          {defaultDisplay.sections.includes('streak') && renderStreak()}

          {/* Activité récente */}
          {defaultDisplay.sections.includes('activity') && renderRecentActivity()}
        </>
      )}

      {/* Actions */}
      {(actions.exportProgress?.enabled || actions.shareProgress?.enabled || actions.resetProgress?.enabled) && (
        <div className="course-progress__actions">
          {actions.exportProgress?.enabled && (
            <button
              type="button"
              className="course-progress__action-btn"
              onClick={actions.exportProgress.onClick}
            >
              📊 Exporter
            </button>
          )}
          
          {actions.shareProgress?.enabled && (
            <button
              type="button"
              className="course-progress__action-btn"
              onClick={actions.shareProgress.onClick}
            >
              📤 Partager
            </button>
          )}
          
          {actions.resetProgress?.enabled && (
            <button
              type="button"
              className="course-progress__action-btn course-progress__action-btn--danger"
              onClick={actions.resetProgress.onClick}
            >
              🔄 Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Modal d'achievement */}
      {states.achievementModalOpen && states.selectedAchievement && (
        <div className="course-progress__modal">
          <div className="course-progress__modal-content">
            <div className="course-progress__modal-header">
              <h3>{states.selectedAchievement.name}</h3>
              <button
                type="button"
                className="course-progress__modal-close"
                onClick={closeAchievementModal}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="course-progress__modal-body">
              <div className="course-progress__modal-icon">
                <span
                  style={{ color: states.selectedAchievement.iconColor || getRarityColor(states.selectedAchievement.rarity) }}
                >
                  {states.selectedAchievement.icon}
                </span>
              </div>
              <p className="course-progress__modal-description">
                {states.selectedAchievement.description}
              </p>
              {states.selectedAchievement.earnedDate && (
                <div className="course-progress__modal-date">
                  Obtenu le {formatDate(states.selectedAchievement.earnedDate)}
                </div>
              )}
              {states.selectedAchievement.value && (
                <div className="course-progress__modal-value">
                  Valeur: {states.selectedAchievement.value}
                </div>
              )}
              {states.selectedAchievement.meritPoints && (
                <div className="course-progress__modal-points">
                  Points de mérite: +{states.selectedAchievement.meritPoints}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;