/**
 * Llama.cpp Provider - Local embeddings using llama.cpp directly
 * Uses native N-API module for better performance
 */

import { access, constants } from 'fs/promises';
import { join, resolve } from 'path';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { logger } from '@src/util/logger';
import * as http from 'http';

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

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      logger.debug(`Embedding text with llama.cpp: ${this.getModel()}`);
      
      const text = await this.readInput(input);
      if (!text.trim()) {
        throw new Error('Text input cannot be empty');
      }

      if (this.useNative && this.nativeModel) {
        // Use native module
        const embedding = this.nativeModel.embed(text);
        
        return {
          embedding,
          dimensions: embedding.length,
          model: this.getModel(),
          provider: 'llamacpp',
        };
      }

      // Fallback to HTTP
      const requestBody = {
        input: text,
        model: await this.getModelPath(),
        pooling: 'mean',
        normalize: 2
      };

      // Execute HTTP request to llama.cpp server
      const result = await this.executeLlamaEmbedding([JSON.stringify(requestBody)]);
      
      // Parse output to extract embedding
      const embedding = this.parseRawOutput(result.stdout);
      
      return {
        embedding,
        dimensions: embedding.length,
        model: this.getModel(),
        provider: 'llamacpp',
      };
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
      const requests = inputs.map(input => ({
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

  // Private helper methods
  private async getModelPath(): Promise<string> {
    // Try different model paths
    const possiblePaths = [
      this.modelPath, // As provided
      join('./llama.cpp/models', this.modelPath), // In llama.cpp/models
      join('./llama.cpp', this.modelPath), // In llama.cpp root
      this.modelPath // Fallback
    ];

    for (const path of possiblePaths) {
      try {
        await access(path, constants.F_OK);
        return resolve(path);
      } catch {
        continue;
      }
    }

    throw new Error(`Model file not found: ${this.modelPath}`);
  }

  private async executeLlamaEmbedding(args: string[]): Promise<{stdout: string; stderr: string}> {
    return new Promise((resolve, reject) => {
      // Use HTTP API instead of CLI for cleaner output
      const port = 8080; // Default llama.cpp server port
      
      // Parse the request body from args[0] (JSON string)
      let requestBody;
      try {
        requestBody = JSON.parse(args[0] || '{}');
      } catch {
        reject(new Error('Invalid request body for HTTP API'));
        return;
      }

      const postData = JSON.stringify(requestBody);

      const options = {
        hostname: 'localhost',
        port: port,
        path: '/embedding',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res: http.IncomingMessage) => {
        let data = '';
        
        res.on('data', (chunk: Buffer | string) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ stdout: data, stderr: '' });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(new Error(`Failed to connect to llama.cpp server: ${(error instanceof Error ? error.message : String(error))}`));
      });

      req.write(postData);
      req.end();
    });
  }

  private parseRawOutput(output: string): number[] {
    try {
      const response = JSON.parse(output);
      
      logger.debug(`PARSE DEBUG: Response type: ${typeof response}`);
      logger.debug(`PARSE DEBUG: Is Array: ${Array.isArray(response)}`);
      
      // CASE 1: Array of objects with nested embedding
      // Format: [{index: 0, embedding: [[...]]}]
      if (Array.isArray(response) && response.length > 0) {
        const first = response[0];
        
        if (first && first.embedding && Array.isArray(first.embedding)) {
          const emb = first.embedding;
          
          // Check if nested: [[...]]
          if (Array.isArray(emb[0])) {
            const flat = emb[0]; // ← Take the inner array
            logger.debug(`Parsed ${flat.length} dimensions (nested)`);
            return flat;
          }
          
          // Not nested: [...]
          logger.debug(`Parsed ${emb.length} dimensions (direct)`);
          return emb;
        }
      }
      
      // CASE 2: Direct object {embedding: [...]}
      if (response.embedding && Array.isArray(response.embedding)) {
        const emb = response.embedding;
        
        // Check nested
        if (Array.isArray(emb[0])) {
          return emb[0];
        }
        
        return emb;
      }
      
      // CASE 3: Direct array of numbers
      if (Array.isArray(response) && typeof response[0] === 'number') {
        logger.debug(`Parsed ${response.length} dimensions (flat array)`);
        return response;
      }
      
      throw new Error(`Unexpected format: ${JSON.stringify(Object.keys(response))}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Parse failed: ${errorMessage}`);
    }
  }

  private parseArrayOutput(output: string): number[][] {
    // Parse array format: [[val1,val2,...], [val1,val2,...], ...]
    const arrayPattern = /\[([^\]]+)\]/g;
    const matches = [...output.matchAll(arrayPattern)];
    
    if (matches.length === 0) {
      throw new Error('No array embeddings found in output');
    }

    const embeddings = matches.map(match => {
      const values = match[1]?.split(',').map(v => v.trim()) || [];
      return values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    }).filter(embedding => embedding.length > 0);

    return embeddings;
  }
}
