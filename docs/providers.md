# Embedding Providers Documentation

This document describes each embedding provider available in Embed Kit.

## OpenAI Provider

**Description**: OpenAI's embedding models for text-to-vector conversion.

**Models**:
- `text-embedding-3-large` (3072 dimensions)
- `text-embedding-3-small` (1536 dimensions) 
- `text-embedding-ada-002` (1536 dimensions)

**Setup**:
```typescript
import { EmbeddingFactory } from 'embed-kit';

const provider = EmbeddingFactory.create({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-small'
});
```

**Environment Variables**:
- `OPENAI_API_KEY`: Your OpenAI API key

**Usage**:
```typescript
const result = await provider.embed({
  text: "Your text here"
});

// Batch embedding
const results = await provider.embedBatch([
  { text: "First text" },
  { text: "Second text" }
]);
```

---

## Google Gemini Provider

**Description**: Google's Gemini embedding models.

**Models**:
- `embedding-001` (768 dimensions)
- `multimodalembedding` (768 dimensions)

**Setup**:
```typescript
const provider = EmbeddingFactory.create({
  provider: 'gemini',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  model: 'embedding-001'
});
```

**Environment Variables**:
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google AI API key

---

## Mistral Provider

**Description**: Mistral AI's embedding models.

**Models**:
- `mistral-embed` (1024 dimensions)

**Setup**:
```typescript
const provider = EmbeddingFactory.create({
  provider: 'mistral',
  apiKey: process.env.MISTRAL_API_KEY,
  model: 'mistral-embed'
});
```

**Environment Variables**:
- `MISTRAL_API_KEY`: Your Mistral API key

---

## DeepSeek Provider

**Description**: DeepSeek's embedding models.

**Models**:
- `deepseek-chat` (4096 dimensions)

**Setup**:
```typescript
const provider = EmbeddingFactory.create({
  provider: 'deepseek',
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: 'deepseek-chat'
});
```

**Environment Variables**:
- `DEEPSEEK_API_KEY`: Your DeepSeek API key

---

## Transformers Provider (Local)

**Description**: Local embedding models using Transformers.js. Runs completely offline.

**Models**:
- `Xenova/all-MiniLM-L6-v2` (384 dimensions)
- `Xenova/all-mpnet-base-v2` (768 dimensions)
- Any sentence-transformers model from Hugging Face

**Setup**:
```typescript
const provider = EmbeddingFactory.create({
  provider: 'transformers',
  model: 'Xenova/all-MiniLM-L6-v2'
});
```

**Features**:
- ✅ Completely offline
- ✅ No API keys required
- ✅ Free to use
- ⚠️ Requires model download on first use

**Environment Variables**:
- None required

---

## Claude Provider (Anthropic)

**Status**: ⚠️ **Not Available**

**Description**: Anthropic's Claude models.

**Current Status**: Claude does not have a native embeddings API yet. Use another provider for embeddings.

**Setup**:
```typescript
// This will throw an error
const provider = EmbeddingFactory.create({
  provider: 'claude',
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

**Environment Variables**:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

---

## Common Usage Patterns

### File Input
All providers support file input:

```typescript
const result = await provider.embed({
  filePath: './document.txt'
});
```

### Error Handling
```typescript
try {
  const result = await provider.embed({ text: "Hello" });
  console.log(`Embedding dimensions: ${result.dimensions}`);
} catch (error) {
  console.error('Embedding failed:', error.message);
}
```

### Provider Readiness Check
```typescript
const isReady = await provider.isReady();
if (!isReady) {
  console.log('Provider not ready');
}
```

## Choosing a Provider

| Provider | Cost | Speed | Offline | Privacy | Best For |
|-----------|-------|--------|----------|-----------|
| Transformers | Free | Fast | ✅ High | Local/Privacy |
| OpenAI | $$ | Fast | ❌ Low | Quality/Production |
| Gemini | $ | Fast | ❌ Medium | Google Ecosystem |
| Mistral | $ | Fast | ❌ Medium | European Users |
| DeepSeek | $ | Fast | ❌ Medium | Budget-conscious |
| Claude | N/A | N/A | ❌ High | Not Available |
