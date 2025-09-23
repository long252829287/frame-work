import { fileURLToPath, URL } from 'node:url'
import Inspect from 'vite-plugin-inspect'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), Inspect()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'https://www.osheeep.com',
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
