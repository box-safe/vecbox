import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index';
import { Logger } from '@src/util/logger';

const logger = Logger.createModuleLogger('gemini');

export class GeminiProvider extends EmbeddingProvider {
  private client: GoogleGenerativeAI;

  constructor(config: EmbedConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Google API key is required');
    }

    this.client = new GoogleGenerativeAI(config.apiKey);
    logger.info('Gemini provider initialized');
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    try {
      const text = await this.readInput(input);
      logger.debug(`Embedding text with model: ${this.getModel()}`);

      // Get the embedding model
      const model = this.client.getGenerativeModel({ 
        model: this.getModel() 
      });

      // Use the embedding task
      const result = await model.embedContent(text);
      const embedding = result.embedding;

      return {
        embedding: embedding.values,
        dimensions: embedding.values.length,
        model: this.getModel(),
        provider: 'gemini',
      };
    } catch (error: unknown) {
      logger.error(`Gemini embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  async embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult> {
    try {
      const texts = await Promise.all(inputs.map(input => this.readInput(input)));
      logger.debug(`Batch embedding ${texts.length} texts with model: ${this.getModel()}`);

      const model = this.client.getGenerativeModel({ 
        model: this.getModel() 
      });

      const results = await Promise.all(
        texts.map(text => model.embedContent(text))
      );

      const embeddings = results.map((result: { embedding: { values: number[] } }) => result.embedding.values);

      return {
        embeddings,
        dimensions: embeddings[0]?.length || 0,
        model: this.getModel(),
        provider: 'gemini',
      };
    } catch (error: unknown) {
      logger.error(`Gemini batch embedding failed: ${(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  }

  getDimensions(): number {
    const model = this.getModel();
    if (model.includes('gemini-embedding-001')) return 768;
    if (model.includes('text-embedding-004')) return 768;
    if (model.includes('embedding-001')) return 768;
    if (model.includes('multimodalembedding')) return 768;
    return 768; // default for Gemini embeddings
  }

  getProviderName(): string {
    return 'Google Gemini';
  }

  protected getModel(): string {
    return this.config.model || 'gemini-embedding-001';
  }

  async isReady(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.getModel() 
      });
      // Test with a simple embedding
      await model.embedContent('test');
      return true;
    } catch (error: unknown) {
      logger.error(`Gemini readiness check failed: ${(error instanceof Error ? error.message : String(error))}`);
      return false;
    }
  }
}
