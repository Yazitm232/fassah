
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import { resolve } from 'path'

  export default defineConfig({
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main:     resolve(__dirname, 'index.html'),
          app:      resolve(__dirname, 'app.html'),
          spaces:   resolve(__dirname, 'spaces.html'),
          about:    resolve(__dirname, 'about.html'),
          download: resolve(__dirname, 'download.html'),
        }
      }
    }
  })
