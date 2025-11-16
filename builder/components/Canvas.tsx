import React, { useState } from 'react';
import { ComponentNode, ComponentDefinition } from '../types';
import { viewBuilder } from '../core/ViewBuilder';

interface CanvasProps {
  root: ComponentNode | null;
  selectedNode: ComponentNode | null;
  onSelectNode: (node: ComponentNode | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ root, selectedNode, onSelectNode }) => {
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const componentData = e.dataTransfer.getData('component');
    const nodeData = e.dataTransfer.getData('node');

    if (componentData) {
      const component: ComponentDefinition = JSON.parse(componentData);
      const newNode: ComponentNode = {
        id: generateId(),
        type: component.category,
        name: component.name,
        props: component.props.reduce((acc, prop) => {
          if (prop.defaultValue !== undefined) {
            acc[prop.name] = prop.defaultValue;
          }
          return acc;
        }, {} as Record<string, any>)
      };

      viewBuilder.addComponent(newNode, targetNodeId);
    } else if (nodeData) {
      const node: ComponentNode = JSON.parse(nodeData);
      viewBuilder.moveComponent(node.id, targetNodeId);
    }

    setDragOverNodeId(null);
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNodeId(nodeId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNodeId(null);
  };

  const renderNode = (node: ComponentNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedNode?.id === node.id;
    const isDragOver = dragOverNodeId === node.id;

    return (
      <div
        key={node.id}
        className={`canvas-node ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('node', JSON.stringify(node));
        }}
        onDrop={(e) => handleDrop(e, node.id)}
        onDragOver={(e) => handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node);
        }}
      >
        <div className="canvas-node-header">
          <span className="canvas-node-icon">
            {node.type === 'atom' && '⚛️'}
            {node.type === 'molecule' && '🧬'}
            {node.type === 'organism' && '🦠'}
            {node.type === 'template' && '📄'}
          </span>
          <span className="canvas-node-name">{node.name}</span>
          <span className="canvas-node-id">#{node.id.slice(-6)}</span>
          <button
            className="canvas-node-delete"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${node.name}?`)) {
                viewBuilder.removeComponent(node.id);
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

        {(!node.children || node.children.length === 0) && (
          <div
            className="canvas-node-dropzone"
            onDrop={(e) => handleDrop(e, node.id)}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDragLeave={handleDragLeave}
          >
            Drop components here
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="canvas">
      <div className="canvas-header">
        <h3>Canvas</h3>
        <div className="canvas-actions">
          <button
            onClick={() => viewBuilder.undo()}
            disabled={!viewBuilder.canUndo()}
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={() => viewBuilder.redo()}
            disabled={!viewBuilder.canRedo()}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="canvas-content">
        {root ? (
          renderNode(root)
        ) : (
          <div className="canvas-empty">
            <p>Create a new view to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
