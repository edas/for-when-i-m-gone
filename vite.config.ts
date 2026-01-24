import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import yaml from '@modyfi/vite-plugin-yaml'

// https://vite.dev/config/
export default defineConfig({
  plugins: [yaml(), react(), viteSingleFile()],
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
