import React, { useState } from 'react';
import type { ComponentMetadata, ComponentCategory } from '../types';
import { getAllComponents } from '../core/componentRegistry';

interface ComponentCatalogProps {
  onSelectComponent: (component: ComponentMetadata) => void;
}

export const ComponentCatalog: React.FC<ComponentCatalogProps> = ({ onSelectComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const components = getAllComponents();

  const categories: Array<ComponentCategory | 'all'> = ['all', 'atoms', 'molecules', 'organisms', 'advanced', 'interactions'];

  const filteredComponents = components.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {
    all: components.length,
    atoms: components.filter(c => c.category === 'atoms').length,
    molecules: components.filter(c => c.category === 'molecules').length,
    organisms: components.filter(c => c.category === 'organisms').length,
    advanced: components.filter(c => c.category === 'advanced').length,
    interactions: components.filter(c => c.category === 'interactions').length
  };

  return (
    <div className="component-catalog">
      <div className="catalog-header">
        <h3>Composants ({components.length})</h3>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="catalog-search"
        />
      </div>

      <div className="catalog-filters">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'all' ? 'Tous' : cat} ({cat === 'all' ? categoryCounts.all : categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      <div className="catalog-list">
        {filteredComponents.length === 0 ? (
          <div className="catalog-empty">
            <p>Aucun composant trouvé</p>
          </div>
        ) : (
          filteredComponents.map(component => (
            <div
              key={component.id}
              className="catalog-item"
              onClick={() => onSelectComponent(component)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('componentId', component.id);
              }}
            >
              <div className="catalog-item-header">
                <span className="catalog-item-name">{component.name}</span>
                <span className="catalog-item-category">{component.category}</span>
              </div>
              {component.description && (
                <p className="catalog-item-description">{component.description}</p>
              )}
              {component.hasStyles && (
                <span className="catalog-item-has-styles">CSS</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
