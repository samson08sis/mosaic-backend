const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: String,
    bio: String,
    country: String,
    role: {
      type: String,
      enum: ["admin", "tourist", "touroperator"],
      default: "tourist",
    },
    createdBy: {
      type: String,
      default: "self",
    },
    avatar: String,
    phone: String,
    preferences: {
      type: Object,
      default: {
        notifications: true,
        newsletter: false,
        theme: "system",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
