const express = require("express");
const destinationController = require("../controllers/data/destinationController");
const router = express.Router();

// /api/destinations

router.get("/", destinationController.getAllDestinations);
router.get("/slug/:slug", destinationController.getDestinationBySlug);
router.get("/id/:id", destinationController.getDestinationById);
router.post("/create", destinationController.createDestination);
router.put("/:id", destinationController.updateDestination);
// TEST ROUTES
router.delete("/dev/delete", destinationController.deleteDestination);
router.delete("/dev/delete-all", destinationController.deleteAllDestinations);

module.exports = router;
