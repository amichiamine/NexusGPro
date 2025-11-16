/**
 * CourseStats.tsx
 * Component for displaying comprehensive course statistics and analytics
 * Part of the LMS (Learning Management System) organisms
 */

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/utils';
import './CourseStats.css';

interface StudentData {
  id: string;
  name: string;
  email: string;
  enrolledDate: string;
  lastActivity: string;
  progress: number;
  completionRate: number;
  totalTimeSpent: number;
  averageSessionTime: number;
  quizScore?: number;
  assignmentsSubmitted: number;
  certificatesEarned: number;
  status: 'active' | 'completed' | 'inactive' | 'dropped';
}

interface CourseAnalytics {
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalRevenue: number;
  averageRating: number;
  totalRatings: number;
  bounceRate: number;
  averageTimeToComplete: number;
  certificatesIssued: number;
  totalRevenueThisMonth: number;
  enrollmentTrend: number; // percentage change
}

interface CourseStatsProps {
  courseId: string;
  courseTitle: string;
  analytics: CourseAnalytics;
  studentsData: StudentData[];
  instructorId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  showDetailed?: boolean;
  showRevenue?: boolean;
  showStudentData?: boolean;
  onStudentClick?: (student: StudentData) => void;
  onExportData?: (format: 'csv' | 'pdf' | 'excel') => void;
  className?: string;
}

const CourseStats: React.FC<CourseStatsProps> = ({
  courseId,
  courseTitle,
  analytics,
  studentsData,
  instructorId,
  dateRange,
  showDetailed = false,
  showRevenue = false,
  showStudentData = false,
  onStudentClick,
  onExportData,
  className = '',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'enrollment' | 'completion' | 'engagement'>('enrollment');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActivity'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const studentsPerPage = 10;

  const filteredStudents = useMemo(() => {
    let filtered = studentsData;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => student.status === filterStatus);
    }
    
    // Sort students
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [studentsData, filterStatus, sortBy, sortOrder]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleSort = (field: 'name' | 'progress' | 'lastActivity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (onExportData) {
      setIsLoading(true);
      try {
        await onExportData(format);
      } finally {
        setIsLoading(false);
        setIsExportMenuOpen(false);
      }
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const getStatusBadgeClass = (status: string): string => {
    return cn(
      'course-stats__badge',
      {
        'course-stats__badge--active': status === 'active',
        'course-stats__badge--completed': status === 'completed',
        'course-stats__badge--inactive': status === 'inactive',
        'course-stats__badge--dropped': status === 'dropped',
      }
    );
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'inactive': return 'Inactif';
      case 'dropped': return 'Abandonné';
      default: return status;
    }
  };

  const getProgressColorClass = (progress: number): string => {
    if (progress >= 80) return 'course-stats__progress--high';
    if (progress >= 50) return 'course-stats__progress--medium';
    return 'course-stats__progress--low';
  };

  return (
    <div className={cn('course-stats', className)}>
      {/* Header */}
      <div className="course-stats__header">
        <div className="course-stats__title-section">
          <h2 className="course-stats__title">{courseTitle} - Statistiques</h2>
          <p className="course-stats__subtitle">
            Analytics et données d'apprentissage
          </p>
        </div>
        
        <div className="course-stats__actions">
          <div className="course-stats__export">
            <button
              className="course-stats__export-btn"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={isLoading}
              aria-label="Options d'export"
            >
              <svg className="course-stats__icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              Exporter
            </button>
            
            {isExportMenuOpen && (
              <div className="course-stats__export-menu">
                <button
                  className="course-stats__export-option"
                  onClick={() => handleExport('csv')}
                  disabled={isLoading}
                >
                  Télécharger CSV
                </button>
                <button
                  className="course-stats__export-option"
                  onClick={() => handleExport('pdf')}
                  disabled={isLoading}
                >
                  Télécharger PDF
                </button>
                <button
                  className="course-stats__export-option"
                  onClick={() => handleExport('excel')}
                  disabled={isLoading}
                >
                  Télécharger Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="course-stats__overview">
        <div className="course-stats__overview-card course-stats__overview-card--primary">
          <div className="course-stats__overview-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            </svg>
          </div>
          <div className="course-stats__overview-content">
            <h3 className="course-stats__overview-title">Inscriptions</h3>
            <p className="course-stats__overview-value">{analytics.totalEnrollments.toLocaleString()}</p>
            <span className={cn(
              'course-stats__overview-change',
              {
                'course-stats__overview-change--positive': analytics.enrollmentTrend >= 0,
                'course-stats__overview-change--negative': analytics.enrollmentTrend < 0,
              }
            )}>
              {analytics.enrollmentTrend >= 0 ? '+' : ''}{formatPercentage(analytics.enrollmentTrend)} ce mois
            </span>
          </div>
        </div>

        <div className="course-stats__overview-card course-stats__overview-card--success">
          <div className="course-stats__overview-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
            </svg>
          </div>
          <div className="course-stats__overview-content">
            <h3 className="course-stats__overview-title">Taux de réussite</h3>
            <p className="course-stats__overview-value">{formatPercentage(analytics.completionRate)}</p>
            <span className="course-stats__overview-change course-stats__overview-change--neutral">
              {analytics.certificatesIssued} certificats émis
            </span>
          </div>
        </div>

        <div className="course-stats__overview-card course-stats__overview-card--info">
          <div className="course-stats__overview-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4L19,9M10,11A1.5,1.5 0 0,1 8.5,12.5A1.5,1.5 0 0,1 10,14A1.5,1.5 0 0,1 11.5,12.5A1.5,1.5 0 0,1 10,11M10,16A1.5,1.5 0 0,1 8.5,17.5A1.5,1.5 0 0,1 10,19A1.5,1.5 0 0,1 11.5,17.5A1.5,1.5 0 0,1 10,16M14,16A1.5,1.5 0 0,1 12.5,17.5A1.5,1.5 0 0,1 14,19A1.5,1.5 0 0,1 15.5,17.5A1.5,1.5 0 0,1 14,16Z" />
            </svg>
          </div>
          <div className="course-stats__overview-content">
            <h3 className="course-stats__overview-title">Étudiants actifs</h3>
            <p className="course-stats__overview-value">{analytics.activeStudents}</p>
            <span className="course-stats__overview-change course-stats__overview-change--neutral">
              {formatPercentage((analytics.activeStudents / analytics.totalEnrollments) * 100)} du total
            </span>
          </div>
        </div>

        <div className="course-stats__overview-card course-stats__overview-card--warning">
          <div className="course-stats__overview-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
            </svg>
          </div>
          <div className="course-stats__overview-content">
            <h3 className="course-stats__overview-title">Note moyenne</h3>
            <p className="course-stats__overview-value">{analytics.averageRating.toFixed(1)}/5</p>
            <span className="course-stats__overview-change course-stats__overview-change--neutral">
              {analytics.totalRatings} avis
            </span>
          </div>
        </div>

        {showRevenue && (
          <div className="course-stats__overview-card course-stats__overview-card--revenue">
            <div className="course-stats__overview-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4L19,9Z" />
              </svg>
            </div>
            <div className="course-stats__overview-content">
              <h3 className="course-stats__overview-title">Revenus</h3>
              <p className="course-stats__overview-value">{formatCurrency(analytics.totalRevenue)}</p>
              <span className="course-stats__overview-change course-stats__overview-change--positive">
                {formatCurrency(analytics.totalRevenueThisMonth)} ce mois
              </span>
            </div>
          </div>
        )}

        <div className="course-stats__overview-card course-stats__overview-card--time">
          <div className="course-stats__overview-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
            </svg>
          </div>
          <div className="course-stats__overview-content">
            <h3 className="course-stats__overview-title">Temps moyen</h3>
            <p className="course-stats__overview-value">{formatDuration(analytics.averageTimeToComplete)}</p>
            <span className="course-stats__overview-change course-stats__overview-change--neutral">
              Pour terminer
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Section */}
      {showDetailed && (
        <div className="course-stats__analytics">
          <div className="course-stats__analytics-header">
            <h3 className="course-stats__analytics-title">Analytics détaillées</h3>
            <div className="course-stats__analytics-controls">
              <select
                className="course-stats__select"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                aria-label="Sélectionner la métrique"
              >
                <option value="enrollment">Inscriptions</option>
                <option value="completion">Achèvement</option>
                <option value="engagement">Engagement</option>
              </select>
              
              <select
                className="course-stats__select"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                aria-label="Sélectionner la période"
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
                <option value="year">Année</option>
              </select>
            </div>
          </div>
          
          {/* Placeholder for charts - would integrate with chart library like Chart.js or Recharts */}
          <div className="course-stats__chart-placeholder">
            <div className="course-stats__chart-title">
              Graphique {selectedMetric} - {selectedTimeframe}
            </div>
            <div className="course-stats__chart-content">
              [Graphique intégré ici - {selectedMetric} pour {selectedTimeframe}]
            </div>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      {showStudentData && (
        <div className="course-stats__students">
          <div className="course-stats__students-header">
            <h3 className="course-stats__students-title">Données des étudiants</h3>
            
            <div className="course-stats__students-controls">
              <select
                className="course-stats__select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="completed">Terminés</option>
                <option value="inactive">Inactifs</option>
                <option value="dropped">Abandonnés</option>
              </select>
              
              <div className="course-stats__sort-controls">
                <button
                  className={cn(
                    'course-stats__sort-btn',
                    {
                      'course-stats__sort-btn--active': sortBy === 'name',
                    }
                  )}
                  onClick={() => handleSort('name')}
                  aria-label="Trier par nom"
                >
                  Nom
                  {sortBy === 'name' && (
                    <span className="course-stats__sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                
                <button
                  className={cn(
                    'course-stats__sort-btn',
                    {
                      'course-stats__sort-btn--active': sortBy === 'progress',
                    }
                  )}
                  onClick={() => handleSort('progress')}
                  aria-label="Trier par progression"
                >
                  Progression
                  {sortBy === 'progress' && (
                    <span className="course-stats__sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
                
                <button
                  className={cn(
                    'course-stats__sort-btn',
                    {
                      'course-stats__sort-btn--active': sortBy === 'lastActivity',
                    }
                  )}
                  onClick={() => handleSort('lastActivity')}
                  aria-label="Trier par dernière activité"
                >
                  Dernière activité
                  {sortBy === 'lastActivity' && (
                    <span className="course-stats__sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="course-stats__table-container">
            <table className="course-stats__table">
              <thead className="course-stats__table-head">
                <tr>
                  <th className="course-stats__table-header">Étudiant</th>
                  <th className="course-stats__table-header">Progression</th>
                  <th className="course-stats__table-header">Temps passé</th>
                  <th className="course-stats__table-header">Dernière activité</th>
                  <th className="course-stats__table-header">Statut</th>
                  <th className="course-stats__table-header">Certificats</th>
                </tr>
              </thead>
              <tbody className="course-stats__table-body">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="course-stats__table-row"
                    onClick={() => onStudentClick && onStudentClick(student)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onStudentClick && onStudentClick(student);
                      }
                    }}
                  >
                    <td className="course-stats__table-cell course-stats__table-cell--student">
                      <div className="course-stats__student-info">
                        <div className="course-stats__student-name">{student.name}</div>
                        <div className="course-stats__student-email">{student.email}</div>
                      </div>
                    </td>
                    <td className="course-stats__table-cell">
                      <div className={cn(
                        'course-stats__progress-cell',
                        getProgressColorClass(student.progress)
                      )}>
                        <div className="course-stats__progress-bar">
                          <div
                            className="course-stats__progress-fill"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="course-stats__progress-text">
                          {formatPercentage(student.progress)}
                        </span>
                      </div>
                    </td>
                    <td className="course-stats__table-cell">
                      <div className="course-stats__time-cell">
                        <div className="course-stats__time-total">
                          {formatDuration(student.totalTimeSpent)}
                        </div>
                        <div className="course-stats__time-avg">
                          avg: {formatDuration(student.averageSessionTime)}
                        </div>
                      </div>
                    </td>
                    <td className="course-stats__table-cell">
                      <div className="course-stats__activity-cell">
                        {new Date(student.lastActivity).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="course-stats__table-cell">
                      <span className={getStatusBadgeClass(student.status)}>
                        {getStatusLabel(student.status)}
                      </span>
                    </td>
                    <td className="course-stats__table-cell">
                      <div className="course-stats__certificates-cell">
                        <svg className="course-stats__certificate-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2L3,7V17H21V7L12,2M12,4.27L18,8V16H6V8L12,4.27M9,10H15V12H9V10M9,14H15V16H9V14Z" />
                        </svg>
                        {student.certificatesEarned}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="course-stats__pagination">
              <button
                className="course-stats__pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              
              <div className="course-stats__pagination-info">
                Page {currentPage} sur {totalPages}
                ({filteredStudents.length} étudiants)
              </div>
              
              <button
                className="course-stats__pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseStats;
export type { CourseStatsProps, CourseAnalytics, StudentData };