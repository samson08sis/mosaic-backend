const express = require("express");
const controllers = require("../controllers/uploadController");
const router = express.Router();
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Apply auth middleware to all destination routes
// router.use(protect);
// router.use(restrictTo("admin", "editor"));

// Upload routes
router.post("/upload", upload.single("image"), uploadController.uploadImage);
router.delete("/upload/:publicId", uploadController.deleteImage);

router.post("/", controllers.uploadImage);
router.delete("/:publicId", controllers.deleteImage);

module.exports = router;
