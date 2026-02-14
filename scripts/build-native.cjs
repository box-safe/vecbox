#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building native Llama.cpp module...');

// Check if native directory exists
const nativeDir = path.join(__dirname, '../native');
if (!fs.existsSync(nativeDir)) {
  console.error('❌ Native directory not found');
  process.exit(1);
}

// Change to native directory
process.chdir(nativeDir);

try {
  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing native dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Build the native module
  console.log('🏗️  Building native module...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if build was successful
  const buildDir = path.join(nativeDir, 'build/Release');
  if (fs.existsSync(path.join(buildDir, 'llama_embedding.node'))) {
    console.log('✅ Native module built successfully!');
    console.log(`📁 Location: ${buildDir}`);
  } else {
    console.error('❌ Build failed - llama_embedding.node not found');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
