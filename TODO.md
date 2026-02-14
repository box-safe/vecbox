# TODO - Consertar DeepSeek com SDK OpenAI

## 🎯 **Objetivo: Usar SDK da OpenAI para chamar API do DeepSeek**

### **Contexto:**
- ❌ **DeepSeek não tem SDK oficial no npm**
- ✅ **API do DeepSeek é idêntica à da OpenAI**
- 🎯 **Solução:** Reutilizar SDK da OpenAI mudando apenas baseURL

---

## 📋 **Tasks Divididas - Implementação DeepSeek**

### **Task 1: Adicionar Dependência OpenAI**
- [ ] **Instalar SDK da OpenAI**
  - [ ] `npm install openai`
  - [ ] Verificar versão compatível
  - [ ] Atualizar package.json

### **Task 2: Analisar Implementação Atual**
- [ ] **Estudar DeepSeekProvider existente**
  - [ ] Ler `src/providers/deepseek.ts`
  - [ ] Entender estrutura atual
  - [ ] Identificar pontos de mudança
- [ ] **Verificar tipos e interfaces**
  - [ ] Analisar `src/types/deepseek.d.ts`
  - [ ] Entender interface EmbeddingProvider
  - [ ] Mapear métodos necessários

### **Task 3: Implementar Novo DeepSeekProvider**
- [ ] **Criar implementação com SDK OpenAI**
  - [ ] Importar OpenAI SDK
  - [ ] Configurar baseURL para DeepSeek
  - [ ] Implementar método embed()
- [ ] **Manter compatibilidade**
  - [ ] Mesma interface do provider atual
  - [ ] Mesmos parâmetros de configuração
  - [ ] Mesmo formato de saída

### **Task 4: Configuração e Ambiente**
- [ ] **Variáveis de ambiente**
  - [ ] `DEEPSEEK_API_KEY`
  - [ ] Validação de chave obrigatória
  - [ ] Tratamento de erro para chave ausente
- [ ] **Configuração do cliente**
  - [ ] baseURL: `https://api.deepseek.com`
  - [ ] Timeout e retry automático
  - [ ] Headers customizados se necessário

### **Task 5: Testes e Validação**
- [ ] **Testar implementação básica**
  - [ ] Criar embedding de texto simples
  - [ ] Validar formato de resposta
  - [ ] Verificar dimensões do embedding
- [ ] **Testar casos de erro**
  - [ ] API key inválida
  - [ ] Network timeout
  - [ ] Modelo não encontrado

### **Task 6: Integração com Factory**
- [ ] **Atualizar EmbeddingFactory**
  - [ ] Garantir registro do DeepSeekProvider
  - [ ] Testar auto-detection
  - [ ] Verificar fallback para outros providers
- [ ] **Testes de integração**
  - [ ] Testar com embed() automático
  - [ ] Testar configuração explícita
  - [ ] Validar ordem de providers

### **Task 7: Documentação**
- [ ] **Atualizar README**
  - [ ] Como configurar DeepSeek
  - [ ] Exemplo de uso
  - [ ] Variáveis de ambiente necessárias
- [ ] **Documentação técnica**
  - [ ] Por que usamos SDK OpenAI
  - [ ] Diferenças da implementação
  - [ ] Limitações e considerações

### **Task 8: Limpeza e Finalização**
- [ ] **Remover código antigo**
  - [ ] Se houver implementação manual
  - [ ] Arquivos não utilizados
  - [ ] Dependências obsoletas
- [ ] **Validação final**
  - [ ] Teste completo do fluxo
  - [ ] Performance check
  - [ ] Code review e lint

---

## 🚀 **Status Atual**

### **✅ Concluído:**
- ✅ Removido TODO.md do .gitignore
- ✅ Plano criado

### **🔄 Em Progresso:**
- 🔄 Task 1: Adicionar dependência OpenAI

### **⏳ Próximos Passos:**
- ⏳ Instalar SDK OpenAI
- ⏳ Analisar implementação atual
- ⏳ Implementar novo provider

---

## 📝 **Notas Importantes**

### **Vantagens da Abordagem:**
✅ Não precisa criar client do zero  
✅ Retry automático, error handling, tipos TypeScript  
✅ Código limpo e mantido pela OpenAI  
✅ Compatibilidade futura garantida  

### **Implementação Esperada:**
```typescript
import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

const response = await deepseek.embeddings.create({
  model: 'deepseek-chat',
  input: 'Your text'
});
```

### **Modelos Disponíveis:**
- `deepseek-chat` (para embeddings)
- Verificar documentação para modelos específicos

---

**Próximo passo:** Iniciar Task 1 - Instalar SDK OpenAI
