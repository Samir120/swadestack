import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Animation library — heavy, only needed when animations render
          'vendor-framer': ['framer-motion'],
          // Lottie — heavy, only used for specific animations
          'vendor-lottie': ['lottie-react'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
