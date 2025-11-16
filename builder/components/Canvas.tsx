import React, { useState } from 'react';
import { ViewNode, ComponentMetadata } from '../types';
import { getComponentById } from '../core/autoComponentRegistry';

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

    if (componentId) {
      onAddComponent(componentId, targetNodeId);
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
        className={`canvas-node ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node);
        }}
        onDrop={(e) => handleDrop(e, node.id)}
        onDragOver={(e) => handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
      >
        <div className="canvas-node-header">
          <span className="canvas-node-icon">
            {component?.category === 'atoms' && '⚛️'}
            {component?.category === 'molecules' && '🧬'}
            {component?.category === 'organisms' && '🦠'}
            {component?.category === 'advanced' && '⚡'}
            {component?.category === 'interactions' && '🎯'}
          </span>
          <span className="canvas-node-name">{component?.name || node.componentId || 'Unknown'}</span>
          <span className="canvas-node-id">#{node.id.slice(-6)}</span>
          <button
            className="canvas-node-delete"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${component?.name || 'component'}?`)) {
                onDeleteNode(node.id);
                if (isSelected) {
                  onSelectNode(null);
                }
              }
            }}
          >
            ×
          </button>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="canvas-node-children">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}

        <div
          className="canvas-node-dropzone"
          onDrop={(e) => handleDrop(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
        >
          Drop components here
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
    >
      <div className="canvas-header">
        <h3>Canvas</h3>
      </div>

      <div className={`canvas-content ${canvasIsDragOver ? 'drag-over' : ''}`}>
        {root && root.children && root.children.length > 0 ? (
          root.children.map(child => renderNode(child))
        ) : (
          <div className="canvas-empty">
            <p>Drag components here to start building</p>
          </div>
        )}
      </div>
    </div>
  );
};
