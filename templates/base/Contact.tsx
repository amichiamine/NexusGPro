/**
 * Contact Page Template - Base Template
 * Complete contact page with form, map, and contact information
 * 
 * Features demonstrated:
 * - Contact form with validation
 * - Company information display
 * - Location map integration
 * - Multiple contact methods
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React, { useState } from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components
import Navbar from '@/components/molecules/Navbar';
import Footer from '@/components/organisms/FooterRich';
import Card from '@/components/molecules/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
  social: {
    name: string;
    url: string;
    icon: string;
  }[];
}

interface ContactForm {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  category: 'General' | 'Support' | 'Sales' | 'Partnership';
}

interface ContactPageProps {
  companyInfo?: ContactInfo;
  className?: string;
}

const ContactPage: React.FC<ContactPageProps> = ({ 
  companyInfo = {
    address: '123 Tech Street, Innovation City, IC 12345',
    phone: '+1 (555) 123-4567',
    email: 'hello@nexusg-pro.com',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM PST',
    social: [
      { name: 'Twitter', url: 'https://twitter.com/nexusgpro', icon: '🐦' },
      { name: 'LinkedIn', url: 'https://linkedin.com/company/nexusgpro', icon: '💼' },
      { name: 'GitHub', url: 'https://github.com/nexusgpro', icon: '🐙' },
      { name: 'Discord', url: 'https://discord.gg/nexusgpro', icon: '💬' }
    ]
  },
  className 
}) => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        category: 'General'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation */}
      <Navbar 
        logo="NexusG Lite"
        links={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Documentation', href: '/docs' },
          { label: 'Examples', href: '/examples' }
        ]}
        cta={{ label: 'Get Started', href: '/start' }}
        variant="modern"
      />

      {/* Hero Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about NexusG Lite? Need support or want to discuss a partnership? 
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Company Info */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground">{companyInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">{companyInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">{companyInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🕒</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">{companyInfo.hours}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📚</span>
                  Browse Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">💬</span>
                  Join Community
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🐛</span>
                  Report an Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">⭐</span>
                  Request a Feature
                </Button>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                {companyInfo.social.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-lg">{social.icon}</span>
                    <span className="text-sm font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <p className="text-green-800 font-medium">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">❌</span>
                    <p className="text-red-800 font-medium">
                      Sorry, there was an error sending your message. Please try again.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      variant="modern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      variant="modern"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Your company name"
                      variant="modern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(value) => handleInputChange('category', value as any)}
                      options={[
                        { value: 'General', label: 'General Inquiry' },
                        { value: 'Support', label: 'Technical Support' },
                        { value: 'Sales', label: 'Sales & Pricing' },
                        { value: 'Partnership', label: 'Partnership' }
                      ]}
                      variant="modern"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your inquiry"
                    required
                    variant="modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    required
                    variant="modern"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1"
                    required
                  />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>{' '}
                    and consent to the processing of my personal data.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sending Message...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Find Us</h2>
          <Card className="overflow-hidden">
            {/* Placeholder for map */}
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground">
                  {companyInfo.address}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click to open in Google Maps
                </p>
              </div>
              
              {/* Map overlay for interaction */}
              <button
                className="absolute inset-0 bg-transparent hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(companyInfo.address)}`, '_blank')}
              />
            </div>
          </Card>
        </section>

        {/* FAQ Link */}
        <section className="mt-16 text-center">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
            <p className="text-muted-foreground mb-6">
              Check out our comprehensive FAQ section for instant answers to common questions.
            </p>
            <Button variant="outline" size="lg">
              Browse FAQ
            </Button>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <Footer
        brand={{
          name: 'NexusG Lite',
          tagline: 'The Ultimate React Component Library'
        }}
        links={{
          Product: [
            { label: 'Components', href: '/components' },
            { label: 'Templates', href: '/templates' },
            { label: 'Documentation', href: '/docs' }
          ],
          Resources: [
            { label: 'Examples', href: '/examples' },
            { label: 'Tutorials', href: '/tutorials' },
            { label: 'Blog', href: '/blog' }
          ],
          Support: [
            { label: 'FAQ', href: '/faq' },
            { label: 'Community', href: '/community' },
            { label: 'Contact', href: '/contact' }
          ]
        }}
        copyright="© 2025 NexusG Lite. All rights reserved."
      />
    </div>
  );
};

export default ContactPage;
