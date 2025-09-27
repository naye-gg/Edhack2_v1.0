// Test directo de las APIs
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAPIs() {
  console.log('🧪 Testing AI APIs directly...\n');

  // Test Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🔵 Testing Gemini...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Responde solo con "OK" si puedes leer este mensaje');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini works! Response:', text);
    } catch (error) {
      console.error('❌ Gemini failed:', error.message);
      if (error.status) {
        console.error('   Status:', error.status);
      }
    }
  }

  console.log('');

  // Test GitHub Models
  if (process.env.GITHUB_MODELS_API_KEY) {
    try {
      console.log('🟣 Testing GitHub Models...');
      const openai = new OpenAI({
        apiKey: process.env.GITHUB_MODELS_API_KEY,
        baseURL: process.env.GITHUB_MODELS_ENDPOINT,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Responde solo con "OK" si puedes leer este mensaje' }],
        max_tokens: 10,
      });

      console.log('✅ GitHub Models works! Response:', completion.choices[0]?.message?.content);
    } catch (error) {
      console.error('❌ GitHub Models failed:', error.message);
      if (error.status) {
        console.error('   Status:', error.status);
      }
      if (error.code) {
        console.error('   Code:', error.code);
      }
    }
  }
}

testAPIs().catch(console.error);
