// Simple native module loader - no imports to avoid cycles
let nativeModule = null;

// Load require dynamically
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);

async function loadNativeModule() {
  try {
    // Get current directory
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));
    
    // Try to load the .node file from current directory
    const nodePath = require('path').join(__dirname, 'llama_embedding.node');
    const fs = require('fs');
    
    if (fs.existsSync(nodePath)) {
      nativeModule = require(nodePath);
    }
  } catch (e) {
    // Module not available
  }
}

// Load the module
await loadNativeModule();

export default nativeModule;
export { nativeModule };
