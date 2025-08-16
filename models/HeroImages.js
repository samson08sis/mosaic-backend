const mongoose = require("mongoose");

const HeroImagesSchema = new mongoose.Schema({
  image: { type: String, required: true },
  alt: { type: String, default: "" },
});

module.exports = mongoose.model("HeroImage", HeroImagesSchema);
