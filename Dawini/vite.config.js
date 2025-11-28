import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1000, // Augmente la limite d'avertissement à 1000 KB (par défaut 500 KB)
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les grandes dépendances dans des chunks séparés
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['leaflet']
        }
      }
    }
  }
})
