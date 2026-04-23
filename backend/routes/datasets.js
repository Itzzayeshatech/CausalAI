const express = require('express');
const router = express.Router();
const { uploadDataset, listDatasets, deleteDataset } = require('../controllers/datasetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadDataset);
router.get('/', protect, listDatasets);
router.delete('/:id', protect, deleteDataset);

module.exports = router;
