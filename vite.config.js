import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitesOutput } from './build/sites-vite-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitesOutput()],
  base: '/metest/',
})
