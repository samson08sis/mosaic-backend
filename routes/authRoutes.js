const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerification,
  authGoogleCallback,
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
const passport = require("passport");

router.post("/register", validateRegister, logger, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/send-email-verification", verifyToken, sendVerification);
// Google Auth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authGoogleCallback
);

module.exports = router;
