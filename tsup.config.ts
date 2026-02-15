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
  // Copy native .node files to dist
  onSuccess: async () => {
    const fs = await import('fs/promises');
    try {
      await fs.copyFile('native/build/Release/llama_embedding.node', 'dist/llama_embedding.node');
      console.log('✅ Native .node file copied to dist/');
      
      // Copy native loader
      await fs.copyFile('src/native-loader.mjs', 'dist/native-loader.mjs');
      console.log('✅ Native loader copied to dist/');
    } catch (error) {
      console.error('❌ Failed to copy files:', error);
    }
  },
})
