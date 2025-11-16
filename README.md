# NexusGPro - Visual Builder Toolkit

Toolkit complet de développement avec builder visuel pour créer des interfaces web exportables en HTML/PHP sans dépendances Node.js en production.

## 🚀 Caractéristiques

### Builder Visuel
- **Éditeur drag-and-drop** : Interface intuitive pour créer des vues visuellement
- **66+ composants** : Atoms, Molecules, Organisms prêts à l'emploi
- **Export multi-format** : HTML, PHP, JSON
- **Import/Export** : Réimportez vos vues pour les modifier
- **Chemins portables** : Architecture adaptée pour le déploiement

### Formats de Sortie

#### HTML
- Fichier HTML autonome
- CSS et JavaScript embarqués
- Zéro dépendance
- Compatible avec tout serveur web

#### PHP
- Fichier PHP avec gestion d'API
- Handlers de formulaire inclus
- Prêt pour base de données
- Compatible XAMPP/serveurs mutualisés

#### JSON
- Configuration complète
- Réimportable dans le builder
- Versionnable avec Git

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

Ouvre le serveur de développement sur http://localhost:3000

## 🏗️ Utilisation du Builder

1. Cliquez sur "Open Builder" sur la page d'accueil
2. Créez une nouvelle vue avec "New View"
3. Glissez-déposez des composants depuis le catalogue
4. Configurez les propriétés dans le panneau de droite
5. Exportez votre vue en HTML, PHP ou JSON

### Workflow Complet

```
1. Développement (Mode Dev)
   └─> Ouvrir le builder
   └─> Créer/Éditer des vues
   └─> Tester en temps réel

2. Export (Mode Dev → Prod)
   └─> Exporter en HTML/PHP
   └─> Fichiers générés dans appviews/exports/

3. Déploiement (Mode Prod)
   └─> Copier les fichiers exportés
   └─> Déployer sur serveur (XAMPP/mutualisé)
   └─> Aucune dépendance Node.js requise
```

## 📁 Structure du Projet

```
nexusg-pro/
├── builder/                 # Code du builder visuel
│   ├── components/         # UI du builder
│   ├── core/              # Logique métier
│   ├── generators/        # Générateurs HTML/PHP
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
│
├── appviews/              # Dossier des vues générées
│   ├── exports/           # Vues exportées (HTML/PHP/JSON)
│   ├── imports/           # Vues à importer
│   └── temp/              # Fichiers temporaires
│
├── components/            # Bibliothèque de composants
│   ├── atoms/            # Composants atomiques
│   ├── molecules/        # Composants composites
│   └── organisms/        # Composants complexes
│
└── templates/            # Templates prédéfinis
```

## 🌐 Déploiement Production

### XAMPP (Windows/Linux)

```bash
# 1. Exporter votre vue depuis le builder
# 2. Copier les fichiers
cp appviews/exports/*.html /path/to/xampp/htdocs/
cp appviews/exports/*.php /path/to/xampp/htdocs/

# 3. Accéder via
http://localhost/your-view.html
http://localhost/your-view.php
```

### Serveur Mutualisé

```bash
# 1. Via FTP/SFTP, uploader les fichiers exportés
# 2. Les fichiers fonctionnent immédiatement
# 3. Aucune configuration Node.js nécessaire
```

## 🔧 Configuration des Chemins

Le builder utilise des chemins relatifs portables. Le dossier `appviews/` peut être :
- Gardé dans `nexusg-pro/` pendant le développement
- Déplacé au niveau parent pour la production

Les chemins s'adaptent automatiquement.

## 📝 API PHP Générée

Les fichiers PHP exportés incluent :

```php
// Gestion d'API intégrée
if (isset($_GET['api'])) {
  handleApiRequest();
}

// Handlers de formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  handleFormSubmit();
}
```

### Exemple d'appel API depuis le frontend

```javascript
// JavaScript généré automatiquement
window.NexusGProPHP.apiCall('getData', { id: 123 })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## 🎨 Composants Disponibles

### Atoms (15)
Button, Input, Badge, Avatar, Switch, Checkbox, Select, Progress, Alert, Divider, Tag, Skeleton, IconBadge

### Molecules (14)
Card, Modal, Accordion, Tabs, Table, Pagination, SearchBox, Breadcrumbs, Toast, Tooltip, FeatureCard, PricingCard, StatsCard, Testimonial

### Organisms (8)
Hero, Navbar, FooterModern, CTASection, PricingTable, Carousel, HeaderBar, LogoCloud

## 🔄 Import/Export

### Exporter une Vue

```typescript
// Dans le builder
1. Cliquer sur "Export"
2. Choisir le format (HTML/PHP/JSON)
3. Le fichier se télécharge automatiquement
```

### Importer une Vue

```typescript
// Dans le builder
1. Cliquer sur "Import"
2. Sélectionner un fichier (.json, .html, .php)
3. La vue se charge dans le builder pour édition
```

## 🔐 Base de Données (Optionnel)

Une intégration Supabase est préparée pour :
- Sauvegarder les vues dans le cloud
- Versionner les modifications
- Partager entre développeurs

Configuration via `.env` (à créer) :
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Tests

```bash
npm run test
```

## 📚 Documentation Technique

### Générateur HTML

Le générateur HTML crée des fichiers standalone avec :
- Structure HTML5 sémantique
- CSS embarqué avec préfixage
- JavaScript vanilla pour les interactions
- Meta tags SEO optimisés

### Générateur PHP

Le générateur PHP produit :
- Code PHP 7.4+ compatible
- Helpers de rendu de composants
- API REST intégrée
- Gestion de formulaires
- Protection XSS automatique

### Chemins Relatifs

```typescript
// Le PathResolver gère automatiquement
const pathResolver = new PathResolver({
  appviewsPath: './appviews',      // Relatif
  componentsPath: './components',
  isRelative: true
});

// S'adapte si appviews est déplacé
// nexusg-pro/appviews → ./appviews
// parent/appviews → ../appviews
```

## 🎯 Cas d'Usage

### 1. Prototypage Rapide
Créez des interfaces visuellement, exportez en HTML pour démonstration client.

### 2. Sites Statiques
Générez des pages HTML complètes sans framework lourd.

### 3. Applications PHP
Exportez en PHP pour intégration avec bases de données existantes.

### 4. Landing Pages
Créez et déployez rapidement des landing pages optimisées.

### 5. Hébergement Mutualisé
Exportez pour serveurs sans Node.js (99% des hébergements web).

## 🛡️ Compatibilité

- ✅ XAMPP Windows
- ✅ XAMPP Linux
- ✅ MAMP (Mac)
- ✅ Serveurs mutualisés (OVH, 1&1, etc.)
- ✅ Apache 2.4+
- ✅ PHP 7.4+
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)

## 📄 License

MIT

## 👥 Contribution

Ce builder est conçu pour être extensible. Pour ajouter des composants :

1. Créer le composant dans `components/`
2. L'ajouter au registry dans `builder/core/ComponentRegistry.ts`
3. Le builder le détecte automatiquement

## 🆘 Support

Pour toute question ou problème, consultez les fichiers README dans :
- `builder/README.md` - Documentation du builder
- `appviews/README.md` - Documentation des exports

## 🎉 Fonctionnalités Avancées

- **Undo/Redo** : Historique complet des modifications
- **Drag & Drop** : Réorganisation intuitive des composants
- **Live Preview** : Aperçu en temps réel dans le canvas
- **Property Editor** : Éditeur de propriétés contextualisé
- **Style Editor** : Éditeur de styles inline ou par classes
- **Template System** : Sauvegarde de templates réutilisables
- **Version Control** : Intégration Git-friendly (export JSON)

## 🚀 Prochaines Étapes

1. Ouvrir le builder et explorer l'interface
2. Créer votre première vue
3. Exporter et déployer
4. Itérer et améliorer

**Bon développement avec NexusGPro !** 🎨✨
