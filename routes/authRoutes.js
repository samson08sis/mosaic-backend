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

const fP = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  res.status(200).json({ message: `Password reset email sent to ${email}.` });
};

router.post("/register", checkRoleAndVerify, logger, register);
router.post("/login", logger, login);
router.post("/logout", logger, logout);
router.get("/me", verifyToken, logger, getCurrentUser);
router.post("/forgot-password", fP);
router.post("/reset-password", resetPassword);

module.exports = router;
