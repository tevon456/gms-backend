const express = require("express");
const router = express.Router();
const employeeRoute = require("./employee.route");
const customerRoute = require("./customer.route");
const userRoute = require("./user.route");
const noteRoute = require("./note.route");
const vehicleRoute = require("./vehicle.route");
const reservationRoute = require("./reservation.route");
const searchRoute = require("./search.route");
const statisticsRoute = require("./statistics.route");

router.get("/", (req, res) => {
  res.status(200).send({
    message: `${process.env.APP_NAME} ${new Date().toLocaleTimeString()}`,
  });
});

router.use("/employee", employeeRoute);
router.use("/customer", customerRoute);
router.use("/vehicle", vehicleRoute);
router.use("/user", userRoute);
router.use("/note", noteRoute);
router.use("/search", searchRoute);
router.use("/reservation", reservationRoute);
router.use("/statistics", statisticsRoute);

module.exports = router;
