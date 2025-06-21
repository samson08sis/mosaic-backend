const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { renderTemplate } = require("../utils/emailTemplates");
const { generateToken } = require("../utils/tokenActions");

// @desc   Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const user = new User({
      name,
      email,
      password,
    });

    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    try {
      const verificationUrl = `${process.env.WEB_URL}/verify-email/${verificationToken}`;
      const html = renderTemplate("emailVerification", {
        logoUrl: "#",
        verificationUrl,
        expirationTime: "30 minutes",
        currentYear: new Date().getFullYear(),
        companyName: "Mosaic Tour Ethiopia",
        privacyPolicyUrl: `${process.env.WEB_URL}/privacy`,
        termsUrl: `${process.env.WEB_URL}/termsOfService`,
        contactUrl: `${process.env.WEB_URL}/contact`,
        facebookUrl: "#",
        twitterUrl: "#",
        instagramUrl: "#",
        email,
      });

      await sendEmail({
        to: email,
        subject: "User Mail Verification",
        html,
      });
    } catch (error) {
      console.error("Error sending password verification email:", error);
      return res.status(500).json({
        success: false,
        message: "Problem sending verification email.",
      });
    }

    // Generate JWT
    const token = generateToken({ userId: user._id });

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };

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
        message: "Verification email sent. Please check your inbox.",
      });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Login user
// @route   GET /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });

    const token = generateToken({ userId: user._id });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };

    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
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
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true }); // Delete the cookie
  // Optional: Add token to a blocklist (for JWT)
  res.sendStatus(200);
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-__v -createdAt -updatedAt"
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

// @desc    Request for a password reset link
// @route   GET /api/auth/forgot-password
// @access  Private
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send email with reset link
      const resetUrl = `${process.env.WEB_URL}/reset-password/${resetToken}`;

      // Prepare email-tempate for password reset
      const html = renderTemplate("passwordReset", {
        logoUrl: "#",
        resetUrl,
        expirationTime: "30 minutes",
        currentYear: new Date().getFullYear(),
        companyName: "Mosaic Tour Ethiopia",
        privacyPolicyUrl: `${process.env.WEB_URL}/privacy`,
        contactUrl: `${process.env.WEB_URL}/contact`,
        email,
      });

      console.log(resetUrl);

      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html,
      });

      res.json({ success: true, message: "Password reset email sent." });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return res.status(500).json({
        success: false,
        message: "Problem sending password reset email.",
      });
    }
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// @desc    Reset Forgotten password
// @route   GET /api/auth/reset-password
// @access  Private
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token." });
  }

  // 2. Check if password is not the same
  const isSame = await user.comparePassword(newPassword);
  if (isSame == true)
    return res
      .status(400)
      .json({ success: false, message: "Passwords must be different." });

  // 3. Update password and clear token
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
};
