import React, { useState } from 'react';
import { ViewNode } from '../types';
import { getComponentById } from '../core/autoComponentRegistry';
import { ComponentRenderer } from './ComponentRenderer';

interface CanvasProps {
  root: ViewNode | null;
  selectedNode: ViewNode | null;
  onSelectNode: (node: ViewNode | null) => void;
  onAddComponent: (componentId: string, parentId?: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<ViewNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  root,
  selectedNode,
  onSelectNode,
  onAddComponent,
  onUpdateNode,
  onDeleteNode
}) => {
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [canvasIsDragOver, setCanvasIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent, targetNodeId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const componentId = e.dataTransfer.getData('componentId');
    const templateData = e.dataTransfer.getData('template');

    if (componentId) {
      onAddComponent(componentId, targetNodeId);
    } else if (templateData) {
      console.log('Template drop support coming soon');
    }

    setDragOverNodeId(null);
    setCanvasIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent, nodeId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (nodeId) {
      setDragOverNodeId(nodeId);
    } else {
      setCanvasIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNodeId(null);
    setCanvasIsDragOver(false);
  };

  const renderNode = (node: ViewNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedNode?.id === node.id;
    const isDragOver = dragOverNodeId === node.id;
    const component = node.componentId ? getComponentById(node.componentId) : null;

    return (
      <div
        key={node.id}
        style={{
          marginBottom: '1rem',
          position: 'relative'
        }}
      >
        <div
          className={`canvas-node-wrapper ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
          style={{
            border: isSelected ? '3px solid #3b82f6' : isDragOver ? '2px dashed #f59e0b' : '2px solid transparent',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onDrop={(e) => handleDrop(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
        >
          {isSelected && (
            <div style={{
              position: 'absolute',
              top: '-2rem',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem 0.375rem 0 0',
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 10
            }}>
              <span>{component?.name || 'Component'} #{node.id.slice(-6)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${component?.name || 'component'}?`)) {
                    onDeleteNode(node.id);
                    onSelectNode(null);
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </div>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node);
            }}
          >
            <ComponentRenderer
              node={node}
              isSelected={isSelected}
            />
          </div>

          {node.children && node.children.length > 0 && (
            <div style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb' }}>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}

          {(!node.children || node.children.length === 0) && (
            <div
              onDrop={(e) => handleDrop(e, node.id)}
              onDragOver={(e) => handleDragOver(e, node.id)}
              onDragLeave={handleDragLeave}
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                border: '2px dashed #d1d5db',
                borderRadius: '0.375rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.75rem',
                backgroundColor: isDragOver ? '#fef3c7' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              Drop components here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="canvas"
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={handleDragLeave}
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minHeight: 'calc(100vh - 5rem)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
          Canvas Preview
        </h3>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {root?.children?.length || 0} components
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        backgroundColor: canvasIsDragOver ? '#fef3c7' : '#fafafa',
        transition: 'background-color 0.2s'
      }}>
        {root && root.children && root.children.length > 0 ? (
          <div>
            {root.children.map(child => renderNode(child))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#6b7280' }}>
              Canvas is empty
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Drag components or templates here to start building
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
