const { body, validationResult } = require("express-validator");

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 30 })
    .withMessage("Password cannot exceed 30 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("Password cannot contain spaces"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateRegister = [
  body("name").isString().isLength({ min: 2, max: 50 }).trim(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 30 })
    .withMessage("Password cannot exceed 30 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("Password cannot contain spaces"),
  ,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateResetPassword = [
  body("newPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 30 })
    .withMessage("Password cannot exceed 30 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("Password cannot contain spaces"),
  body("token")
    .isString()
    .withMessage("Token is required")
    .isLength({
      min: process.env.CRYPTO_TOKEN_LENGTH * 2,
      max: process.env.CRYPTO_TOKEN_LENGTH * 2,
    })
    .withMessage("Invalid token format")
    .matches(/^[a-f0-9]+$/)
    .withMessage("Invalid token format")
    .trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
};
