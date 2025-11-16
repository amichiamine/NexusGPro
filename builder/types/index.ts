export interface ComponentNode {
  id: string;
  type: 'atom' | 'molecule' | 'organism' | 'template';
  name: string;
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
  props: PropDefinition[];
  description: string;
  preview?: string;
  tags?: string[];
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'node';
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: any[];
}

export interface ExportFormat {
  format: 'html' | 'php';
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

export interface BuilderState {
  currentView: ViewConfig | null;
  selectedNode: ComponentNode | null;
  isDirty: boolean;
  history: ViewConfig[];
  historyIndex: number;
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
