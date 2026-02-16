# 🎓 **Guia Didático: Vitest + Mock de Módulos para Vecbox**

## 📋 **Sumário**
1. [Configuração do Vitest](#1-configuração-do-vitest)
2. [Conceitos Básicos de Testes](#2-conceitos-básicos-de-testes)
3. [Mock de Módulos](#3-mock-de-módulos)
4. [Testando Providers](#4-testando-providers)
5. [Testando Factory](#5-testando-factory)
6. [Testes de Integração](#6-testes-de-integração)
7. [Best Practices](#7-best-practices)

---

## 1️⃣ **Configuração do Vitest**

### **1.1 Instalação**
```bash
pnpm add -D vitest @vitest/ui jsdom
```

### **1.2 Configuração Básica**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,  // Permite usar describe, it, expect globalmente
    environment: 'node',  // Ambiente Node.js para testes de backend
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/util': resolve(__dirname, './src/util'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/factory': resolve(__dirname, './src/factory')
    }
  }
});
```

### **1.3 Scripts no package.json**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 2️⃣ **Conceitos Básicos de Testes**

### **2.1 Estrutura de um Teste**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Nome do Componente/Sistema', () => {
  // Executado antes de cada teste
  beforeEach(() => {
    // Setup do teste
  });

  // Executado depois de cada teste
  afterEach(() => {
    // Cleanup do teste
  });

  it('deve fazer algo específico', () => {
    // Arrange: Preparação
    const input = 'texto de teste';
    
    // Act: Execução
    const result = algumaFuncao(input);
    
    // Assert: Verificação
    expect(result).toBeDefined();
    expect(result).toBe('resultado esperado');
  });
});
```

### **2.2 Tipos de Asserts**
```typescript
import { expect } from 'vitest';

// Igualdade
expect(valor).toBe(42);              // ===
expect(valor).toEqual(42);           // ==
expect(valor).toStrictEqual(42);     // === + tipo estrito

// Verdadeiro/Falso
expect(valor).toBeTruthy();
expect(valor).toBeFalsy();
expect(valor).toBeDefined();
expect(valor).toBeUndefined();

// Números
expect(valor).toBeGreaterThan(10);
expect(valor).toBeLessThanOrEqual(100);
expect(valor).toBeCloseTo(3.1415, 2);

// Strings
expect(texto).toContain('substring');
expect(texto).toMatch(/regex/);
expect(texto).toHaveLength(10);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain('item');
expect(array).toEqual(['a', 'b', 'c']);

// Objetos
expect(objeto).toHaveProperty('nome');
expect(objeto).toMatchObject({ nome: 'João' });

// Exceções
expect(() => funcaoQueLancaErro()).toThrow('mensagem de erro');
```

### **2.3 Async/Await em Testes**
```typescript
it('deve lidar com promises', async () => {
  const result = await funcaoAssincrona();
  expect(result).toBeDefined();
});

it('deve lidar com rejeições', async () => {
  await expect(funcaoQueRejeita()).rejects.toThrow('erro');
});
```

---

## 3️⃣ **Mock de Módulos**

### **3.1 Mock Básico**
```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock de uma função
const mockFunction = vi.fn();
mockFunction('arg1', 'arg2');
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');

// Mock com retorno
mockFunction.mockReturnValue('resultado');
expect(mockFunction()).toBe('resultado');

// Mock com Promise
mockFunction.mockResolvedValue('resultado async');
await expect(mockFunction()).resolves.toBe('resultado async');
```

### **3.2 Mock de Módulos Inteiros**
```typescript
import { vi, describe, it, expect } from 'vitest';
import { EmbeddingFactory } from '@/factory/EmbeddingFactory';

// Mock do módulo de logger
vi.mock('@/util/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock do módulo nativo
vi.mock('@/native-loader.mjs', () => ({
  default: {
    createModel: vi.fn(),
    getEmbedding: vi.fn(),
    destroyModel: vi.fn()
  }
}));

describe('EmbeddingFactory com mocks', () => {
  it('deve criar provider com mock', async () => {
    const factory = new EmbeddingFactory();
    const provider = await factory.createBestProvider();
    
    expect(provider).toBeDefined();
  });
});
```

### **3.3 Mock de FileSystem**
```typescript
import { vi, describe, it, expect } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Mock do filesystem
vi.mock('node:fs/promises');
vi.mock('node:path');

describe('Path Resolution com Mock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve encontrar modelo no diretório atual', async () => {
    // Mock do path.join
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    
    // Mock do fs.access para simular arquivo existente
    vi.mocked(fs.access).mockResolvedValue(undefined);
    
    const result = await findModelPath('model.gguf');
    
    expect(fs.access).toHaveBeenCalledWith('core/models/model.gguf', 0);
    expect(result).toBe('core/models/model.gguf');
  });
});
```

### **3.4 Mock de APIs Externas**
```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock da API do Gemini
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      embedContent: vi.fn().mockResolvedValue({
        embedding: {
          values: [0.1, 0.2, 0.3]
        }
      })
    })
  })
}));

describe('Gemini Provider com Mock', () => {
  it('deve fazer embedding com mock da API', async () => {
    const provider = new GeminiProvider({ apiKey: 'fake-key' });
    
    const result = await provider.embed({
      input: 'texto de teste',
      model: 'gemini-embedding-001'
    });
    
    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.dimensions).toBe(3);
  });
});
```

---

## 4️⃣ **Testando Providers**

### **4.1 Teste do Llama.cpp Provider**
```typescript
// test/providers/llamacpp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LlamaCppProvider } from '@/providers/llamacpp';
import type { EmbedConfig } from '@/types';

// Mock do módulo nativo
vi.mock('@/native-loader.mjs', () => ({
  default: {
    createModel: vi.fn(),
    getEmbedding: vi.fn(),
    destroyModel: vi.fn()
  }
}));

// Mock do filesystem
vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  constants: { F_OK: 0 }
}));

describe('LlamaCppProvider', () => {
  let provider: LlamaCppProvider;
  let mockNativeModule: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNativeModule = {
      createModel: vi.fn().mockReturnValue('mock-model-ref'),
      getEmbedding: vi.fn().mockReturnValue([0.1, 0.2, 0.3]),
      destroyModel: vi.fn()
    };
    
    // Mock do import dinâmico
    vi.doMock('@/native-loader.mjs', () => ({
      default: mockNativeModule
    }));
    
    const config: EmbedConfig = {
      provider: 'llamacpp',
      model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
    };
    
    provider = new LlamaCppProvider(config);
  });

  it('deve inicializar corretamente', () => {
    expect(provider).toBeDefined();
    expect(provider.getModel()).toBe('nomic-embed-text-v1.5.Q4_K_M.gguf');
  });

  it('deve verificar se está pronto com modelo disponível', async () => {
    const { access } = await import('node:fs/promises');
    vi.mocked(access).mockResolvedValue(undefined);
    
    const isReady = await provider.isReady();
    
    expect(isReady).toBe(true);
    expect(access).toHaveBeenCalled();
  });

  it('deve fazer embedding com módulo nativo', async () => {
    const { access } = await import('node:fs/promises');
    vi.mocked(access).mockResolvedValue(undefined);
    
    const result = await provider.embed({
      input: 'texto de teste'
    });
    
    expect(mockNativeModule.getEmbedding).toHaveBeenCalledWith(
      'mock-model-ref',
      'texto de teste'
    );
    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.dimensions).toBe(3);
    expect(result.provider).toBe('llamacpp');
  });

  it('deve lançar erro para texto vazio', async () => {
    await expect(provider.embed({ input: '' }))
      .rejects.toThrow('Text input cannot be empty');
  });

  it('deve fazer fallback para HTTP se nativo falhar', async () => {
    // Simula falha do módulo nativo
    mockNativeModule.getEmbedding.mockImplementation(() => {
      throw new Error('Native module failed');
    });
    
    // Mock do fetch para HTTP fallback
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        embedding: [0.4, 0.5, 0.6],
        dimensions: 3
      })
    });
    
    const { access } = await import('node:fs/promises');
    vi.mocked(access).mockResolvedValue(undefined);
    
    const result = await provider.embed({
      input: 'texto de teste'
    });
    
    expect(result.embedding).toEqual([0.4, 0.5, 0.6]);
    expect(fetch).toHaveBeenCalled();
  });
});
```

### **4.2 Teste do Gemini Provider**
```typescript
// test/providers/gemini.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiProvider } from '@/providers/gemini';
import type { EmbedConfig } from '@/types';

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockGenerativeModel: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGenerativeModel = {
      embedContent: vi.fn()
    };
    
    vi.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue(mockGenerativeModel)
      }))
    }));
    
    const config: EmbedConfig = {
      provider: 'gemini',
      apiKey: 'test-api-key'
    };
    
    provider = new GeminiProvider(config);
  });

  it('deve inicializar corretamente', () => {
    expect(provider).toBeDefined();
    expect(provider.getModel()).toBe('gemini-embedding-001');
  });

  it('deve fazer embedding com sucesso', async () => {
    mockGenerativeModel.embedContent.mockResolvedValue({
      embedding: {
        values: [0.1, 0.2, 0.3, 0.4]
      }
    });
    
    const result = await provider.embed({
      input: 'texto de teste'
    });
    
    expect(mockGenerativeModel.embedContent).toHaveBeenCalledWith({
      content: {
        parts: [{ text: 'texto de teste' }]
      }
    });
    
    expect(result.embedding).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(result.dimensions).toBe(4);
    expect(result.provider).toBe('gemini');
  });

  it('deve lidar com erro da API', async () => {
    mockGenerativeModel.embedContent.mockRejectedValue(
      new Error('API Error')
    );
    
    await expect(provider.embed({ input: 'texto' }))
      .rejects.toThrow('API Error');
  });
});
```

---

## 5️⃣ **Testando Factory**

### **5.1 Teste da EmbeddingFactory**
```typescript
// test/factory/EmbeddingFactory.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingFactory } from '@/factory/EmbeddingFactory';
import { LlamaCppProvider } from '@/providers/llamacpp';
import { GeminiProvider } from '@/providers/gemini';

// Mock de todos os providers
vi.mock('@/providers/llamacpp', () => ({
  LlamaCppProvider: vi.fn().mockImplementation(() => ({
    isReady: vi.fn().mockResolvedValue(false),
    embed: vi.fn()
  }))
}));

vi.mock('@/providers/gemini', () => ({
  GeminiProvider: vi.fn().mockImplementation(() => ({
    isReady: vi.fn().mockResolvedValue(true),
    embed: vi.fn().mockResolvedValue({
      embedding: [0.1, 0.2],
      dimensions: 2,
      provider: 'gemini'
    })
  }))
}));

describe('EmbeddingFactory', () => {
  let factory: EmbeddingFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    factory = new EmbeddingFactory();
  });

  it('deve criar LlamaCpp provider quando disponível', async () => {
    // Mock LlamaCpp como disponível
    const mockLlamaCpp = new LlamaCppProvider({} as any);
    vi.mocked(mockLlamaCpp.isReady).mockResolvedValue(true);
    
    vi.mocked(LlamaCppProvider).mockReturnValue(mockLlamaCpp);
    
    const provider = await factory.createBestProvider();
    
    expect(LlamaCppProvider).toHaveBeenCalled();
  });

  it('deve fazer fallback para Gemini quando LlamaCpp falha', async () => {
    // Mock LlamaCpp como não disponível
    const mockLlamaCpp = new LlamaCppProvider({} as any);
    vi.mocked(mockLlamaCpp.isReady).mockResolvedValue(false);
    
    // Mock Gemini como disponível
    const mockGemini = new GeminiProvider({} as any);
    vi.mocked(mockGemini.isReady).mockResolvedValue(true);
    
    vi.mocked(LlamaCppProvider).mockReturnValue(mockLlamaCpp);
    vi.mocked(GeminiProvider).mockReturnValue(mockGemini);
    
    const provider = await factory.createBestProvider();
    
    expect(GeminiProvider).toHaveBeenCalled();
  });

  it('deve lançar erro quando nenhum provider está disponível', async () => {
    // Mock todos como não disponíveis
    const mockLlamaCpp = new LlamaCppProvider({} as any);
    const mockGemini = new GeminiProvider({} as any);
    
    vi.mocked(mockLlamaCpp.isReady).mockResolvedValue(false);
    vi.mocked(mockGemini.isReady).mockResolvedValue(false);
    
    vi.mocked(LlamaCppProvider).mockReturnValue(mockLlamaCpp);
    vi.mocked(GeminiProvider).mockReturnValue(mockGemini);
    
    await expect(factory.createBestProvider())
      .rejects.toThrow('No embedding provider available');
  });

  it('deve criar provider específico quando solicitado', async () => {
    const config = {
      provider: 'gemini',
      apiKey: 'test-key'
    };
    
    const provider = await factory.createProvider(config);
    
    expect(provider).toBeInstanceOf(GeminiProvider);
  });
});
```

---

## 6️⃣ **Testes de Integração**

### **6.1 Teste End-to-End Simulado**
```typescript
// test/integration/e2e.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingFactory } from '@/factory/EmbeddingFactory';

describe('Integração: Fluxo Completo', () => {
  let factory: EmbeddingFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    factory = new EmbeddingFactory();
  });

  it('deve fazer embedding completo com fallback', async () => {
    // Mock do módulo nativo para falhar
    vi.mock('@/native-loader.mjs', () => ({
      default: {
        createModel: vi.fn().mockReturnValue('mock-model'),
        getEmbedding: vi.fn().mockImplementation(() => {
          throw new Error('Native module failed');
        })
      }
    }));

    // Mock da API Gemini para funcionar
    vi.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          embedContent: vi.fn().mockResolvedValue({
            embedding: { values: [0.1, 0.2, 0.3] }
          })
        })
      }))
    }));

    // Mock do filesystem
    vi.mock('node:fs/promises', () => ({
      access: vi.fn().mockResolvedValue(undefined),
      constants: { F_OK: 0 }
    }));

    const provider = await factory.createBestProvider();
    const result = await provider.embed({
      input: 'texto de integração'
    });

    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.provider).toBe('gemini');
  });

  it('deve lidar com input de arquivo', async () => {
    // Mock do filesystem para leitura de arquivo
    vi.mock('node:fs/promises', () => ({
      access: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue('conteúdo do arquivo'),
      constants: { F_OK: 0 }
    }));

    const provider = await factory.createBestProvider();
    
    // Mock do embedding
    vi.spyOn(provider, 'embed').mockResolvedValue({
      embedding: [0.4, 0.5, 0.6],
      dimensions: 3,
      provider: 'llamacpp'
    });

    const result = await provider.embed({
      input: './test-file.txt'
    });

    expect(result.embedding).toEqual([0.4, 0.5, 0.6]);
  });
});
```

---

## 7️⃣ **Best Practices**

### **7.1 Estrutura de Testes**
```
test/
├── unit/           # Testes unitários isolados
│   ├── providers/
│   ├── factory/
│   └── util/
├── integration/    # Testes de integração
├── e2e/           # Testes end-to-end
├── fixtures/      # Dados de teste
└── helpers/       # Utilitários de teste
```

### **7.2 Helpers de Teste**
```typescript
// test/helpers/providers.ts
import { vi } from 'vitest';
import type { EmbeddingProvider } from '@/types';

export function createMockProvider(
  name: string,
  isReady: boolean = true,
  embedding: number[] = [0.1, 0.2, 0.3]
): Partial<EmbeddingProvider> {
  return {
    isReady: vi.fn().mockResolvedValue(isReady),
    embed: vi.fn().mockResolvedValue({
      embedding,
      dimensions: embedding.length,
      provider: name
    }),
    getModel: vi.fn().mockReturnValue(`${name}-model`)
  };
}

export function createMockNativeModule() {
  return {
    createModel: vi.fn().mockReturnValue('mock-model'),
    getEmbedding: vi.fn().mockReturnValue([0.1, 0.2, 0.3]),
    destroyModel: vi.fn()
  };
}
```

### **7.3 Fixtures de Teste**
```typescript
// test/fixtures/data.ts
export const FIXTURES = {
  texts: {
    short: 'texto curto',
    long: 'texto'.repeat(1000),
    empty: '',
    special: 'texto com émojis 🚀 e caracteres especiais'
  },
  embeddings: {
    small: [0.1, 0.2, 0.3],
    medium: Array(768).fill(0).map((_, i) => i * 0.001),
    large: Array(3072).fill(0).map((_, i) => Math.sin(i * 0.01))
  },
  configs: {
    llamacpp: {
      provider: 'llamacpp',
      model: 'nomic-embed-text-v1.5.Q4_K_M.gguf'
    },
    gemini: {
      provider: 'gemini',
      apiKey: 'test-api-key'
    }
  }
};
```

### **7.4 Setup Global de Testes**
```typescript
// test/setup.ts
import { vi } from 'vitest';

// Mock global do console para testes
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock do fetch global
global.fetch = vi.fn();

// Setup de limpeza após cada teste
afterEach(() => {
  vi.clearAllMocks();
});
```

### **7.5 Comandos Úteis**
```bash
# Rodar todos os testes
pnpm test

# Rodar em modo watch
pnpm test:watch

# Rodar com coverage
pnpm test:coverage

# Rodar testes específicos
pnpm test llamacpp

# Rodar com UI
pnpm test:ui

# Rodar apenas testes que falharam
pnpm test --reporter=verbose
```

---

## 🎯 **Resumo Prático**

### **Para Começar Imediatamente:**
1. **Instale**: `pnpm add -D vitest @vitest/ui`
2. **Configure**: Crie `vitest.config.ts`
3. **Crie primeiro teste**: `test/unit/providers.test.ts`
4. **Rode**: `pnpm test`

### **Mock Essencial:**
```typescript
// Mock de módulo nativo
vi.mock('@/native-loader.mjs', () => ({
  default: {
    createModel: vi.fn(),
    getEmbedding: vi.fn(),
    destroyModel: vi.fn()
  }
}));
```

### **Teste Básico:**
```typescript
it('deve fazer embedding', async () => {
  const provider = new LlamaCppProvider(config);
  const result = await provider.embed({ input: 'texto' });
  
  expect(result.embedding).toBeDefined();
  expect(result.dimensions).toBeGreaterThan(0);
});
```

Agora você tem tudo o que precisa para testar a Vecbox com Vitest! 🚀
