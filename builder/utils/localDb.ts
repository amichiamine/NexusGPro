import type { ViewDefinition, ExportResult } from '../types';

const VIEWS_KEY = 'nexusgpro_builder_views';
const EXPORTS_KEY = 'nexusgpro_builder_exports';

function generateId(): string {
  return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getViews(): Record<string, ViewDefinition> {
  try {
    const data = localStorage.getItem(VIEWS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load views:', error);
    return {};
  }
}

function setViews(views: Record<string, ViewDefinition>): void {
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch (error) {
    console.error('Failed to save views:', error);
  }
}

function getExports(): Record<string, any[]> {
  try {
    const data = localStorage.getItem(EXPORTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load exports:', error);
    return {};
  }
}

function setExports(exports: Record<string, any[]>): void {
  try {
    localStorage.setItem(EXPORTS_KEY, JSON.stringify(exports));
  } catch (error) {
    console.error('Failed to save exports:', error);
  }
}

export function saveView(view: ViewDefinition): { success: boolean; error?: string } {
  try {
    const views = getViews();

    if (!view.id) {
      view.id = generateId();
    }

    view.metadata.updated = new Date().toISOString();

    views[view.name] = view;
    setViews(views);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function loadView(name: string): { success: boolean; view?: ViewDefinition; error?: string } {
  try {
    const views = getViews();
    const view = views[name];

    if (!view) {
      return { success: false, error: 'View not found' };
    }

    return { success: true, view };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function listViews(): { success: boolean; views?: ViewDefinition[]; error?: string } {
  try {
    const views = getViews();
    const viewsList = Object.values(views).sort((a, b) => {
      const dateA = new Date(a.metadata.updated).getTime();
      const dateB = new Date(b.metadata.updated).getTime();
      return dateB - dateA;
    });

    return { success: true, views: viewsList };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function deleteView(name: string): { success: boolean; error?: string } {
  try {
    const views = getViews();
    delete views[name];
    setViews(views);

    const exports = getExports();
    delete exports[name];
    setExports(exports);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function saveExport(
  viewName: string,
  exportResult: ExportResult,
  format: string,
  appViewsLocation: string
): { success: boolean; error?: string } {
  try {
    const viewResult = loadView(viewName);
    if (!viewResult.success || !viewResult.view) {
      return { success: false, error: 'View not found' };
    }

    const exports = getExports();
    if (!exports[viewName]) {
      exports[viewName] = [];
    }

    exports[viewName].unshift({
      id: generateId(),
      view_id: viewResult.view.id,
      format,
      code: exportResult.code || '',
      filename: exportResult.filename || '',
      app_views_location: appViewsLocation,
      created_at: new Date().toISOString()
    });

    if (exports[viewName].length > 10) {
      exports[viewName] = exports[viewName].slice(0, 10);
    }

    setExports(exports);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function getExportHistory(viewName: string): { success: boolean; exports?: any[]; error?: string } {
  try {
    const exports = getExports();
    const viewExports = exports[viewName] || [];

    return { success: true, exports: viewExports };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function clearAllData(): void {
  localStorage.removeItem(VIEWS_KEY);
  localStorage.removeItem(EXPORTS_KEY);
}

export function exportAllData(): string {
  const views = getViews();
  const exports = getExports();

  return JSON.stringify({
    views,
    exports,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

export function importAllData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData);

    if (data.views) {
      setViews(data.views);
    }

    if (data.exports) {
      setExports(data.exports);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to import data' };
  }
}
