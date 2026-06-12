import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Read VITE_* vars from the monorepo root .env
  envDir: '../..',
  server: { host: true, port: 5174, strictPort: true },
});
