const express = require("express");
const { deleteAllUsers } = require("../controllers/development");
const router = express.Router();

router.delete("/delete-all", deleteAllUsers);

module.exports = router;
