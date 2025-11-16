export type ComponentCategory = 'atoms' | 'molecules' | 'organisms' | 'advanced' | 'interactions';

export type TemplateCategory = 'core' | 'ecommerce' | 'lms' | 'base';

export type ExportFormat = 'html' | 'php' | 'json' | 'react';

export type AppViewsLocation = 'inside' | 'sibling';

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'ReactNode';
  required?: boolean;
  default?: any;
  description?: string;
  options?: any[];
}

export interface ComponentMetadata {
  id: string;
  name: string;
  category: ComponentCategory;
  path: string;
  props: Record<string, PropDefinition>;
  description?: string;
  dependencies?: string[];
  hasStyles?: boolean;
  cssPath?: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  category: TemplateCategory;
  path: string;
  description: string;
  dependencies: string[];
  features: string[];
  props: Record<string, any>;
}

export interface ViewNode {
  id: string;
  type: 'component' | 'template' | 'container';
  componentId?: string;
  templateId?: string;
  props: Record<string, any>;
  children?: ViewNode[];
  styles?: Record<string, any>;
}

export interface ViewDefinition {
  id: string;
  name: string;
  description?: string;
  rootNode: ViewNode;
  metadata: {
    created: string;
    updated: string;
    version: string;
    author?: string;
  };
  dependencies: string[];
  styles?: string;
  scripts?: string;
}

export interface BuilderState {
  currentView: ViewDefinition | ViewConfig | null;
  selectedNode: ViewNode | ComponentNode | null;
  componentRegistry?: ComponentMetadata[];
  templateRegistry?: TemplateMetadata[];
  appViewsLocation?: AppViewsLocation;
  exportFormat?: ExportFormat;
  isDirty?: boolean;
  history?: ViewConfig[];
  historyIndex?: number;
}

export interface CodeGenerationOptions {
  format: ExportFormat;
  minify?: boolean;
  includeComments?: boolean;
  standalone?: boolean;
  appViewsLocation?: AppViewsLocation;
}

export interface ImportResult {
  success: boolean;
  view?: ViewDefinition;
  errors?: string[];
}

export interface ExportResult {
  success: boolean;
  code?: string;
  filename?: string;
  errors?: string[];
}

export interface GeneratedExport {
  format: ExportFormat;
  content: string;
  styles?: string;
  scripts?: string;
  filename: string;
}

export interface ImportedView {
  config: ViewConfig;
  sourceFormat: 'json' | 'html' | 'php';
  parsed: boolean;
  errors?: string[];
}

export interface ComponentNode {
  id: string;
  type: 'atom' | 'molecule' | 'organism' | 'template';
  name: string;
  componentId?: string;
  props: Record<string, any>;
  children?: ComponentNode[];
  styles?: Record<string, string>;
  className?: string;
}

export interface ViewConfig {
  id: string;
  name: string;
  description?: string;
  root: ComponentNode;
  metadata: {
    created: string;
    updated: string;
    author?: string;
    version: string;
  };
  settings: {
    format: 'html' | 'php' | 'both';
    includeStyles: boolean;
    minify: boolean;
    portable: boolean;
  };
}

export interface ComponentDefinition {
  name: string;
  category: 'atom' | 'molecule' | 'organism' | 'template';
  props: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'node';
    required: boolean;
    defaultValue?: any;
    description?: string;
    options?: any[];
  }>;
  description: string;
  preview?: string;
  tags?: string[];
}

export interface PathConfig {
  appviewsPath: string;
  componentsPath: string;
  templatesPath: string;
  isRelative: boolean;
}

export const DEFAULT_PATH_CONFIG: PathConfig = {
  appviewsPath: './appviews',
  componentsPath: './components',
  templatesPath: './templates',
  isRelative: true
};
