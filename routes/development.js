const express = require("express");
const { deleteAllUsers, getAllUsers } = require("../controllers/development");
const router = express.Router();

router.delete("/delete-all", deleteAllUsers);
router.get("/", getAllUsers);

module.exports = router;
