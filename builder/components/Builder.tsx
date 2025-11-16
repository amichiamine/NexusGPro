import React, { useState, useEffect } from 'react';
import { ViewNode, ViewDefinition, ComponentMetadata, BuilderState } from '../types';
import { getComponentById } from '../core/autoComponentRegistry';
import { Toolbar } from './Toolbar';
import { ComponentCatalog } from './ComponentCatalog';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import '../styles/Builder.css';

function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const Builder: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewDefinition | null>(null);
  const [selectedNode, setSelectedNode] = useState<ViewNode | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const initialView: ViewDefinition = {
      id: 'view_initial',
      name: 'New View',
      description: '',
      rootNode: {
        id: 'root',
        type: 'container',
        componentId: 'root',
        props: {},
        children: []
      },
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0'
      },
      dependencies: []
    };
    setCurrentView(initialView);
  }, []);

  const handleAddComponent = (componentId: string, parentId?: string) => {
    if (!currentView) return;

    const component = getComponentById(componentId);
    if (!component) return;

    const newNode: ViewNode = {
      id: generateId(),
      type: 'component',
      componentId: component.id,
      props: {},
      children: []
    };

    Object.entries(component.props).forEach(([key, propDef]) => {
      if (propDef.default !== undefined) {
        newNode.props[key] = propDef.default;
      }
    });

    const updatedView = { ...currentView };

    if (!parentId || parentId === 'root') {
      updatedView.rootNode.children = [...(updatedView.rootNode.children || []), newNode];
    } else {
      const addToNode = (node: ViewNode): boolean => {
        if (node.id === parentId) {
          node.children = [...(node.children || []), newNode];
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (addToNode(child)) return true;
          }
        }
        return false;
      };
      addToNode(updatedView.rootNode);
    }

    setCurrentView(updatedView);
    setIsDirty(true);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<ViewNode>) => {
    if (!currentView) return;

    const updatedView = { ...currentView };

    const updateNode = (node: ViewNode): boolean => {
      if (node.id === nodeId) {
        Object.assign(node, updates);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (updateNode(child)) return true;
        }
      }
      return false;
    };

    updateNode(updatedView.rootNode);
    setCurrentView(updatedView);
    setIsDirty(true);

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentView) return;

    const updatedView = { ...currentView };

    const deleteFromNode = (node: ViewNode): boolean => {
      if (node.children) {
        const index = node.children.findIndex(c => c.id === nodeId);
        if (index !== -1) {
          node.children.splice(index, 1);
          return true;
        }
        for (const child of node.children) {
          if (deleteFromNode(child)) return true;
        }
      }
      return false;
    };

    deleteFromNode(updatedView.rootNode);
    setCurrentView(updatedView);
    setIsDirty(true);

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  return (
    <div className="builder-container">
      <Toolbar
        currentView={currentView}
        isDirty={isDirty}
        onViewChange={() => {}}
      />

      <div className="builder-content">
        <div className="builder-sidebar left">
          <ComponentCatalog
            onSelectComponent={(component) => {
              console.log('Component selected:', component);
            }}
          />
        </div>

        <div className="builder-main">
          <Canvas
            root={currentView?.rootNode || null}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onAddComponent={handleAddComponent}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        </div>

        <div className="builder-sidebar right">
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>
    </div>
  );
};
