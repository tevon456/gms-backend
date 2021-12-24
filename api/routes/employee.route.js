const express = require("express");
const { employeeController } = require("../controllers");
const { authAdminMiddleware } = require("../middleware");
const router = express.Router();

router
  .route("/")
  .get(authAdminMiddleware, employeeController.getAllEmployee)
  .post(employeeController.createEmployee);

router
  .route("/:id")
  .get(employeeController.getSingleEmployee)
  .patch(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

module.exports = router;
