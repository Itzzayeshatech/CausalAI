const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const rootCauseValidation = [
  body('datasetId').notEmpty().withMessage('Dataset ID is required'),
  body('targetColumn').notEmpty().withMessage('Target column is required')
];

const whatIfValidation = [
  body('datasetId').notEmpty().withMessage('Dataset ID is required'),
  body('changes').isArray({ min: 1 }).withMessage('At least one scenario change is required')
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  rootCauseValidation,
  whatIfValidation
};
