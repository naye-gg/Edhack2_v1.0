// Test con modelos alternativos
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGeminiModels() {
  console.log('🔵 Testing different Gemini models...\n');
  
  const models = [
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest', 
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    for (const modelName of models) {
      try {
        console.log(`🔵 Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Responde solo con "OK"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works! Response: ${text.trim()}`);
        break; // Si funciona, salir del loop
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
      }
    }
  }
}

async function testGitHubEndpoints() {
  console.log('\n🟣 Testing different GitHub Models endpoints...\n');
  
  const endpoints = [
    'https://models.inference.ai.azure.com',
    'https://api.githubmodels.com',
    'https://models.inference.azure.com'
  ];

  const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];

  if (process.env.GITHUB_MODELS_API_KEY) {
    for (const endpoint of endpoints) {
      console.log(`🟣 Testing endpoint: ${endpoint}`);
      
      for (const modelName of models) {
        try {
          console.log(`   📋 Testing model: ${modelName}`);
          const openai = new OpenAI({
            apiKey: process.env.GITHUB_MODELS_API_KEY,
            baseURL: endpoint,
            timeout: 10000, // 10 segundos timeout
          });

          const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: 'Responde solo con "OK"' }],
            max_tokens: 10,
          });

          console.log(`   ✅ ${endpoint} + ${modelName} works! Response: ${completion.choices[0]?.message?.content}`);
          return; // Si funciona, salir
        } catch (error) {
          console.log(`   ❌ ${endpoint} + ${modelName} failed: ${error.message}`);
        }
      }
    }
  }
}

async function main() {
  await testGeminiModels();
  await testGitHubEndpoints();
}

main().catch(console.error);
