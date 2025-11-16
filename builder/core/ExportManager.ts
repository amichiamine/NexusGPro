import { ViewConfig, ExportFormat } from '../types';
import { HTMLGenerator } from '../generators/HTMLGenerator';
import { PHPGenerator } from '../generators/PHPGenerator';
import { PathResolver } from '../utils/pathResolver';

export class ExportManager {
  private htmlGenerator: HTMLGenerator;
  private phpGenerator: PHPGenerator;
  private pathResolver: PathResolver;

  constructor(pathResolver: PathResolver) {
    this.pathResolver = pathResolver;
    this.htmlGenerator = new HTMLGenerator(pathResolver);
    this.phpGenerator = new PHPGenerator(pathResolver);
  }

  exportAsJSON(view: ViewConfig): string {
    return JSON.stringify(view, null, 2);
  }

  exportAsHTML(view: ViewConfig): ExportFormat {
    return this.htmlGenerator.generate(view);
  }

  exportAsPHP(view: ViewConfig): ExportFormat {
    return this.phpGenerator.generate(view);
  }

  exportAsBoth(view: ViewConfig): { html: ExportFormat; php: ExportFormat } {
    return {
      html: this.exportAsHTML(view),
      php: this.exportAsPHP(view)
    };
  }

  async saveToFile(view: ViewConfig, format: 'html' | 'php' | 'both' | 'json'): Promise<void> {
    const appviewsPath = this.pathResolver.getAppviewsPath(false);

    if (format === 'json') {
      const jsonContent = this.exportAsJSON(view);
      await this.writeFile(`${appviewsPath}/exports/${view.name}.json`, jsonContent);
      return;
    }

    if (format === 'html' || format === 'both') {
      const htmlExport = this.exportAsHTML(view);
      await this.writeFile(`${appviewsPath}/exports/${htmlExport.filename}`, htmlExport.content);
    }

    if (format === 'php' || format === 'both') {
      const phpExport = this.exportAsPHP(view);
      await this.writeFile(`${appviewsPath}/exports/${phpExport.filename}`, phpExport.content);
    }
  }

  downloadAsFile(view: ViewConfig, format: 'html' | 'php' | 'json'): void {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = this.exportAsJSON(view);
        filename = `${view.name}.json`;
        mimeType = 'application/json';
        break;

      case 'html':
        const htmlExport = this.exportAsHTML(view);
        content = htmlExport.content;
        filename = htmlExport.filename;
        mimeType = 'text/html';
        break;

      case 'php':
        const phpExport = this.exportAsPHP(view);
        content = phpExport.content;
        filename = phpExport.filename;
        mimeType = 'application/x-php';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private async writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Saving file to: ${path}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
