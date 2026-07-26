import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  base: '/dev-satish/',
  plugins: [mdx(), react(), tailwindcss()],
});


// npm run deploy-build
// git add .
// git commit -m "Update site"
// git push

