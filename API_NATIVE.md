# LlamaCppProvider API Reference

## Overview
The `LlamaCppProvider` class provides local embedding generation using Llama.cpp with native N-API integration.

## Constructor

```typescript
constructor(config: LlamaCppConfig)
```

**Parameters:**
- `config` - Configuration object extending `EmbedConfig`
- `config.llamaPath` - Optional path to llama.cpp binary (default: './llama.cpp/build/bin/llama-embedding')
- `config.model` - Model filename (default: 'nomic-embed-text-v1.5.Q4_K_M.gguf')

**Example:**
```typescript
const provider = new LlamaCppProvider({
  model: 'custom-model.gguf',
  llamaPath: './custom-llama-path'
});
```

## Methods

### embed(input: EmbedInput): Promise<EmbedResult>

Generates embedding for a single text input.

**Parameters:**
- `input` - Text string or file path object

**Returns:**
```typescript
Promise<EmbedResult>
```

**Example:**
```typescript
const result = await provider.embed({ text: 'Hello world' });
console.log(result.embedding); // number[]
console.log(result.dimensions); // 768
console.log(result.model); // 'nomic-embed-text-v1.5.Q4_K_M.gguf'
console.log(result.provider); // 'llamacpp'
```

### embedBatch(inputs: EmbedInput[]): Promise<BatchEmbedResult>

Generates embeddings for multiple text inputs.

**Parameters:**
- `inputs` - Array of text strings or file path objects

**Returns:**
```typescript
Promise<BatchEmbedResult>
```

**Example:**
```typescript
const inputs = [
  { text: 'First text' },
  { text: 'Second text' },
  { text: 'Third text' }
];

const result = await provider.embedBatch(inputs);
console.log(result.embeddings.length); // 3
console.log(result.embeddings[0].length); // 768
```

### isReady(): Promise<boolean>

Checks if the provider is ready to generate embeddings.

**Returns:**
```typescript
Promise<boolean>
```

**Example:**
```typescript
const ready = await provider.isReady();
console.log(ready); // true if native module is available
```

### getDimensions(): number

Returns the embedding dimensions for the current model.

**Returns:**
```typescript
number
```

**Example:**
```typescript
const dimensions = provider.getDimensions();
console.log(dimensions); // 768 for nomic-embed-text-v1.5
```

### getProviderName(): string

Returns the provider name.

**Returns:**
```typescript
string
```

**Example:**
```typescript
const name = provider.getProviderName();
console.log(name); // 'Llama.cpp'
```

### cleanup(): Promise<void>

Cleans up native module resources.

**Example:**
```typescript
await provider.cleanup();
console.log('Native module cleaned up');
```

## Configuration

### LlamaCppConfig Interface

```typescript
interface LlamaCppConfig extends EmbedConfig {
  llamaPath?: string;  // Optional custom llama.cpp binary path
  model?: string;       // Optional model filename
}
```

## Native Module Integration

The provider automatically detects and uses the native N-API module when available:

1. **Auto-detection**: Checks if `require('../../native')` succeeds
2. **Fallback**: Falls back to HTTP if native module fails
3. **Performance**: Native module is ~10x faster than HTTP fallback

## Error Handling

Common errors and their solutions:

### Model Loading Errors
- `Model file not found` - Check model path and file existence
- `Failed to load model` - Verify model format and permissions

### Native Module Errors
- `binding.createModel is not a function` - Rebuild native module
- `Failed to initialize native module` - Check native compilation

### Performance Issues
- Slow embeddings - Ensure native module is being used (not HTTP fallback)
- Memory errors - Reduce batch size or use cleanup()

## Usage Patterns

### Auto-detection (Recommended)
```typescript
import { autoEmbed } from 'vecbox';

// Automatically uses native when available
const result = await autoEmbed({ text: 'Your text' });
```

### Manual Native Configuration
```typescript
import { embed } from 'vecbox';

// Force native usage
const result = await embed(
  { provider: 'llamacpp', model: 'custom-model.gguf' },
  { text: 'Your text' }
);
```

### Batch Processing
```typescript
const inputs = [
  { text: 'Text 1' },
  { text: 'Text 2' },
  { text: 'Text 3' }
];

const result = await provider.embedBatch(inputs);
```

### Resource Management
```typescript
// Always cleanup when done
await provider.cleanup();
```
