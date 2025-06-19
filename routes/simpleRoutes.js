const express = require("express");
const User = require("../models/User");
const { renderTemplate } = require("../utils/emailTemplates");
const router = express.Router();

const getUser = async (req, res) => {
  res.json("Hello User! Welcome to Mosaic Backend!");
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

router.get("/", getUser);
router.get("/users", getAllUsers);
router.get("/forgot-pwd", (req, res) => {
  return res.sendFile("index.htm", {
    root: "C:\\Users\\b\\Documents\\next\\mosaic-backend",
  });
});

module.exports = router;
