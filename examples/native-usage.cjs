/**
 * Vecbox Native Module Usage Examples
 * 
 * This file demonstrates how to use the Llama.cpp native module
 * for high-performance local embeddings.
 */

const { autoEmbed, embed } = require('../dist/index.cjs');

// Example 1: Auto-detection (Recommended)
async function autoDetectionExample() {
  console.log('🤖 Auto-detection Example:');
  console.log('Automatically uses native module when available\n');
  
  try {
    const result = await autoEmbed({ text: 'Hello, Vecbox native module!' });
    
    console.log('✅ Success!');
    console.log(`Provider: ${result.provider}`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`Model: ${result.model}`);
    console.log(`First 5 embeddings: [${result.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 2: Manual native configuration
async function manualNativeExample() {
  console.log('\n🔧 Manual Native Configuration Example:');
  console.log('Force native module usage with custom model\n');
  
  try {
    const result = await embed(
      { 
        provider: 'llamacpp', 
        model: 'nomic-embed-text-v1.5.Q4_K_M.gguf' 
      },
      { text: 'Manual native embedding test' }
    );
    
    console.log('✅ Success!');
    console.log(`Provider: ${result.provider}`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`Model: ${result.model}`);
    console.log(`First 5 embeddings: [${result.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 3: Batch processing with native module
async function batchNativeExample() {
  console.log('\n📦 Batch Processing Example:');
  console.log('Process multiple texts with native module\n');
  
  try {
    const inputs = [
      { text: 'First document about machine learning' },
      { text: 'Second document about neural networks' },
      { text: 'Third document about artificial intelligence' }
    ];
    
    const result = await embed(
      { 
        provider: 'llamacpp',
        model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
      },
      inputs
    );
    
    console.log('✅ Success!');
    console.log(`Processed ${result.embeddings.length} texts`);
    console.log(`Dimensions: ${result.dimensions}`);
    console.log(`First text embeddings: [${result.embeddings[0].slice(0, 3).map(v => v.toFixed(4)).join(', ')}]`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 4: Performance comparison
async function performanceComparison() {
  console.log('\n⚡ Performance Comparison:');
  console.log('Native vs HTTP fallback performance\n');
  
  const testText = 'Performance test text for embedding generation';
  const iterations = 10;
  
  try {
    console.log('Testing native module...');
    const nativeStart = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const result = await embed(
        { provider: 'llamacpp' },
        { text: testText }
      );
    }
    
    const nativeEnd = Date.now();
    const nativeTime = (nativeEnd - nativeStart) / iterations;
    
    console.log(`✅ Native module: ${nativeTime.toFixed(2)}ms per embedding`);
    
  } catch (error) {
    console.error('❌ Native error:', error.message);
  }
}

// Example 5: Error handling and cleanup
async function errorHandlingExample() {
  console.log('\n🛡️ Error Handling and Cleanup:');
  console.log('Proper error handling and resource management\n');
  
  try {
    // Test with invalid model
    const result = await embed(
      { 
        provider: 'llamacpp',
        model: 'non-existent-model.gguf'  // This will cause an error
      },
      { text: 'This should fail' }
    );
    
  } catch (error) {
    console.log('✅ Error properly caught:', error.message);
  }
  
  // Note: In a real application, you would implement proper cleanup
  console.log('💡 In production, always call cleanup() when done');
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Vecbox Native Module Examples\n');
  
  await autoDetectionExample();
  await manualNativeExample();
  await batchNativeExample();
  await performanceComparison();
  await errorHandlingExample();
  
  console.log('\n✨ All examples completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  autoDetectionExample,
  manualNativeExample,
  batchNativeExample,
  performanceComparison,
  errorHandlingExample,
  runAllExamples
};
