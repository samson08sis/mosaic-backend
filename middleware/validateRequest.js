const { body, validationResult } = require("express-validator");
const { CRYPTO_TOKEN_LENGTH } = process.env;

// Extend the body validator with custom methods

const validateEmail = (field = "email") => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .withMessage("Please provide a valid email");
};

const validatePassword = (field = "password") => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage("Password can not be empty")
    .isString()
    .withMessage("Password must be a valid string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .isLength({ max: 30 })
    .withMessage("Password cannot exceed 30 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("Password cannot contain spaces");
};

const validateName = (field = "name") => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage("Name can not be empty")
    .isString()
    .withMessage("Name must be a valid string")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("Name must be at most 50 characters");
};

const validateToken = (
  minLength = CRYPTO_TOKEN_LENGTH * 2,
  maxLength = CRYPTO_TOKEN_LENGTH * 2,
  field = "token"
) => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage("No session provided")
    .isString()
    .withMessage("Invalid session")
    .isLength({
      min: minLength,
      max: maxLength,
    })
    .withMessage("Invalid token")
    .matches(/^[a-f0-9]+$/)
    .withMessage("Invalid token");
};

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateLogin = [
  validateEmail(),
  validatePassword(),
  validationMiddleware,
];

const validateRegister = [
  validateName(),
  validateEmail(),
  validatePassword(),
  validationMiddleware,
];

const validateForgotPassword = [validateEmail(), validationMiddleware];

const validateResetPassword = [
  validatePassword((field = "newPassword")),
  // validateToken(),
  validationMiddleware,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
};
