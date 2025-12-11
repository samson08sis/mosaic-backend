const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const activityController = require("../controllers/data/activitiyController");
const router = express.Router();

router.post("/:destinationId", activityController.createActivity);
module.exports = router;
