const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock upload endpoint for testing
router.post('/upload', protect, (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Mock successful upload response
    res.status(201).json({
      _id: 'mock-dataset-id',
      name: name || 'Untitled Dataset',
      description: description || 'No description',
      fileName: 'sales-sample.csv',
      fileSize: 1024,
      uploadDate: new Date().toISOString(),
      userId: req.user._id,
      rowCount: 100,
      columns: ['Sales', 'MarketingSpend', 'Traffic', 'Price', 'Inventory'],
      status: 'processed'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Mock list datasets endpoint
router.get('/', protect, (req, res) => {
  try {
    res.json([
      {
        _id: 'mock-dataset-id',
        name: 'Sales',
        description: 'Sample sales data',
        fileName: 'sales-sample.csv',
        fileSize: 1024,
        uploadDate: new Date().toISOString(),
        userId: req.user._id,
        rowCount: 100,
        columns: ['Sales', 'MarketingSpend', 'Traffic', 'Price', 'Inventory'],
        status: 'processed'
      }
    ]);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ message: 'Failed to fetch datasets' });
  }
});

// Mock delete dataset endpoint
router.delete('/:id', protect, (req, res) => {
  try {
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete dataset' });
  }
});

module.exports = router;
