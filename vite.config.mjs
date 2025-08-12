import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import viteCompression from 'vite-plugin-compression';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: './',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    vue(),
    viteCompression({
      verbose: true,
      disable: false,
      deleteOriginFile: false,
      threshold: 5120,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: './auto-import.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      comp: path.resolve(__dirname, 'src/components'),
      img: path.resolve(__dirname, 'src/static'),
    },
  },
  server: {
    proxy: {
      '/lyl/': {
        target: 'http://www.osheeep.com',
        changeOrigin: true,
        configure: (proxy, options) => {},
      },
    },
    port: 611,
    open: true,
    cors: true,
  },
});

