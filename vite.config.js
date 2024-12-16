// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mangadex': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        secure: true,
        // Transparent proxy to avoid adding `Via` header
        ws: true,
        rewrite: (path) => path.replace(/^\/mangadex/, ''),
        // Ensure no Via header is added
        configure: (proxy, options) => {
          // Optionally, you could modify the request here to strip the `Via` header if needed
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.removeHeader('Via');
          });
        }
      }
    }
  }
});