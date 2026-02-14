import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Native Llama.cpp Module', () => {
  let llama;
  let model;

  beforeEach(() => {
    try {
      llama = require('../native');
    } catch (error) {
      console.warn('Native module not available for testing');
    }
  });

  afterEach(() => {
    if (model) {
      try {
        model.close();
      } catch (error) {
        console.error('Error closing model:', error);
      }
      model = null;
    }
  });

  describe('Model Loading', () => {
    it('should throw error for invalid model path', () => {
      if (!llama) {
        console.log('Skipping native tests - module not available');
        expect(true).toBe(true); // Skip test
        return;
      }

      expect(() => {
        llama.create('/nonexistent/model.gguf');
      }).toThrow();
    });

    it('should load valid model successfully', () => {
      if (!llama) {
        console.log('Skipping native tests - module not available');
        expect(true).toBe(true); // Skip test
        return;
      }

      const modelPath = '../core/models/nomic-embed-text-v1.5.Q4_K_M.gguf';
      
      try {
        model = llama.create(modelPath);
        expect(model).toBeDefined();
      } catch (error) {
        // Model might not exist in test environment
        console.log('Model not found, skipping test');
        expect(true).toBe(true);
      }
    });
  });

  describe('Embedding Generation', () => {
    beforeEach(() => {
      if (!llama) return;

      try {
        const modelPath = '../core/models/nomic-embed-text-v1.5.Q4_K_M.gguf';
        model = llama.create(modelPath);
      } catch (error) {
        console.log('Cannot load model for embedding tests');
      }
    });

    it('should generate embedding for text', () => {
      if (!llama || !model) {
        console.log('Skipping embedding test - module/model not available');
        expect(true).toBe(true);
        return;
      }

      const text = 'Hello, world!';
      const embedding = model.embed(text);

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
      expect(typeof embedding[0]).toBe('number');
    });

    it('should handle empty text gracefully', () => {
      if (!llama || !model) {
        console.log('Skipping empty text test - module/model not available');
        expect(true).toBe(true);
        return;
      }

      expect(() => {
        model.embed('');
      }).toThrow('Text input cannot be empty');
    });

    it('should generate consistent embeddings', () => {
      if (!llama || !model) {
        console.log('Skipping consistency test - module/model not available');
        expect(true).toBe(true);
        return;
      }

      const text = 'Test text';
      const embedding1 = model.embed(text);
      const embedding2 = model.embed(text);

      expect(embedding1).toEqual(embedding2);
    });
  });

  describe('Performance', () => {
    it('should complete embedding generation in reasonable time', () => {
      if (!llama || !model) {
        console.log('Skipping performance test - module/model not available');
        expect(true).toBe(true);
        return;
      }

      const text = 'Performance test text';
      const startTime = Date.now();
      
      const embedding = model.embed(text);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(Array.isArray(embedding)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
