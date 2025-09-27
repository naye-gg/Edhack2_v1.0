// Test específico para análisis AI de evidencias
import fetch from 'node-fetch';

async function testAIAnalysis() {
  console.log('🧪 Testing AI Evidence Analysis...\n');

  try {
    // 1. Primero obtener las evidencias disponibles
    console.log('📋 Getting available evidence...');
    const evidenceResponse = await fetch('http://localhost:5000/api/evidence');
    const evidences = await evidenceResponse.json();
    
    if (!evidences || evidences.length === 0) {
      console.log('❌ No evidence found to analyze');
      return;
    }
    
    const firstEvidence = evidences[0];
    console.log('✅ Found evidence:', firstEvidence.id, '-', firstEvidence.taskTitle);
    
    // 2. Analizar la primera evidencia
    console.log('🔵 Starting AI analysis...');
    const analysisResponse = await fetch(`http://localhost:5000/api/evidence/${firstEvidence.id}/ai-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!analysisResponse.ok) {
      throw new Error(`HTTP ${analysisResponse.status}: ${analysisResponse.statusText}`);
    }
    
    const analysis = await analysisResponse.json();
    console.log('✅ AI Analysis successful!');
    console.log('📊 Result:', JSON.stringify(analysis, null, 2));
    
  } catch (error) {
    console.error('❌ AI Analysis failed:', error.message);
  }
}

testAIAnalysis();
