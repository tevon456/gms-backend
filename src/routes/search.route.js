const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { searchController } = require("../controllers");

router
  .route("/vehicle/:search")
  .get(authMiddleware, searchController.searchVehicle);

router
  .route("/reservation/:search")
  .get(authMiddleware, searchController.searchReservation);

router
  .route("/customer/:search")
  .get(authMiddleware, searchController.searchCustomer);

router
  .route("/employee/:search")
  .get(authMiddleware, searchController.searchEmployee);
module.exports = router;
