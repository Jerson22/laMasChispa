import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
   plugins: [
      react(),
      tailwindcss(),
   ],
   root: 'src/public',
   server: {
      host: true,
      proxy: {
         '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
         },
         '/auth': {
            target: 'http://localhost:3000',
            changeOrigin: true,
         },
         '/db-test': {
            target: 'http://localhost:3000',
            changeOrigin: true,
         }
      }
   }
})