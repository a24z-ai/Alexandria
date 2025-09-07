// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  
  vite: {
    plugins: [tailwindcss()]
  },
  
  // For GitHub Pages deployment
  site: 'https://a24z-ai.github.io',
  base: '/alexandria',
  
  // For Vercel, Netlify, Cloudflare - no changes needed
  // They auto-detect Astro projects
});