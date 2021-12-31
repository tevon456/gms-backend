const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { vehicleController } = require("../controllers");

router.route("/").post(authMiddleware, vehicleController.createVehicle);

module.exports = router;
