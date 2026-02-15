import { access, constants } from 'fs/promises';
import { join, resolve } from 'path';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { logger } from '@src/util/logger';
import * as http from 'http';

/**
 * Llama.cpp Provider - Local embeddings using llama.cpp directly
 * Uses native N-API module for better performance
 */

// Try to import native module
let nativeModule: any = null;
try {
  nativeModule = require('../../native');
  logger.info('Using native Llama.cpp module');
} catch (error) {
  logger.warn('Native module not available, falling back to HTTP');
}

// Extend EmbedConfig to include llamaPath
interface LlamaCppConfig extends EmbedConfig {
  llamaPath?: string;
}

export class LlamaCppProvider extends EmbeddingProvider {
  private llamaPath: string;
  private modelPath: string;
  private useNative: boolean;
  private nativeModel: any = null;

  constructor(config: LlamaCppConfig) {
    super({ ...config, provider: 'llamacpp' });
    this.modelPath = config.model || 'nomic-embed-text-v1.5.Q4_K_M.gguf';
    this.llamaPath = config.llamaPath || './llama.cpp/build/bin/llama-embedding';
    this.useNative = !!nativeModule;
    
    if (this.useNative) {
      try {
        this.nativeModel = nativeModule.create(this.modelPath);
        logger.info(`Llama.cpp provider initialized with native module: ${this.modelPath}`);
      } catch (error) {
        logger.error(`Failed to initialize native module: ${error}`);
        this.useNative = false;
      }
    } else {
      logger.info(`Llama.cpp provider initialized with HTTP fallback: ${this.modelPath}`);
    }
  }

  // Public API methods
  getProviderName(): string {
    return 'Llama.cpp';
  }

  getDimensions(): number {
    // Known dimensions for common models
    const model = this.getModel();
    if (model.includes('nomic-embed-text-v1.5')) return 768;
    if (model.includes('nomic-embed-text-v1')) return 768;
    if (model.includes('all-MiniLM-L6-v2')) return 384;
    if (model.includes('bge-base')) return 768;
    if (model.includes('bert-base')) return 768;
    return 768; // default
  }

  async isReady(): Promise<boolean> {
    try {
      if (this.useNative && this.nativeModel) {
        // Native module is ready if model was loaded successfully
        return true;
      }
      
      // Fallback to HTTP check
      await access(this.llamaPath, constants.F_OK);
      await access(this.llamaPath, constants.X_OK);
      
      // Check if model file exists
      const modelPath = await this.getModelPath();
      await access(modelPath, constants.F_OK);
      
      logger.debug('Llama.cpp provider is ready');
      return true;
    } catch (error: unknown) {
      logger.error(`Llama.cpp readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
      return false;
    }
  }

  private async loadGGUFModel(modelPath: string): Promise<Buffer> {
    try {
      logger.debug(`Loading GGUF model from: ${modelPath}`);
      
      // Read model file
      const modelBuffer = await fs.readFile(modelPath);
      
      if (!modelBuffer) {
        throw new Error(`Failed to read model file: ${modelPath}`);
      }
      
      logger.debug(`Model file loaded, size: ${modelBuffer.length} bytes`);
      return modelBuffer;
    } catch (error) {
      logger.error(`Failed to load GGUF model: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private generateEmbedding(modelBuffer: Buffer, text: string): number[] {
    // Use the loaded model to generate embedding
    logger.debug(`Generating embedding with model buffer (${modelBuffer.length} bytes)`);
    
    // TODO: Implement actual Llama.cpp embedding generation
    // For now, return mock embedding based on text length
    const embedding = [];
    for (let i = 0; i < Math.min(text.length, 768); i++) {
      embedding.push(Math.sin(i * 0.1) * (i % 10));
    }
    
    return embedding;
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      logger.debug(`Embedding text with llama.cpp: ${this.getModel()}`);
      
      const text = await this.readInput(input);
      if (!text.trim()) {
        throw new Error('Text input cannot be empty');
      }

      // Use native module for now
      if (this.useNative && this.nativeModel) {
        const embedding = this.nativeModel.embed(text);
        
        return {
          embedding,
          dimensions: embedding.length,
          model: this.getModel(),
          provider: 'llamacpp',
        };
      }

      // TODO: Implement direct Llama.cpp core usage in future
      throw new Error('Direct Llama.cpp core integration not yet implemented. Please use HTTP fallback or wait for next version.');
    } catch (error: unknown) {
      logger.error(`Llama.cpp embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      logger.debug(`Batch embedding ${inputs.length} texts with llama.cpp`);
      
      if (this.useNative && this.nativeModel) {
        // Use native module for batch
        const embeddings: number[][] = [];
        
        for (const input of inputs) {
          const text = await this.readInput(input);
          if (text.trim()) {
            const embedding = this.nativeModel.embed(text);
            embeddings.push(embedding);
          }
        }
        
        if (embeddings.length === 0) {
          throw new Error('No valid texts to embed');
        }
        
        return {
          embeddings,
          dimensions: embeddings[0]?.length || 0,
          model: this.getModel(),
          provider: 'llamacpp',
        };
      }

      // Fallback to HTTP batch processing
      const texts = [];
      for (const input of inputs) {
        const text = await this.readInput(input);
        if (text.trim()) {
          texts.push(text);
        }
      }
      
      if (texts.length === 0) {
        throw new Error('No valid texts to embed');
      }

      // For batch processing, use HTTP API
      const modelPath = await this.getModelPath();
      const requests = inputs.map((input, v) => ({
        input: input.text || '',
        model: modelPath,
        pooling: 'mean',
        normalize: 2
      }));

      // Execute batch requests (for now, do individual requests)
      const embeddings: number[][] = [];
      for (const request of requests) {
        const result = await this.executeLlamaEmbedding([JSON.stringify(request)]);
        const embedding = this.parseRawOutput(result.stdout);
        embeddings.push(embedding);
      }
      
      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: this.getModel(),
        provider: 'llamacpp',
      };
    } catch (error: unknown) {
      logger.error(`Llama.cpp batch embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    if (this.useNative && this.nativeModel) {
      try {
        this.nativeModel.close();
        this.nativeModel = null;
        logger.info('Native Llama.cpp model closed');
      } catch (error) {
        logger.error(`Error closing native model: ${error}`);
      }
    }
  }

  // Protected methods
  protected getModel(): string {
    return this.modelPath;
  }
}
