const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock admin users endpoint for testing
router.get('/users', protect, (req, res) => {
  try {
    res.json([
      {
        _id: 'mock-user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mock-user-2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
