const { body, validationResult } = require("express-validator");
const { validate } = require("../models/User");

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
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
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateForgotPassword = [
  body("email").isEmail().normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateResetPassword = [
  body("newPassword").isLength({ min: 8 }).trim(),
  body("token").isString().trim(),
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
