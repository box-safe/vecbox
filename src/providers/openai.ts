import OpenAI from 'openai';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { Logger } from '@src/util/logger';

const logger = Logger.createModuleLogger('openai');

export class OpenAIProvider extends EmbeddingProvider {
  private client: OpenAI;

  constructor(config: EmbedConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
    });

    logger.info('OpenAI provider initialized');
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      const text = await this.readInput(input);
      logger.debug(`Embedding text with model: ${this.getModel()}`);

      const response = await this.client.embeddings.create({
        model: this.getModel(),
        input: text,
      });

      const embedding = response.data[0];
      if (!embedding) {
        throw new Error('No embedding returned from OpenAI API');
      }

      return {
        embedding: embedding.embedding || [],
        dimensions: embedding.embedding?.length || 0,
        model: response.model,
        provider: 'openai',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: unknown) {
      logger.error(`OpenAI embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      const texts = await Promise.all(inputs.map(input => this.readInput(input)));
      logger.debug(`Batch embedding ${texts.length} texts with model: ${this.getModel()}`);

      const response = await this.client.embeddings.create({
        model: this.getModel(),
        input: texts,
      });

      const embeddings = response.data.map(item => item.embedding);

      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: response.model,
        provider: 'openai',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: unknown) {
      logger.error(`OpenAI batch embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  getDimensions(): number {
    // Common OpenAI embedding dimensions
    const model = this.getModel();
    if (model.includes('text-embedding-3-large')) return 3072;
    if (model.includes('text-embedding-3-small')) return 1536;
    if (model.includes('text-embedding-ada-002')) return 1536;
    return 1536; // default
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  async isReady(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error: unknown) {
      logger.error(`OpenAI readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
      return false;
    }
  }
}
