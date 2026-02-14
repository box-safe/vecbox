/**
 * Embed Kit v1.0.0 - Basic Usage Examples
 * 
 * This file demonstrates how to use the embedding library
 * with different providers and input types.
 */

import { embed, autoEmbed, getSupportedProviders } from '@/main';
import type { EmbedResult, BatchEmbedResult } from '@src/types/index';

// Example 1: Simple text embedding with OpenAI
async function example1() {
  console.log('\n=== Example 1: Simple text embedding ===');
  
  try {
    const result = await embed(
      {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'text-embedding-3-small'
      },
      { text: 'Hello world, this is a test!' }
    ) as EmbedResult;
    
    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.model}`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`First 5 values: [${result.embedding.slice(0, 5).join(', ')}]`);
    
  } catch (error: unknown) {
    console.error('Error:', (error instanceof Error ? error.message : String(error)));
  }
}

// Example 2: File input embedding with Gemini (free)
async function example2() {
  console.log('\n=== Example 2: File input with Gemini ===');
  
  try {
    // Create a test file
    const fs = await import('fs/promises');
    await fs.writeFile('./test-content.txt', 'This is test content from a file.');
    
    const result = await embed(
      {
        provider: 'gemini',
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        model: 'embedding-001'
      },
      { filePath: './test-content.txt' }
    ) as EmbedResult;
    
    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.model}`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`First 5 values: [${result.embedding.slice(0, 5).join(', ')}]`);
    
    // Clean up
    await fs.unlink('./test-content.txt');
    
  } catch (error: unknown) {
    console.error('Error:', (error instanceof Error ? error.message : String(error)));
  }
}

// Example 3: Batch embedding with Llama.cpp (local & free)
async function example3() {
  console.log('\n=== Example 3: Batch embedding with Llama.cpp ===');
  
  try {
    const results = await embed(
      {
        provider: 'llamacpp',
        model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
      },
      [
        { text: 'First text to embed' },
        { text: 'Second text to embed' },
        { text: 'Third text to embed' }
      ]
    ) as BatchEmbedResult;
    
    console.log(`Provider: ${results.provider}`);
    console.log(`Model: ${results.model}`);
    console.log(`Total embeddings: ${results.embeddings.length}`);
    console.log(`Dimensions per embedding: ${results.dimensions}`);
    
    results.embeddings.forEach((embedding: number[], index: number) => {
      console.log(`Embedding ${index + 1}: [${embedding.slice(0, 3).join(', ')}...]`);
    });
    
  } catch (error: unknown) {
    console.error('Error:', (error instanceof Error ? error.message : String(error)));
  }
}

// Example 4: Auto-detection (tries all available providers)
async function example4() {
  console.log('\n=== Example 4: Auto-detection ===');
  
  try {
    const result = await autoEmbed({ text: 'Auto-detected embedding!' }) as EmbedResult;
    
    console.log(`Auto-detected provider: ${result.provider}`);
    console.log(`Model: ${result.model}`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`First 5 values: [${result.embedding.slice(0, 5).join(', ')}]`);
    
  } catch (error: unknown) {
    console.error('Error:', (error instanceof Error ? error.message : String(error)));
  }
}

// Example 5: List supported providers
async function example5() {
  console.log('\n=== Example 5: Supported providers ===');
  
  const providers = getSupportedProviders();
  console.log('Available providers:', providers.join(', '));
}

// Example 6: Error handling
async function example6() {
  console.log('\n=== Example 6: Error handling ===');
  
  try {
    // Try with invalid API key
    await embed(
      {
        provider: 'openai',
        apiKey: 'invalid-key',
        model: 'text-embedding-3-small'
      },
      { text: 'This should fail' }
    );
    
  } catch (error: unknown) {
    console.log('Expected error caught:', (error instanceof Error ? error.message : String(error)));
  }
  
  try {
    // Try with unsupported provider
    await embed(
      {
        provider: 'openai' as 'openai' | 'gemini' | 'claude' | 'mistral' | 'deepseek' | 'llamacpp',
        model: 'some-model'
      },
      { text: 'This should fail' }
    );
    
  } catch (error: unknown) {
    console.log('Expected error caught:', (error instanceof Error ? error.message : String(error)));
  }
}

// Run all examples
async function runExamples() {
  console.log('🚀 Embed Kit - Basic Usage Examples\n');
  
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  
  console.log('\n✅ All examples completed!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  runExamples
};
