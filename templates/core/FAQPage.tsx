/**
 * FAQ Page Template - Core Template
 * Interactive FAQ page with search and filtering capabilities
 * 
 * Features demonstrated:
 * - Searchable accordion content
 * - Category filtering
 * - Responsive design
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
import SearchBox from '@/components/molecules/SearchBox';
import Accordion from '@/components/molecules/Accordion';
import Card from '@/components/molecules/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface FAQPageProps {
  faqs?: FAQItem[];
  className?: string;
}

const FAQPage: React.FC<FAQPageProps> = ({ 
  faqs = [
    {
      id: '1',
      question: 'What is NexusG Lite?',
      answer: 'NexusG Lite is a comprehensive React component library built for modern web applications. It provides 80+ production-ready components with TypeScript support, WCAG 2.1 AAA accessibility, and extensive documentation.',
      category: 'General',
      tags: ['library', 'components', 'react']
    },
    {
      id: '2',
      question: 'How do I install NexusG Pro?',
      answer: 'You can install NexusG Pro via npm: `npm install nexusg-pro` or yarn: `yarn add nexusg-pro`. Make sure you have React 18+ and TypeScript 5+ installed.',
      category: 'Installation',
      tags: ['npm', 'install', 'setup']
    },
    {
      id: '3',
      question: 'What browsers are supported?',
      answer: 'NexusG Lite supports all modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. We also provide fallbacks for older browser versions.',
      category: 'Browser Support',
      tags: ['browsers', 'compatibility', 'support']
    },
    {
      id: '4',
      question: 'Is NexusG Lite accessible?',
      answer: 'Yes! All components in NexusG Lite are built with WCAG 2.1 AAA compliance in mind. They include proper ARIA attributes, keyboard navigation support, and screen reader compatibility.',
      category: 'Accessibility',
      tags: ['accessibility', 'wcag', 'aria']
    },
    {
      id: '5',
      question: 'Can I customize the components?',
      answer: 'Absolutely! NexusG Lite components use CSS custom properties and are fully customizable. You can override styles via CSS variables or use the built-in theme system.',
      category: 'Customization',
      tags: ['customization', 'themes', 'css']
    },
    {
      id: '6',
      question: 'What licensing does NexusG Lite use?',
      answer: 'NexusG Lite is available under the MIT license for personal and commercial use. Enterprise licensing with additional features and support is also available.',
      category: 'Licensing',
      tags: ['license', 'mit', 'commercial']
    },
    {
      id: '7',
      question: 'How often is NexusG Lite updated?',
      answer: 'We release updates monthly with new features, bug fixes, and performance improvements. Major versions are released quarterly with breaking changes.',
      category: 'Updates',
      tags: ['updates', 'releases', 'versioning']
    },
    {
      id: '8',
      question: 'Is there TypeScript support?',
      answer: 'Yes, all components are fully typed with TypeScript. We provide comprehensive prop interfaces, generic types, and proper intellisense support.',
      category: 'TypeScript',
      tags: ['typescript', 'types', 'intellisense']
    },
    {
      id: '9',
      question: 'Can I use NexusG Lite with Next.js?',
      answer: 'Yes, NexusG Lite works perfectly with Next.js, Create React App, Vite, and other React build tools. We provide specific setup guides for each framework.',
      category: 'Framework Integration',
      tags: ['nextjs', 'vite', 'cra']
    },
    {
      id: '10',
      question: 'What kind of support is available?',
      answer: 'We offer comprehensive documentation, a community Discord server, GitHub issues for bug reports, and enterprise support plans for commercial users.',
      category: 'Support',
      tags: ['support', 'documentation', 'community']
    }
  ],
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>(faqs);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  // Filter FAQs based on search and category
  const handleFilter = () => {
    let filtered = faqs;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredFaqs(filtered);
  };

  // Update filtered results when search or category changes
  React.useEffect(() => {
    handleFilter();
  }, [searchTerm, selectedCategory, faqs]);

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
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about NexusG Lite, installation, 
            usage, and best practices.
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto">
            <SearchBox
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={setSearchTerm}
              variant="modern"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const count = category === 'All' 
                    ? faqs.length 
                    : faqs.filter(faq => faq.category === category).length;
                  
                  return (
                    <button
                      key={category}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors',
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant={selectedCategory === category ? 'secondary' : 'outline'}>
                          {count}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Popular Tags */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['components', 'installation', 'typescript', 'accessibility', 'customization']
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setSearchTerm(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))
                  }
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedCategory === 'All' ? 'All Questions' : selectedCategory}
                </h2>
                <p className="text-muted-foreground">
                  {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
              
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* FAQ Accordion */}
            {filteredFaqs.length > 0 ? (
              <Accordion
                items={filteredFaqs.map((faq) => ({
                  id: faq.id,
                  title: faq.question,
                  content: (
                    <div className="space-y-4">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {faq.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => setSearchTerm(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                }))}
                variant="modern"
                allowMultiple={true}
              />
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or selecting a different category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            )}

            {/* Load More */}
            {filteredFaqs.length > 0 && filteredFaqs.length >= 10 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  Load More Questions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our documentation and community are here to help. Get in touch with our team 
            for personalized support and guidance.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and API references
              </p>
              <Button variant="outline" size="sm">View Docs</Button>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our Discord for discussions and help
              </p>
              <Button variant="outline" size="sm">Join Discord</Button>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl mb-4">🎧</div>
              <h3 className="font-semibold mb-2">Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Direct support from our development team
              </p>
              <Button variant="outline" size="sm">Contact Support</Button>
            </Card>
          </div>
        </div>
      </section>

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

export default FAQPage;
