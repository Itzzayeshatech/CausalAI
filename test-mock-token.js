async function testMockToken() {
  try {
    console.log('Testing mock token authentication...');
    
    // Test datasets endpoint with mock token directly
    const datasetsResponse = await fetch('https://causalai-backend1.onrender.com/api/datasets', {
      headers: {
        'Authorization': 'Bearer mock-jwt-token-for-testing',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Datasets endpoint status:', datasetsResponse.status);
    if (datasetsResponse.ok) {
      const datasetsData = await datasetsResponse.text();
      console.log('Datasets endpoint data:', datasetsData);
      console.log('✅ Mock token authentication works!');
    } else {
      const errorData = await datasetsResponse.text();
      console.log('Datasets endpoint error:', errorData);
      console.log('❌ Mock token authentication failed');
    }
    
  } catch (error) {
    console.error('Mock token test failed:', error.message);
  }
}

testMockToken();
