import Anthropic from '@anthropic-ai/sdk';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { Logger } from '@src/util/logger';

const logger = Logger.createModuleLogger('claude');

export class ClaudeProvider extends EmbeddingProvider {
  private client: Anthropic;

  constructor(config: EmbedConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
    });

    logger.info('Claude provider initialized');
  }

  async embed(): Promise<EmbedResult> {
    try {
      logger.debug(`Embedding text with model: ${this.getModel()}`);

      // Note: Claude doesn't have native embeddings API yet
      // This is a placeholder implementation
      throw new Error('Claude embeddings API not yet available. Please use another provider.');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Unknown error';
      logger.error(`Claude embedding failed: ${errorMessage}`);
      throw error;
    }
  }

  async embedBatch(): Promise<BatchEmbedResult> {
    try {
      // Note: Claude doesn't have native embeddings API yet
      throw new Error('Claude embeddings API not yet available. Please use another provider.');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Unknown error';
      logger.error(`Claude batch embedding failed: ${errorMessage}`);
      throw error;
    }
  }

  getDimensions(): number {
    // Claude doesn't have embeddings yet
    return 0;
  }

  getProviderName(): string {
    return 'Anthropic Claude';
  }

  async isReady(): Promise<boolean> {
    try {
      // Test API access
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Unknown error';
      logger.error(`Claude readiness check failed: ${errorMessage}`);
      return false;
    }
  }
}
