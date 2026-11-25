import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Puerto fijo: es el que el backend habilita por CORS (la app de PelelaJS usa el 5174)
  server: {
    port: 5173,
    strictPort: true,
  },
})
