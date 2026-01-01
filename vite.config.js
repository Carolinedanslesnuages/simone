import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Relative base: the site works on GitHub Pages (/severine/) and locally.
export default defineConfig({ base: './', plugins: [vue()] });
