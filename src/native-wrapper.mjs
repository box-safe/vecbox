/**
 * Native module wrapper for ES Modules compatibility
 * Loads llama_embedding.node using createRequire
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let nativeModule = null;

try {
  nativeModule = require('./native/build/Release/llama_embedding.node');
} catch (error) {
  try {
    // Try absolute path
    nativeModule = require('/home/inky/Development/vecbox/native/build/Release/llama_embedding.node');
  } catch (absError) {
    console.error('Failed to load native module (relative):', error);
    console.error('Failed to load native module (absolute):', absError);
    nativeModule = null;
  }
}

export default nativeModule;
