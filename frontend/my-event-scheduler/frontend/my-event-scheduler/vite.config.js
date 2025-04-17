import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    open: true, // Automatically open the page in your default browser
    allowedHosts: ['172.20.10.6', 'localhost', '127.0.0.1'],  // Add the local IP
  }, 
});
