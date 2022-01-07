const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { searchController } = require("../controllers");

router
  .route("/vehicle/:search")
  .get(authMiddleware, searchController.searchVehicle);

module.exports = router;
