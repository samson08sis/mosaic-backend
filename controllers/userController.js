const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// @desc Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// @desc Create user
// @route    POST /api/users
// @access    Private
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const createdBy = req.query.user;
  const newUser = await User.create({ name, email, password, role, createdBy });
  res.status(201).json(newUser);
};

// @desc Update user
// @route   PUT /api/users/:id
// @access    Private
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// @desc Delete user
// @route   DELETE /api/users/:id
// @access    Private
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};
