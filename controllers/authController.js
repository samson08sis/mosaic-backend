const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const { renderTemplate } = require("../utils/emailTemplates");
const generateToken = require("../utils/tokenActions");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken({ userId: user._id });

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN),
    };

    console.log("✅ New User Created:", user);

    res
      .status(201)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken({ userId: user._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 1 day
    });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true }); // Delete the cookie
  // Optional: Add token to a blocklist (for JWT)
  res.sendStatus(200);
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -__v -createdAt -updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getting current user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Generate a reset token (JWT or crypto-random)
  const resetToken = require("crypto").randomBytes(22).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  // Send email with reset link
  const resetUrl = `${process.env.WEB_URL}/reset-password/${resetToken}`;
  const html = renderTemplate("passwordReset", {
    logoUrl: "https://example.com/logo.png",
    resetUrl,
    expirationTime: "1 hour",
    currentYear: new Date().getFullYear(),
    companyName: "Mosaic Tour Ethiopia",
    privacyPolicyUrl: "https://mosaic-tour-app.vercel.app/privacy",
    contactUrl: "https://mosaic-tour-app.vercel.app/contact",
    email,
  });

  console.log(resetUrl);

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
  });

  res.json({ message: "Password reset email sent." });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // 1. Find user with this token and check expiry
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log("No user");
    return res.status(400).json({ message: "Invalid or expired token." });
  }

  // 2. Check if password is not the same
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame == true)
    return res.status(400).json({ message: "Passwords must be different." });

  // 3. Update password and clear token
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
};
