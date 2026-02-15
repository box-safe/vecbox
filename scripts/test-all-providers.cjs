#!/usr/bin/env node

/**
 * Test All Vecbox Providers
 * 
 * This script tests all available providers to ensure they work correctly
 * with native module integration and API key configuration
 */

const { autoEmbed, embed } = require('../dist/index.cjs');

const providers = ['openai', 'gemini', 'mistral', 'llamacpp'];
const testText = 'Vecbox comprehensive provider test - v0.2.2';

async function testProvider(providerName, text) {
  console.log('🔍 Testing ' + providerName + ' provider...');
  
  // Skip OpenAI if no API key
  if (providerName === 'openai' && !process.env.OPENAI_API_KEY) {
    console.log('⚠️  Skipping OpenAI - no API key configured');
    console.log('   - Set OPENAI_API_KEY to test OpenAI provider');
    return false;
  }
  
  try {
    const result = await embed(
      { provider: providerName },
      text: text
    );
    
    console.log('✅ ' + providerName + ' SUCCESS!');
    console.log('   - Provider: ' + result.provider);
    console.log('   - Dimensions: ' + result.dimensions);
    console.log('   - Model: ' + result.model);
    console.log('   - First 3 embeddings: [' + result.embedding.slice(0, 3).map(v => v.toFixed(4)).join(', ') + ']');
    
    return true;
  } catch (error) {
    console.error('❌ ' + providerName + ' ERROR: ' + error.message);
    return false;
  }
}

async function testAllProviders() {
  console.log('🧪 Testing all providers...');
  
  const results = [];
  
  for (const provider of providers) {
    const success = await testProvider(provider, testText);
    results.push({ provider, success });
  }
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('✅ ALL PROVIDERS WORKING!');
    console.log('📊 Results:');
    results.forEach(({ provider, success }) => {
      console.log('   - ' + provider + ': ' + (success ? '✅' : '❌'));
    });
  } else {
    console.log('❌ SOME PROVIDERS FAILED!');
    console.log('📊 Results:');
    results.forEach(({ provider, success }) => {
      console.log('   - ' + provider + ': ' + (success ? '✅' : '❌'));
    });
  }
  
  console.log('🎯 Vecbox v0.2.2 - Multi-Provider Test Complete!');
}

// Run if this file is executed directly
if (require.main === module) {
  testAllProviders();
}
