import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Autonomous frontend development configuration
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3001, // Different port from parent application
    open: false,
    cors: true,
    host: '0.0.0.0',
  },

  // Build configuration for autonomous operation
  build: {
    outDir: 'dist-frontend',
    lib: {
      entry: resolve(__dirname, 'src/frontend/index.ts'),
      name: 'CVProcessingFrontend',
      formats: ['es', 'cjs'],
      fileName: (format) => `cv-processing-frontend.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'firebase'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          firebase: 'Firebase'
        },
        // Code splitting for optimal loading
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase'],
          utils: ['lodash']
        }
      }
    },
    // Performance optimization
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    // Bundle size analysis
    reportCompressedSize: true
  },

  // Path resolution for autonomous operation
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/frontend'),
      '@components': resolve(__dirname, 'src/frontend/components'),
      '@hooks': resolve(__dirname, 'src/frontend/hooks'),
      '@services': resolve(__dirname, 'src/frontend/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/shared/utils')
    }
  },

  // Environment variables
  define: {
    __CV_PROCESSING_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Optimization for development
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase']
  },

  // CSS processing
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
});