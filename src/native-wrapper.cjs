// Native module wrapper for ES modules
let nativeModule = null;
const path = require('path');
const fs = require('fs');

try {
  // Get current directory
  const currentDir = __dirname || path.dirname(process.argv[1]);
  
  // Try to load the .node file from current directory
  const nodePath = path.join(currentDir, 'llama_embedding.node');
  if (fs.existsSync(nodePath)) {
    nativeModule = require(nodePath);
  }
} catch (e) {
  // Module not available
}

export default nativeModule;
export { nativeModule };
