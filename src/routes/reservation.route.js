const express = require("express");
const router = express.Router();
const { authMiddleware, authAdminMiddleware } = require("../middleware");
const { reservationController } = require("../controllers");

router
  .route("/")
  .get(authAdminMiddleware, reservationController.getAllReservation)
  .post(authMiddleware, reservationController.createReservation);

router
  .route("/:id")
  .get(authMiddleware, reservationController.getSingleReservation)
  .patch(authMiddleware, reservationController.updateReservation)
  .delete(authMiddleware, reservationController.deleteReservation);

router.route("/customer/:id").get(reservationController.getCustomerReservation);

router.route("/employee/:id").get(reservationController.getEmployeeReservation);

router.route("/vehicle/:id").get(reservationController.getVehicleReservation);

module.exports = router;
