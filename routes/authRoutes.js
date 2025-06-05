const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { checkRoleAndVerify } = require("../middleware/adminRoleMiddleware");
const logger = require("../middleware/logger");

router.post("/register", checkRoleAndVerify, logger, register);
router.post("/login", logger, login);

module.exports = router;
