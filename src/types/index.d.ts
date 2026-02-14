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
