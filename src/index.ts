import dotenv from 'dotenv';
import { EmbeddingFactory } from '@src/factory/EmbeddingFactory.js';
import type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult } from '@src/types/index.js';
import { Logger } from '@src/util/logger.js';

// Load environment variables
dotenv.config();

const logger = Logger.createModuleLogger('main');

/**
 * Main embedding interface - Simple and minimal API
 * 
 * @param config - Provider configuration
 * @param input - Text or file to embed
 * @returns Promise<EmbedResult | BatchEmbedResult>
 */
export async function embed(
  config: EmbedConfig,
  input: EmbedInput | EmbedInput[]
): Promise<EmbedResult | BatchEmbedResult> {
  try {
    logger.info(`Starting embedding with provider: ${config.provider}`);
    
    // Create provider instance
    const provider = EmbeddingFactory.create(config);
    
    // Check if provider is ready
    const isReady = await provider.isReady();
    if (!isReady) {
      throw new Error(`Provider ${config.provider} is not ready`);
    }
    
    // Handle single input or batch
    if (Array.isArray(input)) {
      logger.debug(`Processing batch of ${input.length} items`);
      return await provider.embedBatch(input);
    } else {
      logger.debug(`Processing single item`);
      return await provider.embed(input);
    }
    
  } catch (error: any) {
    logger.error(`Embedding failed: ${error.message}`);
    throw error;
  }
}

/**
 * Convenience function for quick embedding with auto-detection
 * 
 * @param input - Text or file to embed
 * @returns Promise<EmbedResult | BatchEmbedResult>
 */
export async function autoEmbed(
  input: EmbedInput | EmbedInput[]
): Promise<EmbedResult | BatchEmbedResult> {
  logger.info('Auto-detecting best provider...');
  
  // Try providers in order of preference
  const providers = [
    { provider: 'transformers' as const, model: 'Xenova/all-MiniLM-L6-v2' }, // Free & offline
    { provider: 'openai' as const, model: 'text-embedding-3-small', apiKey: process.env.OPENAI_API_KEY },
    { provider: 'gemini' as const, model: 'embedding-001', apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY },
    { provider: 'mistral' as const, model: 'mistral-embed', apiKey: process.env.MISTRAL_API_KEY },
    { provider: 'deepseek' as const, model: 'deepseek-chat', apiKey: process.env.DEEPSEEK_API_KEY },
  ];
  
  for (const config of providers) {
    try {
      if (config.provider === 'transformers' || config.apiKey) {
        logger.info(`Trying provider: ${config.provider}`);
        return await embed(config, input);
      }
    } catch (error: any) {
      logger.warn(`Provider ${config.provider} failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('No available embedding provider found');
}

/**
 * Get supported providers
 */
export function getSupportedProviders() {
  return EmbeddingFactory.getSupportedProviders();
}

/**
 * Create a specific provider instance
 */
export function createProvider(config: EmbedConfig) {
  return EmbeddingFactory.create(config);
}

// Export types for external use
export type { EmbedConfig, EmbedInput, EmbedResult, BatchEmbedResult, ProviderType } from './types/index.js';
