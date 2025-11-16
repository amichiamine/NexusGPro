import React, { useState, useEffect } from 'react';
import { ComponentNode, BuilderState } from '../types';
import { viewBuilder } from '../core/ViewBuilder';
import { initializeComponentRegistry } from '../core/ComponentRegistry';
import { Toolbar } from './Toolbar';
import { ComponentCatalog } from './ComponentCatalog';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
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

  return (
    <div className="builder-container">
      <Toolbar
        currentView={state.currentView}
        isDirty={state.isDirty}
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
            root={state.currentView?.root || null}
            selectedNode={state.selectedNode}
            onSelectNode={handleSelectNode}
          />
        </div>

        <div className="builder-sidebar right">
          <PropertiesPanel node={state.selectedNode} />
        </div>
      </div>
    </div>
  );
};
