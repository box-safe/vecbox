# Vecbox

![vecbox](./src/images/vecbox.png)
[![npm version](https://img.shields.io/npm/v/vecbox.svg)](https://www.npmjs.org/package/vecbox)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**One API, multiple providers.** Switch between OpenAI, Gemini, Mistral, or run locally with Llama.cpp using native N-API performance.
```typescript
import { autoEmbed } from 'vecbox';

// Works with any provider - auto-detects the best available
const result = await autoEmbed({ text: 'Hello, world!' });
console.log(result.embedding); // [0.1, 0.2, ...]
console.log(result.provider);  // 'llamacpp' | 'openai' | 'gemini' | 'mistral'
```

## Why Vecbox?

**Universal API** - Write once, run anywhere. Switch providers without changing code.

**Local-First** - Runs on your machine with Llama.cpp. No API costs, no data leaving your server, full privacy.

**Production Ready** - Cloud APIs (OpenAI, Gemini, Mistral) available when you need scale or specific models.

**Native Speed** - C++ bindings via N-API make local embeddings 10x faster than HTTP-based solutions.

## Installation
```bash
npm install vecbox
# or
pnpm add vecbox
```

The native module compiles automatically during installation. No manual build steps required.

## Quick Start

### Auto Mode (Recommended)

Let Vecbox choose the best available provider:
```typescript
import { autoEmbed } from 'vecbox';

const result = await autoEmbed({ text: 'Your text here' });
console.log(result.embedding);  // [0.1, 0.2, ...]
console.log(result.provider);   // Shows which provider was used
```

Priority order: Llama.cpp (local) → OpenAI → Gemini → Mistral

### Specific Provider
```typescript
import { embed } from 'vecbox';

// OpenAI
const result = await embed(
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  { text: 'Your text' }
);
```

### From Files
```typescript
const result = await embed(
  { provider: 'gemini', apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY },
  { filePath: './document.txt' }
);
```

### Batch Processing
```typescript
const inputs = [
  { text: 'First document' },
  { text: 'Second document' },
  { text: 'Third document' }
];

const result = await embed(
  { provider: 'mistral', apiKey: process.env.MISTRAL_API_KEY },
  inputs
);

console.log(result.embeddings.length); // 3
```

## Providers

### Llama.cpp (Local - Free & Private)

**Advantages:**
- ✅ Zero API costs
- ✅ Full privacy (data never leaves your machine)
- ✅ Works offline
- ✅ Native C++ performance via N-API

**Setup:**
```bash
# 1. Download a GGUF embedding model
wget https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf

# 2. Place in your project
mkdir models
mv nomic-embed-text-v1.5.Q4_K_M.gguf models/
```

**Usage:**
```typescript
// Auto-detect (uses local model automatically)
const result = await autoEmbed({ text: 'Your text' });

// Explicit path
const result = await embed(
  { provider: 'llamacpp', model: './models/nomic-embed-text-v1.5.Q4_K_M.gguf' },
  { text: 'Your text' }
);
```

**Recommended Models:**
- `nomic-embed-text-v1.5.Q4_K_M.gguf` (81MB) - Best overall
- `bge-base-en-v1.5.Q4_K_M.gguf` (133MB) - Higher quality
- `bge-small-en-v1.5.Q4_0.gguf` (33MB) - Fastest, smaller

### OpenAI
```typescript
await embed(
  {
    provider: 'openai',
    model: 'text-embedding-3-small', // or 'text-embedding-3-large'
    apiKey: process.env.OPENAI_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Models:**
- `text-embedding-3-small` - Fast, cost-effective
- `text-embedding-3-large` - Highest quality

### Google Gemini
```typescript
await embed(
  {
    provider: 'gemini',
    model: 'gemini-embedding-001',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Mistral AI
```typescript
await embed(
  {
    provider: 'mistral',
    model: 'mistral-embed',
    apiKey: process.env.MISTRAL_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [console.mistral.ai](https://console.mistral.ai)

## Environment Variables

Create a `.env` file in your project root:
```bash
# Optional - only needed for cloud providers
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
MISTRAL_API_KEY=...
```

Vecbox works without any API keys when using Llama.cpp locally.

## API Reference

### `autoEmbed(input: Input): Promise<Result>`

Automatically selects the best available provider.

**Input:**
```typescript
{ text: string } | { filePath: string }
```

**Returns:**
```typescript
{
  embedding: number[];      // The embedding vector
  dimensions: number;       // Vector dimensions
  provider: string;         // Which provider was used
  model: string;           // Model name
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  }
}
```

### `embed(config: Config, input: Input | Input[]): Promise<Result>`

Use a specific provider.

**Config:**
```typescript
{
  provider: 'llamacpp' | 'openai' | 'gemini' | 'mistral';
  model?: string;          // Provider-specific model
  apiKey?: string;         // Required for cloud providers
  baseUrl?: string;        // Custom API endpoint
  timeout?: number;        // Request timeout in ms
  maxRetries?: number;     // Retry attempts
}
```

**Input:**
```typescript
{ text: string } | { filePath: string } | Array<{text: string} | {filePath: string}>
```

**Returns:** Same as `autoEmbed`, but `embeddings: number[][]` for batch inputs.

## Examples

### Semantic Search
```typescript
import { autoEmbed } from 'vecbox';

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

// Embed query and documents
const query = await autoEmbed({ text: 'machine learning tutorials' });
const docs = await Promise.all([
  autoEmbed({ text: 'Introduction to neural networks' }),
  autoEmbed({ text: 'Python web scraping guide' }),
  autoEmbed({ text: 'Deep learning fundamentals' })
]);

// Calculate similarity scores
const similarities = docs.map(doc => 
  cosineSimilarity(query.embedding, doc.embedding)
);

// Find best match
const bestIdx = similarities.indexOf(Math.max(...similarities));
console.log(`Best match: Document ${bestIdx + 1} (score: ${similarities[bestIdx].toFixed(3)})`);
```

### Batch File Processing
```typescript
import { embed } from 'vecbox';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function embedDirectory(dirPath: string) {
  const files = await readdir(dirPath);
  const textFiles = files.filter(f => f.endsWith('.txt'));
  
  // Process all files in one batch
  const result = await embed(
    { provider: 'llamacpp' },
    textFiles.map(file => ({ filePath: join(dirPath, file) }))
  );
  
  return textFiles.map((file, i) => ({
    filename: file,
    embedding: result.embeddings[i]
  }));
}

const results = await embedDirectory('./documents');
console.log(`Embedded ${results.length} files`);
```

### Document Clustering
```typescript
import { autoEmbed } from 'vecbox';

const documents = [
  'The cat sat on the mat',
  'Dogs are loyal pets',
  'Python is a programming language',
  'JavaScript runs in browsers',
  'Birds can fly high'
];

// Get embeddings
const embeddings = await Promise.all(
  documents.map(doc => autoEmbed({ text: doc }))
);

// Simple clustering by similarity threshold
function findClusters(embeddings: number[][], threshold = 0.7) {
  const clusters: number[][] = [];
  const assigned = new Set<number>();
  
  embeddings.forEach((emb, i) => {
    if (assigned.has(i)) return;
    
    const cluster = [i];
    assigned.add(i);
    
    embeddings.forEach((other, j) => {
      if (i !== j && !assigned.has(j)) {
        const sim = cosineSimilarity(emb, other);
        if (sim > threshold) {
          cluster.push(j);
          assigned.add(j);
        }
      }
    });
    
    clusters.push(cluster);
  });
  
  return clusters;
}

const clusters = findClusters(embeddings.map(e => e.embedding));
console.log('Clusters:', clusters);
// Output: [[0, 1, 4], [2, 3]] - animals vs programming
```

## Troubleshooting

### Native Module Issues

**Error: `Cannot find module './build/Release/vecbox.node'`**

The native module failed to compile. Rebuild it:
```bash
npm run build:native
# or
node-gyp rebuild
```

**Error: `binding.createModel is not a function`**

Your native module is outdated. Clean and rebuild:
```bash
rm -rf build/
npm install
```

### Model Loading Issues

**Error: `Model file not found`**

Check that the model path is correct:
```bash
ls -la models/           # Verify model exists
pwd                      # Check current directory
```

Use absolute paths if relative paths fail:
```typescript
const path = require('path');
const modelPath = path.join(__dirname, 'models', 'model.gguf');
```

### Performance

**Embeddings are slow:**
- Use smaller quantized models (Q4_K_M is recommended)
- Process texts in batches instead of one-by-one
- Verify native module is loaded (check `result.provider === 'llamacpp'`)

**High memory usage:**
- Models stay loaded in memory for performance
- Use smaller models (bge-small instead of bge-large)
- Process files in chunks for very large datasets

## Features

- **🎯 Provider Agnostic** - One API for all embedding providers
- **🤖 Smart Auto-Detection** - Automatically uses the best available option
- **⚡ Native Performance** - C++ via N-API for maximum speed
- **🔄 Automatic Fallbacks** - Seamlessly switches providers if one fails
- **📁 File Support** - Read and embed text files directly
- **📦 Batch Processing** - Efficient multi-document embedding
- **🛡️ TypeScript First** - Full type safety and IDE autocomplete
- **🌍 Zero Setup** - Native module compiles automatically on install
- **🔒 Privacy-First** - Local processing keeps your data private

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built on top of excellent open-source projects:

- [llama.cpp](https://github.com/ggml-org/llama.cpp) - High-performance LLM inference
- [OpenAI](https://openai.com/) - text-embedding-3 models
- [Google Gemini](https://ai.google.dev/) - gemini-embedding models
- [Mistral AI](https://mistral.ai/) - mistral-embed model

## Contributing

Issues and pull requests welcome at [github.com/box-safe/vecbox](https://github.com/box-safe/vecbox)

---

**⭐ If Vecbox saves you time, star us on GitHub!**

**Made with ❤️ for developers who value simplicity and performance**