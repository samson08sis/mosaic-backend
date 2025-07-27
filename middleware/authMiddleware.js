const User = require("../models/User");
const { unsetAuthCookies, setAccessCookie } = require("../utils/cookieActions");
const {
  verifyAccessToken,
  verifyRefreshToken,
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
      req.userId = decoded.userId;
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

      // Set new cookie
      setAccessCookie(res, user);

      req.userId = decoded.userId;
      return next();
    } catch (err) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }
  }
  unsetAuthCookies(res);
  res.status(401).json({
    message: "Authentication required",
  });
};
