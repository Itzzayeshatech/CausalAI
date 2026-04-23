const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { validateRequest, registerValidation, loginValidation } = require('../utils/validation');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);
router.get('/profile', protect, getProfile);

module.exports = router;
