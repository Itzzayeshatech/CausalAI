const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { rootCauseAnalysis, whatIfAnalysis, getAnalysisHistory } = require('../controllers/analysisController');
const { validateRequest, rootCauseValidation, whatIfValidation } = require('../utils/validation');

router.post('/root-cause', protect, rootCauseValidation, validateRequest, rootCauseAnalysis);
router.post('/what-if', protect, whatIfValidation, validateRequest, whatIfAnalysis);
router.get('/history', protect, getAnalysisHistory);

module.exports = router;
