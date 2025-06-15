const express = require("express");
const User = require("../models/User");
const router = express.Router();

const getUser = async (req, res) => {
  res.json("Hello User! Welcome to Mosaic Backend!");
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(JSON.stringify(users));
};

router.get("/", getUser);
router.get("/users", getAllUsers);

module.exports = router;
