import type { EmbedConfig, ProviderType } from '@src/types/index.js';
import { OpenAIProvider } from '@providers/openai.js';
import { GeminiProvider } from '@providers/gemini.js';
import { ClaudeProvider } from '@providers/claude.js';
import { MistralProvider } from '@providers/mistral.js';
import { DeepSeekProvider } from '@providers/deepseek.js';
import { TransformersProvider } from '@providers/transformers.js';
import { Logger } from '@src/util/logger.js';

const logger = Logger.createModuleLogger('factory');

export class EmbeddingFactory {
  private static providers = new Map<ProviderType, new (config: EmbedConfig) => any>([
    ['openai', OpenAIProvider],
    ['gemini', GeminiProvider],
    ['claude', ClaudeProvider],
    ['mistral', MistralProvider],
    ['deepseek', DeepSeekProvider],
    ['transformers', TransformersProvider],
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
