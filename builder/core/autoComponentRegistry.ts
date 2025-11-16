import type { ComponentMetadata, ComponentCategory, PropDefinition } from '../types';

const COMMON_PROPS: Record<string, PropDefinition> = {
  className: { type: 'string', description: 'CSS class name' },
  id: { type: 'string', description: 'HTML id attribute' },
  style: { type: 'object', description: 'Inline styles' },
  children: { type: 'ReactNode', description: 'Child content' }
};

const BUTTON_PROPS: Record<string, PropDefinition> = {
  ...COMMON_PROPS,
  variant: { type: 'string', default: 'default', options: ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'], description: 'Button variant' },
  size: { type: 'string', default: 'md', options: ['sm', 'md', 'lg'], description: 'Button size' },
  disabled: { type: 'boolean', default: false, description: 'Disabled state' },
  loading: { type: 'boolean', default: false, description: 'Loading state' },
  fullWidth: { type: 'boolean', default: false, description: 'Full width' }
};

const INPUT_PROPS: Record<string, PropDefinition> = {
  ...COMMON_PROPS,
  type: { type: 'string', default: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url'], description: 'Input type' },
  placeholder: { type: 'string', description: 'Placeholder text' },
  value: { type: 'string', description: 'Input value' },
  disabled: { type: 'boolean', default: false, description: 'Disabled state' },
  required: { type: 'boolean', default: false, description: 'Required field' }
};

export const AUTO_COMPONENT_REGISTRY: ComponentMetadata[] = [
  {
    id: 'alert',
    name: 'Alert',
    category: 'atoms',
    path: 'components/atoms/Alert.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Alert.css',
    description: 'Alert message component',
    props: {
      ...COMMON_PROPS,
      variant: { type: 'string', default: 'info', options: ['info', 'success', 'warning', 'error'] },
      title: { type: 'string', description: 'Alert title' },
      dismissible: { type: 'boolean', default: false }
    }
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'atoms',
    path: 'components/atoms/Avatar.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Avatar.css',
    description: 'User avatar component',
    props: {
      ...COMMON_PROPS,
      src: { type: 'string', description: 'Image source' },
      alt: { type: 'string', description: 'Alt text' },
      size: { type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'xl'] }
    }
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'atoms',
    path: 'components/atoms/Badge.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Badge.css',
    description: 'Small badge component',
    props: {
      ...COMMON_PROPS,
      variant: { type: 'string', default: 'default', options: ['default', 'primary', 'success', 'warning', 'danger'] }
    }
  },
  {
    id: 'button',
    name: 'Button',
    category: 'atoms',
    path: 'components/atoms/Button.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Button.css',
    description: 'Button component with multiple variants',
    props: BUTTON_PROPS
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'atoms',
    path: 'components/atoms/Checkbox.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Checkbox.css',
    description: 'Checkbox input component',
    props: {
      ...COMMON_PROPS,
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      label: { type: 'string', description: 'Checkbox label' }
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'atoms',
    path: 'components/atoms/Divider.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Divider.css',
    description: 'Visual divider line',
    props: {
      ...COMMON_PROPS,
      orientation: { type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'] }
    }
  },
  {
    id: 'iconbadge',
    name: 'IconBadge',
    category: 'atoms',
    path: 'components/atoms/IconBadge.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/IconBadge.css',
    description: 'Badge with icon',
    props: {
      ...COMMON_PROPS,
      icon: { type: 'string', description: 'Icon name or content' },
      variant: { type: 'string', default: 'default' }
    }
  },
  {
    id: 'input',
    name: 'Input',
    category: 'atoms',
    path: 'components/atoms/Input.tsx',
    description: 'Text input field',
    props: INPUT_PROPS
  },
  {
    id: 'progress',
    name: 'Progress',
    category: 'atoms',
    path: 'components/atoms/Progress.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Progress.css',
    description: 'Progress bar component',
    props: {
      ...COMMON_PROPS,
      value: { type: 'number', default: 0, description: 'Progress value (0-100)' },
      variant: { type: 'string', default: 'primary' }
    }
  },
  {
    id: 'select',
    name: 'Select',
    category: 'atoms',
    path: 'components/atoms/Select.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Select.css',
    description: 'Select dropdown component',
    props: {
      ...COMMON_PROPS,
      options: { type: 'array', default: [], description: 'Select options' },
      value: { type: 'string', description: 'Selected value' },
      disabled: { type: 'boolean', default: false }
    }
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'atoms',
    path: 'components/atoms/Skeleton.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Skeleton.css',
    description: 'Loading skeleton placeholder',
    props: {
      ...COMMON_PROPS,
      variant: { type: 'string', default: 'text', options: ['text', 'rect', 'circle'] },
      width: { type: 'string', description: 'Width (px or %)' },
      height: { type: 'string', description: 'Height (px or %)' }
    }
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'atoms',
    path: 'components/atoms/Slider.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Slider.css',
    description: 'Range slider component',
    props: {
      ...COMMON_PROPS,
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      value: { type: 'number', default: 50 },
      step: { type: 'number', default: 1 }
    }
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'atoms',
    path: 'components/atoms/Switch.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Switch.css',
    description: 'Toggle switch component',
    props: {
      ...COMMON_PROPS,
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      label: { type: 'string' }
    }
  },
  {
    id: 'tag',
    name: 'Tag',
    category: 'atoms',
    path: 'components/atoms/Tag.tsx',
    hasStyles: true,
    cssPath: 'components/atoms/Tag.css',
    description: 'Tag label component',
    props: {
      ...COMMON_PROPS,
      variant: { type: 'string', default: 'default' },
      closable: { type: 'boolean', default: false }
    }
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'molecules',
    path: 'components/molecules/Accordion.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Accordion.css',
    description: 'Expandable accordion component',
    props: {
      ...COMMON_PROPS,
      items: { type: 'array', required: true, description: 'Accordion items' },
      defaultOpen: { type: 'number', description: 'Default open index' }
    }
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'molecules',
    path: 'components/molecules/Breadcrumbs.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Breadcrumbs.css',
    description: 'Navigation breadcrumbs',
    props: {
      ...COMMON_PROPS,
      items: { type: 'array', required: true, description: 'Breadcrumb items' },
      separator: { type: 'string', default: '/' }
    }
  },
  {
    id: 'card',
    name: 'Card',
    category: 'molecules',
    path: 'components/molecules/Card.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Card.css',
    description: 'Container card component',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', description: 'Card title' },
      footer: { type: 'ReactNode', description: 'Card footer content' }
    }
  },
  {
    id: 'faqaccordion',
    name: 'FAQAccordion',
    category: 'molecules',
    path: 'components/molecules/FAQAccordion.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/FAQAccordion.css',
    description: 'FAQ accordion component',
    props: {
      ...COMMON_PROPS,
      faqs: { type: 'array', required: true, description: 'FAQ items' }
    }
  },
  {
    id: 'featurecard',
    name: 'FeatureCard',
    category: 'molecules',
    path: 'components/molecules/FeatureCard.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/FeatureCard.css',
    description: 'Feature showcase card',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', required: true },
      description: { type: 'string' },
      icon: { type: 'string' }
    }
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'molecules',
    path: 'components/molecules/Modal.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Modal.css',
    description: 'Modal dialog component',
    props: {
      ...COMMON_PROPS,
      isOpen: { type: 'boolean', required: true },
      onClose: { type: 'function', required: true },
      title: { type: 'string' },
      size: { type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'xl'] }
    }
  },
  {
    id: 'navbar',
    name: 'Navbar',
    category: 'molecules',
    path: 'components/molecules/Navbar.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Navbar.css',
    description: 'Navigation bar',
    props: {
      ...COMMON_PROPS,
      logo: { type: 'ReactNode' },
      items: { type: 'array', default: [] }
    }
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'molecules',
    path: 'components/molecules/Pagination.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Pagination.css',
    description: 'Pagination component',
    props: {
      ...COMMON_PROPS,
      currentPage: { type: 'number', required: true },
      totalPages: { type: 'number', required: true },
      onPageChange: { type: 'function', required: true }
    }
  },
  {
    id: 'pricingcard',
    name: 'PricingCard',
    category: 'molecules',
    path: 'components/molecules/PricingCard.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/PricingCard.css',
    description: 'Pricing plan card',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', required: true },
      price: { type: 'string', required: true },
      features: { type: 'array', default: [] },
      recommended: { type: 'boolean', default: false }
    }
  },
  {
    id: 'searchbox',
    name: 'SearchBox',
    category: 'molecules',
    path: 'components/molecules/SearchBox.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/SearchBox.css',
    description: 'Search input box',
    props: {
      ...COMMON_PROPS,
      placeholder: { type: 'string', default: 'Search...' },
      onSearch: { type: 'function' }
    }
  },
  {
    id: 'statscard',
    name: 'StatsCard',
    category: 'molecules',
    path: 'components/molecules/StatsCard.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/StatsCard.css',
    description: 'Statistics card',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', required: true },
      value: { type: 'string', required: true },
      trend: { type: 'string', options: ['up', 'down', 'neutral'] }
    }
  },
  {
    id: 'statsgrid',
    name: 'StatsGrid',
    category: 'molecules',
    path: 'components/molecules/StatsGrid.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/StatsGrid.css',
    description: 'Grid of statistics',
    props: {
      ...COMMON_PROPS,
      stats: { type: 'array', required: true }
    }
  },
  {
    id: 'statsrow',
    name: 'StatsRow',
    category: 'molecules',
    path: 'components/molecules/StatsRow.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/StatsRow.css',
    description: 'Row of statistics',
    props: {
      ...COMMON_PROPS,
      stats: { type: 'array', required: true }
    }
  },
  {
    id: 'table',
    name: 'Table',
    category: 'molecules',
    path: 'components/molecules/Table.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Table.css',
    description: 'Data table component',
    props: {
      ...COMMON_PROPS,
      columns: { type: 'array', required: true },
      data: { type: 'array', required: true },
      striped: { type: 'boolean', default: false }
    }
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'molecules',
    path: 'components/molecules/Tabs.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Tabs.css',
    description: 'Tab navigation component',
    props: {
      ...COMMON_PROPS,
      tabs: { type: 'array', required: true },
      defaultTab: { type: 'number', default: 0 }
    }
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    category: 'molecules',
    path: 'components/molecules/Testimonial.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Testimonial.css',
    description: 'Customer testimonial',
    props: {
      ...COMMON_PROPS,
      quote: { type: 'string', required: true },
      author: { type: 'string', required: true },
      role: { type: 'string' },
      avatar: { type: 'string' }
    }
  },
  {
    id: 'toast',
    name: 'Toast',
    category: 'molecules',
    path: 'components/molecules/Toast.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Toast.css',
    description: 'Toast notification',
    props: {
      ...COMMON_PROPS,
      message: { type: 'string', required: true },
      variant: { type: 'string', default: 'info', options: ['info', 'success', 'warning', 'error'] },
      duration: { type: 'number', default: 3000 }
    }
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'molecules',
    path: 'components/molecules/Tooltip.tsx',
    hasStyles: true,
    cssPath: 'components/molecules/Tooltip.css',
    description: 'Tooltip component',
    props: {
      ...COMMON_PROPS,
      content: { type: 'string', required: true },
      position: { type: 'string', default: 'top', options: ['top', 'bottom', 'left', 'right'] }
    }
  },
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'organisms',
    path: 'components/organisms/Carousel.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/Carousel.css',
    description: 'Image carousel',
    props: {
      ...COMMON_PROPS,
      items: { type: 'array', required: true },
      autoPlay: { type: 'boolean', default: false },
      interval: { type: 'number', default: 3000 }
    }
  },
  {
    id: 'ctasection',
    name: 'CTASection',
    category: 'organisms',
    path: 'components/organisms/CTASection.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/CTASection.css',
    description: 'Call-to-action section',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', required: true },
      subtitle: { type: 'string' },
      ctaText: { type: 'string', required: true },
      ctaLink: { type: 'string' }
    }
  },
  {
    id: 'footermodern',
    name: 'FooterModern',
    category: 'organisms',
    path: 'components/organisms/FooterModern.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/FooterModern.css',
    description: 'Modern footer',
    props: {
      ...COMMON_PROPS,
      companyName: { type: 'string' },
      links: { type: 'array', default: [] }
    }
  },
  {
    id: 'footerrich',
    name: 'FooterRich',
    category: 'organisms',
    path: 'components/organisms/FooterRich.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/FooterRich.css',
    description: 'Rich footer with multiple sections',
    props: {
      ...COMMON_PROPS,
      sections: { type: 'array', default: [] }
    }
  },
  {
    id: 'headerbar',
    name: 'HeaderBar',
    category: 'organisms',
    path: 'components/organisms/HeaderBar.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/HeaderBar.css',
    description: 'Header bar',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string' },
      actions: { type: 'array', default: [] }
    }
  },
  {
    id: 'hero',
    name: 'Hero',
    category: 'organisms',
    path: 'components/organisms/Hero.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/Hero.css',
    description: 'Hero section',
    props: {
      ...COMMON_PROPS,
      title: { type: 'string', required: true },
      subtitle: { type: 'string' },
      ctaText: { type: 'string' },
      ctaLink: { type: 'string' },
      backgroundImage: { type: 'string' }
    }
  },
  {
    id: 'logocloud',
    name: 'LogoCloud',
    category: 'organisms',
    path: 'components/organisms/LogoCloud.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/LogoCloud.css',
    description: 'Logo showcase grid',
    props: {
      ...COMMON_PROPS,
      logos: { type: 'array', required: true },
      title: { type: 'string' }
    }
  },
  {
    id: 'pricingtable',
    name: 'PricingTable',
    category: 'organisms',
    path: 'components/organisms/PricingTable.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/PricingTable.css',
    description: 'Pricing comparison table',
    props: {
      ...COMMON_PROPS,
      plans: { type: 'array', required: true }
    }
  },
  {
    id: 'promobanner',
    name: 'PromoBanner',
    category: 'organisms',
    path: 'components/organisms/PromoBanner.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/PromoBanner.css',
    description: 'Promotional banner',
    props: {
      ...COMMON_PROPS,
      message: { type: 'string', required: true },
      ctaText: { type: 'string' },
      dismissible: { type: 'boolean', default: true }
    }
  },
  {
    id: 'cartitem',
    name: 'CartItem',
    category: 'organisms',
    path: 'components/organisms/ecommerce/CartItem.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/CartItem.css',
    description: 'Shopping cart item',
    props: {
      ...COMMON_PROPS,
      product: { type: 'object', required: true },
      quantity: { type: 'number', default: 1 }
    }
  },
  {
    id: 'checkoutsummary',
    name: 'CheckoutSummary',
    category: 'organisms',
    path: 'components/organisms/ecommerce/CheckoutSummary.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/CheckoutSummary.css',
    description: 'Checkout order summary',
    props: {
      ...COMMON_PROPS,
      items: { type: 'array', required: true },
      total: { type: 'string', required: true }
    }
  },
  {
    id: 'filtersidebar',
    name: 'FilterSidebar',
    category: 'organisms',
    path: 'components/organisms/ecommerce/FilterSidebar.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/FilterSidebar.css',
    description: 'Product filter sidebar',
    props: {
      ...COMMON_PROPS,
      filters: { type: 'array', required: true }
    }
  },
  {
    id: 'pricetag',
    name: 'PriceTag',
    category: 'organisms',
    path: 'components/organisms/ecommerce/PriceTag.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/PriceTag.css',
    description: 'Product price display',
    props: {
      ...COMMON_PROPS,
      price: { type: 'string', required: true },
      originalPrice: { type: 'string' },
      discount: { type: 'string' }
    }
  },
  {
    id: 'productcard',
    name: 'ProductCard',
    category: 'organisms',
    path: 'components/organisms/ecommerce/ProductCard.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/ProductCard.css',
    description: 'Product card',
    props: {
      ...COMMON_PROPS,
      product: { type: 'object', required: true }
    }
  },
  {
    id: 'productgallery',
    name: 'ProductGallery',
    category: 'organisms',
    path: 'components/organisms/ecommerce/ProductGallery.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/ProductGallery.css',
    description: 'Product image gallery',
    props: {
      ...COMMON_PROPS,
      images: { type: 'array', required: true }
    }
  },
  {
    id: 'productgridcard',
    name: 'ProductGridCard',
    category: 'organisms',
    path: 'components/organisms/ecommerce/ProductGridCard.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/ProductGridCard.css',
    description: 'Product grid card',
    props: {
      ...COMMON_PROPS,
      product: { type: 'object', required: true }
    }
  },
  {
    id: 'sortbar',
    name: 'SortBar',
    category: 'organisms',
    path: 'components/organisms/ecommerce/SortBar.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/ecommerce/SortBar.css',
    description: 'Product sort options',
    props: {
      ...COMMON_PROPS,
      options: { type: 'array', required: true },
      onSort: { type: 'function', required: true }
    }
  },
  {
    id: 'coursecard',
    name: 'CourseCard',
    category: 'organisms',
    path: 'components/organisms/lms/CourseCard.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseCard.css',
    description: 'LMS course card',
    props: {
      ...COMMON_PROPS,
      course: { type: 'object', required: true }
    }
  },
  {
    id: 'coursefilterbar',
    name: 'CourseFilterBar',
    category: 'organisms',
    path: 'components/organisms/lms/CourseFilterBar.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseFilterBar.css',
    description: 'Course filter bar',
    props: {
      ...COMMON_PROPS,
      filters: { type: 'array', required: true }
    }
  },
  {
    id: 'coursegrid',
    name: 'CourseGrid',
    category: 'organisms',
    path: 'components/organisms/lms/CourseGrid.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseGrid.css',
    description: 'Course grid layout',
    props: {
      ...COMMON_PROPS,
      courses: { type: 'array', required: true }
    }
  },
  {
    id: 'coursehero',
    name: 'CourseHero',
    category: 'organisms',
    path: 'components/organisms/lms/CourseHero.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseHero.css',
    description: 'Course hero section',
    props: {
      ...COMMON_PROPS,
      course: { type: 'object', required: true }
    }
  },
  {
    id: 'coursenavigation',
    name: 'CourseNavigation',
    category: 'organisms',
    path: 'components/organisms/lms/CourseNavigation.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseNavigation.css',
    description: 'Course navigation menu',
    props: {
      ...COMMON_PROPS,
      items: { type: 'array', required: true }
    }
  },
  {
    id: 'courseprogress',
    name: 'CourseProgress',
    category: 'organisms',
    path: 'components/organisms/lms/CourseProgress.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseProgress.css',
    description: 'Course progress indicator',
    props: {
      ...COMMON_PROPS,
      progress: { type: 'number', required: true },
      total: { type: 'number', required: true }
    }
  },
  {
    id: 'coursereview',
    name: 'CourseReview',
    category: 'organisms',
    path: 'components/organisms/lms/CourseReview.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseReview.css',
    description: 'Course review component',
    props: {
      ...COMMON_PROPS,
      review: { type: 'object', required: true }
    }
  },
  {
    id: 'coursesidebar',
    name: 'CourseSidebar',
    category: 'organisms',
    path: 'components/organisms/lms/CourseSidebar.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseSidebar.css',
    description: 'Course sidebar navigation',
    props: {
      ...COMMON_PROPS,
      course: { type: 'object', required: true }
    }
  },
  {
    id: 'coursestats',
    name: 'CourseStats',
    category: 'organisms',
    path: 'components/organisms/lms/CourseStats.tsx',
    hasStyles: true,
    cssPath: 'components/organisms/lms/CourseStats.css',
    description: 'Course statistics display',
    props: {
      ...COMMON_PROPS,
      stats: { type: 'object', required: true }
    }
  }
];

export const getComponentById = (id: string): ComponentMetadata | undefined => {
  return AUTO_COMPONENT_REGISTRY.find(c => c.id === id);
};

export const getComponentsByCategory = (category: ComponentCategory): ComponentMetadata[] => {
  return AUTO_COMPONENT_REGISTRY.filter(c => c.category === category);
};

export const getAllComponents = (): ComponentMetadata[] => {
  return AUTO_COMPONENT_REGISTRY;
};
