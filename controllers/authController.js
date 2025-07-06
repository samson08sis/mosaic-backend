const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { renderTemplate } = require("../utils/emailTemplates");
const {
  generateRefreshToken,
  generateAccessToken,
  verifyRefreshToken,
} = require("../utils/tokenActions");
const crypto = require("crypto");

const { WEB_URL, NODE_ENV } = process.env;

// @desc    Register user
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
    };

    try {
      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } catch (err) {
      console.log(`PROBLEM SETTING COOKIES: ${err.message}`);
      res.json({ success: false, message: err.message });
    }

    try {
      const verificationToken = user.getEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verificationUrl = `${WEB_URL}/verify-email/${verificationToken}`;
      const html = renderTemplate("emailVerification", {
        logoUrl: "#",
        verificationUrl,
        expirationTime: "30 minutes",
        currentYear: new Date().getFullYear(),
        companyName: "Mosaic Tour Ethiopia",
        privacyPolicyUrl: `${WEB_URL}/privacy`,
        termsUrl: `${WEB_URL}/termsOfService`,
        contactUrl: `${WEB_URL}/contact`,
        facebookUrl: "#",
        twitterUrl: "#",
        instagramUrl: "#",
        email,
      });

      console.log(verificationUrl);

      // await sendEmail({
      //   to: email,
      //   subject: "User Mail Verification",
      //   html,
      // });
    } catch (error) {
      // Non-interruptive handling.
      console.log(
        `Error sending verification email to ${email}.\n${error.message}`
      );
    }

    const userData = user.getPublicProfile();

    res.status(201).json({
      success: true,
      user: userData,
      token: accessToken,
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

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const refreshToken =
      user?.refreshToken && verifyRefreshToken(user.refreshToken)
        ? user.refreshToken
        : generateRefreshToken(user);
    const accessToken = generateAccessToken(user);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
    };

    try {
      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } catch (err) {
      console.log(`Problem setting cookies: ${err.message}`);
      res.status(500).json({ success: false, message: err.message });
    }

    const userData = user.getPublicProfile();

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  res.clearCookie("accessToken", { httpOnly: true, secure: true });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });

  if (refreshToken !== null) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findByIdAndUpdate(decoded.userId, {
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
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
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
      const resetUrl = `${WEB_URL}/reset-password/${resetToken}`;

      // Prepare email-tempate for password reset
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

      console.log(resetUrl);

      // await sendEmail({
      //   to: email,
      //   subject: "Password Reset Request",
      //   html,
      // });

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
  try {
    const { token, newPassword } = req.body;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res
        .status(400)
        .json({ success: false, msg: "Passwords must be different." });
    }

    // 3. Update password and clear token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

// @desc Verify email
// @route POST /api/auth/verify-email
// @access Private
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user with matching verification token
    const user = await User.findOne({
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(token)
        .digest("hex"),
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark user as verified and clear token
    user.verified = true;
    user.verifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Optionally log the user in automatically after verification
    // const accessToken = generateAccessToken(user);
    // const refreshToken = generateRefreshToken(user);

    // user.refreshToken = refreshToken;
    // await user.save();

    // // Set HTTP-only cookies
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    // const userData = user.getPublicProfile();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      // user: userData,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Send Verification Email
// @route POST /api/auth/send-email-verification
// @access Private
exports.sendVerification = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verified) {
      console.log("VERIFIED USER: ", user);
      console.log("Already verified!");
      return res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
    }

    const verificationToken = user.getEmailVerificationToken();

    await user.save({ validateBeforeSave: false });

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
      console.error(`Email sending error to ${user.email}:`, error.message);
      // Log to a monitoring system later
    }

    // 5. Respond to client immediately
    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      ...(process.env.NODE_ENV === "development" && {
        debugToken: verificationToken,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process your request ",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};
