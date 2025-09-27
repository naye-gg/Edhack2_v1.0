// Verificar configuración sin importar módulos complejos
import * as dotenv from 'dotenv';
dotenv.config();

console.log('=== VERIFICACIÓN DE CONFIGURACIÓN ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('GEMINI_API_KEY existe:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GITHUB_MODELS_API_KEY existe:', !!process.env.GITHUB_MODELS_API_KEY);
console.log('GITHUB_MODELS_API_KEY length:', process.env.GITHUB_MODELS_API_KEY?.length || 0);
console.log('GITHUB_MODELS_ENDPOINT:', process.env.GITHUB_MODELS_ENDPOINT);
console.log('AI_FALLBACK_PROVIDER:', process.env.AI_FALLBACK_PROVIDER);

// Verificar que las keys no estén vacías o inválidas
if (process.env.GEMINI_API_KEY) {
  console.log('✅ Gemini API Key looks valid:', process.env.GEMINI_API_KEY.slice(0, 10) + '...');
}

if (process.env.GITHUB_MODELS_API_KEY) {
  console.log('✅ GitHub API Key looks valid:', process.env.GITHUB_MODELS_API_KEY.slice(0, 10) + '...');
}
