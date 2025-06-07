const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");
const { checkRoleAndVerify } = require("../middleware/adminRoleMiddleware");
const logger = require("../middleware/logger");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", checkRoleAndVerify, logger, register);
router.post("/login", logger, login);
router.get("/me", verifyToken, logger, getCurrentUser);

module.exports = router;
