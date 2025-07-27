const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { getToken, hashToken } = require("../utils/cryptoActions");

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

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = getToken();

  this.resetPasswordToken = hashToken(resetToken);

  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

UserSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
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
  const verificationToken = getToken();

  this.emailVerificationToken = hashToken(verificationToken);

  this.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return verificationToken;
};

UserSchema.methods.verifyUser = function () {
  this.verified = true;
  this.verifiedAt = new Date();
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
};

module.exports = mongoose.model("User", UserSchema);
