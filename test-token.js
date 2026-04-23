async function testTokenAuth() {
  try {
    console.log('Testing token authentication...');
    
    // First, register to get a token
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
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Register successful, got token:', registerData.token);
      
      // Now test datasets endpoint with the token
      const datasetsResponse = await fetch('https://causalai-backend1.onrender.com/api/datasets', {
        headers: {
          'Authorization': `Bearer ${registerData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Datasets endpoint status:', datasetsResponse.status);
      if (datasetsResponse.ok) {
        const datasetsData = await datasetsResponse.text();
        console.log('Datasets endpoint data:', datasetsData);
      } else {
        const errorData = await datasetsResponse.text();
        console.log('Datasets endpoint error:', errorData);
      }
    } else {
      console.log('Register failed:', await registerResponse.text());
    }
    
  } catch (error) {
    console.error('Token test failed:', error.message);
  }
}

testTokenAuth();
