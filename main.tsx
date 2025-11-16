import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import { Builder } from './builder'

const App = () => {
  const [showBuilder, setShowBuilder] = useState(false)

  if (showBuilder) {
    return <Builder />
  }

  return (
    <div className="ng-container">
      <header className="ng-text-center ng-py-8">
        <h1 className="ng-text-4xl ng-font-bold ng-text-primary ng-mb-4">
          NexusGPro
        </h1>
        <p className="ng-text-lg ng-text-secondary">
          Modern React 18 + TypeScript Component Library & Visual Builder
        </p>
      </header>

      <main className="ng-py-8">
        <div className="ng-grid ng-grid-cols-1 ng-gap-6">
          <div className="ng-card ng-p-6">
            <h2 className="ng-text-2xl ng-font-semibold ng-mb-4">Visual Builder</h2>
            <p className="ng-mb-4">
              Create views visually with drag-and-drop interface. Export to HTML/PHP for production deployment.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              Open Builder
            </button>
          </div>

          <div className="ng-card ng-p-6">
            <h2 className="ng-text-2xl ng-font-semibold ng-mb-4">Features</h2>
            <ul className="ng-space-y-2">
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                66+ components with TypeScript
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Visual drag-and-drop builder
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Export to HTML/PHP/JSON
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Import existing views
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                Portable & XAMPP compatible
              </li>
              <li className="ng-flex ng-items-center">
                <span className="ng-w-2 ng-h-2 ng-bg-success ng-rounded-full ng-mr-3"></span>
                No Node.js required in production
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)