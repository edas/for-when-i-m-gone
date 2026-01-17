import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import yaml from '@modyfi/vite-plugin-yaml'

// https://vite.dev/config/
export default defineConfig({
  plugins: [yaml(), svelte(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
