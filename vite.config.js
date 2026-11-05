import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkMdxImages from 'remark-mdx-images';

export default defineConfig({
  base: '/dev-satish/',
  // remark-gfm: tables, strikethrough; remark-mdx-images: `![](./img.png)` next to the post just works
  plugins: [mdx({ remarkPlugins: [remarkGfm, remarkMdxImages] }), react(), tailwindcss()],
  // three.js + three-vrm live in their own lazily-loaded chunk (~210 KB gzipped)
  build: { chunkSizeWarningLimit: 900 },
});


// npm run deploy-build
// git add .
// git commit -m "Update site"
// git push
