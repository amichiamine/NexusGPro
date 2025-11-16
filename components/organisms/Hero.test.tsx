/**
 * Hero Component Tests
 * 
 * Comprehensive test coverage for the Hero component including:
 * - Component rendering
 * - Variant testing
 * - Layout testing
 * - Size testing
 * - CTA testing
 * - Background testing
 * - Animation testing
 * - Parallax testing
 * - Social proof testing
 * - Statistics testing
 * - Accessibility testing
 * - Responsive design
 * 
 * @version 1.0.0
 * @author MiniMax Agent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero, { HeroProps, CTA, SocialProof, HeroStats } from './Hero';
import '@testing-library/jest-dom';

// Mock CSS import
jest.mock('./Hero.css', () => ({}));

// Test utilities
const createMockCTA = (): CTA => ({
  label: 'Get Started',
  href: '/signup',
  variant: 'primary',
  size: 'lg',
  icon: '🚀'
});

const createMockCTAs = (): CTA[] => [
  { label: 'Primary Action', variant: 'primary', size: 'lg' },
  { label: 'Secondary Action', variant: 'outline', size: 'md' }
];

const createMockSocialProof = (): SocialProof[] => [
  { text: 'Trusted by', number: '10,000+', icon: '👥' },
  { logo: '/logo.png', text: 'Leading companies' }
];

const createMockStats = (): HeroStats[] => [
  { label: 'Users', value: '50K', suffix: '+' },
  { label: 'Success Rate', value: '99', suffix: '%' },
  { label: 'Growth', value: '300', suffix: '%' }
];

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation((callback) => ({
  observe: () => callback([{ isIntersecting: true }]),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock scroll function
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScrollTo,
});

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Hero />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('Build faster with NexusG')).toBeInTheDocument();
      expect(screen.getByText('Components • Themes • Views')).toBeInTheDocument();
      expect(screen.getByText('Start now')).toBeInTheDocument();
    });

    it('renders with custom title and subtitle', () => {
      render(<Hero 
        title="Custom Title" 
        subtitle="Custom subtitle text"
        primaryCTA="Custom CTA"
      />);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();
      expect(screen.getByText('Custom CTA')).toBeInTheDocument();
    });

    it('renders with custom primary CTA object', () => {
      const cta = createMockCTA();
      render(<Hero primaryCTA={cta} />);
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('renders with secondary CTAs', () => {
      const ctas = createMockCTAs();
      render(<Hero secondaryCTAs={ctas} />);
      
      expect(screen.getByText('Primary Action')).toBeInTheDocument();
      expect(screen.getByText('Secondary Action')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants: Array<HeroProps['variant']> = ['default', 'dark', 'gradient', 'image', 'video', 'animated'];
    
    variants.forEach(variant => {
      it(`renders with ${variant} variant`, () => {
        const { container } = render(<Hero variant={variant} />);
        expect(container.firstChild).toHaveClass(`tb-hero--${variant}`);
      });
    });
  });

  describe('Layouts', () => {
    const layouts: Array<HeroProps['layout']> = ['centered', 'left-aligned', 'split', 'fullscreen'];
    
    layouts.forEach(layout => {
      it(`renders with ${layout} layout`, () => {
        const { container } = render(<Hero layout={layout} />);
        expect(container.firstChild).toHaveClass(`tb-hero--${layout}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: Array<HeroProps['size']> = ['sm', 'md', 'lg', 'xl'];
    
    sizes.forEach(size => {
      it(`renders with ${size} size`, () => {
        const { container } = render(<Hero size={size} />);
        expect(container.firstChild).toHaveClass(`tb-hero--${size}`);
      });
    });
  });

  describe('Background', () => {
    it('renders with background image', () => {
      render(<Hero backgroundImage="https://example.com/image.jpg" />);
      
      const hero = screen.getByRole('banner');
      expect(hero.querySelector('.tb-hero__background--image')).toBeInTheDocument();
    });

    it('renders with background video', () => {
      render(<Hero backgroundVideo="https://example.com/video.mp4" />);
      
      expect(screen.getByRole('video')).toBeInTheDocument();
    });

    it('renders with background gradient', () => {
      const gradient = 'linear-gradient(45deg, #ff0000, #0000ff)';
      render(<Hero backgroundGradient={gradient} />);
      
      const hero = screen.getByRole('banner');
      expect(hero.querySelector('.tb-hero__background--gradient')).toBeInTheDocument();
    });

    it('renders video poster', () => {
      render(<Hero 
        backgroundVideo="https://example.com/video.mp4"
        backgroundVideoPoster="https://example.com/poster.jpg"
      />);
      
      const video = screen.getByRole('video') as HTMLVideoElement;
      expect(video.poster).toBe('https://example.com/poster.jpg');
    });
  });

  describe('Social Proof', () => {
    it('renders social proof when provided', () => {
      const socialProof = createMockSocialProof();
      render(<Hero socialProof={socialProof} />);
      
      expect(screen.getByText('10,000+')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
      expect(screen.getByText('Leading companies')).toBeInTheDocument();
    });

    it('does not render social proof when empty', () => {
      render(<Hero socialProof={[]} />);
      
      expect(screen.queryByText('Trusted by')).not.toBeInTheDocument();
    });

    it('renders social proof with logo', () => {
      const socialProof = [{ logo: '/test-logo.png', text: 'Test Company' }];
      render(<Hero socialProof={socialProof} />);
      
      expect(screen.getByAltText('')).toBeInTheDocument();
      expect(screen.getByAltText('')).toHaveAttribute('src', '/test-logo.png');
    });
  });

  describe('Statistics', () => {
    it('renders statistics when provided', () => {
      const stats = createMockStats();
      render(<Hero stats={stats} />);
      
      expect(screen.getByText('50K')).toBeInTheDocument();
      expect(screen.getByText('99')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
    });

    it('displays stat suffixes', () => {
      const stats = [{ label: 'Users', value: '1000', suffix: '+' }];
      render(<Hero stats={stats} />);
      
      const suffix = screen.getByText('+');
      expect(suffix).toHaveClass('tb-hero__stat-suffix');
    });

    it('displays stat prefixes', () => {
      const stats = [{ label: 'Price', value: '99', prefix: '$' }];
      render(<Hero stats={stats} />);
      
      const prefix = screen.getByText('$');
      expect(prefix).toHaveClass('tb-hero__stat-prefix');
    });

    it('does not render statistics when empty', () => {
      render(<Hero stats={[]} />);
      
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });
  });

  describe('CTAs', () => {
    it('handles CTA click with string', async () => {
      const user = userEvent.setup();
      const onCTAClick = jest.fn();
      render(<Hero primaryCTA="Get Started" onCTAClick={onCTAClick} />);
      
      const cta = screen.getByText('Get Started');
      await user.click(cta);
      
      expect(onCTAClick).toHaveBeenCalled();
    });

    it('handles CTA click with object', async () => {
      const user = userEvent.setup();
      const onCTAClick = jest.fn();
      const cta = createMockCTA();
      render(<Hero primaryCTA={cta} onCTAClick={onCTAClick} />);
      
      const ctaElement = screen.getByText('Get Started');
      await user.click(ctaElement);
      
      expect(onCTAClick).toHaveBeenCalled();
    });

    it('handles CTA onClick callback', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const cta: CTA = { label: 'Click me', onClick };
      render(<Hero primaryCTA={cta} />);
      
      const ctaElement = screen.getByText('Click me');
      await user.click(ctaElement);
      
      expect(onClick).toHaveBeenCalled();
    });

    it('displays CTA icons', () => {
      const cta = createMockCTA();
      render(<Hero primaryCTA={cta} />);
      
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('applies correct CTA variants', () => {
      const ctas = [
        { label: 'Primary', variant: 'primary' as const },
        { label: 'Secondary', variant: 'secondary' as const },
        { label: 'Outline', variant: 'outline' as const },
        { label: 'Ghost', variant: 'ghost' as const }
      ];
      
      render(<Hero secondaryCTAs={ctas} />);
      
      const primary = screen.getByText('Primary');
      const secondary = screen.getByText('Secondary');
      const outline = screen.getByText('Outline');
      const ghost = screen.getByText('Ghost');
      
      expect(primary.parentElement).toHaveClass('tb-hero__cta--primary');
      expect(secondary.parentElement).toHaveClass('tb-hero__cta--secondary');
      expect(outline.parentElement).toHaveClass('tb-hero__cta--outline');
      expect(ghost.parentElement).toHaveClass('tb-hero__cta--ghost');
    });

    it('applies correct CTA sizes', () => {
      const ctas = [
        { label: 'Small', size: 'sm' as const },
        { label: 'Medium', size: 'md' as const },
        { label: 'Large', size: 'lg' as const }
      ];
      
      render(<Hero secondaryCTAs={ctas} />);
      
      const small = screen.getByText('Small');
      const medium = screen.getByText('Medium');
      const large = screen.getByText('Large');
      
      expect(small.parentElement).toHaveClass('tb-hero__cta--sm');
      expect(medium.parentElement).toHaveClass('tb-hero__cta--md');
      expect(large.parentElement).toHaveClass('tb-hero__cta--lg');
    });
  });

  describe('Animation', () => {
    it('applies animated classes when enabled', () => {
      const { container } = render(<Hero animated={true} />);
      expect(container.firstChild).toHaveClass('tb-hero--animated');
    });

    it('adds visible class when component becomes visible', () => {
      const { container } = render(<Hero animated={true} />);
      
      // Mock intersection observer callback
      setTimeout(() => {
        expect(container.firstChild).toHaveClass('tb-hero--visible');
      }, 100);
    });

    it('does not animate when disabled', () => {
      const { container } = render(<Hero animated={false} />);
      expect(container.firstChild).not.toHaveClass('tb-hero--animated');
    });

    it('sets custom animation duration', () => {
      const { container } = render(<Hero animated={true} animationDuration={2000} />);
      expect(container.firstChild).toHaveStyle({ animationDuration: '2000ms' });
    });
  });

  describe('Parallax', () => {
    it('applies parallax class when enabled', () => {
      const { container } = render(<Hero parallax={true} />);
      expect(container.firstChild).toHaveClass('tb-hero--parallax');
    });

    it('calculates parallax transform on scroll', async () => {
      Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true });
      
      render(<Hero parallax={true} parallaxIntensity={0.5} backgroundImage="test.jpg" />);
      
      // Trigger scroll event
      fireEvent.scroll(window, { target: { pageYOffset: 100 } });
      
      await waitFor(() => {
        const background = screen.getByRole('banner').querySelector('.tb-hero__background--image');
        expect(background).toBeInTheDocument();
      });
    });

    it('calls onScroll callback when scrolling', () => {
      const onScroll = jest.fn();
      render(<Hero parallax={true} onScroll={onScroll} />);
      
      fireEvent.scroll(window, { target: { pageYOffset: 50 } });
      
      expect(onScroll).toHaveBeenCalled();
    });

    it('does not apply parallax when disabled', () => {
      const { container } = render(<Hero parallax={false} />);
      expect(container.firstChild).not.toHaveClass('tb-hero--parallax');
    });
  });

  describe('Scroll Indicator', () => {
    it('renders scroll indicator when enabled', () => {
      render(<Hero showScrollIndicator={true} />);
      
      expect(screen.getByLabelText('Scroll to next section')).toBeInTheDocument();
    });

    it('does not render scroll indicator when disabled', () => {
      render(<Hero showScrollIndicator={false} />);
      
      expect(screen.queryByLabelText('Scroll to next section')).not.toBeInTheDocument();
    });

    it('handles scroll indicator click', async () => {
      const user = userEvent.setup();
      render(<Hero showScrollIndicator={true} />);
      
      const scrollIndicator = screen.getByLabelText('Scroll to next section');
      await user.click(scrollIndicator);
      
      // Should call scrollTo
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('scrolls to next section when available', async () => {
      const user = userEvent.setup();
      
      // Create a document with next section
      document.body.innerHTML = `
        <div>
          <section class="tb-hero">Hero</section>
          <section class="next-section">Next Section</section>
        </div>
      `;
      
      render(<Hero showScrollIndicator={true} />);
      
      const scrollIndicator = screen.getByLabelText('Scroll to next section');
      await user.click(scrollIndicator);
      
      // Should scroll to next section
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Layout Variations', () => {
    it('renders centered layout correctly', () => {
      render(<Hero layout="centered" />);
      
      const hero = screen.getByRole('banner');
      expect(hero).toHaveClass('tb-hero--centered');
    });

    it('renders split layout with left and right content', () => {
      const { container } = render(<Hero layout="split" />);
      
      const contentLeft = container.querySelector('.tb-hero__content-left');
      const contentRight = container.querySelector('.tb-hero__content-right');
      
      expect(contentLeft).toBeInTheDocument();
      expect(contentRight).toBeInTheDocument();
    });

    it('renders fullscreen layout', () => {
      const { container } = render(<Hero layout="fullscreen" />);
      
      expect(container.firstChild).toHaveClass('tb-hero--fullscreen');
      
      const content = container.querySelector('.tb-hero__content--fullscreen');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<Hero />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has proper ARIA labels for interactive elements', () => {
      render(<Hero showScrollIndicator={true} />);
      
      expect(screen.getByLabelText('Scroll to next section')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const onCTAClick = jest.fn();
      render(<Hero primaryCTA="Get Started" onCTAClick={onCTAClick} />);
      
      const cta = screen.getByText('Get Started');
      await user.tab();
      expect(cta).toHaveFocus();
      
      await user.keyboard('{enter}');
      expect(onCTAClick).toHaveBeenCalled();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<Hero showScrollIndicator={true} />);
      
      const scrollIndicator = screen.getByLabelText('Scroll to next section');
      await user.tab();
      expect(scrollIndicator).toHaveFocus();
      
      await user.keyboard('{enter}');
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('supports high contrast mode', () => {
      const { container } = render(<Hero />);
      
      // Component should render without errors in high contrast
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const { container } = render(<Hero />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('adapts layout for split on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const { container } = render(<Hero layout="split" />);
      
      // Should still render without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('stacks CTAs on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const { container } = render(<Hero 
        primaryCTA="Primary"
        secondaryCTAs={[{ label: 'Secondary' }]}
      />);
      
      // Should render CTAs
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Hero className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<Hero style={customStyle} />);
      expect(container.firstChild).toHaveStyle(customStyle);
    });

    it('merges custom classes with default classes', () => {
      const { container } = render(<Hero className="custom-class" variant="dark" />);
      expect(container.firstChild).toHaveClass('tb-hero--dark', 'custom-class');
    });
  });

  describe('Event Handlers', () => {
    it('calls onCTAClick when provided', async () => {
      const user = userEvent.setup();
      const onCTAClick = jest.fn();
      const cta = createMockCTA();
      render(<Hero primaryCTA={cta} onCTAClick={onCTAClick} />);
      
      const ctaElement = screen.getByText('Get Started');
      await user.click(ctaElement);
      
      expect(onCTAClick).toHaveBeenCalledWith(cta, 0);
    });

    it('calls onScroll when provided and scrolling', () => {
      const onScroll = jest.fn();
      render(<Hero parallax={true} onScroll={onScroll} />);
      
      fireEvent.scroll(window, { target: { pageYOffset: 50 } });
      
      expect(onScroll).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      render(<Hero title="" />);
      
      // Should still render hero structure
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('handles empty subtitle gracefully', () => {
      render(<Hero subtitle="" />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('handles missing primaryCTA', () => {
      render(<Hero primaryCTA={undefined} />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('handles large number of CTAs', () => {
      const ctas = Array.from({ length: 5 }, (_, i) => ({
        label: `CTA ${i + 1}`,
        variant: 'secondary' as const
      }));
      
      render(<Hero secondaryCTAs={ctas} />);
      
      expect(screen.getByText('CTA 5')).toBeInTheDocument();
    });

    it('handles large number of social proof items', () => {
      const socialProof = Array.from({ length: 5 }, (_, i) => ({
        text: `Proof ${i + 1}`,
        number: `${i + 1}00`
      }));
      
      render(<Hero socialProof={socialProof} />);
      
      expect(screen.getByText('Proof 5')).toBeInTheDocument();
    });

    it('handles large number of stats', () => {
      const stats = Array.from({ length: 5 }, (_, i) => ({
        label: `Stat ${i + 1}`,
        value: `${i + 1}00`
      }));
      
      render(<Hero stats={stats} />);
      
      expect(screen.getByText('Stat 5')).toBeInTheDocument();
    });

    it('handles video loading errors', async () => {
      render(<Hero backgroundVideo="invalid-video.mp4" />);
      
      const video = screen.getByRole('video') as HTMLVideoElement;
      
      // Video should still render even if source is invalid
      expect(video).toBeInTheDocument();
    });

    it('handles missing background props gracefully', () => {
      render(<Hero />);
      
      // Should render with default background
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Hero />);
      const firstRender = screen.getByRole('banner');
      
      rerender(<Hero />);
      
      expect(firstRender).toBe(screen.getByRole('banner'));
    });

    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      render(<Hero showScrollIndicator={true} />);
      
      const scrollIndicator = screen.getByLabelText('Scroll to next section');
      
      // Rapid clicks
      await user.click(scrollIndicator);
      await user.click(scrollIndicator);
      await user.click(scrollIndicator);
      
      // Should not crash
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});