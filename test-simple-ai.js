#!/usr/bin/env node

import { config } from 'dotenv';
config();

import { aiService } from './server/aiService';

async function testSimpleAI() {
  console.log('🧪 Probando prompt simple...');
  
  try {
    const simplePrompt = "Genera un análisis simple de este texto: 'El estudiante escribió una historia creativa'";
    const result = await aiService.generateCompletion(simplePrompt, {
      maxTokens: 500,
      temperature: 0.7
    });
    
    console.log('✅ Resultado simple:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleAI();
