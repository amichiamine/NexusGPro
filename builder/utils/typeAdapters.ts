import type {
  ViewDefinition,
  ViewNode,
  ViewConfig,
  ComponentNode,
  ComponentMetadata,
  ComponentDefinition
} from '../types';

export function viewDefinitionToViewConfig(viewDef: ViewDefinition): ViewConfig {
  return {
    id: viewDef.id,
    name: viewDef.name,
    description: viewDef.description,
    root: viewNodeToComponentNode(viewDef.rootNode),
    metadata: {
      created: viewDef.metadata.created,
      updated: viewDef.metadata.updated,
      author: viewDef.metadata.author,
      version: viewDef.metadata.version
    },
    settings: {
      format: 'both',
      includeStyles: true,
      minify: false,
      portable: true
    }
  };
}

export function viewConfigToViewDefinition(viewConfig: ViewConfig): ViewDefinition {
  return {
    id: viewConfig.id,
    name: viewConfig.name,
    description: viewConfig.description,
    rootNode: componentNodeToViewNode(viewConfig.root),
    metadata: {
      created: viewConfig.metadata.created,
      updated: viewConfig.metadata.updated,
      version: viewConfig.metadata.version,
      author: viewConfig.metadata.author
    },
    dependencies: [],
    styles: '',
    scripts: ''
  };
}

export function viewNodeToComponentNode(viewNode: ViewNode): ComponentNode {
  return {
    id: viewNode.id,
    type: viewNode.type === 'container' ? 'atom' : (viewNode.type as any),
    name: viewNode.componentId || 'Container',
    componentId: viewNode.componentId,
    props: viewNode.props,
    children: viewNode.children?.map(child => viewNodeToComponentNode(child)),
    styles: viewNode.styles as Record<string, string>,
    className: viewNode.props.className
  };
}

export function componentNodeToViewNode(compNode: ComponentNode): ViewNode {
  return {
    id: compNode.id,
    type: compNode.type === 'template' ? 'template' : 'component',
    componentId: compNode.componentId || compNode.name.toLowerCase(),
    props: compNode.props,
    children: compNode.children?.map(child => componentNodeToViewNode(child)),
    styles: compNode.styles
  };
}

export function componentMetadataToDefinition(metadata: ComponentMetadata): ComponentDefinition {
  const props = Object.entries(metadata.props).map(([name, propDef]) => ({
    name,
    type: propDef.type === 'ReactNode' ? 'node' : propDef.type as any,
    required: propDef.required || false,
    defaultValue: propDef.default,
    description: propDef.description,
    options: propDef.options
  }));

  return {
    name: metadata.name,
    category: metadata.category === 'atoms' ? 'atom' :
              metadata.category === 'molecules' ? 'molecule' :
              metadata.category === 'organisms' ? 'organism' : 'atom',
    props,
    description: metadata.description || '',
    tags: []
  };
}
