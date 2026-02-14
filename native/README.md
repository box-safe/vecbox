# Native Llama.cpp Module

Módulo Node.js nativo para embeddings locais usando Llama.cpp diretamente.

## 🔨 Build

### Pré-requisitos
- Node.js 16+
- Python 3.8+
- C++ compiler (GCC/Clang/MSVC)
- CMake 3.16+

### Build Manual
```bash
cd native
npm install
npm run build
```

### Build Automático
```bash
# Do projeto raiz
npm run build:native
```

## 📦 Estrutura

```
native/
├── binding.gyp           <- Configuração build
├── llama_embedding.cpp  <- Código C++ principal  
├── index.js            <- Interface JS
├── package.json        <- Deps específicas
├── build/Release/     <- Binário compilado
└── README.md          <- Este arquivo
```

## 🚀 Uso

```javascript
const llama = require('./native');

// Carrega modelo
const model = llama.create('path/to/model.gguf');

// Gera embedding
const embedding = model.embed('Hello world');

// Libera recursos
model.close();
```

## 🔧 Integração

O módulo é automaticamente importado pelo `LlamaCppProvider` com fallback para HTTP se não disponível.

## 🐛 Troubleshooting

### Build falha
- Verifique se as dependências do sistema estão instaladas
- Certifique-se de que o Node.js versão 16+ está sendo usado
- Verifique se o CMake está disponível

### Módulo não carrega
- Verifique se o binário `llama_embedding.node` foi gerado
- Verifique se a arquitetura do binário corresponde ao sistema
- Consulte os logs para detalhes do erro
