const express = require('express');
const router = express.Router();
const { validateRequest, registerValidation, loginValidation } = require('../utils/validation');

// Temporary simple registration for testing
router.post('/register', registerValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Simple mock response for testing
    res.status(201).json({
      id: 'mock-user-id',
      name: name,
      email: email,
      role: 'user',
      token: 'mock-jwt-token-for-testing'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Temporary simple login for testing
router.post('/login', loginValidation, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple mock response for testing
    res.status(200).json({
      id: 'mock-user-id',
      name: 'Test User',
      email: email,
      role: 'user',
      token: 'mock-jwt-token-for-testing'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    res.json({
      id: 'mock-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Profile fetch failed' });
  }
});

module.exports = router;
