const User = require("../models/User");

exports.deleteAllUsers = async (req, res) => {
  try {
    const users = await User.deleteMany({});
    res.json({ message: "Users deleted", users });
  } catch (err) {
    res.json({ message: `Error deleting users: ${err.message}` });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};
