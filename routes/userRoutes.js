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

// Public (for testing read only)
router.get(
  "/",
  protect,
  authorizeRoles("admin", "tourist", "touroperator"),
  getUsers
);
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "tourist", "touroperator"),
  getUser
);

// Admin only
router.post("/", protect, authorizeRoles("admin"), createUser);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
