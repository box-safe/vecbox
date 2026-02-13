import { pipeline, env } from '@xenova/transformers';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider.js';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index.js';
import { Logger } from '@src/util/logger.js';

const logger = Logger.createModuleLogger('transformers');

// Configure transformers to use local cache
env.cacheDir = './.cache/transformers';
env.allowLocalModels = true;

export class TransformersProvider extends EmbeddingProvider {
  private pipeline: any = null;
  private modelPath: string;

  constructor(config: EmbedConfig) {
    super(config);
    
    this.modelPath = config.model || 'Xenova/all-MiniLM-L6-v2';
    logger.info(`Transformers provider initialized with model: ${this.modelPath}`);
  }

  private async getPipeline() {
    if (!this.pipeline) {
      logger.debug(`Loading pipeline for model: ${this.modelPath}`);
      this.pipeline = await pipeline('feature-extraction', this.modelPath);
      logger.info('Pipeline loaded successfully');
    }
    return this.pipeline;
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      const text = await this.readInput(input);
      logger.debug(`Embedding text with model: ${this.modelPath}`);

      const pipeline = await this.getPipeline();
      const result = await pipeline(text);
      
      // Extract embedding from result (transformers returns nested structure)
      const embedding = Array.from(result.data) as number[];

      return {
        embedding,
        dimensions: embedding.length,
        model: this.modelPath,
        provider: 'transformers',
      };
    } catch (error: any) {
      logger.error(`Transformers embedding failed: ${error.message}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      const texts = await Promise.all(inputs.map(input => this.readInput(input)));
      logger.debug(`Batch embedding ${texts.length} texts with model: ${this.modelPath}`);

      const pipeline = await this.getPipeline();
      const results = await Promise.all(
        texts.map(text => pipeline(text))
      );

      const embeddings = results.map(result => Array.from(result.data) as number[]);

      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: this.modelPath,
        provider: 'transformers',
      };
    } catch (error: any) {
      logger.error(`Transformers batch embedding failed: ${error.message}`);
      throw error;
    }
  }

  getDimensions(): number {
    // Common dimensions for popular models
    if (this.modelPath.includes('all-MiniLM-L6-v2')) return 384;
    if (this.modelPath.includes('all-mpnet-base-v2')) return 768;
    if (this.modelPath.includes('sentence-transformers')) {
      if (this.modelPath.includes('large')) return 1024;
      if (this.modelPath.includes('base')) return 768;
      if (this.modelPath.includes('small')) return 384;
    }
    return 384; // default
  }

  getProviderName(): string {
    return 'Transformers.js';
  }

  async isReady(): Promise<boolean> {
    try {
      await this.getPipeline();
      return true;
    } catch (error: any) {
      logger.error(`Transformers readiness check failed: ${error.message}`);
      return false;
    }
  }
}
