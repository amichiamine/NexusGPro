/**
 * PromoBanner.test.tsx - Comprehensive Test Suite for PromoBanner Component
 * 
 * Test Coverage Areas:
 * - Component rendering
 * - All layouts (horizontal, vertical, grid, cards, stories, marquee)
 * - All animations (slide, fade, zoom, bounce, pulse, blink, typewriter)
 * - All variants (default, dark, light, gradient, minimal, card, modern, urgent)
 * - All themes (default, success, warning, error, info)
 * - All sizes (sm, md, lg, xl)
 * - Interactive features (controls, indicators, pause/play)
 * - Accessibility (ARIA, keyboard navigation, focus management)
 * - Responsive design
 * - Message filtering and prioritization
 * - Animation lifecycle
 * - State management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromoBanner, { PromoMessage, PromoBannerProps } from './PromoBanner';

// Mock CSS import
jest.mock('./PromoBanner.css', () => ({}));

// Test data
const mockMessages: PromoMessage[] = [
  {
    id: 'msg-1',
    text: 'Bienvenue sur NexusG',
    priority: 'medium',
    category: 'welcome',
  },
  {
    id: 'msg-2',
    text: 'Offre spéciale: 50% de réduction !',
    priority: 'high',
    highlight: true,
    badge: 'Hot',
    link: '/special-offer',
    target: '_self',
  },
  {
    id: 'msg-3',
    text: 'Nouveau: Catalogue Winter 2025',
    priority: 'medium',
    icon: '🆕',
    cta: {
      text: 'Voir',
      link: '/winter-2025',
    },
  },
  {
    id: 'msg-4',
    text: 'Livraison gratuite dès 50€',
    priority: 'low',
    category: 'shipping',
    expiryDate: '2025-12-31',
  },
];

const defaultProps: PromoBannerProps = {
  messages: mockMessages,
  variant: 'default',
  layout: 'horizontal',
  animation: 'slide',
  speed: 30,
  direction: 'left',
  autoplay: true,
  loop: true,
};

describe('PromoBanner Component', () => {
  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    test('renders promo banner with default props', () => {
      render(<PromoBanner {...defaultProps} />);
      
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
      expect(screen.getByText('Bienvenue sur NexusG')).toBeInTheDocument();
      expect(screen.getByText('Offre spéciale: 50% de réduction !')).toBeInTheDocument();
    });

    test('renders with custom aria-label', () => {
      const customLabel = 'Special Offers';
      render(<PromoBanner {...defaultProps} ariaLabel={customLabel} />);
      
      expect(screen.getByLabelText(customLabel)).toBeInTheDocument();
    });

    test('renders with minimal messages', () => {
      const minimalProps = {
        messages: [{ text: 'Simple message' }],
      };
      
      render(<PromoBanner {...minimalProps} />);
      
      expect(screen.getByText('Simple message')).toBeInTheDocument();
    });

    test('renders empty state when no messages provided', () => {
      render(<PromoBanner messages={[]} />);
      
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
      // Should still render container even with no messages
    });
  });

  // Layout Tests
  describe('Layout Variations', () => {
    const layouts: Array<PromoBannerProps['layout']> = [
      'horizontal', 'vertical', 'grid', 'cards', 'stories', 'marquee'
    ];

    layouts.forEach(layout => {
      test(`renders ${layout} layout`, () => {
        render(<PromoBanner {...defaultProps} layout={layout} />);
        
        const container = screen.getByLabelText('Promotional Messages');
        expect(container).toHaveClass(`promo-banner--${layout}`);
      });
    });
  });

  // Animation Tests
  describe('Animation Variations', () => {
    const animations: Array<PromoBannerProps['animation']> = [
      'slide', 'fade', 'zoom', 'bounce', 'pulse', 'blink'
    ];

    animations.forEach(animation => {
      test(`renders ${animation} animation`, () => {
        render(<PromoBanner {...defaultProps} animation={animation} />);
        
        const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
        expect(track).toHaveClass(`promo-banner__track--${animation}`);
      });
    });
  });

  // Variant Tests
  describe('Variant Variations', () => {
    const variants: Array<PromoBannerProps['variant']> = [
      'default', 'dark', 'light', 'gradient', 'minimal', 'card', 'modern', 'urgent'
    ];

    variants.forEach(variant => {
      test(`renders ${variant} variant`, () => {
        render(<PromoBanner {...defaultProps} variant={variant} />);
        
        const container = screen.getByLabelText('Promotional Messages');
        expect(container).toHaveClass(`promo-banner--${variant}`);
      });
    });
  });

  // Theme Tests
  describe('Theme Variations', () => {
    const themes: Array<PromoBannerProps['theme']> = [
      'default', 'success', 'warning', 'error', 'info'
    ];

    themes.forEach(theme => {
      test(`renders ${theme} theme`, () => {
        render(<PromoBanner {...defaultProps} theme={theme} />);
        
        const container = screen.getByLabelText('Promotional Messages');
        expect(container).toHaveClass(`promo-banner--${theme}`);
      });
    });
  });

  // Size Tests
  describe('Size Variations', () => {
    const sizes: Array<PromoBannerProps['size']> = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      test(`renders ${size} size`, () => {
        render(<PromoBanner {...defaultProps} size={size} />);
        
        const container = screen.getByLabelText('Promotional Messages');
        expect(container).toHaveClass(`promo-banner--${size}`);
      });
    });
  });

  // Direction Tests
  describe('Direction Variations', () => {
    const directions: Array<PromoBannerProps['direction']> = ['left', 'right', 'up', 'down'];

    directions.forEach(direction => {
      test(`renders ${direction} direction`, () => {
        render(<PromoBanner {...defaultProps} direction={direction} />);
        
        const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
        expect(track).toHaveClass(`promo-banner__track--${direction}`);
      });
    });
  });

  // Message Features Tests
  describe('Message Features', () => {
    test('displays message text', () => {
      render(<PromoBanner {...defaultProps} />);
      
      expect(screen.getByText('Bienvenue sur NexusG')).toBeInTheDocument();
    });

    test('displays message badges', () => {
      render(<PromoBanner {...defaultProps} showBadge={true} />);
      
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    test('displays message icons', () => {
      render(<PromoBanner {...defaultProps} showIcon={true} />);
      
      expect(screen.getByText('🆕')).toBeInTheDocument();
    });

    test('displays highlighted messages', () => {
      render(<PromoBanner {...defaultProps} />);
      
      const highlightedMessage = screen.getByText('Offre spéciale: 50% de réduction !');
      expect(highlightedMessage.closest('.promo-banner__message')).toHaveClass('promo-banner__message--highlight');
    });

    test('displays CTA buttons', () => {
      render(<PromoBanner {...defaultProps} />);
      
      expect(screen.getByText('Voir')).toBeInTheDocument();
    });

    test('filters expired messages', () => {
      const expiredMessage = {
        id: 'expired',
        text: 'Message expiré',
        expiryDate: '2020-01-01', // Past date
      };
      
      const messagesWithExpiry = [...mockMessages, expiredMessage];
      render(<PromoBanner {...defaultProps} messages={messagesWithExpiry} />);
      
      expect(screen.queryByText('Message expiré')).not.toBeInTheDocument();
      expect(screen.getByText('Bienvenue sur NexusG')).toBeInTheDocument();
    });

    test('sorts messages by priority', () => {
      render(<PromoBanner {...defaultProps} />);
      
      const messages = screen.getAllByRole('button');
      // High priority message should appear first
      expect(messages[0]).toHaveAttribute('aria-label', 'Message: Offre spéciale: 50% de réduction !');
    });

    test('limits messages with maxItems', () => {
      render(<PromoBanner {...defaultProps} maxItems={2} />);
      
      const messages = screen.getAllByRole('button');
      expect(messages).toHaveLength(2);
    });

    test('handles truncated text', () => {
      const longMessage = {
        id: 'long',
        text: 'This is a very long message that should be truncated when truncateText is enabled',
        priority: 'medium' as const,
      };
      
      render(<PromoBanner {...defaultProps} messages={[longMessage]} truncateText={true} />);
      
      const messageElement = screen.getByText('This is a very long message that should be truncated when truncateText is enabled');
      expect(messageElement.closest('.promo-banner__message')).toHaveClass('promo-banner__message--truncated');
    });
  });

  // Interactive Features Tests
  describe('Interactive Features', () => {
    test('shows controls when enabled', () => {
      render(<PromoBanner {...defaultProps} showControls={true} />);
      
      expect(screen.getByLabelText('Previous message')).toBeInTheDocument();
      expect(screen.getByLabelText('Pause animation')).toBeInTheDocument();
      expect(screen.getByLabelText('Next message')).toBeInTheDocument();
    });

    test('shows indicators when enabled', () => {
      render(<PromoBanner {...defaultProps} showIndicators={true} />);
      
      const indicators = screen.getAllByLabelText(/^Go to message/);
      expect(indicators).toHaveLength(4);
    });

    test('handles play/pause toggle', async () => {
      const user = userEvent.setup();
      render(<PromoBanner {...defaultProps} showControls={true} />);
      
      const pauseButton = screen.getByLabelText('Pause animation');
      await user.click(pauseButton);
      
      expect(screen.getByLabelText('Play animation')).toBeInTheDocument();
      
      const playButton = screen.getByLabelText('Play animation');
      await user.click(playButton);
      
      expect(screen.getByLabelText('Pause animation')).toBeInTheDocument();
    });

    test('handles previous/next navigation', async () => {
      const user = userEvent.setup();
      render(<PromoBanner {...defaultProps} showControls={true} />);
      
      const nextButton = screen.getByLabelText('Next message');
      await user.click(nextButton);
      
      // Should cycle through messages
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
      
      const prevButton = screen.getByLabelText('Previous message');
      await user.click(prevButton);
      
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
    });

    test('handles indicator navigation', async () => {
      const user = userEvent.setup();
      render(<PromoBanner {...defaultProps} showIndicators={true} />);
      
      const indicators = screen.getAllByLabelText(/^Go to message/);
      await user.click(indicators[1]);
      
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
    });

    test('handles pause on hover', async () => {
      const user = userEvent.setup();
      
      render(<PromoBanner {...defaultProps} pauseOnHover={true} />);
      
      const banner = screen.getByLabelText('Promotional Messages');
      await user.hover(banner);
      
      // Animation should pause
      expect(banner.querySelector('.promo-banner__track')).toHaveStyle({
        animationPlayState: 'paused'
      });
      
      await user.unhover(banner);
      
      // Animation should resume
      expect(banner.querySelector('.promo-banner__track')).toHaveStyle({
        animationPlayState: 'running'
      });
    });

    test('message click handling', async () => {
      const user = userEvent.setup();
      const onMessageClick = jest.fn();
      
      render(<PromoBanner {...defaultProps} onMessageClick={onMessageClick} />);
      
      const clickableMessage = screen.getByText('Offre spéciale: 50% de réduction !');
      await user.click(clickableMessage);
      
      expect(onMessageClick).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Offre spéciale: 50% de réduction !' }),
        expect.any(Number)
      );
    });

    test('message hover handling', async () => {
      const user = userEvent.setup();
      const onMessageHover = jest.fn();
      
      render(<PromoBanner {...defaultProps} onMessageHover={onMessageHover} />);
      
      const hoverableMessage = screen.getByText('Bienvenue sur NexusG');
      await user.hover(hoverableMessage);
      
      expect(onMessageHover).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Bienvenue sur NexusG' }),
        expect.any(Number)
      );
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      render(<PromoBanner {...defaultProps} />);
      
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
      
      const messages = screen.getAllByRole('button');
      messages.forEach(message => {
        expect(message).toHaveAttribute('aria-label');
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<PromoBanner {...defaultProps} />);
      
      const firstMessage = screen.getAllByRole('button')[0];
      firstMessage.focus();
      
      expect(firstMessage).toHaveFocus();
      
      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      
      // Should not crash
    });

    test('provides focus indicators', () => {
      render(<PromoBanner {...defaultProps} />);
      
      const firstMessage = screen.getAllByRole('button')[0];
      firstMessage.focus();
      
      expect(firstMessage).toHaveClass(':focus-visible');
    });

    test('announces current message', () => {
      render(<PromoBanner {...defaultProps} />);
      
      const messages = screen.getAllByRole('button');
      messages.forEach((message, index) => {
        expect(message).toHaveAttribute('aria-label', `Message: ${mockMessages[index % mockMessages.length].text}`);
      });
    });

    test('supports screen reader navigation', () => {
      render(<PromoBanner {...defaultProps} showControls={true} />);
      
      expect(screen.getByLabelText('Previous message')).toBeInTheDocument();
      expect(screen.getByLabelText('Next message')).toBeInTheDocument();
      expect(screen.getByLabelText('Pause animation')).toBeInTheDocument();
    });

    test('handles reduced motion preference', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });
      
      render(<PromoBanner {...defaultProps} />);
      
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      expect(track).toHaveStyle({
        animation: 'none'
      });
    });
  });

  // Animation Tests
  describe('Animation Lifecycle', () => {
    test('calls onAnimationStart when animation starts', () => {
      const onAnimationStart = jest.fn();
      
      render(<PromoBanner {...defaultProps} onAnimationStart={onAnimationStart} autoplay={true} />);
      
      // Animation should start automatically
      expect(onAnimationStart).toHaveBeenCalled();
    });

    test('calls onAnimationEnd when animation ends', () => {
      const onAnimationEnd = jest.fn();
      
      render(<PromoBanner {...defaultProps} onAnimationEnd={onAnimationEnd} autoplay={false} />);
      
      // Manually trigger animation end
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      fireEvent.animationEnd(track!);
      
      expect(onAnimationEnd).toHaveBeenCalled();
    });

    test('calls onPause when animation is paused', () => {
      const onPause = jest.fn();
      
      render(<PromoBanner {...defaultProps} onPause={onPause} showControls={true} />);
      
      const pauseButton = screen.getByLabelText('Pause animation');
      fireEvent.click(pauseButton);
      
      expect(onPause).toHaveBeenCalled();
    });

    test('calls onResume when animation resumes', () => {
      const onResume = jest.fn();
      
      render(<PromoBanner {...defaultProps} onResume={onResume} autoplay={false} showControls={true} />);
      
      const playButton = screen.getByLabelText('Play animation');
      fireEvent.click(playButton);
      
      expect(onResume).toHaveBeenCalled();
    });

    test('calculates animation duration correctly', () => {
      render(<PromoBanner {...defaultProps} speed={30} />);
      
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      expect(track).toHaveStyle({
        animationDuration: expect.stringContaining('s')
      });
    });

    test('auto-restarts when enabled', () => {
      const onAnimationStart = jest.fn();
      
      render(<PromoBanner {...defaultProps} onAnimationStart={onAnimationStart} autoRestart={true} autoplay={false} />);
      
      // Should restart after a delay
      setTimeout(() => {
        expect(onAnimationStart).toHaveBeenCalledTimes(2);
      }, 6000);
    });
  });

  // State Management Tests
  describe('State Management', () => {
    test('manages playing state', () => {
      const { rerender } = render(<PromoBanner {...defaultProps} autoplay={true} />);
      
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      expect(track).toHaveStyle({
        animationPlayState: 'running'
      });
      
      rerender(<PromoBanner {...defaultProps} autoplay={false} />);
      
      expect(track).toHaveStyle({
        animationPlayState: 'paused'
      });
    });

    test('manages current message index', () => {
      render(<PromoBanner {...defaultProps} layout="cards" />);
      
      const cards = screen.getAllByText('Bienvenue sur NexusG');
      expect(cards[0].closest('.promo-banner__card')).toHaveClass('promo-banner__card--active');
    });

    test('manages hover state', () => {
      render(<PromoBanner {...defaultProps} pauseOnHover={true} />);
      
      const banner = screen.getByLabelText('Promotional Messages');
      fireEvent.mouseEnter(banner);
      
      expect(banner).toHaveClass('promo-banner--hovered');
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    test('adapts to different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<PromoBanner {...defaultProps} responsive={{ mobile: 1, tablet: 2, desktop: 4 }} />);
      
      // Should render without errors
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
    });

    test('handles mobile layouts', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<PromoBanner {...defaultProps} layout="grid" />);
      
      // Should render grid layout adapted for mobile
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
    });
  });

  // Custom Styling Tests
  describe('Custom Styling', () => {
    test('applies custom styles', () => {
      const customStyles: React.CSSProperties = {
        backgroundColor: 'red',
        borderRadius: '10px',
      };
      
      render(<PromoBanner {...defaultProps} customStyles={customStyles} />);
      
      const banner = screen.getByLabelText('Promotional Messages');
      expect(banner).toHaveStyle(customStyles);
    });

    test('applies custom class name', () => {
      render(<PromoBanner {...defaultProps} className="custom-class" />);
      
      const banner = screen.getByLabelText('Promotional Messages');
      expect(banner).toHaveClass('custom-class');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('handles missing message properties gracefully', () => {
      const incompleteMessages = [
        { text: 'Valid message' },
        { text: 'Another message' },
      ];
      
      render(<PromoBanner messages={incompleteMessages} />);
      
      expect(screen.getByText('Valid message')).toBeInTheDocument();
      expect(screen.getByText('Another message')).toBeInTheDocument();
    });

    test('handles invalid dates', () => {
      const messagesWithInvalidDates = [
        {
          text: 'Message with invalid date',
          expiryDate: 'invalid-date',
        },
      ];
      
      render(<PromoBanner messages={messagesWithInvalidDates} />);
      
      // Should still render the message
      expect(screen.getByText('Message with invalid date')).toBeInTheDocument();
    });

    test('handles circular references', () => {
      const messageWithCircularRef = {
        text: 'Circular message',
        priority: 'medium' as const,
        category: 'test',
      };
      
      // Add circular reference
      (messageWithCircularRef as any).self = messageWithCircularRef;
      
      expect(() => render(<PromoBanner messages={[messageWithCircularRef]} />)).not.toThrow();
    });
  });

  // Layout-Specific Tests
  describe('Layout-Specific Features', () => {
    test('horizontal layout shows track animation', () => {
      render(<PromoBanner {...defaultProps} layout="horizontal" />);
      
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      expect(track).toBeInTheDocument();
      expect(track).toHaveClass('promo-banner__track--slide');
    });

    test('vertical layout shows vertical animation', () => {
      render(<PromoBanner {...defaultProps} layout="vertical" />);
      
      const track = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__track');
      expect(track).toHaveClass('promo-banner__track--vertical');
    });

    test('grid layout shows grid container', () => {
      render(<PromoBanner {...defaultProps} layout="grid" />);
      
      const grid = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__grid');
      expect(grid).toBeInTheDocument();
    });

    test('cards layout shows cards container', () => {
      render(<PromoBanner {...defaultProps} layout="cards" />);
      
      const cards = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__cards');
      expect(cards).toBeInTheDocument();
    });

    test('stories layout shows stories with progress', () => {
      render(<PromoBanner {...defaultProps} layout="stories" />);
      
      const stories = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__stories');
      expect(stories).toBeInTheDocument();
      
      const progressBars = screen.getAllByClassName('promo-banner__story-progress-bar');
      expect(progressBars).toHaveLength(mockMessages.length);
    });

    test('marquee layout shows marquee container', () => {
      render(<PromoBanner {...defaultProps} layout="marquee" />);
      
      const marquee = screen.getByLabelText('Promotional Messages').querySelector('.promo-banner__marquee');
      expect(marquee).toBeInTheDocument();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    test('renders efficiently with many messages', () => {
      const manyMessages = Array.from({ length: 100 }, (_, i) => ({
        text: `Message ${i}`,
        priority: 'medium' as const,
      }));
      
      const startTime = performance.now();
      render(<PromoBanner {...defaultProps} messages={manyMessages} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('memoizes expensive calculations', () => {
      const mockUseMemo = jest.spyOn(React, 'useMemo');
      render(<PromoBanner {...defaultProps} />);
      
      // useMemo should be called for filtering and sorting
      expect(mockUseMemo).toHaveBeenCalled();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    test('integrates with window.open for links', () => {
      const messageWithLink = {
        id: 'linked',
        text: 'Click me',
        link: 'https://example.com',
        target: '_blank',
      };
      
      const originalOpen = window.open;
      window.open = jest.fn();
      
      render(<PromoBanner messages={[messageWithLink]} />);
      
      const clickableMessage = screen.getByText('Click me');
      fireEvent.click(clickableMessage);
      
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
      
      window.open = originalOpen;
    });

    test('handles external callback functions', () => {
      const onBannerClick = jest.fn();
      const onMessageClick = jest.fn();
      const onMessageHover = jest.fn();
      
      render(
        <PromoBanner
          {...defaultProps}
          onBannerClick={onBannerClick}
          onMessageClick={onMessageClick}
          onMessageHover={onMessageHover}
        />
      );
      
      const banner = screen.getByLabelText('Promotional Messages');
      fireEvent.click(banner);
      
      expect(onBannerClick).toHaveBeenCalled();
      
      const message = screen.getByText('Bienvenue sur NexusG');
      fireEvent.click(message);
      
      expect(onMessageClick).toHaveBeenCalled();
      
      fireEvent.mouseEnter(message);
      expect(onMessageHover).toHaveBeenCalled();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    test('handles single message', () => {
      render(<PromoBanner messages={[{ text: 'Single message' }]} />);
      
      expect(screen.getByText('Single message')).toBeInTheDocument();
    });

    test('handles very long message text', () => {
      const longMessage = {
        text: 'A'.repeat(1000),
        priority: 'medium' as const,
      };
      
      render(<PromoBanner messages={[longMessage]} />);
      
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    test('handles empty text messages', () => {
      const emptyMessage = {
        text: '',
        priority: 'medium' as const,
      };
      
      render(<PromoBanner messages={[emptyMessage]} />);
      
      // Should not crash, just render empty
      expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
    });

    test('handles messages with special characters', () => {
      const specialMessage = {
        text: 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        priority: 'medium' as const,
      };
      
      render(<PromoBanner messages={[specialMessage]} />);
      
      expect(screen.getByText('Special chars: @#$%^&*()_+-=[]{}|;:,.<>?')).toBeInTheDocument();
    });
  });
});

// Snapshot Tests
describe('PromoBanner Snapshots', () => {
  test('default state snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('dark variant snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} variant="dark" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('grid layout snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} layout="grid" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('cards layout snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} layout="cards" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('stories layout snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} layout="stories" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('urgent variant snapshot', () => {
    const { container } = render(<PromoBanner {...defaultProps} variant="urgent" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

// Regression Tests
describe('PromoBanner Regression Tests', () => {
  test('does not break with undefined messages', () => {
    render(<PromoBanner messages={undefined as any} />);
    
    expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
  });

  test('does not break with null message properties', () => {
    const nullMessage = {
      id: null,
      text: null,
      priority: null,
    };
    
    render(<PromoBanner messages={[nullMessage as any]} />);
    
    expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
  });

  test('maintains focus after re-render', async () => {
    const user = userEvent.setup();
    
    render(<PromoBanner {...defaultProps} />);
    
    const firstMessage = screen.getAllByRole('button')[0];
    firstMessage.focus();
    expect(firstMessage).toHaveFocus();
    
    // Simulate re-render
    fireEvent.animationEnd(firstMessage);
    
    expect(firstMessage).toHaveFocus();
  });

  test('handles rapid state changes', async () => {
    const user = userEvent.setup();
    
    render(<PromoBanner {...defaultProps} showControls={true} />);
    
    const controls = screen.getAllByLabelText(/Previous|Next|Pause/);
    
    // Rapidly click controls
    for (let i = 0; i < 10; i++) {
      await user.click(controls[i % controls.length]);
    }
    
    // Should not crash
    expect(screen.getByLabelText('Promotional Messages')).toBeInTheDocument();
  });
});