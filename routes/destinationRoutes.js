const express = require("express");
const {
  getAllDestinations,
  getPopularDestinations,
} = require("../controllers/destinationController");
const router = express.Router();

router.get("/", getAllDestinations);
router.get("/popular", getPopularDestinations);

module.exports = router;
