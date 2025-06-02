const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const logger = require("../middleware/logger");

// Public (for testing read only)
router.get(
  "/",
  protect,
  authorizeRoles("admin", "tourist", "touroperator"),
  logger,
  getUsers
);
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "tourist", "touroperator"),
  logger,
  getUser
);

// Admin only
router.post("/", protect, authorizeRoles("admin"), logger, createUser);
router.put("/:id", protect, authorizeRoles("admin"), logger, updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), logger, deleteUser);

module.exports = router;
