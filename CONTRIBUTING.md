# Contributing to Vecbox

🚀 **Welcome!** We're excited to have you contribute to the most powerful embedding library available!

## 🎯 What is Vecbox?

Vecbox is a **minimalist and powerful embedding library** that supports multiple providers with automatic detection and fallback capabilities. Our unique feature is the **native Llama.cpp integration** using N-API for maximum performance.

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- C++ compiler (GCC/Clang/MSVC)
- CMake 3.16+

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/box-safe/vecbox.git
cd vecbox

# Install dependencies
npm install

# Build TypeScript
npm run build

# Build native module (optional - for development)
npm run build:native

# Run tests
npm test
```

## 📁 Project Structure

```
vecbox/
├── src/                    # TypeScript source code
│   ├── providers/          # Embedding providers
│   ├── factory/           # Provider factory
│   ├── types/             # Type definitions
│   └── util/              # Utilities
├── native/                 # N-API native module
│   ├── binding.gyp        # Build configuration
│   ├── llama_embedding.cpp # C++ implementation
│   └── index.js          # JavaScript interface
├── core/                   # Llama.cpp core code
│   └── src/               # Organized source files
├── test/                   # Test files
├── docs/                   # Documentation
└── examples/               # Usage examples
```

## 🏗️ Architecture

### Provider System
Vecbox uses a **Factory + Strategy pattern**:

```typescript
// Factory creates providers
const provider = EmbeddingFactory.create(config);

// Strategy pattern for different providers
class OpenAIProvider extends EmbeddingProvider { }
class GeminiProvider extends EmbeddingProvider { }
class LlamaCppProvider extends EmbeddingProvider { }
```

### Native Integration
Our **Llama.cpp N-API module** provides:
- Direct C++ integration (no HTTP overhead)
- Automatic fallback to HTTP if native fails
- Cross-platform compatibility

## 🔧 How to Contribute

### 1. Adding a New Provider

**Step 1: Create Provider Class**
```typescript
// src/providers/newprovider.ts
import { EmbeddingProvider } from '@providers/base/EmbeddingProvider';

export class NewProvider extends EmbeddingProvider {
  constructor(config: EmbedConfig) {
    super({ ...config, provider: 'newprovider' });
  }

  async embed(input: EmbedInput): Promise<EmbedResult> {
    // Implementation here
  }

  getDimensions(): number {
    return 768; // or model-specific
  }

  getProviderName(): string {
    return 'New Provider';
  }

  async isReady(): Promise<boolean> {
    // Check if provider is ready
    return true;
  }
}
```

**Step 2: Update Factory**
```typescript
// src/factory/EmbeddingFactory.ts
import { NewProvider } from '@providers/newprovider';

private static providers = new Map<ProviderType, new (config: EmbedConfig) => EmbeddingProvider>([
  ['openai', OpenAIProvider],
  ['gemini', GeminiProvider],
  ['newprovider', NewProvider], // Add this
  ['mistral', MistralProvider],
  ['llamacpp', LlamaCppProvider],
]);
```

**Step 3: Update Types**
```typescript
// src/types/index.ts
export type ProviderType = 
  | 'openai'
  | 'gemini' 
  | 'newprovider' // Add this
  | 'mistral'
  | 'llamacpp';
```

**Step 4: Add Tests**
```typescript
// test/newprovider.test.ts
import { NewProvider } from '../src/providers/newprovider';

describe('NewProvider', () => {
  // Test implementation
});
```

### 2. Modifying Native Module

**For Llama.cpp core changes:**
1. Modify files in `core/src/`
2. Update `core/CMakeLists.txt` if needed
3. Rebuild with `npm run build:native`

**For N-API changes:**
1. Modify `native/llama_embedding.cpp`
2. Update `native/binding.gyp` if adding sources
3. Rebuild with `npm run build:native`

### 3. Adding Examples

Create examples in `examples/` folder:
```typescript
// examples/new-feature.ts
import { embed, autoEmbed } from 'vecbox';

// Example implementation
```

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:native      # Native module tests
npm run test:integration # Integration tests
```

### Test Structure
- **Unit tests**: Individual provider functionality
- **Integration tests**: End-to-end workflows
- **Native tests**: N-API module functionality

## 📝 Code Style

### TypeScript Guidelines
- Use strict TypeScript
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use `@src/` path aliases

### C++ Guidelines
- Follow Google C++ Style Guide
- Use RAII for resource management
- Add comprehensive error handling
- Use N-API patterns correctly

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Environment**: Node.js version, OS, platform
2. **Reproduction steps**: Minimal code to reproduce
3. **Expected vs Actual**: What should happen vs what happens
4. **Error logs**: Complete error messages

## 💡 Feature Requests

We welcome feature requests! Please:
1. Check existing issues first
2. Describe the use case clearly
3. Consider if it fits our minimalist philosophy
4. Suggest implementation approach if possible

## 🚀 Release Process

1. **Development**: Work on feature branch
2. **Testing**: Ensure all tests pass
3. **Documentation**: Update relevant docs
4. **PR**: Create pull request with description
5. **Review**: Code review and discussion
6. **Merge**: Merge to main branch
7. **Release**: Version bump and publish

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Invited to maintainer discussions
- Eligible for maintainer status

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs/features
- **Discord**: Join our community (link in README)

## 📜 Code of Conduct

Please be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

**Thank you for contributing to Vecbox!** 🎉

Together we're building the **best embedding library** in the ecosystem!
