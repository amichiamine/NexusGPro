import { PathConfig, DEFAULT_PATH_CONFIG } from '../types';

export class PathResolver {
  private config: PathConfig;

  constructor(config: Partial<PathConfig> = {}) {
    this.config = { ...DEFAULT_PATH_CONFIG, ...config };
  }

  getAppviewsPath(relative: boolean = true): string {
    if (relative) {
      return this.config.appviewsPath;
    }
    return this.resolvePath(this.config.appviewsPath);
  }

  getComponentsPath(relative: boolean = true): string {
    if (relative) {
      return this.config.componentsPath;
    }
    return this.resolvePath(this.config.componentsPath);
  }

  getTemplatesPath(relative: boolean = true): string {
    if (relative) {
      return this.config.templatesPath;
    }
    return this.resolvePath(this.config.templatesPath);
  }

  getRelativePath(from: string, to: string): string {
    const fromParts = from.split('/').filter(p => p && p !== '.');
    const toParts = to.split('/').filter(p => p && p !== '.');

    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }

    const upCount = fromParts.length - i;
    const downPath = toParts.slice(i);

    const relativeParts = [...Array(upCount).fill('..'), ...downPath];
    return relativeParts.join('/') || '.';
  }

  resolveImportPath(component: string, fromAppviews: boolean = true): string {
    if (fromAppviews) {
      return `../components/${component}`;
    }
    return `./components/${component}`;
  }

  private resolvePath(path: string): string {
    if (path.startsWith('./')) {
      return path.substring(2);
    }
    return path;
  }

  updateConfig(config: Partial<PathConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): PathConfig {
    return { ...this.config };
  }
}

export const defaultPathResolver = new PathResolver();
