import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/dev-satish/',
  plugins: [react(), tailwindcss()],
});


// npm run deploy-build
// git add .
// git commit -m "Update site"
// git push

