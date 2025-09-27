// Quick test for AI endpoint
async function testAI() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/test');
    const result = await response.json();
    console.log('AI Test Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAI();
