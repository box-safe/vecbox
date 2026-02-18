import { LlamaCppProvider } from './src/providers/llamacpp';

/**
 * Demo: Gera embedding REAL do core llama.cpp
 */
async function generateRealEmbedding() {
  console.log('🚀 Gerando embedding REAL do core Llama.cpp...\n');

  try {
    // Criar provider com módulo nativo
    const provider = new LlamaCppProvider({
      model: './core/models/nomic-embed-text-v1.5.Q4_K_M.gguf'
    });

    console.log(`✅ Provider: ${provider.getProviderName()}`);
    console.log(`✅ Modelo: nomic-embed-text-v1.5.Q4_K_M.gguf`);
    console.log(`✅ Dimensões: ${provider.getDimensions()}`);

    // Aguardar inicialização
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isReady = await provider.isReady();
    console.log(`ℹ️  Status: ${isReady ? 'PRONTO' : 'NÃO PRONTO'}`);

    if (isReady) {
      console.log('\n🎯 GERANDO EMBEDDING REAL...');
      
      const text = "ola mundo como vai neste dia lindo .";
      
      const result = await provider.embed({ text });
      
      console.log('\n🎉 EMBEDDING REAL GERADO COM SUCESSO!');
      console.log('=' .repeat(60));
      console.log(`📝 Texto: "${text}"`);
      console.log(`📏 Dimensões: ${result.dimensions}`);
      console.log(`🔢 Tamanho: ${result.embedding.length}`);
      console.log(`🏷️  Provider: ${result.provider}`);
      console.log(`📦 Modelo: ${result.model}`);
      
      console.log('\n📊 ESTATÍSTICAS DO EMBEDDING:');
      const values = result.embedding;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      console.log(`   - Valor mínimo: ${min.toFixed(6)}`);
      console.log(`   - Valor máximo: ${max.toFixed(6)}`);
      console.log(`   - Média: ${mean.toFixed(6)}`);
      console.log(`   - Range: ${(max - min).toFixed(6)}`);
      
      console.log('\n🔍 PRIMEIROS 20 VALORES:');
      console.log('   [' + values.slice(0, 20).map(v => v.toFixed(6)).join(', ') + ']');
      
      console.log('\n🔍 ÚLTIMOS 10 VALORES:');
      console.log('   [' + values.slice(-10).map(v => v.toFixed(6)).join(', ') + ']');
      
      console.log('\n🎯 COMPARAÇÃO COM OUTRO TEXTO:');
      const text2 = "Completely different sentence about artificial intelligence and machine learning.";
      const result2 = await provider.embed({ text: text2 });
      
      // Calcular similaridade de cosseno
      const similarity = cosineSimilarity(result.embedding, result2.embedding);
      console.log(`   - Texto 2: "${text2}"`);
      console.log(`   - Similaridade: ${similarity.toFixed(4)} (${(similarity * 100).toFixed(1)}%)`);
      
      if (similarity < 0.1) {
        console.log('   ✅ Similaridade baixa = bom! Textos diferentes embeddings diferentes!');
      } else if (similarity > 0.8) {
        console.log('   ⚠️  Similaridade alta = textos semanticamente próximos!');
      } else {
        console.log('   ℹ️  Similaridade moderada = textos relacionados!');
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ESTE É UM EMBEDDING REAL DO CORE LLAMA.CPP!');
      console.log('❌ NÃO É MOCK - SÃO VALORES REAIS DO C++!');
      console.log('🔥 PROCESSADO PELO MODELO nomic-embed-text-v1.5!');
      
    } else {
      console.log('❌ Provider não está pronto');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vetores devem ter o mesmo tamanho');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

generateRealEmbedding().catch(console.error);
