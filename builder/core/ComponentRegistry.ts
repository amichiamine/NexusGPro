export * from './autoComponentRegistry';

import { getAllComponents } from './autoComponentRegistry';

export class ComponentRegistry {
  static getComponent(name: string) {
    const components = getAllComponents();
    return components.find(c => c.name === name);
  }

  static getAllComponents() {
    return getAllComponents();
  }

  static getComponentsByCategory(category: any) {
    return getAllComponents().filter(c => c.category === category);
  }

  static searchComponents(query: string) {
    const lowerQuery = query.toLowerCase();
    return getAllComponents().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
    );
  }

  static register() {
  }

  static clear() {
  }
}

export function initializeComponentRegistry() {
}
