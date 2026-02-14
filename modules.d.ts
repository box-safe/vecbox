// Declare module aliases for TypeScript
declare module '@types/index' {
  export type ProviderType = 
    | 'openai'
    | 'gemini' 
    | 'claude'
    | 'mistral'
    | 'deepseek'
    | 'llamacpp';

  export interface EmbedConfig {
    provider: ProviderType;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
  }

  export interface EmbedInput {
    text?: string;
    filePath?: string;
  }

  export interface EmbedResult {
    embedding: number[];
    dimensions: number;
    model: string;
    provider: string;
    usage?: {
      promptTokens?: number;
      totalTokens?: number;
    } | undefined;
  }

  export interface BatchEmbedResult {
    embeddings: number[][];
    dimensions: number;
    model: string;
    provider: string;
    usage?: {
      promptTokens?: number;
      totalTokens?: number;
    } | undefined;
  }
}

declare module '@util/logger.js' {
  export const logger: {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
}

declare module '@providers/base/EmbeddingProvider.js' {
  type ProviderType = 'openai' | 'gemini' | 'claude' | 'mistral' | 'deepseek' | 'llamacpp';
  
  interface EmbedConfig {
    provider: ProviderType;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
  }
  
  interface EmbedInput {
    text?: string;
    filePath?: string;
  }
  
  interface EmbedResult {
    embedding: number[];
    dimensions: number;
    model: string;
    provider: string;
    usage?: {
      promptTokens?: number;
      totalTokens?: number;
    } | undefined;
  }
  
  interface BatchEmbedResult {
    embeddings: number[][];
    dimensions: number;
    model: string;
    provider: string;
    usage?: {
      promptTokens?: number;
      totalTokens?: number;
    } | undefined;
  }
  
  export class EmbeddingProvider {
    constructor(config: EmbedConfig);
    embed(input: EmbedInput): Promise<EmbedResult>;
    embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult>;
    isReady(): Promise<boolean>;
    protected readInput(input: EmbedInput): Promise<string>;
  }
}
