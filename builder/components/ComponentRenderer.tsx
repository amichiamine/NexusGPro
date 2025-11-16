import React from 'react';
import { ViewNode } from '../types';
import { getComponentById } from '../core/autoComponentRegistry';

interface ComponentRendererProps {
  node: ViewNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ node, isSelected, onClick }) => {
  const component = node.componentId ? getComponentById(node.componentId) : null;

  if (!component) {
    return (
      <div
        className={`component-preview component-preview-empty ${isSelected ? 'selected' : ''}`}
        onClick={onClick}
        style={{
          padding: '1rem',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#999'
        }}
      >
        Unknown Component: {node.componentId}
      </div>
    );
  }

  const renderPreview = () => {
    const props = node.props || {};
    const categoryColors: Record<string, string> = {
      atoms: '#3b82f6',
      molecules: '#10b981',
      organisms: '#f59e0b',
      advanced: '#8b5cf6',
      interactions: '#ec4899'
    };

    const bgColor = categoryColors[component.category] || '#6b7280';

    switch (component.name) {
      case 'Button':
        return (
          <button
            style={{
              padding: props.size === 'sm' ? '0.375rem 0.75rem' : props.size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem',
              backgroundColor: props.variant === 'primary' ? '#3b82f6' : props.variant === 'secondary' ? '#6b7280' : '#e5e7eb',
              color: props.variant === 'outline' ? '#3b82f6' : props.variant === 'primary' || props.variant === 'secondary' ? 'white' : '#1f2937',
              border: props.variant === 'outline' ? '2px solid #3b82f6' : 'none',
              borderRadius: '0.375rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {props.children || 'Button'}
          </button>
        );

      case 'Input':
        return (
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder || 'Enter text...'}
            value={props.value || ''}
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          />
        );

      case 'Card':
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {props.title || 'Card Title'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {props.children || 'Card content goes here...'}
            </div>
          </div>
        );

      case 'Hero':
        return (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '3rem 2rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {props.title || 'Hero Title'}
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '1.5rem' }}>
              {props.subtitle || 'Hero subtitle text'}
            </p>
            <button style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              {props.ctaText || 'Get Started'}
            </button>
          </div>
        );

      case 'Navbar':
        return (
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
              {props.brand || 'Brand'}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Home', 'About', 'Contact'].map(item => (
                <span key={item} style={{ color: '#6b7280', cursor: 'pointer' }}>{item}</span>
              ))}
            </div>
          </nav>
        );

      case 'Modal':
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                {props.title || 'Modal Title'}
              </h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ color: '#6b7280' }}>
              {props.children || 'Modal content...'}
            </div>
          </div>
        );

      case 'PricingCard':
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {props.plan || 'Plan Name'}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ${props.price || '99'}<span style={{ fontSize: '1rem', color: '#6b7280' }}>/mo</span>
            </div>
            <ul style={{ textAlign: 'left', marginBottom: '1.5rem', color: '#6b7280' }}>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600
            }}>
              Choose Plan
            </button>
          </div>
        );

      case 'Carousel':
        return (
          <div style={{
            position: 'relative',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <button style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>‹</button>
            <div style={{ padding: '2rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Slide {props.currentSlide || 1}
              </div>
              <div style={{ color: '#6b7280' }}>
                Carousel content here
              </div>
            </div>
            <button style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>›</button>
          </div>
        );

      case 'Table':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Header 1</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Header 2</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Header 3</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>Row {i} Col 1</td>
                  <td style={{ padding: '0.75rem' }}>Row {i} Col 2</td>
                  <td style={{ padding: '0.75rem' }}>Row {i} Col 3</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return (
          <div style={{
            padding: '1.5rem',
            backgroundColor: bgColor + '10',
            border: `2px solid ${bgColor}`,
            borderRadius: '0.5rem',
            color: bgColor
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {component.category === 'atoms' && '⚛️'}
                {component.category === 'molecules' && '🧬'}
                {component.category === 'organisms' && '🦠'}
                {component.category === 'advanced' && '⚡'}
                {component.category === 'interactions' && '🎯'}
              </span>
              <div>
                <div style={{ fontWeight: 600 }}>{component.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {component.description || `${component.category} component`}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`component-preview ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {renderPreview()}
    </div>
  );
};
