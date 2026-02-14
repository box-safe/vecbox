const binding = require('./build/Release/llama_embedding.node');

class LlamaEmbedding {
  constructor(modelPath) {
    this.modelPtr = binding.createModel(modelPath);
    if (!this.modelPtr) {
      throw new Error('Failed to load model');
    }
  }

  embed(text) {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    
    const embedding = binding.getEmbedding(this.modelPtr, text);
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }
    
    return embedding;
  }

  close() {
    if (this.modelPtr) {
      binding.destroyModel(this.modelPtr);
      this.modelPtr = null;
    }
  }
}

function create(modelPath) {
  return new LlamaEmbedding(modelPath);
}

module.exports = {
  create,
  LlamaEmbedding
};
