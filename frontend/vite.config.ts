import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3003,
    host: true,
    proxy: {
      // Proxy Stacks API to avoid CORS in browser
      '/stacks-api': {
        target: 'https://api.testnet.hiro.so',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/stacks-api/, ''),
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})
