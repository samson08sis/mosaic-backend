const User = require("../models/User");
const {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} = require("../utils/tokenActions");

exports.verifyToken = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (accessToken && refreshToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      const user = decoded.userId;
      req.user = user;
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Refresh the token
        // For now, just return Unauthorized.
        return res.status(401).json({
          message: "Token expired",
        });
      } else {
        res.clearCookie("accessToken");
        return res.status(401).json({
          message: "Invalid token",
        });
      }
    }
  }

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken,
      });
      if (!user) throw new Error("Refresh token revoked");

      const newAccessToken = generateAccessToken(user);

      // Set new cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      req.user = decoded.userId;
      return next();
    } catch (err) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(401).json({
    message: "Authentication required",
  });
};
