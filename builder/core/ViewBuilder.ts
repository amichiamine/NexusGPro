import { ViewConfig, ComponentNode, BuilderState } from '../types';

export class ViewBuilder {
  private state: BuilderState;
  private listeners: Array<(state: BuilderState) => void> = [];

  constructor() {
    this.state = {
      currentView: null,
      selectedNode: null,
      isDirty: false,
      history: [],
      historyIndex: -1
    };
  }

  createNewView(name: string, description?: string): ViewConfig {
    const view: ViewConfig = {
      id: this.generateId(),
      name,
      description,
      root: {
        id: this.generateId(),
        type: 'template',
        name: 'Container',
        props: {},
        children: []
      },
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0'
      },
      settings: {
        format: 'both',
        includeStyles: true,
        minify: false,
        portable: true
      }
    };

    this.setCurrentView(view);
    return view;
  }

  setCurrentView(view: ViewConfig | null) {
    this.state.currentView = view;
    this.state.isDirty = false;
    this.pushToHistory();
    this.notifyListeners();
  }

  getCurrentView(): ViewConfig | null {
    return this.state.currentView as ViewConfig | null;
  }

  selectNode(node: ComponentNode | null) {
    this.state.selectedNode = node;
    this.notifyListeners();
  }

  getSelectedNode(): ComponentNode | null {
    return this.state.selectedNode as ComponentNode | null;
  }

  addComponent(component: ComponentNode, parentId?: string): boolean {
    const view = this.getCurrentView();
    if (!view) return false;

    const parent = parentId
      ? this.findNodeById(view.root, parentId)
      : view.root;

    if (!parent) return false;

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(component);

    this.markDirty();
    this.pushToHistory();
    this.notifyListeners();

    return true;
  }

  removeComponent(nodeId: string): boolean {
    const view = this.getCurrentView();
    if (!view) return false;

    const removed = this.removeNodeById(view.root, nodeId);

    if (removed) {
      const selected = this.getSelectedNode();
      if (selected?.id === nodeId) {
        this.state.selectedNode = null;
      }

      this.markDirty();
      this.pushToHistory();
      this.notifyListeners();
    }

    return removed;
  }

  updateComponent(nodeId: string, updates: Partial<ComponentNode>): boolean {
    const view = this.getCurrentView();
    if (!view) return false;

    const node = this.findNodeById(view.root, nodeId);
    if (!node) return false;

    Object.assign(node, updates);

    this.markDirty();
    this.pushToHistory();
    this.notifyListeners();

    return true;
  }

  moveComponent(nodeId: string, newParentId: string, index?: number): boolean {
    const view = this.getCurrentView();
    if (!view) return false;

    const node = this.findNodeById(view.root, nodeId);
    if (!node) return false;

    const removed = this.removeNodeById(view.root, nodeId);
    if (!removed) return false;

    const newParent = this.findNodeById(view.root, newParentId);
    if (!newParent) return false;

    if (!newParent.children) {
      newParent.children = [];
    }

    if (index !== undefined && index >= 0 && index <= newParent.children.length) {
      newParent.children.splice(index, 0, node);
    } else {
      newParent.children.push(node);
    }

    this.markDirty();
    this.pushToHistory();
    this.notifyListeners();

    return true;
  }

  undo(): boolean {
    const historyIndex = this.state.historyIndex ?? -1;
    const history = this.state.history ?? [];

    if (historyIndex <= 0) return false;

    this.state.historyIndex = historyIndex - 1;
    this.state.currentView = this.cloneView(history[this.state.historyIndex]);
    this.notifyListeners();

    return true;
  }

  redo(): boolean {
    const historyIndex = this.state.historyIndex ?? -1;
    const history = this.state.history ?? [];

    if (historyIndex >= history.length - 1) return false;

    this.state.historyIndex = historyIndex + 1;
    this.state.currentView = this.cloneView(history[this.state.historyIndex]);
    this.notifyListeners();

    return true;
  }

  canUndo(): boolean {
    const historyIndex = this.state.historyIndex ?? -1;
    return historyIndex > 0;
  }

  canRedo(): boolean {
    const historyIndex = this.state.historyIndex ?? -1;
    const history = this.state.history ?? [];
    return historyIndex < history.length - 1;
  }

  isDirty(): boolean {
    return this.state.isDirty ?? false;
  }

  subscribe(listener: (state: BuilderState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private findNodeById(node: ComponentNode, id: string): ComponentNode | null {
    if (node.id === id) return node;

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }

    return null;
  }

  private removeNodeById(node: ComponentNode, id: string): boolean {
    if (node.children) {
      const index = node.children.findIndex(child => child.id === id);
      if (index !== -1) {
        node.children.splice(index, 1);
        return true;
      }

      for (const child of node.children) {
        if (this.removeNodeById(child, id)) {
          return true;
        }
      }
    }

    return false;
  }

  private markDirty() {
    this.state.isDirty = true;
    const view = this.getCurrentView();
    if (view) {
      view.metadata.updated = new Date().toISOString();
    }
  }

  private pushToHistory() {
    const view = this.getCurrentView();
    if (!view) return;

    const historyIndex = this.state.historyIndex ?? -1;
    const history = this.state.history ?? [];

    if (historyIndex < history.length - 1) {
      this.state.history = history.slice(0, historyIndex + 1);
    }

    if (!this.state.history) this.state.history = [];
    this.state.history.push(this.cloneView(view));
    this.state.historyIndex = this.state.history.length - 1;

    if (this.state.history.length > 50) {
      this.state.history.shift();
      this.state.historyIndex--;
    }
  }

  private cloneView(view: ViewConfig): ViewConfig {
    return JSON.parse(JSON.stringify(view));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getState(): BuilderState {
    return { ...this.state };
  }
}

export const viewBuilder = new ViewBuilder();
