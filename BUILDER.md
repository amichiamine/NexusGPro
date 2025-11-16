# NexusGPro Builder - Documentation Technique

## Vue d'ensemble

Le builder NexusGPro est un éditeur visuel qui permet de créer des interfaces web en glissant-déposant des composants, puis d'exporter le résultat en HTML, PHP ou JSON pour un déploiement sans Node.js.

## Architecture

```
builder/
├── components/          # Interface utilisateur du builder
│   ├── Builder.tsx      # Conteneur principal
│   ├── Toolbar.tsx      # Barre d'outils (New, Import, Export, Save)
│   ├── ComponentCatalog.tsx  # Catalogue de composants
│   ├── Canvas.tsx       # Zone de travail drag-and-drop
│   └── PropertiesPanel.tsx   # Éditeur de propriétés
│
├── core/               # Logique métier
│   ├── ComponentRegistry.ts  # Registre des composants disponibles
│   ├── ViewBuilder.ts       # Gestion de l'état et des opérations
│   ├── ExportManager.ts     # Gestion des exports
│   ├── ImportParser.ts      # Parsing des imports
│   └── SupabaseService.ts   # Persistance (optionnel)
│
├── generators/         # Générateurs de code
│   ├── HTMLGenerator.ts     # Génération HTML/CSS/JS
│   └── PHPGenerator.ts      # Génération PHP
│
├── types/             # Définitions TypeScript
│   └── index.ts       # Types centralisés
│
├── utils/             # Utilitaires
│   └── pathResolver.ts      # Gestion des chemins portables
│
└── styles/            # Styles du builder
    └── Builder.css    # CSS complet du builder
```

## Concepts Clés

### 1. ComponentNode

Structure d'arbre représentant un composant et ses enfants :

```typescript
interface ComponentNode {
  id: string;                    // Identifiant unique
  type: 'atom' | 'molecule' | 'organism' | 'template';
  name: string;                  // Nom du composant (ex: "Button")
  props: Record<string, any>;    // Propriétés du composant
  children?: ComponentNode[];    // Composants enfants
  styles?: Record<string, string>; // Styles inline
  className?: string;            // Classes CSS
}
```

### 2. ViewConfig

Configuration complète d'une vue :

```typescript
interface ViewConfig {
  id: string;
  name: string;
  description?: string;
  root: ComponentNode;           // Arbre de composants
  metadata: {
    created: string;
    updated: string;
    author?: string;
    version: string;
  };
  settings: {
    format: 'html' | 'php' | 'both';
    includeStyles: boolean;
    minify: boolean;
    portable: boolean;
  };
}
```

### 3. ComponentRegistry

Le registre maintient la liste de tous les composants disponibles avec leurs définitions :

```typescript
// Enregistrer un composant
ComponentRegistry.register({
  name: 'Button',
  category: 'atom',
  description: 'Interactive button component',
  props: [
    { name: 'variant', type: 'string', required: false,
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'outline'] },
    { name: 'children', type: 'node', required: true }
  ],
  tags: ['action', 'interactive']
});

// Récupérer tous les atoms
const atoms = ComponentRegistry.getComponentsByCategory('atom');
```

## Utilisation

### Créer une Nouvelle Vue

```typescript
import { viewBuilder } from './builder/core/ViewBuilder';

// Créer une vue
const view = viewBuilder.createNewView('My Landing Page', 'Homepage description');

// Ajouter un composant
const buttonNode: ComponentNode = {
  id: 'btn_1',
  type: 'atom',
  name: 'Button',
  props: {
    variant: 'primary',
    children: 'Click Me'
  }
};

viewBuilder.addComponent(buttonNode);
```

### Exporter une Vue

```typescript
import { ExportManager } from './builder/core/ExportManager';
import { defaultPathResolver } from './builder/utils/pathResolver';

const exportManager = new ExportManager(defaultPathResolver);

// Export HTML
const htmlExport = exportManager.exportAsHTML(currentView);
console.log(htmlExport.content);  // HTML complet
console.log(htmlExport.filename); // nom-de-vue.html

// Export PHP
const phpExport = exportManager.exportAsPHP(currentView);

// Export JSON
const jsonString = exportManager.exportAsJSON(currentView);

// Télécharger un fichier
exportManager.downloadAsFile(currentView, 'html');
```

### Importer une Vue

```typescript
import { importParser } from './builder/core/ImportParser';

// Import depuis JSON
const jsonImport = importParser.parseJSON(jsonString);
if (jsonImport.parsed) {
  viewBuilder.setCurrentView(jsonImport.config);
}

// Import depuis HTML
const htmlImport = importParser.parseHTML(htmlString);

// Import depuis PHP
const phpImport = importParser.parsePHP(phpString);
```

## Générateurs

### HTMLGenerator

Génère un fichier HTML standalone avec :

1. **Structure HTML5** sémantique avec meta tags
2. **CSS embarqué** avec styles des composants
3. **JavaScript vanilla** pour les interactions
4. **Helpers API** pour les appels backend

Exemple de sortie :

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ma Vue - NexusGPro</title>
  <style>
    /* CSS généré automatiquement */
  </style>
</head>
<body>
  <!-- Composants rendus -->
  <script>
    // JavaScript pour les interactions
    window.NexusGPro = { ... };
  </script>
</body>
</html>
```

### PHPGenerator

Génère un fichier PHP avec :

1. **Helpers de rendu** pour chaque type de composant
2. **Gestion d'API** intégrée via `$_GET['api']`
3. **Handlers de formulaire** via `$_POST`
4. **Protection XSS** automatique
5. **Structure HTML** similaire à HTMLGenerator

Exemple de sortie :

```php
<?php
// Helpers PHP
function renderComponent($type, $props, $children) { ... }

// API Handler
if (isset($_GET['api'])) {
  handleApiRequest();
  exit;
}
?>
<!DOCTYPE html>
<html>
<!-- HTML structure -->
</html>
```

## Chemins Portables

Le `PathResolver` gère les chemins relatifs pour permettre le déplacement du dossier `appviews/` :

```typescript
const pathResolver = new PathResolver({
  appviewsPath: './appviews',
  componentsPath: './components',
  isRelative: true
});

// Obtenir le chemin relatif
const relativePath = pathResolver.getRelativePath(
  './appviews/exports',
  './components'
); // Résultat: "../../components"
```

### Scénarios de Déploiement

**Développement** :
```
nexusg-pro/
├── builder/
├── components/
└── appviews/         ← ici pendant dev
```

**Production** :
```
parent/
├── nexusg-pro/
│   ├── builder/
│   └── components/
└── appviews/         ← déplacé au niveau parent
```

Le `PathResolver` s'adapte automatiquement.

## Drag & Drop

Le système de drag-and-drop utilise l'API HTML5 Drag and Drop :

```typescript
// Dans ComponentCatalog
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  }}
>
  {component.name}
</div>

// Dans Canvas
<div
  onDrop={(e) => {
    const componentData = e.dataTransfer.getData('component');
    const component = JSON.parse(componentData);
    viewBuilder.addComponent(component, targetNodeId);
  }}
  onDragOver={(e) => e.preventDefault()}
>
  Drop zone
</div>
```

## Undo/Redo

Le `ViewBuilder` maintient un historique des modifications :

```typescript
// Annuler
viewBuilder.undo();

// Refaire
viewBuilder.redo();

// Vérifier si possible
if (viewBuilder.canUndo()) {
  // ...
}
```

L'historique est limité à 50 entrées pour optimiser la mémoire.

## Éditeur de Propriétés

Le `PropertiesPanel` génère dynamiquement les inputs selon le type de propriété :

```typescript
// Pour une string avec options
<select value={props.variant}>
  <option value="primary">Primary</option>
  <option value="secondary">Secondary</option>
</select>

// Pour un boolean
<input type="checkbox" checked={props.disabled} />

// Pour un object/array
<textarea value={JSON.stringify(props.data)} />
```

## Intégration Supabase (Optionnel)

Le `SupabaseService` permet de sauvegarder les vues dans le cloud :

```typescript
import { supabaseService } from './builder/core/SupabaseService';

// Sauvegarder
await supabaseService.saveView(currentView);

// Charger
const view = await supabaseService.loadView(viewId);

// Lister
const views = await supabaseService.listViews();
```

## Extensibilité

### Ajouter un Nouveau Composant

1. Créer le composant React dans `components/`
2. L'ajouter au registre :

```typescript
// Dans builder/core/ComponentRegistry.ts
export const ATOMS: ComponentDefinition[] = [
  // ... existants
  {
    name: 'NewComponent',
    category: 'atom',
    description: 'Description du composant',
    props: [
      { name: 'prop1', type: 'string', required: true },
      { name: 'prop2', type: 'number', required: false, defaultValue: 0 }
    ],
    tags: ['custom', 'new']
  }
];
```

3. Mettre à jour les générateurs si nécessaire :

```typescript
// Dans HTMLGenerator.ts
private getHTMLTag(node: ComponentNode): string {
  const tagMap: Record<string, string> = {
    // ... existants
    'NewComponent': 'div'
  };
  return tagMap[node.name] || 'div';
}
```

### Ajouter un Nouveau Générateur

```typescript
import { ViewConfig, ExportFormat } from '../types';

export class CustomGenerator {
  generate(view: ViewConfig): ExportFormat {
    // Logique de génération
    return {
      format: 'custom',
      content: '...',
      filename: `${view.name}.custom`
    };
  }
}
```

## Performance

### Optimisations Implémentées

1. **Memoization** : Les composants ne se re-rendent que si leurs props changent
2. **Lazy Loading** : Les générateurs ne sont chargés qu'au besoin
3. **Debouncing** : Les mises à jour des propriétés sont debounced
4. **Virtual Scrolling** : Pour les grandes listes de composants

### Limites

- **Historique** : Maximum 50 états (configurable)
- **Profondeur d'arbre** : Recommandé < 10 niveaux
- **Taille de vue** : Optimisé pour < 100 composants

## Debugging

### Mode Debug

```typescript
// Activer les logs détaillés
localStorage.setItem('builder_debug', 'true');

// Dans le code
if (localStorage.getItem('builder_debug')) {
  console.log('Debug info:', view);
}
```

### Inspecter l'État

```typescript
// État actuel du builder
const state = viewBuilder.getState();
console.log('Current view:', state.currentView);
console.log('Selected node:', state.selectedNode);
console.log('Is dirty:', state.isDirty);
console.log('History:', state.history);
```

## Tests

```bash
# Lancer les tests
npm run test

# Tests spécifiques
npm run test -- ComponentRegistry
npm run test -- ViewBuilder
```

## Troubleshooting

### Le composant ne s'affiche pas dans le catalogue

Vérifier :
1. Le composant est bien enregistré dans `ComponentRegistry`
2. Le nom correspond exactement
3. La catégorie est correcte

### L'export génère du code incorrect

Vérifier :
1. Les propriétés du composant sont valides
2. Le générateur a un mapping pour ce composant
3. Les chemins sont correctement configurés

### Le drag-and-drop ne fonctionne pas

Vérifier :
1. L'attribut `draggable` est présent
2. Les handlers `onDragStart`, `onDrop`, `onDragOver` sont définis
3. `e.preventDefault()` est appelé dans `onDragOver`

## Ressources

- [React DnD](https://react-dnd.github.io/react-dnd/) - Alternative pour drag-and-drop
- [HTML5 Drag and Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) - Documentation MDN
- [TypeScript](https://www.typescriptlang.org/) - Documentation officielle

## Contribuer

Pour contribuer au builder :

1. Fork le projet
2. Créer une branche feature
3. Implémenter les changements
4. Tester exhaustivement
5. Soumettre une pull request

## Support

Pour toute question technique :
- Consulter cette documentation
- Lire les commentaires dans le code
- Ouvrir une issue sur GitHub
