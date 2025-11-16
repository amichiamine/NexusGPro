import { ComponentDefinition } from '../types';

export class ComponentRegistry {
  private static components: Map<string, ComponentDefinition> = new Map();

  static register(component: ComponentDefinition) {
    this.components.set(component.name, component);
  }

  static getComponent(name: string): ComponentDefinition | undefined {
    return this.components.get(name);
  }

  static getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  static getComponentsByCategory(category: 'atom' | 'molecule' | 'organism' | 'template'): ComponentDefinition[] {
    return Array.from(this.components.values()).filter(c => c.category === category);
  }

  static searchComponents(query: string): ComponentDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.components.values()).filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  static clear() {
    this.components.clear();
  }
}

export const ATOMS: ComponentDefinition[] = [
  {
    name: 'Button',
    category: 'atom',
    description: 'Interactive button component with multiple variants',
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: 'primary', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
      { name: 'size', type: 'string', required: false, defaultValue: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      { name: 'children', type: 'node', required: true },
      { name: 'onClick', type: 'function', required: false }
    ],
    tags: ['action', 'interactive', 'form']
  },
  {
    name: 'Input',
    category: 'atom',
    description: 'Text input field with validation support',
    props: [
      { name: 'type', type: 'string', required: false, defaultValue: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
      { name: 'placeholder', type: 'string', required: false },
      { name: 'value', type: 'string', required: false },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      { name: 'error', type: 'string', required: false }
    ],
    tags: ['form', 'input', 'text']
  },
  {
    name: 'Badge',
    category: 'atom',
    description: 'Small badge for status or labels',
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: 'default', options: ['default', 'primary', 'success', 'warning', 'danger'] },
      { name: 'size', type: 'string', required: false, defaultValue: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'children', type: 'node', required: true }
    ],
    tags: ['label', 'status', 'tag']
  },
  {
    name: 'Avatar',
    category: 'atom',
    description: 'User avatar with image or initials',
    props: [
      { name: 'src', type: 'string', required: false },
      { name: 'alt', type: 'string', required: false },
      { name: 'size', type: 'string', required: false, defaultValue: 'md', options: ['sm', 'md', 'lg', 'xl'] },
      { name: 'initials', type: 'string', required: false }
    ],
    tags: ['user', 'profile', 'image']
  },
  {
    name: 'Switch',
    category: 'atom',
    description: 'Toggle switch for boolean values',
    props: [
      { name: 'checked', type: 'boolean', required: false, defaultValue: false },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      { name: 'onChange', type: 'function', required: false }
    ],
    tags: ['toggle', 'switch', 'form']
  },
  {
    name: 'Checkbox',
    category: 'atom',
    description: 'Checkbox for multiple selections',
    props: [
      { name: 'checked', type: 'boolean', required: false, defaultValue: false },
      { name: 'label', type: 'string', required: false },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['form', 'selection', 'checkbox']
  },
  {
    name: 'Select',
    category: 'atom',
    description: 'Dropdown select component',
    props: [
      { name: 'options', type: 'array', required: true },
      { name: 'value', type: 'string', required: false },
      { name: 'placeholder', type: 'string', required: false },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['form', 'dropdown', 'select']
  },
  {
    name: 'Progress',
    category: 'atom',
    description: 'Progress bar indicator',
    props: [
      { name: 'value', type: 'number', required: true },
      { name: 'max', type: 'number', required: false, defaultValue: 100 },
      { name: 'variant', type: 'string', required: false, defaultValue: 'primary', options: ['primary', 'success', 'warning', 'danger'] }
    ],
    tags: ['progress', 'indicator', 'loading']
  },
  {
    name: 'Alert',
    category: 'atom',
    description: 'Alert message box',
    props: [
      { name: 'type', type: 'string', required: false, defaultValue: 'info', options: ['info', 'success', 'warning', 'error'] },
      { name: 'title', type: 'string', required: false },
      { name: 'children', type: 'node', required: true },
      { name: 'dismissible', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['message', 'notification', 'alert']
  },
  {
    name: 'Divider',
    category: 'atom',
    description: 'Visual separator line',
    props: [
      { name: 'orientation', type: 'string', required: false, defaultValue: 'horizontal', options: ['horizontal', 'vertical'] },
      { name: 'text', type: 'string', required: false }
    ],
    tags: ['separator', 'divider', 'layout']
  },
  {
    name: 'Tag',
    category: 'atom',
    description: 'Tag for categorization',
    props: [
      { name: 'children', type: 'node', required: true },
      { name: 'color', type: 'string', required: false },
      { name: 'removable', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['label', 'category', 'tag']
  },
  {
    name: 'Skeleton',
    category: 'atom',
    description: 'Loading skeleton placeholder',
    props: [
      { name: 'width', type: 'string', required: false },
      { name: 'height', type: 'string', required: false },
      { name: 'variant', type: 'string', required: false, defaultValue: 'text', options: ['text', 'circular', 'rectangular'] }
    ],
    tags: ['loading', 'placeholder', 'skeleton']
  }
];

export const MOLECULES: ComponentDefinition[] = [
  {
    name: 'Card',
    category: 'molecule',
    description: 'Container card with header and content',
    props: [
      { name: 'title', type: 'string', required: false },
      { name: 'children', type: 'node', required: true },
      { name: 'hoverable', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['container', 'card', 'layout']
  },
  {
    name: 'Modal',
    category: 'molecule',
    description: 'Modal dialog overlay',
    props: [
      { name: 'isOpen', type: 'boolean', required: true },
      { name: 'title', type: 'string', required: false },
      { name: 'children', type: 'node', required: true },
      { name: 'onClose', type: 'function', required: false }
    ],
    tags: ['dialog', 'overlay', 'popup']
  },
  {
    name: 'Accordion',
    category: 'molecule',
    description: 'Expandable accordion component',
    props: [
      { name: 'items', type: 'array', required: true },
      { name: 'multiple', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['collapse', 'expand', 'accordion']
  },
  {
    name: 'Tabs',
    category: 'molecule',
    description: 'Tabbed content container',
    props: [
      { name: 'tabs', type: 'array', required: true },
      { name: 'defaultActiveKey', type: 'string', required: false }
    ],
    tags: ['tabs', 'navigation', 'content']
  },
  {
    name: 'Table',
    category: 'molecule',
    description: 'Data table with sorting',
    props: [
      { name: 'columns', type: 'array', required: true },
      { name: 'data', type: 'array', required: true },
      { name: 'sortable', type: 'boolean', required: false, defaultValue: true }
    ],
    tags: ['table', 'data', 'grid']
  },
  {
    name: 'Pagination',
    category: 'molecule',
    description: 'Pagination controls',
    props: [
      { name: 'current', type: 'number', required: true },
      { name: 'total', type: 'number', required: true },
      { name: 'pageSize', type: 'number', required: false, defaultValue: 10 },
      { name: 'onChange', type: 'function', required: false }
    ],
    tags: ['pagination', 'navigation', 'pages']
  },
  {
    name: 'SearchBox',
    category: 'molecule',
    description: 'Search input with icon',
    props: [
      { name: 'placeholder', type: 'string', required: false, defaultValue: 'Search...' },
      { name: 'onSearch', type: 'function', required: false }
    ],
    tags: ['search', 'filter', 'input']
  },
  {
    name: 'Breadcrumbs',
    category: 'molecule',
    description: 'Navigation breadcrumbs',
    props: [
      { name: 'items', type: 'array', required: true },
      { name: 'separator', type: 'string', required: false, defaultValue: '/' }
    ],
    tags: ['navigation', 'breadcrumb', 'path']
  },
  {
    name: 'Toast',
    category: 'molecule',
    description: 'Toast notification',
    props: [
      { name: 'message', type: 'string', required: true },
      { name: 'type', type: 'string', required: false, defaultValue: 'info', options: ['info', 'success', 'warning', 'error'] },
      { name: 'duration', type: 'number', required: false, defaultValue: 3000 }
    ],
    tags: ['notification', 'toast', 'message']
  },
  {
    name: 'Tooltip',
    category: 'molecule',
    description: 'Tooltip on hover',
    props: [
      { name: 'content', type: 'string', required: true },
      { name: 'children', type: 'node', required: true },
      { name: 'placement', type: 'string', required: false, defaultValue: 'top', options: ['top', 'bottom', 'left', 'right'] }
    ],
    tags: ['tooltip', 'hint', 'popup']
  },
  {
    name: 'FeatureCard',
    category: 'molecule',
    description: 'Feature showcase card',
    props: [
      { name: 'icon', type: 'string', required: false },
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: true }
    ],
    tags: ['feature', 'showcase', 'card']
  },
  {
    name: 'PricingCard',
    category: 'molecule',
    description: 'Pricing plan card',
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'price', type: 'string', required: true },
      { name: 'features', type: 'array', required: true },
      { name: 'highlighted', type: 'boolean', required: false, defaultValue: false }
    ],
    tags: ['pricing', 'plan', 'card']
  },
  {
    name: 'StatsCard',
    category: 'molecule',
    description: 'Statistics display card',
    props: [
      { name: 'label', type: 'string', required: true },
      { name: 'value', type: 'string', required: true },
      { name: 'icon', type: 'string', required: false },
      { name: 'trend', type: 'string', required: false }
    ],
    tags: ['stats', 'metrics', 'card']
  },
  {
    name: 'Testimonial',
    category: 'molecule',
    description: 'Customer testimonial card',
    props: [
      { name: 'quote', type: 'string', required: true },
      { name: 'author', type: 'string', required: true },
      { name: 'role', type: 'string', required: false },
      { name: 'avatar', type: 'string', required: false }
    ],
    tags: ['testimonial', 'review', 'quote']
  }
];

export const ORGANISMS: ComponentDefinition[] = [
  {
    name: 'Hero',
    category: 'organism',
    description: 'Hero section with headline and CTA',
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'subtitle', type: 'string', required: false },
      { name: 'ctaText', type: 'string', required: false },
      { name: 'image', type: 'string', required: false }
    ],
    tags: ['hero', 'banner', 'landing']
  },
  {
    name: 'Navbar',
    category: 'organism',
    description: 'Navigation bar',
    props: [
      { name: 'logo', type: 'string', required: false },
      { name: 'items', type: 'array', required: true },
      { name: 'actions', type: 'array', required: false }
    ],
    tags: ['navigation', 'header', 'menu']
  },
  {
    name: 'FooterModern',
    category: 'organism',
    description: 'Modern footer section',
    props: [
      { name: 'sections', type: 'array', required: true },
      { name: 'copyright', type: 'string', required: false }
    ],
    tags: ['footer', 'links', 'bottom']
  },
  {
    name: 'CTASection',
    category: 'organism',
    description: 'Call-to-action section',
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'buttonText', type: 'string', required: true }
    ],
    tags: ['cta', 'action', 'conversion']
  },
  {
    name: 'PricingTable',
    category: 'organism',
    description: 'Pricing comparison table',
    props: [
      { name: 'plans', type: 'array', required: true },
      { name: 'title', type: 'string', required: false }
    ],
    tags: ['pricing', 'plans', 'comparison']
  },
  {
    name: 'Carousel',
    category: 'organism',
    description: 'Image carousel slider',
    props: [
      { name: 'items', type: 'array', required: true },
      { name: 'autoplay', type: 'boolean', required: false, defaultValue: false },
      { name: 'interval', type: 'number', required: false, defaultValue: 3000 }
    ],
    tags: ['carousel', 'slider', 'images']
  },
  {
    name: 'HeaderBar',
    category: 'organism',
    description: 'Application header bar',
    props: [
      { name: 'title', type: 'string', required: false },
      { name: 'actions', type: 'array', required: false }
    ],
    tags: ['header', 'top', 'navigation']
  },
  {
    name: 'LogoCloud',
    category: 'organism',
    description: 'Logo showcase section',
    props: [
      { name: 'logos', type: 'array', required: true },
      { name: 'title', type: 'string', required: false }
    ],
    tags: ['logos', 'brands', 'partners']
  }
];

export function initializeComponentRegistry() {
  ComponentRegistry.clear();

  [...ATOMS, ...MOLECULES, ...ORGANISMS].forEach(comp => {
    ComponentRegistry.register(comp);
  });
}
