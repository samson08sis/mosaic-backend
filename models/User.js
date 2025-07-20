const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { CRYPTO_TOKEN_LENGTH } = process.env;

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
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    password: {
      type: String,
      // this doesn't reffer to the object in arrow functions
      required: function () {
        return this.provider === "local"; // Only required for local auth
      },
      select: false,
    },
    phone: String,
    address: String,
    bio: String,
    country: String,
    provider: {
      type: String,
      required: true,
      enum: ["local", "google", "facebook", "apple", "github"],
      default: "local",
    },
    googleId: {
      type: String,
      required: function () {
        return this.provider === "google";
      },
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "tourist", "touroperator"],
      default: "tourist",
    },
    createdBy: {
      type: String,
      default: "self",
    },
    avatar: {
      type: String,
      default: `https://picsum.photos/id/${Math.floor(
        Math.random() * 1001
      )}/300/300`,
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    refreshToken: String,
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
    .randomBytes(CRYPTO_TOKEN_LENGTH * 1)
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

UserSchema.methods.getPublicProfile = function () {
  return {
    name: this.name,
    email: this.email,
    verified: this.verified,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
    joined: this.createdAt,
  };
};

UserSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto
    .randomBytes(CRYPTO_TOKEN_LENGTH * 1)
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

UserSchema.methods.verifyEmailToken = function (token) {
  // 1. Hash the incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Compare with stored hash and check expiration
  return (
    this.emailVerificationToken === hashedToken &&
    this.emailVerificationExpires > Date.now()
  );
};

UserSchema.methods.clearVerificationToken = function () {
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
};

module.exports = mongoose.model("User", UserSchema);
