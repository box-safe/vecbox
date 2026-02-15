/**
 * Vecbox v0.2.3 - Main Entry Point
 * 
 * A minimal and powerful vector library that supports multiple providers
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
export const VERSION = '0.2.3';

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
  name: 'vecbox',
  version: VERSION,
  description: 'A minimal and powerful embedding library',
  homepage: 'https://boxsafe.dev',
  repository: 'https://github.com/boxsafe/vecbox.git',
  supportedProviders: [
    'openai',
    'gemini', 
    'mistral',
    'llamacpp'
  ] as const
} as const;
