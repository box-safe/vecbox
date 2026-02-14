import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    isolate: false
  },
  resolve: {
    alias: {
      '@': './',
      '@src': './src',
      '@providers': './src/providers'  // ← Adiciona isso
    }
  }
});