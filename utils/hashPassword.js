const bcrypt = require("bcryptjs");
module.exports = hashPassword = async (password) => {
  await bcrypt.hash(password, process.env.BCRYPT_SALT);
};
