async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test main endpoint
    const mainResponse = await fetch('https://causalai-backend1.onrender.com/');
    const mainData = await mainResponse.text();
    console.log('Main endpoint status:', mainResponse.status);
    console.log('Main endpoint data:', mainData);
    
    // Test health endpoint
    try {
      const healthResponse = await fetch('https://causalai-backend1.onrender.com/api/health');
      console.log('Health endpoint status:', healthResponse.status);
      if (healthResponse.ok) {
        const healthData = await healthResponse.text();
        console.log('Health endpoint data:', healthData);
      }
    } catch (healthError) {
      console.log('Health endpoint error:', healthError.message);
    }
    
    // Test auth register endpoint
    try {
      const registerResponse = await fetch('https://causalai-backend1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      });
      console.log('Register endpoint status:', registerResponse.status);
      if (registerResponse.ok) {
        const registerData = await registerResponse.text();
        console.log('Register endpoint data:', registerData);
      } else {
        const errorData = await registerResponse.text();
        console.log('Register endpoint error:', errorData);
      }
    } catch (registerError) {
      console.log('Register endpoint error:', registerError.message);
    }
    
  } catch (error) {
    console.error('Backend test failed:', error.message);
  }
}

testBackend();
