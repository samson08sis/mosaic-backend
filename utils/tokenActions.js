const jwt = require("jsonwebtoken");

const generateToken = (props) => {
  return jwt.sign({ ...props }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { verifyToken, generateToken };
