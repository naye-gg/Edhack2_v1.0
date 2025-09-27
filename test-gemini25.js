// Test específico para Gemini 2.5 Flash
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGemini25Flash() {
  console.log('🔵 Testing Gemini 2.5 Flash...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      }
    });
    
    console.log('🔵 Sending test message to Gemini 2.5 Flash...');
    const result = await model.generateContent('Responde solo con "OK" si puedes leer este mensaje');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini 2.5 Flash works! Response:', text.trim());
    console.log('✅ Tokens used:', response.usageMetadata?.totalTokenCount || 'N/A');
    return true;
  } catch (error) {
    console.error('❌ Gemini 2.5 Flash failed:', error.message);
    if (error.status) {
      console.error('   Status:', error.status);
    }
    return false;
  }
}

testGemini25Flash().then(success => {
  if (success) {
    console.log('\n🎉 Gemini 2.5 Flash is working correctly!');
    console.log('✅ Your FlexIAdapt AI should work now.');
  } else {
    console.log('\n❌ There might be an issue with your Gemini API key or the model name.');
  }
}).catch(console.error);
