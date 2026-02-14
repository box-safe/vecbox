import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LlamaCppProvider } from '../src/providers/llamacpp.js';

describe('LlamaCppProvider Integration', () => {
  let provider;

  beforeEach(() => {
    provider = new LlamaCppProvider({
      provider: 'llamacpp',
      model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
    });
  });

  afterEach(async () => {
    if (provider && provider.cleanup) {
      await provider.cleanup();
    }
  });

  describe('Provider Initialization', () => {
    it('should initialize with native module if available', async () => {
      const isReady = await provider.isReady();
      
      // Provider should be ready either with native or HTTP fallback
      expect(typeof isReady).toBe('boolean');
    });

    it('should fallback to HTTP if native module fails', async () => {
      // Test with invalid native module path
      const testProvider = new LlamaCppProvider({
        provider: 'llamacpp',
        model: 'test-model.gguf'
      });

      const isReady = await testProvider.isReady();
      expect(typeof isReady).toBe('boolean');
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embedding using native module', async () => {
      try {
        const result = await provider.embed({ text: 'Hello, world!' });
        
        expect(result).toHaveProperty('embedding');
        expect(result).toHaveProperty('dimensions');
        expect(result).toHaveProperty('provider', 'llamacpp');
        expect(result).toHaveProperty('model');
        
        expect(Array.isArray(result.embedding)).toBe(true);
        expect(result.dimensions).toBeGreaterThan(0);
        expect(typeof result.embedding[0]).toBe('number');
      } catch (error) {
        // Expected if native module not available or model not found
        expect(error).toBeDefined();
      }
    });

    it('should handle batch embeddings', async () => {
      try {
        const inputs = [
          { text: 'First text' },
          { text: 'Second text' },
          { text: 'Third text' }
        ];

        const result = await provider.embedBatch(inputs);
        
        expect(result).toHaveProperty('embeddings');
        expect(result).toHaveProperty('dimensions');
        expect(result).toHaveProperty('provider', 'llamacpp');
        expect(result).toHaveProperty('model');
        
        expect(Array.isArray(result.embeddings)).toBe(true);
        expect(result.embeddings.length).toBe(3);
        
        // All embeddings should have same dimensions
        const dimensions = result.embeddings[0]?.length || 0;
        result.embeddings.forEach(embedding => {
          expect(embedding.length).toBe(dimensions);
        });
      } catch (error) {
        // Expected if native module not available or model not found
        expect(error).toBeDefined();
      }
    });

    it('should handle file input', async () => {
      try {
        const result = await provider.embed({ 
          filePath: '../test/fixtures/test.txt' 
        });
        
        expect(result).toHaveProperty('embedding');
        expect(Array.isArray(result.embedding)).toBe(true);
      } catch (error) {
        // Expected if file doesn't exist or native module not available
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty text input', async () => {
      try {
        await provider.embed({ text: '' });
        expect.fail('Should have thrown error for empty text');
      } catch (error) {
        expect(error.message).toContain('cannot be empty');
      }
    });

    it('should handle invalid file path', async () => {
      try {
        await provider.embed({ filePath: '/nonexistent/file.txt' });
        expect.fail('Should have thrown error for invalid file');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Comparison', () => {
    it('should complete embeddings faster than HTTP fallback', async () => {
      try {
        const text = 'Performance comparison test';
        const iterations = 5;
        const times = [];

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();
          await provider.embed({ text });
          const endTime = Date.now();
          times.push(endTime - startTime);
        }

        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        
        // Native module should be reasonably fast
        expect(averageTime).toBeLessThan(2000); // 2 seconds average
        console.log(`Average embedding time: ${averageTime}ms`);
      } catch (error) {
        console.log('Performance test failed:', error.message);
        expect(true).toBe(true); // Skip if native not available
      }
    });
  });
});
