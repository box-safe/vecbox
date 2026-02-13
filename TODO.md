# Embed Kit - TODO

## Project Setup
- [x] Configurar TypeScript
- [x] Definir estrutura de diretórios (src/, providers/, factory/, types/)
- [x] Configurar tsconfig.json
- [x] Adicionar dependências necessárias (OpenAI, Google AI, etc)
- [x] Configurar logger utilitário

## Core Architecture (Factory + Strategy)
- [x] Criar tipos e interfaces compartilhadas
- [x] Criar interface base EmbeddingProvider
- [x] Implementar factory pattern para seleção de providers
- [ ] Criar interface principal de uso simplificado

## Providers Implementation
- [x] Implementar provider OpenAI
- [x] Implementar provider Google Gemini
- [x] Implementar provider Anthropic Claude
- [x] Implementar provider Mistral
- [x] Implementar provider DeepSeek
- [x] Implementar provider local (@xenova/transformers)

## Main Interface (API Simplificada)
- [x] Criar função principal embed() com interface simples
- [x] Suporte para diferentes tipos de entrada (texto, documento, arquivo)
- [x] Sistema de configuração automática de providers
- [x] Tratamento de erros amigável
- [x] Sistema de fallback automático

## Examples & Tests
- [ ] Criar exemplos de uso básico
- [ ] Implementar testes unitários
- [ ] Documentação da API
- [ ] Guia de início rápido

## Configuration & Utils
- [ ] Sistema de configuração (environment variables, config files)
- [ ] Sistema de logging integrado
- [ ] Validação de inputs
- [ ] Sistema de cache opcionala