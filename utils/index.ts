// Utilitaires pour NexusG Lite

/**
 * Génère une classe CSS conditionnelle
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Fonction utilitaire pour combiner les classes CSS conditionnelles
 * Fonction avancée qui gère à la fois les chaînes et les objets
 */
export function cn(...classes: (string | undefined | null | false | Record<string, any>)[]): string {
  const validClasses: string[] = []
  
  classes.forEach(cls => {
    if (typeof cls === 'string' && cls) {
      validClasses.push(cls)
    } else if (cls && typeof cls === 'object') {
      Object.entries(cls).forEach(([key, value]) => {
        if (value && key) {
          validClasses.push(key)
        }
      })
    }
  })
  
  return validClasses.join(' ')
}

/**
 * Génère un ID unique
 */
export function generateId(prefix = 'ng'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Merge les props d'objet profondément
 */
export function mergeProps<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeProps(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeProps(target, ...sources)
}

/**
 * Vérifie si une valeur est un objet
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Formate un prix avec la devise
 */
export function formatPrice(
  price: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Vérifie si une URL est valide
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Formatte une durée en format lisible
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

/**
 * Génère une couleur aléatoire
 */
export function randomColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Calcule la lecture d'un texte
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}