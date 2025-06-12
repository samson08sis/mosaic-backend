const express = require("express");
const router = express.Router();

const getUser = async (req, res) => {
  res.json("Hello User!");
};

router.get("/", getUser);

module.exports = router;
