import React, { useState } from 'react';
import { ViewConfig, ViewDefinition } from '../types';
import { viewBuilder } from '../core/ViewBuilder';
import { ExportManager } from '../core/ExportManager';
import { importParser } from '../core/ImportParser';
import { defaultPathResolver } from '../utils/pathResolver';
import { viewNodeToComponentNode } from '../utils/typeAdapters';

interface ToolbarProps {
  currentView: ViewConfig | ViewDefinition | null;
  isDirty: boolean;
  onViewChange: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ currentView, isDirty, onViewChange }) => {
  const [showNewViewModal, setShowNewViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');

  const exportManager = new ExportManager(defaultPathResolver);

  const handleNewView = () => {
    if (isDirty && !confirm('You have unsaved changes. Continue?')) {
      return;
    }

    if (!viewName.trim()) {
      alert('Please enter a view name');
      return;
    }

    viewBuilder.createNewView(viewName, viewDescription);
    setShowNewViewModal(false);
    setViewName('');
    setViewDescription('');
    onViewChange();
  };

  const handleExport = (format: 'html' | 'php' | 'json') => {
    if (!currentView) return;

    const viewConfig: ViewConfig = 'rootNode' in currentView ? {
      id: currentView.id,
      name: currentView.name,
      description: currentView.description || '',
      root: viewNodeToComponentNode(currentView.rootNode),
      metadata: currentView.metadata,
      settings: {
        format: 'html',
        includeStyles: true,
        minify: false,
        portable: true
      }
    } : currentView;

    exportManager.downloadAsFile(viewConfig, format);
    setShowExportModal(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      let imported;
      if (file.name.endsWith('.json')) {
        imported = importParser.parseJSON(content);
      } else if (file.name.endsWith('.html')) {
        imported = importParser.parseHTML(content);
      } else if (file.name.endsWith('.php')) {
        imported = importParser.parsePHP(content);
      } else {
        alert('Unsupported file format');
        return;
      }

      if (imported.parsed) {
        viewBuilder.setCurrentView(imported.config);
        setShowImportModal(false);
        onViewChange();
        alert('View imported successfully!');
      } else {
        alert('Failed to import: ' + (imported.errors?.join(', ') || 'Unknown error'));
      }
    };

    reader.readAsText(file);
  };

  const handleSaveToSupabase = async () => {
    if (!currentView) return;
    alert('Supabase save functionality will be implemented');
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-section">
          <h2 className="toolbar-title">NexusGPro Builder</h2>
          {currentView && (
            <span className="toolbar-view-name">{currentView.name}</span>
          )}
          {isDirty && <span className="toolbar-dirty">●</span>}
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn primary"
            onClick={() => setShowNewViewModal(true)}
          >
            New View
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowImportModal(true)}
          >
            Import
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowExportModal(true)}
            disabled={!currentView}
          >
            Export
          </button>

          <button
            className="toolbar-btn success"
            onClick={handleSaveToSupabase}
            disabled={!currentView}
          >
            Save
          </button>
        </div>
      </div>

      {showNewViewModal && (
        <div className="modal-overlay" onClick={() => setShowNewViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New View</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>View Name *</label>
                <input
                  type="text"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="My Landing Page"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={viewDescription}
                  onChange={(e) => setViewDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowNewViewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleNewView}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportModal && currentView && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Export View</h3>
            <p>Choose export format for: <strong>{currentView.name}</strong></p>
            <div className="export-options">
              <button
                className="export-btn"
                onClick={() => handleExport('json')}
              >
                <div className="export-icon">📄</div>
                <div className="export-label">JSON</div>
                <div className="export-desc">Config file for re-import</div>
              </button>
              <button
                className="export-btn"
                onClick={() => handleExport('html')}
              >
                <div className="export-icon">🌐</div>
                <div className="export-label">HTML</div>
                <div className="export-desc">Standalone HTML file</div>
              </button>
              <button
                className="export-btn"
                onClick={() => handleExport('php')}
              >
                <div className="export-icon">🐘</div>
                <div className="export-label">PHP</div>
                <div className="export-desc">PHP file with API support</div>
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Import View</h3>
            <p>Select a file to import (JSON, HTML, or PHP)</p>
            <div className="import-area">
              <input
                type="file"
                accept=".json,.html,.php"
                onChange={handleImport}
                id="import-file"
                className="file-input"
              />
              <label htmlFor="import-file" className="file-label">
                <div className="file-icon">📁</div>
                <div>Choose File</div>
                <div className="file-hint">JSON, HTML, or PHP</div>
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
