# Llama.cpp Core
code taken from [llama.cpp](https://github.com/ggml-org/llama.cpp)
---
Estrutura funcional do código do llama.cpp para embeddings.

## 📁 Estrutura

```
core/
├── src/
│   ├── ggml/          # Biblioteca GGML principal
│   ├── llama/         # API do Llama.cpp
│   ├── ggml-cpu/      # Implementações CPU otimizadas
│   └── include/       # Headers públicos
├── CMakeLists.txt     # Configuração de build
└── README.md         # Este arquivo
```

## 🔨 Build

```bash
mkdir build
cd build
cmake ..
make -j$(nproc)
```

## 📦 Biblioteca

Gera `lib/libllamacpp_core.a` estática para linking.

## 🎯 Uso

Biblioteca base para implementação N-API de embeddings.
