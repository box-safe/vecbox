import type { EmbedConfig, ProviderType } from '@src/types/index';
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';
import { OpenAIProvider } from '@providers/openai';
import { GeminiProvider } from '@providers/gemini';
import { ClaudeProvider } from '@providers/claude';
import { MistralProvider } from '@providers/mistral';
import { DeepSeekProvider } from '@providers/deepseek';
import { LlamaCppProvider } from '@providers/llamacpp';
import { Logger } from '@src/util/logger';

const logger = Logger.createModuleLogger('factory');

export class EmbeddingFactory {
  private static providers = new Map<ProviderType, new (config: EmbedConfig) => EmbeddingProvider>([
    ['openai', OpenAIProvider],
    ['gemini', GeminiProvider],
    ['claude', ClaudeProvider],
    ['mistral', MistralProvider],
    ['deepseek', DeepSeekProvider],
    ['llamacpp', LlamaCppProvider], // Local embeddings with llama.cpp
  ]);

  static create(config: EmbedConfig) {
    logger.info(`Creating provider: ${config.provider}`);
    
    const ProviderClass = this.providers.get(config.provider);
    if (!ProviderClass) {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }

    return new ProviderClass(config);
  }

  static getSupportedProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }
}
