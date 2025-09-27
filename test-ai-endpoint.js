const testAI = async () => {
  try {
    console.log('🧪 Testing AI endpoint...');
    
    const response = await fetch('http://localhost:5000/api/ai/test');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ AI Test successful!');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ AI Test failed:', error.message);
    
    // Also test if server is running
    try {
      const healthCheck = await fetch('http://localhost:5000/api/students');
      if (healthCheck.ok) {
        console.log('✅ Server is running, but AI endpoint failed');
      }
    } catch (serverError) {
      console.log('❌ Server is not running');
    }
  }
};

testAI();
