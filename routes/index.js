const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/destinations", require("./destinationRoutes"));
router.use("/data", require("./dataRoutes"));
router.use("/upload", require("./uploadRoutes"));

router.use("/dev", require("./development"));
// router.use("/users", require("./userRoutes"));
// router.use("/packages", require("./packageRoutes"));
// router.use("/bookings", require("./bookingRoutes"));
// router.use("/activities", require("./activityRoutes"));

module.exports = router;
