const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { checkRoleAndVerify } = require("../middleware/adminRoleMiddleware");
const logger = require("../middleware/logger");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  validateForgotPassword,
  validateResetPassword,
  validateLogin,
  validateRegister,
} = require("../middleware/validateRequest");

router.post("/register", validateRegister, logger, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;
