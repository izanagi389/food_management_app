import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    dir: 'tests',
    globals: true,
    reporters: 'default',
    coverage: {
      enabled: false
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
    }
  }
})


