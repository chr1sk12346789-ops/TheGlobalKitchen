import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rezept: resolve(__dirname, 'rezept.html'),
        ukraine: resolve(__dirname, 'ukraine.html'),
      },
    },
  },
});