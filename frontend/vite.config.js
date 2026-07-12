import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // MUI core + icons (largest chunk)
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-mui-icons': ['@mui/icons-material'],
          // Routing & data fetching
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          // DnD + file handling
          'vendor-dnd': ['@hello-pangea/dnd'],
          'vendor-dropzone': ['react-dropzone'],
          // Charts & utilities
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'dayjs', 'react-hot-toast'],
        },
      },
    },
  },
});
