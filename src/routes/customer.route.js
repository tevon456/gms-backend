const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { customerController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, customerController.getAllCustomer)
  .post(authMiddleware, customerController.createCustomer);

router
  .route("/:id")
  .get(authMiddleware, customerController.getSingleCustomer)
  .patch(authMiddleware, customerController.updateCustomer)
  .delete(authMiddleware, customerController.deleteCustomer);

module.exports = router;
