# embed-Kit v1.0.0

![Embed Kit](./src/images/embed-kit.png)
[![npm version](https://img.shields.io/npm/v/embed-kit.svg)](https://www.npmjs.com/package/embed-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why Embed Kit?

**One API, multiple providers.** Switch between OpenAI, Gemini, or run locally with Llama.cpp without changing code.
```typescript
// Works with any provider
const result = await autoEmbed({ text: 'Hello, world!' });
console.log(result.embedding); // [0.1, 0.2, ...]
```

## Installation
```bash
npm install embed-kit
```

## Quick Start

### Auto-detect (Recommended)
```typescript
import { autoEmbed } from 'embed-kit';

const result = await autoEmbed({ text: 'Your text' });
// Automatically uses: Llama.cpp (local) → OpenAI → Gemini → ...
```

### Specific Provider
```typescript
import { embed } from 'embed-kit';

const result = await embed(
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  { text: 'Your text' }
);
```

## Providers

<details>
<summary><b>OpenAI</b></summary>
```typescript
await embed(
  {
    provider: 'openai',
    model: 'text-embedding-3-small', // or text-embedding-3-large
    apiKey: process.env.OPENAI_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [platform.openai.com](https://platform.openai.com)

</details>

<details>
<summary><b>Google Gemini</b></summary>
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

**Setup:** Get API key at [aistudio.google.com](https://aistudio.google.com)

</details>

<details>
<summary><b>Llama.cpp (Local)</b></summary>
```typescript
await embed(
  { provider: 'llamacpp', model: 'nomic-embed-text-v1.5.Q4_K_M.gguf' },
  { text: 'Your text' }
);
```

**Setup:**
```bash
# 1. Install
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make llama-server

# 2. Download model
wget https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf

# 3. Run server
./llama-server -m nomic-embed-text-v1.5.Q4_K_M.gguf --embedding --port 8080
```

</details>

<details>
<summary><b>Anthropic Claude</b></summary>
```typescript
await embed(
  {
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [console.anthropic.com](https://console.anthropic.com)

</details>

<details>
<summary><b>Mistral</b></summary>
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

**Setup:** Get API key at [mistral.ai](https://mistral.ai)

</details>

<details>
<summary><b>DeepSeek</b></summary>
```typescript
await embed(
  {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  { text: 'Your text' }
);
```

**Setup:** Get API key at [platform.deepseek.com](https://platform.deepseek.com)

</details>

## Common Use Cases

### Semantic Search
```typescript
// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const query = await autoEmbed({ text: 'machine learning' });
const docs = await Promise.all(
  documents.map(doc => autoEmbed({ text: doc }))
);

// Find most similar
const scores = docs.map(doc => 
  cosineSimilarity(query.embedding, doc.embedding)
);
const mostSimilar = scores.indexOf(Math.max(...scores));
console.log(`Best match: ${documents[mostSimilar]}`);
```

### Text Similarity
```typescript
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const [emb1, emb2] = await Promise.all([
  autoEmbed({ text: 'cat sleeping' }),
  autoEmbed({ text: 'cat napping' })
]);

const similarity = cosineSimilarity(emb1.embedding, emb2.embedding);
console.log(`Similarity: ${similarity.toFixed(3)}`); // → 0.95 (very similar)
```

### Batch Processing
```typescript
const results = await embed(
  { provider: 'openai', apiKey: 'key' },
  [
    { text: 'Text 1' },
    { text: 'Text 2' },
    { filePath: './doc.txt' }
  ]
);
// → { embeddings: [[...], [...], [...]], dimensions: 1536 }

console.log(`Processed ${results.embeddings.length} texts`);
console.log(`Dimensions: ${results.dimensions}`);
```

### File Processing
```typescript
import { readdir } from 'fs/promises';
import { join } from 'path';

async function embedAllFiles(dirPath: string) {
  const files = await readdir(dirPath);
  const textFiles = files.filter(file => file.endsWith('.txt'));
  
  const inputs = textFiles.map(file => ({
    filePath: join(dirPath, file)
  }));
  
  const results = await embed(
    { provider: 'llamacpp' },
    inputs
  );
  
  return textFiles.map((file, index) => ({
    file,
    embedding: results.embeddings[index]
  }));
}

const embeddings = await embedAllFiles('./documents');
console.log(`Processed ${embeddings.length} files`);
```

## API

### `autoEmbed(input)`

Auto-detects best provider in priority order:
1. **Llama.cpp** (Local & Free)
2. **OpenAI** (if API key available)
3. **Gemini** (if API key available)
4. **Claude** (if API key available)
5. **Mistral** (if API key available)
6. **DeepSeek** (if API key available)

```typescript
await autoEmbed({ text: string } | { filePath: string })
```

### `embed(config, input)`

Explicit provider selection.
```typescript
await embed(
  { provider, model?, apiKey?, baseUrl?, timeout?, maxRetries? },
  { text: string } | { filePath: string } | Array
)
```

**Returns:**
```typescript
{
  embedding: number[],
  dimensions: number,
  provider: string,
  model: string,
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  }
}
```

### `getSupportedProviders()`

Returns available providers.
```typescript
import { getSupportedProviders } from 'embed-kit';

const providers = getSupportedProviders();
// → ['openai', 'gemini', 'claude', 'mistral', 'deepseek', 'llamacpp']
```

### `createProvider(config)`

Create provider instance for advanced usage.
```typescript
import { createProvider } from 'embed-kit';

const provider = createProvider({
  provider: 'openai',
  model: 'text-embedding-3-small',
  apiKey: 'your-key'
});

const isReady = await provider.isReady();
if (isReady) {
  const result = await provider.embed({ text: 'Hello' });
}
```

## Environment Variables
```bash
# .env file
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
DEEPSEEK_API_KEY=...
```

## Error Handling

```typescript
import { autoEmbed } from 'embed-kit';

try {
  const result = await autoEmbed({ text: 'Hello' });
  console.log(result.embedding);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Please set up your API keys in .env');
  } else if (error.message.includes('not ready')) {
    console.error('Provider is not available');
  } else if (error.message.includes('network')) {
    console.error('Network connection failed');
  } else {
    console.error('Embedding failed:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with type definitions:
```typescript
import { 
  autoEmbed, 
  embed, 
  getSupportedProviders, 
  createProvider,
  type EmbedConfig,
  type EmbedInput,
  type EmbedResult 
} from 'embed-kit';

// Full type safety
const config: EmbedConfig = {
  provider: 'openai',
  model: 'text-embedding-3-small'
};

const input: EmbedInput = {
  text: 'Your text here'
};

const result: EmbedResult = await embed(config, input);
```

## License

MIT © Embed Kit Team

## Links

- [npm](https://www.npmjs.com/package/embed-kit)
- [GitHub](https://github.com/box-safe/embed-kit)
- [Documentation](https://embed-kit.dev)

---

**Embed Kit v1.0.0** - One API, multiple providers. Simple embeddings.