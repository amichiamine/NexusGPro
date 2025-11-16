import React from 'react';
import type { ViewNode, ComponentMetadata } from '../types';
import { getComponentById } from '../core/componentRegistry';

interface PropertiesPanelProps {
  selectedNode: ViewNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<ViewNode>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode
}) => {
  if (!selectedNode) {
    return (
      <div className="properties-panel empty">
        <p>Sélectionnez un élément pour éditer ses propriétés</p>
      </div>
    );
  }

  const component = selectedNode.componentId ? getComponentById(selectedNode.componentId) : null;

  const handlePropChange = (propName: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      props: {
        ...selectedNode.props,
        [propName]: value
      }
    });
  };

  const renderPropEditor = (propName: string, propDef: any) => {
    const currentValue = selectedNode.props[propName];

    switch (propDef.type) {
      case 'string':
        if (propDef.options) {
          return (
            <select
              value={currentValue || propDef.default || ''}
              onChange={(e) => handlePropChange(propName, e.target.value)}
            >
              {propDef.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            placeholder={propDef.description}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={currentValue !== undefined ? currentValue : propDef.default}
            onChange={(e) => handlePropChange(propName, e.target.checked)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue || propDef.default || 0}
            onChange={(e) => handlePropChange(propName, parseFloat(e.target.value))}
          />
        );

      case 'ReactNode':
        return (
          <textarea
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            rows={3}
            placeholder={propDef.description}
          />
        );

      case 'array':
        return (
          <textarea
            value={currentValue ? JSON.stringify(currentValue, null, 2) : '[]'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropChange(propName, parsed);
              } catch (err) {
                console.error('Invalid JSON');
              }
            }}
            rows={4}
          />
        );

      case 'object':
        return (
          <textarea
            value={currentValue ? JSON.stringify(currentValue, null, 2) : '{}'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropChange(propName, parsed);
              } catch (err) {
                console.error('Invalid JSON');
              }
            }}
            rows={4}
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentValue || propDef.default || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="properties-panel">
      <h3>Propriétés</h3>

      <div className="properties-section">
        <h4>Général</h4>
        <div className="property-field">
          <label>Type</label>
          <span>{selectedNode.type}</span>
        </div>
        {component && (
          <div className="property-field">
            <label>Composant</label>
            <span>{component.name}</span>
          </div>
        )}
      </div>

      <div className="properties-section">
        <h4>Attributs HTML</h4>
        <div className="property-field">
          <label>className</label>
          <input
            type="text"
            value={selectedNode.props.className || ''}
            onChange={(e) => handlePropChange('className', e.target.value)}
          />
        </div>
        <div className="property-field">
          <label>id</label>
          <input
            type="text"
            value={selectedNode.props.id || ''}
            onChange={(e) => handlePropChange('id', e.target.value)}
          />
        </div>
      </div>

      {component && component.props && Object.keys(component.props).length > 0 && (
        <div className="properties-section">
          <h4>Props du composant</h4>
          {Object.entries(component.props).map(([propName, propDef]) => (
            <div key={propName} className="property-field">
              <label>
                {propName}
                {propDef.required && <span className="required">*</span>}
              </label>
              {propDef.description && (
                <small className="property-description">{propDef.description}</small>
              )}
              {renderPropEditor(propName, propDef)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
