const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { vehicleController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, vehicleController.getAllVehicle)
  .post(authMiddleware, vehicleController.createVehicle);

router
  .route("/:id")
  .get(authMiddleware, vehicleController.getSingleVehicle)
  .patch(authMiddleware, vehicleController.updateVehicle)
  .delete(authMiddleware, vehicleController.deleteVehicle);

router.route("/image/:id").post(vehicleController.addImages);

router.route("/image/:id/:vehicle_id").delete(vehicleController.deleteImage);

module.exports = router;
