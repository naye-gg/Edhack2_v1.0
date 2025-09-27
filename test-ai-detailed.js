#!/usr/bin/env node

import { config } from 'dotenv';
config();

import { aiService } from './server/aiService';

async function testAI() {
  console.log('🧪 Probando análisis AI completo...');
  
  const testData = {
    content: 'El estudiante escribió una historia fantástica muy creativa',
    type: 'texto',
    subject: 'Lenguaje',
    extractedText: 'Una historia sobre dragones y aventuras',
    studentProfile: {
      learningStyle: 'visual',
      needs: 'apoyo en escritura'
    },
    teacherPerspective: {
      strengths: 'muy creativo',
      difficulties: 'ortografía'
    }
  };

  try {
    const result = await aiService.analyzeEvidence(testData);
    console.log('✅ Resultado completo:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAI();
