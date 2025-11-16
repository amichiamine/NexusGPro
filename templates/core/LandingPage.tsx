/**
 * Landing Page Template - Core Template
 * Professional landing page demonstrating NexusG Lite v1.4.0 capabilities
 * 
 * Features demonstrated:
 * - Modern responsive design
 * - Professional layout structure
 * - Accessibility considerations
 * - Component integration showcase
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components using existing structure
import Hero from '@/components/organisms/Hero';
import FeatureCard from '@/components/molecules/FeatureCard';
import Testimonial from '@/components/molecules/Testimonial';
import Footer from '@/components/organisms/FooterRich';
import Navbar from '@/components/molecules/Navbar';
import Card from '@/components/molecules/Card';
import PricingTable from '@/components/organisms/PricingTable';

interface LandingPageProps {
  className?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ className }) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation */}
      <Navbar 
        logo="NexusG Lite"
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Examples', href: '#examples' },
          { label: 'Docs', href: '#docs' }
        ]}
        cta={{ label: 'Get Started', href: '#start' }}
        variant="modern"
      />

      {/* Hero Section */}
      <Hero
        title="NexusG Lite v1.4.0"
        subtitle="The Ultimate React Component Library"
        description="Enterprise-ready components with 80+ professional components, advanced accessibility features, and comprehensive documentation. Built for modern React applications."
        cta={{
          label: 'Get Started',
          href: '#demo'
        }}
        secondaryCta={{
          label: 'View Documentation',
          href: '#docs'
        }}
        variant="modern"
        layout="centered"
        backgroundGradient={true}
      />

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build modern, accessible, and scalable React applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="⚡"
              title="80+ Components"
              description="Comprehensive set of production-ready components for every use case"
              variant="elevated"
            />
            <FeatureCard
              icon="♿"
              title="WCAG 2.1 AAA"
              description="Built-in accessibility compliance with screen reader support"
              variant="elevated"
            />
            <FeatureCard
              icon="🌍"
              title="TypeScript First"
              description="Fully typed components with comprehensive prop interfaces"
              variant="elevated"
            />
            <FeatureCard
              icon="🎨"
              title="Modern Design"
              description="Beautiful, responsive designs that work on all devices"
              variant="elevated"
            />
            <FeatureCard
              icon="📚"
              title="Well Documented"
              description="Extensive documentation with examples and guides"
              variant="elevated"
            />
            <FeatureCard
              icon="🧪"
              title="Thoroughly Tested"
              description="Comprehensive test coverage with modern testing practices"
              variant="elevated"
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">80+</div>
              <div className="text-muted-foreground">Components</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-muted-foreground">Test Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">AAA</div>
              <div className="text-muted-foreground">Accessibility</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-muted-foreground">TypeScript</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <PricingTable
            plans={[
              {
                name: 'Free',
                price: 'Free',
                description: 'Perfect for personal projects',
                features: [
                  '25+ Basic Components',
                  'Basic Documentation',
                  'Community Support',
                  'MIT License'
                ],
                cta: 'Get Started Free',
                popular: false
              },
              {
                name: 'Pro',
                price: '$29',
                description: 'For professional developers',
                features: [
                  'All Components',
                  'Advanced Documentation',
                  'Priority Support',
                  'Commercial License',
                  'Source Access',
                  'Premium Templates'
                ],
                cta: 'Start Pro Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  'Everything in Pro',
                  'Custom Development',
                  'Dedicated Support',
                  'Training & Onboarding',
                  'SLA Guarantee',
                  'Custom Integrations'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ]}
            variant="modern"
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              What Developers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who trust NexusG Lite
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Testimonial
              quote="NexusG Lite accelerated our development by 60%. The component quality and documentation are exceptional."
              author="Sarah Chen"
              role="Senior Frontend Developer"
              company="TechCorp"
              avatar="👩‍💻"
            />
            <Testimonial
              quote="Finally, a component library that takes accessibility seriously. WCAG AAA compliance out of the box is a game changer."
              author="Michael Rodriguez"
              role="Lead Developer"
              company="AccessibleApp"
              avatar="👨‍💼"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Build Something Amazing?"
        description="Join thousands of developers who are building better applications with NexusG Lite."
        cta={{
          label: 'Get Started Now',
          href: '#demo'
        }}
        secondaryCta={{
          label: 'View Examples',
          href: '#examples'
        }}
        variant="modern"
      />

      {/* Footer */}
      <Footer
        brand={{
          name: 'NexusG Lite',
          tagline: 'The Ultimate React Component Library'
        }}
        links={{
          Product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Examples', href: '#examples' }
          ],
          Resources: [
            { label: 'Documentation', href: '#docs' },
            { label: 'Tutorials', href: '#tutorials' },
            { label: 'Blog', href: '#blog' }
          ],
          Support: [
            { label: 'Help Center', href: '#help' },
            { label: 'Contact Us', href: '#contact' },
            { label: 'Community', href: '#community' }
          ]
        }}
        copyright="© 2025 NexusG Lite. All rights reserved."
      />
    </div>
  );
};

export default LandingPage;
