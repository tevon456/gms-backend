const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { statisticsController } = require("../controllers");

router.route("/").get(statisticsController.getStatistics);

module.exports = router;
