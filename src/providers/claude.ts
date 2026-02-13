import Anthropic from '@anthropic-ai/sdk';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider.js';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index.js';
import { Logger } from '@src/util/logger.js';

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

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      const text = await this.readInput(input);
      logger.debug(`Embedding text with model: ${this.getModel()}`);

      // Note: Claude doesn't have native embeddings API yet
      // This is a placeholder implementation
      throw new Error('Claude embeddings API not yet available. Please use another provider.');
      
    } catch (error: any) {
      logger.error(`Claude embedding failed: ${error.message}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      // Note: Claude doesn't have native embeddings API yet
      throw new Error('Claude embeddings API not yet available. Please use another provider.');
      
    } catch (error: any) {
      logger.error(`Claude batch embedding failed: ${error.message}`);
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
    } catch (error: any) {
      logger.error(`Claude readiness check failed: ${error.message}`);
      return false;
    }
  }
}
