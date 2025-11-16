import { ViewConfig, ComponentNode, ImportedView } from '../types';

export class ImportParser {
  parseJSON(jsonString: string): ImportedView {
    try {
      const config = JSON.parse(jsonString) as ViewConfig;

      if (!this.validateViewConfig(config)) {
        return {
          config,
          sourceFormat: 'json',
          parsed: false,
          errors: ['Invalid ViewConfig structure']
        };
      }

      return {
        config,
        sourceFormat: 'json',
        parsed: true
      };
    } catch (error) {
      return {
        config: this.createEmptyViewConfig(),
        sourceFormat: 'json',
        parsed: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  parseHTML(htmlString: string): ImportedView {
    const errors: string[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      const viewName = this.extractViewName(doc);
      const metadata = this.extractMetadata(doc);

      const bodyElements = Array.from(doc.body.children);
      const root = this.parseHTMLNode(bodyElements[0] as HTMLElement);

      const config: ViewConfig = {
        id: this.generateId(),
        name: viewName,
        description: metadata.description,
        root,
        metadata: {
          created: metadata.created || new Date().toISOString(),
          updated: new Date().toISOString(),
          author: metadata.author,
          version: metadata.version || '1.0.0'
        },
        settings: {
          format: 'html',
          includeStyles: true,
          minify: false,
          portable: true
        }
      };

      return {
        config,
        sourceFormat: 'html',
        parsed: true
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Failed to parse HTML');
      return {
        config: this.createEmptyViewConfig(),
        sourceFormat: 'html',
        parsed: false,
        errors
      };
    }
  }

  parsePHP(phpString: string): ImportedView {
    const errors: string[] = [];

    try {
      const htmlMatch = phpString.match(/<!DOCTYPE html>[\s\S]*<\/html>/);
      if (!htmlMatch) {
        errors.push('No HTML structure found in PHP file');
        return {
          config: this.createEmptyViewConfig(),
          sourceFormat: 'php',
          parsed: false,
          errors
        };
      }

      const htmlContent = htmlMatch[0];

      const htmlImport = this.parseHTML(htmlContent);

      if (htmlImport.parsed) {
        htmlImport.sourceFormat = 'php';
        htmlImport.config.settings.format = 'php';
      }

      return htmlImport;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Failed to parse PHP');
      return {
        config: this.createEmptyViewConfig(),
        sourceFormat: 'php',
        parsed: false,
        errors
      };
    }
  }

  private parseHTMLNode(element: HTMLElement): ComponentNode {
    const componentType = element.getAttribute('data-component') || 'div';
    const id = element.id || this.generateId();

    const node: ComponentNode = {
      id,
      type: this.inferNodeType(componentType),
      name: componentType,
      props: this.extractProps(element),
      className: element.className,
      styles: this.extractStyles(element)
    };

    const children: ComponentNode[] = [];
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        children.push(this.parseHTMLNode(child));
      }
    });

    if (children.length > 0) {
      node.children = children;
    } else if (element.textContent && element.textContent.trim()) {
      node.props.children = element.textContent.trim();
    }

    return node;
  }

  private extractProps(element: HTMLElement): Record<string, any> {
    const props: Record<string, any> = {};

    if (element.hasAttribute('placeholder')) {
      props.placeholder = element.getAttribute('placeholder');
    }

    if (element.hasAttribute('type')) {
      props.type = element.getAttribute('type');
    }

    if (element.hasAttribute('value')) {
      props.value = element.getAttribute('value');
    }

    if (element.hasAttribute('disabled')) {
      props.disabled = true;
    }

    if (element.hasAttribute('checked')) {
      props.checked = true;
    }

    if (element.hasAttribute('data-variant')) {
      props.variant = element.getAttribute('data-variant');
    }

    if (element.hasAttribute('data-size')) {
      props.size = element.getAttribute('data-size');
    }

    return props;
  }

  private extractStyles(element: HTMLElement): Record<string, string> | undefined {
    const styleAttr = element.getAttribute('style');
    if (!styleAttr) return undefined;

    const styles: Record<string, string> = {};
    styleAttr.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        const camelProperty = this.kebabToCamel(property);
        styles[camelProperty] = value;
      }
    });

    return Object.keys(styles).length > 0 ? styles : undefined;
  }

  private extractViewName(doc: Document): string {
    const titleElement = doc.querySelector('title');
    if (titleElement) {
      return titleElement.textContent?.split('-')[0].trim() || 'Imported View';
    }

    const comment = Array.from(doc.body.childNodes).find(
      node => node.nodeType === Node.COMMENT_NODE && node.textContent?.includes('View:')
    );

    if (comment) {
      const match = comment.textContent?.match(/View:\s*([^\n]+)/);
      if (match) return match[1].trim();
    }

    return 'Imported View';
  }

  private extractMetadata(doc: Document): Record<string, string> {
    const metadata: Record<string, string> = {};

    const descMeta = doc.querySelector('meta[name="description"]');
    if (descMeta) {
      metadata.description = descMeta.getAttribute('content') || '';
    }

    const genMeta = doc.querySelector('meta[name="generator"]');
    if (genMeta) {
      const content = genMeta.getAttribute('content') || '';
      const versionMatch = content.match(/v([\d.]+)/);
      if (versionMatch) {
        metadata.version = versionMatch[1];
      }
    }

    const comments = Array.from(doc.body.childNodes).filter(
      node => node.nodeType === Node.COMMENT_NODE
    );

    comments.forEach(comment => {
      const text = comment.textContent || '';

      const createdMatch = text.match(/Created:\s*([^\n]+)/);
      if (createdMatch) metadata.created = createdMatch[1].trim();

      const updatedMatch = text.match(/Updated:\s*([^\n]+)/);
      if (updatedMatch) metadata.updated = updatedMatch[1].trim();

      const authorMatch = text.match(/Author:\s*([^\n]+)/);
      if (authorMatch) metadata.author = authorMatch[1].trim();
    });

    return metadata;
  }

  private inferNodeType(componentName: string): 'atom' | 'molecule' | 'organism' | 'template' {
    const atoms = ['Button', 'Input', 'Badge', 'Avatar', 'Switch', 'Checkbox', 'Select', 'Progress', 'Alert', 'Divider', 'Tag', 'Skeleton'];
    const molecules = ['Card', 'Modal', 'Accordion', 'Tabs', 'Table', 'Pagination', 'SearchBox', 'Breadcrumbs', 'Toast', 'Tooltip'];
    const organisms = ['Hero', 'Navbar', 'FooterModern', 'CTASection', 'PricingTable', 'Carousel', 'HeaderBar', 'LogoCloud'];

    if (atoms.includes(componentName)) return 'atom';
    if (molecules.includes(componentName)) return 'molecule';
    if (organisms.includes(componentName)) return 'organism';
    return 'template';
  }

  private validateViewConfig(config: any): boolean {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.id === 'string' &&
      typeof config.name === 'string' &&
      config.root &&
      typeof config.root === 'object' &&
      config.metadata &&
      typeof config.metadata === 'object'
    );
  }

  private createEmptyViewConfig(): ViewConfig {
    return {
      id: this.generateId(),
      name: 'Empty View',
      root: {
        id: this.generateId(),
        type: 'template',
        name: 'Container',
        props: {},
        children: []
      },
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0'
      },
      settings: {
        format: 'html',
        includeStyles: true,
        minify: false,
        portable: true
      }
    };
  }

  private kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const importParser = new ImportParser();
