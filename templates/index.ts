/**
 * Templates Index
 * Central export for all NexusG Lite v1.4.0 templates
 * 
 * This module provides complete page templates that demonstrate
 * the full capabilities of NexusG Lite components in real-world scenarios.
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

// Core Templates
export { default as LandingPage } from './core/LandingPage';
export { default as PricingPage } from './core/PricingPage';
export { default as FAQPage } from './core/FAQPage';
export { default as LandingPro } from './core/LandingPro';

// E-commerce Templates
export { default as ProductPage } from './ecommerce/ProductPage';
export { default as CartPage } from './ecommerce/CartPage';
export { default as CheckoutPage } from './ecommerce/CheckoutPage';
export { default as ShopHomepage } from './ecommerce/ShopHomepage';
export { default as CategoryPage } from './ecommerce/CategoryPage';
export { default as OrderSuccessPage } from './ecommerce/OrderSuccessPage';
export { default as CategoryWithFilters } from './ecommerce/CategoryWithFilters';

// LMS Templates
export { default as CoursePage } from './lms/CoursePage';
export { default as StudentDashboard } from './lms/StudentDashboard';
export { default as CourseCatalog } from './lms/CourseCatalog';
export { default as CourseLanding } from './lms/CourseLanding';

// Base Templates
export { default as BlogPost } from './base/BlogPost';
export { default as Contact } from './base/Contact';
export { default as Dashboard } from './base/Dashboard';
export { default as AuthLogin } from './base/AuthLogin';
export { default as ArticleList } from './base/ArticleList';
export { default as Landing } from './base/Landing';
export { default as Pricing } from './base/Pricing';

// Template Types
export interface TemplateConfig {
  name: string;
  description: string;
  category: 'core' | 'ecommerce' | 'lms' | 'base';
  props: Record<string, any>;
  dependencies: string[];
  features: string[];
}

// Template Registry
export const templates: TemplateConfig[] = [
  {
    name: 'LandingPage',
    description: 'Professional landing page with hero, features, pricing, and testimonials',
    category: 'core',
    props: {},
    dependencies: ['Hero', 'FeatureCard', 'Testimonial', 'PricingTable', 'CTASection', 'Footer'],
    features: ['Responsive Design', 'SEO Optimized', 'Call-to-Actions', 'Social Proof']
  },
  {
    name: 'ProductPage',
    description: 'Complete e-commerce product showcase with gallery, details, and reviews',
    category: 'ecommerce',
    props: { product: {} },
    dependencies: ['ProductGallery', 'PriceTag', 'CartItem', 'Accordion', 'Modal'],
    features: ['Image Gallery', 'Shopping Cart', 'Product Reviews', 'Specifications']
  },
  {
    name: 'CoursePage',
    description: 'Comprehensive LMS course page with curriculum, progress, and instructor info',
    category: 'lms',
    props: { course: {}, enrolled: false },
    dependencies: ['CourseHero', 'CourseCard', 'CourseProgress', 'Accordion', 'Modal'],
    features: ['Course Curriculum', 'Progress Tracking', 'Instructor Profile', 'Student Reviews']
  },
  {
    name: 'BlogPost',
    description: 'Rich blog post layout with author bio, comments, and social sharing',
    category: 'base',
    props: { post: {} },
    dependencies: ['CommentSection', 'Avatar', 'Card', 'Badge'],
    features: ['SEO Optimized', 'Social Sharing', 'Comment System', 'Author Profile']
  },
  {
    name: 'Dashboard',
    description: 'Modern admin dashboard with charts, metrics, and user management',
    category: 'base',
    props: { user: {}, stats: {} },
    dependencies: ['HeaderBar', 'StatsCard', 'Table', 'Card', 'Modal'],
    features: ['Data Visualization', 'User Management', 'Real-time Updates', 'Responsive Grid']
  },
  {
    name: 'PricingPage',
    description: 'Professional pricing page with plan comparison and features',
    category: 'core',
    props: {},
    dependencies: ['PricingTable', 'FeatureCard', 'CTASection'],
    features: ['Plan Comparison', 'Feature Lists', 'Call-to-Actions', 'Responsive Design']
  },
  {
    name: 'FAQPage',
    description: 'Interactive FAQ page with searchable questions and answers',
    category: 'core',
    props: {},
    dependencies: ['Accordion', 'SearchBox', 'Card'],
    features: ['Searchable Content', 'Accordion Layout', 'Category Filtering']
  },
  {
    name: 'Contact',
    description: 'Contact page with form, map, and contact information',
    category: 'base',
    props: {},
    dependencies: ['ContactForm', 'Card', 'Map'],
    features: ['Contact Form', 'Location Map', 'Multiple Contact Methods']
  },
  {
    name: 'AuthLogin',
    description: 'Modern login/registration page with social auth options',
    category: 'base',
    props: {},
    dependencies: ['LoginForm', 'Card', 'Button'],
    features: ['Social Login', 'Form Validation', 'Remember Me', 'Password Reset']
  },
  {
    name: 'ArticleList',
    description: 'Blog article listing with pagination and filtering',
    category: 'base',
    props: {},
    dependencies: ['Card', 'Pagination', 'SearchBox', 'Filter'],
    features: ['Pagination', 'Search & Filter', 'Category Tags', 'Responsive Grid']
  }
];

// Template Categories
export const templateCategories = {
  core: {
    name: 'Core Templates',
    description: 'Essential business pages for any application',
    templates: templates.filter(t => t.category === 'core')
  },
  ecommerce: {
    name: 'E-commerce Templates',
    description: 'Complete online store experience',
    templates: templates.filter(t => t.category === 'ecommerce')
  },
  lms: {
    name: 'LMS Templates',
    description: 'Learning management system interfaces',
    templates: templates.filter(t => t.category === 'lms')
  },
  base: {
    name: 'Base Templates',
    description: 'Common application pages and layouts',
    templates: templates.filter(t => t.category === 'base')
  }
};

// Get template by name
export const getTemplate = (name: string): TemplateConfig | undefined => {
  return templates.find(template => template.name === name);
};

// Get templates by category
export const getTemplatesByCategory = (category: 'core' | 'ecommerce' | 'lms' | 'base'): TemplateConfig[] => {
  return templates.filter(template => template.category === category);
};

// Get all templates
export const getAllTemplates = (): TemplateConfig[] => {
  return templates;
};

// Template utility functions
export const getTemplateFeatures = (templateName: string): string[] => {
  const template = getTemplate(templateName);
  return template?.features || [];
};

export const getTemplateDependencies = (templateName: string): string[] => {
  const template = getTemplate(templateName);
  return template?.dependencies || [];
};

export const getTemplateDescription = (templateName: string): string => {
  const template = getTemplate(templateName);
  return template?.description || '';
};

export const getTemplateCategory = (templateName: string): string => {
  const template = getTemplate(templateName);
  return template?.category || 'base';
};

// Export version info
export const TEMPLATES_VERSION = '1.4.0';
export const TEMPLATES_CREATED = '2025-11-16';
export const TEMPLATES_AUTHOR = 'MiniMax Agent';

// Export all as default
export default {
  templates,
  templateCategories,
  getTemplate,
  getTemplatesByCategory,
  getAllTemplates,
  getTemplateFeatures,
  getTemplateDependencies,
  getTemplateDescription,
  getTemplateCategory,
  version: TEMPLATES_VERSION,
  created: TEMPLATES_CREATED,
  author: TEMPLATES_AUTHOR
};
