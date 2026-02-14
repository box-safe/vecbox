/**
 * Embed Kit v1.0.0 - Main Entry Point
 * 
 * A minimal and powerful embedding library that supports multiple providers
 * with automatic detection and fallback capabilities.
 */

// Export main functions
export { embed, autoEmbed, getSupportedProviders, createProvider } from './main.js';

// Export types
export type { 
  EmbedConfig, 
  EmbedInput, 
  EmbedResult, 
  BatchEmbedResult, 
  ProviderType 
} from './src/types/index.js';

// Export provider factory for advanced usage
export { EmbeddingFactory } from './src/factory/EmbeddingFactory.js';

// Export base provider for custom implementations
export { EmbeddingProvider } from './src/providers/base/EmbeddingProvider.js';

// Version information
export const VERSION = '1.0.0';

/**
 * Get library version
 */
export function getVersion(): string {
  return VERSION;
}

/**
 * Library information
 */
export const LIB_INFO = {
  name: 'embed-kit',
  version: VERSION,
  description: 'A minimal and powerful embedding library',
  homepage: 'https://embed-kit.dev',
  repository: 'https://github.com/embed-kit/embed-kit.git',
  supportedProviders: [
    'openai',
    'gemini', 
    'claude',
    'mistral',
    'deepseek',
    'llamacpp'
  ] as const
} as const;
