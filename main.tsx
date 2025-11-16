import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'

// Point d'entrée principal pour NexusG Pro
const App = () => {
  return (
    <div className="ng-container">
      <header className="ng-text-center ng-py-8">
        <h1 className="ng-text-4xl ng-font-bold ng-text-primary ng-mb-4">
          NexusG Pro
        </h1>
        <p className="ng-text-lg ng-text-secondary">
          Modern React 18 + TypeScript Component Library
        </p>
      </header>
      
      <main className="ng-py-8">
        <div className="ng-grid ng-grid-cols-1 ng-gap-6">
          <div className="ng-card ng-p-6">
            <h2 className="ng-text-2xl ng-font-semibold ng-mb-4">Features</h2>
            <ul className="ng-space-y-2">
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                52 components modernized with TypeScript
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Multi-format output (.php/.html/.css/.js)
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Mutualised hosting compatible
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Complete test suite (90%+ coverage)
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                WCAG accessibility compliance
              </li>
            </ul>
          </div>
          
          <div className="ng-card ng-p-6">
            <h2 className="ng-text-2xl ng-font-semibold ng-mb-4">Quick Start</h2>
            <p className="ng-mb-4">
              Install the library and start building modern UIs:
            </p>
            <pre className="ng-bg-surface ng-p-4 ng-rounded-md ng-text-sm">
              <code>
{`npm install nexusg-pro
import { Button, Card } from 'nexusg-pro'

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  )
}`}
              </code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)