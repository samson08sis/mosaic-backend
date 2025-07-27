const crypto = require("crypto");

const { CRYPTO_TOKEN_LENGTH } = process.env;

const getToken = () => {
  return crypto.randomBytes(CRYPTO_TOKEN_LENGTH * 1).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { getToken, hashToken };
