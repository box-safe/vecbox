import { access, constants } from 'fs/promises';
import { join, resolve } from 'path';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { logger } from '@src/util/logger';
import * as fs from 'fs';
import { PATHS } from './paths';

// HTTP client for fallback
import { HttpClient } from '../util/http-client';

/**
 * Llama.cpp Provider - Local embeddings using llama.cpp directly
 * Uses native N-API module for better performance
 */

// Try to import native module
let nativeModule: any = null;

// Extend EmbedConfig to include llamaPath and httpEndpoint
interface LlamaCppConfig extends EmbedConfig {
  llamaPath?: string;
  httpEndpoint?: string;
  model?: string; // Allow model override
}

export class LlamaCppProvider extends EmbeddingProvider {
  private llamaPath: string;
  private modelPath: string;
  private useNative: boolean;
  private nativeModel: any = null;
  private useHttpFallback: boolean = false;
  private httpEndpoint?: string;
  private httpClient: HttpClient;

  constructor(config: LlamaCppConfig) {
    super({ ...config, provider: 'llamacpp' });
    this.modelPath = config.model || 'nomic-embed-text-v1.5.Q4_K_M.gguf';
    this.llamaPath = config.llamaPath || PATHS.DEFAULT_LLAMA_PATH;
    this.useNative = !!nativeModule;
    this.httpEndpoint = config.httpEndpoint;
    this.httpClient = new HttpClient();
    
    // Initialize native module asynchronously
    this.initializeNativeModule();
  }

  private async initializeNativeModule(): Promise<void> {
    try {
      // Try different paths for native module
      const possiblePaths = PATHS.NATIVE_MODULE_PATHS;
      
      logger.debug('Loading native module');
      
      for (const path of possiblePaths) {
        try {
        // Use native wrapper for .node files
          let module;
          if (path.endsWith('.node')) {
            // Import the ES module wrapper
            console.log('🔧 Loading native wrapper...');
            module = await import('../native-wrapper.mjs');
            module = module.default || module;
            console.log('📦 Native wrapper loaded:', module ? 'success' : 'failed');
            if (module) {
              console.log('🔍 Available methods:', Object.getOwnPropertyNames(module));
            }
          } else {
            // Use dynamic import for ES modules
            module = await import(path);
          }
          
          if (module.default || module) {
            nativeModule = module.default || module;
            this.useNative = !!nativeModule;
            logger.info(`Using native Llama.cpp module from: ${path}`);
            
            // Initialize native model
            try {
              this.nativeModel = nativeModule.createModel(this.modelPath);
              logger.info(`Llama.cpp provider initialized with native module: ${this.modelPath}`);
            } catch (error) {
              logger.error(`Failed to initialize native module: ${error}`);
              logger.error(`Error type: ${typeof error}`);
              logger.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);
              logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
              this.useNative = false;
              this.nativeModel = null;
            }
            return;
          }
        } catch (e) {
          console.log(`❌ Failed to load from ${path}: ${e}`);
          logger.debug(`Failed to load native module from ${path}: ${e}`);
          // Continue to next path
        }
      }
      
      if (!nativeModule && !this.httpEndpoint) {
        logger.warn('Native module not available and no HTTP endpoint configured');
        logger.info(`Llama.cpp provider requires either native module or HTTP endpoint: ${this.modelPath}`);
      } else if (this.httpEndpoint) {
        this.useHttpFallback = true;
        logger.info(`Llama.cpp provider initialized with HTTP fallback: ${this.httpEndpoint}`);
      }
    } catch (error) {
      if (this.httpEndpoint) {
        this.useHttpFallback = true;
        logger.info(`Llama.cpp provider initialized with HTTP fallback: ${this.httpEndpoint}`);
      } else {
        logger.warn('Native module not available and no HTTP endpoint configured');
        logger.info(`Llama.cpp provider requires either native module or HTTP endpoint: ${this.modelPath}`);
      }
    }
  }

  // Public API methods
  getProviderName(): string {
    return 'Llama.cpp';
  }

  getDimensions(): number {
    // Known dimensions for common models
    const model = this.getModel();
    switch(true) {
      case model.includes('nomic-embed-text-v1.5'):
        return 768;
      case model.includes('nomic-embed-text-v1'):
        return 768;
      case model.includes('all-MiniLM-L6-v2'):
        return 384;
      case model.includes('bge-base'):
        return 768;
      case model.includes('bert-base'):
        return 768;
      default:
        return 768;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      logger.debug('Llama.cpp readiness check');
      
      // If we have a native model, we're ready
      if (this.nativeModel) {
        logger.debug('Native module ready');
        return true;
      }
      
      // Check HTTP fallback
      if (this.useHttpFallback && this.httpEndpoint) {
        logger.debug('Checking HTTP endpoint health');
        const isHealthy = await this.httpClient.healthCheck(`${this.httpEndpoint}/health`);
        if (isHealthy) {
          logger.debug('HTTP endpoint ready');
          return true;
        }
      }
      
      // Fallback to binary check
      logger.debug('Checking llamaPath binary');
      await access(this.llamaPath, constants.F_OK);
      await access(this.llamaPath, constants.X_OK);
      
      // Check if model file exists
      const modelPath = await this.getModelPath();
      await access(modelPath, constants.F_OK);
      
      logger.debug('Llama.cpp provider is ready');
      return true;
    } catch (error: unknown) {
      logger.debug(`Llama.cpp readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
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

      // Try native module first
      if (this.useNative && this.nativeModel) {
        return await this.embedWithNative(text);
      }

      // Fallback to HTTP
      if (this.useHttpFallback && this.httpEndpoint) {
        return await this.embedWithHttp(text);
      }

      throw new Error('Llama.cpp provider requires either native module or HTTP endpoint. None available.');
    } catch (error: unknown) {
      logger.error(`Llama.cpp embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  private async embedWithNative(text: string): Promise<EmbedResult> {
    const modelRef = this.nativeModel;
    const embedding = nativeModule.getEmbedding(modelRef, text);
    
    // Validate embedding
    if (!Array.isArray(embedding) && !(embedding instanceof Float32Array)) {
      throw new Error('Native module returned invalid embedding type');
    }
    
    if (embedding.length === 0) {
      throw new Error('Native module returned empty embedding');
    }
    
    if (embedding.length !== this.getDimensions()) {
      throw new Error(`Embedding dimension mismatch: expected ${this.getDimensions()}, got ${embedding.length}`);
    }
    
    return {
      embedding: Array.from(embedding),
      dimensions: embedding.length,
      model: this.getModel(),
      provider: 'llamacpp',
    };
  }

  private async embedWithHttp(text: string): Promise<EmbedResult> {
    if (!this.httpEndpoint) {
      throw new Error('HTTP endpoint not configured');
    }

    const payload = {
      model: this.getModel(),
      input: text,
      normalize: true,
    };

    const response = await this.httpClient.post(`${this.httpEndpoint}/embeddings`, payload);
    
    // Validate response
    if (!response.embeddings || !Array.isArray(response.embeddings)) {
      throw new Error('Invalid response from HTTP endpoint');
    }
    
    const embedding = response.embeddings[0];
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding from HTTP endpoint');
    }
    
    if (embedding.length !== this.getDimensions()) {
      throw new Error(`Embedding dimension mismatch: expected ${this.getDimensions()}, got ${embedding.length}`);
    }
    
    return {
      embedding,
      dimensions: embedding.length,
      model: this.getModel(),
      provider: 'llamacpp',
    };
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      logger.debug(`Batch embedding ${inputs.length} texts with llama.cpp`);
      
      // Try native module first
      if (this.useNative && this.nativeModel) {
        return await this.embedBatchWithNative(inputs);
      }

      // Fallback to HTTP
      if (this.useHttpFallback && this.httpEndpoint) {
        return await this.embedBatchWithHttp(inputs);
      }

      throw new Error('Llama.cpp provider requires either native module or HTTP endpoint. None available.');
    } catch (error: unknown) {
      logger.error(`Llama.cpp batch embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  private async embedBatchWithNative(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    const embeddings: number[][] = [];
    
    for (const input of inputs) {
      const text = await this.readInput(input);
      if (text.trim()) {
        const modelRef = this.nativeModel;
        const embedding = nativeModule.getEmbedding(modelRef, text);
        
        // Validate each embedding
        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error('Native module returned invalid embedding');
        }
        
        if (embedding.length !== this.getDimensions()) {
          throw new Error(`Embedding dimension mismatch: expected ${this.getDimensions()}, got ${embedding.length}`);
        }
        
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

  private async embedBatchWithHttp(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    if (!this.httpEndpoint) {
      throw new Error('HTTP endpoint not configured');
    }

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

    const payload = {
      model: this.getModel(),
      input: texts,
      normalize: true,
    };

    const response = await this.httpClient.post('/embeddings', payload);
    
    // Validate response
    if (!response.embeddings || !Array.isArray(response.embeddings)) {
      throw new Error('Invalid response from HTTP endpoint');
    }
    
    const embeddings = response.embeddings;
    if (embeddings.length === 0) {
      throw new Error('No embeddings returned from HTTP endpoint');
    }
    
    // Validate each embedding
    for (const embedding of embeddings) {
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding from HTTP endpoint');
      }
      
      if (embedding.length !== this.getDimensions()) {
        throw new Error(`Embedding dimension mismatch: expected ${this.getDimensions()}, got ${embedding.length}`);
      }
    }
    
    return {
      embeddings,
      dimensions: embeddings[0]?.length || 0,
      model: this.getModel(),
      provider: 'llamacpp',
    };
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

  private async getModelPath(): Promise<string> {
    // If modelPath is already absolute, return as-is
    if (this.modelPath.startsWith('/') || this.modelPath.startsWith('./')) {
      return this.modelPath;
    }
    
    // Get package directory dynamically
    const packageDir = this.getPackageDirectory();
    logger.debug('Resolving model paths');
    
    // Try to resolve model path using constants
    const possiblePaths: string[] = [];
    for (const pathFn of PATHS.MODEL_SEARCH_PATHS) {
      if (pathFn.length === 1) {
        possiblePaths.push((pathFn as (modelPath: string) => string)(this.modelPath));
      } else {
        possiblePaths.push((pathFn as (modelPath: string, packageDir: string) => string)(this.modelPath, packageDir));
      }
    }
    
    for (const path of possiblePaths) {
      try {
        await access(path, constants.F_OK);
        logger.debug(`Found model at: ${path}`);
        return path;
      } catch (e) {
        // Continue to next path
      }
    }
    
    // Return original path if none found (will fail later with proper error)
    logger.debug(`Model not found, returning original path: ${this.modelPath}`);
    return this.modelPath;
  }

  private getPackageDirectory(): string {
    try {
      // Try to get package directory from current module
      const moduleUrl = new URL('.', import.meta.url);
      let pkgDir: string = moduleUrl.pathname;
      logger.debug(`Initial module URL: ${moduleUrl.pathname}`);
      
      // Check if we're in a development environment (dist folder)
      logger.debug('Development environment detected');
      if (pkgDir.endsWith('/dist') || pkgDir.endsWith('/dist/')) {
        logger.debug('Searching for installed package');
        // We're in development, need to find the actual installed package
        
        // Try to find the installed package
        const possiblePaths = PATHS.NODE_MODULES_PATHS;
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(join(possiblePath, 'package.json'))) {
            logger.debug(`Found installed package at: ${possiblePath}`);
            return possiblePath;
          }
        }
      }

      // If we're in a pnpm structure, go up to find the actual vecbox package
      if (pkgDir.includes('.pnpm')) {
        logger.debug('PNPM structure detected');
        // We're in a pnpm symlinked structure, need to find the actual package
        const segments = pkgDir.split('/node_modules/.pnpm/');
        if (segments.length > 1) {
          // Find the vecbox package in the pnpm structure
          const pnpmBase = segments[0] + '/node_modules/.pnpm/';
          const vecboxDirs = (fs.readdirSync(pnpmBase) as string[])
            .filter((dir: string) => dir.startsWith('vecbox@'))
            .map((dir: string) => join(pnpmBase, dir, 'node_modules/vecbox'))
            .filter((dir: string) => fs.existsSync(join(dir, 'package.json')));
          
          logger.debug(`Found vecbox directories: ${vecboxDirs.join(', ')}`);
          
          if (vecboxDirs.length > 0) {
            pkgDir = vecboxDirs[0] || pkgDir;
            logger.debug(`Using pnpm vecbox directory: ${pkgDir}`);
          }
        }
      }
      
      logger.debug(`Final package directory: ${pkgDir}`);
      return pkgDir;
    } catch (error) {
      logger.debug('Package directory resolution failed');
      // Fallback: try common node_modules locations
      
      const possiblePaths = PATHS.NODE_MODULES_PATHS;
      
      logger.debug('Trying fallback node_modules paths');
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(join(possiblePath, 'package.json'))) {
          logger.debug(`Using fallback path: ${possiblePath}`);
          return possiblePath;
        }
      }
      
      // Final fallback: use current directory
      logger.debug('Using current directory as final fallback');
      return process.cwd();
    }
  }
}
