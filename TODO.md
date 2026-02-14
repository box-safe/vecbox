# vecbox - TODO
 
## 🎯 **Objetivo Principal: Implementar embeddings locais com llama.cpp**
 
### **Contexto:**
- ✅ **Sharp removido** - Dependência problemática eliminada
- ✅ **ONNX Runtime removido** - Não ideal para embeddings de linguagem
- ✅ **llama.cpp compilado** - Modelo nomic-embed-text-v1.5.Q4_K_M.gguf baixado
- 🎯 **Meta:** Usar API nativa do llama.cpp sem dependências externas
 
---
 
## 📋 **Tasks Divididas - Implementação llama.cpp**
 
### **Task 1: Análise da API llama.cpp**
- [ ] **Estudar estrutura do embedding.cpp**
  - [ ] Entender parâmetros de linha de comando
  - [ ] Identificar formato de saída (JSON, array, raw)
  - [ ] Mapear opções de pooling e normalização
- [ ] **Analisar exemplos de uso**
  - [ ] Comando básico: `./llama-embedding -m model.gguf -p "texto"`
  - [ ] Batch processing: `--embd-separator` e `--embd-output-format`
  - [ ] Opções de GPU: `--n-gpu-layers`
 
### **Task 2: Arquitetura do Provider llama.cpp**
- [ ] **Criar LlamaCppProvider**
  - [ ] Herdar de EmbeddingProvider
  - [ ] Implementar detecção do llama.cpp na raiz do usuário
  - [ ] Configurar caminho do modelo GGUF
- [ ] **Implementar interface de comando**
  - [ ] Usar `child_process.spawn` para chamar llama-embedding
  - [ ] Capturar stdout/stderr para processamento
  - [ ] Parsear saída JSON/array para embedding
 
### **Task 3: Detecção e Configuração**
- [ ] **Implementar detecção automática**
  - [ ] Buscar `./llama-embedding` ou `./build/bin/llama-embedding`
  - [ ] Verificar permissões de execução
  - [ ] Validar existência do modelo GGUF
- [ ] **Configuração de caminhos**
  - [ ] Suporte a caminhos relativos e absolutos
  - [ ] Fallback para `~/llama.cpp/llama-embedding`
  - [ ] Configuração via environment variables
 
### **Task 4: Processamento de Embeddings**
- [ ] **Processamento individual**
  - [ ] Executar comando com texto único
  - [ ] Parsear saída para array de números
  - [ ] Aplicar normalização se necessário
- [ ] **Processamento em batch**
  - [ ] Usar `--embd-separator` para múltiplos textos
  - [ ] Processar saída JSON para arrays
  - [ ] Otimizar performance para batches
 
### **Task 5: Integração com Factory**
- [ ] **Registrar LlamaCppProvider**
  - [ ] Adicionar ao EmbeddingFactory
  - [ ] Incluir no tipo ProviderType
  - [ ] Configurar como primeira opção no autoEmbed
- [ ] **Testes de integração**
  - [ ] Testar com modelo nomic-embed-text-v1.5
  - [ ] Validar dimensões (768 para nomic-embed-text-v1.5)
  - [ ] Testar fallback para providers de API
 
### **Task 6: Tratamento de Erros**
- [ ] **Validação de dependências**
  - [ ] Verificar se llama.cpp existe
  - [ ] Validar modelo GGUF disponível
  - [ ] Mensagens de erro amigáveis
- [ ] **Fallback robusto**
  - [ ] Tentar providers de API se llama.cpp falhar
  - [ ] Logging detalhado para debug
  - [ ] Timeout e retry logic
 
### **Task 7: Performance e Otimização**
- [ ] **Cache de embeddings**
  - [ ] Cache em memória para textos repetidos
  - [ ] Persistência opcional em disco
  - [ ] TTL para cache expiração
- [ ] **Otimizações**
  - [ ] Reutilizar processo llama.cpp se possível
  - [ ] Streaming para textos longos
  - [ ] Batch processing automático
 
### **Task 8: Documentação e Exemplos**
- [ ] **Documentação de uso**
  - [ ] Como instalar e configurar llama.cpp
  - [ ] Exemplos de configuração
  - [ ] Guia de troubleshooting
- [ ] **Exemplos práticos**
  - [ ] Uso básico com texto
  - [ ] Processamento de arquivos
  - [ ] Batch processing
 
---
 
## 🎯 **Status Atual**
 
### **✅ Concluído:**
- ✅ Análise do problema sharp
- ✅ Remoção de dependências problemáticas
- ✅ Compilação do llama.cpp
- ✅ Download do modelo nomic-embed-text-v1.5.Q4_K_M.gguf
- ✅ Análise inicial da API llama.cpp
 
### **🔄 Em Progresso:**
- 🔄 Estudo da API embedding.cpp
- 🔄 Planejamento da arquitetura
 
### **⏳ Próximos Passos:**
- ⏳ Implementar LlamaCppProvider básico
- ⏳ Testar comando llama-embedding
- ⏳ Integrar com factory existente
 
---
 
## 📝 **Notas Importantes:**
 
### **Design Decisions:**
1. **Sem dependências externas** - Usa llama.cpp nativo
2. **Detecção automática** - Busca na raiz do usuário
3. **Fallback inteligente** - API providers se local falhar
4. **Performance first** - Cache e otimizações
5. **Minimalista** - Interface simples como design principle
 
### **Technical Considerations:**
- **Modelo alvo:** nomic-embed-text-v1.5 (768 dimensões)
- **Formato:** GGUF quantizado (Q4_K_M)
- **Saída:** JSON ou array format
- **Pooling:** mean (padrão para embeddings)
- **Normalização:** euclidean (padrão)
 
### **Path Strategy:**
```
~/
├── llama.cpp/
│   ├── llama-embedding          # Executável compilado
│   └── models/
│       └── nomic-embed-text-v1.5.Q4_K_M.gguf
└── embed-kit/                 # Nossa biblioteca
    └── node_modules/           # Dependências do projeto
```
 
---
 
## 🚀 **Ready to Start!**
 
**Próximo passo:** Implementar Task 1 - Análise completa da API llama.cpp