const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV,
  JWT_COOKIE_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} = process.env;

const generateToken = (props) => {
  return jwt.sign({ ...props }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || "3d",
  });
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY || "15m" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY || "7d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
};

const attachTokenToCookie = (res, token, cookieOptions = COOKIE_OPTIONS) => {
  res.cookie("token", token, cookieOptions);
};

module.exports = {
  verifyToken,
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  attachTokenToCookie,
  verifyAccessToken,
  verifyRefreshToken,
};
