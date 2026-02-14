#include <napi.h>
#include <string>
#include <vector>
#include <memory>

// Llama.cpp includes
#include "llama.h"
#include "ggml.h"
#include "ggml-cpu.h"

struct ModelData {
    llama_model* model;
    llama_context* ctx;
    int n_embd;
};

// Helper function to throw N-API error
Napi::Error throwNapiError(Napi::Env env, const std::string& message) {
    return Napi::Error::New(env, message);
}

// Create model from GGUF file
Napi::Value CreateModel(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1) {
        throw throwNapiError(env, "Expected 1 argument: modelPath");
    }
    
    if (!info[0].IsString()) {
        throw throwNapiError(env, "modelPath must be a string");
    }
    
    std::string modelPath = info[0].As<Napi::String>().Utf8Value();
    
    // Load model
    llama_model_params modelParams = llama_model_default_params();
    llama_model* model = llama_load_model_from_file(modelPath.c_str(), modelParams);
    
    if (!model) {
        throw throwNapiError(env, "Failed to load model: " + modelPath);
    }
    
    // Create context
    llama_context_params ctxParams = llama_context_default_params();
    ctxParams.embedding = true; // Enable embeddings
    ctxParams.n_threads = 4;
    
    llama_context* ctx = llama_new_context_with_model(model, ctxParams);
    
    if (!ctx) {
        llama_free_model(model);
        throw throwNapiError(env, "Failed to create context");
    }
    
    // Get embedding dimensions
    int n_embd = llama_n_embd(model);
    
    // Create model data structure
    ModelData* modelData = new ModelData();
    modelData->model = model;
    modelData->ctx = ctx;
    modelData->n_embd = n_embd;
    
    // Return as external pointer
    return Napi::External<ModelData>::New(env, modelData);
}

// Generate embedding for text
Napi::Value GetEmbedding(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2) {
        throw throwNapiError(env, "Expected 2 arguments: modelPtr, text");
    }
    
    if (!info[0].IsExternal()) {
        throw throwNapiError(env, "modelPtr must be external pointer");
    }
    
    if (!info[1].IsString()) {
        throw throwNapiError(env, "text must be a string");
    }
    
    ModelData* modelData = info[0].As<Napi::External<ModelData>>().Data();
    std::string text = info[1].As<Napi::String>().Utf8Value();
    
    // Tokenize text
    std::vector<llama_token> tokens;
    tokens.resize(text.length() + 16); // Extra space
    
    int nTokens = llama_tokenize(
        modelData->model,
        text.c_str(),
        text.length(),
        tokens.data(),
        tokens.capacity(),
        false,
        false
    );
    
    if (nTokens < 0) {
        throw throwNapiError(env, "Failed to tokenize text");
    }
    
    tokens.resize(nTokens);
    
    // Create batch
    llama_batch batch = llama_batch_init(nTokens, 0, 1);
    
    for (int i = 0; i < nTokens; i++) {
        llama_batch_add(batch, tokens[i], i, {0}, false);
    }
    
    // Run inference
    int result = llama_decode(modelData->ctx, batch);
    if (result != 0) {
        llama_batch_free(batch);
        throw throwNapiError(env, "Failed to run inference");
    }
    
    // Get embeddings
    float* embeddings = llama_get_embeddings(modelData->ctx);
    if (!embeddings) {
        llama_batch_free(batch);
        throw throwNapiError(env, "Failed to get embeddings");
    }
    
    // Create N-API array
    Napi::Float32Array embeddingArray = Napi::Float32Array::New(env, modelData->n_embd);
    for (int i = 0; i < modelData->n_embd; i++) {
        embeddingArray[i] = embeddings[i];
    }
    
    llama_batch_free(batch);
    
    return embeddingArray;
}

// Destroy model and free resources
Napi::Value DestroyModel(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1) {
        throw throwNapiError(env, "Expected 1 argument: modelPtr");
    }
    
    if (!info[0].IsExternal()) {
        throw throwNapiError(env, "modelPtr must be external pointer");
    }
    
    ModelData* modelData = info[0].As<Napi::External<ModelData>>().Data();
    
    if (modelData) {
        if (modelData->ctx) {
            llama_free(modelData->ctx);
        }
        if (modelData->model) {
            llama_free_model(modelData->model);
        }
        delete modelData;
    }
    
    return env.Null();
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "createModel"), 
                Napi::Function::New(env, CreateModel));
    exports.Set(Napi::String::New(env, "getEmbedding"), 
                Napi::Function::New(env, GetEmbedding));
    exports.Set(Napi::String::New(env, "destroyModel"), 
                Napi::Function::New(env, DestroyModel));
    
    return exports;
}

NODE_API_MODULE(llama_embedding, Init)
