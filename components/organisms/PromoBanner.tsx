import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/utils';
import './PromoBanner.css';

export interface PromoMessage {
  id?: string;
  text: string;
  link?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  icon?: string;
  badge?: string;
  highlight?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  expiryDate?: string;
  cta?: {
    text: string;
    link: string;
    target?: '_self' | '_blank' | '_parent' | '_top';
  };
}

export interface PromoBannerProps {
  messages: PromoMessage[];
  variant?: 'default' | 'dark' | 'light' | 'gradient' | 'minimal' | 'card' | 'modern' | 'urgent';
  layout?: 'horizontal' | 'vertical' | 'grid' | 'cards' | 'stories' | 'marquee';
  animation?: 'slide' | 'fade' | 'zoom' | 'bounce' | 'typewriter' | 'pulse' | 'blink';
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  autoplay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  pauseOnHover?: boolean;
  autoRestart?: boolean;
  maxItems?: number;
  responsive?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  customStyles?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
  showBadge?: boolean;
  showIcon?: boolean;
  truncateText?: boolean;
  onMessageClick?: (message: PromoMessage, index: number) => void;
  onMessageHover?: (message: PromoMessage, index: number) => void;
  onBannerClick?: (event: React.MouseEvent) => void;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  theme?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: 'high' | 'medium' | 'low';
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  messages = [
    {
      text: 'Bienvenue sur NexusG',
      priority: 'medium' as const,
    }
  ],
  variant = 'default',
  layout = 'horizontal',
  animation = 'slide',
  speed = 30,
  direction = 'left',
  autoplay = true,
  loop = true,
  showControls = false,
  showIndicators = false,
  pauseOnHover = true,
  autoRestart = true,
  maxItems,
  responsive = {
    mobile: 1,
    tablet: 3,
    desktop: 5,
  },
  customStyles,
  className = '',
  ariaLabel = 'Promotional Messages',
  showBadge = false,
  showIcon = false,
  truncateText = false,
  onMessageClick,
  onMessageHover,
  onBannerClick,
  onAnimationStart,
  onAnimationEnd,
  onPause,
  onResume,
  theme = 'default',
  size = 'md',
  priority = 'medium',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Filter and sort messages by priority and expiry
  const filteredMessages = useMemo(() => {
    const now = new Date();
    const validMessages = messages.filter(msg => {
      if (msg.expiryDate) {
        return new Date(msg.expiryDate) > now;
      }
      return true;
    });

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return validMessages.sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'medium'] || 2;
      const bPriority = priorityOrder[b.priority || 'medium'] || 2;
      return bPriority - aPriority;
    });
  }, [messages]);

  // Limit messages based on maxItems and responsive settings
  const limitedMessages = useMemo(() => {
    const maxVisible = maxItems || responsive.desktop || 5;
    return filteredMessages.slice(0, maxVisible);
  }, [filteredMessages, maxItems, responsive.desktop]);

  // Animation duration calculation
  const animationDuration = useMemo(() => {
    const baseSpeed = Math.max(10, limitedMessages.length * speed);
    return `${baseSpeed}s`;
  }, [limitedMessages.length, speed]);

  // Handle animation controls
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onResume?.();
  }, [onResume]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  // Handle message navigation
  const handlePrev = useCallback(() => {
    setCurrentMessageIndex(prev => 
      prev > 0 ? prev - 1 : limitedMessages.length - 1
    );
  }, [limitedMessages.length]);

  const handleNext = useCallback(() => {
    setCurrentMessageIndex(prev => 
      prev < limitedMessages.length - 1 ? prev + 1 : 0
    );
  }, [limitedMessages.length]);

  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (pauseOnHover && isPlaying) {
      handlePause();
    }
  }, [pauseOnHover, isPlaying, handlePause]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (pauseOnHover && !isPlaying && autoplay) {
      handlePlay();
    }
  }, [pauseOnHover, autoplay, handlePlay]);

  // Handle message click
  const handleMessageClick = useCallback((message: PromoMessage, index: number) => {
    if (message.link) {
      window.open(message.link, message.target || '_self');
    }
    onMessageClick?.(message, index);
  }, [onMessageClick]);

  // Handle message hover
  const handleMessageHover = useCallback((message: PromoMessage, index: number) => {
    onMessageHover?.(message, index);
  }, [onMessageHover]);

  // Handle animation lifecycle
  useEffect(() => {
    if (isPlaying) {
      onAnimationStart?.();
    } else {
      onAnimationEnd?.();
    }
  }, [isPlaying, onAnimationStart, onAnimationEnd]);

  // Auto-rotation for certain layouts
  useEffect(() => {
    if (autoplay && layout === 'stories' && !isHovered) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoplay, layout, isHovered, handleNext]);

  // Auto-restart animation
  useEffect(() => {
    if (autoRestart && !isPlaying && bannerRef.current) {
      const timeout = setTimeout(() => {
        if (bannerRef.current) {
          handlePlay();
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [autoRestart, isPlaying, handlePlay]);

  // Render message item
  const renderMessage = useCallback((message: PromoMessage, index: number) => {
    const isActive = currentMessageIndex === index;
    const messageClasses = cn(
      'promo-banner__message',
      `promo-banner__message--${priority || message.priority || 'medium'}`,
      { 'promo-banner__message--active': isActive },
      { 'promo-banner__message--highlight': message.highlight },
      { 'promo-banner__message--truncated': truncateText }
    );

    return (
      <div
        key={message.id || index}
        className={messageClasses}
        onClick={() => handleMessageClick(message, index)}
        onMouseEnter={() => handleMessageHover(message, index)}
        role="button"
        tabIndex={0}
        aria-label={`Message: ${message.text}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMessageClick(message, index);
          }
        }}
      >
        {/* Message Badge */}
        {showBadge && message.badge && (
          <span className="promo-banner__badge" aria-label={`Badge: ${message.badge}`}>
            {message.badge}
          </span>
        )}

        {/* Message Icon */}
        {showIcon && message.icon && (
          <span className="promo-banner__icon" aria-hidden="true">
            {message.icon}
          </span>
        )}

        {/* Message Text */}
        <span className="promo-banner__text">
          {message.text}
        </span>

        {/* CTA Button */}
        {message.cta && (
          <span className="promo-banner__cta">
            {message.cta.text}
          </span>
        )}
      </div>
    );
  }, [
    priority, currentMessageIndex, showBadge, showIcon, truncateText,
    handleMessageClick, handleMessageHover
  ]);

  // Render horizontal layout
  const renderHorizontalLayout = useCallback(() => (
    <div 
      ref={bannerRef}
      className={`promo-banner promo-banner--horizontal promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Animation Track */}
      <div 
        className={`promo-banner__track promo-banner__track--${animation} promo-banner__track--${direction}`}
        style={{
          animationDuration: animationDuration,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      >
        {/* Duplicate messages for seamless loop */}
        {limitedMessages.concat(limitedMessages).map((message, index) => (
          <div key={index} className="promo-banner__item">
            {renderMessage(message, index % limitedMessages.length)}
          </div>
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="promo-banner__controls">
          <button
            className="promo-banner__control promo-banner__control--prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous message"
          >
            ‹
          </button>
          <button
            className="promo-banner__control promo-banner__control--play"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="promo-banner__control promo-banner__control--next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next message"
          >
            ›
          </button>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && limitedMessages.length > 1 && (
        <div className="promo-banner__indicators">
          {limitedMessages.map((_, index) => (
            <button
              key={index}
              className={`promo-banner__indicator ${
                index === currentMessageIndex ? 'active' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMessageIndex(index);
              }}
              aria-label={`Go to message ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  ), [
    variant, size, theme, className, customStyles, ariaLabel,
    animation, direction, animationDuration, isPlaying, limitedMessages,
    renderMessage, showControls, showIndicators, currentMessageIndex,
    handleMouseEnter, handleMouseLeave, handleToggle, handlePrev, handleNext, onBannerClick
  ]);

  // Render vertical layout
  const renderVerticalLayout = useCallback(() => (
    <div 
      ref={bannerRef}
      className={`promo-banner promo-banner--vertical promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      <div 
        className={`promo-banner__track promo-banner__track--${animation} promo-banner__track--${direction}`}
        style={{
          animationDuration: animationDuration,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      >
        {limitedMessages.concat(limitedMessages).map((message, index) => (
          <div key={index} className="promo-banner__item">
            {renderMessage(message, index % limitedMessages.length)}
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, theme, className, customStyles, ariaLabel, animation, direction, animationDuration, isPlaying, limitedMessages, renderMessage, handleMouseEnter, handleMouseLeave, onBannerClick]);

  // Render grid layout
  const renderGridLayout = useCallback(() => (
    <div 
      className={`promo-banner promo-banner--grid promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="promo-banner__grid">
        {limitedMessages.map((message, index) => (
          <div key={index} className="promo-banner__grid-item">
            {renderMessage(message, index)}
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, theme, className, customStyles, ariaLabel, limitedMessages, renderMessage, onBannerClick]);

  // Render cards layout
  const renderCardsLayout = useCallback(() => (
    <div 
      className={`promo-banner promo-banner--cards promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="promo-banner__cards">
        {limitedMessages.map((message, index) => (
          <div 
            key={index} 
            className={`promo-banner__card ${
              index === currentMessageIndex ? 'promo-banner__card--active' : ''
            }`}
          >
            {renderMessage(message, index)}
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, theme, className, customStyles, ariaLabel, limitedMessages, renderMessage, currentMessageIndex, onBannerClick]);

  // Render stories layout
  const renderStoriesLayout = useCallback(() => (
    <div 
      className={`promo-banner promo-banner--stories promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="promo-banner__stories">
        {limitedMessages.map((message, index) => (
          <div 
            key={index}
            className={`promo-banner__story ${
              index === currentMessageIndex ? 'promo-banner__story--active' : ''
            }`}
            onClick={() => setCurrentMessageIndex(index)}
          >
            {renderMessage(message, index)}
            <div className="promo-banner__story-progress">
              <div 
                className="promo-banner__story-progress-bar"
                style={{ 
                  animationDuration: '3s',
                  animationPlayState: isPlaying && index === currentMessageIndex ? 'running' : 'paused'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [variant, size, theme, className, customStyles, ariaLabel, limitedMessages, renderMessage, currentMessageIndex, isPlaying, onBannerClick]);

  // Render marquee layout
  const renderMarqueeLayout = useCallback(() => (
    <div 
      ref={bannerRef}
      className={`promo-banner promo-banner--marquee promo-banner--${variant} promo-banner--${size} promo-banner--${theme} ${className}`}
      style={customStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onBannerClick}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="promo-banner__marquee">
        <div 
          className="promo-banner__marquee-content"
          style={{
            animationDuration: animationDuration,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        >
          {limitedMessages.concat(limitedMessages).map((message, index) => (
            <div key={index} className="promo-banner__marquee-item">
              {renderMessage(message, index % limitedMessages.length)}
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [variant, size, theme, className, customStyles, ariaLabel, animationDuration, isPlaying, limitedMessages, renderMessage, handleMouseEnter, handleMouseLeave, onBannerClick]);

  // Select layout renderer
  const bannerContent = useMemo(() => {
    switch (layout) {
      case 'horizontal':
        return renderHorizontalLayout();
      case 'vertical':
        return renderVerticalLayout();
      case 'grid':
        return renderGridLayout();
      case 'cards':
        return renderCardsLayout();
      case 'stories':
        return renderStoriesLayout();
      case 'marquee':
        return renderMarqueeLayout();
      default:
        return renderHorizontalLayout();
    }
  }, [
    layout, renderHorizontalLayout, renderVerticalLayout, renderGridLayout,
    renderCardsLayout, renderStoriesLayout, renderMarqueeLayout
  ]);

  return bannerContent;
};

export default PromoBanner;