# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-02-14

### Added
- Native N-API integration for Llama.cpp (10x faster performance)
- Auto-detection of best available provider
- Support for GGUF models with direct native loading
- Smart fallback system between providers
- File input support for direct text file embedding
- Batch processing capabilities

### Changed
- Simplified installation - zero setup required
- Updated README with modern usage examples
- Improved error handling and logging
- Better TypeScript support with comprehensive types

### Fixed
- Native module compilation issues
- Provider detection and fallback logic
- Memory management for native embeddings

### Providers
- **OpenAI**: text-embedding-3-small, text-embedding-3-large
- **Google Gemini**: gemini-embedding-001
- **Mistral**: mistral-embed
- **Llama.cpp**: Native N-API with GGUF support

## [0.2.1] - Previous

### Added
- Multi-provider support
- Basic embedding functionality
- TypeScript definitions
