const mongoose = require("mongoose");

const HeroImagesSchema = new mongoose.Schema({
  image: { type: String, required: true, unique: true },
  alt: { type: String, default: "Hero Slide" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("HeroImage", HeroImagesSchema);
