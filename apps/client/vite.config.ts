import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'react-vendor'
          }

          if (id.includes('/@radix-ui/')) {
            return 'radix-ui'
          }

          if (id.includes('/@tanstack/')) {
            return 'query-vendor'
          }

          if (id.includes('/framer-motion/')) {
            return 'motion-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
