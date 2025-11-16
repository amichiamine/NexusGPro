import { ViewConfig, ComponentNode, ExportFormat } from '../types';
import { PathResolver } from '../utils/pathResolver';

export class HTMLGenerator {
  private pathResolver: PathResolver;

  constructor(pathResolver: PathResolver) {
    this.pathResolver = pathResolver;
  }

  generate(view: ViewConfig): ExportFormat {
    const html = this.generateHTML(view);
    const css = this.generateCSS(view);
    const js = this.generateJS(view);

    const content = this.buildFullDocument(view, html, css, js);

    return {
      format: 'html',
      content,
      styles: css,
      scripts: js,
      filename: `${this.sanitizeFilename(view.name)}.html`
    };
  }

  private generateHTML(view: ViewConfig): string {
    return this.generateNodeHTML(view.root, 0);
  }

  private generateNodeHTML(node: ComponentNode, depth: number): string {
    const indent = '  '.repeat(depth);
    const tag = this.getHTMLTag(node);
    const attrs = this.generateAttributes(node);
    const styles = node.styles ? ` style="${this.styleObjectToString(node.styles)}"` : '';
    const className = node.className ? ` class="${node.className}"` : '';

    if (node.type === 'atom' && this.isSelfClosing(tag)) {
      return `${indent}<${tag}${attrs}${className}${styles} />`;
    }

    let content = '';
    if (node.children && node.children.length > 0) {
      content = '\n' + node.children
        .map(child => this.generateNodeHTML(child, depth + 1))
        .join('\n') + '\n' + indent;
    } else if (node.props.children) {
      content = String(node.props.children);
    }

    return `${indent}<${tag}${attrs}${className}${styles}>${content}</${tag}>`;
  }

  private getHTMLTag(node: ComponentNode): string {
    const tagMap: Record<string, string> = {
      'Button': 'button',
      'Input': 'input',
      'Select': 'select',
      'Checkbox': 'input',
      'Switch': 'input',
      'Progress': 'progress',
      'Divider': 'hr',
      'Card': 'div',
      'Modal': 'div',
      'Hero': 'section',
      'Navbar': 'nav',
      'FooterModern': 'footer',
      'Table': 'table'
    };

    return tagMap[node.name] || 'div';
  }

  private isSelfClosing(tag: string): boolean {
    return ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tag);
  }

  private generateAttributes(node: ComponentNode): string {
    const attrs: string[] = [];

    if (node.name === 'Input') {
      attrs.push(`type="${node.props.type || 'text'}"`);
      if (node.props.placeholder) attrs.push(`placeholder="${node.props.placeholder}"`);
      if (node.props.value) attrs.push(`value="${node.props.value}"`);
      if (node.props.disabled) attrs.push('disabled');
    }

    if (node.name === 'Button') {
      if (node.props.disabled) attrs.push('disabled');
      attrs.push(`data-variant="${node.props.variant || 'primary'}"`);
      attrs.push(`data-size="${node.props.size || 'md'}"`);
    }

    if (node.name === 'Checkbox' || node.name === 'Switch') {
      attrs.push('type="checkbox"');
      if (node.props.checked) attrs.push('checked');
      if (node.props.disabled) attrs.push('disabled');
    }

    if (node.name === 'Progress') {
      attrs.push(`value="${node.props.value || 0}"`);
      attrs.push(`max="${node.props.max || 100}"`);
    }

    attrs.push(`data-component="${node.name}"`);
    attrs.push(`id="${node.id}"`);

    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  private styleObjectToString(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private generateCSS(view: ViewConfig): string {
    const cssPath = this.pathResolver.getRelativePath(
      this.pathResolver.getAppviewsPath(),
      './styles/globals.css'
    );

    return `/* NexusGPro Generated Styles */
/* View: ${view.name} */
/* Generated: ${new Date().toISOString()} */

/* Import base styles */
@import url('${cssPath}');

/* Component-specific styles */
[data-component] {
  box-sizing: border-box;
}

button[data-component="Button"] {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
}

button[data-variant="primary"] {
  background: #3b82f6;
  color: white;
}

button[data-variant="secondary"] {
  background: #6b7280;
  color: white;
}

button[data-variant="outline"] {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-component="Card"] {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[data-component="Input"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 100%;
}

[data-component="Input"]:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
`;
  }

  private generateJS(view: ViewConfig): string {
    return `// NexusGPro Generated JavaScript
// View: ${view.name}
// Generated: ${new Date().toISOString()}

document.addEventListener('DOMContentLoaded', function() {
  console.log('View loaded: ${view.name}');

  // Button click handlers
  document.querySelectorAll('button[data-component="Button"]').forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', this.id);
      // Add your custom logic here
    });
  });

  // Form input handlers
  document.querySelectorAll('input[data-component="Input"]').forEach(input => {
    input.addEventListener('change', function(e) {
      console.log('Input changed:', this.id, this.value);
      // Add your custom logic here
    });
  });

  // Modal handlers
  document.querySelectorAll('[data-component="Modal"]').forEach(modal => {
    const closeBtn = modal.querySelector('[data-action="close"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  });
});

// API Communication helper
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Export for external use
window.NexusGPro = {
  apiCall,
  viewName: '${view.name}',
  version: '${view.metadata.version}'
};
`;
  }

  private buildFullDocument(view: ViewConfig, html: string, css: string, js: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${view.name} - NexusGPro</title>
  <meta name="description" content="${view.description || 'Generated with NexusGPro Builder'}">
  <meta name="generator" content="NexusGPro Builder v${view.metadata.version}">

  <style>
${css}
  </style>
</head>
<body>
  <!-- Generated by NexusGPro Builder -->
  <!-- View: ${view.name} -->
  <!-- Created: ${view.metadata.created} -->
  <!-- Updated: ${view.metadata.updated} -->

${html}

  <script>
${js}
  </script>
</body>
</html>`;
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
