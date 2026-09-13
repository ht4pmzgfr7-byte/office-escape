import { defineConfig } from 'vite';

// IMPORTANT: base must match your GitHub repository name for GitHub Pages
// e.g. if your repo is https://github.com/USERNAME/office-escape
// then base should be '/office-escape/'
export default defineConfig({
  base: '/office-escape/',
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
