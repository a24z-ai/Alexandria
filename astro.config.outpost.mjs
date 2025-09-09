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
  
  // Build for npm package distribution
  output: 'static',
  
  // Build to outpost-dist directory for the npm package
  outDir: './outpost-dist',
  
  // No base path needed for local serving
  base: '/',
  
  // Build optimizations handled by Astro defaults
});