import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { cn } from '@/utils';

// Types et interfaces
interface ParallaxEffectsProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  offset?: number;
  threshold?: number;
  ease?: number;
  className?: string;
  triggerOnce?: boolean;
  rootMargin?: string;
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  overlay?: React.ReactNode;
  caption?: string;
}

interface ParallaxTextProps {
  children: React.ReactNode;
  speed?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  threshold?: number;
}

interface ParallaxSectionProps {
  children: React.ReactNode;
  layers: Array<{
    content: React.ReactNode;
    speed: number;
    zIndex?: number;
    className?: string;
  }>;
  backgroundColor?: string;
  height?: string;
  className?: string;
}

// Hook pour effets de parallaxe
const useParallax = (speed: number = 0.5, direction: 'vertical' | 'horizontal' = 'vertical') => {
  const { scrollYProgress, scrollY } = useScroll();
  const y = useMotionValue(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const unsubscribeY = scrollY.onChange((latest) => {
      const newY = latest * speed;
      y.set(direction === 'vertical' ? newY : 0);
    });

    const unsubscribeX = scrollYProgress.onChange((latest) => {
      const newX = latest * speed;
      x.set(direction === 'horizontal' ? newX : 0);
    });

    return () => {
      unsubscribeY();
      unsubscribeX();
    };
  }, [scrollY, scrollYProgress, speed, direction]);

  return { x, y, scrollY, scrollYProgress };
};

// Composant principal Parallax
export const ParallaxEffects: React.FC<ParallaxEffectsProps> = ({
  children,
  speed = 0.5,
  direction = 'vertical',
  offset = 0,
  threshold = 0,
  ease = 0.1,
  className,
  triggerOnce = true,
  rootMargin = '0px'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y, scrollYProgress } = useParallax(speed, direction);
  
  // Smooth spring animation
  const smoothX = useSpring(x, { stiffness: 100, damping: 30, mass: 0.1 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.1 });

  const transform = direction === 'vertical' 
    ? { y: smoothY, scale: useTransform(scrollYProgress, [0, 1], [1, 1 + ease]) }
    : { x: smoothX, scale: useTransform(scrollYProgress, [0, 1], [1, 1 + ease]) };

  return (
    <motion.div
      ref={ref}
      style={transform}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
};

// Composant Image Parallax
export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  speed = 0.5,
  size = 'md',
  className,
  overlay,
  caption
}) => {
  const { y } = useParallax(speed, 'vertical');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-64 md:h-80',
      md: 'h-80 md:h-96',
      lg: 'h-96 md:h-[500px]',
      xl: 'h-[500px] md:h-[600px]',
      full: 'h-[60vh] md:h-[80vh]'
    };
    return sizes[size];
  };

  return (
    <div ref={ref} className={cn('relative overflow-hidden', getSizeClasses(), className)}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
          {overlay}
        </div>
      )}
      {caption && (
        <motion.div
          className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-2 rounded"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          {caption}
        </motion.div>
      )}
    </div>
  );
};

// Composant Texte Parallax
export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  speed = 0.3,
  delay = 0,
  direction = 'up',
  className,
  threshold = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, threshold });
  
  const getDirectionOffset = () => {
    const offsets = {
      up: { y: 50 },
      down: { y: -50 },
      left: { x: 50 },
      right: { x: -50 }
    };
    return offsets[direction];
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...getDirectionOffset() 
      }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: 'easeOut' 
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
};

// Composant Section Parallax avec Calques
export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  layers,
  backgroundColor = 'transparent',
  height = '100vh',
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{ height, backgroundColor }}
    >
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          className={cn(
            'absolute inset-0 will-change-transform',
            layer.className
          )}
          style={{
            zIndex: layer.zIndex || index + 1,
            y: useTransform(scrollY, [0, 1000], [0, layer.speed * 100]),
          }}
        >
          {layer.content}
        </motion.div>
      ))}
      {children}
    </div>
  );
};

// Hook personnalisé pour effets avancés
export const useAdvancedParallax = (speed: number = 0.5) => {
  const { scrollY, scrollYProgress } = useScroll();
  
  // Effet de rotation basé sur le scroll
  const rotate = useTransform(scrollYProgress, [0, 1], [0, speed * 360]);
  
  // Effet de perspective 3D
  const perspective = useTransform(scrollY, [0, 1000], [1000, 500]);
  
  // Effet de skew basé sur le scroll
  const skewX = useTransform(scrollY, [0, 1000], [0, speed * 15]);
  const skewY = useTransform(scrollY, [0, 1000], [0, speed * 8]);
  
  // Effet de blur progressif
  const blur = useTransform(scrollY, [0, 500, 1000], [0, 2, 5]);
  
  // Effet de zoom avec spring
  const zoom = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 0.9]),
    { stiffness: 100, damping: 30 }
  );

  return {
    scrollY,
    scrollYProgress,
    rotate,
    perspective,
    skewX,
    skewY,
    blur,
    zoom
  };
};

// Composant Hero Parallax
interface HeroParallaxProps {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  speed?: number;
  overlayColor?: string;
  className?: string;
}

export const HeroParallax: React.FC<HeroParallaxProps> = ({
  backgroundImage,
  title,
  subtitle,
  ctaText,
  ctaLink,
  speed = 0.5,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  className
}) => {
  const { y, blur, scale } = useAdvancedParallax(speed);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className={cn(
        'relative h-screen flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Background Image avec parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          y,
          scale: useTransform(scale, [1, 1.1, 0.9], [1.1, 1.2, 1]),
          filter: `blur(${blur}px)`
        }}
      >
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {subtitle}
          </motion.p>
        )}

        {ctaText && ctaLink && (
          <motion.a
            href={ctaLink}
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {ctaText}
          </motion.a>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

// Composant Cards Parallax
interface ParallaxCardsProps {
  cards: Array<{
    title: string;
    description: string;
    image?: string;
    link?: string;
    color?: string;
  }>;
  speed?: number;
  className?: string;
}

export const ParallaxCards: React.FC<ParallaxCardsProps> = ({
  cards,
  speed = 0.3,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  return (
    <div ref={ref} className={cn('grid grid-cols-1 md:grid-cols-3 gap-8', className)}>
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className="relative bg-white rounded-xl shadow-lg overflow-hidden"
          style={{
            y: useTransform(scrollY, [index * 200, (index + 3) * 200], [0, -speed * 100])
          }}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          {card.image && (
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              {card.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {card.description}
            </p>
            {card.link && (
              <a
                href={card.link}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                En savoir plus →
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ParallaxEffects;