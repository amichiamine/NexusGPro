import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { cn } from '@/utils';

// Enregistrer les plugins GSAP
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Types et interfaces
interface GSAPAnimationsProps {
  children: React.ReactNode;
  timeline?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'elastic' | 'flip' | 'morph';
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  className?: string;
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

interface TimelineAnimationProps {
  sequence: Array<{
    element: string;
    animation: string;
    duration?: number;
    delay?: number;
    ease?: string;
    properties?: Record<string, any>;
  }>;
  repeat?: number;
  yoyo?: boolean;
  className?: string;
}

// Composant principal d'animation GSAP
export const GSAPAnimations: React.FC<GSAPAnimationsProps> = ({
  children,
  timeline = 'fadeIn',
  duration = 1,
  delay = 0,
  stagger = 0.1,
  ease = 'power2.out',
  className,
  trigger = 'top 80%',
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,
  markers = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animation presets
  const getAnimationConfig = useCallback(() => {
    const configs = {
      fadeIn: {
        from: { opacity: 0 },
        to: { 
          opacity: 1,
          duration,
          delay,
          stagger,
          ease
        }
      },
      slideIn: {
        from: { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        to: { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          stagger,
          ease
        }
      },
      scaleIn: {
        from: { 
          opacity: 0,
          scale: 0,
          rotation: -180
        },
        to: { 
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration,
          delay,
          stagger,
          ease: 'back.out(1.7)'
        }
      },
      rotateIn: {
        from: { 
          opacity: 0,
          rotation: -360,
          scale: 0.5
        },
        to: { 
          opacity: 1,
          rotation: 0,
          scale: 1,
          duration,
          delay,
          stagger,
          ease: 'power2.out'
        }
      },
      bounceIn: {
        from: { 
          opacity: 0,
          scale: 0.3,
          y: -100
        },
        to: { 
          opacity: 1,
          scale: 1,
          y: 0,
          duration: duration * 1.5,
          delay,
          stagger,
          ease: 'bounce.out'
        }
      },
      elastic: {
        from: { 
          opacity: 0,
          scale: 0,
          rotation: -180
        },
        to: { 
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: duration * 2,
          delay,
          stagger,
          ease: 'elastic.out(1, 0.3)'
        }
      },
      flip: {
        from: { 
          opacity: 0,
          rotationY: 90,
          scaleX: 0
        },
        to: { 
          opacity: 1,
          rotationY: 0,
          scaleX: 1,
          duration,
          delay,
          stagger,
          ease: 'power2.inOut'
        }
      },
      morph: {
        from: { 
          opacity: 0,
          scale: 0,
          borderRadius: '50%'
        },
        to: { 
          opacity: 1,
          scale: 1,
          borderRadius: '0%',
          duration: duration * 1.2,
          delay,
          stagger,
          ease: 'power2.out'
        }
      }
    };

    return configs[timeline];
  }, [timeline, duration, delay, stagger, ease]);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const container = containerRef.current;
    const elements = container.children;
    
    // Animation de l'élément parent
    const parentAnimation = gsap.fromTo(
      container,
      getAnimationConfig().from,
      {
        ...getAnimationConfig().to,
        scrollTrigger: {
          trigger: container,
          start,
          end,
          scrub,
          markers
        }
      }
    );

    // Animation des éléments enfants avec stagger
    if (elements.length > 1) {
      gsap.fromTo(
        elements,
        getAnimationConfig().from,
        {
          ...getAnimationConfig().to,
          scrollTrigger: {
            trigger: container,
            start,
            end,
            scrub,
            markers
          }
        }
      );
    }

    return () => {
      ScrollTrigger.killAll();
    };
  }, [isVisible, getAnimationConfig, start, end, scrub, markers]);

  return (
    <div 
      ref={containerRef}
      className={cn('gsap-container', className)}
      onMouseEnter={() => setIsVisible(true)}
    >
      {children}
    </div>
  );
};

// Composant Timeline GSAP
export const TimelineAnimation: React.FC<TimelineAnimationProps> = ({
  sequence,
  repeat = 0,
  yoyo = false,
  className
}) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tl = gsap.timeline({ repeat, yoyo });

    sequence.forEach((step, index) => {
      const elements = container.querySelectorAll(step.element);
      
      if (elements.length > 0) {
        tl.to(elements, {
          ...step.properties,
          duration: step.duration || 1,
          delay: step.delay || 0,
          ease: step.ease || 'power2.out',
          stagger: 0.1
        }, `+=${index * 0.1}`);
      }
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [sequence, repeat, yoyo]);

  return (
    <div ref={containerRef} className={cn('timeline-container', className)}>
      {/* Les éléments à animer seront ciblés par leurs sélecteurs */}
    </div>
  );
};

// Hook personnalisé pour animations GSAP
export const useGSAPAnimation = () => {
  const createTimeline = useCallback((options?: {
    repeat?: number;
    yoyo?: boolean;
    defaults?: gsap.TweenVars;
  }) => {
    const tl = gsap.timeline({
      repeat: options?.repeat,
      yoyo: options?.yoyo,
      defaults: options?.defaults
    });
    
    return {
      add: (targets: any, vars: gsap.TweenVars) => tl.to(targets, vars),
      play: () => tl.play(),
      pause: () => tl.pause(),
      restart: () => tl.restart(),
      kill: () => tl.kill()
    };
  }, []);

  const animateElement = useCallback((target: any, vars: gsap.TweenVars) => {
    return gsap.to(target, vars);
  }, []);

  const createScrollTrigger = useCallback((
    element: HTMLElement,
    animation: gsap.TweenVars,
    options?: {
      trigger?: string;
      start?: string;
      end?: string;
      scrub?: boolean | number;
      markers?: boolean;
    }
  ) => {
    return ScrollTrigger.create({
      trigger: element,
      animation: gsap.fromTo(element, animation.from, animation.to),
      start: options?.start || 'top 80%',
      end: options?.end || 'bottom 20%',
      scrub: options?.scrub || false,
      markers: options?.markers || false
    });
  }, []);

  return {
    createTimeline,
    animateElement,
    createScrollTrigger,
    killAll: () => ScrollTrigger.killAll()
  };
};

// Composant Morphing Shapes
interface MorphingShapesProps {
  shape?: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'custom';
  colors?: [string, string];
  duration?: number;
  size?: number;
  className?: string;
}

export const MorphingShapes: React.FC<MorphingShapesProps> = ({
  shape = 'circle',
  colors = ['#3B82F6', '#8B5CF6'],
  duration = 2,
  size = 100,
  className
}) => {
  const shapeRef = useRef<HTMLDivElement>(null);

  // Path definitions pour les formes
  const getShapePath = useCallback((shapeName: string, size: number) => {
    const path = {
      circle: `M 50,5 A 45,45 0 1,1 5,50 A 45,45 0 1,1 50,5`,
      square: `M 5,5 L 95,5 L 95,95 L 5,95 Z`,
      triangle: `M 50,5 L 95,95 L 5,95 Z`,
      star: `M 50,5 L 61,35 L 95,35 L 68,57 L 79,91 L 50,70 L 21,91 L 32,57 L 5,35 L 39,35 Z`,
      heart: `M 50,85 C 20,60 5,35 25,20 C 35,15 45,20 50,30 C 55,20 65,15 75,20 C 95,35 80,60 50,85 Z`
    };
    
    return path[shapeName as keyof typeof path] || path.circle;
  }, []);

  useEffect(() => {
    if (!shapeRef.current) return;

    const shapes = Object.keys(getShapePath('circle', size)) as Array<keyof typeof getShapePath>;
    let currentIndex = 0;

    const animate = () => {
      if (!shapeRef.current) return;
      
      const currentShape = shapes[currentIndex];
      const nextShape = shapes[(currentIndex + 1) % shapes.length];

      gsap.to(shapeRef.current, {
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          // Morphing animation logic
        }
      });

      currentIndex = (currentIndex + 1) % shapes.length;
      setTimeout(animate, duration * 1000 + 1000);
    };

    animate();
  }, [getShapePath, size, duration]);

  const shapePath = getShapePath(shape, size);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <path
          ref={shapeRef}
          d={shapePath}
          fill={colors[0]}
          stroke={colors[1]}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default GSAPAnimations;