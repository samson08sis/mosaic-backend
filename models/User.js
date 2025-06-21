const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
    verified: {
      type: Boolean,
      detault: false,
    },
    verifiedAt: Date,
    verificationId: { type: String, select: false },
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
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
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

// Generate, save and return a password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto
    .randomBytes(process.env.CRYPTO_TOKEN_LENGTH * 1)
    .toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (30 minutes)
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto
    .randomBytes(process.env.CRYPTO_TOKEN_LENGTH * 1)
    .toString("hex");

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expire (30 minutes)
  this.emailVerificationExpires = Date.now() + 30 * 60 * 1000;

  return verificationToken;
};

module.exports = mongoose.model("User", UserSchema);
