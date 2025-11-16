import React, { useState, useEffect } from 'react';
import { ComponentNode, PropDefinition } from '../types';
import { ComponentRegistry } from '../core/ComponentRegistry';
import { viewBuilder } from '../core/ViewBuilder';

interface PropertiesPanelProps {
  node: ComponentNode | null;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node }) => {
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [localStyles, setLocalStyles] = useState<Record<string, string>>({});
  const [localClassName, setLocalClassName] = useState('');

  useEffect(() => {
    if (node) {
      setLocalProps(node.props || {});
      setLocalStyles(node.styles || {});
      setLocalClassName(node.className || '');
    }
  }, [node]);

  if (!node) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Select a component to edit properties</p>
        </div>
      </div>
    );
  }

  const componentDef = ComponentRegistry.getComponent(node.name);

  const handlePropChange = (propName: string, value: any) => {
    const updated = { ...localProps, [propName]: value };
    setLocalProps(updated);
    viewBuilder.updateComponent(node.id, { props: updated });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const updated = { ...localStyles, [styleName]: value };
    setLocalStyles(updated);
    viewBuilder.updateComponent(node.id, { styles: updated });
  };

  const handleClassNameChange = (value: string) => {
    setLocalClassName(value);
    viewBuilder.updateComponent(node.id, { className: value });
  };

  const renderPropInput = (prop: PropDefinition) => {
    const value = localProps[prop.name];

    switch (prop.type) {
      case 'string':
        if (prop.options && prop.options.length > 0) {
          return (
            <select
              value={value || prop.defaultValue || ''}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
              className="prop-select"
            >
              {prop.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            placeholder={prop.defaultValue}
            className="prop-input"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || prop.defaultValue || 0}
            onChange={(e) => handlePropChange(prop.name, parseFloat(e.target.value))}
            className="prop-input"
          />
        );

      case 'boolean':
        return (
          <label className="prop-checkbox">
            <input
              type="checkbox"
              checked={value || prop.defaultValue || false}
              onChange={(e) => handlePropChange(prop.name, e.target.checked)}
            />
            <span>{prop.description}</span>
          </label>
        );

      case 'array':
        return (
          <textarea
            value={value ? JSON.stringify(value, null, 2) : '[]'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropChange(prop.name, parsed);
              } catch (err) {
                console.error('Invalid JSON');
              }
            }}
            className="prop-textarea"
            rows={4}
          />
        );

      case 'object':
        return (
          <textarea
            value={value ? JSON.stringify(value, null, 2) : '{}'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropChange(prop.name, parsed);
              } catch (err) {
                console.error('Invalid JSON');
              }
            }}
            className="prop-textarea"
            rows={4}
          />
        );

      case 'node':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            placeholder="Enter content..."
            className="prop-textarea"
            rows={3}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            className="prop-input"
          />
        );
    }
  };

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <span className="properties-component-name">{node.name}</span>
      </div>

      <div className="properties-content">
        <div className="properties-section">
          <h4>Basic</h4>
          <div className="prop-group">
            <label>ID</label>
            <input
              type="text"
              value={node.id}
              disabled
              className="prop-input disabled"
            />
          </div>
          <div className="prop-group">
            <label>Class Name</label>
            <input
              type="text"
              value={localClassName}
              onChange={(e) => handleClassNameChange(e.target.value)}
              placeholder="custom-class"
              className="prop-input"
            />
          </div>
        </div>

        {componentDef && componentDef.props.length > 0 && (
          <div className="properties-section">
            <h4>Component Props</h4>
            {componentDef.props.map((prop) => (
              <div key={prop.name} className="prop-group">
                <label>
                  {prop.name}
                  {prop.required && <span className="required">*</span>}
                </label>
                {prop.description && (
                  <p className="prop-description">{prop.description}</p>
                )}
                {renderPropInput(prop)}
              </div>
            ))}
          </div>
        )}

        <div className="properties-section">
          <h4>Styles</h4>
          <div className="prop-group">
            <label>Width</label>
            <input
              type="text"
              value={localStyles.width || ''}
              onChange={(e) => handleStyleChange('width', e.target.value)}
              placeholder="auto"
              className="prop-input"
            />
          </div>
          <div className="prop-group">
            <label>Height</label>
            <input
              type="text"
              value={localStyles.height || ''}
              onChange={(e) => handleStyleChange('height', e.target.value)}
              placeholder="auto"
              className="prop-input"
            />
          </div>
          <div className="prop-group">
            <label>Margin</label>
            <input
              type="text"
              value={localStyles.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              placeholder="0"
              className="prop-input"
            />
          </div>
          <div className="prop-group">
            <label>Padding</label>
            <input
              type="text"
              value={localStyles.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              placeholder="0"
              className="prop-input"
            />
          </div>
          <div className="prop-group">
            <label>Background</label>
            <input
              type="text"
              value={localStyles.background || ''}
              onChange={(e) => handleStyleChange('background', e.target.value)}
              placeholder="transparent"
              className="prop-input"
            />
          </div>
          <div className="prop-group">
            <label>Color</label>
            <input
              type="text"
              value={localStyles.color || ''}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              placeholder="inherit"
              className="prop-input"
            />
          </div>
        </div>

        <div className="properties-section">
          <h4>Advanced</h4>
          <div className="prop-group">
            <label>Custom Styles (JSON)</label>
            <textarea
              value={JSON.stringify(localStyles, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setLocalStyles(parsed);
                  viewBuilder.updateComponent(node.id, { styles: parsed });
                } catch (err) {
                  console.error('Invalid JSON');
                }
              }}
              className="prop-textarea"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
