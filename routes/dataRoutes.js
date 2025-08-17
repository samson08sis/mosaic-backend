const express = require("express");
const {
  getHeroImages,
  createHeroImage,
  deleteAllHeroImages,
} = require("../controllers/data/dataController");
const router = express.Router();

router.get("/hero-images", getHeroImages);
router.post("/hero-images/new", createHeroImage);
router.delete("/hero-images/delete-all", deleteAllHeroImages);

module.exports = router;
