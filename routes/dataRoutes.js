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

router.get("/hero-images", getClientSlides);
router.get("/admin/hero-images", getHeroImages);
router.post("/admin/hero-images", createHeroImage);
router.put("/admin/hero-images/:id", updateHeroImage);
router.put("/admin/hero-images/reorder", reorderHeroImages);
router.delete("/hero-images/delete-all", deleteAllHeroImages);

module.exports = router;
