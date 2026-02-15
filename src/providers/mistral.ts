import { Mistral } from '@mistralai/mistralai';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { Logger } from '@src/util/logger';

const logger = Logger.createModuleLogger('mistral');

export class MistralProvider extends EmbeddingProvider {
  private client: Mistral;

  protected getModel(): string {
    return this.config.model || 'mistral-embed';
  }

  constructor(config: EmbedConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Mistral API key is required');
    }

    this.client = new Mistral({
      apiKey: config.apiKey,
      serverURL: config.baseUrl,
      timeoutMs: config.timeout || 30000,
    });

    logger.info('Mistral provider initialized');
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      const text = await this.readInput(input);
      logger.debug(`Embedding text with model: ${this.getModel()}`);

      const response = await this.client.embeddings.create({
        model: this.getModel(),
        inputs: [text],
      });

      const embedding = response.data[0];
      if (!embedding) {
        throw new Error('No embedding returned from Mistral API');
      }

      return {
        embedding: embedding.embedding || [],
        dimensions: embedding.embedding?.length || 0,
        model: response.model,
        provider: 'mistral',
        usage: response.usage?.promptTokens && response.usage?.totalTokens ? {
          promptTokens: response.usage.promptTokens,
          totalTokens: response.usage.totalTokens,
        } : undefined,
      };
    } catch (error: unknown) {
      logger.error(`Mistral embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      const texts = await Promise.all(inputs.map(input => this.readInput(input)));
      logger.debug(`Batch embedding ${texts.length} texts with model: ${this.getModel()}`);

      const response = await this.client.embeddings.create({
        model: this.getModel(),
        inputs: texts,
      });

      const embeddings = response.data.map((item) => {
        if (!item.embedding) throw new Error('No embedding returned from Mistral API');
        return item.embedding as number[];
      });

      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: response.model,
        provider: 'mistral',
        usage: response.usage?.promptTokens && response.usage?.totalTokens ? {
          promptTokens: response.usage.promptTokens,
          totalTokens: response.usage.totalTokens,
        } : undefined,
      };
    } catch (error: unknown) {
      logger.error(`Mistral batch embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  getDimensions(): number {
    // Mistral embedding dimensions
    const model = this.getModel();
    if (model.includes('mistral-embed')) return 1024;
    return 1024; // default for Mistral
  }

  getProviderName(): string {
    return 'Mistral AI';
  }

  async isReady(): Promise<boolean> {
    try {
      // Test with a simple embedding request
      const response = await this.client.embeddings.create({
        model: this.getModel(),
        inputs: ['test'],
      });
      return response.data.length > 0;
    } catch (error: unknown) {
      logger.error(`Mistral readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
      return false;
    }
  }
}
