const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: { type: String, required: true, select: false },
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
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
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

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
