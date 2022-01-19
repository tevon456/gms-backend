const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { logController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, logController.getAllLogs)
  .post(authMiddleware, logController.createLog);

module.exports = router;
