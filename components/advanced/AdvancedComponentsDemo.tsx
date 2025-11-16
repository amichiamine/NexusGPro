import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';

// Import our advanced components
import {
  LoadingSpinner,
  SkeletonLoader,
  AnimatedCounter,
  ThemeProvider,
  ThemeToggle,
  VirtualScroller,
  OptimizedImage,
  AdvancedComponentsProvider,
  ANIMATION_CONFIG,
  COLOR_PALETTES,
} from '../index';

interface DemoComponentProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Composant de démonstration pour les composants avancés
 * Showcase complet de toutes les fonctionnalités de l'Option C.1
 */
const AdvancedComponentsDemo: React.FC = () => {
  const [demoData, setDemoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counters, setCounters] = useState({
    users: 1250,
    revenue: 45670,
    conversions: 234,
    time: 89,
  });

  // Generate demo data
  useEffect(() => {
    const generateData = () => {
      return Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Item ${i + 1}`,
        description: `Description for item ${i + 1}`,
        category: ['Technology', 'Business', 'Design', 'Marketing'][i % 4],
        priority: ['Low', 'Medium', 'High'][i % 3],
        date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      }));
    };
    setDemoData(generateData());
  }, []);

  // Simulate loading states
  const toggleLoading = () => setLoading(!loading);

  const DemoComponent: React.FC<DemoComponentProps> = ({ title, description, children, className }) => (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );

  const renderItem = (item: any, index: number) => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
              {item.category}
            </span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              item.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              item.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            )}>
              {item.priority}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{item.date}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 NexusG Lite - Composants Avancés
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Démonstration complète de l'Option C.1 : Animation ✨ | Thème Dynamique 🎨 | Performance ⚡
          </p>
          <ThemeToggle variant="dropdown" showLabels className="mb-8" />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Composants d'Animation */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              ✨ Composants d'Animation
            </h2>

            {/* Loading Spinners */}
            <DemoComponent
              title="Loading Spinners"
              description="Différentes variantes de spinners de chargement"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <LoadingSpinner size="sm" color="primary" text="Chargement..." />
                  <LoadingSpinner size="md" color="success" variant="dots" />
                  <LoadingSpinner size="lg" color="warning" variant="ring" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <LoadingSpinner size="md" color="danger" variant="bars" text="Erreur" />
                  <LoadingSpinner size="md" color="neutral" variant="spinner" />
                </div>
                <button 
                  onClick={toggleLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Toggle Loading
                </button>
              </div>
            </DemoComponent>

            {/* Skeleton Loaders */}
            <DemoComponent
              title="Skeleton Loaders"
              description="Placeholders élégants pendant le chargement"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <SkeletonLoader variant="card" className="h-48" />
                  <SkeletonLoader variant="text" lines={4} className="h-32" />
                  <SkeletonLoader variant="avatar" avatarSize="lg" className="h-32" />
                </div>
                <SkeletonLoader variant="list" lines={3} avatarSize="sm" className="h-40" />
              </div>
            </DemoComponent>

            {/* Animated Counters */}
            <DemoComponent
              title="Compteurs Animés"
              description="Animations fluides pour les statistiques"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    <AnimatedCounter
                      from={0}
                      to={counters.users}
                      duration={2000}
                      suffix=" utilisateurs"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    <AnimatedCounter
                      from={0}
                      to={counters.revenue}
                      duration={2500}
                      prefix="€"
                      decimals={0}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    <AnimatedCounter
                      from={0}
                      to={counters.conversions}
                      duration={1500}
                      suffix="% conversion"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    <AnimatedCounter
                      from={0}
                      to={counters.time}
                      duration={3000}
                      suffix="s"
                      format={(value) => `${Math.floor(value)} secondes`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => setCounters(prev => ({ ...prev, users: prev.users + 100 }))}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  +100 Users
                </button>
                <button 
                  onClick={() => setCounters(prev => ({ ...prev, revenue: prev.revenue + 1000 }))}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  +€1000 Revenue
                </button>
              </div>
            </DemoComponent>
          </div>

          {/* Thème Dynamique */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🎨 Thème Dynamique
            </h2>

            {/* Theme Toggle Variants */}
            <DemoComponent
              title="Theme Toggle Variants"
              description="Différentes variantes de basculement de thème"
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <ThemeToggle variant="icon" />
                  <ThemeToggle variant="button" showLabels />
                  <ThemeToggle variant="dropdown" />
                </div>
                <ThemeToggle variant="text" />
              </div>
            </DemoComponent>

            {/* Color Preview */}
            <DemoComponent
              title="Palette de Couleurs"
              description="Prévisualisation des couleurs du thème actif"
            >
              <div className="space-y-4">
                {Object.entries(COLOR_PALETTES.sunset.primary).slice(4, 8).map(([shade, color]) => (
                  <div key={shade} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono">{shade}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{color}</span>
                  </div>
                ))}
              </div>
            </DemoComponent>

            {/* Performance Components */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-8">
              ⚡ Composants de Performance
            </h2>

            {/* Virtual Scroller */}
            <DemoComponent
              title="Virtual Scroller"
              description="Rendu optimisé pour de grandes listes (1000 items)"
            >
              <div className="h-96">
                <VirtualScroller
                  items={demoData}
                  itemHeight={120}
                  containerHeight={384}
                  renderItem={renderItem}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg"
                />
              </div>
            </DemoComponent>

            {/* Optimized Images */}
            <DemoComponent
              title="Images Optimisées"
              description="Chargement intelligent avec placeholders"
            >
              <div className="grid grid-cols-3 gap-4">
                <OptimizedImage
                  src="https://picsum.photos/300/200?random=1"
                  alt="Demo image 1"
                  width={300}
                  height={200}
                  className="rounded-lg"
                  placeholder="Chargement..."
                />
                <OptimizedImage
                  src="https://picsum.photos/300/200?random=2"
                  alt="Demo image 2"
                  width={300}
                  height={200}
                  className="rounded-lg"
                />
                <OptimizedImage
                  src="https://picsum.photos/300/200?random=3"
                  alt="Demo image 3"
                  width={300}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </DemoComponent>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">📊 Statistiques de l'Option C.1</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">
                <AnimatedCounter from={0} to={10} duration={1000} />
              </div>
              <div className="text-sm opacity-90">Composants d'Animation</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                <AnimatedCounter from={0} to={5} duration={1200} />
              </div>
              <div className="text-sm opacity-90">Composants de Thème</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                <AnimatedCounter from={0} to={8} duration={1400} />
              </div>
              <div className="text-sm opacity-90">Composants Performance</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                <AnimatedCounter from={0} to={1000} duration={1600} />
              </div>
              <div className="text-sm opacity-90">Items Virtualisés</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper avec le provider
const AdvancedComponentsDemoWithProvider: React.FC = () => {
  return (
    <AdvancedComponentsProvider defaultTheme="auto">
      <AdvancedComponentsDemo />
    </AdvancedComponentsProvider>
  );
};

export default AdvancedComponentsDemoWithProvider;