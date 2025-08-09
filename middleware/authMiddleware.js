const User = require("../models/User");
const { unsetAuthCookies, setAccessCookie } = require("../utils/cookieActions");
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
      req.userId = decoded.userId;
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        try {
          const decodedRefreshToken = verifyRefreshToken(refreshToken);
          req.userId = decodedRefreshToken.userId;
          // Refresh the token
          await refreshAccessToken(res, refreshToken);
          return next();
        } catch (err) {
          console.log("ERROR REFRESHING TOKEN");
        }
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

const refreshAccessToken = async (res, refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
    });
    setAccessCookie(res, user);
  } catch (err) {
    console.log("ERROR REFRESHING ACCESS TOKEN");
  }
};
