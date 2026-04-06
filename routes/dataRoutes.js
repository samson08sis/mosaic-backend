const express = require("express");
const {
  getHeroImages,
  createHeroImage,
  deleteAllHeroImages,
  getClientSlides,
  updateHeroImage,
  reorderHeroImages,
} = require("../controllers/data/dataController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Client Routes
router.get("/", getClientSlides);

// Admin Routes
router.get("/admin", getHeroImages);
router.post("/admin", createHeroImage);
router.put("/admin/:id", updateHeroImage);

// Test Routes
router.put("/admin/reorder", reorderHeroImages);
router.delete("/delete-all", deleteAllHeroImages);

module.exports = router;
