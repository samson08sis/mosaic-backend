const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { hashToken } = require("../utils/cryptoActions");
const { renderTemplate } = require("../utils/emailTemplates");
const { verifyRefreshToken } = require("../utils/tokenActions");
const { unsetAuthCookies, setAuthCookies } = require("../utils/cookieActions");
const { logUserIn } = require("../utils/auth");

const { WEB_URL } = process.env;

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "Email already registered" });

    const user = new User({
      name,
      email,
      password,
    });

    logUserIn(res, user, 201);
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Log user in
// @route   GET /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid email or password" });
    }

    logUserIn(res, user, 200);
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Register / Log user in
// @route   GET /api/auth/login
// @access  Private
exports.authGoogleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Authentication failed" });
    }

    logUserIn(res, user, "html");
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Log user out
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  unsetAuthCookies(res);

  if (refreshToken != null) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await User.findByIdAndUpdate(decoded.userId, {
        $unset: { refreshToken },
      });
    } catch (err) {
      // Token is invalid, nothing to handle
      console.log("ERROR: ", err.message);
    }
  }

  res.sendStatus(200);
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

// @desc    Request for a password reset link
// @route   GET /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetUrl = `${WEB_URL}/reset-password/${resetToken}`;

      const html = renderTemplate("passwordReset", {
        logoUrl: "#",
        resetUrl,
        expirationTime: "30 minutes",
        currentYear: new Date().getFullYear(),
        companyName: "Mosaic Tour Ethiopia",
        privacyPolicyUrl: `${WEB_URL}/privacy`,
        contactUrl: `${WEB_URL}/contact`,
        email,
      });

      // console.log(resetUrl);

      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html,
      });

      res.json({ success: true, msg: "Password reset email sent." });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return res.status(500).json({
        success: false,
        msg: "Problem sending password reset email.",
      });
    }
  } catch (err) {
    console.log("Error in forgotPassword:", err.message);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error." });
  }
};

// @desc    Reset Forgotten password
// @route   GET /api/auth/reset-password
// @access  Private
exports.resetPassword = async (req, res) => {
  try {
    const token = req.query.prt;
    const { newPassword } = req.body;

    const resetPasswordToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired token." });
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res
        .status(400)
        .json({ success: false, msg: "Passwords must be different." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ msg: "Password has been reset successfully." });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

// @desc Verify email
// @route POST /api/auth/verify-email
// @access Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({
        success: false,
        msg: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired verification token",
      });
    }

    user.verifyUser();
    await user.save({ validateBeforeSave: false });

    // // Optionally log the user in after verification
    // logUserIn(res, user, 200);

    res.status(200).json({
      success: true,
      msg: "Email verified successfully",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// @desc Send Verification Email
// @route POST /api/auth/send-email-verification
// @access Private
exports.sendVerification = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.verified) {
      return res.status(200).json({
        success: true,
        msg: "Email is already verified",
      });
    }

    const verificationToken = user.getEmailVerificationToken();

    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.WEB_URL}/verify-email/${verificationToken}`;
      const html = renderTemplate("emailVerification", {
        logoUrl: "#",
        verificationUrl,
        expirationTime: "1 hour",
        currentYear: new Date().getFullYear(),
        companyName: "Mosaic Tour Ethiopia",
        privacyPolicyUrl: `${process.env.WEB_URL}/privacy`,
        termsUrl: `${process.env.WEB_URL}/termsOfService`,
        contactUrl: `${process.env.WEB_URL}/contact`,
        facebookUrl: "#",
        twitterUrl: "#",
        instagramUrl: "#",
        email: user.email,
      });

      // For testing
      // console.log("Verification URL:", verificationUrl);

      await sendEmail({
        to: user.email,
        subject: "User Mail Verification",
        html,
      });
    } catch (error) {
      console.error(`Error sending email to ${user.email}: ${error.message}`);
    }

    return res.status(200).json({
      success: true,
      msg: "Verification email sent successfully",
      ...(process.env.NODE_ENV === "development" && {
        debugToken: verificationToken,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Failed to process your request ",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};
