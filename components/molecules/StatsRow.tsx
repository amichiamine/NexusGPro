import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react'
import StatsCard from './StatsCard'

// Types pour le composant StatsRow
export interface StatItem {
  id?: string
  label: string
  value: string | number
  delta?: string | number
  deltaType?: 'increase' | 'decrease' | 'neutral'
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  iconColor?: string
  format?: 'number' | 'currency' | 'percentage' | 'compact'
  comparison?: { label: string; value: string | number }
  progress?: { current: number; target: number; percentage?: number }
  trend?: Array<{ label: string; value: number }>
  loading?: boolean
  error?: string
  href?: string
  onClick?: () => void
  disabled?: boolean
}

export interface StatsRowProps {
  // Données et configuration
  stats?: StatItem[]
  defaultStats?: StatItem[]
  
  // Configuration de la ligne
  direction?: 'horizontal' | 'vertical'
  wrap?: boolean
  scrollable?: boolean
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  
  // Responsive breakpoints
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  responsive?: {
    mobile?: { columns: number; direction: 'horizontal' | 'vertical' }
    tablet?: { columns: number; direction: 'horizontal' | 'vertical' }
    desktop?: { columns: number; direction: 'horizontal' | 'vertical' }
  }
  
  // Variants et styles
  variant?: 'default' | 'bordered' | 'filled' | 'minimal' | 'glass' | 'gradient'
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  layout?: 'inline' | 'stacked' | 'compact' | 'expanded'
  
  // Espacement
  gap?: number | string
  spacing?: 'tight' | 'normal' | 'relaxed' | 'loose'
  
  // Animations
  animated?: boolean
  staggerDelay?: number
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce'
  directionAnim?: 'left' | 'right' | 'up' | 'down'
  
  // Interactions
  hoverable?: boolean
  clickable?: boolean
  groupInteractions?: boolean
  syncData?: boolean
  
  // États et callbacks
  loading?: boolean
  error?: string
  onStatClick?: (stat: StatItem, index: number) => void
  onRefresh?: () => void
  onExport?: () => void
  
  // Classes et styles personnalisés
  className?: string
  style?: React.CSSProperties
  
  // Props du StatsCard sous-jacent
  statsCardProps?: React.ComponentProps<typeof StatsCard>
}

const StatsRow = forwardRef<HTMLDivElement, StatsRowProps>(({
  // Données
  stats = [],
  defaultStats = [
    { label: 'Users', value: '12k' },
    { label: 'Uptime', value: '99.9%' }
  ],
  
  // Ligne
  direction = 'horizontal',
  wrap = false,
  scrollable = false,
  alignment = 'start',
  
  // Responsive
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  responsive = {
    mobile: { columns: 1, direction: 'vertical' as const },
    tablet: { columns: 2, direction: 'vertical' as const },
    desktop: { columns: 3, direction: 'horizontal' as const }
  },
  
  // Style
  variant = 'default',
  size = 'medium',
  layout = 'inline',
  
  // Espacement
  gap,
  spacing = 'normal',
  
  // Animations
  animated = true,
  staggerDelay = 100,
  animationType = 'fade',
  directionAnim = 'left',
  
  // Interactions
  hoverable = true,
  clickable = true,
  groupInteractions = true,
  syncData = false,
  
  // États
  loading = false,
  error,
  onStatClick,
  onRefresh,
  onExport,
  
  // Classes
  className = '',
  style,
  
  // Props StatsCard
  statsCardProps = {},
  
  ...props
}, ref) => {
  // État local pour les données synchronisées
  const [localStats, setLocalStats] = useState<StatItem[]>(stats.length > 0 ? stats : defaultStats)
  const [refreshKey, setRefreshKey] = useState(0)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const statRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // Synchronisation des données
  useEffect(() => {
    if (stats.length > 0) {
      setLocalStats(stats)
    }
  }, [stats])
  
  // Calcul des propriétés responsive
  const responsiveConfig = useMemo(() => {
    if (typeof window === 'undefined') return responsive.desktop
    
    const width = window.innerWidth
    if (width < breakpoints.sm) return responsive.mobile
    if (width < breakpoints.md) return responsive.tablet
    if (width < breakpoints.lg) return responsive.desktop
    return responsive.desktop
  }, [responsive, breakpoints])
  
  // Calcul des colonnes et de la direction
  const columns = responsiveConfig.columns
  const currentDirection = direction === 'auto' ? responsiveConfig.direction : direction
  
  // Calcul du gap responsive
  const responsiveGap = useMemo(() => {
    if (gap !== undefined) {
      if (typeof gap === 'number') {
        if (typeof window === 'undefined') return gap
        const width = window.innerWidth
        if (width < breakpoints.sm) return gap * 0.5
        if (width < breakpoints.md) return gap * 0.75
        return gap
      }
      return gap
    }
    
    // Gap automatique basé sur le spacing et la taille
    const baseGap = {
      tight: 8,
      normal: 16,
      relaxed: 24,
      loose: 32
    }
    
    const sizeMultiplier = {
      small: 0.75,
      medium: 1,
      large: 1.25,
      xlarge: 1.5
    }
    
    return baseGap[spacing] * sizeMultiplier[size]
  }, [gap, spacing, size, breakpoints])
  
  // Synchronisation des données entre statistiques
  const syncAcrossStats = useMemo(() => {
    if (!syncData || localStats.length === 0) return null
    
    const numericValues = localStats.map(stat => {
      const val = stat.value
      if (typeof val === 'number') return val
      // Extraction de valeurs numériques depuis les strings (ex: "$1,234" -> 1234)
      const numericStr = val.toString().replace(/[^0-9.-]/g, '')
      return parseFloat(numericStr) || 0
    }).filter(val => !isNaN(val))
    
    if (numericValues.length === 0) return null
    
    const maxValue = Math.max(...numericValues)
    const minValue = Math.min(...numericValues)
    const avgValue = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
    
    return {
      maxValue,
      minValue,
      avgValue,
      total: numericValues.reduce((sum, val) => sum + val, 0),
      count: numericValues.length
    }
  }, [localStats, syncData])
  
  // Gestion du scroll horizontal
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || !scrollable) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    const newPosition = direction === 'left' 
      ? Math.max(scrollPosition - scrollAmount, 0)
      : Math.min(scrollPosition + scrollAmount, container.scrollWidth - container.clientWidth)
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }
  
  // Gestion du clic sur une statistique
  const handleStatClick = (stat: StatItem, index: number) => {
    if (clickable && (stat.onClick || onStatClick)) {
      stat.onClick?.()
      onStatClick?.(stat, index)
    }
  }
  
  // Gestion du hover avec interactions de groupe
  const handleStatHover = (statId: string | undefined, isHovering: boolean) => {
    if (groupInteractions) {
      setHoveredStat(isHovering ? (statId || 'all') : null)
    }
  }
  
  // Animation des éléments
  const getStatStyle = (index: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      opacity: animated ? 0 : 1,
      transform: animated ? getAnimationTransform(animationType, directionAnim, 1) : 'none',
      transition: animated ? `all 0.3s ease ${index * (staggerDelay / 1000)}s` : undefined
    }
    
    if (animated && refreshKey > 0) {
      setTimeout(() => {
        if (statRefs.current[index]) {
          statRefs.current[index]!.style.opacity = '1'
          statRefs.current[index]!.style.transform = 'none'
        }
      }, index * staggerDelay)
    }
    
    return baseStyle
  }
  
  const getAnimationTransform = (type: string, direction: string, intensity: number) => {
    switch (type) {
      case 'slide':
        switch (direction) {
          case 'left': return `translateX(${intensity * 30}px)`
          case 'right': return `translateX(${-intensity * 30}px)`
          case 'up': return `translateY(${intensity * 20}px)`
          case 'down': return `translateY(${-intensity * 20}px)`
          default: return `translateX(${intensity * 30}px)`
        }
      case 'scale': return `scale(${1 - intensity * 0.1})`
      case 'bounce': 
        return direction === 'up' || direction === 'down' 
          ? `translateY(${intensity * 15}px)`
          : `translateX(${intensity * 15}px)`
      case 'fade':
      default: return 'none'
    }
  }
  
  // Rendu des éléments avec données synchronisées
  const renderStat = (stat: StatItem, index: number) => {
    const statId = stat.id || `stats-row-${index}`
    const isHovered = hoveredStat === statId || hoveredStat === 'all'
    
    // Enrichissement des données avec synchronisation
    const enhancedStat = {
      ...stat,
      ...(syncAcrossStats && {
        comparison: {
          label: 'vs Average',
          value: Math.round(syncAcrossStats.avgValue)
        }
      })
    }
    
    return (
      <div
        key={statId}
        ref={el => { statRefs.current[index] = el }}
        style={getStatStyle(index)}
        className={`
          stats-row-item
          ${hoverable ? 'stats-row-item--hoverable' : ''}
          ${clickable ? 'stats-row-item--clickable' : ''}
          ${isHovered ? 'stats-row-item--hovered' : ''}
          ${stat.disabled ? 'stats-row-item--disabled' : ''}
          stats-row-item--${currentDirection}
          stats-row-item--${layout}
        `}
        onClick={() => handleStatClick(stat, index)}
        onMouseEnter={() => handleStatHover(statId, true)}
        onMouseLeave={() => handleStatHover(statId, false)}
        tabIndex={clickable ? 0 : -1}
        role={clickable ? 'button' : undefined}
        aria-label={`${stat.label}: ${stat.value}`}
      >
        <StatsCard
          {...enhancedStat}
          variant={variant}
          size={size}
          layout={currentDirection === 'horizontal' ? 'horizontal' : 'vertical'}
          loading={loading || stat.loading}
          error={error || stat.error}
          disabled={stat.disabled}
          {...statsCardProps}
        />
      </div>
    )
  }
  
  // Gestion du refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      setRefreshKey(prev => prev + 1)
      // Animation de refresh
      if (containerRef.current) {
        containerRef.current.style.opacity = '0.7'
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.opacity = '1'
          }
        }, 300)
      }
    }
  }
  
  // Classes CSS finales
  const finalClassName = `
    stats-row
    stats-row--${currentDirection}
    stats-row--${layout}
    stats-row--${variant}
    stats-row--${size}
    stats-row--${alignment}
    ${wrap ? 'stats-row--wrap' : ''}
    ${scrollable ? 'stats-row--scrollable' : ''}
    ${className}
    ${loading ? 'stats-row--loading' : ''}
    ${hoverable ? 'stats-row--hoverable' : ''}
    ${groupInteractions ? 'stats-row--group-interactions' : ''}
  `.replace(/\s+/g, ' ').trim()
  
  // Styles de la ligne
  const rowStyle: React.CSSProperties = {
    display: currentDirection === 'horizontal' ? 'flex' : 'block',
    flexDirection: currentDirection === 'horizontal' ? 'row' : undefined,
    gap: responsiveGap,
    alignItems: currentDirection === 'horizontal' ? getAlignmentClass(alignment) : undefined,
    justifyContent: currentDirection === 'horizontal' ? getJustifyClass(alignment) : undefined,
    flexWrap: wrap ? 'wrap' : currentDirection === 'horizontal' ? 'nowrap' : undefined,
    ...style
  }
  
  function getAlignmentClass(align: string) {
    switch (align) {
      case 'start': return 'flex-start'
      case 'center': return 'center'
      case 'end': return 'flex-end'
      case 'between': return 'center'
      case 'around': return 'center'
      case 'evenly': return 'center'
      default: return 'flex-start'
    }
  }
  
  function getJustifyClass(justify: string) {
    switch (justify) {
      case 'start': return 'flex-start'
      case 'center': return 'center'
      case 'end': return 'flex-end'
      case 'between': return 'space-between'
      case 'around': return 'space-around'
      case 'evenly': return 'space-evenly'
      default: return 'flex-start'
    }
  }
  
  if (error && !loading) {
    return (
      <div
        ref={ref}
        className={finalClassName}
        style={rowStyle}
        role="alert"
        aria-live="polite"
      >
        <div className="stats-row-error">
          <div className="stats-row-error-icon">⚠️</div>
          <div className="stats-row-error-message">Error loading statistics</div>
          <button
            className="stats-row-error-button"
            onClick={handleRefresh}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div
      ref={ref}
      className={finalClassName}
      style={rowStyle}
      {...props}
    >
      {/* Header avec actions */}
      {(onRefresh || onExport || syncAcrossStats) && (
        <div className="stats-row-header">
          <div className="stats-row-header-left">
            {syncAcrossStats && (
              <div className="stats-row-sync-info">
                <span className="stats-row-sync-badge">
                  Total: {Math.round(syncAcrossStats.total)} ({syncAcrossStats.count} items)
                </span>
              </div>
            )}
          </div>
          <div className="stats-row-header-right">
            {onRefresh && (
              <button
                className="stats-row-action"
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh statistics"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3a5 5 0 0 0-4.546 2.916L.454 8.916A1 1 0 0 0 1.454 10.9L5.45 6.9A5 5 0 1 0 13 3h1a4 4 0 0 1 2 7.732l-1.09 2.18A1 1 0 0 0 16 15.9l-1.09-2.18A4 4 0 0 1 13 3h-1a5 5 0 0 0-4-0z"/>
                </svg>
              </button>
            )}
            {onExport && (
              <button
                className="stats-row-action"
                onClick={onExport}
                aria-label="Export statistics"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.5 1a.5.5 0 0 0-.5.5v1H4a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h2v1.5a.5.5 0 0 0 1 0V10h2v2h2a1 1 0 0 0 0-2H8V6.5H6a.5.5 0 0 0 0-1H7V1.5a.5.5 0 0 0-.5-.5z"/>
                  <path d="M3 13.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Conteneur principal avec scroll */}
      {scrollable ? (
        <div ref={scrollContainerRef} className="stats-row-scroller">
          <div className="stats-row-content">
            {localStats.map((stat, index) => renderStat(stat, index))}
          </div>
          
          {/* Contrôles de navigation */}
          {localStats.length > 0 && (
            <div className="stats-row-navigation">
              <button
                className="stats-row-nav stats-row-nav--prev"
                onClick={() => handleScroll('left')}
                disabled={scrollPosition === 0}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </button>
              <button
                className="stats-row-nav stats-row-nav--next"
                onClick={() => handleScroll('right')}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Conteneur normal sans scroll */
        <div ref={containerRef} className="stats-row-content">
          {localStats.map((stat, index) => renderStat(stat, index))}
        </div>
      )}
      
      {/* États de chargement */}
      {loading && (
        <div className="stats-row-skeleton">
          {Array.from({ length: Math.max(columns, 2) }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="stats-row-skeleton-item"
            />
          ))}
        </div>
      )}
    </div>
  )
})

StatsRow.displayName = 'StatsRow'

export default StatsRow