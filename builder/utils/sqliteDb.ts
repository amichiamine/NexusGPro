import Database from 'better-sqlite3';
import type { ViewDefinition, ExportResult } from '../types';

const DB_PATH = './nexusgpro-builder.db';

let db: Database.Database | null = null;

export function initializeDatabase() {
  try {
    db = new Database(DB_PATH);

    db.exec(`
      CREATE TABLE IF NOT EXISTS builder_views (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        root_node TEXT NOT NULL,
        metadata TEXT NOT NULL,
        dependencies TEXT DEFAULT '[]',
        styles TEXT DEFAULT '',
        scripts TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS builder_exports (
        id TEXT PRIMARY KEY,
        view_id TEXT NOT NULL,
        format TEXT NOT NULL CHECK (format IN ('html', 'php', 'react', 'json')),
        code TEXT NOT NULL,
        filename TEXT NOT NULL,
        app_views_location TEXT NOT NULL CHECK (app_views_location IN ('inside', 'sibling')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (view_id) REFERENCES builder_views(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_builder_views_name ON builder_views(name);
      CREATE INDEX IF NOT EXISTS idx_builder_exports_view_id ON builder_exports(view_id);

      CREATE TRIGGER IF NOT EXISTS update_builder_views_updated_at
      AFTER UPDATE ON builder_views
      BEGIN
        UPDATE builder_views SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    console.log('✓ SQLite database initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    return false;
  }
}

function generateId(): string {
  return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveView(view: ViewDefinition): { success: boolean; error?: string } {
  if (!db) {
    initializeDatabase();
  }

  try {
    const stmt = db!.prepare(`
      INSERT OR REPLACE INTO builder_views (id, name, description, root_node, metadata, dependencies, styles, scripts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      view.id || generateId(),
      view.name,
      view.description || '',
      JSON.stringify(view.rootNode),
      JSON.stringify(view.metadata),
      JSON.stringify(view.dependencies),
      view.styles || '',
      view.scripts || ''
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function loadView(name: string): { success: boolean; view?: ViewDefinition; error?: string } {
  if (!db) {
    initializeDatabase();
  }

  try {
    const stmt = db!.prepare('SELECT * FROM builder_views WHERE name = ?');
    const row: any = stmt.get(name);

    if (!row) {
      return { success: false, error: 'View not found' };
    }

    const view: ViewDefinition = {
      id: row.id,
      name: row.name,
      description: row.description,
      rootNode: JSON.parse(row.root_node),
      metadata: JSON.parse(row.metadata),
      dependencies: JSON.parse(row.dependencies),
      styles: row.styles,
      scripts: row.scripts
    };

    return { success: true, view };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function listViews(): { success: boolean; views?: any[]; error?: string } {
  if (!db) {
    initializeDatabase();
  }

  try {
    const stmt = db!.prepare('SELECT * FROM builder_views ORDER BY updated_at DESC');
    const rows = stmt.all();

    return { success: true, views: rows };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function deleteView(name: string): { success: boolean; error?: string } {
  if (!db) {
    initializeDatabase();
  }

  try {
    const stmt = db!.prepare('DELETE FROM builder_views WHERE name = ?');
    stmt.run(name);

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
  if (!db) {
    initializeDatabase();
  }

  try {
    const viewResult = loadView(viewName);
    if (!viewResult.success || !viewResult.view) {
      return { success: false, error: 'View not found' };
    }

    const stmt = db!.prepare(`
      INSERT INTO builder_exports (id, view_id, format, code, filename, app_views_location)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      generateId(),
      viewResult.view.id,
      format,
      exportResult.code || '',
      exportResult.filename || '',
      appViewsLocation
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function getExportHistory(viewName: string): { success: boolean; exports?: any[]; error?: string } {
  if (!db) {
    initializeDatabase();
  }

  try {
    const viewResult = loadView(viewName);
    if (!viewResult.success || !viewResult.view) {
      return { success: false, error: 'View not found' };
    }

    const stmt = db!.prepare('SELECT * FROM builder_exports WHERE view_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(viewResult.view.id);

    return { success: true, exports: rows };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

if (typeof window !== 'undefined') {
  initializeDatabase();
}
