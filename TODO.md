# TODO - Implementar N-API para Llama.cpp Embeddings

## 🎯 **Objetivo: Criar módulo Node.js nativo com N-API para embeddings locais**

### **Contexto:**
- ❌ **HTTP API requer servidor externo**
- ✅ **N-API integra diretamente com Node.js**
- 🎯 **Solução:** Módulo nativo que carrega llama.cpp diretamente

---

## 📋 **Plano Numerado - Implementação N-API**

### **1. Estrutura do Projeto N-API**
- [ ] **Criar pasta `native/`**
  - [ ] `native/binding.gyp` - Configuração de build
  - [ ] `native/llama_embedding.cpp` - Código C++ principal
  - [ ] `native/index.js` - Interface JavaScript
  - [ ] `native/package.json` - Dependências específicas

### **2. Configuração de Build (binding.gyp)**
- [ ] **Definir targets**
  - [ ] Compilar código C++ do llama.cpp
  - [ ] Linkar com bibliotecas necessárias
  - [ ] Configurar para múltiplas plataformas
- [ ] **Include paths**
  - [ ] `../core/` - Código do llama.cpp
  - [ ] `../core/ggml-cpu/` - Implementações CPU
  - [ ] Headers necessários

### **3. Implementação C++ Principal**
- [ ] **Classe LlamaEmbedding**
  - [ ] Carregar modelo GGUF
  - [ ] Inicializar contexto llama.cpp
  - [ ] Método `embed(text)` retorna array<float>
- [ ] **Integração N-API**
  - [ ] `Init()` - Inicialização do módulo
  - [ ] `CreateEmbedding()` - Função exportada
  - [ ] Tratamento de erros e memória

### **4. Interface JavaScript**
- [ ] **Wrapper simples**
  - [ ] `create(modelPath)` - Carrega modelo
  - [ ] `embed(text)` - Gera embedding
  - [ ] `close()` - Libera recursos
- [ ] **Error handling**
  - [ ] Try/catch para chamadas nativas
  - [ ] Mensagens de erro amigáveis
  - [ ] Validação de parâmetros

### **5. Integração com Provider Existente**
- [ ] **Modificar LlamaCppProvider**
  - [ ] Importar módulo nativo
  - [ ] Substituir chamadas HTTP
  - [ ] Manter interface atual
- [ ] **Fallback**
  - [ ] Manter HTTP como fallback
  - [ ] Detecção automática
  - [ ] Configuração via parâmetro

### **6. Build e Distribuição**
- [ ] **Scripts de build**
  - [ ] `npm run build:native` - Compila módulo
  - [ ] `npm run prebuild` - Binários pré-compilados
  - [ ] Integração com build principal
- [ ] **Multiplataforma**
  - [ ] Linux x64
  - [ ] macOS x64/arm64
  - [ ] Windows x64

### **7. Testes e Validação**
- [ ] **Testes unitários**
  - [ ] Carregamento de modelo
  - [ ] Geração de embedding
  - [ ] Performance vs HTTP
- [ ] **Testes de integração**
  - [ ] Com provider atual
  - [ ] Com diferentes modelos
  - [ ] Com textos variados

### **8. Documentação**
- [ ] **README**
  - [ ] Como instalar dependências nativas
  - [ ] Exemplos de uso
  - [ ] Troubleshooting
- [ ] **API Documentation**
  - [ ] Métodos disponíveis
  - [ ] Parâmetros e retorno
  - [ ] Códigos de erro

---

## 🚀 **Status Atual**

### **✅ Concluído:**
- ✅ Análise do código llama.cpp completo
- ✅ Core do GGML disponível
- ✅ Plano N-API criado

### **🔄 Em Progresso:**
- 🔄 Task 1: Estrutura do projeto N-API

### **⏳ Próximos Passos:**
- ⏳ Criar estrutura de pastas
- ⏳ Configurar binding.gyp
- ⏳ Implementar classe C++ principal

---

## 📝 **Notas Técnicas**

### **Vantagens da Abordagem N-API:**
✅ Performance nativa (sem overhead HTTP)  
✅ Integração direta com Node.js  
✅ Distribuição via npm  
✅ Sem necessidade de servidor externo  
✅ Melhor gerenciamento de memória  

### **Estrutura Esperada:**
```
native/
├── binding.gyp           <- Configuração build
├── llama_embedding.cpp    <- Código C++ principal  
├── index.js            <- Interface JS
└── package.json        <- Deps específicas
```

### **API JavaScript Esperada:**
```javascript
const llama = require('./native');

// Carrega modelo
const model = llama.create('path/to/model.gguf');

// Gera embedding
const embedding = model.embed('Hello world');

// Libera recursos
model.close();
```

### **Integração com Provider:**
```typescript
// Em LlamaCppProvider
import llama from '../native';

private nativeModel = llama.create(modelPath);

async embed(input: EmbedInput): Promise<EmbedResult> {
  const text = await this.readInput(input);
  const embedding = this.nativeModel.embed(text);
  return { embedding, dimensions: embedding.length, ... };
}
```

---

**Próximo passo:** Iniciar Task 1 - Criar estrutura N-API