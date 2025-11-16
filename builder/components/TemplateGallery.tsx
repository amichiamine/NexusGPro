import React, { useState } from 'react';
import { templates, TemplateConfig } from '../../templates';

interface TemplateGalleryProps {
  onSelectTemplate: (template: TemplateConfig) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'ecommerce' | 'lms' | 'base'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📚' },
    { id: 'core', name: 'Core', icon: '🎯' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'lms', name: 'LMS', icon: '🎓' },
    { id: 'base', name: 'Base', icon: '📄' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: '#3b82f6',
      ecommerce: '#10b981',
      lms: '#f59e0b',
      base: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
          Templates ({filteredTemplates.length})
        </h3>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            style={{
              padding: '0.375rem 0.75rem',
              border: selectedCategory === cat.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '0.375rem',
              background: selectedCategory === cat.id ? '#eff6ff' : 'white',
              color: selectedCategory === cat.id ? '#3b82f6' : '#6b7280',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {filteredTemplates.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
            <p>No templates found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredTemplates.map(template => (
              <div
                key={template.name}
                onClick={() => onSelectTemplate(template)}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                    {template.name}
                  </h4>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: getCategoryColor(template.category) + '20',
                    color: getCategoryColor(template.category)
                  }}>
                    {template.category}
                  </span>
                </div>

                <p style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  lineHeight: 1.4
                }}>
                  {template.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {template.features.slice(0, 3).map(feature => (
                    <span
                      key={feature}
                      style={{
                        padding: '0.125rem 0.375rem',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        borderRadius: '0.25rem',
                        fontSize: '0.625rem'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 3 && (
                    <span style={{
                      padding: '0.125rem 0.375rem',
                      color: '#9ca3af',
                      fontSize: '0.625rem'
                    }}>
                      +{template.features.length - 3} more
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '0.5rem'
                }}>
                  <strong>{template.dependencies.length}</strong> components
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
