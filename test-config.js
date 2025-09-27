// Test para verificar configuración
import { config } from './server/config.js';

console.log('🔍 Verificando configuración de IA...');
console.log('AI_PROVIDER:', config.AI_PROVIDER);
console.log('GEMINI_API_KEY exists:', !!config.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', config.GEMINI_API_KEY?.length || 0);
console.log('GITHUB_MODELS_API_KEY exists:', !!config.GITHUB_MODELS_API_KEY);
console.log('GITHUB_MODELS_API_KEY length:', config.GITHUB_MODELS_API_KEY?.length || 0);
console.log('GITHUB_MODELS_ENDPOINT:', config.GITHUB_MODELS_ENDPOINT);
