const express = require("express");
const { customerController } = require("../controllers");
const router = express.Router();

router
  .route("/")
  .get(customerController.getAllCustomer)
  .post(customerController.createCustomer);

router
  .route("/:id")
  .get(customerController.getSingleCustomer)
  .patch(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

module.exports = router;
