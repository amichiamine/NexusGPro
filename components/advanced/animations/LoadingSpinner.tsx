import React from 'react';
import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  variant?: 'spinner' | 'dots' | 'ring' | 'bars';
  className?: string;
  text?: string;
  centered?: boolean;
}

/**
 * Composant LoadingSpinner avancé avec multiples variantes et tailles
 * Utilise CSS custom properties pour le thème et l'animation fluide
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  className,
  text,
  centered = false,
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    neutral: 'text-gray-500'
  };

  const spinnerVariants = {
    spinner: (
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-current",
        sizeClasses[size],
        colorClasses[color]
      )} />
    ),
    dots: (
      <div className="flex space-x-1">
        <div className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ animationDelay: '150ms' }} />
        <div className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ animationDelay: '300ms' }} />
      </div>
    ),
    ring: (
      <div className={cn(
        "rounded-full border-4 border-transparent border-t-current",
        sizeClasses[size],
        colorClasses[color]
      )} />
    ),
    bars: (
      <div className="flex items-end space-x-1">
        <div className={cn(
          "rounded-t animate-pulse",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ 
          animationDuration: '1s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '20px' : size === 'lg' ? '24px' : '32px'
        }} />
        <div className={cn(
          "rounded-t animate-pulse",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ 
          animationDuration: '1s',
          animationDelay: '0.2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          height: size === 'xs' ? '16px' : size === 'sm' ? '20px' : size === 'md' ? '24px' : size === 'lg' ? '28px' : '36px'
        }} />
        <div className={cn(
          "rounded-t animate-pulse",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ 
          animationDuration: '1s',
          animationDelay: '0.4s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          height: size === 'xs' ? '20px' : size === 'sm' ? '24px' : size === 'md' ? '28px' : size === 'lg' ? '32px' : '40px'
        }} />
        <div className={cn(
          "rounded-t animate-pulse",
          sizeClasses[size],
          colorClasses[color],
          "bg-current"
        )} style={{ 
          animationDuration: '1s',
          animationDelay: '0.6s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          height: size === 'xs' ? '24px' : size === 'sm' ? '28px' : size === 'md' ? '32px' : size === 'lg' ? '36px' : '44px'
        }} />
      </div>
    )
  };

  return (
    <div className={cn(
      "flex items-center gap-3",
      centered && "justify-center",
      className
    )}>
      {spinnerVariants[variant]}
      {text && (
        <span className={cn(
          "text-sm font-medium",
          colorClasses[color]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;