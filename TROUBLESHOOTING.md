# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Installation Issues

#### ❌ "Native module compilation failed"

**Problem:** Build fails during `npm install`

**Solutions:**
```bash
# 1. Install build tools
# Ubuntu/Debian
sudo apt-get install build-essential python3-dev

# macOS
xcode-select --install

# Windows
# Install Visual Studio Build Tools

# 2. Clean and rebuild
rm -rf node_modules native/build
npm install
npm run build:native
```

#### ❌ "node-gyp not found"

**Solution:**
```bash
npm install -g node-gyp
```

#### ❌ "Python not found"

**Solution:**
```bash
# Install Python 3.8+
# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# macOS
brew install python3

# Set as default
python3 --version
```

### Runtime Issues

#### ❌ "Cannot find module 'llama_embedding.node'"

**Problem:** Native module not built

**Solution:**
```bash
npm run build:native
```

#### ❌ "Module not found: ../../native"

**Problem:** Native module unavailable, fallback not working

**Solution:**
```typescript
// Check if native module is available
try {
  const llama = require('./native');
  console.log('Native module available');
} catch (error) {
  console.log('Using HTTP fallback');
}
```

#### ❌ "API key is required"

**Problem:** Missing API key for cloud providers

**Solution:**
```bash
# Set environment variables
export OPENAI_API_KEY="your-key-here"
export GEMINI_API_KEY="your-key-here"
export MISTRAL_API_KEY="your-key-here"

# Or pass directly in config
await embed({
  provider: 'openai',
  apiKey: 'your-api-key'
}, input);
```

### Llama.cpp Issues

#### ❌ "Model file not found"

**Problem:** Model path incorrect or missing

**Solution:**
```typescript
// Check if model exists
import { access, constants } from 'fs/promises';

try {
  await access('path/to/model.gguf', constants.F_OK);
  console.log('Model found');
} catch {
  console.error('Model not found');
}

// Use absolute path
await embed({
  provider: 'llamacpp',
  model: '/absolute/path/to/model.gguf'
}, input);
```

#### ❌ "Failed to connect to llama.cpp server"

**Problem:** Using HTTP fallback without server

**Solution:**
```bash
# Start llama.cpp server
./llama-server -m model.gguf --embedding --port 8080

# Or use native module (recommended)
npm run build:native
```

#### ❌ "Embedding failed: Model loading error"

**Problem:** Incompatible model format

**Solution:**
```bash
# Use GGUF format models
# Download from HuggingFace
wget https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf
```

### Performance Issues

#### ❌ Slow embedding generation

**Causes & Solutions:**

1. **Using HTTP instead of native:**
```typescript
// Use native module for 10x speed
npm run build:native
```

2. **Large batch sizes:**
```typescript
// Process in smaller batches
const batchSize = 10;
for (let i = 0; i < inputs.length; i += batchSize) {
  const batch = inputs.slice(i, i + batchSize);
  await embed(config, batch);
}
```

3. **Network latency:**
```typescript
// Increase timeout
await embed({
  ...config,
  timeout: 60000 // 60 seconds
}, input);
```

### Memory Issues

#### ❌ "Out of memory" errors

**Solutions:**
```typescript
// 1. Use smaller models
await embed({
  provider: 'openai',
  model: 'text-embedding-3-small' // vs text-embedding-3-large
}, input);

// 2. Process in smaller batches
const batchSize = 5;
// Process batch by batch

// 3. Cleanup native resources
if (provider.cleanup) {
  await provider.cleanup();
}
```

### Provider-Specific Issues

#### OpenAI

```bash
# Check API key and quota
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### Gemini

```bash
# Check API key
curl -H "x-goog-api-key: $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

#### Mistral

```bash
# Check API key
curl -H "Authorization: Bearer $MISTRAL_API_KEY" \
     https://api.mistral.ai/v1/models
```

#### Llama.cpp

```bash
# Check model file
file model.gguf
# Should show: GGUF data

# Test with llama.cpp directly
./llama-embedding -m model.gguf -p "test text"
```

## 🔧 Debug Mode

Enable detailed logging:

```typescript
import { Logger } from 'vecbox/src/util/logger';

// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Or create custom logger
const logger = Logger.createModuleLogger('debug');
logger.debug('Debug info');
```

## 📊 Performance Monitoring

Monitor embedding performance:

```typescript
import { createProvider } from 'vecbox';

const provider = createProvider(config);

const startTime = Date.now();
const result = await provider.embed({ text: 'test' });
const endTime = Date.now();

console.log(`Embedding time: ${endTime - startTime}ms`);
console.log(`Dimensions: ${result.dimensions}`);
console.log(`Provider: ${result.provider}`);
```

## 🐛 Bug Reporting

When reporting issues, include:

### Required Information
- **Node.js version**: `node --version`
- **Operating System**: `uname -a`
- **Vecbox version**: `npm list vecbox`
- **Provider used**: openai/gemini/mistral/llamacpp

### Reproduction Code
```typescript
// Minimal code to reproduce the issue
import { embed } from 'vecbox';

const config = { /* your config */ };
const input = { text: 'test' };

embed(config, input)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Error Messages
```bash
# Full error stack trace
Error: Something went wrong
    at embed (/path/to/file.js:123:45)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
```

## 📞 Getting Help

### Resources
- **GitHub Issues**: [Report bugs](https://github.com/box-safe/vecbox/issues)
- **Discussions**: [Ask questions](https://github.com/box-safe/vecbox/discussions)
- **Documentation**: [API Reference](./API.md)
- **Examples**: [Code samples](./examples/)

### Community
- **Discord**: Join our community
- **Twitter**: Follow for updates
- **GitHub**: Star the repository

## 🔄 Common Workflows

### Setting up for development
```bash
git clone https://github.com/box-safe/vecbox.git
cd vecbox
npm install
npm run build:native
npm test
```

### Testing different providers
```typescript
// Test all providers
const providers = ['openai', 'gemini', 'mistral', 'llamacpp'];

for (const provider of providers) {
  try {
    const result = await embed({ provider }, { text: 'test' });
    console.log(`${provider}: ✅ ${result.dimensions}D`);
  } catch (error) {
    console.log(`${provider}: ❌ ${error.message}`);
  }
}
```

### Benchmarking performance
```typescript
const iterations = 10;
const times = [];

for (let i = 0; i < iterations; i++) {
  const start = Date.now();
  await embed(config, input);
  times.push(Date.now() - start);
}

const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
console.log(`Average time: ${avgTime}ms`);
```

---

**Still having issues?** Don't hesitate to open an issue or join our Discord community! We're here to help! 🚀
