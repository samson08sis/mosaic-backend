const User = require("../models/User");

exports.deleteAllUsers = async (req, res) => {
  try {
    const users = await User.deleteMany({});
    res.json({ message: "Users deleted", users });
  } catch (err) {
    res.json({ message: `Error deleting users: ${err.message}` });
  }
};
