const jwt = require("jsonwebtoken");

const generateToken = (props) => {
  return jwt.sign({ ...props }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  });
};

module.exports = generateToken;
