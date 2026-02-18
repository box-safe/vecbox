import { join, resolve } from 'path';
import { cwd } from 'process';

/*
* LLAMA CPP PATHS
* _____________________________________________________________________________________________________________________
*/ 
/**
 * Centralized path constants for Llama.cpp provider
 */
export const PATHS = {
  // Native module paths
  NATIVE_MODULE_PATHS: [
    './native/build/Release/llama_embedding.node',
    './native/build/Release/llama_embedding.node',
    join(cwd(), 'native/build/Release/llama_embedding.node')
  ],

  // Default llama.cpp binary path
  DEFAULT_LLAMA_PATH: './llama.cpp/build/bin/llama-embedding',

  // Model search paths (in order of priority)
  MODEL_SEARCH_PATHS: [
    (modelPath: string) => resolve(modelPath),                    // Current directory
    (modelPath: string) => join('core/models', modelPath),       // core/models subdirectory
    (modelPath: string) => join('models', modelPath),            // models subdirectory
    (modelPath: string, packageDir: string) => join(packageDir, 'core/models', modelPath),  // Package installation
    (modelPath: string, packageDir: string) => join(packageDir, 'models', modelPath),      // Package models
  ],

  // Node_modules search paths
  NODE_MODULES_PATHS: [
    './node_modules/vecbox',
    '../node_modules/vecbox',
    '../../node_modules/vecbox',
    join(cwd(), 'node_modules/vecbox')
  ]
} as const;

/*
* END LLAMA CPP PATHS
* _____________________________________________________________________________________________________________________
*/
