const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, JWT_COOKIE_EXPIRES_IN } =
  process.env;

const generateToken = (props) => {
  return jwt.sign({ ...props }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || "3d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
};

const attachTokenToCookie = (res, token, cookieOptions = COOKIE_OPTIONS) => {
  res.cookie("token", token, cookieOptions);
};

module.exports = { verifyToken, generateToken, attachTokenToCookie };
