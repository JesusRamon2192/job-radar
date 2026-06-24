import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["vacantes.jesusmalo.org"],
    proxy: {
      '/jobs': 'http://backend:8000',
      '/health': 'http://backend:8000',
      '/refresh': 'http://backend:8000',
      '/api': 'http://backend:8000'
    }
  }
})
