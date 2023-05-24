import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** @type {import('vite').UserConfig} */
// https://vitejs.dev/config/
export default defineConfig({
  // 指定运行环境为开发环境
  mode: 'development',
  // 入口文件
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2015',
    rollupOptions: {
      // 更改js文件扩展名
      input: 'src/main.js',
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'index.js',
        assetFileNames: 'index.[ext]',
        format: 'es',
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy 是 'http-proxy' 的实例
        }
      },
    },
    port: 2222,
    open: true,
    cors: true,
  }
})
