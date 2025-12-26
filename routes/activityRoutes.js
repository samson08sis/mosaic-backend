const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const controller = require("../controllers/data/activitiyController");
const router = express.Router();

router.get("/", controller.getAllActivities);
router.post("/create", controller.createActivity);
router.get("/id/:id", controller.getActivityById);
module.exports = router;
