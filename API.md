# Vecbox API Documentation

## 🎯 Overview

Vecbox provides a **minimalist yet powerful API** for generating embeddings from multiple providers with automatic detection and fallback capabilities.

## 📦 Installation

```bash
npm install vecbox
```

## 🔧 Core Functions

### `embed(config, input)`

Generate embeddings using a specific provider.

**Parameters:**
- `config: EmbedConfig` - Provider configuration
- `input: EmbedInput | EmbedInput[]` - Text or file to embed

**Returns:** `Promise<EmbedResult | BatchEmbedResult>`

**Example:**
```typescript
import { embed } from 'vecbox';

const result = await embed(
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  { text: 'Hello, world!' }
);
```

### `autoEmbed(input)`

Automatically detect and use the best available provider.

**Parameters:**
- `input: EmbedInput | EmbedInput[]` - Text or file to embed

**Returns:** `Promise<EmbedResult | BatchEmbedResult>`

**Example:**
```typescript
import { autoEmbed } from 'vecbox';

// Automatically tries: Llama.cpp → OpenAI → Gemini → Mistral
const result = await autoEmbed({ text: 'Hello, world!' });
```

### `getSupportedProviders()`

Get list of available providers.

**Returns:** `ProviderType[]`

**Example:**
```typescript
import { getSupportedProviders } from 'vecbox';

const providers = getSupportedProviders();
// → ['openai', 'gemini', 'mistral', 'llamacpp']
```

### `createProvider(config)`

Create a specific provider instance for advanced usage.

**Parameters:**
- `config: EmbedConfig` - Provider configuration

**Returns:** `EmbeddingProvider`

**Example:**
```typescript
import { createProvider } from 'vecbox';

const provider = createProvider({
  provider: 'llamacpp',
  model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
});
```

## 📋 Types

### `EmbedConfig`

Configuration for embedding providers.

```typescript
interface EmbedConfig {
  provider: ProviderType;     // Required: provider name
  model?: string;             // Optional: model name
  apiKey?: string;            // Optional: API key
  baseUrl?: string;           // Optional: custom base URL
  timeout?: number;           // Optional: request timeout
  maxRetries?: number;        // Optional: retry attempts
}
```

### `EmbedInput`

Input for embedding generation.

```typescript
interface EmbedInput {
  text?: string;              // Either text OR filePath
  filePath?: string;          // Path to text file
}
```

### `EmbedResult`

Result from single embedding generation.

```typescript
interface EmbedResult {
  embedding: number[];        // Embedding vector
  dimensions: number;         // Vector dimensions
  model: string;              // Model used
  provider: string;           // Provider name
  usage?: {                   // Optional usage stats
    promptTokens?: number;
    totalTokens?: number;
  };
}
```

### `BatchEmbedResult`

Result from batch embedding generation.

```typescript
interface BatchEmbedResult {
  embeddings: number[][];     // Array of embedding vectors
  dimensions: number;         // Vector dimensions
  model: string;              // Model used
  provider: string;           // Provider name
  usage?: {                   // Optional usage stats
    promptTokens?: number;
    totalTokens?: number;
  };
}
```

### `ProviderType`

Available provider types.

```typescript
type ProviderType = 
  | 'openai'      // OpenAI embeddings
  | 'gemini'      // Google Gemini embeddings
  | 'mistral'     // Mistral AI embeddings
  | 'llamacpp';   // Local Llama.cpp embeddings
```

## 🚀 Provider-Specific Examples

### OpenAI

```typescript
import { embed } from 'vecbox';

const result = await embed(
  {
    provider: 'openai',
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY
  },
  { text: 'Your text here' }
);
```

### Google Gemini

```typescript
import { embed } from 'vecbox';

const result = await embed(
  {
    provider: 'gemini',
    model: 'gemini-embedding-001',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
  },
  { text: 'Your text here' }
);
```

### Mistral AI

```typescript
import { embed } from 'vecbox';

const result = await embed(
  {
    provider: 'mistral',
    model: 'mistral-embed',
    apiKey: process.env.MISTRAL_API_KEY
  },
  { text: 'Your text here' }
);
```

### Llama.cpp (Local)

```typescript
import { embed } from 'vecbox';

const result = await embed(
  {
    provider: 'llamacpp',
    model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
  },
  { text: 'Your text here' }
);
```

## 📁 File Input

Embed text from files:

```typescript
import { embed } from 'vecbox';

const result = await embed(
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  { filePath: './document.txt' }
);
```

## 🔄 Batch Processing

Process multiple texts at once:

```typescript
import { embed } from 'vecbox';

const inputs = [
  { text: 'First text' },
  { text: 'Second text' },
  { text: 'Third text' }
];

const result = await embed(
  { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  inputs
);

// result.embeddings is an array of embedding vectors
console.log(result.embeddings.length); // 3
```

## ⚡ Performance Tips

### 1. Use Auto-Detection
```typescript
// Best for most use cases
const result = await autoEmbed({ text: 'text' });
```

### 2. Batch Processing
```typescript
// More efficient than individual calls
const result = await embed(config, multipleInputs);
```

### 3. Local Embeddings (Fastest)
```typescript
// Use Llama.cpp for maximum performance
const result = await embed(
  { provider: 'llamacpp', model: 'model.gguf' },
  { text: 'text' }
);
```

## 🛡️ Error Handling

```typescript
import { embed } from 'vecbox';

try {
  const result = await embed(config, input);
  console.log(result.embedding);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid API key');
  } else if (error.message.includes('quota')) {
    console.error('API quota exceeded');
  } else {
    console.error('Embedding failed:', error.message);
  }
}
```

## 🔍 Common Error Codes

| Error | Cause | Solution |
|-------|--------|----------|
| `API key is required` | Missing API key | Add `apiKey` to config |
| `quota exceeded` | API limit reached | Check billing/usage |
| `model not found` | Invalid model name | Use correct model name |
| `network timeout` | Slow connection | Increase `timeout` |
| `file not found` | Invalid file path | Check file exists |

## 🎛️ Advanced Usage

### Custom Provider Instance

```typescript
import { createProvider } from 'vecbox';

const provider = createProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
  maxRetries: 3
});

// Use provider directly
const result = await provider.embed({ text: 'text' });
```

### Checking Provider Availability

```typescript
import { createProvider } from 'vecbox';

const provider = createProvider({ provider: 'llamacpp' });
const isReady = await provider.isReady();

if (isReady) {
  console.log('Provider is ready');
} else {
  console.log('Provider not available');
}
```

### Getting Model Dimensions

```typescript
import { createProvider } from 'vecbox';

const provider = createProvider({ provider: 'openai' });
const dimensions = provider.getDimensions();

console.log(`Model dimensions: ${dimensions}`);
```

## 📚 More Examples

See the `examples/` directory for complete working examples of:
- Basic usage
- Batch processing
- File input
- Error handling
- Performance optimization

---

**Need help?** Check out our [Contributing Guide](./CONTRIBUTING.md) or open an issue on GitHub!
