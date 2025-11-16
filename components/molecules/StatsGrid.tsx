import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react'
import StatsCard from './StatsCard'

// Types pour le composant StatsGrid
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

export interface StatsGridProps {
  // Données et configuration
  items?: StatItem[]
  defaultItems?: StatItem[]
  
  // Configuration de la grille
  columns?: number
  columnRange?: [number, number]
  gap?: number | string
  layout?: 'fixed' | 'auto-fill' | 'auto-fit' | 'masonry'
  
  // Responsive breakpoints
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  responsive?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  
  // Variants et styles
  variant?: 'default' | 'bordered' | 'filled' | 'minimal' | 'glass' | 'gradient'
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  
  // Animations
  animated?: boolean
  staggerDelay?: number
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce'
  
  // Interactions
  hoverable?: boolean
  clickable?: boolean
  groupInteractions?: boolean
  syncData?: boolean
  
  // États et callbacks
  loading?: boolean
  error?: string
  onItemClick?: (item: StatItem, index: number) => void
  onRefresh?: () => void
  onExport?: () => void
  
  // Classes et styles personnalisés
  className?: string
  style?: React.CSSProperties
  
  // Props du StatsCard sous-jacent
  statsCardProps?: React.ComponentProps<typeof StatsCard>
}

const StatsGrid = forwardRef<HTMLDivElement, StatsGridProps>(({
  // Données
  items = [],
  defaultItems = [
    { label: 'Users', value: '25k' },
    { label: 'APIs', value: '120' },
    { label: 'Regions', value: '12' }
  ],
  
  // Grille
  columns = 3,
  columnRange = [1, 4],
  gap = 12,
  layout = 'fixed',
  
  // Responsive
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  responsive = { mobile: 1, tablet: 2, desktop: 3 },
  
  // Style
  variant = 'default',
  size = 'medium',
  
  // Animations
  animated = true,
  staggerDelay = 100,
  animationType = 'fade',
  
  // Interactions
  hoverable = true,
  clickable = true,
  groupInteractions = true,
  syncData = false,
  
  // États
  loading = false,
  error,
  onItemClick,
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
  const [localItems, setLocalItems] = useState<StatItem[]>(items.length > 0 ? items : defaultItems)
  const [refreshKey, setRefreshKey] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // Synchronisation des données
  useEffect(() => {
    if (items.length > 0) {
      setLocalItems(items)
    }
  }, [items])
  
  // Calcul des colonnes responsive
  const responsiveColumns = useMemo(() => {
    if (typeof window === 'undefined') return responsive.desktop
    
    const width = window.innerWidth
    if (width < breakpoints.sm) return responsive.mobile
    if (width < breakpoints.md) return responsive.tablet
    if (width < breakpoints.lg) return responsive.desktop
    return responsive.desktop + 1
  }, [responsive, breakpoints])
  
  // Calcul des colonnes de la grille
  const gridColumns = useMemo(() => {
    switch (layout) {
      case 'auto-fill':
        return `repeat(auto-fill, minmax(${Math.floor(100 / responsiveColumns)}%, 1fr))`
      case 'auto-fit':
        return `repeat(auto-fit, minmax(${Math.floor(100 / responsiveColumns)}%, 1fr))`
      case 'masonry':
        return `repeat(${responsiveColumns}, 1fr)`
      case 'fixed':
      default:
        return `repeat(${Math.min(columns, responsiveColumns)}, 1fr)`
    }
  }, [layout, columns, responsiveColumns])
  
  // Calcul des valeurs de gap responsive
  const responsiveGap = useMemo(() => {
    if (typeof gap === 'number') {
      if (typeof window === 'undefined') return gap
      const width = window.innerWidth
      if (width < breakpoints.sm) return gap * 0.5
      if (width < breakpoints.md) return gap * 0.75
      return gap
    }
    return gap
  }, [gap, breakpoints])
  
  // Synchronisation des données entre cartes
  const syncAcrossItems = useMemo(() => {
    if (!syncData || localItems.length === 0) return null
    
    const maxValue = Math.max(...localItems.map(item => 
      typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0
    ))
    
    return {
      maxValue,
      averageValue: localItems.reduce((sum, item) => 
        sum + (typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0), 0
      ) / localItems.length
    }
  }, [localItems, syncData])
  
  // Gestion du clic sur un élément
  const handleItemClick = (item: StatItem, index: number) => {
    if (clickable && (item.onClick || onItemClick)) {
      item.onClick?.()
      onItemClick?.(item, index)
    }
  }
  
  // Gestion du hover avec interactions de groupe
  const handleItemHover = (itemId: string | undefined, isHovering: boolean) => {
    if (groupInteractions) {
      setHoveredItem(isHovering ? (itemId || 'all') : null)
    }
  }
  
  // Animation des éléments
  const getItemStyle = (index: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      opacity: animated ? 0 : 1,
      transform: animated ? getAnimationTransform(animationType, 1) : 'none',
      transition: animated ? `all 0.3s ease ${index * (staggerDelay / 1000)}s` : undefined
    }
    
    if (animated && refreshKey > 0) {
      setTimeout(() => {
        if (itemRefs.current[index]) {
          itemRefs.current[index]!.style.opacity = '1'
          itemRefs.current[index]!.style.transform = 'none'
        }
      }, index * staggerDelay)
    }
    
    return baseStyle
  }
  
  const getAnimationTransform = (type: string, intensity: number) => {
    switch (type) {
      case 'slide': return `translateY(${intensity * 20}px)`
      case 'scale': return `scale(${1 - intensity * 0.1})`
      case 'bounce': return `translateY(${intensity * 10}px)`
      case 'fade':
      default: return 'none'
    }
  }
  
  // Rendu des éléments avec données synchronisées
  const renderItem = (item: StatItem, index: number) => {
    const itemId = item.id || `stats-grid-${index}`
    const isHovered = hoveredItem === itemId || hoveredItem === 'all'
    
    // Enrichissement des données avec synchronisation
    const enhancedItem = {
      ...item,
      ...(syncAcrossItems && {
        comparison: {
          label: 'Compared to highest',
          value: Math.round(syncAcrossItems.averageValue)
        }
      })
    }
    
    return (
      <div
        key={itemId}
        ref={el => { itemRefs.current[index] = el }}
        style={getItemStyle(index)}
        className={`
          stats-grid-item
          ${hoverable ? 'stats-grid-item--hoverable' : ''}
          ${clickable ? 'stats-grid-item--clickable' : ''}
          ${isHovered ? 'stats-grid-item--hovered' : ''}
          ${item.disabled ? 'stats-grid-item--disabled' : ''}
        `}
        onClick={() => handleItemClick(item, index)}
        onMouseEnter={() => handleItemHover(itemId, true)}
        onMouseLeave={() => handleItemHover(itemId, false)}
        tabIndex={clickable ? 0 : -1}
        role={clickable ? 'button' : undefined}
        aria-label={`${item.label}: ${item.value}`}
      >
        <StatsCard
          {...enhancedItem}
          variant={variant}
          size={size}
          layout={layout === 'masonry' ? 'compact' : 'vertical'}
          loading={loading || item.loading}
          error={error || item.error}
          disabled={item.disabled}
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
    stats-grid
    stats-grid--${layout}
    stats-grid--${variant}
    stats-grid--${size}
    ${className}
    ${loading ? 'stats-grid--loading' : ''}
    ${hoverable ? 'stats-grid--hoverable' : ''}
    ${groupInteractions ? 'stats-grid--group-interactions' : ''}
  `.replace(/\s+/g, ' ').trim()
  
  // Styles de la grille
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridColumns,
    gap: responsiveGap,
    ...style
  }
  
  if (error && !loading) {
    return (
      <div
        ref={ref}
        className={finalClassName}
        style={gridStyle}
        role="alert"
        aria-live="polite"
      >
        <div className="stats-grid-error">
          <div className="stats-grid-error-icon">⚠️</div>
          <div className="stats-grid-error-message">Error loading stats</div>
          <button
            className="stats-grid-error-button"
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
      style={gridStyle}
      {...props}
    >
      {/* Header avec actions */}
      {(onRefresh || onExport || syncAcrossItems) && (
        <div className="stats-grid-header">
          <div className="stats-grid-header-left">
            {syncAcrossItems && (
              <div className="stats-grid-sync-info">
                <span className="stats-grid-sync-badge">
                  Sync: {Math.round(syncAcrossItems.averageValue)} avg
                </span>
              </div>
            )}
          </div>
          <div className="stats-grid-header-right">
            {onRefresh && (
              <button
                className="stats-grid-action"
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
                className="stats-grid-action"
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
      
      {/* États de chargement */}
      {loading && (
        <div className="stats-grid-skeleton">
          {Array.from({ length: responsiveColumns * 2 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="stats-grid-skeleton-item"
            />
          ))}
        </div>
      )}
      
      {/* Grille de statistiques */}
      {!loading && (
        <div ref={containerRef} className="stats-grid-content">
          {localItems.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  )
})

StatsGrid.displayName = 'StatsGrid'

export default StatsGrid