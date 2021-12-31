const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { vehicleController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, vehicleController.getAllVehicle)
  .post(authMiddleware, vehicleController.createVehicle);

router.route("/:id").get(authMiddleware, vehicleController.getSingleVehicle);

router.route("/image/:id").post(authMiddleware, vehicleController.addImages);

module.exports = router;