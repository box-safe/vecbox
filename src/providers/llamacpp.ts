import { access, constants, readFile as fsReadFile } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { logger } from '@src/util/logger';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Llama.cpp Provider - Local embeddings using llama.cpp directly
 * Uses native N-API module for better performance
 */

// Try to import native module
let nativeModule: any = null;

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
    
    // Initialize native module asynchronously
    this.initializeNativeModule();
  }

  private async initializeNativeModule(): Promise<void> {
    try {
      // Try different paths for native module
      const possiblePaths = [
        // Try the native loader
        './native-loader.mjs',
        'vecbox/native-loader.mjs',
        process.cwd() + '/node_modules/vecbox/native-loader.mjs'
      ];
      
      logger.debug(`Trying to load native module from paths: ${possiblePaths.join(', ')}`);
      
      for (const path of possiblePaths) {
        try {
          // Use dynamic import for ES modules
          const module = await import(path);
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
              this.useNative = false;
              this.nativeModel = null;
            }
            return;
          }
        } catch (e) {
          logger.debug(`Failed to load native module from ${path}: ${e}`);
          // Continue to next path
        }
      }
      
      if (!nativeModule) {
        logger.warn('Native module not available, falling back to HTTP');
        logger.info(`Llama.cpp provider initialized with HTTP fallback: ${this.modelPath}`);
      }
    } catch (error) {
      logger.warn('Native module not available, falling back to HTTP');
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
      logger.debug(`Llama.cpp isReady check - useNative: ${this.useNative}, hasNativeModel: ${!!this.nativeModel}`);
      
      if (this.useNative && this.nativeModel) {
        // Native module is ready if model was loaded successfully
        logger.debug('Native module ready, returning true');
        return true;
      }
      
      // Fallback to HTTP check
      logger.debug(`Checking llamaPath: ${this.llamaPath}`);
      await access(this.llamaPath, constants.F_OK);
      await access(this.llamaPath, constants.X_OK);
      logger.debug('llamaPath accessible');
      
      // Check if model file exists
      const modelPath = await this.getModelPath();
      logger.debug(`Got modelPath: ${modelPath}`);
      await access(modelPath, constants.F_OK);
      logger.debug('Model file accessible');
      
      logger.debug('Llama.cpp provider is ready');
      return true;
    } catch (error: unknown) {
      logger.error(`Llama.cpp readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
      return false;
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
        // Store the model reference for cleanup
        const modelRef = this.nativeModel;
        
        // Use the native module functions directly with the model reference
        // NOTE: C++ expects (modelPtr, text) but we're passing (text, modelRef)
        const embedding = nativeModule.getEmbedding(modelRef, text);
        
        return {
          embedding,
          dimensions: embedding.length,
          model: this.getModel(),
          provider: 'llamacpp',
        };
      }

      // Fallback: return error if native module not available
      throw new Error('Direct Llama.cpp integration requires native module. Please ensure native module is properly compiled.');
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

      // Fallback: return error if native module not available
      throw new Error('Direct Llama.cpp integration requires native module. Please ensure native module is properly compiled.');
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

  private async getModelPath(): Promise<string> {
    // If modelPath is already absolute, return as-is
    if (this.modelPath.startsWith('/') || this.modelPath.startsWith('./')) {
      return this.modelPath;
    }
    
    // Get package directory dynamically
    const packageDir = this.getPackageDirectory();
    logger.debug(`Package directory resolved to: ${packageDir}`);
    
    // Try to resolve model path with multiple strategies
    const possiblePaths = [
      resolve(this.modelPath),                    // Current directory
      join('core/models', this.modelPath),       // core/models subdirectory
      join('models', this.modelPath),            // models subdirectory
      join(packageDir, 'core/models', this.modelPath),  // Package installation
      join(packageDir, 'models', this.modelPath),      // Package models
    ];
    
    logger.debug(`Trying paths: ${possiblePaths.join(', ')}`);
    
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
      logger.debug(`Checking if pkgDir ends with /dist: "${pkgDir}"`);
      if (pkgDir.endsWith('/dist') || pkgDir.endsWith('/dist/')) {
        logger.debug('Detected development environment, checking for installation...');
        // We're in development, need to find the actual installed package
        
        // Try to find the installed package
        const possiblePaths = [
          './node_modules/vecbox',
          '../node_modules/vecbox',
          '../../node_modules/vecbox',
          process.cwd() + '/node_modules/vecbox'
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(path.join(possiblePath, 'package.json'))) {
            logger.debug(`Found installed package at: ${possiblePath}`);
            return possiblePath;
          }
        }
      }
      
      // If we're in a pnpm structure, go up to find the actual vecbox package
      if (pkgDir.includes('.pnpm')) {
        logger.debug('Detected pnpm structure, searching for vecbox package...');
        // We're in a pnpm symlinked structure, need to find the actual package
        const segments = pkgDir.split('/node_modules/.pnpm/');
        if (segments.length > 1) {
          // Find the vecbox package in the pnpm structure
          const pnpmBase = segments[0] + '/node_modules/.pnpm/';
          const vecboxDirs = (fs.readdirSync(pnpmBase) as string[])
            .filter((dir: string) => dir.startsWith('vecbox@'))
            .map((dir: string) => path.join(pnpmBase, dir, 'node_modules/vecbox'))
            .filter((dir: string) => fs.existsSync(path.join(dir, 'package.json')));
          
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
      logger.debug(`getPackageDirectory failed: ${error}`);
      // Fallback: try common node_modules locations
      
      const possiblePaths = [
        './node_modules/vecbox',
        '../node_modules/vecbox',
        '../../node_modules/vecbox',
        process.cwd() + '/node_modules/vecbox'
      ];
      
      logger.debug(`Trying fallback paths: ${possiblePaths.join(', ')}`);
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(path.join(possiblePath, 'package.json'))) {
          logger.debug(`Using fallback path: ${possiblePath}`);
          return possiblePath;
        }
      }
      
      // Final fallback: use current directory
      logger.debug(`Using final fallback: ${process.cwd()}`);
      return process.cwd();
    }
  }
}
