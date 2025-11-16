// Types globaux pour NexusG Lite

import { ReactNode } from 'react'

// Props de base pour tous les composants
export interface BaseProps {
  id?: string
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
  'data-testid'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  role?: string
}

// Variantes de composants communes
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type Shape = 'square' | 'rounded' | 'pill'

// Types pour les événements
export interface EventHandlers {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void
  onKeyUp?: (event: React.KeyboardEvent<HTMLElement>) => void
}

// Types pour les éléments
export interface ButtonProps extends BaseProps, EventHandlers {
  variant?: Variant
  size?: Size
  shape?: Shape
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  type?: 'button' | 'submit' | 'reset'
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  label?: string
}

export interface InputProps extends BaseProps, EventHandlers {
  type?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  size?: Size
  variant?: Variant
  error?: boolean
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  name?: string
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
}

export interface CardProps extends BaseProps {
  variant?: Variant
  padding?: Size
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  rounded?: boolean
  interactive?: boolean
  hoverable?: boolean
  actions?: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

export interface ModalProps extends BaseProps, EventHandlers {
  open?: boolean
  onClose?: () => void
  title?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  centered?: boolean
  footer?: ReactNode
}

export interface TableProps extends BaseProps {
  data?: Array<Record<string, any>>
  columns?: Array<{
    key: string
    title: string
    dataIndex?: string
    render?: (value: any, record: any, index: number) => ReactNode
    width?: number | string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    filterable?: boolean
  }>
  loading?: boolean
  pagination?: boolean
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number, pageSize: number) => void
  rowSelection?: {
    selectedRowKeys?: string[]
    onChange?: (selectedRowKeys: string[], selectedRows: any[]) => void
  }
  sorting?: {
    field?: string
    order?: 'asc' | 'desc'
  }
}

// Types pour les domaines spécialisés
export interface ProductProps extends BaseProps {
  id: string
  title: string
  price: number
  originalPrice?: number
  discount?: number
  image?: string
  images?: string[]
  rating?: number
  reviews?: number
  inStock?: boolean
  variants?: Array<{
    id: string
    name: string
    value: string
    price?: number
    stock?: number
  }>
  attributes?: Record<string, string>
}

export interface CourseProps extends BaseProps {
  id: string
  title: string
  instructor: {
    name: string
    avatar?: string
    bio?: string
  }
  description: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  originalPrice?: number
  rating?: number
  students?: number
  thumbnail?: string
  lessons?: Array<{
    id: string
    title: string
    duration: string
    completed?: boolean
  }>
  progress?: number
  category?: string
  tags?: string[]
}

// Thème et style
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
    border: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Export pour les tests
export * from './components'