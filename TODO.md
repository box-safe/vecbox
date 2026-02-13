# Embed Kit - TODO

## Project Setup
- [x] Configurar TypeScript
- [x] Definir estrutura de diretórios (src/, ports/, adapters/, providers/)
- [x] Configurar tsconfig.json
- [ ] Adicionar dependências necessárias (OpenAI, Google AI, etc)

## Core Architecture (Hexagonal)
- [ ] Criar interface/port principal para embedding providers (TypeScript)
- [ ] Definir tipos e interfaces compartilhadas
- [ ] Implementar factory pattern para seleção de providers

## Local Providers (Adapters)
- [ ] Implementar adapter para @xenova/transformers
- [ ] Suporte para diferentes modelos locais
- [ ] Configuração de modelos e cache

## Remote Providers (Adapters)
- [ ] Implementar adapter para OpenAI
- [ ] Implementar adapter para Google Gemini
- [ ] Implementar adapter para outros providers (Cohere, Anthropic, etc)

## Examples & Tests
- [ ] Criar exemplos de uso
- [ ] Implementar testes unitários
- [ ] Documentação da API

## Configuration
- [ ] Sistema de configuração (environment variables, config files)
- [ ] Sistema de logging
- [ ] Tratamento de erros 