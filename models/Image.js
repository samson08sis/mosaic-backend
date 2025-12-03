const mongoose = require("mongoose");

const CloudinaryImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, "Image URL is required"],
  },
  publicId: {
    type: String,
    required: [true, "Cloudinary public ID is required"],
  },
  width: Number,
  height: Number,
  format: String,
});

module.exports = mongoose.model("Image", CloudinaryImageSchema);
