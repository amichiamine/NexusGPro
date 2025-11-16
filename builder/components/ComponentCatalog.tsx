import React, { useState, useMemo } from 'react';
import { ComponentDefinition } from '../types';
import { ComponentRegistry } from '../core/ComponentRegistry';

interface ComponentCatalogProps {
  onSelectComponent: (component: ComponentDefinition) => void;
}

export const ComponentCatalog: React.FC<ComponentCatalogProps> = ({ onSelectComponent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'atom' | 'molecule' | 'organism'>('all');

  const components = useMemo(() => {
    let filtered = ComponentRegistry.getAllComponents();

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = ComponentRegistry.searchComponents(searchQuery);
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(c => c.category === selectedCategory);
      }
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const all = ComponentRegistry.getAllComponents();
    return {
      all: all.length,
      atom: all.filter(c => c.category === 'atom').length,
      molecule: all.filter(c => c.category === 'molecule').length,
      organism: all.filter(c => c.category === 'organism').length
    };
  }, []);

  return (
    <div className="component-catalog">
      <div className="catalog-header">
        <h3>Components</h3>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="catalog-search"
        />
      </div>

      <div className="catalog-categories">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All ({categoryCounts.all})
        </button>
        <button
          className={`category-btn ${selectedCategory === 'atom' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('atom')}
        >
          Atoms ({categoryCounts.atom})
        </button>
        <button
          className={`category-btn ${selectedCategory === 'molecule' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('molecule')}
        >
          Molecules ({categoryCounts.molecule})
        </button>
        <button
          className={`category-btn ${selectedCategory === 'organism' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('organism')}
        >
          Organisms ({categoryCounts.organism})
        </button>
      </div>

      <div className="catalog-list">
        {components.length === 0 ? (
          <div className="catalog-empty">
            <p>No components found</p>
          </div>
        ) : (
          components.map((component) => (
            <div
              key={component.name}
              className="catalog-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('component', JSON.stringify(component));
              }}
              onClick={() => onSelectComponent(component)}
            >
              <div className="catalog-item-header">
                <h4>{component.name}</h4>
                <span className={`catalog-badge ${component.category}`}>
                  {component.category}
                </span>
              </div>
              <p className="catalog-item-description">{component.description}</p>
              {component.tags && component.tags.length > 0 && (
                <div className="catalog-item-tags">
                  {component.tags.map((tag) => (
                    <span key={tag} className="catalog-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
