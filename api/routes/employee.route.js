const express = require("express");
const router = express.Router();
const { authAdminMiddleware, authMiddleware } = require("../middleware");
const { employeeController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, employeeController.getAllEmployee)
  .post(authAdminMiddleware, employeeController.createEmployee);

router
  .route("/:id")
  .get(authMiddleware, employeeController.getSingleEmployee)
  .patch(authAdminMiddleware, employeeController.updateEmployee)
  .delete(authAdminMiddleware, employeeController.deleteEmployee);

module.exports = router;
