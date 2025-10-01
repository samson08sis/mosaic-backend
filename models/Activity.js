const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    location: {
      city: String,
    },
    category: {
      type: String,
    },
    images: [String],
    price: { type: Number },
    duration: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: { type: String, enum: ["available", "unavailable"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
