const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { userController } = require("../controllers");

router.route("/").get(userController.getAuthenticatedUser);
module.exports = router;
