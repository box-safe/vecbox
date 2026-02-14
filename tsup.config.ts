import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  splitting: false,
  minify: false,
  tsconfig: './tsconfig.json',
})
