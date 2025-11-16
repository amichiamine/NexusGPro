import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'builder': [
            './builder/components/Builder',
            './builder/core/ViewBuilder',
            './builder/core/ComponentRegistry'
          ]
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
