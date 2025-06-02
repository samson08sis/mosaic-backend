const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { checkRoleAndVerify } = require("../middleware/adminRoleMiddleware");

router.post("/register", checkRoleAndVerify, register);
router.post("/login", login);

module.exports = router;
