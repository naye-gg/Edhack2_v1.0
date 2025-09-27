// Test rápido con Gemini 2.5 Flash
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGemini25() {
  console.log('🔵 Testing Gemini 2.5 Flash...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',  // Probamos con el nombre experimental
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      }
    });
    
    console.log('🔵 Sending test message to Gemini 2.0 Flash Exp...');
    const result = await model.generateContent('Responde solo con "OK" si puedes leer este mensaje');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini 2.0 Flash Exp works! Response:', text.trim());
    return true;
  } catch (error) {
    console.log('❌ Gemini 2.0 Flash Exp failed:', error.message);
    
    // Probar con gemini-1.5-flash como fallback
    try {
      console.log('🔵 Trying fallback: gemini-1.5-flash...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.7,
        }
      });
      
      const result = await model.generateContent('Responde solo con "OK" si puedes leer este mensaje');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini 1.5 Flash works! Response:', text.trim());
      return '1.5-flash';
    } catch (fallbackError) {
      console.log('❌ Gemini 1.5 Flash also failed:', fallbackError.message);
      return false;
    }
  }
}

testGemini25().then(result => {
  if (result === true) {
    console.log('\n✅ Use: gemini-2.0-flash-exp in your .env file');
  } else if (result === '1.5-flash') {
    console.log('\n✅ Use: gemini-1.5-flash in your .env file');
  } else {
    console.log('\n❌ Both models failed. Check your API key.');
  }
}).catch(console.error);
