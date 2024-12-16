import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests to /mangadex to the MangaDex API
      '/mangadex': {
        target: 'https://api.mangadex.org', // Target base URL for MangaDex API
        changeOrigin: true, // Ensure the origin header is correctly set
        rewrite: (path) => path.replace(/^\/mangadex/, ''), // Remove the /mangadex prefix
        secure: false, // Set to true if using HTTPS and SSL validation is needed
      },
    },
  },
});