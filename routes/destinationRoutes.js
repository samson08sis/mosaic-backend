const express = require("express");
const {
  createDestinations,
  deleteAllDestinations,
  getAllDestinations,
  getPopularDestinations,
} = require("../controllers/data/destinationController");
const router = express.Router();

router.get("/", getAllDestinations);
router.get("/popular", getPopularDestinations);
router.post("/dev/create", createDestinations);
router.delete("/dev/delete", deleteAllDestinations);

module.exports = router;
