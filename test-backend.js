const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test main endpoint
    const mainResponse = await axios.get('https://causalai-backend1.onrender.com/');
    console.log('Main endpoint:', mainResponse.data);
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('https://causalai-backend1.onrender.com/api/health');
      console.log('Health endpoint:', healthResponse.data);
    } catch (healthError) {
      console.log('Health endpoint error:', healthError.response?.status || healthError.message);
    }
    
    // Test auth register endpoint
    try {
      const registerResponse = await axios.post('https://causalai-backend1.onrender.com/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Register endpoint:', registerResponse.data);
    } catch (registerError) {
      console.log('Register endpoint error:', registerError.response?.status || registerError.message);
      if (registerError.response?.data) {
        console.log('Error details:', registerError.response.data);
      }
    }
    
  } catch (error) {
    console.error('Backend test failed:', error.message);
  }
}

testBackend();
