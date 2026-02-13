import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index.js';

export abstract class EmbeddingProvider {
  protected config: EmbedConfig;

  constructor(config: EmbedConfig) {
    this.config = config;
  }

  abstract embed(input: EmbedInput): Promise<EmbedResult>;
  abstract embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult>;
  abstract getDimensions(): number;
  abstract getProviderName(): string;
  abstract isReady(): Promise<boolean>;

  protected getModel(): string {
    return this.config.model || 'default';
  }

  protected async readInput(input: EmbedInput): Promise<string> {
    if (input.text) {
      return input.text;
    }
    
    if (input.filePath) {
      const fs = await import('fs/promises');
      return await fs.readFile(input.filePath, 'utf-8');
    }
    
    throw new Error('Either text or filePath must be provided');
  }
}
