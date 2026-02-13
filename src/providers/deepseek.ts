import { DeepSeek } from 'deepseek';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider.js';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index.js';
import { Logger } from '@src/util/logger.js';

const logger = Logger.createModuleLogger('deepseek');

export class DeepSeekProvider extends EmbeddingProvider {
  private client: DeepSeek;

  constructor(config: EmbedConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    const clientOptions: any = {
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
    };
    
    if (config.baseUrl) {
      clientOptions.baseURL = config.baseUrl;
    }

    this.client = new DeepSeek(clientOptions);

    logger.info('DeepSeek provider initialized');
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
        throw new Error('No embedding returned from DeepSeek API');
      }

      return {
        embedding: embedding.embedding || [],
        dimensions: embedding.embedding?.length || 0,
        model: embedding.model || this.getModel(),
        provider: 'deepseek',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      logger.error(`DeepSeek embedding failed: ${error.message}`);
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

      const embeddings = response.data.map((item: any) => item.embedding);

      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: response.model,
        provider: 'deepseek',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      logger.error(`DeepSeek batch embedding failed: ${error.message}`);
      throw error;
    }
  }

  getDimensions(): number {
    // DeepSeek embedding dimensions
    const model = this.getModel();
    if (model.includes('deepseek-chat')) return 4096;
    return 4096; // default for DeepSeek
  }

  getProviderName(): string {
    return 'DeepSeek';
  }

  async isReady(): Promise<boolean> {
    try {
      // Test with a simple embedding request
      await this.client.embeddings.create({
        model: this.getModel(),
        input: 'test',
      });
      return true;
    } catch (error: any) {
      logger.error(`DeepSeek readiness check failed: ${error.message}`);
      return false;
    }
  }
}
