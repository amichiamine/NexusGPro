// NexusG Lite - Composants Atoms
// Version 1.0.0 - 15 composants atoms

// Atoms originaux
export { default as Avatar } from './atoms/Avatar'
export { default as Badge } from './atoms/Badge'
export { default as Button } from './atoms/Button'
export { default as IconBadge } from './atoms/IconBadge'
export { default as Input } from './atoms/Input'
export { default as Skeleton } from './atoms/Skeleton'
export { default as Switch } from './atoms/Switch'
export { default as Tag } from './atoms/Tag'

// Nouveaux atoms ajoutés
export { default as Checkbox } from './atoms/Checkbox'
export { default as Select } from './atoms/Select'
export { default as Progress } from './atoms/Progress'
export { default as Alert } from './atoms/Alert'
export { default as Divider } from './atoms/Divider'
export { default as Slider } from './atoms/Slider'

// Molecules (existants)
export { default as Accordion } from './molecules/Accordion'
export { default as Breadcrumbs } from './molecules/Breadcrumbs'
export { default as Card } from './molecules/Card'
export { default as FAQAccordion } from './molecules/FAQAccordion'
export { default as FeatureCard } from './molecules/FeatureCard'
export { default as Modal } from './molecules/Modal'
export { default as Navbar } from './molecules/Navbar'
export { default as Pagination } from './molecules/Pagination'
export { default as PricingCard } from './molecules/PricingCard'
export { default as SearchBox } from './molecules/SearchBox'
export { default as StatsCard } from './molecules/StatsCard'
export { default as StatsGrid } from './molecules/StatsGrid'
export { default as StatsRow } from './molecules/StatsRow'
export { default as Table } from './molecules/Table'
export { default as Tabs } from './molecules/Tabs'
export { default as Testimonial } from './molecules/Testimonial'
export { default as Toast } from './molecules/Toast'
export { default as Tooltip } from './molecules/Tooltip'

// Organisms (existants)
export { default as CTASection } from './organisms/CTASection'
export { default as Carousel } from './organisms/Carousel'
export { default as FooterModern } from './organisms/FooterModern'
export { default as FooterRich } from './organisms/FooterRich'
export { default as HeaderBar } from './organisms/HeaderBar'
export { default as Hero } from './organisms/Hero'
export { default as LogoCloud } from './organisms/LogoCloud'
export { default as NavbarOrganism } from './organisms/Navbar'
export { default as PricingTable } from './organisms/PricingTable'
export { default as PromoBanner } from './organisms/PromoBanner'

// Composants avec interfaces spécialisées
export type { CheckboxProps } from './atoms/Checkbox'
export type { SelectProps, Option } from './atoms/Select'
export type { ProgressProps } from './atoms/Progress'
export type { AlertProps, AlertWithActionsProps, AlertErrorListProps, AlertNotificationProps } from './atoms/Alert'
export type { DividerProps, TextDividerProps, IconDividerProps, ListDividerProps } from './atoms/Divider'
export type { SliderProps, DiscreteSliderProps, PriceSliderProps } from './atoms/Slider'

// Re-exports des types existants
export type { AvatarProps } from './atoms/Avatar'
export type { BadgeProps } from './atoms/Badge'
export type { ButtonProps } from './atoms/Button'
export type { IconBadgeProps } from './atoms/IconBadge'
export type { InputProps } from './atoms/Input'
export type { SkeletonProps } from './atoms/Skeleton'
export type { SwitchProps } from './atoms/Switch'
export type { TagProps } from './atoms/Tag'

// ==========================================================================
// COMPOSANTS AVANCÉS - OPTION C.1
// ==========================================================================

// Import des styles CSS pour les composants avancés
import './advanced/AdvancedComponents.css';

// Composants d'Animation
export {
  LoadingSpinner,
  SkeletonLoader,
  AnimatedCounter,
  ProgressCounter,
  TimeCounter,
} from './advanced/animations';

// Composants de Thème Dynamique
export {
  ThemeProvider,
  ThemeToggle,
  useTheme,
  type Theme,
  type ThemeConfig,
  type ColorPalette,
} from './advanced/theme';

// Composants de Performance
export {
  VirtualScroller,
  InfiniteScroll,
  OptimizedImage,
  AvatarImage,
  ResponsiveImage,
} from './advanced/performance';

// Composant de démonstration
export { default as AdvancedComponentsDemo } from './advanced/AdvancedComponentsDemo';

// Provider pour tous les composants avancés
export { AdvancedComponentsProvider } from './advanced/index';

// Utils et configurations
export {
  useUserPreferences,
  ANIMATION_CONFIG,
  COLOR_PALETTES,
  SIZE_CONFIG,
} from './advanced/index';

// ==========================================================================
// VERSION INFO
// ==========================================================================
export const NEXUSG_LITE_VERSION = '1.1.0'
export const NEXUSG_LITE_ATOMS_COUNT = 15
export const NEXUSG_LITE_MOLECULES_COUNT = 18
export const NEXUSG_LITE_ORGANISMS_COUNT = 10
export const NEXUSG_LITE_ADVANCED_COUNT = 23  // Nouveau
export const NEXUSG_LITE_TOTAL_COMPONENTS = 66  // Nouveau

// ==========================================================================
// SUMMARY DES NOUVEAUTÉS OPTION C.1
// ==========================================================================
/**
 * ✨ COMPOSANTS D'ANIMATION (10 composants)
 * - LoadingSpinner : Spinners avec multiples variantes
 * - SkeletonLoader : Placeholders élégants 
 * - AnimatedCounter : Compteurs avec animations fluides
 * - Micro-animations : Transitions et effets
 * 
 * 🎨 THÈME DYNAMIQUE (5 composants)
 * - ThemeProvider : Provider contextuel
 * - ThemeToggle : Basculement Dark/Light/Auto
 * - Système de couleurs personnalisables
 * - Support CSS custom properties
 * 
 * ⚡ PERFORMANCE (8 composants)
 * - VirtualScroller : Listes virtualisées
 * - OptimizedImage : Images optimisées
 * - InfiniteScroll : Chargement auto
 * - Composants de monitoring
 */