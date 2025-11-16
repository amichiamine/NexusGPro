import React, { useState, useEffect } from 'react';
import { ComponentNode, ViewNode, BuilderState, ViewConfig } from '../types';
import { viewBuilder } from '../core/ViewBuilder';
import { initializeComponentRegistry } from '../core/ComponentRegistry';
import { Toolbar } from './Toolbar';
import { ComponentCatalog } from './ComponentCatalog';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { viewNodeToComponentNode, componentNodeToViewNode } from '../utils/typeAdapters';
import '../styles/Builder.css';

export const Builder: React.FC = () => {
  const [state, setState] = useState<BuilderState>(viewBuilder.getState());

  useEffect(() => {
    initializeComponentRegistry();

    const unsubscribe = viewBuilder.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, []);

  const handleViewChange = () => {
    setState(viewBuilder.getState());
  };

  const handleSelectNode = (node: ComponentNode | null) => {
    viewBuilder.selectNode(node);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<ViewNode>) => {
    const compNodeUpdates: Partial<ComponentNode> = {
      props: updates.props,
      styles: updates.styles as Record<string, string>,
      className: updates.props?.className
    };
    viewBuilder.updateComponent(nodeId, compNodeUpdates);
  };

  const currentView = state.currentView as ViewConfig | null;
  const selectedNode = state.selectedNode as ComponentNode | null;

  return (
    <div className="builder-container">
      <Toolbar
        currentView={currentView}
        isDirty={state.isDirty || false}
        onViewChange={handleViewChange}
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
            root={currentView?.root || null}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
          />
        </div>

        <div className="builder-sidebar right">
          <PropertiesPanel
            selectedNode={selectedNode ? componentNodeToViewNode(selectedNode) : null}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>
    </div>
  );
};
