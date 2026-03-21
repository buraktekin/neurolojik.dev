import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  // Production optimizations
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['react-helmet-async', 'dompurify'],
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging (disable in production if needed)
    sourcemap: false,
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
